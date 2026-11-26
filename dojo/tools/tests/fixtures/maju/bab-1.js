export default {
  id: "bab-1", part: "sql", title: "Bab contoh 1", minutes: 10, goals: ["contoh"], terms: [],
  introduces: ["SELECT", "FROM"],
  sections: [{ title: "Contoh", html: "<p>Teks contoh.</p>", examples: [{ sql: "select city_name from app.cities" }] }],
  tsql: [{ pg: "x", tsql: "x", note: "Ada caveat di sini." }], summary: ["contoh"],
  drills: [{ id: "bab-1-01", kind: "sql", prompt: "Kota unik.", solution: "select distinct island from app.cities", hint: "petunjuk", why: "alasan" }],
};
