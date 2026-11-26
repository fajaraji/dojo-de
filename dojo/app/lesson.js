// Membuat HTML satu bab: tujuan, istilah, penjelasan + contoh, padanan SQL Server, ringkasan, dan soal.
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const PART = { sql: "Bagian 1 · SQL", model: "Bagian 2 · Data Modeling & Warehouse", capstone: "Capstone", tools: "Bagian 3 · Alat kerja engineer",
  python: "Bagian 4 · Python", pipeline: "Bagian 5 · Pipeline & orkestrasi", cloud: "Bagian 6 · Cloud & big data", advanced: "Bagian 7 · Topik lanjutan", career: "Bagian 8 · Karier" };
const KIND = { sql: "Tulis SQL", fix: "Perbaiki query", build: "Bangun tabel", number: "Hitung angka", choice: "Pilihan ganda", explain: "Jelaskan", py: "Tulis Python", paste: "Jalankan di laptop" };

function exampleHtml(ex, key) {
  // contoh shell: perintah untuk dijalankan di laptop, hanya ditampilkan dengan tombol salin
  if (ex.lang === "shell") return `<div class="box ex"><pre class="sh"><code>${esc(ex.code)}</code></pre>
<div class="row"><button data-act="copy" data-key="${key}">Salin perintah</button><span class="kbd">Jalankan di terminal laptopmu (PowerShell).</span></div>
${ex.note ? `<p class="note">${ex.note}</p>` : ""}<div id="fb-${key}"></div></div>`;
  const py = ex.lang === "py";
  return `<div class="box ex"><pre class="${py ? "py" : "sql"}"><code>${esc(py ? ex.code : ex.sql)}</code></pre>
<div class="row"><button data-act="ex" data-key="${key}">Jalankan contoh</button></div>
${ex.note ? `<p class="note">${ex.note}</p>` : ""}<div id="fb-${key}"></div><div class="out" id="out-${key}"></div></div>`;
}

function drillHtml(d, n, state, exam) {
  const done = state.progress[d.id];
  const tries = state.tries[d.id] || 0;
  // di bab ujian, petunjuk baru aktif setelah 2 kali cek (seperti tombol solusi)
  // soal "explain" tidak punya tombol cek, jadi petunjuknya tidak dikunci
  const hintBtn = exam && d.kind !== "explain"
    ? `<button data-act="hint" data-id="${d.id}" ${done || tries >= 2 ? "" : "disabled"} title="Aktif setelah 2 kali cek">Petunjuk</button>`
    : `<button data-act="hint" data-id="${d.id}">Petunjuk</button>`;
  const head = `<div class="dh"><span class="tag">${n}. ${KIND[d.kind] || d.kind}</span>${d.level === "wawancara" ? '<span class="tag hot">Level wawancara</span>' : ""}${done ? '<span class="tag ok">Selesai</span>' : ""}</div>
<div class="dq">${d.prompt}</div>`;
  let body = "";
  if (d.kind === "paste") {
    body = `<div class="kbd">Jalankan perintah ini di terminal laptopmu (PowerShell):</div>
<pre class="sh"><code>${esc(d.command)}</code></pre>
<div class="row"><button data-act="copy-cmd" data-id="${d.id}">Salin perintah</button></div>
<label class="kbd" for="paste-${d.id}">Tempel seluruh keluaran perintahnya di sini</label>
<textarea class="note" id="paste-${d.id}" data-draft="${d.id}" spellcheck="false">${esc(state.drafts[d.id] || "")}</textarea>
<div class="row"><button class="pri" data-act="check" data-id="${d.id}">Cek</button>${hintBtn}
<button data-act="sol" data-id="${d.id}" ${done || tries >= 2 ? "" : "disabled"} title="Aktif setelah 2 kali cek">Lihat contoh keluaran</button></div>`;
  } else if (["sql", "fix", "build", "py"].includes(d.kind)) {
    const value = state.drafts[d.id] ?? d.start ?? "";
    body = `<label class="kbd" for="ed-${d.id}">Editor (Ctrl+Enter untuk menjalankan)</label>
<textarea class="ed${d.kind === "py" ? " py" : ""}" id="ed-${d.id}" data-run="${d.id}" data-draft="${d.id}" spellcheck="false">${esc(value)}</textarea>
<div class="row"><button class="pri" data-act="check" data-id="${d.id}">Cek jawaban</button><button data-act="run" data-target="${d.id}">Jalankan saja</button>
${hintBtn}<button data-act="sol" data-id="${d.id}" ${done || tries >= 2 ? "" : "disabled"} title="Aktif setelah 2 kali cek">Lihat solusi</button>
${d.start ? `<button data-act="reset" data-id="${d.id}">Kembalikan kode awal</button>` : ""}</div>`;
  } else if (d.kind === "number") {
    body = `<div class="row"><label class="kbd" for="num-${d.id}">Jawabanmu</label><input class="numin" id="num-${d.id}" inputmode="decimal" placeholder="contoh: 1250">
<button class="pri" data-act="check" data-id="${d.id}">Cek</button>${hintBtn}
<button data-act="sol" data-id="${d.id}" ${done || tries >= 2 ? "" : "disabled"} title="Aktif setelah 2 kali cek">Lihat cara</button></div>
<p class="kbd">${d.answerPy ? "Hitung dengan Python di Ruang coba Python" : "Hitung dengan query di Ruang coba SQL"}, lalu tulis angkanya di sini.</p>`;
  } else if (d.kind === "choice") {
    body = `<div class="opts">${d.options.map((o, i) => `<button class="opt" data-act="choice" data-id="${d.id}" data-i="${i}">${String.fromCharCode(65 + i)}. ${o}</button>`).join("")}</div>`;
  } else if (d.kind === "explain") {
    body = `<label class="kbd" for="note-${d.id}">Tulis jawabanmu dulu (tersimpan di browser ini)</label>
<textarea class="note" id="note-${d.id}" data-draft="${d.id}">${esc(state.drafts[d.id] || "")}</textarea>
<div class="row"><button class="pri" data-act="explain" data-id="${d.id}">Bandingkan dengan jawaban contoh</button>${hintBtn}</div>`;
  }
  return `<section class="box drill${done ? " done" : ""}" id="d-${d.id}">${head}${body}<div id="fb-${d.id}"></div><div class="out" id="out-${d.id}"></div></section>`;
}

