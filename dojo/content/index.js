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
  // Bagian 3–8 (rencana docs/superpowers/plans/2026-11-26-dojo-bagian-3-8.md)
  "tools-01", "tools-02", "tools-03", "tools-04",
  "py-01", "py-02", "py-03", "py-04", "py-05", "py-06", "py-07",
  "pipe-01", "pipe-02", "pipe-03", "pipe-04", "pipe-05",
  "cloud-01", "cloud-02", "cloud-03", "cloud-04", "cloud-05", "cloud-06",
  "adv-01", "adv-02", "adv-03", "adv-04",
  "career-01", "career-02", "career-03",
];

// PREREQ[id] = bab terakhir yang boleh dipakai sebagai dasar. Kalau tidak ada, dasarnya bab sebelumnya.
export const PREREQ = {};

export async function loadLessons() {
  const mods = await Promise.all(LESSON_ORDER.map(id => import(`./${id}.js`)));
  return mods.map(m => m.default).filter(L => !L.draft);
}
