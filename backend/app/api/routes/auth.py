"""
Crescendo — Authentication Routes
"""

from datetime import timedelta
from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy import select

from app.api.dependencies import DbSession, CurrentUser
from app.core.security import hash_password, verify_password, create_access_token, decode_token
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin, UserResponse, AuthResponse

router = APIRouter()


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(data: UserCreate, db: DbSession):
    """Register a new user."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already registered",
        )

    # Create user
    user = User(
        name=data.name,
        email=data.email,
        hashed_password=hash_password(data.password),
        role=data.role,
    )
    db.add(user)
    await db.flush()
    await db.refresh(user)

    # Generate token
    access_token = create_access_token(data={"sub": str(user.id)})

    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
    )


@router.post("/login", response_model=AuthResponse)
async def login(data: UserLogin, db: DbSession):
    """Login and receive an access token."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    access_token = create_access_token(data={"sub": str(user.id)})

    return AuthResponse(
        user=UserResponse.model_validate(user),
        access_token=access_token,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(current_user: CurrentUser):
    """Get the current authenticated user's profile."""
    return UserResponse.model_validate(current_user)


# ===== Profile Update =====

class ProfileUpdate(BaseModel):
    name: str | None = None
    email: EmailStr | None = None
    role: str | None = Field(default=None, pattern="^(artist|label|producer|marketer|other)$")


@router.put("/profile", response_model=UserResponse)
async def update_profile(data: ProfileUpdate, db: DbSession, current_user: CurrentUser):
    """Update the current user's profile."""
    if data.name is not None:
        current_user.name = data.name
    if data.email is not None:
        # Check email uniqueness
        if data.email != current_user.email:
            existing = await db.execute(select(User).where(User.email == data.email))
            if existing.scalar_one_or_none():
                raise HTTPException(status_code=409, detail="Email already in use")
        current_user.email = data.email
    if data.role is not None:
        current_user.role = data.role

    await db.flush()
    await db.refresh(current_user)
    return UserResponse.model_validate(current_user)


# ===== Password Reset Flow =====

class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8, max_length=128)


@router.post("/forgot-password")
async def forgot_password(data: ForgotPasswordRequest, db: DbSession):
    """Request a password reset token. In production this sends an email;
    for development the token is logged to the console."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    # Always return success to prevent email enumeration
    if not user:
        return {"message": "If that email is registered, you will receive a reset link."}

    # Generate a short-lived reset token (15 minutes)
    reset_token = create_access_token(
        data={"sub": str(user.id), "type": "password_reset"},
        expires_delta=timedelta(minutes=15),
    )

    # In production: send email with reset link
    # For now: log it to console
    print(f"\n{'='*60}")
    print(f"  PASSWORD RESET TOKEN for {user.email}")
    print(f"  Token: {reset_token}")
    print(f"  Link:  http://localhost:3000/reset-password?token={reset_token}")
    print(f"{'='*60}\n")

    return {"message": "If that email is registered, you will receive a reset link."}


@router.post("/reset-password")
async def reset_password(data: ResetPasswordRequest, db: DbSession):
    """Reset password using a valid reset token."""
    payload = decode_token(data.token)
    if not payload or payload.get("type") != "password_reset":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token",
        )

    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=400, detail="Invalid reset token")

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.hashed_password = hash_password(data.password)
    await db.flush()

    return {"message": "Password has been reset successfully. You can now log in."}
