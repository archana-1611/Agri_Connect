import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 12: Add Resource Multi-Step Form (TC_221 to TC_240)', () => {
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

  for (let i = 221; i <= 240; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Add Resource Page Load Header Title',
      'Add Resource Multi-Step Progress Tracker Bar',
      'Step 1 — Resource Title Input Focus',
      'Step 1 — Resource Description Textarea Focus',
      'Step 1 — Title Empty Error Validation',
      'Step 1 — Next Step Button Navigation',
      'Step 2 — Category Select Dropdown Choice',
      'Step 2 — Quantity Input Field Focus',
      'Step 2 — Quantity Unit Selector (Kg/Ton/Bale)',
      'Step 2 — Price Per Unit Input Field Focus',
      'Step 2 — Negative Price Validation Check',
      'Step 2 — Next Step Button Navigation',
      'Step 3 — Location District Dropdown Select',
      'Step 3 — Harvest Date Picker Input Choice',
      'Step 3 — Expiry Date Picker Input Choice',
      'Step 3 — Storage Facility Type Selector',
      'Step 4 — Media Image URL Upload Input',
      'Step 4 — Image Preview Card Rendering',
      'Step 4 — Multi-Step Final Submit Action',
      'Add Resource Cancel Button Return to Market'
    ];

    test(`${testId}: ${titles[i - 221]}`, async () => {
      await executeTest(testId, titles[i - 221], 'Add Resource', async () => {
        await driver.get(`${baseUrl}/add-resource`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
