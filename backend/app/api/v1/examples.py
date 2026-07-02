from fastapi import APIRouter, Depends, status
from app.models.users import User
from app.dependencies.auth import (
    get_current_user,
    get_current_admin,
    get_current_examiner,
    get_current_student,
    RoleChecker,
)

router = APIRouter(prefix="/examples", tags=["Authorization Examples"])


@router.get(
    "/any-user",
    summary="Access for any authenticated user",
    description="Accessible by candidates, examiners, and admins."
)
async def any_user_route(current_user: User = Depends(get_current_user)):
    return {
        "message": f"Hello {current_user.full_name}, you have successfully accessed this route.",
        "user_id": str(current_user.id),
        "user_role": current_user.role.value
    }


@router.get(
    "/admin-dashboard",
    summary="Admin only route",
    description="Accessible ONLY by users with 'admin' role.",
)
async def admin_only_route(current_user: User = Depends(get_current_admin)):
    return {
        "message": "Welcome, Administrator. You have access to this dashboard.",
        "admin_id": str(current_user.id),
        "email": current_user.email
    }


@router.get(
    "/examiner-panel",
    summary="Examiner only route",
    description="Accessible ONLY by users with 'examiner' role.",
)
async def examiner_only_route(current_user: User = Depends(get_current_examiner)):
    return {
        "message": "Welcome, Examiner. You have access to this panel.",
        "examiner_id": str(current_user.id),
        "email": current_user.email
    }


@router.get(
    "/student-workspace",
    summary="Student only route",
    description="Accessible ONLY by users with 'student' role.",
)
async def student_only_route(current_user: User = Depends(get_current_student)):
    return {
        "message": "Welcome, Student. You have access to this workspace.",
        "student_id": str(current_user.id),
        "email": current_user.email
    }


@router.get(
    "/staff-only",
    summary="Staff (Admin + Examiner) route",
    description="Accessible by users with EITHER 'admin' OR 'examiner' roles using the RoleChecker.",
)
async def staff_only_route(
    current_user: User = Depends(RoleChecker(["admin", "examiner"]))
):
    return {
        "message": "Welcome, Staff. You have access to this internal database.",
        "user_id": str(current_user.id),
        "user_role": current_user.role.value
    }
