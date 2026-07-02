import datetime
import uuid
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class SubjectBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100, description="Name of the subject")
    description: Optional[str] = Field(None, max_length=500, description="Description of the subject")


class SubjectCreate(SubjectBase):
    pass


class SubjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    description: Optional[str] = Field(None, max_length=500)


class SubjectResponse(SubjectBase):
    id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)
