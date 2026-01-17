"""Workflow models for multi-step process management."""

import uuid
from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class WorkflowStatus(str, Enum):
    """Workflow definition status."""

    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"


class TaskStatus(str, Enum):
    """Task instance status."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    SKIPPED = "skipped"
    FAILED = "failed"
    CANCELLED = "cancelled"


class AssignmentRule(str, Enum):
    """Task assignment rules."""

    MANUAL = "manual"
    ROUND_ROBIN = "round_robin"
    LEAST_LOADED = "least_loaded"
    SPECIFIC_USER = "specific_user"
    ROLE_BASED = "role_based"


class Workflow(BaseModel):
    """Workflow definition model."""

    __tablename__ = "workflows"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[WorkflowStatus] = mapped_column(
        String(20),
        default=WorkflowStatus.DRAFT,
        nullable=False,
    )
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Foreign keys
    process_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("processes.id"),
        nullable=False,
    )

    # Relationships
    process: Mapped["Process"] = relationship("Process", back_populates="workflows")
    stages: Mapped[list["WorkflowStage"]] = relationship(
        "WorkflowStage",
        back_populates="workflow",
        order_by="WorkflowStage.order",
        cascade="all, delete-orphan",
    )
    instances: Mapped[list["WorkflowInstance"]] = relationship(
        "WorkflowInstance",
        back_populates="workflow",
    )


class WorkflowStage(BaseModel):
    """Workflow stage/step definition."""

    __tablename__ = "workflow_stages"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    order: Mapped[int] = mapped_column(Integer, nullable=False)
    is_required: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Assignment configuration
    assignment_rule: Mapped[AssignmentRule] = mapped_column(
        String(30),
        default=AssignmentRule.MANUAL,
        nullable=False,
    )
    assigned_role_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("roles.id"),
        nullable=True,
    )
    assigned_user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    # SLA for this stage (in minutes)
    sla_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)

    # Stage configuration
    config: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Foreign keys
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workflows.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Relationships
    workflow: Mapped["Workflow"] = relationship("Workflow", back_populates="stages")
    assigned_role: Mapped["Role | None"] = relationship(
        "Role",
        foreign_keys=[assigned_role_id],
    )
    assigned_user: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[assigned_user_id],
    )


class WorkflowInstance(BaseModel):
    """Running instance of a workflow."""

    __tablename__ = "workflow_instances"

    reference_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        nullable=False,
    )
    status: Mapped[TaskStatus] = mapped_column(
        String(20),
        default=TaskStatus.PENDING,
        nullable=False,
    )
    priority: Mapped[int] = mapped_column(Integer, default=5, nullable=False)

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    due_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Data payload
    data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Current stage tracking
    current_stage_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workflow_stages.id"),
        nullable=True,
    )

    # Foreign keys
    workflow_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workflows.id"),
        nullable=False,
    )

    # Relationships
    workflow: Mapped["Workflow"] = relationship(
        "Workflow",
        back_populates="instances",
    )
    current_stage: Mapped["WorkflowStage | None"] = relationship(
        "WorkflowStage",
        foreign_keys=[current_stage_id],
    )
    tasks: Mapped[list["WorkflowTask"]] = relationship(
        "WorkflowTask",
        back_populates="instance",
        cascade="all, delete-orphan",
    )


class WorkflowTask(BaseModel):
    """Individual task within a workflow instance."""

    __tablename__ = "workflow_tasks"

    status: Mapped[TaskStatus] = mapped_column(
        String(20),
        default=TaskStatus.PENDING,
        nullable=False,
    )

    # Assignment
    assigned_to_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    # Timing
    started_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    due_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # SLA tracking
    sla_breached: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Task data and notes
    data: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    # Foreign keys
    instance_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workflow_instances.id", ondelete="CASCADE"),
        nullable=False,
    )
    stage_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("workflow_stages.id"),
        nullable=False,
    )

    # Relationships
    instance: Mapped["WorkflowInstance"] = relationship(
        "WorkflowInstance",
        back_populates="tasks",
    )
    stage: Mapped["WorkflowStage"] = relationship("WorkflowStage")
    assigned_to: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[assigned_to_id],
    )


# Import for type hints
from app.models.process import Process
from app.models.user import User, Role
