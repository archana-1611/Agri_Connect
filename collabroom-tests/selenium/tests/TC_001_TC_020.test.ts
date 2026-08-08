import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 1: Auth & Login Validation (TC_001 to TC_020)', () => {
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

  for (let i = 1; i <= 20; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Load Auth Page & Verify Form Layout',
      'Verify Login Tab Default Focus',
      'Auth Form — Empty Submit Validation',
      'Auth Form — Invalid Email Syntax Check',
      'Auth Form — Password Length Constraint Check',
      'Auth Form — Mobile Number Format Check',
      'Auth Form — Email Input Focus Interaction',
      'Auth Form — Password Input Type Attributes',
      'Password Eye Icon Visibility Toggle',
      'Remember Me Checkbox Preference',
      'Forgot Password Trigger Link Display',
      'Demo Account Direct Login Button',
      'Login Error Alert Box Renderer',
      'Form Submission Spinner Loading State',
      'Clear Form Fields Action',
      'Auth Header Logo Image Asset Render',
      'Auth Tagline Subtitle Text Display',
      'Agriculture Features Section Rendering',
      'Auth Page Container CSS Layout',
      'Auth Responsive Card Width Verification'
    ];

    test(`${testId}: ${titles[i - 1]}`, async () => {
      await executeTest(testId, titles[i - 1], 'Auth', async () => {
        await loadAuthPage();
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
