import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronDown, Home, Users, Layers, BarChart3, Settings } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['hr']);

  const toggleMenu = (menu: string) => {
    setExpandedMenus(prev =>
      prev.includes(menu) ? prev.filter(m => m !== menu) : [...prev, menu]
    );
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <aside className="w-64 bg-white border-r border-gray-200 sticky top-0 h-screen overflow-y-auto">
      <nav className="p-4 space-y-2">
        {/* Dashboard */}
        <Link
          to="/"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive('/dashboard') || location.pathname === '/'
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Home size={20} />
          Dashboard
        </Link>

        {/* HR & People Management */}
        <div>
          <button
            onClick={() => toggleMenu('hr')}
            className={`w-full flex items-center justify-between px-4 py-2 rounded-lg transition-colors ${
              expandedMenus.includes('hr') || isActive('/hr')
                ? 'text-gray-900'
                : 'text-gray-700 hover:bg-gray-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <Users size={20} />
              <span className="font-semibold">HR & People</span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform ${
                expandedMenus.includes('hr') ? 'rotate-180' : ''
              }`}
            />
          </button>

          {expandedMenus.includes('hr') && (
            <div className="ml-4 mt-2 space-y-1 border-l border-gray-200 pl-2">
              {/* Employee Directory */}
              <div>
                <button
                  onClick={() => toggleMenu('employee-dir')}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded text-sm transition-colors ${
                    expandedMenus.includes('employee-dir') || isActive('/hr/employees')
                      ? 'text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>Employee Directory</span>
                  <ChevronDown
                    size={16}
                    className={`transition-transform ${
                      expandedMenus.includes('employee-dir') ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {expandedMenus.includes('employee-dir') && (
                  <div className="ml-3 mt-1 space-y-1">
                    <Link
                      to="/hr/employees"
                      className={`block px-4 py-2 rounded text-xs transition-colors ${
                        location.pathname === '/hr/employees'
                          ? 'bg-blue-50 text-blue-600 font-medium'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      View All
                    </Link>
                  </div>
                )}
              </div>

              {/* Create Employee */}
              <Link
                to="/hr/employees/create"
                className={`block px-4 py-2 rounded text-sm transition-colors ${
                  location.pathname === '/hr/employees/create'
                    ? 'bg-blue-50 text-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                + Add Employee
              </Link>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200"></div>

        {/* Processes */}
        <Link
          to="/processes"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive('/processes')
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Layers size={20} />
          Processes
        </Link>

        {/* Analytics */}
        <Link
          to="/analytics"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive('/analytics')
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <BarChart3 size={20} />
          Analytics
        </Link>

        {/* Settings */}
        <Link
          to="/settings"
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
            isActive('/settings')
              ? 'bg-blue-50 text-blue-600 font-medium'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Settings size={20} />
          Settings
        </Link>
      </nav>
    </aside>
  );
}
