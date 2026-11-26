# Verifikasi Context7: kelompok model-a (model-01 s.d. model-04)

Tanggal: 26 Nov 2026. Semua rujukan di bawah berasal dari Context7 (`resolve-library-id` dan `query-docs`). Tidak ada WebFetch, curl, atau ingatan yang dipakai sebagai rujukan.

Library ID yang dipakai (semua Source Reputation High, milik resmi Microsoft atau PostgreSQL):

- PostgreSQL 18: `/websites/postgresql/18`. Singkatan `pg:` = `https://www.postgresql.org/docs/18/`.
- SQL Server / T-SQL dan SSIS: `/microsoftdocs/sql-docs`. Singkatan `ms:` = `https://github.com/microsoftdocs/sql-docs/blob/live/docs/`, `azsql:` = `https://github.com/microsoftdocs/sql-docs/blob/live/azure-sql/`.
- Microsoft Fabric: `/microsoftdocs/fabric-docs` (sekali juga `/websites/learn_microsoft_en-us_fabric`). Singkatan `fab:` = `https://github.com/microsoftdocs/fabric-docs/blob/main/docs/`. Tiga artikel yang paling sering dipakai: `fab:data-warehouse/dimensional-modeling-dimension-tables.md` (disingkat **fab-dim**), `fab:data-warehouse/dimensional-modeling-fact-tables.md` (**fab-fact**), `fab:data-warehouse/dimensional-modeling-load-tables.md` (**fab-load**).
- Power BI: `/microsoftdocs/powerbi-docs`. Singkatan `pbi:` = `https://github.com/microsoftdocs/powerbi-docs/blob/main/powerbi-docs/`.
- Microsoft Learn (modul pelatihan resmi, untuk normalisasi dan gudang data): `/microsoftdocs/learn`. Singkatan `learn:` = `https://github.com/microsoftdocs/learn/blob/main/learn-pr/`.
- "Query" = bukti tambahan dengan `node tools/query.mjs` (PostgreSQL 18.6 / PGlite 0.5.16, mesin yang sama dengan mesin latihan). Bukti ini hanya pelengkap.

Status: **cocok**, **salah** (diperbaiki), **tidak ditemukan** (dicoba 2-4 query; kalimat diubah, atau dipertahankan dengan alasan yang ditulis).

Ringkasan: 125 klaim dicek (model-01: 30, model-02: 31, model-03: 39, model-04: 25). 13 salah atau tidak tepat dan diperbaiki. 11 tidak ditemukan: 8 kalimat diubah supaya tidak lagi menyatakan hal yang tidak bisa dipastikan, 3 dipertahankan (2 definisi istilah yang wajib ada di kerangka bab, 1 dibuktikan dengan query di bab). Sisanya (101) cocok; 10 di antaranya diperjelas atau diberi tambahan keterangan dari dokumentasi (termasuk 1 baris tsql baru tentang SSIS). Keempat bab lulus `node tools/check-content.mjs --lesson <id>`.

Angka data TokoKita tidak dihitung ulang (sesuai `VERIFY-CONTEXT7.md`), kecuali yang dipakai sebagai bukti perilaku (nomor identity 301, constraint `app.order_items`).

