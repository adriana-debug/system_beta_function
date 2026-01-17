"""Authentication endpoints."""

from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession, CurrentUser
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
)
from app.models.user import User
from app.schemas.auth import LoginRequest, Token, RefreshTokenRequest
from app.schemas.user import CurrentUserResponse

router = APIRouter()


@router.post("/login", response_model=Token)
async def login(request: LoginRequest, db: DBSession):
    """Authenticate user and return tokens."""
    result = await db.execute(
        select(User)
        .where(User.email == request.email)
        .where(User.is_deleted == False)
        .options(selectinload(User.role))
    )
    user = result.scalar_one_or_none()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is disabled",
        )

    # Update last login
    user.last_login = datetime.now(timezone.utc)
    db.add(user)

    # Generate tokens
    access_token = create_access_token(
        subject=str(user.id),
        additional_claims={"role": user.role.code if user.role else None},
    )
    refresh_token = create_refresh_token(subject=str(user.id))

    return Token(
        access_token=access_token,
        refresh_token=refresh_token,
    )


@router.post("/refresh", response_model=Token)
async def refresh_token(request: RefreshTokenRequest, db: DBSession):
    """Refresh access token."""
    try:
        payload = decode_token(request.refresh_token)
        user_id = payload.get("sub")
        token_type = payload.get("type")

        if token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )

    result = await db.execute(
        select(User)
        .where(User.id == user_id)
        .where(User.is_deleted == False)
    )
    user = result.scalar_one_or_none()

    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )

    access_token = create_access_token(
        subject=str(user.id),
        additional_claims={"role": user.role.code if user.role else None},
    )
    new_refresh_token = create_refresh_token(subject=str(user.id))

    return Token(
        access_token=access_token,
        refresh_token=new_refresh_token,
    )


@router.get("/me", response_model=CurrentUserResponse)
async def get_current_user_info(current_user: CurrentUser):
    """Get current user information."""
    permissions = []
    if current_user.role:
        permissions = [
            rp.permission.code for rp in current_user.role.role_permissions
        ]

    return CurrentUserResponse(
        id=current_user.id,
        email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        full_name=current_user.full_name,
        employee_id=current_user.employee_id,
        phone=current_user.phone,
        avatar_url=current_user.avatar_url,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        last_login=current_user.last_login,
        role={
            "id": current_user.role.id,
            "name": current_user.role.name,
            "code": current_user.role.code,
        },
        permissions=permissions,
        created_at=current_user.created_at,
        updated_at=current_user.updated_at,
    )


@router.post("/logout")
async def logout(current_user: CurrentUser):
    """Logout user (client should discard tokens)."""
    return {"message": "Successfully logged out"}
