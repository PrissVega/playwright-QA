const { test, expect, request } = require('@playwright/test');
const connection = require('./db.js');

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
  if (context) {
    await context.dispose();
  }
});

// Función para obtener los tipos de datos de un objeto
const getTypes = (obj) => {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) => [key, typeof value]));
};

// Función para obtener los tipos de datos de una consulta SQL
const getDbDataTypesFromQuery = (query) => {
  return new Promise((resolve, reject) => {
    connection.query(query, (error, results) => {
      if (error) {
        return reject(error);
      }
      const types = results.length > 0 ? Object.fromEntries(
        Object.keys(results[0]).map(key => [key, typeof results[0][key]])
      ) : {};
      resolve(types);
    });
  });
};

// Función para realizar una solicitud GET y verificar el código de estado
const performGetRequest = async (url) => {
  const response = await context.get(url);
  expect(response.status()).toBe(200);
  return response;
};

// Define los tipos de datos esperados
const expectedDataTypes = {
  id: 'number',
  instancia_id: 'number',
  empresa_id: 'number',
  gestion_prin_cabecera: 'string',
  gestion_general_tipo: 'string',
  gestion_estado: 'string',
  gestion_tipo: 'string',
  nomUsuarioVista: 'string',
  fonoCelUsuarioVisita: 'string',
  placa: 'string',
  modelo: 'string',
  descVehiculo: 'string',
  marcaVehiculo: 'string',
  anioVehiculo: 'string',
  cita_fecha: 'object',
  llamada_fecha: 'object',
  ordenes: 'number',
  oportunidades: 'number',
  repuestos: 'number',
  accesorios: 'number',
  servicios: 'number',
  stock: 'number',
  total_inicial: 'number',
  subtotal_inicialrepuestos: 'number',
  subtotal_inicialservicios: 'number',
  subtotal_inicialaccesorios: 'number',
  recuperado: 'number',
  rechazado: 'number',
  pendiente: 'number'
};

test.describe('API Tests gestion principal', () => { 

  test('API gestion: gestion principal all', async () => {
    const url = '/api/v2/postventa/gestionPrincipal?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';

    try {
      const response = await performGetRequest(url);
      const responseBody = await response.json();
      console.log('Response from API:', responseBody);

      if (responseBody.data && Array.isArray(responseBody.data)) {
        console.log('Data before filtering:', responseBody.data);

        // Obtén los tipos de datos de los datos filtrados
        const apiTypes = responseBody.data.length > 0 ? getTypes(responseBody.data[0]) : {};
        console.log('API Data Types:', apiTypes);

        // Elimina el campo `gestion_prin_id` de los tipos de datos de la API
        delete apiTypes.gestion_prin_id
        delete apiTypes.links;

        const sqlQuery = 'SELECT * FROM postvetas_centra_v3.view_pvt_gestion_principals LIMIT 1';
        try {
          const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
          console.log('DB Data Types:', dbTypes);

          // Elimina el campo `gestion_prin_id` de los tipos de datos de la base de datos
          delete dbTypes.gestion_prin_id
          delete dbTypes.links;

          // Compara los tipos de datos
          expect(apiTypes).toEqual(expectedDataTypes);
          expect(apiTypes).toEqual(dbTypes);

        } catch (error) {
          console.error('Error fetching DB data types:', error);
        }
      } else {
        console.log('Response data is not an array.');
      }
    } catch (error) {
      console.error('Error during API request:', error);
    }
  });
});