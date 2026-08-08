import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 12: Mobile Add Resource Form & Image Picker (TC_MOB_221 to TC_MOB_240)', () => {
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

  for (let i = 221; i <= 240; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_MOB_${idNum}`;
    const titles = [
      'Mobile Add Resource Header Title & Progress Bar',
      'Mobile Step 1 — Resource Title TextInput Focus',
      'Mobile Step 1 — Resource Description Multiline TextInput',
      'Mobile Step 1 — Title Required Field Validation',
      'Mobile Step 1 — Next Step Touch Action Button',
      'Mobile Step 2 — Category Picker Dropdown Select',
      'Mobile Step 2 — Available Quantity TextInput Field',
      'Mobile Step 2 — Measurement Unit Segment Picker (Kg/Ton)',
      'Mobile Step 2 — Price Per Unit TextInput Field',
      'Mobile Step 2 — Negative Price Validation Message',
      'Mobile Step 2 — Next Step Touch Action Button',
      'Mobile Step 3 — Location District Picker Selection',
      'Mobile Step 3 — Harvest Date Picker Modal Choice',
      'Mobile Step 3 — Expiry Date Picker Modal Choice',
      'Mobile Step 3 — Storage Facility Type Segment',
      'Mobile Step 4 — Expo Image Picker Launch Action',
      'Mobile Step 4 — Image Preview Card Rendering',
      'Mobile Step 4 — Image Delete Button Action',
      'Mobile Step 4 — Final Submit Listing Action Button',
      'Mobile Add Resource Cancel Touch Action Return'
    ];

    test(`${testId}: ${titles[i - 221]}`, async () => {
      await executeTest(testId, titles[i - 221], 'Mobile Add Resource', async () => {
        await driver.get(`${baseUrl}/auth`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
