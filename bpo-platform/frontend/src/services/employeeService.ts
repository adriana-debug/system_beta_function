import { api } from './api';

export interface Employee {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  position?: string;
  department: string;
  campaign: string;
  status: 'active' | 'inactive' | 'on_leave';
  join_date?: string;
  manager_id?: string;
  notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface EmployeeStats {
  total: number;
  active: number;
  inactive: number;
  on_leave: number;
  departments: string[];
  campaigns: string[];
}

export const employeeService = {
  async getEmployees(
    skip = 0,
    limit = 20,
    filters?: {
      department?: string;
      campaign?: string;
      status?: string;
      search?: string;
    }
  ) {
    const params = new URLSearchParams({
      skip: skip.toString(),
      limit: limit.toString(),
      ...(filters?.department && { department: filters.department }),
      ...(filters?.campaign && { campaign: filters.campaign }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.search && { search: filters.search }),
    });

    return api.get(`/employees?${params}`);
  },

  async getEmployee(id: string) {
    return api.get(`/employees/${id}`);
  },

  async createEmployee(employee: Omit<Employee, 'id' | 'created_at' | 'updated_at'>) {
    return api.post('/employees', employee);
  },

  async updateEmployee(id: string, employee: Partial<Employee>) {
    return api.put(`/employees/${id}`, employee);
  },

  async deleteEmployee(id: string) {
    return api.delete(`/employees/${id}`);
  },

  async getEmployeesByDepartment(department: string) {
    return api.get(`/employees/department/${department}`);
  },

  async getStats() {
    return api.get<EmployeeStats>('/employees/stats/summary');
  },
};
