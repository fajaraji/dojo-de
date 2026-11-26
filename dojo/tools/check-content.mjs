// Pemeriksa materi Dojo. Menjalankan semua contoh dan solusi di PostgreSQL (PGlite), lalu memeriksa
// urutan materi (tidak ada perintah/istilah sebelum diajarkan), kelengkapan soal, panjang teks, dan kata terlarang.
// Pemakaian: node dojo/tools/check-content.mjs [--dir <folder content>] [--lesson <id>]
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { sqlFeatures, KNOWN_FEATURES } from "./lib/sql-features.mjs";
import { compareResults } from "../app/checker.js";
import { TRACKED_TERMS } from "../content/terms.js";
import { PG_PARSERS } from "../app/pg-options.js";
import { PGlite } from "../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const arg = (name) => { const i = process.argv.indexOf(name); return i > 0 ? process.argv[i + 1] : null; };
const dir = path.resolve(arg("--dir") || path.join(here, "../content"));
const only = arg("--lesson");

const { LESSON_ORDER, PREREQ = {} } = await import(pathToFileURL(path.join(dir, "index.js")).href);
const lessons = [];
for (const id of LESSON_ORDER) {
  const file = path.join(dir, id + ".js");
  if (!fs.existsSync(file)) { lessons.push({ id, missing: true }); continue; }
  lessons.push((await import(pathToFileURL(file).href)).default);
}

const problems = [], drafts = [];
const report = (id, msg) => problems.push(`${id}: ${msg}`);
const stripHtml = (h) => String(h || "").replace(/<pre[\s\S]*?<\/pre>/g, " ").replace(/<[^>]+>/g, " ").replace(/&[a-z]+;/g, " ");
const BANNED = [/\bcaveat\b/i, /\bmenyempit\b/i, /\bworth noting\b/i];
const MIN_WORDS = 700, MAX_WORDS = 2000;

// di bab mana setiap fitur SQL dan istilah diajarkan
const taughtAt = new Map(), definedAt = new Map();
lessons.forEach((L, i) => {
  if (L.missing) return;
  for (const f of L.introduces || []) if (!taughtAt.has(f)) taughtAt.set(f, i);
  for (const t of L.terms || []) if (!definedAt.has(t.term.toLowerCase())) definedAt.set(t.term.toLowerCase(), i);
});

// mesin PostgreSQL dengan data TokoKita
const dbFile = path.join(here, "../data/tokokita-db.tgz");
const db = await PGlite.create({ loadDataDir: new Blob([fs.readFileSync(dbFile)]), parsers: PG_PARSERS });
async function runTx(setup, sql) {
  await db.exec("begin");
  try {
    if (setup) await db.exec(setup);
    const res = await db.exec(sql, { rowMode: "array" });
    const shaped = res.map(r => ({ columns: (r.fields || []).map(f => ({ name: f.name, typeId: f.dataTypeID })), rows: r.rows || [] }));
    return { ok: true, last: [...shaped].reverse().find(r => r.columns.length) || null };
  } catch (e) {
    return { ok: false, error: e.message };
  } finally {
    try { await db.exec("rollback"); } catch { /* sudah selesai */ }
  }
}

