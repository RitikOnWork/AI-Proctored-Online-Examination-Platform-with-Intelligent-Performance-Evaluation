import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from app.models.users import UserRole


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(..., min_length=2, max_length=100)
    role: UserRole = UserRole.STUDENT
    is_active: Optional[bool] = True


class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=128)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=128)


class UserResponse(UserBase):
    id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    # Pydantic v2 config to enable attributes extraction (replaces orm_mode=True)
    model_config = ConfigDict(from_attributes=True)
