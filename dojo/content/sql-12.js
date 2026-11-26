// Bab 12 SQL: membuat skema dan tabel, constraint, INSERT/UPDATE/DELETE, upsert, MERGE, dan transaksi.

// Rumus perapian berkas pemasok dari bab 4, dipakai ulang di beberapa contoh dan soal.
const SKU = "'TK-' || substring(replace(upper(trim(sku_text)), '-', '') from 3)";
const HARGA = "nullif(replace(replace(replace(replace(case when price_text like '%,00' then left(price_text, length(price_text) - 3) else price_text end, 'Rp', ''), ' ', ''), '.', ''), ',', ''), '')::numeric";
const TANGGAL = "case when effective_date_text like '__/__/____' then to_date(effective_date_text, 'DD/MM/YYYY') else to_date(effective_date_text, 'YYYY-MM-DD') end";

// Salinan app.products tanpa constraint (CREATE TABLE … AS tidak menyalin constraint).
const PRODUK = `create schema latihan;
create table latihan.produk as
select product_id, sku, product_name, brand, list_price, is_active from app.products;`;

// Salinan berkas pemasok apa adanya.
const UPLOAD = `create schema latihan;
create table latihan.upload as
select * from raw.supplier_price_upload;`;

// Berkas pemasok yang sudah dirapikan (rumus bab 4), satu baris per baris berkas.
const BERSIH = `create schema latihan;
create table latihan.harga_bersih as
select row_no, ${SKU} as sku, ${HARGA} as harga, ${TANGGAL} as berlaku_mulai
from raw.supplier_price_upload;`;

// Salinan status pesanan, dengan primary key.
const PESANAN = `create schema latihan;
create table latihan.pesanan as
select order_id, status, updated_at from app.orders;
alter table latihan.pesanan add primary key (order_id);`;

