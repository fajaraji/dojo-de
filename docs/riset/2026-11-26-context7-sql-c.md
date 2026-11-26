# Verifikasi ulang bab SQL 11–14 dengan Context7 (kelompok sql-c)

Tanggal: 26 November 2026. Berkas yang dicek: `dojo/content/sql-11.js` (analisis waktu), `sql-12.js` (DDL, DML, constraint, MERGE, transaksi), `sql-13.js` (view, index, EXPLAIN), dan `sql-14.js` (ujian gaya wawancara).

## Cara memeriksa

- **Klaim** berarti setiap pernyataan tentang perilaku PostgreSQL atau SQL Server yang bisa benar atau salah: di teks bagian, catatan contoh, tabel "Di SQL Server" (field `tsql`), daftar istilah (`terms`), `goals`, `summary`, dan soal (`prompt`, `hint`, `why`, `model`). Angka dari data TokoKita tidak dicek ulang, sesuai `VERIFY-CONTEXT7.md`.
- **Rujukan**: semua rujukan berasal dari Context7 (`query-docs`). Ada dua pustaka:
  - PostgreSQL 18: library ID `/websites/postgresql/18`. URL sumber berawalan `https://www.postgresql.org/docs/18/`.
  - SQL Server / T-SQL: library ID `/microsoftdocs/sql-docs`. URL sumber berawalan `https://github.com/microsoftdocs/sql-docs/blob/live/docs/`. Ini repositori sumber halaman learn.microsoft.com.
- **Bukti tambahan**: `node tools/query.mjs` dan skrip kecil di `scratchpad/c7-sql-c/` menjalankan PostgreSQL 18 asli (PGlite). Bukti ini dipakai untuk teks pesan error dan nama constraint otomatis. Setiap klaim tetap punya rujukan Context7 untuk perilakunya.
- **Status**:
  - *cocok*: sesuai dokumentasi di Context7.
  - *salah*: tidak sesuai, lalu diperbaiki di berkas bab.
  - *tidak ditemukan*: setelah 2–3 query, Context7 tidak memuat pernyataan itu. Kalimatnya diubah menjadi kalimat yang bisa dipastikan.

### Singkatan sumber

PostgreSQL 18 (`/websites/postgresql/18`, awalan `https://www.postgresql.org/docs/18/`):

| Singkatan | Halaman |
|---|---|
| PG-agg | functions-aggregate.html |
| PG-alter | sql-altertable.html |
| PG-analyze | sql-analyze.html |
| PG-begin | sql-begin.html |
| PG-bitmap | indexes-bitmap-scans.html |
| PG-cond | functions-conditional.html |
| PG-cmp | functions-comparison.html |
| PG-con | ddl-constraints.html |
| PG-createidx | sql-createindex.html |
| PG-createmv | sql-creatematerializedview.html |
| PG-createschema | sql-createschema.html |
| PG-createtable | sql-createtable.html |
| PG-ctas | sql-createtableas.html |
| PG-createview | sql-createview.html |
| PG-ddlalter | ddl-alter.html |
| PG-delete | sql-delete.html, dml-delete.html |
| PG-depend | ddl-depend.html |
| PG-dropmv | sql-dropmaterializedview.html |
| PG-dropschema | sql-dropschema.html |
| PG-droptable | sql-droptable.html |
| PG-dropview | sql-dropview.html |
| PG-dt | functions-datetime.html |
| PG-err | errcodes-appendix.html, error-message-reporting.html |
| PG-explain | sql-explain.html |
| PG-expr | sql-expressions.html |
| PG-expridx | indexes-expressional.html |
| PG-gloss | glossary.html |
| PG-identity | ddl-identity-columns.html |
| PG-idxintro | indexes-intro.html |
| PG-idxorder | indexes-ordering.html |
| PG-idxtypes | indexes-types.html |
| PG-idxuniq | indexes-unique.html |
| PG-insert | sql-insert.html |
| PG-lex | sql-syntax-lexical.html |
| PG-math | functions-math.html |
| PG-merge | sql-merge.html |
| PG-mergefn | functions-merge-support.html |
| PG-multicol | indexes-multicolumn.html |
| PG-numeric | datatype-numeric.html |
| PG-opclass | indexes-opclass.html |
| PG-pgstats | view-pg-stats.html |
| PG-pgviews | view-pg-views.html |
| PG-plannerstats | planner-stats.html |
| PG-populate | populate.html |
| PG-protocol | protocol-flow.html |
| PG-qte | queries-table-expressions.html |
| PG-refresh | sql-refreshmaterializedview.html |
| PG-rel18 | release-18.html |
| PG-rulesmv | rules-materializedviews.html |
| PG-schemas | ddl-schemas.html |
| PG-select | sql-select.html |
| PG-sellist | queries-select-lists.html |
| PG-srf | functions-srf.html |
| PG-string | functions-string.html |
| PG-subq | functions-subquery.html |
| PG-truncate | sql-truncate.html |
| PG-typeconv | typeconv-query.html |
| PG-update | sql-update.html, dml-update.html |
| PG-usingexplain | using-explain.html |
| PG-vacuum | routine-vacuuming.html |
| PG-winf | functions-window.html |
| PG-wintut | tutorial-window.html |
| PG-with | queries-with.html |

