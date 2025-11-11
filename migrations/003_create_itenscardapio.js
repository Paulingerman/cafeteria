// migrations/004_create_historicopedidos.js
module.exports.name = "004_create_historicopedidos";

module.exports.up = async (db, DB_TYPE) => {
  if (DB_TYPE === "sqlite") {
    await new Promise((res, rej) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS HistoricoPedidos (
          id TEXT PRIMARY KEY,
          mesa_id TEXT,
          cliente_nome TEXT,
          garcom_nome TEXT,
          total REAL,
          data TEXT,
          itens_json TEXT
        )
      `, (err) => (err ? rej(err) : res()));
    });
  } else {
    await db.query(`
      CREATE TABLE IF NOT EXISTS HistoricoPedidos (
        id VARCHAR PRIMARY KEY,
        mesa_id VARCHAR,
        cliente_nome VARCHAR,
        garcom_nome VARCHAR,
        total NUMERIC,
        data TIMESTAMP,
        itens_json TEXT
      )
    `);
  }
};
