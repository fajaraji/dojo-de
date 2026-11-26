// Uji P01: penilaian soal Python (py) dan soal laptop (paste), penjelasan error Python, dan pelacak fitur Python.
// Jalankan: node --test dojo/tools/tests/python.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { checkDrill, normalizeStdout } from "../../app/drills.js";
import { explainPyError } from "../../app/hints.js";
import { pyFeatures } from "../lib/py-features.mjs";

// runPy palsu: "menjalankan" kode dengan mencetak isi baris print('...') saja
const fakePy = async (code) => {
  if (code.includes("boom")) return { ok: false, stdout: "", error: { message: "NameError: name 'boom' is not defined" } };
  const out = [...code.matchAll(/print\('([^']*)'\)/g)].map(m => m[1]).join("\n");
  return { ok: true, stdout: out ? out + "\n" : "" };
};

test("soal py: keluaran sama dinyatakan benar, spasi di akhir baris diabaikan", async () => {
  const d = { kind: "py", solution: "print('12007')" };
  assert.equal((await checkDrill(null, d, "print('12007   ')", { runPy: fakePy })).ok, true);
  const salah = await checkDrill(null, d, "print('12006')", { runPy: fakePy });
  assert.equal(salah.ok, false);
  assert.match(salah.reason, /12006/);
});

test("soal py: error Python diteruskan", async () => {
  const r = await checkDrill(null, { kind: "py", solution: "print('a')" }, "boom", { runPy: fakePy });
  assert.equal(r.ok, false);
  assert.match(r.error.message, /NameError/);
});

test("soal py: kode check dijalankan sesudah jawaban", async () => {
  const d = { kind: "py", solution: "x = 1", check: "print('cek')" };
  assert.equal((await checkDrill(null, d, "x = 2", { runPy: fakePy })).ok, true);
});

test("normalizeStdout membuang spasi akhir baris dan baris kosong di akhir", () => {
  assert.equal(normalizeStdout("a  \nb\n\n"), "a\nb");
});

test("soal paste: cocok dengan pola, tidak peka huruf besar/kecil", async () => {
  const d = { kind: "paste", expect: "git version \\d+\\.\\d+" };
  assert.equal((await checkDrill(null, d, "Git Version 2.47.1.windows.1")).ok, true);
  const r = await checkDrill(null, d, "git: command not found");
  assert.equal(r.ok, false);
  assert.ok(r.reason.length > 10);
});

test("soal paste: tempelan kosong ditolak dengan pesan jelas", async () => {
  const r = await checkDrill(null, { kind: "paste", expect: "." }, "   ");
  assert.equal(r.ok, false);
  assert.match(r.reason, /tempel/i);
});

test("explainPyError menjelaskan error Python yang umum dalam bahasa Indonesia", () => {
  assert.match(explainPyError({ message: "NameError: name 'df' is not defined" }).isi, /belum dibuat|belum didefinisikan/);
  assert.match(explainPyError({ message: "IndentationError: unexpected indent" }).isi, /spasi|indentasi/i);
  assert.match(explainPyError({ message: "KeyError: 'statu'" }).isi, /kunci|kolom/);
  assert.match(explainPyError({ message: "ModuleNotFoundError: No module named 'requests'" }).isi, /pustaka|modul/);
  assert.match(explainPyError({ message: "ZeroDivisionError: division by zero" }).isi, /nol/);
  assert.ok(explainPyError({ message: "WeirdError: x" }).judul.length > 0);
});

test("pyFeatures mengenali kata kunci, fungsi bawaan, import, f-string, dan comprehension", () => {
  const f = pyFeatures("import pandas as pd\nfrom pathlib import Path\nfor x in range(3):\n    print(f'{x}')\ny = [a for a in xs if a]\n");
  for (const k of ["py:import pandas", "py:import pathlib", "py:for", "py:range()", "py:print()", "py:f-string", "py:comprehension", "py:if"]) assert.ok(f.has(k), k);
});

test("pyFeatures mengabaikan isi teks dan komentar", () => {
  const f = pyFeatures("s = 'for x in y: def'  # while True\nprint(s)\n");
  assert.ok(!f.has("py:for"));
  assert.ok(!f.has("py:def"));
  assert.ok(!f.has("py:while"));
  assert.ok(f.has("py:print()"));
});

test("pyFeatures: metode seperti df.sum() bukan fungsi bawaan sum()", () => {
  const f = pyFeatures("df.sum()\nlen(df)\n");
  assert.ok(!f.has("py:sum()"));
  assert.ok(f.has("py:len()"));
});
