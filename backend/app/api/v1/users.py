import uuid
import datetime
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, or_, and_, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.users import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse
from app.repositories.user import UserRepository
from app.core.security import hash_password
from app.dependencies.auth import get_current_admin

router = APIRouter(prefix="/users", tags=["User Management"])


async def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


@router.get(
    "",
    response_model=List[UserResponse],
    summary="List all users (Admin Only)",
    description="Retrieve a list of all active/undeleted users. Filterable by role and search keyword."
)
async def list_users(
    skip: int = Query(0, ge=0, description="Number of users to skip"),
    limit: int = Query(100, ge=1, le=100, description="Maximum number of users to return"),
    role: Optional[UserRole] = Query(None, description="Filter users by their role"),
    search: Optional[str] = Query(None, description="Search keyword matching full name or email"),
    user_repo: UserRepository = Depends(get_user_repository),
    current_admin: User = Depends(get_current_admin)
):
    query = select(User).where(User.is_deleted == False)

    if role:
        query = query.where(User.role == role)

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            or_(
                User.full_name.ilike(search_filter),
                User.email.ilike(search_filter)
            )
        )

    # Order by created_at descending
    query = query.order_by(User.created_at.desc()).offset(skip).limit(limit)
    result = await user_repo.db.execute(query)
    return list(result.scalars().all())


@router.post(
    "",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new user account (Admin Only)",
    description="Registers a new user and hashes their password. Accessible only by administrators."
)
async def create_user(
    user_in: UserCreate,
    user_repo: UserRepository = Depends(get_user_repository),
    current_admin: User = Depends(get_current_admin)
):
    # Check if email already exists (including soft-deleted ones)
    existing_user = await user_repo.get_by_email(user_in.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )

    user_data = user_in.model_dump()
    password = user_data.pop("password")
    user_data["hashed_password"] = hash_password(password)

    new_user = await user_repo.create(user_data)
    return new_user


@router.get(
    "/{user_id}",
    response_model=UserResponse,
    summary="Get user details (Admin Only)",
    description="Retrieve detailed profile information for a specific user."
)
async def get_user(
    user_id: uuid.UUID,
    user_repo: UserRepository = Depends(get_user_repository),
    current_admin: User = Depends(get_current_admin)
):
    user = await user_repo.get(user_id)
    if not user or user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return user


@router.put(
    "/{user_id}",
    response_model=UserResponse,
    summary="Update a user account (Admin Only)",
    description="Modify account parameters, change roles, approve/deactivate status, or reset passwords."
)
async def update_user(
    user_id: uuid.UUID,
    user_in: UserUpdate,
    user_repo: UserRepository = Depends(get_user_repository),
    current_admin: User = Depends(get_current_admin)
):
    user = await user_repo.get(user_id)
    if not user or user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # If updating email, check for uniqueness conflicts
    if user_in.email and user_in.email != user.email:
        conflicting_user = await user_repo.get_by_email(user_in.email)
        if conflicting_user and not conflicting_user.is_deleted:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )

    update_data = user_in.model_dump(exclude_unset=True)
    
    # Handle password hashing if a new password is provided
    if "password" in update_data and update_data["password"]:
        raw_password = update_data.pop("password")
        update_data["hashed_password"] = hash_password(raw_password)
    elif "password" in update_data:
        update_data.pop("password")

    updated_user = await user_repo.update(db_obj=user, obj_in=update_data)
    return updated_user


@router.delete(
    "/{user_id}",
    response_model=UserResponse,
    summary="Soft-delete a user account (Admin Only)",
    description="Marks the user account as deleted and deactivates it, preventing future logins."
)
async def delete_user(
    user_id: uuid.UUID,
    user_repo: UserRepository = Depends(get_user_repository),
    current_admin: User = Depends(get_current_admin)
):
    user = await user_repo.get(user_id)
    if not user or user.is_deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Perform soft delete by setting flags
    update_data = {
        "is_active": False,
        "is_deleted": True,
        "deleted_at": datetime.datetime.now(datetime.timezone.utc)
    }
    
    deleted_user = await user_repo.update(db_obj=user, obj_in=update_data)
    return deleted_user