for (let i = 0; i < lessons.length; i++) {
  const L = lessons[i];
  if (only && L.id !== only) continue;
  if (L.missing) { report(L.id, `berkas ${L.id}.js belum ada`); continue; }
  // bab kerangka (draft) hanya diperiksa kalau diminta langsung dengan --lesson
  if (L.draft && !only) { drafts.push(L.id); continue; }

  // fitur SQL yang boleh dipakai: bab-bab sampai prasyarat, ditambah bab ini sendiri
  const base = PREREQ[L.id] ? LESSON_ORDER.indexOf(PREREQ[L.id]) : i - 1;
  const allowed = new Set(L.introduces || []);
  for (let j = 0; j <= base; j++) for (const f of lessons[j].introduces || []) allowed.add(f);
  for (const f of L.introduces || []) if (!KNOWN_FEATURES.has(f)) report(L.id, `daftar introduces berisi "${f}" yang tidak dikenal pemeriksa`);

  const codes = [];
  for (const s of L.sections || []) for (const ex of s.examples || []) codes.push(ex.sql);
  for (const d of L.drills || []) codes.push(d.start, d.solution, d.answerSql);
  const flagged = new Set();
  for (const code of codes.filter(Boolean)) {
    for (const f of sqlFeatures(code)) {
      if (allowed.has(f) || flagged.has(f)) continue;
      flagged.add(f);
      const at = taughtAt.get(f);
      report(L.id, `${f} dipakai sebelum diajarkan (${at === undefined ? "belum diajarkan di bab mana pun" : "diajarkan di " + lessons[at].id})`);
    }
  }

  // istilah yang dilacak tidak boleh muncul sebelum bab yang menjelaskannya
  const text = [L.title, ...(L.goals || []), ...(L.summary || []), ...(L.sections || []).flatMap(s => [s.title, stripHtml(s.html), ...(s.examples || []).map(e => e.note)]),
    ...(L.drills || []).flatMap(d => [stripHtml(d.prompt), d.hint, d.why, d.model, ...(d.options || [])]),
    ...(L.tsql || []).map(t => stripHtml(t.note)), ...(L.terms || []).map(t => stripHtml(t.def))].filter(Boolean).join("\n");
  for (const t of TRACKED_TERMS) {
    if (!t.pattern.test(text)) continue;
    const at = definedAt.get(t.id);
    if (at === undefined) report(L.id, `istilah "${t.id}" dipakai tapi belum dijelaskan di bab mana pun`);
    else if (at > i) report(L.id, `istilah "${t.id}" dipakai sebelum dijelaskan (dijelaskan di ${lessons[at].id})`);
  }

  // panjang penjelasan dan kata terlarang
  const words = (L.sections || []).map(s => stripHtml(s.html)).join(" ").split(/\s+/).filter(Boolean).length;
  if (words < MIN_WORDS || words > MAX_WORDS) report(L.id, `teks penjelasan ${words} kata (harus ${MIN_WORDS}–${MAX_WORDS})`);
  for (const re of BANNED) if (re.test(text)) report(L.id, `memakai kata terlarang ${re.source.replace(/\\b/g, "")}`);

  // contoh harus jalan dan menghasilkan tabel
  for (const s of L.sections || []) for (const ex of s.examples || []) {
    const r = await runTx(ex.setup, ex.sql);
    if (!r.ok) report(L.id, `contoh di "${s.title}" gagal: ${r.error}`);
    else if (!ex.expectEmpty && (!r.last || !r.last.rows.length)) report(L.id, `contoh di "${s.title}" tidak menghasilkan baris`);
  }

  // soal
  const ids = new Set();
  for (const d of L.drills || []) {
    const tag = `${L.id} soal ${d.id}`;
    if (ids.has(d.id)) report(tag, "id soal dobel");
    ids.add(d.id);
    if (!d.hint) report(tag, "tidak punya hint");
    if (!d.why && !d.model) report(tag, "tidak punya penjelasan (why atau model)");
    if (["sql", "fix", "build"].includes(d.kind)) {
      if (!d.solution) { report(tag, "tidak punya solution"); continue; }
      const sol = await runTx(d.setup, d.kind === "build" ? `${d.solution}\n;\n${d.verify || ""}` : d.solution);
      if (!sol.ok) { report(tag, `solusi gagal: ${sol.error}`); continue; }
      if (!d.expectEmpty && (!sol.last || !sol.last.rows.length)) report(tag, "solusi tidak menghasilkan baris");
      if (d.kind === "build" && !d.verify) report(tag, "soal build tidak punya verify");
      if (d.kind === "fix") {
        if (!d.start) report(tag, "soal fix tidak punya query awal");
        else {
          const st = await runTx(d.setup, d.start);
          if (st.ok && st.last && compareResults(st.last, sol.last, { ordered: !!d.ordered }).ok) report(tag, "query awal soal fix sudah memberi hasil yang benar");
        }
      }
    } else if (d.kind === "number") {
      const r = await runTx(d.setup, d.answerSql || "");
      if (!r.ok) report(tag, `answerSql gagal: ${r.error}`);
      else if (!r.last || r.last.rows.length !== 1 || r.last.columns.length !== 1 || !Number.isFinite(Number(r.last.rows[0][0]))) report(tag, "answerSql harus menghasilkan tepat satu angka");
    } else if (d.kind === "choice") {
      if (!Array.isArray(d.options) || d.options.length < 2 || !(d.answer >= 0 && d.answer < d.options.length)) report(tag, "pilihan atau kunci jawaban tidak valid");
    } else if (d.kind === "explain") {
      if (!d.model) report(tag, "soal explain tidak punya jawaban contoh (model)");
    } else report(tag, `jenis soal "${d.kind}" tidak dikenal`);
  }
}
await db.close();

const checked = lessons.filter(L => (!only || L.id === only) && !(L.draft && !only)).length;
for (const p of problems) console.log(p);
if (drafts.length) console.log(`Masih kerangka (tidak tampil, tidak diperiksa): ${drafts.join(", ")}`);
console.log(problems.length ? `\n${problems.length} masalah di ${checked} bab.` : `Semua ${checked} bab lulus pemeriksaan.`);
process.exit(problems.length ? 1 : 0);
