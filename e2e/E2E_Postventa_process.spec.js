const { test, expect } = require('@playwright/test');

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
};

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
        const successfulMessage = await page.locator(SELECTORS.successMessage).innerText();
        expect(successfulMessage).toContain('Validación de credenciales exitosa..');
    });

    test('Login with incorrect credentials', async ({ page }) => {
        await login(page, 'wcadena@casabaca.com', 'WrongPass');
        await page.waitForSelector(SELECTORS.errorMessage, { state: 'visible', timeout: 10000 });
        const errorMessage = await page.locator(SELECTORS.errorMessage).innerText();
        expect(errorMessage).toContain('El usuario o password son incorrectos');
    });

    test('Logout', async ({ page }) => {
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await page.waitForFunction(() => !document.querySelector('div.alert-selector')); // Cambia al selector de la alerta
        await page.waitForSelector('span.q-btn__content', { state: 'visible', timeout: 10000 });
        await page.locator('span.q-btn__content i.material-icons:has-text("account_circle")').click();
        await page.waitForSelector('div.q-item__section:has-text("Cerrar sesión")', { state: 'visible', timeout: 10000 });
        await page.locator('div.q-item__section:has-text("Cerrar sesión")').click();
        await page.waitForSelector('span.block:has-text("Confirmar")', { state: 'visible', timeout: 10000 });
        await page.locator('span.block:has-text("Confirmar")').click();
        await page.waitForSelector(SELECTORS.usernameInput, { state: 'visible', timeout: 10000 });
        await expect(page.locator(SELECTORS.usernameInput)).toBeVisible();
    });

    test('Select card and see user details', async ({ page }) => {
    await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
    await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 20000 });
    await page.locator(SELECTORS.spanAcceder).click();
    await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 10000 });
    const titleText = await page.locator(SELECTORS.titleElement).innerText();
    expect(titleText).toContain('Gestión de Vehículos');

    // Espera a que las tarjetas estén visibles
    await page.waitForSelector('section.card', { state: 'visible', timeout: 30000 });
    
    // Selecciona la primera tarjeta
    const primeraTarjeta = page.locator('section.card:first-of-type');
    await primeraTarjeta.click();
    await expect(primeraTarjeta).toBeVisible();

    // Verifica que el div.title-car sea visible después de seleccionar la tarjeta
    console.log('Esperando a que div.title-car sea visible...');
    const titleCarDiv = page.locator(SELECTORS.titleCarDiv);
    await titleCarDiv.waitFor({ state: 'visible', timeout: 30000 });
    await expect(titleCarDiv).toBeVisible();

    // Verifica otros elementos
    console.log('Verificando headerDataContainerUsuario...');
    const headerDataContainerUsuario = page.locator(SELECTORS.headerDataContainerUsuario);
    await expect(headerDataContainerUsuario).toBeVisible();
    await headerDataContainerUsuario.click();

    console.log('Verificando headerDataContainerFactura...');
    const headerDataContainerFactura = page.locator(SELECTORS.headerDataContainerFactura);
    await expect(headerDataContainerFactura).toBeVisible();
    await headerDataContainerFactura.click();
    
    // Acciones adicionales
    await page.click('span.action-show.cursor-pointer');
    await page.click('span.action-show:has-text("ver más")');
});

    test('button no answer', async ({ page }) => {
        await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
        await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 20000 });
        await page.locator(SELECTORS.spanAcceder).click();
        await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 10000 });
        const titleText = await page.locator(SELECTORS.titleElement).innerText();
        expect(titleText).toContain('Gestión de Vehículos');

        // Selecciona la primera tarjeta sin depender de su título
        console.log('Esperando a que la primera tarjeta sea visible...');
        const primeraTarjeta = page.locator('section.card:first-of-type');
        await primeraTarjeta.waitFor({ state: 'visible', timeout: 30000 });
        await primeraTarjeta.click();
        await expect(primeraTarjeta).toBeVisible();

        //Selecciona botón No contesta
        const noContestaButton = page.locator('button:has-text("No contesta")');
        await noContestaButton.click();

        //Aceptar alerta de No contesta
        const aceptarButton = page.locator('button:has-text("Aceptar")');
        await aceptarButton.click();
    });

});