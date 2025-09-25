// db.js
const mysql = require('mysql2');

const connection = mysql.createConnection({
<<<<<<< HEAD
  host: 'localhost',
  user: 'root',
  password: 'as2023jamil14102',
  database: 'showcase',
  waitForConnections: true,
  connectionLimit: 10,
    queueLimit: 0
=======
  host: 'db4free.net',       
  user: 'tamim83',           
  password: 'Tamim_123@',    
  database: 'urbandb',      
  port: 3306                 
>>>>>>> 6f61748125151a968f5469790226a5d99bb5876d
});

connection.connect((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    return;
  }
  console.log('✅ Connected to db4free MySQL database');
});

module.exports = connection;
