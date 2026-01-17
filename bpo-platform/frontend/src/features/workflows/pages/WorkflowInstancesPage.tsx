import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { Button, Badge } from '@/components/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/Select';
import { api, PaginatedResponse } from '@/services/api';

interface WorkflowInstance {
  id: string;
  reference_number: string;
  workflow_name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled' | 'failed';
  priority: number;
  current_stage_name: string | null;
  started_at: string | null;
  due_at: string | null;
  sla_breached: boolean;
  created_at: string;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error' | 'primary'> = {
  pending: 'default',
  in_progress: 'primary',
  completed: 'success',
  cancelled: 'warning',
  failed: 'error',
};

const priorityLabels: Record<number, string> = {
  1: 'Critical',
  2: 'High',
  3: 'High',
  4: 'Medium',
  5: 'Medium',
  6: 'Normal',
  7: 'Normal',
  8: 'Low',
  9: 'Low',
  10: 'Lowest',
};

export function WorkflowInstancesPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>('');

  const { data, isLoading } = useQuery({
    queryKey: ['workflow-instances', page, statusFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: '20',
      });
      if (statusFilter) params.append('status', statusFilter);

      const response = await api.get<PaginatedResponse<WorkflowInstance>>(
        `/workflows/instances?${params.toString()}`
      );
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">
            Workflow Instances
          </h1>
          <p className="text-sm text-surface-500">
            Track and manage running workflows
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <Select
          value={statusFilter}
          onValueChange={(value) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Reference</th>
                <th className="table-header-cell">Workflow</th>
                <th className="table-header-cell">Current Stage</th>
                <th className="table-header-cell">Priority</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Due Date</th>
                <th className="table-header-cell">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="table-body">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8">
                    Loading...
                  </td>
                </tr>
              ) : data?.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-cell text-center py-8">
                    No workflow instances found
                  </td>
                </tr>
              ) : (
                data?.items.map((instance) => (
                  <tr key={instance.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-medium">
                          {instance.reference_number}
                        </span>
                        {instance.sla_breached && (
                          <ExclamationTriangleIcon
                            className="h-4 w-4 text-error-500"
                            title="SLA Breached"
                          />
                        )}
                      </div>
                    </td>
                    <td className="table-cell">{instance.workflow_name}</td>
                    <td className="table-cell">
                      {instance.current_stage_name || '-'}
                    </td>
                    <td className="table-cell">
                      <span
                        className={`text-sm ${
                          instance.priority <= 3
                            ? 'text-error-600 font-medium'
                            : instance.priority <= 5
                            ? 'text-warning-600'
                            : 'text-surface-600'
                        }`}
                      >
                        {priorityLabels[instance.priority] || 'Normal'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <Badge variant={statusColors[instance.status]}>
                        {instance.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="table-cell">
                      {instance.due_at
                        ? new Date(instance.due_at).toLocaleDateString()
                        : '-'}
                    </td>
                    <td className="table-cell text-right">
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
