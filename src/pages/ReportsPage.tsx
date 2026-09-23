import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleHeader, FeatureGrid, ModuleCardBox, ModulePageWrapper, StatusRow } from '@/components/ModulePage';
import { downloadReportPDF, downloadReportExcel } from '@/lib/exportUtils';
import {
  FileText, Calendar, Download, History, FileBarChart, FileSpreadsheet,
  Loader2, CheckCircle, AlertCircle,
} from 'lucide-react';

const FEATURES = [
  { icon: Calendar, label: 'Daily Reports', value: '30', color: '#3b82f6' },
  { icon: FileBarChart, label: 'Weekly Reports', value: '4', color: '#22c55e' },
  { icon: FileSpreadsheet, label: 'Monthly Reports', value: '12', color: '#eab308' },
  { icon: FileText, label: 'Annual Reports', value: '1', color: '#64748b' },
  { icon: Download, label: 'Exports Today', value: '5', color: '#06b6d4' },
  { icon: History, label: 'Report History', value: '47', color: '#3b82f6' },
];

interface ReportItem {
  name: string;
  type: string;
  date: string;
}

const REPORTS: ReportItem[] = [
  { name: 'Daily Report — Aug 14, 2026', type: 'Daily', date: 'Today' },
  { name: 'Weekly Summary — Week 32', type: 'Weekly', date: '2 days ago' },
  { name: 'Water Usage Report — July', type: 'Monthly', date: '14 days ago' },
  { name: 'Complaint Resolution — July', type: 'Monthly', date: '14 days ago' },
  { name: 'Annual Village Report 2025', type: 'Annual', date: 'Jan 2026' },
];

export function ReportsPage() {
  const navigate = useNavigate();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  function showToast(msg: string, type: 'success' | 'error') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleDownloadPDF(report: ReportItem) {
    setDownloading(`pdf-${report.name}`);
    try {
      await downloadReportPDF(report);
      showToast('PDF downloaded successfully', 'success');
    } catch (err) {
      console.error('PDF download error:', err);
      showToast('Failed to download PDF. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  }

  async function handleDownloadExcel(report: ReportItem) {
    setDownloading(`xlsx-${report.name}`);
    try {
      await downloadReportExcel(report);
      showToast('Excel file downloaded successfully', 'success');
    } catch (err) {
      console.error('Excel download error:', err);
      showToast('Failed to download Excel. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  }

  async function handleExportAllPDF() {
    setDownloading('export-pdf');
    try {
      await downloadReportPDF({ name: 'Complete Village Report', type: 'Full Export', date: new Date().toLocaleDateString() });
      showToast('PDF exported successfully', 'success');
    } catch (err) {
      console.error('PDF export error:', err);
      showToast('Failed to export PDF. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  }

  async function handleExportAllExcel() {
    setDownloading('export-xlsx');
    try {
      await downloadReportExcel({ name: 'Complete Village Report', type: 'Full Export', date: new Date().toLocaleDateString() });
      showToast('Excel exported successfully', 'success');
    } catch (err) {
      console.error('Excel export error:', err);
      showToast('Failed to export Excel. Please try again.', 'error');
    } finally {
      setDownloading(null);
    }
  }

  return (
    <ModulePageWrapper>
      {toast && (
        <div
          className={`fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ring-1 ${
            toast.type === 'success'
              ? 'bg-green-50 text-green-700 ring-green-200'
              : 'bg-red-50 text-red-700 ring-red-200'
          }`}
        >
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
          {toast.msg}
        </div>
      )}

      <ModuleHeader title="Reports" subtitle="Daily, weekly, monthly, and annual village reports" icon={FileText} color="#3b82f6" />
      <FeatureGrid features={FEATURES} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ModuleCardBox title="Recent Reports" icon={History} color="#3b82f6">
          <div className="space-y-3">
            {REPORTS.map((r) => (
              <div key={r.name} className="flex items-center justify-between rounded-xl border border-slate-100 p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">{r.name}</p>
                  <p className="text-xs text-slate-400">{r.type} • {r.date}</p>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleDownloadPDF(r)}
                    disabled={downloading === `pdf-${r.name}`}
                    className="rounded-lg bg-blue-50 p-2 text-blue-600 hover:bg-blue-100 disabled:opacity-50"
                    title="Download PDF"
                  >
                    {downloading === `pdf-${r.name}` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                  <button
                    onClick={() => handleDownloadExcel(r)}
                    disabled={downloading === `xlsx-${r.name}`}
                    className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100 disabled:opacity-50"
                    title="Download Excel"
                  >
                    {downloading === `xlsx-${r.name}` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <FileSpreadsheet size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ModuleCardBox>

        <div className="space-y-6">
          <ModuleCardBox title="Export Options" icon={Download} color="#22c55e">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExportAllPDF}
                disabled={downloading === 'export-pdf'}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {downloading === 'export-pdf' ? (
                  <Loader2 size={24} className="animate-spin text-red-600" />
                ) : (
                  <FileText size={24} className="text-red-600" />
                )}
                <span className="text-xs font-semibold text-slate-700">Export PDF</span>
              </button>
              <button
                onClick={handleExportAllExcel}
                disabled={downloading === 'export-xlsx'}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-100 p-4 hover:bg-slate-50 transition-colors disabled:opacity-50"
              >
                {downloading === 'export-xlsx' ? (
                  <Loader2 size={24} className="animate-spin text-green-600" />
                ) : (
                  <FileSpreadsheet size={24} className="text-green-600" />
                )}
                <span className="text-xs font-semibold text-slate-700">Export Excel</span>
              </button>
            </div>
          </ModuleCardBox>

          <ModuleCardBox title="Report Categories" icon={FileBarChart} color="#06b6d4" actionLabel="View Analytics" onAction={() => navigate('/analytics')}>
            <div className="space-y-2.5">
              <StatusRow label="Water Management Reports" value="12 available" status="good" />
              <StatusRow label="Complaint Reports" value="15 available" status="good" />
              <StatusRow label="Education Reports" value="6 available" status="good" />
              <StatusRow label="Agriculture Reports" value="8 available" status="good" />
            </div>
          </ModuleCardBox>
        </div>
      </div>
    </ModulePageWrapper>
  );
}
