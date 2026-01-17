import { Routes, Route, Navigate } from 'react-router-dom';

import { useAuthStore } from './store/authStore';
import { MainLayout } from './app/layouts/MainLayout';
import { AuthLayout } from './app/layouts/AuthLayout';

// Auth pages
import { LoginPage } from './features/auth/pages/LoginPage';

// Main pages
import { DashboardPage } from './features/analytics/pages/DashboardPage';
import { UsersPage } from './features/users/pages/UsersPage';
import { UserDetailPage } from './features/users/pages/UserDetailPage';
import { RolesPage } from './features/users/pages/RolesPage';
import { DepartmentsPage } from './features/departments/pages/DepartmentsPage';
import { DepartmentDetailPage } from './features/departments/pages/DepartmentDetailPage';
import { ProcessesPage } from './features/workflows/pages/ProcessesPage';
import { WorkflowsPage } from './features/workflows/pages/WorkflowsPage';
import { WorkflowInstancesPage } from './features/workflows/pages/WorkflowInstancesPage';
import { MyTasksPage } from './features/workflows/pages/MyTasksPage';

// HR pages
import { EmployeeDirectoryPage } from './features/hr/pages/EmployeeDirectoryPage';
import { CreateEmployeePage } from './features/hr/pages/CreateEmployeePage';
import { EditEmployeePage } from './features/hr/pages/EditEmployeePage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />

        {/* User Management */}
        <Route path="users" element={<UsersPage />} />
        <Route path="users/:id" element={<UserDetailPage />} />
        <Route path="roles" element={<RolesPage />} />

        {/* Departments */}
        <Route path="departments" element={<DepartmentsPage />} />
        <Route path="departments/:id" element={<DepartmentDetailPage />} />

        {/* HR & People Management - Must be in order: specific before general */}
        <Route path="hr/employees/create" element={<CreateEmployeePage />} />
        <Route path="hr/employees/:employeeId" element={<EditEmployeePage />} />
        <Route path="hr/employees" element={<EmployeeDirectoryPage />} />

        {/* Workflows */}
        <Route path="processes" element={<ProcessesPage />} />
        <Route path="workflows" element={<WorkflowsPage />} />
        <Route path="workflow-instances" element={<WorkflowInstancesPage />} />
        <Route path="my-tasks" element={<MyTasksPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
