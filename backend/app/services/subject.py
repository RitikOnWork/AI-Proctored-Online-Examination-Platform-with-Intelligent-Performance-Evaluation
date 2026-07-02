import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.subjects import Subject
from app.schemas.subject import SubjectCreate, SubjectUpdate
from app.repositories.subject import SubjectRepository


class SubjectService:
    def __init__(self, subject_repo: SubjectRepository):
        self.subject_repo = subject_repo

    async def create_subject(self, subject_in: SubjectCreate) -> Subject:
        """
        Creates a new Subject.
        Raises 400 Bad Request if the subject name already exists.
        """
        existing = await self.subject_repo.get_by_name(subject_in.name)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"A subject named '{subject_in.name}' already exists."
            )
        return await self.subject_repo.create(subject_in)

    async def get_subject(self, subject_id: uuid.UUID) -> Subject:
        """
        Retrieves a Subject by ID.
        Raises 404 Not Found if not exists.
        """
        subject = await self.subject_repo.get(subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Subject not found."
            )
        return subject

    async def list_subjects(self, skip: int = 0, limit: int = 100) -> List[Subject]:
        """
        Lists subjects with pagination offsets.
        """
        return await self.subject_repo.get_multi(skip=skip, limit=limit)

    async def update_subject(self, subject_id: uuid.UUID, subject_in: SubjectUpdate) -> Subject:
        """
        Updates an existing Subject.
        Raises 404 Not Found if subject doesn't exist.
        Raises 400 Bad Request if the updated name collides with another subject.
        """
        subject = await self.get_subject(subject_id)
        
        # Check name collision
        if subject_in.name and subject_in.name != subject.name:
            existing = await self.subject_repo.get_by_name(subject_in.name)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"A subject named '{subject_in.name}' already exists."
                )

        return await self.subject_repo.update(db_obj=subject, obj_in=subject_in)

    async def delete_subject(self, subject_id: uuid.UUID) -> Subject:
        """
        Deletes a Subject by ID.
        Raises 404 Not Found if not exists.
        """
        subject = await self.get_subject(subject_id)
        return await self.subject_repo.remove(id=subject_id)
