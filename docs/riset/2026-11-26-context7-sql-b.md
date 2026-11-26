# Verifikasi Context7: kelompok sql-b (bab sql-06 s.d. sql-10)

Tanggal: 26 November 2026. Semua rujukan di bawah berasal dari Context7 (`query-docs`):

- PostgreSQL 18: library ID `/websites/postgresql/18`
- PostgreSQL 16 (khusus catatan rilis): `/websites/postgresql/16`
- SQL Server / T-SQL: `/microsoftdocs/sql-docs`

URL di tabel adalah URL sumber yang dikembalikan Context7. Untuk dokumentasi SQL Server, Context7 mengembalikan berkas sumber di GitHub `microsoftdocs/sql-docs`; awalan `https://github.com/microsoftdocs/sql-docs/blob/live/docs/` disingkat menjadi `MS:` supaya tabel terbaca. Awalan `https://www.postgresql.org/docs/18/` disingkat menjadi `PG:`.

Teks pesan error PostgreSQL yang dikutip di bab (misalnya `column reference "customer_id" is ambiguous`) umumnya tidak muncul utuh di Context7. Perilakunya (query ditolak) punya rujukan Context7, dan teks pesannya dibuktikan dengan `node tools/query.mjs` di PostgreSQL 18.6. Baris seperti ini ditandai "cocok (pesan: query.mjs)".

Status: **cocok**, **salah** (sudah diperbaiki), **tidak ditemukan** (sudah diubah atau dihapus).

## sql-06: JOIN

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | Primary key unik, tidak boleh kosong; satu tabel paling banyak satu primary key | cocok | `/websites/postgresql/18`, PG:ddl-constraints.html, PG:sql-createtable.html | - |
| 2 | Primary key boleh gabungan beberapa kolom | cocok | `/websites/postgresql/18`, PG:sql-createtable.html ("a column or columns") | - |
| 3 | Foreign key merujuk ke primary key atau kolom yang dijamin unik | cocok | `/websites/postgresql/18`, PG:ddl-constraints.html | - |
| 4 | Foreign key boleh merujuk ke tabel yang sama | cocok | `/websites/postgresql/18`, PG:ddl-constraints.html (self-referential) | - |
| 5 | Foreign key boleh NULL; nilai bukan NULL wajib ada di tabel rujukan | cocok | `/websites/postgresql/18`, PG:ddl-constraints.html | - |
| 6 | `JOIN` sama dengan `INNER JOIN`; INNER dan OUTER boleh tidak ditulis | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html | - |
| 7 | INNER JOIN hanya menyimpan baris yang punya pasangan | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html | - |
| 8 | Kolom kembar tanpa alias ditolak (`... is ambiguous`) | cocok (pesan: query.mjs, 42702) | `/websites/postgresql/18`, PG:tutorial-join.html, PG:sql-expressions.html | - |
| 9 | Biasakan menulis alias di depan setiap kolom saat ada join | cocok | `/websites/postgresql/18`, PG:tutorial-join.html ("good style to qualify all column names") | - |
| 10 | AS boleh dihilangkan; setelah alias dipasang, nama asli tabel tidak boleh dipakai | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html, PG:sql-select.html | - |
| 11 | USING sama dengan ON berpasangan; kolom penghubung muncul sekali | cocok | `/websites/postgresql/18`, PG:sql-select.html, PG:queries-table-expressions.html | - |
| 12 | LEFT JOIN menyimpan semua baris kiri, kolom kanan diisi NULL; baris hasil paling sedikit sama dengan tabel kiri | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html, PG:sql-select.html | - |
| 13 | COUNT(*) menghitung baris berisi NULL, COUNT(kolom) tidak | cocok | `/websites/postgresql/18`, PG:sql-expressions.html (4.2.7) | - |
| 14 | Syarat di ON diterapkan saat join, di WHERE setelah join; berbeda hanya untuk outer join | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html | - |
| 15 | `a right join b` sama dengan `b left join a` | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html ("converse of a left join") | - |
| 16 | FULL JOIN menyimpan baris tanpa pasangan dari kedua sisi | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html | - |
| 17 | CROSS JOIN menghasilkan N × M baris; FROM dua tabel dipisah koma sama hasilnya | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html | - |
| 18 | JOIN biasa tanpa ON ditolak dengan syntax error | cocok (pesan: query.mjs, 42601) | `/websites/postgresql/18`, PG:sql-select.html ("a join condition must be specified") | - |
| 19 | Alias wajib untuk self join | cocok | `/websites/postgresql/18`, PG:sql-select.html (alias "for self-joins") | - |
| 20 | T-SQL: INNER boleh dihilangkan; OUTER boleh ditulis atau tidak | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/from-transact-sql.md | - |
| 21 | T-SQL: FROM dua tabel dipisah koma juga menghasilkan semua kombinasi | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/from-transact-sql.md (CROSS JOIN = old-style join tanpa WHERE) | - |
| 22 | T-SQL: "SQL Server tidak punya USING. Tata bahasa JOIN hanya menerima ON, kecuali CROSS JOIN" | tidak ditemukan (tidak ada dokumen yang menyatakan USING tidak ada; 3 query) | `/microsoftdocs/sql-docs`, MS:t-sql/queries/from-transact-sql.md, MS:relational-databases/performance/joins.md | Diubah menjadi "Dokumentasi FROM di SQL Server tidak memuat USING. Syarat join ditulis dengan ON; hanya CROSS JOIN yang ditulis tanpa ON." |
| 23 | T-SQL: AS boleh dihilangkan; nama asli tabel tidak boleh dipakai setelah alias | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/from-transact-sql.md, MS:relational-databases/errors-events/mssqlserver-4104-database-engine-error.md | - |
| 24 | T-SQL: syarat di ON sebelum join, di WHERE setelah join | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/from-transact-sql.md | - |
| 25 | T-SQL: satu primary key per tabel, kolomnya NOT NULL; foreign key menolak nilai yang tidak ada | cocok | `/microsoftdocs/sql-docs`, MS:relational-databases/tables/primary-and-foreign-key-constraints.md, MS:relational-databases/tables/create-foreign-key-relationships.md | - |

