const mysql2 = require("mysql2");

const db = mysql2.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
});

db.getConnection((err, connection) => {
  if (err) {
    console.error("Error connect to database:", err);
  } else {
    console.log("Connected to database successfully!");
    connection.release();
  }
});

module.exports = db;
