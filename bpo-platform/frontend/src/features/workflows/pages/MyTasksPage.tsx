import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  PlayIcon,
} from '@heroicons/react/24/outline';

import { Button, Badge } from '@/components/ui';
import { api, PaginatedResponse } from '@/services/api';

interface WorkflowInstance {
  id: string;
  reference_number: string;
  workflow_name: string;
  status: string;
  priority: number;
  current_stage_name: string | null;
  started_at: string | null;
  due_at: string | null;
  sla_breached: boolean;
  created_at: string;
}

export function MyTasksPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-tasks'],
    queryFn: async () => {
      const response = await api.get<PaginatedResponse<WorkflowInstance>>(
        '/workflows/instances?assigned_to_me=true&status=in_progress'
      );
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-surface-900">My Tasks</h1>
        <p className="text-sm text-surface-500">
          Tasks assigned to you that are currently in progress
        </p>
      </div>

      {/* Tasks List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="card p-12 text-center">
          <CheckCircleIcon className="h-12 w-12 mx-auto text-green-500 mb-4" />
          <h3 className="text-lg font-medium text-surface-900">
            All caught up!
          </h3>
          <p className="text-surface-500 mt-1">
            You have no tasks assigned to you at the moment.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {data?.items.map((instance) => (
            <div key={instance.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-surface-900">
                      {instance.reference_number}
                    </h3>
                    {instance.sla_breached && (
                      <span className="flex items-center gap-1 text-xs text-error-600">
                        <ExclamationTriangleIcon className="h-4 w-4" />
                        SLA Breached
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-surface-500">
                    {instance.workflow_name}
                  </p>
                </div>
                <Badge
                  variant={instance.priority <= 3 ? 'error' : instance.priority <= 5 ? 'warning' : 'default'}
                >
                  Priority {instance.priority}
                </Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-surface-500">Current Stage</span>
                  <p className="font-medium text-surface-900">
                    {instance.current_stage_name || '-'}
                  </p>
                </div>
                <div>
                  <span className="text-surface-500">Started</span>
                  <p className="font-medium text-surface-900">
                    {instance.started_at
                      ? new Date(instance.started_at).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-surface-500">Due Date</span>
                  <p
                    className={`font-medium ${
                      instance.due_at &&
                      new Date(instance.due_at) < new Date()
                        ? 'text-error-600'
                        : 'text-surface-900'
                    }`}
                  >
                    {instance.due_at
                      ? new Date(instance.due_at).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
                <div>
                  <span className="text-surface-500">Status</span>
                  <div className="flex items-center gap-1 text-primary-600">
                    <PlayIcon className="h-4 w-4" />
                    <span className="font-medium">In Progress</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4 border-t border-surface-200 dark:border-surface-200">
                <Button variant="outline" size="sm">
                  View Details
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    // In a real app, you'd get the task ID from the instance
                    toast.success('Task workflow opened');
                  }}
                >
                  <CheckCircleIcon className="h-4 w-4" />
                  Complete Task
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
