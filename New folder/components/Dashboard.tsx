
import React, { useState, useMemo } from 'react';
import { Plus, Filter, MoreVertical, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, Legend } from 'recharts';
import { StatMetric, ChartData, ShiftEvent, WorkspaceType } from '../types';

interface DashboardProps {
  activeWorkspace: WorkspaceType;
}

const METRICS: StatMetric[] = [
  { label: 'Total Clients', value: '247', trend: 0.08, trendType: 'up' },
  { label: 'Total Employees', value: '1,842', trend: 0.03, trendType: 'up' },
  { label: 'Billable Hours', value: '12,456', trend: 0.15, trendType: 'up' },
  { label: 'Lost Hours', value: '892', trend: 0.04, trendType: 'down' },
];

// YTD Leave Data - Past 12 months (Planned vs Unplanned)
const LEAVE_DATA: ChartData[] = [
  { name: 'Jan', plannedLeave: 45, unplannedLeave: 12 },
  { name: 'Feb', plannedLeave: 38, unplannedLeave: 18 },
  { name: 'Mar', plannedLeave: 52, unplannedLeave: 22 },
  { name: 'Apr', plannedLeave: 48, unplannedLeave: 15 },
  { name: 'May', plannedLeave: 61, unplannedLeave: 28, highlight: true },
  { name: 'Jun', plannedLeave: 55, unplannedLeave: 19 },
  { name: 'Jul', plannedLeave: 67, unplannedLeave: 31, highlight: true },
  { name: 'Aug', plannedLeave: 58, unplannedLeave: 24 },
  { name: 'Sep', plannedLeave: 49, unplannedLeave: 16 },
  { name: 'Oct', plannedLeave: 43, unplannedLeave: 11 },
  { name: 'Nov', plannedLeave: 51, unplannedLeave: 20 },
  { name: 'Dec', plannedLeave: 54, unplannedLeave: 25 },
];

const PERFORMANCE_DATA: ChartData[] = [
  { name: 'Jan', value: 78 },
  { name: 'Feb', value: 34 },
  { name: 'Mar', value: 67, highlight: true },
  { name: 'Apr', value: 28 },
  { name: 'May', value: 39 },
  { name: 'Jun', value: 80 },
];

const SCHEDULE: ShiftEvent[] = [
  { id: '1', title: 'Quality Assurance Review', time: '10:00 - 11:30 AM', date: 'Sept 19', type: 'quality' },
  { id: '2', title: 'Training: Customer Empathy', time: '02:00 - 03:30 PM', date: 'Sept 19', type: 'training' },
];

