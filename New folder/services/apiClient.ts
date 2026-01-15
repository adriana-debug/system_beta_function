import { AiInsightResponse, AiChartPoint } from '../types';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export interface PromptRequestBody {
  prompt: string;
  workspace?: string;
  data_points?: AiChartPoint[];
}

export async function fetchAiInsights(body: PromptRequestBody): Promise<AiInsightResponse> {
  const response = await fetch(`${API_BASE}/ai/prompt`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`AI endpoint failed: ${response.statusText}`);
  }

  return response.json();
}
