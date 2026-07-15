from typing import Optional, Tuple
from fastapi import HTTPException, status
from app.models.users import User, UserRole
from app.schemas.user import UserCreate
from app.schemas.token import Token
from app.repositories.user import UserRepository
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, verify_token


class AuthService:
    def __init__(self, user_repo: UserRepository):
        self.user_repo = user_repo

    async def register_user(self, user_in: UserCreate) -> User:
        """
        Registers a new user inside the system.
        Raises HTTPException if user email already exists.
        """
        if user_in.role == UserRole.EXAMINER:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Examiner accounts cannot be registered publicly. They must be created manually by an Administrator."
            )

        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A user with this email address already exists."
            )
        
        # Hash password and create database model
        user_data = user_in.model_dump()
        password = user_data.pop("password")
        user_data["hashed_password"] = hash_password(password)
        
        # Create record in DB
        new_user = await self.user_repo.create(user_data)
        return new_user

    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """
        Validates user credentials against password crypts.
        Returns the User object if valid, otherwise None.
        """
        user = await self.user_repo.get_by_email(email)
        if not user or not user.is_active:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
            
        return user

    def issue_tokens(self, user: User) -> Token:
        """
        Generate both access and refresh tokens for user session.
        """
        access = create_access_token(subject=user.id, role=user.role.value)
        refresh = create_refresh_token(subject=user.id)
        return Token(access_token=access, refresh_token=refresh, role=user.role.value)

    async def refresh_session(self, refresh_token: str) -> Token:
        """
        Verify the refresh token claims and issue a new set of tokens.
        """
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token."
            )

        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token claims."
            )

        user = await self.user_repo.get(user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive or not found."
            )

        # Issue new tokens
        return self.issue_tokens(user)
