from typing import List, Optional

from sqlalchemy.orm import Mapped
from sqlmodel import Field, Relationship, SQLModel


class Organization(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True)
    description: Optional[str] = None

    users: Mapped[List["User"]] = Relationship(back_populates="organization")
    roles: Mapped[List["Role"]] = Relationship(back_populates="organization")
    initiatives: Mapped[List["Initiative"]] = Relationship(back_populates="organization")


class Role(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    description: Optional[str] = None
    organization_id: int = Field(foreign_key="organization.id")

    organization: Optional[Organization] = Relationship(back_populates="roles")
    users: Mapped[List["User"]] = Relationship(back_populates="role")


class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(index=True, unique=True)
    full_name: str
    hashed_password: str
    organization_id: int = Field(foreign_key="organization.id")
    role_id: Optional[int] = Field(default=None, foreign_key="role.id")

    organization: Optional[Organization] = Relationship(back_populates="users")
    role: Optional[Role] = Relationship(back_populates="users")


class Initiative(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    status: str = Field(default="draft")
    metric: Optional[str] = None
    owner_id: Optional[int] = Field(default=None, foreign_key="user.id")
    organization_id: int = Field(foreign_key="organization.id")

    organization: Optional[Organization] = Relationship(back_populates="initiatives")


class Employee(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_no: str = Field(index=True, unique=True)
    first_name: str
    last_name: str
    campaign: str
    date_of_joining: str
    last_working_date: Optional[str] = None
    status: str = Field(default="active")
    client_email: str
    phone_no: Optional[str] = None
    personal_email: Optional[str] = None
    emergency_name: Optional[str] = None
    emergency_phone: Optional[str] = None
    organization_id: int = Field(foreign_key="organization.id")

    organization: Optional[Organization] = Relationship()


class Schedule(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    date: str
    shift_start: str
    shift_end: str
    campaign: str
    status: str = Field(default="scheduled")


class DTR(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    employee_id: int = Field(foreign_key="employee.id")
    date: str
    time_in: Optional[str] = None
    time_out: Optional[str] = None
    status: str = Field(default="present")
    remarks: Optional[str] = None
