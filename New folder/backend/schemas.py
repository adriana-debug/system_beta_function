from typing import List, Optional

from pydantic import BaseModel, EmailStr


# SCHEDULE & DTR
class ScheduleCreate(BaseModel):
    employee_id: int
    date: str
    shift_start: str
    shift_end: str
    campaign: str
    status: str = "scheduled"

class ScheduleRead(BaseModel):
    id: int
    employee_id: int
    date: str
    shift_start: str
    shift_end: str
    campaign: str
    status: str

    class Config:
        from_attributes = True

class DTRCreate(BaseModel):
    employee_id: int
    date: str
    time_in: str
    time_out: str
    status: str = "present"
    remarks: str = None

class DTRRead(BaseModel):
    id: int
    employee_id: int
    date: str
    time_in: str
    time_out: str
    status: str
    remarks: str = None

    class Config:
        from_attributes = True



class OrganizationCreate(BaseModel):
    name: str
    description: Optional[str] = None


class RoleCreate(BaseModel):
    name: str
    description: Optional[str] = None
    organization_id: int


class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    organization_id: int
    role_id: Optional[int] = None


class UserRead(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    organization_id: int
    role_id: Optional[int]

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class InitiativeCreate(BaseModel):
    name: str
    status: Optional[str] = None
    metric: Optional[str] = None
    organization_id: int
    owner_id: Optional[int] = None


class AIChartPoint(BaseModel):
    label: str
    value: float


class AIPromptRequest(BaseModel):
    prompt: str
    workspace: Optional[str] = None
    data_points: Optional[List[AIChartPoint]] = None


class AIPromptResponse(BaseModel):
    summary: str
    insights: List[str]
    chart: List[AIChartPoint]


class EmployeeCreate(BaseModel):
    employee_no: str
    first_name: str
    last_name: str
    campaign: str
    date_of_joining: str
    last_working_date: Optional[str] = None
    status: str = "active"
    client_email: str
    phone_no: Optional[str] = None
    personal_email: Optional[str] = None
    emergency_name: Optional[str] = None
    emergency_phone: Optional[str] = None
    organization_id: int


class EmployeeRead(BaseModel):
    id: int
    employee_no: str
    first_name: str
    last_name: str
    campaign: str
    date_of_joining: str
    last_working_date: Optional[str]
    status: str
    client_email: str
    phone_no: Optional[str]
    personal_email: Optional[str]
    emergency_name: Optional[str]
    emergency_phone: Optional[str]
    organization_id: int

    class Config:
        from_attributes = True


class EmployeeUpdate(BaseModel):
    employee_no: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    campaign: Optional[str] = None
    date_of_joining: Optional[str] = None
    last_working_date: Optional[str] = None
    status: Optional[str] = None
    client_email: Optional[str] = None
    phone_no: Optional[str] = None
    personal_email: Optional[str] = None
    emergency_name: Optional[str] = None
    emergency_phone: Optional[str] = None
