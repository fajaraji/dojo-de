# Verifikasi Context7: kelompok sql-a (sql-01 s.d. sql-05)

Tanggal: 26 Nov 2026. Semua rujukan di bawah berasal dari Context7 (`query-docs`). Tidak ada WebFetch, curl, atau ingatan yang dipakai sebagai rujukan.

- PostgreSQL 18: library ID `/websites/postgresql/18`. URL sumber disingkat `pg:` = `https://www.postgresql.org/docs/18/`.
- SQL Server / T-SQL: library ID `/microsoftdocs/sql-docs`. URL sumber disingkat `ms:` = `https://github.com/microsoftdocs/sql-docs/blob/live/docs/`.
- "Query" = bukti tambahan dengan `node tools/query.mjs` (PostgreSQL 18.6 di mesin latihan). Bukti ini hanya pelengkap, bukan pengganti rujukan.

Status: **cocok**, **salah** (diperbaiki), **tidak ditemukan** (dicoba 2-4 query; kalimat diubah atau dihapus).

Ringkasan: 145 klaim dicek (sql-01: 19, sql-02: 25, sql-03: 29, sql-04: 38, sql-05: 34). 1 salah dan diperbaiki. 16 tidak ditemukan: 14 kalimat diubah, 2 dipertahankan karena berupa teks pesan error yang dicetak mesin latihan dan bisa dicoba pembaca. 2 kalimat diperjelas tanpa mengubah maknanya. Sisanya (126) cocok. Kelima bab lulus `node tools/check-content.mjs --lesson <id>` setelah perbaikan.

## sql-01: Data, tabel, dan SELECT pertama

| Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|
| Kata perintah tidak membedakan huruf besar-kecil | cocok | pg:sql-syntax-lexical.html ("Key words and unquoted identifiers are case-insensitive") | - |
| Spasi dan baris baru bebas | cocok | pg:tutorial-table.html | - |
| Titik koma menandai akhir query; boleh dihilangkan kalau hanya satu query | cocok | pg:sql-syntax-lexical.html ("The end of the input stream also terminates a command") | - |
| Komentar `--` sampai akhir baris | cocok | pg:sql-syntax-lexical.html, pg:tutorial-table.html | - |
| LIMIT tanpa ORDER BY tidak menjamin baris mana yang keluar | cocok | pg:queries-limit.html, pg:sql-select.html | - |
| `SELECT *` = semua kolom sesuai susunan tabel | cocok | pg:sql-select.html, pg:queries-select-lists.html | - |
| AS boleh dihilangkan kecuali alias adalah kata kunci seperti `from`; lupa koma menjadi alias | cocok | pg:queries-select-lists.html, pg:sql-select.html | - |
| ASC bawaan, DESC besar ke kecil | cocok | pg:queries-order.html, pg:sql-select.html | - |
| Kolom kedua ORDER BY hanya untuk nilai pertama yang sama; tanpa itu urutan tidak dijamin | cocok | pg:queries-order.html, pg:sql-select.html ("implementation-dependent order") | - |
| OFFSET melewati n baris, lalu LIMIT | cocok | pg:queries-limit.html, pg:sql-select.html | - |
| Hanya menulis `cities` membuat tabel tidak ditemukan | cocok | pg:runtime-config-client.html dan pg:ddl-schemas.html (search_path) + query (`search_path` = public, ERROR 42P01) | - |
| (tsql) Nama tanpa kutip dibaca huruf kecil di PostgreSQL | cocok | pg:sql-syntax-lexical.html | - |
| (tsql) `SELECT TOP 5` | cocok, diperjelas | ms:t-sql/queries/select-clause-transact-sql.md (TOP tanpa kurung "avoid this syntax"), ms:t-sql/queries/top-transact-sql.md | Diganti `TOP (5)` dan ditambah catatan anjuran dokumentasi |
| (tsql) "LIMIT tidak dikenal" | tidak ditemukan | Sintaks SELECT di ms:t-sql/queries/select-clause-transact-sql.md tidak memuat LIMIT; ms:connect/golang/migration-guide.md mengganti LIMIT | Diubah: "Sintaks SELECT di dokumentasi SQL Server tidak memuat LIMIT" |
| (tsql) OFFSET wajib bersama ORDER BY | cocok | ms:connect/golang/migration-guide.md ("requires ORDER BY"), ms:connect/golang/queries-statements.md, ms:t-sql/queries/select-order-by-clause-transact-sql.md | - |
| (tsql) Kutip ganda diterima dengan pengaturan bawaan | cocok | ms:relational-databases/databases/database-identifiers.md, ms:t-sql/statements/set-quoted-identifier-transact-sql.md | - |
| (tsql) "[ ] lebih umum dipakai" | tidak ditemukan | ms:t-sql/statements/alter-database-transact-sql-set-options.md hanya menyebut bracket "can always be used" | Diubah: "[ ] selalu diterima apa pun pengaturannya" |
| (tsql) Skema bawaan dbo; nama tiga bagian database.skema.tabel | cocok | ms:relational-databases/security/authentication-access/ownership-and-user-schema-separation.md, ms:t-sql/language-elements/transact-sql-syntax-conventions-transact-sql.md | - |
| (tsql) Komentar `--` sama | cocok | ms:t-sql/language-elements/comment-transact-sql.md | - |

