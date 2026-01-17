import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

import { Input } from '@/components/ui/Input';
import { Button, Badge } from '@/components/ui';
import { api, PaginatedResponse } from '@/services/api';

interface Process {
  id: string;
  name: string;
  code: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  department_name: string;
  owner_name: string | null;
  workflow_count: number;
  created_at: string;
}

const statusColors: Record<string, 'default' | 'success' | 'warning' | 'error'> = {
  draft: 'default',
  active: 'success',
  paused: 'warning',
  archived: 'error',
};

export function ProcessesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['processes', page, search],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        page_size: '20',
      });
      if (search) params.append('search', search);

      const response = await api.get<PaginatedResponse<Process>>(
        `/processes?${params.toString()}`
      );
      return response.data;
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Processes</h1>
          <p className="text-sm text-surface-500">
            Manage business processes
          </p>
        </div>
        <Button>
          <PlusIcon className="h-4 w-4" />
          Create Process
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <Input
          type="text"
          placeholder="Search processes..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="pl-10"
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Code</th>
                <th className="table-header-cell">Department</th>
                <th className="table-header-cell">Owner</th>
                <th className="table-header-cell">Workflows</th>
                <th className="table-header-cell">Status</th>
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
                    No processes found
                  </td>
                </tr>
              ) : (
                data?.items.map((process) => (
                  <tr key={process.id} className="table-row">
                    <td className="table-cell font-medium">{process.name}</td>
                    <td className="table-cell text-surface-500">
                      {process.code}
                    </td>
                    <td className="table-cell">{process.department_name}</td>
                    <td className="table-cell">
                      {process.owner_name || '-'}
                    </td>
                    <td className="table-cell">{process.workflow_count}</td>
                    <td className="table-cell">
                      <Badge variant={statusColors[process.status]}>
                        {process.status}
                      </Badge>
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
