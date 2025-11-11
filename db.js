// db.js
const sqlite3 = require("sqlite3").verbose();
const { Pool } = require("pg");

const DB_TYPE = process.env.DB_TYPE || "sqlite"; // sqlite ou postgres

let db;

if (DB_TYPE === "sqlite") {
  db = new sqlite3.Database("./cafeteria.db", (err) => {
    if (err) console.error("Erro SQLite:", err.message);
    else console.log("✅ Conectado ao SQLite");
  });
} else if (DB_TYPE === "postgres") {
  db = new Pool({
    user: process.env.PG_USER || "postgres",
    host: process.env.PG_HOST || "localhost",
    database: process.env.PG_DB || "cafeteria",
    password: process.env.PG_PASS || "senha",
    port: process.env.PG_PORT || 5432,
  });
  db.connect((err) => {
    if (err) console.error("Erro Postgres:", err.stack);
    else console.log("✅ Conectado ao PostgreSQL");
  });
} else {
  throw new Error("DB_TYPE inválido! Use 'sqlite' ou 'postgres'.");
}

module.exports = { db, DB_TYPE };
