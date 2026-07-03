import uuid
from typing import List, Optional
from sqlalchemy import select, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.question_bank import QuestionBank, QuestionOptions, QuestionType
from app.repositories.base import BaseRepository
from app.schemas.question import QuestionCreate, QuestionUpdate


class QuestionRepository(BaseRepository[QuestionBank]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(QuestionBank, db_session)

    async def get_question_by_id(self, question_id: uuid.UUID) -> Optional[QuestionBank]:
        """
        Eagerly retrieve a single QuestionBank with its Options relationship loaded.
        """
        query = (
            select(self.model)
            .where(self.model.id == question_id)
            .options(selectinload(self.model.options))
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_with_options(self, obj_in: QuestionCreate) -> QuestionBank:
        """
        Create a new Question along with its associated child QuestionOptions.
        """
        obj_in_data = obj_in.model_dump()
        options_data = obj_in_data.pop("options", []) or []

        db_obj = self.model(**obj_in_data)
        
        # Build child option models
        for opt in options_data:
            db_obj.options.append(QuestionOptions(**opt))

        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)
        
        # Eager load options on return
        return await self.get_question_by_id(db_obj.id)

    async def update_with_options(self, db_obj: QuestionBank, obj_in: QuestionUpdate) -> QuestionBank:
        """
        Update question fields and replace child options if supplied.
        """
        if hasattr(obj_in, "model_dump"):
            update_data = obj_in.model_dump(exclude_unset=True)
        else:
            update_data = dict(obj_in)

        options_data = update_data.pop("options", None)

        # Clear and replace options if provided in patch
        if options_data is not None:
            # SQLAlchemy cascade delete-orphan will clear old options in DB on flush
            db_obj.options.clear()
            for opt in options_data:
                db_obj.options.append(QuestionOptions(**opt))

        # Update remaining base fields
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)

        return await self.get_question_by_id(db_obj.id)

    async def get_questions_filtered(
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
        Retrieve multiple questions with support for filtering, eager loading, pagination, and sorting.
        """
        query = select(self.model).options(selectinload(self.model.options))

        # Filters
        if subject_id:
            query = query.where(self.model.subject_id == subject_id)
        if question_type:
            query = query.where(self.model.question_type == question_type)
        if difficulty:
            query = query.where(self.model.difficulty == difficulty.strip().lower())

        # Sorting
        sort_attr = getattr(self.model, sort_by, self.model.created_at)
        if sort_order.strip().lower() == "asc":
            query = query.order_by(asc(sort_attr))
        else:
            query = query.order_by(desc(sort_attr))

        # Pagination
        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def search_questions(
        self,
        *,
        search_query: str,
        skip: int = 0,
        limit: int = 100
    ) -> List[QuestionBank]:
        """
        Perform a case-insensitive search matching search_query inside title or text content.
        """
        pattern = f"%{search_query}%"
        query = (
            select(self.model)
            .where(
                or_(
                    self.model.title.ilike(pattern),
                    self.model.question_text.ilike(pattern)
                )
            )
            .options(selectinload(self.model.options))
            .offset(skip)
            .limit(limit)
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
