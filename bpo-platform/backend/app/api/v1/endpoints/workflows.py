"""Workflow management endpoints."""

import uuid as uuid_module
from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.api.deps import DBSession, CurrentUser, SuperUser
from app.models.workflow import (
    Workflow,
    WorkflowStage,
    WorkflowInstance,
    WorkflowTask,
    WorkflowStatus,
    TaskStatus,
)
from app.schemas.common import PaginatedResponse, MessageResponse
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowListResponse,
    WorkflowStageCreate,
    WorkflowStageUpdate,
    WorkflowStageResponse,
    WorkflowInstanceCreate,
    WorkflowInstanceResponse,
    WorkflowInstanceListResponse,
    WorkflowTaskUpdate,
    WorkflowTaskResponse,
)

router = APIRouter()


def generate_reference_number() -> str:
    """Generate unique reference number."""
    timestamp = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    unique_part = uuid_module.uuid4().hex[:6].upper()
    return f"WF-{timestamp}-{unique_part}"


@router.get("", response_model=PaginatedResponse[WorkflowListResponse])
async def list_workflows(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    search: str | None = None,
    status: WorkflowStatus | None = None,
    process_id: UUID | None = None,
):
    """List all workflows with pagination."""
    query = (
        select(Workflow)
        .options(
            selectinload(Workflow.process),
            selectinload(Workflow.stages),
            selectinload(Workflow.instances),
        )
        .where(Workflow.is_deleted == False)
    )

    if search:
        search_filter = f"%{search}%"
        query = query.where(
            (Workflow.name.ilike(search_filter))
            | (Workflow.code.ilike(search_filter))
        )

    if status:
        query = query.where(Workflow.status == status)

    if process_id:
        query = query.where(Workflow.process_id == process_id)

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(Workflow.created_at.desc())

    result = await db.execute(query)
    workflows = result.scalars().all()

    items = [
        WorkflowListResponse(
            id=wf.id,
            name=wf.name,
            code=wf.code,
            status=wf.status,
            process_name=wf.process.name,
            stage_count=len(wf.stages),
            instance_count=len(wf.instances),
            created_at=wf.created_at,
        )
        for wf in workflows
    ]

    return PaginatedResponse.create(items, total, page, page_size)


