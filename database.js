// database.js
const mysql = require('mysql2');

const pool = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'ubuntu0191',  // your MySQL root password
  database: 'project'      // the database you want to use
});

pool.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

module.exports = pool;
