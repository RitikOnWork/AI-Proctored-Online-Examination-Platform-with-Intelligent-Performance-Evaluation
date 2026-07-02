import uuid
from typing import Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, Text, Boolean, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.exam_sessions import ExamSession
    from app.models.users import User


class Result(Base, TimestampMixin):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exam_session.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )
    total_score: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.0,
        nullable=False
    )
    percentage: Mapped[float] = mapped_column(
        Numeric(5, 2),
        default=0.0,
        nullable=False
    )
    is_passed: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    graded_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    feedback: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    # Relationships
    session: Mapped["ExamSession"] = relationship(
        "ExamSession",
        back_populates="result"
    )
    grader: Mapped["User"] = relationship(
        "User"
    )

    def __repr__(self) -> str:
        return f"<Result Session={self.session_id} Score={self.total_score} Passed={self.is_passed}>"
