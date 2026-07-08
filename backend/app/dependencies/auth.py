import uuid
from typing import Optional
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.settings import settings
from app.core.security import verify_token
from app.database import get_db
from app.models.users import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


async def get_current_user(
    db: AsyncSession = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> User:
    """
    Dependency to validate JWT tokens and retrieve active database user profile.
    Raises 401 unauthorized if validation fails.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(token)
    if not payload or payload.get("type") != "access":
        raise credentials_exception

    user_id_str: str = payload.get("sub")
    if user_id_str is None:
        raise credentials_exception

    try:
        user_uuid = uuid.UUID(user_id_str)
    except ValueError:
        raise credentials_exception

    user = await db.get(User, user_uuid)
    if not user or not user.is_active:
        raise credentials_exception

    return user


class RoleChecker:
    def __init__(self, allowed_roles: list[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)) -> User:
        if current_user.role.value not in self.allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this resource."
            )
        return current_user


# Role specific dependency checkers
get_current_admin = RoleChecker(["admin"])
get_current_examiner = RoleChecker(["examiner"])
get_current_student = RoleChecker(["student"])


async def verify_exam_token(
    exam_id: uuid.UUID,
    x_exam_token: Optional[str] = Header(None, alias="X-Exam-Token"),
    current_user: User = Depends(get_current_user)
) -> Optional[str]:
    """
    If the user is a student, verify the exam token bindings:
    - Valid signature & exp
    - Binds student_id and exam_id
    If user is examiner or admin, bypass verification.
    """
    if current_user.role.value in ["admin", "examiner"]:
        return x_exam_token
        
    if current_user.role.value != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students, examiners, and admins can view the exam paper."
        )

    if not x_exam_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Exam access token is required to start this exam."
        )
        
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid or expired exam token.",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = verify_token(x_exam_token)
    if not payload or payload.get("type") != "exam_entry":
        raise credentials_exception

    token_sub = payload.get("sub")
    token_exam_id = payload.get("exam_id")

    if not token_sub or not token_exam_id:
        raise credentials_exception

    if token_sub != str(current_user.id) or token_exam_id != str(exam_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this exam session."
        )

    return x_exam_token