## sql-02: WHERE dan NULL

| Klaim | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|
| WHERE hanya menyimpan baris yang syaratnya benar (salah atau NULL dibuang) | cocok | pg:queries-table-expressions.html (7.2.2) | - |
| Urutan SELECT, FROM, WHERE, ORDER BY, LIMIT | cocok | pg:queries-limit.html, pg:queries-table-expressions.html (sintaks) | - |
| Operator `= <> != < > <= >=` | cocok | pg:functions-comparison.html | - |
| `<>` bentuk standar, `!=` alias | cocok | pg:functions-comparison.html (Note) | - |
| Angka tanpa kutip; desimal pakai titik | cocok | pg:functions-math.html (contoh `5.0 / 2`) | - |
| Teks memakai kutip tunggal; kutip ganda untuk nama | cocok | pg:sql-syntax-lexical.html (4.1.2.1, 4.1.1) | - |
| Perbandingan teks membedakan huruf besar-kecil | cocok | pg:collation.html (collation deterministic: sama hanya kalau urutan byte sama) + query (`'jawa'` kosong) | - |
| `'YYYY-MM-DD'` selalu dibaca benar | cocok | pg:datatype-datetime.html Table 8.10 ("January 8 in any mode") | - |
| Tanggal tanpa jam dibaca jam 00:00:00 saat dibandingkan dengan timestamp | cocok | pg:functions-datetime.html ("a date value is assumed to represent midnight") | - |
| AND dikerjakan sebelum OR | cocok | pg:sql-syntax-lexical.html (4.1.6 Operator Precedence) | - |
| IN / NOT IN dengan daftar | cocok | pg:functions-comparisons.html (9.25.2) | - |
| BETWEEN mengikutkan kedua batas | cocok | pg:functions-comparison.html | - |
| LIKE `%` dan `_` | cocok | pg:functions-matching.html (9.7.1) | - |
| ILIKE tidak membedakan huruf besar-kecil | cocok | pg:functions-matching.html | - |
| "ILIKE tidak ada di SQL Server" (teks dan tsql) | tidak ditemukan | 3 query di `/microsoftdocs/sql-docs` (LIKE, ILIKE, migrasi) tidak memuat ILIKE; hanya ms:t-sql/functions/regexp-like-transact-sql.md | Diubah: "Dokumentasi SQL Server/T-SQL tidak memuat ILIKE" |
| Perbandingan dengan NULL tidak diketahui; `= null` tidak menemukan apa pun; pakai IS NULL | cocok | pg:functions-comparison.html | - |
| NOT IN dengan NULL | cocok | pg:functions-comparisons.html, pg:functions-subquery.html | - |
| Kolom boolean true/false; logika tiga nilai (term) | cocok | pg:datatype-boolean.html | - |
| (tsql) Perbandingan teks mengikuti collation; LIKE terpengaruh collation | cocok | ms:t-sql/language-elements/like-transact-sql.md, ms:t-sql/statements/collation-precedence-transact-sql.md | - |
| (tsql) Collation bawaan dipilih saat pemasangan, mengikuti bahasa Windows | cocok | ms:relational-databases/collations/set-or-change-the-server-collation.md, ms:relational-databases/collations/collation-and-unicode-support.md | - |
| (tsql) "untuk Windows berbahasa Indonesia, bawaannya Latin1_General_CI_AS" | tidak ditemukan | Tabel locale di ms:relational-databases/collations/collation-and-unicode-support.md yang dikembalikan Context7 terpotong sampai "English (Singapore)" (3 query) | Diganti contoh yang tercantum: en-US = SQL_Latin1_General_CP1_CI_AS |
| (tsql) "SQL Server tidak punya tipe boolean" | tidak ditemukan | ms:t-sql/data-types/bit-transact-sql.md (BIT 1, 0, NULL untuk nilai Boolean), ms:connect/golang/migration-guide.md (BOOLEAN → BIT) | Diubah: SQL Server memakai BIT; panduan migrasi memetakan boolean ke BIT |
| (tsql) `<>` dan `!=` dikenali; `<>` standar | cocok | ms:t-sql/language-elements/comparison-operators-transact-sql.md ("!= ... not ISO standard") | - |
| (tsql) `'YYYY-MM-DD'` aman untuk date/datetime2; datetime bergantung bahasa/DATEFORMAT; `'YYYYMMDD'` aman | cocok | ms:t-sql/data-types/date-transact-sql.md, ms:t-sql/data-types/datetime-transact-sql.md (format numerik ikut DATEFORMAT; ISO 8601 datetime butuh T), ms:connect/ado-net/sql/date-time-data.md | - |
| (tsql) Perilaku NULL sama | cocok | ms:t-sql/language-elements/not-equal-to-transact-sql-exclamation.md ("If either or both operands are NULL, NULL is returned") | - |

