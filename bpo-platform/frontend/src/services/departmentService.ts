import { api, PaginatedResponse } from './api';

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string | null;
  is_active: boolean;
  parent_id: string | null;
  parent: { id: string; name: string; code: string } | null;
  manager: { id: string; email: string; full_name: string } | null;
  user_count: number;
  created_at: string;
  updated_at: string;
}

export interface DepartmentListItem {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  parent_id: string | null;
  parent_name: string | null;
  manager_name: string | null;
  user_count: number;
  created_at: string;
}

export interface DepartmentDetail extends Department {
  children: { id: string; name: string; code: string }[];
  users: {
    user_id: string;
    user_email: string;
    user_name: string;
    is_primary: boolean;
    assigned_at: string;
  }[];
}

export interface DepartmentTreeNode {
  id: string;
  name: string;
  code: string;
  is_active: boolean;
  manager_name: string | null;
  user_count: number;
  children: DepartmentTreeNode[];
}

export interface CreateDepartmentRequest {
  name: string;
  code: string;
  description?: string;
  parent_id?: string;
  manager_id?: string;
  is_active?: boolean;
}

export interface UpdateDepartmentRequest {
  name?: string;
  description?: string;
  parent_id?: string | null;
  manager_id?: string | null;
  is_active?: boolean;
}

export interface DepartmentFilters {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
  parent_id?: string;
}

export const departmentService = {
  list: async (
    filters: DepartmentFilters = {}
  ): Promise<PaginatedResponse<DepartmentListItem>> => {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', String(filters.page));
    if (filters.page_size) params.append('page_size', String(filters.page_size));
    if (filters.search) params.append('search', filters.search);
    if (filters.is_active !== undefined)
      params.append('is_active', String(filters.is_active));
    if (filters.parent_id) params.append('parent_id', filters.parent_id);

    const response = await api.get<PaginatedResponse<DepartmentListItem>>(
      `/departments?${params.toString()}`
    );
    return response.data;
  },

  getTree: async (): Promise<DepartmentTreeNode[]> => {
    const response = await api.get<DepartmentTreeNode[]>('/departments/tree');
    return response.data;
  },

  get: async (id: string): Promise<DepartmentDetail> => {
    const response = await api.get<DepartmentDetail>(`/departments/${id}`);
    return response.data;
  },

  create: async (data: CreateDepartmentRequest): Promise<Department> => {
    const response = await api.post<Department>('/departments', data);
    return response.data;
  },

  update: async (
    id: string,
    data: UpdateDepartmentRequest
  ): Promise<Department> => {
    const response = await api.patch<Department>(`/departments/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/departments/${id}`);
  },

  assignUser: async (
    departmentId: string,
    userId: string,
    isPrimary: boolean = false
  ): Promise<void> => {
    await api.post(`/departments/${departmentId}/users`, {
      user_id: userId,
      is_primary: isPrimary,
    });
  },

  removeUser: async (departmentId: string, userId: string): Promise<void> => {
    await api.delete(`/departments/${departmentId}/users/${userId}`);
  },
};
