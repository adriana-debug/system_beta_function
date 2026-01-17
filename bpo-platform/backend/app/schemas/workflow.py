"""Workflow schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.workflow import (
    WorkflowStatus,
    TaskStatus,
    AssignmentRule,
)
from app.schemas.common import BaseSchema


# Stage schemas
class WorkflowStageCreate(BaseModel):
    """Create workflow stage schema."""

    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=50)
    description: str | None = None
    order: int = Field(..., ge=0)
    is_required: bool = True
    assignment_rule: AssignmentRule = AssignmentRule.MANUAL
    assigned_role_id: UUID | None = None
    assigned_user_id: UUID | None = None
    sla_minutes: int | None = Field(default=None, ge=1)
    config: dict[str, Any] | None = None


class WorkflowStageUpdate(BaseModel):
    """Update workflow stage schema."""

    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    order: int | None = Field(default=None, ge=0)
    is_required: bool | None = None
    assignment_rule: AssignmentRule | None = None
    assigned_role_id: UUID | None = None
    assigned_user_id: UUID | None = None
    sla_minutes: int | None = Field(default=None, ge=1)
    config: dict[str, Any] | None = None


class WorkflowStageResponse(BaseSchema):
    """Workflow stage response."""

    id: UUID
    name: str
    code: str
    description: str | None
    order: int
    is_required: bool
    assignment_rule: AssignmentRule
    assigned_role_id: UUID | None
    assigned_user_id: UUID | None
    sla_minutes: int | None
    config: dict[str, Any] | None


# Workflow schemas
class WorkflowCreate(BaseModel):
    """Create workflow schema."""

    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=50)
    description: str | None = None
    process_id: UUID
    stages: list[WorkflowStageCreate] = Field(default_factory=list)


class WorkflowUpdate(BaseModel):
    """Update workflow schema."""

    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    status: WorkflowStatus | None = None


class ProcessSummary(BaseSchema):
    """Brief process info."""

    id: UUID
    name: str
    code: str


class WorkflowResponse(BaseSchema):
    """Workflow response schema."""

    id: UUID
    name: str
    code: str
    description: str | None
    status: WorkflowStatus
    version: int
    process: ProcessSummary
    stages: list[WorkflowStageResponse] = Field(default_factory=list)
    instance_count: int = 0
    created_at: datetime
    updated_at: datetime


class WorkflowListResponse(BaseSchema):
    """Workflow list item."""

    id: UUID
    name: str
    code: str
    status: WorkflowStatus
    process_name: str
    stage_count: int = 0
    instance_count: int = 0
    created_at: datetime


# Instance schemas
class WorkflowInstanceCreate(BaseModel):
    """Create workflow instance schema."""

    workflow_id: UUID
    priority: int = Field(default=5, ge=1, le=10)
    data: dict[str, Any] | None = None
    due_at: datetime | None = None


class AssignedUserSummary(BaseSchema):
    """Brief assigned user info."""

    id: UUID
    email: str
    full_name: str


class WorkflowTaskResponse(BaseSchema):
    """Workflow task response."""

    id: UUID
    stage_id: UUID
    stage_name: str
    stage_order: int
    status: TaskStatus
    assigned_to: AssignedUserSummary | None
    started_at: datetime | None
    completed_at: datetime | None
    due_at: datetime | None
    sla_breached: bool
    notes: str | None


class WorkflowInstanceResponse(BaseSchema):
    """Workflow instance response."""

    id: UUID
    reference_number: str
    workflow_id: UUID
    workflow_name: str
    status: TaskStatus
    priority: int
    current_stage_id: UUID | None
    current_stage_name: str | None
    started_at: datetime | None
    completed_at: datetime | None
    due_at: datetime | None
    data: dict[str, Any] | None
    tasks: list[WorkflowTaskResponse] = Field(default_factory=list)
    created_at: datetime


class WorkflowInstanceListResponse(BaseSchema):
    """Workflow instance list item."""

    id: UUID
    reference_number: str
    workflow_name: str
    status: TaskStatus
    priority: int
    current_stage_name: str | None
    started_at: datetime | None
    due_at: datetime | None
    sla_breached: bool = False
    created_at: datetime


class WorkflowTaskUpdate(BaseModel):
    """Update workflow task schema."""

    status: TaskStatus | None = None
    assigned_to_id: UUID | None = None
    notes: str | None = None
    data: dict[str, Any] | None = None
