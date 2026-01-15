import { useState, useRef } from 'react';
import { Upload, Download } from 'lucide-react';

export function BulkScheduleUpload({ onUpload }: { onUpload?: () => void }) {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/download-schedule-template`);
      if (!res.ok) throw new Error('Download failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'schedule_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      setError('Template download failed');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setResult(null);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/bulk-upload-schedule`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      setResult(`Inserted ${data.inserted} schedules`);
      if (onUpload) onUpload();
      setTimeout(() => setResult(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setTimeout(() => setError(null), 3000);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleDownloadTemplate}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-semibold border border-gray-300"
        title="Download CSV template with sample data"
      >
        <Download className="w-4 h-4" />
        Template
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        className="hidden"
        id="csv-upload"
      />
      <label
        htmlFor="csv-upload"
        className="flex items-center gap-2 px-4 py-2 bg-[#1a3b32] text-white rounded-lg hover:bg-[#2d5a4a] transition-colors cursor-pointer text-sm font-semibold"
      >
        <Upload className="w-4 h-4" />
        {uploading ? 'Uploading...' : 'Bulk Upload CSV'}
      </label>
      {result && <span className="text-green-600 text-sm font-semibold">{result}</span>}
      {error && <span className="text-red-600 text-sm font-semibold">{error}</span>}
    </div>
  );
}
