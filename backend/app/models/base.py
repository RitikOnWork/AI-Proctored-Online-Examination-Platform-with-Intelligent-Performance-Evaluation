import datetime
from sqlalchemy import DateTime
from sqlalchemy.orm import DeclarativeBase, Mapped, declared_attr, mapped_column
from sqlalchemy.sql import func


class Base(DeclarativeBase):
    """
    SQLAlchemy Declarative Base class.
    Automatically generates table names based on class names.
    """

    @declared_attr.directive
    def __tablename__(cls) -> str:
        # Convert CamelCase class name to snake_case table name
        name = cls.__name__
        parts = []
        for i, char in enumerate(name):
            if char.isupper() and i > 0:
                parts.append("_")
            parts.append(char.lower())
        return "".join(parts)


class TimestampMixin:
    """
    Mixin adding timezone-aware created_at and updated_at columns automatically.
    """
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )
