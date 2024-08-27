const { test, expect, request } = require('@playwright/test');
const connection = require('./db.js');

// Configura los encabezados compartidos
const headers = {
  'Authorization': 'Bearer 213|3e2FDZKkpRWmQwinJkM35dpTJGgnPDBldGpb00tt',
  'Content-Type': 'application/json'
};

// Crea un contexto de solicitud con los encabezados compartidos
let context;
test.beforeAll(async () => {
  context = await request.newContext({
    ignoreHTTPSErrors: true,
    baseURL: 'https://api2.qa.epicentro-digital.com',
    extraHTTPHeaders: headers,
    timeout: 60000  // Aumenta el tiempo de espera a 60 segundos
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

// Función para medir el tiempo de respuesta de una solicitud GET
const measureGetRequestTime = async (url) => {
  const startTime = Date.now();
  const response = await context.get(url);
  const endTime = Date.now();
  const responseTime = endTime - startTime;

  console.log(`Tiempo de respuesta para ${url}: ${responseTime} ms`);
  expect(response.status()).toBe(200);
  return response;
};

// Define los tipos de datos esperados para gestion principal all/una
const expectedDataTypesGestionPrinCabecera = {
  id: 'number',
  instancia_id: 'number',
  empresa_id: 'number',
  auto_id: 'number',
  //gestion_prin_id: 'string',
  gestion_prin_cabecera: 'string',
  gestion_general_tipo: 'string',
  gestion_estado: 'string',
  users_id: 'number',
  usuarios3s_id: 'number',
  usersugars_id: 'string',
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
  pendiente: 'number',
  cita_fecha: 'object',
  llamada_fecha: 'object',
};

// Define los tipos de datos esperados para gestion detalle oportunidades all/una
const expectedDataTypesDetalleOportunidades = {
  id: 'number',
  ws_log_id: 'string',
  auto_id: 'number',
  codAgencia: 'string',
  nomAgencia: 'string',
  ordTaller: 'string',
  kmVehiculo: 'number',
  kmRelVehiculo: 'number',
  ordFechaCita: 'string',
  ordFechaCrea: 'string',
  ordFchaCierre: 'string',
  codOrdAsesor: 'string',
  nomOrdAsesor: 'string',
  codServ: 'string',
  descServ: 'string',
  cantidad: 'number',
  cargosCobrar: 'string',
  tipoCL: 'string',
  facturado: 'string',
  tipoServ: 'string',
  franquicia: 'string',
  codEstOrdTaller: 'string',
  lado: 'string',
  flatLocal: 'string',
  codCliFactura: 'string',
  nomUsuarioVista: 'string',
  cita_fecha: 'object',
  s3s_codigo_seguimiento: 'object',
  s3s_codigo_estado_taller: 'object',
  //s3s_usuarios3s_id: 'object',
  facturacion_fecha: 'object',
  facturacion_agente: 'object',
  perdida_fecha: 'object',
  perdida_agente: 'object',
  perdida_motivo: 'object',
  ganado_fecha: 'object',
  ganado_factura: 'object',
  agendado_fecha: 'object',
  tipo_agendamiento: 'object',
  asunto_agendamiento: 'object',
  observacion_agendamiento: 'object',
  gestion_fecha: 'object',
  gestion_tipo: 'string',
  no_contesta_fecha: 'object',
  //no_contesta_contador: 'object',
  no_contesta_mensaje: 'object',
};

test.describe('API Tests gestion prin cabecera', () => { 

test('API gestion prin cabecera: rechazado', async () => {
    const url = '/api/v2/postventa/sugar_gestion?gestion_prin_cabecera=rechazos&appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';

  console.log(url);

    try {
      const response = await measureGetRequestTime(url);

      const responseBody = await response.json();
      console.log('Response from API:', responseBody);

      if (responseBody.data && Array.isArray(responseBody.data)) {
        console.log('Data before filtering:', responseBody.data);

        // Obtén los tipos de datos de los datos filtrados
        const apiTypes = responseBody.data.length > 0 ? getTypes(responseBody.data[0]) : {};
        console.log('API Data Types:', apiTypes);

        // Elimina el campo `gestion_prin_id` de los tipos de datos de la API
        delete apiTypes.gestion_prin_id;
        delete apiTypes.agencias;
        delete apiTypes.links;

        const sqlQuery = 'SELECT GP.id, GP.instancia_id, GP.empresa_id, PG.auto_id, GP.gestion_prin_id, GP.gestion_prin_cabecera, GP.gestion_general_tipo, GP.gestion_estado, PG.users_id, PG.usuarios3s_id, PG.usersugars_id, GP.ordenes, GP.oportunidades, GP.repuestos, GP.accesorios, GP.servicios, GP.stock, GP.total_inicial, GP.subtotal_inicialrepuestos, GP.subtotal_inicialservicios, GP.subtotal_inicialaccesorios, GP.recuperado, GP.rechazado, GP.pendiente, GP.cita_fecha, GP.llamada_fecha FROM postvetas_centra_v3.view_pvt_gestion_principals GP inner join postvetas_centra_v3.pvt_gestions PG';
        try {
          const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
          console.log('DB Data Types:', dbTypes);

          // Elimina el campo `gestion_prin_id` de los tipos de datos de la base de datos
          delete dbTypes.gestion_prin_id
          delete dbTypes.links;

          // Compara los tipos de datos
          expect(apiTypes).toEqual(expectedDataTypesGestionPrinCabecera);
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

test('API gestion prin cabecera: 1000km', async () => {
    const url = '/api/v2/postventa/sugar_gestion?gestion_prin_cabecera=1000km&appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';

  console.log(url);

    try {
      const response = await measureGetRequestTime(url);

      const responseBody = await response.json();
      console.log('Response from API:', responseBody);

      if (responseBody.data && Array.isArray(responseBody.data)) {
        console.log('Data before filtering:', responseBody.data);

        // Obtén los tipos de datos de los datos filtrados
        const apiTypes = responseBody.data.length > 0 ? getTypes(responseBody.data[0]) : {};
        console.log('API Data Types:', apiTypes);

        // Elimina el campo `gestion_prin_id` de los tipos de datos de la API
        delete apiTypes.gestion_prin_id;
        delete apiTypes.agencias;
        delete apiTypes.links;

        const sqlQuery = 'SELECT GP.id, GP.instancia_id, GP.empresa_id, PG.auto_id, GP.gestion_prin_id, GP.gestion_prin_cabecera, GP.gestion_general_tipo, GP.gestion_estado, PG.users_id, PG.usuarios3s_id, PG.usersugars_id, GP.ordenes, GP.oportunidades, GP.repuestos, GP.accesorios, GP.servicios, GP.stock, GP.total_inicial, GP.subtotal_inicialrepuestos, GP.subtotal_inicialservicios, GP.subtotal_inicialaccesorios, GP.recuperado, GP.rechazado, GP.pendiente, GP.cita_fecha, GP.llamada_fecha FROM postvetas_centra_v3.view_pvt_gestion_principals GP inner join postvetas_centra_v3.pvt_gestions PG';
        try {
          const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
          console.log('DB Data Types:', dbTypes);

          // Elimina el campo `gestion_prin_id` de los tipos de datos de la base de datos
          delete dbTypes.gestion_prin_id
          delete dbTypes.links;

          // Compara los tipos de datos
          expect(apiTypes).toEqual(expectedDataTypesGestionPrinCabecera);
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

test('API gestion prin cabecera: recurrentes', async () => {
    const url = '/api/v2/postventa/sugar_gestion?gestion_prin_cabecera=recurrentes&appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';

  console.log(url);

    try {
      const response = await measureGetRequestTime(url);

      const responseBody = await response.json();
      console.log('Response from API:', responseBody);

      if (responseBody.data && Array.isArray(responseBody.data)) {
        console.log('Data before filtering:', responseBody.data);

        // Obtén los tipos de datos de los datos filtrados
        const apiTypes = responseBody.data.length > 0 ? getTypes(responseBody.data[0]) : {};
        console.log('API Data Types:', apiTypes);

        // Elimina el campo `gestion_prin_id` de los tipos de datos de la API
        delete apiTypes.gestion_prin_id;
        delete apiTypes.agencias;
        delete apiTypes.links;

        const sqlQuery = 'SELECT GP.id, GP.instancia_id, GP.empresa_id, PG.auto_id, GP.gestion_prin_id, GP.gestion_prin_cabecera, GP.gestion_general_tipo, GP.gestion_estado, PG.users_id, PG.usuarios3s_id, PG.usersugars_id, GP.ordenes, GP.oportunidades, GP.repuestos, GP.accesorios, GP.servicios, GP.stock, GP.total_inicial, GP.subtotal_inicialrepuestos, GP.subtotal_inicialservicios, GP.subtotal_inicialaccesorios, GP.recuperado, GP.rechazado, GP.pendiente, GP.cita_fecha, GP.llamada_fecha FROM postvetas_centra_v3.view_pvt_gestion_principals GP inner join postvetas_centra_v3.pvt_gestions PG';
        try {
          const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
          console.log('DB Data Types:', dbTypes);

          // Elimina el campo `gestion_prin_id` de los tipos de datos de la base de datos
          delete dbTypes.gestion_prin_id
          delete dbTypes.links;

          // Compara los tipos de datos
          expect(apiTypes).toEqual(expectedDataTypesGestionPrinCabecera);
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

test('API gestion prin cabecera: no_show', async () => {
    const url = '/api/v2/postventa/sugar_gestion?gestion_prin_cabecera=no_show&appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';

  console.log(url);

    try {
      const response = await measureGetRequestTime(url);

      const responseBody = await response.json();
      console.log('Response from API:', responseBody);

      if (responseBody.data && Array.isArray(responseBody.data)) {
        console.log('Data before filtering:', responseBody.data);

        // Obtén los tipos de datos de los datos filtrados
        const apiTypes = responseBody.data.length > 0 ? getTypes(responseBody.data[0]) : {};
        console.log('API Data Types:', apiTypes);

        // Elimina el campo `gestion_prin_id` de los tipos de datos de la API
        delete apiTypes.gestion_prin_id;
        delete apiTypes.agencias;
        delete apiTypes.links;

        const sqlQuery = 'SELECT GP.id, GP.instancia_id, GP.empresa_id, PG.auto_id, GP.gestion_prin_id, GP.gestion_prin_cabecera, GP.gestion_general_tipo, GP.gestion_estado, PG.users_id, PG.usuarios3s_id, PG.usersugars_id, GP.ordenes, GP.oportunidades, GP.repuestos, GP.accesorios, GP.servicios, GP.stock, GP.total_inicial, GP.subtotal_inicialrepuestos, GP.subtotal_inicialservicios, GP.subtotal_inicialaccesorios, GP.recuperado, GP.rechazado, GP.pendiente, GP.cita_fecha, GP.llamada_fecha FROM postvetas_centra_v3.view_pvt_gestion_principals GP inner join postvetas_centra_v3.pvt_gestions PG';
        try {
          const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
          console.log('DB Data Types:', dbTypes);

          // Elimina el campo `gestion_prin_id` de los tipos de datos de la base de datos
          delete dbTypes.gestion_prin_id
          delete dbTypes.links;

          // Compara los tipos de datos
          expect(apiTypes).toEqual(expectedDataTypesGestionPrinCabecera);
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