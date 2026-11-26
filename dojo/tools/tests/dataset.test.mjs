// Uji T01: data latihan TokoKita.
// Jalankan: node --test dojo/tools/tests/dataset.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { generate, loadInto, SCHEMA_DOC } from "../../data/tokokita.js";
import { PGlite } from "../../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

const data = generate();
const T = data.tables;
const col = (table, name) => {
  const i = T[table].columns.indexOf(name);
  assert.ok(i >= 0, `kolom ${table}.${name} tidak ada`);
  return T[table].rows.map(r => r[i]);
};

test("generate dua kali menghasilkan data identik", () => {
  assert.equal(JSON.stringify(generate()), JSON.stringify(data));
});

test("jumlah baris sesuai rentang", () => {
  assert.equal(T["app.customers"].rows.length, 1500);
  assert.equal(T["app.products"].rows.length, 150);
  assert.equal(T["app.cities"].rows.length, 24);
  assert.equal(T["app.staff"].rows.length, 25);
  const orders = T["app.orders"].rows.length;
  assert.ok(orders >= 11000 && orders <= 13000, `orders = ${orders}`);
  const items = T["app.order_items"].rows.length;
  assert.ok(items >= 24000 && items <= 34000, `order_items = ${items}`);
  const events = T["raw.web_events"].rows.length;
  assert.ok(events >= 18000 && events <= 32000, `web_events = ${events}`);
});

test("semua foreign key valid", () => {
  const has = (table, name) => new Set(col(table, name));
  const cities = has("app.cities", "city_id");
  const customers = has("app.customers", "customer_id");
  const products = has("app.products", "product_id");
  const orders = has("app.orders", "order_id");
  const cats = has("app.categories", "category_id");
  const staff = has("app.staff", "staff_id");
  const check = (table, name, set, nullable = false) => {
    for (const v of col(table, name)) {
      if (v === null && nullable) continue;
      assert.ok(set.has(v), `${table}.${name} = ${v} tidak punya pasangan`);
    }
  };
  check("app.customers", "city_id", cities);
  check("app.products", "category_id", cats);
  check("app.categories", "parent_id", cats, true);
  check("app.staff", "manager_id", staff, true);
  check("app.orders", "customer_id", customers);
  check("app.orders", "handled_by", staff, true);
  check("app.order_items", "order_id", orders);
  check("app.order_items", "product_id", products);
  check("app.payments", "order_id", orders);
  check("app.shipments", "order_id", orders);
  check("app.returns", "order_id", orders);
  check("app.product_price_history", "product_id", products);
  check("raw.customer_snapshot", "customer_id", customers);
});

test("anomali yang sengaja dibuat benar-benar ada", () => {
  // pesanan yang dibayar dua kali (bahan jebakan baris berlipat)
  const perOrder = new Map();
  for (const o of col("app.payments", "order_id")) perOrder.set(o, (perOrder.get(o) || 0) + 1);
  const split = [...perOrder.values()].filter(n => n >= 2).length;
  assert.ok(split >= 100, `pesanan dibayar 2 kali = ${split}`);

  // pelanggan yang berubah kota atau segmen di potret bulanan (bahan SCD2)
  const snap = T["raw.customer_snapshot"];
  const ci = snap.columns.indexOf("customer_id"), ki = snap.columns.indexOf("city_id"), si = snap.columns.indexOf("segment");
  const seen = new Map(), changed = new Set();
  for (const r of snap.rows) {
    const key = r[ki] + "|" + r[si];
    if (seen.has(r[ci]) && seen.get(r[ci]) !== key) changed.add(r[ci]);
    seen.set(r[ci], key);
  }
  assert.ok(changed.size >= 100, `pelanggan berubah = ${changed.size}`);

  // perubahan harga produk
  const hist = col("app.product_price_history", "product_id");
  const priceChanges = hist.length - new Set(hist).size;
  assert.ok(priceChanges >= 30, `perubahan harga = ${priceChanges}`);

  // baris dobel di upload pemasok (sama persis setelah teks dirapikan)
  const up = T["raw.supplier_price_upload"];
  const norm = (s) => String(s ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  const keys = up.rows.map(r => norm(r[up.columns.indexOf("sku_text")]) + "|" + norm(r[up.columns.indexOf("effective_date_text")]));
  const dups = keys.length - new Set(keys).size;
  assert.ok(dups >= 5, `baris dobel upload = ${dups}`);

  // pesanan susulan bertanggal lebih tua dari batas data batch 1
  const maxTs = col("app.orders", "order_ts").reduce((a, b) => (a > b ? a : b));
  const orderIds = new Set(col("app.orders", "order_id"));
  const b2 = T["raw.orders_batch2"];
  const late = b2.rows.filter(r => !orderIds.has(r[b2.columns.indexOf("order_id")]) && r[b2.columns.indexOf("order_ts")] <= maxTs).length;
  assert.ok(late >= 20, `pesanan terlambat di batch2 = ${late}`);
});

test("kamus data mencakup semua tabel dan kolom", () => {
  for (const [name, t] of Object.entries(T)) {
    const doc = SCHEMA_DOC.find(d => d.table === name);
    assert.ok(doc, `kamus data untuk ${name} tidak ada`);
    assert.ok(doc.grain && doc.description, `grain/deskripsi ${name} kosong`);
    assert.deepEqual(doc.columns.map(c => c.name), t.columns, `kolom kamus data ${name} tidak sama`);
    for (const c of doc.columns) assert.ok(c.description && c.type, `${name}.${c.name} belum dijelaskan`);
  }
});

test("loadInto ke PGlite: jumlah baris tiap tabel sama dengan generator", async () => {
  const db = await PGlite.create();
  const { ms } = await loadInto(db, data);
  for (const [name, t] of Object.entries(T)) {
    const r = await db.query(`select count(*)::int as n from ${name}`);
    assert.equal(r.rows[0].n, t.rows.length, `jumlah baris ${name}`);
  }
  console.log(`  waktu muat: ${ms} ms`);
  await db.close();
});
