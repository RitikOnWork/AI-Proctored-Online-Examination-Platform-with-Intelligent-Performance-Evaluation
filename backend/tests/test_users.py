import pytest
import uuid
from app.models.users import UserRole

pytestmark = pytest.mark.asyncio


async def test_user_management_permissions(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")
    examiner_token = await create_token(f"examiner_{uuid.uuid4().hex[:6]}@example.com", "examiner")
    student_token = await create_token(f"student_{uuid.uuid4().hex[:6]}@example.com", "student")

    # 1. Student tries to list users (Should fail 403)
    res = await client.get("/api/v1/users", headers={"Authorization": f"Bearer {student_token}"})
    assert res.status_code == 403

    # 2. Examiner tries to list users (Should fail 403)
    res = await client.get("/api/v1/users", headers={"Authorization": f"Bearer {examiner_token}"})
    assert res.status_code == 403

    # 3. Admin tries to list users (Should pass 200)
    res = await client.get("/api/v1/users", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200


async def test_user_crud_flow(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")

    # 1. Create a user (Student)
    new_user_email = f"new_student_{uuid.uuid4().hex[:6]}@example.com"
    create_payload = {
        "email": new_user_email,
        "full_name": "John Doe",
        "role": "student",
        "password": "supersecurepassword123",
        "is_active": True
    }
    res = await client.post(
        "/api/v1/users",
        json=create_payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 201
    user_id = res.json()["id"]
    assert res.json()["email"] == new_user_email
    assert res.json()["full_name"] == "John Doe"
    assert res.json()["role"] == "student"
    assert res.json()["is_active"] is True

    # 2. Get user by ID
    res = await client.get(
        f"/api/v1/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    assert res.json()["email"] == new_user_email

    # 3. Update user (change role to examiner, change name, toggle active, reset password)
    update_payload = {
        "full_name": "John The Examiner",
        "role": "examiner",
        "is_active": False,
        "password": "evenmoresecurepassword99"
    }
    res = await client.put(
        f"/api/v1/users/{user_id}",
        json=update_payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    assert res.json()["full_name"] == "John The Examiner"
    assert res.json()["role"] == "examiner"
    assert res.json()["is_active"] is False

    # Try logging in with the new password and verify it succeeds
    # (First must make it active again to authenticate)
    await client.put(
        f"/api/v1/users/{user_id}",
        json={"is_active": True},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    login_res = await client.post(
        "/api/v1/auth/login",
        data={"username": new_user_email, "password": "evenmoresecurepassword99"}
    )
    assert login_res.status_code == 200
    assert "access_token" in login_res.json()

    # 4. Soft-delete the user
    res = await client.delete(
        f"/api/v1/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    assert res.json()["is_active"] is False

    # Get user details should now fail (soft-deleted)
    res_get = await client.get(
        f"/api/v1/users/{user_id}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res_get.status_code == 404


async def test_duplicate_email_prevention(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")

    email = f"shared_{uuid.uuid4().hex[:6]}@example.com"
    # Create first
    await client.post(
        "/api/v1/users",
        json={"email": email, "full_name": "First User", "role": "student", "password": "password123"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # Attempt to create duplicate
    res = await client.post(
        "/api/v1/users",
        json={"email": email, "full_name": "Second User", "role": "examiner", "password": "password123"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 400
    assert "already exists" in res.json()["detail"].lower()


async def test_list_filtering(client, create_token):
    admin_token = await create_token(f"admin_{uuid.uuid4().hex[:6]}@example.com", "admin")

    # Create distinct examiner and student
    exam_email = f"match_examiner_{uuid.uuid4().hex[:6]}@example.com"
    await client.post(
        "/api/v1/users",
        json={"email": exam_email, "full_name": "Alice Wonderland", "role": "examiner", "password": "password123"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    stud_email = f"match_student_{uuid.uuid4().hex[:6]}@example.com"
    await client.post(
        "/api/v1/users",
        json={"email": stud_email, "full_name": "Bob Builder", "role": "student", "password": "password123"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )

    # 1. Filter by role
    res = await client.get(
        "/api/v1/users?role=examiner",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    roles = [u["role"] for u in res.json()]
    assert "examiner" in roles
    # The list contains examiner and admin (since create_token created an admin user) but not the new student
    assert stud_email not in [u["email"] for u in res.json()]

    # 2. Filter by search keyword (full name)
    res = await client.get(
        "/api/v1/users?search=Wonderland",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    emails = [u["email"] for u in res.json()]
    assert exam_email in emails
    assert stud_email not in emails

    # 3. Filter by search keyword (email)
    res = await client.get(
        f"/api/v1/users?search={stud_email}",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    emails = [u["email"] for u in res.json()]
    assert stud_email in emails
    assert exam_email not in emails
