"""Process schemas."""

from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field

from app.models.process import ProcessStatus
from app.schemas.common import BaseSchema


class ProcessCreate(BaseModel):
    """Create process schema."""

    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=50)
    description: str | None = None
    department_id: UUID
    owner_id: UUID | None = None
    target_sla_minutes: int | None = Field(default=None, ge=1)
    warning_sla_minutes: int | None = Field(default=None, ge=1)
    config: dict[str, Any] | None = None


class ProcessUpdate(BaseModel):
    """Update process schema."""

    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    status: ProcessStatus | None = None
    owner_id: UUID | None = None
    target_sla_minutes: int | None = Field(default=None, ge=1)
    warning_sla_minutes: int | None = Field(default=None, ge=1)
    config: dict[str, Any] | None = None


class DepartmentSummary(BaseSchema):
    """Brief department info."""

    id: UUID
    name: str
    code: str


class OwnerSummary(BaseSchema):
    """Brief owner info."""

    id: UUID
    email: str
    full_name: str


class ProcessResponse(BaseSchema):
    """Process response schema."""

    id: UUID
    name: str
    code: str
    description: str | None
    status: ProcessStatus
    version: int
    target_sla_minutes: int | None
    warning_sla_minutes: int | None
    config: dict[str, Any] | None
    department: DepartmentSummary
    owner: OwnerSummary | None
    workflow_count: int = 0
    created_at: datetime
    updated_at: datetime


class ProcessListResponse(BaseSchema):
    """Process list item."""

    id: UUID
    name: str
    code: str
    status: ProcessStatus
    department_name: str
    owner_name: str | None
    workflow_count: int = 0
    created_at: datetime
