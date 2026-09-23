import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { fetchComplaints, fetchWaterTanks, fetchGarbageBins, computeStats } from '@/lib/api';

const SYSTEM_TITLE = 'Smart Village Management System';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

interface ReportInfo {
  name: string;
  type: string;
  date: string;
}

export async function downloadReportPDF(report: ReportInfo): Promise<void> {
  const [complaints, waterTanks, garbageBins] = await Promise.all([
    fetchComplaints(),
    fetchWaterTanks(),
    fetchGarbageBins(),
  ]);
  const stats = computeStats(complaints);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(8, 13, 26);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(SYSTEM_TITLE, 14, 14);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  doc.text(`Generated: ${formatDate(new Date())}`, 14, 22);

  // Report title
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(report.name, 14, 40);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(`Report Type: ${report.type}  |  Date: ${report.date}`, 14, 47);

  // Summary stats
  autoTable(doc, {
    startY: 54,
    head: [['Metric', 'Value']],
    body: [
      ['Total Complaints', String(stats.total)],
      ['Pending', String(stats.pending)],
      ['In Progress', String(stats.in_progress)],
      ['Resolved', String(stats.resolved)],
      ['Rejected', String(stats.rejected)],
      ['High Priority', String(stats.high)],
      ['Resolution Rate', `${stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(0) : 0}%`],
      ['Water Tanks', String(waterTanks.length)],
      ['Garbage Bins', String(garbageBins.length)],
    ],
    theme: 'striped',
    headStyles: { fillColor: [59, 130, 246], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  // Complaints by category
  let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  autoTable(doc, {
    startY: y,
    head: [['Complaint Category', 'Count']],
    body: stats.byCategory.map((c) => [c.category.replace(/_/g, ' '), String(c.count)]),
    theme: 'grid',
    headStyles: { fillColor: [6, 182, 212], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  // Water tanks
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  autoTable(doc, {
    startY: y,
    head: [['Water Tank', 'Location', 'Current (L)', 'Capacity (L)', 'Level %']],
    body: waterTanks.map((t) => {
      const pct = t.capacity_liters > 0 ? ((t.current_level_liters / t.capacity_liters) * 100).toFixed(0) : '0';
      return [t.name, t.location_label || '-', String(t.current_level_liters), String(t.capacity_liters), `${pct}%`];
    }),
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  // Garbage bins
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;
  autoTable(doc, {
    startY: y,
    head: [['Garbage Bin', 'Location', 'Current (L)', 'Capacity (L)', 'Fill %']],
    body: garbageBins.map((b) => {
      const pct = b.capacity_liters > 0 ? ((b.current_level_liters / b.capacity_liters) * 100).toFixed(0) : '0';
      return [b.name, b.location_label || '-', String(b.current_level_liters), String(b.capacity_liters), `${pct}%`];
    }),
    theme: 'grid',
    headStyles: { fillColor: [249, 115, 22], textColor: 255, fontSize: 10 },
    bodyStyles: { fontSize: 9 },
    margin: { left: 14, right: 14 },
  });

  // Footer
  const pageHeight = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`${SYSTEM_TITLE} — Page 1`, 14, pageHeight - 8);

  doc.save(`${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
}

export async function downloadReportExcel(report: ReportInfo): Promise<void> {
  const [complaints, waterTanks, garbageBins] = await Promise.all([
    fetchComplaints(),
    fetchWaterTanks(),
    fetchGarbageBins(),
  ]);
  const stats = computeStats(complaints);

  const wb = XLSX.utils.book_new();

  // Summary sheet
  const summaryRows: (string | number)[][] = [
    ['Smart Village Management System'],
    ['Report', report.name],
    ['Type', report.type],
    ['Date', report.date],
    ['Generated', formatDate(new Date())],
    [],
    ['Metric', 'Value'],
    ['Total Complaints', stats.total],
    ['Pending', stats.pending],
    ['In Progress', stats.in_progress],
    ['Resolved', stats.resolved],
    ['Rejected', stats.rejected],
    ['High Priority', stats.high],
    ['Medium Priority', stats.medium],
    ['Low Priority', stats.low],
    ['Resolution Rate', `${stats.total > 0 ? ((stats.resolved / stats.total) * 100).toFixed(0) : 0}%`],
    ['Water Tanks', waterTanks.length],
    ['Garbage Bins', garbageBins.length],
  ];
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Summary');

  // Complaints sheet
  const complaintRows: (string | number)[][] = [
    ['Title', 'Category', 'Status', 'Priority', 'Location', 'Created'],
    ...complaints.map((c) => [
      c.title,
      c.category.replace(/_/g, ' '),
      c.status,
      c.priority,
      c.location_label || '-',
      new Date(c.created_at).toLocaleDateString(),
    ]),
  ];
  const wsComplaints = XLSX.utils.aoa_to_sheet(complaintRows);
  XLSX.utils.book_append_sheet(wb, wsComplaints, 'Complaints');

  // Water tanks sheet
  const waterRows: (string | number)[][] = [
    ['Name', 'Location', 'Current (L)', 'Capacity (L)', 'Level %'],
    ...waterTanks.map((t) => {
      const pct = t.capacity_liters > 0 ? (t.current_level_liters / t.capacity_liters) * 100 : 0;
      return [t.name, t.location_label || '-', t.current_level_liters, t.capacity_liters, `${pct.toFixed(0)}%`];
    }),
  ];
  const wsWater = XLSX.utils.aoa_to_sheet(waterRows);
  XLSX.utils.book_append_sheet(wb, wsWater, 'Water Tanks');

  // Garbage bins sheet
  const garbageRows: (string | number)[][] = [
    ['Name', 'Location', 'Current (L)', 'Capacity (L)', 'Fill %'],
    ...garbageBins.map((b) => {
      const pct = b.capacity_liters > 0 ? (b.current_level_liters / b.capacity_liters) * 100 : 0;
      return [b.name, b.location_label || '-', b.current_level_liters, b.capacity_liters, `${pct.toFixed(0)}%`];
    }),
  ];
  const wsGarbage = XLSX.utils.aoa_to_sheet(garbageRows);
  XLSX.utils.book_append_sheet(wb, wsGarbage, 'Garbage Bins');

  XLSX.writeFile(wb, `${report.name.replace(/[^a-zA-Z0-9]/g, '_')}.xlsx`);
}
