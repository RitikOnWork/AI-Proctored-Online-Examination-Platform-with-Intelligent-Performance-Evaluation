import enum
import uuid
import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Enum, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.exams import Exam
    from app.models.users import User
    from app.models.answers import Answer
    from app.models.results import Result
    from app.models.proctor_events import ProctorEvent


class SessionStatus(str, enum.Enum):
    SCHEDULED = "scheduled"
    ACTIVE = "active"
    SUBMITTED = "submitted"
    EXPIRED = "expired"
    SUSPENDED = "suspended"


class ExamSession(Base, TimestampMixin):
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
    candidate_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("user.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    status: Mapped[SessionStatus] = mapped_column(
        Enum(SessionStatus, name="session_status"),
        default=SessionStatus.SCHEDULED,
        index=True,
        nullable=False
    )
    started_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    completed_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )
    ip_address: Mapped[str] = mapped_column(
        String(45),
        nullable=True
    )
    device_info: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    # Relationships
    exam: Mapped["Exam"] = relationship(
        "Exam",
        back_populates="sessions"
    )
    candidate: Mapped["User"] = relationship(
        "User",
        back_populates="sessions"
    )
    answers: Mapped[List["Answer"]] = relationship(
        "Answer",
        back_populates="session",
        cascade="all, delete-orphan"
    )
    result: Mapped[Optional["Result"]] = relationship(
        "Result",
        back_populates="session",
        uselist=False,
        cascade="all, delete-orphan"
    )
    proctor_events: Mapped[List["ProctorEvent"]] = relationship(
        "ProctorEvent",
        back_populates="session",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Session {self.id} Status={self.status}>"