## sql-07: subquery, EXISTS, operasi himpunan

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | Subquery skalar: tepat satu baris satu kolom | cocok | `/websites/postgresql/18`, PG:sql-expressions.html (4.2.11) | - |
| 2 | Subquery skalar lebih dari satu baris ditolak (`more than one row returned ...`) | cocok (pesan: query.mjs, 21000) | `/websites/postgresql/18`, PG:sql-expressions.html | - |
| 3 | Subquery skalar tanpa baris tidak error, nilainya NULL | cocok | `/websites/postgresql/18`, PG:sql-expressions.html | - |
| 4 | Subquery untuk IN boleh banyak baris, satu kolom | cocok | `/websites/postgresql/18`, PG:functions-subquery.html | - |
| 5 | Kolom yang tidak ada di tabel subquery dicari di tabel query luar, tanpa error | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html ("naming scope of an outer query extends into its inner queries") | - |
| 6 | Subquery berkorelasi memakai kolom query luar, dihitung per baris luar | cocok | `/websites/postgresql/18`, PG:sql-expressions.html, PG:using-explain.html (SubPlan per baris luar) | - |
| 7 | COUNT atas nol baris 0; MAX dan SUM atas nol baris NULL | cocok | `/websites/postgresql/18`, PG:functions-aggregate.html | - |
| 8 | EXISTS benar kalau minimal satu baris; isi kolom tidak penting; kebiasaan `select 1` | cocok | `/websites/postgresql/18`, PG:functions-subquery.html (9.24.1) | - |
| 9 | IN/EXISTS tidak menyalin baris query luar | cocok | `/websites/postgresql/18`, PG:functions-subquery.html ("at most one output row per tab1 row") | - |
| 10 | `x NOT IN (a, b, NULL)` tidak pernah benar; IN dengan NULL dan tanpa cocok = NULL | cocok | `/websites/postgresql/18`, PG:functions-subquery.html (9.24.2, 9.24.3), PG:functions-comparisons.html | - |
| 11 | `> ALL` dan `> ANY`; SOME nama lain ANY; `= ANY` sama dengan IN; `<> ALL` sama dengan NOT IN | cocok | `/websites/postgresql/18`, PG:functions-subquery.html (9.24.4, 9.24.5) | - |
| 12 | ALL atas nol baris benar; ANY atas nol baris salah | cocok | `/websites/postgresql/18`, PG:functions-subquery.html | - |
| 13 | `avg(count(*))` ditolak (`aggregate function calls cannot be nested`) | cocok (pesan: query.mjs, 42803) | `/websites/postgresql/18`, PG:sql-expressions.html (argumen agregat tidak boleh berisi agregat) | - |
| 14 | Standar SQL mewajibkan alias tabel turunan; PostgreSQL boleh tanpa alias sejak versi 16 | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html; `/websites/postgresql/16`, https://www.postgresql.org/docs/16/release-16.html | - |
| 15 | Operasi himpunan: jumlah kolom sama, tipe cocok | cocok | `/websites/postgresql/18`, PG:queries-union.html | - |
| 16 | Pesan `each UNION query must have the same number of columns` | cocok (pesan: query.mjs, 42601) | `/websites/postgresql/18`, PG:queries-union.html | - |
| 17 | Pesan `UNION types integer and text cannot be matched` | cocok | `/websites/postgresql/18`, PG:typeconv-union-case.html (contoh pesan yang sama bentuknya) + query.mjs | - |
| 18 | Nama kolom hasil diambil dari query pertama | cocok | `/websites/postgresql/18`, PG:typeconv-union-case.html (contoh `AS "text"`) + query.mjs | - |
| 19 | ORDER BY ditulis sekali di akhir, berlaku untuk seluruh hasil | cocok | `/websites/postgresql/18`, PG:queries-order.html, PG:sql-select.html | - |
| 20 | Tanpa kurung: INTERSECT dulu, UNION dan EXCEPT kiri ke kanan | cocok | `/websites/postgresql/18`, PG:queries-union.html | - |
| 21 | UNION membuang baris kembar; operasi himpunan menganggap dua NULL sama | cocok | `/websites/postgresql/18`, PG:queries-union.html ("in the same way as DISTINCT"), PG:queries-select-lists.html ("Null values are considered equal") + query.mjs | - |
| 22 | PostgreSQL punya INTERSECT ALL dan EXCEPT ALL | cocok | `/websites/postgresql/18`, PG:sql-select.html | - |
| 23 | T-SQL: subquery skalar lebih dari satu nilai ditolak | cocok | `/microsoftdocs/sql-docs`, MS:relational-databases/performance/subqueries.md, daftar error 512 | - |
| 24 | T-SQL: NULL di IN/NOT IN menghasilkan UNKNOWN | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/language-elements/in-transact-sql.md | - |
| 25 | T-SQL: dokumentasi biasa menulis `exists (select * ...)` | cocok | `/microsoftdocs/sql-docs`, MS:relational-databases/performance/subqueries.md | - |
| 26 | T-SQL: SOME = ANY; `= ANY` sama dengan IN; `<> ALL` sama dengan NOT IN | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/language-elements/some-any-transact-sql.md, MS:relational-databases/performance/subqueries.md | - |
| 27 | T-SQL: alias tabel turunan wajib | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/from-select-transact-sql.md ("A derived table requires a table alias") | - |
| 28 | T-SQL: ORDER BY di subquery hanya dengan TOP atau OFFSET … FETCH, dan hanya menentukan baris yang diambil | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-order-by-clause-transact-sql.md | - |
| 29 | T-SQL: UNION/UNION ALL sama; ORDER BY hanya di akhir | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/language-elements/set-operators-union-transact-sql.md, MS:t-sql/queries/select-order-by-clause-transact-sql.md | - |
| 30 | T-SQL: urutan INTERSECT lalu EXCEPT/UNION; dua NULL sama; nama kolom dari query kiri | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/language-elements/set-operators-except-and-intersect-transact-sql.md | - |
| 31 | T-SQL: "Tata bahasa SQL Server tidak punya INTERSECT ALL dan EXCEPT ALL" | tidak ditemukan sebagai pernyataan; sintaks hanya `{ EXCEPT \| INTERSECT }` | `/microsoftdocs/sql-docs`, MS:t-sql/language-elements/set-operators-except-and-intersect-transact-sql.md | Diubah menjadi "Dokumentasi sintaks INTERSECT dan EXCEPT di SQL Server tidak memuat bentuk INTERSECT ALL dan EXCEPT ALL". |
| 32 | T-SQL: kolom yang tidak ada di tabel subquery dicari di tabel query luar tanpa error | cocok | `/microsoftdocs/sql-docs`, MS:relational-databases/performance/subqueries.md | - |

