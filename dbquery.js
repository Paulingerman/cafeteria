// dbQuery.js
const { db, DB_TYPE } = require("./db");

async function query(sql, params = []) {
  if (DB_TYPE === "sqlite") {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  } else {
    const res = await db.query(sql, params);
    return res.rows;
  }
}

module.exports = { query };
