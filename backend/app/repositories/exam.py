import uuid
from typing import List, Optional
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.exams import Exam, ExamSettings, ExamQuestion
from app.models.question_bank import QuestionBank
from app.repositories.base import BaseRepository
from app.schemas.exam import ExamCreate, ExamUpdate, ExamQuestionLink


class ExamRepository(BaseRepository[Exam]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(Exam, db_session)

    async def get_exam_by_id(self, exam_id: uuid.UUID) -> Optional[Exam]:
        """
        Eagerly load an Exam with its settings and subject relationships.
        """
        query = (
            select(self.model)
            .where(self.model.id == exam_id)
            .options(
                selectinload(self.model.settings),
                selectinload(self.model.subject)
            )
        )
        result = await self.db.execute(query)
        return result.scalar_one_or_none()

    async def create_with_settings(self, obj_in: ExamCreate, creator_id: uuid.UUID) -> Exam:
        """
        Create a new Exam and populate default or custom one-to-one settings.
        """
        obj_in_data = obj_in.model_dump()
        settings_data = obj_in_data.pop("settings", None)

        # Create basic Exam
        db_obj = self.model(**obj_in_data)
        db_obj.creator_id = creator_id

        # Populate Settings
        if settings_data is not None:
            db_obj.settings = ExamSettings(**settings_data)
        else:
            db_obj.settings = ExamSettings()

        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)

        return await self.get_exam_by_id(db_obj.id)

    async def update_with_settings(self, db_obj: Exam, obj_in: ExamUpdate) -> Exam:
        """
        Update Exam and nested ExamSettings fields.
        """
        if hasattr(obj_in, "model_dump"):
            update_data = obj_in.model_dump(exclude_unset=True)
        else:
            update_data = dict(obj_in)

        settings_data = update_data.pop("settings", None)

        # Update nested settings properties
        if settings_data is not None and db_obj.settings is not None:
            for field, val in settings_data.items():
                setattr(db_obj.settings, field, val)
            self.db.add(db_obj.settings)

        # Update base exam fields
        for field in update_data:
            if hasattr(db_obj, field):
                setattr(db_obj, field, update_data[field])

        self.db.add(db_obj)
        await self.db.flush()
        await self.db.refresh(db_obj)

        return await self.get_exam_by_id(db_obj.id)

    async def get_exams_list(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        subject_id: Optional[uuid.UUID] = None,
        is_published: Optional[bool] = None,
        creator_id: Optional[uuid.UUID] = None
    ) -> List[Exam]:
        """
        Retrieve list of exams with support for filtering and eager loading.
        """
        query = (
            select(self.model)
            .options(
                selectinload(self.model.settings),
                selectinload(self.model.subject)
            )
            .order_by(self.model.created_at.desc())
        )

        if subject_id:
            query = query.where(self.model.subject_id == subject_id)
        if is_published is not None:
            query = query.where(self.model.is_published == is_published)
        if creator_id:
            query = query.where(self.model.creator_id == creator_id)

        query = query.offset(skip).limit(limit)

        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def assign_exam_questions(
        self,
        exam_id: uuid.UUID,
        question_links: List[ExamQuestionLink]
    ) -> List[ExamQuestion]:
        """
        Delete old exam question associations and insert new ones.
        """
        # Delete existing mappings
        await self.db.execute(delete(ExamQuestion).where(ExamQuestion.exam_id == exam_id))
        
        # Build and add new ones
        db_objs = []
        for link in question_links:
            db_obj = ExamQuestion(
                exam_id=exam_id,
                question_id=link.question_id,
                order=link.order,
                points_override=link.points_override
            )
            self.db.add(db_obj)
            db_objs.append(db_obj)
        
        await self.db.flush()
        return db_objs

    async def get_exam_questions_eager(self, exam_id: uuid.UUID) -> List[ExamQuestion]:
        """
        Retrieve all questions assigned to the exam, eagerly loading options.
        """
        query = (
            select(ExamQuestion)
            .where(ExamQuestion.exam_id == exam_id)
            .options(
                selectinload(ExamQuestion.question).selectinload(QuestionBank.options)
            )
            .order_by(ExamQuestion.order.asc())
        )
        result = await self.db.execute(query)
        return list(result.scalars().all())
