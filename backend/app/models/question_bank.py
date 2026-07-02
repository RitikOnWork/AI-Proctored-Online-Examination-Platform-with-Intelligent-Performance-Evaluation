import enum
import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, Boolean, Integer, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.subjects import Subject
    from app.models.exams import ExamQuestion


class QuestionType(str, enum.Enum):
    MCQ = "mcq"
    TRUE_FALSE = "true_false"
    SUBJECTIVE = "subjective"


class QuestionBank(Base, TimestampMixin):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    subject_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("subject.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    question_type: Mapped[QuestionType] = mapped_column(
        Enum(QuestionType, name="question_type"),
        nullable=False
    )
    difficulty: Mapped[str] = mapped_column(
        String(20),
        default="medium",
        nullable=False
    )
    points: Mapped[int] = mapped_column(
        Integer,
        default=1,
        nullable=False
    )

    # Relationships
    subject: Mapped["Subject"] = relationship(
        "Subject",
        back_populates="questions"
    )
    options: Mapped[List["QuestionOptions"]] = relationship(
        "QuestionOptions",
        back_populates="question",
        cascade="all, delete-orphan"
    )
    exam_associations: Mapped[List["ExamQuestion"]] = relationship(
        "ExamQuestion",
        back_populates="question",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Question {self.id} ({self.question_type})>"


class QuestionOptions(Base, TimestampMixin):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_bank.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    option_text: Mapped[str] = mapped_column(
        Text,
        nullable=False
    )
    is_correct: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # Relationships
    question: Mapped["QuestionBank"] = relationship(
        "QuestionBank",
        back_populates="options"
    )

    def __repr__(self) -> str:
        return f"<Option {self.id} (Correct={self.is_correct})>"
