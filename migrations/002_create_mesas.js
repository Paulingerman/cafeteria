// migrations/002_create_mesas.js
module.exports.name = "002_create_mesas";

module.exports.up = async (db, DB_TYPE) => {
  if (DB_TYPE === "sqlite") {
    await new Promise((res, rej) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS Mesas (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          status TEXT DEFAULT 'livre',
          garcom_nome TEXT
        )
      `, (err) => (err ? rej(err) : res()));
    });
  } else {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Mesas (
        id VARCHAR PRIMARY KEY,
        nome VARCHAR NOT NULL,
        status VARCHAR DEFAULT 'livre',
        garcom_nome VARCHAR
      )
    `);
  }
};
