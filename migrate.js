// migrate.js
const fs = require("fs");
const path = require("path");
const { db, DB_TYPE } = require("./db");

async function runMigrations() {
  const migrationFiles = fs
    .readdirSync(path.join(__dirname, "migrations"))
    .sort();

  for (const file of migrationFiles) {
    const migration = require(`./migrations/${file}`);
    console.log(`➡️ Executando migração: ${migration.name}`);
    await migration.up(db, DB_TYPE);
  }

  console.log("🎉 Todas as migrações executadas!");
  if (DB_TYPE === "sqlite") db.close();
  else await db.end();
}

runMigrations().catch(console.error);
