"""Process management endpoints."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession, CurrentUser, SuperUser
from app.models.process import Process, ProcessStatus
from app.models.workflow import Workflow
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.process import (
    ProcessCreate,
    ProcessUpdate,
    ProcessResponse,
    ProcessListResponse,
)

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ProcessListResponse])
async def list_processes(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    status: ProcessStatus | None = None,
    department_id: UUID | None = None,
):
    """List all processes with pagination."""
    query = (
        select(Process)
        .options(
            selectinload(Process.department),
            selectinload(Process.owner),
            selectinload(Process.workflows),
        )
        .where(Process.is_deleted == False)
    )

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Process.name.ilike(search_filter))
            | (Process.code.ilike(search_filter))
        )

    if status:
        query = query.where(Process.status == status)

    if department_id:
        query = query.where(Process.department_id == department_id)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Process.created_at.desc())

    result = await db.execute(query)
    processes = result.scalars().all()

    items = [
        ProcessListResponse(
            id=proc.id,
            name=proc.name,
            code=proc.code,
            status=proc.status,
            department_name=proc.department.name,
            owner_name=proc.owner.full_name if proc.owner else None,
            workflow_count=len(proc.workflows),
            created_at=proc.created_at,
        )
        for proc in processes
    ]

    return PaginatedResponse.create(items, total, page, page_size)


@router.post("", response_model=ProcessResponse, status_code=status.HTTP_201_CREATED)
async def create_process(
    process_in: ProcessCreate,
    db: DBSession,
    current_user: SuperUser,
):
    """Create a new process."""
    # Check code uniqueness
    existing = await db.execute(
        select(Process).where(Process.code == process_in.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Process code already exists",
        )

    process = Process(
        name=process_in.name,
        code=process_in.code,
        description=process_in.description,
        department_id=process_in.department_id,
        owner_id=process_in.owner_id,
        target_sla_minutes=process_in.target_sla_minutes,
        warning_sla_minutes=process_in.warning_sla_minutes,
        config=process_in.config,
        created_by=current_user.id,
    )

    db.add(process)
    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(Process)
        .options(
            selectinload(Process.department),
            selectinload(Process.owner),
            selectinload(Process.workflows),
        )
        .where(Process.id == process.id)
    )
    process = result.scalar_one()

    return ProcessResponse(
        id=process.id,
        name=process.name,
        code=process.code,
        description=process.description,
        status=process.status,
        version=process.version,
        target_sla_minutes=process.target_sla_minutes,
        warning_sla_minutes=process.warning_sla_minutes,
        config=process.config,
        department={
            "id": process.department.id,
            "name": process.department.name,
            "code": process.department.code,
        },
        owner=(
            {"id": process.owner.id, "email": process.owner.email, "full_name": process.owner.full_name}
            if process.owner
            else None
        ),
        workflow_count=len(process.workflows),
        created_at=process.created_at,
        updated_at=process.updated_at,
    )


@router.get("/{process_id}", response_model=ProcessResponse)
async def get_process(
    process_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get process by ID."""
    result = await db.execute(
        select(Process)
        .options(
            selectinload(Process.department),
            selectinload(Process.owner),
            selectinload(Process.workflows),
        )
        .where(Process.id == process_id)
        .where(Process.is_deleted == False)
    )
    process = result.scalar_one_or_none()

    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found",
        )

    return ProcessResponse(
        id=process.id,
        name=process.name,
        code=process.code,
        description=process.description,
        status=process.status,
        version=process.version,
        target_sla_minutes=process.target_sla_minutes,
        warning_sla_minutes=process.warning_sla_minutes,
        config=process.config,
        department={
            "id": process.department.id,
            "name": process.department.name,
            "code": process.department.code,
        },
        owner=(
            {"id": process.owner.id, "email": process.owner.email, "full_name": process.owner.full_name}
            if process.owner
            else None
        ),
        workflow_count=len(process.workflows),
        created_at=process.created_at,
        updated_at=process.updated_at,
    )


@router.patch("/{process_id}", response_model=ProcessResponse)
async def update_process(
    process_id: UUID,
    process_in: ProcessUpdate,
    db: DBSession,
    current_user: SuperUser,
):
    """Update process."""
    result = await db.execute(
        select(Process)
        .options(
            selectinload(Process.department),
            selectinload(Process.owner),
            selectinload(Process.workflows),
        )
        .where(Process.id == process_id)
        .where(Process.is_deleted == False)
    )
    process = result.scalar_one_or_none()

    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found",
        )

    update_data = process_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(process, field, value)

    process.updated_by = current_user.id
    await db.commit()
    await db.refresh(process)

    return ProcessResponse(
        id=process.id,
        name=process.name,
        code=process.code,
        description=process.description,
        status=process.status,
        version=process.version,
        target_sla_minutes=process.target_sla_minutes,
        warning_sla_minutes=process.warning_sla_minutes,
        config=process.config,
        department={
            "id": process.department.id,
            "name": process.department.name,
            "code": process.department.code,
        },
        owner=(
            {"id": process.owner.id, "email": process.owner.email, "full_name": process.owner.full_name}
            if process.owner
            else None
        ),
        workflow_count=len(process.workflows),
        created_at=process.created_at,
        updated_at=process.updated_at,
    )


@router.delete("/{process_id}", response_model=MessageResponse)
async def delete_process(
    process_id: UUID,
    db: DBSession,
    current_user: SuperUser,
):
    """Soft delete process."""
    result = await db.execute(
        select(Process)
        .where(Process.id == process_id)
        .where(Process.is_deleted == False)
    )
    process = result.scalar_one_or_none()

    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found",
        )

    process.is_deleted = True
    process.deleted_at = datetime.now(timezone.utc)
    process.deleted_by = current_user.id
    await db.commit()

    return MessageResponse(message="Process deleted successfully")


@router.post("/{process_id}/activate", response_model=ProcessResponse)
async def activate_process(
    process_id: UUID,
    db: DBSession,
    current_user: SuperUser,
):
    """Activate a process."""
    result = await db.execute(
        select(Process)
        .options(
            selectinload(Process.department),
            selectinload(Process.owner),
            selectinload(Process.workflows),
        )
        .where(Process.id == process_id)
        .where(Process.is_deleted == False)
    )
    process = result.scalar_one_or_none()

    if not process:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Process not found",
        )

    process.status = ProcessStatus.ACTIVE
    process.updated_by = current_user.id
    await db.commit()

    return ProcessResponse(
        id=process.id,
        name=process.name,
        code=process.code,
        description=process.description,
        status=process.status,
        version=process.version,
        target_sla_minutes=process.target_sla_minutes,
        warning_sla_minutes=process.warning_sla_minutes,
        config=process.config,
        department={
            "id": process.department.id,
            "name": process.department.name,
            "code": process.department.code,
        },
        owner=(
            {"id": process.owner.id, "email": process.owner.email, "full_name": process.owner.full_name}
            if process.owner
            else None
        ),
        workflow_count=len(process.workflows),
        created_at=process.created_at,
        updated_at=process.updated_at,
    )
