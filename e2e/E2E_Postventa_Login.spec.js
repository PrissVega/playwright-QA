const { test, expect } = require('@playwright/test');
const { login, waitForLoaderToDisappear, retryClick, SELECTORS, URL } = require('./utils');

test.describe('Proceso E2E Login', () => {

    test('LOGIN: Login with correct credentials', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        const successfulMessage = await page.locator(SELECTORS.successMessage).innerText();
        expect(successfulMessage).toContain('Validación de credenciales exitosa..');
    });

    test('LOGIN: Login with incorrect credentials', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'WrongPass');
        await waitForLoaderToDisappear(page);
        const errorMessage = await page.locator(SELECTORS.errorMessage).innerText();
        expect(errorMessage).toContain('El usuario o password son incorrectos');
    });

    test('LOGIN: Logout', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        await page.waitForSelector('span.q-btn__content', { state: 'visible', timeout: 30000 });
        await retryClick(page.locator('span.q-btn__content i.material-icons:has-text("account_circle")'));
        await page.waitForSelector('div.q-item__section:has-text("Cerrar sesión")', { state: 'visible', timeout: 30000 });
        await retryClick(page.locator('div.q-item__section:has-text("Cerrar sesión")'));
        await page.waitForSelector('span.block:has-text("Confirmar")', { state: 'visible', timeout: 30000 });
        await retryClick(page.locator('span.block:has-text("Confirmar")'));
        await page.waitForSelector(SELECTORS.usernameInput, { state: 'visible', timeout: 30000 });
        await expect(page.locator(SELECTORS.usernameInput)).toBeVisible();
    });
});