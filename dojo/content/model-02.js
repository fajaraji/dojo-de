// Bab 2 Data Modeling: desain dimensional menurut metode Kimball.
// STAR membuat contoh star schema kecil dari data app.* di skema contoh (hanya hidup selama satu latihan).
const STAR = `create schema contoh;
create table contoh.dim_product as
select p.product_id, p.sku, p.product_name, p.brand,
       c.category_name, pc.category_name as parent_category_name
from app.products p
join app.categories c on c.category_id = p.category_id
join app.categories pc on pc.category_id = c.parent_id;
create table contoh.dim_customer as
select cu.customer_id, cu.full_name, cu.segment, ci.city_name, ci.province, ci.island, cu.signup_date
from app.customers cu
join app.cities ci on ci.city_id = cu.city_id;
create table contoh.fact_sales as
select oi.order_id, oi.line_no, o.order_ts::date as order_date, o.customer_id, oi.product_id,
       oi.qty, oi.qty * oi.unit_price as gross_amount, oi.discount,
       oi.qty * oi.unit_price - oi.discount as net_amount
from app.order_items oi
join app.orders o on o.order_id = oi.order_id;
create table contoh.fact_payment as
select pa.payment_id, pa.order_id, pa.paid_ts::date as paid_date, o.customer_id, pa.method, pa.status, pa.amount
from app.payments pa
join app.orders o on o.order_id = pa.order_id;`;

// SNOW: produk dan kategori dipecah menjadi dua tabel dimensi (bentuk snowflake).
const SNOW = `${STAR}
create table contoh.dim_category as
select category_id, category_name, parent_id from app.categories;
create table contoh.dim_product_snow as
select product_id, sku, product_name, brand, category_id from app.products;`;

