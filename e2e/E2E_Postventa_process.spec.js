const { test, expect } = require('@playwright/test');

// Establecer un timeout global de 60 segundos para todos los tests
test.setTimeout(60000); // 60 segundos

// Define selectores y datos comunes
const URL = 'http://localhost:9000/#/';
const SELECTORS = {
    usernameInput: 'input[placeholder="Correo electronico"]',
    passwordInput: 'input[placeholder="password"]',
    loginButton: 'button:has-text("Iniciar Sesión")',
    errorMessage: 'div.q-notification__message.col',
    successMessage: 'div.q-notification__message.col',
    spanAcceder: 'div.call-card',
    titleElement: 'h1:has-text("Gestión de Vehículos")',
    headerCard: 'div.header-card',
    titleCarDiv: 'div.title-car',
    headerDataContainerUsuario: 'div.header-data-container:has-text("Usuario")',
    headerDataContainerFactura: 'div.header-data-container:has-text("Factura")',
    noContestaButton: 'button:has-text("No contesta")',
    aceptarButton: 'button:has-text("Aceptar")',
    printIcon: 'div.button-icon i.material-icons:has-text("print")',
    someElementAfterLoader: 'div.some-element'
};

// Función para esperar que el loader desaparezca
async function waitForLoaderToDisappear(page, timeout = 30000) {
    const loaderSelector = 'div.q-loading__box.column.items-center'; // Selector del loader

    try {
        await page.waitForSelector(loaderSelector, { state: 'hidden', timeout });
        console.log("Loader ha desaparecido.");
    } catch (error) {
        console.error("Timeout esperando el loader: ", error);
        throw error;
    }
}

// Función para intentar hacer clic en un elemento con reintentos
async function retryClick(locator, retries = 10, timeout = 5000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            await locator.click();
            return; // Exit if click is successful
        } catch (error) {
            console.error(`Click attempt ${attempt + 1} failed:`, error);
            attempt++;
            if (attempt < retries) {
                await locator.page().waitForTimeout(timeout); // Wait before retrying
            }
        }
    }
    throw new Error('Failed to click on the element after multiple attempts');
}

// Función para realizar login
async function login(page, username, password) {
    const usernameInput = page.locator(SELECTORS.usernameInput);
    const passwordInput = page.locator(SELECTORS.passwordInput);
    const loginButton = page.locator(SELECTORS.loginButton);

    await expect(usernameInput).toBeVisible();
    await usernameInput.fill(username);

    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(password);

    await retryClick(loginButton);

    // Esperar a que el loader desaparezca
    await waitForLoaderToDisappear(page);
}

// Función para seleccionar la primera tarjeta
async function selectFirstCard(page) {
    const primeraTarjeta = page.locator('section.card:first-of-type');
    await waitForLoaderToDisappear(page); // Esperar a que el loader desaparezca antes de seleccionar la tarjeta
    await primeraTarjeta.waitFor({ state: 'visible', timeout: 10000 });
    await retryClick(primeraTarjeta);
    await primeraTarjeta.waitFor({ state: 'visible', timeout: 10000 });
    return primeraTarjeta;
}

test.describe('Proceso E2E Postventa', () => {

    test('Login with correct credentials', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page);
        const successfulMessage = await page.locator(SELECTORS.successMessage).innerText();
        expect(successfulMessage).toContain('Validación de credenciales exitosa..');
    });

    test('Login with incorrect credentials', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'WrongPass');
        await waitForLoaderToDisappear(page);
        const errorMessage = await page.locator(SELECTORS.errorMessage).innerText();
        expect(errorMessage).toContain('El usuario o password son incorrectos');
    });

    test('Logout', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page); // Esperar a que el loader desaparezca antes de intentar cerrar sesión
        await page.waitForSelector('span.q-btn__content', { state: 'visible', timeout: 30000 });
        await retryClick(page.locator('span.q-btn__content i.material-icons:has-text("account_circle")'));
        await page.waitForSelector('div.q-item__section:has-text("Cerrar sesión")', { state: 'visible', timeout: 30000 });
        await retryClick(page.locator('div.q-item__section:has-text("Cerrar sesión")'));
        await page.waitForSelector('span.block:has-text("Confirmar")', { state: 'visible', timeout: 30000 });
        await retryClick(page.locator('span.block:has-text("Confirmar")'));
        await page.waitForSelector(SELECTORS.usernameInput, { state: 'visible', timeout: 30000 });
        await expect(page.locator(SELECTORS.usernameInput)).toBeVisible();
    });

    test('Select card and see user details', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page); // Esperar a que el loader desaparezca antes de continuar
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 30000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 30000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(9000);
        const primeraTarjeta = await selectFirstCard(page);

        const titleCarDiv = page.locator(SELECTORS.titleCarDiv);
        await titleCarDiv.waitFor({ state: 'visible', timeout: 30000 });
        await expect(titleCarDiv).toBeVisible();

        // Espera a que el selector esté visible antes de continuar
        await page.waitForSelector(SELECTORS.headerDataContainerUsuario, { state: 'visible', timeout: 9000 });
        const headerDataContainerUsuario = page.locator(SELECTORS.headerDataContainerUsuario);
        await expect(headerDataContainerUsuario).toBeVisible();
        await retryClick(headerDataContainerUsuario);
        //Espera del selector
        await page.waitForSelector('span.action-show:has-text("ver más")', { state: 'visible', timeout: 5000 });
        const span = page.locator('span.action-show:has-text("ver más")').nth(0);;            
        await span.click();
    });

    test('Select card and see invoice details', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page); // Esperar a que el loader desaparezca antes de continuar
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 30000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 30000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(9000);
        const primeraTarjeta = await selectFirstCard(page);

        const titleCarDiv = page.locator(SELECTORS.titleCarDiv);
        await titleCarDiv.waitFor({ state: 'visible', timeout: 30000 });
        await expect(titleCarDiv).toBeVisible();

        // Espera a que el selector esté visible antes de continuar
        await page.waitForSelector(SELECTORS.headerDataContainerFactura, { state: 'visible', timeout: 9000 });
        const headerDataContainerFactura = page.locator(SELECTORS.headerDataContainerFactura);
        await expect(headerDataContainerFactura).toBeVisible();
        await retryClick(headerDataContainerFactura);
        
        // Espera a que el selector esté visible
        await page.waitForSelector('span.action-show.cursor-pointer:has-text("ver más")', { state: 'visible', timeout: 5000 });
        const span = page.locator('span.action-show.cursor-pointer:has-text("ver más")').nth(1);;
        await span.click();
    });

    test('button no answer', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page); // Esperar a que el loader desaparezca antes de interactuar
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 30000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 30000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        await page.waitForTimeout(9000);
        const primeraTarjeta = await selectFirstCard(page);

        const noContestaButton = page.locator(SELECTORS.noContestaButton);
        await retryClick(noContestaButton);

        const aceptarButton = page.locator(SELECTORS.aceptarButton);
        await retryClick(aceptarButton);
    });

    test('button history', async ({ page }) => {
        await page.goto(URL);
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await waitForLoaderToDisappear(page); // Esperar a que el loader desaparezca antes de interactuar
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 30000 });
        await retryClick(page.locator(SELECTORS.spanAcceder));
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 30000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');
        
        await page.waitForTimeout(3000);
        const primeraTarjeta = await selectFirstCard(page);

        const printIcon = page.locator(SELECTORS.printIcon);
        await retryClick(printIcon);
    });
});