SQL Server (`/microsoftdocs/sql-docs`, awalan `https://github.com/microsoftdocs/sql-docs/blob/live/docs/`):

| Singkatan | Halaman |
|---|---|
| MS-actualplan | relational-databases/performance/display-an-actual-execution-plan.md |
| MS-altertable | t-sql/statements/alter-table-transact-sql.md |
| MS-arithabort | t-sql/statements/set-arithabort-transact-sql.md, set-arithignore-transact-sql.md |
| MS-bit | t-sql/data-types/bit-transact-sql.md |
| MS-clustered | relational-databases/indexes/clustered-and-nonclustered-indexes-described.md |
| MS-coalesce | t-sql/language-elements/coalesce-transact-sql.md |
| MS-collation | relational-databases/collations/set-or-change-the-server-collation.md |
| MS-compat | relational-databases/databases/view-or-change-the-compatibility-level-of-a-database.md |
| MS-concat | t-sql/functions/concat-transact-sql.md |
| MS-concatnull | t-sql/statements/set-concat-null-yields-null-transact-sql.md |
| MS-count | t-sql/functions/count-transact-sql.md, count-big-transact-sql.md |
| MS-createidx | t-sql/statements/create-index-transact-sql.md |
| MS-createschema | t-sql/statements/create-schema-transact-sql.md |
| MS-createview | t-sql/statements/create-view-transact-sql.md |
| MS-currentdate | t-sql/functions/current-date-transact-sql.md, sql-server/what-s-new-in-sql-server-2025.md |
| MS-dateadd | t-sql/functions/dateadd-transact-sql.md |
| MS-datediff | t-sql/functions/datediff-transact-sql.md |
| MS-datetrunc | t-sql/functions/datetrunc-transact-sql.md |
| MS-delete | t-sql/statements/delete-transact-sql.md |
| MS-divide | t-sql/language-elements/divide-transact-sql.md |
| MS-droptable | t-sql/statements/drop-table-transact-sql.md |
| MS-dropview | t-sql/statements/drop-view-transact-sql.md |
| MS-eomonth | t-sql/functions/eomonth-transact-sql.md |
| MS-estplan | relational-databases/performance/display-the-estimated-execution-plan.md |
| MS-except | t-sql/language-elements/set-operators-except-and-intersect-transact-sql.md |
| MS-genseries | t-sql/functions/generate-series-transact-sql.md |
| MS-go | t-sql/language-elements/sql-server-utilities-statements-go.md |
| MS-helpindex | relational-databases/system-stored-procedures/sp-helpindex-transact-sql.md |
| MS-identity | t-sql/statements/create-table-transact-sql-identity-property.md, set-identity-insert-transact-sql.md |
| MS-ifelse | t-sql/language-elements/if-else-transact-sql.md |
| MS-indexedview | relational-databases/views/create-indexed-views.md |
| MS-isnull | t-sql/functions/isnull-transact-sql.md |
| MS-lag | t-sql/functions/lag-transact-sql.md |
| MS-like | t-sql/language-elements/like-transact-sql.md |
| MS-merge | t-sql/statements/merge-transact-sql.md |
| MS-migrasi | connect/golang/migration-guide.md, connect/python/mssql-python/migrate-from-postgresql.md |
| MS-noexpand | t-sql/queries/hints-transact-sql-table.md |
| MS-operators | relational-databases/showplan-logical-and-physical-operators-reference.md |
| MS-orderby | t-sql/queries/select-order-by-clause-transact-sql.md |
| MS-output | t-sql/queries/output-clause-transact-sql.md |
| MS-pipes | t-sql/language-elements/string-concatenation-pipes-transact-sql.md |
| MS-rownumber | t-sql/functions/row-number-transact-sql.md |
| MS-showplanxml | relational-databases/performance/save-an-execution-plan-in-xml-format.md |
| MS-sprename | relational-databases/system-stored-procedures/sp-rename-transact-sql.md |
| MS-statio | t-sql/statements/set-statistics-io-transact-sql.md |
| MS-stattime | t-sql/statements/set-statistics-time-transact-sql.md |
| MS-top | t-sql/queries/top-transact-sql.md |
| MS-trans | t-sql/language-elements/transactions-transact-sql.md |
| MS-truncate | t-sql/statements/truncate-table-transact-sql.md |
| MS-unique | relational-databases/tables/unique-constraints-and-check-constraints.md |
| MS-updstats | t-sql/statements/update-statistics-transact-sql.md |
| MS-views | relational-databases/views/views.md |

## sql-11: Analisis waktu (24 klaim)

