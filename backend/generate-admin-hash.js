/**
 * One-time helper: generates a bcrypt hash of your admin password to paste
 * into .env as ADMIN_PASSWORD_HASH. Never store the plain password itself.
 *
 * Usage:
 *   node generate-admin-hash.js "YourStrongPasswordHere"
 */
const bcrypt = require("bcryptjs");

const plainPassword = process.argv[2];

if (!plainPassword) {
  console.log("Usage: node generate-admin-hash.js \"YourStrongPasswordHere\"");
  process.exit(1);
}

const hash = bcrypt.hashSync(plainPassword, 10);
console.log("\nAdd this line to your .env file:\n");
console.log(`ADMIN_PASSWORD_HASH=${hash}\n`);
