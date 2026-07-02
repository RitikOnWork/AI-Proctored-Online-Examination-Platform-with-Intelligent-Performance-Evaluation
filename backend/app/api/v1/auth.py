from fastapi import APIRouter, Depends, HTTPException, status, Body
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.models.users import User
from app.schemas.user import UserCreate, UserResponse
from app.schemas.token import Token
from app.repositories.user import UserRepository
from app.services.auth import AuthService
from app.dependencies.auth import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


# Dependency helpers
async def get_user_repository(db: AsyncSession = Depends(get_db)) -> UserRepository:
    return UserRepository(db)


async def get_auth_service(user_repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(user_repo)


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new candidate, examiner, or admin profile with a hashed password."
)
async def register(
    user_in: UserCreate,
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.register_user(user_in)


@router.post(
    "/login",
    response_model=Token,
    summary="User Login (Swagger Form & JSON compatible)",
    description="Authenticates credentials and returns JWT access and refresh tokens."
)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    auth_service: AuthService = Depends(get_auth_service)
):
    user = await auth_service.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.issue_tokens(user)


@router.post(
    "/login/json",
    response_model=Token,
    summary="User Login (JSON Body)",
    description="Login using JSON body inputs."
)
async def login_json(
    email: str = Body(..., examples=["user@example.com"]),
    password: str = Body(..., examples=["securepassword"]),
    auth_service: AuthService = Depends(get_auth_service)
):
    user = await auth_service.authenticate_user(email, password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return auth_service.issue_tokens(user)


@router.post(
    "/refresh",
    response_model=Token,
    summary="Refresh session token",
    description="Validates a refresh token and returns a new session token pair."
)
async def refresh(
    refresh_token: str = Body(..., embed=True),
    auth_service: AuthService = Depends(get_auth_service)
):
    return await auth_service.refresh_session(refresh_token)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Logout session",
    description="Stateless token invalidation notification."
)
async def logout(current_user: User = Depends(get_current_user)):
    return {
        "message": "Logged out successfully from session.",
        "user_id": str(current_user.id)
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user details",
    description="Returns the profile information of the currently authenticated session."
)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user
