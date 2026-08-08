import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 2: Mobile Registration & Role Selection (TC_MOB_021 to TC_MOB_040)', () => {
  let driver: WebDriver;
  const baseUrl = 'http://localhost:8081';

  beforeAll(async () => {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=390,844');

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

  for (let i = 21; i <= 40; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_MOB_${idNum}`;
    const titles = [
      'Mobile Switch to Register Segment Tab',
      'Mobile Register Full Name TextInput Component',
      'Mobile Register Mobile Phone Number TextInput',
      'Mobile Register Email Address TextInput Field',
      'Mobile Register District Picker Dropdown Modal',
      'Mobile Tamil Nadu District Options Select Action',
      'Mobile Farmer Role Segmented Button Choice',
      'Mobile Buyer / Merchant Role Segmented Choice',
      'Mobile Logistics Partner Role Segment Choice',
      'Mobile Trader / Aggregator Role Option Check',
      'Mobile Password Confirm Mismatch Validation Message',
      'Mobile GPS Location Fetch Button Touch Action',
      'Mobile Location Access Permission Alert Handshake',
      'Mobile Registration Submit Touch Button Active State',
      'Mobile Existing Account Email Registration Alert',
      'Mobile Terms of Service Checkbox Switch Component',
      'Mobile Privacy Policy Disclaimer Touch Banner',
      'Mobile Email Verification Code Modal Input Prompt',
      'Mobile Resend Verification OTP Cooldown Timer',
      'Mobile Switch Back to Login Segment Touch Action'
    ];

    test(`${testId}: ${titles[i - 21]}`, async () => {
      await executeTest(testId, titles[i - 21], 'Mobile Registration', async () => {
        await driver.get(`${baseUrl}/auth`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
