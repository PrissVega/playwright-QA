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

  test.describe('API Tests orden cabecera', () => {

    test('API orden cabecera: all', async () => {
        const url = '/api/v2/postventa/sugar_gestion/1/ordenCabecera?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
        const response = await measureGetRequestTime(url);
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

      test('API orden cabecera: una', async () => {
        const url = '/api/v2/postventa/sugar_ordencabecera/1?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
        const response = await measureGetRequestTime(url);
        const responseBody = await response.json();
    
        if (responseBody.data && typeof responseBody.data === 'object') {
            // Filtra los campos permitidos en el objeto data
            const filteredData = filterFields(responseBody.data, allowedFields_gestion_orden_cabecera_all);
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
                const apiTypes = getTypes(filteredData);
                const dbTypes = filteredDbData.length > 0 ? getTypes(filteredDbData[0]) : {};
    
                console.log('API Data Types:', apiTypes);
                console.log('DB Data Types:', dbTypes);
    
                expect(apiTypes).toEqual(dbTypes);
            } catch (error) {
                console.error('Error fetching DB data:', error);
            }
        } else {
            console.log('Response data is not an object or missing.');
        }
    });    

    test('API orden cabecera: detalle gestion oportunidades all', async () => {
        const url = '/api/v2/postventa/sugar_ordencabecera/1/detallegestionoportunidades_todos?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
    
        try {
          const response = await measureGetRequestTime(url);
          const responseBody = await response.json();
          console.log('Response from API:', responseBody);
    
          if (responseBody.data && Array.isArray(responseBody.data)) {
            console.log('Data before filtering:', responseBody.data);
    
            // Obtén los tipos de datos de los datos filtrados
            const apiTypes = responseBody.data.length > 0 ? getTypes(responseBody.data[0]) : {};
            console.log('API Data Types:', apiTypes);
    
            // Elimina los campos de los tipos de datos de la API
            delete apiTypes.oportunidad_id;
            delete apiTypes.claveunicaprincipal;
            delete apiTypes.descservtotal;
            delete apiTypes.claveunicaprincipaljson
            delete apiTypes.nombre_estado_taller;
            delete apiTypes.claveunicaprincipals3s;
            delete apiTypes.claveunicaprincipals3svariable;
            delete apiTypes.idgestion;
            delete apiTypes.primergestioestado;
            delete apiTypes.gestionestados;
            delete apiTypes.stock_avalible;
            delete apiTypes.links;
            delete apiTypes.s3s_usuarios3s_id;
            delete apiTypes.no_contesta_contador;
            delete apiTypes.created_at;
            delete apiTypes.updated_at;
    
            const sqlQuery = 'SELECT PG.id, DGO.ws_log_id, PG.auto_id, POC.codAgencia, POC.nomAgencia, POC.ordTaller, DGO.kmVehiculo, DGO.kmRelVehiculo, DGO.ordFechaCita, POC.ordFechaCrea, DGO.ordFchaCierre, POC.codOrdAsesor, POC.nomOrdAsesor, DGO.codServ, DGO.descServ, DGO.cantidad, DGO.cargosCobrar, DGO.tipoCL, DGO.facturado, DGO.tipoServ, DGO.franquicia, DGO.codEstOrdTaller, DGO.flatLocal, DGO.codCliFactura, DGO.nomUsuarioVista, DGO.cita_fecha, DGO.s3s_codigo_seguimiento, DGO.s3s_codigo_estado_taller, DGO.lado, DGO.flatLocal, DGO.codCliFactura, DGO.nomUsuarioVista, DGO.cita_fecha, DGO.s3s_codigo_seguimiento, DGO.s3s_codigo_estado_taller, DGO.s3s_usuarios3s_id, DGO.facturacion_fecha, DGO.facturacion_agente, DGO.perdida_fecha, DGO.perdida_agente, DGO.perdida_motivo, DGO.ganado_fecha, DGO.ganado_factura, DGO.agendado_fecha, DGO.tipo_agendamiento, DGO.asunto_agendamiento, DGO.observacion_agendamiento, DGO.gestion_fecha, DGO.gestion_tipo, DGO.no_contesta_fecha, DGO.no_contesta_contador, DGO.no_contesta_mensaje, DGO.created_at, DGO.updated_at FROM postvetas_centra_v3.pvt_gestions PG inner join postvetas_centra_v3.pvt_orden_cabeceras POC on PG.id = POC.id inner join postvetas_centra_v3.pvt_detalle_gestion_oportunidades DGO on PG.id = DGO.id';
            try {
              const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
              console.log('DB Data Types:', dbTypes);
    
              //Elimina los de los tipos de datos de la base de datos
              delete dbTypes.oportunidad_id; 
              delete dbTypes.s3s_usuarios3s_id;
              delete dbTypes.no_contesta_contador;       
              delete dbTypes.created_at;
              delete dbTypes.updated_at;
    
              // Compara los tipos de datos
              expect(apiTypes).toEqual(expectedDataTypesDetalleOportunidades);
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

      test('API orden cabecera: detalle gestion oportunidades una', async () => {
        const url = '/api/v2/postventa/sugar_ordencabecera/1/detallegestionoportunidades_todos?appId=c81e728d9d4c2f636f067f89cc14862c&usuId=2';
    
        try {
          const response = await measureGetRequestTime(url);
          const responseBody = await response.json();
          console.log('Response from API:', responseBody);
    
          if (responseBody.data && Array.isArray(responseBody.data)) {
            console.log('Data before filtering:', responseBody.data);
    
            // Obtén los tipos de datos de los datos filtrados
            const apiTypes = responseBody.data.length > 0 ? getTypes(responseBody.data[0]) : {};
            console.log('API Data Types:', apiTypes);
    
            // Elimina los campos de los tipos de datos de la API
            delete apiTypes.oportunidad_id;
            delete apiTypes.claveunicaprincipal;
            delete apiTypes.descservtotal;
            delete apiTypes.claveunicaprincipaljson
            delete apiTypes.nombre_estado_taller;
            delete apiTypes.claveunicaprincipals3s;
            delete apiTypes.claveunicaprincipals3svariable;
            delete apiTypes.idgestion;
            delete apiTypes.primergestioestado;
            delete apiTypes.gestionestados;
            delete apiTypes.stock_avalible;
            delete apiTypes.links;
            delete apiTypes.s3s_usuarios3s_id;
            delete apiTypes.no_contesta_contador;
            delete apiTypes.created_at;
            delete apiTypes.updated_at;
    
            const sqlQuery = 'SELECT PG.id, DGO.ws_log_id, PG.auto_id, POC.codAgencia, POC.nomAgencia, POC.ordTaller, DGO.kmVehiculo, DGO.kmRelVehiculo, DGO.ordFechaCita, POC.ordFechaCrea, DGO.ordFchaCierre, POC.codOrdAsesor, POC.nomOrdAsesor, DGO.codServ, DGO.descServ, DGO.cantidad, DGO.cargosCobrar, DGO.tipoCL, DGO.facturado, DGO.tipoServ, DGO.franquicia, DGO.codEstOrdTaller, DGO.flatLocal, DGO.codCliFactura, DGO.nomUsuarioVista, DGO.cita_fecha, DGO.s3s_codigo_seguimiento, DGO.s3s_codigo_estado_taller, DGO.lado, DGO.flatLocal, DGO.codCliFactura, DGO.nomUsuarioVista, DGO.cita_fecha, DGO.s3s_codigo_seguimiento, DGO.s3s_codigo_estado_taller, DGO.s3s_usuarios3s_id, DGO.facturacion_fecha, DGO.facturacion_agente, DGO.perdida_fecha, DGO.perdida_agente, DGO.perdida_motivo, DGO.ganado_fecha, DGO.ganado_factura, DGO.agendado_fecha, DGO.tipo_agendamiento, DGO.asunto_agendamiento, DGO.observacion_agendamiento, DGO.gestion_fecha, DGO.gestion_tipo, DGO.no_contesta_fecha, DGO.no_contesta_contador, DGO.no_contesta_mensaje, DGO.created_at, DGO.updated_at FROM postvetas_centra_v3.pvt_gestions PG inner join postvetas_centra_v3.pvt_orden_cabeceras POC on PG.id = POC.id inner join postvetas_centra_v3.pvt_detalle_gestion_oportunidades DGO on PG.id = DGO.id';
            try {
              const dbTypes = await getDbDataTypesFromQuery(sqlQuery);
              console.log('DB Data Types:', dbTypes);
    
              //Elimina los de los tipos de datos de la base de datos
              delete dbTypes.oportunidad_id; 
              delete dbTypes.s3s_usuarios3s_id;
              delete dbTypes.no_contesta_contador;       
              delete dbTypes.created_at;
              delete dbTypes.updated_at;
    
              // Compara los tipos de datos
              expect(apiTypes).toEqual(expectedDataTypesDetalleOportunidades);
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