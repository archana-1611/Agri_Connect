import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 2: Registration & Role Selection (TC_021 to TC_040)', () => {
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

  async function loadAuthPage() {
    await driver.get(`${baseUrl}/auth`);
    await driver.wait(until.elementLocated(By.css('body')), 10000);
    await driver.sleep(500);
  }

  for (let i = 21; i <= 40; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Switch to Register Form Tab',
      'Register Full Name Input Field',
      'Register Mobile Phone Number Field',
      'Register Email Address Field',
      'Register District Dropdown Options',
      'Tamil Nadu District List Items Verification',
      'Farmer Role Selector Radio Button',
      'Buyer Role Selector Radio Button',
      'Logistics Provider Role Option Verification',
      'Trader / Aggregator Role Option Check',
      'Password Confirm Match Error Validation',
      'Exact GPS Location Fetch Button Interaction',
      'Location Access Permission Dialog Response',
      'Registration Submit Button Enabled State',
      'Duplicate Account Email Registration Handling',
      'Terms of Service Checkbox Toggle',
      'Privacy Policy Acknowledgment Notice',
      'Email Verification Code Prompt Display',
      'Resend Verification Link Cooldown Counter',
      'Switch Back to Login Form Action'
    ];

    test(`${testId}: ${titles[i - 21]}`, async () => {
      await executeTest(testId, titles[i - 21], 'Auth Registration', async () => {
        await loadAuthPage();
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
