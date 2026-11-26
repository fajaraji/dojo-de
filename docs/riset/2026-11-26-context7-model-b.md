# Verifikasi ulang dengan Context7: kelompok model-b

Tanggal: 26 November 2026
Bab: `model-05` (load bertahap), `model-06` (uji kualitas dan rekonsiliasi), `model-07` (model untuk BI dan pola modern), `capstone-a` (Capstone A).
Pedoman: `dojo/VERIFY-CONTEXT7.md`, `dojo/AUTHORING.md`, `dojo/STYLE.md`.

## Pustaka Context7 yang dipakai

Semua pustaka dipilih lewat `resolve-library-id`, kecuali PostgreSQL dan SQL Server yang ID-nya sudah diberikan di pedoman. Semuanya ber-Source Reputation High dan berasal dari pemilik resminya.

| Alat | Library ID Context7 | Asal dokumen |
| --- | --- | --- |
| PostgreSQL 18 | `/websites/postgresql/18` | postgresql.org/docs/18 |
| SQL Server / T-SQL | `/microsoftdocs/sql-docs` | repo resmi MicrosoftDocs/sql-docs |
| Power BI | `/microsoftdocs/powerbi-docs` | repo resmi MicrosoftDocs/powerbi-docs |
| DAX | `/websites/learn_microsoft_en-us_dax` | learn.microsoft.com/en-us/dax |
| Microsoft Fabric | `/microsoftdocs/fabric-docs` | repo resmi MicrosoftDocs/fabric-docs |
| Delta Lake | `/delta-io/delta` | repo resmi delta-io/delta |
| Apache Parquet | `/apache/parquet-site` | repo resmi apache/parquet-site |
| dbt | `/dbt-labs/docs.getdbt.com` | repo resmi dbt-labs/docs.getdbt.com |
| Data Vault | `/websites/automate-dv_readthedocs_io_en` | dokumentasi AutomateDV (paket Data Vault 2.0 untuk dbt dari Datavault UK). Hasil `resolve-library-id` untuk "Data Vault" hanya satu pustaka ber-reputasi Low, jadi dipakai AutomateDV. |

Singkatan URL di tabel: `PG` = `https://www.postgresql.org/docs/18/`, `SQL` = `https://github.com/microsoftdocs/sql-docs/blob/live/docs/`, `PBI` = `https://github.com/microsoftdocs/powerbi-docs/blob/main/powerbi-docs/`, `FAB` = `https://github.com/microsoftdocs/fabric-docs/blob/main/docs/`, `DBT` = `https://github.com/dbt-labs/docs.getdbt.com/blob/current/website/docs/`. Semua URL berasal dari hasil Context7.

Perilaku PostgreSQL yang juga dibuktikan dengan `node tools/query.mjs` (PostgreSQL 18.6): pesan error MERGE dan ON CONFLICT yang mengenai baris dua kali, pesan duplicate key, nama kolom hasil UNION ALL diambil dari bagian pertama, dan tipe hasil `abs()` untuk numeric.

