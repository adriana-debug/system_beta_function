"""Analytics and reporting endpoints."""

from datetime import datetime, timedelta, timezone
from uuid import UUID

from fastapi import APIRouter, Query
from pydantic import BaseModel
from sqlalchemy import func, select, and_, case

from app.api.deps import DBSession, CurrentUser
from app.models.user import User
from app.models.department import Department
from app.models.process import Process, ProcessStatus
from app.models.workflow import (
    Workflow,
    WorkflowInstance,
    WorkflowTask,
    TaskStatus,
)

router = APIRouter()


class DashboardStats(BaseModel):
    """Dashboard overview statistics."""

    total_users: int
    active_users: int
    total_departments: int
    total_processes: int
    active_workflows: int
    pending_tasks: int
    in_progress_tasks: int
    completed_tasks_today: int
    sla_breached_count: int


class TrendDataPoint(BaseModel):
    """Single data point for trend charts."""

    date: str
    value: int


class ProcessPerformance(BaseModel):
    """Process performance metrics."""

    process_id: UUID
    process_name: str
    total_instances: int
    completed_instances: int
    avg_completion_hours: float | None
    sla_compliance_rate: float


class UserProductivity(BaseModel):
    """User productivity metrics."""

    user_id: UUID
    user_name: str
    tasks_completed: int
    avg_task_duration_hours: float | None
    sla_breached_count: int


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(
    db: DBSession,
    current_user: CurrentUser,
):
    """Get dashboard overview statistics."""
    today_start = datetime.now(timezone.utc).replace(hour=0, minute=0, second=0, microsecond=0)

    # User counts
    total_users = (
        await db.execute(
            select(func.count(User.id)).where(User.is_deleted == False)
        )
    ).scalar() or 0

    active_users = (
        await db.execute(
            select(func.count(User.id)).where(
                User.is_deleted == False,
                User.is_active == True,
            )
        )
    ).scalar() or 0

    # Department count
    total_departments = (
        await db.execute(
            select(func.count(Department.id)).where(Department.is_deleted == False)
        )
    ).scalar() or 0

    # Process count
    total_processes = (
        await db.execute(
            select(func.count(Process.id)).where(Process.is_deleted == False)
        )
    ).scalar() or 0

    # Active workflows
    active_workflows = (
        await db.execute(
            select(func.count(WorkflowInstance.id)).where(
                WorkflowInstance.is_deleted == False,
                WorkflowInstance.status == TaskStatus.IN_PROGRESS,
            )
        )
    ).scalar() or 0

    # Task counts
    pending_tasks = (
        await db.execute(
            select(func.count(WorkflowTask.id)).where(
                WorkflowTask.is_deleted == False,
                WorkflowTask.status == TaskStatus.PENDING,
            )
        )
    ).scalar() or 0

    in_progress_tasks = (
        await db.execute(
            select(func.count(WorkflowTask.id)).where(
                WorkflowTask.is_deleted == False,
                WorkflowTask.status == TaskStatus.IN_PROGRESS,
            )
        )
    ).scalar() or 0

    completed_tasks_today = (
        await db.execute(
            select(func.count(WorkflowTask.id)).where(
                WorkflowTask.is_deleted == False,
                WorkflowTask.status == TaskStatus.COMPLETED,
                WorkflowTask.completed_at >= today_start,
            )
        )
    ).scalar() or 0

    sla_breached_count = (
        await db.execute(
            select(func.count(WorkflowTask.id)).where(
                WorkflowTask.is_deleted == False,
                WorkflowTask.sla_breached == True,
            )
        )
    ).scalar() or 0

    return DashboardStats(
        total_users=total_users,
        active_users=active_users,
        total_departments=total_departments,
        total_processes=total_processes,
        active_workflows=active_workflows,
        pending_tasks=pending_tasks,
        in_progress_tasks=in_progress_tasks,
        completed_tasks_today=completed_tasks_today,
        sla_breached_count=sla_breached_count,
    )


@router.get("/tasks/trends", response_model=list[TrendDataPoint])
async def get_task_completion_trends(
    db: DBSession,
    current_user: CurrentUser,
    days: int = Query(default=30, ge=7, le=90),
):
    """Get task completion trends over time."""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(WorkflowTask.completed_at).label("date"),
            func.count(WorkflowTask.id).label("count"),
        )
        .where(
            WorkflowTask.is_deleted == False,
            WorkflowTask.status == TaskStatus.COMPLETED,
            WorkflowTask.completed_at >= start_date,
        )
        .group_by(func.date(WorkflowTask.completed_at))
        .order_by(func.date(WorkflowTask.completed_at))
    )

    data = result.all()

    return [
        TrendDataPoint(date=str(row.date), value=row.count)
        for row in data
    ]


@router.get("/workflows/trends", response_model=list[TrendDataPoint])
async def get_workflow_creation_trends(
    db: DBSession,
    current_user: CurrentUser,
    days: int = Query(default=30, ge=7, le=90),
):
    """Get workflow instance creation trends over time."""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    result = await db.execute(
        select(
            func.date(WorkflowInstance.created_at).label("date"),
            func.count(WorkflowInstance.id).label("count"),
        )
        .where(
            WorkflowInstance.is_deleted == False,
            WorkflowInstance.created_at >= start_date,
        )
        .group_by(func.date(WorkflowInstance.created_at))
        .order_by(func.date(WorkflowInstance.created_at))
    )

    data = result.all()

    return [
        TrendDataPoint(date=str(row.date), value=row.count)
        for row in data
    ]


