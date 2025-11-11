// migrations/001_create_garcons.js
module.exports.name = "001_create_garcons";

module.exports.up = async (db, DB_TYPE) => {
  if (DB_TYPE === "sqlite") {
    await new Promise((res, rej) => {
      db.run(`
        CREATE TABLE IF NOT EXISTS Garcons (
          id TEXT PRIMARY KEY,
          nome TEXT NOT NULL,
          cargo TEXT DEFAULT 'garcom'
        )
      `, (err) => (err ? rej(err) : res()));
    });
  } else {
    await db.query(`
      CREATE TABLE IF NOT EXISTS Garcons (
        id VARCHAR PRIMARY KEY,
        nome VARCHAR NOT NULL,
        cargo VARCHAR DEFAULT 'garcom'
      )
    `);
  }
};
