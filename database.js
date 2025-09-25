const mysql = require("mysql2");

const db = mysql.createConnection({
  host: "db4free.net",
  user: "tamim83",       
  password: "Tamim_123@", 
  database: "urbandb",    
  port: 3306
});

db.connect((err) => {
  if (err) {
    console.error("Database connection failed:", err);
    return;
  }
  console.log("✅ Connected to db4free MySQL!");
});
