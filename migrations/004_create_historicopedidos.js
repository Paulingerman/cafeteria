// migrations/004_seed_historico.js
module.exports = {
  name: "004_seed_historico",
  async up(db) {
    console.log("➡️ Inserindo pedidos iniciais no histórico...");

    const HISTORICO_INICIAL = [
      {
        id: "p1",
        mesa_id: "1",
        cliente_nome: "Carlos Souza",
        garcom_nome: "Ana Silva",
        total: 30.00,
        data: new Date().toISOString(),
        itens_json: JSON.stringify([
          { id: "101", nome: "Espresso", quantidade: 2, preco: 8.00 },
          { id: "301", nome: "Pão de Queijo", quantidade: 1, preco: 7.00 },
          { id: "502", nome: "Refrigerante", quantidade: 1, preco: 7.00 }
        ])
      },
      {
        id: "p2",
        mesa_id: "3",
        cliente_nome: "Mariana Lima",
        garcom_nome: "Bruno Costa",
        total: 41.00,
        data: new Date().toISOString(),
        itens_json: JSON.stringify([
          { id: "102", nome: "Capuccino", quantidade: 1, preco: 12.00 },
          { id: "104", nome: "Mocha", quantidade: 2, preco: 14.00 },
          { id: "403", nome: "Cookie", quantidade: 1, preco: 9.00 }
        ])
      }
    ];

    for (const p of HISTORICO_INICIAL) {
      await db.run(
        `INSERT OR IGNORE INTO HistoricoPedidos
        (id, mesa_id, cliente_nome, garcom_nome, total, data, itens_json)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [p.id, p.mesa_id, p.cliente_nome, p.garcom_nome, p.total, p.data, p.itens_json]
      );
    }

    console.log("✅ Histórico de pedidos inicial inserido.");
  },
};
 