| # | Klaim (kutipan pendek) | Status | Rujukan | Perbaikan |
|---|---|---|---|---|
| 1 | "Window function dihitung setelah WHERE" | cocok | PG-wintut, PG-qte | – |
| 2 | "`count(*)` bertipe bilangan bulat (bigint)" | cocok | PG-agg | – |
| 3 | Pembagian bilangan bulat membuang pecahan, maka kalikan `100.0` | cocok | PG-math ("division truncates the result towards zero") | – |
| 4 | Pembagian dengan nol menghentikan query dengan `division by zero` | cocok | PG-err (kode 22012, errmsg "division by zero"); teks dicek dengan query.mjs | – |
| 5 | `NULLIF(…, 0)` menghasilkan NULL kalau nilainya 0 | cocok | PG-cond | – |
| 6 | "Pembagian dengan NULL menghasilkan NULL" | cocok | PG-con ("most expressions will evaluate to the null value if any operand is null") | – |
| 7 | "date dikurangi interval menghasilkan timestamp" | cocok | PG-dt (tabel operator: `date - interval → timestamp`) | – |
| 8 | "date dan timestamp boleh dibandingkan langsung" | cocok | PG-dt ("Dates and timestamps … are all comparable") | – |
| 9 | Angka kedua LAG adalah jumlah *baris* ke belakang; `lag(nilai, 12, 0)` | cocok | PG-winf | – |
| 10 | `generate_series(date, date, interval)` membuat deret waktu | cocok | PG-srf (bentuk timestamp; date diubah ke timestamp) | – |
| 11 | `date_trunc('month', …)` memotong ke awal bulan | cocok | PG-dt | – |
| 12 | `round(x, 1)` membulatkan ke 1 desimal | cocok | PG-math | – |
| 13 | `count(*) filter (where …)` | cocok | PG-expr | – |
| 14 | "31 Agustus + 1 bulan = 30 September" (tanggal terakhir bulan tujuan) | cocok | PG-dt ("March 31 plus 1 month becomes April 30") | – |
| 15 | T-SQL: DATETRUNC sejak SQL Server 2022 (16.x), hasil bertipe sama dengan masukan | cocok | MS-datetrunc | – |
| 16 | T-SQL: EOMONTH memberi tanggal terakhir bulan, angka kedua menggeser bulan | cocok | MS-eomonth | – |
| 17 | T-SQL: `dateadd(day, 1, eomonth(x, -1))` untuk versi lama | cocok | MS-eomonth (ada sejak SQL Server 2012), MS-dateadd | – |
| 18 | T-SQL: GENERATE_SERIES sejak SQL Server 2022, tingkat kompatibilitas 160, hanya angka | cocok | MS-genseries (wajib 160; argumen tinyint…numeric), MS-compat (160 = SQL Server 2022) | – |
| 19 | T-SQL: DATEADD bertipe sama dengan masukan, pakai tanggal terakhir bulan tujuan | cocok | MS-dateadd | – |
| 20 | T-SQL: DATEDIFF menghitung batas bulan yang dilewati | cocok | MS-datediff | – |
| 21 | T-SQL: LAG sama, termasuk jarak dan nilai pengganti; ORDER BY di OVER wajib | cocok | MS-lag ("The order_by_clause is required") | – |
| 22 | T-SQL: "SQL Server tidak punya FILTER" | tidak ditemukan | MS-count (tata bahasa COUNT tidak memuat FILTER) | Diubah menjadi "Tata bahasa COUNT di dokumentasi SQL Server tidak memuat FILTER (bab 5)." |
| 23 | T-SQL: "Dengan pengaturan bawaan (ANSI_WARNINGS ON), pembagian dengan nol … menghentikan query" | cocok | MS-arithabort ("When ANSI_WARNINGS is ON (the default) … Arithmetic errors cause the query to end") | – |
| 24 | T-SQL: pembagian dua bilangan bulat membuang angka di belakang koma | cocok | MS-divide | – |

## sql-12: Mengubah data dengan aman (47 klaim)

