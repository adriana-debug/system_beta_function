
import React, { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, 
  Users, 
  BarChart3, 
  Calendar,
  Clock4,
  ChevronDown,
  Lock,
  Briefcase,
  Crown,
  Monitor,
  Shield,
  Check
} from 'lucide-react';
import { NavigationItem, WorkspaceType, Workspace } from '../types';

interface SidebarProps {
  activeNav: NavigationItem;
  setActiveNav: (nav: NavigationItem) => void;
  activeWorkspace: WorkspaceType;
  setActiveWorkspace: (ws: WorkspaceType) => void;
  isCollapsed?: boolean;
}

const WORKSPACES: Workspace[] = [
  { id: 'Executive', label: 'Executive', description: 'Leadership & Strategy', color: 'bg-purple-500' },
  { id: 'Operations', label: 'Operations', description: 'Day-to-day Management', color: 'bg-green-500' },
  { id: 'HR', label: 'HR', description: 'People & Culture', color: 'bg-orange-500' },
  { id: 'IT', label: 'IT', description: 'Systems & Infrastructure', color: 'bg-blue-500' },
  { id: 'Admin', label: 'Admin', description: 'Governance & Access', color: 'bg-gray-500' },
];

const WorkspaceIcon = ({ id, className }: { id: WorkspaceType; className?: string }) => {
  switch (id) {
    case 'Executive': return <Crown className={className} />;
    case 'Operations': return <Briefcase className={className} />;
    case 'HR': return <Users className={className} />;
    case 'IT': return <Monitor className={className} />;
    case 'Admin': return <Shield className={className} />;
    default: return <Lock className={className} />;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeNav, 
  setActiveNav, 
  activeWorkspace, 
  setActiveWorkspace,
  isCollapsed = false
}) => {
  const [isWsOpen, setIsWsOpen] = useState(false);
  const wsDropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: NavigationItem.OVERVIEW, icon: LayoutDashboard },
    { name: NavigationItem.OPERATIONS, icon: Briefcase },
    { name: NavigationItem.WORKFORCE, icon: Users },
    { name: NavigationItem.ANALYTICS, icon: BarChart3 },
    { name: NavigationItem.SCHEDULE, icon: Calendar },
    { name: NavigationItem.DAILY, icon: Clock4 },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wsDropdownRef.current && !wsDropdownRef.current.contains(event.target as Node)) {
        setIsWsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentWs = WORKSPACES.find(w => w.id === activeWorkspace) || WORKSPACES[1];

  return (
    <div className="h-full flex flex-col p-4 relative">
      {/* Logo Section */}
      <div className="flex items-center justify-center px-2 py-4 mb-6 transition-all duration-300 ease-out">
        <img
          src="https://digitalmindsbpo.com/storage/2018/11/cropped-dm-favicon.png"
          alt="Digital Minds BPO"
          className={`rounded-xl shadow-md flex-shrink-0 transition-all duration-300 ease-out ${
            isCollapsed ? 'w-10 h-10' : 'w-12 h-12'
          }`}
        />
        {!isCollapsed && (
          <div className="flex flex-col flex-1 min-w-0 ml-3 transition-all duration-300 ease-out">
            <span className="text-sm font-bold tracking-tight text-[#1a3b32] leading-tight">Digital Minds BPO</span>
            <span className="text-xs font-semibold text-gray-500 leading-tight">Services Inc.</span>
            <span className="text-[10px] font-medium text-gray-400 leading-tight mt-0.5">Excellence in Operations</span>
          </div>
        )}
      </div>

      {/* Workspace Switcher */}
      <div className="mb-6 px-2 relative" ref={wsDropdownRef}>
        <div 
          onClick={() => setIsWsOpen(!isWsOpen)}
          className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ease-out cursor-pointer ${
            isWsOpen ? 'border-[#e4f47c] bg-[#e4f47c]/5 ring-1 ring-[#e4f47c]/30' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
          }`}
        >
          <div className="flex-shrink-0 p-2 rounded-lg bg-white border border-gray-100 shadow-xs">
            <WorkspaceIcon id={activeWorkspace} className="w-4 h-4 text-[#1a3b32]" />
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0 transition-all duration-300 ease-out">
              <p className="text-sm font-semibold text-gray-800 leading-none truncate">{currentWs.label}</p>
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tight leading-none mt-0.5">Active HUB</p>
            </div>
          )}
          {!isCollapsed && (
            <ChevronDown className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform duration-300 ease-out ${
              isWsOpen ? 'rotate-180' : ''
            }`} />
          )}
        </div>

        {/* Dropdown Menu */}
        {isWsOpen && (
          <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <p className="px-4 py-2 text-[10px] font-black text-gray-400 uppercase tracking-widest">Select Workspace</p>
            {WORKSPACES.map((ws) => (
              <button
                key={ws.id}
                onClick={() => {
                  setActiveWorkspace(ws.id);
                  setIsWsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors ${
                  activeWorkspace === ws.id ? 'bg-[#e4f47c]/10' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-white shadow-sm border border-gray-100`}>
                    <WorkspaceIcon id={ws.id} className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="text-left">
                    <p className={`text-sm font-bold leading-none mb-1 ${activeWorkspace === ws.id ? 'text-[#1a3b32]' : 'text-gray-700'}`}>{ws.label}</p>
                    <p className="text-[10px] text-gray-400 font-medium">{ws.description}</p>
                  </div>
                </div>
                {activeWorkspace === ws.id && <Check className="w-4 h-4 text-[#1a3b32]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className={`flex-1 space-y-1 transition-all duration-300 ease-out`}>
        {navItems.map((item) => {
          const isActive = activeNav === item.name;
          return (
            <button
              key={item.name}
              onClick={() => setActiveNav(item.name)}
              className={`w-full flex items-center gap-3 rounded-xl transition-all duration-300 ease-out ${
                isCollapsed ? 'justify-center px-3 py-3' : 'px-4 py-3'
              } ${
                isActive 
                ? 'bg-[#e4f47c] text-[#1a3b32] font-semibold shadow-sm' 
                : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`}
              title={isCollapsed ? item.name : ''}
            >
              <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-300 ${isActive ? 'text-[#1a3b32]' : 'text-gray-400'}`} />
              {!isCollapsed && <span className="text-sm truncate transition-opacity duration-300">{item.name}</span>}
            </button>
          );
        })}
      </nav>


    </div>
  );
};
