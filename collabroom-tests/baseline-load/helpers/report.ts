import * as fs from 'fs';
import * as path from 'path';
import ExcelJS from 'exceljs';

export interface TestResultRecord {
  testId: string;
  testName: string;
  category: string;
  status: 'PASS' | 'FAIL';
  errorMessage?: string;
  durationMs: number;
  timestamp: string;
  screenshotPath?: string;
}

const globalResults: TestResultRecord[] = [];

export function recordTestResult(result: TestResultRecord) {
  globalResults.push(result);
}

export function getRecordedResults(): TestResultRecord[] {
  return globalResults;
}

export async function generateExcelReport(results: TestResultRecord[], reportPath?: string) {
  const targetPath = reportPath || path.join(__dirname, '../../reports/baseline-load-report-300.xlsx');
  const fallbackPath = path.join(__dirname, '../../reports/baseline-load-report.xlsx');
  const reportsDir = path.dirname(targetPath);
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Baseline & Load Test Results');

  worksheet.columns = [
    { header: 'Test ID', key: 'testId', width: 14 },
    { header: 'Test Name', key: 'testName', width: 60 },
    { header: 'Category', key: 'category', width: 30 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Error Message', key: 'errorMessage', width: 40 },
    { header: 'Duration (ms)', key: 'durationMs', width: 16 },
    { header: 'Timestamp', key: 'timestamp', width: 26 },
    { header: 'Screenshot path', key: 'screenshotPath', width: 25 },
  ];

  // Header styling (Purple / Violet accent for Baseline & Load Performance)
  const headerRow = worksheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: '6D28D9' }, // Purple / Indigo fgColor
  };
  headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

  results.forEach((rec) => {
    const row = worksheet.addRow({
      testId: rec.testId,
      testName: rec.testName,
      category: rec.category,
      status: rec.status,
      errorMessage: rec.errorMessage || '',
      durationMs: rec.durationMs,
      timestamp: rec.timestamp,
      screenshotPath: rec.screenshotPath || '',
    });

    const statusCell = row.getCell('status');
    if (rec.status === 'PASS') {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'DCFCE7' }, // Soft green
      };
      statusCell.font = { color: { argb: '166534' }, bold: true };
    } else {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FEE2E2' }, // Soft red
      };
      statusCell.font = { color: { argb: '991B1B' }, bold: true };
    }
  });

  try {
    await workbook.xlsx.writeFile(targetPath);
    console.log(`Excel report successfully generated at: ${targetPath} with ${results.length} rows.`);
  } catch (err) {
    console.warn(`Primary path busy, writing to fallback: ${fallbackPath}`);
    await workbook.xlsx.writeFile(fallbackPath);
    console.log(`Excel report successfully generated at: ${fallbackPath} with ${results.length} rows.`);
  }
}
