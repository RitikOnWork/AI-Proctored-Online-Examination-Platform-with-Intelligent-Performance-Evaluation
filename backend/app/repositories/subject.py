from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.subjects import Subject
from app.repositories.base import BaseRepository


class SubjectRepository(BaseRepository[Subject]):
    def __init__(self, db_session: AsyncSession):
        super().__init__(Subject, db_session)

    async def get_by_name(self, name: str) -> Optional[Subject]:
        """
        Retrieve a single Subject by its name.
        """
        query = select(self.model).where(self.model.name == name)
        result = await self.db.execute(query)
        return result.scalar_one_or_none()
