import uuid
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, Text, Boolean, Numeric, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.exam_sessions import ExamSession
    from app.models.question_bank import QuestionBank, QuestionOptions


class Answer(Base, TimestampMixin):
    __table_args__ = (
        UniqueConstraint("session_id", "question_id", name="uq_session_question_answer"),
    )

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
    question_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_bank.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    selected_option_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("question_options.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    text_answer: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )
    is_graded: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    score_obtained: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.0,
        nullable=False
    )

    # Relationships
    session: Mapped["ExamSession"] = relationship(
        "ExamSession",
        back_populates="answers"
    )
    question: Mapped["QuestionBank"] = relationship(
        "QuestionBank"
    )
    selected_option: Mapped["QuestionOptions"] = relationship(
        "QuestionOptions"
    )

    def __repr__(self) -> str:
        return f"<Answer Session={self.session_id} Question={self.question_id} Score={self.score_obtained}>"
