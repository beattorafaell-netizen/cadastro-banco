const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();

// permite seu front (Live Server geralmente é http://127.0.0.1:5500 ou http://localhost:5500)
app.use(cors({ origin: ["http://127.0.0.1:5500", "http://localhost:5500"] }));
app.use(express.json());

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
});

app.get("/api/ping", (req, res) => res.json({ ok: true, msg: "API rodando" }));

app.get("/api/empresas", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, nome, cnpj, created_at FROM empresas ORDER BY id DESC"
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/empresas", async (req, res) => {
  try {
    const { nome, cnpj } = req.body;
    if (!nome || !cnpj) return res.status(400).json({ error: "nome e cnpj obrigatórios" });

    const { rows } = await pool.query(
      "INSERT INTO empresas (nome, cnpj) VALUES ($1, $2) RETURNING id",
      [nome.trim(), cnpj.trim()]
    );

    res.status(201).json({ ok: true, id: rows[0].id });
  } catch (err) {
    if (err.code === "23505") return res.status(409).json({ error: "CNPJ já existe" });
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("API: http://localhost:3001"));