| # | Klaim (kutipan pendek) | Status | Rujukan | Perbaikan |
|---|---|---|---|---|
| 1 | Tanpa nama skema, tabel masuk ke skema bawaan `public` | cocok | PG-schemas, PG-createtable | – |
| 2 | Pesan `schema "latihan" already exists`; `create schema if not exists` | cocok | PG-createschema; teks dicek dengan query.mjs | – |
| 3 | Nilai INSERT dipasangkan ke kolom menurut urutan; kolom yang tidak disebut diisi DEFAULT atau NULL | cocok | PG-insert | – |
| 4 | INSERT … SELECT memasangkan kolom menurut urutan, bukan nama | cocok | PG-insert ("associated … left-to-right") | – |
| 5 | Teks '2025-09-29' otomatis diubah ke date karena kolomnya date | cocok | PG-typeconv (literal tanpa tipe diubah ke tipe kolom tujuan) | – |
| 6 | CREATE TABLE … AS: nama dan tipe kolom dari SELECT, "constraint tabel sumber tidak ikut disalin" | tidak ditemukan | PG-ctas memuat nama dan tipe kolom saja; tiga query tidak menemukan kalimat tentang constraint | Kalimat diubah menjadi fakta yang dihitung: "salinan app.products yang dibuat dengan cara ini tidak punya satu pun constraint" (query.mjs: `pg_constraint` untuk tabel itu berisi 0 baris) |
| 7 | NOT NULL: kolom wajib diisi | cocok | PG-con | – |
| 8 | UNIQUE: NULL tidak dianggap kembar | cocok | PG-createtable, PG-con | – |
| 9 | PRIMARY KEY = UNIQUE + NOT NULL | cocok | PG-createtable | – |
| 10 | REFERENCES harus merujuk PRIMARY KEY atau UNIQUE; bentuk `foreign key (…) references …` | cocok | PG-con, PG-createtable (juga boleh unique index; ini tambahan khas PostgreSQL) | – |
| 11 | CHECK meloloskan syarat yang hasilnya NULL | cocok | PG-con; query.mjs (baris NULL masuk) | – |
| 12 | DEFAULT mengisi kolom yang tidak disebut; `default now()` | cocok | PG-insert, PG-ddlalter | – |
| 13 | Lima pesan error (not-null, check, pkey, unique, fkey) | cocok | Perilaku: PG-con; teks dan DETAIL: query.mjs, sama persis | – |
| 14 | Nama constraint otomatis dibuat dari nama tabel dan kolom (`harga_pemasok_harga_check`) | cocok | PG-createtable ("the system generates a name"); pola nama: query.mjs | – |
| 15 | Foreign key menolak DELETE produk yang masih dirujuk; pesan error | cocok | PG-con (NO ACTION bawaan menghasilkan error); teks: query.mjs | – |
| 16 | UPDATE tanpa WHERE mengubah semua baris, tanpa konfirmasi | cocok | PG-update | – |
| 17 | RETURNING `old.`/`new.` di PostgreSQL 18; tanpa awalan berisi nilai baru | cocok | PG-update, PG-rel18 | – |
| 18 | DELETE tanpa WHERE menghapus semua baris | cocok | PG-delete | – |
| 19 | TRUNCATE lebih cepat karena tidak membaca tabel, tidak bisa diberi syarat | cocok | PG-truncate | – |
| 20 | TRUNCATE ditolak kalau dirujuk foreign key; CASCADE ikut mengosongkan; pesan error | cocok | PG-truncate; teks dan HINT: query.mjs | – |
| 21 | ADD COLUMN: baris lama mendapat DEFAULT atau NULL | cocok | PG-ddlalter, PG-alter | – |
| 22 | ADD constraint memeriksa baris lama; pesan `… is violated by some row` | cocok | PG-ddlalter; teks: query.mjs | – |
| 23 | RENAME COLUMN tidak mengubah isi; DROP COLUMN menghapus isi | cocok | PG-alter, PG-ddlalter | – |
| 24 | DROP TABLE IF EXISTS; tabel yang dirujuk foreign key ditolak; pesan dan HINT | cocok | PG-droptable, PG-depend; teks: query.mjs | – |
| 25 | `drop schema latihan cascade` menghapus semua isinya | cocok | PG-dropschema | – |
| 26 | ON CONFLICT DO NOTHING / DO UPDATE; `excluded` | cocok | PG-insert | – |
| 27 | Tanpa PRIMARY KEY atau UNIQUE, `on conflict do nothing` dua kali tetap dua baris | cocok | PG-insert (bentrok hanya terhadap constraint atau unique index); query.mjs: 2 baris | – |
| 28 | DO UPDATE menolak sumber dobel: `ON CONFLICT DO UPDATE command cannot affect row a second time` | cocok | PG-insert; teks: query.mjs | – |
| 29 | Klausa WHEN MERGE diperiksa berurutan, hanya yang pertama benar yang dijalankan | cocok | PG-merge | – |
| 30 | `when not matched by source` | cocok | PG-merge | – |
| 31 | MERGE dengan RETURNING dan `merge_action()` | cocok | PG-mergefn, PG-merge | – |
| 32 | MERGE dibungkus CTE | cocok | PG-select (WITH boleh berisi MERGE) | – |
| 33 | Satu baris tujuan hanya boleh cocok dengan satu baris sumber; `MERGE command cannot affect row a second time` | cocok | PG-merge; teks: query.mjs | – |
| 34 | ON CONFLICT dan MERGE tidak bisa saling menggantikan; ON CONFLICT tetap bisa UPDATE saat ada INSERT bersamaan | cocok | PG-merge, PG-insert | – |
| 35 | Tanpa BEGIN, setiap perintah adalah transaksi sendiri | cocok | PG-begin | – |
| 36 | `current transaction is aborted, commands ignored until end of transaction block` sampai ROLLBACK | cocok | PG-protocol; teks: query.mjs | – |
| 37 | DDL seperti CREATE TABLE ikut transaksi dan bisa dibatalkan | cocok | PG-gloss (ROLLBACK membatalkan semua operasi sejak awal transaksi), PG-begin; dibuktikan di Dojo (create schema di setiap contoh) | – |
| 38 | T-SQL: UNIQUE hanya mengizinkan satu NULL; PostgreSQL `unique nulls not distinct` | cocok | MS-unique, PG-createtable | – |
| 39 | Identity: ALWAYS butuh OVERRIDING SYSTEM VALUE; IDENTITY_INSERT; IDENTITY tidak menjamin unik atau tanpa lompatan; serial khas PostgreSQL, identity standar SQL | cocok | PG-identity, PG-numeric, MS-identity | – |
| 40 | T-SQL: OUTPUT sebelum VALUES, di UPDATE sebelum WHERE; `inserted.`/`deleted.` | cocok | MS-output | – |
| 41 | T-SQL: `delete from t output deleted.* where …` | cocok | MS-delete | – |
| 42 | T-SQL: "SQL Server tidak punya ON CONFLICT"; IF NOT EXISTS dengan subquery dalam kurung | tidak ditemukan (bagian pertama); bagian kedua cocok | MS-migrasi (ON CONFLICT diterjemahkan menjadi MERGE), MS-ifelse | Diubah menjadi "Panduan migrasi Microsoft dari PostgreSQL mengganti ON CONFLICT dengan MERGE." |
| 43 | T-SQL: MERGE wajib diakhiri titik koma (error 10713); `OUTPUT $action` | cocok | MS-merge, MS-output | – |
| 44 | TRUNCATE: kata TABLE wajib di SQL Server; SQL Server mengembalikan IDENTITY ke awal, PostgreSQL tidak kecuali RESTART IDENTITY; SQL Server tidak bisa TRUNCATE tabel yang dirujuk foreign key; keduanya bisa dibatalkan dalam transaksi | cocok | MS-truncate, PG-truncate (CONTINUE IDENTITY bawaan) | – |
| 45 | T-SQL: ADD tanpa kata COLUMN, DROP COLUMN memakainya; sp_rename untuk kolom | cocok | MS-altertable, MS-sprename | – |
| 46 | T-SQL: DROP TABLE IF EXISTS sejak 2016; "SQL Server tidak punya DROP TABLE … CASCADE" | tidak ditemukan (bagian CASCADE); bagian lain cocok | MS-droptable | Diubah menjadi "Menurut dokumentasi SQL Server, DROP TABLE tidak bisa menghapus tabel yang dirujuk foreign key; foreign key atau tabel yang merujuk harus dihapus dulu." |
| 47 | T-SQL: BEGIN TRANSACTION; autocommit; GO bukan perintah T-SQL, harus di baris sendiri; CREATE SCHEMA harus batch tersendiri | cocok | MS-trans, MS-go, MS-createschema ("You must execute this statement as a separate batch") | – |

