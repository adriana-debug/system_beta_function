"""Database seed script for initial data."""

import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import get_password_hash
from app.db.session import AsyncSessionLocal
from app.models.user import User, Role, Permission, RolePermission
from app.models.department import Department
from app.models.process import Process, ProcessStatus
from app.models.workflow import Workflow, WorkflowStage, WorkflowStatus, AssignmentRule


# Predefined permissions
PERMISSIONS = [
    # User management
    {"name": "View Users", "code": "users.view", "module": "users"},
    {"name": "Create Users", "code": "users.create", "module": "users"},
    {"name": "Update Users", "code": "users.update", "module": "users"},
    {"name": "Delete Users", "code": "users.delete", "module": "users"},
    # Role management
    {"name": "View Roles", "code": "roles.view", "module": "roles"},
    {"name": "Manage Roles", "code": "roles.manage", "module": "roles"},
    # Department management
    {"name": "View Departments", "code": "departments.view", "module": "departments"},
    {"name": "Create Departments", "code": "departments.create", "module": "departments"},
    {"name": "Update Departments", "code": "departments.update", "module": "departments"},
    {"name": "Delete Departments", "code": "departments.delete", "module": "departments"},
    # Process management
    {"name": "View Processes", "code": "processes.view", "module": "processes"},
    {"name": "Create Processes", "code": "processes.create", "module": "processes"},
    {"name": "Update Processes", "code": "processes.update", "module": "processes"},
    {"name": "Delete Processes", "code": "processes.delete", "module": "processes"},
    # Workflow management
    {"name": "View Workflows", "code": "workflows.view", "module": "workflows"},
    {"name": "Create Workflows", "code": "workflows.create", "module": "workflows"},
    {"name": "Update Workflows", "code": "workflows.update", "module": "workflows"},
    {"name": "Execute Workflows", "code": "workflows.execute", "module": "workflows"},
    # Analytics
    {"name": "View Analytics", "code": "analytics.view", "module": "analytics"},
    {"name": "Export Reports", "code": "analytics.export", "module": "analytics"},
]

# Predefined roles
ROLES = [
    {
        "name": "Administrator",
        "code": "admin",
        "description": "Full system access",
        "is_system": True,
        "permissions": ["*"],  # All permissions
    },
    {
        "name": "Manager",
        "code": "manager",
        "description": "Department and team management",
        "is_system": True,
        "permissions": [
            "users.view",
            "users.create",
            "users.update",
            "roles.view",
            "departments.view",
            "departments.create",
            "departments.update",
            "processes.view",
            "processes.create",
            "processes.update",
            "workflows.view",
            "workflows.create",
            "workflows.update",
            "workflows.execute",
            "analytics.view",
            "analytics.export",
        ],
    },
    {
        "name": "Agent",
        "code": "agent",
        "description": "Task execution and basic operations",
        "is_system": True,
        "permissions": [
            "users.view",
            "departments.view",
            "processes.view",
            "workflows.view",
            "workflows.execute",
            "analytics.view",
        ],
    },
    {
        "name": "QA Specialist",
        "code": "qa",
        "description": "Quality assurance and review",
        "is_system": True,
        "permissions": [
            "users.view",
            "departments.view",
            "processes.view",
            "workflows.view",
            "workflows.execute",
            "analytics.view",
            "analytics.export",
        ],
    },
]


