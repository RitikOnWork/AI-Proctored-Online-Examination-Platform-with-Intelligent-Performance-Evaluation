import uuid
from typing import List
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.users import User
from app.schemas.subject import SubjectCreate, SubjectUpdate, SubjectResponse
from app.repositories.subject import SubjectRepository
from app.services.subject import SubjectService
from app.dependencies.auth import get_current_user, get_current_admin

router = APIRouter(prefix="/subjects", tags=["Subject Management"])


# Dependency injections
async def get_subject_repository(db: AsyncSession = Depends(get_db)) -> SubjectRepository:
    return SubjectRepository(db)


async def get_subject_service(
    subject_repo: SubjectRepository = Depends(get_subject_repository)
) -> SubjectService:
    return SubjectService(subject_repo)


@router.post(
    "",
    response_model=SubjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new Subject (Admin Only)",
    description="Only accessible by users with the 'admin' role."
)
async def create_subject(
    subject_in: SubjectCreate,
    subject_service: SubjectService = Depends(get_subject_service),
    current_user: User = Depends(get_current_admin)
):
    return await subject_service.create_subject(subject_in)


@router.get(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Get Subject details",
    description="Accessible by any authenticated user."
)
async def get_subject(
    subject_id: uuid.UUID,
    subject_service: SubjectService = Depends(get_subject_service),
    current_user: User = Depends(get_current_user)
):
    return await subject_service.get_subject(subject_id)


@router.get(
    "",
    response_model=List[SubjectResponse],
    summary="List Subjects with pagination",
    description="Accessible by any authenticated user."
)
async def list_subjects(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=100, description="Max number of items to return"),
    subject_service: SubjectService = Depends(get_subject_service),
    current_user: User = Depends(get_current_user)
):
    return await subject_service.list_subjects(skip=skip, limit=limit)


@router.patch(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Update a Subject (Admin Only)",
    description="Only accessible by users with the 'admin' role."
)
async def update_subject(
    subject_id: uuid.UUID,
    subject_in: SubjectUpdate,
    subject_service: SubjectService = Depends(get_subject_service),
    current_user: User = Depends(get_current_admin)
):
    return await subject_service.update_subject(subject_id, subject_in)


@router.delete(
    "/{subject_id}",
    response_model=SubjectResponse,
    summary="Delete a Subject (Admin Only)",
    description="Only accessible by users with the 'admin' role."
)
async def delete_subject(
    subject_id: uuid.UUID,
    subject_service: SubjectService = Depends(get_subject_service),
    current_user: User = Depends(get_current_admin)
):
    return await subject_service.delete_subject(subject_id)
