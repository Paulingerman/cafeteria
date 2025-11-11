// seed.js
const { db, DB_TYPE } = require("./db");

const MESAS_INICIAIS = [
  { id: "1", nome: "Mesa 01" }, { id: "2", nome: "Mesa 02" },
  { id: "3", nome: "Mesa 03" }, { id: "4", nome: "Mesa 04" },
  { id: "5", nome: "Mesa 05" }, { id: "6", nome: "Mesa 06" },
];

const GARCONS_INICIAIS = [
  { id: "g1", nome: "Ana Silva", cargo: "garcom" },
  { id: "g2", nome: "Bruno Costa", cargo: "garcom" },
  { id: "g3", nome: "Carla Dias", cargo: "garcom" },
  { id: "admin", nome: "Administrador", cargo: "gerente" }
];

const CARDAPIO_INICIAL = [
  { id: "101", cat: "Cafés Quentes", nome: "Espresso", pV: 8.00, pT: "R$ 8,00", d: "Café puro e intenso.", est: 100 },
  { id: "102", cat: "Cafés Quentes", nome: "Capuccino", pV: 12.00, pT: "R$ 12,00", d: "Espresso, leite vaporizado e espuma.", est: 50 }
];

async function insertGarcons() {
  for (const g of GARCONS_INICIAIS) {
    if (DB_TYPE === "sqlite") {
      await new Promise((res, rej) =>
        db.run(
          "INSERT OR IGNORE INTO Garcons (id, nome, cargo) VALUES (?, ?, ?)",
          [g.id, g.nome, g.cargo],
          (err) => (err ? rej(err) : res())
        )
      );
    } else {
      await db.query(
        `INSERT INTO Garcons (id, nome, cargo) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
        [g.id, g.nome, g.cargo]
      );
    }
  }
}

async function insertMesas() {
  for (const m of MESAS_INICIAIS) {
    if (DB_TYPE === "sqlite") {
      await new Promise((res, rej) =>
        db.run(
          "INSERT OR IGNORE INTO Mesas (id, nome) VALUES (?, ?)",
          [m.id, m.nome],
          (err) => (err ? rej(err) : res())
        )
      );
    } else {
      await db.query(
        `INSERT INTO Mesas (id, nome) VALUES ($1, $2) ON CONFLICT DO NOTHING`,
        [m.id, m.nome]
      );
    }
  }
}

async function insertCardapio() {
  for (const i of CARDAPIO_INICIAL) {
    if (DB_TYPE === "sqlite") {
      await new Promise((res, rej) =>
        db.run(
          "INSERT OR IGNORE INTO ItensCardapio (id, categoria, nome, preco_val, preco_texto, descricao, qtd_estoque) VALUES (?, ?, ?, ?, ?, ?, ?)",
          [i.id, i.cat, i.nome, i.pV, i.pT, i.d, i.est],
          (err) => (err ? rej(err) : res())
        )
      );
    } else {
      await db.query(
        `INSERT INTO ItensCardapio (id, categoria, nome, preco_val, preco_texto, descricao, qtd_estoque)
         VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT DO NOTHING`,
        [i.id, i.cat, i.nome, i.pV, i.pT, i.d, i.est]
      );
    }
  }
}

async function seed() {
  console.log("🚀 Populando dados iniciais...");
  await insertGarcons();
  await insertMesas();
  await insertCardapio();
  console.log("🎉 Seed concluído!");
  if (DB_TYPE === "sqlite") db.close();
  else await db.end();
}

seed().catch(console.error);