## model-05: Load bertahap & aman diulang

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
| --- | --- | --- | --- | --- |
| 1 | ON CONFLICT `do update … where`: hanya baris yang syarat WHERE-nya benar yang diubah | cocok | PG `sql-insert.html` (ON CONFLICT Clause, *condition*) | - |
| 2 | MERGE dan ON CONFLICT DO UPDATE menolak baris tujuan yang kena dua kali; pesan "MERGE command cannot affect row a second time" | cocok | PG `sql-merge.html` (Notes), `sql-insert.html` (cardinality violation); query.mjs: `ERROR 21000` untuk keduanya | - |
| 3 | `ERROR: duplicate key value violates unique constraint "fact_order_pkey"` | cocok | query.mjs: `ERROR 23505: duplicate key value violates unique constraint "t_pkey"`; PG `sql-insert.html` | - |
| 4 | Perubahan yang belum di-COMMIT tidak terlihat transaksi lain, lalu terlihat bersamaan | cocok | PG `tutorial-transactions.html` | - |
| 5 | `timestamp` menyimpan sampai 1 mikrodetik | cocok | PG `datatype-datetime.html` (Table 8.9) | - |
| 6 | Setelah satu perintah gagal, perintah berikutnya ditolak sampai ROLLBACK | cocok | PG `sql-release-savepoint.html` (hanya ROLLBACK / ROLLBACK TO SAVEPOINT yang sah), `app-psql.html` (ON_ERROR_ROLLBACK off: error membatalkan seluruh transaksi) | - |
| 7 | `merge_action()` di RETURNING berisi INSERT, UPDATE, atau DELETE | cocok | PG `functions-merge-support.html`, `sql-merge.html` | - |
| 8 | datetime2 sampai 100 nanodetik, 7 digit pecahan sebagai bawaan | cocok | SQL `t-sql/data-types/datetime2-transact-sql.md` | - |
| 9 | datetime dibulatkan ke .000, .003, .007 detik; jangan dipakai untuk pekerjaan baru | cocok | SQL `t-sql/data-types/datetime-transact-sql.md` | - |
| 10 | Bandingkan datetime dengan datetime2: CAST ke datetime2 secara tertulis | cocok | SQL `datetime2-transact-sql.md` (Cast explicitly to datetime2) | - |
| 11 | "SQL Server tidak punya ON CONFLICT" | tidak ditemukan (pernyataan negatif) | Sintaks INSERT di SQL `t-sql/statements/insert-transact-sql.md` tidak memuat ON CONFLICT | Diubah menjadi "Dokumentasi sintaks INSERT di SQL Server tidak memuat ON CONFLICT; padanannya MERGE." |
| 12 | MERGE wajib titik koma, tanpa itu error 10713 | cocok | SQL `t-sql/statements/merge-transact-sql.md` (Remarks), daftar error 10000–10999 | - |
| 13 | Maksimal dua WHEN MATCHED; yang pertama wajib AND; satu UPDATE satu DELETE | cocok | SQL `merge-transact-sql.md` (WHEN MATCHED) | - |
| 14 | MERGE ditolak kalau lebih dari satu baris sumber cocok dengan satu baris tujuan saat UPDATE | cocok | SQL `merge-transact-sql.md` (WHEN MATCHED) | - |
| 15 | HOLDLOCK mencegah pelanggaran kunci unik; sama dengan SERIALIZABLE, paling aman tetapi paling sedikit konkurensi; INSERT/UPDATE/DELETE terpisah bisa lebih cepat saat banyak proses bersamaan | cocok | SQL `merge-transact-sql.md` (Concurrency considerations) | - |
| 16 | XACT_ABORT OFF bawaan: dalam beberapa kasus hanya perintah gagal yang dibatalkan; ON membatalkan seluruh transaksi | cocok | SQL `t-sql/statements/set-xact-abort-transact-sql.md` | - |
| 17 | `$action` bertipe nvarchar(10), berisi INSERT/UPDATE/DELETE | cocok | SQL `t-sql/queries/output-clause-transact-sql.md`, `merge-transact-sql.md` | - |
| 18 | rowversion 8 byte, otomatis, naik, bukan tanggal/jam | cocok | SQL `t-sql/data-types/rowversion-transact-sql.md` | - |
| 19 | timestamp = sinonim usang rowversion, berbeda dengan timestamp ISO | cocok | SQL `rowversion-transact-sql.md` (Remarks) | - |

