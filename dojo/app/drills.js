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

/**
 * Memeriksa satu jawaban.
 * Hasil: { ok: true } | { ok: false, reason?: string, error?: {message, code}, expected?: any }
 */
export async function checkDrill(run, drill, answer) {
  if (drill.kind === "number") {
    const r = await run(drill.answerSql, { setup: drill.setup || "" });
    if (!r.ok) return { ok: false, reason: "Kunci jawaban tidak bisa dihitung: " + r.error.message };
    const expected = Number(lastTable(r).rows[0][0]);
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
