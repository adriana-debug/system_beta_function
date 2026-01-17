"""Role and permission management endpoints."""

from uuid import UUID

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession, CurrentUser, SuperUser
from app.models.user import Role, Permission, RolePermission
from app.schemas.user import (
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    PermissionResponse,
)
from app.schemas.common import MessageResponse

router = APIRouter()


@router.get("", response_model=list[RoleResponse])
async def list_roles(
    db: DBSession,
    current_user: CurrentUser,
):
    """List all roles."""
    result = await db.execute(
        select(Role)
        .options(
            selectinload(Role.role_permissions).selectinload(RolePermission.permission)
        )
        .where(Role.is_deleted == False)
        .order_by(Role.name)
    )
    roles = result.scalars().all()

    return [
        RoleResponse(
            id=role.id,
            name=role.name,
            code=role.code,
            description=role.description,
            is_system=role.is_system,
            permissions=[
                PermissionResponse(
                    id=rp.permission.id,
                    name=rp.permission.name,
                    code=rp.permission.code,
                    description=rp.permission.description,
                    module=rp.permission.module,
                )
                for rp in role.role_permissions
            ],
            created_at=role.created_at,
        )
        for role in roles
    ]


@router.post("", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
async def create_role(
    role_in: RoleCreate,
    db: DBSession,
    current_user: SuperUser,
):
    """Create a new role."""
    # Check code uniqueness
    existing = await db.execute(
        select(Role).where(Role.code == role_in.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Role code already exists",
        )

    role = Role(
        name=role_in.name,
        code=role_in.code,
        description=role_in.description,
        created_by=current_user.id,
    )

    db.add(role)
    await db.flush()

    # Add permissions
    if role_in.permission_ids:
        for perm_id in role_in.permission_ids:
            role_perm = RolePermission(
                role_id=role.id,
                permission_id=perm_id,
                created_by=current_user.id,
            )
            db.add(role_perm)

    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(Role)
        .options(
            selectinload(Role.role_permissions).selectinload(RolePermission.permission)
        )
        .where(Role.id == role.id)
    )
    role = result.scalar_one()

    return RoleResponse(
        id=role.id,
        name=role.name,
        code=role.code,
        description=role.description,
        is_system=role.is_system,
        permissions=[
            PermissionResponse(
                id=rp.permission.id,
                name=rp.permission.name,
                code=rp.permission.code,
                description=rp.permission.description,
                module=rp.permission.module,
            )
            for rp in role.role_permissions
        ],
        created_at=role.created_at,
    )


@router.get("/{role_id}", response_model=RoleResponse)
async def get_role(
    role_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get role by ID."""
    result = await db.execute(
        select(Role)
        .options(
            selectinload(Role.role_permissions).selectinload(RolePermission.permission)
        )
        .where(Role.id == role_id)
        .where(Role.is_deleted == False)
    )
    role = result.scalar_one_or_none()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    return RoleResponse(
        id=role.id,
        name=role.name,
        code=role.code,
        description=role.description,
        is_system=role.is_system,
        permissions=[
            PermissionResponse(
                id=rp.permission.id,
                name=rp.permission.name,
                code=rp.permission.code,
                description=rp.permission.description,
                module=rp.permission.module,
            )
            for rp in role.role_permissions
        ],
        created_at=role.created_at,
    )


@router.patch("/{role_id}", response_model=RoleResponse)
async def update_role(
    role_id: UUID,
    role_in: RoleUpdate,
    db: DBSession,
    current_user: SuperUser,
):
    """Update role."""
    result = await db.execute(
        select(Role)
        .options(
            selectinload(Role.role_permissions).selectinload(RolePermission.permission)
        )
        .where(Role.id == role_id)
        .where(Role.is_deleted == False)
    )
    role = result.scalar_one_or_none()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot modify system roles",
        )

    if role_in.name is not None:
        role.name = role_in.name
    if role_in.description is not None:
        role.description = role_in.description

    # Update permissions if provided
    if role_in.permission_ids is not None:
        # Remove existing permissions
        await db.execute(
            select(RolePermission).where(RolePermission.role_id == role.id)
        )
        for rp in role.role_permissions:
            await db.delete(rp)

        # Add new permissions
        for perm_id in role_in.permission_ids:
            role_perm = RolePermission(
                role_id=role.id,
                permission_id=perm_id,
                created_by=current_user.id,
            )
            db.add(role_perm)

    role.updated_by = current_user.id
    await db.commit()

    # Reload
    result = await db.execute(
        select(Role)
        .options(
            selectinload(Role.role_permissions).selectinload(RolePermission.permission)
        )
        .where(Role.id == role.id)
    )
    role = result.scalar_one()

    return RoleResponse(
        id=role.id,
        name=role.name,
        code=role.code,
        description=role.description,
        is_system=role.is_system,
        permissions=[
            PermissionResponse(
                id=rp.permission.id,
                name=rp.permission.name,
                code=rp.permission.code,
                description=rp.permission.description,
                module=rp.permission.module,
            )
            for rp in role.role_permissions
        ],
        created_at=role.created_at,
    )


@router.delete("/{role_id}", response_model=MessageResponse)
async def delete_role(
    role_id: UUID,
    db: DBSession,
    current_user: SuperUser,
):
    """Delete role."""
    result = await db.execute(
        select(Role)
        .where(Role.id == role_id)
        .where(Role.is_deleted == False)
    )
    role = result.scalar_one_or_none()

    if not role:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Role not found",
        )

    if role.is_system:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete system roles",
        )

    from datetime import datetime, timezone

    role.is_deleted = True
    role.deleted_at = datetime.now(timezone.utc)
    role.deleted_by = current_user.id
    await db.commit()

    return MessageResponse(message="Role deleted successfully")


@router.get("/permissions/all", response_model=list[PermissionResponse])
async def list_permissions(
    db: DBSession,
    current_user: CurrentUser,
):
    """List all permissions."""
    result = await db.execute(
        select(Permission)
        .where(Permission.is_deleted == False)
        .order_by(Permission.module, Permission.name)
    )
    permissions = result.scalars().all()

    return [
        PermissionResponse(
            id=perm.id,
            name=perm.name,
            code=perm.code,
            description=perm.description,
            module=perm.module,
        )
        for perm in permissions
    ]
