// utils.js

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

const URL = 'http://localhost:9000/#/';

async function login(page, username, password) {
    await page.fill(SELECTORS.usernameInput, username);
    await page.fill(SELECTORS.passwordInput, password);
    await page.click(SELECTORS.loginButton);
}

async function waitForLoaderToDisappear(page, timeout = 30000) {
    const loaderSelector = 'div.q-loading__box.column.items-center'; // Selector del loader
    try {
        await page.waitForSelector(loaderSelector, { state: 'hidden', timeout });
    } catch (error) {
        console.error("Timeout esperando el loader: ", error);
        throw error;
    }
}

async function retryClick(locator, retries = 10, timeout = 5000) {
    let attempt = 0;
    while (attempt < retries) {
        try {
            await locator.click({ timeout });
            return;
        } catch (error) {
            attempt++;
            if (attempt < retries) {
                await locator.page().waitForTimeout(timeout); // Esperar antes de reintentar
            } else {
                throw error;
            }
        }
    }
}

async function selectFirstCard(page) {
    const primeraTarjeta = page.locator('section.card:first-of-type');
    await waitForLoaderToDisappear(page); // Esperar a que el loader desaparezca antes de seleccionar la tarjeta
    await primeraTarjeta.waitFor({ state: 'visible', timeout: 10000 });
    await retryClick(primeraTarjeta);
    return primeraTarjeta;
}

module.exports = {
    login,
    waitForLoaderToDisappear,
    retryClick,
    selectFirstCard,
    SELECTORS,
    URL,
};