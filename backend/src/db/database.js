const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '../../data/leads.db');
let _db = null;

async function initDb() {
  if (_db) return _db;

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const initSqlJs = require('sql.js');
  const SQL = await initSqlJs();

  let filebuffer = null;
  if (fs.existsSync(DB_PATH)) {
    filebuffer = fs.readFileSync(DB_PATH);
  }

  const rawDb = filebuffer ? new SQL.Database(filebuffer) : new SQL.Database();

  // Save helper — persists in-memory DB to disk
  const save = () => {
    const data = rawDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  };

  // FIX: exec for multi-statement DDL (migrations) — does NOT use prepare()
  // sql.js rawDb.exec() handles multi-statement SQL natively
  const execDDL = (sql) => {
    rawDb.run(sql); // sql.js .run() handles multi-statement DDL
    save();
  };

  // prepare() → returns better-sqlite3-compatible interface
  const prepare = (sql) => {
    return {
      run: (...params) => {
        const flat = params.flat();
        rawDb.run(sql, flat.length ? flat : []);
        save();
        return { changes: 1 };
      },
      all: (...params) => {
        const flat = params.flat();
        const result = rawDb.exec(sql, flat.length ? flat : undefined);
        if (!result.length) return [];
        const { columns, values } = result[0];
        return values.map(row => {
          const obj = {};
          columns.forEach((col, i) => { obj[col] = row[i]; });
          return obj;
        });
      },
      get: (...params) => {
        const flat = params.flat();
        const result = rawDb.exec(sql, flat.length ? flat : undefined);
        if (!result.length || !result[0].values.length) return undefined;
        const { columns, values } = result[0];
        const obj = {};
        columns.forEach((col, i) => { obj[col] = values[0][i]; });
        return obj;
      }
    };
  };

  const pragma = (s) => rawDb.run(`PRAGMA ${s}`);

  _db = { prepare, exec: execDDL, pragma, _save: save, _raw: rawDb };
  return _db;
}

// Synchronous getter — only works after initDb() has been awaited
function getDb() {
  if (!_db) throw new Error('Database not initialized. Call initDb() first.');
  return _db;
}

module.exports = { getDb, initDb };
