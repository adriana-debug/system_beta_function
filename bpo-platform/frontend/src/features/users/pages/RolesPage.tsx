import { useQuery } from '@tanstack/react-query';
import { PlusIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

import { Button, Badge } from '@/components/ui';
import { api } from '@/services/api';

interface Permission {
  id: string;
  name: string;
  code: string;
  description: string | null;
  module: string;
}

interface Role {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_system: boolean;
  permissions: Permission[];
  created_at: string;
}

export function RolesPage() {
  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const response = await api.get<Role[]>('/roles');
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Roles & Permissions
          </h1>
          <p className="text-sm text-surface-500">
            Manage roles and their permissions
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4" />
          Add Role
        </Button>
      </div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles?.map((role) => (
            <div key={role.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary-100 dark:bg-primary-900">
                    <ShieldCheckIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-surface-900">
                      {role.name}
                    </h3>
                    <p className="text-xs text-surface-500">{role.code}</p>
                  </div>
                </div>
                {role.is_system && (
                  <Badge variant="warning">System</Badge>
                )}
              </div>

              {role.description && (
                <p className="text-sm text-surface-600 mb-4">
                  {role.description}
                </p>
              )}

              <div className="border-t border-surface-200 dark:border-surface-200 pt-4">
                <p className="text-xs font-medium text-surface-500 mb-2">
                  Permissions ({role.permissions.length})
                </p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 5).map((perm) => (
                    <span
                      key={perm.id}
                      className="px-2 py-0.5 text-xs rounded bg-surface-100 dark:bg-surface-200 text-surface-600"
                    >
                      {perm.code}
                    </span>
                  ))}
                  {role.permissions.length > 5 && (
                    <span className="px-2 py-0.5 text-xs rounded bg-surface-100 dark:bg-surface-200 text-surface-600">
                      +{role.permissions.length - 5} more
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                {!role.is_system && (
                  <Button variant="ghost" size="sm">
                    Delete
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
