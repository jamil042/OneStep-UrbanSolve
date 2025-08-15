// db.js
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'as2023jamil14102',
  database: 'project'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

module.exports = connection;
