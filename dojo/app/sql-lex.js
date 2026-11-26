// Pemindai SQL sederhana yang dipakai bersama oleh worker mesin, petunjuk T-SQL, dan pemeriksa materi.
// Membaca query dalam satu kali jalan supaya komentar, isi teks, dan dollar quote tidak saling mengacaukan.

/**
 * Mengembalikan query tanpa komentar (diganti spasi), dengan isi teks berkutip tunggal dan dollar quote
 * diganti '' . Nama berkutip ganda ("…") dibiarkan apa adanya.
 */
export function stripSql(sql) {
  const s = String(sql || "");
  let out = "", i = 0;
  while (i < s.length) {
    const c = s[i], n = s[i + 1];
    if (c === "-" && n === "-") { while (i < s.length && s[i] !== "\n") i++; out += " "; continue; }
    if (c === "/" && n === "*") {
      let depth = 1; i += 2;
      while (i < s.length && depth > 0) {
        if (s[i] === "/" && s[i + 1] === "*") { depth++; i += 2; }
        else if (s[i] === "*" && s[i + 1] === "/") { depth--; i += 2; }
        else i++;
      }
      out += " "; continue;
    }
    if (c === "'") {
      i++;
      while (i < s.length) { if (s[i] === "'" && s[i + 1] === "'") i += 2; else if (s[i] === "'") { i++; break; } else i++; }
      out += "''"; continue;
    }
    if (c === "$") {
      const m = /^\$([A-Za-z_][A-Za-z0-9_]*)?\$/.exec(s.slice(i));
      if (m) {
        const tag = m[0], end = s.indexOf(tag, i + tag.length);
        i = end < 0 ? s.length : end + tag.length;
        out += "''"; continue;
      }
    }
    if (c === '"') {
      let j = i + 1;
      while (j < s.length) { if (s[j] === '"' && s[j + 1] === '"') j += 2; else if (s[j] === '"') { j++; break; } else j++; }
      out += s.slice(i, j); i = j; continue;
    }
    out += c; i++;
  }
  return out;
}

const TX_WORDS = new Set(["begin", "commit", "rollback", "end", "abort", "savepoint", "release", "start"]);

/** Perintah transaksi yang dipakai sebagai perintah (kata pertama sebuah pernyataan), dalam huruf besar. */
export function transactionCommands(sql) {
  return stripSql(sql).split(";")
    .map(st => (st.trim().match(/^[a-z_]+/i) || [""])[0].toLowerCase())
    .filter(w => TX_WORDS.has(w))
    .map(w => w.toUpperCase());
}
