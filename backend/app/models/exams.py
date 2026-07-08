import uuid
import datetime
from typing import List, Optional, TYPE_CHECKING
from sqlalchemy import ForeignKey, String, Text, Integer, Boolean, DateTime, UniqueConstraint, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.ext.associationproxy import AssociationProxy, association_proxy
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.subjects import Subject
    from app.models.users import User
    from app.models.question_bank import QuestionBank
    from app.models.exam_sessions import ExamSession


# ... (Exam and ExamQuestion classes remain unchanged, only top imports and ExamSettings change)
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
    question_count: Mapped[Optional[int]] = mapped_column(
        Integer,
        nullable=True
    )
    is_deleted: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True
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
    settings: Mapped[Optional["ExamSettings"]] = relationship(
        "ExamSettings",
        back_populates="exam",
        uselist=False,
        cascade="all, delete-orphan"
    )

    # Association Proxy to access QuestionBank entries directly via exam.questions
    questions: AssociationProxy[List["QuestionBank"]] = association_proxy(
        "question_associations", "question"
    )

    def __repr__(self) -> str:
        return f"<Exam {self.title}>"


class ExamQuestion(Base, TimestampMixin):
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


class ExamSettings(Base, TimestampMixin):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    exam_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("exam.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True
    )

    # Proctoring settings flags
    enable_camera: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    enable_microphone: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    enable_browser_lock: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    max_tab_switches: Mapped[int] = mapped_column(
        Integer,
        default=3,
        nullable=False
    )
    max_face_violations: Mapped[int] = mapped_column(
        Integer,
        default=5,
        nullable=False
    )
    shuffle_questions: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    show_results_immediately: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )

    # New proctoring and policy configuration flags
    proctoring_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    face_detection_enabled: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    enable_gaze_tracking: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False
    )
    suspicion_threshold: Mapped[int] = mapped_column(
        Integer,
        default=5,
        nullable=False
    )
    enable_negative_marking: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False
    )
    difficulty_distribution: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )
    question_distribution: Mapped[Optional[dict]] = mapped_column(
        JSON,
        nullable=True
    )

    # Relationships
    exam: Mapped["Exam"] = relationship(
        "Exam",
        back_populates="settings"
    )

    def __repr__(self) -> str:
        return f"<ExamSettings Exam={self.exam_id}>"
