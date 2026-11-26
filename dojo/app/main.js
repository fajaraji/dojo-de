// Halaman utama: rute, navigasi, bab, soal, kamus data, ruang coba SQL, dan uji mandiri.
import { createEngine } from "./engine.js";
import { selfTest } from "./selftest.js";
import { SCHEMA_DOC } from "../data/tokokita.js";
import { loadLessons } from "../content/index.js";
import { load, save } from "./store.js";
import { explainPgError } from "./hints.js";
import { checkDrill } from "./drills.js";
import { lessonHtml } from "./lesson.js";

const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const statusEl = $("status");
const engine = createEngine({
  base: new URL("../vendor/pglite-0.5.16/", import.meta.url).href,
  dbUrl: new URL("../data/tokokita-db.tgz", import.meta.url).href,
  onStatus: (text, bad) => { statusEl.textContent = text; statusEl.classList.toggle("bad", !!bad); },
});
engine.ready().catch(() => {});

const state = { progress: load("progress", {}), tries: load("tries", {}), drafts: load("drafts", {}), exam: load("exam", {}) };
let lessons = [];
let current = "mulai";
let draftTimer = null;
let examTimer = null;

/* ---------- penghitung waktu bab ujian ---------- */
function tickExam() {
  const clock = $("exam-clock");
  const L = lessons.find(x => x.id === current);
  if (!clock || !L || !L.exam) { clearInterval(examTimer); examTimer = null; return; }
  const total = L.exam.minutes * 60, start = state.exam[L.id];
  const left = start ? Math.max(0, total - Math.floor((Date.now() - start) / 1000)) : total;
  const mm = Math.floor(left / 60), ss = String(left % 60).padStart(2, "0");
  clock.textContent = start && left === 0 ? "Waktu habis" : `${mm}:${ss}`;
  clock.classList.toggle("over", !!start && left === 0);
}
function startExamClock() {
  clearInterval(examTimer);
  tickExam();
  examTimer = setInterval(tickExam, 1000);
}

/* ---------- tampilan hasil query ---------- */
const DATE = 1082;
const NUMERIC_TYPES = new Set([20, 21, 23, 700, 701, 1700]);
function cell(v, typeId) {
  if (v === null || v === undefined) return { text: "NULL", cls: "null" };
  if (v instanceof Date) { const iso = v.toISOString(); return { text: typeId === DATE ? iso.slice(0, 10) : iso.slice(0, 19).replace("T", " "), cls: "" }; }
  if (typeof v === "boolean") return { text: v ? "true" : "false", cls: "" };
  return { text: String(v), cls: NUMERIC_TYPES.has(typeId) ? "num" : "" };
}
function resultHtml(result, max = 200) {
  if (!result || !result.columns || !result.columns.length) return '<p class="meta">Perintah berhasil dijalankan dan tidak mengembalikan tabel.</p>';
  const rows = result.rows.slice(0, max);
  return `<p class="meta">${result.rows.length.toLocaleString("id-ID")} baris${result.rows.length > max ? ` (ditampilkan ${max} pertama)` : ""}</p>
<div class="tw"><table class="t"><tr>${result.columns.map(c => `<th>${esc(c.name)}</th>`).join("")}</tr>
${rows.map(r => `<tr>${r.map((v, i) => { const c = cell(v, result.columns[i].typeId); return `<td class="${c.cls}">${esc(c.text)}</td>`; }).join("")}</tr>`).join("")}</table></div>`;
}
function errorHtml(r, sql) {
  if (r.timedOut) return `<div class="fb bad"><b>Query dihentikan.</b> ${esc(r.error.message)}</div>`;
  const ex = explainPgError(r.error, sql);
  return `<div class="fb bad"><b>${esc(ex.judul)}.</b> ${esc(ex.isi).replace(/\n/g, "<br>")}<br><span class="kbd">Pesan asli PostgreSQL: ${esc(r.error.message)}</span></div>`;
}
const lastTable = (r) => [...r.results].reverse().find(x => x.columns && x.columns.length) || r.results[r.results.length - 1];

async function runInto(key, sql, setup = "") {
  const fb = $("fb-" + key), out = $("out-" + key);
  fb.innerHTML = '<div class="fb info">Menjalankan…</div>'; out.innerHTML = "";
  const r = await engine.run(sql, { setup });
  if (!r.ok) { fb.innerHTML = errorHtml(r, sql); return r; }
  fb.innerHTML = `<p class="meta">Selesai dalam ${r.ms} ms.</p>`;
  out.innerHTML = resultHtml(lastTable(r));
  return r;
}

