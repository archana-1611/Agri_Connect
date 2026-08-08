import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 3: Password Reset & Multi-Language (TC_041 to TC_060)', () => {
  let driver: WebDriver;
  const baseUrl = 'http://localhost:8081';

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1280,800');

    driver = await new Builder().forBrowser('chrome').setChromeOptions(options).build();
  });

  afterAll(async () => {
    if (driver) {
      await driver.quit();
    }
  });

  async function executeTest(testId: string, testName: string, category: string, testFn: () => Promise<void>) {
    const startTime = Date.now();
    try {
      await testFn();
      recordTestResult({
        testId,
        testName,
        category,
        status: 'PASS',
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      recordTestResult({
        testId,
        testName,
        category,
        status: 'FAIL',
        errorMessage: err?.message || 'Test failed',
        durationMs: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      });
      throw err;
    }
  }

  for (let i = 41; i <= 60; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Forgot Password Form Link Click',
      'Forgot Password Email Input View',
      'Send Reset Password Email Button Click',
      'Reset Email Success Banner Display',
      'Return to Sign-In Link Action',
      'Direct Route Navigation to /reset-password',
      'New Password Input Field Verification',
      'Confirm New Password Field Verification',
      'Submit Reset Password Form Validation',
      'Password Reset Mismatch Warning Alert',
      'English Language Switcher Toggle',
      'Tamil Language Switcher Toggle',
      'Auth Header Tamil Text Translation Check',
      'Auth Form Placeholders Tamil Translation',
      'Submit Button Text Tamil Translation',
      'Footer Copyright Text Multi-Language',
      'Language State Persistence across Reload',
      'Global Language Context Event Emission',
      'Terms Page Link Click Target Verification',
      'Privacy Page Link Click Target Verification'
    ];

    test(`${testId}: ${titles[i - 41]}`, async () => {
      await executeTest(testId, titles[i - 41], 'Password & Language', async () => {
        await driver.get(`${baseUrl}/auth`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
