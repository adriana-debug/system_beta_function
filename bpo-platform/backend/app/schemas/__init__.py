from app.schemas.common import (
    PaginatedResponse,
    PaginationParams,
    MessageResponse,
    IDResponse,
)
from app.schemas.auth import Token, TokenPayload, LoginRequest, RefreshTokenRequest
from app.schemas.user import (
    UserCreate,
    UserUpdate,
    UserResponse,
    UserListResponse,
    RoleCreate,
    RoleUpdate,
    RoleResponse,
    PermissionResponse,
)
from app.schemas.department import (
    DepartmentCreate,
    DepartmentUpdate,
    DepartmentResponse,
    DepartmentListResponse,
    DepartmentUserAssign,
)
from app.schemas.process import (
    ProcessCreate,
    ProcessUpdate,
    ProcessResponse,
)
from app.schemas.workflow import (
    WorkflowCreate,
    WorkflowUpdate,
    WorkflowResponse,
    WorkflowStageCreate,
    WorkflowStageUpdate,
    WorkflowInstanceCreate,
    WorkflowInstanceResponse,
    WorkflowTaskUpdate,
)

__all__ = [
    # Common
    "PaginatedResponse",
    "PaginationParams",
    "MessageResponse",
    "IDResponse",
    # Auth
    "Token",
    "TokenPayload",
    "LoginRequest",
    "RefreshTokenRequest",
    # User
    "UserCreate",
    "UserUpdate",
    "UserResponse",
    "UserListResponse",
    "RoleCreate",
    "RoleUpdate",
    "RoleResponse",
    "PermissionResponse",
    # Department
    "DepartmentCreate",
    "DepartmentUpdate",
    "DepartmentResponse",
    "DepartmentListResponse",
    "DepartmentUserAssign",
    # Process
    "ProcessCreate",
    "ProcessUpdate",
    "ProcessResponse",
    # Workflow
    "WorkflowCreate",
    "WorkflowUpdate",
    "WorkflowResponse",
    "WorkflowStageCreate",
    "WorkflowStageUpdate",
    "WorkflowInstanceCreate",
    "WorkflowInstanceResponse",
    "WorkflowTaskUpdate",
]
