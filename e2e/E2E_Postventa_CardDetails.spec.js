const { test, expect } = require('@playwright/test');
const { login, waitForLoaderToDisappear, retryClick, selectFirstCard, SELECTORS, URL } = require('./utils');

test.describe('Proceso E2E Card Details', () => {

    test('CARD DETAILS: Select card and see user details', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 60000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(9000);
        await selectFirstCard(page);

        const titleCarDiv = page.locator(SELECTORS.titleCarDiv);
        await titleCarDiv.waitFor({ state: 'visible', timeout: 60000 });
        await expect(titleCarDiv).toBeVisible();

        await page.waitForSelector(SELECTORS.headerDataContainerUsuario, { state: 'visible', timeout: 9000 });
        const headerDataContainerUsuario = page.locator(SELECTORS.headerDataContainerUsuario);
        await expect(headerDataContainerUsuario).toBeVisible();
        await retryClick(headerDataContainerUsuario);
        await page.waitForSelector('span.action-show:has-text("ver más")', { state: 'visible', timeout: 5000 });
        const span = page.locator('span.action-show:has-text("ver más")').nth(0);
        await span.click();
    });

    test('CARD DETAILS: Select card and see invoice details', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 60000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(9000);
        await selectFirstCard(page);

        const titleCarDiv = page.locator(SELECTORS.titleCarDiv);
        await titleCarDiv.waitFor({ state: 'visible', timeout: 60000 });
        await expect(titleCarDiv).toBeVisible();

        await page.waitForSelector(SELECTORS.headerDataContainerFactura, { state: 'visible', timeout: 9000 });
        const headerDataContainerFactura = page.locator(SELECTORS.headerDataContainerFactura);
        await expect(headerDataContainerFactura).toBeVisible();
        await retryClick(headerDataContainerFactura);
        
        await page.waitForSelector('span.action-show.cursor-pointer:has-text("ver más")', { state: 'visible', timeout: 5000 });
        const span = page.locator('span.action-show.cursor-pointer:has-text("ver más")').nth(1);
        await span.click();
    });

    test('CARD DETAILS: button no answer', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 60000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(9000);
        await selectFirstCard(page);

        await page.waitForSelector(SELECTORS.noContestaButton, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.noContestaButton));
        await page.waitForSelector(SELECTORS.aceptarButton, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.aceptarButton));
    });
    
    test('CARD DETAILS: button history', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await verifyPageTitle(page, 'Gestión de Vehículos');
        
        await page.waitForTimeout(3000);
        const primeraTarjeta = await selectFirstCard(page);

        const printIcon = page.locator(SELECTORS.printIcon);
        await retryClick(printIcon);
    });

     test('CARD DETAILS: button all oportunities', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 60000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(9000);
        await selectFirstCard(page);

        await page.waitForSelector(SELECTORS.allOportunitiesButton, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.allOportunitiesButton));
        /*await page.waitForSelector(SELECTORS.aceptarButton, { state: 'visible', timeout: 60000 });
        await retryClick(page.locator(SELECTORS.aceptarButton));*/
    });
});