## model-06: Uji kualitas data & rekonsiliasi

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
| --- | --- | --- | --- | --- |
| 1 | Setiap uji dbt adalah SELECT yang mencari baris gagal; lulus kalau 0 baris | cocok | DBT `docs/build/data-tests.md` | - |
| 2 | Empat uji bawaan dbt: unique, not_null, accepted_values, relationships | cocok | DBT `docs/build/data-tests.md` (Generic data tests) | - |
| 3 | `information_schema.table_constraints` mencatat NOT NULL dengan jenis CHECK | cocok | PG `infoschema-table-constraints.html` ("CHECK (includes not-null constraints)") | - |
| 4 | `status not in (…)` untuk status NULL hasilnya tidak diketahui | cocok | PG `functions-comparisons.html` (9.25.2 NOT IN) | - |
| 5 | Bagian UNION ALL harus berjumlah kolom sama; nama kolom dari bagian pertama | cocok | PG `queries-union.html`, `sql-select.html` (UNION), contoh `typeconv-union-case.html`; query.mjs | - |
| 6 | SQL Server: CONSTRAINT_TYPE hanya CHECK, UNIQUE, PRIMARY KEY, FOREIGN KEY; "NOT NULL tidak tercatat sebagai constraint" | sebagian: daftar cocok, kalimat NOT NULL tidak ditemukan | SQL `relational-databases/system-information-schema-views/table-constraints-transact-sql.md` | Kalimat NOT NULL diganti "tanpa keterangan bahwa NOT NULL ikut dihitung sebagai CHECK seperti di PostgreSQL". |
| 7 | Cara pasti mengetahui skema objek adalah sys.objects | cocok | SQL `table-constraints-transact-sql.md` (Important) | - |
| 8 | sp_help: kolom (boleh NULL), kolom identity, index, constraint beserta status, objek yang merujuk | sebagian: kolom Nullable dan status constraint cocok; identity, index, dan objek yang merujuk tidak ditemukan (3 query) | SQL `relational-databases/system-stored-procedures/sp-help-transact-sql.md` | Catatan ditulis ulang: hanya daftar kolom (kolom Nullable) dan daftar constraint dengan status_enabled Enabled/Disabled. |
| 9 | PostgreSQL NOT VALID: baris lama tidak diperiksa, baris baru diperiksa; dianggap berlaku setelah VALIDATE CONSTRAINT | cocok | PG `sql-altertable.html` | - |
| 10 | WITH NOCHECK: baris baru diperiksa; tidak dipakai query optimizer sampai WITH CHECK CHECK CONSTRAINT | cocok | SQL `t-sql/statements/alter-table-transact-sql.md` (WITH CHECK / WITH NOCHECK) | - |
| 11 | NOCHECK CONSTRAINT hanya untuk FOREIGN KEY dan CHECK; PRIMARY KEY, UNIQUE, DEFAULT tidak bisa dimatikan | cocok | SQL `alter-table-transact-sql.md` ({ CHECK \| NOCHECK } CONSTRAINT) | - |
| 12 | sys.foreign_keys dan sys.check_constraints punya is_disabled dan is_not_trusted | cocok | SQL `relational-databases/system-catalog-views/sys-foreign-keys-transact-sql.md`, `sys-check-constraints-transact-sql.md` | - |
| 13 | DBCC CHECKCONSTRAINTS menjalankan query untuk setiap FOREIGN KEY dan CHECK; bentuk query FK LEFT JOIN … IS NULL; hasil: nama tabel, nama constraint, syarat WHERE | cocok | SQL `t-sql/database-console-commands/dbcc-checkconstraints-transact-sql.md` (Remarks, Result sets) | - |
| 14 | WITH ALL_CONSTRAINTS ikut memeriksa constraint yang dimatikan; tidak dijamin menemukan semua pelanggaran | cocok | SQL `dbcc-checkconstraints-transact-sql.md` | Ditambah alasan dari dokumen: kalau satu baris melanggar beberapa constraint, hanya yang pertama dilaporkan. |
| 15 | DBCC CHECKCONSTRAINTS butuh sysadmin atau db_owner | tidak ditemukan (3 query; yang muncul hanya halaman DBCC CHECKALLOC) | - | Dihapus. |
| 16 | "SQL Server tidak punya FILTER" | tidak ditemukan (pernyataan negatif) | Sintaks agregat di SQL `t-sql/functions/count-transact-sql.md` tidak memuat FILTER | Diubah menjadi "Sintaks COUNT di dokumentasi SQL Server tidak memuat FILTER, jadi syaratnya ditulis di dalam CASE". |
| 17 | DATEDIFF menghitung batas hari yang dilewati | cocok | SQL `t-sql/functions/datediff-transact-sql.md` | - |
| 18 | ABS decimal(p, s) menghasilkan decimal(38, s); overflow untuk abs(-2.147.483.648) int | cocok | SQL `t-sql/functions/abs-transact-sql.md` | - |