export default {
  id: "model-02",
  part: "model",
  title: "Desain dimensional (Kimball)",
  minutes: 90,
  goals: [
    "Menjalankan empat langkah desain dimensional: pilih proses bisnis, tentukan grain, tentukan dimensi, tentukan fakta.",
    "Membedakan tabel fakta dan tabel dimensi, lalu membaca star schema dan snowflake schema.",
    "Mengenali measure additive, semi-additive, dan non-additive, dan menghitung measure non-additive dengan benar.",
    "Memilih jenis tabel fakta yang cocok: transaction, periodic snapshot, accumulating snapshot, atau factless.",
    "Membaca bus matrix dan menjelaskan kegunaan conformed dimension.",
  ],
  terms: [
    { term: "star schema", def: "Susunan tabel dengan satu tabel fakta di tengah dan beberapa tabel dimensi di sekelilingnya. Setiap tabel dimensi terhubung langsung ke tabel fakta lewat satu kunci." },
    { term: "tabel fakta", def: "Tabel yang mencatat kejadian satu proses bisnis pada satu grain. Isinya kunci ke tabel dimensi dan kolom angka (measure)." },
    { term: "tabel dimensi", def: "Tabel yang berisi keterangan satu dimensi, misalnya produk atau pelanggan: satu baris per anggota, dengan banyak kolom teks untuk menyaring, mengelompokkan, dan memberi label." },
    { term: "desain dimensional", def: "Cara menyusun tabel di gudang data atau data mart menjadi tabel fakta dan tabel dimensi, supaya mudah ditanya dan diringkas. Rujukan yang banyak dipakai adalah buku Ralph Kimball, <i>The Data Warehouse Toolkit</i>." },
    { term: "proses bisnis", def: "Kegiatan rutin organisasi yang menghasilkan kejadian yang bisa diukur, misalnya menerima pesanan, menerima pembayaran, atau mengirim barang." },
    { term: "grain", def: "Arti tepat satu baris di sebuah tabel atau hasil query. Di desain dimensional, semua baris satu tabel fakta harus punya grain yang sama; di bab ini grain ditetapkan sebelum kolomnya dipilih." },
    { term: "dimensi", def: "Konteks sebuah kejadian: siapa, apa, di mana, dan kapan. Contohnya pelanggan, produk, dan tanggal." },
    { term: "measure", def: "Angka hasil pengukuran sebuah kejadian, disimpan di tabel fakta. Disebut juga fakta. Contohnya jumlah barang dan nilai bersih." },
    { term: "additive", def: "Measure yang boleh dijumlah menurut dimensi apa pun, misalnya jumlah barang terjual." },
    { term: "semi-additive", def: "Measure yang boleh dijumlah menurut sebagian dimensi saja, misalnya tidak boleh dijumlah antar periode waktu. Contohnya jumlah pelanggan pada tanggal potret, saldo, atau stok." },
    { term: "non-additive", def: "Measure yang tidak boleh dijumlah sama sekali, misalnya persentase, rasio, rata-rata, harga satuan, dan jumlah pelanggan unik." },
    { term: "snowflake schema", def: "Bentuk star schema yang tabel dimensinya dinormalisasi menjadi beberapa tabel, misalnya produk, lalu kategori, lalu kategori induk. Query butuh lebih banyak JOIN." },
    { term: "transaction fact table", def: "Tabel fakta dengan satu baris per kejadian, misalnya satu baris per produk di satu pesanan. Baris dicatat sekali saat kejadian terjadi." },
    { term: "periodic snapshot", def: "Tabel fakta dengan satu baris per anggota per periode tetap (hari, bulan), berisi keadaan pada akhir periode itu, misalnya stok per produk per akhir hari." },
    { term: "accumulating snapshot", def: "Tabel fakta dengan satu baris per perjalanan sebuah proses yang punya awal dan akhir jelas, misalnya satu pesanan dari dibuat sampai diterima. Punya beberapa kolom tanggal tahap, dan barisnya diperbarui setiap kali tahap berikutnya terjadi." },
    { term: "factless fact table", def: "Tabel fakta tanpa kolom angka. Setiap baris hanya mencatat bahwa sebuah kejadian terjadi; ringkasannya dihitung dengan COUNT." },
    { term: "conformed dimension", def: "Tabel dimensi yang sama (kunci, kolom, dan isinya sama) yang dipakai oleh beberapa tabel fakta, sehingga hasil dari tabel-tabel fakta itu bisa dibandingkan berdampingan." },
    { term: "bus matrix", def: "Tabel perencanaan gudang data: setiap baris adalah satu proses bisnis, setiap kolom adalah satu dimensi, dan tanda X menunjukkan dimensi yang dipakai proses itu." },
  ],
  introduces: [],
  sections: [
    {
      title: "Desain dimensional dan empat langkahnya",
      html: `<p>Di bab sebelumnya kamu melihat bahwa tabel aplikasi (OLTP) dinormalisasi supaya penyimpanan dan perubahan data aman. Untuk analisis (OLAP), susunan itu merepotkan: satu pertanyaan sederhana bisa butuh lima JOIN. <b>Desain dimensional</b> adalah cara menyusun tabel di gudang data atau data mart supaya mudah ditanya dan diringkas. Rujukan yang banyak dipakai adalah buku <i>The Data Warehouse Toolkit</i> karya Ralph Kimball; dokumentasi desain dimensional Microsoft Fabric juga merujuk ke buku ini.</p>
<p>Desain dimensional hanya memakai dua jenis tabel:</p>
<ul><li><b>Tabel fakta</b>: mencatat kejadian beserta angkanya, misalnya "pesanan 100001 berisi 1 buah produk nomor 74 senilai Rp 31.900".</li>
<li><b>Tabel dimensi</b>: berisi keterangan kejadian itu, misalnya nama produk, kategori, kota pelanggan.</li></ul>
<p>Bab ini menyusun desain dalam empat langkah, selalu dengan urutan ini:</p>
<ol><li>Pilih <b>proses bisnis</b> yang mau dianalisis.</li>
<li>Tentukan <b>grain</b>: satu baris tabel fakta mewakili apa.</li>
<li>Tentukan <b>dimensi</b>: keterangan apa yang menempel pada setiap baris.</li>
<li>Tentukan <b>fakta</b>: angka apa yang diukur di setiap baris.</li></ol>`,
    },
    {
      title: "Proses bisnis",
      html: `<p><b>Proses bisnis</b> adalah kegiatan rutin organisasi yang menghasilkan kejadian yang bisa diukur. Desain dimulai dari proses, bukan dari laporan yang diminta atau dari tabel yang tersedia. Satu proses bisnis biasanya menjadi satu tabel fakta.</p>
<p>Proses bisnis TokoKita dan tabel aplikasi yang mencatatnya:</p>
<div class="tw"><table class="t"><tr><th>Proses bisnis</th><th>Kejadian</th><th>Tabel sumber</th></tr>
<tr><td>Pemesanan</td><td>pelanggan memesan produk</td><td><code>app.orders</code>, <code>app.order_items</code></td></tr>
<tr><td>Pembayaran</td><td>uang diterima atau dikembalikan</td><td><code>app.payments</code></td></tr>
<tr><td>Pengiriman</td><td>barang diserahkan ke kurir, lalu diterima</td><td><code>app.shipments</code></td></tr>
<tr><td>Pengembalian</td><td>pelanggan mengembalikan barang</td><td><code>app.returns</code></td></tr>
<tr><td>Aktivitas di situs</td><td>pelanggan melihat halaman, mencari, memasukkan barang ke keranjang, <i>checkout</i> (mulai menyelesaikan belanja), dan membeli</td><td><code>raw.web_events</code></td></tr></table></div>`,
    },
    {
      title: "Grain: tetapkan sebelum memilih kolom",
      html: `<p>Kamu sudah mengenal <b>grain</b> di bab agregasi: arti tepat satu baris. Di bab ini, grain tabel fakta ditulis sebagai kalimat <i>sebelum</i> kolom apa pun dipilih, misalnya "1 baris = 1 produk di dalam 1 pesanan". Semua kolom yang masuk harus cocok dengan kalimat itu.</p>
<p>Pilih grain paling rinci yang dicatat sistem sumber. Dokumentasi Microsoft Fabric menyebut tabel fakta transaksi biasanya menyimpan fakta pada tingkat paling rinci yang mungkin. Dari data yang rinci, ringkasan apa pun bisa dibuat: per hari, per kota, per merek. Dari data yang sudah diringkas per bulan, rincian per hari tidak bisa dikembalikan.</p>
<p>Kesalahan umum adalah mencampur dua grain di satu tabel. Ongkos kirim (<code>shipping_fee</code>) dicatat per pesanan, sedangkan isi pesanan dicatat per produk. Kalau ongkos kirim ditempel ke setiap baris produk, nilainya terulang sebanyak jumlah produk di pesanan itu, persis seperti baris berlipat di bab JOIN.</p>`,
      examples: [
        { sql: "select sum(shipping_fee) as ongkir_grain_pesanan\nfrom app.orders;", note: "Total ongkos kirim yang benar: Rp 151.132.000, dihitung di grain pesanan." },
        { sql: "select sum(o.shipping_fee) as ongkir_grain_produk\nfrom app.orders o\njoin app.order_items oi on oi.order_id = o.order_id;", note: "Setelah digabung dengan isi pesanan, hasilnya Rp 358.691.000, lebih dari dua kali lipat. Ongkos kirim tidak cocok dengan grain \"1 baris = 1 produk di 1 pesanan\"." },
      ],
    },
    {
      title: "Tabel fakta dan measure",
      html: `<p><b>Tabel fakta</b> mencatat kejadian satu proses bisnis pada satu grain. Kolomnya dua macam: kunci yang merujuk ke tabel dimensi, dan <b>measure</b> (disebut juga fakta), yaitu angka hasil pengukuran kejadian.</p>
<p>Contoh di bab ini memakai tabel buatan di skema <code>contoh</code>, dibuat dari data <code>app.*</code> sebelum query-mu dijalankan. Awalan nama <code>fact_</code> menandai tabel fakta dan <code>dim_</code> menandai tabel dimensi; ini kebiasaan umum, bukan aturan PostgreSQL.</p>
<p><code>contoh.fact_sales</code> berisi proses pemesanan dengan grain "1 baris = 1 produk di 1 pesanan", 28.495 baris, sama dengan <code>app.order_items</code>. Kolomnya:</p>
<ul><li>Kunci dimensi: <code>customer_id</code> dan <code>product_id</code>, ditambah <code>order_date</code> (tanggal pesanan).</li>
<li><code>order_id</code> dan <code>line_no</code>: nomor pesanan dan nomor baris, supaya setiap baris bisa dilacak ke pesanan asalnya.</li>
<li>Measure: <code>qty</code> (jumlah barang), <code>gross_amount</code> (nilai kotor, qty × harga satuan), <code>discount</code> (potongan), dan <code>net_amount</code> (nilai bersih, nilai kotor dikurangi potongan).</li></ul>
<p>Tabel ini berisi semua pesanan, termasuk yang dibatalkan, karena proses yang dicatat adalah pemesanan.</p>`,
      examples: [{ setup: STAR, sql: "select *\nfrom contoh.fact_sales\norder by order_id, line_no\nlimit 5;", note: "Tidak ada nama produk atau nama pelanggan di sini. Tabel fakta hanya menyimpan kunci dan angka; keterangannya ada di tabel dimensi." }],
    },
    {
      title: "Tabel dimensi",
      html: `<p><b>Dimensi</b> adalah konteks sebuah kejadian: siapa (pelanggan), apa (produk), di mana (kota), dan kapan (tanggal). <b>Tabel dimensi</b> menyimpan keterangan satu dimensi, satu baris per anggota. Kolomnya kebanyakan teks yang dipakai untuk menyaring, mengelompokkan, dan memberi label di laporan.</p>
<p>Berbeda dengan tabel aplikasi, tabel dimensi sengaja <i>tidak</i> dinormalisasi. <code>contoh.dim_product</code> langsung menyimpan nama kategori (<code>category_name</code>) dan nama kategori satu tingkat di atasnya (<code>parent_category_name</code>), walaupun nama yang sama terulang di banyak produk. Di TokoKita, pengulangan ini murah, karena tabel dimensinya kecil dibanding tabel fakta: 150 produk lawan 28.495 baris fakta.</p>
<p><code>contoh.dim_customer</code> menyimpan nama (<code>full_name</code>), segmen (<code>segment</code>), kota (<code>city_name</code>), provinsi (<code>province</code>), pulau (<code>island</code>), dan tanggal daftar (<code>signup_date</code>) setiap pelanggan, dengan kunci <code>customer_id</code>. Isinya diambil dari <code>app.customers</code>, jadi segmen dan kotanya adalah keadaan terbaru, bukan keadaan saat pesanan dibuat.</p>`,
      examples: [{ setup: STAR, sql: "select *\nfrom contoh.dim_product\norder by product_id\nlimit 5;", note: "Satu baris per produk, lengkap dengan nama kategori dan kategori induknya." }],
    },
    {
      title: "Star schema",
      html: `<p><b>Star schema</b> adalah susunan satu tabel fakta di tengah dengan tabel dimensi di sekelilingnya. Setiap tabel dimensi terhubung langsung ke tabel fakta lewat satu kunci, sehingga gambarnya mirip bintang. Pola query-nya selalu sama: FROM tabel fakta, JOIN dimensi yang dibutuhkan, GROUP BY kolom dimensi, lalu SUM measure.</p>
<p>Agar JOIN tidak membuat baris berlipat, kunci di tabel dimensi harus unik: satu <code>product_id</code> hanya punya satu baris di <code>dim_product</code>. Kalau kuncinya dobel, setiap baris fakta ikut terhitung dua kali.</p>`,
      examples: [{ setup: STAR, sql: "select p.parent_category_name, c.island,\n       sum(f.qty) as barang,\n       sum(f.net_amount) as nilai_bersih\nfrom contoh.fact_sales f\njoin contoh.dim_product p on p.product_id = f.product_id\njoin contoh.dim_customer c on c.customer_id = f.customer_id\ngroup by p.parent_category_name, c.island\norder by nilai_bersih desc\nlimit 10;", note: "Dua dimensi, dua JOIN, dan setiap JOIN langsung ke tabel fakta." }],
    },
    {
      title: "Snowflake schema",
      html: `<p><b>Snowflake schema</b> adalah star schema yang tabel dimensinya dinormalisasi. Produk tidak lagi menyimpan nama kategori; produk merujuk ke tabel kategori, dan kategori merujuk ke kategori induknya. Contoh di bawah memakai <code>contoh.dim_product_snow</code> dan <code>contoh.dim_category</code>, yang dibuat dengan cara ini.</p>
<p>Hasilnya sama dengan versi star, tetapi butuh tiga JOIN untuk satu dimensi. Dokumentasi Microsoft Fabric menyarankan star schema dan menyebut snowflake sebagai pengecualian, misalnya untuk dimensi yang sangat besar sehingga biaya penyimpanan lebih penting daripada kecepatan query. Dimensi produk TokoKita hanya 150 baris, jadi bentuk star lebih cocok.</p>`,
      examples: [{ setup: SNOW, sql: "select pc.category_name as parent_category_name,\n       sum(f.net_amount) as nilai_bersih\nfrom contoh.fact_sales f\njoin contoh.dim_product_snow p on p.product_id = f.product_id\njoin contoh.dim_category c on c.category_id = p.category_id\njoin contoh.dim_category pc on pc.category_id = c.parent_id\ngroup by pc.category_name\norder by nilai_bersih desc;", note: "Tabel dim_category di-JOIN dua kali dengan alias berbeda: sekali sebagai kategori, sekali sebagai kategori induk." }],
    },
    {
      title: "Tiga sifat measure",
      html: `<p>Sebelum menjumlah sebuah measure, cek dulu sifatnya:</p>
<ul><li><b>Additive</b>: boleh dijumlah menurut dimensi apa pun. <code>qty</code> dan <code>net_amount</code> additive. Total nilai bersih per kategori induk, kalau dijumlah, sama dengan total keseluruhan (Rp 5.782.717.000), dan begitu juga total per pulau.</li>
<li><b>Semi-additive</b>: boleh dijumlah menurut sebagian dimensi saja. Contohnya saldo rekening, stok gudang, atau jumlah pelanggan pada tanggal potret: boleh dijumlah antar segmen pada satu tanggal, tetapi tidak antar tanggal.</li>
<li><b>Non-additive</b>: tidak boleh dijumlah sama sekali. Contohnya persentase, rasio, rata-rata, harga satuan, dan jumlah pelanggan unik.</li></ul>
<p>Untuk measure non-additive, dokumentasi Microsoft Fabric menyarankan menyimpan komponennya, misalnya potongan dalam rupiah, bukan persen diskonnya. Jadi simpan komponen yang additive (pembilang dan penyebut) di tabel fakta, lalu hitung rasionya di langkah terakhir, setelah dijumlah.</p>`,
    },
    {
      title: "Non-additive: persentase dan rata-rata",
      html: `<p>Persen diskon per baris adalah <code>discount / (qty * unit_price) * 100</code>. Merata-ratakan persen itu memberi bobot yang sama untuk baris bernilai kotor Rp 12.900 (yang terkecil) dan baris bernilai Rp 3.219.500 (yang terbesar). Persen diskon yang benar adalah total potongan dibagi total nilai kotor. Hasil contoh pertama: rata-rata persen 1,40, sedangkan persen sebenarnya 1,29.</p>
<p>Rata-rata juga tidak boleh dirata-ratakan lagi. Contoh kedua menghitung nilai rata-rata per pesanan (total nilai bersih dibagi jumlah pesanan) per <code>channel</code> (tempat pesanan dibuat: web, android, ios). Rata-rata dari tiga angka itu Rp 483.301,54. Nilai rata-rata per pesanan yang benar untuk semua channel adalah Rp 481.612,14, karena jumlah pesanan setiap channel berbeda: 5.426 android, 2.361 ios, dan 4.220 web.</p>
<p>Perhatikan juga <code>count(distinct o.order_id)</code>. Setelah JOIN ke isi pesanan, satu pesanan muncul di beberapa baris, jadi COUNT(*) akan menghitung baris produk, bukan pesanan.</p>`,
      examples: [
        { sql: "select round(avg(discount / (qty * unit_price) * 100), 2) as rata_rata_persen,\n       round(sum(discount) / sum(qty * unit_price) * 100, 2) as persen_sebenarnya\nfrom app.order_items;", note: "Kolom kedua menjumlah dulu, baru membagi." },
        { sql: "select o.channel,\n       count(distinct o.order_id) as pesanan,\n       round(sum(oi.qty * oi.unit_price - oi.discount) / count(distinct o.order_id), 2) as rata_rata_per_pesanan\nfrom app.orders o\njoin app.order_items oi on oi.order_id = o.order_id\ngroup by o.channel\norder by o.channel;", note: "Untuk angka semua channel, hapus kolom channel dan GROUP BY; jangan merata-ratakan tiga angka di kolom terakhir." },
      ],
    },
    {
      title: "Non-additive: pelanggan unik",
      html: `<p>Jumlah pelanggan unik per bulan tidak boleh dijumlah untuk mendapat jumlah pelanggan unik setahun. Pelanggan yang belanja di bulan Januari dan Maret terhitung sekali di setiap bulan, tetapi hanya satu orang.</p>
<p>Contoh kedua membuktikannya dalam satu query. Teks <code>customer_id || '-' || to_char(order_ts, 'YYYY-MM')</code> unik untuk setiap pasangan pelanggan dan bulan, sehingga COUNT DISTINCT-nya sama dengan jumlah semua angka bulanan. Tanda <code>'-'</code> memisahkan dua bagian supaya pasangan yang berbeda tidak menghasilkan teks yang sama. Hasilnya untuk Januari–Oktober 2025: 4.314 kalau angka bulanan dijumlah, padahal pelanggan uniknya 1.352.</p>`,
      examples: [
        { sql: "select date_trunc('month', order_ts)::date as bulan,\n       count(distinct customer_id) as pelanggan\nfrom app.orders\nwhere order_ts >= '2025-01-01'\ngroup by date_trunc('month', order_ts)\norder by bulan;", note: "Sepuluh angka bulanan. Jumlahnya 4.314." },
        { sql: "select count(distinct customer_id::text || '-' || to_char(order_ts, 'YYYY-MM')) as jumlah_angka_bulanan,\n       count(distinct customer_id) as pelanggan_unik\nfrom app.orders\nwhere order_ts >= '2025-01-01';", note: "Selisihnya 2.962: pelanggan yang belanja di lebih dari satu bulan terhitung berkali-kali di kolom pertama." },
      ],
    },
    {
      title: "Semi-additive: potret akhir bulan",
      html: `<p><code>raw.customer_snapshot</code> adalah potret data pelanggan setiap akhir bulan, Januari–Oktober 2025: satu baris per pelanggan per tanggal potret (<code>snapshot_date</code>). Jumlah pelanggan per tanggal potret adalah measure semi-additive:</p>
<ul><li>Di dalam satu tanggal potret, jumlah per segmen boleh dijumlah. Pada 31 Oktober 2025, jumlah semua segmen sama dengan total pelanggan saat itu, 1.500.</li>
<li>Antar tanggal potret, angkanya tidak boleh dijumlah. Tabel ini punya 13.782 baris, padahal pelanggan TokoKita hanya 1.500. Menjumlah pelanggan Gold di sepuluh potret menghasilkan 1.291, angka yang tidak berarti apa-apa.</li></ul>
<p>Untuk periode yang panjang, pakai angka potret terakhir (keadaan di akhir periode) atau rata-rata antar potret, sesuai pertanyaannya.</p>`,
      examples: [{ sql: "select snapshot_date,\n       count(*) as pelanggan,\n       count(*) filter (where segment = 'Gold') as gold\nfrom raw.customer_snapshot\ngroup by snapshot_date\norder by snapshot_date;", note: "Setiap baris hasil adalah keadaan pada satu akhir bulan. Baca per baris; jangan jumlahkan kolomnya." }],
    },
    {
      title: "Empat jenis tabel fakta",
      html: `<p>Dokumentasi Microsoft Fabric membagi tabel fakta menjadi tiga jenis menurut cara kejadiannya dicatat (transaction, periodic snapshot, accumulating snapshot), dan memberi nama khusus untuk tabel fakta tanpa measure (factless):</p>
<ul><li><b>Transaction fact table</b>: satu baris per kejadian, dicatat sekali saat kejadian terjadi. Contohnya <code>contoh.fact_sales</code> dan <code>contoh.fact_payment</code>. Jenis ini paling umum.</li>
<li><b>Periodic snapshot</b>: satu baris per anggota per periode tetap, berisi keadaan di akhir periode, ada atau tidak ada kejadian. Contohnya jumlah pelanggan per segmen per akhir bulan dari <code>raw.customer_snapshot</code>, atau stok per produk per akhir hari. Measure-nya sering semi-additive.</li>
<li><b>Accumulating snapshot</b>: satu baris per perjalanan proses yang punya awal dan akhir jelas, dengan satu kolom tanggal untuk setiap tahap. Barisnya diperbarui saat tahap berikutnya terjadi. Contohnya pesanan: dibuat, dikirim, diterima. Dari 12.007 pesanan, 760 belum punya baris pengiriman (dibatalkan atau belum dikirim) dan 49 masih di perjalanan, jadi kolom tahap mereka kosong.</li>
<li><b>Factless fact table</b>: tabel fakta tanpa kolom angka; setiap baris hanya mencatat bahwa kejadian terjadi. Contohnya <code>raw.web_events</code>, satu baris per aktivitas pelanggan. Ringkasannya dihitung dengan COUNT.</li></ul>`,
      examples: [
        { sql: "select o.order_id,\n       o.order_ts::date as tgl_pesan,\n       s.shipped_ts::date as tgl_kirim,\n       s.delivered_ts::date as tgl_terima,\n       s.shipped_ts::date - o.order_ts::date as hari_sampai_kirim,\n       s.delivered_ts::date - s.shipped_ts::date as hari_di_jalan\nfrom app.orders o\nleft join app.shipments s on s.order_id = o.order_id\nwhere o.order_id between 100001 and 100010\norder by o.order_id;", note: "Bentuk accumulating snapshot: satu baris per pesanan dengan kolom tanggal per tahap. Pesanan 100005 belum punya pengiriman, jadi tahapnya kosong." },
        { sql: "select event_type, count(*) as aktivitas\nfrom raw.web_events\ngroup by event_type\norder by aktivitas desc;", note: "Tidak ada kolom angka untuk dijumlah. Measure-nya adalah banyaknya baris." },
      ],
    },
    {
      title: "Conformed dimension dan bus matrix",
      html: `<p><b>Conformed dimension</b> adalah tabel dimensi yang sama (kunci, kolom, dan isinya sama) yang dipakai beberapa tabel fakta. <code>contoh.dim_customer</code> dipakai oleh <code>fact_sales</code> dan <code>fact_payment</code>. Karena labelnya sama persis, ringkasan per pulau dari dua tabel fakta itu bisa diletakkan berdampingan. Jangan menggabungkan dua tabel fakta langsung dengan JOIN: barisnya berlipat. Ringkas masing-masing per kolom dimensi yang sama, lalu bandingkan hasilnya.</p>
<p>Untuk merencanakan dimensi bersama, bab ini memakai <b>bus matrix</b>, tabel perencanaan untuk seluruh gudang data: baris = proses bisnis, kolom = dimensi, X = dimensi dipakai proses itu. Kolom yang punya banyak X adalah dimensi yang dipakai bersama, sehingga harus dibuat sebagai conformed dimension. Bus matrix TokoKita:</p>
<div class="tw"><table class="t"><tr><th>Proses bisnis</th><th>Tanggal</th><th>Pelanggan</th><th>Produk</th><th>Cara bayar</th><th>Kurir</th></tr>
<tr><td>Pemesanan</td><td>X</td><td>X</td><td>X</td><td></td><td></td></tr>
<tr><td>Pembayaran</td><td>X</td><td>X</td><td></td><td>X</td><td></td></tr>
<tr><td>Pengiriman</td><td>X</td><td>X</td><td></td><td></td><td>X</td></tr>
<tr><td>Pengembalian</td><td>X</td><td>X</td><td>X</td><td></td><td></td></tr>
<tr><td>Aktivitas di situs</td><td>X</td><td>X</td><td>X*</td><td></td><td></td></tr></table></div>
<p>* Hanya untuk aktivitas di halaman produk; kolom <code>page</code> berisi kode produk, misalnya <code>/produk/TK-10959</code>. Pembayaran dan pengiriman mendapat pelanggan lewat pesanannya. Pengiriman tidak punya kolom produk, karena grain-nya satu baris per pesanan.</p>`,
      examples: [{ setup: STAR, sql: "select c.island,\n       sum(f.amount) as uang_diterima\nfrom contoh.fact_payment f\njoin contoh.dim_customer c on c.customer_id = f.customer_id\nwhere f.status = 'success'\ngroup by c.island\norder by uang_diterima desc;", note: "Label pulau di sini sama dengan label pulau di ringkasan fact_sales, karena keduanya memakai dim_customer yang sama." }],
    },
  ],
  tsql: [
    { pg: "avg(qty)", tsql: "avg(cast(qty as decimal(12,2)))", note: "Di PostgreSQL, AVG kolom integer menghasilkan numeric (ada angka di belakang koma). Di SQL Server, AVG kolom int menghasilkan int, sehingga angka di belakang koma terbuang. Ubah dulu ke decimal." },
    { pg: "sum(discount) / sum(qty * unit_price)", tsql: "sum(discount) / sum(qty * unit_price)", note: "Sama. Di kedua dialek, bilangan bulat dibagi bilangan bulat membuang angka di belakang koma. Kolom di sini bertipe numeric/decimal, jadi aman." },
    { pg: "count(distinct customer_id::text || '-' || to_char(order_ts, 'YYYY-MM'))", tsql: "count(distinct concat(customer_id, '-', year(order_ts), '-', month(order_ts)))", note: "Di kedua dialek COUNT(DISTINCT …) menerima satu ekspresi, jadi beberapa kolom digabung dulu menjadi teks. CONCAT di SQL Server mengubah angka menjadi teks secara otomatis." },
    { pg: "date_trunc('month', order_ts)", tsql: "datetrunc(month, order_ts)", note: "DATETRUNC baru ada sejak SQL Server 2022." },
    { pg: "count(*)", tsql: "count_big(*)", note: "Di SQL Server, COUNT menghasilkan int dan gagal kalau hasilnya lebih dari 2.147.483.647; COUNT_BIG menghasilkan bigint. Tabel fakta besar bisa melewati batas itu. Di PostgreSQL, COUNT sudah menghasilkan bigint." },
  ],
  summary: [
    "Empat langkah desain: pilih proses bisnis, tentukan grain, tentukan dimensi, tentukan fakta.",
    "Tetapkan grain sebagai kalimat sebelum memilih kolom, dan pilih grain paling rinci. Jangan mencampur dua grain di satu tabel fakta.",
    "Tabel fakta berisi kunci dan measure; tabel dimensi berisi keterangan teks dan sengaja tidak dinormalisasi.",
    "Star schema: setiap dimensi langsung terhubung ke tabel fakta. Snowflake: dimensi dipecah, sehingga JOIN bertambah.",
    "Measure additive boleh dijumlah; semi-additive hanya boleh dijumlah menurut sebagian dimensi (misalnya tidak antar waktu); non-additive (persen, rata-rata, pelanggan unik) dihitung ulang dari komponennya.",
    "Tiga jenis tabel fakta: transaction, periodic snapshot, dan accumulating snapshot. Tabel fakta tanpa measure disebut factless fact table.",
    "Conformed dimension membuat hasil beberapa tabel fakta bisa dibandingkan; bus matrix memetakan proses bisnis ke dimensinya.",
  ],
  drills: [
    { id: "model-02-01", kind: "choice", prompt: "Tim penjualan ingin tahu jumlah barang terjual per produk per hari. Bulan depan mereka mungkin minta per kota dan per segmen pelanggan juga. Grain mana yang paling aman untuk tabel fakta pemesanan?",
      options: ["1 baris = 1 produk per hari", "1 baris = 1 produk di dalam 1 pesanan", "1 baris = 1 hari", "1 baris = 1 produk per bulan per kota"], answer: 1,
      why: "Grain paling rinci (1 produk di 1 pesanan) bisa diringkas menjadi per hari, per kota, atau per segmen. Grain yang sudah diringkas tidak bisa dipecah lagi.", hint: "Pilih grain yang bisa diringkas ke bentuk apa pun." },
    { id: "model-02-02", kind: "choice", prompt: "Gudang mencatat jumlah stok setiap produk di setiap gudang setiap akhir hari. Jenis tabel fakta apa yang cocok?",
      options: ["Transaction fact table", "Periodic snapshot", "Accumulating snapshot", "Factless fact table"], answer: 1,
      why: "Satu baris per produk per gudang per hari tetap, berisi keadaan di akhir periode: itu periodic snapshot.", hint: "Baris dibuat setiap periode, ada atau tidak ada kejadian." },
    { id: "model-02-03", kind: "choice", prompt: "Mana measure yang <b>non-additive</b>?",
      options: ["Jumlah barang (<code>qty</code>)", "Nilai bersih (<code>net_amount</code>)", "Persen diskon per baris", "Potongan harga dalam rupiah (<code>discount</code>)"], answer: 2,
      why: "Persentase tidak bisa dijumlah atau dirata-ratakan begitu saja. Hitung ulang dari komponennya: sum(discount) / sum(gross_amount).", hint: "Mana yang berupa rasio?" },
    { id: "model-02-04", kind: "choice", prompt: "Laporan menunjukkan jumlah pelanggan Gold pada setiap akhir bulan. Measure ini termasuk jenis apa?",
      options: ["Additive", "Semi-additive", "Non-additive", "Bukan measure"], answer: 1,
      why: "Di satu akhir bulan, jumlah per kota atau per segmen boleh dijumlah. Antar bulan tidak boleh: pelanggan yang sama terhitung lagi di setiap potret.", hint: "Boleh dijumlah per kota, tapi bagaimana antar bulan?" },
    { id: "model-02-05", kind: "sql", setup: STAR, prompt: "Dengan star schema di skema <code>contoh</code>, tampilkan setiap kategori induk (<code>parent_category_name</code> dari <code>contoh.dim_product</code>) dan total nilai bersih (<code>net_amount</code> dari <code>contoh.fact_sales</code>).",
      solution: "select p.parent_category_name, sum(f.net_amount) as nilai_bersih from contoh.fact_sales f join contoh.dim_product p on p.product_id = f.product_id group by p.parent_category_name",
      why: "Pola star schema: FROM tabel fakta, JOIN dimensi lewat kuncinya, GROUP BY kolom dimensi, SUM measure.", hint: "join contoh.dim_product p on p.product_id = f.product_id" },
    { id: "model-02-06", kind: "sql", setup: STAR, prompt: "Untuk pesanan tahun 2025 (<code>order_date</code> mulai 2025-01-01), tampilkan segmen pelanggan (<code>segment</code> dari <code>contoh.dim_customer</code>), kategori induk, dan total jumlah barang (<code>qty</code>).",
      solution: "select c.segment, p.parent_category_name, sum(f.qty) as barang from contoh.fact_sales f join contoh.dim_customer c on c.customer_id = f.customer_id join contoh.dim_product p on p.product_id = f.product_id where f.order_date >= '2025-01-01' group by c.segment, p.parent_category_name",
      why: "Dua dimensi berarti dua JOIN, keduanya langsung ke tabel fakta. Syarat tanggal memakai kolom order_date di tabel fakta.", hint: "Dua JOIN, lalu GROUP BY dua kolom dimensi." },
    { id: "model-02-07", kind: "sql", setup: STAR, prompt: "Tampilkan persen diskon yang benar per kategori induk: total <code>discount</code> dibagi total <code>gross_amount</code>, dikali 100, dibulatkan 2 digit.",
      solution: "select p.parent_category_name, round(sum(f.discount) / sum(f.gross_amount) * 100, 2) as persen_diskon from contoh.fact_sales f join contoh.dim_product p on p.product_id = f.product_id group by p.parent_category_name",
      why: "Persen diskon non-additive. Jumlahkan komponennya (discount dan gross_amount) dulu, baru bagi.", hint: "round(sum(…) / sum(…) * 100, 2)" },
    { id: "model-02-08", kind: "sql", ordered: true, prompt: "Dari <code>app.orders</code>, tampilkan bulan (tanggal 1 setiap bulan, bertipe date) dan jumlah pelanggan unik yang memesan di bulan itu, untuk Januari–Oktober 2025. Urutkan dari bulan paling awal.",
      solution: "select date_trunc('month', order_ts)::date as bulan, count(distinct customer_id) as pelanggan from app.orders where order_ts >= '2025-01-01' group by date_trunc('month', order_ts) order by bulan",
      why: "COUNT(DISTINCT customer_id) per bulan. Angka-angka ini non-additive: jangan dijumlah untuk mendapat angka setahun.", hint: "date_trunc('month', order_ts)::date dan count(distinct customer_id)" },
    { id: "model-02-09", kind: "sql", level: "menengah", prompt: "Buat bentuk accumulating snapshot untuk pesanan nomor 100001 sampai 100050: <code>order_id</code>, selisih tanggal kalender dari tanggal pesan ke tanggal kirim (<code>shipped_ts::date - order_ts::date</code>), dan selisih tanggal kalender dari tanggal kirim ke tanggal terima (<code>delivered_ts::date - shipped_ts::date</code>). Yang dihitung adalah selisih tanggal: kedua waktu diubah ke date dulu, lalu dikurangi, sehingga hasilnya bilangan bulat hari. Ini bukan lama dalam jam, jadi pesanan yang dikirim keesokan harinya bernilai 1 walaupun jaraknya kurang dari 24 jam. Pesanan yang belum dikirim tetap tampil dengan nilai kosong.",
      solution: "select o.order_id, s.shipped_ts::date - o.order_ts::date as hari_sampai_kirim, s.delivered_ts::date - s.shipped_ts::date as hari_di_jalan from app.orders o left join app.shipments s on s.order_id = o.order_id where o.order_id between 100001 and 100050",
      why: "Satu baris per pesanan, satu kolom per tahap. LEFT JOIN menjaga pesanan yang belum punya pengiriman; tahapnya menjadi NULL.", hint: "left join app.shipments, lalu kurangi tanggal (::date) setiap tahap." },
    { id: "model-02-10", kind: "sql", level: "menengah", ordered: true, prompt: "Dari <code>raw.customer_snapshot</code>, tampilkan <code>snapshot_date</code>, <code>segment</code>, dan jumlah pelanggan, untuk setiap kombinasi tanggal potret dan segmen. Urutkan menurut <code>snapshot_date</code>, lalu <code>segment</code>.",
      solution: "select snapshot_date, segment, count(*) as pelanggan from raw.customer_snapshot group by snapshot_date, segment order by snapshot_date, segment",
      why: "Ini periodic snapshot: satu baris per segmen per akhir bulan. Di dalam satu tanggal, angkanya boleh dijumlah antar segmen; antar tanggal tidak boleh.", hint: "group by snapshot_date, segment" },
    { id: "model-02-11", kind: "sql", level: "wawancara", prompt: "Pertanyaan wawancara: hitung nilai rata-rata per pesanan untuk setiap <code>channel</code>. Nilai pesanan adalah jumlah <code>qty * unit_price - discount</code> semua barisnya di <code>app.order_items</code>. Tampilkan <code>channel</code> dan nilai rata-rata, dibulatkan 2 digit.",
      solution: "select o.channel, round(sum(oi.qty * oi.unit_price - oi.discount) / count(distinct o.order_id), 2) as rata_rata_per_pesanan from app.orders o join app.order_items oi on oi.order_id = o.order_id group by o.channel",
      why: "AVG(qty * unit_price - discount) menghitung rata-rata per baris produk, bukan per pesanan. Yang benar: total nilai dibagi jumlah pesanan berbeda, count(distinct order_id).", hint: "Grain hasil JOIN adalah baris produk. Bagi dengan jumlah pesanan, bukan jumlah baris." },
    { id: "model-02-12", kind: "fix", prompt: "Query ini seharusnya menghitung total ongkos kirim per <code>channel</code>, tetapi hasilnya lebih dari dua kali lipat angka yang benar. Perbaiki.",
      start: "select o.channel, sum(o.shipping_fee) as total_ongkir\nfrom app.orders o\njoin app.order_items oi on oi.order_id = o.order_id\ngroup by o.channel;",
      solution: "select channel, sum(shipping_fee) as total_ongkir from app.orders group by channel",
      why: "Ongkos kirim dicatat per pesanan. Setelah JOIN ke isi pesanan, setiap ongkir terulang sebanyak jumlah produk. Hitung di grain pesanan saja, tanpa JOIN.", hint: "Grain shipping_fee apa? Apakah JOIN-nya dibutuhkan?" },
    { id: "model-02-13", kind: "number", prompt: "Untuk pesanan Januari–Oktober 2025, berapa selisih antara jumlah pelanggan unik per bulan yang dijumlahkan dan jumlah pelanggan unik sebenarnya di periode itu?",
      answerSql: "select count(distinct customer_id::text || '-' || to_char(order_ts, 'YYYY-MM')) - count(distinct customer_id) from app.orders where order_ts >= '2025-01-01'",
      why: "Pasangan pelanggan-bulan berjumlah 4.314, pelanggan unik 1.352, selisihnya 2.962. Query: select count(distinct customer_id::text || '-' || to_char(order_ts, 'YYYY-MM')) - count(distinct customer_id) from app.orders where order_ts >= '2025-01-01'.", hint: "Lihat contoh di bagian pelanggan unik." },
    { id: "model-02-14", kind: "explain", prompt: "Rancang tabel fakta untuk proses pengembalian barang (<code>app.returns</code>) dengan empat langkah desain dari bab ini. Sebutkan grain, dimensi, measure, dan jenis tabel faktanya.",
      model: "Proses bisnis: pengembalian barang oleh pelanggan. Grain: 1 baris = 1 pengembalian untuk 1 baris pesanan, sama dengan app.returns. Dimensi: tanggal pengembalian (dari return_ts), produk (lewat order_id dan line_no ke app.order_items), dan pelanggan (lewat app.orders); alasan pengembalian (reason) juga bisa menjadi kolom penyaring. Measure: jumlah barang dikembalikan (qty, additive), dan bisa ditambah nilai barang yang dikembalikan (qty dikali harga satuan dari app.order_items). Jenisnya transaction fact table, karena setiap pengembalian adalah satu kejadian yang dicatat sekali.",
      hint: "Mulai dari grain app.returns di kamus data, lalu tanyakan: siapa, apa, kapan, dan angka apa yang diukur." },
  ],
};
