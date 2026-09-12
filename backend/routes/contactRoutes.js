const express = require("express");
const rateLimit = require("express-rate-limit");
const { pool } = require("../db/connection");
const { requireAdminAuth } = require("../middleware/auth");
const { validateContact } = require("../middleware/validators");

const router = express.Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." }
});

// POST /api/contact  (public — used by the contact form)
router.post("/", submitLimiter, validateContact, async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const [result] = await pool.execute(
      `INSERT INTO contact_messages (name, email, phone, subject, message)
       VALUES (?, ?, ?, ?, ?)`,
      [name, email, phone || null, subject, message]
    );

    res.status(201).json({
      message: "Message saved.",
      id: result.insertId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save message (check MySQL)." });
  }
});

// GET /api/contact  (admin only)
router.get("/", requireAdminAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load messages (check MySQL)." });
  }
});

// DELETE /api/contact/:id  (admin only)
router.delete("/:id", requireAdminAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: "Invalid id." });
    }
    const [result] = await pool.execute(
      "DELETE FROM contact_messages WHERE id = ?",
      [id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Not found." });
    }
    res.json({ message: "Deleted." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete (check MySQL)." });
  }
});

module.exports = router;
