from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.users import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(User, db_session)

    async def get_by_email(self, email: str) -> Optional[User]:
        """
        Retrieve a single User by email address.
        """
        query = select(self.model).where(self.model.email == email)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
