/**
 * MySQL pool — reads backend/.env (via dotenv loaded here and in server.js).
 *
 * DB_PASSWORD:
 * - Empty / missing → mysql2 connects with NO password (only works if MySQL
 *   user "root" @ localhost has no password).
 * - Non-empty → must match the password for DB_USER in MySQL exactly
 *   (same as MySQL Workbench or mysql -u root -p).
 *
 * If MySQL fails, the backend keeps running; see testConnection() below.
 */
require("dotenv").config();
const mysql = require("mysql2/promise");

function getPasswordFromEnv() {
  // Undefined → treat as empty string (no password sent).
  if (process.env.DB_PASSWORD === undefined) {
    return "";
  }
  return String(process.env.DB_PASSWORD);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: getPasswordFromEnv(),
  database: process.env.DB_NAME || "legaleaseai",
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Ping MySQL once at startup. Never exits the process.
 */
async function testConnection() {
  const pwdSet = getPasswordFromEnv().length > 0;
  console.log(
    "[MySQL] DB_PASSWORD in .env:",
    pwdSet ? "(set — value hidden; must match MySQL user password)" : "(empty — connects using password: NO)"
  );

  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log("MySQL connected successfully.");
  } catch (err) {
    console.log(
      "Backend running, but MySQL connection failed. Check .env DB_PASSWORD."
    );
    console.log("(Details:", err.message + ")");
    if (!pwdSet) {
      console.log(
        "[Hint] If MySQL expects a password for this user, add DB_PASSWORD to .env with that exact password."
      );
    }
  }
}

module.exports = { pool, testConnection };
