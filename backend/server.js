/**
 * LegalEaseAI backend — Express + MySQL.
 * Loads .env first. Server always starts; MySQL is tested after listen (non-fatal).
 */
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { testConnection } = require("./db/connection");

const app = express();
const PORT = Number(process.env.PORT) || 5001;

// CORS: only allow the configured frontend origin(s) in production.
// FRONTEND_URL can be a single origin or a comma-separated list.
const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser requests (like curl/Postman) with no origin header,
      // and allow everything when no FRONTEND_URL is configured (local dev).
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "LegalEaseAI backend is running." });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/consultations", require("./routes/consultationRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/chatbot", require("./routes/chatbotRoutes"));

app.use((req, res) => {
  res.status(404).json({ error: "Route not found." });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  testConnection();
});
