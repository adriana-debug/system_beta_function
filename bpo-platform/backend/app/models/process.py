"""Business Process models."""

import uuid
from enum import Enum

from sqlalchemy import Boolean, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class ProcessStatus(str, Enum):
    """Process lifecycle status."""

    DRAFT = "draft"
    ACTIVE = "active"
    PAUSED = "paused"
    ARCHIVED = "archived"


class Process(BaseModel):
    """Business process model."""

    __tablename__ = "processes"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ProcessStatus] = mapped_column(
        String(20),
        default=ProcessStatus.DRAFT,
        nullable=False,
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # SLA settings (in minutes)
    target_sla_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    warning_sla_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Configuration stored as JSON
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Foreign keys
    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id"),
        nullable=False,
    )
    owner_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    # Relationships
    department: Mapped["Department"] = relationship(
        "Department",
        back_populates="processes",
    )
    owner: Mapped["User | None"] = relationship("User", foreign_keys=[owner_id])
    workflows: Mapped[list["Workflow"]] = relationship(
        "Workflow",
        back_populates="process",
    )


# Import for type hints
from app.models.department import Department
from app.models.user import User
from app.models.workflow import Workflow
