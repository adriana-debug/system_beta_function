import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  BuildingOfficeIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';

import { Button, Input, Badge, Modal, FormSelect } from '@/components/ui';
import { Textarea } from '@/components/ui/textarea';
import {
  departmentService,
  DepartmentTreeNode,
  CreateDepartmentRequest,
} from '@/services/departmentService';
import { getErrorMessage } from '@/services/api';

const departmentSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters').max(50),
  description: z.string().optional(),
  parent_id: z.string().optional(),
  is_active: z.boolean().default(true),
});

type DepartmentFormData = z.infer<typeof departmentSchema>;

export function DepartmentsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [search, setSearch] = useState('');
  const queryClient = useQueryClient();

  const { data: tree, isLoading } = useQuery({
    queryKey: ['departments-tree'],
    queryFn: departmentService.getTree,
  });

  const { data: flatList } = useQuery({
    queryKey: ['departments-flat'],
    queryFn: () => departmentService.list({ page_size: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateDepartmentRequest) =>
      departmentService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments-tree'] });
      queryClient.invalidateQueries({ queryKey: ['departments-flat'] });
      toast.success('Department created successfully');
      setIsCreateOpen(false);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error));
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
  });

  const onSubmit = (data: DepartmentFormData) => {
    createMutation.mutate({
      ...data,
      parent_id: data.parent_id || undefined,
    });
  };

  const filteredTree = search
    ? filterTree(tree || [], search.toLowerCase())
    : tree;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900">Departments</h1>
          <p className="text-sm text-surface-500">
            Manage organizational structure
          </p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <PlusIcon className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-400" />
        <Input
          type="text"
          placeholder="Search departments..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Department Tree */}
      <div className="card">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filteredTree?.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="h-12 w-12 mx-auto text-surface-400 mb-4" />
            <h3 className="text-lg font-medium text-surface-900">
              No departments found
            </h3>
            <p className="text-surface-500 mt-1">
              Get started by creating your first department.
            </p>
            <Button className="mt-4" onClick={() => setIsCreateOpen(true)}>
              <PlusIcon className="h-4 w-4" />
              Add Department
            </Button>
          </div>
        ) : (
          <div className="divide-y divide-surface-200 dark:divide-surface-200">
            {filteredTree?.map((dept) => (
              <DepartmentNode key={dept.id} department={dept} level={0} />
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          reset();
        }}
        title="Create Department"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Code"
            error={errors.code?.message}
            helperText="Unique identifier (e.g., HR, ENG, OPS)"
            {...register('code')}
          />
          <div className="w-full">
            <label className="block text-sm font-medium text-surface-700 mb-1">
              Description
            </label>
            <Textarea
              {...register('description')}
              rows={3}
            />
          </div>
          <FormSelect
            label="Parent Department"
            placeholder="None (Top Level)"
            options={
              flatList?.items.map((d) => ({
                value: d.id,
                label: d.name,
              })) || []
            }
            {...register('parent_id')}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreateOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={createMutation.isPending}>
              Create Department
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

interface DepartmentNodeProps {
  department: DepartmentTreeNode;
  level: number;
}

function DepartmentNode({ department, level }: DepartmentNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = department.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-3 px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-200"
        style={{ paddingLeft: `${level * 24 + 16}px` }}
      >
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`p-1 rounded hover:bg-surface-200 dark:hover:bg-surface-300 ${
            !hasChildren ? 'invisible' : ''
          }`}
        >
          <ChevronRightIcon
            className={`h-4 w-4 text-surface-500 transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
          />
        </button>
        <BuildingOfficeIcon className="h-5 w-5 text-surface-400" />
        <div className="flex-1 min-w-0">
          <Link
            to={`/departments/${department.id}`}
            className="font-medium text-surface-900 hover:text-primary-600"
          >
            {department.name}
          </Link>
          <p className="text-xs text-surface-500">{department.code}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-surface-500">
            {department.user_count} users
          </span>
          <Badge variant={department.is_active ? 'success' : 'error'}>
            {department.is_active ? 'Active' : 'Inactive'}
          </Badge>
          {department.manager_name && (
            <span className="text-sm text-surface-600">
              {department.manager_name}
            </span>
          )}
        </div>
      </div>
      {isExpanded &&
        department.children.map((child) => (
          <DepartmentNode
            key={child.id}
            department={child}
            level={level + 1}
          />
        ))}
    </div>
  );
}

function filterTree(
  tree: DepartmentTreeNode[],
  search: string
): DepartmentTreeNode[] {
  return tree
    .map((node) => {
      const matchesSearch =
        node.name.toLowerCase().includes(search) ||
        node.code.toLowerCase().includes(search);

      const filteredChildren = filterTree(node.children, search);

      if (matchesSearch || filteredChildren.length > 0) {
        return {
          ...node,
          children: filteredChildren,
        };
      }
      return null;
    })
    .filter((node): node is DepartmentTreeNode => node !== null);
}
