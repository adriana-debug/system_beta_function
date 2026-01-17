"""User management endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession, CurrentUser, SuperUser
from app.core.security import get_password_hash
from app.models.user import User, Role
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
)

router = APIRouter()


@router.get("", response_model=PaginatedResponse[UserListResponse])
async def list_users(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    role_id: UUID | None = None,
    is_active: bool | None = None,
):
    """List all users with pagination and filtering."""
    query = (
        select(User)
        .options(selectinload(User.role))
        .where(User.is_deleted == False)
    )

    # Apply filters
    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (User.email.ilike(search_filter))
            | (User.first_name.ilike(search_filter))
            | (User.last_name.ilike(search_filter))
            | (User.employee_id.ilike(search_filter))
        )

    if role_id:
        query = query.where(User.role_id == role_id)

    if is_active is not None:
        query = query.where(User.is_active == is_active)

    # Get total count
    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    # Apply pagination
    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(User.created_at.desc())

    result = await db.execute(query)
    users = result.scalars().all()

    items = [
        UserListResponse(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            full_name=user.full_name,
            employee_id=user.employee_id,
            is_active=user.is_active,
            role={
                "id": user.role.id,
                "name": user.role.name,
                "code": user.role.code,
            },
            created_at=user.created_at,
        )
        for user in users
    ]

    return PaginatedResponse.create(items, total, page, page_size)


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_in: UserCreate,
    db: DBSession,
    current_user: SuperUser,
):
    """Create a new user."""
    # Check email uniqueness
    existing = await db.execute(
        select(User).where(User.email == user_in.email)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Check employee_id uniqueness if provided
    if user_in.employee_id:
        existing = await db.execute(
            select(User).where(User.employee_id == user_in.employee_id)
        )
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Employee ID already exists",
            )

    # Verify role exists
    role_result = await db.execute(select(Role).where(Role.id == user_in.role_id))
    if not role_result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role not found",
        )

    user = User(
        email=user_in.email,
        hashed_password=get_password_hash(user_in.password),
        first_name=user_in.first_name,
        last_name=user_in.last_name,
        employee_id=user_in.employee_id,
        phone=user_in.phone,
        role_id=user_in.role_id,
        is_active=user_in.is_active,
        created_by=current_user.id,
    )

    db.add(user)
    await db.commit()
    await db.refresh(user)

    # Load role relationship
    result = await db.execute(
        select(User).options(selectinload(User.role)).where(User.id == user.id)
    )
    user = result.scalar_one()

    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        employee_id=user.employee_id,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        last_login=user.last_login,
        role={
            "id": user.role.id,
            "name": user.role.name,
            "code": user.role.code,
        },
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get user by ID."""
    result = await db.execute(
        select(User)
        .options(selectinload(User.role))
        .where(User.id == user_id)
        .where(User.is_deleted == False)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        employee_id=user.employee_id,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        last_login=user.last_login,
        role={
            "id": user.role.id,
            "name": user.role.name,
            "code": user.role.code,
        },
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.patch("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: UUID,
    user_in: UserUpdate,
    db: DBSession,
    current_user: SuperUser,
):
    """Update user."""
    result = await db.execute(
        select(User)
        .options(selectinload(User.role))
        .where(User.id == user_id)
        .where(User.is_deleted == False)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_data = user_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(user, field, value)

    user.updated_by = current_user.id
    await db.commit()
    await db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        employee_id=user.employee_id,
        phone=user.phone,
        avatar_url=user.avatar_url,
        is_active=user.is_active,
        is_superuser=user.is_superuser,
        last_login=user.last_login,
        role={
            "id": user.role.id,
            "name": user.role.name,
            "code": user.role.code,
        },
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.delete("/{user_id}", response_model=MessageResponse)
async def delete_user(
    user_id: UUID,
    db: DBSession,
    current_user: SuperUser,
):
    """Soft delete user."""
    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .where(User.is_deleted == False)
    )
    user = result.scalar_one_or_none()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete your own account",
        )

    from datetime import datetime, timezone

    user.is_deleted = True
    user.deleted_at = datetime.now(timezone.utc)
    user.deleted_by = current_user.id
    await db.commit()

    return MessageResponse(message="User deleted successfully")
