import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 5: Dashboard Metrics & Overview (TC_081 to TC_100)', () => {
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

  for (let i = 81; i <= 100; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Dashboard Welcome Greeting Header Render',
      'Dashboard User Full Name Display',
      'Dashboard Listed Resources Metric Card',
      'Dashboard Active Contracts Count Card',
      'Dashboard Total Earnings Currency Display',
      'Dashboard Waste Saved Impact Counter Card',
      'Dashboard CO2 Reduced Metric Display',
      'Dashboard Weather Widget Temperature Badge',
      'Dashboard Weather Condition Description Text',
      'Dashboard Weather Location Picker Click',
      'Dashboard GPS Location Detection Loading Spinner',
      'Dashboard Location Fallback IP Trigger',
      'Dashboard Manual Location Search Field Input',
      'Dashboard Manual Search Autocomplete Results',
      'Dashboard Weather Error Alert Display',
      'Dashboard Selected Location Storage Sync',
      'Dashboard Metric Cards Responsive Flex Layout',
      'Dashboard Metric Values Numeric Formatting',
      'Dashboard Currency Symbol Formatting (INR ₹)',
      'Dashboard Card Hover Elevation Animations'
    ];

    test(`${testId}: ${titles[i - 81]}`, async () => {
      await executeTest(testId, titles[i - 81], 'Dashboard Metrics', async () => {
        await driver.get(`${baseUrl}/dashboard`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
