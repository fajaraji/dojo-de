// Memeriksa jawaban soal. `run(sql, { setup })` harus berbentuk sama dengan engine.run di browser.
import { compareResults } from "./checker.js";

const lastTable = (r) => [...(r.results || [])].reverse().find(x => x.columns && x.columns.length) || null;

/** Mengubah teks angka (format Indonesia atau Inggris) menjadi Number. NaN kalau bukan angka. */
export function parseNumber(text) {
  // tanda minus Unicode (−, U+2212) dan tanda pisah (–) dianggap minus biasa
  let s = String(text || "").replace(/rp/i, "").replace(/\s/g, "").replace(/^[−–]/, "-");
  if (!s || !/^-?[\d.,]+$/.test(s)) return NaN;
  const hasDot = s.includes("."), hasComma = s.includes(",");
  if (hasDot && hasComma) {
    // pemisah yang muncul terakhir adalah tanda desimal
    s = s.lastIndexOf(",") > s.lastIndexOf(".") ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (hasDot) {
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
  } else if (hasComma) {
    s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, "") : s.replace(",", ".");
  }
  return Number(s);
}

/** Merapikan keluaran program sebelum dibandingkan: spasi di akhir baris dan baris kosong di akhir dibuang. */
export function normalizeStdout(s) {
  return String(s || "").replace(/\r/g, "").split("\n").map(l => l.replace(/\s+$/, "")).join("\n").replace(/\n+$/, "");
}

const firstDiff = (a, b) => {
  const x = a.split("\n"), y = b.split("\n");
  for (let i = 0; i < Math.max(x.length, y.length); i++) if (x[i] !== y[i]) return { line: i + 1, got: x[i], want: y[i] };
  return null;
};

async function checkPy(runPy, drill, answer) {
  if (!runPy) return { ok: false, reason: "Mesin Python belum tersedia." };
  const tail = drill.check ? `\n${drill.check}` : "";
  const exp = await runPy(drill.solution + tail, { setup: drill.setup || "" });
  if (!exp.ok) return { ok: false, reason: "Solusi rujukan gagal dijalankan: " + exp.error.message };
  const usr = await runPy(answer + tail, { setup: drill.setup || "" });
  if (!usr.ok) return { ok: false, error: usr.error, timedOut: !!usr.timedOut, stdout: usr.stdout };
  const got = normalizeStdout(usr.stdout), want = normalizeStdout(exp.stdout);
  if (got === want) return { ok: true };
  if (!got) return { ok: false, reason: "Kodemu tidak mencetak apa pun. Pakai print() untuk menampilkan hasilnya." };
  const d = firstDiff(got, want);
  return { ok: false, reason: d.got === undefined
    ? `Keluaranmu kurang baris: baris ke-${d.line} seharusnya berisi sesuatu.`
    : d.want === undefined
      ? `Keluaranmu punya baris lebih: baris ke-${d.line} ("${d.got}") tidak diharapkan.`
      : `Baris ke-${d.line} keluaranmu "${d.got}" belum sesuai dengan yang diharapkan.` };
}

function checkPaste(drill, answer) {
  const text = String(answer || "").trim();
  if (!text) return { ok: false, reason: "Tempel dulu keluaran perintahnya di kotak jawaban." };
  const ok = new RegExp(drill.expect, "im").test(text);
  return ok ? { ok: true } : { ok: false, reason: "Keluaran yang kamu tempel belum menunjukkan hasil yang diharapkan. Pastikan perintahnya dijalankan persis seperti di soal, tanpa error, lalu tempel seluruh keluarannya." };
}

/**
 * Memeriksa satu jawaban.
 * Hasil: { ok: true } | { ok: false, reason?: string, error?: {message, code}, expected?: any }
 */
export async function checkDrill(run, drill, answer, { runPy } = {}) {
  if (drill.kind === "py") return checkPy(runPy, drill, answer);
  if (drill.kind === "paste") return checkPaste(drill, answer);
  if (drill.kind === "number") {
    let expected;
    if (drill.answerPy) {
      // kunci jawaban dihitung dengan Python: angka yang dicetak kode answerPy
      const r = runPy ? await runPy(drill.answerPy, { setup: drill.setup || "" }) : { ok: false, error: { message: "mesin Python belum tersedia" } };
      if (!r.ok) return { ok: false, reason: "Kunci jawaban tidak bisa dihitung: " + r.error.message };
      expected = Number(normalizeStdout(r.stdout));
    } else {
      const r = await run(drill.answerSql, { setup: drill.setup || "" });
      if (!r.ok) return { ok: false, reason: "Kunci jawaban tidak bisa dihitung: " + r.error.message };
      expected = Number(lastTable(r).rows[0][0]);
    }
    const got = parseNumber(answer);
    if (Number.isNaN(got)) return { ok: false, reason: "Tulis jawabanmu dalam bentuk angka, misalnya 1250 atau 1.250." };
    const ok = Math.abs(got - expected) <= Math.max(0.01, Math.abs(expected) * 1e-6);
    return ok ? { ok: true, expected } : { ok: false, reason: got > expected ? "Angkamu terlalu besar." : "Angkamu terlalu kecil.", expected };
  }
  const build = drill.kind === "build";
  const tail = build ? `\n;\n${drill.verify}` : "";
  const exp = await run(drill.solution + tail, { setup: drill.setup || "" });
  if (!exp.ok) return { ok: false, reason: "Solusi rujukan gagal dijalankan: " + exp.error.message };
  const usr = await run(answer + tail, { setup: drill.setup || "" });
  if (!usr.ok) return { ok: false, error: usr.error, timedOut: !!usr.timedOut };
  if (drill.checkNames) {
    const want = lastTable(exp).columns.map(c => c.name.toLowerCase());
    const got = (lastTable(usr) || { columns: [] }).columns.map(c => c.name.toLowerCase());
    if (want.join(",") !== got.join(",")) return { ok: false, reason: `Nama kolom hasilmu (${got.join(", ") || "tidak ada"}) belum sesuai. Soal ini meminta nama kolom: ${want.join(", ")}.` };
  }
  const cmp = compareResults(lastTable(usr), lastTable(exp), { ordered: !!drill.ordered });
  return cmp.ok ? { ok: true } : { ok: false, reason: (build ? "Hasil perintahmu belum sesuai. " : "") + cmp.reason };
}
