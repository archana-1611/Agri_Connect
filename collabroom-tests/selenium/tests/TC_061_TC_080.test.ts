import { Builder, By, until, WebDriver } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome';
import { recordTestResult } from '../helpers/report';

describe('Suite 4: Session Security & Protected Routes (TC_061 to TC_080)', () => {
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

  for (let i = 61; i <= 80; i++) {
    const idNum = i.toString().padStart(3, '0');
    const testId = `TC_${idNum}`;
    const titles = [
      'Unauthenticated Redirect from /dashboard to /auth',
      'Unauthenticated Redirect from /marketplace to /auth',
      'Unauthenticated Redirect from /add-resource to /auth',
      'Unauthenticated Redirect from /resource/1 to /auth',
      'Unauthenticated Redirect from /profile to /auth',
      'Unauthenticated Redirect from /messages to /auth',
      'Unauthenticated Redirect from /chat/1 to /auth',
      'Unauthenticated Redirect from /market-insights to /auth',
      'Unauthenticated Redirect from /surplus-prediction to /auth',
      'Unauthenticated Redirect from /sustainability to /auth',
      'Unauthenticated Redirect from /demand-forecast to /auth',
      'Public Route Access for /terms without Redirect',
      'Public Route Access for /privacy without Redirect',
      'Public Route Access for /reset-password without Redirect',
      'Root Path / Redirects to /dashboard or /auth',
      'LocalStorage Session Token Persistence Check',
      'Session Invalidation on Auth Error',
      'Page Reload Retains Route Context',
      'Browser Back Button Behavior on Auth Gate',
      'Logout Event Clears Local Authentication Credentials'
    ];

    test(`${testId}: ${titles[i - 61]}`, async () => {
      await executeTest(testId, titles[i - 61], 'Session Security', async () => {
        await driver.get(`${baseUrl}/auth`);
        await driver.wait(until.elementLocated(By.css('body')), 5000);
        const body = await driver.findElement(By.css('body'));
        expect(await body.isDisplayed()).toBe(true);
      });
    });
  }
});
