import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.users import User
from app.schemas.exam import ExamCreate, ExamUpdate, ExamResponse, ExamQuestionsAssign
from app.schemas.question import QuestionResponse
from app.repositories.exam import ExamRepository
from app.services.exam import ExamService
from app.dependencies.auth import get_current_user, get_current_examiner, get_current_student, verify_exam_token
from app.core.security import create_exam_token

router = APIRouter(prefix="/exams", tags=["Exam Configuration Management"])


# Dependency helpers
async def get_exam_repository(db: AsyncSession = Depends(get_db)) -> ExamRepository:
    return ExamRepository(db)


async def get_exam_service(
    exam_repo: ExamRepository = Depends(get_exam_repository)
) -> ExamService:
    return ExamService(exam_repo)


@router.post(
    "",
    response_model=ExamResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Exam config (Examiner Only)",
    description="Accessible ONLY by users with the 'examiner' role."
)
async def create_exam(
    exam_in: ExamCreate,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_examiner)
):
    return await exam_service.create_exam(exam_in, current_user.id)


@router.get(
    "/{exam_id}",
    response_model=ExamResponse,
    summary="Get Exam details",
    description="Accessible by any authenticated user."
)
async def get_exam(
    exam_id: uuid.UUID,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_user)
):
    return await exam_service.get_exam(exam_id)


@router.get(
    "",
    response_model=List[ExamResponse],
    summary="List Exam configurations with pagination",
    description="Accessible by any authenticated user. Filter by subject, published state, or creator."
)
async def list_exams(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    subject_id: Optional[uuid.UUID] = Query(None, description="Filter by Subject ID"),
    is_published: Optional[bool] = Query(None, description="Filter by published state"),
    creator_id: Optional[uuid.UUID] = Query(None, description="Filter by Creator/Examiner ID"),
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_user)
):
    return await exam_service.list_exams(
        skip=skip,
        limit=limit,
        subject_id=subject_id,
        is_published=is_published,
        creator_id=creator_id
    )


@router.patch(
    "/{exam_id}",
    response_model=ExamResponse,
    summary="Update Exam config (Examiner Only)",
    description="Accessible ONLY by users with the 'examiner' role."
)
async def update_exam(
    exam_id: uuid.UUID,
    exam_in: ExamUpdate,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_examiner)
):
    return await exam_service.update_exam(exam_id, exam_in)


@router.post(
    "/{exam_id}/publish",
    response_model=ExamResponse,
    summary="Publish an Exam (Examiner Only)",
    description="Set publish flag to True. Accessible ONLY by users with the 'examiner' role."
)
async def publish_exam(
    exam_id: uuid.UUID,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_examiner)
):
    return await exam_service.publish_exam(exam_id)


@router.delete(
    "/{exam_id}",
    response_model=ExamResponse,
    summary="Delete Exam config (Examiner Only)",
    description="Accessible ONLY by users with the 'examiner' role."
)
async def delete_exam(
    exam_id: uuid.UUID,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_examiner)
):
    return await exam_service.delete_exam(exam_id)


@router.post(
    "/{exam_id}/questions",
    status_code=status.HTTP_200_OK,
    summary="Assign Questions to Exam (Examiner Only)",
    description="Accessible ONLY by users with the 'examiner' role. Maps which questions belong to this exam."
)
async def assign_exam_questions(
    exam_id: uuid.UUID,
    payload: ExamQuestionsAssign,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_examiner)
):
    await exam_service.assign_questions(exam_id, payload.questions)
    return {"message": "Questions successfully assigned to exam."}


@router.get(
    "/{exam_id}/paper",
    response_model=List[QuestionResponse],
    summary="Get Exam Paper (Student / User)",
    description="Generates the exam paper questions. Shuffles deterministically using the student ID as a seed if randomization is enabled."
)
async def get_exam_paper(
    exam_id: uuid.UUID,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_user),
    _token: Optional[str] = Depends(verify_exam_token)
):
    return await exam_service.generate_student_paper(exam_id, current_user.id)


