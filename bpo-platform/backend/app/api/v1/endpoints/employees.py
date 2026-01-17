"""Employee management endpoints."""

import logging
from uuid import UUID

from fastapi import APIRouter, HTTPException, status, Query
from sqlalchemy import select, and_
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession
from app.models.employee import Employee, EmployeeStatus
from app.schemas.employee import EmployeeCreate, EmployeeUpdate, EmployeeResponse, EmployeeDetailResponse

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("", response_model=list[EmployeeResponse])
async def list_employees(
    db: DBSession,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    department: str | None = None,
    campaign: str | None = None,
    status: str | None = None,
    search: str | None = None,
):
    """List all employees with optional filtering."""
    query = select(Employee)

    if department:
        query = query.where(Employee.department == department)
    if campaign:
        query = query.where(Employee.campaign == campaign)
    if status:
        query = query.where(Employee.status == status)
    if search:
        query = query.where(
            (Employee.first_name.ilike(f"%{search}%")) |
            (Employee.last_name.ilike(f"%{search}%")) |
            (Employee.email.ilike(f"%{search}%"))
        )

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    return result.scalars().all()


@router.post("", response_model=EmployeeDetailResponse, status_code=status.HTTP_201_CREATED)
async def create_employee(
    request: EmployeeCreate,
    db: DBSession,
):
    """Create a new employee."""
    try:
        logger.info(f"Creating employee: {request.first_name} {request.last_name} ({request.email})")
        
        # Check if email already exists
        existing = await db.execute(
            select(Employee).where(Employee.email == request.email)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )

        # Verify manager exists if provided
        if request.manager_id:
            manager = await db.execute(
                select(Employee).where(Employee.id == request.manager_id)
            )
            if not manager.scalar_one_or_none():
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Manager not found",
                )

        # Convert request to employee model
        employee = Employee(**request.model_dump())
        db.add(employee)
        await db.flush()

        # Load relationships
        await db.refresh(employee, ["manager", "subordinates"])
        logger.info(f"Employee created successfully: {employee.id}")
        return employee
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating employee: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create employee: {str(e)}"
        )


@router.get("/{employee_id}", response_model=EmployeeDetailResponse)
async def get_employee(
    employee_id: UUID,
    db: DBSession,
):
    """Get employee details."""
    result = await db.execute(
        select(Employee)
        .where(Employee.id == employee_id)
        .options(
            selectinload(Employee.manager),
            selectinload(Employee.subordinates),
        )
    )
    employee = result.scalar_one_or_none()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    return employee


@router.put("/{employee_id}", response_model=EmployeeDetailResponse)
async def update_employee(
    employee_id: UUID,
    request: EmployeeUpdate,
    db: DBSession,
):
    """Update an employee."""
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id)
    )
    employee = result.scalar_one_or_none()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    # Check email uniqueness if changed
    if request.email and request.email != employee.email:
        existing = await db.execute(
            select(Employee).where(Employee.email == request.email)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )

    # Verify manager exists if provided
    if request.manager_id and request.manager_id != employee.manager_id:
        manager = await db.execute(
            select(Employee).where(Employee.id == request.manager_id)
        )
        if not manager.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Manager not found",
            )

    update_data = request.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(employee, key, value)

    db.add(employee)
    await db.flush()

    # Load relationships
    await db.refresh(employee, ["manager", "subordinates"])
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_employee(
    employee_id: UUID,
    db: DBSession,
):
    """Delete an employee."""
    result = await db.execute(
        select(Employee).where(Employee.id == employee_id)
    )
    employee = result.scalar_one_or_none()

    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Employee not found",
        )

    await db.delete(employee)


@router.get("/department/{department_name}", response_model=list[EmployeeResponse])
async def get_employees_by_department(
    department_name: str,
    db: DBSession,
):
    """Get all employees in a department."""
    result = await db.execute(
        select(Employee).where(Employee.department == department_name)
    )
    return result.scalars().all()


@router.get("/stats/summary", response_model=dict)
async def get_employee_stats(db: DBSession):
    """Get employee statistics."""
    result = await db.execute(select(Employee))
    employees = result.scalars().all()

    total = len(employees)
    active = len([e for e in employees if e.status == EmployeeStatus.ACTIVE])
    inactive = len([e for e in employees if e.status == EmployeeStatus.INACTIVE])
    on_leave = len([e for e in employees if e.status == EmployeeStatus.ON_LEAVE])

    departments = list(set(e.department for e in employees))
    campaigns = list(set(e.campaign for e in employees))

    return {
        "total": total,
        "active": active,
        "inactive": inactive,
        "on_leave": on_leave,
        "departments": departments,
        "campaigns": campaigns,
    }
