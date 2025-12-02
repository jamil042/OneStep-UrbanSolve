// db.js
const mysql = require('mysql2');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'your_db_password', // Give your db password
  database: 'showcase',
  waitForConnections: true,
  connectionLimit: 10,
    queueLimit: 0
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database');
});

module.exports = connection;