## sql-13: View, index, dan performa (52 klaim)

| # | Klaim (kutipan pendek) | Status | Rujukan | Perbaikan |
|---|---|---|---|---|
| 1 | View tidak menyimpan data; query-nya dijalankan ulang setiap kali dipakai | cocok | PG-createview | – |
| 2 | CREATE OR REPLACE VIEW: kolom harus sama nama, urutan, dan tipe; boleh menambah di akhir | cocok | PG-createview | – |
| 3 | Pesan `cannot change name of view column "order_id" to "status"` | cocok | PG-createview; teks: query.mjs | – |
| 4 | DROP VIEW IF EXISTS tidak error kalau view belum ada | cocok | PG-dropview | – |
| 5 | Tabel yang dipakai view tidak bisa di-DROP: `cannot drop table … because other objects depend on it` | cocok | PG-droptable; teks: query.mjs | – |
| 6 | Kolom `definition` di `pg_views` berisi query view | cocok | PG-pgviews | – |
| 7 | Materialized view menjalankan query saat dibuat dan menyimpan hasilnya | cocok | PG-createmv, PG-rulesmv | – |
| 8 | REFRESH membuang seluruh isi lama dan menggantinya | cocok | PG-refresh | – |
| 9 | WITH NO DATA: error `has not been populated` sampai REFRESH | cocok | PG-refresh (unscannable); teks: query.mjs | – |
| 10 | Materialized view tidak bisa diubah langsung dengan INSERT/UPDATE | cocok | PG-rulesmv | – |
| 11 | REFRESH biasa bisa menahan pembaca; CONCURRENTLY tidak, syaratnya sudah terisi dan ada UNIQUE index pada kolom biasa | cocok | PG-refresh | – |
| 12 | DROP MATERIALIZED VIEW | cocok | PG-dropmv | – |
| 13 | EXPLAIN tidak menjalankan query | cocok | PG-explain (hanya opsi ANALYZE yang menjalankan) | – |
| 14 | cost: angka pertama sebelum baris pertama, angka kedua sampai selesai; satuannya bebas, bukan milidetik | cocok | PG-explain, PG-usingexplain | – |
| 15 | `rows` perkiraan jumlah baris; `width` rata-rata lebar baris dalam byte | cocok | PG-usingexplain | – |
| 16 | Index tanpa nama: nama dipilih dari nama tabel dan kolom; jenis bawaan B-tree | cocok | PG-createidx, PG-idxtypes; query.mjs (`pb_customer_id_idx`) | – |
| 17 | B-tree untuk `=`, `<`, `<=`, `>`, `>=`, BETWEEN, IN, IS NULL, dan ORDER BY | cocok | PG-idxtypes, PG-idxorder | – |
| 18 | Isi index terurut (teks bagian dan istilah "index") | salah (terlalu umum) | PG-idxtypes (setiap jenis index memakai algoritma berbeda), PG-idxorder (B-tree menyimpan entri terurut) | Istilah dan teks diubah: urutan disebut sebagai sifat jenis bawaan (B-tree), bukan semua index |
| 19 | Index Scan untuk sangat sedikit baris; Bitmap Index Scan lalu Bitmap Heap Scan mengurutkan letak baris menurut posisi fisik | cocok | PG-usingexplain, PG-bitmap | – |
| 20 | `Recheck Cond`, `Index Cond`, `Filter` | cocok | PG-usingexplain | – |
| 21 | CREATE INDEX biasa: tabel tetap bisa dibaca, INSERT/UPDATE/DELETE ditahan | cocok | PG-createidx, PG-idxintro | – |
| 22 | EXPLAIN ANALYZE menjalankan query; `actual time` dalam milidetik; `loops` | cocok | PG-explain, PG-usingexplain | – |
| 23 | PostgreSQL 18 menulis `rows` dengan dua desimal (4.00) | cocok | PG-rel18 ("fractional row counts"), PG-usingexplain (contoh `rows=10.00`); query.mjs | – |
| 24 | `Rows Removed by Filter`; `Planning Time`; `Execution Time` | cocok | PG-usingexplain | – |
| 25 | Sejak PostgreSQL 18, Buffers otomatis muncul di EXPLAIN ANALYZE; `hit` = ditemukan di cache | cocok | PG-explain, PG-rel18 | – |
| 26 | EXPLAIN ANALYZE pada INSERT/UPDATE/DELETE benar-benar mengubah data; bungkus BEGIN … ROLLBACK | cocok | PG-explain | – |
| 27 | PRIMARY KEY dan UNIQUE otomatis membuat index unik | cocok | PG-idxuniq, PG-createtable | – |
| 28 | `reltuples` dan `relpages` di `pg_class` | cocok | PG-plannerstats | – |
| 29 | `pg_stats`: `null_frac`, `n_distinct` (negatif = perbandingan terhadap jumlah baris, -1 = semua berbeda), `most_common_vals`, `most_common_freqs` | cocok | PG-pgstats | – |
| 30 | ANALYZE memakai sampel acak untuk tabel besar; angka berubah sedikit setiap kali | cocok | PG-analyze | – |
| 31 | autovacuum menjalankan ANALYZE otomatis | cocok | PG-analyze, PG-vacuum | – |
| 32 | Setelah memuat banyak data, jalankan ANALYZE; tanpa statistik baru planner bisa memilih rencana buruk | cocok | PG-populate | – |
| 33 | Syarat yang meloloskan sebagian besar baris lebih murah dengan Seq Scan; index tidak dipakai bukan berarti rusak | cocok | PG-idxorder, PG-idxintro | – |
| 34 | Kolom yang dibungkus fungsi tidak bisa memakai index pada kolom itu | cocok | PG-expridx (index harus pada ekspresi yang sama) | – |
| 35 | Perkiraan rows meleset karena statistik hanya ada untuk kolom, bukan hasil date_trunc | cocok | PG-createidx (statistik ekspresi hanya dikumpulkan untuk index ekspresi), PG-vacuum | – |
| 36 | "Ekspresinya ditulis di dalam tanda kurung" | salah (tidak lengkap) | PG-createidx, PG-expridx (tanda kurung sendiri boleh tidak ditulis hanya untuk panggilan fungsi) | Ditambah: panggilan fungsi seperti `lower(email)` cukup di dalam kurung daftar kolom; ekspresi lain perlu kurung sendiri, misalnya `((city_name \|\| ', ' \|\| province))` (dicoba dengan query.mjs) |
| 37 | Index ekspresi lebih mahal dirawat karena dihitung ulang saat INSERT/UPDATE | cocok | PG-expridx | – |
| 38 | LIKE berawalan tetap bisa memakai B-tree, LIKE diawali % tidak | cocok | PG-idxtypes | – |
| 39 | Database latihan memakai aturan urutan "C"; di aturan lain perlu `text_pattern_ops` | cocok | PG-idxtypes, PG-opclass; query.mjs (`datcollate` = C) | – |
| 40 | PostgreSQL mengubah LIKE menjadi rentang di Index Cond | cocok | query.mjs (`email >= 'Pelanggan4242@' AND email < 'Pelanggan4242A'`); PG-idxtypes | – |
| 41 | Index komposit paling efektif dengan syarat pada kolom paling kiri (= di depan, rentang di kolom berikutnya) | cocok | PG-multicol | – |
| 42 | Skip scan sejak PostgreSQL 18, biasanya hanya kalau kolom pertama punya sedikit nilai berbeda | cocok | PG-rel18, PG-multicol | – |
| 43 | Index komposit dipakai seperlunya; lebih dari tiga kolom jarang membantu | cocok | PG-multicol | – |
| 44 | Setiap index harus diperbarui saat data berubah | cocok | PG-idxintro | – |
| 45 | Isi data dulu, baru buat index, lalu ANALYZE | cocok | PG-populate | – |
| 46 | T-SQL: CREATE VIEW harus perintah pertama dalam batch; ORDER BY tidak boleh di view kecuali dengan TOP | cocok | MS-createview | – |
| 47 | T-SQL: CREATE OR ALTER sejak 2016 SP1; DROP VIEW IF EXISTS sejak 2016 | cocok | MS-createview, MS-dropview | – |
| 48 | T-SQL: "SQL Server tidak punya materialized view" | salah | MS-views ("An indexed view is a materialized view") | Diubah menjadi "Di SQL Server, materialized view dibuat sebagai indexed view (dokumentasi SQL Server menyebut indexed view sebagai materialized view): …" |
| 49 | Indexed view: SCHEMABINDING, unique clustered index, nama dua bagian, COUNT_BIG(*) dengan GROUP BY; diperbarui otomatis; DML bisa jauh lebih lambat; NOEXPAND di edisi Standard; REFRESH tidak diperlukan | cocok | MS-indexedview, MS-noexpand | – |
| 50 | T-SQL: tanpa CLUSTERED dibuat nonclustered; satu clustered index per tabel; tabel tanpa clustered index disebut heap; PRIMARY KEY membuat clustered kecuali sudah ada; UNIQUE membuat nonclustered | cocok | MS-createidx, MS-clustered | – |
| 51 | T-SQL: "SQL Server tidak membuat index langsung pada ekspresi" | tidak ditemukan sebagai pernyataan | MS-createidx (tata bahasa hanya `( column [ ASC \| DESC ] … )`, index pada computed column) | Diubah menjadi "Tata bahasa CREATE INDEX di SQL Server hanya menerima nama kolom, bukan ekspresi; buat dulu computed column …" |
| 52 | T-SQL lain: perbandingan teks biasanya tidak membedakan huruf besar/kecil (collation); Display Estimated Execution Plan / SHOWPLAN_XML tidak menjalankan query; Include Actual Execution Plan / STATISTICS XML menjalankan; nama operator Table Scan, Clustered Index Scan, Clustered Index Seek, Key Lookup, RID Lookup; STATISTICS IO (logical/physical reads) dan TIME (parse, compile, eksekusi); UPDATE STATISTICS, sp_updatestats; sp_helpindex | cocok | MS-collation (bawaan en-US `SQL_Latin1_General_CP1_CI_AS`), MS-estplan, MS-showplanxml, MS-actualplan, MS-operators, MS-statio, MS-stattime, MS-updstats, MS-helpindex | – |