export default {
  id: "sql-12",
  part: "sql",
  title: "Mengubah data dengan aman",
  minutes: 90,
  goals: [
    "Membedakan perintah DDL (mengubah struktur) dan DML (mengubah isi).",
    "Membuat skema dan tabel dengan <code>CREATE SCHEMA</code> dan <code>CREATE TABLE</code>, lalu mengisinya dengan <code>INSERT … VALUES</code> dan <code>INSERT … SELECT</code>.",
    "Memasang constraint (<code>NOT NULL</code>, <code>UNIQUE</code>, <code>PRIMARY KEY</code>, <code>REFERENCES</code>, <code>CHECK</code>) dan nilai bawaan <code>DEFAULT</code>, lalu membaca pesan error saat data ditolak.",
    "Mengubah dan menghapus baris dengan <code>UPDATE</code>, <code>DELETE</code>, dan <code>TRUNCATE</code> secara aman: periksa dulu dengan SELECT, lalu lihat hasilnya dengan <code>RETURNING</code>.",
    "Mengubah struktur tabel dengan <code>ALTER TABLE</code> dan menghapusnya dengan <code>DROP</code>.",
    "Membuat proses muat yang idempoten dengan <code>INSERT … ON CONFLICT</code> dan <code>MERGE</code>.",
    "Menjelaskan transaksi, dan kenapa data latihan di Dojo selalu kembali utuh.",
  ],
  terms: [
    { term: "DDL", def: "<i>Data Definition Language</i>: perintah yang membuat, mengubah, atau menghapus struktur database, misalnya <code>CREATE TABLE</code>, <code>ALTER TABLE</code>, dan <code>DROP TABLE</code>." },
    { term: "DML", def: "<i>Data Manipulation Language</i>: perintah yang menambah, mengubah, atau menghapus isi tabel (barisnya), misalnya <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code>, dan <code>MERGE</code>." },
    { term: "constraint", def: "Aturan yang dipasang di tabel dan dijaga oleh database. Baris yang melanggar aturan ditolak dengan pesan error, misalnya harga harus lebih dari 0." },
    { term: "transaksi", def: "Sekelompok perintah yang diperlakukan sebagai satu kesatuan: semuanya berhasil disimpan, atau semuanya dibatalkan." },
    { term: "idempoten", def: "Sifat perintah yang aman diulang: dijalankan sekali atau dua kali, hasil akhirnya sama." },
    { term: "upsert", def: "Gabungan <i>update</i> dan <i>insert</i>: tambahkan baris kalau belum ada, ubah kalau sudah ada." },
  ],
  introduces: ["CREATE SCHEMA", "CREATE TABLE", "PRIMARY KEY", "FOREIGN KEY", "REFERENCES", "UNIQUE", "CHECK", "DEFAULT", "INSERT INTO", "INSERT", "VALUES",
    "UPDATE", "SET", "DELETE FROM", "DELETE", "RETURNING", "TRUNCATE", "DROP TABLE", "DROP", "ALTER TABLE", "ON CONFLICT", "DO UPDATE", "DO NOTHING",
    "MERGE", "WHEN MATCHED", "WHEN NOT MATCHED"],
  sections: [
    {
      title: "Dua jenis perintah: DDL dan DML",
      html: `<p>Semua perintah di bab sebelumnya hanya membaca data. Bab ini mengajarkan perintah yang <b>mengubah</b> database. Perintah itu dibagi dua kelompok:</p>
<ul><li><b>DDL</b> (<i>Data Definition Language</i>, bahasa untuk mendefinisikan struktur) membuat, mengubah, dan menghapus wadah data, yaitu skema dan tabel. Contohnya CREATE, ALTER, dan DROP.</li>
<li><b>DML</b> (<i>Data Manipulation Language</i>, bahasa untuk mengolah isi) menambah, mengubah, dan menghapus baris di dalam tabel. Contohnya INSERT, UPDATE, DELETE, dan MERGE.</li></ul>
<p>Perintah yang mengubah data tidak punya tombol "urungkan". Di database sungguhan, satu UPDATE dengan syarat yang salah bisa merusak ribuan baris dalam sekejap. Karena itu bab ini juga mengajarkan kebiasaan kerja yang aman.</p>
<p>Di Dojo, setiap contoh dan jawaban dijalankan, lalu semua perubahannya <b>dibatalkan</b> setelah selesai. Data TokoKita selalu kembali utuh, dan tabel yang dibuat di satu contoh tidak ada lagi di contoh berikutnya. Karena itu, setiap contoh di bab ini membuat sendiri tabel yang dibutuhkannya. Cara kerja pembatalan ini dijelaskan di bagian terakhir, "Transaksi".</p>`,
    },
    {
      title: "CREATE SCHEMA dan CREATE TABLE",
      html: `<p><code>CREATE SCHEMA nama</code> membuat skema baru, yaitu kelompok tabel. Di bab ini semua tabel buatan kita masuk ke skema <code>latihan</code>, supaya terpisah dari <code>app</code> dan <code>raw</code>.</p>
<p><code>CREATE TABLE skema.nama (…)</code> membuat tabel kosong. Di dalam tanda kurung, tulis setiap kolom dengan nama dan tipe datanya, dipisah koma. Tipe datanya sama dengan yang kamu kenal dari Kamus data: <code>integer</code>, <code>numeric(12,2)</code>, <code>text</code>, <code>date</code>, <code>timestamp</code>, dan <code>boolean</code>.</p>
<p>Dua kesalahan umum:</p>
<ul><li><b>Lupa nama skema.</b> <code>create table harga (…)</code> tanpa nama skema membuat tabel di skema bawaan PostgreSQL, yaitu <code>public</code>. Selalu tulis nama skemanya.</li>
<li><b>Membuat skema atau tabel yang sudah ada.</b> PostgreSQL menolaknya dengan pesan <code>schema "latihan" already exists</code>. Tambahkan <code>if not exists</code> (<code>create schema if not exists latihan</code>) kalau perintahnya memang boleh dijalankan ulang.</li></ul>`,
      examples: [{ sql: "create schema latihan;\n\ncreate table latihan.harga_pemasok (\n  baris_berkas  integer,\n  sku           text,\n  harga         numeric(12,2),\n  berlaku_mulai date,\n  pemasok       text\n);\n\nselect * from latihan.harga_pemasok;", expectEmpty: true,
        note: "Hasilnya tabel tanpa baris: hanya judul kolom yang tampil. Tiga perintah dipisah titik koma dan dijalankan berurutan; yang tampil adalah hasil perintah terakhir." }],
    },
    {
      title: "INSERT … VALUES: menambah baris",
      html: `<p><code>INSERT INTO tabel (kolom, …) VALUES (nilai, …)</code> menambah baris. Setiap pasang tanda kurung setelah VALUES adalah satu baris, jadi beberapa baris bisa ditambahkan sekaligus dengan memisahkannya dengan koma. Teks dan tanggal ditulis di antara tanda kutip tunggal; angka tanpa tanda kutip.</p>
<p>Daftar kolom setelah nama tabel sebaiknya selalu ditulis. Nilai dipasangkan ke kolom menurut <b>urutannya</b>: nilai pertama ke kolom pertama di daftar, dan seterusnya. Kolom yang tidak disebut diisi nilai bawaannya (DEFAULT, dibahas di bagian constraint), atau NULL kalau tidak punya nilai bawaan.</p>
<p>Tambahkan <code>RETURNING</code> di akhir perintah untuk melihat baris yang baru masuk. RETURNING ditulis seperti daftar kolom di SELECT.</p>`,
      examples: [{ sql: "create schema latihan;\ncreate table latihan.harga_pemasok (\n  baris_berkas integer, sku text, harga numeric(12,2), berlaku_mulai date, pemasok text\n);\n\ninsert into latihan.harga_pemasok (baris_berkas, sku, harga, berlaku_mulai, pemasok)\nvalues (1, 'TK-10931', 63900, '2025-09-29', 'CV Mekar Abadi'),\n       (3, 'TK-10812', 229900, '2025-09-02', 'PT Rumah Sejahtera')\nreturning baris_berkas, sku, harga;",
        note: "Dua baris masuk dalam satu perintah. Teks '2025-09-29' otomatis diubah ke tipe date karena kolomnya bertipe date." }],
    },
    {
      title: "INSERT … SELECT: mengisi tabel dari query",
      html: `<p>Ganti bagian VALUES dengan sebuah SELECT, dan semua baris hasil query masuk ke tabel. Inilah cara paling umum memindahkan data dari lapisan raw ke tabel yang rapi.</p>
<p>Kolom hasil SELECT juga dipasangkan menurut urutan, <b>bukan</b> menurut nama atau alias. Kalau urutan di SELECT tertukar, nilainya masuk ke kolom yang salah. Kalau tipenya kebetulan cocok, kesalahan ini tidak memunculkan error. Jadi samakan urutan daftar kolom INSERT dengan urutan kolom SELECT.</p>
<p>Ada juga bentuk singkat <code>CREATE TABLE skema.nama AS SELECT …</code>, yang membuat tabel sekaligus mengisinya. Nama dan tipe kolomnya mengikuti hasil SELECT. Constraint tabel sumber (dibahas di bagian berikutnya) tidak ikut terbawa: salinan app.products yang dibuat dengan cara ini tidak punya satu pun constraint.</p>`,
      examples: [{ sql: "create schema latihan;\ncreate table latihan.harga_pemasok (\n  baris_berkas integer, sku text, harga numeric(12,2), berlaku_mulai date, pemasok text\n);\n\ninsert into latihan.harga_pemasok (baris_berkas, sku, harga, berlaku_mulai, pemasok)\nselect row_no,\n       " + SKU + ",\n       " + HARGA + ",\n       " + TANGGAL + ",\n       trim(supplier)\nfrom raw.supplier_price_upload;\n\nselect * from latihan.harga_pemasok\norder by baris_berkas\nlimit 10;",
        note: "Rumus perapiannya sama dengan bab 4. Semua 61 baris berkas masuk, termasuk yang bermasalah: baris 2 harganya kosong (NULL), baris 51 sampai 54 kode produknya (TK-99000, TK-99013, TK-99026, TK-99039) tidak ada di app.products, dan baris 55 sampai 61 adalah salinan baris sebelumnya. Tabel tanpa aturan menerima apa saja." }],
    },
    {
      title: "Constraint: aturan yang dijaga database",
      html: `<p><b>Constraint</b> adalah aturan yang dipasang di tabel. Setiap kali ada baris masuk atau berubah, database memeriksanya dan menolak baris yang melanggar. Lima jenis constraint yang paling sering dipakai:</p>
<ul><li><code>NOT NULL</code>: kolom wajib diisi.</li>
<li><code>UNIQUE</code>: nilai kolom (atau gabungan beberapa kolom) tidak boleh kembar. NULL tidak dianggap kembar, jadi beberapa baris boleh sama-sama NULL.</li>
<li><code>PRIMARY KEY</code>: gabungan UNIQUE dan NOT NULL. Inilah kunci utama yang kamu kenal sejak bab JOIN.</li>
<li><code>REFERENCES tabel (kolom)</code>: foreign key. Nilainya harus ada di kolom tabel yang dirujuk, dan kolom itu harus PRIMARY KEY atau UNIQUE. Bentuk lain yang sama artinya ditulis di akhir daftar kolom: <code>foreign key (sku) references app.products (sku)</code>.</li>
<li><code>CHECK (syarat)</code>: syarat harus benar. Hati-hati, syarat yang hasilnya NULL juga lolos. <code>check (harga &gt; 0)</code> menerima harga NULL; tambahkan NOT NULL kalau kolom itu wajib diisi.</li></ul>
<p><code>DEFAULT nilai</code> bukan aturan penolak. DEFAULT mengisi kolom dengan nilai bawaan kalau INSERT tidak menyebut kolom itu, misalnya <code>default now()</code> untuk mencatat waktu baris dimuat.</p>
<p>Contoh di bawah memasang semua aturan itu. Setelah itu, lihat apa yang terjadi kalau data yang salah dimasukkan. Perintah di kotak berikut sengaja melanggar aturan, jadi tidak disediakan tombol jalankan. Pesan error-nya diambil dari PostgreSQL apa adanya:</p>
<pre class="sql"><code>-- 1. sku kosong (NOT NULL)
insert into latihan.harga_pemasok (baris_berkas, sku, harga, berlaku_mulai, pemasok)
values (2, null, 63900, '2025-09-29', 'CV Mekar Abadi');
ERROR: null value in column "sku" of relation "harga_pemasok" violates not-null constraint

-- 2. harga 0 (CHECK)
... values (2, 'TK-10280', 0, '2025-09-16', 'PT Sumber Elektronik');
ERROR: new row for relation "harga_pemasok" violates check constraint "harga_pemasok_harga_check"

-- 3. baris_berkas 1 sudah ada (PRIMARY KEY)
ERROR: duplicate key value violates unique constraint "harga_pemasok_pkey"
DETAIL: Key (baris_berkas)=(1) already exists.

-- 4. baris 59, salinan baris 11: sku dan tanggal sama (UNIQUE)
ERROR: duplicate key value violates unique constraint "harga_pemasok_sku_berlaku_mulai_key"
DETAIL: Key (sku, berlaku_mulai)=(TK-10231, 2025-09-30) already exists.

-- 5. baris 51: kode produk yang tidak ada di app.products (foreign key)
ERROR: insert or update on table "harga_pemasok" violates foreign key constraint "harga_pemasok_sku_fkey"
DETAIL: Key (sku)=(TK-99000) is not present in table "products".</code></pre>
<p>Baca pesan error dari bagian akhirnya: nama constraint memberi tahu aturan mana yang dilanggar, dan baris DETAIL menunjukkan nilainya. Kalau constraint tidak diberi nama, PostgreSQL membuatkan nama dari nama tabel dan kolom, seperti <code>harga_pemasok_harga_check</code>.</p>
<p>Foreign key juga menjaga arah sebaliknya. Data TokoKita sendiri memakai foreign key, sehingga produk yang masih punya riwayat harga tidak bisa dihapus:</p>
<pre class="sql"><code>delete from app.products where sku = 'TK-10931';
ERROR: update or delete on table "products" violates foreign key constraint
       "product_price_history_product_id_fkey" on table "product_price_history"
DETAIL: Key (product_id)=(133) is still referenced from table "product_price_history".</code></pre>
<p>Constraint adalah lapis pertahanan terakhir: walaupun query pemuatnya salah, data yang melanggar aturan tidak bisa masuk.</p>`,
      examples: [{ sql: "create schema latihan;\n\ncreate table latihan.harga_pemasok (\n  baris_berkas  integer primary key,\n  sku           text not null references app.products (sku),\n  harga         numeric(12,2) check (harga > 0),\n  berlaku_mulai date not null,\n  pemasok       text not null,\n  dimuat_pada   timestamp not null default now(),\n  unique (sku, berlaku_mulai)\n);\n\ninsert into latihan.harga_pemasok (baris_berkas, sku, harga, berlaku_mulai, pemasok)\nvalues (1, 'TK-10931', 63900, '2025-09-29', 'CV Mekar Abadi')\nreturning *;",
        note: "Kolom dimuat_pada tidak disebut di INSERT, jadi diisi oleh DEFAULT dengan waktu saat perintah dijalankan. Baris ini lolos semua aturan: sku TK-10931 ada di app.products, harganya lebih dari 0, dan semua kolom wajib terisi." }],
    },
    {
      title: "UPDATE: mengubah isi baris",
      html: `<p><code>UPDATE tabel SET kolom = nilai WHERE syarat</code> mengubah baris yang memenuhi syarat. Beberapa kolom bisa diubah sekaligus: <code>set harga = 70000, pemasok = 'CV Mekar Abadi'</code>. Nilai baru boleh berupa ekspresi dari nilai lama, misalnya <code>list_price * 1.05</code>.</p>
<p><b>Tanpa WHERE, semua baris berubah.</b> PostgreSQL tidak bertanya "yakin?". Pada salinan app.products, <code>update latihan.produk set list_price = list_price + 1</code> langsung mengubah 150 baris, yaitu semua produk.</p>
<p>Kebiasaan aman sebelum UPDATE atau DELETE:</p>
<ol><li>Tulis dulu SELECT dengan WHERE yang sama, lalu hitung barisnya. Pastikan jumlah dan isinya sesuai maksudmu.</li>
<li>Jalankan UPDATE dengan <code>RETURNING</code>, lalu bandingkan jumlah baris yang dikembalikan dengan hasil SELECT tadi.</li>
<li>Di database sungguhan, jalankan keduanya di dalam transaksi (bagian terakhir bab ini), supaya perubahan bisa dibatalkan kalau jumlahnya tidak cocok.</li></ol>
<p>Di RETURNING milik UPDATE, PostgreSQL 18 menyediakan <code>old.kolom</code> (nilai sebelum diubah) dan <code>new.kolom</code> (nilai sesudahnya). Nama kolom tanpa awalan berisi nilai baru.</p>`,
      examples: [
        { setup: PRODUK, sql: "select product_id, sku, list_price\nfrom latihan.produk\nwhere brand = 'Prima'\norder by product_id;", note: "Langkah 1: tabel latihan.produk (salinan app.products, dibuat otomatis untuk contoh ini) punya 8 produk merek Prima. Inilah baris yang akan diubah." },
        { setup: PRODUK, sql: "update latihan.produk\nset list_price = round(list_price * 1.05)\nwhere brand = 'Prima'\nreturning product_id, old.list_price as harga_lama, new.list_price as harga_baru;", note: "Langkah 2: harga merek Prima naik 5%, dibulatkan ke rupiah utuh. RETURNING mengembalikan 8 baris, sama dengan hasil langkah 1." },
      ],
    },
    {
      title: "DELETE dan TRUNCATE: menghapus baris",
      html: `<p><code>DELETE FROM tabel WHERE syarat</code> menghapus baris yang memenuhi syarat. Sama seperti UPDATE, tanpa WHERE semua baris terhapus dan tabelnya tinggal kosong. Kebiasaan aman yang sama berlaku: SELECT dulu, lalu DELETE dengan RETURNING.</p>
<p>Syarat di WHERE boleh memakai subquery dan EXISTS. Contoh di bawah membersihkan baris dobel di salinan berkas pemasok. Di sini "dobel" berarti kode produk (setelah dirapikan), teks harga, dan teks tanggalnya sama dengan baris lain yang nomornya lebih kecil. Baris dengan nomor terkecil disimpan, sisanya dihapus. Nama pemasok sengaja tidak ikut dibandingkan, karena di beberapa pasangan cara penulisannya berbeda, misalnya baris 44 ditulis PT Sumber Elektronik dan salinannya, baris 61, ditulis PT Rumah Sejahtera.</p>
<p><code>TRUNCATE tabel</code> mengosongkan seluruh tabel sekaligus. Hasilnya sama dengan DELETE tanpa WHERE, tapi lebih cepat karena tidak membaca isi tabel, dan tidak bisa diberi syarat. TRUNCATE ditolak kalau ada tabel lain yang merujuk ke tabel itu lewat foreign key:</p>
<pre class="sql"><code>ERROR: cannot truncate a table referenced in a foreign key constraint
HINT: Truncate table "c" at the same time, or use TRUNCATE ... CASCADE.</code></pre>
<p><code>CASCADE</code> ikut mengosongkan tabel yang merujuk. Pakai hanya kalau kamu tahu persis tabel mana saja yang ikut terhapus.</p>`,
      examples: [
        { setup: UPLOAD, sql: "delete from latihan.upload u\nwhere exists (\n  select 1\n  from latihan.upload lain\n  where 'TK-' || substring(replace(upper(trim(lain.sku_text)), '-', '') from 3)\n      = 'TK-' || substring(replace(upper(trim(u.sku_text)), '-', '') from 3)\n    and lain.price_text = u.price_text\n    and lain.effective_date_text = u.effective_date_text\n    and lain.row_no < u.row_no\n)\nreturning row_no, sku_text, supplier;", note: "Tujuh baris terhapus: baris 55 sampai 61. Masing-masing punya pasangan dengan nomor lebih kecil (misalnya baris 59 adalah salinan baris 11). Dari 61 baris, tersisa 54." },
        { setup: UPLOAD, sql: "truncate latihan.upload;\n\nselect count(*) as sisa_baris from latihan.upload;", note: "Semua 61 baris hilang. Struktur tabelnya tetap ada, jadi tabel bisa diisi ulang." },
      ],
    },
    {
      title: "ALTER TABLE dan DROP: mengubah dan menghapus tabel",
      html: `<p><code>ALTER TABLE</code> mengubah struktur tabel yang sudah ada. Bentuk yang paling sering dipakai:</p>
<ul><li><code>add column nama tipe</code>: menambah kolom. Baris lama mendapat nilai DEFAULT kolom itu, atau NULL kalau tidak ada DEFAULT.</li>
<li><code>add primary key (kolom)</code>, <code>add check (syarat)</code>, <code>add unique (kolom)</code>: memasang constraint. PostgreSQL memeriksa semua baris lama dulu, dan menolak perintahnya kalau ada yang melanggar, misalnya <code>check constraint "produk_list_price_check" of relation "produk" is violated by some row</code>.</li>
<li><code>rename column lama to baru</code>: mengganti nama kolom. Isinya tidak berubah.</li>
<li><code>drop column nama</code>: menghapus kolom beserta isinya.</li></ul>
<p><code>DROP TABLE skema.nama</code> menghapus tabel beserta seluruh isinya. <code>drop table if exists</code> tidak memunculkan error kalau tabelnya memang tidak ada. Tabel yang masih dirujuk foreign key tabel lain tidak bisa dihapus begitu saja:</p>
<pre class="sql"><code>ERROR: cannot drop table latihan.p because other objects depend on it
DETAIL: constraint c_sku_fkey on table latihan.c depends on table latihan.p
HINT: Use DROP ... CASCADE to drop the dependent objects too.</code></pre>
<p>Hal yang sama berlaku untuk skema: <code>drop schema latihan cascade</code> menghapus skema beserta semua tabel di dalamnya. Perintah DROP tidak meminta konfirmasi, jadi baca ulang nama skema dan tabelnya sebelum menjalankan.</p>`,
      examples: [{ setup: PRODUK, sql: "alter table latihan.produk add primary key (product_id);\nalter table latihan.produk add column catatan text default 'belum dicek';\nalter table latihan.produk add check (list_price > 0);\nalter table latihan.produk rename column list_price to harga_jual;\n\nselect product_id, sku, harga_jual, catatan\nfrom latihan.produk\norder by product_id\nlimit 5;", note: "latihan.produk dibuat dengan CREATE TABLE … AS, jadi awalnya tanpa constraint. Semua 150 baris lama langsung mendapat catatan 'belum dicek' dari DEFAULT, dan semua harga lebih dari 0, sehingga CHECK berhasil dipasang." }],
    },
    {
      title: "Upsert dengan ON CONFLICT, dan perintah yang idempoten",
      html: `<p>Proses muat data biasanya dijalankan berulang: setiap hari, atau diulang setelah gagal di tengah jalan. Perintah yang <b>idempoten</b> aman diulang: dijalankan sekali atau dua kali, hasil akhirnya sama. INSERT biasa tidak idempoten. Dijalankan dua kali, barisnya dobel, atau ditolak primary key.</p>
<p><code>INSERT … ON CONFLICT</code> menentukan apa yang terjadi kalau baris baru bentrok dengan baris lama di kolom ber-PRIMARY KEY atau UNIQUE:</p>
<ul><li><code>on conflict (kolom) do nothing</code>: baris yang bentrok dilewati.</li>
<li><code>on conflict (kolom) do update set kolom = excluded.kolom</code>: baris lama diubah. <code>excluded</code> adalah nama khusus untuk baris yang tadinya akan dimasukkan.</li></ul>
<p>Pola "tambahkan kalau belum ada, ubah kalau sudah ada" ini disebut <b>upsert</b>. Ada dua jebakan:</p>
<ul><li><b>Tanpa PRIMARY KEY atau UNIQUE, tidak ada yang bentrok.</b> Di tabel tanpa constraint, <code>insert … values (1, 'a') on conflict do nothing</code> yang dijalankan dua kali tetap menghasilkan dua baris.</li>
<li><b>DO UPDATE menolak sumber yang dobel.</b> Kalau satu perintah membawa dua baris dengan kunci sama, muncul error <code>ON CONFLICT DO UPDATE command cannot affect row a second time</code>. Buang dulu baris dobel di SELECT-nya, misalnya dengan DISTINCT.</li></ul>`,
      examples: [{ setup: BERSIH, sql: "create table latihan.harga_terbaru (\n  sku           text primary key,\n  harga         numeric(12,2),\n  berlaku_mulai date not null\n);\n\n-- dijalankan dua kali, sengaja\ninsert into latihan.harga_terbaru (sku, harga, berlaku_mulai)\nselect distinct sku, harga, berlaku_mulai from latihan.harga_bersih\non conflict (sku) do update\n  set harga = excluded.harga, berlaku_mulai = excluded.berlaku_mulai;\n\ninsert into latihan.harga_terbaru (sku, harga, berlaku_mulai)\nselect distinct sku, harga, berlaku_mulai from latihan.harga_bersih\non conflict (sku) do update\n  set harga = excluded.harga, berlaku_mulai = excluded.berlaku_mulai;\n\nselect count(*) as jumlah_produk from latihan.harga_terbaru;", note: "Tabel latihan.harga_bersih (dibuat otomatis) berisi 61 baris berkas pemasok yang sudah dirapikan. DISTINCT membuang 7 baris dobel, jadi tersisa 54 kode produk. Perintah kedua tidak menambah baris, hanya menimpa nilai yang sama: hasilnya tetap 54." }],
    },
    {
      title: "MERGE: menyamakan tabel tujuan dengan sumber",
      html: `<p><code>MERGE</code> membandingkan tabel tujuan dengan sumber, lalu menentukan tindakan untuk setiap pasangan baris:</p>
<pre class="sql"><code>merge into tujuan t
using sumber s on t.kunci = s.kunci
when matched [and syarat] then update set …     -- atau: delete, do nothing
when not matched [and syarat] then insert (…) values (…)</code></pre>
<p><code>WHEN MATCHED</code> berlaku untuk baris sumber yang punya pasangan di tujuan; <code>WHEN NOT MATCHED</code> untuk yang belum punya. Klausa WHEN diperiksa dari atas ke bawah, dan hanya klausa pertama yang syaratnya benar yang dijalankan untuk setiap baris. PostgreSQL juga mengenal <code>when not matched by source</code>, untuk baris tujuan yang tidak ada di sumber.</p>
<p>Contoh: <code>raw.orders_batch2</code> adalah ekstrak susulan berisi pesanan baru dan pesanan lama yang statusnya berubah. Satu MERGE mengubah status pesanan lama dan menambah pesanan baru. MERGE bisa diberi RETURNING, dan fungsi <code>merge_action()</code> menulis tindakan yang dilakukan untuk setiap baris: INSERT, UPDATE, atau DELETE. Di contoh, MERGE dibungkus CTE supaya tindakannya bisa dihitung.</p>
<p>Setiap baris tujuan hanya boleh cocok dengan satu baris sumber. Kalau tidak, MERGE gagal dengan <code>MERGE command cannot affect row a second time</code>.</p>
<p>Kapan memakai ON CONFLICT, kapan MERGE? Menurut dokumentasi PostgreSQL, keduanya tidak bisa saling menggantikan. ON CONFLICT tetap bisa mengubah baris kalau ada proses lain yang memasukkan baris berkunci sama pada saat yang sama. MERGE lebih lengkap: bisa menghapus, dan bisa memberi syarat berbeda untuk setiap tindakan.</p>`,
      examples: [{ setup: PESANAN, sql: "with hasil as (\n  merge into latihan.pesanan t\n  using raw.orders_batch2 s on t.order_id = s.order_id\n  when matched then\n    update set status = s.status, updated_at = s.updated_at\n  when not matched then\n    insert (order_id, status, updated_at) values (s.order_id, s.status, s.updated_at)\n  returning merge_action() as tindakan\n)\nselect tindakan, count(*) as jumlah_baris\nfrom hasil\ngroup by tindakan\norder by tindakan;", note: "latihan.pesanan (dibuat otomatis) berisi status 12.007 pesanan dari app.orders. Hasilnya 290 baris ditambahkan (pesanan 112008 sampai 112297) dan 75 baris diubah statusnya." }],
    },
    {
      title: "Transaksi",
      html: `<p><b>Transaksi</b> adalah sekelompok perintah yang diperlakukan sebagai satu kesatuan: semuanya disimpan, atau semuanya dibatalkan. Contohnya pembatalan pesanan: status pesanan menjadi cancelled <i>dan</i> pembayarannya menjadi refunded. Kalau hanya satu yang tersimpan, datanya tidak masuk akal.</p>
<pre class="sql"><code>begin;                                   -- mulai transaksi
update app.orders   set status = 'cancelled' where order_id = 100001;
update app.payments set status = 'refunded'  where order_id = 100001;
commit;                                  -- simpan keduanya

-- atau, kalau ada yang salah sebelum commit:
rollback;                                -- batalkan semuanya</code></pre>
<p>Kotak di atas hanya untuk dibaca. Tanpa BEGIN, PostgreSQL menjalankan setiap perintah sebagai transaksi sendiri yang langsung disimpan kalau berhasil. Kalau ada perintah yang gagal di dalam transaksi, perintah berikutnya ditolak dengan <code>current transaction is aborted, commands ignored until end of transaction block</code>, sampai transaksinya ditutup dengan ROLLBACK.</p>
<p>Di PostgreSQL, perintah DDL seperti CREATE TABLE juga ikut transaksi dan bisa dibatalkan. Dojo memanfaatkan ini: setiap jawaban dijalankan di antara BEGIN dan ROLLBACK yang ditambahkan otomatis. Semua perubahanmu, termasuk skema <code>latihan</code>, hilang setelah hasilnya tampil. Itulah sebabnya data latihan selalu utuh, dan <code>create schema latihan</code> bisa dijalankan di setiap contoh tanpa error "already exists". Karena transaksinya sudah diatur Dojo, perintah BEGIN, COMMIT, dan ROLLBACK di jawabanmu akan ditolak.</p>
<p>Akibat lainnya: kalau satu perintah di jawabanmu gagal, seluruh jawaban gagal. Baca pesan error-nya, perbaiki perintah itu, lalu jalankan ulang semuanya.</p>`,
    },
  ],
  tsql: [
    { pg: "category_name text unique (beberapa baris boleh NULL)", tsql: "category_name nvarchar(100) unique (hanya satu NULL)", note: "Dokumentasi SQL Server menyatakan constraint UNIQUE mengizinkan NULL, tetapi hanya satu NULL per kolom. Di PostgreSQL, NULL tidak dianggap kembar, jadi banyak baris boleh sama-sama NULL. Kalau ingin PostgreSQL menolak NULL kedua, tulis <code>unique nulls not distinct</code>." },
    { pg: "id integer generated always as identity", tsql: "id int identity(1,1)", note: "Keduanya membuat nomor urut otomatis. Di PostgreSQL, ALWAYS menolak nilai yang diisi sendiri kecuali dengan OVERRIDING SYSTEM VALUE; di SQL Server, mengisi nilai sendiri butuh SET IDENTITY_INSERT ON. IDENTITY di SQL Server tidak menjamin nilainya unik atau tanpa lompatan; pasang PRIMARY KEY atau UNIQUE. PostgreSQL juga punya tipe <code>serial</code>, cara khas PostgreSQL untuk hal yang sama; identity adalah cara standar SQL." },
    { pg: "insert … returning *", tsql: "insert … output inserted.* values …", note: "OUTPUT ditulis sebelum VALUES (di UPDATE sebelum WHERE). Awalan <code>inserted.</code> berisi nilai baru dan <code>deleted.</code> berisi nilai lama, mirip <code>new.</code> dan <code>old.</code> di PostgreSQL 18." },
    { pg: "delete … returning *", tsql: "delete from t output deleted.* where …", note: "" },
    { pg: "insert … on conflict (k) do update set …", tsql: "merge …; atau if not exists (select …) insert …", note: "Panduan migrasi Microsoft dari PostgreSQL mengganti ON CONFLICT dengan MERGE. Pakai MERGE, atau periksa dulu dengan IF NOT EXISTS (subquery-nya wajib di dalam tanda kurung)." },
    { pg: "merge into t using s on … when matched then …", tsql: "merge t using s on … when matched then …;", note: "Bentuknya mirip. MERGE di SQL Server <b>wajib</b> diakhiri titik koma; tanpa itu muncul error 10713. RETURNING merge_action() di PostgreSQL berpadanan dengan OUTPUT $action." },
    { pg: "truncate latihan.upload", tsql: "truncate table latihan.upload", note: "Kata TABLE wajib di SQL Server, tidak wajib di PostgreSQL. SQL Server mengembalikan nomor IDENTITY ke awal setelah TRUNCATE; PostgreSQL tidak, kecuali ditulis RESTART IDENTITY. SQL Server tidak bisa TRUNCATE tabel yang dirujuk foreign key; PostgreSQL bisa dengan CASCADE. Di keduanya, TRUNCATE di dalam transaksi bisa dibatalkan." },
    { pg: "alter table t add column c text", tsql: "alter table t add c nvarchar(100)", note: "SQL Server tidak memakai kata COLUMN setelah ADD, tapi memakainya di DROP COLUMN." },
    { pg: "alter table t rename column a to b", tsql: "exec sp_rename 'skema.t.a', 'b', 'COLUMN'", note: "Di SQL Server, nama kolom diganti dengan prosedur sistem sp_rename, bukan ALTER TABLE." },
    { pg: "drop table if exists t", tsql: "drop table if exists t", note: "IF EXISTS ada sejak SQL Server 2016. Menurut dokumentasi SQL Server, DROP TABLE tidak bisa menghapus tabel yang dirujuk foreign key; foreign key atau tabel yang merujuk harus dihapus dulu." },
    { pg: "begin; … commit;", tsql: "begin transaction; … commit;", note: "Di keduanya, tanpa BEGIN setiap perintah adalah transaksi sendiri (di SQL Server disebut <i>autocommit</i>)." },
    { pg: "(tidak ada)", tsql: "go", note: "GO bukan perintah T-SQL. GO adalah tanda pemisah <i>batch</i> (kelompok perintah yang dikirim bersama ke server) yang dikenali alat seperti SSMS (SQL Server Management Studio, aplikasi untuk menulis dan menjalankan query) dan sqlcmd (alat baris perintah). GO harus di baris sendiri. CREATE SCHEMA di SQL Server harus dijalankan sebagai batch tersendiri, jadi biasanya ditulis <code>create schema latihan;</code> lalu <code>go</code> di baris berikutnya." },
  ],
  summary: [
    "DDL (CREATE, ALTER, DROP) mengubah struktur; DML (INSERT, UPDATE, DELETE, MERGE) mengubah isi.",
    "<code>INSERT</code> memasangkan nilai ke kolom menurut urutan, bukan nama. Selalu tulis daftar kolomnya.",
    "Constraint (<code>NOT NULL</code>, <code>UNIQUE</code>, <code>PRIMARY KEY</code>, <code>REFERENCES</code>, <code>CHECK</code>) menolak data yang salah. CHECK meloloskan NULL. <code>DEFAULT</code> mengisi kolom yang tidak disebut.",
    "UPDATE dan DELETE tanpa WHERE mengenai semua baris. Jalankan SELECT dengan WHERE yang sama dulu, lalu pakai <code>RETURNING</code> untuk melihat baris yang berubah.",
    "<code>TRUNCATE</code> mengosongkan seluruh tabel; <code>DROP</code> menghapus tabelnya. Keduanya tanpa konfirmasi.",
    "Perintah idempoten aman diulang. <code>ON CONFLICT</code> butuh PRIMARY KEY atau UNIQUE; <code>MERGE</code> menangani baris yang cocok dan yang belum ada dalam satu perintah.",
    "Transaksi menyatukan beberapa perintah: semua disimpan (COMMIT) atau semua dibatalkan (ROLLBACK). Dojo membatalkan setiap jawaban secara otomatis.",
  ],
  drills: [
    { id: "sql-12-01", kind: "choice", prompt: "Perintah mana yang termasuk DML?",
      options: ["<code>CREATE TABLE latihan.voucher (…)</code>", "<code>ALTER TABLE latihan.voucher ADD COLUMN aktif boolean</code>", "<code>UPDATE latihan.voucher SET aktif = false WHERE kode = 'HEMAT10'</code>", "<code>DROP TABLE latihan.voucher</code>"], answer: 2,
      why: "UPDATE mengubah isi baris, jadi termasuk DML. CREATE, ALTER, dan DROP mengubah struktur tabel, jadi termasuk DDL.", hint: "DML mengolah isi (baris), DDL mengolah wadahnya." },
    { id: "sql-12-02", kind: "choice", prompt: "Kolom <code>harga</code> punya constraint <code>check (harga &gt; 0)</code> dan tidak punya NOT NULL. Apa yang terjadi kalau kamu memasukkan baris dengan harga NULL?",
      options: ["Ditolak, karena NULL tidak lebih dari 0", "Diterima, karena CHECK meloloskan syarat yang hasilnya NULL", "Harga otomatis diganti 0", "Ditolak, karena semua kolom wajib diisi"], answer: 1,
      why: "NULL &gt; 0 hasilnya NULL (tidak diketahui), dan CHECK hanya menolak syarat yang hasilnya salah. Supaya harga wajib diisi, tambahkan NOT NULL.", hint: "Ingat logika tiga nilai: benar, salah, tidak diketahui." },
    { id: "sql-12-03", kind: "choice", prompt: "Di skrip SQL Server, apa arti baris <code>GO</code>?",
      options: ["Perintah T-SQL untuk menyimpan transaksi, sama dengan COMMIT", "Tanda pemisah kelompok perintah (batch) yang dikenali alat seperti SSMS dan sqlcmd, bukan perintah T-SQL", "Perintah untuk menjalankan MERGE", "Pengganti titik koma di akhir setiap perintah"], answer: 1,
      why: "GO tidak pernah dikirim ke server. Alat seperti SSMS dan sqlcmd memakainya untuk memotong skrip menjadi batch yang dikirim satu per satu. GO tidak menyimpan transaksi.", hint: "Lihat baris terakhir tabel Di SQL Server." },
    { id: "sql-12-04", kind: "build", prompt: "Buat skema <code>latihan</code> dan tabel <code>latihan.kategori_induk</code> dengan kolom <code>category_id</code> (integer, PRIMARY KEY) dan <code>category_name</code> (text, NOT NULL, UNIQUE). Lalu isi tabel itu dengan semua kategori paling atas dari <code>app.categories</code> (yang <code>parent_id</code>-nya NULL).",
      verify: "select k.category_id, k.category_name,\n  (select count(*) from information_schema.table_constraints c\n   where c.table_schema = 'latihan' and c.table_name = 'kategori_induk' and c.constraint_type in ('PRIMARY KEY', 'UNIQUE')) as jumlah_constraint\nfrom latihan.kategori_induk k",
      solution: "create schema latihan;\ncreate table latihan.kategori_induk (\n  category_id integer primary key,\n  category_name text not null unique\n);\ninsert into latihan.kategori_induk (category_id, category_name)\nselect category_id, category_name from app.categories where parent_id is null;",
      why: "CREATE SCHEMA dulu, lalu CREATE TABLE dengan constraint di setiap kolom, lalu INSERT … SELECT. Ada 5 kategori paling atas. Pemeriksa juga menghitung constraint PRIMARY KEY dan UNIQUE di tabelmu.", hint: "Tiga perintah: create schema, create table (… primary key, … not null unique), insert into … select … where parent_id is null." },
    { id: "sql-12-05", kind: "build", setup: "create schema latihan;\ncreate table latihan.voucher (\n  kode text primary key,\n  potongan_persen integer not null check (potongan_persen between 1 and 50),\n  aktif boolean not null default true\n);",
      prompt: "Tabel <code>latihan.voucher</code> sudah dibuat otomatis dengan kolom <code>kode</code>, <code>potongan_persen</code>, dan <code>aktif</code> (bawaannya true). Tambahkan dua voucher dalam satu perintah: <code>HEMAT10</code> dengan potongan 10 persen dan <code>HEMAT25</code> dengan potongan 25 persen. Jangan isi kolom <code>aktif</code>; biarkan DEFAULT yang mengisinya.",
      verify: "select kode, potongan_persen, aktif from latihan.voucher",
      solution: "insert into latihan.voucher (kode, potongan_persen)\nvalues ('HEMAT10', 10), ('HEMAT25', 25);",
      why: "Kolom aktif tidak disebut di daftar kolom, jadi diisi nilai bawaannya, true. Dua baris ditulis dalam satu VALUES, dipisah koma.", hint: "insert into latihan.voucher (kode, potongan_persen) values (…), (…);" },
    { id: "sql-12-06", kind: "build", setup: PRODUK,
      prompt: "Tabel <code>latihan.produk</code> (salinan <code>app.products</code>, dibuat otomatis) punya kolom <code>product_id</code>, <code>sku</code>, <code>product_name</code>, <code>brand</code>, <code>list_price</code>, dan <code>is_active</code>. Pemasok merek Kirana menaikkan harga 10% untuk produk yang <b>masih aktif</b>. Ubah <code>list_price</code> produk itu menjadi harga lama dikali 1,1, dibulatkan ke rupiah utuh. Produk lain tidak boleh berubah.",
      verify: "select brand, is_active, count(*) as jumlah, sum(list_price) as total_harga\nfrom latihan.produk\ngroup by brand, is_active",
      solution: "update latihan.produk\nset list_price = round(list_price * 1.1)\nwhere brand = 'Kirana' and is_active;",
      why: "WHERE memilih 18 produk Kirana yang aktif; 3 produk Kirana yang tidak aktif dan semua merek lain tidak tersentuh. Pemeriksa membandingkan jumlah dan total harga setiap merek, jadi UPDATE tanpa syarat yang lengkap akan ketahuan.", hint: "Dua syarat digabung dengan AND. round(x) membulatkan ke bilangan bulat." },
    { id: "sql-12-07", kind: "sql", setup: UPLOAD,
      prompt: "Tabel <code>latihan.upload</code> adalah salinan <code>raw.supplier_price_upload</code> (dibuat otomatis). Hapus baris yang kode produknya, setelah dirapikan ke bentuk <code>TK-12345</code>, tidak ada di kolom <code>sku</code> tabel <code>app.products</code>. Tampilkan <code>row_no</code> dan <code>sku_text</code> baris yang terhapus dengan RETURNING.",
      solution: "delete from latihan.upload u\nwhere not exists (\n  select 1 from app.products p\n  where p.sku = 'TK-' || substring(replace(upper(trim(u.sku_text)), '-', '') from 3)\n)\nreturning row_no, sku_text;",
      why: "NOT EXISTS mencari baris yang tidak punya pasangan di app.products. Hasilnya 4 baris: 51 sampai 54 (TK-99000, TK-99013, TK-99026, TK-99039). Baris-baris ini yang akan ditolak foreign key kalau dimuat ke tabel dengan REFERENCES app.products (sku).", hint: "delete from … where not exists (select 1 from app.products p where p.sku = …) returning …" },
    { id: "sql-12-08", kind: "build", level: "menengah", setup: UPLOAD,
      prompt: "Tabel <code>latihan.upload</code> adalah salinan <code>raw.supplier_price_upload</code> (dibuat otomatis). Hapus baris dobel: baris yang kode produknya (setelah dirapikan ke bentuk <code>TK-12345</code>), <code>price_text</code>, dan <code>effective_date_text</code>-nya sama dengan baris lain yang <code>row_no</code>-nya lebih kecil. Baris dengan <code>row_no</code> terkecil disimpan.",
      verify: "select row_no from latihan.upload",
      solution: "delete from latihan.upload u\nwhere exists (\n  select 1 from latihan.upload lain\n  where 'TK-' || substring(replace(upper(trim(lain.sku_text)), '-', '') from 3)\n      = 'TK-' || substring(replace(upper(trim(u.sku_text)), '-', '') from 3)\n    and lain.price_text = u.price_text\n    and lain.effective_date_text = u.effective_date_text\n    and lain.row_no < u.row_no\n);",
      why: "EXISTS memeriksa apakah ada baris lain yang sama dengan nomor lebih kecil. Kalau ada, baris ini salinan dan dihapus. Tujuh baris terhapus (55 sampai 61), tersisa 54.", hint: "Lihat contoh di bagian DELETE. Bandingkan tabel dengan dirinya sendiri memakai dua alias." },
    { id: "sql-12-09", kind: "build", setup: PRODUK,
      prompt: "Tabel <code>latihan.produk</code> (salinan <code>app.products</code>, dibuat otomatis) belum punya constraint. Dengan ALTER TABLE: pasang PRIMARY KEY di <code>product_id</code>, tambahkan kolom <code>catatan</code> (text) dengan nilai bawaan <code>'belum dicek'</code>, dan pasang CHECK supaya <code>list_price</code> harus lebih dari 0.",
      verify: "select\n  (select count(*) from pg_constraint where conrelid = 'latihan.produk'::regclass and contype = 'p') as jumlah_pk,\n  (select count(*) from pg_constraint where conrelid = 'latihan.produk'::regclass and contype = 'c') as jumlah_check,\n  count(*) filter (where catatan = 'belum dicek') as baris_bercatatan\nfrom latihan.produk",
      solution: "alter table latihan.produk add primary key (product_id);\nalter table latihan.produk add column catatan text default 'belum dicek';\nalter table latihan.produk add check (list_price > 0);",
      why: "Tiga ALTER TABLE terpisah (atau satu ALTER TABLE dengan tiga bagian dipisah koma). Semua 150 baris lama mendapat catatan 'belum dicek' dari DEFAULT. Pemeriksa menghitung PRIMARY KEY dan CHECK di tabel sistem PostgreSQL yang mencatat semua constraint (pg_constraint).", hint: "alter table … add primary key (…); alter table … add column … default …; alter table … add check (…);" },
    { id: "sql-12-10", kind: "build", level: "menengah",
      setup: "create schema latihan;\ncreate table latihan.harga_terbaru (sku text primary key, harga numeric(12,2) not null, berlaku_mulai date not null);\ninsert into latihan.harga_terbaru values ('TK-10007', 50000, '2025-08-01'), ('TK-10014', 75000, '2025-08-01'), ('TK-10021', 99000, '2025-08-01');\ncreate table latihan.harga_baru (sku text, harga numeric(12,2), berlaku_mulai date);\ninsert into latihan.harga_baru values ('TK-10014', 79000, '2025-10-01'), ('TK-10021', 95000, '2025-10-01'), ('TK-10028', 120000, '2025-10-01');",
      prompt: "Tabel <code>latihan.harga_terbaru</code> (PRIMARY KEY di <code>sku</code>) berisi 3 produk. Tabel <code>latihan.harga_baru</code> berisi kiriman harga baru untuk 3 produk, dua di antaranya sudah ada di <code>harga_terbaru</code>. Masukkan semua baris <code>harga_baru</code> ke <code>harga_terbaru</code> dengan satu INSERT. Kalau <code>sku</code>-nya sudah ada, ganti <code>harga</code> dan <code>berlaku_mulai</code> dengan nilai baru.",
      verify: "select sku, harga, berlaku_mulai from latihan.harga_terbaru",
      solution: "insert into latihan.harga_terbaru (sku, harga, berlaku_mulai)\nselect sku, harga, berlaku_mulai from latihan.harga_baru\non conflict (sku) do update\n  set harga = excluded.harga, berlaku_mulai = excluded.berlaku_mulai;",
      why: "TK-10014 dan TK-10021 bentrok dengan primary key, jadi diubah memakai nilai dari excluded. TK-10028 belum ada, jadi ditambahkan. Hasilnya 4 baris.", hint: "insert into … select … on conflict (sku) do update set harga = excluded.harga, …" },
    { id: "sql-12-11", kind: "build", level: "wawancara",
      setup: "create schema latihan;\ncreate table latihan.kota_jawa (city_id integer primary key, city_name text not null, province text not null);",
      prompt: "Pertanyaan wawancara: tulis perintah yang menyalin semua kota di pulau Jawa (<code>island = 'Jawa'</code>) dari <code>app.cities</code> ke <code>latihan.kota_jawa</code> (sudah dibuat otomatis, PRIMARY KEY di <code>city_id</code>), dengan kolom <code>city_id</code>, <code>city_name</code>, dan <code>province</code>. Perintahnya harus idempoten. Buktikan: tulis perintah yang sama <b>dua kali</b> berturut-turut di jawabanmu. Hasil akhirnya harus sama dengan kalau dijalankan sekali.",
      verify: "select count(*) as jumlah_kota, sum(city_id) as total_id from latihan.kota_jawa",
      solution: "insert into latihan.kota_jawa (city_id, city_name, province)\nselect city_id, city_name, province from app.cities where island = 'Jawa'\non conflict (city_id) do nothing;\n\ninsert into latihan.kota_jawa (city_id, city_name, province)\nselect city_id, city_name, province from app.cities where island = 'Jawa'\non conflict (city_id) do nothing;",
      why: "INSERT biasa yang dijalankan dua kali ditolak primary key di perintah kedua. Dengan ON CONFLICT DO NOTHING, perintah kedua melewati 11 kota yang sudah ada, jadi isi tabel tetap 11 kota. Kalau datanya bisa berubah di sumber, pakai DO UPDATE supaya perubahan ikut terbawa.", hint: "INSERT … SELECT … ON CONFLICT (city_id) DO NOTHING, ditulis dua kali." },
    { id: "sql-12-12", kind: "build", level: "menengah", setup: PESANAN,
      prompt: "Tabel <code>latihan.pesanan</code> (dibuat otomatis, PRIMARY KEY di <code>order_id</code>) berisi <code>order_id</code>, <code>status</code>, dan <code>updated_at</code> semua pesanan di <code>app.orders</code>. Dengan satu MERGE dari <code>raw.orders_batch2</code>: kalau <code>order_id</code> sudah ada, ganti <code>status</code> dan <code>updated_at</code> dengan nilai dari batch2; kalau belum ada, tambahkan barisnya dengan tiga kolom itu.",
      verify: "select status, count(*) as jumlah from latihan.pesanan group by status",
      solution: "merge into latihan.pesanan t\nusing raw.orders_batch2 s on t.order_id = s.order_id\nwhen matched then\n  update set status = s.status, updated_at = s.updated_at\nwhen not matched then\n  insert (order_id, status, updated_at) values (s.order_id, s.status, s.updated_at);",
      why: "WHEN MATCHED mengubah 75 pesanan lama, WHEN NOT MATCHED menambah 290 pesanan baru. Pemeriksa menghitung jumlah pesanan per status setelah MERGE.", hint: "merge into … t using … s on t.order_id = s.order_id when matched then update set … when not matched then insert (…) values (…)" },
    { id: "sql-12-13", kind: "fix", setup: PRODUK,
      prompt: "Perintah ini seharusnya menonaktifkan (<code>is_active = false</code>) produk merek Mekar saja di <code>latihan.produk</code> (salinan <code>app.products</code>, dibuat otomatis), lalu menampilkan jumlah produk aktif per merek. Ternyata semua merek jumlah produk aktifnya menjadi 0. Perbaiki.",
      start: "update latihan.produk\nset is_active = false;\n\nselect brand, count(*) filter (where is_active) as aktif\nfrom latihan.produk\ngroup by brand\norder by brand;",
      solution: "update latihan.produk\nset is_active = false\nwhere brand = 'Mekar';\n\nselect brand, count(*) filter (where is_active) as aktif\nfrom latihan.produk\ngroup by brand\norder by brand;",
      why: "UPDATE tanpa WHERE mengubah semua 150 produk. Dengan where brand = 'Mekar', hanya 12 produk Mekar yang berubah, dan merek lain tetap seperti semula. Biasakan menjalankan SELECT dengan WHERE yang sama sebelum UPDATE.", hint: "Apa yang membatasi baris yang diubah UPDATE?" },
    { id: "sql-12-14", kind: "number", prompt: "Kalau MERGE di bagian MERGE dijalankan, berapa pesanan dari <code>raw.orders_batch2</code> yang <b>ditambahkan</b> sebagai baris baru (nomornya belum ada di <code>app.orders</code>)?",
      answerSql: "select count(*) from raw.orders_batch2 b where not exists (select 1 from app.orders o where o.order_id = b.order_id)",
      why: "select count(*) from raw.orders_batch2 b where not exists (select 1 from app.orders o where o.order_id = b.order_id). Baris inilah yang masuk ke WHEN NOT MATCHED.", hint: "Hitung baris batch2 yang tidak punya pasangan di app.orders dengan NOT EXISTS." },
    { id: "sql-12-15", kind: "explain", level: "wawancara", prompt: "Pertanyaan wawancara: proses muat harian ke tabel pesanan gagal di tengah jalan, lalu dijalankan ulang. Jelaskan apa itu idempoten, kenapa INSERT biasa berbahaya di situasi ini, dan dua cara membuat proses muat itu aman diulang.",
      model: "Idempoten berarti dijalankan sekali atau berkali-kali, hasil akhirnya sama. INSERT biasa tidak idempoten: kalau sebagian baris sudah masuk sebelum proses gagal, menjalankannya ulang membuat baris dobel, atau gagal karena primary key. Cara pertama: upsert, yaitu INSERT … ON CONFLICT (kunci) DO NOTHING atau DO UPDATE, atau MERGE, sehingga baris yang sudah ada dilewati atau diperbarui. Syaratnya tabel punya PRIMARY KEY atau UNIQUE di kuncinya. Cara kedua: jalankan semua langkah di satu transaksi, misalnya hapus dulu data periode yang sama lalu masukkan ulang, lalu COMMIT. Kalau gagal di tengah, ROLLBACK membatalkan semuanya, sehingga tidak ada data setengah jadi.",
      hint: "Pikirkan apa yang sudah masuk sebelum proses gagal, dan bagaimana constraint serta transaksi membantu." },
  ],
};