## model-07: Model untuk BI dan pola modern

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
| --- | --- | --- | --- | --- |
| 1 | Model di Power BI Desktop pada dasarnya model tabular Analysis Services | cocok | PBI `connect-data/service-datasets-understand.md` | - |
| 2 | "setiap visual mengirim query …, dan query itu umumnya menyaring, mengelompokkan, dan meringkas data" | tidak ditemukan (3 query) | Yang ditemukan: PBI `create-reports/performance-analyzer.md` (visual mengirim query ke model semantik), PBI `guidance/star-schema.md` (dimensi untuk menyaring dan mengelompokkan, fakta untuk diringkas) | Ditulis ulang memakai dua kalimat yang ditemukan. |
| 3 | Dimensi biasanya kecil, fakta besar dan terus bertambah | cocok | PBI `guidance/star-schema.md` (Fact tables) | - |
| 4 | Kardinalitas 1:*, *:1, 1:1, *:* | cocok | PBI `transform-model/desktop-relationships-understand.md` (Cardinality) | - |
| 5 | Refresh gagal kalau kolom sisi satu berisi nilai dobel | cocok | PBI `desktop-relationships-understand.md` (Cardinality) | - |
| 6 | Relasi tidak menjaga integritas data seperti foreign key | cocok | PBI `desktop-relationships-understand.md` (Relationship purpose: "model relationships do not enforce data integrity") | - |
| 7 | Nilai fakta tanpa pasangan: Power BI menambahkan baris kosong di dimensi | cocok | PBI `desktop-relationships-understand.md` (Regular relationships: blank virtual row) | - |
| 8 | Arah filter Single dan Both; 1:* selalu dari sisi satu | cocok | PBI `desktop-relationships-understand.md` (Cross filter direction) | - |
| 9 | Beberapa filter digabung dengan AND | cocok | PBI `desktop-relationships-understand.md` (Relationship purpose) | - |
| 10 | Relasi dua arah: dipakai sesedikit mungkin; menurunkan kecepatan, makin parah kalau bertambah; jalur ambigu; pilihan slicer muncul-hilang membingungkan | cocok | PBI `guidance/relationships-bidirectional-filtering.md`, `desktop-relationships-understand.md` | - |
| 11 | Untuk slicer "punya data": filter di slicer, relasi tetap satu arah | cocok | PBI `guidance/relationships-bidirectional-filtering.md` (Recommended alternatives, measure "is not blank") | - |
| 12 | Slicer: visual untuk menyaring laporan | cocok | PBI `explore-reports/end-user-slicer.md` | - |
| 13 | DAX: bahasa rumus Power BI, Analysis Services, Power Pivot di Excel | cocok | DAX `https://learn.microsoft.com/en-us/dax/dax-overview` | - |
| 14 | Measure dihitung saat visual meminta, mengikuti filter; "hasil measure tidak pernah disimpan di model" | cocok, kata "tidak pernah" lebih keras dari dokumen | PBI `transform-model/desktop-calculations-options.md` ("not precalculated or stored"); DAX `dax-overview` | Diganti "tidak dihitung lebih dulu dan tidak disimpan". |
| 15 | Kolom terhitung dihitung per baris saat refresh dan disimpan; "pada mode Import" | sebagian: dihitung saat refresh dan disimpan cocok; pembatasan "pada mode Import" tidak ditemukan | PBI `desktop-calculations-options.md`, `desktop-tutorial-create-calculated-columns.md`; DAX `dax-overview` | Pembatasan mode Import dihapus dari teks dan dari `terms`; ditambah "sehingga model makin besar" sesuai dokumen. |
| 16 | DIVIDE menghasilkan BLANK kalau pembagi nol | cocok | DAX `https://learn.microsoft.com/en-us/dax/divide-function-dax` | - |
| 17 | Power BI bisa membuat tabel tanggal tersembunyi untuk setiap kolom tanggal | cocok | PBI `transform-model/desktop-auto-date-time.md` | - |
| 18 | Mark as date table wajib untuk time intelligence klasik, atau "relasi memakai kolom bukan tanggal dan kamu ingin memakai time intelligence"; untuk time intelligence berbasis kalender "tidak selalu wajib" | sebagian salah: dokumen tidak memberi syarat tambahan "ingin memakai time intelligence", dan untuk berbasis kalender dokumen menulis tidak perlu ditandai | PBI `transform-model/desktop-date-tables.md` (When you must mark your date table) | Ditulis ulang: wajib kalau memakai time intelligence klasik atau kalau relasi tabel tanggal memakai kolom bukan tanggal; dengan time intelligence berbasis kalender (yang dianjurkan dokumen) tidak perlu ditandai. |
| 19 | Saat ditandai, kolom tanggal diperiksa: unik, tidak kosong, bersambung | cocok | PBI `desktop-date-tables.md` (How to set your own date table) | - |
| 20 | Jangan mencampur dimensi dan fakta di satu tabel; fakta dengan grain konsisten | cocok | PBI `guidance/star-schema.md` | - |
| 21 | Snowflake: satu tabel gabungan umumnya lebih menguntungkan; lebih banyak tabel, jalur filter lebih panjang, daftar tabel membingungkan, hirarki tidak bisa lintas tabel | sebagian: alasan "lebih banyak tabel", "jalur filter lebih panjang", "daftar membingungkan" tidak ditemukan (3 query) | PBI `guidance/star-schema.md` (Snowflake dimensions: lebih efisien, kinerja, model sederhana, hirarki lintas tingkat), `guidance/relationships-one-to-one.md` (hirarki butuh kolom di tabel yang sama) | Ditulis ulang memakai alasan yang ditemukan. |
| 22 | Hub: daftar unik business key; link: hubungan antar-business key; satellite: atribut dan riwayat | cocok | AutomateDV `tutorial/tut_hubs`, `tut_links`, `tut_satellites` | - |
| 23 | "Satu satellite menempel pada tepat satu hub atau satu link" | cocok dengan pelunakan | AutomateDV `tut_satellites` ("related to their parent Hub or Link") | Diganti "Setiap satellite berisi keterangan untuk induknya, yaitu sebuah hub atau sebuah link." |
| 24 | "Data Vault tidak dibuat untuk langsung dibaca laporan … lapisan dimensional (star schema) di atasnya" | tidak ditemukan (2 query) | Yang ditemukan: AutomateDV `tutorial/tut_point_in_time` menyebut *information mart* yang dibangun dari Data Vault | Ditulis ulang: untuk laporan dibangun lapisan lain dari tabel Data Vault, yang di dokumentasi AutomateDV disebut information mart. Kata "star schema" dihapus. |
| 25 | Lakehouse Fabric: data terstruktur dan tidak terstruktur di satu tempat, dianalisis dengan SQL dan Spark | cocok | FAB `data-engineering/lakehouse-overview.md`, `fundamentals/decision-guide-lakehouse-warehouse.md` | - |
| 26 | Data lake: penyimpanan berkas besar, format apa pun | cocok | FAB `onelake/onelake-medallion-lakehouse-architecture.md` | - |
| 27 | Parquet: format berkas terbuka, kolumnar, kompresi dan encoding | cocok | Parquet `https://github.com/apache/parquet-site/blob/production/content/en/_index.md` | - |
| 28 | Format kolumnar cukup membaca kolom yang diminta | cocok | Parquet `content/en/docs/File Format/_index.md` (pembaca membaca metadata lalu column chunk yang diperlukan) | - |
| 29 | Delta: Parquet + log transaksi `_delta_log`; ACID | cocok | Delta `docs/src/content/docs/delta-faq.mdx`, `PROTOCOL.md` | - |
| 30 | Setiap perubahan yang berhasil menjadi versi baru; pembaca tidak melihat data setengah jadi | cocok | Delta `PROTOCOL.md` (commit membuat versi atomik; snapshot isolation) | - |
| 31 | Time travel `version as of`; RESTORE untuk mengembalikan | cocok | Delta `docs/src/content/docs/delta-batch.mdx`, `delta-utility/index.mdx` | - |
| 32 | ACID: atomicity, consistency, isolation, durability | cocok | PG `glossary.html` | - |
| 33 | OneLake satu data lake untuk seluruh organisasi; mesin T-SQL, Spark, Analysis Services menyimpan tabel dalam Delta Parquet | cocok | FAB `onelake/onelake-overview.md` | - |
| 34 | Medallion dianjurkan di Fabric; lapisan dipisah, satu lakehouse/warehouse per lapisan; silver dan gold memakai Delta | cocok | FAB `onelake/onelake-medallion-lakehouse-architecture.md` | - |
| 35 | Fabric Warehouse dengan T-SQL; Direct Lake membaca tabel Delta tanpa menyalin | cocok | FAB `fundamentals/data-lifecycle.md`, `onelake/onelake-overview.md` | - |
| 36 | Fabric Warehouse mendukung CTAS | cocok | FAB `data-warehouse/ingest-data-warehouse-tables-tsql.md`, `create-table.md` | - |
| 37 | Model dbt: satu .sql satu SELECT; nama = nama berkas; dibungkus create view as / create table as; bawaan view | cocok | DBT `docs/build/sql-models.md`; quickstart "change way model materialized" | - |
| 38 | ref() diganti nama tabel sesuai lingkungan; menentukan urutan | cocok | DBT `docs/build/sql-models.md`, `reference/dbt-jinja-functions/ref.md` | - |
| 39 | YAML `data_tests` dan `relationships` dengan `arguments: to/field` | cocok | DBT `docs/build/data-tests.md` (`arguments` mulai v1.10.5) | - |
| 40 | "`dbt docs generate` membuat situs dokumentasi beserta diagram alur" | sebagian: generate menyusun berkas, `dbt docs serve` yang menampilkan situs | DBT `docs/build/documentation.md`, `docs/build/view-documentation.md` (DAG di situs) | Ditulis ulang: generate menyusun bahan, serve menampilkan situs dengan diagram alur. |
| 41 | `pg_total_relation_size` menghitung ruang disk termasuk index; byte | cocok | PG `functions-admin.html` | - |
| 42 | 1 kB = 1.024 byte | cocok | PG `functions-admin.html` (pg_size_pretty) | - |
| 43 | `pg_column_size` menghitung byte satu nilai | cocok | PG `functions-admin.html` | - |
| 44 | SELECT … INTO: index dan constraint tidak ikut | cocok | SQL `t-sql/queries/select-into-clause-transact-sql.md` (Limitations) | - |
| 45 | sp_spaceused: rows, reserved, data, index_size, unused | cocok | SQL `relational-databases/system-stored-procedures/sp-spaceused-transact-sql.md` | - |
| 46 | Bilangan bulat dibagi bilangan bulat dibulatkan ke bawah di SQL Server | cocok | SQL `t-sql/language-elements/divide-transact-sql.md` | - |
| 47 | date tidak bisa dikurangi dengan tanda minus di SQL Server | cocok | SQL `t-sql/language-elements/subtract-transact-sql.md` | - |
| 48 | "SQL Server tidak punya FILTER" (baris tsql pertama) | tidak ditemukan (pernyataan negatif) | SQL `count-transact-sql.md` | Diubah menjadi "sintaks COUNT di dokumentasi SQL Server tidak memuat FILTER". |
| 49 | "(PostgreSQL tidak punya columnstore index bawaan)" | tidak ditemukan (pernyataan negatif) | PG `indexes-types.html`, `sql-createindex.html` (daftar: B-tree, Hash, GiST, SP-GiST, GIN, BRIN) | Diubah menjadi "(daftar jenis index bawaan di dokumentasi PostgreSQL 18 tidak memuat columnstore)". |
| 50 | Columnstore: standar untuk tabel fakta besar; query membaca sedikit kolom; nilai sekolom mirip sehingga mudah dikompresi, sampai 10 kali | cocok | SQL `relational-databases/indexes/columnstore-indexes-overview.md`, `columnstore-indexes-query-performance.md` | - |
| 51 | "Formatnya milik SQL Server, bukan berkas Parquet" | tidak ditemukan | - | Diganti "columnstore index adalah index pada tabel SQL Server, sedangkan Parquet adalah format berkas" (keduanya ada di rujukan baris 27 dan 50). |
| 52 | "Dokumentasi columnstore SQL Server menyebut nilai dalam satu kolom biasanya mirip" (catatan contoh) | cocok | SQL `columnstore-indexes-query-performance.md` | - |

