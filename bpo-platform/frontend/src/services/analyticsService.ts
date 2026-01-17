import { api } from './api';

export interface DashboardStats {
  total_users: number;
  active_users: number;
  total_departments: number;
  total_processes: number;
  active_workflows: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completed_tasks_today: number;
  sla_breached_count: number;
}

export interface TrendDataPoint {
  date: string;
  value: number;
}

export interface ProcessPerformance {
  process_id: string;
  process_name: string;
  total_instances: number;
  completed_instances: number;
  avg_completion_hours: number | null;
  sla_compliance_rate: number;
}

export interface UserProductivity {
  user_id: string;
  user_name: string;
  tasks_completed: number;
  avg_task_duration_hours: number | null;
  sla_breached_count: number;
}

export interface SLASummary {
  period_days: number;
  total_tasks: number;
  breached_tasks: number;
  compliant_tasks: number;
  compliance_rate: number;
}

export const analyticsService = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/analytics/dashboard');
    return response.data;
  },

  getTaskTrends: async (days: number = 30): Promise<TrendDataPoint[]> => {
    const response = await api.get<TrendDataPoint[]>(
      `/analytics/tasks/trends?days=${days}`
    );
    return response.data;
  },

  getWorkflowTrends: async (days: number = 30): Promise<TrendDataPoint[]> => {
    const response = await api.get<TrendDataPoint[]>(
      `/analytics/workflows/trends?days=${days}`
    );
    return response.data;
  },

  getProcessPerformance: async (
    departmentId?: string
  ): Promise<ProcessPerformance[]> => {
    const params = departmentId ? `?department_id=${departmentId}` : '';
    const response = await api.get<ProcessPerformance[]>(
      `/analytics/processes/performance${params}`
    );
    return response.data;
  },

  getUserProductivity: async (
    departmentId?: string,
    days: number = 30
  ): Promise<UserProductivity[]> => {
    const params = new URLSearchParams({ days: String(days) });
    if (departmentId) params.append('department_id', departmentId);

    const response = await api.get<UserProductivity[]>(
      `/analytics/users/productivity?${params.toString()}`
    );
    return response.data;
  },

  getSLASummary: async (days: number = 30): Promise<SLASummary> => {
    const response = await api.get<SLASummary>(
      `/analytics/sla/summary?days=${days}`
    );
    return response.data;
  },
};
