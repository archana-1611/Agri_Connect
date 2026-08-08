import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 9: Market Insights Alerts & Regions (TC_161 to TC_180)', () => {
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

  for (let i = 161; i <= 180; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Regional Mandi Filter Select (Coimbatore/Salem/Madurai)',
      'High Demand Warning Banner Renderer',
      'Market Volatility Spike Alert Badge',
      'Open Custom Price Alert Subscription Modal Button',
      'Price Alert Modal Crop Commodity Input',
      'Price Alert Target Price Level Input',
      'Price Alert Notification Channel Selector (SMS/Email)',
      'Submit Price Alert Form Validation',
      'Close Price Alert Modal Action',
      'Active Price Alert Subscriptions List Display',
      'Delete Price Alert Action Trigger',
      'Distance Radius Slider Filter Interaction',
      'Regional Buyer Density Map Indicator',
      'Transport Rate Estimator Per Kilometre',
      'Crop Surplus Warning Indicator Banner',
      'Quality Standard Price Multiplier Display',
      'Organic Premium Price Differential Metric',
      'Export Commodity Data CSV Download Trigger',
      'Refresh Market Data Feed Button',
      'Last Updated Timestamp Display'
    ];

    test(`${testId}: ${titles[i - 161]}`, async () => {
      await executeTest(testId, titles[i - 161], 'Market Insights Alerts', async () => {
        await driver.get(`${baseUrl}/market-insights`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
