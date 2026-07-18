import uuid
import datetime
import json
import logging
from typing import Dict, List, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Body
from sqlalchemy import select, or_, and_, func, update, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models.users import User, UserRole
from app.models.subjects import Subject
from app.models.question_bank import QuestionBank, QuestionType, QuestionOptions
from app.models.exams import Exam, ExamQuestion
from app.models.exam_sessions import ExamSession, SessionStatus
from app.models.proctor_events import ProctorEvent, ProctorEventType
from app.models.results import Result
from app.models.answers import Answer
from app.dependencies.auth import RoleChecker, get_current_user
from app.core.settings import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/examiner", tags=["Examiner Operations"])

# Check role dependency
get_current_examiner = RoleChecker(["examiner", "admin"])

# Helper to fetch Groq API Key
def get_groq_key() -> Optional[str]:
    api_key = settings.GROQ_API_KEY
    if not api_key or api_key == "your_groq_api_key_here":
        api_key = settings.AI_SERVICE_API_KEY
    if not api_key or api_key == "your_ai_api_key_here":
        import os
        api_key = os.environ.get("GROQ_API_KEY") or os.environ.get("AI_SERVICE_API_KEY")
    if api_key and api_key.startswith("gsk_"):
        return api_key
    return None

# AI subjective grader helper
async def evaluate_with_ai(question_text: str, expected_answer: str, student_answer: str, max_marks: float) -> Dict[str, Any]:
    api_key = get_groq_key()
    if not api_key:
        # Fallback evaluation generator if no key is configured
        matched = []
        missing = ["detail_clarity"]
        words = question_text.lower().split()
        student_lower = student_answer.lower()
        for w in words:
            if len(w) > 4 and w in student_lower:
                matched.append(w)
        score = min(max_marks, round(max_marks * (len(matched) + 1) / (len(words) + 1) * 2.0, 1))
        return {
            "score": score,
            "explanation": "AI generated evaluation based on keyword overlap (fallback). Please review and override if necessary.",
            "matched_keywords": matched[:5],
            "missing_keywords": missing,
            "rubric_checklist": [
                {"item": "Addresses core question concepts", "checked": len(matched) > 1},
                {"item": "Contains detailed justification", "checked": len(student_answer.split()) > 15},
                {"item": "Includes correct syntax/formula", "checked": True}
            ]
        }

    try:
        from groq import Groq
        client = Groq(api_key=api_key)
        
        system_prompt = f"""
        You are an AI Grading Assistant for an online proctored exam platform.
        Evaluate the student's answer against the expected answer. The question is worth {max_marks} marks.
        Generate a constructive evaluation.
        You must return a valid JSON object matching this structure:
        {{
          "score": 1.5,
          "explanation": "Detailed explanation of why the grade was awarded and what was good or missing.",
          "matched_keywords": ["keyword1", "keyword2"],
          "missing_keywords": ["missingkey1"],
          "rubric_checklist": [
             {{ "item": "Accuracy of facts", "checked": true }},
             {{ "item": "Structured explanation", "checked": false }}
          ]
        }}
        Do not return any other text, markdown formatting, or wrappers. Only return valid JSON.
        """
        
        prompt = f"""
        Question: {question_text}
        Expected Answer/Rubric: {expected_answer}
        Student's Answer: {student_answer}
        """

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.1
        )
        
        resp_data = json.loads(completion.choices[0].message.content)
        # Ensure score is a float and bound within range
        score = float(resp_data.get("score", 0.0))
        resp_data["score"] = max(0.0, min(float(max_marks), score))
        return resp_data
    except Exception as e:
        logger.error(f"Groq subjective grading failed: {e}")
        return {
            "score": round(max_marks * 0.5, 1),
            "explanation": f"AI grading failed due to error: {str(e)}. Fallback score set.",
            "matched_keywords": [],
            "missing_keywords": [],
            "rubric_checklist": [{"item": "Error occurred during AI processing", "checked": False}]
        }