## sql-14: Ujian SQL gaya wawancara (29 klaim)

| # | Klaim (kutipan pendek) | Status | Rujukan | Perbaikan |
|---|---|---|---|---|
| 1 | Alias SELECT tidak bisa dipakai di HAVING/WHERE; error `42703: column "jumlah" does not exist`; ORDER BY boleh memakai alias | cocok | PG-select ("can be used … in ORDER BY and GROUP BY … but not in the WHERE or HAVING clauses"); teks: query.mjs | – |
| 2 | Urutan proses FROM, WHERE, GROUP BY, HAVING, SELECT, ORDER BY, LIMIT | cocok | PG-select (bagian Description, langkah 1–8) | – |
| 3 | `kolom <> 'X'` membuang NULL karena hasilnya tidak diketahui | cocok | PG-cmp | – |
| 4 | `NOT IN` dengan subquery berisi NULL menghasilkan NULL, sehingga hasil kosong | cocok | PG-subq | – |
| 5 | `count(*)` menghitung baris, `count(kolom)` tidak menghitung NULL | cocok | PG-expr | – |
| 6 | WHERE dikerjakan sebelum window function; window function tidak boleh di WHERE | cocok | PG-wintut | – |
| 7 | RANK bisa melompati angka, DENSE_RANK tidak | cocok | PG-winf | – |
| 8 | ROW_NUMBER tanpa penentu seri memilih baris seri tanpa aturan | cocok | PG-wintut ("tied rows numbered in an unspecified order") | – |
| 9 | Pembagian bilangan bulat membuang pecahan | cocok | PG-math | – |
| 10 | AND dikerjakan sebelum OR | cocok | PG-lex (tabel prioritas operator) | – |
| 11 | Frame bawaan RANGE memberi hasil sama dengan ROWS kalau tidak ada nilai urut kembar | cocok | PG-select (RANGE memperlakukan baris kembar bersama) | – |
| 12 | EXCEPT: baris berbeda tanpa dobel; dua NULL dianggap sama | cocok | PG-select, PG-sellist ("Null values are considered equal in this comparison"); query.mjs; MS-except | – |
| 13 | `tanggal - tanggal` menghasilkan jumlah hari | cocok | PG-dt (`date - date → integer`) | – |
| 14 | T-SQL TOP: tanpa ORDER BY urutan tidak tentu; tanda kurung disarankan; WITH TIES wajib dengan ORDER BY | cocok | MS-top | – |
| 15 | T-SQL OFFSET … FETCH: bagian dari ORDER BY, sejak SQL Server 2012, tidak boleh bersama TOP | cocok | MS-orderby | – |
| 16 | T-SQL ISNULL: dua nilai, "hasilnya selalu bertipe sama dengan nilai pertama", bisa terpotong; COALESCE memakai tipe prioritas tertinggi | salah (kata "selalu" berlebihan) | MS-isnull (kalau nilai pertama ditulis NULL begitu saja, tipenya ikut nilai kedua), MS-coalesce | Kata "selalu" dihapus |
| 17 | T-SQL `\|\|` mulai SQL Server 2025, selalu NULL kalau ada bagian NULL; hasil `+` bergantung CONCAT_NULL_YIELDS_NULL; CONCAT mengubah NULL menjadi teks kosong, sama dengan PostgreSQL | cocok | MS-pipes (operator tidak mengikuti CONCAT_NULL_YIELDS_NULL; tersedia dengan kebijakan pembaruan SQL Server 2025), MS-concatnull, MS-concat, PG-string (`concat` mengabaikan NULL) | – |
| 18 | DATEADD bertipe sama dengan masukan; PostgreSQL date + interval menghasilkan timestamp; tanggal terakhir bulan tujuan | cocok | MS-dateadd, PG-dt | – |
| 19 | DATEDIFF menghitung batas: contoh tahun 2005-12-31 23:59:59.9999999 ke 2006-01-01 hasilnya 1; bertipe int | cocok | MS-datediff | – |
| 20 | DATETRUNC sejak SQL Server 2022, tipe sama dengan masukan | cocok | MS-datetrunc | – |
| 21 | CURRENT_DATE mulai SQL Server 2025, sama dengan CAST(GETDATE() AS DATE) | cocok | MS-currentdate | – |
| 22 | 7 / 2 = 3 di keduanya | cocok | MS-divide, PG-math | – |
| 23 | Tata bahasa COUNT tidak memuat FILTER; COUNT int, COUNT_BIG bigint | cocok | MS-count | – |
| 24 | ROW_NUMBER: ORDER BY di OVER wajib, ROWS/RANGE tidak boleh | cocok | MS-rownumber | – |
| 25 | bit: 1, 0, NULL; 'TRUE'/'FALSE' menjadi 1/0; SUM, AVG, MIN, MAX tidak langsung menerima bit, COUNT menerima | cocok | MS-bit | – |
| 26 | LIKE di SQL Server dipengaruhi collation | cocok | MS-like | – |
| 27 | EXCEPT/INTERSECT di SQL Server: baris berbeda, dua NULL dianggap sama | cocok | MS-except | – |
| 28 | GENERATE_SERIES: sejak 2022, tingkat kompatibilitas 160, hanya angka, kolom bernama value | cocok | MS-genseries, MS-compat | – |
| 29 | Upsert di SQL Server memakai MERGE; MERGE wajib titik koma, error 10713 | cocok | MS-merge, MS-migrasi | – |

