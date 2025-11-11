// server.js
const express = require("express");
const { query } = require("./dbQuery");
const app = express();

app.use(express.json());

app.get("/mesas", async (req, res) => {
  try {
    const mesas = await query("SELECT * FROM Mesas");
    res.json(mesas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/garcons", async (req, res) => {
  try {
    const garcons = await query("SELECT * FROM Garcons");
    res.json(garcons);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/cardapio", async (req, res) => {
  try {
    const itens = await query("SELECT * FROM ItensCardapio");
    res.json(itens);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🚀 Server rodando na porta 3000"));
