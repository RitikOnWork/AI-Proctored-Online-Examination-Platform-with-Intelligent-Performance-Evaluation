import sys
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.pool import NullPool
from app.main import app
from app.database import get_db
from app.core.settings import settings

# 1. Resolve Windows Proactor event loop issues during socket teardowns
if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

# 2. Instantiate a dedicated test engine using NullPool to prevent connection caching
testing_engine = create_async_engine(
    settings.DATABASE_URL,
    poolclass=NullPool
)


@pytest_asyncio.fixture(scope="session", autouse=True)
async def cleanup_database_engine():
    """
    Teardown connection pool at session exit.
    """
    yield
    await testing_engine.dispose()


@pytest_asyncio.fixture
async def db_session():
    """
    Yields an AsyncSession wrapped in a transaction that is rolled back 
    upon test completion to keep the database clean and isolated.
    """
    TestingSessionLocal = async_sessionmaker(
        bind=testing_engine,
        expire_on_commit=False,
        class_=AsyncSession
    )
    async with TestingSessionLocal() as session:
        async with session.begin():
            yield session
            # Rollback transaction so tests don't pollute database
            await session.rollback()
        # Explicitly close to release resources immediately within the active loop
        await session.close()


@pytest_asyncio.fixture
async def client(db_session):
    """
    FastAPI HTTPX AsyncClient with overridden database dependencies.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()


@pytest_asyncio.fixture
async def create_token(client):
    """
    Helper fixture to register, login, and return JWT access tokens for different roles.
    """
    async def _token(email: str, role: str) -> str:
        # Register
        await client.post(
            "/api/v1/auth/register",
            json={
                "email": email,
                "full_name": f"{role.capitalize()} User",
                "password": "password123",
                "role": role
            }
        )
        # Login
        res = await client.post(
            "/api/v1/auth/login",
            data={
                "username": email,
                "password": "password123"
            }
        )
        return res.json()["access_token"]
    return _token