@router.post("", response_model=WorkflowResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow(
    workflow_in: WorkflowCreate,
    db: DBSession,
    current_user: SuperUser,
):
    """Create a new workflow with stages."""
    # Check code uniqueness
    existing = await db.execute(
        select(Workflow).where(Workflow.code == workflow_in.code)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow code already exists",
        )

    workflow = Workflow(
        name=workflow_in.name,
        code=workflow_in.code,
        description=workflow_in.description,
        process_id=workflow_in.process_id,
        created_by=current_user.id,
    )

    db.add(workflow)
    await db.flush()

    # Create stages
    for stage_data in workflow_in.stages:
        stage = WorkflowStage(
            workflow_id=workflow.id,
            name=stage_data.name,
            code=stage_data.code,
            description=stage_data.description,
            order=stage_data.order,
            is_required=stage_data.is_required,
            assignment_rule=stage_data.assignment_rule,
            assigned_role_id=stage_data.assigned_role_id,
            assigned_user_id=stage_data.assigned_user_id,
            sla_minutes=stage_data.sla_minutes,
            config=stage_data.config,
            created_by=current_user.id,
        )
        db.add(stage)

    await db.commit()

    # Reload with relationships
    result = await db.execute(
        select(Workflow)
        .options(
            selectinload(Workflow.process),
            selectinload(Workflow.stages),
            selectinload(Workflow.instances),
        )
        .where(Workflow.id == workflow.id)
    )
    workflow = result.scalar_one()

    return WorkflowResponse(
        id=workflow.id,
        name=workflow.name,
        code=workflow.code,
        description=workflow.description,
        status=workflow.status,
        version=workflow.version,
        process={
            "id": workflow.process.id,
            "name": workflow.process.name,
            "code": workflow.process.code,
        },
        stages=[
            WorkflowStageResponse(
                id=s.id,
                name=s.name,
                code=s.code,
                description=s.description,
                order=s.order,
                is_required=s.is_required,
                assignment_rule=s.assignment_rule,
                assigned_role_id=s.assigned_role_id,
                assigned_user_id=s.assigned_user_id,
                sla_minutes=s.sla_minutes,
                config=s.config,
            )
            for s in sorted(workflow.stages, key=lambda x: x.order)
        ],
        instance_count=len(workflow.instances),
        created_at=workflow.created_at,
        updated_at=workflow.updated_at,
    )


@router.get("/{workflow_id}", response_model=WorkflowResponse)
async def get_workflow(
    workflow_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get workflow by ID."""
    result = await db.execute(
        select(Workflow)
        .options(
            selectinload(Workflow.process),
            selectinload(Workflow.stages),
            selectinload(Workflow.instances),
        )
        .where(Workflow.id == workflow_id)
        .where(Workflow.is_deleted == False)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    return WorkflowResponse(
        id=workflow.id,
        name=workflow.name,
        code=workflow.code,
        description=workflow.description,
        status=workflow.status,
        version=workflow.version,
        process={
            "id": workflow.process.id,
            "name": workflow.process.name,
            "code": workflow.process.code,
        },
        stages=[
            WorkflowStageResponse(
                id=s.id,
                name=s.name,
                code=s.code,
                description=s.description,
                order=s.order,
                is_required=s.is_required,
                assignment_rule=s.assignment_rule,
                assigned_role_id=s.assigned_role_id,
                assigned_user_id=s.assigned_user_id,
                sla_minutes=s.sla_minutes,
                config=s.config,
            )
            for s in sorted(workflow.stages, key=lambda x: x.order)
        ],
        instance_count=len(workflow.instances),
        created_at=workflow.created_at,
        updated_at=workflow.updated_at,
    )


@router.patch("/{workflow_id}", response_model=WorkflowResponse)
async def update_workflow(
    workflow_id: UUID,
    workflow_in: WorkflowUpdate,
    db: DBSession,
    current_user: SuperUser,
):
    """Update workflow."""
    result = await db.execute(
        select(Workflow)
        .options(
            selectinload(Workflow.process),
            selectinload(Workflow.stages),
            selectinload(Workflow.instances),
        )
        .where(Workflow.id == workflow_id)
        .where(Workflow.is_deleted == False)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    update_data = workflow_in.model_dump(exclude_unset=True)

    for field, value in update_data.items():
        setattr(workflow, field, value)

    workflow.updated_by = current_user.id
    await db.commit()
    await db.refresh(workflow)

    return WorkflowResponse(
        id=workflow.id,
        name=workflow.name,
        code=workflow.code,
        description=workflow.description,
        status=workflow.status,
        version=workflow.version,
        process={
            "id": workflow.process.id,
            "name": workflow.process.name,
            "code": workflow.process.code,
        },
        stages=[
            WorkflowStageResponse(
                id=s.id,
                name=s.name,
                code=s.code,
                description=s.description,
                order=s.order,
                is_required=s.is_required,
                assignment_rule=s.assignment_rule,
                assigned_role_id=s.assigned_role_id,
                assigned_user_id=s.assigned_user_id,
                sla_minutes=s.sla_minutes,
                config=s.config,
            )
            for s in sorted(workflow.stages, key=lambda x: x.order)
        ],
        instance_count=len(workflow.instances),
        created_at=workflow.created_at,
        updated_at=workflow.updated_at,
    )


@router.delete("/{workflow_id}", response_model=MessageResponse)
async def delete_workflow(
    workflow_id: UUID,
    db: DBSession,
    current_user: SuperUser,
):
    """Soft delete workflow."""
    result = await db.execute(
        select(Workflow)
        .where(Workflow.id == workflow_id)
        .where(Workflow.is_deleted == False)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow not found",
        )

    workflow.is_deleted = True
    workflow.deleted_at = datetime.now(timezone.utc)
    workflow.deleted_by = current_user.id
    await db.commit()

    return MessageResponse(message="Workflow deleted successfully")


# Workflow Instances
@router.post("/instances", response_model=WorkflowInstanceResponse, status_code=status.HTTP_201_CREATED)
async def create_workflow_instance(
    instance_in: WorkflowInstanceCreate,
    db: DBSession,
    current_user: CurrentUser,
):
    """Create a new workflow instance and start execution."""
    # Get workflow with stages
    result = await db.execute(
        select(Workflow)
        .options(selectinload(Workflow.stages))
        .where(Workflow.id == instance_in.workflow_id)
        .where(Workflow.is_deleted == False)
        .where(Workflow.status == WorkflowStatus.ACTIVE)
    )
    workflow = result.scalar_one_or_none()

    if not workflow:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active workflow not found",
        )

    if not workflow.stages:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Workflow has no stages defined",
        )

    sorted_stages = sorted(workflow.stages, key=lambda x: x.order)
    first_stage = sorted_stages[0]

    instance = WorkflowInstance(
        workflow_id=workflow.id,
        reference_number=generate_reference_number(),
        priority=instance_in.priority,
        data=instance_in.data,
        due_at=instance_in.due_at,
        status=TaskStatus.IN_PROGRESS,
        started_at=datetime.now(timezone.utc),
        current_stage_id=first_stage.id,
        created_by=current_user.id,
    )

    db.add(instance)
    await db.flush()

    # Create tasks for all stages
    for stage in sorted_stages:
        task = WorkflowTask(
            instance_id=instance.id,
            stage_id=stage.id,
            status=TaskStatus.PENDING if stage.id != first_stage.id else TaskStatus.IN_PROGRESS,
            started_at=datetime.now(timezone.utc) if stage.id == first_stage.id else None,
            created_by=current_user.id,
        )
        db.add(task)

    await db.commit()

    # Reload with all relationships
    result = await db.execute(
        select(WorkflowInstance)
        .options(
            selectinload(WorkflowInstance.workflow),
            selectinload(WorkflowInstance.current_stage),
            selectinload(WorkflowInstance.tasks).selectinload(WorkflowTask.stage),
            selectinload(WorkflowInstance.tasks).selectinload(WorkflowTask.assigned_to),
        )
        .where(WorkflowInstance.id == instance.id)
    )
    instance = result.scalar_one()

    return WorkflowInstanceResponse(
        id=instance.id,
        reference_number=instance.reference_number,
        workflow_id=instance.workflow_id,
        workflow_name=instance.workflow.name,
        status=instance.status,
        priority=instance.priority,
        current_stage_id=instance.current_stage_id,
        current_stage_name=instance.current_stage.name if instance.current_stage else None,
        started_at=instance.started_at,
        completed_at=instance.completed_at,
        due_at=instance.due_at,
        data=instance.data,
        tasks=[
            WorkflowTaskResponse(
                id=t.id,
                stage_id=t.stage_id,
                stage_name=t.stage.name,
                stage_order=t.stage.order,
                status=t.status,
                assigned_to=(
                    {"id": t.assigned_to.id, "email": t.assigned_to.email, "full_name": t.assigned_to.full_name}
                    if t.assigned_to
                    else None
                ),
                started_at=t.started_at,
                completed_at=t.completed_at,
                due_at=t.due_at,
                sla_breached=t.sla_breached,
                notes=t.notes,
            )
            for t in sorted(instance.tasks, key=lambda x: x.stage.order)
        ],
        created_at=instance.created_at,
    )


@router.get("/instances", response_model=PaginatedResponse[WorkflowInstanceListResponse])
async def list_workflow_instances(
    db: DBSession,
    current_user: CurrentUser,
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    workflow_id: UUID | None = None,
    status: TaskStatus | None = None,
    assigned_to_me: bool = False,
):
    """List workflow instances with pagination."""
    query = (
        select(WorkflowInstance)
        .options(
            selectinload(WorkflowInstance.workflow),
            selectinload(WorkflowInstance.current_stage),
            selectinload(WorkflowInstance.tasks),
        )
        .where(WorkflowInstance.is_deleted == False)
    )

    if workflow_id:
        query = query.where(WorkflowInstance.workflow_id == workflow_id)

    if status:
        query = query.where(WorkflowInstance.status == status)

    if assigned_to_me:
        query = query.join(WorkflowTask).where(
            WorkflowTask.assigned_to_id == current_user.id,
            WorkflowTask.status == TaskStatus.IN_PROGRESS,
        )

    count_query = select(func.count()).select_from(query.subquery())
    total = (await db.execute(count_query)).scalar() or 0

    query = query.offset((page - 1) * page_size).limit(page_size)
    query = query.order_by(WorkflowInstance.created_at.desc())

    result = await db.execute(query)
    instances = result.scalars().unique().all()

    items = [
        WorkflowInstanceListResponse(
            id=inst.id,
            reference_number=inst.reference_number,
            workflow_name=inst.workflow.name,
            status=inst.status,
            priority=inst.priority,
            current_stage_name=inst.current_stage.name if inst.current_stage else None,
            started_at=inst.started_at,
            due_at=inst.due_at,
            sla_breached=any(t.sla_breached for t in inst.tasks),
            created_at=inst.created_at,
        )
        for inst in instances
    ]

    return PaginatedResponse.create(items, total, page, page_size)


@router.get("/instances/{instance_id}", response_model=WorkflowInstanceResponse)
async def get_workflow_instance(
    instance_id: UUID,
    db: DBSession,
    current_user: CurrentUser,
):
    """Get workflow instance by ID."""
    result = await db.execute(
        select(WorkflowInstance)
        .options(
            selectinload(WorkflowInstance.workflow),
            selectinload(WorkflowInstance.current_stage),
            selectinload(WorkflowInstance.tasks).selectinload(WorkflowTask.stage),
            selectinload(WorkflowInstance.tasks).selectinload(WorkflowTask.assigned_to),
        )
        .where(WorkflowInstance.id == instance_id)
        .where(WorkflowInstance.is_deleted == False)
    )
    instance = result.scalar_one_or_none()

    if not instance:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workflow instance not found",
        )

    return WorkflowInstanceResponse(
        id=instance.id,
        reference_number=instance.reference_number,
        workflow_id=instance.workflow_id,
        workflow_name=instance.workflow.name,
        status=instance.status,
        priority=instance.priority,
        current_stage_id=instance.current_stage_id,
        current_stage_name=instance.current_stage.name if instance.current_stage else None,
        started_at=instance.started_at,
        completed_at=instance.completed_at,
        due_at=instance.due_at,
        data=instance.data,
        tasks=[
            WorkflowTaskResponse(
                id=t.id,
                stage_id=t.stage_id,
                stage_name=t.stage.name,
                stage_order=t.stage.order,
                status=t.status,
                assigned_to=(
                    {"id": t.assigned_to.id, "email": t.assigned_to.email, "full_name": t.assigned_to.full_name}
                    if t.assigned_to
                    else None
                ),
                started_at=t.started_at,
                completed_at=t.completed_at,
                due_at=t.due_at,
                sla_breached=t.sla_breached,
                notes=t.notes,
            )
            for t in sorted(instance.tasks, key=lambda x: x.stage.order)
        ],
        created_at=instance.created_at,
    )


@router.patch("/tasks/{task_id}", response_model=WorkflowTaskResponse)
async def update_workflow_task(
    task_id: UUID,
    task_in: WorkflowTaskUpdate,
    db: DBSession,
    current_user: CurrentUser,
):
    """Update a workflow task (complete, assign, add notes)."""
    result = await db.execute(
        select(WorkflowTask)
        .options(
            selectinload(WorkflowTask.stage),
            selectinload(WorkflowTask.assigned_to),
            selectinload(WorkflowTask.instance).selectinload(WorkflowInstance.tasks).selectinload(WorkflowTask.stage),
        )
        .where(WorkflowTask.id == task_id)
        .where(WorkflowTask.is_deleted == False)
    )
    task = result.scalar_one_or_none()

    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found",
        )

    if task_in.assigned_to_id is not None:
        task.assigned_to_id = task_in.assigned_to_id

    if task_in.notes is not None:
        task.notes = task_in.notes

    if task_in.data is not None:
        task.data = task_in.data

    # Handle status change
    if task_in.status is not None and task_in.status != task.status:
        task.status = task_in.status

        if task_in.status == TaskStatus.IN_PROGRESS and task.started_at is None:
            task.started_at = datetime.now(timezone.utc)

        elif task_in.status == TaskStatus.COMPLETED:
            task.completed_at = datetime.now(timezone.utc)

            # Find and start next task
            instance = task.instance
            sorted_tasks = sorted(instance.tasks, key=lambda t: t.stage.order)
            current_idx = next(i for i, t in enumerate(sorted_tasks) if t.id == task.id)

            if current_idx < len(sorted_tasks) - 1:
                next_task = sorted_tasks[current_idx + 1]
                next_task.status = TaskStatus.IN_PROGRESS
                next_task.started_at = datetime.now(timezone.utc)
                instance.current_stage_id = next_task.stage_id
            else:
                # All tasks complete
                instance.status = TaskStatus.COMPLETED
                instance.completed_at = datetime.now(timezone.utc)
                instance.current_stage_id = None

    task.updated_by = current_user.id
    await db.commit()
    await db.refresh(task)

    return WorkflowTaskResponse(
        id=task.id,
        stage_id=task.stage_id,
        stage_name=task.stage.name,
        stage_order=task.stage.order,
        status=task.status,
        assigned_to=(
            {"id": task.assigned_to.id, "email": task.assigned_to.email, "full_name": task.assigned_to.full_name}
            if task.assigned_to
            else None
        ),
        started_at=task.started_at,
        completed_at=task.completed_at,
        due_at=task.due_at,
        sla_breached=task.sla_breached,
        notes=task.notes,
    )