async def seed_permissions(db: AsyncSession) -> dict[str, Permission]:
    """Seed permissions."""
    permissions = {}

    for perm_data in PERMISSIONS:
        result = await db.execute(
            select(Permission).where(Permission.code == perm_data["code"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            permissions[perm_data["code"]] = existing
        else:
            perm = Permission(**perm_data)
            db.add(perm)
            await db.flush()
            permissions[perm_data["code"]] = perm

    return permissions


async def seed_roles(
    db: AsyncSession, permissions: dict[str, Permission]
) -> dict[str, Role]:
    """Seed roles with permissions."""
    roles = {}

    for role_data in ROLES:
        result = await db.execute(
            select(Role).where(Role.code == role_data["code"])
        )
        existing = result.scalar_one_or_none()

        if existing:
            roles[role_data["code"]] = existing
        else:
            role = Role(
                name=role_data["name"],
                code=role_data["code"],
                description=role_data["description"],
                is_system=role_data["is_system"],
            )
            db.add(role)
            await db.flush()

            # Add permissions
            perm_codes = role_data["permissions"]
            if "*" in perm_codes:
                perm_codes = list(permissions.keys())

            for perm_code in perm_codes:
                if perm_code in permissions:
                    role_perm = RolePermission(
                        role_id=role.id,
                        permission_id=permissions[perm_code].id,
                    )
                    db.add(role_perm)

            roles[role_data["code"]] = role

    return roles


async def seed_admin_user(db: AsyncSession, admin_role: Role) -> User:
    """Seed admin user."""
    result = await db.execute(
        select(User).where(User.email == "admin@example.com")
    )
    existing = result.scalar_one_or_none()

    if existing:
        return existing

    admin = User(
        email="admin@example.com",
        hashed_password=get_password_hash("password123"),
        first_name="System",
        last_name="Administrator",
        employee_id="EMP001",
        is_active=True,
        is_superuser=True,
        role_id=admin_role.id,
    )
    db.add(admin)
    await db.flush()
    return admin


async def seed_sample_data(db: AsyncSession, roles: dict[str, Role], admin: User):
    """Seed sample departments, processes, and workflows."""
    # Create departments
    ops_dept = Department(
        name="Operations",
        code="OPS",
        description="Core operations department",
        is_active=True,
        created_by=admin.id,
    )
    db.add(ops_dept)
    await db.flush()

    hr_dept = Department(
        name="Human Resources",
        code="HR",
        description="HR department",
        is_active=True,
        created_by=admin.id,
    )
    db.add(hr_dept)
    await db.flush()

    # Create sample process
    onboarding_process = Process(
        name="Employee Onboarding",
        code="ONBOARD",
        description="New employee onboarding process",
        status=ProcessStatus.ACTIVE,
        department_id=hr_dept.id,
        owner_id=admin.id,
        target_sla_minutes=2880,  # 48 hours
        warning_sla_minutes=2160,  # 36 hours
        created_by=admin.id,
    )
    db.add(onboarding_process)
    await db.flush()

    # Create sample workflow
    workflow = Workflow(
        name="Standard Onboarding",
        code="STD-ONBOARD",
        description="Standard employee onboarding workflow",
        status=WorkflowStatus.ACTIVE,
        process_id=onboarding_process.id,
        created_by=admin.id,
    )
    db.add(workflow)
    await db.flush()

    # Create workflow stages
    stages = [
        {
            "name": "Document Collection",
            "code": "DOC-COLLECT",
            "order": 1,
            "sla_minutes": 480,
            "assignment_rule": AssignmentRule.ROLE_BASED,
            "assigned_role_id": roles["agent"].id,
        },
        {
            "name": "Background Verification",
            "code": "BG-CHECK",
            "order": 2,
            "sla_minutes": 1440,
            "assignment_rule": AssignmentRule.ROLE_BASED,
            "assigned_role_id": roles["agent"].id,
        },
        {
            "name": "IT Setup",
            "code": "IT-SETUP",
            "order": 3,
            "sla_minutes": 480,
            "assignment_rule": AssignmentRule.MANUAL,
        },
        {
            "name": "Manager Review",
            "code": "MGR-REVIEW",
            "order": 4,
            "sla_minutes": 240,
            "assignment_rule": AssignmentRule.ROLE_BASED,
            "assigned_role_id": roles["manager"].id,
        },
        {
            "name": "Final Approval",
            "code": "FINAL-APPROVE",
            "order": 5,
            "sla_minutes": 120,
            "assignment_rule": AssignmentRule.ROLE_BASED,
            "assigned_role_id": roles["manager"].id,
        },
    ]

    for stage_data in stages:
        stage = WorkflowStage(
            workflow_id=workflow.id,
            name=stage_data["name"],
            code=stage_data["code"],
            order=stage_data["order"],
            sla_minutes=stage_data["sla_minutes"],
            assignment_rule=stage_data["assignment_rule"],
            assigned_role_id=stage_data.get("assigned_role_id"),
            is_required=True,
            created_by=admin.id,
        )
        db.add(stage)


async def main():
    """Run seed script."""
    print("Starting database seed...")

    async with AsyncSessionLocal() as db:
        try:
            # Seed permissions
            print("Seeding permissions...")
            permissions = await seed_permissions(db)
            print(f"  Created/found {len(permissions)} permissions")

            # Seed roles
            print("Seeding roles...")
            roles = await seed_roles(db, permissions)
            print(f"  Created/found {len(roles)} roles")

            # Seed admin user
            print("Seeding admin user...")
            admin = await seed_admin_user(db, roles["admin"])
            print(f"  Admin user: {admin.email}")

            # Seed sample data
            print("Seeding sample data...")
            await seed_sample_data(db, roles, admin)

            await db.commit()
            print("\nDatabase seeded successfully!")
            print("\nDefault login credentials:")
            print("  Email: admin@example.com")
            print("  Password: password123")

        except Exception as e:
            await db.rollback()
            print(f"Error seeding database: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(main())
