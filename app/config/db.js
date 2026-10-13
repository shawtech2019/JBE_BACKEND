const mysql = require("mysql2");
const { env } = require("./env")


const pool = mysql.createPool({
  host: env.DB_HOST,
  user: env.DB_USER,
  password: env.DB_PASSWORD, 
  database: env.DB_NAME,
  port: env.DB_PORT,      
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
