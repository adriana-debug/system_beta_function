import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, RefreshCw, Loader2, Info } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { fetchAiInsights } from '../services/apiClient';
import { AiInsightResponse, WorkspaceType } from '../types';

interface AiInsightsPanelProps {
  workspace: WorkspaceType;
}

const colors = ['#1a3b32', '#e4f47c', '#f97316', '#2563eb', '#0ea5e9'];

const defaultPrompt = (workspace: WorkspaceType) =>
  `Provide three weekly insights for ${workspace} operations with utilization percentages.`;

export const AiInsightsPanel: React.FC<AiInsightsPanelProps> = ({ workspace }) => {
  const [prompt, setPrompt] = useState(defaultPrompt(workspace));
  const [aiData, setAiData] = useState<AiInsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPrompt(defaultPrompt(workspace));
  }, [workspace]);

  useEffect(() => {
    void runQuery();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspace]);

  const runQuery = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetchAiInsights({ prompt, workspace });
      setAiData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to fetch insights');
    } finally {
      setLoading(false);
    }
  };

  const chartData = useMemo(() => aiData?.chart ?? [], [aiData]);

  return (
    <div className="bg-white rounded-[1.5rem] p-6 shadow-sm border border-gray-100 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#1a3b32]">Gemini</p>
          <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>
          <p className="text-sm text-gray-500 mt-1">
            Gemini analyzes your {workspace} signals and drafts action items.
          </p>
        </div>
        <button
          onClick={runQuery}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#1a3b32] text-white text-sm font-semibold hover:bg-[#234d42] transition disabled:opacity-60"
          disabled={loading}
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {loading ? 'Running' : 'Refresh'}
        </button>
      </div>

      <div className="space-y-3">
        <label className="text-xs font-semibold text-gray-600" htmlFor="prompt">
          Prompt
        </label>
        <div className="flex gap-2">
          <textarea
            id="prompt"
            className="flex-1 rounded-xl border border-gray-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#cce320]"
            value={prompt}
            rows={3}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <button
            onClick={runQuery}
            className="self-end px-4 py-3 rounded-xl bg-[#e4f47c] text-[#1a3b32] font-bold text-sm shadow-sm hover:bg-[#d4e159] transition disabled:opacity-60"
            disabled={loading}
          >
            <Sparkles className="w-4 h-4 inline-block mr-2" />
            Generate
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          <Info className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {aiData && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Summary</p>
            <p className="text-sm text-gray-800 leading-relaxed">{aiData.summary}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {aiData.insights.map((insight, idx) => (
              <div key={idx} className="p-4 rounded-xl border border-gray-100 bg-white shadow-sm">
                <p className="text-[11px] font-black text-gray-400 uppercase mb-2">Insight {idx + 1}</p>
                <p className="text-sm text-gray-800 leading-snug">{insight}</p>
              </div>
            ))}
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <XAxis
                  dataKey="label"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis hide domain={[0, 100]} />
                <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: 12, border: 'none' }} />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={32}>
                  {chartData.map((entry, index) => (
                    <Cell key={entry.label} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};
