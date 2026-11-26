// Uji perbaikan tinjauan R1: pemindai SQL bersama (teks berkutip, komentar, dollar quote, perintah transaksi).
// Jalankan: node --test dojo/tools/tests/sql-lex.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { stripSql, transactionCommands } from "../../app/sql-lex.js";

test("END sebagai perintah terdeteksi", () => assert.deepEqual(transactionCommands("delete from app.payments; end; select 1"), ["END"]));
test("COMMIT setelah komentar yang berisi tanda kutip tetap terdeteksi", () => assert.deepEqual(transactionCommands("-- don't\ncommit"), ["COMMIT"]));
test("END penutup CASE bukan perintah transaksi", () => assert.deepEqual(transactionCommands("select case when 1 = 1 then 'a' else 'b' end as x from app.cities"), []));
test("kata commit di dalam teks diabaikan", () => assert.deepEqual(transactionCommands("select 'commit' as t; select $$rollback$$ as u"), []));
test("BEGIN, ROLLBACK, START TRANSACTION, ABORT, SAVEPOINT terdeteksi", () =>
  assert.deepEqual(transactionCommands("begin; rollback; start transaction; abort; savepoint s; release s"), ["BEGIN", "ROLLBACK", "START", "ABORT", "SAVEPOINT", "RELEASE"]));
test("stripSql membuang komentar dan isi teks dalam satu kali baca", () => {
  const s = stripSql("select 'a -- b' as x -- komentar 'x\n/* blok */ from t");
  assert.ok(!s.includes("komentar") && !s.includes("blok") && !s.includes("a -- b"));
  assert.match(s, /select\s+''\s+as x/);
  assert.match(s, /from t/);
});
test("nama berkutip ganda dibiarkan", () => assert.match(stripSql('select "Jawa" from t'), /"Jawa"/));
