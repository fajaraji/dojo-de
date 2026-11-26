// Uji T04: mendeteksi perintah SQL di dalam teks query.
// Jalankan: node --test dojo/tools/tests/sql-features.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { sqlFeatures, KNOWN_FEATURES } from "../lib/sql-features.mjs";

test("komentar diabaikan", () => {
  const f = sqlFeatures("select distinct a from t -- order by");
  assert.ok(f.has("SELECT") && f.has("DISTINCT") && f.has("FROM"));
  assert.ok(!f.has("ORDER BY"));
});
test("isi teks berkutip diabaikan", () => assert.ok(!sqlFeatures("select 'left join' x").has("LEFT JOIN")));
test("frasa dua kata dikenali utuh", () => {
  const f = sqlFeatures("select a from t left join u on u.id = t.id where b is not null order by a");
  for (const k of ["LEFT JOIN", "ON", "IS NOT NULL", "ORDER BY", "="]) assert.ok(f.has(k), k);
  assert.ok(!f.has("IS NULL") && !f.has("JOIN"), "LEFT JOIN tidak dihitung sebagai JOIN biasa, IS NOT NULL bukan IS NULL");
});
test("fungsi dikenali dengan tanda kurung", () => {
  const f = sqlFeatures("select count(distinct customer_id), coalesce(x, 0) from app.orders");
  assert.ok(f.has("COUNT()") && f.has("COUNT(DISTINCT)") && f.has("COALESCE()"));
});
test("nama tabel bertitik sebelum kurung bukan fungsi", () => assert.ok(!sqlFeatures("insert into app.orders (order_id) values (1)").has("ORDERS()")));
test("SELECT * dikenali, perkalian tidak", () => {
  assert.ok(sqlFeatures("select * from app.orders").has("SELECT *"));
  assert.ok(!sqlFeatures("select qty * 2 from app.order_items").has("SELECT *"));
});
test("operator || dan :: dikenali", () => {
  const f = sqlFeatures("select a || b, c::int from t");
  assert.ok(f.has("||") && f.has("::"));
});
test("query di dalam query (subquery) dikenali", () => {
  assert.ok(sqlFeatures("select * from (select 1 as x) as t").has("SUBQUERY"));
  assert.ok(sqlFeatures("select a from t where b in (select b from u)").has("SUBQUERY"));
  assert.ok(!sqlFeatures("select a from t where b in (1, 2)").has("SUBQUERY"));
});
test("gabungan tabel dengan koma dikenali sebagai CROSS JOIN", () => {
  assert.ok(sqlFeatures("select * from app.orders, app.cities").has("CROSS JOIN"));
  assert.ok(sqlFeatures("select * from app.orders o, (select 7 as x) as a").has("CROSS JOIN"));
  assert.ok(!sqlFeatures("select a, b from app.orders").has("CROSS JOIN"));
});
test("hasil sama saat dipanggil berulang kali", () => {
  for (let i = 0; i < 5; i++) {
    const f = sqlFeatures("select a from t where a = 1 and b <> 2 and c || d = 'x'");
    assert.ok(f.has("=") && f.has("<>") && f.has("||"), `panggilan ke-${i + 1}: ${[...f].join(",")}`);
  }
});
test("semua fitur yang terdeteksi ada di daftar fitur yang dikenal", () => {
  const f = sqlFeatures("with x as (select 1) select row_number() over (partition by a order by b) from x union all select 2");
  for (const k of f) assert.ok(KNOWN_FEATURES.has(k), k);
});
