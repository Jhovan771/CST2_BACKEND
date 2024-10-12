const mysql2 = require("mysql2");

const db = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "01.God_is_Able",
  database: "cst2_db",
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
