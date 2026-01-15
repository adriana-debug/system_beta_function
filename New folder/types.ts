
export interface StatMetric {
  label: string;
  value: string;
  trend: number;
  trendType: 'up' | 'down';
}

export interface ChartData {
  name: string;
  value: number;
  highlight?: boolean;
}

export interface ShiftEvent {
  id: string;
  title: string;
  time: string;
  date: string;
  type: 'training' | 'operations' | 'quality' | 'break';
}

export interface ScheduleEntry {
  id: string;
  employee: string;
  campaign: string;
  role: string;
  shift: string;
  date: string; // ISO date YYYY-MM-DD
  day: string;  // Short day label e.g. Mon
  status: 'On Site' | 'Remote' | 'Leave';
}

export interface DailyRecord {
  id: string;
  employee: string;
  campaign: string;
  date: string; // ISO date
  day: string;
  timeIn: string;
  timeOut: string;
  status: 'Present' | 'Late' | 'Absent' | 'On Leave';
}

export enum NavigationItem {
  OVERVIEW = 'Overview',
  OPERATIONS = 'Operations',
  WORKFORCE = 'Workforce',
  ANALYTICS = 'Analytics',
  SCHEDULE = 'Schedule',
  DAILY = 'Daily Time Record'
}

export type WorkspaceType = 'Executive' | 'Operations' | 'HR' | 'IT' | 'Admin';

export interface Workspace {
  id: WorkspaceType;
  label: string;
  description: string;
  color: string;
}

export interface AiChartPoint {
  label: string;
  value: number;
}

export interface AiInsightResponse {
  summary: string;
  insights: string[];
  chart: AiChartPoint[];
}

export interface Employee {
  id: number;
  employee_no: string;
  first_name: string;
  last_name: string;
  campaign: string;
  date_of_joining: string;
  last_working_date?: string | null;
  status: 'active' | 'on_leave' | 'resigned';
  client_email: string;
  phone_no?: string | null;
  personal_email?: string | null;
  emergency_name?: string | null;
  emergency_phone?: string | null;
  organization_id: number;
}
