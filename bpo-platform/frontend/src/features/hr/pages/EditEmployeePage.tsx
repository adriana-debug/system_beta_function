import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { api } from '../../../services/api';

export function EditEmployeePage() {
  const navigate = useNavigate();
  const params = useParams();
  const id = params.employeeId;
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    department: '',
    campaign: '',
    status: 'active',
    join_date: '',
    position: '',
    manager_id: '',
    notes: '',
  });

  console.log('EditEmployeePage loaded, id:', id);

  const departments = ['Customer Support', 'Quality Assurance', 'Human Resources', 'Finance', 'Operations'];
  const campaigns = ['Tier 1 Support', 'QA Program', 'HR Operations', 'Finance Operations'];

  // Fetch employee data
  useEffect(() => {
    const fetchEmployee = async () => {
      console.log('Fetching employee with id:', id);
      if (!id) {
        console.error('No employee ID provided');
        setError('No employee ID provided');
        setFetching(false);
        return;
      }
      
      try {
        setFetching(true);
        console.log(`Making request to /employees/${id}`);
        const response = await api.get(`/employees/${id}`);
        console.log('Employee data received:', response.data);
        const employee = response.data;
        
        // Convert join_date to ISO string without timezone for input
        let joinDateStr = '';
        if (employee.join_date) {
          const date = new Date(employee.join_date);
          joinDateStr = date.toISOString().split('T')[0];
        }

        setFormData({
          first_name: employee.first_name || '',
          last_name: employee.last_name || '',
          email: employee.email || '',
          phone: employee.phone || '',
          department: employee.department || '',
          campaign: employee.campaign || '',
          status: employee.status || 'active',
          join_date: joinDateStr,
          position: employee.position || '',
          manager_id: employee.manager_id || '',
          notes: employee.notes || '',
        });
        console.log('Form data set:', formData);
      } catch (err: any) {
        console.error('Error fetching employee:', err);
        console.error('Error response:', err.response);
        setError(`Failed to load employee data: ${err.message}`);
      } finally {
        setFetching(false);
      }
    };

    fetchEmployee();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      
      // Prepare data for submission - convert empty strings to null for optional fields
      const submitData = {
        first_name: formData.first_name?.trim() || '',
        last_name: formData.last_name?.trim() || '',
        email: formData.email?.trim() || '',
        phone: formData.phone?.trim() || null,
        department: formData.department?.trim() || '',
        campaign: formData.campaign?.trim() || '',
        status: formData.status || 'active',
        join_date: formData.join_date ? new Date(formData.join_date).toISOString() : null,
        position: formData.position?.trim() || null,
        manager_id: (formData.manager_id?.trim() && formData.manager_id !== 'null') ? formData.manager_id.trim() : null,
        notes: formData.notes?.trim() || null,
      };

      console.log('Submitting update:', { id, submitData });
      await api.put(`/employees/${id}`, submitData);
      console.log('Update successful, redirecting...');
      navigate('/hr/employees');
    } catch (err: any) {
      console.error('Caught error:', err);
      console.error('Response:', err.response);
      console.error('Response data:', err.response?.data);
      
      let errorMessage = 'Failed to update employee';
      
      if (err.response?.data) {
        const responseData = err.response.data;
        
        if (responseData.detail) {
          const detail = responseData.detail;
          
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            errorMessage = detail
              .map((err: any) => {
                const loc = Array.isArray(err.loc) ? err.loc.join('.') : err.loc;
                return `${loc}: ${err.msg}`;
              })
              .join('\n');
          } else if (typeof detail === 'object') {
            errorMessage = JSON.stringify(detail, null, 2);
          }
        } else {
          errorMessage = JSON.stringify(responseData, null, 2);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(String(errorMessage));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading employee data...</div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/hr/employees')}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Employee</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 whitespace-pre-wrap">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 space-y-6">
        {/* Personal Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="First Name"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              required
            />
            <Input
              label="Last Name"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Input
              label="Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Job Information */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Information</h2>
          <div className="space-y-4">
            <Input
              label="Position"
              name="position"
              value={formData.position}
              onChange={handleChange}
            />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Department *
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Campaign *
                </label>
                <select
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a campaign</option>
                  {campaigns.map(camp => (
                    <option key={camp} value={camp}>
                      {camp}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Status and Dates */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Status and Dates</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="on_leave">On Leave</option>
              </select>
            </div>
            <Input
              label="Join Date"
              name="join_date"
              type="date"
              value={formData.join_date}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Manager and Notes */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Information</h2>
          <div className="space-y-4">
            <Input
              label="Manager ID (UUID)"
              name="manager_id"
              value={formData.manager_id}
              onChange={handleChange}
              placeholder="Leave empty for no manager"
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Additional notes about the employee"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
              />
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex gap-3 pt-6">
          <Button
            type="submit"
            disabled={loading}
            className="flex-1"
          >
            {loading ? 'Updating...' : 'Update Employee'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate('/hr/employees')}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
