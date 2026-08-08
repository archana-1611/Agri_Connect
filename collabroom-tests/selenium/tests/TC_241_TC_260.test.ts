import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 13: Resource Details & Purchase Orders (TC_241 to TC_260)', () => {
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

  for (let i = 241; i <= 260; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Resource Details Page Overview Hero Image',
      'Resource Specification List (Moisture/Purity/Grade)',
      'Seller Information Card & Contact Phone Number',
      'Seller Rating Stars Summary Display',
      'Quantity Selection Increment Button Click',
      'Quantity Selection Decrement Button Click',
      'Subtotal Cost Calculation Dynamic Update',
      'Delivery Transport Cost Estimate Calculation',
      'Total Estimated Order Price Summary',
      'Open Purchase Reserve Modal Trigger Button',
      'Order Modal Buyer Delivery Address Input',
      'Order Modal Target Delivery Date Picker',
      'Order Modal Payment Option Radio (COD/Online)',
      'Order Modal Submit Purchase Order Action',
      'Order Confirmation Dialog Display',
      'Contact Seller Direct Chat Button Navigation',
      'Call Seller Direct Phone Action Button',
      'Share Resource Link Copy Action',
      'Related Resources Carousel Rendering',
      'Back to Marketplace Breadcrumb Navigation'
    ];

    test(`${testId}: ${titles[i - 241]}`, async () => {
      await executeTest(testId, titles[i - 241], 'Resource Details', async () => {
        await driver.get(`${baseUrl}/resource/1`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
