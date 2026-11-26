// Petunjuk untuk kebiasaan SQL Server (T-SQL) dan penjelasan kode error PostgreSQL dalam bahasa Indonesia.

// Buang isi teks berkutip dan komentar, supaya kata di dalamnya tidak dianggap perintah.
import { stripSql as strip } from "./sql-lex.js";

const RULES = [
  [/\bselect\s+(distinct\s+)?top\s*\(?\s*\d+/i, "TOP n adalah cara SQL Server. Di PostgreSQL, tulis LIMIT n di akhir query, misalnya SELECT … FROM app.orders LIMIT 5."],
  [/\bisnull\s*\(/i, "ISNULL(x, y) adalah fungsi SQL Server. Di PostgreSQL pakai COALESCE(x, y), yang juga ada di SQL Server."],
  [/\bgetdate\s*\(\s*\)|\bsysdatetime\s*\(\s*\)/i, "GETDATE() adalah fungsi SQL Server. Di PostgreSQL pakai CURRENT_DATE untuk tanggal hari ini, atau NOW() untuk tanggal dan jam."],
  [/\[[A-Za-z_][\w ]*\]/, 'Tanda [ ] untuk nama kolom atau tabel hanya ada di SQL Server. Di PostgreSQL pakai tanda kutip ganda, misalnya "order_id", atau tulis namanya saja tanpa tanda.'],
  [/''\s*\+|\+\s*''/, "Di PostgreSQL, teks digabung dengan ||, misalnya full_name || ' - ' || email. Tanda + hanya untuk angka."],
  [/\bdateadd\s*\(/i, "DATEADD adalah fungsi SQL Server. Di PostgreSQL tambahkan INTERVAL, misalnya order_ts + INTERVAL '1 day'."],
  [/\bdatediff\s*\(/i, "DATEDIFF adalah fungsi SQL Server. Di PostgreSQL, selisih dua tanggal didapat dengan mengurangkannya (hasilnya jumlah hari), atau dengan AGE() dan EXTRACT."],
  [/\blen\s*\(/i, "LEN adalah fungsi SQL Server. Di PostgreSQL pakai LENGTH."],
  [/\bcharindex\s*\(/i, "CHARINDEX adalah fungsi SQL Server. Di PostgreSQL pakai POSITION('x' IN teks) atau STRPOS(teks, 'x')."],
  [/\biif\s*\(/i, "IIF adalah fungsi SQL Server. Di PostgreSQL pakai CASE WHEN … THEN … ELSE … END."],
  [/\bdatefromparts\s*\(/i, "DATEFROMPARTS adalah fungsi SQL Server. Di PostgreSQL pakai MAKE_DATE(tahun, bulan, hari)."],
  [/\b(year|month|day)\s*\(/i, "YEAR(), MONTH(), dan DAY() adalah fungsi SQL Server. Di PostgreSQL pakai EXTRACT(YEAR FROM kolom)."],
  [/\bconvert\s*\(/i, "CONVERT adalah fungsi SQL Server. Di PostgreSQL pakai CAST(x AS tipe) atau x::tipe."],
  [/\bnvarchar\b|\bvarchar\s*\(\s*max\s*\)/i, "NVARCHAR dan VARCHAR(MAX) adalah tipe SQL Server. Di PostgreSQL pakai TEXT."],
  [/^\s*go\s*;?\s*$/im, "GO adalah pemisah perintah khusus di SSMS, bukan perintah SQL. Di PostgreSQL cukup akhiri perintah dengan titik koma (;)."],
];

/** Daftar saran kalau query memakai kebiasaan SQL Server. Kosong kalau tidak ada. */
export function tsqlHints(sql) {
  const s = strip(sql);
  return RULES.filter(([re]) => re.test(s)).map(([, msg]) => msg);
}

const CODES = {
  "42601": ["Ada salah tulis di query", "PostgreSQL tidak mengerti query di dekat bagian yang disebut pesan error (setelah kata \"at or near\"). Periksa koma di antara nama kolom, kurung buka dan tutup, tanda kutip, dan urutan bagian-bagian query."],
  "42703": ["Kolom tidak ditemukan", "Nama kolom itu tidak ada di tabel yang dipakai. Cek ejaannya di Kamus data TokoKita. Nama kolom di sini memakai huruf kecil dan garis bawah, misalnya order_ts. Kalau memakai nama pendek tabel (misalnya o), pastikan kolomnya memang ada di tabel itu."],
  "42P01": ["Tabel tidak ditemukan", "Tabel itu tidak ada. Semua tabel latihan berada di dalam skema (kelompok tabel), jadi tulis nama skemanya di depan: app.orders, bukan orders. Daftar lengkapnya ada di Kamus data TokoKita."],
  "42803": ["Kolom harus ada di GROUP BY", "Saat memakai GROUP BY, setiap kolom di SELECT harus ikut ditulis di GROUP BY, atau dihitung dengan fungsi ringkasan seperti SUM, COUNT, atau MAX."],
  "42883": ["Fungsi tidak ditemukan", "Nama fungsi itu tidak ada di PostgreSQL, atau tipe data yang dimasukkan tidak cocok dengan fungsinya."],
  "42702": ["Nama kolom membingungkan", "Kolom dengan nama itu ada di lebih dari satu tabel di query ini. Tulis nama pendek tabelnya di depan nama kolom, misalnya o.customer_id."],
  "22012": ["Pembagian dengan nol", "Ada pembagian dengan angka 0. Bungkus pembaginya dengan NULLIF(pembagi, 0), supaya hasilnya NULL (kosong), bukan error."],
  "22P02": ["Nilai tidak bisa diubah ke tipe yang diminta", "Ada teks yang tidak bisa diubah menjadi angka atau tanggal, misalnya 'Rp 125.000' menjadi angka. Bersihkan teksnya dulu (misalnya dengan REPLACE dan TRIM) sebelum diubah tipenya."],
  "22007": ["Format tanggal tidak dikenali", "Teks tanggal tidak bisa dibaca. PostgreSQL paling aman membaca format YYYY-MM-DD, misalnya '2025-03-01'. Untuk format lain, pakai TO_DATE(teks, 'DD/MM/YYYY')."],
  "22008": ["Tanggal di luar rentang", "Tanggal yang ditulis tidak ada, misalnya bulan 13 atau tanggal 31 di bulan yang hanya punya 30 hari."],
  "21000": ["Subquery menghasilkan lebih dari satu baris", "Subquery yang dipakai sebagai satu nilai ternyata menghasilkan beberapa baris. Pastikan hasilnya hanya satu nilai, atau pakai IN atau EXISTS."],
  "23505": ["Nilai kunci dobel", "Baris yang dimasukkan memakai nilai kunci yang sudah ada. Kolom kunci utama dan kolom UNIQUE tidak boleh berisi nilai yang sama dua kali."],
  "23503": ["Melanggar hubungan antartabel", "Baris ini merujuk ke baris yang tidak ada di tabel lain, atau baris yang mau dihapus masih dirujuk tabel lain."],
  "23502": ["Kolom wajib diisi", "Kolom yang tidak boleh kosong (NOT NULL) diisi NULL."],
  "42P20": ["Window function tidak boleh di sini", "Window function (fungsi dengan OVER) dihitung sesudah WHERE, GROUP BY, dan HAVING, jadi tidak bisa dipakai di bagian itu. Hitung dulu window function-nya di subquery atau CTE, lalu saring hasilnya di query luar dengan WHERE."],
  "42P07": ["Tabel sudah ada", "Tabel atau objek dengan nama itu sudah ada, jadi tidak bisa dibuat lagi. Pakai nama lain, hapus dulu dengan DROP, atau tulis CREATE TABLE IF NOT EXISTS kalau memang boleh dilewati."],
  "23514": ["Data melanggar aturan CHECK", "Nilai yang dimasukkan tidak memenuhi aturan CHECK di tabel itu (misalnya harga harus lebih dari 0). Nama aturannya ada di pesan asli."],
  "42804": ["Tipe data tidak cocok", "Dua nilai yang harus bertipe sama ternyata tipenya berbeda, misalnya angka dan teks di kolom yang sama pada UNION, atau di hasil THEN dan ELSE pada CASE. Samakan tipenya dengan CAST atau ::."],
  "25P02": ["Transaksi sudah gagal", "Perintah sebelumnya di transaksi ini gagal, jadi perintah berikutnya ditolak sampai transaksi dibatalkan dengan ROLLBACK."],
};

/** Penjelasan error PostgreSQL dalam bahasa Indonesia, ditambah saran kalau ada kebiasaan SQL Server. */
export function explainPgError(error, sql) {
  const code = error && error.code, message = String(error && error.message || "");
  let [judul, dasar] = CODES[code] || ["Query gagal", "Baca pesan error dari PostgreSQL. Bagian yang disebut setelah kata \"at or near\" biasanya menunjukkan tempat masalahnya."];
  const saran = tsqlHints(sql);
  if (code === "42883" && /operator does not exist/i.test(message)) {
    judul = "Operator tidak cocok dengan tipe datanya";
    dasar = "Operator itu tidak bisa dipakai untuk tipe data kedua nilai yang ada di kiri dan kanannya.";
    if (/(text|character varying)\s*\+|\+\s*(text|character varying)/i.test(message)) saran.push("Untuk menggabung teks di PostgreSQL pakai ||, misalnya full_name || ' - ' || email. Tanda + hanya untuk angka.");
  }
  if (code === "42803" && /not allowed in WHERE/i.test(message)) {
    judul = "Fungsi agregasi tidak boleh di WHERE";
    dasar = "WHERE menyaring baris satu per satu sebelum baris dikelompokkan, jadi hasil COUNT, SUM, dan fungsi agregasi lain belum ada. Pindahkan syarat yang memakai fungsi agregasi ke HAVING, yang ditulis setelah GROUP BY.";
  } else if (code === "42803" && /cannot be nested/i.test(message)) {
    judul = "Fungsi agregasi bertumpuk";
    dasar = "Fungsi agregasi tidak boleh ditulis di dalam fungsi agregasi lain, misalnya AVG(COUNT(*)). Hitung yang di dalam dulu per kelompok di subquery atau CTE, lalu hitung yang di luar dari hasil itu.";
  }
  if (code === "42703" && /"[^"]+"/.test(strip(sql))) {
    dasar += " Perhatikan juga: di PostgreSQL, tanda kutip ganda menandai nama kolom atau tabel, bukan teks. Teks ditulis dengan kutip tunggal, misalnya 'Jawa'.";
  }
  const isi = saran.length ? `${dasar}\nKebiasaan SQL Server yang terdeteksi di query-mu:\n- ${saran.join("\n- ")}` : dasar;
  return { judul, isi, saran };
}
