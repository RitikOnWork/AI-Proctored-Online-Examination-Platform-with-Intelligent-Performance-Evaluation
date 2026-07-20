import logging
import datetime
from sqlalchemy import select, delete, func
from sqlalchemy.orm import selectinload
from apscheduler.schedulers.asyncio import AsyncIOScheduler

from app.database import SessionLocal

from app.models.exam_sessions import ExamSession, SessionStatus
from app.models.exams import Exam, ExamQuestion
from app.models.answers import Answer
from app.models.results import Result
from app.models.question_bank import QuestionBank, QuestionType
from app.models.subjective_queue import SubjectiveGradingQueue, QueueStatus

logger = logging.getLogger(__name__)

scheduler = AsyncIOScheduler()


async def check_and_auto_submit_expired_sessions():
    """
    Background worker that queries active exam sessions that have exceeded their duration 
    and automatically calculates objective marks, enqueues subjective items, and marks session EXPIRED.
    """
    async with SessionLocal() as db:

        try:
            now_utc = datetime.datetime.now(datetime.timezone.utc)
            
            # Fetch active sessions with loaded exam relations
            query = (
                select(ExamSession)
                .options(selectinload(ExamSession.exam))
                .where(ExamSession.status == SessionStatus.ACTIVE)
            )
            res = await db.execute(query)
            sessions = res.scalars().all()
            
            for session in sessions:
                if not session.started_at or not session.exam:
                    continue
                    
                allowed_duration = datetime.timedelta(minutes=session.exam.duration_minutes)
                expected_end = session.started_at + allowed_duration
                
                # If session has exceeded allowed time (+ 1 minute buffer for network latency)
                if now_utc >= expected_end + datetime.timedelta(seconds=60):
                    logger.info(f"Auto-submitting expired session {session.id} for student {session.candidate_id}")
                    
                    session.status = SessionStatus.EXPIRED
                    session.completed_at = expected_end
                    db.add(session)
                    
                    # Fetch exam questions with options
                    eq_query = (
                        select(ExamQuestion)
                        .where(ExamQuestion.exam_id == session.exam_id)
                        .options(selectinload(ExamQuestion.question).selectinload(QuestionBank.options))
                    )
                    eq_res = await db.execute(eq_query)
                    eq_list = eq_res.scalars().all()
                    
                    # Fetch existing candidate answers for this session
                    ans_query = select(Answer).where(Answer.session_id == session.id)
                    ans_res = await db.execute(ans_query)
                    candidate_answers = {a.question_id: a for a in ans_res.scalars().all()}
                    
                    total_max_score = 0.0
                    obtained_score = 0.0
                    
                    for eq in eq_list:
                        q = eq.question
                        q_max = float(eq.points_override) if eq.points_override is not None else float(q.marks)
                        total_max_score += q_max
                        
                        ans = candidate_answers.get(q.id)
                        if ans and ans.text_answer:
                            if q.question_type == QuestionType.MCQ:
                                correct_opt = next((opt for opt in q.options if opt.is_correct), None)
                                selected_opt = next((opt for opt in q.options if opt.option_text == ans.text_answer), None)
                                
                                if correct_opt and selected_opt and correct_opt.id == selected_opt.id:
                                    ans.score_obtained = q_max
                                    ans.is_graded = True
                                    obtained_score += q_max
                                else:
                                    ans.is_graded = True
                                    if q.negative_marks:
                                        ans.score_obtained = -float(q.negative_marks)
                                        obtained_score -= float(q.negative_marks)
                            elif q.question_type == QuestionType.MULTI_SELECT:
                                selected_vals = [v.strip() for v in ans.text_answer.split(",")]
                                correct_opts = {opt.option_text for opt in q.options if opt.is_correct}
                                selected_opts = set(selected_vals)
                                
                                if correct_opts == selected_opts:
                                    ans.score_obtained = q_max
                                    ans.is_graded = True
                                    obtained_score += q_max
                                else:
                                    ans.is_graded = True
                                    if q.negative_marks:
                                        ans.score_obtained = -float(q.negative_marks)
                                        obtained_score -= float(q.negative_marks)
                            else:
                                # Subjective question: enqueue for examiner/AI evaluation
                                ans.is_graded = False
                                # Check if already in queue
                                q_item_query = select(SubjectiveGradingQueue).where(
                                    SubjectiveGradingQueue.session_id == session.id,
                                    SubjectiveGradingQueue.answer_id == ans.id
                                )
                                existing_queue = (await db.execute(q_item_query)).scalar_one_or_none()
                                if not existing_queue:
                                    queue_item = SubjectiveGradingQueue(
                                        session_id=session.id,
                                        answer_id=ans.id,
                                        question_id=q.id,
                                        ai_score=0.0,
                                        suggested_marks=round(q_max * 0.5, 1),
                                        justification="Auto-submitted session answer pending evaluation.",
                                        confidence=0.85,
                                        status=QueueStatus.PENDING.value
                                    )
                                    db.add(queue_item)
                                    
                            db.add(ans)
                            
                    percentage = (obtained_score / total_max_score * 100.0) if total_max_score > 0 else 0.0
                    is_passed = percentage >= float(session.exam.passing_score or 40.0)
                    
                    # Update Result record
                    res_query = select(Result).where(Result.session_id == session.id)
                    existing_result = (await db.execute(res_query)).scalar_one_or_none()
                    
                    if existing_result:
                        existing_result.total_score = obtained_score
                        existing_result.percentage = percentage
                        existing_result.is_passed = is_passed
                        existing_result.feedback = "Session automatically submitted upon timer expiration."
                        db.add(existing_result)
                    else:
                        new_result = Result(
                            session_id=session.id,
                            total_score=obtained_score,
                            percentage=percentage,
                            is_passed=is_passed,
                            feedback="Session automatically submitted upon timer expiration."
                        )
                        db.add(new_result)
                        
            await db.commit()
        except Exception as e:
            await db.rollback()
            logger.error(f"Error in auto-submit background scheduler: {e}")


def start_scheduler():
    if not scheduler.running:
        scheduler.add_job(
            check_and_auto_submit_expired_sessions,
            "interval",
            seconds=30,
            id="auto_submit_job",
            replace_existing=True
        )
        scheduler.start()
        logger.info("APScheduler initialized: Auto-submit worker active (interval: 30s)")


def shutdown_scheduler():
    if scheduler.running:
        scheduler.shutdown(wait=False)
        logger.info("APScheduler shutdown successfully.")
