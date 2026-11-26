// Bab 1 Data Modeling & Warehouse: OLTP dan OLAP, diagram ER, normalisasi, gudang data, lapisan data, ETL dan ELT.

// Tabel lebar tiruan: setiap pesanan pelanggan 1–10 membawa salinan nama, kota, dan provinsi pelanggan.
// Lalu dibuat dua kesalahan pembaruan: pelanggan 3 hanya diubah kotanya di pesanan sejak 1 Juni 2025,
// dan satu pesanan pelanggan 9 diubah kotanya tanpa mengubah provinsinya.
const SETUP_LEBAR = `create schema latihan;
create table latihan.pesanan_lebar as
select o.order_id, o.order_ts::date as tgl_pesan, c.customer_id, c.full_name as nama_pelanggan,
       ci.city_name as kota, ci.province as provinsi, o.shipping_fee
from app.orders o
join app.customers c on c.customer_id = o.customer_id
join app.cities ci on ci.city_id = c.city_id
where c.customer_id <= 10;
update latihan.pesanan_lebar set kota = 'Malang' where customer_id = 3 and tgl_pesan >= '2025-06-01';
update latihan.pesanan_lebar set kota = 'Medan' where order_id = 110744;`;

// Tabel tiruan yang melanggar 1NF: semua kode produk satu pesanan ditulis dalam satu sel.
const SETUP_DAFTAR = `create schema latihan;
create table latihan.pesanan_daftar as
select i.order_id, string_agg(p.sku, ', ' order by i.line_no) as daftar_sku
from app.order_items i
join app.products p on p.product_id = i.product_id
where i.order_id between 100001 and 100015
group by i.order_id;`;