## model-01: Dari aplikasi ke gudang data

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | OLTP: perintah kecil, sedikit baris | cocok | azsql:database/in-memory-oltp-overview.md ("most of the requests read or update smaller set of data") | - |
| 2 | OLAP: membaca dan meringkas banyak baris; diisi dari OLTP | cocok | azsql:database/in-memory-oltp-overview.md ("OLAP workloads are updated periodically from OLTP workloads") | - |
| 3 | Query analisis berat bisa memperlambat aplikasi; "alasan utama" disalin | sebagian tidak ditemukan | ms:relational-databases/indexes/get-started-with-columnstore-for-real-time-operational-analytics.md (dampak beban analisis pada OLTP perlu ditekan; gudang data terpisah tetap perlu untuk banyak sumber). Peringkat "alasan utama" tidak ada | "Itulah alasan utama" → "Itu salah satu alasan" |
| 4 | Tabel OLTP ternormalisasi | cocok | learn:wwl-data-ai/explore-performance-based-design/includes/2-describe-normalization.md ("Third normal form is typically the aim for most OLTP databases") | - |
| 5 | Diagram ER, garis relasi, foreign key, satu-ke-banyak | cocok | learn:wwl-data-ai/describe-concepts-of-relational-data/includes/2-explore-characteristics.md | - |
| 6 | Normalisasi: setiap fakta di satu tempat | cocok | learn:wwl-data-ai/explore-performance-based-design/includes/2-describe-normalization.md (alamat pelanggan disimpan di satu tempat) | - |
| 7 | 1NF: satu nilai per sel, tanpa kolom berulang, ada kunci | cocok | learn: (sama, "Eliminate repeating groups", "Identify ... with a primary key"); learn:wwl-data-ai/explore-relational-data-offerings/includes/3-normalization.md ("Separate each discrete attribute into its own column") | - |
| 8 | Kunci gabungan = kunci dari lebih satu kolom | cocok | learn: (sama, "composite key") | - |
| 9 | 2NF: bergantung pada seluruh kunci gabungan, hanya berarti untuk kunci gabungan | cocok | learn: (sama, "Second normal form is only relevant to tables with composite keys") | - |
| 10 | 3NF: tidak ada kolom bukan kunci yang ditentukan kolom bukan kunci lain | cocok | learn: (sama, "nontransitively dependent on the primary key") | - |
| 11 | Anomali update: sebagian baris diubah, data tidak konsisten | cocok | learn: (sama, "update anomaly") | - |
| 12 | Nama "anomali tambah" dan "anomali hapus" | tidak ditemukan | 3 query di learn dan sql-docs; hanya "update anomaly" yang ada | Contoh dipertahankan (akibatnya terlihat dari struktur tabel), nama istilah dihapus: "Tabel ini juga bermasalah saat menambah dan menghapus data". Definisi istilah dan ringkasan disesuaikan |
| 13 | Gudang data: dari banyak sumber, dirapikan, menyimpan riwayat | cocok | learn:wwl-data-ai/introduction-to-data-engineering-azure/includes/4-common-patterns-azure-data-engineering.md ("integrated data from one or more disparate sources ... current and historical data") | - |
| 14 | Data mart: bagian gudang data untuk satu tim/topik | tidak ditemukan | 4 query (fabric, powerbi, learn, sql-docs). ms:integration-services/change-data-capture/change-data-capture-ssis.md hanya memakai istilahnya ("data marts and data warehouses") tanpa definisi | Dipertahankan: istilah ini ada di kerangka bab dan wajib punya definisi (AUTHORING.md). Perlu keputusan pemilik kursus |
| 15 | "Pembagian yang sama juga dikenal dengan nama medallion"; isi tiap lapisan | salah (terlalu kuat) | fab:onelake/onelake-medallion-lakehouse-architecture.md (bronze "Store everything exactly as it arrives", silver "Fix errors, standardize formats, and remove duplicates", gold "Organize for reports"); fab:data-factory/common-dbt-job-patterns.md (lapisan staging/marts "without being treated as identical concepts") | Diubah menjadi "Pembagian yang mirip ...", isi tiap lapisan mengikuti dokumentasi Fabric, ditambah kalimat bahwa pemetaannya tidak persis sama. Definisi istilah dan ringkasan disesuaikan |
| 16 | Microsoft Fabric = layanan analisis data Microsoft | cocok | fab: (deskripsi pustaka: "all-in-one analytics solution"); fab:fundamentals/fabric-terminology.md | - |
| 17 | Lapisan raw (bronze) tidak pernah ditimpa | cocok | fab:onelake/onelake-medallion-lakehouse-architecture.md ("No changes are allowed", "original copies are preserved") | Ditambah kutipan maknanya dari Fabric |
| 18 | ETL: "Gudang data tidak menyimpan versi mentahnya" | salah (tidak didukung) | fab:data-factory/data-factory-overview.md ("ETL: Transform your data before loading"); fab-load (tahap "load staging tables" tetap ada) | Diganti: "Yang masuk ke gudang data adalah hasil yang sudah diubah" |
| 19 | ELT: "dibersihkan dengan SQL di dalam gudang data" | salah (terlalu sempit) | fab:data-factory/data-factory-overview.md ("Load raw data first, then transform it where it's stored ... Spark Notebooks, or SQL-based tools") | "misalnya dengan SQL"; definisi istilah dan ringkasan disesuaikan |
| 20 | ETL dipakai "kalau sebagian data tidak boleh masuk gudang data" | tidak ditemukan | fab:data-factory/data-factory-overview.md hanya menyebut "clean, standardize, or enrich data as it moves" dan bahwa keduanya bisa digabung | Contoh diganti dengan isi dokumentasi Fabric |
| 21 | (tsql) PostgreSQL: tabel tanpa skema masuk ke public | salah (tidak lengkap) | pg:runtime-config-client.html ("placed in the first valid schema named in search_path"); pg:ddl-schemas.html | Diubah: skema pertama di search_path, dengan pengaturan bawaan biasanya public |
| 22 | (tsql) SQL Server: nama tanpa skema dicari di skema bawaan, "kalau tidak bisa ditentukan, dipakai dbo" | salah (mencampur dua aturan) | ms:relational-databases/security/authentication-access/ownership-and-user-schema-separation.md (dicari di skema bawaan, lalu dbo); ms:t-sql/statements/create-user-transact-sql.md (skema bawaan yang tidak bisa ditentukan = dbo) | Dipisah menjadi dua aturan yang benar |
| 23 | (tsql) Nama tiga bagian untuk database lain di server yang sama | cocok | ms:t-sql/language-elements/transact-sql-syntax-conventions-transact-sql.md (multipart names); ms:tools/sql-database-projects/concepts/project-references.md ("Different database, same server - three-part naming") | - |
| 24 | (tsql) PostgreSQL hanya menerima nama database yang sedang tersambung | cocok | pg:ddl-schemas.html ("the database name must match the current database") | - |
| 25 | (tsql) Tipe text akan dihapus di versi mendatang | cocok | ms:t-sql/data-types/ntext-text-and-image-transact-sql.md | - |
| 26 | (tsql) decimal dan numeric sama | cocok | ms:t-sql/data-types/decimal-and-numeric-transact-sql.md ("synonyms") | - |
| 27 | (tsql) bit 1/0/NULL; 'TRUE'/'FALSE' menjadi 1/0 | cocok | ms:t-sql/data-types/bit-transact-sql.md | - |
| 28 | (tsql) timestamp = rowversion, bukan tanggal | cocok | ms:t-sql/data-types/rowversion-transact-sql.md; ms:t-sql/functions/date-and-time-data-types-and-functions-transact-sql.md | - |
| 29 | (tsql) SSIS: alat ETL untuk gudang data | cocok | ms:integration-services/ssis-how-to-create-an-etl-package.md ("ETL packages for data warehousing") | - |
| 30 | (tsql) SSIS "dipasang lewat instalasi SQL Server" | cocok, diperjelas | ms:integration-services/install-windows/install-integration-services.md ("Install SSIS with the SQL Server Setup Wizard ... does NOT install the tools required to design and develop SSIS packages") | Ditambah: di Windows; alat perancangnya dipasang terpisah |