@router.get("/processes/performance", response_model=list[ProcessPerformance])
async def get_process_performance(
    db: DBSession,
    current_user: CurrentUser,
    department_id: UUID | None = None,
):
    """Get process performance metrics."""
    query = (
        select(Process)
        .where(Process.is_deleted == False)
        .where(Process.status == ProcessStatus.ACTIVE)
    )

    if department_id:
        query = query.where(Process.department_id == department_id)

    result = await db.execute(query)
    processes = result.scalars().all()

    performance_data = []

    for process in processes:
        # Get workflow instances for this process
        instances_result = await db.execute(
            select(WorkflowInstance)
            .join(Workflow)
            .where(
                Workflow.process_id == process.id,
                WorkflowInstance.is_deleted == False,
            )
        )
        instances = instances_result.scalars().all()

        total_instances = len(instances)
        completed_instances = len([i for i in instances if i.status == TaskStatus.COMPLETED])

        # Calculate average completion time
        completed_with_times = [
            i for i in instances
            if i.status == TaskStatus.COMPLETED and i.started_at and i.completed_at
        ]

        avg_completion_hours = None
        if completed_with_times:
            total_hours = sum(
                (i.completed_at - i.started_at).total_seconds() / 3600
                for i in completed_with_times
            )
            avg_completion_hours = round(total_hours / len(completed_with_times), 2)

        # SLA compliance (simplified - instances without SLA breach)
        sla_compliance_rate = 100.0
        if total_instances > 0:
            breached_count = await db.execute(
                select(func.count(WorkflowTask.id))
                .join(WorkflowInstance)
                .join(Workflow)
                .where(
                    Workflow.process_id == process.id,
                    WorkflowTask.sla_breached == True,
                )
            )
            breached = breached_count.scalar() or 0
            if breached > 0:
                sla_compliance_rate = round((1 - breached / total_instances) * 100, 2)

        performance_data.append(
            ProcessPerformance(
                process_id=process.id,
                process_name=process.name,
                total_instances=total_instances,
                completed_instances=completed_instances,
                avg_completion_hours=avg_completion_hours,
                sla_compliance_rate=sla_compliance_rate,
            )
        )

    return performance_data


@router.get("/users/productivity", response_model=list[UserProductivity])
async def get_user_productivity(
    db: DBSession,
    current_user: CurrentUser,
    department_id: UUID | None = None,
    days: int = Query(default=30, ge=7, le=90),
):
    """Get user productivity metrics."""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    query = select(User).where(User.is_deleted == False, User.is_active == True)

    if department_id:
        from app.models.department import DepartmentUser
        query = query.join(DepartmentUser).where(DepartmentUser.department_id == department_id)

    result = await db.execute(query)
    users = result.scalars().all()

    productivity_data = []

    for user in users:
        # Get completed tasks
        tasks_result = await db.execute(
            select(WorkflowTask)
            .where(
                WorkflowTask.assigned_to_id == user.id,
                WorkflowTask.status == TaskStatus.COMPLETED,
                WorkflowTask.completed_at >= start_date,
                WorkflowTask.is_deleted == False,
            )
        )
        tasks = tasks_result.scalars().all()

        tasks_completed = len(tasks)

        # Calculate average task duration
        tasks_with_times = [
            t for t in tasks if t.started_at and t.completed_at
        ]

        avg_task_duration_hours = None
        if tasks_with_times:
            total_hours = sum(
                (t.completed_at - t.started_at).total_seconds() / 3600
                for t in tasks_with_times
            )
            avg_task_duration_hours = round(total_hours / len(tasks_with_times), 2)

        # SLA breached count
        sla_breached_count = len([t for t in tasks if t.sla_breached])

        productivity_data.append(
            UserProductivity(
                user_id=user.id,
                user_name=user.full_name,
                tasks_completed=tasks_completed,
                avg_task_duration_hours=avg_task_duration_hours,
                sla_breached_count=sla_breached_count,
            )
        )

    # Sort by tasks completed descending
    productivity_data.sort(key=lambda x: x.tasks_completed, reverse=True)

    return productivity_data


@router.get("/sla/summary")
async def get_sla_summary(
    db: DBSession,
    current_user: CurrentUser,
    days: int = Query(default=30, ge=7, le=90),
):
    """Get SLA compliance summary."""
    start_date = datetime.now(timezone.utc) - timedelta(days=days)

    total_tasks = (
        await db.execute(
            select(func.count(WorkflowTask.id)).where(
                WorkflowTask.is_deleted == False,
                WorkflowTask.created_at >= start_date,
            )
        )
    ).scalar() or 0

    breached_tasks = (
        await db.execute(
            select(func.count(WorkflowTask.id)).where(
                WorkflowTask.is_deleted == False,
                WorkflowTask.sla_breached == True,
                WorkflowTask.created_at >= start_date,
            )
        )
    ).scalar() or 0

    compliance_rate = 100.0
    if total_tasks > 0:
        compliance_rate = round((1 - breached_tasks / total_tasks) * 100, 2)

    return {
        "period_days": days,
        "total_tasks": total_tasks,
        "breached_tasks": breached_tasks,
        "compliant_tasks": total_tasks - breached_tasks,
        "compliance_rate": compliance_rate,
    }
