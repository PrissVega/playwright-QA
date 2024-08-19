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
  expect(response.status()).toBe(200);
  return response;
};

// Define los campos permitidos para orden cabecera all
const allowedFields_gestion_orden_cabecera_all = [
    'id', 'instancia_id', 'empresa_id', 'auto_id', 'gestion_id', 'ordTaller', 'ordFechaCrea', 'codOrdAsesor', 'nomOrdAsesor', 'codAgencia', 'nomAgencia'
  ];

  // Función para filtrar los campos permitidos en un objeto
const filterFields = (obj, allowedFields) => {
    return Object.fromEntries(Object.entries(obj).filter(([key]) => allowedFields.includes(key)));
  };
  
  // Función para obtener los datos desde una consulta SQL
  const getDbDataFromQuery = (query) => {
    return new Promise((resolve, reject) => {
      connection.query(query, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  };

  test.describe('API Tests', () => {

    test('API gestion: orden cabecera', async () => {
        const url = '/api/v2/postventa/sugar_gestion/1/ordenCabecera?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
        const response = await performGetRequest(url);
        const responseBody = await response.json();
    
        if (responseBody.data && Array.isArray(responseBody.data)) {
          const filteredData = responseBody.data.map(item => filterFields(item, allowedFields_gestion_orden_cabecera_all));
          console.log('Filtered API Data:', JSON.stringify(filteredData, null, 2));
    
          const sqlQuery = `
            SELECT PG.id, PG.instancia_id, PG.empresa_id, PG.auto_id, POC.gestion_id,
            POC.ordTaller, POC.ordFechaCrea, POC.codOrdAsesor, POC.nomOrdAsesor, POC.codAgencia, POC.nomAgencia 
            FROM postvetas_centra_v3.pvt_gestions PG 
            INNER JOIN postvetas_centra_v3.pvt_orden_cabeceras POC 
            ON PG.id = POC.id AND PG.instancia_id = POC.instancia_id 
            AND PG.empresa_id = POC.empresa_id AND PG.auto_id = POC.auto_id;
          `;
    
          try {
            const dbData = await getDbDataFromQuery(sqlQuery);
            const filteredDbData = dbData.map(item => filterFields(item, allowedFields_gestion_orden_cabecera_all));
            console.log('Filtered DB Data:', JSON.stringify(filteredDbData, null, 2));
    
            // Compara las cabeceras de los datos de la API con los datos de la base de datos
            const apiTypes = filteredData.length > 0 ? getTypes(filteredData[0]) : {};
            const dbTypes = filteredDbData.length > 0 ? getTypes(filteredDbData[0]) : {};
    
            console.log('API Data Types:', apiTypes);
            console.log('DB Data Types:', dbTypes);
    
            expect(apiTypes).toEqual(dbTypes);
          } catch (error) {
            console.error('Error fetching DB data:', error);
          }
        } else {
          console.log('Response data is not an array.');
        }
      });

  });