export const Dashboard: React.FC<DashboardProps> = ({ activeWorkspace }) => {
  const [weekOffset, setWeekOffset] = useState(0);

  const currentDate = useMemo(() => new Date(), []);
  
  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const weekStart = useMemo(() => {
    const monday = getMonday(currentDate);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return monday;
  }, [currentDate, weekOffset]);

  const monthYear = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
    return formatter.format(weekStart);
  }, [weekStart]);

  const todayFormatted = useMemo(() => {
    const formatter = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
    return formatter.format(currentDate);
  }, [currentDate]);

  const weekDates = useMemo(() => {
    const dates: number[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      dates.push(date.getDate());
    }
    return dates;
  }, [weekStart]);

  const todayDate = currentDate.getDate();
  const isCurrentWeek = weekOffset === 0;

  return (
    <div className="animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-1">{activeWorkspace} Overview</h1>
          <p className="text-gray-500 font-medium">Monitoring the {activeWorkspace} vitals for today.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#1a3b32] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#234d42] transition-all shadow-lg shadow-green-900/10 active:scale-95 shrink-0 self-start md:self-center">
          <Plus className="w-5 h-5" />
          <span>New {activeWorkspace === 'HR' ? 'Hiring' : 'Campaign'}</span>
        </button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column - Stats and Chart */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Performance Summary Cards */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{activeWorkspace} Kpis</h3>
                <p className="text-sm text-gray-400 font-medium mt-1">{todayFormatted}</p>
              </div>
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">
                  <TrendingUp className="w-3 h-3" />
                  Short
                </button>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-100 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">
                  <Filter className="w-3 h-3" />
                  Filter
                </button>
                <button className="p-1.5 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {METRICS.map((metric, i) => (
                <div key={metric.label} className={i !== 0 ? "border-l border-gray-100 pl-8" : ""}>
                  <p className="text-xs font-bold text-gray-400 mb-2">{metric.label}</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-gray-900 tracking-tight">{metric.value}</span>
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                      metric.trendType === 'up' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {metric.trendType === 'up' ? '+' : '-'}{(metric.trend * 100).toFixed(2)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Performance Chart */}
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-gray-900">YTD Leave Overview</h3>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-3xl font-black text-gray-900">898</span>
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-[#e4f47c]/40 rounded-lg text-[10px] font-black text-[#1a3b32]">
                    <TrendingUp className="w-3 h-3" />
                    Days Across 12 Months
                  </div>
                </div>
                <p className="text-xs text-gray-400 font-bold mt-2">Planned vs Unplanned Leave - Highest: July (98 days)</p>
              </div>
              <button className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={LEAVE_DATA}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 700}}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{fill: '#9ca3af', fontSize: 12, fontWeight: 700}}
                    dx={-10}
                  />
                  <Tooltip 
                    cursor={{fill: '#f9fafb'}}
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontWeight: 700}}
                    formatter={(value: any) => value}
                    labelFormatter={(label) => `${label}`}
                  />
                  <Legend 
                    wrapperStyle={{paddingTop: '20px', fontWeight: 700}}
                    iconType="square"
                  />
                  <Bar dataKey="plannedLeave" name="Planned Leave" fill="#e4f47c" radius={[8, 8, 0, 0]} barSize={25}>
                    {LEAVE_DATA.map((entry, index) => (
                      <Cell 
                        key={`planned-${index}`} 
                        fill={entry.highlight ? '#050c2a' : '#e4f47c'} 
                      />
                    ))}
                  </Bar>
                  <Bar dataKey="unplannedLeave" name="Unplanned Leave" fill="#f3f4f6" radius={[8, 8, 0, 0]} barSize={25}>
                    {LEAVE_DATA.map((entry, index) => (
                      <Cell 
                        key={`unplanned-${index}`} 
                        fill={entry.highlight ? '#cce320' : '#f3f4f6'} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column - Calendar and Schedule */}
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-bold text-gray-900">Calendar</h3>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setWeekOffset(weekOffset - 1)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-400" />
                </button>
                <button 
                  onClick={() => setWeekOffset(weekOffset + 1)}
                  className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="mb-8">
              <p className="text-sm font-bold text-gray-900 mb-6">{monthYear}</p>
              <div className="grid grid-cols-7 gap-4 mb-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
                  <span key={day} className="text-[10px] font-bold text-gray-400 text-center uppercase tracking-wider">{day}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-4">
                {weekDates.map((date, idx) => {
                  const isToday = isCurrentWeek && date === todayDate;
                  return (
                    <div 
                      key={idx} 
                      className={`flex flex-col items-center justify-center py-2 rounded-xl cursor-pointer transition-all ${
                        isToday ? 'bg-[#e4f47c] text-[#1a3b32]' : 'hover:bg-gray-50 text-gray-400'
                      }`}
                    >
                      <span className="text-sm font-black">{date}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4 flex-1">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Upcoming Events</p>
              
              {SCHEDULE.map((event) => (
                <div 
                  key={event.id} 
                  className={`group relative p-5 rounded-[1.5rem] border border-gray-100 transition-all hover:scale-[1.02] cursor-pointer ${
                    event.type === 'quality' ? 'bg-yellow-50/50' : 'bg-pink-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`p-2 rounded-lg bg-white shadow-sm`}>
                      <LayoutIcon className={`w-4 h-4 ${event.type === 'quality' ? 'text-yellow-600' : 'text-pink-600'}`} />
                    </div>
                    <MoreVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">{event.title}</h4>
                  <p className="text-xs font-medium text-gray-500">{event.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LayoutIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>
);
