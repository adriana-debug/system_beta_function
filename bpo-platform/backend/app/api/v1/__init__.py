"""API v1 router."""

from fastapi import APIRouter

from app.api.v1.endpoints import auth, users, roles, departments, employees, processes, workflows, analytics

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
api_router.include_router(roles.router, prefix="/roles", tags=["Roles"])
api_router.include_router(departments.router, prefix="/departments", tags=["Departments"])
api_router.include_router(employees.router, prefix="/employees", tags=["Employees"])
api_router.include_router(processes.router, prefix="/processes", tags=["Processes"])
api_router.include_router(workflows.router, prefix="/workflows", tags=["Workflows"])
api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])
