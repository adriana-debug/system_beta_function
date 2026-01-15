
import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, Command, ChevronDown, LogOut, Settings, User, Menu } from 'lucide-react';

interface TopbarProps {
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ isSidebarCollapsed = false, onToggleSidebar }) => {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const user = {
    name: 'Juan de la Cruz',
    email: 'juan.delacruz@nexus.com',
    role: 'Operations Lead',
    id: '8827-0X'
  };
  const nameParts = user.name.split(' ').filter(Boolean);
  const initials = `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-20">
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
          title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center flex-1 relative">
        <Search className="w-4 h-4 absolute left-3 text-gray-400" />
        <input 
          type="text" 
          placeholder="Search reports, agents, or settings..." 
          className="w-full pl-10 pr-12 py-2 bg-gray-50 rounded-xl border border-gray-100 focus:outline-none focus:ring-2 focus:ring-[#cce320] transition-all text-sm"
        />
        <div className="absolute right-3 flex items-center gap-1 bg-white border border-gray-200 px-1.5 py-0.5 rounded-md shadow-sm pointer-events-none">
          <Command className="w-3 h-3 text-gray-400" />
          <span className="text-[10px] font-bold text-gray-400">K</span>
        </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
              <Bell className="w-5 h-5" />
            </button>
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>
        </div>

        {/* User Profile with Popover */}
        <div className="flex items-center gap-3 border-l border-gray-100 pl-6 relative" ref={profileRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 transition-all"
          >
            <div className="w-10 h-10 rounded-full border-2 border-[#cce320] shadow-sm bg-[#1a3b32] text-white font-semibold flex items-center justify-center text-sm">
              {initials}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Profile Popover */}
          {isProfileOpen && (
            <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              {/* Profile Header */}
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full border-2 border-[#cce320] shadow-sm bg-[#1a3b32] text-white font-bold flex items-center justify-center">
                    {initials}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-gray-800">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{user.email}</p>
                    <p className="text-xs text-gray-400 mt-2 font-semibold uppercase tracking-wide">{user.role} | ID: {user.id}</p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors">
                <User className="w-4 h-4 text-gray-400" />
                <span className="text-sm">View Profile</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors border-b border-gray-100">
                <Settings className="w-4 h-4 text-gray-400" />
                <span className="text-sm">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                <span className="text-sm font-medium">Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
