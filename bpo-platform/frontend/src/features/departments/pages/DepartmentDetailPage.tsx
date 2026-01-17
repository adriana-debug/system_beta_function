import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeftIcon,
  UsersIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';

import { Button, Badge } from '@/components/ui';
import { departmentService } from '@/services/departmentService';

export function DepartmentDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data: department, isLoading } = useQuery({
    queryKey: ['department', id],
    queryFn: () => departmentService.get(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-surface-900">
          Department not found
        </h2>
        <Link
          to="/departments"
          className="text-primary-600 hover:underline mt-2"
        >
          Back to departments
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          to="/departments"
          className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-200"
        >
          <ArrowLeftIcon className="h-5 w-5 text-surface-600" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-surface-900">
            {department.name}
          </h1>
          <p className="text-sm text-surface-500">{department.code}</p>
        </div>
        <Button variant="outline">Edit Department</Button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Details Card */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-surface-900 mb-4">
              Department Information
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-surface-500">
                  Name
                </label>
                <p className="mt-1 text-surface-900">{department.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">
                  Code
                </label>
                <p className="mt-1 text-surface-900">{department.code}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">
                  Status
                </label>
                <div className="mt-1">
                  <Badge
                    variant={department.is_active ? 'success' : 'error'}
                  >
                    {department.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-surface-500">
                  Manager
                </label>
                <p className="mt-1 text-surface-900">
                  {department.manager?.full_name || 'Not assigned'}
                </p>
              </div>
              {department.parent && (
                <div>
                  <label className="text-sm font-medium text-surface-500">
                    Parent Department
                  </label>
                  <p className="mt-1">
                    <Link
                      to={`/departments/${department.parent.id}`}
                      className="text-primary-600 hover:underline"
                    >
                      {department.parent.name}
                    </Link>
                  </p>
                </div>
              )}
              {department.description && (
                <div className="sm:col-span-2">
                  <label className="text-sm font-medium text-surface-500">
                    Description
                  </label>
                  <p className="mt-1 text-surface-900">
                    {department.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Users Card */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-surface-900">
                Team Members ({department.users.length})
              </h2>
              <Button variant="outline" size="sm">
                Add Member
              </Button>
            </div>

            {department.users.length === 0 ? (
              <div className="text-center py-8">
                <UsersIcon className="h-8 w-8 mx-auto text-surface-400 mb-2" />
                <p className="text-surface-500">No members assigned</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-200 dark:divide-surface-200">
                {department.users.map((user) => (
                  <div
                    key={user.user_id}
                    className="flex items-center justify-between py-3"
                  >
                    <div>
                      <p className="font-medium text-surface-900">
                        {user.user_name}
                      </p>
                      <p className="text-sm text-surface-500">
                        {user.user_email}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {user.is_primary && (
                        <Badge variant="primary">Primary</Badge>
                      )}
                      <Button variant="ghost" size="sm">
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats Card */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">
              Overview
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">Total Members</span>
                <span className="text-lg font-semibold text-surface-900">
                  {department.user_count}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-surface-500">
                  Sub-departments
                </span>
                <span className="text-lg font-semibold text-surface-900">
                  {department.children.length}
                </span>
              </div>
            </div>
          </div>

          {/* Children Card */}
          {department.children.length > 0 && (
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">
                Sub-departments
              </h3>
              <div className="space-y-2">
                {department.children.map((child) => (
                  <Link
                    key={child.id}
                    to={`/departments/${child.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-200"
                  >
                    <BuildingOfficeIcon className="h-4 w-4 text-surface-400" />
                    <span className="text-sm text-surface-700">
                      {child.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Timestamps Card */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-surface-900 mb-4">
              Timestamps
            </h3>
            <div className="space-y-3 text-sm">
              <div>
                <span className="text-surface-500">Created</span>
                <p className="text-surface-900">
                  {new Date(department.created_at).toLocaleDateString()}
                </p>
              </div>
              <div>
                <span className="text-surface-500">Last Updated</span>
                <p className="text-surface-900">
                  {new Date(department.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
