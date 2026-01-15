import React, { useMemo, useState } from 'react';
import { Filter, CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { BulkScheduleUpload } from './BulkScheduleUpload';

type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

const WEEK_DAYS: { key: DayKey; label: string; dateLabel: string; iso: string }[] = [
  { key: 'mon', label: 'Mon', dateLabel: '12', iso: '2026-01-12' },
  { key: 'tue', label: 'Tue', dateLabel: '13', iso: '2026-01-13' },
  { key: 'wed', label: 'Wed', dateLabel: '14', iso: '2026-01-14' },
  { key: 'thu', label: 'Thu', dateLabel: '15', iso: '2026-01-15' },
  { key: 'fri', label: 'Fri', dateLabel: '16', iso: '2026-01-16' },
  { key: 'sat', label: 'Sat', dateLabel: '17', iso: '2026-01-17' },
  { key: 'sun', label: 'Sun', dateLabel: '18', iso: '2026-01-18' },
];

interface WeeklyRow {
  name: string;
  campaign: string;
  initials: string;
  schedule: Record<DayKey, string | null>;
}

const WEEKLY_ROWS: WeeklyRow[] = [
  {
    name: 'Julianne Vause',
    campaign: 'Retention',
    initials: 'JV',
    schedule: {
      mon: '11 PM - 7 AM',
      tue: null,
      wed: '3 PM - 11 PM',
      thu: '08:00 - 16:00',
      fri: '10:00 - 18:00',
      sat: '14:00 - 22:00',
      sun: '11 PM - 7 AM',
    },
  },
  {
    name: 'Sarah Johnson',
    campaign: 'Support',
    initials: 'SJ',
    schedule: {
      mon: '7 AM - 3 PM',
      tue: '3 PM - 11 PM',
      wed: '08:00 - 16:00',
      thu: '10:00 - 18:00',
      fri: '14:00 - 22:00',
      sat: '11 PM - 7 AM',
      sun: '7 AM - 3 PM',
    },
  },
  {
    name: 'Michael Chen',
    campaign: 'Onboarding',
    initials: 'MC',
    schedule: {
      mon: '3 PM - 11 PM',
      tue: '08:00 - 16:00',
      wed: '10:00 - 18:00',
      thu: '14:00 - 22:00',
      fri: '11 PM - 7 AM',
      sat: '7 AM - 3 PM',
      sun: '3 PM - 11 PM',
    },
  },
  {
    name: 'Emily Rodriguez',
    campaign: 'Retention',
    initials: 'ER',
    schedule: {
      mon: '08:00 - 16:00',
      tue: '10:00 - 18:00',
      wed: '14:00 - 22:00',
      thu: '11 PM - 7 AM',
      fri: '7 AM - 3 PM',
      sat: '3 PM - 11 PM',
      sun: '08:00 - 16:00',
    },
  },
  {
    name: 'David Thompson',
    campaign: 'Support',
    initials: 'DT',
    schedule: {
      mon: '10:00 - 18:00',
      tue: '14:00 - 22:00',
      wed: '11 PM - 7 AM',
      thu: '7 AM - 3 PM',
      fri: '3 PM - 11 PM',
      sat: '08:00 - 16:00',
      sun: '10:00 - 18:00',
    },
  },
  {
    name: 'Jessica Martinez',
    campaign: 'Onboarding',
    initials: 'JM',
    schedule: {
      mon: '14:00 - 22:00',
      tue: '11 PM - 7 AM',
      wed: '7 AM - 3 PM',
      thu: '3 PM - 11 PM',
      fri: '08:00 - 16:00',
      sat: '10:00 - 18:00',
      sun: '14:00 - 22:00',
    },
  },
];

export const ScheduleTable: React.FC = () => {
  const [campaignFilter, setCampaignFilter] = useState<string>('All');
  const [weekOffset, setWeekOffset] = useState(0);

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

  const weekDays = useMemo(() => {
    const days: { key: DayKey; label: string; dateLabel: string; iso: string }[] = [];
    const dayKeys: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(date.getDate() + i);
      days.push({
        key: dayKeys[i],
        label: dayLabels[i],
        dateLabel: date.getDate().toString(),
        iso: date.toISOString().slice(0, 10),
      });
    }
    return days;
  }, [currentWeekStart]);

  const weekLabel = useMemo(() => {
    const start = currentWeekStart;
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    return `${formatter.format(start)} - ${formatter.format(end)}`;
  }, [currentWeekStart]);

  const todayIso = useMemo(() => {
    const now = new Date();
    return new Date(now.getTime() - now.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);
  }, []);

  const todayKey = weekDays.find((d) => d.iso === todayIso)?.key;

  const campaigns = useMemo(() => {
    const set = new Set<string>();
    WEEKLY_ROWS.forEach((row) => set.add(row.campaign));
    return ['All', ...Array.from(set)];
  }, []);

  const filteredRows = useMemo(() => {
    return WEEKLY_ROWS.filter((row) => campaignFilter === 'All' || row.campaign === campaignFilter);
  }, [campaignFilter]);

  return (
    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100 space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Weekly Schedule</h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-gray-400" />
            {weekLabel}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <BulkScheduleUpload />
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
              {weekDays.map((day) => (
                <th
                  key={day.key}
                  className={`px-4 py-3 text-center font-semibold text-gray-700 ${
                    day.key === todayKey ? 'bg-[#e4f47c]/40 border-[#e4f47c]' : ''
                  }`}
                >
                  <div className="text-xs uppercase font-black text-gray-500">{day.label}</div>
                  <div className="text-base font-bold text-gray-800">{day.dateLabel}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.name} className="border-b border-gray-100">
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#1a3b32] text-white text-xs font-bold flex items-center justify-center">
                      {row.initials}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{row.name}</p>
                      <p className="text-xs font-semibold text-gray-500">{row.campaign}</p>
                    </div>
                  </div>
                </td>
                {weekDays.map((day) => {
                  const shift = row.schedule[day.key];
                  const isToday = day.key === todayKey;
                  return (
                    <td
                      key={day.key}
                      className={`px-4 py-3 text-center ${isToday ? 'bg-[#e4f47c]/20' : ''}`}
                    >
                      <span
                        className={`inline-flex items-center justify-center min-w-[96px] px-3 py-1.5 rounded-lg text-xs font-semibold ${
                          shift ? 'bg-gray-100 text-gray-800' : 'bg-gray-50 text-gray-400'
                        }`}
                      >
                        {shift || 'OFF'}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