## sql-03: Kolom hitungan, CASE, dan nilai kosong

| Klaim | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|
| Operator `+ - * / %` | cocok | pg:functions-math.html (Table 9.4) | - |
| Kali, bagi, sisa bagi sebelum tambah dan kurang | cocok | pg:sql-syntax-lexical.html (4.1.6) | - |
| Tanpa alias, judul kolom `?column?` | cocok | pg:sql-select.html + query | - |
| Tipe integer, numeric, text, date, timestamp, boolean | cocok | pg:datatype-numeric.html, pg:datatype-datetime.html, pg:datatype-boolean.html | - |
| `numeric(12,2)` = 12 digit, 2 di belakang koma | cocok | pg:datatype-numeric.html (precision dan scale) | - |
| real/double precision perkiraan, tidak cocok untuk uang | cocok | pg:datatype-numeric.html (8.1.3) | - |
| `7 / 2` = 3 (pembagian bilangan bulat dipotong) | cocok | pg:functions-math.html ("division truncates the result towards zero") | - |
| `7 / 2.0` = 3.5000000000000000 | cocok | pg:functions-math.html (`5.0 / 2` → `2.5000000000000000`) + query | - |
| SELECT tanpa FROM | cocok | pg:sql-select.html (Omitted FROM) | - |
| ROUND(x, n); tanpa n ke bilangan bulat terdekat | cocok | pg:functions-math.html | - |
| CAST standar SQL, `::` khas PostgreSQL | cocok | pg:sql-expressions.html (4.2.9) | - |
| `order_ts::date` membuang jam | cocok | pg:datatype-datetime.html (date = "no time of day") | - |
| "cast(2.7 as integer) hasilnya 3, PostgreSQL membulatkan" | tidak ditemukan | 4 query di `/websites/postgresql/18`; yang muncul hanya round() dan int() milik pgbench (memotong). Perilaku terbukti lewat query, tapi tanpa rujukan | Catatan contoh diubah: bulatkan dulu dengan ROUND (`cast(round(shipping_fee) as integer)`). Semua shipping_fee di data bilangan bulat (query: 0 baris berdesimal), jadi hasil contoh tidak berubah |
| CASE diperiksa dari atas, berhenti di yang pertama benar; tanpa ELSE = NULL | cocok | pg:functions-conditional.html (9.18.1) | - |
| Hasil THEN/ELSE harus satu tipe; integer + numeric → numeric; teks + angka gagal | cocok | pg:typeconv-union-case.html + query (ERROR 22P02) | - |
| `10 + NULL` = NULL | cocok (tidak langsung) | pg:sql-createfunction.html (STRICT: null masuk → null keluar), pg:pgbench.html ("Functions and most operators return NULL on NULL input") + query | - |
| COALESCE nilai pertama yang tidak NULL | cocok | pg:functions-conditional.html (9.18.2) | - |
| NULLIF(a, b) = NULL kalau sama, a kalau tidak | cocok | pg:functions-conditional.html (9.18.3) | - |
| Bagi 0 membuat query gagal | cocok | pg:functions-conditional.html ("preventing a division-by-zero error") + query (ERROR 22012) | - |
| DISTINCT berlaku untuk semua kolom | cocok | pg:queries-select-lists.html (7.3.3), pg:sql-select.html | - |
| (tsql) ISNULL hanya dua nilai | cocok | ms:t-sql/language-elements/coalesce-transact-sql.md ("ISNULL takes only two parameters") | - |
| (tsql) "ISNULL tidak ada di PostgreSQL" | tidak ditemukan | pg:functions-conditional.html hanya memuat CASE, COALESCE, NULLIF, GREATEST, LEAST; pg:functions-comparison.html memuat `ISNULL` hanya sebagai cara lain menulis IS NULL | Diubah: "dokumentasi PostgreSQL tidak memuat fungsi ISNULL(a, b)" |
| (tsql) IIF singkatan CASE | cocok | ms:t-sql/functions/logical-functions-iif-transact-sql.md | - |
| (tsql) `::` di SQL Server dipakai untuk keperluan lain | cocok | ms:t-sql/language-elements/scope-resolution-operator-transact-sql.md, ms:t-sql/statements/grant-schema-permissions-transact-sql.md | - |
| (tsql) CAST/CONVERT | cocok | ms:t-sql/functions/cast-and-convert-transact-sql.md | - |
| (tsql) `7 / 2` = 3 di SQL Server | cocok | ms:t-sql/language-elements/divide-transact-sql.md | - |
| (tsql) `cast(2.7 as int)` = 2 | cocok | ms:t-sql/functions/cast-and-convert-transact-sql.md (numeric → int: Truncate) | Baris pg diganti `cast(round(2.7) as integer) = 3` (lihat klaim yang tidak ditemukan), ditambah `cast(round(2.7, 0) as int) = 3` |
| (tsql) `round(3.456, 1)` = 3.500 | cocok | ms:t-sql/functions/round-transact-sql.md (`ROUND(123.9994, 3)` → `123.9990`) | - |
| (tsql) text/numeric/boolean ↔ varchar/nvarchar, decimal, bit | cocok | ms:connect/golang/migration-guide.md | - |