## Ringkasan

- Jumlah klaim yang dicek: 152 (sql-11: 24, sql-12: 47, sql-13: 52, sql-14: 29). Beberapa baris tabel menggabungkan beberapa klaim kecil yang berasal dari satu halaman dokumentasi.
- Klaim salah (4), sudah diperbaiki:
  1. sql-13, tabel `tsql`: "SQL Server tidak punya materialized view". Dokumentasi Microsoft menyebut indexed view sebagai materialized view.
  2. sql-13, teks dan istilah "index": "isinya nilai … dalam keadaan terurut" berlaku untuk B-tree, bukan semua jenis index.
  3. sql-13, teks SARGable: "Ekspresinya ditulis di dalam tanda kurung" tidak lengkap; ekspresi yang bukan panggilan fungsi perlu tanda kurung tambahan.
  4. sql-14, tabel `tsql`: "ISNULL … hasilnya selalu bertipe sama dengan nilai pertama"; kata "selalu" dihapus karena ada pengecualian (nilai pertama ditulis NULL begitu saja).
- Klaim tidak ditemukan di Context7 (5), sudah diubah menjadi kalimat yang bisa dipastikan:
  1. sql-11 `tsql`: "SQL Server tidak punya FILTER" menjadi "Tata bahasa COUNT di dokumentasi SQL Server tidak memuat FILTER".
  2. sql-12 teks: "constraint tabel sumber tidak ikut disalin" (CREATE TABLE … AS) menjadi fakta yang dihitung dengan query: salinan app.products tidak punya constraint.
  3. sql-12 `tsql`: "SQL Server tidak punya ON CONFLICT" menjadi "Panduan migrasi Microsoft dari PostgreSQL mengganti ON CONFLICT dengan MERGE".
  4. sql-12 `tsql`: "SQL Server tidak punya DROP TABLE … CASCADE" menjadi kalimat dari dokumentasi DROP TABLE (tabel yang dirujuk foreign key tidak bisa dihapus).
  5. sql-13 `tsql`: "SQL Server tidak membuat index langsung pada ekspresi" menjadi "Tata bahasa CREATE INDEX di SQL Server hanya menerima nama kolom".
- Pemeriksaan otomatis: `node tools/check-content.mjs --lesson sql-11`, `sql-12`, `sql-13`, dan `sql-14` masing-masing mencetak "Semua 1 bab lulus pemeriksaan."
- Semua rujukan di catatan ini berasal dari Context7 (`/websites/postgresql/18` dan `/microsoftdocs/sql-docs`). WebFetch, curl, dan ingatan tidak dipakai sebagai rujukan. `query.mjs` hanya dipakai sebagai bukti tambahan untuk teks pesan error, nama otomatis, dan angka.
