import pytest
import uuid
import datetime
from fastapi import HTTPException
from app.schemas.exam import ExamCreate
from app.services.exam import ExamService
from app.repositories.exam import ExamRepository
from app.core.security import verify_token

pytestmark = pytest.mark.asyncio


async def test_exam_time_window_validation():
    # We can test the internal window helper on ExamService directly
    service = ExamService(None)
    
    # Valid window
    now = datetime.datetime.now(datetime.timezone.utc)
    future = now + datetime.timedelta(hours=2)
    service._validate_exam_window(now, future)

    # Invalid window: start > end
    with pytest.raises(HTTPException) as exc:
        service._validate_exam_window(future, now)
    assert exc.value.status_code == 400
    assert "start time must be strictly before" in exc.value.detail.lower()


async def test_exam_crud_and_publishing(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")

    # 1. Admin creates subject
    res = await client.post("/api/v1/subjects", json={"name": f"Subj_{uuid.uuid4().hex[:6]}"}, headers={"Authorization": f"Bearer {admin_token}"})
    subject_id = res.json()["id"]

    # 2. Examiner creates Exam
    exam_payload = {
        "title": "Config Final Exam",
        "duration_minutes": 90,
        "subject_id": subject_id,
        "settings": {
            "proctoring_enabled": True,
            "max_tab_switches": 2
        }
    }
    res = await client.post("/api/v1/exams", json=exam_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 201
    exam_id = res.json()["id"]
    assert res.json()["is_published"] is False

    # 3. Examiner publishes Exam (Should pass 200)
    res = await client.post(f"/api/v1/exams/{exam_id}/publish", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert res.json()["is_published"] is True


async def test_deterministic_random_paper_generation(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")
    student_a_token = await create_token(f"st_a_{uuid.uuid4().hex[:6]}@example.com", "student")
    student_b_token = await create_token(f"st_b_{uuid.uuid4().hex[:6]}@example.com", "student")

    # Admin creates subject
    res = await client.post("/api/v1/subjects", json={"name": f"Subj_{uuid.uuid4().hex[:6]}"}, headers={"Authorization": f"Bearer {admin_token}"})
    subject_id = res.json()["id"]

    # Create 4 Questions
    q_ids = []
    for i in range(1, 5):
        payload = {
            "title": f"Q{i}",
            "question_text": f"Question text {i}",
            "question_type": "short_answer",
            "subject_id": subject_id,
            "difficulty": "medium",
            "marks": 1.0
        }
        res = await client.post("/api/v1/questions", json=payload, headers={"Authorization": f"Bearer {examiner_token}"})
        assert res.status_code == 201
        q_ids.append(res.json()["id"])

    # Examiner creates Exam with shuffle enabled
    exam_payload = {
        "title": "Random Paper Final",
        "duration_minutes": 100,
        "subject_id": subject_id,
        "settings": {
            "shuffle_questions": True
        }
    }
    res = await client.post("/api/v1/exams", json=exam_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    exam_id = res.json()["id"]

    # Examiner assigns questions to exam
    assign_payload = {
        "questions": [{"question_id": q_id, "order": idx} for idx, q_id in enumerate(q_ids)]
    }
    res = await client.post(f"/api/v1/exams/{exam_id}/questions", json=assign_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200

    # 1. Student A gets paper (First fetch)
    res = await client.get(f"/api/v1/exams/{exam_id}/paper", headers={"Authorization": f"Bearer {student_a_token}"})
    assert res.status_code == 200
    paper_a1 = [q["id"] for q in res.json()]

    # 2. Student A gets paper (Second fetch)
    res = await client.get(f"/api/v1/exams/{exam_id}/paper", headers={"Authorization": f"Bearer {student_a_token}"})
    assert res.status_code == 200
    paper_a2 = [q["id"] for q in res.json()]
    assert paper_a1 == paper_a2, "Paper generation for same student must be identical!"

    # 3. Student B gets paper (Should be shuffled differently)
    res = await client.get(f"/api/v1/exams/{exam_id}/paper", headers={"Authorization": f"Bearer {student_b_token}"})
    assert res.status_code == 200
    paper_b = [q["id"] for q in res.json()]
    assert paper_a1 != paper_b, "Paper generation for different students must produce different orderings!"


async def test_exam_listing_filters(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")

    # Create subject
    res = await client.post("/api/v1/subjects", json={"name": f"Subj_{uuid.uuid4().hex[:6]}"}, headers={"Authorization": f"Bearer {admin_token}"})
    subject_id = res.json()["id"]

    # Create exam
    payload = {"title": "Filtered Exam", "duration_minutes": 60, "subject_id": subject_id}
    res = await client.post("/api/v1/exams", json=payload, headers={"Authorization": f"Bearer {examiner_token}"})
    exam_id = res.json()["id"]

    # List exams with various filters
    res = await client.get(f"/api/v1/exams?is_published=false&subject_id={subject_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1

    res = await client.get(f"/api/v1/exams?is_published=true&subject_id={subject_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert len(res.json()) == 0


async def test_exam_entry_token(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")
    student_token = await create_token(f"student_{uuid.uuid4().hex[:6]}@example.com", "student")

    # Create subject
    res = await client.post("/api/v1/subjects", json={"name": f"Subj_{uuid.uuid4().hex[:6]}"}, headers={"Authorization": f"Bearer {admin_token}"})
    subject_id = res.json()["id"]

    # Create exam
    payload = {"title": "Entry Token Exam", "duration_minutes": 60, "subject_id": subject_id}
    res = await client.post("/api/v1/exams", json=payload, headers={"Authorization": f"Bearer {examiner_token}"})
    exam_id = res.json()["id"]

    # 1. Student requests entry token (Should pass 200)
    res = await client.post(f"/api/v1/exams/{exam_id}/enter", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 200
    res_data = res.json()
    assert "exam_token" in res_data
    assert res_data["expires_in_seconds"] == 300

    # Verify token claims
    payload = verify_token(res_data["exam_token"])
    assert payload is not None
    assert payload["exam_id"] == exam_id
    assert payload["type"] == "exam_entry"

    # 2. Examiner requests entry token (Should fail 403 because it's student-only)
    res = await client.post(f"/api/v1/exams/{exam_id}/enter", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 403
