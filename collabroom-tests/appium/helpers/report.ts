export interface AppiumTestResult {
  testId: string;
  testName: string;
  category: string;
  status: 'PASS' | 'FAIL';
  errorMessage?: string;
  durationMs: number;
  timestamp: string;
  screenshotPath?: string;
}

export const testResults: AppiumTestResult[] = [];

export function recordTestResult(result: AppiumTestResult) {
  testResults.push(result);
}
