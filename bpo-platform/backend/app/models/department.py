"""Department models with hierarchy support."""

import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import BaseModel


class Department(BaseModel):
    """Department model with hierarchical structure."""

    __tablename__ = "departments"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Hierarchical structure
    parent_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id"),
        nullable=True,
    )

    # Manager
    manager_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
    )

    # Relationships
    parent: Mapped["Department | None"] = relationship(
        "Department",
        remote_side="Department.id",
        back_populates="children",
    )
    children: Mapped[list["Department"]] = relationship(
        "Department",
        back_populates="parent",
    )
    manager: Mapped["User | None"] = relationship(
        "User",
        foreign_keys=[manager_id],
    )
    user_assignments: Mapped[list["DepartmentUser"]] = relationship(
        "DepartmentUser",
        back_populates="department",
        cascade="all, delete-orphan",
    )
    processes: Mapped[list["Process"]] = relationship(
        "Process",
        back_populates="department",
    )

    @property
    def users(self) -> list["User"]:
        return [assignment.user for assignment in self.user_assignments]


class DepartmentUser(BaseModel):
    """Many-to-many relationship between Department and User."""

    __tablename__ = "department_users"
    __table_args__ = (
        UniqueConstraint("department_id", "user_id", name="uq_department_user"),
    )

    department_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("departments.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )
    is_primary: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )

    # Relationships
    department: Mapped["Department"] = relationship(
        "Department",
        back_populates="user_assignments",
    )
    user: Mapped["User"] = relationship(
        "User",
        back_populates="department_assignments",
    )


# Import for type hints
from app.models.user import User
from app.models.process import Process
