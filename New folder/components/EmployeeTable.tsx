import React, { useEffect, useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Loader2,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import { Employee } from '../types';
import { fetchEmployees, createEmployee, deleteEmployee, updateEmployee } from '../services/employeeService';

interface EmployeeTableProps {
  organizationId: number;
}

type SortField = keyof Employee;
type SortOrder = 'asc' | 'desc';

export const EmployeeTable: React.FC<EmployeeTableProps> = ({ organizationId }) => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>('last_name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Employee>>({});
  const [formData, setFormData] = useState<Omit<Employee, 'id'>>(() => ({
    employee_no: '',
    first_name: '',
    last_name: '',
    campaign: '',
    date_of_joining: new Date().toISOString().split('T')[0],
    last_working_date: null,
    status: 'active',
    client_email: '',
    phone_no: '',
    personal_email: '',
    emergency_name: '',
    emergency_phone: '',
    organization_id: organizationId,
  }));

  useEffect(() => {
    loadEmployees();
  }, [organizationId]);

  useEffect(() => {
    setFormData((prev) => ({ ...prev, organization_id: organizationId }));
  }, [organizationId]);

  const loadEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchEmployees(organizationId);
      setEmployees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedEmployees = [...employees].sort((a, b) => {
    const aVal = a[sortField];
    const bVal = b[sortField];

    if (aVal === undefined || bVal === undefined) return 0;
    if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const normalizeOptional = (value?: string | null) => {
    if (value === undefined || value === null) return undefined;
    const trimmed = value.trim();
    return trimmed.length === 0 ? undefined : trimmed;
  };

  const buildCreatePayload = (data: Omit<Employee, 'id'>): Omit<Employee, 'id'> => ({
    ...data,
    last_working_date: normalizeOptional(data.last_working_date) ?? undefined,
    phone_no: normalizeOptional(data.phone_no),
    personal_email: normalizeOptional(data.personal_email),
    emergency_name: normalizeOptional(data.emergency_name),
    emergency_phone: normalizeOptional(data.emergency_phone),
  });

  const buildUpdatePayload = (data: Partial<Employee>): Partial<Employee> => ({
    ...data,
    last_working_date: normalizeOptional(data.last_working_date as string | null) ?? undefined,
    phone_no: normalizeOptional(data.phone_no as string | null),
    personal_email: normalizeOptional(data.personal_email as string | null),
    emergency_name: normalizeOptional(data.emergency_name as string | null),
    emergency_phone: normalizeOptional(data.emergency_phone as string | null),
  });

  const resetForm = () => {
    setFormData({
      employee_no: '',
      first_name: '',
      last_name: '',
      campaign: '',
      date_of_joining: new Date().toISOString().split('T')[0],
      last_working_date: null,
      status: 'active',
      client_email: '',
      phone_no: '',
      personal_email: '',
      emergency_name: '',
      emergency_phone: '',
      organization_id: organizationId,
    });
  };

  const handleAddEmployee = async () => {
    try {
      const newEmployee = await createEmployee(buildCreatePayload(formData));
      setEmployees((prev) => [...prev, newEmployee]);
      resetForm();
      setShowDrawer(false);
      setIsAddMode(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add employee');
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedEmployee) return;
    try {
      const payload = buildUpdatePayload(editFormData);
      const updatedEmployee = await updateEmployee(selectedEmployee.id, payload);
      setEmployees((prev) => prev.map((emp) => (emp.id === updatedEmployee.id ? updatedEmployee : emp)));
      setSelectedEmployee(updatedEmployee);
      setIsEditing(false);
      setEditFormData({});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update employee');
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id);
        setEmployees(employees.filter((e) => e.id !== id));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete employee');
      }
    }
  };

  const SortHeader: React.FC<{ field: SortField; label: string }> = ({ field, label }) => (
    <button
      onClick={() => handleSort(field)}
      className="flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900 transition"
    >
      {label}
      {sortField === field && (
        sortOrder === 'asc' ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-[#1a3b32]" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Employees</h3>
          <p className="text-sm text-gray-500 mt-1">{employees.length} team members</p>
        </div>
        <button
          onClick={() => {
            setIsAddMode(true);
            setSelectedEmployee(null);
            resetForm();
            setShowDrawer(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3b32] text-white text-sm font-semibold hover:bg-[#234d42] transition"
        >
          <Plus className="w-4 h-4" />
          Add Employee
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left">
                <SortHeader field="last_name" label="Name" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader field="employee_no" label="Employee #" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader field="campaign" label="Campaign" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader field="date_of_joining" label="Date Joined" />
              </th>
              <th className="px-4 py-3 text-left">
                <SortHeader field="status" label="Status" />
              </th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedEmployees.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                  No employees found. Add one to get started.
                </td>
              </tr>
            ) : (
              sortedEmployees.map((emp) => (
                <tr 
                  key={emp.id} 
                  className="border-b border-gray-100 hover:bg-gray-50 transition cursor-pointer"
                  onClick={() => {
                    setSelectedEmployee(emp);
                    setIsEditing(false);
                    setIsAddMode(false);
                    setShowDrawer(true);
                  }}
                >
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {emp.first_name} {emp.last_name}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{emp.employee_no}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.campaign}</td>
                  <td className="px-4 py-3 text-gray-600">{emp.date_of_joining}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-md text-xs font-semibold ${
                        emp.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : emp.status === 'on_leave'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsAddMode(false);
                        setIsEditing(true);
                        setEditFormData({
                          employee_no: emp.employee_no,
                          first_name: emp.first_name,
                          last_name: emp.last_name,
                          campaign: emp.campaign,
                          date_of_joining: emp.date_of_joining,
                          last_working_date: emp.last_working_date ?? null,
                          status: emp.status,
                          client_email: emp.client_email,
                          phone_no: emp.phone_no ?? '',
                          personal_email: emp.personal_email ?? '',
                          emergency_name: emp.emergency_name ?? '',
                          emergency_phone: emp.emergency_phone ?? '',
                        });
                        setShowDrawer(true);
                      }}
                      className="p-1 text-gray-400 hover:text-blue-600 transition"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(emp.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Employee Details/Add Drawer */}
      {showDrawer && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => {
              setShowDrawer(false);
              setIsEditing(false);
              setIsAddMode(false);
              setSelectedEmployee(null);
              setEditFormData({});
            }}
          />

          {/* Drawer */}
          <div className="fixed right-0 top-0 bottom-0 h-screen w-96 bg-white shadow-xl z-50 overflow-y-auto flex flex-col">
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
              <h2 className="text-lg font-semibold text-gray-700">
                {isAddMode ? 'Add Employee' : 'Employee Details'}
              </h2>
              <button
                onClick={() => {
                  setShowDrawer(false);
                  setIsEditing(false);
                  setIsAddMode(false);
                  setSelectedEmployee(null);
                  setEditFormData({});
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Avatar and Name - Only show in view/edit mode */}
              {!isAddMode && selectedEmployee && (
                <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                  <div className="w-12 h-12 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-sm font-semibold shrink-0">
                    {selectedEmployee.first_name.charAt(0)}{selectedEmployee.last_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-gray-700">
                      {selectedEmployee.first_name} {selectedEmployee.last_name}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedEmployee.campaign}</p>
                    <div className="mt-2">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        selectedEmployee.status === 'active'
                          ? 'bg-green-50 text-green-700'
                          : selectedEmployee.status === 'on_leave'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                      }`}>
                        {selectedEmployee.status === 'active' ? 'Active' : selectedEmployee.status === 'on_leave' ? 'On Leave' : 'Resigned'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Content - Show form in add/edit mode, otherwise show details */}
              {(isAddMode || isEditing) ? (
                <form
                  className="space-y-4"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (isAddMode) {
                      handleAddEmployee();
                    } else if (isEditing) {
                      handleSaveEdits();
                    }
                  }}
                >
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">EMPLOYEE NO</label>
                    <input
                      type="text"
                      value={isAddMode ? formData.employee_no : (editFormData.employee_no || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, employee_no: e.target.value })
                        : setEditFormData({ ...editFormData, employee_no: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">FIRST NAME</label>
                      <input
                        type="text"
                        value={isAddMode ? formData.first_name : (editFormData.first_name || '')}
                        onChange={(e) => isAddMode 
                          ? setFormData({ ...formData, first_name: e.target.value })
                          : setEditFormData({ ...editFormData, first_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">LAST NAME</label>
                      <input
                        type="text"
                        value={isAddMode ? formData.last_name : (editFormData.last_name || '')}
                        onChange={(e) => isAddMode 
                          ? setFormData({ ...formData, last_name: e.target.value })
                          : setEditFormData({ ...editFormData, last_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">CAMPAIGN</label>
                    <input
                      type="text"
                      value={isAddMode ? formData.campaign : (editFormData.campaign || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, campaign: e.target.value })
                        : setEditFormData({ ...editFormData, campaign: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">DATE OF JOINING</label>
                    <input
                      type="date"
                      value={isAddMode ? formData.date_of_joining : (editFormData.date_of_joining || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, date_of_joining: e.target.value })
                        : setEditFormData({ ...editFormData, date_of_joining: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">CLIENT EMAIL</label>
                    <input
                      type="email"
                      value={isAddMode ? formData.client_email : (editFormData.client_email || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, client_email: e.target.value })
                        : setEditFormData({ ...editFormData, client_email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">PHONE</label>
                    <input
                      type="tel"
                      value={isAddMode ? (formData.phone_no ?? '') : (editFormData.phone_no || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, phone_no: e.target.value })
                        : setEditFormData({ ...editFormData, phone_no: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">PERSONAL EMAIL</label>
                    <input
                      type="email"
                      value={isAddMode ? (formData.personal_email ?? '') : (editFormData.personal_email || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, personal_email: e.target.value })
                        : setEditFormData({ ...editFormData, personal_email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">EMERGENCY CONTACT</label>
                      <input
                        type="text"
                        value={isAddMode ? (formData.emergency_name ?? '') : (editFormData.emergency_name || '')}
                        onChange={(e) => isAddMode 
                          ? setFormData({ ...formData, emergency_name: e.target.value })
                          : setEditFormData({ ...editFormData, emergency_name: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-500 mb-1 block">EMERGENCY PHONE</label>
                      <input
                        type="tel"
                        value={isAddMode ? (formData.emergency_phone ?? '') : (editFormData.emergency_phone || '')}
                        onChange={(e) => isAddMode 
                          ? setFormData({ ...formData, emergency_phone: e.target.value })
                          : setEditFormData({ ...editFormData, emergency_phone: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">STATUS</label>
                    <select
                      value={isAddMode ? formData.status : (editFormData.status || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, status: e.target.value as Employee['status'] })
                        : setEditFormData({ ...editFormData, status: e.target.value as Employee['status'] })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                    >
                      <option value="active">active</option>
                      <option value="on_leave">on_leave</option>
                      <option value="resigned">resigned</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1 block">LAST WORKING DATE</label>
                    <input
                      type="date"
                      value={isAddMode ? (formData.last_working_date ?? '') : (editFormData.last_working_date || '')}
                      onChange={(e) => isAddMode 
                        ? setFormData({ ...formData, last_working_date: e.target.value })
                        : setEditFormData({ ...editFormData, last_working_date: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#cce320]"
                    />
                  </div>

                  <div className="space-y-2 pt-4 border-t border-gray-100">
                    {isAddMode ? (
                      <>
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg bg-[#1a3b32] text-white text-sm font-medium hover:bg-[#234d42] transition"
                        >
                          Create Employee
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDrawer(false);
                            setIsAddMode(false);
                            resetForm();
                          }}
                          className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="submit"
                          className="w-full py-2 rounded-lg bg-[#1a3b32] text-white text-sm font-medium hover:bg-[#234d42] transition"
                        >
                          Save Changes
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setIsEditing(false);
                            setEditFormData({});
                          }}
                          className="w-full py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                        >
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </form>
              ) : selectedEmployee && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">EMPLOYEE ID</p>
                    <p className="text-sm text-gray-700">EMP-{String(selectedEmployee.id).padStart(3, '0')}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">EMPLOYEE NO</p>
                    <p className="text-sm text-gray-700">{selectedEmployee.employee_no}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">CLIENT EMAIL</p>
                    <p className="text-sm text-gray-700">{selectedEmployee.client_email}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">CAMPAIGN</p>
                    <p className="text-sm text-gray-700">{selectedEmployee.campaign}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">DATE OF JOINING</p>
                    <p className="text-sm text-gray-700">{new Date(selectedEmployee.date_of_joining).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  </div>

                  {selectedEmployee.last_working_date && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">LAST WORKING DATE</p>
                      <p className="text-sm text-gray-700">{new Date(selectedEmployee.last_working_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  )}

                  {selectedEmployee.phone_no && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">PHONE</p>
                      <p className="text-sm text-gray-700">{selectedEmployee.phone_no}</p>
                    </div>
                  )}

                  {selectedEmployee.personal_email && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">PERSONAL EMAIL</p>
                      <p className="text-sm text-gray-700">{selectedEmployee.personal_email}</p>
                    </div>
                  )}

                  {selectedEmployee.emergency_name && (
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">EMERGENCY CONTACT</p>
                      <p className="text-sm text-gray-700">
                        {selectedEmployee.emergency_name}
                        {selectedEmployee.emergency_phone ? ` - ${selectedEmployee.emergency_phone}` : ''}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {!isAddMode && !isEditing && selectedEmployee && (
                <div className="space-y-2 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => {
                      setIsEditing(true);
                      setEditFormData({
                        employee_no: selectedEmployee.employee_no,
                        first_name: selectedEmployee.first_name,
                        last_name: selectedEmployee.last_name,
                        campaign: selectedEmployee.campaign,
                        date_of_joining: selectedEmployee.date_of_joining,
                        last_working_date: selectedEmployee.last_working_date ?? null,
                        status: selectedEmployee.status,
                        client_email: selectedEmployee.client_email,
                        phone_no: selectedEmployee.phone_no ?? '',
                        personal_email: selectedEmployee.personal_email ?? '',
                        emergency_name: selectedEmployee.emergency_name ?? '',
                        emergency_phone: selectedEmployee.emergency_phone ?? '',
                      });
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      handleDelete(selectedEmployee.id);
                      setShowDrawer(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