## sql-04: Teks, tanggal, dan data mentah

| Klaim | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|
| UPPER/LOWER | cocok | pg:functions-string.html | - |
| LENGTH = jumlah karakter (spasi ikut) | cocok | pg:functions-string.html + query (`length(' ab ')` = 4) | - |
| TRIM membuang spasi awal dan akhir | cocok | pg:functions-string.html | - |
| REPLACE mengganti semua | cocok | pg:functions-string.html | - |
| `\|\|` dengan NULL → NULL | cocok (tidak langsung) | pg:textsearch-intro.html (coalesce dipakai agar satu NULL tidak membuat seluruh hasil `\|\|` NULL) + query | - |
| CONCAT mengabaikan NULL | cocok | pg:functions-string.html ("NULL arguments are ignored") | - |
| LEFT, SUBSTRING FROM … FOR …, penomoran mulai 1 | cocok | pg:functions-string.html | - |
| POSITION = 0 kalau tidak ditemukan | cocok | pg:functions-string.html | - |
| SPLIT_PART bagian ke-n | cocok | pg:functions-string.html | - |
| CURRENT_DATE (date), NOW() (timestamptz) | cocok | pg:functions-datetime.html | - |
| `date '2025-10-31'`, `timestamp '…'` | cocok | pg:sql-syntax-lexical.html (4.1.2.7, `type 'string'`) | - |
| timestamptz disimpan dalam UTC, ditampilkan sesuai zona waktu | cocok | pg:datatype-datetime.html (8.5.1.3, 8.5.3) | - |
| Tanggal − tanggal = jumlah hari; timestamp − timestamp = interval; + interval | cocok | pg:functions-datetime.html (tabel operator) | - |
| AGE → years mons days | cocok | pg:functions-datetime.html (`43 years 9 mons 27 days`) + query | - |
| DATE_TRUNC ke awal satuan; satuan year/quarter/week/day; timestamp tetap timestamp | cocok | pg:functions-datetime.html (9.9.2) | - |
| "Inilah cara standar untuk melaporkan data per bulan" | diperjelas | Kata "standar" bisa dibaca "standar SQL"; tidak ada rujukan | Diubah: "Fungsi ini dipakai untuk melaporkan data per bulan" (juga di summary) |
| EXTRACT menghasilkan angka; dow 0 = Minggu s.d. 6 = Sabtu | cocok | pg:functions-datetime.html (9.9.1) | - |
| Pola TO_CHAR YYYY, MM, DD, HH24, MI | cocok | pg:functions-formatting.html | - |
| TO_DATE(teks, pola) | cocok | pg:functions-formatting.html | - |
| Teks kosong bukan NULL | cocok | pg:sql-copy.html (CSV membedakan NULL dan teks kosong) | - |
| `''::numeric` gagal | cocok (tidak langsung) | pg:functions-info.html (input tidak sah membuat cast gagal) + query (ERROR 22P02) | - |
| "teks dibandingkan huruf demi huruf dari kiri" | tidak ditemukan | Tidak ada kalimat dokumentasi tentang cara itu | Diubah: perbandingan dilakukan sebagai teks, ditambah query yang bisa dijalankan pembaca (`select '01/12/2024' < '15/02/2023'` → true) |
| LIKE `'__/__/____'` | cocok | pg:functions-matching.html | - |
| (tsql) LEN tidak menghitung spasi di akhir | cocok | ms:t-sql/functions/len-transact-sql.md | - |
| (tsql) `\|\|` mulai SQL Server 2025 | cocok | ms:sql-server/what-s-new-in-sql-server-2025.md, ms:t-sql/language-elements/string-concatenation-pipes-transact-sql.md | - |
| (tsql) `+` dan `\|\|` → NULL kalau ada NULL; CONCAT anggap NULL teks kosong | cocok | ms:t-sql/statements/set-concat-null-yields-null-transact-sql.md (sejak SQL Server 2017 selalu ON), ms:t-sql/language-elements/string-concatenation-pipes-transact-sql.md, ms:t-sql/functions/concat-transact-sql.md | - |
| (tsql) CHARINDEX(cari, teks) | cocok | ms:t-sql/functions/charindex-transact-sql.md | - |
| (tsql) "SQL Server tidak punya SPLIT_PART" | tidak ditemukan | 3 query; yang ada hanya ms:t-sql/functions/string-split-transact-sql.md | Diubah: "Dokumentasi fungsi teks SQL Server tidak memuat SPLIT_PART" |
| (tsql) STRING_SPLIT menghasilkan baris | cocok | ms:t-sql/functions/string-split-transact-sql.md | - |
| (tsql) SUBSTRING(teks, awal, panjang) | cocok | ms:t-sql/functions/substring-transact-sql.md | - |
| (tsql) "Mulai SQL Server 2025, current_date juga tersedia" | tidak ditemukan (versi) | ms:t-sql/functions/current-date-transact-sql.md memuat fungsinya, tapi versi pertamanya tidak dikembalikan Context7 (3 query) | Diubah: dokumentasi terbaru memuat current_date; kalau belum dikenal, pakai `cast(getdate() as date)` |
| (tsql) getdate() datetime tanpa zona waktu | cocok | ms:t-sql/functions/date-and-time-data-types-and-functions-transact-sql.md | - |
| (tsql) DATEADD(day, 3, x) | cocok | ms:t-sql/functions/dateadd-transact-sql.md | - |
| (tsql) Nilai date tidak bisa dikurangi dengan minus; pakai DATEDIFF | cocok | ms:t-sql/language-elements/subtract-transact-sql.md ("Can't be used with date ..."), ms:t-sql/functions/datediff-transact-sql.md | - |
| (tsql) DATETRUNC sejak SQL Server 2022; DATEFROMPARTS | cocok | ms:t-sql/functions/datetrunc-transact-sql.md, ms:t-sql/functions/datefromparts-transact-sql.md | - |
| (tsql) YEAR(x) = DATEPART(year, x) | cocok | ms:t-sql/functions/year-transact-sql.md, ms:t-sql/functions/datepart-transact-sql.md | - |
| (tsql) FORMAT(x, 'yyyy-MM') | cocok | ms:t-sql/functions/format-transact-sql.md | - |
| (tsql) TRY_CONVERT(date, x, 103): 103 = dd/MM/yyyy, NULL kalau gagal | cocok | ms:t-sql/functions/try-convert-transact-sql.md, ms:t-sql/functions/cast-and-convert-transact-sql.md | - |

