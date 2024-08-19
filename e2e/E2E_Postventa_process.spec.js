const { test, expect } = require('@playwright/test');

// Define selectores y datos comunes
const URL = 'http://localhost:9000/#/';
const SELECTORS = {
  usernameInput: 'input[placeholder="Correo electronico"]',
  passwordInput: 'input[placeholder="password"]',
  loginButton: 'button:has-text("Iniciar Sesión")',
};

// Función para realizar el login
async function login(page, username, password) {
  const usernameInput = page.locator(SELECTORS.usernameInput);
  const passwordInput = page.locator(SELECTORS.passwordInput);
  const loginButton = page.locator(SELECTORS.loginButton);

  await expect(usernameInput).toBeVisible();
  await usernameInput.fill(username);
  
  await expect(passwordInput).toBeVisible();
  await passwordInput.fill(password);

  await loginButton.click();
}

test.describe('Proceso E2E Postventa', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
  });

  test('Login with correct credentials', async ({ page }) => { 
    await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
  });

  test('Login with incorrect credentials', async ({ page }) => {
    await login(page, 'wcadena@casabaca.com', 'WrongPass');
  });

  
});
