// Uji T04: memeriksa jawaban soal (sql, fix, build, number) dengan mesin PostgreSQL sungguhan.
// Jalankan: node --test dojo/tools/tests/drills.test.mjs
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { checkDrill, parseNumber } from "../../app/drills.js";
import { PG_PARSERS } from "../../app/pg-options.js";
import { PGlite } from "../../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

let db;
// fungsi run dengan bentuk yang sama seperti engine.run di browser
async function run(sql, { setup = "" } = {}) {
  await db.exec("begin");
  try {
    if (setup) await db.exec(setup);
    const res = await db.exec(sql, { rowMode: "array" });
    return { ok: true, results: res.map(r => ({ columns: (r.fields || []).map(f => ({ name: f.name, typeId: f.dataTypeID })), rows: r.rows || [] })) };
  } catch (e) { return { ok: false, error: { message: e.message, code: e.code } }; }
  finally { try { await db.exec("rollback"); } catch { /* selesai */ } }
}
before(async () => { db = await PGlite.create({ loadDataDir: new Blob([fs.readFileSync(new URL("../../data/tokokita-db.tgz", import.meta.url))]), parsers: PG_PARSERS }); });
after(async () => { await db.close(); });

const kotaJawa = { id: "t1", kind: "sql", solution: "select city_name from app.cities where island = 'Jawa'" };

test("jawaban benar dengan nama kolom dan urutan berbeda diterima", async () => {
  const r = await checkDrill(run, kotaJawa, "select city_name as kota from app.cities where island = 'Jawa' order by city_name desc");
  assert.equal(r.ok, true, r.reason);
});
test("jawaban tanpa syarat ditolak dengan alasan jumlah baris", async () => {
  const r = await checkDrill(run, kotaJawa, "select city_name from app.cities");
  assert.equal(r.ok, false);
  assert.match(r.reason, /baris/);
});
test("query yang error dikembalikan sebagai error, bukan jawaban salah biasa", async () => {
  const r = await checkDrill(run, kotaJawa, "select city_nama from app.cities");
  assert.equal(r.ok, false);
  assert.ok(r.error && r.error.code === "42703");
});
test("soal checkNames menolak nama kolom yang berbeda", async () => {
  const d = { id: "t4", kind: "sql", checkNames: true, solution: "select sku as kode, product_name as nama from app.products" };
  assert.equal((await checkDrill(run, d, "select sku as kode, product_name as nama from app.products")).ok, true);
  const r = await checkDrill(run, d, "select sku, product_name from app.products");
  assert.equal(r.ok, false);
  assert.match(r.reason, /kode/);
});
test("soal build dibandingkan lewat query verify", async () => {
  const d = { id: "t2", kind: "build", solution: "delete from app.payments where status = 'refunded'", verify: "select status, count(*) from app.payments group by status" };
  assert.equal((await checkDrill(run, d, "delete from app.payments where status <> 'success'")).ok, true);
  assert.equal((await checkDrill(run, d, "delete from app.payments")).ok, false);
});
test("soal angka menerima format ribuan Indonesia", async () => {
  const d = { id: "t3", kind: "number", answerSql: "select count(*) from app.orders" };
  assert.equal((await checkDrill(run, d, "12.007")).ok, true);
  assert.equal((await checkDrill(run, d, "12000")).ok, false);
});
test("jawaban yang kena batas waktu tetap ditandai timedOut", async () => {
  const fakeRun = async (sql) => sql.startsWith("select city_name from app.cities where island")
    ? run(sql) : { ok: false, timedOut: true, error: { message: "Query dihentikan karena berjalan lebih dari 8 detik." } };
  const r = await checkDrill(fakeRun, kotaJawa, "with recursive r(n) as (select 1 union all select n+1 from r) select count(*) from r");
  assert.equal(r.ok, false);
  assert.equal(r.timedOut, true);
});
test("parseNumber memahami format Indonesia dan Inggris", () => {
  assert.equal(parseNumber("12.007"), 12007);
  assert.equal(parseNumber("1.234,56"), 1234.56);
  assert.equal(parseNumber("0,25"), 0.25);
  assert.equal(parseNumber("12,007"), 12007);
  assert.equal(parseNumber("1,234.56"), 1234.56);
  assert.equal(parseNumber("Rp 2.500"), 2500);
  assert.ok(Number.isNaN(parseNumber("dua")));
});

test("parseNumber menerima tanda minus Unicode (−) seperti di teks bab", () => {
  assert.equal(parseNumber("−9.931.300"), -9931300);
  assert.equal(parseNumber("-9.931.300"), -9931300);
  assert.equal(parseNumber("−1,5"), -1.5);
});