## sql-05: Agregasi dan GROUP BY

| Klaim | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|
| Tanpa GROUP BY, semua baris satu kumpulan, hasil satu baris | cocok | pg:sql-select.html (GROUP BY Clause) | - |
| COUNT(*) menghitung baris; COUNT(kolom) hanya yang tidak NULL | cocok | pg:sql-expressions.html (4.2.7) | - |
| COUNT(kolom), SUM, AVG, MIN, MAX melewati NULL | cocok | pg:sql-expressions.html, pg:functions-aggregate.html | - |
| COUNT(DISTINCT) = nilai berbeda yang tidak NULL | cocok | pg:sql-expressions.html | - |
| MIN/MAX untuk angka, tanggal, teks | cocok | pg:functions-aggregate.html | - |
| "SUM dan AVG hanya untuk angka" | **salah** | pg:functions-aggregate.html: `sum(interval)`, `avg(interval)`, `sum(money)` juga ada | Diubah: "dipakai untuk angka (PostgreSQL juga menerimanya untuk interval, yaitu lama waktu dari bab 4)" |
| AVG integer → numeric; SUM integer → bigint | cocok | pg:functions-aggregate.html + query | - |
| Nol baris: SUM/AVG/MIN/MAX NULL, COUNT 0 | cocok | pg:functions-aggregate.html | - |
| GROUP BY satu baris per kelompok; setelah WHERE, sebelum ORDER BY | cocok | pg:sql-select.html, pg:queries-table-expressions.html | - |
| GROUP BY tidak mengurutkan | cocok | pg:queries-order.html ("rows will be returned in an unspecified order") | - |
| ORDER BY boleh memakai alias | cocok | pg:queries-order.html, pg:sql-select.html | - |
| GROUP BY boleh berisi ekspresi | cocok | pg:sql-select.html | - |
| "Semua baris NULL dikumpulkan menjadi satu kelompok" (PostgreSQL) | tidak ditemukan | 3 query; dokumentasi PostgreSQL hanya menyatakannya untuk DISTINCT (pg:queries-select-lists.html) | Diubah menjadi pengamatan atas contoh keempat (query: satu baris NULL berisi 9.967 pesanan) |
| Kolom SELECT harus di GROUP BY atau di fungsi agregasi | cocok | pg:sql-select.html, pg:queries-table-expressions.html | - |
| Pesan `column "orders.order_id" must appear in the GROUP BY clause ...` | tidak ditemukan (teks pesan) | Context7 tidak memuat teks pesan ini | Dipertahankan: ini keluaran asli mesin latihan (query, ERROR 42803) dan bisa dicoba pembaca |
| "42803 adalah kode error untuk kesalahan pengelompokan (grouping error)" | tidak ditemukan | 3 query; tabel pg:errcodes-appendix.html yang dikembalikan terpotong sebelum kelas 42 | Diubah: "kode error yang ditampilkan PostgreSQL bersama pesan ini; kode yang sama muncul untuk kesalahan lain seputar fungsi agregasi" |
| GROUP BY dan ORDER BY boleh nomor posisi kolom | cocok | pg:sql-select.html, pg:queries-order.html | - |
| Pesan `aggregate functions are not allowed in GROUP BY` dan `GROUP BY position 3 is not in select list` | tidak ditemukan (teks pesan) | - | Dipertahankan: keluaran asli mesin latihan (query) |
| Urutan proses FROM → WHERE → GROUP BY/HAVING → SELECT → ORDER BY → LIMIT | cocok | pg:sql-select.html (Description) | - |
| WHERE tidak boleh berisi fungsi agregasi | cocok | pg:tutorial-agg.html; pesan dan kode 42803 dari query | - |
| Alias tidak bisa di WHERE/HAVING | cocok | pg:sql-select.html (SELECT List) | - |
| FILTER hanya membatasi satu fungsi agregasi | cocok | pg:sql-expressions.html, pg:tutorial-agg.html | - |
| COUNT bertipe bigint di PostgreSQL | cocok | pg:functions-aggregate.html | - |
| (tsql) COUNT bertipe int (2.147.483.647); COUNT(kolom)/COUNT(DISTINCT) tanpa NULL | cocok | ms:t-sql/functions/count-transact-sql.md | - |
| (tsql) COUNT_BIG bertipe bigint; COUNT yang melewati batas gagal dengan error 8115 | cocok | ms:t-sql/functions/count-big-transact-sql.md, ms:t-sql/functions/count-transact-sql.md | - |
| (tsql) AVG int → int | cocok | ms:t-sql/functions/avg-transact-sql.md | - |
| (tsql) "angka di belakang koma dibuang" (AVG int) | tidak ditemukan | Dokumentasi AVG hanya menyebut tipe hasil int, tidak menyebut dipotong atau dibulatkan | Diubah: "hasilnya bilangan bulat tanpa angka di belakang koma" |
| (tsql) SUM int → int | cocok | ms:t-sql/functions/sum-transact-sql.md | - |
| (tsql) "SQL Server tidak punya FILTER" | tidak ditemukan | 3 query; ms:t-sql/functions/aggregate-functions-transact-sql.md tidak memuat FILTER | Diubah: "Dokumentasi fungsi agregasi SQL Server tidak memuat FILTER" |
| (tsql) CASE tanpa ELSE = NULL; COUNT melewati NULL | cocok | ms:t-sql/language-elements/case-transact-sql.md, ms:t-sql/functions/aggregate-functions-transact-sql.md | - |
| (tsql) Alias SELECT tidak boleh di GROUP BY | cocok | ms:t-sql/queries/select-group-by-transact-sql.md, ms:t-sql/queries/select-clause-transact-sql.md, ms:relational-databases/errors-events/mssqlserver-207-database-engine-error.md | - |
| (tsql) GROUP BY hanya menyebut kolom/perhitungan; ORDER BY nomor posisi boleh tapi sebaiknya dihindari | cocok | ms:t-sql/queries/select-group-by-transact-sql.md (column-expression), ms:t-sql/queries/select-order-by-clause-transact-sql.md (Best practices) | - |
| (tsql) Msg 8120 | cocok | ms:relational-databases/errors-events/includes/sql-server-2019-database-engine-events-and-errors-8000-8999.md | Catatan: daftar versi 2022 yang dikembalikan Context7 tampak bergeser (8120 tertulis untuk HAVING). Teks di bab mengikuti daftar 2019 dan halaman GROUP BY |
| (tsql) NULL satu kelompok; WHERE dan HAVING sama | cocok | ms:t-sql/queries/select-group-by-transact-sql.md | - |

## Yang tidak dicek ulang

- Angka dari data TokoKita (sudah dicek dua peninjau). Hanya angka yang menyangkut perbaikan yang saya hitung ulang: kelompok NULL voucher (9.967) dan jumlah shipping_fee berdesimal (0).
- Kalimat ajaran yang bukan perilaku alat (misalnya "jangan menimpa data mentah", "pilih nilai pengganti dengan hati-hati").
