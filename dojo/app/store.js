// Penyimpanan per browser yang aman: kalau localStorage diblokir, halaman tetap jalan tanpa menyimpan.
const PREFIX = "dojo2:";
export function load(key, fallback) {
  try { const v = localStorage.getItem(PREFIX + key); return v === null ? fallback : JSON.parse(v); } catch { return fallback; }
}
export function save(key, value) {
  try { localStorage.setItem(PREFIX + key, JSON.stringify(value)); } catch { /* penyimpanan diblokir: abaikan */ }
}
