// Uji perbaikan tinjauan R1: nilai tanggal dan jam tidak boleh bergeser karena zona waktu komputer.
// Jalankan: node --test dojo/tools/tests/datetime.test.mjs
process.env.TZ = "Asia/Jakarta"; // zona waktu pengguna di Indonesia (UTC+7)
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { PG_PARSERS } from "../../app/pg-options.js";
import { normalizeValue, compareResults } from "../../app/checker.js";
import { PGlite } from "../../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

let db;
const q = async (sql) => {
  const r = await db.query(sql, [], { rowMode: "array" });
  return { columns: r.fields.map(f => ({ name: f.name, typeId: f.dataTypeID })), rows: r.rows };
};
before(async () => { db = await PGlite.create({ parsers: PG_PARSERS }); });
after(async () => { await db.close(); });

test("timestamp ditampilkan persis seperti di database", async () => {
  const r = await q("select timestamp '2025-10-31 14:18:29' as t");
  assert.equal(normalizeValue(r.rows[0][0], r.columns[0].typeId), "2025-10-31 14:18:29");
});
test("date tetap tanggal yang sama", async () => {
  const r = await q("select date '2025-03-01' as d");
  assert.equal(normalizeValue(r.rows[0][0], r.columns[0].typeId), "2025-03-01");
});
test("hasil DATE_TRUNC sama dengan date awal bulan", async () => {
  const a = await q("select date_trunc('month', timestamp '2025-03-17 10:00:00') as m");
  const b = await q("select date '2025-03-01' as m");
  assert.equal(compareResults(a, b).ok, true, normalizeValue(a.rows[0][0], a.columns[0].typeId));
});
test("timestamp jam 07:00 tidak dianggap sama dengan tanggal saja", async () => {
  const a = await q("select timestamp '2025-03-01 07:00:00' as m");
  const b = await q("select date '2025-03-01' as m");
  assert.equal(compareResults(a, b).ok, false);
});
