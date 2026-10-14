
require("dotenv").config();

const db = require("./config/db");

async function testConnection() {
  try {
    const [rows] = await db.query(
      "SELECT DATABASE() AS databaseName, VERSION() AS mysqlVersion"
    );

    console.log("SUCCESS: THINKHIVE connected to MySQL!");
    console.log("Database:", rows[0].databaseName);
    console.log("MySQL version:", rows[0].mysqlVersion);

    await db.end();
  } catch (error) {
    console.error("DATABASE CONNECTION FAILED:");
    console.error(error.message);
    await db.end();
    process.exitCode = 1;
  }
}

testConnection();
