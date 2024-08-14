const mysql = require('mysql2');

// Configura tu conexión a la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'HBstXZYxgIJJuzX7baCSdwnEI3',
  database: 'postvetas_centra_v3'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err.stack);
    return;
  }
  console.log('Connected to the database.');
});

module.exports = connection;