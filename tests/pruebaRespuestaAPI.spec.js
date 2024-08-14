const { test, expect, request } = require('@playwright/test');

// Configura los encabezados compartidos
const headers = {
  'Authorization': 'Bearer 215|aMUuQFQaJ14Xar9eU2k55VChiyDgwRsqKos9SshU',
  'Content-Type': 'application/json'
};

// Crea un contexto de solicitud con los encabezados compartidos
let context;
test.beforeAll(async () => {
  context = await request.newContext({
    ignoreHTTPSErrors: true,
    baseURL: 'https://api-sugarcrm.casabaca.loc',
    extraHTTPHeaders: headers
  });
});

// Cierra el contexto después de todas las pruebas
test.afterAll(async () => {
  await context.dispose();
});

// Función para obtener los tipos de datos de un objeto
const getTypes = (obj) => {
    const types = Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, typeof value]));
    return types;
  };

// Función para realizar una solicitud GET y verificar el código de estado
const performGetRequest = async (url) => {
  const response = await context.get(url);
  console.log(`Status Code: ${response.status()}`);
  console.log(`Response Body: ${await response.text()}`);
  expect(response.status()).toBe(200);
  return response;
};

test.describe('API Tests', () => {

  test('API gestion: gestion una', async () => {
    const url = '/api/v2/postventa/sugar_gestion/4?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
    await performGetRequest(url);
    const response = await performGetRequest(url);
    const responseBody = await response.json();
    if (Array.isArray(responseBody.data)) {
      const sampleData = responseBody.data[0];
      console.log('Types of data fields:', getTypes(sampleData));
    } else {
      console.log('Response data is not an array.');
    }
  });

  test('API gestion: gestion all', async () => {
    const url = '/api/v2/postventa/sugar_gestion?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
    await performGetRequest(url);
    const response = await performGetRequest(url);
    const responseBody = await response.json();
    if (Array.isArray(responseBody.data)) {
      const sampleData = responseBody.data[0];
      console.log('Types of data fields:', getTypes(sampleData));
    } else {
      console.log('Response data is not an array.');
    }
  });

  test('API gestion: orden cabecera', async () => {
    const url = '/api/v2/postventa/sugar_gestion/1/ordenCabecera?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
    await performGetRequest(url);
    const response = await performGetRequest(url);
    const responseBody = await response.json();
    if (Array.isArray(responseBody.data)) {
      const sampleData = responseBody.data[0];
      console.log('Types of data fields:', getTypes(sampleData));
    } else {
      console.log('Response data is not an array.');
    }
  });

});
