from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.examples import router as examples_router
from app.api.v1.subjects import router as subjects_router
from app.api.v1.questions import router as questions_router
from app.api.v1.exams import router as exams_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(examples_router)
api_router.include_router(subjects_router)
api_router.include_router(questions_router)
api_router.include_router(exams_router)
