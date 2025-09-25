// db.js
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'db4free.net',
  user: 'tamim83',
  password: 'Tamim_123@',
  database: 'urbandb'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

module.exports = connection;