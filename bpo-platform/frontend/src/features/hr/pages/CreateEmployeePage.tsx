import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { api } from '../../../services/api';

export function CreateEmployeePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const departments = ['Customer Support', 'Quality Assurance', 'Human Resources', 'Finance', 'Operations'];
  const campaigns = ['Tier 1 Support', 'QA Program', 'HR Operations', 'Finance Operations'];

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

      await api.post('/employees', submitData);
      navigate('/hr/employees');
    } catch (err: any) {
      console.error('Caught error:', err);
      console.error('Response:', err.response);
      console.error('Response data:', err.response?.data);
      
      let errorMessage = 'Failed to create employee';
      
      if (err.response?.data) {
        // First, try to handle the detail field
        const responseData = err.response.data;
        
        if (responseData.detail) {
          const detail = responseData.detail;
          
          if (typeof detail === 'string') {
            errorMessage = detail;
          } else if (Array.isArray(detail)) {
            // Array of validation errors
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
          // Fallback to showing entire response
          errorMessage = JSON.stringify(responseData, null, 2);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(String(errorMessage));
      console.error('Setting error to:', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/hr/employees')}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-bold">Add New Employee</h1>
          <p className="text-gray-600">Fill in the employee details below</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 max-w-2xl">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 whitespace-pre-wrap">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">First Name *</label>
                <Input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Last Name *</label>
                <Input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email *</label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div>
            <h2 className="text-lg font-semibold mb-4">Employment Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Department *</label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Campaign *</label>
                <select
                  name="campaign"
                  value={formData.campaign}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Campaign</option>
                  {campaigns.map(camp => (
                    <option key={camp} value={camp}>
                      {camp}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Position *</label>
                <Input
                  type="text"
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Join Date *</label>
                <Input
                  type="date"
                  name="join_date"
                  value={formData.join_date}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Manager</label>
                <Input
                  type="text"
                  name="manager_id"
                  placeholder="Manager ID (optional)"
                  value={formData.manager_id}
                  onChange={handleChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Status *</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="on_leave">On Leave</option>
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              type="button"
              onClick={() => navigate('/hr/employees')}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Employee'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
