// Urutan bab dan prasyarat. Bentuk setiap bab dijelaskan di dojo/content/_template.js (T04).
// Bab yang belum ditulis tidak dimasukkan ke daftar ini.
export const LESSON_ORDER = ["sql-01", "sql-02", "sql-03", "sql-04"];

// PREREQ[id] = bab terakhir yang boleh dipakai sebagai dasar. Kalau tidak ada, dasarnya bab sebelumnya.
export const PREREQ = {};

export async function loadLessons() {
  const mods = await Promise.all(LESSON_ORDER.map(id => import(`./${id}.js`)));
  return mods.map(m => m.default);
}
