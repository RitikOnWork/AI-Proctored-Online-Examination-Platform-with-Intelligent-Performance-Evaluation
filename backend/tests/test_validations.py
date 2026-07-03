import pytest
import uuid
from pydantic import ValidationError
from app.models.question_bank import QuestionType
from app.schemas.question import (
    QuestionCreate,
    validate_difficulty_value,
    validate_marks_value,
    validate_negative_marks_value
)


def test_reusable_validation_helpers():
    # Difficulty validation checks
    assert validate_difficulty_value("EASY") == "easy"
    assert validate_difficulty_value(" medium ") == "medium"
    assert validate_difficulty_value("Hard") == "hard"
    with pytest.raises(ValueError, match="Difficulty must be one of"):
        validate_difficulty_value("extremely_hard")

    # Marks validation checks
    assert validate_marks_value(5.0) == 5.0
    with pytest.raises(ValueError, match="Marks must be greater than 0"):
        validate_marks_value(0)
    with pytest.raises(ValueError, match="Marks must be greater than 0"):
        validate_marks_value(-1.5)

    # Negative marks validation checks
    assert validate_negative_marks_value(0.0) == 0.0
    assert validate_negative_marks_value(1.0) == 1.0
    with pytest.raises(ValueError, match="Negative marks must be greater than or equal to 0"):
        validate_negative_marks_value(-0.5)


def test_mcq_question_validation():
    subject_id = uuid.uuid4()

    # Valid MCQ: Exactly one correct option
    valid_payload = {
        "title": "MCQ Valid",
        "question_text": "Is Python clean?",
        "question_type": QuestionType.MCQ,
        "subject_id": subject_id,
        "options": [
            {"option_text": "Yes", "is_correct": True},
            {"option_text": "No", "is_correct": False}
        ]
    }
    q = QuestionCreate(**valid_payload)
    assert q.question_type == QuestionType.MCQ

    # Invalid MCQ: Zero correct options
    invalid_payload_zero = valid_payload.copy()
    invalid_payload_zero["options"] = [
        {"option_text": "Yes", "is_correct": False},
        {"option_text": "No", "is_correct": False}
    ]
    with pytest.raises(ValidationError, match="MCQ questions must have exactly one correct option"):
        QuestionCreate(**invalid_payload_zero)

    # Invalid MCQ: More than one correct option
    invalid_payload_many = valid_payload.copy()
    invalid_payload_many["options"] = [
        {"option_text": "Yes", "is_correct": True},
        {"option_text": "No", "is_correct": True}
    ]
    with pytest.raises(ValidationError, match="MCQ questions must have exactly one correct option"):
        QuestionCreate(**invalid_payload_many)


def test_multi_select_question_validation():
    subject_id = uuid.uuid4()

    # Valid Multi Select: At least one correct option
    valid_payload = {
        "title": "Multi Select Valid",
        "question_text": "Check all correct options:",
        "question_type": QuestionType.MULTI_SELECT,
        "subject_id": subject_id,
        "options": [
            {"option_text": "A", "is_correct": True},
            {"option_text": "B", "is_correct": True},
            {"option_text": "C", "is_correct": False}
        ]
    }
    q = QuestionCreate(**valid_payload)
    assert q.question_type == QuestionType.MULTI_SELECT

    # Invalid Multi Select: Zero correct options
    invalid_payload = valid_payload.copy()
    invalid_payload["options"] = [
        {"option_text": "A", "is_correct": False},
        {"option_text": "B", "is_correct": False}
    ]
    with pytest.raises(ValidationError, match="Multi-Select questions must have at least one correct option"):
        QuestionCreate(**invalid_payload)


def test_image_question_validation():
    subject_id = uuid.uuid4()

    # Valid Image Upload question
    valid_payload = {
        "title": "Upload photo of answer",
        "question_text": "Draw a red line",
        "question_type": QuestionType.IMAGE_UPLOAD,
        "subject_id": subject_id,
        "marks": 5.0
    }
    q = QuestionCreate(**valid_payload)
    assert q.question_type == QuestionType.IMAGE_UPLOAD

    # Invalid Image Upload question: zero marks
    invalid_payload = valid_payload.copy()
    invalid_payload["marks"] = 0
    with pytest.raises(ValidationError, match="Marks must be greater than 0"):
        QuestionCreate(**invalid_payload)