## model-02: Desain dimensional (Kimball)

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | Metode "paling banyak dipakai" dari Kimball, buku The Data Warehouse Toolkit | salah (peringkat tidak didukung) | fab-dim (tip: "widely adopted published content, like The Data Warehouse Toolkit ... by Ralph Kimball, and others") | "Rujukan yang banyak dipakai ...; dokumentasi Fabric juga merujuk ke buku ini". Definisi istilah disesuaikan |
| 2 | Desain dimensional hanya dua jenis tabel: fakta dan dimensi | cocok | fab:data-warehouse/dimensional-modeling-overview.md ("A star schema comprises fact tables and dimension tables") | - |
| 3 | "Kimball menyusun desain dalam empat langkah" | tidak ditemukan | 4 query (fabric, powerbi, sql-docs; resolve-library-id "Kimball" tidak menemukan pustaka Kimball) | Atribusi dihapus: "Bab ini menyusun desain dalam empat langkah". Ringkasan dan soal model-02-14 disesuaikan |
| 4 | Grain ditetapkan sebelum kolom; jangan campur dua grain | cocok sebagian | pbi:guidance/star-schema.md ("ensure that fact tables load data at a consistent grain"). Urutan "sebelum kolom" sebagai aturan Kimball tidak ditemukan | Ditulis sebagai cara kerja bab ini; definisi istilah grain memakai kalimat dokumentasi |
| 5 | "Kimball menyarankan grain paling rinci (atomic grain)" | tidak ditemukan | fab-fact hanya: "transaction fact tables store facts at the lowest possible level of granularity" | Diganti dengan kalimat Fabric; nama "atomic grain" dihapus |
| 6 | Tabel fakta = kunci dimensi + measure | cocok | fab-fact; pbi:guidance/star-schema.md | - |
| 7 | Awalan fact_/dim_ hanya kebiasaan, bukan aturan PostgreSQL | cocok | fab-dim dan fab-fact memakai awalan lain (d_Salesperson, f_Sales), jadi awalan memang pilihan penamaan | - |
| 8 | Tabel dimensi sengaja tidak dinormalisasi | cocok | fab-dim ("One exception to denormalization is to design a snowflake dimension") | - |
| 9 | "Pengulangan ini murah, karena tabel dimensi kecil" (umum) | salah (terlalu umum) | fab-dim ("the most useful ... dimensions ... are big, wide dimensions ... in excess of millions") | Dibatasi ke TokoKita: "Di TokoKita, ... tabel dimensinya kecil" |
| 10 | Star schema: fakta di tengah, dimensi terhubung langsung | cocok | pbi:explore-reports/end-user-glossary.md ("directly linked to multiple dimension tables") | - |
| 11 | Kunci dimensi harus unik supaya JOIN tidak berlipat | cocok | fab-dim (surrogate key "single-column unique identifier ... primary key") | - |
| 12 | Snowflake: dimensi dinormalisasi menjadi beberapa tabel | cocok | pbi:guidance/star-schema.md; fab-dim | - |
| 13 | "Kimball menyarankan star schema ... penghematan snowflake jarang berarti karena tabel dimensi memang kecil" | salah (atribusi tidak ditemukan, alasan bertentangan) | fab:data-warehouse/dimensional-modeling-overview.md (star schema "recommended"); fab-dim (snowflake untuk dimensi "extremely large and storage costs outweigh the need for high query performance") | Diganti dengan saran Fabric, lalu "Dimensi produk TokoKita hanya 150 baris, jadi bentuk star lebih cocok" |
| 14 | Additive: boleh dijumlah menurut dimensi apa pun | cocok | fab-fact ("can be summed across any dimension") | - |
| 15 | Semi-additive: "tidak menurut waktu" | salah (terlalu sempit) | fab-fact ("can be summed across certain dimensions only"; contoh antar periode, antar produk, antar mata uang) | Diubah menjadi "menurut sebagian dimensi saja", dengan waktu sebagai contoh. Definisi istilah dan ringkasan disesuaikan |
| 16 | Non-additive: persentase, rasio, harga satuan | cocok | fab-fact ("rates, like unit prices, and ratios") | - |
| 17 | Non-additive: rata-rata dan jumlah pelanggan unik | tidak ditemukan (eksplisit) | fab-fact tidak menyebut keduanya | Dipertahankan: bab membuktikannya dengan query (jumlah angka bulanan 4.314 lawan 1.352 pelanggan unik; rata-rata dari rata-rata berbeda dengan rata-rata sebenarnya) |
| 18 | "Aturan Kimball": simpan komponen rasio | salah (atribusi) | fab-fact ("better practice to store the values used to compute the ratio ... discount amount") | Atribusi diganti ke dokumentasi Fabric |
| 19 | Transaction fact: satu baris per kejadian, dicatat sekali | cocok | fab-fact ("All the data is fully known when inserted, and it never changes (except to correct errors)") | - |
| 20 | Periodic snapshot: keadaan akhir periode; measure "sering" semi-additive | cocok | fab-fact ("Measures are always semi-additive"; contoh stok akhir hari). "Sering" tidak bertentangan | - |
| 21 | Accumulating snapshot: satu baris per perjalanan, kolom tanggal per tahap, diperbarui | cocok | fab-fact ("updated in a predictable sequence every time a milestone event occurs") | - |
| 22 | Factless: tanpa kolom angka, dihitung dengan COUNT | cocok | fab-fact ("measurement can be achieved by counting fact rows"); pbi:guidance/star-schema.md | - |
| 23 | "Kimball membedakan" empat jenis tabel fakta | salah (atribusi dan jumlah) | fab-fact ("There are three types of fact tables"; factless dibahas terpisah) | Diganti: tiga jenis menurut Fabric, ditambah nama khusus factless. Ringkasan disesuaikan |
| 24 | Conformed dimension dipakai beberapa tabel fakta | cocok | fab-dim ("shared by multiple stars ... deliver consistency") | - |
| 25 | Jangan JOIN dua tabel fakta langsung | cocok | pbi:guidance/relationships-many-to-many.md ("we don't recommend that you relate two fact tables directly") | - |
| 26 | Bus matrix: definisi | tidak ditemukan | 3 query (fabric, learn_microsoft fabric, sql-docs) | Kalimat diubah menjadi alat perencanaan yang dipakai bab ini ("bab ini memakai bus matrix"). Istilah tetap (ada di kerangka). Perlu keputusan pemilik kursus |
| 27 | (tsql) AVG int menghasilkan int di SQL Server; numeric di PostgreSQL | cocok | ms:t-sql/functions/avg-transact-sql.md; pg:functions-aggregate.html (`avg(integer) → numeric`) | - |
| 28 | (tsql) Bilangan bulat dibagi bilangan bulat membuang pecahan, di kedua dialek | cocok | ms:t-sql/language-elements/divide-transact-sql.md; pg:functions-math.html | - |
| 29 | (tsql) COUNT(DISTINCT …) satu ekspresi; CONCAT mengubah angka ke teks | cocok | ms:t-sql/functions/count-transact-sql.md; ms:t-sql/functions/concat-transact-sql.md ("implicitly converts all arguments to string types"); pg:functions-aggregate.html | - |
| 30 | (tsql) DATETRUNC sejak SQL Server 2022 | cocok | ms:t-sql/functions/datetrunc-transact-sql.md ("introduced in SQL Server 2022") | - |
| 31 | (tsql) COUNT int, gagal di atas 2.147.483.647; COUNT_BIG bigint; PostgreSQL COUNT bigint | cocok | ms:t-sql/functions/count-transact-sql.md; ms:t-sql/functions/count-big-transact-sql.md; pg:functions-aggregate.html | - |

