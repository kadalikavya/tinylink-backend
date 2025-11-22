// src/server/index.js
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import linksRouter from "./routes/links.js";
import { pool } from "./db.js"; // just to ensure db is initialized

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve static public files (CSS/JS)
app.use(express.static(path.join(__dirname, "../public")));

// API routes
app.use("/api/links", linksRouter);

// Healthcheck
app.get("/healthz", (req, res) => {
  return res.status(200).json({ ok: true, version: "1.0" });
});

// Dashboard HTML
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/index.html"));
});

// Stats page at /code/:code (serves HTML)
app.get("/code/:code", (req, res) => {
  res.sendFile(path.join(__dirname, "../pages/stats.html"));
});

// Redirect route for /:code (must be last to avoid matching /api or /code)
app.get("/:code", async (req, res) => {
  const code = req.params.code;
  // exclude reserved paths
  if (["api", "healthz", "code"].includes(code)) return res.status(404).send("Not found");
  try {
    const r = await pool.query("SELECT url FROM links WHERE code = $1", [code]);
    if (r.rowCount === 0) return res.status(404).send("Not found");
    const url = r.rows[0].url;
    await pool.query("UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1", [code]);
    return res.redirect(302, url);
  } catch (err) {
    console.error(err);
    return res.status(500).send("Server error");
  }
});

// start
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
