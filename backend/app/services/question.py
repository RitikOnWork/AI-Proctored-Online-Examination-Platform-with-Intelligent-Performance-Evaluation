import uuid
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.question_bank import QuestionBank, QuestionType
from app.models.subjects import Subject
from app.schemas.question import QuestionCreate, QuestionUpdate
from app.repositories.question import QuestionRepository


class QuestionService:
    def __init__(self, question_repo: QuestionRepository):
        self.question_repo = question_repo

    async def _verify_subject_exists(self, subject_id: uuid.UUID):
        """
        Internal check to verify subject is registered in DB.
        """
        subject = await self.question_repo.db.get(Subject, subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject with ID '{subject_id}' does not exist."
            )

    async def create_question(self, question_in: QuestionCreate) -> QuestionBank:
        """
        Creates a new Question with optional options.
        """
        await self._verify_subject_exists(question_in.subject_id)
        return await self.question_repo.create_with_options(question_in)

    async def get_question(self, question_id: uuid.UUID) -> QuestionBank:
        """
        Retrieve question details by ID.
        Raises 404 if not found.
        """
        question = await self.question_repo.get_question_by_id(question_id)
        if not question:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Question not found."
            )
        return question

    async def update_question(self, question_id: uuid.UUID, question_in: QuestionUpdate) -> QuestionBank:
        """
        Updates an existing question and its options.
        """
        question = await self.get_question(question_id)

        if question_in.subject_id is not None:
            await self._verify_subject_exists(question_in.subject_id)

        return await self.question_repo.update_with_options(db_obj=question, obj_in=question_in)

    async def delete_question(self, question_id: uuid.UUID) -> QuestionBank:
        """
        Deletes a question by ID.
        """
        # Ensure it exists first
        await self.get_question(question_id)
        return await self.question_repo.remove(id=question_id)

    async def list_questions(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        subject_id: Optional[uuid.UUID] = None,
        question_type: Optional[QuestionType] = None,
        difficulty: Optional[str] = None,
        sort_by: str = "created_at",
        sort_order: str = "desc"
    ) -> List[QuestionBank]:
        """
        Lists questions with filtering and sorting support.
        """
        # Sanitize sort fields to prevent SQL injection or attribute access errors
        allowed_sort_fields = ["created_at", "marks", "difficulty"]
        if sort_by not in allowed_sort_fields:
            sort_by = "created_at"

        return await self.question_repo.get_questions_filtered(
            skip=skip,
            limit=limit,
            subject_id=subject_id,
            question_type=question_type,
            difficulty=difficulty,
            sort_by=sort_by,
            sort_order=sort_order
        )

    async def search_questions(
        self,
        *,
        search_query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[QuestionBank]:
        """
        Perform case-insensitive matches in question details.
        """
        if not search_query.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Search query cannot be empty."
            )
        return await self.question_repo.search_questions(
            search_query=search_query.strip(),
            skip=skip,
            limit=limit
        )