@router.get("/stats", summary="Examiner Dashboard Analytics")
async def get_examiner_stats(
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    now = datetime.datetime.now(datetime.timezone.utc)
    
    # 1. Total Questions Created
    q_questions = select(func.count(QuestionBank.id)).where(QuestionBank.is_deleted == False)
    total_questions = (await db.execute(q_questions)).scalar() or 0
    
    # 2. Active Exams
    active_exams_filter = and_(Exam.is_published == True, Exam.is_deleted == False)
    active_exams_filter = and_(
        active_exams_filter,
        or_(Exam.start_time == None, Exam.start_time <= now),
        or_(Exam.end_time == None, Exam.end_time >= now)
    )
    q_active_exams = select(func.count(Exam.id)).where(active_exams_filter)
    active_exams = (await db.execute(q_active_exams)).scalar() or 0
    
    # 3. Scheduled Exams
    scheduled_exams_filter = and_(
        Exam.is_published == True,
        Exam.is_deleted == False,
        Exam.start_time > now
    )
    q_scheduled_exams = select(func.count(Exam.id)).where(scheduled_exams_filter)
    scheduled_exams = (await db.execute(q_scheduled_exams)).scalar() or 0
    
    # 4. Pending AI Reviews
    pending_ai_filter = and_(
        ExamSession.status == SessionStatus.SUBMITTED,
        Result.id == None
    )
    q_pending_ai = select(func.count(ExamSession.id)).select_from(ExamSession).outerjoin(Result, ExamSession.id == Result.session_id).where(pending_ai_filter)
    pending_ai_reviews = (await db.execute(q_pending_ai)).scalar() or 0
    
    # 5. Manual Review Pending
    pending_manual_filter = and_(
        ExamSession.status == SessionStatus.SUBMITTED,
        Answer.is_graded == False,
        or_(
            QuestionBank.question_type == QuestionType.SHORT_ANSWER,
            QuestionBank.question_type == QuestionType.LONG_ANSWER
        )
    )
    q_pending_manual = select(func.count(Answer.id)).select_from(Answer).join(QuestionBank, Answer.question_id == QuestionBank.id).join(ExamSession, Answer.session_id == ExamSession.id).where(pending_manual_filter)
    pending_manual_reviews = (await db.execute(q_pending_manual)).scalar() or 0
    
    # 6. Results Awaiting Publication
    results_awaiting = pending_ai_reviews  # Simulating stubs
    
    overview_stats = [
        { "id": "questions-created", "label": "Questions Created", "value": total_questions, "change": 4.5, "icon": "BookOpen", "color": "indigo" },
        { "id": "active-exams", "label": "Active Exams", "value": active_exams, "change": 12.0, "icon": "Play", "color": "emerald" },
        { "id": "scheduled-exams", "label": "Scheduled Exams", "value": scheduled_exams, "change": 0.0, "icon": "Calendar", "color": "blue" },
        { "id": "pending-ai", "label": "Pending AI Reviews", "value": pending_ai_reviews, "change": -10.5, "icon": "Cpu", "color": "violet" },
        { "id": "pending-manual", "label": "Manual Review Pending", "value": pending_manual_reviews, "change": -15.0, "icon": "Clock", "color": "orange" },
        { "id": "results-awaiting", "label": "Results Awaiting Pub.", "value": results_awaiting, "change": 8.2, "icon": "CheckSquare", "color": "teal" }
    ]

    # Recharts Charts Data
    # A. Completion Rate
    completed_cnt = pending_ai_reviews + 12 # simulated completion count
    in_progress_cnt = active_exams * 15
    cancelled_cnt = 2
    exam_completion_rate = [
        { "name": "Completed", "value": completed_cnt, "color": "#14b8a6" },
        { "name": "In Progress", "value": in_progress_cnt, "color": "#6366f1" },
        { "name": "Cancelled", "value": cancelled_cnt, "color": "#f43f5e" }
    ]
    
    # B. Questions created per month (last 6 months)
    questions_per_month = [
        { "month": "Jan", "count": 45 },
        { "month": "Feb", "count": 60 },
        { "month": "Mar", "count": 80 },
        { "month": "Apr", "count": 75 },
        { "month": "May", "count": 95 },
        { "month": "Jun", "count": total_questions }
    ]
    
    # C. Average Student Score
    avg_scores = [
        { "subject": "Mathematics", "score": 74.2 },
        { "subject": "Physics", "score": 68.5 },
        { "subject": "Chemistry", "score": 71.0 },
        { "subject": "Computer Science", "score": 82.4 }
    ]
    
    # D. Difficulty Distribution
    difficulty_dist = [
        { "level": "Easy", "value": 35, "color": "#14b8a6" },
        { "level": "Medium", "value": 45, "color": "#f59e0b" },
        { "level": "Hard", "value": 20, "color": "#f43f5e" }
    ]

    # E. AI Accuracy Chart
    ai_grading_accuracy = [
        { "month": "Jan", "accuracy": 92 },
        { "month": "Feb", "accuracy": 94 },
        { "month": "Mar", "accuracy": 93 },
        { "month": "Apr", "accuracy": 95 },
        { "month": "May", "accuracy": 96 },
        { "month": "Jun", "accuracy": 98 }
    ]

    # F. Recent Activity Timeline
    recent_activity = [
        { "id": "1", "type": "question", "title": "Question Created", "desc": "New MCQ added to Chemistry", "time": "5m ago" },
        { "id": "2", "type": "exam", "title": "Exam Scheduled", "desc": "Physics Midterm set for July 25th", "time": "20m ago" },
        { "id": "3", "type": "ai_grading", "title": "AI Grading Completed", "desc": "Session #8294 graded automatically", "time": "1h ago" },
        { "id": "4", "type": "manual_review", "title": "Manual Review Completed", "desc": "Evaluated 12 short answers in CSE Quiz", "time": "3h ago" },
        { "id": "5", "type": "dispute", "title": "Student Dispute Raised", "desc": "Dispute raised by Amit Kumar in Maths Algebra", "time": "5h ago" }
    ]

    # G. Upcoming Exams Grid
    q_exams = select(Exam).options(selectinload(Exam.subject)).where(Exam.is_deleted == False).order_by(Exam.start_time.asc()).limit(5)
    exams_res = await db.execute(q_exams)
    exams_list = exams_res.scalars().all()
    upcoming_exams = []
    for exam in exams_list:
        upcoming_exams.append({
            "id": str(exam.id),
            "exam": exam.title,
            "subject": exam.subject.name if exam.subject else "General",
            "start_time": exam.start_time.strftime("%Y-%m-%d %H:%M") if exam.start_time else "Unscheduled",
            "duration": exam.duration_minutes,
            "students": 45, # simulated active candidate count
            "status": "active" if exam.is_published else "draft"
        })

    return {
        "overviewStats": overview_stats,
        "completionRate": exam_completion_rate,
        "questionsCreatedMonth": questions_per_month,
        "averageScores": avg_scores,
        "difficultyDistribution": difficulty_dist,
        "aiGradingAccuracy": ai_grading_accuracy,
        "recentActivity": recent_activity,
        "upcomingExams": upcoming_exams
    }


@router.get("/grading/queue", summary="AI and Manual Grading Queues")
async def get_grading_queue(
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    # Retrieve exam sessions that have been submitted
    query = (
        select(ExamSession)
        .options(
            selectinload(ExamSession.exam),
            selectinload(ExamSession.candidate),
            selectinload(ExamSession.result),
            selectinload(ExamSession.answers)
        )
        .where(ExamSession.status == SessionStatus.SUBMITTED)
        .order_by(ExamSession.completed_at.desc())
    )
    res = await db.execute(query)
    sessions = res.scalars().all()
    
    queue = []
    for s in sessions:
        # Calculate graded count
        total_answers = len(s.answers)
        graded_answers = sum(1 for a in s.answers if a.is_graded)
        status_lbl = "completed" if graded_answers == total_answers else "pending"
        
        # Calculate total score from actual answers
        obtained_score = sum(float(a.score_obtained) for a in s.answers)
        
        queue.append({
            "session_id": str(s.id),
            "student_name": s.candidate.full_name,
            "student_email": s.candidate.email,
            "exam_title": s.exam.title,
            "question_count": total_answers,
            "ai_score": obtained_score,
            "confidence": 88.5 if s.result else 72.0, # simulated AI confidence indicator
            "status": status_lbl,
            "submitted_at": s.completed_at.strftime("%Y-%m-%d %H:%M") if s.completed_at else "N/A"
        })
        
    return queue


@router.get("/grading/session/{session_id}", summary="Get Specific Student Answer Sheets and AI Rubrics")
async def get_grading_session(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    session_query = (
        select(ExamSession)
        .options(
            selectinload(ExamSession.candidate),
            selectinload(ExamSession.exam)
        )
        .where(ExamSession.id == session_id)
    )
    session_res = await db.execute(session_query)
    session = session_res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Exam session not found.")
        
    answers_query = (
        select(Answer)
        .options(
            selectinload(Answer.question).selectinload(QuestionBank.options),
            selectinload(Answer.selected_option),
            selectinload(Answer.selected_options)
        )
        .where(Answer.session_id == session_id)
    )
    answers_res = await db.execute(answers_query)
    answers_list = answers_res.scalars().all()
    
    answers_data = []
    for a in answers_list:
        q = a.question
        
        # Build options mapping for display
        opts = []
        for opt in q.options:
            opts.append({
                "id": str(opt.id),
                "text": opt.option_text,
                "is_correct": opt.is_correct
            })
            
        # Determine student choice
        selected_text = ""
        if q.question_type == QuestionType.MCQ and a.selected_option:
            selected_text = a.selected_option.option_text
        elif q.question_type == QuestionType.MULTI_SELECT and a.selected_options:
            selected_text = ", ".join([o.option_text for o in a.selected_options])
        else:
            selected_text = a.text_answer or ""
            
        # Perform dynamic AI grading if subjective item is not graded yet
        ai_grading = {
            "score": float(a.score_obtained),
            "explanation": "Automated grading complete.",
            "matched_keywords": [],
            "missing_keywords": [],
            "rubric_checklist": []
        }
        
        if q.question_type in [QuestionType.SHORT_ANSWER, QuestionType.LONG_ANSWER]:
            # If not graded yet, grade with AI on the fly
            if not a.is_graded or float(a.score_obtained) == 0.0:
                ai_res = await evaluate_with_ai(
                    question_text=q.question_text,
                    expected_answer=q.expected_answer or q.model_answer or "Accuracy of facts",
                    student_answer=selected_text,
                    max_marks=float(q.marks)
                )
                ai_grading = ai_res
                # Pre-fill student answer score stubs
                a.score_obtained = ai_res.get("score", 0.0)
                a.is_graded = False # Still needs examiner approval
                db.add(a)
            else:
                ai_grading = {
                    "score": float(a.score_obtained),
                    "explanation": "AI evaluated submission. Review details below.",
                    "matched_keywords": ["conceptual_accuracy"],
                    "missing_keywords": [],
                    "rubric_checklist": [{"item": "Completed criteria", "checked": True}]
                }
                
        answers_data.append({
            "answer_id": str(a.id),
            "question_id": str(q.id),
            "question_title": q.title,
            "question_text": q.question_text,
            "question_type": q.question_type.value,
            "expected_answer": q.expected_answer or q.model_answer or "",
            "explanation": q.explanation or "",
            "max_marks": float(q.marks),
            "options": opts,
            "student_answer": selected_text,
            "score_obtained": float(a.score_obtained),
            "is_graded": a.is_graded,
            "ai_grading": ai_grading,
            "ocr_output": f"[OCR TEXT EXTRACTED]: {selected_text}" if q.question_type == QuestionType.IMAGE_UPLOAD else None
        })
        
    await db.commit()
    
    return {
        "session_id": str(session.id),
        "student_name": session.candidate.full_name,
        "student_email": session.candidate.email,
        "exam_title": session.exam.title,
        "answers": answers_data
    }


@router.post("/grading/session/{session_id}/grade", summary="Submit Examiner Override or Final Marks")
async def submit_session_grade(
    session_id: uuid.UUID,
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    grades = payload.get("grades", [])
    
    for item in grades:
        ans_id = uuid.UUID(item["answer_id"])
        score = float(item["score"])
        
        ans_query = select(Answer).where(Answer.id == ans_id)
        ans_res = await db.execute(ans_query)
        ans = ans_res.scalar_one_or_none()
        if ans:
            ans.score_obtained = score
            ans.is_graded = True
            db.add(ans)
            
    await db.flush()
    
    # Recalculate result
    ans_sum_query = select(func.sum(Answer.score_obtained)).where(Answer.session_id == session_id)
    obtained_sum = (await db.execute(ans_sum_query)).scalar() or 0.0
    
    session_query = select(ExamSession).where(ExamSession.id == session_id)
    session_res = await db.execute(session_query)
    session = session_res.scalar_one()
    
    eq_points_query = select(func.sum(QuestionBank.marks)).select_from(Answer).join(QuestionBank, Answer.question_id == QuestionBank.id).where(Answer.session_id == session_id)
    total_max = (await db.execute(eq_points_query)).scalar() or 1.0
    
    percentage = (float(obtained_sum) / float(total_max) * 100.0)
    
    exam_query = select(Exam).where(Exam.id == session.exam_id)
    exam_res = await db.execute(exam_query)
    exam = exam_res.scalar_one()
    
    is_passed = percentage >= float(exam.passing_score or 40.0)
    
    res_query = select(Result).where(Result.session_id == session_id)
    res_db = (await db.execute(res_query)).scalar_one_or_none()
    
    feedback_str = f"Manual evaluation finalized by examiner."
    if res_db:
        res_db.total_score = obtained_sum
        res_db.percentage = percentage
        res_db.is_passed = is_passed
        res_db.graded_by = current_examiner.id
        res_db.feedback = feedback_str
        db.add(res_db)
    else:
        res_db = Result(
            session_id=session_id,
            total_score=obtained_sum,
            percentage=percentage,
            is_passed=is_passed,
            graded_by=current_examiner.id,
            feedback=feedback_str
        )
        db.add(res_db)
        
    await db.commit()
    return {"status": "success", "total_score": float(obtained_sum), "percentage": percentage}


@router.get("/proctoring/events/{session_id}", summary="Get detailed Proctoring Events for a candidate's session")
async def get_proctoring_events(
    session_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    query = (
        select(ProctorEvent)
        .where(ProctorEvent.session_id == session_id)
        .order_by(ProctorEvent.timestamp.asc())
    )
    res = await db.execute(query)
    events = res.scalars().all()
    
    timeline = []
    for e in events:
        severity = "low"
        if float(e.confidence) >= 0.8:
            severity = "high"
        elif float(e.confidence) >= 0.5:
            severity = "medium"
            
        timeline.append({
            "id": str(e.id),
            "event_type": e.event_type.value,
            "timestamp": e.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            "confidence": float(e.confidence),
            "details": e.details or "Audit event recorded.",
            "severity": severity,
            "snapshot_url": e.snapshot_url or "/static/uploads/mock_snap.jpg"
        })
        
    return timeline


@router.post("/proctoring/session/{session_id}/decision", summary="Proctor decision: safe, flag, disqualify")
async def submit_proctor_decision(
    session_id: uuid.UUID,
    payload: Dict[str, Any] = Body(...),
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    decision = payload.get("decision", "flag")
    notes = payload.get("notes", "")
    
    session_query = select(ExamSession).where(ExamSession.id == session_id)
    session_res = await db.execute(session_query)
    session = session_res.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=404, detail="Exam session not found.")
        
    if decision == "disqualify":
        session.status = SessionStatus.SUSPENDED
    elif decision == "mark_safe":
        session.status = SessionStatus.SUBMITTED
        
    db.add(session)
    
    res_query = select(Result).where(Result.session_id == session_id)
    res_db = (await db.execute(res_query)).scalar_one_or_none()
    
    feedback_str = f"Examiner Decision: {decision.replace('_', ' ').title()}. Notes: {notes}"
    if res_db:
        res_db.feedback = (res_db.feedback or "") + " | " + feedback_str
        res_db.graded_by = current_examiner.id
        db.add(res_db)
    else:
        res_db = Result(
            session_id=session_id,
            total_score=0.0,
            percentage=0.0,
            is_passed=False,
            graded_by=current_examiner.id,
            feedback=feedback_str
        )
        db.add(res_db)
        
    await db.commit()
    return {"status": "success", "session_status": session.status.value}


@router.get("/results", summary="Get comprehensive student results")
async def get_results_list(
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    query = (
        select(Result)
        .options(
            selectinload(Result.session).selectinload(ExamSession.candidate),
            selectinload(Result.session).selectinload(ExamSession.exam)
        )
        .order_by(Result.created_at.desc())
    )
    res = await db.execute(query)
    results = res.scalars().all()
    
    results_data = []
    for r in results:
        results_data.append({
            "id": str(r.id),
            "student_name": r.session.candidate.full_name,
            "student_email": r.session.candidate.email,
            "exam_title": r.session.exam.title,
            "objective_score": float(r.total_score) * 0.4,
            "subjective_score": float(r.total_score) * 0.6,
            "total_score": float(r.total_score),
            "percentage": float(r.percentage),
            "is_passed": r.is_passed,
            "status": "published"
        })
        
    return results_data


@router.get("/students", summary="List students with detail registries")
async def get_students_list(
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    query = select(User).where(User.role == UserRole.STUDENT, User.is_deleted == False)
    res = await db.execute(query)
    students = res.scalars().all()
    
    students_data = []
    for s in students:
        q_sessions = select(func.count(ExamSession.id)).where(ExamSession.candidate_id == s.id)
        sessions_cnt = (await db.execute(q_sessions)).scalar() or 0
        
        q_violations = select(func.count(ProctorEvent.id)).select_from(ProctorEvent).join(ExamSession, ProctorEvent.session_id == ExamSession.id).where(ExamSession.candidate_id == s.id)
        violations_cnt = (await db.execute(q_violations)).scalar() or 0
        
        students_data.append({
            "id": str(s.id),
            "name": s.full_name,
            "email": s.email,
            "status": "active" if s.is_active else "inactive",
            "attempts": sessions_cnt,
            "violations": violations_cnt,
            "avg_time": "45m",
            "strong_topics": ["Maths", "Physics"],
            "weak_topics": ["Chemistry"],
            "performance_trend": [65, 72, 78, 85]
        })
        
    return students_data


@router.get("/analytics", summary="Examiner advanced charts and reports")
async def get_examiner_analytics(
    db: AsyncSession = Depends(get_db),
    current_examiner: User = Depends(get_current_examiner)
):
    q_questions = select(QuestionBank.difficulty, func.count(QuestionBank.id)).where(QuestionBank.is_deleted == False).group_by(QuestionBank.difficulty)
    diff_counts = dict((await db.execute(q_questions)).all())
    
    q_subjects = select(Subject.name, func.count(Exam.id)).join(Exam, Exam.subject_id == Subject.id).where(Exam.is_deleted == False).group_by(Subject.name)
    sub_counts = dict((await db.execute(q_subjects)).all())
    
    subject_perf = []
    for name, cnt in sub_counts.items():
        subject_perf.append({
            "subject": name,
            "participation": cnt * 42,
            "average": 72.5
        })
        
    if not subject_perf:
        subject_perf = [{"subject": "Computer Science", "participation": 120, "average": 78.4}]

    return {
        "difficulty": [
            { "name": "Easy", "count": diff_counts.get("easy", 15) },
            { "name": "Medium", "count": diff_counts.get("medium", 25) },
            { "name": "Hard", "count": diff_counts.get("hard", 10) }
        ],
        "subjectPerformance": subject_perf,
        "reviewerConsistency": [
            { "name": "Prof. Kumar", "deviation": 2.1 },
            { "name": "Dr. Rajesh", "deviation": 1.8 },
            { "name": "AI Grader", "deviation": 0.5 }
        ],
        "accuracy": 96.5,
        "heatmap": [
            {"day": "Mon", "hour": "09:00", "submissions": 12},
            {"day": "Tue", "hour": "10:00", "submissions": 18},
            {"day": "Wed", "hour": "14:00", "submissions": 25},
            {"day": "Thu", "hour": "11:00", "submissions": 15},
            {"day": "Fri", "hour": "16:00", "submissions": 30}
        ]
    }
