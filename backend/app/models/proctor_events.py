import enum
import uuid
import datetime
from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Enum, DateTime, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.exam_sessions import ExamSession


class ProctorEventType(str, enum.Enum):
    FACE_MISSING = "face_missing"
    MULTIPLE_FACES = "multiple_faces"
    TAB_SWITCHED = "tab_switched"
    GAZE_DEVIATED = "gaze_deviated"
    UNAUTHORIZED_OBJECT = "unauthorized_object"
    AUDIO_VIOLATION = "audio_violation"


class ProctorEvent(Base, TimestampMixin):
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
    event_type: Mapped[ProctorEventType] = mapped_column(
        Enum(ProctorEventType, name="proctor_event_type"),
        nullable=False,
        index=True
    )
    confidence: Mapped[float] = mapped_column(
        Numeric(3, 2),
        default=1.00,
        nullable=False
    )
    snapshot_url: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False
    )
    details: Mapped[str] = mapped_column(
        String(255),
        nullable=True
    )

    # Relationships
    session: Mapped["ExamSession"] = relationship(
        "ExamSession",
        back_populates="proctor_events"
    )

    def __repr__(self) -> str:
        return f"<ProctorEvent Session={self.session_id} Event={self.event_type} Confidence={self.confidence}>"
