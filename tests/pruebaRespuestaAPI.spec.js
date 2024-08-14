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
  await context.dispose();
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
      // Inferir tipos de datos desde los resultados de la consulta
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
  console.log(`Status Code: ${response.status()}`);
  console.log(`Response Body: ${await response.text()}`);
  expect(response.status()).toBe(200);
  return response;
};

// Define los campos permitidos
const allowedFields_gestion_una = [
    'id', 'instancia_id', 'empresa_id', 'agencias', 'auto_id', 'gestion_prin_id', 'gestion_general_tipo', 'gestion_estado', 'users_id', 'usuarios3s_id', 'usersugars_id', 'ordenes', 'oportunidades', 'repuestos', 'accesorios', 'servicios', 'stock', 'total_inicial', 'subtotal_inicialrepuestos', 'subtotal_inicialservicios', 'subtotal_inicialaccesorios', 'recuperado', 'rechazado', 'pendiente', 'cita_fecha', 'llamada_fecha'
  ];

  // Filtra campos no permitidos en el objeto
const filterFields_gestion_una = (obj) => {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => allowedFields_gestion_una.includes(key)));
  };

test.describe('API Tests', () => {

    test('API gestion: gestión una', async () => {
        const url = '/api/v2/postventa/sugar_gestion/4?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
        const response = await performGetRequest(url);
        const responseBody = await response.json();
    
        if (responseBody.data && typeof responseBody.data === 'object') {
          // Filtrar los campos no permitidos en los datos de la API
          const filteredData = filterFields_gestion_una(responseBody.data);
          console.log('Filtered API Data Types:', getTypes(filteredData));
          
          // Consulta SQL para comparar
          const sqlQuery = `
            SELECT PG.id, PG.instancia_id, POC.empresa_id, POC.codAgencia AS agencias,
                   PG.auto_id, PG.gestion_prin_id, PG.gestion_general_tipo, PG.gestion_estado,
                   PG.users_id, PG.usuarios3s_id, PG.usersugars_id, PG.ordenes, PG.oportunidades,
                   PG.repuestos, PG.accesorios, PG.servicios, PG.stock, PG.total_inicial,
                   PG.subtotal_inicialrepuestos, PG.subtotal_inicialservicios,
                   PG.subtotal_inicialaccesorios, PG.recuperado, PG.rechazado, PG.pendiente,
                   PG.cita_fecha, PG.llamada_fecha
            FROM postvetas_centra_v3.pvt_gestions PG
            INNER JOIN postvetas_centra_v3.pvt_orden_cabeceras POC
            ON PG.auto_id = POC.auto_id;
          `;
          try {
            const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
            console.log('DB Data Types:', dbTypes);
    
            // Comparar tipos de datos filtrados
            const apiTypes = getTypes(filteredData);
            console.log('Filtered API Data Types:', apiTypes);
            expect(apiTypes).toEqual(dbTypes); // Ajusta la comparación según tus necesidades
          } catch (error) {
            console.error('Error fetching DB data types:', error);
          }
        } else {
          console.log('Response data is not an object.');
        }
      });

  test('API gestion: gestión all', async () => {
    const url = '/api/v2/postventa/sugar_gestion?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
    const response = await performGetRequest(url);
    const responseBody = await response.json();
    if (Array.isArray(responseBody.data)) {
      const sampleData = responseBody.data[0];
      console.log('API Data Types:', getTypes(sampleData));
    } else {
      console.log('Response data is not an array.');
    }
  });

  test('API gestion: orden cabecera', async () => {
    const url = '/api/v2/postventa/sugar_gestion/1/ordenCabecera?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
    const response = await performGetRequest(url);
    const responseBody = await response.json();
    if (Array.isArray(responseBody.data)) {
      const sampleData = responseBody.data[0];
      console.log('API Data Types:', getTypes(sampleData));
    } else {
      console.log('Response data is not an array.');
    }
  });

})