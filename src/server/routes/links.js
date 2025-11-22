// src/server/routes/links.js
import express from "express";
import { pool } from "../db.js";

const router = express.Router();

const CODE_RE = /^[A-Za-z0-9]{6,8}$/;

function isValidUrl(u) {
  try {
    const p = new URL(u);
    return p.protocol === "http:" || p.protocol === "https:";
  } catch {
    return false;
  }
}

function generateCode(len = 6) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

async function getUniqueCode() {
  for (let i = 0; i < 8; i++) {
    const c = generateCode(6);
    const r = await pool.query("SELECT code FROM links WHERE code = $1", [c]);
    if (r.rowCount === 0) return c;
  }
  // fallback timestamp base62-like
  return (Date.now().toString(36) + Math.random().toString(36).slice(2, 4)).slice(0, 6);
}

// POST /api/links
router.post("/", async (req, res) => {
  const { url, code: customCode } = req.body || {};

  if (!url) return res.status(400).json({ error: "url is required" });
  if (!isValidUrl(url)) return res.status(400).json({ error: "invalid url" });

  let code = customCode ? String(customCode).trim() : null;
  if (code) {
    if (!CODE_RE.test(code)) {
      return res.status(400).json({ error: "code must be [A-Za-z0-9]{6,8}" });
    }
    // check exists
    const ex = await pool.query("SELECT code FROM links WHERE code = $1", [code]);
    if (ex.rowCount > 0) return res.status(409).json({ error: "code already exists" });
  } else {
    code = await getUniqueCode();
  }

  try {
    await pool.query("INSERT INTO links(code, url) VALUES ($1, $2)", [code, url]);
    return res.status(201).json({ code, url });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "code already exists" });
    console.error(err);
    return res.status(500).json({ error: "internal" });
  }
});

// GET /api/links (list)
router.get("/", async (req, res) => {
  const r = await pool.query("SELECT code, url, clicks, created_at, last_clicked FROM links ORDER BY created_at DESC");
  res.json(r.rows);
});

// GET /api/links/:code (stats)
router.get("/:code", async (req, res) => {
  const { code } = req.params;
  const r = await pool.query("SELECT code, url, clicks, created_at, last_clicked FROM links WHERE code = $1", [code]);
  if (r.rowCount === 0) return res.status(404).json({ error: "not found" });
  res.json(r.rows[0]);
});

// DELETE /api/links/:code
router.delete("/:code", async (req, res) => {
  const { code } = req.params;
  const r = await pool.query("DELETE FROM links WHERE code = $1 RETURNING *", [code]);
  if (r.rowCount === 0) return res.status(404).json({ error: "not found" });
  res.json({ ok: true });
});

export default router;
