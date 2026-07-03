import pytest
import uuid
import jwt
from app.core.security import create_access_token, verify_token, verify_password
from app.core.settings import settings

pytestmark = pytest.mark.asyncio


async def test_user_registration(client):
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    payload = {
        "email": email,
        "full_name": "Test User",
        "password": "password123",
        "role": "student"
    }
    res = await client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201
    assert res.json()["email"] == email
    assert "hashed_password" not in res.json()


async def test_duplicate_registration(client):
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    payload = {
        "email": email,
        "full_name": "Test User",
        "password": "password123",
        "role": "student"
    }
    res = await client.post("/api/v1/auth/register", json=payload)
    assert res.status_code == 201

    # Duplicate call
    res2 = await client.post("/api/v1/auth/register", json=payload)
    assert res2.status_code == 400
    assert "already exists" in res2.json()["detail"].lower()


async def test_login_flow(client):
    email = f"user_{uuid.uuid4().hex[:6]}@example.com"
    await client.post("/api/v1/auth/register", json={
        "email": email,
        "full_name": "Test User",
        "password": "password123",
        "role": "student"
    })

    # Correct credentials
    res = await client.post("/api/v1/auth/login", data={"username": email, "password": "password123"})
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert "refresh_token" in res.json()

    # Incorrect credentials
    res2 = await client.post("/api/v1/auth/login", data={"username": email, "password": "wrongpassword"})
    assert res2.status_code == 401


async def test_get_current_user_profile(client, create_token):
    email = f"student_{uuid.uuid4().hex[:6]}@example.com"
    token = await create_token(email, "student")
    
    res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == email


async def test_jwt_signature_and_expiration():
    # Test valid token
    subject = str(uuid.uuid4())
    token = create_access_token(subject=subject, role="student")
    payload = verify_token(token)
    assert payload is not None
    assert payload["sub"] == subject
    assert payload["role"] == "student"

    # Test invalid token signature
    invalid_token = token + "corrupt"
    payload = verify_token(invalid_token)
    assert payload is None

    # Test expired token
    import datetime
    expired_payload = {
        "sub": subject,
        "role": "student",
        "exp": int((datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(seconds=1)).timestamp()),
        "type": "access"
    }
    expired_token = jwt.encode(expired_payload, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    payload = verify_token(expired_token)
    assert payload is None


async def test_health_check_route(client):
    res = await client.get("/")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
