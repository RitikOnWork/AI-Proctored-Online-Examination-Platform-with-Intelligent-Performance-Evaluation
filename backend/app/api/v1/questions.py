import os
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Query, status, File, UploadFile, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.users import User
from app.models.question_bank import QuestionType
from app.schemas.question import QuestionCreate, QuestionUpdate, QuestionResponse
from app.repositories.question import QuestionRepository
from app.services.question import QuestionService
from app.dependencies.auth import get_current_user, get_current_examiner

router = APIRouter(prefix="/questions", tags=["Question Bank Management"])


# Dependency injection helpers
async def get_question_repository(db: AsyncSession = Depends(get_db)) -> QuestionRepository:
    return QuestionRepository(db)


async def get_question_service(
    question_repo: QuestionRepository = Depends(get_question_repository)
) -> QuestionService:
    return QuestionService(question_repo)


@router.post(
    "",
    response_model=QuestionResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Question (Examiner Only)",
    description="Only accessible by users with the 'examiner' role. Supports MCQ, Multi-Select, Short/Long Answers, and Image Uploads."
)
async def create_question(
    question_in: QuestionCreate,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_examiner)
):
    return await question_service.create_question(question_in)


@router.post(
    "/upload-image",
    status_code=status.HTTP_200_OK,
    summary="Upload question image (Examiner Only)",
    description="Only accessible by users with the 'examiner' role. Validates image format and limits size to 5MB."
)
async def upload_image(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_examiner)
):
    MAX_FILE_SIZE = 5 * 1024 * 1024  # 5MB
    ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

    # Validate file extension
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Allowed formats: PNG, JPEG, JPG, GIF, WEBP."
        )

    # Validate Content-Type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type is not supported. Must be an image."
        )

    # Validate file size
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File size exceeds the 5MB limit."
        )

    # Generate unique filename
    unique_filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join("static", "uploads", unique_filename)

    # Save to disk
    with open(filepath, "wb") as f:
        f.write(contents)

    # Return access URL path
    return {
        "url": f"/static/uploads/{unique_filename}",
        "filename": unique_filename
    }


@router.get(
    "/search",
    response_model=List[QuestionResponse],
    summary="Search questions",
    description="Accessible by any authenticated user. Performs free-text query matching in title or question text."
)
async def search_questions(
    q: str = Query(..., min_length=1, description="Search query string"),
    skip: int = Query(0, ge=0, description="Pagination skip offset"),
    limit: int = Query(100, ge=1, le=100, description="Pagination limit size"),
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_user)
):
    return await question_service.search_questions(search_query=q, skip=skip, limit=limit)


@router.get(
    "/{question_id}",
    response_model=QuestionResponse,
    summary="Get Question details",
    description="Accessible by any authenticated user."
)
async def get_question(
    question_id: uuid.UUID,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_user)
):
    return await question_service.get_question(question_id)


@router.get(
    "",
    response_model=List[QuestionResponse],
    summary="List Questions with filtering & sorting",
    description="Accessible by any authenticated user. Filter by subject, type, or difficulty. Sort by created_at, marks, or difficulty."
)
async def list_questions(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    subject_id: Optional[uuid.UUID] = Query(None, description="Filter by Subject ID"),
    question_type: Optional[QuestionType] = Query(None, description="Filter by Question Type"),
    difficulty: Optional[str] = Query(None, description="Filter by difficulty ('easy', 'medium', 'hard')"),
    sort_by: str = Query("created_at", description="Sort field ('created_at', 'marks', 'difficulty')"),
    sort_order: str = Query("desc", description="Sort order ('asc', 'desc')"),
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_user)
):
    return await question_service.list_questions(
        skip=skip,
        limit=limit,
        subject_id=subject_id,
        question_type=question_type,
        difficulty=difficulty,
        sort_by=sort_by,
        sort_order=sort_order
    )


@router.patch(
    "/{question_id}",
    response_model=QuestionResponse,
    summary="Update a Question (Examiner Only)",
    description="Only accessible by users with the 'examiner' role."
)
async def update_question(
    question_id: uuid.UUID,
    question_in: QuestionUpdate,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_examiner)
):
    return await question_service.update_question(question_id, question_in)


@router.delete(
    "/{question_id}",
    response_model=QuestionResponse,
    summary="Delete a Question (Examiner Only)",
    description="Only accessible by users with the 'examiner' role."
)
async def delete_question(
    question_id: uuid.UUID,
    question_service: QuestionService = Depends(get_question_service),
    current_user: User = Depends(get_current_examiner)
):
    return await question_service.delete_question(question_id)
