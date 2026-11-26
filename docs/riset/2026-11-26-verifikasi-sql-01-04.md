# Verifikasi klaim bab SQL 1–4 (tiket T06)

Tanggal: 26 November 2026. Berkas yang dicek: `dojo/content/sql-01.js` sampai `sql-04.js`.

## Cara memeriksa

- **Klaim** di sini berarti setiap pernyataan yang bisa benar atau salah. Contohnya cara kerja sebuah fungsi, tipe data, aturan NULL (sel tanpa nilai), isi tabel "Di SQL Server" (field `tsql`), angka di catatan contoh, dan alasan jawaban soal (`why`).
- **Dokumentasi resmi** yang dipakai: PostgreSQL 18 (https://www.postgresql.org/docs/18/) dan SQL Server / T-SQL (https://learn.microsoft.com/en-us/sql/t-sql/). T-SQL adalah dialek SQL milik SQL Server. Halaman Microsoft yang dibaca diperbarui antara Oktober dan November 2026.
- **Bukti query**: perintah `node tools/query.mjs "select ..."` dijalankan dari folder `dojo`. Alat ini memakai PostgreSQL 18.6 (PGlite 0.5.16) dengan data latihan TokoKita. Klaim tentang data dihitung dari seluruh baris, tidak dari sampel.
- **Status**:
  - *cocok*: klaim sesuai dokumentasi atau hasil query.
  - *salah*: klaim tidak sesuai, lalu diperbaiki di berkas bab.
  - *tidak bisa dipastikan*: dokumentasi tidak menyebutnya dan data tidak bisa membuktikannya. Kalimatnya diubah menjadi kalimat yang bisa dibuktikan.
  - *kurang lengkap*: klaimnya tidak salah, tetapi ada bagian penting yang hilang atau sudah ketinggalan versi. Bagian itu ditambahkan.

Singkatan sumber di tabel:

| Singkatan | Halaman |
|---|---|
| PG-lex | https://www.postgresql.org/docs/18/sql-syntax-lexical.html |
| PG-limit | https://www.postgresql.org/docs/18/queries-limit.html |
| PG-order | https://www.postgresql.org/docs/18/queries-order.html |
| PG-cmp | https://www.postgresql.org/docs/18/functions-comparison.html |
| PG-match | https://www.postgresql.org/docs/18/functions-matching.html |
| PG-math | https://www.postgresql.org/docs/18/functions-math.html |
| PG-cond | https://www.postgresql.org/docs/18/functions-conditional.html |
| PG-sellist | https://www.postgresql.org/docs/18/queries-select-lists.html |
| PG-select | https://www.postgresql.org/docs/18/sql-select.html |
| PG-num | https://www.postgresql.org/docs/18/datatype-numeric.html |
| PG-case | https://www.postgresql.org/docs/18/typeconv-union-case.html |
| PG-expr | https://www.postgresql.org/docs/18/sql-expressions.html (bagian 4.2.9) |
| PG-str | https://www.postgresql.org/docs/18/functions-string.html |
| PG-dt | https://www.postgresql.org/docs/18/functions-datetime.html |
| PG-dtype | https://www.postgresql.org/docs/18/datatype-datetime.html |
| PG-fmt | https://www.postgresql.org/docs/18/functions-formatting.html |
| MS-… | https://learn.microsoft.com/en-us/sql/… (alamat lengkap ada di setiap baris) |
| Q | Bukti dari `tools/query.mjs` (query ditulis di baris itu) |

## Ringkasan

| Bab | Klaim dicek | Cocok | Salah | Kurang lengkap | Tidak bisa dipastikan |
|---|---|---|---|---|---|
| sql-01 | 29 | 25 | 1 | 1 | 2 |
| sql-02 | 35 | 32 | 1 | 1 | 1 |
| sql-03 | 38 | 31 | 4 | 2 | 1 |
| sql-04 | 46 | 40 | 2 | 3 | 1 |
| **Jumlah** | **148** | **128** | **8** | **7** | **5** |

Setelah semua perbaikan, `node tools/check-content.mjs --lesson <bab>` lulus untuk keempat bab. Pemeriksaan semua bab sekaligus mencetak "Semua 8 bab lulus pemeriksaan." Angkanya 8, bukan 4, karena penulis lain sudah menyelesaikan sql-05, sql-06, model-01, dan model-02. Berkas-berkas itu tidak disentuh.

## sql-01: Data, tabel, dan SELECT pertama

| # | Klaim | Status | Sumber / bukti | Perbaikan |
|---|---|---|---|---|
| 1 | Tiga baris pertama `app.cities`: 1 Jakarta, 2 Bogor, 3 Depok (provinsi dan pulau seperti di tabel contoh) | cocok | Q: `select * from app.cities where city_id <= 3` | – |
| 2 | `app.cities` berisi 24 baris | cocok | Q: `count(*)` = 24 | – |
| 3 | Setiap kota adalah tempat tinggal pelanggan TokoKita | cocok | Q: kota tanpa pelanggan = 0 | – |
| 4 | "Database TokoKita punya dua skema" (skema adalah kelompok tabel) | salah | Q: `pg_namespace` berisi `app`, `public`, dan `raw`. Skema `public` adalah skema bawaan PostgreSQL dan berisi 0 tabel | Diganti: "Tabel TokoKita disimpan di dua skema" |
| 5 | Kalau hanya menulis `cities`, PostgreSQL menjawab tabel tidak ditemukan | cocok | Q: `search_path` (daftar skema yang dicari otomatis) = `public`; `select * from cities` menghasilkan `ERROR 42P01: relation "cities" does not exist` | – |
| 6 | Huruf besar dan kecil sama saja untuk kata perintah | cocok | PG-lex: "Key words and unquoted identifiers are case-insensitive." | – |
| 7 | Titik koma menandai akhir query, dan boleh dihilangkan kalau hanya ada satu query | cocok | PG-lex: perintah diakhiri titik koma, dan "The end of the input stream also terminates a command." | – |
| 8 | Komentar `--` berlaku sampai akhir baris | cocok | PG-lex (bagian komentar) | – |
| 9 | "Lupa koma adalah salah tulis yang paling sering terjadi" | tidak bisa dipastikan | Tidak ada data yang mengukur kesalahan mana yang paling sering | Diganti: "salah tulis yang mudah terjadi" |
| 10 | `app.customers` berisi 1.500 pelanggan; tabel pesanan lebih dari 12 ribu baris | cocok | Q: 1.500 dan 12.007 | – |
| 11 | Tanpa ORDER BY, baris mana yang keluar bersama LIMIT tidak dijamin | cocok | PG-limit: "Otherwise you will get an unpredictable subset of the query's rows." | – |
| 12 | `*` berarti semua kolom, urut sesuai susunan tabel | cocok | PG-sellist: "`*` which emits all columns"; Q: `information_schema.columns` | – |
| 13 | Contoh `sku` TK-10007 ada | cocok | Q: 1 baris | – |
| 14 | Query dengan `*` "lebih lambat untuk tabel besar" | tidak bisa dipastikan | Dokumentasi tidak menyebutnya, dan tidak diukur dengan data | Diganti: `*` ikut mengambil kolom yang tidak dipakai, sehingga hasilnya lebih besar dari yang perlu |
| 15 | `app.products` punya 8 kolom: product_id, sku, product_name, category_id, brand, list_price, is_active, created_at | cocok | Q: `information_schema.columns` | – |
| 16 | Kata `AS` boleh dihilangkan | kurang lengkap | PG-select: "`AS` is required if the new column name matches any keyword at all"; Q: `select product_name from from ...` menghasilkan error | Ditambahkan: "selama aliasnya bukan kata perintah SQL seperti `from`" |
| 17 | Tanpa koma, `select product_name list_price` menghasilkan satu kolom berjudul list_price yang isinya nama produk | cocok | Q: hasilnya satu kolom `list_price` berisi nama produk | – |
| 18 | Alias satu kata dengan huruf kecil boleh tanpa tanda kutip | cocok | PG-lex: nama tanpa kutip dibaca sebagai huruf kecil | – |
| 19 | ASC adalah urutan bawaan, dari kecil ke besar | cocok | PG-order: "`ASC` order is the default." | – |
| 20 | Kolom kedua di ORDER BY hanya dipakai untuk baris yang nilai kolom pertamanya sama | cocok | PG-order: "the later values are used to sort rows that are equal according to the earlier values" | – |
| 21 | Urutan kerjanya: urutkan, lewati n baris (OFFSET), lalu ambil (LIMIT) | cocok | PG-limit: "`OFFSET` rows are skipped before starting to count the `LIMIT` rows" | – |
| 22 | `app.staff` berisi 25 karyawan (`why` soal 01-04) | cocok | Q: 25 | – |
| 23 | T-SQL: `SELECT TOP 5`, dan LIMIT tidak dikenal | cocok | MS-TOP https://learn.microsoft.com/en-us/sql/t-sql/queries/top-transact-sql. Sintaks ORDER BY dan TOP tidak memuat LIMIT. LIMIT juga tidak disebut di "What's new in SQL Server 2025" | – |
| 24 | T-SQL: `OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY`, dan OFFSET wajib bersama ORDER BY | cocok | https://learn.microsoft.com/en-us/sql/t-sql/queries/select-order-by-clause-transact-sql: `<offset_fetch>` adalah bagian dari klausa ORDER BY | – |
| 25 | T-SQL: `[nama kolom]` atau `"nama kolom"`; kutip ganda diterima dengan pengaturan bawaan | cocok | https://learn.microsoft.com/en-us/sql/t-sql/statements/set-quoted-identifier-transact-sql: "When you set `SET QUOTED_IDENTIFIER` to `ON` (the default) …". Tanda `[ ]` tidak terpengaruh pengaturan ini | – |
| 26 | Di PostgreSQL, nama tanpa tanda kutip selalu dibaca sebagai huruf kecil | cocok | PG-lex: "unquoted names are always folded to lower case" | – |
| 27 | Skema bawaan SQL Server bernama dbo | cocok | https://learn.microsoft.com/en-us/sql/t-sql/statements/create-user-transact-sql: "If the server can't determine a default schema for a user, it uses the `dbo` schema." | – |
| 28 | Nama lengkap di SQL Server bisa tiga bagian: database.skema.tabel | cocok | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/transact-sql-syntax-conventions-transact-sql. Dokumentasi menyebut nama bisa sampai empat bagian (diawali nama server). Kalimat "bisa tiga bagian" tetap benar | – |
| 29 | Komentar `--` sama di kedua dialek | cocok | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/comment-transact-sql: "Comments inserted with -- are terminated by a new line." | – |

## sql-02: Menyaring baris dengan WHERE dan NULL

| # | Klaim | Status | Sumber / bukti | Perbaikan |
|---|---|---|---|---|
| 1 | Urutan SELECT → FROM → WHERE → ORDER BY → LIMIT wajib | cocok | PG-select (urutan sintaks); Q: `... order by city_name where ...` dan `... limit 2 where ...` sama-sama menghasilkan `syntax error` | – |
| 2 | Ada produk dengan harga di atas 500.000 | cocok | Q: 5 produk | – |
| 3 | `<>` dan `!=` sama artinya | cocok | PG-cmp: "`!=` is an alias, which is converted to `<>`" | – |
| 4 | Angka ditulis tanpa titik ribuan; desimal memakai titik | cocok | PG-lex (konstanta angka) | – |
| 5 | Teks ditulis dengan kutip tunggal; kutip ganda berarti nama kolom atau tabel | cocok | PG-lex | – |
| 6 | Perbandingan teks membedakan huruf besar dan kecil | cocok | Q: `'Jawa' = 'jawa'` hasilnya false. *Collation* (aturan membandingkan teks) database adalah `C` | – |
| 7 | Sebelas kota di Pulau Jawa | cocok | Q: 11 | – |
| 8 | Format `'YYYY-MM-DD'` selalu dibaca benar oleh PostgreSQL | cocok | PG-dtype, Tabel 8.10: "1999-01-08 — ISO 8601; January 8 in any mode (recommended format)" | – |
| 9 | Tanggal tanpa jam dibaca sebagai jam 00:00:00 | cocok (lewat query) | Dokumentasi tidak menyebutnya langsung. Q: `date '2025-10-01' = timestamp '2025-10-01 00:00:00'` hasilnya true | – |
| 10 | `order_ts` berisi tanggal dan jam | cocok | Q: tipe `timestamp without time zone` | – |
| 11 | `<= '2025-10-31'` membuang pesanan 31 Oktober setelah 00:00:00 | cocok | Q: syarat `>= '2025-10-31' and < '2025-11-01'` menemukan 17 pesanan; syarat `>= '2025-10-31' and <= '2025-10-31'` menemukan 0 | – |
| 12 | AND dikerjakan sebelum OR | cocok | PG-lex, tabel prioritas operator: NOT, lalu AND, lalu OR | – |
| 13 | NOT membalik hasil syarat | cocok | PG-lex (tabel operator) | – |
| 14 | Nilai channel: web, android, ios | cocok | Q: `distinct channel`; kamus data | – |
| 15 | Nilai segment: Reguler, Silver, Gold | cocok | Q: `distinct segment` | – |
| 16 | Kota 1 = Jakarta, 6 = Bandung, 10 = Surabaya | cocok | Q | – |
| 17 | BETWEEN mengikutkan kedua batasnya | cocok | PG-cmp: "BETWEEN treats the endpoint values as included" | – |
| 18 | `%` cocok dengan teks apa saja, boleh kosong | cocok | PG-match: "matches any sequence of zero or more characters" | – |
| 19 | `_` berarti "tepat satu huruf apa saja" | salah | PG-match: "stands for (matches) any single character". Q: `'5' like '_'` hasilnya true, padahal 5 adalah angka | Diganti: "tepat satu karakter apa saja", lalu dijelaskan bahwa karakter adalah huruf, angka, spasi, atau tanda baca |
| 20 | LIKE membedakan huruf besar dan kecil; ILIKE tidak | cocok | PG-match (ILIKE: "case-insensitive … PostgreSQL extension"); Q: `'a' like 'A'` false, `'a' ilike 'A'` true | – |
| 21 | Contoh pencarian bluetooth menemukan produk | cocok | Q: ILIKE menemukan 8 produk; LIKE dengan huruf kecil menemukan 0 | – |
| 22 | NULL berarti nilainya tidak diketahui; perbandingan dengan NULL hasilnya tidak diketahui | cocok | PG-cmp: "yield null (signifying "unknown")" | – |
| 23 | `where phone = null` tidak menemukan apa pun | cocok | PG-cmp ("Do not write expression = NULL"); Q: 0 baris | – |
| 24 | Ada pelanggan tanpa telepon | cocok | Q: 65 pelanggan dengan `phone` NULL, 0 berisi teks kosong | – |
| 25 | Pesanan tanpa voucher berisi NULL di `voucher_code` | cocok | Kamus data; Q: 9.967 NULL, 0 teks kosong | – |
| 26 | Voucher HEMAT10 ada | cocok | Q: 1.044 pesanan | – |
| 27 | `<> 'HEMAT10'` membuang baris NULL; hal yang sama berlaku untuk NOT IN | cocok | Q: `(null::text <> 'HEMAT10') is null` true; `(null::text not in ('HEMAT10')) is null` true | – |
| 28 | `is_active` bertipe boolean; ada produk yang sudah tidak dijual | cocok | Kamus data; Q: 9 produk `is_active = false` | – |
| 29 | Kategori 3 = Earphone (soal 02-10) | cocok | Q | – |
| 30 | Soal kaos, harga 50–75 ribu, dan 100–150 ribu menghasilkan baris | cocok | Q: 4, 26, dan 31 baris | – |
| 31 | T-SQL: "Di kebanyakan database SQL Server, LIKE dan = sudah tidak membedakan huruf besar dan kecil" | tidak bisa dipastikan | Kata "kebanyakan" tidak bisa dihitung. Yang bisa dipastikan dari https://learn.microsoft.com/en-us/sql/relational-databases/collations/collation-and-unicode-support: collation bawaan saat SQL Server dipasang ditentukan oleh bahasa Windows. Ke-190 collation bawaan di tabel halaman itu semuanya berakhiran `_CI` (*case-insensitive*, tidak membedakan huruf besar-kecil). Untuk Windows berbahasa Indonesia, bawaannya `Latin1_General_CI_AS`. Halaman LIKE (https://learn.microsoft.com/en-us/sql/t-sql/language-elements/like-transact-sql) menyebut "`LIKE` comparisons are affected by collation." | Diganti dengan fakta tersebut, ditambah kalimat bahwa collation bisa diganti per database atau per kolom |
| 32 | T-SQL: tidak ada tipe boolean; dipakai BIT berisi 1 atau 0 | cocok | https://learn.microsoft.com/en-us/sql/t-sql/data-types/bit-transact-sql ("An integer data type that can take a value of 1, 0, or NULL"). Daftar tipe data tidak memuat boolean. SQL Server 2025 tidak menambah tipe boolean | – |
| 33 | T-SQL: `<>` dan `!=` sama; `<>` bentuk standar SQL | cocok | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/not-equal-to-transact-sql-exclamation ("Functions the same as" `<>`); PG-cmp ("`<>` is the standard SQL notation") | – |
| 34 | T-SQL: `'YYYY-MM-DD'` aman untuk date dan datetime2; untuk datetime cara bacanya "mengikuti pengaturan bahasa server" | kurang lengkap | https://learn.microsoft.com/en-us/sql/t-sql/data-types/datetime-transact-sql: untuk datetime, format dengan tanda minus diatur oleh SET DATEFORMAT, sedangkan `yyyyMMdd` tidak terpengaruh. https://learn.microsoft.com/en-us/sql/t-sql/statements/set-dateformat-transact-sql: "ydm isn't supported for date, datetime2". Pengaturannya berlaku per koneksi (SET LANGUAGE / SET DATEFORMAT), bukan per server | "pengaturan bahasa server" diganti "pengaturan bahasa dan urutan tanggal yang sedang dipakai koneksimu ke SQL Server" |
| 35 | T-SQL: perilaku IS NULL sama | cocok | Halaman `!=`: "If either or both operands are NULL, NULL is returned." | – |

## sql-03: Kolom hitungan, CASE, dan nilai kosong

| # | Klaim | Status | Sumber / bukti | Perbaikan |
|---|---|---|---|---|
| 1 | Operator hitung `+ - * / %` (% = sisa bagi) | cocok | PG-math, Tabel 9.4 | – |
| 2 | Arti kolom `qty`, `unit_price`, `discount` (potongan dalam rupiah) | cocok | Kamus data (`SCHEMA_DOC`) | – |
| 3 | Kali, bagi, dan sisa bagi dikerjakan sebelum tambah dan kurang | cocok | PG-lex (tabel prioritas operator) | – |
| 4 | "Tanda kurung tidak pernah salah" | salah | Tanda kurung di tempat yang keliru mengubah hasil, misalnya `qty * (unit_price - discount)` | Diganti: tanda kurung di sekitar bagian yang memang dihitung lebih dulu, misalnya `(qty * unit_price) - discount`, tidak mengubah hasil |
| 5 | Tanpa alias, judul kolomnya `?column?` | cocok | Q: `select qty * unit_price ...` menghasilkan judul `?column?`; PG-select (contoh `SELECT 2+2`) | – |
| 6 | Tabel tipe data: qty dan order_id integer; unit_price dan amount numeric(12,2); full_name dan status text; signup_date date; order_ts timestamp; is_active boolean | cocok | Q: `information_schema.columns` | – |
| 7 | `int` sama dengan `integer` | cocok | PG-num: "`integer` (or `int`)" | – |
| 8 | `numeric(12,2)` berarti "total 12 digit" | kurang lengkap | PG-num: *precision* (jumlah digit) adalah jumlah digit maksimum. Angka 5,00 juga muat di `numeric(12,2)` | Diganti "paling banyak 12 digit" |
| 9 | numeric cocok untuk uang; real dan double precision tidak tepat | cocok | PG-num: "inexact… If you require exact storage and calculations (such as for monetary amounts), use the numeric type" | – |
| 10 | `7 / 2` = 3, angka di belakang koma dibuang | cocok | PG-math: "for integral types, division truncates the result towards zero"; Q | – |
| 11 | `7 / 2.0` = 3.5000000000000000; `7 % 2` = 1 | cocok | Q | – |
| 12 | PostgreSQL boleh menjalankan SELECT tanpa FROM | cocok | PG-select, "Omitted FROM Clauses" | – |
| 13 | ROUND(x, n); tanpa n dibulatkan ke bilangan bulat | cocok | PG-math, Tabel 9.5 | – |
| 14 | `discount` bertipe numeric, jadi pembagiannya desimal | cocok | Q: numeric(12,2) | – |
| 15 | Contoh ROUND menemukan baris dengan potongan | cocok | Q: 8 baris di pesanan 100001–100030 | – |
| 16 | CAST adalah bentuk standar; `::` bentuk khas PostgreSQL | cocok | PG-expr: "The CAST syntax conforms to SQL; the syntax with :: is historical PostgreSQL usage." | – |
| 17 | `order_ts::date` membuang jam | cocok | Q | – |
| 18 | `cast(… as integer)` membulatkan ke bilangan bulat terdekat; `cast(2.7 as integer)` = 3 | cocok (lewat query) | Dokumentasi tidak membahas konversi numeric ke integer secara langsung. Q: 2.7 → 3, 2.5 → 3, -2.5 → -3 | – |
| 19 | Setelah qty diubah ke numeric, pembagiannya tidak terpotong | cocok | Q | – |
| 20 | CASE diperiksa dari atas, berhenti di syarat pertama yang benar; tanpa ELSE hasilnya NULL | cocok | PG-cond 9.18.1 | – |
| 21 | "Semua hasil THEN dan ELSE harus bertipe sama" | salah | PG-cond: "must be convertible to a single output type"; PG-case, aturan 4–6. Q: `case when true then 1 else 2.5 end` berjalan dan menghasilkan numeric; `case when true then 1 else 'murah' end` gagal dengan `invalid input syntax for type integer` | Diganti: hasil harus bisa dijadikan satu tipe; bilangan bulat dan desimal boleh dicampur, teks dan angka tidak |
| 22 | Catatan contoh CASE: "Produk seharga 40.000 … Produk 150.000 …"; bagian kesalahan umum menyebut "produk seharga 30.000" | salah | Q: tidak ada produk seharga 40.000, 150.000, atau 30.000. Ke-15 baris yang ditampilkan semuanya di bawah 50.000 (termahal 37.900), jadi semuanya berlabel 'murah' | Catatan ditulis ulang dengan harga yang ada di data: 15 baris semuanya 'murah'; produk 137.900 masuk 'sedang'; produk 200.000 ke atas masuk 'mahal'. Angka 30.000 diganti 24.900 (harga yang ada) |
| 23 | Hitungan dengan NULL hasilnya NULL (`10 + NULL`) | cocok | Q: hasilnya NULL | – |
| 24 | COALESCE mengembalikan nilai pertama yang tidak NULL | cocok | PG-cond 9.18.2 | – |
| 25 | NULLIF(a, b) hasilnya NULL kalau a = b, selain itu a | cocok | PG-cond 9.18.3 | – |
| 26 | Bagi dengan 0 membuat query gagal; bagi dengan NULL menghasilkan NULL | cocok (lewat query) | Q: `select 1/0` menghasilkan `ERROR 22012: division by zero` | – |
| 27 | "ongkos kirim bisa 0 kalau pelanggan memakai voucher gratis ongkir" | tidak bisa dipastikan | Arti kode GRATISONGKIR tidak dijelaskan di kamus data. Yang bisa dihitung: 772 pesanan punya ongkir 0, dan semuanya memakai GRATISONGKIR. Sebaliknya, ke-772 pesanan GRATISONGKIR semuanya berongkir 0 | Diganti dengan fakta hitungan tersebut |
| 28 | Contoh NULLIF (pesanan 100001–100040) memuat pesanan berongkir 0 | cocok | Q: pesanan 100009 dan 100033 | – |
| 29 | DISTINCT berlaku untuk seluruh kolom di SELECT | cocok | PG-sellist: "two rows are considered distinct if they differ in at least one column value" | – |
| 30 | Ada lima status pesanan | cocok | Q: cancelled, completed, processing, returned, shipped | – |
| 31 | `distinct channel, status` menghasilkan pasangan yang muncul di data | cocok | Q: 15 pasangan | – |
| 32 | T-SQL: ISNULL hanya menerima dua nilai dan "khas SQL Server"; COALESCE ada di keduanya | kurang lengkap | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/coalesce-transact-sql: "ISNULL takes only two parameters." Dokumentasi tidak memakai kata "khas". Q: `select isnull(null, 1)` di PostgreSQL menghasilkan `ERROR 42883: function isnull(unknown, integer) does not exist` | Diganti: "tidak ada di PostgreSQL. COALESCE menerima banyak nilai dan berlaku di keduanya" |
| 33 | T-SQL: IIF adalah singkatan CASE dengan satu syarat | cocok | https://learn.microsoft.com/en-us/sql/t-sql/functions/logical-functions-iif-transact-sql: "IIF is a shorthand way for writing a CASE expression." | – |
| 34 | T-SQL: "SQL Server tidak mengenal ::" | salah | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/scope-resolution-operator-transact-sql: `::` ada di T-SQL sebagai *scope resolution operator* (tanda untuk memanggil anggota sebuah tipe, misalnya `hierarchyid::GetRoot()`), dan dipakai di `GRANT … ON SCHEMA::`. Tanda ini bukan tanda konversi tipe | Diganti: ":: bukan tanda konversi tipe (tanda itu dipakai untuk keperluan lain), jadi pakai CAST atau CONVERT". `convert(date, nilai)` cocok dengan sintaks di https://learn.microsoft.com/en-us/sql/t-sql/functions/cast-and-convert-transact-sql |
| 35 | T-SQL: `7 / 2` = 3 | cocok | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/divide-transact-sql: "…any fractional part of the result truncated." | – |
| 36 | T-SQL: `cast(2.7 as int)` = 2 (angka di belakang koma dibuang) | cocok | Halaman CAST and CONVERT, tabel "Truncating and rounding results": numeric → int = Truncate | – |
| 37 | T-SQL: `round(3.456, 1)` = 3.500 | cocok (disimpulkan) | https://learn.microsoft.com/en-us/sql/t-sql/functions/round-transact-sql: tipe hasil untuk decimal(p, s) adalah decimal(p, s). Contoh di halaman itu: `ROUND(123.9994, 3)` → 123.9990 | – |
| 38 | Padanan nama tipe: varchar/nvarchar, decimal, bit | cocok | https://learn.microsoft.com/en-us/sql/t-sql/data-types/data-types-transact-sql | – |

Soal sql-03-09 juga dicek: kalimat "semua hasilnya 0" cocok, karena pesanan 100001 hanya punya qty 1 (Q).

## sql-04: Teks, tanggal, dan membersihkan data mentah

| # | Klaim | Status | Sumber / bukti | Perbaikan |
|---|---|---|---|---|
| 1 | UPPER dan LOWER | cocok | PG-str, Tabel 9.9 | – |
| 2 | LENGTH menghitung jumlah karakter, termasuk spasi | cocok | PG-str ("number of characters"); Q: `length(' a b ')` = 5 | – |
| 3 | TRIM membuang spasi di awal dan akhir, spasi di tengah tidak tersentuh | cocok | PG-str ("a space by default … BOTH is the default"); Q | – |
| 4 | REPLACE mengganti semua potongan teks | cocok | PG-str: "Replaces all occurrences" | – |
| 5 | Fungsi yang paling dalam dikerjakan lebih dulu | cocok | Q: contoh `'TK-' \|\| substring(replace(upper(trim(...))))` menghasilkan kode yang benar | – |
| 6 | Dengan `\|\|`, satu bagian NULL membuat seluruh hasil NULL | cocok (lewat query) | PG-str tidak menyebut perilaku NULL untuk `\|\|`. Q: `('Telepon: ' \|\| NULL) is null` = true | – |
| 7 | CONCAT menganggap NULL sebagai teks kosong | cocok | PG-str: "NULL arguments are ignored."; Q: hasilnya 'Telepon: ' | – |
| 8 | "Pelanggan nomor 4 dan 9 tidak punya telepon" (di antara pelanggan 1–10) | cocok | Q: `customer_id <= 10 and phone is null` menghasilkan 4 dan 9 | – |
| 9 | LEFT, SUBSTRING … FROM … FOR, penomoran karakter mulai dari 1, POSITION hasilnya 0 kalau tidak ketemu, SPLIT_PART | cocok | PG-str; Q: `position('x' in 'abc')` = 0 | – |
| 10 | Contoh domain email `mail.example` | cocok | Q: 1.450 email ber-domain mail.example dan 50 ber-domain surel.example | – |
| 11 | CURRENT_DATE memberi tanggal hari ini, NOW() memberi tanggal dan jam sekarang | cocok | PG-dt (9.9.5); `now()` bertipe timestamp with time zone | – |
| 12 | Data TokoKita berhenti pada 31 Oktober 2025 | cocok | Q: `max(order_ts)` = 2025-10-31 22:57:41 | – |
| 13 | `date '2025-10-31'` dan `timestamp '…'` membuat nilai bertipe tanggal dan tanggal-jam | cocok | PG-lex (bentuk `type 'string'`); Q: `pg_typeof` (fungsi yang menampilkan tipe sebuah nilai) | – |
| 14 | Kolom timestamp TokoKita tidak menyimpan zona waktu, "jadi anggap semuanya dalam WIB" | tidak bisa dipastikan (bagian WIB) | Q: semua kolom tanggal-jam bertipe `timestamp without time zone`. Kamus data tidak menyebut zona waktunya, jadi WIB adalah kesepakatan kursus, bukan fakta data | Ditulis ulang: "kamus data juga tidak menyebutnya. Di kursus ini, anggap semuanya dalam WIB" |
| 15 | WIB tujuh jam di depan UTC | cocok | Q: `pg_timezone_names` untuk Asia/Jakarta = 07:00:00 | – |
| 16 | timestamptz menyimpan satu titik waktu (dalam UTC) dan menampilkannya sesuai zona yang dipakai | cocok | PG-dtype: "the value is stored internally as UTC … converted from UTC to the current timezone zone" | – |
| 17 | Kolom `current_date` dan `now()` mengikuti jam dan zona waktu komputer pengguna | cocok | Kode `app/engine-worker.js`: mesin latihan menjalankan `set timezone` dengan zona waktu browser. Alat `tools/query.mjs` memakai UTC, tetapi klaimnya tentang aplikasi | – |
| 18 | Tanggal dikurangi tanggal menghasilkan jumlah hari berupa bilangan bulat | cocok | PG-dt, Tabel 9.32: `date - date → integer`; Q: tipe integer | – |
| 19 | Tanggal ditambah interval; satuan '2 hours', '1 month', '1 year' | cocok | PG-dt, Tabel 9.32 | – |
| 20 | Dua timestamp dikurangi menghasilkan interval, misalnya `2 days 05:30:00` | cocok | PG-dt; Q: `timestamp '2025-10-31 10:00' - timestamp '2025-10-29 04:30'` = 2 days 05:30:00 | – |
| 21 | AGE menghasilkan tahun, bulan, dan hari (contoh `2 years 3 mons 4 days`) | cocok | PG-dt, contoh age → "43 years 9 mons 27 days"; Q: pelanggan 1 = 2 years 6 mons 24 days | – |
| 22 | Contoh pengiriman: hari_kirim bilangan bulat, lama_tepat interval | cocok | Q | – |
| 23 | DATE_TRUNC memotong ke awal satuan; satuan year, quarter, week, day | cocok | PG-dt 9.9.2 | – |
| 24 | "Hasilnya bertipe timestamp" | kurang lengkap | PG-dt: hasilnya mengikuti tipe masukan, dan nilai bertipe date diubah otomatis. Q: masukan `order_ts` → timestamp; masukan `date '2025-03-17'` → timestamp with time zone | Diperjelas: "Untuk kolom bertipe timestamp seperti order_ts, hasilnya juga bertipe timestamp" |
| 25 | EXTRACT menghasilkan angka; `dow` 0 = Minggu sampai 6 = Sabtu | cocok | PG-dt ("returns values of type numeric"; "Sunday (0) to Saturday (6)"); Q: 2 Nov 2025 = 0, 8 Nov 2025 = 6 | – |
| 26 | Pola TO_CHAR: YYYY, MM, DD, HH24:MI; TO_DATE membaca teks menjadi tanggal | cocok | PG-fmt, Tabel 9.26 dan 9.27; Q: `to_date('29/09/2025','DD/MM/YYYY')` = 2025-09-29 bertipe date | – |
| 27 | Sebagai teks, '01/12/2024' lebih kecil dari '15/02/2023' | cocok | Q: true | – |
| 28 | "Semua kolomnya teks" (`raw.supplier_price_upload`) | salah | Q: `row_no` bertipe integer; empat kolom lain bertipe text. Kamus data juga menulis "Semua kolom berupa teks" | Diganti: "Semua kolomnya bertipe teks, kecuali nomor baris berkas (row_no, bilangan bulat)". Kamus data di `data/tokokita.js` tidak diubah (di luar tugas ini) |
| 29 | Contoh kode produk ' tk-10931', 'TK10812 ', 'TK-10553' ada di data | cocok | Q: ketiganya ada (spasi di awal dan akhir dicek dengan `'[' \|\| sku_text \|\| ']'`) | – |
| 30 | Di tabel produk formatnya `TK-12345` | cocok | Q: 150 dari 150 SKU cocok dengan pola `^TK-[0-9]{5}$` | – |
| 31 | Contoh harga 'Rp 63.900', '229.900', '192900', '34,900', 'Rp141.900,00', dan kosong | cocok | Q: semuanya ada. Seluruh 61 baris hanya memakai 11 pola, dan semua pola itu termasuk bentuk yang disebut | – |
| 32 | Tanggal hanya ditulis dalam dua format: DD/MM/YYYY atau YYYY-MM-DD | cocok | Q: 27 baris DD/MM/YYYY + 34 baris YYYY-MM-DD = 61 (seluruh baris) | – |
| 33 | Teks kosong bukan NULL; `''::numeric` gagal | cocok | Q: `ERROR 22P02: invalid input syntax for type numeric: ""` | – |
| 34 | Pola `'__/__/____'` cocok dengan DD/MM/YYYY | cocok | PG-match (`_` = satu karakter); Q: contoh berjalan | – |
| 35 | "Baris ke-2 harganya kosong, sehingga hasilnya NULL. Semua bentuk lain menjadi angka" | cocok | Q: row_no 2 = '' → NULL; 12 baris pertama sesuai; ke-61 baris berhasil diubah ke numeric | – |
| 36 | Soal 04-08: "Kolom ini tidak berisi NULL" | cocok | Q: 0 NULL di `price_text`, 1 teks kosong | – |
| 37 | Soal 04-07 menghasilkan baris (pengiriman yang sudah sampai) | cocok | Q: 90 baris | – |
| 38 | T-SQL: LEN tidak menghitung spasi di akhir teks | cocok | https://learn.microsoft.com/en-us/sql/t-sql/functions/len-transact-sql: "excluding trailing spaces" | – |
| 39 | T-SQL: `a + b` atau `concat(a, b)`; dengan `+` hasilnya NULL kalau ada bagian NULL | kurang lengkap | https://learn.microsoft.com/en-us/sql/t-sql/statements/set-concat-null-yields-null-transact-sql (selalu ON sejak SQL Server 2017; `'abc' + NULL` = NULL). https://learn.microsoft.com/en-us/sql/t-sql/language-elements/string-concatenation-pipes-transact-sql: `\|\|` tersedia mulai SQL Server 2025 dan selalu menghasilkan NULL kalau ada bagian NULL. https://learn.microsoft.com/en-us/sql/t-sql/functions/concat-transact-sql: "CONCAT implicitly converts null values to empty strings." | Ditambahkan: "a \|\| b mulai SQL Server 2025", serta catatan bahwa + dan \|\| sama-sama menghasilkan NULL dan CONCAT menganggap NULL sebagai teks kosong |
| 40 | T-SQL: `charindex('@', email)`, teks yang dicari ditulis lebih dulu | cocok | https://learn.microsoft.com/en-us/sql/t-sql/functions/charindex-transact-sql (sintaks `CHARINDEX(expressionToFind, expressionToSearch …)`; hasilnya 0 kalau tidak ketemu) | – |
| 41 | T-SQL: tidak ada SPLIT_PART; STRING_SPLIT menghasilkan baris | cocok (sejauh dicek) | https://learn.microsoft.com/en-us/sql/t-sql/functions/string-split-transact-sql ("a table-valued function that splits a string into rows"). Halaman `split-part-transact-sql` tidak ada (HTTP 404), dan SPLIT_PART tidak disebut di "What's new in SQL Server 2025" | – |
| 42 | T-SQL: `getdate()`, `cast(getdate() as date)` sebagai padanan now() dan current_date | kurang lengkap | https://learn.microsoft.com/en-us/sql/t-sql/functions/getdate-transact-sql (hasilnya bertipe datetime). https://learn.microsoft.com/en-us/sql/t-sql/functions/current-date-transact-sql: CURRENT_DATE tersedia mulai SQL Server 2025 dan setara dengan `CAST(GETDATE() AS DATE)` | Ditambahkan di catatan: current_date ada mulai SQL Server 2025; getdate() tanpa zona waktu, now() bertipe timestamptz |
| 43 | T-SQL: `dateadd(day, 3, order_ts)` | cocok | https://learn.microsoft.com/en-us/sql/t-sql/functions/dateadd-transact-sql | – |
| 44 | T-SQL: `datediff(day, a, b)`; "tanggal tidak bisa dikurangi langsung untuk mendapat jumlah hari" | salah (terlalu umum) | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/subtract-transact-sql: tanda minus "Can't be used with date, time, datetime2, or datetimeoffset data types". Tipe lama datetime masih bisa dikurangi | Diganti: "nilai bertipe date tidak bisa dikurangi dengan tanda minus. Pakai DATEDIFF untuk mendapat jumlah hari" |
| 45 | T-SQL: DATETRUNC baru ada sejak SQL Server 2022; datefromparts; year()/datepart | cocok | https://learn.microsoft.com/en-us/sql/t-sql/functions/datetrunc-transact-sql ("introduced in SQL Server 2022 (16.x)"), datefromparts-transact-sql, year-transact-sql | – |
| 46 | T-SQL: `format(x, 'yyyy-MM')` (yyyy = tahun, MM = bulan); `try_convert(date, x, 103)`, 103 = DD/MM/YYYY, NULL kalau gagal | cocok | https://learn.microsoft.com/en-us/sql/t-sql/functions/format-transact-sql (string format .NET), cast-and-convert-transact-sql (style 103 = British/French dd/MM/yyyy), try-convert-transact-sql ("otherwise, returns NULL") | – |

Soal sql-04-01 dan sql-04-02 juga dicek dengan query: `'Telepon: ' || NULL` = NULL, dan `date_trunc('month', timestamp '2025-03-17 14:25:00')` = 2025-03-01 00:00:00. Keduanya cocok dengan kunci jawaban.

## Temuan di luar keempat bab (tidak diubah)

- Kamus data (`data/tokokita.js`, `SCHEMA_DOC`, tabel `raw.supplier_price_upload`) menulis "Semua kolom berupa teks", padahal `row_no` bertipe integer (`create table raw.supplier_price_upload (row_no int, …)`). Pemilik kamus data perlu memperbaikinya.
- SQL Server 2025 menambah `||` dan `CURRENT_DATE`. Ini perlu diingat saat menulis tabel "Di SQL Server" di bab-bab berikutnya.
- Saat SQL Server mengurutkan data, NULL dianggap nilai terkecil (halaman ORDER BY: "NULL values are treated as the lowest possible values"). Di PostgreSQL, NULL dianggap lebih besar dari semua nilai (PG-order). Bab 1–4 tidak membahasnya, tetapi perbedaan ini perlu dicantumkan kalau ada bab yang membahas pengurutan NULL.
