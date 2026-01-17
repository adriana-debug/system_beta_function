"""Workflow engine service for managing workflow execution."""

import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.workflow import (
    Workflow,
    WorkflowStage,
    WorkflowInstance,
    WorkflowTask,
    WorkflowStatus,
    TaskStatus,
    AssignmentRule,
)
from app.models.user import User


class WorkflowEngine:
    """Engine for managing workflow execution."""

    def __init__(self, db: AsyncSession):
        self.db = db

    async def start_instance(
        self,
        workflow_id: uuid.UUID,
        data: dict | None = None,
        priority: int = 5,
        due_at: datetime | None = None,
        created_by: uuid.UUID | None = None,
    ) -> WorkflowInstance:
        """Start a new workflow instance."""
        result = await self.db.execute(
            select(Workflow)
            .options(selectinload(Workflow.stages))
            .where(Workflow.id == workflow_id)
            .where(Workflow.status == WorkflowStatus.ACTIVE)
        )
        workflow = result.scalar_one_or_none()

        if not workflow:
            raise ValueError("Active workflow not found")

        if not workflow.stages:
            raise ValueError("Workflow has no stages")

        sorted_stages = sorted(workflow.stages, key=lambda s: s.order)
        first_stage = sorted_stages[0]

        # Generate reference number
        timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
        ref_suffix = uuid.uuid4().hex[:6].upper()
        reference_number = f"WF-{timestamp}-{ref_suffix}"

        instance = WorkflowInstance(
            workflow_id=workflow.id,
            reference_number=reference_number,
            status=TaskStatus.IN_PROGRESS,
            priority=priority,
            data=data,
            due_at=due_at,
            started_at=datetime.now(timezone.utc),
            current_stage_id=first_stage.id,
            created_by=created_by,
        )

        self.db.add(instance)
        await self.db.flush()

        # Create tasks for all stages
        for idx, stage in enumerate(sorted_stages):
            task = WorkflowTask(
                instance_id=instance.id,
                stage_id=stage.id,
                status=TaskStatus.IN_PROGRESS if idx == 0 else TaskStatus.PENDING,
                started_at=datetime.now(timezone.utc) if idx == 0 else None,
                created_by=created_by,
            )

            # Calculate due date if stage has SLA
            if stage.sla_minutes:
                task.due_at = datetime.now(timezone.utc) + timedelta(minutes=stage.sla_minutes)

            # Auto-assign based on rule
            assigned_user = await self._get_assigned_user(stage)
            if assigned_user:
                task.assigned_to_id = assigned_user.id

            self.db.add(task)

        await self.db.commit()
        return instance

    async def complete_task(
        self,
        task_id: uuid.UUID,
        data: dict | None = None,
        notes: str | None = None,
        completed_by: uuid.UUID | None = None,
    ) -> WorkflowTask:
        """Complete a task and advance workflow if applicable."""
        result = await self.db.execute(
            select(WorkflowTask)
            .options(
                selectinload(WorkflowTask.stage),
                selectinload(WorkflowTask.instance).selectinload(WorkflowInstance.tasks).selectinload(WorkflowTask.stage),
            )
            .where(WorkflowTask.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            raise ValueError("Task not found")

        if task.status == TaskStatus.COMPLETED:
            raise ValueError("Task already completed")

        # Check SLA breach
        if task.due_at and datetime.now(timezone.utc) > task.due_at:
            task.sla_breached = True

        task.status = TaskStatus.COMPLETED
        task.completed_at = datetime.now(timezone.utc)
        task.data = data or task.data
        task.notes = notes or task.notes
        task.updated_by = completed_by

        # Find next task
        instance = task.instance
        sorted_tasks = sorted(instance.tasks, key=lambda t: t.stage.order)
        current_idx = next(i for i, t in enumerate(sorted_tasks) if t.id == task.id)

        if current_idx < len(sorted_tasks) - 1:
            # Start next task
            next_task = sorted_tasks[current_idx + 1]
            next_task.status = TaskStatus.IN_PROGRESS
            next_task.started_at = datetime.now(timezone.utc)
            instance.current_stage_id = next_task.stage_id

            # Auto-assign next task
            result = await self.db.execute(
                select(WorkflowStage).where(WorkflowStage.id == next_task.stage_id)
            )
            next_stage = result.scalar_one()
            assigned_user = await self._get_assigned_user(next_stage)
            if assigned_user:
                next_task.assigned_to_id = assigned_user.id
        else:
            # Workflow complete
            instance.status = TaskStatus.COMPLETED
            instance.completed_at = datetime.now(timezone.utc)
            instance.current_stage_id = None

        await self.db.commit()
        return task

    async def assign_task(
        self,
        task_id: uuid.UUID,
        user_id: uuid.UUID,
        assigned_by: uuid.UUID | None = None,
    ) -> WorkflowTask:
        """Assign a task to a user."""
        result = await self.db.execute(
            select(WorkflowTask).where(WorkflowTask.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            raise ValueError("Task not found")

        task.assigned_to_id = user_id
        task.updated_by = assigned_by
        await self.db.commit()
        return task

    async def skip_task(
        self,
        task_id: uuid.UUID,
        reason: str | None = None,
        skipped_by: uuid.UUID | None = None,
    ) -> WorkflowTask:
        """Skip a non-required task."""
        result = await self.db.execute(
            select(WorkflowTask)
            .options(selectinload(WorkflowTask.stage))
            .where(WorkflowTask.id == task_id)
        )
        task = result.scalar_one_or_none()

        if not task:
            raise ValueError("Task not found")

        if task.stage.is_required:
            raise ValueError("Cannot skip required task")

        task.status = TaskStatus.SKIPPED
        task.completed_at = datetime.now(timezone.utc)
        task.notes = reason
        task.updated_by = skipped_by

        await self.db.commit()
        return task

    async def cancel_instance(
        self,
        instance_id: uuid.UUID,
        reason: str | None = None,
        cancelled_by: uuid.UUID | None = None,
    ) -> WorkflowInstance:
        """Cancel a workflow instance."""
        result = await self.db.execute(
            select(WorkflowInstance)
            .options(selectinload(WorkflowInstance.tasks))
            .where(WorkflowInstance.id == instance_id)
        )
        instance = result.scalar_one_or_none()

        if not instance:
            raise ValueError("Instance not found")

        if instance.status == TaskStatus.COMPLETED:
            raise ValueError("Cannot cancel completed instance")

        instance.status = TaskStatus.CANCELLED
        instance.completed_at = datetime.now(timezone.utc)
        instance.updated_by = cancelled_by

        # Cancel all pending tasks
        for task in instance.tasks:
            if task.status in [TaskStatus.PENDING, TaskStatus.IN_PROGRESS]:
                task.status = TaskStatus.CANCELLED
                task.notes = reason
                task.updated_by = cancelled_by

        await self.db.commit()
        return instance

    async def _get_assigned_user(self, stage: WorkflowStage) -> Optional[User]:
        """Get user to assign based on stage assignment rule."""
        if stage.assignment_rule == AssignmentRule.SPECIFIC_USER and stage.assigned_user_id:
            result = await self.db.execute(
                select(User).where(User.id == stage.assigned_user_id)
            )
            return result.scalar_one_or_none()

        elif stage.assignment_rule == AssignmentRule.ROLE_BASED and stage.assigned_role_id:
            # Get first active user with the role
            result = await self.db.execute(
                select(User)
                .where(User.role_id == stage.assigned_role_id)
                .where(User.is_active == True)
                .limit(1)
            )
            return result.scalar_one_or_none()

        elif stage.assignment_rule == AssignmentRule.ROUND_ROBIN and stage.assigned_role_id:
            # Simple round-robin: get user with fewest active tasks
            from sqlalchemy import func, outerjoin

            subquery = (
                select(
                    User.id,
                    func.count(WorkflowTask.id).label("task_count"),
                )
                .outerjoin(
                    WorkflowTask,
                    (WorkflowTask.assigned_to_id == User.id)
                    & (WorkflowTask.status == TaskStatus.IN_PROGRESS),
                )
                .where(User.role_id == stage.assigned_role_id)
                .where(User.is_active == True)
                .group_by(User.id)
                .order_by(func.count(WorkflowTask.id))
                .limit(1)
                .subquery()
            )

            result = await self.db.execute(
                select(User).where(User.id == subquery.c.id)
            )
            return result.scalar_one_or_none()

        elif stage.assignment_rule == AssignmentRule.LEAST_LOADED and stage.assigned_role_id:
            # Same as round-robin for simplicity
            return await self._get_assigned_user(
                WorkflowStage(
                    assignment_rule=AssignmentRule.ROUND_ROBIN,
                    assigned_role_id=stage.assigned_role_id,
                )
            )

        return None

    async def check_sla_breaches(self) -> list[WorkflowTask]:
        """Check and mark SLA breaches for overdue tasks."""
        now = datetime.now(timezone.utc)

        result = await self.db.execute(
            select(WorkflowTask)
            .where(WorkflowTask.status == TaskStatus.IN_PROGRESS)
            .where(WorkflowTask.due_at < now)
            .where(WorkflowTask.sla_breached == False)
        )
        overdue_tasks = result.scalars().all()

        for task in overdue_tasks:
            task.sla_breached = True

        if overdue_tasks:
            await self.db.commit()

        return overdue_tasks
