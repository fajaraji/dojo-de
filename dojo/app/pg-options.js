// Opsi PGlite yang dipakai bersama oleh worker mesin, pemeriksa materi, dan uji.
// Tanggal dan jam dibiarkan sebagai teks persis seperti di database. Kalau diubah ke objek Date,
// JavaScript membacanya sebagai jam lokal komputer lalu menampilkannya dalam UTC, sehingga bergeser 7 jam di WIB.
const asText = (s) => s;
export const PG_PARSERS = {
  1082: asText, // date
  1083: asText, // time
  1114: asText, // timestamp
  1184: asText, // timestamptz
  1266: asText, // timetz
};
