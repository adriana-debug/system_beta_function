"""Department schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field

from app.schemas.common import BaseSchema
from app.schemas.user import UserListResponse


class DepartmentCreate(BaseModel):
    """Create department schema."""

    name: str = Field(..., min_length=2, max_length=200)
    code: str = Field(..., min_length=2, max_length=50)
    description: str | None = None
    parent_id: UUID | None = None
    manager_id: UUID | None = None
    is_active: bool = True


class DepartmentUpdate(BaseModel):
    """Update department schema."""

    name: str | None = Field(default=None, min_length=2, max_length=200)
    description: str | None = None
    parent_id: UUID | None = None
    manager_id: UUID | None = None
    is_active: bool | None = None


class DepartmentUserAssign(BaseModel):
    """Assign user to department."""

    user_id: UUID
    is_primary: bool = False


class DepartmentUserResponse(BaseSchema):
    """User assignment response."""

    user_id: UUID
    user_email: str
    user_name: str
    is_primary: bool
    assigned_at: datetime


class DepartmentSummary(BaseSchema):
    """Brief department info."""

    id: UUID
    name: str
    code: str


class ManagerSummary(BaseSchema):
    """Brief manager info."""

    id: UUID
    email: str
    full_name: str


class DepartmentResponse(BaseSchema):
    """Department response schema."""

    id: UUID
    name: str
    code: str
    description: str | None
    is_active: bool
    parent_id: UUID | None
    parent: DepartmentSummary | None = None
    manager: ManagerSummary | None = None
    user_count: int = 0
    created_at: datetime
    updated_at: datetime


class DepartmentListResponse(BaseSchema):
    """Department list item."""

    id: UUID
    name: str
    code: str
    is_active: bool
    parent_id: UUID | None
    parent_name: str | None = None
    manager_name: str | None = None
    user_count: int = 0
    created_at: datetime


class DepartmentDetailResponse(DepartmentResponse):
    """Detailed department response with users."""

    children: list[DepartmentSummary] = Field(default_factory=list)
    users: list[DepartmentUserResponse] = Field(default_factory=list)


class DepartmentTreeNode(BaseSchema):
    """Department tree node for hierarchy display."""

    id: UUID
    name: str
    code: str
    is_active: bool
    manager_name: str | None = None
    user_count: int = 0
    children: list["DepartmentTreeNode"] = Field(default_factory=list)


# Enable self-referencing
DepartmentTreeNode.model_rebuild()
