"""User and Role schemas."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import BaseSchema


# Permission schemas
class PermissionResponse(BaseSchema):
    """Permission response schema."""

    id: UUID
    name: str
    code: str
    description: str | None
    module: str


# Role schemas
class RoleCreate(BaseModel):
    """Create role schema."""

    name: str = Field(..., min_length=2, max_length=100)
    code: str = Field(..., min_length=2, max_length=50)
    description: str | None = None
    permission_ids: list[UUID] = Field(default_factory=list)


class RoleUpdate(BaseModel):
    """Update role schema."""

    name: str | None = Field(default=None, min_length=2, max_length=100)
    description: str | None = None
    permission_ids: list[UUID] | None = None


class RoleResponse(BaseSchema):
    """Role response schema."""

    id: UUID
    name: str
    code: str
    description: str | None
    is_system: bool
    permissions: list[PermissionResponse] = Field(default_factory=list)
    created_at: datetime


class RoleSummary(BaseSchema):
    """Brief role info for user responses."""

    id: UUID
    name: str
    code: str


# User schemas
class UserCreate(BaseModel):
    """Create user schema."""

    email: EmailStr
    password: str = Field(..., min_length=8)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    employee_id: str | None = Field(default=None, max_length=50)
    phone: str | None = Field(default=None, max_length=20)
    role_id: UUID
    is_active: bool = True


class UserUpdate(BaseModel):
    """Update user schema."""

    email: EmailStr | None = None
    first_name: str | None = Field(default=None, max_length=100)
    last_name: str | None = Field(default=None, max_length=100)
    employee_id: str | None = Field(default=None, max_length=50)
    phone: str | None = Field(default=None, max_length=20)
    avatar_url: str | None = None
    role_id: UUID | None = None
    is_active: bool | None = None


class UserResponse(BaseSchema):
    """User response schema."""

    id: UUID
    email: str
    first_name: str
    last_name: str
    full_name: str
    employee_id: str | None
    phone: str | None
    avatar_url: str | None
    is_active: bool
    is_superuser: bool
    last_login: datetime | None
    role: RoleSummary
    created_at: datetime
    updated_at: datetime


class UserListResponse(BaseSchema):
    """Simplified user response for lists."""

    id: UUID
    email: str
    first_name: str
    last_name: str
    full_name: str
    employee_id: str | None
    is_active: bool
    role: RoleSummary
    created_at: datetime


class CurrentUserResponse(UserResponse):
    """Current user response with permissions."""

    permissions: list[str] = Field(default_factory=list)