## sql-08: CTE, WITH RECURSIVE, generate_series

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | CTE seperti tabel sementara yang hanya ada selama satu query | cocok | `/websites/postgresql/18`, PG:queries-with.html | - |
| 2 | Query berikutnya ditolak (`relation "nama_langkah" does not exist`) | cocok (pesan: query.mjs, 42P01) | `/websites/postgresql/18`, PG:queries-with.html | - |
| 3 | Nama CTE ditulis tanpa nama skema | cocok | `/websites/postgresql/18`, PG:sql-createview.html ("CTE's name cannot be schema-qualified") | - |
| 4 | Tanpa RECURSIVE, CTE hanya merujuk ke CTE di atasnya | cocok | `/websites/postgresql/18`, PG:sql-select.html (WITH Clause) | - |
| 5 | RECURSIVE ditulis sekali, langsung setelah WITH | cocok | `/websites/postgresql/18`, PG:sql-select.html | - |
| 6 | Daftar nama kolom CTE boleh ditulis (`angka (n)`) | cocok | `/websites/postgresql/18`, PG:queries-with.html (`t(n)`) | - |
| 7 | CTE non-rekursif dipakai sekali dilebur ke query utama; dipakai lebih dari sekali dihitung terpisah | cocok | `/websites/postgresql/18`, PG:queries-with.html (7.8.3) | - |
| 8 | "Bentuknya selalu dua bagian yang disambung UNION ALL" | salah | `/websites/postgresql/18`, PG:queries-with.html ("then UNION (or UNION ALL)"), PG:sql-select.html | Diubah: "Bentuknya dua bagian yang disambung UNION ALL (PostgreSQL juga menerima UNION, dibahas di akhir bab ini)". |
| 9 | Istilah non-recursive term / recursive term; cara kerja tabel kerja | cocok | `/websites/postgresql/18`, PG:queries-with.html (Recursive Query Evaluation) | - |
| 10 | Rekursi tanpa ujung kalau bagian rekursif selalu menghasilkan baris | cocok | `/websites/postgresql/18`, PG:queries-with.html (7.8.2.2), PG:sql-select.html | - |
| 11 | "PostgreSQL tidak punya batas jumlah putaran bawaan" (teks, tabel tsql, model soal explain) | tidak ditemukan (3 query; hanya peringatan "loop indefinitely") | `/websites/postgresql/18`, PG:queries-with.html, PG:runtime-config-resource.html | Diubah menjadi "Dokumentasi itu tidak menyebut batas jumlah putaran bawaan, jadi batasnya harus kamu tulis sendiri" (3 tempat). |
| 12 | UNION membuang baris kembar dan bisa menghentikan putaran, tetapi tidak menolong kalau ada kolom kedalaman | cocok | `/websites/postgresql/18`, PG:queries-with.html | - |
| 13 | PostgreSQL punya klausa CYCLE | cocok | `/websites/postgresql/18`, PG:queries-with.html, PG:sql-select.html | - |
| 14 | generate_series: langkah bawaan 1 untuk angka | cocok | `/websites/postgresql/18`, PG:functions-srf.html | - |
| 15 | Awal > akhir dengan langkah positif: nol baris; langkah 0 error | cocok (+ query.mjs, 22023) | `/websites/postgresql/18`, PG:functions-srf.html | - |
| 16 | Untuk tanggal, langkahnya interval | cocok | `/websites/postgresql/18`, PG:functions-srf.html | - |
| 17 | "PostgreSQL tidak punya generate_series khusus untuk tipe date" | tidak ditemukan sebagai pernyataan; tabel fungsi hanya memuat integer, bigint, numeric, timestamp, timestamptz | `/websites/postgresql/18`, PG:functions-srf.html (Table 9.69) | Diubah menjadi "daftar generate_series di dokumentasi PostgreSQL tidak memuat versi untuk tipe date (yang ada: ...)". |
| 18 | Input date diubah ke timestamptz | cocok (query.mjs: `pg_typeof` = timestamp with time zone) | `/websites/postgresql/18`, PG:functions-srf.html | - |
| 19 | "Alias yang diberikan (as n) sekaligus menjadi nama kolomnya" | tidak ditemukan (3 query; dokumen hanya menyebut kolom bernama fungsi kalau tidak ada alias kolom) | `/websites/postgresql/18`, PG:queries-table-expressions.html (7.2.1.4) | Diubah menjadi kalimat yang menunjuk hasil contoh: "Di contoh bab ini, alias itu langsung dipakai sebagai nama kolom (select n), seperti terlihat di hasil contoh pertama." |
| 20 | T-SQL: pernyataan sebelum WITH di satu batch harus diakhiri titik koma | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/with-common-table-expression-transact-sql.md | - |
| 21 | T-SQL: CTE hanya merujuk ke CTE sebelumnya | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/with-common-table-expression-transact-sql.md ("Forward referencing isn't allowed") | - |
| 22 | T-SQL: ORDER BY di CTE hanya dengan TOP atau OFFSET/FETCH; PostgreSQL mengizinkan | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/with-common-table-expression-transact-sql.md; `/websites/postgresql/18`, PG:queries-with.html | - |
| 23 | T-SQL: "SQL Server tidak punya kata RECURSIVE" | tidak ditemukan sebagai pernyataan; sintaks WITH tidak memuat RECURSIVE | `/microsoftdocs/sql-docs`, MS:t-sql/queries/with-common-table-expression-transact-sql.md (Syntax) | Diubah menjadi "Sintaks WITH di dokumentasi SQL Server tidak memuat kata RECURSIVE. CTE menjadi rekursif kalau merujuk ke dirinya sendiri." |
| 24 | T-SQL: hanya UNION ALL di antara anchor dan bagian rekursif; bagian rekursif tanpa GROUP BY, DISTINCT, TOP, LEFT/RIGHT JOIN, subquery | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/with-common-table-expression-transact-sql.md | - |
| 25 | T-SQL: tipe kolom bagian rekursif harus sama dengan anchor; contoh resmi memakai CONVERT(VARCHAR(255), …) | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/with-common-table-expression-transact-sql.md | - |
| 26 | T-SQL: MAXRECURSION bawaan 100, rentang 0–32.767, 0 tanpa batas, error saat terlampaui, OPTION hanya di query terluar | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/hints-transact-sql-query.md, MS:t-sql/queries/with-common-table-expression-transact-sql.md | - |
| 27 | T-SQL: GENERATE_SERIES sejak SQL Server 2022, compatibility level minimal 160 | cocok (level 160 adalah level SQL Server 2022) | `/microsoftdocs/sql-docs`, MS:t-sql/functions/generate-series-transact-sql.md, MS:relational-databases/databases/view-or-change-the-compatibility-level-of-a-database.md | - |
| 28 | T-SQL: "kecuali pengaturan ALLOW_BUILTIN_TVF_IN_ALL_COMPAT_LEVELS dinyalakan" (tanpa batasan platform) | salah | `/microsoftdocs/sql-docs`, MS:t-sql/statements/alter-database-scoped-configuration-transact-sql.md ("Applies to: Azure SQL Database and SQL database in Fabric", "in preview") | Ditambah: pengaturan itu hanya berlaku di Azure SQL Database dan SQL database di Microsoft Fabric, bukan di SQL Server yang dipasang sendiri, dan masih pratinjau. |
| 29 | T-SQL: database yang dipindah dari versi lama tetap memakai level lamanya; cek di sys.databases | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/statements/alter-database-transact-sql-compatibility-level.md | - |
| 30 | T-SQL: kolom hasil GENERATE_SERIES bernama value; hanya tipe angka | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/generate-series-transact-sql.md | - |
| 31 | T-SQL: hasil CTE tidak disimpan; setiap rujukan menjalankan ulang query-nya | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/with-common-table-expression-transact-sql.md ("aren't materialized") | - |

