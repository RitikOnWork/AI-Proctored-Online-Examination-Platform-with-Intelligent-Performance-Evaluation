import os
from typing import List, Union
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        # Read .env file from the backend folder or project root
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_ignore_empty=True, 
        extra="ignore"
    )

    PROJECT_NAME: str = "ProctorAI"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # AI Configurations
    GROQ_API_KEY: str = "your_groq_api_key_here"
    AI_SERVICE_API_KEY: str = "your_ai_api_key_here"

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres_password_change_me@localhost:5432/proctored_exam_db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "supersecretkeythatisatleast32characterslongpleasechangeinproduction"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 10080

    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)


settings = Settings()
