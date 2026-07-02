from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from app.core.settings import settings
from app.database import get_db

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for AI-Proctored Online Examination Platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Set CORS middleware
if settings.CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

from app.api.v1.router import api_router

app.include_router(api_router, prefix=settings.API_V1_STR)


@app.get("/", tags=["Health Check"])
async def root():
    return {
        "message": "Welcome to AI-Proctored Online Examination Platform API",
        "docs": "/docs",
        "status": "healthy"
    }


@app.get(f"{settings.API_V1_STR}/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "ok",
        "environment": settings.ENVIRONMENT,
        "debug": settings.DEBUG
    }


@app.get(f"{settings.API_V1_STR}/db-check", tags=["Health Check"])
async def db_check(db: AsyncSession = Depends(get_db)):
    try:
        # Check connection
        result = await db.execute(text("SELECT 1"))
        return {"status": "connected", "result": result.scalar()}
    except Exception as e:
        return {"status": "failed", "error": str(e)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
