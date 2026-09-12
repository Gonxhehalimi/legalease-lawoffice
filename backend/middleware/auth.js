/**
 * requireAdminAuth — protects admin-only routes.
 *
 * Expects: Authorization: Bearer <token>
 * The token is issued by POST /api/auth/login after checking the admin
 * password against ADMIN_PASSWORD_HASH in .env.
 */
const jwt = require("jsonwebtoken");

function requireAdminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Missing or invalid Authorization header." });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== "admin") {
      return res.status(403).json({ error: "Not authorized." });
    }
    req.admin = payload;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
}

module.exports = { requireAdminAuth };
