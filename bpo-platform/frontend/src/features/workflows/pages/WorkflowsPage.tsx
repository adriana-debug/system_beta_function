import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { Input } from '@/components/ui/Input';
import { Button, Badge } from '@/components/ui';
import { api, PaginatedResponse } from '@/services/api';

interface Workflow {
  id: string;
  name: string;
  code: string;
  status: 'draft' | 'active' | 'inactive';
  process_name: string;
  stage_count: number;
  instance_count: number;
  created_at: string;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  active: 'success',
  inactive: 'error',
};

export function WorkflowsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['workflows', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: '20',
      });
      if (search) params.append('search', search);

      const response = await api.get<PaginatedResponse<Workflow>>(
        `/workflows?${params.toString()}`
      );
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Workflows</h1>
          <p className="text-sm text-surface-500">
            Design and manage workflows
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <Input
          type="text"
          placeholder="Search workflows..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-12 card">
          <h3 className="text-lg font-medium text-surface-900">
            No workflows found
          </h3>
          <p className="text-surface-500 mt-1">
            Get started by creating your first workflow.
          </p>
          <Button className="mt-4">
            <PlusIcon className="h-4 w-4" />
            Create Workflow
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.items.map((workflow) => (
            <div key={workflow.id} className="card p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-surface-900">
                    {workflow.name}
                  </h3>
                  <p className="text-xs text-surface-500">{workflow.code}</p>
                </div>
                <Badge variant={statusColors[workflow.status]}>
                  {workflow.status}
                </Badge>
              </div>

              <p className="text-sm text-surface-600 mb-4">
                Process: {workflow.process_name}
              </p>

              <div className="flex items-center justify-between text-sm text-surface-500 border-t border-surface-200 dark:border-surface-200 pt-4">
                <span>{workflow.stage_count} stages</span>
                <span>{workflow.instance_count} instances</span>
              </div>

              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1">
                  Edit
                </Button>
                <Button variant="default" size="sm" className="flex-1">
                  Start Instance
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