/* ---------- progres ---------- */
const allDrills = () => lessons.flatMap(L => L.drills.map(d => ({ ...d, lesson: L })));
const findDrill = (id) => allDrills().find(d => d.id === id);
function updateMeter() {
  const all = allDrills(), done = all.filter(d => state.progress[d.id]).length;
  $("pbar").style.width = all.length ? (100 * done / all.length) + "%" : "0";
  $("ptext").textContent = `${done} dari ${all.length} latihan`;
}
function markDone(id) {
  if (!state.progress[id]) { state.progress[id] = true; save("progress", state.progress); updateMeter(); renderRail(); }
  const box = $("d-" + id);
  if (box && !box.classList.contains("done")) { box.classList.add("done"); box.querySelector(".dh").insertAdjacentHTML("beforeend", '<span class="tag ok">Selesai</span>'); }
  document.querySelectorAll(`[data-act="sol"][data-id="${id}"], [data-act="hint"][data-id="${id}"]`).forEach(b => { b.disabled = false; });
}
function bumpTry(id) {
  state.tries[id] = (state.tries[id] || 0) + 1; save("tries", state.tries);
  if (state.tries[id] >= 2) document.querySelectorAll(`[data-act="sol"][data-id="${id}"], [data-act="hint"][data-id="${id}"]`).forEach(b => { b.disabled = false; });
}
const fbSet = (id, cls, html) => { const el = $("fb-" + id); if (el) el.innerHTML = `<div class="fb ${cls}">${html}</div>`; };

/* ---------- navigasi ---------- */
function renderRail() {
  let html = `<a href="#mulai" class="${current === "mulai" ? "on" : ""}"><span class="n">⌂</span>Mulai di sini</a>`;
  let grp = "";
  lessons.forEach((L, i) => {
    const g = { sql: "Bagian 1 · SQL", model: "Bagian 2 · Data Modeling", capstone: "Capstone" }[L.part] || L.part;
    if (g !== grp) { grp = g; html += `<div class="grp">${esc(g)}</div>`; }
    const n = L.drills.length, d = L.drills.filter(x => state.progress[x.id]).length;
    html += `<a href="#${L.id}" class="${current === L.id ? "on" : ""}"><span class="n">${String(i + 1).padStart(2, "0")}</span>${esc(L.title)}<span class="ck">${d}/${n}</span></a>`;
  });
  html += `<div class="grp">Alat</div>
<a href="#kamus" class="${current === "kamus" ? "on" : ""}"><span class="n">▤</span>Kamus data TokoKita</a>
<a href="#coba" class="${current === "coba" ? "on" : ""}"><span class="n">▷</span>Ruang coba SQL</a>
<a href="#uji" class="${current === "uji" ? "on" : ""}"><span class="n">✓</span>Uji mesin</a>`;
  $("rail").innerHTML = html;
  const sel = $("mobsel");
  sel.innerHTML = `<option value="mulai">Mulai di sini</option>` + lessons.map((L, i) => `<option value="${L.id}">${i + 1}. ${esc(L.title)}</option>`).join("") +
    `<option value="kamus">Kamus data TokoKita</option><option value="coba">Ruang coba SQL</option><option value="uji">Uji mesin</option>`;
  sel.value = current;
}

/* ---------- halaman ---------- */
function pageHome() {
  return `<div class="eyebrow">Selamat datang</div>
<h1>Dojo Data Engineer</h1>
<p class="lede">Kursus berbahasa Indonesia untuk menjadi data engineer, mulai dari nol. Setiap query di sini dijalankan oleh PostgreSQL sungguhan di browsermu, dan setiap bab membahas padanannya di SQL Server.</p>
<div class="callout"><b class="lab">Cara belajar</b><ol>
<li>Baca penjelasan dan jalankan setiap contoh. Perhatikan hasilnya sebelum lanjut.</li>
<li>Kerjakan latihan berurutan. Tombol solusi baru aktif setelah dua kali cek; kalau membukanya, ketik ulang jawabannya dari ingatan.</li>
<li>Kerjakan soal "Jelaskan". Kalau kamu belum bisa menjelaskan dengan kalimat sendiri, berarti belum paham.</li>
<li>Progres tersimpan di browser ini saja.</li></ol></div>
${lessons.length ? `<p>Mulai dari <a href="#${lessons[0].id}">Bab 1: ${esc(lessons[0].title)}</a>.</p>` : `<div class="callout"><b class="lab">Status</b>Bab materi sedang ditulis. Sementara itu kamu bisa melihat data latihan di Kamus data TokoKita dan mencoba query di Ruang coba SQL.</div>`}`;
}

