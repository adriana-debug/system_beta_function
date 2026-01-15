
import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Dashboard } from './components/Dashboard';
import { EmployeeTable } from './components/EmployeeTable';
import { ScheduleTable } from './components/ScheduleTable';
import { DailyTimeRecord } from './components/DailyTimeRecord';
import { NavigationItem, WorkspaceType } from './types';

const App: React.FC = () => {
  const [activeNav, setActiveNav] = useState<NavigationItem>(NavigationItem.OVERVIEW);
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceType>('Operations');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f3f4f6] text-[#1a1a1a]">
      {/* Sidebar - Fixed on desktop, hidden/toggle on mobile */}
      <div className={`fixed inset-y-0 left-0 hidden md:block border-r border-gray-200 bg-white transition-all duration-300 ease-out ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <Sidebar 
          activeNav={activeNav} 
          setActiveNav={setActiveNav} 
          activeWorkspace={activeWorkspace}
          setActiveWorkspace={setActiveWorkspace}
          isCollapsed={isSidebarCollapsed}
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-out ${
        isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        <Topbar isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <main className="flex-1 p-4 md:p-8 custom-scroll overflow-y-auto">
          {activeNav === NavigationItem.OVERVIEW ? (
            <Dashboard activeWorkspace={activeWorkspace} />
          ) : activeNav === NavigationItem.WORKFORCE ? (
            <EmployeeTable organizationId={1} />
          ) : activeNav === NavigationItem.SCHEDULE ? (
            <ScheduleTable />
          ) : activeNav === NavigationItem.DAILY ? (
            <DailyTimeRecord />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-2xl font-bold text-gray-400">{activeNav} View Coming Soon</h2>
                <p className="text-gray-500">We are currently building this section of the Opex 360 Platform for {activeWorkspace}.</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
