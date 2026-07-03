import pytest
import uuid
from app.models.question_bank import QuestionType

pytestmark = pytest.mark.asyncio


async def test_question_crud_and_search(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")

    # 1. Admin creates subject
    res = await client.post("/api/v1/subjects", json={"name": f"CS_{uuid.uuid4().hex[:6]}", "description": "Subject test"}, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 201
    subject_id = res.json()["id"]

    # 2. Examiner creates question with options
    q_payload = {
        "title": "Algorithms 101",
        "question_text": "What is the complexity of Merge Sort?",
        "question_type": "mcq",
        "subject_id": subject_id,
        "options": [
            {"option_text": "O(N log N)", "is_correct": True},
            {"option_text": "O(N^2)", "is_correct": False}
        ],
        "difficulty": "medium",
        "marks": 3.0
    }
    res = await client.post("/api/v1/questions", json=q_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 201
    q_id = res.json()["id"]

    # 3. Get question by ID
    res = await client.get(f"/api/v1/questions/{q_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert res.json()["title"] == "Algorithms 101"

    # 4. Search question (valid match)
    res = await client.get("/api/v1/questions/search?q=Algorithms", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert len(res.json()) >= 1

    # 5. Search question (empty/whitespace match should fail 400)
    res = await client.get("/api/v1/questions/search?q=   ", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 400

    # 6. List questions with subject and difficulty filters
    res = await client.get(f"/api/v1/questions?subject_id={subject_id}&question_type=mcq&difficulty=medium", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert len(res.json()) == 1

    # 7. Update question (modify difficulty, marks and update options)
    update_payload = {
        "difficulty": "hard",
        "marks": 4.0,
        "options": [
            {"option_text": "O(N log N)", "is_correct": True},
            {"option_text": "O(N^2)", "is_correct": False},
            {"option_text": "O(N)", "is_correct": False}
        ]
    }
    res = await client.patch(f"/api/v1/questions/{q_id}", json=update_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200
    assert res.json()["difficulty"] == "hard"
    assert len(res.json()["options"]) == 3

    # 8. Delete question
    res = await client.delete(f"/api/v1/questions/{q_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 200

    # 9. Get deleted question (Should fail 404)
    res = await client.get(f"/api/v1/questions/{q_id}", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 404


async def test_image_upload(client, create_token):
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")

    # 1. Valid image upload
    files = {"file": ("test.png", b"fake-image-bytes", "image/png")}
    res = await client.post(
        "/api/v1/questions/upload-image",
        files=files,
        headers={"Authorization": f"Bearer {examiner_token}"}
    )
    assert res.status_code == 200
    assert "url" in res.json()
    assert res.json()["url"].startswith("/static/uploads/")

    # 2. Invalid file format
    files = {"file": ("test.txt", b"some text", "text/plain")}
    res = await client.post(
        "/api/v1/questions/upload-image",
        files=files,
        headers={"Authorization": f"Bearer {examiner_token}"}
    )
    assert res.status_code == 400

    # 3. Oversized file
    oversized_data = b"x" * (5 * 1024 * 1024 + 10)
    files = {"file": ("large.png", oversized_data, "image/png")}
    res = await client.post(
        "/api/v1/questions/upload-image",
        files=files,
        headers={"Authorization": f"Bearer {examiner_token}"}
    )
    assert res.status_code == 400
