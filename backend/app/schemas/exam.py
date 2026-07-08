import datetime
import uuid
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, ConfigDict


class ExamSettingsBase(BaseModel):
    enable_camera: bool = Field(default=True)
    enable_microphone: bool = Field(default=True)
    enable_browser_lock: bool = Field(default=True)
    max_tab_switches: int = Field(default=3, ge=0)
    max_face_violations: int = Field(default=5, ge=0)
    shuffle_questions: bool = Field(default=False)
    show_results_immediately: bool = Field(default=False)
    proctoring_enabled: bool = Field(default=True)
    face_detection_enabled: bool = Field(default=True)
    enable_gaze_tracking: bool = Field(default=True)
    suspicion_threshold: int = Field(default=5, ge=1)
    enable_negative_marking: bool = Field(default=False)
    difficulty_distribution: Optional[Dict[str, Any]] = Field(default=None)
    question_distribution: Optional[Dict[str, Any]] = Field(default=None)


class ExamSettingsCreate(ExamSettingsBase):
    pass


class ExamSettingsUpdate(BaseModel):
    enable_camera: Optional[bool] = None
    enable_microphone: Optional[bool] = None
    enable_browser_lock: Optional[bool] = None
    max_tab_switches: Optional[int] = Field(None, ge=0)
    max_face_violations: Optional[int] = Field(None, ge=0)
    shuffle_questions: Optional[bool] = None
    show_results_immediately: Optional[bool] = None
    proctoring_enabled: Optional[bool] = None
    face_detection_enabled: Optional[bool] = None
    enable_gaze_tracking: Optional[bool] = None
    suspicion_threshold: Optional[int] = Field(None, ge=1)
    enable_negative_marking: Optional[bool] = None
    difficulty_distribution: Optional[Dict[str, Any]] = None
    question_distribution: Optional[Dict[str, Any]] = None


class ExamSettingsResponse(ExamSettingsBase):
    id: uuid.UUID
    exam_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)


class ExamBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    description: Optional[str] = Field(default=None)
    duration_minutes: int = Field(..., ge=1, description="Duration in minutes")
    passing_score: int = Field(default=40, ge=0)
    start_time: Optional[datetime.datetime] = Field(default=None)
    end_time: Optional[datetime.datetime] = Field(default=None)
    is_published: bool = Field(default=False)
    question_count: Optional[int] = Field(default=None, ge=1, description="Total questions for this exam")


class ExamCreate(ExamBase):
    subject_id: uuid.UUID
    settings: Optional[ExamSettingsCreate] = Field(default=None)


class ExamUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    duration_minutes: Optional[int] = Field(None, ge=1)
    passing_score: Optional[int] = Field(None, ge=0)
    start_time: Optional[datetime.datetime] = None
    end_time: Optional[datetime.datetime] = None
    is_published: Optional[bool] = None
    subject_id: Optional[uuid.UUID] = None
    settings: Optional[ExamSettingsUpdate] = None
    question_count: Optional[int] = Field(None, ge=1)


class ExamResponse(ExamBase):
    id: uuid.UUID
    subject_id: uuid.UUID
    creator_id: uuid.UUID
    created_at: datetime.datetime
    updated_at: datetime.datetime
    settings: Optional[ExamSettingsResponse] = None

    model_config = ConfigDict(from_attributes=True)


class ExamQuestionLink(BaseModel):
    question_id: uuid.UUID
    order: int = Field(default=0, ge=0)
    points_override: Optional[int] = Field(default=None, ge=0)


class ExamQuestionsAssign(BaseModel):
    questions: list[ExamQuestionLink]
