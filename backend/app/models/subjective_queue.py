import enum
import uuid
import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, Numeric, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.exam_sessions import ExamSession
    from app.models.answers import Answer
    from app.models.question_bank import QuestionBank


class QueueStatus(str, enum.Enum):
    PENDING = "pending"
    GRADED = "graded"
    DISPUTED = "disputed"
    PUBLISHED = "published"


class SubjectiveGradingQueue(Base, TimestampMixin):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exam_session.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    answer_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("answer.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_bank.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    ai_score: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.0,
        nullable=False
    )
    suggested_marks: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.0,
        nullable=False
    )
    justification: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    matched_points: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    missing_points: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    confidence: Mapped[float] = mapped_column(
        Numeric(3, 2),
        default=0.85,
        nullable=False
    )
    examiner_score: Mapped[Optional[float]] = mapped_column(
        Numeric(5, 2),
        nullable=True
    )
    ocr_text: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True
    )
    status: Mapped[str] = mapped_column(
        String(50),
        default=QueueStatus.PENDING.value,
        nullable=False,
        index=True
    )

    # Relationships
    session: Mapped["ExamSession"] = relationship("ExamSession")
    answer: Mapped["Answer"] = relationship("Answer")
    question: Mapped["QuestionBank"] = relationship("QuestionBank")

    def __repr__(self) -> str:
        return f"<SubjectiveGradingQueue {self.id} Status={self.status} AIScore={self.ai_score}>"
