"""Department management endpoints."""

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession, CurrentUser, SuperUser
from app.models.department import Department, DepartmentUser
from app.models.user import User
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentListResponse,
    DepartmentDetailResponse,
    DepartmentUserAssign,
    DepartmentUserResponse,
    DepartmentTreeNode,
)

router = APIRouter()


@router.get("", response_model=PaginatedResponse[DepartmentListResponse])
async def list_departments(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    is_active: bool | None = None,
    parent_id: UUID | None = None,
):
    """List all departments with pagination."""
    query = (
        select(Department)
        .options(
            selectinload(Department.parent),
            selectinload(Department.manager),
            selectinload(Department.user_assignments),
        )
        .where(Department.is_deleted == False)
    )

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Department.name.ilike(search_filter))
            | (Department.code.ilike(search_filter))
        )

    if is_active is not None:
        query = query.where(Department.is_active == is_active)

    if parent_id:
        query = query.where(Department.parent_id == parent_id)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Department.name)

    result = await db.execute(query)
    departments = result.scalars().all()

    items = [
        DepartmentListResponse(
            id=dept.id,
            name=dept.name,
            code=dept.code,
            is_active=dept.is_active,
            parent_id=dept.parent_id,
            parent_name=dept.parent.name if dept.parent else None,
            manager_name=dept.manager.full_name if dept.manager else None,
            user_count=len(dept.user_assignments),
            created_at=dept.created_at,
        )
        for dept in departments
    ]

    return PaginatedResponse.create(items, total, page, page_size)


@router.get("/tree", response_model=list[DepartmentTreeNode])
async def get_department_tree(
    db: DBSession,
    current_user: CurrentUser,
):
    """Get department hierarchy tree."""
    result = await db.execute(
        select(Department)
        .options(
            selectinload(Department.manager),
            selectinload(Department.user_assignments),
        )
        .where(Department.is_deleted == False)
        .where(Department.is_active == True)
        .order_by(Department.name)
    )
    all_departments = result.scalars().all()

    # Build tree structure
    dept_map = {dept.id: dept for dept in all_departments}
    root_nodes = []

    def build_node(dept: Department) -> DepartmentTreeNode:
        children = [
            build_node(d) for d in all_departments if d.parent_id == dept.id
        ]
        return DepartmentTreeNode(
            id=dept.id,
            name=dept.name,
            code=dept.code,
            is_active=dept.is_active,
            manager_name=dept.manager.full_name if dept.manager else None,
            user_count=len(dept.user_assignments),
            children=children,
        )

    for dept in all_departments:
        if dept.parent_id is None:
            root_nodes.append(build_node(dept))

    return root_nodes


@router.post("", response_model=DepartmentResponse, status_code=status.HTTP_201_CREATED)
async def create_department(
    dept_in: DepartmentCreate,
    db: DBSession,
    current_user: SuperUser,
):
    """Create a new department."""
    # Check code uniqueness
    existing = await db.execute(
        select(Department).where(Department.code == dept_in.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Department code already exists",
        )

    # Verify parent exists if provided
    if dept_in.parent_id:
        parent = await db.execute(
            select(Department).where(Department.id == dept_in.parent_id)
        )
        if not parent.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent department not found",
            )

    department = Department(
        name=dept_in.name,
        code=dept_in.code,
        description=dept_in.description,
        parent_id=dept_in.parent_id,
        manager_id=dept_in.manager_id,
        is_active=dept_in.is_active,
        created_by=current_user.id,
    )

    db.add(department)
    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(Department)
        .options(
            selectinload(Department.parent),
            selectinload(Department.manager),
            selectinload(Department.user_assignments),
        )
        .where(Department.id == department.id)
    )
    department = result.scalar_one()

    return DepartmentResponse(
        id=department.id,
        name=department.name,
        code=department.code,
        description=department.description,
        is_active=department.is_active,
        parent_id=department.parent_id,
        parent=(
            {"id": department.parent.id, "name": department.parent.name, "code": department.parent.code}
            if department.parent
            else None
        ),
        manager=(
            {"id": department.manager.id, "email": department.manager.email, "full_name": department.manager.full_name}
            if department.manager
            else None
        ),
        user_count=len(department.user_assignments),
        created_at=department.created_at,
        updated_at=department.updated_at,
    )


