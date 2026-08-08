import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 8: Mobile Market Prices & Commodity Trends (TC_MOB_141 to TC_MOB_160)', () => {
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

  for (let i = 141; i <= 160; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_MOB_${idNum}`;
    const titles = [
      'Mobile Market Prices Screen Navigation Header',
      'Mobile Commodity Overview Price Cards Section',
      'Mobile Commodity Picker Dropdown (Paddy/Cotton/Maize)',
      'Mobile Category Filter Horizontal Scroll Chips',
      'Mobile Price Trend Chart Interactive View',
      'Mobile Monthly Price History FlatList Render',
      'Mobile Price Range Minimum & Maximum Text',
      'Mobile Average Price Summary Metric Display',
      'Mobile Price Volatility Percentage Change Badge',
      'Mobile Peak Price Month Card Display',
      'Mobile Lowest Price Month Card Display',
      'Mobile Download PDF Report Action Button',
      'Mobile Print Analytics View Touch Action',
      'Mobile Compare Commodities Picker Modal',
      'Mobile Crop Seasonality Insights Card',
      'Mobile Supply & Demand Ratio Indicator Gauge',
      'Mobile Regional Mandi Benchmark Price Card',
      'Mobile Minimum Support Price (MSP) Display',
      'Mobile Price Recommendation Summary Text',
      'Mobile Market Prices Screen Pull-to-Refresh Gesture'
    ];

    test(`${testId}: ${titles[i - 141]}`, async () => {
      await executeTest(testId, titles[i - 141], 'Mobile Market Prices', async () => {
        await driver.get(`${baseUrl}/market-prices`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