## model-03: Membangun dimensi

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | Surrogate key: bilangan bulat buatan gudang data, tanpa arti bisnis | cocok | fab-dim ("generated and stored in the dimension table", "avoid giving meaning to the key values"); fab-load ("smallest possible integer data type") | - |
| 2 | Alasan surrogate key: banyak sumber, nomor sumber berubah/dipakai ulang, SCD tipe 2 | cocok | fab-dim ("insulate the data warehouse from changes in source data", "avoiding clash of duplicate identifiers", "Track dimension history with ... SCD type 2") | - |
| 3 | Natural key = kunci dari sistem sumber | cocok | fab-dim ("the key stored in the source system") | - |
| 4 | Business key = konsep terpisah dari natural key ("kode yang dipakai orang"), "sering dipakai sebagai natural key" | salah | fab-dim ("Sometimes a natural key is called a business key, and its values might be meaningful to business users") | Business key ditulis sebagai nama lain natural key. Tujuan bab, definisi istilah, dan teks bagian disesuaikan |
| 5 | Identity BY DEFAULT boleh diisi sendiri; ALWAYS butuh OVERRIDING SYSTEM VALUE | cocok | pg:ddl-identity-columns.html; pg:sql-insert.html | - |
| 6 | Unknown member -1 untuk dimensi yang tidak ditemukan | cocok | fab-dim (tabel special dimension members: "-1 Unknown (lookup failure during a fact table load)") | - |
| 7 | JOIN biasa membuang baris fakta yang tidak punya pasangan | cocok | fab-load ("the fact row must still get inserted ... One approach is to store a special dimension member") | - |
| 8 | SCD tipe 1 menimpa, riwayat hilang | cocok | fab-dim ("Overwrite the existing dimension member"); fab:data-factory/slowly-changing-dimension-type-one.md | - |
| 9 | INSERT … ON CONFLICT DO UPDATE, excluded | cocok | pg:sql-insert.html | - |
| 10 | Penghitung identity maju untuk baris yang berakhir sebagai UPDATE; baris berikutnya 301 | cocok | pg:functions-sequence.html ("an INSERT with an ON CONFLICT clause will compute the to-be-inserted tuple, including doing any required nextval calls") + query (setelah 3 kali muat, baris baru mendapat 451, jadi setelah 2 kali muat 301) | - |
| 11 | Menghapus isi dimensi lalu memuat ulang memberi kunci baru | cocok | fab-load ("you should never perform a truncate and full reload of it") | - |
| 12 | Dimensi tanggal; date_key YYYYMMDD integer, mudah dibaca, urut | cocok, ditambah | fab-dim ("store the date by using YYYYMMDD format and the int data type ... the only exception ... when the surrogate key value has meaning") | Ditambah kalimat pengecualian dari Fabric |
| 13 | isodow 1 (Senin) sampai 7 (Minggu) | cocok | pg:functions-datetime.html | - |
| 14 | Month/Day dipanjangkan 9 karakter; FM membuang spasi | cocok | pg:functions-formatting.html | - |
| 15 | TM memakai lc_time; di mesin latihan tetap bahasa Inggris | cocok | pg:functions-formatting.html ("TM prefix ... based on lc_time") + query (lc_time = C, `to_char(..., 'TMMonth')` = October) | - |
| 16 | generate_series dengan langkah interval | cocok | pg:functions-srf.html | - |
| 17 | Role-playing: satu dimensi tanggal di-JOIN beberapa kali | cocok | fab-dim ("order date, ship date, and delivery date ... only one physical date dimension") | - |
| 18 | Baris khusus "belum terjadi" untuk dimensi tanggal | cocok | fab-dim (special dimension members, termasuk N/A); fab-fact ("record a N/A state until the process arrives at a certain milestone") | - |
| 19 | Degenerate dimension: nomor pesanan di tabel fakta tanpa tabel dimensi | cocok | fab-dim ("sales order number ... not to copy this data to create a separate dimension table") | - |
| 20 | Junk dimension: gabungan penanda bernilai sedikit, satu baris per kombinasi | cocok, kurang lengkap | fab-dim ("low cardinality", "typically stores the Cartesian product of all dimension attribute values") | Ditambah: biasanya berisi semua kombinasi yang mungkin; soal model-03-10 cukup memakai kombinasi yang muncul. Bagian `why` soal itu disesuaikan |
| 21 | Jenis SCD dipilih per kolom | cocok | fab-dim ("a dimension could support both SCD type 1 and SCD type 2 changes") | Ditambah kalimat dari Fabric |
| 22 | SCD tipe 0: nilai tidak pernah diubah | tidak ditemukan (nama "tipe 0") | fab-dim hanya tipe 1, 2, 3 sebagai "most common". Konsepnya ada di ms:integration-services/data-flow/transformations/slowly-changing-dimension-transformation.md ("Fixed attribute changes indicate the column value must not change") | Istilah tetap (ada di kerangka); ditambah baris tsql yang memetakan ke fixed attribute di SSIS |
| 23 | SCD tipe 2: baris baru, valid_from/valid_to, is_current | cocok | fab:iq/plan/powertable-concept-slowly-changing-dimensions.md (surrogate key, effective dates, active flag); fab-dim | - |
| 24 | SCD tipe 3: kolom tambahan, "hanya satu langkah riwayat" | cocok, diperjelas | fab:iq/plan/powertable-concept-slowly-changing-dimensions.md ("can maintain only a limited amount of historical data"); fab-dim ("Type 3 isn't commonly used ... Consider ... SCD type 2") | Definisi: "terbatas, sebanyak kolom tambahan"; ditambah saran Fabric |
| 25 | LAG/LEAD menghasilkan NULL kalau tidak ada baris | cocok | pg:functions-window.html | - |
| 26 | Perbandingan dengan NULL tidak bernilai benar | cocok | pg:functions-comparison.html | - |
| 27 | date - 1 menghasilkan tanggal sebelumnya | cocok | pg:functions-datetime.html (`date - integer → date`) | - |
| 28 | (tsql) identity(seed, increment), bawaan (1,1), satu per tabel, tidak menjamin unik/berurutan, nomor tidak dipakai ulang | cocok | ms:t-sql/statements/create-table-transact-sql.md; ms:t-sql/statements/create-table-transact-sql-identity-property.md | - |
| 29 | (tsql) SET IDENTITY_INSERT, daftar kolom wajib, satu tabel per sesi | cocok | ms:t-sql/statements/set-identity-insert-transact-sql.md (pesan error 8101 dan aturan satu tabel per sesi) | - |
| 30 | (tsql) date 0001-01-01 s.d. 9999-12-31; datetime2 rentang sama, presisi bawaan 7 | cocok | ms:t-sql/functions/date-and-time-data-types-and-functions-transact-sql.md; ms:t-sql/data-types/datetime2-transact-sql.md | - |
| 31 | (tsql) DATEPART int; EXTRACT PostgreSQL numeric, diubah otomatis ke integer saat dimasukkan | cocok | ms:t-sql/functions/datepart-transact-sql.md; pg:functions-datetime.html; pg:typeconv-query.html (assignment cast) + query (`pg_cast` numeric→integer castcontext = a) | - |
| 32 | (tsql) DATEPART(weekday) bergantung SET DATEFIRST; bawaan U.S. English 7; berlaku per sesi | cocok | ms:t-sql/functions/datepart-transact-sql.md; ms:t-sql/statements/set-datefirst-transact-sql.md ("affects the current session") | - |
| 33 | (tsql) DATENAME nvarchar, mengikuti SET LANGUAGE dan bahasa bawaan login | cocok | ms:t-sql/functions/datename-transact-sql.md | - |
| 34 | (tsql) GENERATE_SERIES SQL Server 2022, hanya angka; DATEADD date → date | cocok | ms:t-sql/functions/generate-series-transact-sql.md (tipe argumen hanya angka, compatibility level 160); ms:t-sql/functions/dateadd-transact-sql.md | - |
| 35 | (tsql) "SQL Server tidak punya ON CONFLICT" | tidak ditemukan (klaim "tidak ada") | ms:t-sql/statements/insert-transact-sql.md (argumen INSERT tidak memuat ON CONFLICT) | Diubah: "Dokumentasi sintaks INSERT di SQL Server tidak memuat ON CONFLICT" |
| 36 | (tsql) MERGE wajib titik koma; error kalau satu baris tujuan cocok dengan banyak baris sumber; PostgreSQL serupa | cocok | ms:t-sql/statements/merge-transact-sql.md; ms:relational-databases/errors-events/includes/sql-server-2025-database-engine-events-and-errors-8000-8999.md (8672); pg:sql-merge.html ("cardinality violation") | - |
| 37 | (tsql) date tidak bisa dikurangi angka dengan minus | cocok | ms:t-sql/language-elements/subtract-transact-sql.md ("Can't be used with date, time, datetime2, or datetimeoffset") | - |
| 38 | (tsql) "SQL Server tidak punya tipe boolean" | tidak ditemukan (klaim "tidak ada") | ms:t-sql/data-types/data-types-transact-sql.md (daftar tipe tanpa boolean; "The bit data type is used for storing Boolean values") | Diubah: "Daftar tipe data SQL Server tidak memuat boolean ..." |
| 39 | (tsql, baru) SSIS Slowly Changing Dimension transformation | cocok | ms:integration-services/data-flow/transformations/slowly-changing-dimension-transformation.md (changing = Type 1, historical = Type 2, fixed attribute, "does not support Type 3") | Baris tsql baru ditambahkan (permintaan: cek SSIS) |

