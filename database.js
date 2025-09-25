// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'db4free.net',       
  user: 'tamim83',           
  password: 'Tamim_123@',    
  database: 'urbandb',      
  port: 3306                 
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to db4free MySQL database');
});

module.exports = connection;
