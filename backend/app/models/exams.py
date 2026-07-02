import uuid
import datetime
from typing import List, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, Integer, Boolean, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.subjects import Subject
    from app.models.users import User
    from app.models.question_bank import QuestionBank
    from app.models.exam_sessions import ExamSession


class Exam(Base, TimestampMixin):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subject.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    creator_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    duration_minutes: Mapped[int] = mapped_column(
        Integer,
        nullable=False
    )
    passing_score: Mapped[int] = mapped_column(
        Integer,
        default=40,
        nullable=False
    )
    start_time: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    end_time: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    is_published: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # Relationships
    subject: Mapped["Subject"] = relationship(
        "Subject",
        back_populates="exams"
    )
    creator: Mapped["User"] = relationship(
        "User",
        back_populates="exams_created"
    )
    question_associations: Mapped[List["ExamQuestion"]] = relationship(
        "ExamQuestion",
        back_populates="exam",
        cascade="all, delete-orphan"
    )
    sessions: Mapped[List["ExamSession"]] = relationship(
        "ExamSession",
        back_populates="exam",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Exam {self.title}>"


class ExamQuestion(Base, TimestampMixin):
    # Enforces compound unique check or uses explicit key
    __table_args__ = (
        UniqueConstraint("exam_id", "question_id", name="uq_exam_question"),
    )

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    exam_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exam.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_bank.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    order: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False
    )
    points_override: Mapped[int] = mapped_column(
        Integer,
        nullable=True
    )

    # Relationships
    exam: Mapped["Exam"] = relationship(
        "Exam",
        back_populates="question_associations"
    )
    question: Mapped["QuestionBank"] = relationship(
        "QuestionBank",
        back_populates="exam_associations"
    )

    def __repr__(self) -> str:
        return f"<ExamQuestion Exam={self.exam_id} Question={self.question_id}>"
