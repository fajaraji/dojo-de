// Uji T03: petunjuk T-SQL → PostgreSQL dan penjelasan kode error PostgreSQL.
// Jalankan: node --test dojo/tools/tests/hints.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { tsqlHints, explainPgError } from "../../app/hints.js";

const joined = (sql) => tsqlHints(sql).join("\n");

test("TOP disarankan diganti LIMIT", () => assert.match(joined("SELECT TOP 5 * FROM app.orders"), /LIMIT/));
test("ISNULL disarankan diganti COALESCE", () => assert.match(joined("select isnull(phone, '-') from app.customers"), /COALESCE/));
test("GETDATE disarankan diganti CURRENT_DATE", () => assert.match(joined("select getdate()"), /CURRENT_DATE/));
test("[kolom] disarankan memakai tanda kutip ganda", () => assert.match(joined("select [order_id] from app.orders"), /"/));
test("+ untuk menggabung teks disarankan diganti ||", () => assert.match(joined("select 'a' + 'b'"), /\|\|/));
test("DATEADD disarankan diganti INTERVAL", () => assert.match(joined("select dateadd(day, 1, order_ts) from app.orders"), /INTERVAL/));
test("LEN disarankan diganti LENGTH", () => assert.match(joined("select len(full_name) from app.customers"), /LENGTH/));
test("IIF disarankan diganti CASE", () => assert.match(joined("select iif(qty > 1, 'banyak', 'satu') from app.order_items"), /CASE/));
test("query PostgreSQL biasa tidak diberi petunjuk T-SQL", () => assert.equal(tsqlHints("select order_id from app.orders where order_id = 5 limit 5").length, 0));
test("teks di dalam tanda kutip tidak dianggap T-SQL", () => assert.equal(tsqlHints("select 'top 5 isnull(' as catatan").length, 0));

test("42803 dijelaskan dengan GROUP BY", () => assert.match(explainPgError({ code: "42803", message: 'column "o.status" must appear in the GROUP BY clause or be used in an aggregate function' }, "").isi, /GROUP BY/));
test("42P01 mengingatkan nama skema app.", () => assert.match(explainPgError({ code: "42P01", message: 'relation "orders" does not exist' }, "select * from orders").isi, /app\./));
test("42703 membahas kolom", () => assert.match(explainPgError({ code: "42703", message: 'column "nama" does not exist' }, "").judul, /[Kk]olom/));
test("22012 menyarankan NULLIF", () => assert.match(explainPgError({ code: "22012", message: "division by zero" }, "").isi, /NULLIF/));
test("error sintaks karena TOP menyertakan saran LIMIT", () => assert.match(explainPgError({ code: "42601", message: 'syntax error at or near "5"' }, "SELECT TOP 5 * FROM app.orders").isi, /LIMIT/));
test("kolom + kolom bertipe teks disarankan memakai ||", () => {
  const r = explainPgError({ code: "42883", message: "operator does not exist: text + text" }, "select full_name + email from app.customers");
  assert.match(r.judul, /[Oo]perator/);
  assert.match(r.isi, /\|\|/);
});
test("komentar berisi tanda kutip tidak menyembunyikan petunjuk TOP", () => assert.match(joined("-- don't lupa\nselect top 5 * from app.orders"), /LIMIT/));
test("teks dengan kutip ganda dijelaskan pada error kolom tidak ditemukan", () => {
  const r = explainPgError({ code: "42703", message: 'column "Jawa" does not exist' }, 'select * from app.cities where island = "Jawa"');
  assert.match(r.isi, /kutip tunggal/);
});
test("kode yang tidak dikenal tetap memberi judul dan isi", () => {
  const r = explainPgError({ code: "XX999", message: "sesuatu" }, "");
  assert.ok(r.judul && r.isi);
});

// error yang sering muncul di bab 5–12
test("42P20: window function di WHERE dijelaskan dengan subquery atau CTE", () => {
  const r = explainPgError({ code: "42P20", message: "window functions are not allowed in WHERE" }, "");
  assert.match(r.judul, /window function/i);
  assert.match(r.isi, /subquery|CTE/);
});
test("42803 untuk agregasi di WHERE menyarankan HAVING, bukan GROUP BY", () => {
  const r = explainPgError({ code: "42803", message: "aggregate functions are not allowed in WHERE" }, "");
  assert.match(r.isi, /HAVING/);
  assert.doesNotMatch(r.judul, /harus ada di GROUP BY/);
});
test("42803 untuk agregasi bertumpuk dijelaskan", () => {
  const r = explainPgError({ code: "42803", message: "aggregate function calls cannot be nested" }, "");
  assert.match(r.isi, /bertumpuk|di dalam/);
});
test("42P07 tabel sudah ada", () => assert.match(explainPgError({ code: "42P07", message: 'relation "x" already exists' }, "").isi, /sudah ada/));
test("23514 CHECK dilanggar", () => assert.match(explainPgError({ code: "23514", message: 'new row for relation "x" violates check constraint "c"' }, "").isi, /CHECK/));
test("42804 tipe data tidak cocok", () => assert.match(explainPgError({ code: "42804", message: "UNION types integer and text cannot be matched" }, "").isi, /tipe/));