## capstone-a: Gudang data TokoKita

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
| --- | --- | --- | --- | --- |
| 1 | View tidak menyalin data; query view dijalankan setiap kali dipakai | cocok | PG `sql-createview.html` | - |
| 2 | Satu objek hanya satu komentar; COMMENT baru mengganti; NULL atau teks kosong menghapus; ikut terhapus bersama objek | cocok | PG `sql-comment.html` | - |
| 3 | Semua pengguna yang tersambung bisa membaca semua komentar; jangan tulis rahasia | cocok | PG `sql-comment.html` (Notes) | - |
| 4 | `col_description(tabel, nomor_kolom)` dan `obj_description(tabel, 'pg_class')` | cocok | PG `functions-info.html` (Table 9.82) | - |
| 5 | pg_class mencatat tabel dan view | cocok | PG `catalog-pg-class.html` | - |
| 6 | regclass mengubah nama tabel menjadi nomor pengenal internal (OID) | cocok | PG `datatype-oid.html`, `functions-admin.html` | - |
| 7 | information_schema.columns: satu baris per kolom | cocok | PG `infoschema-columns.html` | - |
| 8 | "ordinal_position adalah nomor kolom yang diminta col_description" | tidak ditemukan (3 query) | - | Ditulis ulang: nomor kolom diambil dari ordinal_position (urutan kolom di tabel); untuk tabel bab ini pasangan itu tepat, dibuktikan oleh contoh yang mengembalikan keterangan setiap kolom. |
| 9 | CREATE SCHEMA harus dijalankan sebagai batch tersendiri | cocok | SQL `t-sql/statements/create-schema-transact-sql.md` (Remarks) | - |
| 10 | CREATE VIEW harus perintah pertama di batch | cocok | SQL `t-sql/statements/create-view-transact-sql.md` (Remarks) | - |
| 11 | ORDER BY di view hanya bersama TOP, dan tidak menjamin urutan | cocok | SQL `create-view-transact-sql.md` (Arguments), `t-sql/queries/select-order-by-clause-transact-sql.md` | - |
| 12 | GO bukan perintah T-SQL; dikenali sqlcmd, osql, SSMS; tidak dikirim ke server; baris sendiri (boleh komentar); tanpa titik koma; variabel lokal berakhir di GO | cocok | SQL `t-sql/language-elements/sql-server-utilities-statements-go.md` | - |
| 13 | CREATE OR ALTER mulai SQL Server 2016 SP1 | cocok | SQL `create-view-transact-sql.md` (OR ALTER) | - |
| 14 | Baris -1 butuh SET IDENTITY_INSERT ON dan daftar kolom | cocok | SQL `t-sql/statements/insert-transact-sql.md`, `set-identity-insert-transact-sql.md` | - |
| 15 | "Tanda :: tidak ada di SQL Server" | **salah** | SQL `t-sql/language-elements/scope-resolution-operator-transact-sql.md` (operator `::`), `grant-schema-permissions-transact-sql.md` (`ON SCHEMA ::`); CAST di `t-sql/functions/cast-and-convert-transact-sql.md` | Diganti: tipe diubah dengan CAST atau CONVERT; tanda :: memang ada di T-SQL tetapi dipakai untuk keperluan lain, bukan untuk mengubah tipe. |
| 16 | "SQL Server tidak punya ON CONFLICT" | tidak ditemukan (pernyataan negatif) | SQL `insert-transact-sql.md` | Diubah menjadi "Dokumentasi sintaks INSERT di SQL Server tidak memuat ON CONFLICT; padanannya MERGE." |
| 17 | MERGE wajib titik koma | cocok | SQL `merge-transact-sql.md` | - |
| 18 | Columnstore bentuk standar tabel fakta besar; PRIMARY KEY bawaannya CLUSTERED | cocok | SQL `columnstore-indexes-overview.md`; `t-sql/statements/create-table-transact-sql.md` ("PRIMARY KEY constraints default to CLUSTERED") | - |
| 19 | "SQL Server tidak punya FILTER, dan is_current bertipe bit" | FILTER: tidak ditemukan (pernyataan negatif); bit: cocok | SQL `count-transact-sql.md`; `t-sql/data-types/bit-transact-sql.md` | Diubah: sintaks COUNT di dokumentasi tidak memuat FILTER; is_current dibuat bertipe bit (bilangan bulat 1, 0, atau NULL, bisa dipakai menyimpan nilai benar/salah). |
| 20 | Extended property: nama bebas; contoh MS_Description dan Caption; level 0 dan 1 wajib untuk kolom; nilai maksimal 7.500 byte | cocok | SQL `relational-databases/system-stored-procedures/sp-addextendedproperty-transact-sql.md`, `sp-updateextendedproperty-transact-sql.md` (objek harus disertai nama level di atasnya) | - |
| 21 | sys.extended_properties: major_id = object_id, minor_id = column_id, 0 untuk objek | cocok | SQL `relational-databases/system-catalog-views/extended-properties-catalog-views-sys-extended-properties.md` | - |
| 22 | Pakai datetime2, bukan datetime | cocok | SQL `datetime-transact-sql.md` | - |

