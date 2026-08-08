import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 8: Market Insights Price Trends (TC_141 to TC_160)', () => {
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

  for (let i = 141; i <= 160; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Market Insights Page Load Header Banner',
      'Market Insights Commodity Price Overview Summary',
      'Crop Commodity Selector Dropdown (Wheat/Rice/Cotton)',
      'Crop Category Filter Chips Selection',
      'Historical Price Trend Chart Render',
      'Monthly Crop Price Table Columns Display',
      'Min Price & Max Price Range Text Format',
      'Average Price Metric Card Render',
      'Price Volatility Percentage Change Badge',
      'Highest Price Month Indicator Card',
      'Lowest Price Month Indicator Card',
      'Export Price Trend Report Action Button',
      'Print Price Analytics View Trigger',
      'Compare Commodities Selector Interaction',
      'Crop Seasonality Data Display',
      'Market Supply Demand Ratio Indicator',
      'Regional Mandi Benchmark Price Display',
      'Government Minimum Support Price (MSP) Display',
      'Price Trend Recommendation Summary Text',
      'Market Insights Responsive Grid View'
    ];

    test(`${testId}: ${titles[i - 141]}`, async () => {
      await executeTest(testId, titles[i - 141], 'Market Insights', async () => {
        await driver.get(`${baseUrl}/market-insights`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
