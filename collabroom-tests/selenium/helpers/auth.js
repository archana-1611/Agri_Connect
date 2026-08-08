const { By, until } = require('selenium-webdriver');

async function loginUser(driver, baseUrl = 'http://localhost:8081', email = 'testuser@agriconnect.com', password = 'Password123!') {
  await driver.get(`${baseUrl}/auth`);
  
  // Wait for login form to load
  await driver.wait(until.elementLocated(By.css('[data-testid="auth-login-tab"], [data-testid="login-id-input"]')), 10000);
  
  // Ensure Login tab is active if present
  const loginTab = await driver.findElements(By.css('[data-testid="auth-login-tab"]'));
  if (loginTab.length > 0) {
    await loginTab[0].click();
  }

  // Find input fields
  const emailInput = await driver.wait(until.elementLocated(By.css('[data-testid="login-id-input"], input[type="email"], input[placeholder*="email" i]')), 5000);
  await emailInput.clear();
  await emailInput.sendKeys(email);

  const passwordInput = await driver.wait(until.elementLocated(By.css('[data-testid="password-input"], input[type="password"]')), 5000);
  await passwordInput.clear();
  await passwordInput.sendKeys(password);

  const submitButton = await driver.wait(until.elementLocated(By.css('[data-testid="auth-submit-btn"], button[type="submit"]')), 5000);
  await submitButton.click();

  // Wait for navigation to dashboard or authenticated state
  try {
    await driver.wait(until.urlContains('/dashboard'), 5000);
  } catch (e) {
    // If auth failed or test mode, proceed
  }
}

module.exports = { loginUser };
