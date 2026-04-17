"""
Authentication API routes for CRAB AI
Uses Supabase JWT verification - frontend handles signup/login via Supabase SDK
"""

from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from ..database import get_db
from ..schemas.user import UserResponse, UserUpdate, PasswordChange
from ..services.auth_service import AuthService
from ..utils.security import SecurityUtils
from ..config import settings

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db)
) -> Any:
    """
    Verify the Supabase JWT token and return the user.
    Auto-creates user in local DB on first visit.
    """
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials
    payload = SecurityUtils.verify_supabase_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    supabase_uid = payload.get("sub")
    email = payload.get("email", "")
    user_meta = payload.get("user_metadata", {})
    display_name = (
        user_meta.get("display_name")
        or user_meta.get("full_name")
        or email.split("@")[0]
    )

    if not supabase_uid:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    auth_service = AuthService(db)
    user = auth_service.get_or_create_supabase_user(supabase_uid, email, display_name)

    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found or inactive")

    return user


def get_current_active_user(current_user: Any = Depends(get_current_user)) -> Any:
    if not current_user.is_active:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
    return current_user


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: Any = Depends(get_current_active_user)):
    return UserResponse(**current_user.to_dict())


@router.put("/me", response_model=UserResponse)
async def update_current_user(
    user_update: UserUpdate,
    current_user: Any = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    auth_service = AuthService(db)
    updated_user = auth_service.update_user_profile(current_user.id, user_update)
    if not updated_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return UserResponse(**updated_user.to_dict())


@router.post("/logout")
async def logout(current_user: Any = Depends(get_current_active_user)):
    return {"message": "Logged out successfully"}