export default {
  id: "model-01",
  part: "model",
  title: "Dari aplikasi ke gudang data",
  minutes: 75,
  goals: [
    "Membedakan database untuk menjalankan aplikasi (OLTP) dan database untuk analisis (OLAP).",
    "Membaca diagram ER tabel <code>app.*</code> dan membuktikan relasinya dengan query.",
    "Mengenali pelanggaran bentuk normal pertama, kedua, dan ketiga, serta anomali yang ditimbulkannya.",
    "Menjelaskan gudang data, data mart, lapisan raw/staging/core/mart, dan padanannya di arsitektur medallion.",
    "Membedakan ETL dan ELT.",
  ],
  terms: [
    { term: "oltp", def: "<i>Online Transaction Processing</i>: database yang melayani aplikasi sehari-hari. Setiap perintahnya kecil dan cepat, misalnya mencatat satu pesanan atau mengubah status satu pesanan. Di TokoKita, skema <code>app</code>." },
    { term: "olap", def: "<i>Online Analytical Processing</i>: pemakaian database untuk analisis, yaitu query yang membaca dan meringkas banyak baris sekaligus, misalnya penjualan per bulan." },
    { term: "diagram er", def: "Diagram <i>Entity-Relationship</i> (entitas dan relasi): gambar tabel-tabel beserta garis yang menunjukkan kolom mana merujuk ke tabel mana, dan apakah relasinya satu-ke-satu atau satu-ke-banyak." },
    { term: "kunci gabungan", def: "Kunci utama yang terdiri dari lebih dari satu kolom, misalnya <code>(order_id, line_no)</code> di <code>app.order_items</code>." },
    { term: "normalisasi", def: "Cara menyusun tabel supaya setiap fakta disimpan tepat di satu tempat. Hasilnya diukur dengan bentuk normal (1NF, 2NF, 3NF)." },
    { term: "1nf", def: "Bentuk normal pertama: setiap sel berisi satu nilai, tidak ada kolom berulang seperti produk_1, produk_2, dan setiap baris bisa dibedakan dengan kunci." },
    { term: "2nf", def: "Bentuk normal kedua: sudah 1NF, dan setiap kolom yang bukan kunci bergantung pada seluruh kunci, bukan hanya sebagian kunci gabungan." },
    { term: "3nf", def: "Bentuk normal ketiga: sudah 2NF, dan tidak ada kolom bukan kunci yang ditentukan oleh kolom bukan kunci lain (misalnya provinsi ditentukan oleh kota)." },
    { term: "anomali update", def: "Data menjadi tidak konsisten karena satu fakta disimpan di banyak baris, lalu hanya sebagian baris yang diubah. Selain anomali saat mengubah, ada juga anomali saat menambah dan menghapus data." },
    { term: "gudang data", def: "<i>Data warehouse</i>: database khusus analisis yang mengumpulkan data dari banyak sumber, merapikannya, dan menyimpan riwayatnya." },
    { term: "data mart", def: "Bagian gudang data yang disiapkan untuk satu tim atau satu topik, misalnya ringkasan penjualan untuk tim keuangan." },
    { term: "lapisan raw/staging/core/mart", def: "Urutan tempat data di gudang data: raw (mentah, apa adanya), staging (sudah dirapikan per sumber), core (sudah digabung dan konsisten antar sumber), mart (siap dipakai tim tertentu)." },
    { term: "medallion", def: "Nama lain untuk pembagian lapisan data, memakai nama medali: bronze (perunggu, data mentah), silver (perak, data yang sudah dibersihkan), gold (emas, data siap dipakai laporan)." },
    { term: "etl", def: "<i>Extract, Transform, Load</i>: data diambil dari sumber, diubah dan dibersihkan di luar gudang data, lalu dimuat ke gudang data dalam keadaan sudah rapi." },
    { term: "elt", def: "<i>Extract, Load, Transform</i>: data diambil dari sumber dan dimuat apa adanya ke gudang data, lalu dibersihkan dengan SQL di dalam gudang data." },
  ],
  introduces: [],
  sections: [
    {
      title: "OLTP: database untuk menjalankan aplikasi",
      html: `<p>Skema <code>app</code> adalah database milik aplikasi TokoKita. Setiap kali pelanggan memesan, aplikasi menambah satu baris di <code>app.orders</code> dan beberapa baris di <code>app.order_items</code>. Setiap kali kurir menyerahkan paket, aplikasi mengubah status satu pesanan.</p>
<p>Pemakaian seperti ini disebut <b>OLTP</b> (<i>Online Transaction Processing</i>, pengolahan transaksi saat itu juga). Ciri-cirinya:</p>
<ul><li>Setiap perintah hanya menyentuh sedikit baris, biasanya dicari lewat kunci utama seperti <code>order_id</code>.</li>
<li>Perintahnya sangat banyak dan harus cepat, karena pelanggan sedang menunggu.</li>
<li>Yang disimpan adalah keadaan terbaru. Kamus data menulis bahwa kalau pelanggan pindah kota, nilai lama di <code>app.customers</code> ditimpa.</li></ul>`,
      examples: [{ sql: "select o.order_id, o.status, i.line_no, i.product_id, i.qty, i.unit_price\nfrom app.orders o\njoin app.order_items i on i.order_id = o.order_id\nwhere o.order_id = 100001;", note: "Query khas aplikasi: satu pesanan beserta isinya. Hanya beberapa baris yang dibaca." }],
    },
    {
      title: "OLAP: database untuk analisis",
      html: `<p>Tim bisnis punya pertanyaan lain: berapa pesanan per bulan di setiap channel (tempat pesanan dibuat: web, android, atau ios)? Untuk menjawabnya, query harus membaca ribuan baris lalu meringkasnya. Pemakaian seperti ini disebut <b>OLAP</b> (<i>Online Analytical Processing</i>, pengolahan untuk analisis).</p>
<div class="tw"><table class="t"><tr><th></th><th>OLTP</th><th>OLAP</th></tr>
<tr><td>Pemakai</td><td>aplikasi, pelanggan, petugas</td><td>analis, laporan, tim data</td></tr>
<tr><td>Bentuk perintah</td><td>menambah, mengubah, membaca sedikit baris</td><td>membaca dan meringkas banyak baris</td></tr>
<tr><td>Data yang disimpan</td><td>keadaan terbaru</td><td>riwayat, sering bertahun-tahun</td></tr>
<tr><td>Susunan tabel</td><td>ternormalisasi (dibahas di bawah)</td><td>disusun supaya mudah dibaca dan diringkas</td></tr></table></div>
<p>Query analisis yang berat sebaiknya tidak dijalankan langsung di database aplikasi, karena bisa memperlambat aplikasi yang sedang melayani pelanggan. Itulah alasan utama data disalin ke database terpisah untuk analisis.</p>`,
      examples: [{ sql: "select date_trunc('month', order_ts)::date as bulan, channel, count(*) as pesanan\nfrom app.orders\nwhere order_ts >= '2025-01-01'\ngroup by date_trunc('month', order_ts), channel\norder by bulan, channel;", note: "Query khas analisis: membaca semua 5.620 pesanan sejak 1 Januari 2025, lalu meringkasnya menjadi satu baris per bulan per channel." }],
    },
    {
      title: "Diagram ER: peta relasi tabel app",
      html: `<p><b>Diagram ER</b> (<i>Entity-Relationship</i>, entitas dan relasi) adalah gambar tabel beserta garis relasinya. Setiap garis berarti satu kolom (<i>foreign key</i>) merujuk ke kunci utama tabel lain. Berikut relasi tabel <code>app</code>, disusun dari struktur tabel di <a href="#kamus">Kamus data</a>. Tanda <code>1 ──&lt;</code> berarti satu baris di kiri berpasangan dengan banyak baris di kanan (relasi satu-ke-banyak).</p>
<pre><code>app.cities      1 ──&lt; app.customers        (customers.city_id)
app.customers   1 ──&lt; app.orders           (orders.customer_id)
app.staff       1 ──&lt; app.orders           (orders.handled_by, boleh kosong)
app.orders      1 ──&lt; app.order_items      (order_items.order_id)
app.products    1 ──&lt; app.order_items      (order_items.product_id)
app.categories  1 ──&lt; app.products         (products.category_id)
app.products    1 ──&lt; app.product_price_history
app.orders      1 ──&lt; app.payments         (payments.order_id)
app.orders      1 ─── 0 atau 1 app.shipments (shipments.order_id juga kunci utamanya)
app.order_items 1 ──&lt; app.returns          (returns.order_id + returns.line_no)
app.categories.parent_id  merujuk ke app.categories (kategori induk)
app.staff.manager_id      merujuk ke app.staff      (atasan langsung)</code></pre>
<p>Relasi di diagram perlu dibuktikan dengan data. Hitungan lengkap di <code>app.payments</code>: 11.261 pesanan punya satu pembayaran, 227 pesanan punya dua, dan 519 pesanan tidak punya pembayaran sama sekali. Jadi relasi pesanan ke pembayaran memang satu-ke-banyak. Sebaliknya, <code>app.shipments</code> punya 11.247 baris dengan 11.247 <code>order_id</code> berbeda, sehingga tidak ada pesanan yang dikirim dua kali.</p>
<p>Kesalahan umum: menganggap setiap pesanan pasti punya pasangan di tabel lain. Ada 760 pesanan tanpa baris di <code>app.shipments</code> (747 berstatus cancelled dan 13 berstatus processing), sesuai kamus data yang menyebut pesanan dibatalkan atau belum dikirim tidak punya baris di sana.</p>`,
      examples: [
        { sql: "select c.customer_id, c.full_name, count(o.order_id) as jumlah_pesanan\nfrom app.customers c\nleft join app.orders o on o.customer_id = c.customer_id\ngroup by c.customer_id, c.full_name\norder by jumlah_pesanan desc\nlimit 5;", note: "Satu pelanggan bisa punya banyak pesanan; pelanggan nomor 655 punya 35. Dengan LEFT JOIN, pelanggan tanpa pesanan tetap ikut dengan jumlah 0." },
        { sql: "select count(*) as baris, count(distinct order_id) as pesanan\nfrom app.shipments;", note: "Dua angka sama, jadi setiap pesanan paling banyak punya satu pengiriman." },
      ],
    },
    {
      title: "Normalisasi dan anomali update",
      html: `<p><b>Normalisasi</b> adalah cara menyusun tabel supaya setiap fakta disimpan tepat di satu tempat. Contohnya, kota tempat tinggal pelanggan hanya disimpan sekali di <code>app.customers</code>, bukan disalin ke setiap pesanannya.</p>
<p>Untuk melihat kenapa ini penting, contoh di bawah memakai tabel tiruan <code>latihan.pesanan_lebar</code>. Tabel ini dibuat oleh bagian <code>setup</code> (perintah persiapan yang dijalankan sebelum query, lalu dibatalkan bersama query). Isinya 87 pesanan milik pelanggan nomor 1 sampai 10, dan setiap barisnya membawa salinan nama, kota, dan provinsi pelanggan. Tabel yang menyalin data dari banyak tabel ke satu tabel seperti ini disebut tabel lebar atau tabel <i>denormal</i> (tidak ternormalisasi).</p>
<p>Lalu disimulasikan dua kesalahan yang biasa terjadi. Pelanggan nomor 3 pindah ke Malang, tapi kotanya hanya diubah di 6 pesanan sejak 1 Juni 2025; 15 pesanan lainnya masih Surabaya. Satu pesanan pelanggan nomor 9 diubah kotanya menjadi Medan, tapi provinsinya tetap Sumatera Selatan. Kesalahan seperti ini disebut <b>anomali update</b>: satu fakta disimpan di banyak baris, lalu hanya sebagian yang diubah. Akibatnya, pertanyaan "pelanggan 3 tinggal di mana?" punya dua jawaban.</p>
<p>Ada dua anomali lain. <b>Anomali tambah</b>: pelanggan baru yang belum memesan tidak bisa dicatat, karena setiap baris harus berupa pesanan. <b>Anomali hapus</b>: pelanggan nomor 5 hanya punya 1 pesanan; kalau pesanan itu dihapus, nama dan kotanya ikut hilang.</p>`,
      examples: [{ setup: SETUP_LEBAR, sql: "select customer_id, nama_pelanggan, count(*) as baris, count(distinct kota) as jumlah_kota\nfrom latihan.pesanan_lebar\ngroup by customer_id, nama_pelanggan\norder by customer_id;", note: "Pelanggan nomor 3 dan 9 punya dua kota. Di app.customers, setiap pelanggan hanya punya satu city_id, jadi anomali ini tidak mungkin terjadi di sana." }],
    },
    {
      title: "Bentuk normal pertama (1NF)",
      html: `<p>Tabel memenuhi <b>1NF</b> (bentuk normal pertama) kalau:</p>
<ul><li>Setiap sel berisi satu nilai, bukan daftar.</li>
<li>Tidak ada kolom berulang seperti <code>produk_1</code>, <code>produk_2</code>, <code>produk_3</code>. Di TokoKita, satu pesanan berisi sampai 5 produk; kolom berulang harus disiapkan sebanyak kemungkinan terbanyak, dan pesanan ke-6 tidak akan muat.</li>
<li>Setiap baris bisa dibedakan dengan kunci.</li></ul>
<p>Tabel tiruan <code>latihan.pesanan_daftar</code> melanggar aturan pertama: kolom <code>daftar_sku</code> berisi semua kode produk satu pesanan, dipisah koma. Mencari pesanan yang berisi satu produk masih bisa dengan LIKE, tapi jumlah barang, harga, dan nama produknya tidak bisa diambil tanpa memotong teks lebih dulu. Di <code>app.order_items</code>, setiap produk punya baris sendiri, sehingga bisa langsung digabung dengan <code>app.products</code>.</p>
<p>Soal kunci: nama tidak bisa dipakai untuk membedakan pelanggan. Hitungan lengkap di <code>app.customers</code>: 396 nama dipakai lebih dari satu pelanggan, dengan total 927 pelanggan. Pelanggan nomor 6 dan 10 sama-sama bernama Indah Pane. Karena itu kuncinya <code>customer_id</code>.</p>`,
      examples: [
        { setup: SETUP_DAFTAR, sql: "select order_id, daftar_sku\nfrom latihan.pesanan_daftar\nwhere daftar_sku like '%TK-10469%'\norder by order_id;", note: "Pesanan 100003, 100006, dan 100011 berisi TK-10469. Tapi berapa barangnya dan berapa harganya tidak ada di tabel ini." },
        { sql: "select i.order_id, i.line_no, i.qty, i.unit_price, p.product_name\nfrom app.order_items i\njoin app.products p on p.product_id = i.product_id\nwhere p.sku = 'TK-10469'\n  and i.order_id between 100001 and 100015\norder by i.order_id;", note: "Pesanan yang sama, tapi sekarang lengkap dengan jumlah, harga, dan nama produk." },
      ],
    },
    {
      title: "Bentuk normal kedua (2NF)",
      html: `<p>Tabel memenuhi <b>2NF</b> kalau sudah 1NF, dan setiap kolom yang bukan kunci bergantung pada <i>seluruh</i> kunci. Aturan ini baru berarti kalau kuncinya gabungan. <b>Kunci gabungan</b> adalah kunci utama yang terdiri dari lebih dari satu kolom. Kunci <code>app.order_items</code> adalah gabungan <code>(order_id, line_no)</code>.</p>
<p>Bayangkan kolom <code>order_ts</code> (waktu pesanan) ditaruh di <code>app.order_items</code>. Waktu pesanan hanya ditentukan oleh <code>order_id</code>, yaitu sebagian kunci. Itu pelanggaran 2NF. Akibatnya, waktu satu pesanan disalin ke setiap barisnya, dan bisa berbeda antar baris kalau ada yang salah ubah. Itulah sebabnya <code>order_ts</code>, <code>customer_id</code>, dan <code>status</code> disimpan di <code>app.orders</code>, satu baris per pesanan.</p>`,
      examples: [{ sql: "select count(*) as baris_isi_pesanan, count(distinct order_id) as pesanan\nfrom app.order_items;", note: "Ada 28.495 baris isi pesanan untuk 12.007 pesanan. Kalau order_ts ditaruh di app.order_items, waktu pesanan akan tersimpan 28.495 kali, bukan 12.007 kali." }],
    },
    {
      title: "Bentuk normal ketiga (3NF)",
      html: `<p>Tabel memenuhi <b>3NF</b> kalau sudah 2NF, dan tidak ada kolom bukan kunci yang ditentukan oleh kolom bukan kunci lain. Contohnya, kalau <code>app.customers</code> menyimpan <code>city_name</code> dan <code>province</code>, provinsi sebenarnya ditentukan oleh kota, bukan oleh <code>customer_id</code>. Karena itu TokoKita hanya menyimpan <code>city_id</code> di <code>app.customers</code>; nama kota dan provinsi disimpan sekali di <code>app.cities</code>. 1.500 pelanggan cukup merujuk ke 24 kota.</p>
<p>Pesanan pelanggan 9 di tabel lebar adalah contoh akibat pelanggaran 3NF: kota Medan tercatat di provinsi Sumatera Selatan, padahal <code>app.cities</code> mencatat Medan di Sumatera Utara. Kombinasi yang salah seperti ini bisa dicari dengan membandingkan tabel lebar dengan tabel acuannya.</p>`,
      examples: [{ setup: SETUP_LEBAR, sql: "select p.order_id, p.customer_id, p.kota, p.provinsi, ci.province as provinsi_menurut_app\nfrom latihan.pesanan_lebar p\njoin app.cities ci on ci.city_name = p.kota\nwhere p.provinsi <> ci.province;", note: "Satu baris: pesanan 110744. Di tabel yang ternormalisasi, provinsi tidak bisa salah pasang karena hanya disimpan di app.cities." }],
    },
    {
      title: "Gudang data dan data mart",
      html: `<p><b>Gudang data</b> (<i>data warehouse</i>) adalah database khusus analisis. Isinya disalin dari banyak sumber: database aplikasi, berkas pemasok, catatan aktivitas di situs, dan laporan tim lain. Tiga hal membedakannya dari database aplikasi: datanya sudah dirapikan, sumber yang berbeda sudah disatukan, dan riwayatnya disimpan.</p>
<p>Contoh riwayat dari data TokoKita: <code>app.customers</code> mencatat pelanggan nomor 17 tinggal di Yogyakarta. Itu keadaan terbaru. Tabel <code>raw.customer_snapshot</code> (potret data pelanggan setiap akhir bulan, Januari–Oktober 2025) menunjukkan pelanggan yang sama tinggal di Bekasi sampai Juni 2025. Hitungan lengkapnya, 149 pelanggan tercatat di lebih dari satu kota dalam potret itu. Tanpa gudang data yang menyimpan riwayat, penjualan bulan Maret tidak bisa dihitung per kota tempat tinggal pelanggan saat itu.</p>
<p><b>Data mart</b> adalah bagian gudang data yang disiapkan untuk satu tim atau satu topik, misalnya data mart penjualan untuk tim keuangan. Isinya biasanya ringkasan yang langsung dipakai laporan.</p>`,
      examples: [{ sql: "select s.snapshot_date, s.city_id, ci.city_name\nfrom raw.customer_snapshot s\njoin app.cities ci on ci.city_id = s.city_id\nwhere s.customer_id = 17\norder by s.snapshot_date;", note: "Bekasi dari Januari sampai Juni, Yogyakarta dari Juli sampai Oktober. app.customers hanya menyimpan Yogyakarta." }],
    },
    {
      title: "Lapisan raw, staging, core, dan mart",
      html: `<p>Di dalam gudang data, data biasanya melewati beberapa lapisan. Setiap lapisan adalah kelompok tabel, sering dipisah per skema:</p>
<ol><li><b>Raw</b> (mentah): data disalin apa adanya dari sumber, tanpa diubah. Di TokoKita, skema <code>raw</code>. Contohnya <code>raw.supplier_price_upload</code>: kamus data menyebut kolom <code>supplier</code> berisi nama pemasok "seperti yang diketik". Hasilnya, ada lima tulisan berbeda, termasuk <code>'CV MEKAR ABADI '</code> (dengan spasi di akhir) dan <code>'CV Mekar Abadi'</code>.</li>
<li><b>Staging</b> (tahap persiapan): data dari satu sumber dirapikan. Spasi dibuang, huruf diseragamkan, teks diubah ke tipe yang benar. Setelah TRIM dan UPPER, lima tulisan nama pemasok tadi menjadi tiga.</li>
<li><b>Core</b> (inti): data dari berbagai sumber disatukan dan dibuat konsisten. Contohnya, kode produk dari berkas pemasok dicocokkan dengan <code>app.products</code>. Dari 61 baris berkas, 57 cocok dengan produk di <code>app.products</code>; 4 baris berkode TK-99000, TK-99013, TK-99026, dan TK-99039 tidak ada di sana.</li>
<li><b>Mart</b>: tabel siap pakai untuk satu tim, misalnya jumlah pesanan per bulan per channel seperti contoh di bagian OLAP.</li></ol>
<p>Pembagian yang sama juga dikenal dengan nama <b>medallion</b> (medali), yang dipakai antara lain di Microsoft Fabric (layanan analisis data milik Microsoft): <i>bronze</i> (perunggu) untuk data mentah, <i>silver</i> (perak) untuk data yang sudah dibersihkan dan disatukan, dan <i>gold</i> (emas) untuk data siap laporan. Kira-kira, bronze sama dengan raw, silver mencakup staging dan core, dan gold sama dengan mart.</p>
<p>Aturan terpenting tetap sama dengan bab membersihkan data mentah: lapisan raw tidak pernah ditimpa. Kalau aturan pembersihan ternyata salah, lapisan berikutnya bisa dibangun ulang dari raw.</p>`,
      examples: [
        { sql: "select supplier, upper(trim(supplier)) as pemasok_rapi, count(*) as baris\nfrom raw.supplier_price_upload\ngroup by supplier, upper(trim(supplier))\norder by pemasok_rapi, supplier;", note: "Kolom pertama isi lapisan raw, kolom kedua hasil perapian di lapisan staging." },
        { sql: "select u.row_no, upper(trim(u.supplier)) as pemasok,\n       'TK-' || substring(replace(upper(trim(u.sku_text)), '-', '') from 3) as sku,\n       p.product_id, p.product_name\nfrom raw.supplier_price_upload u\nleft join app.products p\n  on p.sku = 'TK-' || substring(replace(upper(trim(u.sku_text)), '-', '') from 3)\norder by u.row_no;", note: "Langkah ke lapisan core: kode yang sudah dirapikan dicocokkan dengan app.products. Baris 51 sampai 54 tidak menemukan pasangan, sehingga product_id-nya NULL." },
      ],
    },
    {
      title: "ETL dan ELT",
      html: `<p>Proses memindahkan data dari sumber ke gudang data punya tiga langkah: <i>extract</i> (mengambil data dari sumber), <i>transform</i> (mengubah dan membersihkan), dan <i>load</i> (memuat ke gudang data). Urutannya ada dua:</p>
<ul><li><b>ETL</b> (<i>Extract, Transform, Load</i>): data dibersihkan di luar gudang data, misalnya dengan program Python (bahasa pemrograman) atau alat khusus, lalu dimuat dalam keadaan sudah rapi. Gudang data tidak menyimpan versi mentahnya.</li>
<li><b>ELT</b> (<i>Extract, Load, Transform</i>): data dimuat apa adanya ke lapisan raw, lalu dibersihkan dengan SQL di dalam gudang data. Versi mentahnya tetap tersimpan, sehingga pembersihan bisa diulang kapan saja.</li></ul>
<p>Data latihan TokoKita disusun dengan pola ELT: berkas pemasok dan ekstrak susulan <code>raw.orders_batch2</code> (pesanan baru dan pesanan yang berubah status, diterima awal November 2025) sudah dimuat apa adanya ke skema <code>raw</code>, dan kamu merapikannya dengan query seperti di bab ini. ETL tetap dipakai, misalnya kalau sebagian data tidak boleh masuk gudang data sama sekali, sehingga harus disaring lebih dulu.</p>`,
    },
  ],
  tsql: [
    { pg: "Skema bawaan: public", tsql: "Skema bawaan: dbo", note: "Di PostgreSQL, tabel yang dibuat tanpa nama skema masuk ke skema public. Di SQL Server, nama tanpa skema dicari di skema bawaan pengguna; kalau tidak bisa ditentukan, dipakai dbo. Tulis selalu nama skemanya, di kedua database." },
    { pg: "app.orders (hanya di database yang sedang tersambung)", tsql: "NamaDatabase.app.orders", note: "SQL Server menerima nama tiga bagian (database.skema.tabel) untuk database lain di server yang sama, sehingga lapisan bisa dipisah per database dan tetap di-query bersama. PostgreSQL hanya menerima nama database yang sama dengan database yang sedang tersambung, jadi lapisan dipisah per skema, seperti app dan raw." },
    { pg: "text", tsql: "varchar(max) atau nvarchar(max)", note: "SQL Server juga punya tipe bernama text, tapi tipe itu akan dihapus di versi mendatang. Jangan dipakai untuk tabel baru." },
    { pg: "numeric(12,2)", tsql: "decimal(12,2) atau numeric(12,2)", note: "Di SQL Server, decimal dan numeric adalah dua nama untuk tipe yang sama." },
    { pg: "boolean", tsql: "bit", note: "bit berisi 1, 0, atau NULL. Teks 'TRUE' dan 'FALSE' diubah menjadi 1 dan 0." },
    { pg: "timestamp", tsql: "datetime2", note: "Hati-hati: timestamp di SQL Server adalah nama lain rowversion, yaitu nomor urut perubahan baris, bukan tanggal dan jam. Untuk tanggal dan jam, pakai datetime2." },
    { pg: "ETL atau ELT dengan SQL biasa", tsql: "SQL biasa, atau SSIS (SQL Server Integration Services)", note: "SSIS adalah alat Microsoft untuk mengambil, mengubah, dan memuat data, termasuk memuat gudang data. Dipasang lewat instalasi SQL Server." },
  ],
  summary: [
    "OLTP melayani aplikasi: banyak perintah kecil, menyimpan keadaan terbaru. OLAP melayani analisis: query yang membaca dan meringkas banyak baris, memakai riwayat.",
    "Diagram ER menunjukkan relasi antar tabel. Buktikan relasinya dengan data: <code>count(*)</code> lawan <code>count(distinct …)</code>, dan GROUP BY dengan HAVING.",
    "Normalisasi menyimpan setiap fakta di satu tempat. 1NF: satu nilai per sel. 2NF: tidak bergantung pada sebagian kunci gabungan. 3NF: tidak ada kolom yang ditentukan kolom bukan kunci lain.",
    "Tabel lebar menyalin fakta ke banyak baris, sehingga rawan anomali update, tambah, dan hapus.",
    "Gudang data mengumpulkan, merapikan, dan menyimpan riwayat data dari banyak sumber. Data mart adalah bagiannya untuk satu tim atau topik.",
    "Lapisan raw → staging → core → mart, atau bronze → silver → gold. Lapisan raw tidak pernah ditimpa.",
    "ETL membersihkan sebelum memuat; ELT memuat data mentah dulu, lalu membersihkannya dengan SQL di gudang data.",
  ],
  drills: [
    { id: "model-01-01", kind: "choice", prompt: `Tabel berikut melanggar bentuk normal yang mana?<div class="tw"><table class="t"><tr><th>order_id</th><th>daftar_sku</th></tr><tr><td>100001</td><td>TK-10518, TK-10175</td></tr><tr><td>100004</td><td>TK-10329</td></tr></table></div>`,
      options: ["1NF, karena satu sel berisi lebih dari satu nilai", "2NF, karena kuncinya gabungan", "3NF, karena daftar_sku ditentukan oleh kolom lain", "Tidak melanggar apa pun"], answer: 0,
      why: "1NF mensyaratkan setiap sel berisi satu nilai. Kolom daftar_sku berisi daftar kode produk yang dipisah koma.", hint: "Lihat isi satu sel di kolom daftar_sku." },
    { id: "model-01-02", kind: "choice", prompt: "Sebuah tabel isi pesanan punya kunci gabungan <code>(order_id, line_no)</code> dan kolom <code>product_id</code>, <code>qty</code>, serta <code>order_ts</code> (waktu pesanan). Kolom mana yang melanggar 2NF?",
      options: ["product_id", "qty", "order_ts", "line_no"], answer: 2,
      why: "Waktu pesanan hanya ditentukan oleh order_id, yaitu sebagian kunci gabungan. product_id dan qty berbeda untuk setiap baris di dalam pesanan, jadi ditentukan oleh seluruh kunci.", hint: "Kolom mana yang nilainya sama untuk semua baris di dalam satu pesanan?" },
    { id: "model-01-03", kind: "choice", prompt: "Tabel pelanggan berkunci <code>customer_id</code> berisi kolom <code>full_name</code>, <code>city_id</code>, <code>city_name</code>, dan <code>province</code>. Bentuk normal mana yang dilanggar, dan kenapa?",
      options: ["1NF, karena ada nilai NULL", "2NF, karena kuncinya hanya satu kolom", "3NF, karena city_name dan province ditentukan oleh city_id, bukan oleh customer_id", "Tidak melanggar apa pun"], answer: 2,
      why: "city_name dan province ditentukan oleh city_id, yang bukan kunci tabel ini. Itu pelanggaran 3NF. Penyelesaiannya: simpan hanya city_id, lalu taruh nama kota dan provinsi di tabel kota, seperti app.customers dan app.cities.", hint: "Kalau city_id diketahui, kolom apa saja yang sudah pasti nilainya?" },
    { id: "model-01-04", kind: "choice", level: "wawancara", prompt: "Sebuah tim memuat berkas pemasok apa adanya ke skema <code>raw</code> di gudang data, lalu membersihkannya dengan query SQL di gudang data itu. Pola apa ini?",
      options: ["ETL", "ELT", "OLTP", "Normalisasi"], answer: 1,
      why: "Data dimuat (load) dulu dalam keadaan mentah, baru diubah (transform) di dalam gudang data. Urutannya extract, load, transform: ELT.", hint: "Perhatikan urutan: dibersihkan sebelum atau sesudah dimuat?" },
    { id: "model-01-05", kind: "choice", prompt: "Tabel <code>raw.orders_batch2</code> berisi ekstrak pesanan yang diterima awal November 2025, apa adanya. Dalam pembagian medallion, tabel ini termasuk lapisan mana?",
      options: ["Bronze", "Silver", "Gold", "Bukan bagian dari gudang data"], answer: 0,
      why: "Data yang disalin apa adanya dari sumber berada di lapisan raw, yang di pembagian medallion disebut bronze.", hint: "Apakah datanya sudah dibersihkan?" },
    { id: "model-01-06", kind: "sql", prompt: "Buktikan bahwa setiap pesanan paling banyak punya satu pengiriman: dari <code>app.shipments</code>, tampilkan jumlah baris dan jumlah <code>order_id</code> yang berbeda.",
      solution: "select count(*) as baris, count(distinct order_id) as pesanan from app.shipments",
      why: "Kalau ada pesanan yang dikirim dua kali, jumlah baris akan lebih besar daripada jumlah order_id berbeda. Keduanya 11.247.", hint: "count(*) dan count(distinct order_id)" },
    { id: "model-01-07", kind: "sql", prompt: "Untuk pelanggan nomor 1 sampai 10, tampilkan <code>customer_id</code>, <code>full_name</code>, nama kota, dan provinsi tempat tinggalnya.",
      solution: "select c.customer_id, c.full_name, ci.city_name, ci.province from app.customers c join app.cities ci on ci.city_id = c.city_id where c.customer_id <= 10",
      why: "Nama kota dan provinsi tidak disimpan di app.customers (supaya memenuhi 3NF). Keduanya diambil dari app.cities lewat city_id.", hint: "join app.cities on city_id" },
    { id: "model-01-08", kind: "sql", prompt: "Untuk pelanggan nomor 1 sampai 10, tampilkan <code>customer_id</code>, <code>full_name</code>, dan jumlah pesanannya.",
      solution: "select c.customer_id, c.full_name, count(o.order_id) as jumlah_pesanan from app.customers c join app.orders o on o.customer_id = c.customer_id where c.customer_id <= 10 group by c.customer_id, c.full_name",
      why: "Satu pelanggan bisa punya banyak pesanan (relasi satu-ke-banyak), jadi pesanannya digabung lalu dihitung per pelanggan. Pelanggan nomor 3, misalnya, punya 21 pesanan.", hint: "join app.orders, lalu group by customer_id dan full_name." },
    { id: "model-01-09", kind: "sql", prompt: "Tampilkan <code>order_id</code> dan jumlah pembayaran untuk setiap pesanan yang punya lebih dari satu pembayaran di <code>app.payments</code>.",
      solution: "select order_id, count(*) as jumlah_pembayaran from app.payments group by order_id having count(*) > 1",
      why: "Ini bukti bahwa relasi pesanan ke pembayaran satu-ke-banyak: ada 227 pesanan dengan dua pembayaran.", hint: "group by order_id, lalu saring kelompoknya dengan having." },
    { id: "model-01-10", kind: "sql", prompt: "Dari <code>raw.supplier_price_upload</code>, tampilkan nama pemasok yang sudah dirapikan (spasi di awal dan akhir dibuang, lalu diubah ke huruf besar semua) dan jumlah baris untuk setiap nama itu.",
      solution: "select upper(trim(supplier)) as pemasok, count(*) as baris from raw.supplier_price_upload group by upper(trim(supplier))",
      why: "Ini langkah dari lapisan raw ke staging. Lima tulisan berbeda menjadi tiga nama setelah TRIM dan UPPER.", hint: "Kelompokkan berdasarkan upper(trim(supplier)), bukan berdasarkan supplier." },
    { id: "model-01-11", kind: "sql", level: "menengah", setup: SETUP_LEBAR, prompt: "Tabel tiruan <code>latihan.pesanan_lebar</code> (dibuat otomatis untuk soal ini, sama dengan contoh di bagian normalisasi) menyimpan kota dan provinsi pelanggan di setiap pesanan. Tampilkan <code>order_id</code>, <code>kota</code>, <code>provinsi</code>, dan provinsi menurut <code>app.cities</code>, untuk baris yang provinsinya tidak sama dengan provinsi kota itu di <code>app.cities</code>.",
      solution: "select p.order_id, p.kota, p.provinsi, ci.province from latihan.pesanan_lebar p join app.cities ci on ci.city_name = p.kota where p.provinsi <> ci.province",
      why: "Gabungkan tabel lebar dengan tabel acuannya lewat nama kota, lalu cari yang provinsinya berbeda. Hasilnya pesanan 110744: Medan tercatat di Sumatera Selatan.", hint: "join app.cities on ci.city_name = p.kota, lalu where p.provinsi <> ci.province" },
    { id: "model-01-12", kind: "fix", setup: SETUP_LEBAR, prompt: "Query ini mencari pelanggan di <code>latihan.pesanan_lebar</code> yang tercatat di lebih dari satu kota. Hasilnya memuat Indah Pane, padahal kota Indah Pane tidak pernah diubah. Perbaiki supaya hasilnya berisi kolom <code>customer_id</code>, <code>nama_pelanggan</code>, dan <code>jumlah_kota</code>.",
      start: "select nama_pelanggan, count(distinct kota) as jumlah_kota\nfrom latihan.pesanan_lebar\ngroup by nama_pelanggan\nhaving count(distinct kota) > 1;",
      solution: "select customer_id, nama_pelanggan, count(distinct kota) as jumlah_kota from latihan.pesanan_lebar group by customer_id, nama_pelanggan having count(distinct kota) > 1",
      why: "Pelanggan nomor 6 dan 10 sama-sama bernama Indah Pane, tinggal di Malang dan Bandung. Mengelompokkan berdasarkan nama menggabungkan dua orang berbeda. Kelompokkan berdasarkan kunci, yaitu customer_id.", hint: "Apakah nama bisa membedakan dua pelanggan?" },
    { id: "model-01-13", kind: "number", setup: SETUP_LEBAR, prompt: "Pelanggan nomor 9 pindah kota. Berapa baris di <code>latihan.pesanan_lebar</code> yang harus diubah supaya datanya tetap konsisten? (Di <code>app.customers</code>, cukup satu baris.)",
      answerSql: "select count(*) from latihan.pesanan_lebar where customer_id = 9",
      why: "select count(*) from latihan.pesanan_lebar where customer_id = 9. Setiap pesanan membawa salinan kota, jadi semua 25 barisnya harus diubah.", hint: "Hitung baris milik pelanggan nomor 9." },
    { id: "model-01-14", kind: "number", prompt: "Berapa pelanggan di <code>app.customers</code> yang tidak punya satu pun pesanan di <code>app.orders</code>?",
      answerSql: "select count(*) from app.customers c left join app.orders o on o.customer_id = c.customer_id where o.order_id is null",
      why: "select count(*) from app.customers c left join app.orders o on o.customer_id = c.customer_id where o.order_id is null. LEFT JOIN mempertahankan semua pelanggan; yang tidak punya pasangan pesanan mendapat order_id NULL.", hint: "left join app.orders, lalu cari yang order_id-nya NULL." },
    { id: "model-01-15", kind: "explain", prompt: "Jelaskan dengan kalimatmu sendiri relasi antara <code>app.orders</code>, <code>app.order_items</code>, <code>app.payments</code>, dan <code>app.shipments</code>: kolom apa yang menghubungkannya, dan apakah relasinya satu-ke-satu atau satu-ke-banyak? Sebutkan query yang bisa membuktikannya.",
      model: "Keempat tabel terhubung lewat order_id. Satu pesanan punya satu atau lebih baris di app.order_items (satu-ke-banyak, kuncinya order_id dan line_no). Satu pesanan bisa punya nol, satu, atau dua pembayaran di app.payments (satu-ke-banyak). Satu pesanan punya paling banyak satu baris di app.shipments, karena order_id adalah kunci utama di sana (satu-ke-satu, dan pesanan yang dibatalkan atau belum dikirim tidak punya baris). Buktinya: count(*) dibanding count(distinct order_id) di setiap tabel, atau group by order_id having count(*) > 1.",
      hint: "Lihat diagram ER dan kunci utama setiap tabel." },
    { id: "model-01-16", kind: "explain", level: "wawancara", prompt: "Pertanyaan wawancara: apa beda OLTP dan OLAP, dan kenapa perusahaan memisahkan gudang data dari database aplikasi?",
      model: "OLTP melayani aplikasi: banyak perintah kecil yang menambah, mengubah, atau membaca sedikit baris, harus cepat, dan menyimpan keadaan terbaru dalam tabel yang ternormalisasi. OLAP melayani analisis: query yang membaca dan meringkas banyak baris, sering memakai riwayat bertahun-tahun. Gudang data dipisahkan karena query analisis yang berat bisa memperlambat aplikasi, karena data perlu digabung dari banyak sumber dan dirapikan, dan karena database aplikasi menimpa nilai lama sehingga riwayatnya hilang.",
      hint: "Bandingkan pemakai, bentuk perintah, dan data yang disimpan." },
  ],
};
