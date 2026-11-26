// Urutan bab dan prasyarat. Bentuk setiap bab dijelaskan di dojo/content/_template.js (T04).
// Bab yang masih kerangka punya `draft: true`: tidak tampil di situs, tetapi daftar `introduces` dan `terms`-nya
// tetap dibaca pemeriksa materi, supaya urutan materi bisa diperiksa walau bab sebelumnya belum selesai ditulis.
export const LESSON_ORDER = [
  "sql-01", "sql-02", "sql-03", "sql-04",
  "sql-05", "sql-06", "model-01", "model-02",
  "sql-07", "sql-08", "sql-09",
  "sql-10", "sql-11", "sql-12", "model-03",
  "sql-13", "sql-14", "model-04", "model-05",
  "model-06", "model-07", "capstone-a",
];

// PREREQ[id] = bab terakhir yang boleh dipakai sebagai dasar. Kalau tidak ada, dasarnya bab sebelumnya.
export const PREREQ = {};

export async function loadLessons() {
  const mods = await Promise.all(LESSON_ORDER.map(id => import(`./${id}.js`)));
  return mods.map(m => m.default).filter(L => !L.draft);
}