// Penghitung waktu bab ujian (L.exam = { minutes }). Jam diperbarui oleh main.js.
function examHtml(L) {
  return `<div class="callout exam"><b class="lab">Waktu ujian: ${L.exam.minutes} menit</b>
<p>Mulai penghitung waktu, lalu kerjakan semua soal tanpa membuka bab lain. Petunjuk dan solusi baru aktif setelah dua kali cek.</p>
<div class="row"><span class="clock" id="exam-clock">${L.exam.minutes}:00</span><button class="pri" data-act="exam-start" data-id="${L.id}">Mulai</button><button data-act="exam-reset" data-id="${L.id}">Ulang dari awal</button></div></div>`;
}

export function lessonHtml(L, index, total, prev, next, state) {
  const sections = L.sections.map((s, si) => `<h2>${esc(s.title)}</h2>${s.html}${(s.examples || []).map((ex, ei) => exampleHtml(ex, `ex-${si}-${ei}`)).join("")}`).join("");
  return `<div class="eyebrow">${esc(PART[L.part] || L.part)} · Bab ${index + 1} dari ${total} · sekitar ${L.minutes} menit</div>
<h1>${esc(L.title)}</h1>
<div class="callout"><b class="lab">Setelah bab ini kamu bisa</b><ul>${L.goals.map(g => `<li>${g}</li>`).join("")}</ul></div>
${L.terms && L.terms.length ? `<div class="callout"><b class="lab">Istilah di bab ini</b><dl class="terms">${L.terms.map(t => `<dt>${esc(t.term)}</dt><dd>${t.def}</dd>`).join("")}</dl></div>` : ""}
<div class="prose">${sections}</div>
${L.tsql && L.tsql.length ? `<h2>Di SQL Server (T-SQL)</h2><div class="tw"><table class="t"><tr><th>PostgreSQL</th><th>SQL Server</th><th>Catatan</th></tr>${L.tsql.map(t => `<tr><td><code>${esc(t.pg)}</code></td><td><code>${esc(t.tsql)}</code></td><td>${t.note}</td></tr>`).join("")}</table></div>` : ""}
<h2>Ringkasan</h2><ul class="prose">${L.summary.map(s => `<li>${s}</li>`).join("")}</ul>
<h2>Latihan</h2><p class="prose">Kerjakan berurutan. Tombol "Lihat solusi" baru aktif setelah dua kali cek. Kalau kamu membukanya, tutup lagi lalu ketik ulang jawabannya dari ingatan.</p>
${L.exam ? examHtml(L) : ""}
${L.drills.map((d, i) => drillHtml(d, i + 1, state, !!L.exam)).join("")}
<div class="pager">${prev ? `<a href="#${prev.id}">← ${esc(prev.title)}</a>` : '<a href="#mulai">← Mulai di sini</a>'}${next ? `<a href="#${next.id}">${esc(next.title)} →</a>` : "<span></span>"}</div>`;
}
