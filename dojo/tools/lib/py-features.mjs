// Mendeteksi fitur Python yang dipakai sebuah kode: kata kunci, fungsi bawaan, modul yang di-import,
// f-string, dan comprehension. Dipakai pemeriksa materi supaya tidak ada fitur yang dipakai sebelum diajarkan.
// Semua nama diberi awalan "py:" supaya tidak bentrok dengan nama fitur SQL (misalnya IN, NOT).

const KEYWORDS = ["if", "elif", "else", "for", "while", "break", "continue", "def", "return", "class", "try", "except",
  "finally", "raise", "with", "lambda", "in", "not", "and", "or", "is", "None", "True", "False", "yield", "assert",
  "pass", "del", "global", "async", "await", "match", "case"];
const BUILTINS = ["print", "len", "range", "sum", "min", "max", "sorted", "enumerate", "zip", "open", "int", "float",
  "str", "bool", "list", "dict", "set", "tuple", "type", "isinstance", "round", "abs", "map", "filter", "any", "all",
  "reversed", "input", "repr", "hasattr", "getattr"];

export const KNOWN_PY_FEATURES = new Set([
  ...KEYWORDS.map(k => "py:" + k), ...BUILTINS.map(b => `py:${b}()`), "py:f-string", "py:comprehension",
]);

/** Membuang komentar dan isi teks (string), menandai f-string. Mengembalikan { code, fstring }. */
function strip(src) {
  let out = "", i = 0, fstring = false;
  while (i < src.length) {
    const c = src[i];
    if (c === "#") { while (i < src.length && src[i] !== "\n") i++; continue; }
    const m = /^([rRbBfFuU]{0,2})('''|"""|'|")/.exec(src.slice(i, i + 5));
    const prevWord = /[A-Za-z0-9_]$/.test(out);
    if (m && !(m[1] && prevWord)) {
      if (/[fF]/.test(m[1])) fstring = true;
      const q = m[2];
      i += m[0].length;
      while (i < src.length && src.slice(i, i + q.length) !== q) { if (src[i] === "\\") i++; if (q.length === 1 && src[i] === "\n") break; i++; }
      i += q.length;
      out += " x ";
      continue;
    }
    out += c; i++;
  }
  return { code: out, fstring };
}

/** Himpunan fitur Python yang dipakai, misalnya "py:for", "py:print()", "py:import pandas". */
export function pyFeatures(src) {
  const { code, fstring } = strip(String(src || ""));
  const found = new Set();
  if (fstring) found.add("py:f-string");
  for (const k of KEYWORDS) if (new RegExp(`(^|[^.\\w])${k}\\b`).test(code)) found.add("py:" + k);
  for (const b of BUILTINS) if (new RegExp(`(^|[^.\\w])${b}\\s*\\(`).test(code)) found.add(`py:${b}()`);
  for (const m of code.matchAll(/^\s*import\s+([\w.]+(?:\s*,\s*[\w.]+)*)/gm)) for (const name of m[1].split(",")) found.add("py:import " + name.trim().split(".")[0]);
  for (const m of code.matchAll(/^\s*from\s+([\w.]+)\s+import\b/gm)) found.add("py:import " + m[1].split(".")[0]);
  if (/[[{(][^\]})]*\bfor\b[^\]})]*\bin\b/.test(code)) found.add("py:comprehension");
  // "import x" dan "from x import" ditandai sebagai modul, bukan kata kunci terpisah
  return found;
}

/** Nama fitur import dianggap dikenal kalau berbentuk "py:import <nama>". */
export const isKnownPyFeature = (f) => KNOWN_PY_FEATURES.has(f) || /^py:import [\w]+$/.test(f);
