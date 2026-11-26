// Worker mesin: menjalankan PostgreSQL (PGlite) terpisah dari halaman, supaya bisa dimatikan kalau query macet.
import { PGlite } from "../vendor/pglite-0.5.16/index.js";
import { generate, loadInto } from "../data/tokokita.js";
import { PG_PARSERS } from "./pg-options.js";

// Zona waktu sesi mengikuti komputer pengguna, supaya NOW() dan CURRENT_DATE sesuai jam setempat.
async function setTimeZone() {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  if (/^[A-Za-z_]+(\/[A-Za-z0-9_+-]+)*$/.test(tz)) await db.exec(`set timezone to '${tz}'`);
}

let db = null;

async function compile(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`gagal mengambil ${url} (${r.status})`);
  return WebAssembly.compile(await r.arrayBuffer());
}
async function blob(url) {
  const r = await fetch(url);
  if (!r.ok) throw new Error(`gagal mengambil ${url} (${r.status})`);
  return r.blob();
}

async function boot({ base, dbUrl }) {
  // pglite-data.wasm = berkas sistem PostgreSQL (aslinya pglite.data), nama .wasm dipertahankan sejak uji coba T00.
  const [pgliteWasmModule, fsBundle] = await Promise.all([compile(base + "pglite.wasm"), blob(base + "pglite-data.wasm")]);
  let ready = null;
  if (dbUrl) { try { ready = await blob(dbUrl); } catch { ready = null; } }
  if (ready) {
    db = await PGlite.create({ pgliteWasmModule, fsBundle, loadDataDir: ready, parsers: PG_PARSERS });
    await setTimeZone();
    return { source: "database siap pakai" };
  }
  const initdbWasmModule = await compile(base + "initdb.wasm");
  db = await PGlite.create({ pgliteWasmModule, initdbWasmModule, fsBundle, parsers: PG_PARSERS });
  await loadInto(db, generate());
  await setTimeZone();
  return { source: "dibuat di browser" };
}

// Perintah transaksi tidak boleh dipakai di dalam latihan yang dibatalkan otomatis (END sama dengan COMMIT).
import { transactionCommands } from "./sql-lex.js";

function shape(r) {
  return { columns: (r.fields || []).map(f => ({ name: f.name, typeId: f.dataTypeID })), rows: r.rows || [], affectedRows: r.affectedRows };
}

async function run({ sql, setup, isolate }) {
  const tx = isolate ? transactionCommands(sql) : [];
  if (tx.length) {
    return { ok: false, error: { message: `Perintah transaksi (${tx.join(", ")}) tidak bisa dipakai di sini, karena setiap latihan otomatis dibatalkan setelah selesai supaya data tetap utuh.` } };
  }
  const t0 = performance.now();
  if (isolate) await db.exec("begin");
  try {
    if (setup) await db.exec(setup);
    const res = await db.exec(sql, { rowMode: "array" });
    return { ok: true, results: res.map(shape), ms: Math.round(performance.now() - t0) };
  } catch (e) {
    return { ok: false, error: { message: String(e && e.message || e), code: e && e.code, position: e && e.position ? Number(e.position) : undefined }, ms: Math.round(performance.now() - t0) };
  } finally {
    if (isolate) { try { await db.exec("rollback"); } catch { /* transaksi sudah selesai */ } }
  }
}

self.onmessage = async (e) => {
  const { id, type } = e.data;
  try {
    if (type === "init") self.postMessage({ id, ok: true, ...(await boot(e.data)) });
    else if (type === "run") self.postMessage({ id, ...(await run(e.data)) });
  } catch (err) {
    self.postMessage({ id, ok: false, error: { message: String(err && err.message || err) } });
  }
};