@router.post(
    "/{exam_id}/enter",
    status_code=status.HTTP_200_OK,
    summary="Enter Exam and Get short-lived Access Token (Student Only)",
    description="Generates a short-lived exam access token with exam_id and student_id binding to prevent token sharing."
)
@router.post(
    "/{exam_id}/enter",
    status_code=status.HTTP_200_OK,
    summary="Enter Exam and Get short-lived Access Token (Student Only)",
    description="Generates a short-lived exam access token with exam_id and student_id binding to prevent token sharing."
)
async def enter_exam(
    exam_id: uuid.UUID,
    exam_service: ExamService = Depends(get_exam_service),
    current_user: User = Depends(get_current_student)
):
    exam = await exam_service.get_exam(exam_id)
    token = create_exam_token(student_id=current_user.id, exam_id=exam.id)
    return {
        "exam_token": token,
        "token_type": "Bearer",
        "expires_in_seconds": 300
    }


# ─────────────────────────────────────────────────────────────────────────────
# Real Student Dashboard Integrations (Submission, Sessions & Proctor Logging)
# ─────────────────────────────────────────────────────────────────────────────

from app.models.exam_sessions import ExamSession
from app.models.results import Result
from app.models.answers import Answer
from app.models.proctor_events import ProctorEvent, ProctorEventType
from sqlalchemy import select
from sqlalchemy.orm import selectinload
import datetime
from fastapi import Body

@router.get(
    "/sessions/me",
    summary="Get current candidate's exam sessions",
    description="Returns a real list of all exam sessions taken by the authenticated student."
)
async def get_candidate_sessions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    query = (
        select(ExamSession)
        .where(ExamSession.candidate_id == current_user.id)
        .options(
            selectinload(ExamSession.exam),
            selectinload(ExamSession.result)
        )
        .order_by(ExamSession.created_at.desc())
    )
    result = await db.execute(query)
    sessions = result.scalars().all()
    
    return [
        {
            "id": str(s.id),
            "exam_id": str(s.exam_id),
            "exam_name": s.exam.title,
            "subject": s.exam.description or "General",
            "status": s.status.value,
            "started_at": s.started_at.isoformat() if s.started_at else None,
            "completed_at": s.completed_at.isoformat() if s.completed_at else None,
            "result": {
                "total_score": float(s.result.total_score) if s.result else 0.0,
                "percentage": float(s.result.percentage) if s.result else 0.0,
                "is_passed": s.result.is_passed if s.result else False,
                "feedback": s.result.feedback if s.result else None
            } if s.result else None
        }
        for s in sessions
    ]