function pageDictionary() {
  return `<div class="eyebrow">Alat</div><h1>Kamus data TokoKita</h1>
<p class="lede">TokoKita adalah toko online fiktif. Skema <code>app</code> berisi tabel aplikasi toko; skema <code>raw</code> berisi data mentah dari berkas dan sistem lain. Klik nama tabel untuk melihat arti setiap kolom dan 5 baris contoh.</p>
${SCHEMA_DOC.map(d => `<details class="tbl" data-table="${d.table}"><summary>${d.table}</summary>
<p>${esc(d.description)}</p><p><b>Satu baris mewakili:</b> ${esc(d.grain.replace(/^1 baris = /, ""))}</p>
<div class="tw"><table class="t"><tr><th>Kolom</th><th>Tipe</th><th>Arti</th></tr>${d.columns.map(c => `<tr><td><code>${c.name}</code></td><td class="kbd">${c.type}</td><td>${esc(c.description)}</td></tr>`).join("")}</table></div>
<div class="out" data-sample></div></details>`).join("")}`;
}

function pagePlayground() {
  return `<div class="eyebrow">Alat</div><h1>Ruang coba SQL</h1>
<p class="lede">Tulis query apa saja di sini. Perubahan data (INSERT, UPDATE, DELETE) dibatalkan otomatis setelah query selesai, jadi data latihan selalu kembali seperti semula.</p>
<div class="box"><label class="kbd" for="ed-coba">Editor (Ctrl+Enter untuk menjalankan)</label>
<textarea class="ed" id="ed-coba" data-run="coba" data-draft="coba" spellcheck="false">${esc(state.drafts.coba ?? "select order_id, customer_id, order_ts, status\nfrom app.orders\nlimit 10;")}</textarea>
<div class="row"><button class="pri" data-act="run" data-target="coba">Jalankan</button></div>
<div id="fb-coba"></div><div class="out" id="out-coba"></div></div>`;
}

function pageSelfTest() {
  return `<div class="eyebrow">Alat</div><h1>Uji mesin</h1>
<p class="lede">Halaman ini memeriksa apakah PostgreSQL berjalan dengan benar di browser ini. Tunggu sampai kelima cek selesai.</p>
<ol class="tests" id="tests"><li>Menjalankan uji…</li></ol>`;
}
async function runSelfTest() {
  const res = await selfTest(engine);
  const el = $("tests");
  if (!el) return;
  el.innerHTML = res.map(r => `<li><span class="${r.ok ? "ok" : "bad"}">${r.ok ? "LULUS" : "GAGAL"}</span> ${esc(r.name)} <span class="kbd">(${esc(r.detail)})</span></li>`).join("");
  el.dataset.done = res.every(r => r.ok) ? "lulus" : "gagal";
}

function show(id) {
  current = id || "mulai";
  const main = $("main");
  const i = lessons.findIndex(L => L.id === current);
  if (i >= 0) { main.innerHTML = lessonHtml(lessons[i], i, lessons.length, lessons[i - 1], lessons[i + 1], state); if (lessons[i].exam) startExamClock(); }
  else if (current === "kamus") main.innerHTML = pageDictionary();
  else if (current === "coba") main.innerHTML = pagePlayground();
  else if (current === "uji") { main.innerHTML = pageSelfTest(); runSelfTest(); }
  else { current = "mulai"; main.innerHTML = pageHome(); }
  renderRail();
  window.scrollTo(0, 0);
}

/* ---------- aksi ---------- */
async function onCheck(d) {
  bumpTry(d.id);
  fbSet(d.id, "info", "Memeriksa…");
  let answer;
  if (d.kind === "number") answer = $("num-" + d.id).value;
  else answer = $("ed-" + d.id).value;
  const r = await checkDrill(engine.run, d, answer);
  if (r.ok) { fbSet(d.id, "good", `<b>Benar.</b> ${d.why || ""}`); markDone(d.id); return; }
  if (r.error) { $("fb-" + d.id).innerHTML = errorHtml({ ok: false, error: r.error, timedOut: r.timedOut }, answer); return; }
  fbSet(d.id, "bad", `<b>Belum tepat.</b> ${esc(r.reason)}${(state.tries[d.id] || 0) >= 2 ? " Tombol solusi sekarang aktif." : ""}`);
}