## model-04: Membangun tabel fakta

| # | Klaim (kutipan pendek) | Status | Rujukan Context7 | Perbaikan |
|---|---|---|---|---|
| 1 | Lookup surrogate key: JOIN natural key ke dimensi | cocok | fab-load ("for each dimension key, a lookup determines the surrogate key value") | - |
| 2 | LEFT JOIN + coalesce(…, -1) supaya baris fakta tidak hilang | cocok | fab-load ("the fact row must still get inserted ... store a special dimension member (like Unknown)") | - |
| 3 | date_key bisa dihitung langsung dari tanggal | cocok | fab-load ("Usually the surrogate key can be computed for the date and time dimensions because they should use YYYYMMDD") | - |
| 4 | Point-in-time join memilih versi saat kejadian; is_current memberi versi salah | cocok, perlu konteks | fab-load ("When a dimension supports SCD type 2, the surrogate key for the current version ... should be retrieved"; urutan muatan: dimensi dulu, lalu fakta); fab:iq/plan/powertable-concept-slowly-changing-dimensions.md ("Effective dates enable point-in-time historical reporting") | Ditambah paragraf: saran Fabric berlaku untuk muatan rutin; bab ini memuat riwayat sekaligus, jadi syarat tanggal diperlukan |
| 5 | Late arriving dimension: sementara ke unknown member, lalu diperbaiki | cocok, ditambah | fab-load ("This approach requires a later update"; cara lain "Inferred dimension members") | Definisi: "Salah satu cara ..."; ditambah cara inferred member dari Fabric |
| 6 | order_id dan line_no = degenerate dimension | cocok | fab-fact (SalesOrderNo, SalesOrderLineNo sebagai attributes yang "could form a degenerate dimension"); fab-dim | - |
| 7 | qty, gross, discount, net additive; harga satuan dan persen diskon non-additive | cocok | fab-fact | - |
| 8 | PRIMARY KEY menolak baris dobel | cocok | pg:ddl-constraints.html ("enforces both uniqueness and not-null") | - |
| 9 | Setiap baris isi pesanan pasti punya pesanan karena foreign key | cocok | pg:ddl-constraints.html + query (`order_items_order_id_fkey` ada di `pg_constraint`) | - |
| 10 | COUNT(kolom) tidak menghitung NULL; AVG melewati NULL | cocok | pg:functions-aggregate.html (`count("any")` "input value is not null"; avg "non-null input values") | - |
| 11 | date - date = jumlah hari (integer) | cocok | pg:functions-datetime.html | - |
| 12 | Baris transaction fact "ditulis sekali dan tidak diubah" | cocok, diperjelas | fab-fact ("it never changes (except to correct errors)") | Ditambah "kecuali untuk memperbaiki kesalahan" |
| 13 | Accumulating snapshot diperbarui per tonggak; measure durasi; tonggak belum terjadi berkunci khusus | cocok | fab-fact | - |
| 14 | MERGE WHEN MATCHED / WHEN NOT MATCHED | cocok | pg:sql-merge.html | - |
| 15 | Materialized view mengingat query, diisi saat dibuat; REFRESH membuang isi lama dan menjalankan query lagi | cocok | pg:sql-creatematerializedview.html; pg:sql-refreshmaterializedview.html ("The old contents are discarded") | - |
| 16 | Tabel cocok kalau butuh constraint seperti PRIMARY KEY (materialized view tidak bisa) | cocok | pg:sql-altermaterializedview.html (subform hanya sebagian dari ALTER TABLE) + query (ERROR 42809 "ALTER action ADD CONSTRAINT cannot be performed" untuk materialized view) | - |
| 17 | (tsql) "Tanda :: tidak ada di SQL Server" | salah | ms:t-sql/language-elements/set-local-variable-transact-sql.md ("For a static method, use two colons (::)"); ms:t-sql/spatial-geometry/stgeomfromtext-geometry-data-type.md (`geometry::STGeomFromText`) | Diubah: ":: tidak dipakai untuk mengubah tipe data (tanda itu punya arti lain di T-SQL); pakai CAST" |
| 18 | (tsql) CAST datetime ke date membuang jam | cocok | ms:t-sql/functions/cast-and-convert-transact-sql.md ("non-applicable portion is dropped") | - |
| 19 | (tsql) DATEDIFF menghitung batas yang dilewati, int | cocok | ms:t-sql/functions/datediff-transact-sql.md | - |
| 20 | (tsql) CONVERT gaya 112 = yyyyMMdd | cocok | ms:t-sql/functions/cast-and-convert-transact-sql.md | - |
| 21 | (tsql) SET IDENTITY_INSERT untuk -1 | cocok | ms:t-sql/statements/set-identity-insert-transact-sql.md | - |
| 22 | (tsql) MERGE titik koma (10713), BY TARGET opsional, hindari columnstore sebagai tujuan | cocok | ms:t-sql/statements/merge-transact-sql.md ("Avoid tables with any form of columnstore index as the target of MERGE ... staged rowstore table, then performing a batched DELETE and INSERT") | - |
| 23 | (tsql) Columnstore standar untuk tabel fakta, sampai 10x; clustered = seluruh tabel; PRIMARY KEY bawaan CLUSTERED; constraint lewat rowstore | cocok | ms:relational-databases/indexes/columnstore-indexes-overview.md; azsql:managed-instance/in-memory-oltp-overview.md ("all data in the table is organized in the columnar format"); ms:t-sql/statements/alter-table-table-constraint-transact-sql.md; ms:t-sql/statements/create-columnstore-index-transact-sql.md ("Constraints are always enforced with a row-store index"); ms:relational-databases/indexes/columnstore-indexes-data-warehouse.md | - |
| 24 | (tsql) Daftar index PostgreSQL tidak memuat columnstore | cocok | pg:indexes-types.html; pg:sql-createindex.html | - |
| 25 | (tsql) Indexed view: unique clustered, SCHEMABINDING, COUNT_BIG(*), larangan (COUNT, AVG, MIN, MAX, DISTINCT, LEFT JOIN, CTE, subquery); ikut diperbarui otomatis dan bisa memperlambat DML | cocok | ms:relational-databases/views/create-indexed-views.md; ms:relational-databases/views/views.md | - |

## Hal yang perlu keputusan pemilik kursus

1. **Data mart** (model-01) dan **bus matrix** (model-02): definisinya tidak ada di Context7. Keduanya istilah kerangka yang dipakai bab lain, jadi tidak dihapus. Bus matrix sekarang ditulis sebagai alat perencanaan yang dipakai bab ini, bukan sebagai klaim tentang sumber luar.
2. **Empat langkah desain** (model-02): atribusi ke Kimball dihapus karena tidak ada di Context7. Isinya dipertahankan sebagai cara kerja bab. Judul bab "Desain dimensional (Kimball)" tidak diubah; dokumentasi Fabric memang merujuk buku Kimball.
3. **SCD tipe 0** (model-03): nama "tipe 0" tidak ada di Context7, tetapi konsepnya ada di SSIS (fixed attribute).
