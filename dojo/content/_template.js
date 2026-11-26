// Templat bab. Salin menjadi content/<id>.js, isi, lalu tambahkan id ke LESSON_ORDER di content/index.js.
// Aturan tulis: lihat dojo/STYLE.md. Periksa dengan: node dojo/tools/check-content.mjs --lesson <id>
export default {
  id: "sql-00",                 // sama dengan nama berkas
  part: "sql",                  // "sql" | "model" | "capstone"
  title: "Judul bab",
  minutes: 60,                  // perkiraan waktu belajar
  goals: ["Setelah bab ini kamu bisa …"],
  terms: [{ term: "istilah", def: "Arti istilah dalam satu kalimat." }],
  introduces: ["SELECT", "FROM"], // perintah SQL baru, memakai nama dari dojo/tools/lib/sql-features.mjs
  sections: [
    {
      title: "Satu konsep",
      html: "<p>Definisi singkat, lalu penjelasan hasil contoh.</p>",
      examples: [{ sql: "select city_name from app.cities limit 5", note: "Apa yang perlu diperhatikan dari hasilnya." }],
    },
  ],
  tsql: [{ pg: "LIMIT 5", tsql: "SELECT TOP 5 …", note: "Perbedaan perilaku, kalau ada." }],
  summary: ["Poin penting 1", "Poin penting 2"],
  drills: [
    // jenis: choice | sql | fix | number | explain | build
    { id: "sql-00-01", kind: "choice", prompt: "Pertanyaan konsep?", options: ["A", "B"], answer: 1, why: "Alasan jawaban.", hint: "Petunjuk." },
    { id: "sql-00-02", kind: "sql", prompt: "Tulis query …", start: "select ", solution: "select city_name from app.cities", ordered: false, why: "Alasan.", hint: "Petunjuk." },
    { id: "sql-00-03", kind: "fix", prompt: "Query ini salah. Perbaiki.", start: "select …", solution: "select …", why: "Alasan.", hint: "Petunjuk." },
    { id: "sql-00-04", kind: "number", prompt: "Berapa …?", answerSql: "select count(*) from app.cities", why: "Alasan.", hint: "Petunjuk." },
    { id: "sql-00-05", kind: "explain", prompt: "Jelaskan dengan kalimatmu sendiri …", model: "Contoh jawaban.", hint: "Petunjuk." },
  ],
};
