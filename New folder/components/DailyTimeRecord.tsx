import React, { useMemo, useState } from 'react';
import { Clock4, Filter, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { DailyRecord } from '../types';

const DAILY_RECORDS: DailyRecord[] = [
  {
    id: 'dtr-1',
    employee: 'Juan de la Cruz',
    campaign: 'Retention',
    date: '2026-01-15',
    day: 'Thu',
    timeIn: '08:05 AM',
    timeOut: '04:10 PM',
    status: 'Late',
  },
  {
    id: 'dtr-2',
    employee: 'Alice Ramos',
    campaign: 'Onboarding',
    date: '2026-01-15',
    day: 'Thu',
    timeIn: '09:00 AM',
    timeOut: '05:00 PM',
    status: 'Present',
  },
  {
    id: 'dtr-3',
    employee: 'Marcus Lee',
    campaign: 'Support',
    date: '2026-01-15',
    day: 'Thu',
    timeIn: '07:00 AM',
    timeOut: '03:00 PM',
    status: 'Present',
  },
  {
    id: 'dtr-4',
    employee: 'Priya Patel',
    campaign: 'Retention',
    date: '2026-01-15',
    day: 'Thu',
    timeIn: '-',
    timeOut: '-',
    status: 'On Leave',
  },
];

const statusBadge = (status: DailyRecord['status']) => {
  const base = 'px-2 py-1 rounded-md text-xs font-semibold';
  if (status === 'Present') return `${base} bg-green-50 text-green-700`;
  if (status === 'Late') return `${base} bg-yellow-50 text-yellow-700`;
  if (status === 'Absent') return `${base} bg-red-50 text-red-700`;
  return `${base} bg-gray-100 text-gray-700`;
};

export const DailyTimeRecord: React.FC = () => {
  const [campaignFilter, setCampaignFilter] = useState<string>('All');
  const [weekOffset, setWeekOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const getMonday = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  };

  const currentWeekStart = useMemo(() => {
    const today = new Date();
    const monday = getMonday(today);
    monday.setDate(monday.getDate() + weekOffset * 7);
    return monday;
  }, [weekOffset]);

  const weekLabel = useMemo(() => {
    const start = currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }, [currentWeekStart]);

  const today = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }, []);

  const campaigns = useMemo(() => {
    const set = new Set<string>();
    DAILY_RECORDS.forEach((r) => set.add(r.campaign));
    return ['All', ...Array.from(set)];
  }, []);

  const filtered = useMemo(() => {
    return DAILY_RECORDS.filter((r) => {
      const matchesCampaign = campaignFilter === 'All' || r.campaign === campaignFilter;
      const matchesSearch = searchTerm === '' || 
        r.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.campaign.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCampaign && matchesSearch;
    });
  }, [campaignFilter, searchTerm]);

  const statusCounts = useMemo(() => {
    const counts = {
      present: 0,
      late: 0,
      absent: 0,
      onLeave: 0,
    };
    filtered.forEach((r) => {
      if (r.status === 'Present') counts.present++;
      else if (r.status === 'Late') counts.late++;
      else if (r.status === 'Absent') counts.absent++;
      else if (r.status === 'On Leave') counts.onLeave++;
    });
    return counts;
  }, [filtered]);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Daily Time Record</h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <Clock4 className="w-4 h-4 text-gray-400" />
            {weekLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employee..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#cce320] transition-all"
            />
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-lg border border-gray-200 bg-gray-50">
            <button
              onClick={() => setWeekOffset(weekOffset - 1)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => setWeekOffset(0)}
              className="px-3 py-1 text-xs font-bold text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => setWeekOffset(weekOffset + 1)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="bg-transparent text-sm font-semibold text-gray-700 focus:outline-none"
            >
              {campaigns.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Employee</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Campaign</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Day</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Date</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Time In</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Time Out</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                  {entry.employee}
                </td>
                <td className="px-4 py-3 text-gray-700">{entry.campaign}</td>
                <td className="px-4 py-3 text-gray-700">{entry.day}</td>
                <td className="px-4 py-3 text-gray-700">{entry.date}</td>
                <td className="px-4 py-3 text-gray-700">{entry.timeIn}</td>
                <td className="px-4 py-3 text-gray-700">{entry.timeOut}</td>
                <td className="px-4 py-3">
                  <span className={statusBadge(entry.status)}>{entry.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status Summary */}
      <div className="flex items-center gap-6 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm font-semibold text-gray-700">Present: <span className="text-gray-900">{statusCounts.present}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <span className="text-sm font-semibold text-gray-700">Late: <span className="text-gray-900">{statusCounts.late}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm font-semibold text-gray-700">Absent: <span className="text-gray-900">{statusCounts.absent}</span></span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-gray-400"></div>
          <span className="text-sm font-semibold text-gray-700">On Leave: <span className="text-gray-900">{statusCounts.onLeave}</span></span>
        </div>
        <div className="ml-auto">
          <span className="text-sm font-bold text-gray-500">Total: <span className="text-gray-900">{filtered.length}</span></span>
        </div>
      </div>
    </div>
  );
};
