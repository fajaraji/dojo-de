import { stripSql } from "../../app/sql-lex.js";
// Mendeteksi perintah, fungsi, dan operator SQL yang dipakai di dalam sebuah query.
// Dipakai pemeriksa materi untuk memastikan tidak ada perintah yang dipakai sebelum diajarkan.

// Frasa beberapa kata dicek lebih dulu, lalu dihapus dari teks supaya katanya tidak terhitung dua kali.
const PHRASES = [
  ["create materialized view", "CREATE MATERIALIZED VIEW"], ["refresh materialized view", "REFRESH MATERIALIZED VIEW"],
  ["full outer join", "FULL JOIN"], ["left outer join", "LEFT JOIN"], ["right outer join", "RIGHT JOIN"],
  ["unbounded preceding", "UNBOUNDED PRECEDING"], ["unbounded following", "UNBOUNDED FOLLOWING"], ["current row", "CURRENT ROW"],
  ["is not distinct from", "IS NOT DISTINCT FROM"], ["is distinct from", "IS DISTINCT FROM"],
  ["is not null", "IS NOT NULL"], ["is null", "IS NULL"], ["not exists", "NOT EXISTS"], ["not in", "NOT IN"],
  ["order by", "ORDER BY"], ["group by", "GROUP BY"], ["partition by", "PARTITION BY"],
  ["left join", "LEFT JOIN"], ["right join", "RIGHT JOIN"], ["full join", "FULL JOIN"], ["cross join", "CROSS JOIN"], ["inner join", "INNER JOIN"],
  ["union all", "UNION ALL"], ["with recursive", "WITH RECURSIVE"], ["rows between", "ROWS BETWEEN"], ["range between", "RANGE BETWEEN"],
  ["on conflict", "ON CONFLICT"], ["do update", "DO UPDATE"], ["do nothing", "DO NOTHING"], ["when matched", "WHEN MATCHED"], ["when not matched", "WHEN NOT MATCHED"],
  ["insert into", "INSERT INTO"], ["delete from", "DELETE FROM"], ["create table", "CREATE TABLE"], ["create schema", "CREATE SCHEMA"],
  ["create or replace view", "CREATE VIEW"], ["create view", "CREATE VIEW"], ["create index", "CREATE INDEX"], ["alter table", "ALTER TABLE"],
  ["drop table", "DROP TABLE"], ["drop view", "DROP VIEW"], ["primary key", "PRIMARY KEY"], ["foreign key", "FOREIGN KEY"],
  ["explain analyze", "EXPLAIN ANALYZE"], ["start transaction", "START TRANSACTION"], ["truncate table", "TRUNCATE"],
];
const KEYWORDS = ["select", "from", "where", "as", "limit", "offset", "asc", "desc", "distinct", "and", "or", "not", "in", "between", "like", "ilike",
  "case", "when", "then", "else", "end", "join", "on", "using", "having", "union", "intersect", "except", "exists", "any", "all", "with", "over",
  "filter", "values", "set", "update", "delete", "insert", "returning", "truncate", "drop", "references", "unique", "check", "default", "begin", "commit",
  "rollback", "merge", "interval", "current_date", "current_timestamp", "true", "false", "null", "lateral", "window", "preceding", "following", "rows", "range",
  "explain", "analyze", "vacuum", "nulls", "cascade", "recursive", "materialized"];
const FUNCTIONS = ["count", "sum", "avg", "min", "max", "round", "cast", "coalesce", "nullif", "upper", "lower", "trim", "ltrim", "rtrim", "length", "char_length",
  "substring", "substr", "replace", "position", "strpos", "split_part", "concat", "concat_ws", "left", "right", "lpad", "rpad", "initcap", "reverse",
  "regexp_replace", "regexp_match", "now", "date_trunc", "extract", "date_part", "age", "to_char", "to_date", "to_number", "to_timestamp", "make_date",
  "make_interval", "generate_series", "row_number", "rank", "dense_rank", "percent_rank", "cume_dist", "ntile", "lag", "lead", "first_value", "last_value",
  "nth_value", "string_agg", "array_agg", "abs", "ceil", "ceiling", "floor", "greatest", "least", "random", "md5", "mod", "power", "sqrt", "format",
  "bool_and", "bool_or", "date_bin", "justify_days",
  // nama fungsi SQL Server: ikut dideteksi supaya pemeriksa menolaknya kalau terselip di query PostgreSQL
  "isnull", "getdate", "dateadd", "datediff", "len", "charindex", "iif", "datefromparts", "convert", "year", "month", "day"];
const OPERATORS = [["||", /\|\|/g], ["::", /::/g], ["<>", /<>/g], ["!=", /!=/g], ["<=", /<=/g], [">=", />=/g], ["=", /=/g], ["<", /</g], [">", />/g]];

export const KNOWN_FEATURES = new Set([
  ...PHRASES.map(p => p[1]), ...KEYWORDS.map(k => k.toUpperCase()), ...FUNCTIONS.map(f => f.toUpperCase() + "()"),
  ...OPERATORS.map(o => o[0]), "SELECT *", "COUNT(DISTINCT)", "SUBQUERY", "POSISI KOLOM",
]);

const blank = (text, re) => text.replace(re, (m) => " ".repeat(m.length));

/** Mengembalikan himpunan nama fitur SQL yang dipakai, misalnya "SELECT", "ORDER BY", "COUNT()", "||". */
export function sqlFeatures(sql) {
  // isi teks, dollar quote, dan komentar dibuang oleh pemindai bersama; nama berkutip ganda diganti x
  let s = stripSql(sql).replace(/"(?:[^"]|"")*"/g, "x").toLowerCase();
  const found = new Set();
  if (/\bselect\s+(distinct\s+)?\*|\b[a-z_][a-z0-9_]*\.\*/.test(s)) found.add("SELECT *");
  if (/\bcount\s*\(\s*distinct\b/.test(s)) found.add("COUNT(DISTINCT)");
  if (/\(\s*select\b/.test(s)) found.add("SUBQUERY");
  // GROUP BY 1 / ORDER BY 2: kolom disebut lewat nomor urutnya di SELECT
  if (/\b(group|order)\s+by\s+\d/.test(s)) found.add("POSISI KOLOM");
  // FROM tabel1, tabel2 adalah gabungan semua pasangan baris, sama dengan CROSS JOIN
  if (/\bfrom\s+(?:[a-z_][\w.]*|\([^()]*\))(?:\s+(?:as\s+)?[a-z_]\w*)?\s*,/.test(s)) found.add("CROSS JOIN");
  for (const [phrase, name] of PHRASES) {
    const re = new RegExp("\\b" + phrase.replace(/ /g, "\\s+") + "\\b", "g");
    if (re.test(s)) { found.add(name); s = blank(s, re); }
  }
  for (const f of FUNCTIONS) {
    const re = new RegExp("(^|[^.\\w])" + f + "\\s*\\(", "g");
    if (re.test(s)) { found.add(f.toUpperCase() + "()"); s = s.replace(re, (m, pre) => pre + " ".repeat(m.length - pre.length - 1) + "("); }
  }
  for (const k of KEYWORDS) if (new RegExp("\\b" + k + "\\b").test(s)) found.add(k.toUpperCase());
  for (const [name, re] of OPERATORS) if (re.test(s)) { found.add(name); s = blank(s, re); }
  return found;
}
