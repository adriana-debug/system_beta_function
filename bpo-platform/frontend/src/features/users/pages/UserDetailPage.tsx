import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

import { Button, Badge } from '@/components/ui';
import { api } from '@/services/api';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  employee_id: string | null;
  phone: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_superuser: boolean;
  last_login: string | null;
  role: { id: string; name: string; code: string };
  created_at: string;
  updated_at: string;
}

export function UserDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: user, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-surface-900">
          User not found
        </h2>
        <Link to="/users" className="text-primary-600 hover:underline mt-2">
          Back to users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/users"
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-200"
        >
          <ArrowLeftIcon className="h-5 w-5 text-surface-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">
            {user.full_name}
          </h1>
          <p className="text-sm text-surface-500">{user.email}</p>
        </div>
        <Button variant="outline">Edit User</Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 card p-6 space-y-6">
          <h2 className="text-lg font-semibold text-surface-900">
            User Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-surface-500">
                First Name
              </label>
              <p className="mt-1 text-surface-900">{user.first_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500">
                Last Name
              </label>
              <p className="mt-1 text-surface-900">{user.last_name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500">
                Email
              </label>
              <p className="mt-1 text-surface-900">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500">
                Employee ID
              </label>
              <p className="mt-1 text-surface-900">
                {user.employee_id || 'Not assigned'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500">
                Phone
              </label>
              <p className="mt-1 text-surface-900">
                {user.phone || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-surface-500">
                Last Login
              </label>
              <p className="mt-1 text-surface-900">
                {user.last_login
                  ? new Date(user.last_login).toLocaleString()
                  : 'Never'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">
              Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Account Status</span>
                <Badge variant={user.is_active ? 'success' : 'error'}>
                  {user.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Role</span>
                <Badge variant="primary">{user.role.name}</Badge>
              </div>
              {user.is_superuser && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Admin</span>
                  <Badge variant="warning">Superuser</Badge>
                </div>
              )}
            </div>
          </div>

          {/* Timestamps Card */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">
              Timestamps
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-surface-500">Created</span>
                <p className="text-surface-900">
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-surface-500">Last Updated</span>
                <p className="text-surface-900">
                  {new Date(user.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
