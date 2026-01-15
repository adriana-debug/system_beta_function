import csv
import hashlib
import json
import os
from typing import List
from io import BytesIO, StringIO

import google.generativeai as genai
from fastapi import Depends, FastAPI, HTTPException, status, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from sqlmodel import Session, select

from database import get_session, init_db
from models import Employee, Initiative, Organization, Role, User, Schedule, DTR
from schemas import (
    AIPromptRequest,
    AIPromptResponse,
    EmployeeCreate,
    EmployeeRead,
    EmployeeUpdate,
    InitiativeCreate,
    LoginRequest,
    OrganizationCreate,
    RoleCreate,
    UserCreate,
    UserRead,
    ScheduleRead,
    DTRRead,
)
from bulk_schedule_upload import process_bulk_schedule

app = FastAPI(title="Opex 360 API", version="0.1.0")

frontend_origin = os.getenv("FRONTEND_ORIGIN", "*")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_origin, "http://localhost:5173", "http://localhost:4173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


@app.on_event("startup")
def on_startup() -> None:
    init_db()
    try:
        from seed import seed_data
        seed_data()
    except Exception as exc:
        print(f"Seed error (non-critical): {exc}")


def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed


def get_user_by_email(session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    return session.exec(statement).first()


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/auth/signup", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def signup(payload: UserCreate, session: Session = Depends(get_session)) -> UserRead:
    organization = session.get(Organization, payload.organization_id)
    if not organization:
        raise HTTPException(status_code=404, detail="Organization not found")

    existing = get_user_by_email(session, payload.email)
    if existing:
        raise HTTPException(status_code=400, detail="User already exists")

    user = User(
        email=payload.email,
        full_name=payload.full_name,
        hashed_password=hash_password(payload.password),
        organization_id=payload.organization_id,
        role_id=payload.role_id,
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


@app.post("/auth/login")
def login(payload: LoginRequest, session: Session = Depends(get_session)) -> dict[str, str]:
    user = get_user_by_email(session, payload.email)
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return {"message": "login successful", "user_id": str(user.id)}


@app.post("/organizations", response_model=Organization)
def create_organization(payload: OrganizationCreate, session: Session = Depends(get_session)) -> Organization:
    org = Organization(name=payload.name, description=payload.description)
    session.add(org)
    session.commit()
    session.refresh(org)
    return org


@app.get("/organizations", response_model=List[Organization])
def list_organizations(session: Session = Depends(get_session)) -> List[Organization]:
    return session.exec(select(Organization)).all()


@app.post("/roles", response_model=Role)
def create_role(payload: RoleCreate, session: Session = Depends(get_session)) -> Role:
    org = session.get(Organization, payload.organization_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    role = Role(
        name=payload.name,
        description=payload.description,
        organization_id=payload.organization_id,
    )
    session.add(role)
    session.commit()
    session.refresh(role)
    return role


@app.get("/roles", response_model=List[Role])
def list_roles(session: Session = Depends(get_session)) -> List[Role]:
    return session.exec(select(Role)).all()


@app.post("/users", response_model=UserRead)
def create_user(payload: UserCreate, session: Session = Depends(get_session)) -> UserRead:
    return signup(payload, session)


@app.get("/users", response_model=List[UserRead])
def list_users(session: Session = Depends(get_session)) -> List[UserRead]:
    return session.exec(select(User)).all()


@app.post("/initiatives", response_model=Initiative, status_code=status.HTTP_201_CREATED)
def create_initiative(payload: InitiativeCreate, session: Session = Depends(get_session)) -> Initiative:
    org = session.get(Organization, payload.organization_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    initiative = Initiative(
        name=payload.name,
        status=payload.status or "draft",
        metric=payload.metric,
        organization_id=payload.organization_id,
        owner_id=payload.owner_id,
    )
    session.add(initiative)
    session.commit()
    session.refresh(initiative)
    return initiative


@app.get("/initiatives", response_model=List[Initiative])
def list_initiatives(session: Session = Depends(get_session)) -> List[Initiative]:
    return session.exec(select(Initiative)).all()


@app.post("/employees", response_model=EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(payload: EmployeeCreate, session: Session = Depends(get_session)) -> EmployeeRead:
    org = session.get(Organization, payload.organization_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    existing = session.exec(select(Employee).where(Employee.employee_no == payload.employee_no)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Employee with this employee_no already exists")

    employee = Employee(**payload.model_dump())
    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@app.get("/employees", response_model=List[EmployeeRead])
def list_employees(org_id: int | None = None, session: Session = Depends(get_session)) -> List[EmployeeRead]:
    query = select(Employee)
    if org_id:
        query = query.where(Employee.organization_id == org_id)
    return session.exec(query).all()


@app.get("/employees/{employee_id}", response_model=EmployeeRead)
def get_employee(employee_id: int, session: Session = Depends(get_session)) -> EmployeeRead:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee


@app.patch("/employees/{employee_id}", response_model=EmployeeRead)
def update_employee(
    employee_id: int, payload: EmployeeUpdate, session: Session = Depends(get_session)
) -> EmployeeRead:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(employee, field, value)

    session.add(employee)
    session.commit()
    session.refresh(employee)
    return employee


@app.delete("/employees/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, session: Session = Depends(get_session)) -> None:
    employee = session.get(Employee, employee_id)
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    session.delete(employee)
    session.commit()


# --- Schedule Endpoints ---
@app.get("/schedules", response_model=List[ScheduleRead])
def list_schedules(employee_id: int | None = None, session: Session = Depends(get_session)) -> List[ScheduleRead]:
    query = select(Schedule)
    if employee_id:
        query = query.where(Schedule.employee_id == employee_id)
    return session.exec(query).all()


# --- DTR Endpoints ---
@app.get("/dtr", response_model=List[DTRRead])
def list_dtr(employee_id: int | None = None, session: Session = Depends(get_session)) -> List[DTRRead]:
    query = select(DTR)
    if employee_id:
        query = query.where(DTR.employee_id == employee_id)
    return session.exec(query).all()


# --- Bulk Schedule Upload Endpoint ---
@app.post("/bulk-upload-schedule")
async def bulk_upload_schedule(file: UploadFile = File(...), session: Session = Depends(get_session)):
    csv_content = (await file.read()).decode()
    employees = session.exec(select(Employee)).all()
    employee_lookup = {e.employee_no: e.id for e in employees}
    records = process_bulk_schedule(csv_content, employee_lookup)
    schedules = []
    for rec in records:
        schedules.append(Schedule(
            employee_id=rec["employee_id"],
            date=rec["work_date"],
            shift_start=rec["start_time"],
            shift_end=rec["end_time"],
            campaign="",
            status="scheduled"
        ))
    session.add_all(schedules)
    session.commit()
    return {"inserted": len(schedules)}


# --- Download Schedule Template ---
@app.get("/download-schedule-template")
def download_schedule_template():
    headers = ["employee_code", "start_date", "end_date", "shift_code"]
    sample_data = [
        ["EMP1001", "2026-01-12", "2026-01-16", "a2307"],
        ["EMP1002", "2026-01-12", "2026-01-16", "a0716"],
        ["EMP1003", "2026-01-12", "2026-01-16", "a1019"],
        ["EMP1004", "2026-01-12", "2026-01-16", "o"],
    ]

    output = StringIO()
    writer = csv.writer(output)
    writer.writerow(headers)
    writer.writerows(sample_data)

    csv_bytes = output.getvalue().encode("utf-8")
    return StreamingResponse(
        BytesIO(csv_bytes),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=schedule_template.csv"},
    )


def _fallback_ai_response(prompt: str) -> AIPromptResponse:
    synthetic_chart = [
        {"label": "W1", "value": 72.0},
        {"label": "W2", "value": 81.0},
        {"label": "W3", "value": 77.0},
        {"label": "W4", "value": 88.0},
    ]
    return AIPromptResponse(
        summary=f"No API key set. Synthetic insight for: {prompt}",
        insights=[
            "Utilization improved after schedule realignment.",
            "Escalation rate is below target; keep current staffing mix.",
            "QA coverage is stable; consider adding spot checks in week 4.",
        ],
        chart=synthetic_chart,
    )


def _call_gemini(payload: AIPromptRequest) -> AIPromptResponse:
    if not GEMINI_API_KEY:
        return _fallback_ai_response(payload.prompt)

    model = genai.GenerativeModel("gemini-2.0-flash")
    schema = genai.types.Schema(
        type=genai.types.Type.OBJECT,
        properties={
            "summary": genai.types.Schema(type=genai.types.Type.STRING),
            "insights": genai.types.Schema(
                type=genai.types.Type.ARRAY,
                items=genai.types.Schema(type=genai.types.Type.STRING),
            ),
            "chart": genai.types.Schema(
                type=genai.types.Type.ARRAY,
                items=genai.types.Schema(
                    type=genai.types.Type.OBJECT,
                    properties={
                        "label": genai.types.Schema(type=genai.types.Type.STRING),
                        "value": genai.types.Schema(type=genai.types.Type.NUMBER),
                    },
                ),
            ),
        },
        required=["summary", "insights", "chart"],
    )

    prompt = (
        "Act as an operational excellence analyst for a BPO. "
        "Provide concise JSON with a summary, three bullet insights, and chart values (0-100). "
        f"Workspace: {payload.workspace or 'Operations'}. "
        f"Business prompt: {payload.prompt}. "
        f"Data points: {payload.data_points or []}"
    )

    response = model.generate_content(
        contents=prompt,
        generation_config=genai.types.GenerationConfig(
            response_mime_type="application/json",
            response_schema=schema,
            temperature=0.4,
        ),
    )
    return AIPromptResponse(**json.loads(response.text))


@app.post("/ai/prompt", response_model=AIPromptResponse)
def ai_prompt(payload: AIPromptRequest) -> AIPromptResponse:
    try:
        return _call_gemini(payload)
    except Exception as exc:  # pragma: no cover - defensive logging
        return _fallback_ai_response(f"{payload.prompt} (fallback due to: {exc})")