document.addEventListener("click", async (e) => {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const act = b.dataset.act, id = b.dataset.id;
  if (act === "run") {
    const t = b.dataset.target, d = findDrill(t);
    runInto(t, $("ed-" + t).value, d && d.setup || "");
  } else if (act === "ex") {
    const [, si, ei] = b.dataset.key.split("-").map(Number);
    const L = lessons.find(x => x.id === current);
    const ex = L.sections[si].examples[ei];
    runInto(b.dataset.key, ex.sql, ex.setup || "");
  } else if (act === "exam-start") {
    if (!state.exam[id]) { state.exam[id] = Date.now(); save("exam", state.exam); }
    startExamClock();
  } else if (act === "exam-reset") {
    delete state.exam[id]; save("exam", state.exam);
    startExamClock();
  } else if (act === "check") {
    onCheck(findDrill(id));
  } else if (act === "hint") {
    fbSet(id, "info", `<b>Petunjuk:</b> ${findDrill(id).hint}`);
  } else if (act === "sol") {
    const d = findDrill(id);
    const body = d.kind === "number" ? d.answerSql : d.solution;
    fbSet(id, "info", `<b>Salah satu jawaban yang benar:</b><pre class="sql"><code>${esc(body)}</code></pre>${d.why || ""}<br>Tutup, lalu ketik ulang jawabanmu sendiri tanpa melihat.`);
  } else if (act === "reset") {
    const d = findDrill(id); const ed = $("ed-" + id); ed.value = d.start || ""; delete state.drafts[id]; save("drafts", state.drafts);
  } else if (act === "choice") {
    const d = findDrill(id), i = Number(b.dataset.i);
    b.parentElement.querySelectorAll(".opt").forEach(o => o.classList.remove("right", "wrong"));
    if (i === d.answer) { b.classList.add("right"); fbSet(id, "good", `<b>Benar.</b> ${d.why}`); markDone(id); }
    else { b.classList.add("wrong"); bumpTry(id); fbSet(id, "bad", "<b>Belum tepat.</b> Baca lagi pertanyaannya, lalu pilih jawaban lain."); }
  } else if (act === "explain") {
    const d = findDrill(id), text = ($("note-" + id).value || "").trim();
    if (text.split(/\s+/).length < 8) { fbSet(id, "bad", "Tulis jawabanmu dulu, minimal satu atau dua kalimat. Membandingkan setelah menulis jauh lebih bermanfaat daripada langsung membaca contoh."); return; }
    fbSet(id, "info", `<b>Jawaban contoh:</b><br>${d.model}<br><br>Bandingkan: apa yang sudah kamu sebut, apa yang terlewat? Perbaiki jawabanmu di kotak di atas.`);
    markDone(id);
  }
});
document.addEventListener("keydown", (e) => {
  const t = e.target;
  if (!t.matches || !t.matches("textarea.ed")) return;
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") { e.preventDefault(); const d = findDrill(t.dataset.run); runInto(t.dataset.run, t.value, d && d.setup || ""); }
  else if (e.key === "Tab" && !e.shiftKey) { e.preventDefault(); t.setRangeText("  ", t.selectionStart, t.selectionEnd, "end"); }
});
document.addEventListener("input", (e) => {
  const key = e.target.dataset && e.target.dataset.draft;
  if (!key) return;
  state.drafts[key] = e.target.value;
  clearTimeout(draftTimer); draftTimer = setTimeout(() => save("drafts", state.drafts), 400);
});
document.addEventListener("toggle", async (e) => {
  const d = e.target;
  if (!d.matches || !d.matches("details.tbl") || !d.open) return;
  const box = d.querySelector("[data-sample]");
  if (box.dataset.loaded) return;
  box.dataset.loaded = "1";
  box.innerHTML = '<p class="meta">Mengambil 5 baris contoh…</p>';
  const r = await engine.run(`select * from ${d.dataset.table} limit 5`);
  box.innerHTML = r.ok ? resultHtml(lastTable(r)) : errorHtml(r, "");
}, true);
$("mobsel").addEventListener("change", (e) => { location.hash = e.target.value; });
window.addEventListener("hashchange", () => show(location.hash.slice(1)));

lessons = await loadLessons();
updateMeter();
show(location.hash.slice(1));
