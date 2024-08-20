const { test, expect } = require('@playwright/test');

// Define selectores y datos comunes
const URL = 'http://localhost:9000/#/';
const SELECTORS = {
    usernameInput: 'input[placeholder="Correo electronico"]',
    passwordInput: 'input[placeholder="password"]',
    loginButton: 'button:has-text("Iniciar Sesión")',
    errorMessage: 'div.q-notification__message.col', // Selector actualizado para el mensaje de error
    successMessage: 'div.q-notification__message.col', // Selector actualizado para el mensaje satisfactorio
    spanAcceder: 'div.call-card', // Selector para el botón Acceder
    titleElement: 'h1:has-text("Gestión de Vehículos")', // Selector para el título
    headerCard: 'div.header-card', // Selector para el div que contiene el h2
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
    // Verifica que el mensaje de inicio de sesión exitoso que contenga el texto esperado
    const successfulMessage = await page.locator(SELECTORS.successMessage).innerText();
    expect(successfulMessage).toContain('Validación de credenciales exitosa..');
  });

  test('Login with incorrect credentials', async ({ page }) => {
    await login(page, 'wcadena@casabaca.com', 'WrongPass');

    // Espera a que el mensaje de error sea visible
    await page.waitForSelector(SELECTORS.errorMessage, { state: 'visible', timeout: 10000 });

    // Verifica que el mensaje de error contenga el texto esperado
    const errorMessage = await page.locator(SELECTORS.errorMessage).innerText();
    expect(errorMessage).toContain('El usuario o password son incorrectos');
  });

  test('Logout', async ({ page }) => {
    await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');

    // Espera a que el alert desaparezca si es necesario
    await page.waitForFunction(() => !document.querySelector('div.alert-selector')); // Cambia al selector de la alerta

    // Selecciona y hace clic en el ícono de perfil
    await page.waitForSelector('span.q-btn__content', { state: 'visible', timeout: 10000 });
    await page.locator('span.q-btn__content i.material-icons:has-text("account_circle")').click();

    // Selecciona y hace clic en el botón de Cerrar sesión
    await page.waitForSelector('div.q-item__section:has-text("Cerrar sesión")', { state: 'visible', timeout: 10000 });
    await page.locator('div.q-item__section:has-text("Cerrar sesión")').click();

    // Espera explícita para que el botón Confirmar sea visible
    await page.waitForSelector('span.block:has-text("Confirmar")', { state: 'visible', timeout: 10000 });
    await page.locator('span.block:has-text("Confirmar")').click();

    // Verifica que se ha vuelto a la página de inicio
    await page.waitForSelector(SELECTORS.usernameInput, { state: 'visible', timeout: 10000 });
    await expect(page.locator(SELECTORS.usernameInput)).toBeVisible();
  });

  test('Select card and see user details', async ({ page }) => { 
    await login(page, 'wcadena@casabaca.com', 'wcadena@casabaca.com');
    
    // Espera a que el <span> sea visible y haz clic en él
    await page.waitForSelector(SELECTORS.spanAcceder, { state: 'visible', timeout: 20000 });
    await page.locator(SELECTORS.spanAcceder).click();

    // Espera a que el título de la página sea visible y verifica el texto
    await page.waitForSelector(SELECTORS.titleElement, { state: 'visible', timeout: 10000 });
    const titleText = await page.locator(SELECTORS.titleElement).innerText();
    expect(titleText).toContain('Gestión de Vehículos');

    const headerCard = page.locator(`div.header-card:has(h2:has-text("PDS5736"))`);
    // Verifica que el elemento existe antes de hacer clic
    await expect(headerCard).toBeVisible();
    // Haz clic en el <div>
    await headerCard.click();

    // Selecciona el contenedor principal con la clase title-car
    const titleCarDiv = page.locator('div.title-car');
    // Verifica que el contenedor sea visible
    await expect(titleCarDiv).toBeVisible();

    // Selecciona el contenedor principal con el texto "Usuario"
    const headerDataContainerUsuario = page.locator('div.header-data-container:has-text("Usuario")');
    // Verifica que el contenedor sea visible
    await expect(headerDataContainerUsuario).toBeVisible();
    // Haz clic en el contenedor
    await headerDataContainerUsuario.click();

        // Selecciona el contenedor principal con el texto "Factura"
        const headerDataContainerFactura = page.locator('div.header-data-container:has-text("Factura")');
        // Verifica que el contenedor sea visible
        await expect(headerDataContainerFactura).toBeVisible();
        // Haz clic en el contenedor
        await headerDataContainerFactura.click();
        //Ver más: Usuario
        await page.click('span.action-show.cursor-pointer');
        //Ver más: Factura
        await page.click('span.action-show:has-text("ver más")');
  });
});
