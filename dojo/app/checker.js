// Menormalkan dan membandingkan hasil query. Tidak memakai DOM, supaya bisa dipakai di browser dan Node.
const DATE = 1082, TIMESTAMP = 1114;
const NUMERIC_TYPES = new Set([20, 21, 23, 26, 700, 701, 1700]);

/** Mengubah satu nilai hasil query menjadi teks pembanding. */
export function normalizeValue(value, typeId) {
  if (value === null || value === undefined) return "∅";
  if (value instanceof Date) {
    const iso = value.toISOString();
    const date = iso.slice(0, 10), time = iso.slice(11, 19);
    if (typeId === DATE || time === "00:00:00") return date; // tengah malam: sama dengan tanggal saja
    return `${date} ${time}`;
  }
  if (typeId === TIMESTAMP && typeof value === "string") {
    // timestamp tepat tengah malam (hasil DATE_TRUNC) disamakan dengan tanggal saja
    return /^\d{4}-\d{2}-\d{2} 00:00:00$/.test(value) ? value.slice(0, 10) : value;
  }
  if (typeof value === "boolean") return value ? "true" : "false";
  if (typeof value === "number" || typeof value === "bigint" || NUMERIC_TYPES.has(typeId)) {
    const n = Number(value);
    if (Number.isFinite(n)) return String(Math.round(n * 100) / 100);
  }
  return String(value);
}

const rowKey = (row, columns) => row.map((v, i) => normalizeValue(v, columns[i] && columns[i].typeId)).join("\u0001");

/** Membandingkan hasil pengguna dengan hasil yang diharapkan. Nama kolom boleh beda; jumlah dan isi kolom harus sama. */
export function compareResults(user, expected, { ordered = false } = {}) {
  if (!user || !user.columns || !user.columns.length) {
    return { ok: false, reason: "Query-mu tidak menghasilkan tabel. Pastikan perintah terakhir adalah SELECT." };
  }
  const ec = expected.columns, uc = user.columns;
  if (uc.length !== ec.length) {
    return { ok: false, reason: `Jumlah kolom berbeda: hasilmu ${uc.length} kolom, seharusnya ${ec.length} kolom (${ec.map(c => c.name).join(", ")}).` };
  }
  if (user.rows.length !== expected.rows.length) {
    const more = user.rows.length > expected.rows.length;
    return { ok: false, reason: `Jumlah baris berbeda: hasilmu ${user.rows.length.toLocaleString("id-ID")} baris, seharusnya ${expected.rows.length.toLocaleString("id-ID")} baris. ${more ? "Mungkin ada baris dobel atau syarat yang kurang." : "Mungkin syaratnya terlalu ketat, atau ada baris yang terbuang."}` };
  }
  const u = user.rows.map(r => rowKey(r, uc)), e = expected.rows.map(r => rowKey(r, ec));
  if (ordered) {
    for (let i = 0; i < e.length; i++) {
      if (u[i] !== e[i]) {
        const sameSet = [...u].sort().join("\n") === [...e].sort().join("\n");
        return { ok: false, reason: sameSet ? `Isinya sudah benar, tapi urutan barisnya berbeda mulai baris ke-${i + 1}. Periksa ORDER BY.` : `Baris ke-${i + 1} berbeda dari yang diharapkan.` };
      }
    }
    return { ok: true };
  }
  const us = [...u].sort(), es = [...e].sort();
  for (let i = 0; i < es.length; i++) {
    if (us[i] !== es[i]) {
      // cari kolom pertama yang kumpulan nilainya berbeda
      for (let c = 0; c < ec.length; c++) {
        const a = user.rows.map(r => normalizeValue(r[c], uc[c].typeId)).sort().join("\n");
        const b = expected.rows.map(r => normalizeValue(r[c], ec[c].typeId)).sort().join("\n");
        if (a !== b) return { ok: false, reason: `Jumlah baris dan kolom sudah benar, tapi nilai di kolom ke-${c + 1} (${ec[c].name}) berbeda dari yang diharapkan.` };
      }
      return { ok: false, reason: "Jumlah baris dan kolom sudah benar, tapi pasangan nilainya berbeda: setiap kolom benar sendiri-sendiri, namun barisnya tidak cocok satu sama lain." };
    }
  }
  return { ok: true };
}
