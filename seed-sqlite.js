// seed-sqlite.js
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database("./cafeteria.db");

// ==========================
// Dados iniciais
// ==========================
const MESAS_INICIAIS = [
  { id: "1", nome: "Mesa 01" }, { id: "2", nome: "Mesa 02" },
  { id: "3", nome: "Mesa 03" }, { id: "4", nome: "Mesa 04" },
  { id: "5", nome: "Mesa 05" }, { id: "6", nome: "Mesa 06" },
];

const GARCONS_INICIAIS = [
  { id: "g1", nome: "Ana Silva", cargo: "garcom" },
  { id: "g2", nome: "Bruno Costa", cargo: "garcom" },
  { id: "g3", nome: "Carla Dias", cargo: "garcom" },
  { id: "g4", nome: "Daniel Moreira", cargo: "garcom" },
  { id: "g5", nome: "Elisa Fernandes", cargo: "garcom" },
  { id: "g6", nome: "Fábio Guedes", cargo: "garcom" },
  { id: "g7", nome: "Gabriela Lima", cargo: "garcom" },
  { id: "g8", nome: "Hugo Matos", cargo: "garcom" },
  { id: "g9", nome: "Inês Pereira", cargo: "garcom" },
  { id: "g10", nome: "João Rodrigues", cargo: "garcom" },
  { id: "g11", nome: "Lia Santos", cargo: "garcom" },
  { id: "g12", nome: "Marco Antunes", cargo: "garcom" },
  { id: "admin", nome: "Administrador", cargo: "gerente" }
];

const CARDAPIO_INICIAL = [
  { id: "101", cat: "Cafés Quentes", nome: "Espresso", pV: 8.00, pT: "R$ 8,00", d: "Café puro e intenso.", est: 100 },
  { id: "102", cat: "Cafés Quentes", nome: "Capuccino", pV: 12.00, pT: "R$ 12,00", d: "Espresso, leite vaporizado e espuma.", est: 50 },
  { id: "103", cat: "Cafés Quentes", nome: "Latte", pV: 11.00, pT: "R$ 11,00", d: "Espresso com mais leite.", est: 60 },
  { id: "104", cat: "Cafés Quentes", nome: "Mocha", pV: 14.00, pT: "R$ 14,00", d: "Espresso, chocolate e leite vaporizado.", est: 45 },
  { id: "105", cat: "Cafés Quentes", nome: "Macchiato", pV: 10.00, pT: "R$ 10,00", d: "Espresso com uma mancha de espuma.", est: 40 },
  { id: "201", cat: "Cafés Gelados", nome: "Iced Latte", pV: 13.00, pT: "R$ 13,00", d: "Espresso, leite e gelo.", est: 30 },
  { id: "202", cat: "Cafés Gelados", nome: "Cold Brew", pV: 15.00, pT: "R$ 15,00", d: "Café extraído a frio.", est: 20 },
  { id: "203", cat: "Cafés Gelados", nome: "Frappuccino", pV: 18.00, pT: "R$ 18,00", d: "Base batida com gelo.", est: 25 },
  { id: "301", cat: "Salgados", nome: "Pão de Queijo", pV: 7.00, pT: "R$ 7,00", d: "Tradicional (unid).", est: 40 },
  { id: "302", cat: "Salgados", nome: "Croissant", pV: 10.00, pT: "R$ 10,00", d: "Massa folhada.", est: 0 },
  { id: "303", cat: "Salgados", nome: "Tostex Misto", pV: 15.00, pT: "R$ 15,00", d: "Pão, queijo e presunto.", est: 15 },
  { id: "304", cat: "Salgados", nome: "Empada de Frango", pV: 9.00, pT: "R$ 9,00", d: "Massa amanteigada.", est: 20 },
  { id: "401", cat: "Doces", nome: "Bolo de Cenoura", pV: 12.00, pT: "R$ 12,00", d: "Fatia com cobertura.", est: 10 },
  { id: "402", cat: "Doces", nome: "Brownie", pV: 14.00, pT: "R$ 14,00", d: "Com nozes.", est: 12 },
  { id: "403", cat: "Doces", nome: "Cookie", pV: 9.00, pT: "R$ 9,00", d: "Gotas de chocolate.", est: 30 },
  { id: "501", cat: "Bebidas (Sem Café)", nome: "Água Mineral", pV: 5.00, pT: "R$ 5,00", d: "Com ou sem gás.", est: 50 },
  { id: "502", cat: "Bebidas (Sem Café)", nome: "Refrigerante", pV: 7.00, pT: "R$ 7,00", d: "Lata.", est: 40 },
  { id: "503", cat: "Bebidas (Sem Café)", nome: "Suco Natural", pV: 10.00, pT: "R$ 10,00", d: "Laranja ou Uva.", est: 15 },
];

db.serialize(() => {
  console.log("🚀 Iniciando criação do banco SQLite...");

  // Apagar tabelas antigas
  db.run("DROP TABLE IF EXISTS HistoricoPedidos");
  db.run("DROP TABLE IF EXISTS ItensCardapio");
  db.run("DROP TABLE IF EXISTS Mesas");
  db.run("DROP TABLE IF EXISTS Garcons");

  // Criar Garcons
  db.run(`
    CREATE TABLE Garcons (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      cargo TEXT DEFAULT 'garcom'
    )
  `);
  const stmtG = db.prepare("INSERT INTO Garcons (id, nome, cargo) VALUES (?, ?, ?)");
  for (const g of GARCONS_INICIAIS) stmtG.run(g.id, g.nome, g.cargo);
  stmtG.finalize();
  console.log("✅ Garcons criados.");

  // Criar Mesas
  db.run(`
    CREATE TABLE Mesas (
      id TEXT PRIMARY KEY,
      nome TEXT NOT NULL,
      status TEXT DEFAULT 'livre',
      garcom_nome TEXT
    )
  `);
  const stmtM = db.prepare("INSERT INTO Mesas (id, nome) VALUES (?, ?)");
  for (const m of MESAS_INICIAIS) stmtM.run(m.id, m.nome);
  stmtM.finalize();
  console.log("✅ Mesas criadas.");

  // Criar ItensCardapio
  db.run(`
    CREATE TABLE ItensCardapio (
      id TEXT PRIMARY KEY,
      categoria TEXT,
      nome TEXT,
      preco_val REAL,
      preco_texto TEXT,
      descricao TEXT,
      qtd_estoque INTEGER
    )
  `);
  const stmtI = db.prepare(`
    INSERT INTO ItensCardapio 
    (id, categoria, nome, preco_val, preco_texto, descricao, qtd_estoque)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const i of CARDAPIO_INICIAL) stmtI.run(i.id, i.cat, i.nome, i.pV, i.pT, i.d, i.est);
  stmtI.finalize();
  console.log("✅ Itens do cardápio criados.");

  // Criar Histórico
  db.run(`
    CREATE TABLE HistoricoPedidos (
      id TEXT PRIMARY KEY,
      mesa_id TEXT,
      cliente_nome TEXT,
      garcom_nome TEXT,
      total REAL,
      data TEXT,
      itens_json TEXT
    )
  `);
  console.log("✅ Tabela HistoricoPedidos criada.");

  console.log("🎉 Seed concluído com sucesso!");
});

db.close();
