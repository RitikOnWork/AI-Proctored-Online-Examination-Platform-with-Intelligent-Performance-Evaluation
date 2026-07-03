import datetime
import uuid
from typing import List, Optional
from pydantic import BaseModel, Field, field_validator, model_validator, ConfigDict
from app.models.question_bank import QuestionType


# Reusable validator helpers
def validate_difficulty_value(value: str) -> str:
    cleaned = value.strip().lower()
    if cleaned not in ["easy", "medium", "hard"]:
        raise ValueError("Difficulty must be one of 'easy', 'medium', or 'hard'")
    return cleaned


def validate_marks_value(value: float) -> float:
    if value <= 0:
        raise ValueError("Marks must be greater than 0")
    return value


def validate_negative_marks_value(value: float) -> float:
    if value < 0:
        raise ValueError("Negative marks must be greater than or equal to 0")
    return value


class QuestionOptionBase(BaseModel):
    option_text: str = Field(..., min_length=1, description="Option text description")
    is_correct: bool = Field(default=False, description="Is this option correct?")


class QuestionOptionCreate(QuestionOptionBase):
    pass


class QuestionOptionResponse(QuestionOptionBase):
    id: uuid.UUID
    question_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class QuestionBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    question_text: str = Field(..., min_length=5)
    question_image: Optional[str] = Field(default=None, max_length=500)
    question_type: QuestionType
    difficulty: str = Field(default="medium")
    marks: float = Field(default=1.0)
    negative_marks: float = Field(default=0.0)
    tags: Optional[List[str]] = Field(default=None)
    expected_answer: Optional[str] = Field(default=None)
    model_answer: Optional[str] = Field(default=None)
    explanation: Optional[str] = Field(default=None)


class QuestionCreate(QuestionBase):
    subject_id: uuid.UUID
    options: Optional[List[QuestionOptionCreate]] = Field(default=None)

    # Reusable field validators
    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: str) -> str:
        return validate_difficulty_value(v)

    @field_validator("marks")
    @classmethod
    def validate_marks(cls, v: float) -> float:
        return validate_marks_value(v)

    @field_validator("negative_marks")
    @classmethod
    def validate_negative_marks(cls, v: float) -> float:
        return validate_negative_marks_value(v)

    # Cross-field type validations
    @model_validator(mode="after")
    def validate_type_rules(self) -> "QuestionCreate":
        q_type = self.question_type
        options = self.options or []

        if q_type == QuestionType.MCQ:
            if not options:
                raise ValueError("Options are required for MCQ questions.")
            correct_count = sum(1 for opt in options if opt.is_correct)
            if correct_count != 1:
                raise ValueError("MCQ questions must have exactly one correct option.")

        elif q_type == QuestionType.MULTI_SELECT:
            if not options:
                raise ValueError("Options are required for Multi-Select questions.")
            correct_count = sum(1 for opt in options if opt.is_correct)
            if correct_count < 1:
                raise ValueError("Multi-Select questions must have at least one correct option.")

        elif q_type == QuestionType.IMAGE_UPLOAD:
            # Enforce that marks is explicitly > 0 (marks is already validated to be > 0 by field validator)
            if self.marks is None or self.marks <= 0:
                raise ValueError("Marks must be provided and greater than 0 for Image Upload questions.")

        return self


class QuestionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    question_text: Optional[str] = Field(None, min_length=5)
    question_image: Optional[str] = Field(None, max_length=500)
    question_type: Optional[QuestionType] = None
    difficulty: Optional[str] = None
    marks: Optional[float] = None
    negative_marks: Optional[float] = None
    tags: Optional[List[str]] = None
    expected_answer: Optional[str] = None
    model_answer: Optional[str] = None
    explanation: Optional[str] = None
    subject_id: Optional[uuid.UUID] = None
    options: Optional[List[QuestionOptionCreate]] = None

    @field_validator("difficulty")
    @classmethod
    def validate_difficulty(cls, v: Optional[str]) -> Optional[str]:
        if v is None:
            return v
        return validate_difficulty_value(v)

    @field_validator("marks")
    @classmethod
    def validate_marks(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return v
        return validate_marks_value(v)

    @field_validator("negative_marks")
    @classmethod
    def validate_negative_marks(cls, v: Optional[float]) -> Optional[float]:
        if v is None:
            return v
        return validate_negative_marks_value(v)

    @model_validator(mode="after")
    def validate_update_type_rules(self) -> "QuestionUpdate":
        # Check cross-field values if both are supplied in patch
        if self.question_type is not None:
            q_type = self.question_type
            options = self.options or []
            
            # Since options could be pre-existing in DB, cross-validation for updates 
            # is best checked fully on the service layer when merging. 
            # However, if options are provided in the patch, we validate:
            if options:
                if q_type == QuestionType.MCQ:
                    correct_count = sum(1 for opt in options if opt.is_correct)
                    if correct_count != 1:
                        raise ValueError("MCQ questions must have exactly one correct option.")
                elif q_type == QuestionType.MULTI_SELECT:
                    correct_count = sum(1 for opt in options if opt.is_correct)
                    if correct_count < 1:
                        raise ValueError("Multi-Select questions must have at least one correct option.")
            
            if q_type == QuestionType.IMAGE_UPLOAD:
                if self.marks is not None and self.marks <= 0:
                    raise ValueError("Marks must be greater than 0 for Image Upload questions.")

        return self


class QuestionResponse(QuestionBase):
    id: uuid.UUID
    subject_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime
    options: List[QuestionOptionResponse] = []

    model_config = ConfigDict(from_attributes=True)
