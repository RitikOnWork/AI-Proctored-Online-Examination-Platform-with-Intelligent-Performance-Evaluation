import uuid
from typing import List, TYPE_CHECKING
from sqlalchemy import String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.question_bank import QuestionBank
    from app.models.exams import Exam


class Subject(Base, TimestampMixin):
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True
    )
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    # Relationships
    questions: Mapped[List["QuestionBank"]] = relationship(
        "QuestionBank",
        back_populates="subject",
        cascade="all, delete-orphan"
    )
    exams: Mapped[List["Exam"]] = relationship(
        "Exam",
        back_populates="subject",
        cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Subject {self.name}>"
