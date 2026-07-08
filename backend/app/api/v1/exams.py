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
