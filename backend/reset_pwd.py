import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import bcrypt

DATABASE_URL = "postgresql+asyncpg://postgres:ritik2006@localhost:5432/proctored_exam_db"

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")
    salt = bcrypt.gensalt()
    hashed = bcrypt.hashpw(pwd_bytes, salt)
    return hashed.decode("utf-8")

async def main():
    engine = create_async_engine(DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    
    async with async_session() as session:
        async with session.begin():
            password = "admin@123"
            hashed = hash_password(password)
            # Update password for admin@proctorai.com
            result = await session.execute(
                text('UPDATE "user" SET hashed_password = :hashed WHERE email = :email'),
                {"hashed": hashed, "email": "admin@proctorai.com"}
            )
            print(f"Rows updated: {result.rowcount}")
            
    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