## sql-09: window function 1

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | Window function menghitung dari baris yang berhubungan, tanpa meringkas baris | cocok | `/websites/postgresql/18`, PG:tutorial-window.html | - |
| 2 | `OVER ()` berarti semua baris hasil query | cocok | `/websites/postgresql/18`, PG:tutorial-window.html, PG:sql-expressions.html | - |
| 3 | COUNT, SUM, AVG, MIN, MAX bisa dipakai dengan OVER | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 4 | Window function dihitung setelah WHERE, GROUP BY, HAVING; boleh memakai hasil agregasi | cocok | `/websites/postgresql/18`, PG:queries-table-expressions.html (7.2.5), PG:tutorial-window.html | - |
| 5 | LIMIT tidak mengubah isi jendela | cocok | `/websites/postgresql/18`, PG:sql-select.html (Description langkah 5 dan 9) | - |
| 6 | PARTITION BY membagi baris, mirip GROUP BY tanpa meringkas | cocok | `/websites/postgresql/18`, PG:sql-expressions.html (4.2.8) | - |
| 7 | ROW_NUMBER mulai 1 di setiap partisi | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 8 | ORDER BY di OVER hanya mengatur hitungan; tanpa ORDER BY query, urutan apa pun yang paling cepat | cocok | `/websites/postgresql/18`, PG:sql-expressions.html, PG:sql-select.html | - |
| 9 | RANK = nomor baris pertama di kelompok serinya; DENSE_RANK menghitung kelompok seri | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 10 | Istilah *peers* untuk nilai seri | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 11 | Dengan ORDER BY: dari awal partisi sampai baris sekarang termasuk baris seri; tanpa ORDER BY: seluruh partisi (bagian Window Function Calls) | cocok | `/websites/postgresql/18`, PG:sql-expressions.html (4.2.8), PG:tutorial-window.html | - |
| 12 | LAG/LEAD: jarak bawaan 1, pengganti bawaan NULL | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 13 | Window function hanya di SELECT dan ORDER BY; ditolak di WHERE (42P20) dan HAVING | cocok (pesan: query.mjs) | `/websites/postgresql/18`, PG:tutorial-window.html, PG:sql-expressions.html | - |
| 14 | Saring hasil window function lewat subquery | cocok | `/websites/postgresql/18`, PG:tutorial-window.html | - |
| 15 | PostgreSQL membolehkan ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD tanpa ORDER BY di OVER | cocok (+ query.mjs) | `/websites/postgresql/18`, PG:sql-expressions.html ("Without ORDER BY, rows are processed in an unspecified order") | - |
| 16 | row_number, rank, dense_rank bertipe bigint | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 17 | PostgreSQL 18 belum mendukung IGNORE NULLS (error sintaks) | cocok (+ query.mjs, 42601) | `/websites/postgresql/18`, PG:functions-window.html (Note) | - |
| 18 | `count(distinct x) over` ditolak di PostgreSQL (0A000) | tidak ditemukan untuk fungsi agregasi (3 query; dokumen hanya menyebut fungsi khusus window) | `/websites/postgresql/18`, PG:sql-expressions.html | Catatan tsql diubah: "Dokumentasi OVER di SQL Server menyatakan OVER tidak bisa dipakai dengan agregasi DISTINCT. PostgreSQL 18 juga menolaknya, dengan pesan di kolom kiri." Pesan PostgreSQL dibuktikan query.mjs. |
| 19 | T-SQL: DISTINCT tidak boleh dengan OVER | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-over-clause-transact-sql.md, MS:t-sql/functions/count-transact-sql.md | - |
| 20 | T-SQL: frame bawaan sama (RANGE UNBOUNDED PRECEDING AND CURRENT ROW, termasuk seri; tanpa ORDER BY seluruh partisi) | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-over-clause-transact-sql.md | - |
| 21 | T-SQL: ORDER BY di OVER wajib untuk ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/row-number-transact-sql.md, rank-, dense-rank-, lag-, lead-transact-sql.md | - |
| 22 | T-SQL: LAG/LEAD sejak SQL Server 2012; IGNORE NULLS sejak SQL Server 2022 | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/lag-transact-sql.md | - |
| 23 | T-SQL: DATEDIFF(day, …) untuk jarak hari | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/datediff-transact-sql.md | - |
| 24 | T-SQL: ROW_NUMBER, RANK, DENSE_RANK bertipe bigint | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/row-number-transact-sql.md, dense-rank-transact-sql.md | - |
| 25 | T-SQL: AVG kolom int menghasilkan int | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/avg-transact-sql.md | - |
| 26 | T-SQL: Msg 4108 "Windowed functions can only appear in the SELECT or ORDER BY clauses." | cocok | `/microsoftdocs/sql-docs`, daftar error 4000-4999 (sql-server-2019-database-engine-events-and-errors-4000-4999.md) | - |

