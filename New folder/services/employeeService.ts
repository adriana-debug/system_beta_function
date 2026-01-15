import { Employee } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export async function fetchEmployees(orgId?: number): Promise<Employee[]> {
  const query = orgId ? `?org_id=${orgId}` : '';
  const response = await fetch(`${API_BASE}/employees${query}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch employees: ${response.statusText}`);
  }

  return response.json();
}

export async function createEmployee(employee: Omit<Employee, 'id'>): Promise<Employee> {
  const response = await fetch(`${API_BASE}/employees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });

  if (!response.ok) {
    throw new Error(`Failed to create employee: ${response.statusText}`);
  }

  return response.json();
}

export async function updateEmployee(id: number, updates: Partial<Employee>): Promise<Employee> {
  const response = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error(`Failed to update employee: ${response.statusText}`);
  }

  return response.json();
}

export async function deleteEmployee(id: number): Promise<void> {
  const response = await fetch(`${API_BASE}/employees/${id}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to delete employee: ${response.statusText}`);
  }
}
