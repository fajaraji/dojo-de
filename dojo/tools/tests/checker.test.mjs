// Uji T03: membandingkan hasil query pengguna dengan hasil yang diharapkan.
// Jalankan: node --test dojo/tools/tests/checker.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { normalizeValue, compareResults } from "../../app/checker.js";

const INT = 23, NUMERIC = 1700, TEXT = 25, DATE = 1082, TIMESTAMP = 1114, BOOL = 16;
const res = (cols, rows) => ({ columns: cols.map(([name, typeId]) => ({ name, typeId })), rows });

test("urutan baris diabaikan kecuali ordered", () => {
  const exp = res([["id", INT]], [[1], [2], [3]]);
  const usr = res([["id", INT]], [[3], [1], [2]]);
  assert.equal(compareResults(usr, exp).ok, true);
  const r = compareResults(usr, exp, { ordered: true });
  assert.equal(r.ok, false);
  assert.match(r.reason, /urutan/i);
});

test("nama kolom boleh beda, jumlah kolom harus sama", () => {
  const exp = res([["total", INT], ["bln", TEXT]], [[5, "a"]]);
  assert.equal(compareResults(res([["jumlah", INT], ["bulan", TEXT]], [[5, "a"]]), exp).ok, true);
  const r = compareResults(res([["jumlah", INT]], [[5]]), exp);
  assert.equal(r.ok, false);
  assert.match(r.reason, /2 kolom/);
});

test("jumlah baris berbeda dijelaskan", () => {
  const r = compareResults(res([["id", INT]], [[1], [1]]), res([["id", INT]], [[1]]));
  assert.equal(r.ok, false);
  assert.match(r.reason, /baris/);
});

test("numeric '1.50' sama dengan 1.5", () => {
  assert.equal(normalizeValue("1.50", NUMERIC), normalizeValue(1.5, NUMERIC));
  assert.equal(compareResults(res([["x", NUMERIC]], [["1.50"]]), res([["x", NUMERIC]], [[1.5]])).ok, true);
});

test("Date 2025-03-01 sama dengan teks '2025-03-01'", () => {
  assert.equal(normalizeValue(new Date(Date.UTC(2025, 2, 1)), DATE), "2025-03-01");
  assert.equal(compareResults(res([["d", DATE]], [[new Date(Date.UTC(2025, 2, 1))]]), res([["d", TEXT]], [["2025-03-01"]])).ok, true);
});

test("timestamp dinormalkan ke YYYY-MM-DD HH:MM:SS", () => {
  assert.equal(normalizeValue(new Date(Date.UTC(2025, 9, 31, 15, 57, 41)), TIMESTAMP), "2025-10-31 15:57:41");
});

test("timestamp tengah malam sama dengan date (hasil DATE_TRUNC)", () => {
  assert.equal(normalizeValue(new Date(Date.UTC(2025, 2, 1)), TIMESTAMP), "2025-03-01");
});

test("kolom yang nilainya berbeda disebut namanya", () => {
  const exp = res([["id", INT], ["total", INT]], [[1, 10], [2, 20]]);
  const r = compareResults(res([["id", INT], ["total", INT]], [[1, 10], [2, 99]]), exp);
  assert.equal(r.ok, false);
  assert.match(r.reason, /total/);
});

test("boolean dinormalkan ke true/false", () => {
  assert.equal(normalizeValue(true, BOOL), "true");
  assert.equal(normalizeValue(false, BOOL), "false");
});

test("NULL hanya sama dengan NULL", () => {
  assert.equal(compareResults(res([["x", TEXT]], [[null]]), res([["x", TEXT]], [[null]])).ok, true);
  assert.equal(compareResults(res([["x", TEXT]], [[""]]), res([["x", TEXT]], [[null]])).ok, false);
  assert.equal(compareResults(res([["x", INT]], [[0]]), res([["x", INT]], [[null]])).ok, false);
});