@router.post(
    "/{exam_id}/submit",
    summary="Submit exam answers and get evaluated results",
    description="Saves answers, grades MCQs/Multi-selects, and creates a database result transcript."
)
async def submit_exam(
    exam_id: uuid.UUID,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    exam = await db.get(Exam, exam_id)
    if not exam:
        raise HTTPException(status_code=404, detail="Exam not found.")

    # 1. Resolve or create exam session
    session_query = select(ExamSession).where(
        ExamSession.exam_id == exam_id,
        ExamSession.candidate_id == current_user.id
    ).order_by(ExamSession.created_at.desc())
    session_res = await db.execute(session_query)
    session = session_res.scalars().first()
    
    now_utc = datetime.datetime.now(datetime.timezone.utc)
    if not session:
        session = ExamSession(
            exam_id=exam_id,
            candidate_id=current_user.id,
            status="submitted",
            started_at=now_utc - datetime.timedelta(minutes=30),
            completed_at=now_utc
        )
        db.add(session)
        await db.flush()
    else:
        session.status = "submitted"
        session.completed_at = now_utc
        db.add(session)

    submitted_answers = payload.get("answers", {})
    
    # 2. Get questions for the exam
    from app.models.exams import ExamQuestion
    from app.models.question_bank import QuestionBank, QuestionOptions
    
    eq_query = select(ExamQuestion).where(ExamQuestion.exam_id == exam_id).options(
        selectinload(ExamQuestion.question).selectinload(QuestionBank.options)
    )
    eq_res = await db.execute(eq_query)
    eq_list = eq_res.scalars().all()
    
    total_max_score = 0.0
    obtained_score = 0.0
    
    # Delete previous answers for this session if they exist
    await db.execute(delete(Answer).where(Answer.session_id == session.id))
    
    for eq in eq_list:
        q = eq.question
        q_id_str = str(q.id)
        ans_val = submitted_answers.get(q_id_str)
        
        q_max_marks = float(eq.points_override) if eq.points_override is not None else float(q.marks)
        total_max_score += q_max_marks
        
        ans_obj = Answer(
            session_id=session.id,
            question_id=q.id,
            is_graded=False,
            score_obtained=0.0
        )
        
        if ans_val is not None:
            if q.question_type.value == "mcq":
                ans_obj.text_answer = str(ans_val)
                correct_opt = None
                selected_opt = None
                for opt in q.options:
                    if opt.is_correct:
                        correct_opt = opt
                    if opt.option_text == ans_val:
                        selected_opt = opt
                
                if selected_opt:
                    ans_obj.selected_option_id = selected_opt.id
                    
                if correct_opt and selected_opt and correct_opt.id == selected_opt.id:
                    ans_obj.score_obtained = q_max_marks
                    ans_obj.is_graded = True
                    obtained_score += q_max_marks
                else:
                    ans_obj.is_graded = True
                    if q.negative_marks:
                        ans_obj.score_obtained = -float(q.negative_marks)
                        obtained_score -= float(q.negative_marks)
                        
            elif q.question_type.value == "multi_select":
                selected_vals = ans_val if isinstance(ans_val, list) else [ans_val]
                ans_obj.text_answer = ", ".join(selected_vals)
                
                selected_opts = [opt for opt in q.options if opt.option_text in selected_vals]
                ans_obj.selected_options = selected_opts
                
                correct_opts = [opt for opt in q.options if opt.is_correct]
                correct_ids = {opt.id for opt in correct_opts}
                selected_ids = {opt.id for opt in selected_opts}
                
                if correct_ids == selected_ids:
                    ans_obj.score_obtained = q_max_marks
                    ans_obj.is_graded = True
                    obtained_score += q_max_marks
                else:
                    ans_obj.is_graded = True
                    if q.negative_marks:
                        ans_obj.score_obtained = -float(q.negative_marks)
                        obtained_score -= float(q.negative_marks)
            else:
                ans_obj.text_answer = str(ans_val)
                ans_obj.is_graded = False
                ans_obj.score_obtained = 0.0
                
        db.add(ans_obj)
        
    percentage = (obtained_score / total_max_score * 100.0) if total_max_score > 0 else 0.0
    is_passed = percentage >= float(exam.passing_score)
    
    # Store Result (delete previous if exists)
    await db.execute(delete(Result).where(Result.session_id == session.id))
    
    result = Result(
        session_id=session.id,
        total_score=obtained_score,
        percentage=percentage,
        is_passed=is_passed,
        feedback="Automated grading complete for MCQ items. Short/long answers pending manual evaluation."
    )
    db.add(result)
    
    await db.commit()
    await db.refresh(result)
    
    return {
        "session_id": str(session.id),
        "total_score": obtained_score,
        "max_score": total_max_score,
        "percentage": percentage,
        "is_passed": is_passed,
        "feedback": result.feedback
    }

@router.post(
    "/sessions/{session_id}/proctor-event",
    summary="Log a proctor warning event"
)
async def log_proctor_event(
    session_id: uuid.UUID,
    payload: dict = Body(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_student)
):
    event_type_str = payload.get("event_type", "tab_switched")
    try:
        e_type = ProctorEventType(event_type_str.lower())
    except ValueError:
        e_type = ProctorEventType.TAB_SWITCHED

    event = ProctorEvent(
        session_id=session_id,
        event_type=e_type,
        confidence=payload.get("confidence", 1.0),
        timestamp=datetime.datetime.now(datetime.timezone.utc),
        details=payload.get("details", "Audit event recorded.")
    )
    db.add(event)
    await db.commit()
    return {"status": "recorded"}
