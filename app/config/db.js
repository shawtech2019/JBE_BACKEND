const mysql = require("mysql2");

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: "root", 
  database: process.env.DB_NAME,
  port: process.env.PORT_NUMBER,      
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Optional: test connection once at startup
pool.getConnection((err, connection) => {
  if (err) {
    console.error("Database connection failed:", err);
  } else {
    console.log("Database connected successfully");
    connection.release();
  }
});

module.exports = pool.promise();
