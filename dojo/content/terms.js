// Istilah yang dilacak pemeriksa materi: istilah ini tidak boleh muncul di teks bab
// sebelum bab yang menjelaskannya (bab yang mencantumkannya di daftar `terms`).
// `id` harus sama dengan isi `term` di bab (huruf kecil).
export const TRACKED_TERMS = [
  { id: "null", pattern: /\bNULL\b/ },
  { id: "distinct", pattern: /\bDISTINCT\b/ },
  { id: "agregasi", pattern: /\bagregasi\b/i },
  { id: "grain", pattern: /\bgrain\b/i },
  { id: "join", pattern: /\bjoin\b/i },
  { id: "primary key", pattern: /\bprimary key\b/i },
  { id: "foreign key", pattern: /\bforeign key\b/i },
  { id: "subquery", pattern: /\bsubquery\b/i },
  { id: "cte", pattern: /\bCTE\b/ },
  { id: "window function", pattern: /\bwindow function\b/i },
  { id: "view", pattern: /\bview\b/i },
  { id: "index", pattern: /\bindex\b/i },
  { id: "oltp", pattern: /\bOLTP\b/ },
  { id: "olap", pattern: /\bOLAP\b/ },
  { id: "normalisasi", pattern: /\bnormalisasi\b/i },
  { id: "star schema", pattern: /\bstar schema\b/i },
  { id: "tabel fakta", pattern: /\btabel fakta\b/i },
  { id: "tabel dimensi", pattern: /\btabel dimensi\b/i },
  { id: "surrogate key", pattern: /\bsurrogate key\b/i },
  { id: "scd", pattern: /\bSCD\b/ },
  { id: "etl", pattern: /\bETL\b/ },
  { id: "elt", pattern: /\bELT\b/ },
];
