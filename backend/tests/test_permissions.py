import pytest
import uuid

pytestmark = pytest.mark.asyncio


async def test_subject_management_permissions(client, create_token):
    admin_email = f"admin_{uuid.uuid4().hex[:6]}@example.com"
    examiner_email = f"examiner_{uuid.uuid4().hex[:6]}@example.com"
    student_email = f"student_{uuid.uuid4().hex[:6]}@example.com"

    admin_token = await create_token(admin_email, "admin")
    examiner_token = await create_token(examiner_email, "examiner")
    student_token = await create_token(student_email, "student")

    subject_payload = {
        "name": f"Subj_{uuid.uuid4().hex[:6]}",
        "description": "Permissions testing"
    }

    # 1. Student tries to create subject (Should fail 403)
    res = await client.post("/api/v1/subjects", json=subject_payload, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403
    assert "not have permission" in res.json()["detail"].lower()

    # 2. Examiner tries to create subject (Should fail 403)
    res = await client.post("/api/v1/subjects", json=subject_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 403
    assert "not have permission" in res.json()["detail"].lower()

    # 3. Admin creates subject (Should pass 201)
    res = await client.post("/api/v1/subjects", json=subject_payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 201


async def test_question_management_permissions(client, create_token):
    admin_email = f"admin_{uuid.uuid4().hex[:6]}@example.com"
    examiner_email = f"examiner_{uuid.uuid4().hex[:6]}@example.com"
    student_email = f"student_{uuid.uuid4().hex[:6]}@example.com"

    admin_token = await create_token(admin_email, "admin")
    examiner_token = await create_token(examiner_email, "examiner")
    student_token = await create_token(student_email, "student")

    # Admin creates subject
    res = await client.post("/api/v1/subjects", json={"name": f"CS_{uuid.uuid4().hex[:6]}"}, headers={"Authorization": f"Bearer {admin_token}"})
    subject_id = res.json()["id"]

    # Question payload
    q_payload = {
        "title": "Permissions check",
        "question_text": "Is this authorized?",
        "question_type": "short_answer",
        "subject_id": subject_id,
        "difficulty": "medium",
        "marks": 1.0
    }

    # 1. Student creates question (Should fail 403)
    res = await client.post("/api/v1/questions", json=q_payload, headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    # 2. Examiner creates question (Should pass 201)
    res = await client.post("/api/v1/questions", json=q_payload, headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 201


async def test_authorization_examples_routes(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")
    student_token = await create_token(f"student_{uuid.uuid4().hex[:6]}@example.com", "student")

    # 1. Test Student accesses
    headers = {"Authorization": f"Bearer {student_token}"}
    res = await client.get("/api/v1/examples/any-user", headers=headers)
    assert res.status_code == 200
    res = await client.get("/api/v1/examples/admin-dashboard", headers=headers)
    assert res.status_code == 403
    res = await client.get("/api/v1/examples/examiner-panel", headers=headers)
    assert res.status_code == 403
    res = await client.get("/api/v1/examples/student-workspace", headers=headers)
    assert res.status_code == 200
    res = await client.get("/api/v1/examples/staff-only", headers=headers)
    assert res.status_code == 403

    # 2. Test Examiner accesses
    headers = {"Authorization": f"Bearer {examiner_token}"}
    res = await client.get("/api/v1/examples/any-user", headers=headers)
    assert res.status_code == 200
    res = await client.get("/api/v1/examples/admin-dashboard", headers=headers)
    assert res.status_code == 403
    res = await client.get("/api/v1/examples/examiner-panel", headers=headers)
    assert res.status_code == 200
    res = await client.get("/api/v1/examples/student-workspace", headers=headers)
    assert res.status_code == 403
    res = await client.get("/api/v1/examples/staff-only", headers=headers)
    assert res.status_code == 200

    # 3. Test Admin accesses
    headers = {"Authorization": f"Bearer {admin_token}"}
    res = await client.get("/api/v1/examples/any-user", headers=headers)
    assert res.status_code == 200
    res = await client.get("/api/v1/examples/admin-dashboard", headers=headers)
    assert res.status_code == 200
    res = await client.get("/api/v1/examples/examiner-panel", headers=headers)
    assert res.status_code == 403
    res = await client.get("/api/v1/examples/student-workspace", headers=headers)
    assert res.status_code == 403
    res = await client.get("/api/v1/examples/staff-only", headers=headers)
    assert res.status_code == 200
