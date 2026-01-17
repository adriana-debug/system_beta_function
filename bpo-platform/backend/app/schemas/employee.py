"""Employee schemas for request/response validation."""

from datetime import datetime
from uuid import UUID
from typing import Optional, Literal

from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator

from app.models.employee import EmployeeStatus


class EmployeeBase(BaseModel):
    """Base employee schema."""

    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: Optional[str] = None
    position: Optional[str] = None
    department: str = Field(..., min_length=1)
    campaign: str = Field(..., min_length=1)
    status: Literal["active", "inactive", "on_leave"] = "active"
    join_date: Optional[datetime | str] = None
    manager_id: Optional[str | UUID] = None  # Accept both string and UUID
    notes: Optional[str] = None

    @field_validator('manager_id', mode='before')
    @classmethod
    def parse_manager_id(cls, v):
        """Convert empty strings and invalid values to None."""
        if v is None or v == '' or v == 'null':
            return None
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return None
            # Try to validate it's a valid UUID format
            try:
                UUID(v)
            except (ValueError, AttributeError):
                # If not valid UUID, return None instead of raising
                return None
        return v

    @field_validator('join_date', mode='before')
    @classmethod
    def parse_join_date(cls, v):
        if v is None or v == '':
            return None
        if isinstance(v, str):
            try:
                # Handle ISO format strings
                return datetime.fromisoformat(v.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                return None
        return v

    @model_validator(mode='after')
    def convert_manager_id_to_uuid(self):
        """Convert manager_id string to UUID if valid."""
        if self.manager_id and isinstance(self.manager_id, str):
            try:
                self.manager_id = UUID(self.manager_id)
            except (ValueError, AttributeError):
                self.manager_id = None
        return self


class EmployeeCreate(EmployeeBase):
    """Schema for creating employees."""

    pass


class EmployeeUpdate(BaseModel):
    """Schema for updating employees."""

    first_name: str | None = None
    last_name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    position: str | None = None
    department: str | None = None
    campaign: str | None = None
    status: str | None = None
    join_date: datetime | None = None
    manager_id: UUID | None = None
    notes: str | None = None


class EmployeeResponse(EmployeeBase):
    """Schema for employee responses."""

    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class EmployeeDetailResponse(EmployeeResponse):
    """Detailed employee response with relationships."""

    manager: "EmployeeResponse | None" = None
    subordinates: list["EmployeeResponse"] = []

    class Config:
        from_attributes = True


# Update forward references
EmployeeDetailResponse.model_rebuild()
