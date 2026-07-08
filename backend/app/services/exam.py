import uuid
import datetime
import random
import hashlib
from typing import List, Optional
from fastapi import HTTPException, status
from app.models.exams import Exam, ExamQuestion
from app.models.subjects import Subject
from app.models.question_bank import QuestionBank
from app.schemas.exam import ExamCreate, ExamUpdate, ExamQuestionLink
from app.repositories.exam import ExamRepository


class ExamService:
    def __init__(self, exam_repo: ExamRepository):
        self.exam_repo = exam_repo

    async def _verify_subject_exists(self, subject_id: uuid.UUID):
        """
        Ensure subject exists.
        """
        subject = await self.exam_repo.db.get(Subject, subject_id)
        if not subject:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Subject with ID '{subject_id}' does not exist."
            )

    def _validate_exam_window(self, start_time: Optional[datetime.datetime], end_time: Optional[datetime.datetime]):
        """
        Ensure start_time is strictly before end_time if both are provided.
        """
        import datetime
        if start_time and end_time:
            if start_time >= end_time:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Start time must be strictly before end time."
                )

    async def create_exam(self, exam_in: ExamCreate, creator_id: uuid.UUID) -> Exam:
        """
        Registers a new Exam configuration inside the DB.
        """
        await self._verify_subject_exists(exam_in.subject_id)
        self._validate_exam_window(exam_in.start_time, exam_in.end_time)
        return await self.exam_repo.create_with_settings(exam_in, creator_id)

    async def get_exam(self, exam_id: uuid.UUID) -> Exam:
        """
        Retrieve Exam details by ID.
        Raises 404 if not found.
        """
        exam = await self.exam_repo.get_exam_by_id(exam_id)
        if not exam:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Exam configuration not found."
            )
        return exam

    async def update_exam(self, exam_id: uuid.UUID, exam_in: ExamUpdate) -> Exam:
        """
        Update Exam properties and nested settings.
        """
        exam = await self.get_exam(exam_id)

        # Validate subject if changed
        if exam_in.subject_id is not None:
            await self._verify_subject_exists(exam_in.subject_id)

        # Validate updated time windows
        new_start = exam_in.start_time if exam_in.start_time is not None else exam.start_time
        new_end = exam_in.end_time if exam_in.end_time is not None else exam.end_time
        self._validate_exam_window(new_start, new_end)

        return await self.exam_repo.update_with_settings(db_obj=exam, obj_in=exam_in)

    async def delete_exam(self, exam_id: uuid.UUID) -> Exam:
        """
        Deletes an exam configuration.
        """
        await self.get_exam(exam_id)
        return await self.exam_repo.remove(id=exam_id)

    async def publish_exam(self, exam_id: uuid.UUID) -> Exam:
        """
        Publish the exam config, setting is_published to True.
        """
        exam = await self.get_exam(exam_id)
        
        # We can implement basic validation: ensure duration is set, etc.
        if exam.duration_minutes <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot publish exam: duration must be greater than 0."
            )
            
        exam.is_published = True
        self.exam_repo.db.add(exam)
        await self.exam_repo.db.commit()
        await self.exam_repo.db.refresh(exam)
        
        return await self.get_exam(exam_id)

    async def list_exams(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        subject_id: Optional[uuid.UUID] = None,
        is_published: Optional[bool] = None,
        creator_id: Optional[uuid.UUID] = None
    ) -> List[Exam]:
        """
        List exams using skip/limit offsets, with filters.
        """
        return await self.exam_repo.get_exams_list(
            skip=skip,
            limit=limit,
            subject_id=subject_id,
            is_published=is_published,
            creator_id=creator_id
        )

    async def assign_questions(
        self,
        exam_id: uuid.UUID,
        question_links: List[ExamQuestionLink]
    ) -> List[ExamQuestion]:
        """
        Associate a list of questions to the exam.
        """
        # Ensure exam exists
        await self.get_exam(exam_id)
        return await self.exam_repo.assign_exam_questions(exam_id, question_links)

    async def generate_student_paper(
        self,
        exam_id: uuid.UUID,
        student_id: uuid.UUID
    ) -> List[QuestionBank]:
        """
        Retrieve all exam questions. If shuffle_questions setting is enabled, shuffles 
        them deterministically seeded by the hash of (student_id + exam_id).
        If no questions are pre-assigned, dynamically generates the exam paper based on
        settings distributions and question_count.
        """
        exam = await self.get_exam(exam_id)
        
        # Load all mapped question relations
        exam_questions = await self.exam_repo.get_exam_questions_eager(exam_id)
        
        # Extract underlying question records
        questions = [eq.question for eq in exam_questions if not eq.question.is_deleted]

        # If no questions are pre-assigned, dynamically select from the bank
        if not questions and exam.question_count and exam.question_count > 0:
            # Eager load all questions for the subject
            from sqlalchemy import select
            from sqlalchemy.orm import selectinload
            from app.models.question_bank import QuestionBank
            
            query = (
                select(QuestionBank)
                .where(
                    QuestionBank.subject_id == exam.subject_id,
                    QuestionBank.is_deleted == False
                )
                .options(selectinload(QuestionBank.options))
            )
            res = await self.exam_repo.db.execute(query)
            pool = list(res.scalars().all())
            
            # Setup deterministic seed for selection
            select_seed = f"{student_id}_{exam_id}_select"
            select_hash = hashlib.sha256(select_seed.encode("utf-8")).hexdigest()
            select_rng = random.Random(int(select_hash, 16))
            
            # Shuffle pool first to make selection random but deterministic per student
            select_rng.shuffle(pool)
            
            # Filter based on settings distributions if they exist
            selected = []
            settings = exam.settings
            
            if settings and (settings.difficulty_distribution or settings.question_distribution):
                diff_dist = settings.difficulty_distribution or {}
                type_dist = settings.question_distribution or {}
                
                # Check if distributions are percentages or absolute counts
                def resolve_counts(dist, total):
                    vals = list(dist.values())
                    if not vals:
                        return {}
                    if sum(vals) > total:
                        # Normalize percentages
                        total_sum = sum(vals)
                        return {k: int(v / total_sum * total) for k, v in dist.items()}
                    elif sum(vals) <= 1.0 or (all(isinstance(v, float) for v in vals) and sum(vals) <= 1.05):
                        # Decimal percentages
                        return {k: int(v * total) for k, v in dist.items()}
                    elif sum(vals) <= 100 and any(v > 1 for v in vals):
                        # Integer percentages (0-100)
                        return {k: int((v / 100.0) * total) for k, v in dist.items()}
                    else:
                        # Absolute counts
                        return {k: int(v) for k, v in dist.items()}
                
                req_diffs = resolve_counts(diff_dist, exam.question_count)
                req_types = resolve_counts(type_dist, exam.question_count)
                
                # Satisfy requirements
                if req_diffs:
                    for diff_level, count in req_diffs.items():
                        diff_pool = [q for q in pool if q.difficulty.lower() == diff_level.lower()]
                        selected.extend(diff_pool[:count])
                elif req_types:
                    for qtype, count in req_types.items():
                        type_pool = [q for q in pool if q.question_type.value.lower() == qtype.lower()]
                        selected.extend(type_pool[:count])
                
                # Deduplicate and pad if we don't have enough questions
                selected_ids = {q.id for q in selected}
                selected_unique = []
                for q in selected:
                    if q.id not in selected_ids:
                        selected_unique.append(q)
                # Ensure we populate list
                selected_unique = selected.copy()
                
                for q in pool:
                    if len(selected_unique) >= exam.question_count:
                        break
                    if q.id not in selected_ids:
                        selected_unique.append(q)
                        selected_ids.add(q.id)
                selected = selected_unique
            else:
                # No distribution, select first N questions from shuffled pool
                selected = pool[:exam.question_count]
                
            questions = selected

        # Shuffle if enabled
        if exam.settings and exam.settings.shuffle_questions:
            # 1. Deterministic concatenation seed
            seed_str = f"{student_id}_{exam_id}"
            # 2. SHA-256 hash
            seed_hash = hashlib.sha256(seed_str.encode("utf-8")).hexdigest()
            # 3. Large integer seed
            seed_int = int(seed_hash, 16)
            # 4. Isolated RNG generator
            rng = random.Random(seed_int)
            # 5. Shuffle copy
            shuffled_questions = list(questions)
            rng.shuffle(shuffled_questions)
            return shuffled_questions

        return questions