## sql-10: window function 2

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | Frame ditulis dengan ROWS/RANGE setelah ORDER BY; arti PRECEDING, FOLLOWING, CURRENT ROW, UNBOUNDED | cocok | `/websites/postgresql/18`, PG:sql-expressions.html (4.2.8), PG:sql-select.html | - |
| 2 | "Awal frame tidak boleh berada setelah akhirnya" | salah | `/websites/postgresql/18`, PG:sql-expressions.html ("ROWS BETWEEN 7 PRECEDING AND 8 PRECEDING is allowed"), PG:sql-select.html | Diubah: jenis batas akhir tidak boleh berada di depan jenis batas awal dalam urutan UNBOUNDED PRECEDING, n PRECEDING, CURRENT ROW, n FOLLOWING, UNBOUNDED FOLLOWING; contoh `rows between current row and 2 preceding` ditolak (dibuktikan query.mjs, 42P20). |
| 3 | Bagian akhir tidak ditulis = CURRENT ROW | cocok | `/websites/postgresql/18`, PG:sql-expressions.html | - |
| 4 | "Frame hanya dipakai oleh fungsi agregat dan FIRST_VALUE/LAST_VALUE" | salah (kurang lengkap: nth_value juga memakai frame) | `/websites/postgresql/18`, PG:functions-window.html | Dibatasi: "Dari fungsi-fungsi yang dibahas di bab ini dan bab sebelumnya, frame hanya dipakai oleh ..." |
| 5 | ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, LEAD melihat seluruh partisi; frame tidak mengubah hasil | cocok (+ query.mjs) | `/websites/postgresql/18`, PG:functions-window.html (Table 9.67), PG:sql-expressions.html | - |
| 6 | Frame bawaan RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW | cocok | `/websites/postgresql/18`, PG:sql-expressions.html, PG:sql-select.html | - |
| 7 | ROWS: CURRENT ROW = tepat baris sekarang; RANGE: termasuk baris setara | cocok | `/websites/postgresql/18`, PG:sql-expressions.html, PG:sql-select.html | - |
| 8 | Dokumentasi memperingatkan ROWS bisa tak terduga kalau ORDER BY tidak unik | cocok | `/websites/postgresql/18`, PG:sql-select.html | - |
| 9 | FIRST_VALUE/LAST_VALUE dari baris pertama/terakhir frame; jebakan LAST_VALUE | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 10 | RANGE dengan jarak interval; hanya kalau ORDER BY tepat satu kolom | cocok | `/websites/postgresql/18`, PG:sql-select.html | - |
| 11 | NTILE membagi sebisa mungkin sama besar, berdasarkan jumlah baris; hasil integer | cocok | `/websites/postgresql/18`, PG:functions-window.html | - |
| 12 | "Kelompok yang lebih besar diletakkan lebih dulu" (teks, soal sql-10-02) | tidak ditemukan untuk PostgreSQL (3 query); ditemukan untuk SQL Server | `/websites/postgresql/18`, PG:functions-window.html; `/microsoftdocs/sql-docs`, MS:t-sql/functions/ntile-transact-sql.md | Teks ditambah: "Dokumentasi PostgreSQL hanya menyebut pembagiannya 'sebisa mungkin sama besar'; urutan ini terlihat dari hasil query, dan dokumentasi SQL Server menuliskannya sebagai aturan." Alasan soal sql-10-02 diberi sumber yang sama. Hasil 3, 3, 2, 2 untuk 10 baris dibuktikan query.mjs. |
| 13 | date dikurangi bilangan bulat menghasilkan date; date dikurangi bigint ditolak | cocok (+ query.mjs, 42883) | `/websites/postgresql/18`, PG:functions-datetime.html (hanya `date - integer`) | - |
| 14 | timestamp dikurangi timestamp menghasilkan interval | cocok | `/websites/postgresql/18`, PG:functions-datetime.html | - |
| 15 | PostgreSQL punya mode GROUPS | cocok | `/websites/postgresql/18`, PG:sql-expressions.html | - |
| 16 | T-SQL: ROWS dan RANGE sejak SQL Server 2012; bentuk singkat `rows 6 preceding` sama artinya | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-over-clause-transact-sql.md | - |
| 17 | T-SQL: frame bawaan RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-over-clause-transact-sql.md | - |
| 18 | T-SQL: RANGE tidak menerima n PRECEDING/FOLLOWING | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-over-clause-transact-sql.md | - |
| 19 | T-SQL: sintaks OVER hanya mengenal ROWS dan RANGE (tidak ada GROUPS) | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-window-transact-sql.md (`{ ROWS \| RANGE }`) | - |
| 20 | T-SQL: fungsi peringkat tidak menerima ROWS/RANGE | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/queries/select-over-clause-transact-sql.md, MS:t-sql/functions/rank-transact-sql.md | - |
| 21 | T-SQL: FIRST_VALUE/LAST_VALUE wajib ORDER BY; jebakan frame bawaan sama; IGNORE NULLS sejak 2022 | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/first-value-transact-sql.md, last-value-transact-sql.md | - |
| 22 | T-SQL: NTILE kelompok besar lebih dulu; ORDER BY wajib | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/ntile-transact-sql.md | - |
| 23 | T-SQL: NTILE bertipe bigint | tidak ditemukan (3 query; bagian Return types NTILE tidak muncul) | `/microsoftdocs/sql-docs`, MS:t-sql/functions/ntile-transact-sql.md | Dihapus dari catatan tsql. Tipe integer PostgreSQL tetap ditulis (cocok). |
| 24 | T-SQL: GENERATE_SERIES sejak SQL Server 2022, level 160, hanya angka | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/generate-series-transact-sql.md | - |
| 25 | T-SQL: date tidak bisa dikurangi dengan tanda minus | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/language-elements/subtract-transact-sql.md ("Can't be used with date ...") | - |
| 26 | T-SQL: DATEADD menerima ROW_NUMBER sebagai jumlah hari | cocok (argumen "expression that can resolve to an int"; bigint sejak SQL Server 2025) | `/microsoftdocs/sql-docs`, MS:t-sql/functions/dateadd-transact-sql.md | - |
| 27 | T-SQL: DATEDIFF menghitung batas satuan yang dilewati | cocok | `/microsoftdocs/sql-docs`, MS:t-sql/functions/datediff-transact-sql.md (contoh datepart boundaries) | - |

## Ringkasan

- Klaim yang dicek: 141 (sql-06: 25, sql-07: 32, sql-08: 31, sql-09: 26, sql-10: 27).
- Salah dan sudah diperbaiki: 4 (sql-08 #8, sql-08 #28, sql-10 #2, sql-10 #4).
- Tidak ditemukan di Context7 dan sudah diubah atau dihapus: 9 (sql-06 #22, sql-07 #31, sql-08 #11, #17, #19, #23, sql-09 #18, sql-10 #12, #23).
- `node tools/check-content.mjs --lesson <id>` lulus untuk kelima bab.
- Semua rujukan berasal dari Context7. Bukti tambahan dari `node tools/query.mjs` (PostgreSQL 18.6) dipakai untuk teks pesan error dan tipe hasil, dan selalu disertai rujukan Context7 untuk perilakunya.