@router.get("/{department_id}", response_model=DepartmentDetailResponse)
async def get_department(
    department_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get department by ID with full details."""
    result = await db.execute(
        select(Department)
        .options(
            selectinload(Department.parent),
            selectinload(Department.manager),
            selectinload(Department.children),
            selectinload(Department.user_assignments).selectinload(DepartmentUser.user),
        )
        .where(Department.id == department_id)
        .where(Department.is_deleted == False)
    )
    department = result.scalar_one_or_none()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    return DepartmentDetailResponse(
        id=department.id,
        name=department.name,
        code=department.code,
        description=department.description,
        is_active=department.is_active,
        parent_id=department.parent_id,
        parent=(
            {"id": department.parent.id, "name": department.parent.name, "code": department.parent.code}
            if department.parent
            else None
        ),
        manager=(
            {"id": department.manager.id, "email": department.manager.email, "full_name": department.manager.full_name}
            if department.manager
            else None
        ),
        user_count=len(department.user_assignments),
        children=[
            {"id": child.id, "name": child.name, "code": child.code}
            for child in department.children
            if not child.is_deleted
        ],
        users=[
            DepartmentUserResponse(
                user_id=ua.user.id,
                user_email=ua.user.email,
                user_name=ua.user.full_name,
                is_primary=ua.is_primary,
                assigned_at=ua.assigned_at,
            )
            for ua in department.user_assignments
        ],
        created_at=department.created_at,
        updated_at=department.updated_at,
    )


@router.patch("/{department_id}", response_model=DepartmentResponse)
async def update_department(
    department_id: UUID,
    dept_in: DepartmentUpdate,
    db: DBSession,
    current_user: SuperUser,
):
    """Update department."""
    result = await db.execute(
        select(Department)
        .options(
            selectinload(Department.parent),
            selectinload(Department.manager),
            selectinload(Department.user_assignments),
        )
        .where(Department.id == department_id)
        .where(Department.is_deleted == False)
    )
    department = result.scalar_one_or_none()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    update_data = dept_in.model_dump(exclude_unset=True)

    # Validate parent_id if being changed
    if "parent_id" in update_data and update_data["parent_id"]:
        if update_data["parent_id"] == department_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Department cannot be its own parent",
            )
        parent = await db.execute(
            select(Department).where(Department.id == update_data["parent_id"])
        )
        if not parent.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent department not found",
            )

    for field, value in update_data.items():
        setattr(department, field, value)

    department.updated_by = current_user.id
    await db.commit()
    await db.refresh(department)

    return DepartmentResponse(
        id=department.id,
        name=department.name,
        code=department.code,
        description=department.description,
        is_active=department.is_active,
        parent_id=department.parent_id,
        parent=(
            {"id": department.parent.id, "name": department.parent.name, "code": department.parent.code}
            if department.parent
            else None
        ),
        manager=(
            {"id": department.manager.id, "email": department.manager.email, "full_name": department.manager.full_name}
            if department.manager
            else None
        ),
        user_count=len(department.user_assignments),
        created_at=department.created_at,
        updated_at=department.updated_at,
    )


@router.delete("/{department_id}", response_model=MessageResponse)
async def delete_department(
    department_id: UUID,
    db: DBSession,
    current_user: SuperUser,
):
    """Soft delete department."""
    result = await db.execute(
        select(Department)
        .where(Department.id == department_id)
        .where(Department.is_deleted == False)
    )
    department = result.scalar_one_or_none()

    if not department:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    department.is_deleted = True
    department.deleted_at = datetime.now(timezone.utc)
    department.deleted_by = current_user.id
    await db.commit()

    return MessageResponse(message="Department deleted successfully")


@router.post("/{department_id}/users", response_model=MessageResponse)
async def assign_user_to_department(
    department_id: UUID,
    assignment: DepartmentUserAssign,
    db: DBSession,
    current_user: SuperUser,
):
    """Assign user to department."""
    # Verify department exists
    dept_result = await db.execute(
        select(Department)
        .where(Department.id == department_id)
        .where(Department.is_deleted == False)
    )
    if not dept_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Department not found",
        )

    # Verify user exists
    user_result = await db.execute(
        select(User)
        .where(User.id == assignment.user_id)
        .where(User.is_deleted == False)
    )
    if not user_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Check if already assigned
    existing = await db.execute(
        select(DepartmentUser)
        .where(DepartmentUser.department_id == department_id)
        .where(DepartmentUser.user_id == assignment.user_id)
        .where(DepartmentUser.is_deleted == False)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already assigned to this department",
        )

    dept_user = DepartmentUser(
        department_id=department_id,
        user_id=assignment.user_id,
        is_primary=assignment.is_primary,
        assigned_at=datetime.now(timezone.utc),
        created_by=current_user.id,
    )

    db.add(dept_user)
    await db.commit()

    return MessageResponse(message="User assigned to department successfully")


@router.delete("/{department_id}/users/{user_id}", response_model=MessageResponse)
async def remove_user_from_department(
    department_id: UUID,
    user_id: UUID,
    db: DBSession,
    current_user: SuperUser,
):
    """Remove user from department."""
    result = await db.execute(
        select(DepartmentUser)
        .where(DepartmentUser.department_id == department_id)
        .where(DepartmentUser.user_id == user_id)
        .where(DepartmentUser.is_deleted == False)
    )
    assignment = result.scalar_one_or_none()

    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User assignment not found",
        )

    assignment.is_deleted = True
    assignment.deleted_at = datetime.now(timezone.utc)
    assignment.deleted_by = current_user.id
    await db.commit()

    return MessageResponse(message="User removed from department successfully")