## Ringkasan

- Klaim yang dicek: 111 (model-05: 19, model-06: 18, model-07: 52, capstone-a: 22).
- Salah: 1 (capstone-a #15), ditambah 1 klaim yang sebagian salah (model-07 #18, syarat Mark as date table).
- Tidak ditemukan atau hanya sebagian ditemukan, lalu ditulis ulang atau dihapus: 16 (model-05 #11; model-06 #6, #8, #15, #16; model-07 #2, #15, #21, #24, #40, #48, #49, #51; capstone-a #8, #16, #19). Enam di antaranya pernyataan "SQL Server/PostgreSQL tidak punya X", yang sekarang ditulis sebagai "dokumentasi sintaks … tidak memuat X".
- Cocok, tetapi kalimatnya dilunakkan atau ditambah supaya sama dengan dokumen: 3 (model-06 #14, model-07 #14, #23).
- Catatan tanpa perubahan: dokumentasi PostgreSQL (`datatype-oid.html`) menganjurkan `quote_ident()` saat merangkai nama dari `information_schema` menjadi regclass. Solusi `capstone-a-16` merangkai tanpa `quote_ident`, dan itu tetap benar untuk nama huruf kecil di bab ini. `quote_ident` belum diajarkan, jadi tidak diubah.
- `node tools/check-content.mjs --lesson <id>` lulus untuk keempat bab setelah perbaikan.
- Semua rujukan berasal dari Context7. Tidak ada WebFetch, curl, atau situs dokumentasi langsung yang dipakai.
