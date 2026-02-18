const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "127.0.0.1",        // IMPORTANT: not localhost
  user: "root",
  password: "root",             // your MySQL password
  database: "auth_db",
  port: 8889,               // change to 8889 if using MAMP
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