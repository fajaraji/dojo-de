// Menjalankan query ke data TokoKita di PostgreSQL (PGlite Node), di dalam transaksi yang dibatalkan.
// Dipakai saat menulis materi, supaya setiap angka dan fakta data dihitung dari data, bukan ditebak.
// Pemakaian: node dojo/tools/query.mjs "select count(*) from app.orders"   atau   node dojo/tools/query.mjs --file q.sql
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PG_PARSERS } from "../app/pg-options.js";
import { PGlite } from "../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const i = process.argv.indexOf("--file");
const sql = i > 0 ? fs.readFileSync(process.argv[i + 1], "utf8") : process.argv.slice(2).join(" ");
if (!sql.trim()) { console.error('Pemakaian: node dojo/tools/query.mjs "select ..."'); process.exit(2); }

const db = await PGlite.create({ loadDataDir: new Blob([fs.readFileSync(path.join(here, "../data/tokokita-db.tgz"))]), parsers: PG_PARSERS });
await db.exec("begin");
let code = 0;
try {
  const res = await db.exec(sql, { rowMode: "array" });
  for (const r of res) {
    if (!r.fields || !r.fields.length) continue;
    const cols = r.fields.map(f => f.name);
    const rows = r.rows.slice(0, 200).map(row => row.map(v => v === null ? "NULL" : String(v)));
    const w = cols.map((c, k) => Math.min(40, Math.max(c.length, ...rows.map(x => x[k].length))));
    const line = (xs) => xs.map((x, k) => x.slice(0, 40).padEnd(w[k])).join(" | ");
    console.log(line(cols)); console.log(w.map(n => "-".repeat(n)).join("-+-"));
    for (const x of rows) console.log(line(x));
    console.log(`(${r.rows.length} baris${r.rows.length > 200 ? ", 200 pertama ditampilkan" : ""})\n`);
  }
} catch (e) {
  console.error(`ERROR ${e.code || ""}: ${e.message}`); code = 1;
} finally {
  try { await db.exec("rollback"); } catch { /* sudah selesai */ }
  await db.close();
}
process.exit(code);
