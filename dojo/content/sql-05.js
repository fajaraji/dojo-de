// Bab 5 SQL: agregasi (COUNT, SUM, AVG, MIN, MAX), GROUP BY, HAVING, FILTER, dan grain.
export default {
  id: "sql-05",
  part: "sql",
  title: "Meringkas data: agregasi dan GROUP BY",
  minutes: 75,
  goals: [
    "Meringkas banyak baris menjadi satu angka dengan <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, dan <code>MAX</code>.",
    "Membedakan <code>COUNT(*)</code>, <code>COUNT(kolom)</code>, dan <code>COUNT(DISTINCT kolom)</code>, terutama saat ada NULL.",
    "Membuat ringkasan per kelompok dengan <code>GROUP BY</code>, dan memahami error 42803.",
    "Memilih <code>WHERE</code> atau <code>HAVING</code> berdasarkan urutan proses query.",
    "Menghitung beberapa angka bersyarat dalam satu query dengan <code>FILTER (WHERE …)</code>.",
    "Menentukan grain hasil query: satu baris hasil mewakili apa.",
  ],
  terms: [
    { term: "agregasi", def: "Meringkas banyak baris menjadi satu nilai, misalnya jumlah baris, total, rata-rata, nilai terkecil, atau nilai terbesar. Fungsi yang melakukannya disebut fungsi agregasi." },
    { term: "grain", def: "Arti satu baris di sebuah tabel atau hasil query, misalnya \"1 baris = 1 pesanan\" atau \"1 baris = 1 channel per bulan\". Disebut juga tingkat rincian data." },
    { term: "fungsi agregasi", def: "Fungsi yang menerima banyak baris dan mengembalikan satu nilai: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>." },
    { term: "kelompok", def: "Kumpulan baris yang nilainya sama di kolom-kolom yang ditulis di GROUP BY. Fungsi agregasi dihitung sekali untuk setiap kelompok." },
  ],
  introduces: ["COUNT()", "COUNT(DISTINCT)", "SUM()", "AVG()", "MIN()", "MAX()", "GROUP BY", "HAVING", "FILTER", "POSISI KOLOM"],
  sections: [
    {
      title: "Agregasi: meringkas banyak baris",
      html: `<p>Sampai bab sebelumnya, setiap baris hasil query berasal dari satu baris tabel. Banyak pertanyaan bisnis berbentuk lain: berapa jumlah pesanan, berapa total uang yang masuk, kapan pesanan terakhir dibuat. Untuk menjawabnya, banyak baris harus diringkas menjadi satu nilai. Proses ini disebut <b>agregasi</b>.</p>
<p>Fungsi yang melakukannya disebut <b>fungsi agregasi</b>. Lima yang paling sering dipakai:</p>
<ul><li><code>COUNT</code>: menghitung jumlah baris.</li>
<li><code>SUM</code>: menjumlahkan angka.</li>
<li><code>AVG</code>: rata-rata (dari kata <i>average</i>).</li>
<li><code>MIN</code> dan <code>MAX</code>: nilai terkecil dan terbesar (dari <i>minimum</i> dan <i>maximum</i>).</li></ul>
<p>Fungsi di bab 4 seperti UPPER bekerja per baris: satu baris masuk, satu nilai keluar. Fungsi agregasi menerima banyak baris dan mengeluarkan satu nilai. Kalau query tidak memakai GROUP BY (dibahas di bagian berikutnya), semua baris yang lolos WHERE dihitung sebagai satu kumpulan, sehingga hasilnya tepat satu baris.</p>`,
      examples: [{ sql: "select count(*) as jumlah_pesanan,\n       min(order_ts) as pesanan_pertama,\n       max(order_ts) as pesanan_terakhir\nfrom app.orders;", note: "Tabel app.orders berisi 12.007 baris, tetapi hasilnya hanya satu baris. MIN dan MAX tidak hanya untuk angka: keduanya juga bekerja untuk tanggal dan teks. Pesanan pertama dibuat 1 Januari 2024 dan yang terakhir 31 Oktober 2025." }],
    },
    {
      title: "COUNT(*), COUNT(kolom), dan NULL",
      html: `<p><code>COUNT(*)</code> menghitung jumlah baris, apa pun isinya. <code>COUNT(kolom)</code> hanya menghitung baris yang kolom itu <b>tidak</b> NULL. Perbedaan kecil ini sering menjadi sumber angka yang salah.</p>
<p>Di <code>app.orders</code>, kolom <code>voucher_code</code> berisi NULL kalau pesanan tidak memakai voucher, dan kolom <code>handled_by</code> (nomor agen layanan pelanggan yang menangani pesanan) berisi NULL kalau pelanggan tidak menghubungi layanan pelanggan. Jadi <code>COUNT(voucher_code)</code> menjawab "berapa pesanan memakai voucher", bukan "berapa pesanan". Kalau yang ditanya jumlah baris, pakai <code>COUNT(*)</code>.</p>
<p>Aturan ini berlaku untuk COUNT(kolom), SUM, AVG, MIN, dan MAX: nilai NULL dilewati. SUM, AVG, MIN, dan MAX hanya melihat nilai yang terisi.</p>`,
      examples: [{ sql: "select count(*) as semua_pesanan,\n       count(voucher_code) as pakai_voucher,\n       count(handled_by) as ditangani_agen\nfrom app.orders;", note: "Ada 12.007 pesanan. Sebanyak 2.040 memakai voucher dan 1.418 ditangani agen. Pesanan tanpa voucher = 12.007 − 2.040 = 9.967." }],
    },
    {
      title: "COUNT(DISTINCT kolom): menghitung nilai yang berbeda",
      html: `<p><code>COUNT(DISTINCT kolom)</code> menghitung berapa banyak nilai berbeda di kolom itu. Nilai yang muncul berkali-kali dihitung sekali, dan NULL tidak dihitung.</p>
<p>Tabel <code>app.payments</code> mencatat satu baris untuk setiap transaksi pembayaran. Menurut kamus data, satu pesanan bisa dibayar dua kali: sebagian dengan <i>e-wallet</i> (dompet digital), sisanya dengan transfer. Kalau benar begitu, jumlah baris pembayaran lebih besar daripada jumlah pesanan yang dibayar. Query pertama di bawah membuktikannya.</p>`,
      examples: [
        { sql: "select count(*) as transaksi,\n       count(distinct order_id) as pesanan_dibayar\nfrom app.payments;", note: "Ada 11.715 transaksi, tetapi hanya 11.488 pesanan berbeda. Selisihnya 227. Bagian \"Grain\" di bawah membuktikan bahwa angka ini sama dengan jumlah pesanan yang dibayar dua kali." },
        { sql: "select count(distinct customer_id) as pelanggan_pernah_memesan,\n       count(distinct voucher_code) as jenis_voucher\nfrom app.orders;", note: "Tabel app.customers berisi 1.500 pelanggan; 1.410 di antaranya pernah memesan. Ada 3 kode voucher berbeda. NULL tidak dihitung sebagai kode." },
      ],
    },
    {
      title: "SUM, AVG, MIN, dan MAX",
      html: `<p><code>SUM</code> dan <code>AVG</code> hanya untuk angka. <code>MIN</code> dan <code>MAX</code> bisa dipakai untuk angka, tanggal, dan teks. Isi tanda kurungnya boleh berupa ekspresi: <code>SUM(qty * unit_price - discount)</code> menghitung nilai bersih setiap baris dulu, lalu menjumlahkannya.</p>
<p><code>AVG</code> sama dengan jumlah nilai dibagi banyaknya nilai yang tidak NULL. Di PostgreSQL, AVG dari kolom integer menghasilkan angka desimal (tipe numeric), jadi tidak terpotong seperti <code>7 / 2</code> di bab 3. SUM dari kolom integer menghasilkan tipe <code>bigint</code>, bilangan bulat yang batasnya jauh lebih besar daripada integer.</p>
<p>Karena NULL dilewati, AVG kolom yang berisi NULL adalah rata-rata dari baris yang terisi saja. Contoh kedua memperlihatkan hal ini pada lama pengiriman: pengiriman yang belum sampai tidak punya tanggal sampai, sehingga tidak ikut dirata-rata.</p>
<p>Satu jebakan lagi: kalau tidak ada baris yang lolos WHERE, SUM, AVG, MIN, dan MAX menghasilkan NULL, bukan 0. Hanya COUNT yang menghasilkan 0. Bungkus dengan <code>COALESCE(SUM(…), 0)</code> kalau laporanmu butuh angka 0.</p>`,
      examples: [
        { sql: "select sum(qty) as total_barang,\n       round(avg(qty), 2) as rata_qty_per_baris,\n       min(unit_price) as harga_termurah,\n       max(unit_price) as harga_termahal,\n       sum(qty * unit_price - discount) as nilai_bersih\nfrom app.order_items;", note: "Sebanyak 41.206 barang dipesan dalam 28.495 baris isi pesanan (termasuk pesanan yang kemudian dibatalkan), rata-rata 1,45 barang per baris. AVG kolom integer qty menghasilkan desimal." },
        { sql: "select count(*) as pengiriman,\n       count(delivered_ts) as sudah_sampai,\n       round(avg(delivered_ts::date - shipped_ts::date), 2) as rata_hari_kirim\nfrom app.shipments;", note: "Dari 11.247 pengiriman, 11.198 sudah sampai. Untuk 49 sisanya, delivered_ts NULL, jadi selisih harinya juga NULL dan dilewati. Rata-rata 2,77 hari dihitung dari 11.198 pengiriman saja." },
        { sql: "select sum(amount) as total,\n       coalesce(sum(amount), 0) as total_atau_nol,\n       count(*) as jumlah_baris\nfrom app.payments\nwhere method = 'cod' and status = 'refunded';", note: "Tidak ada pembayaran cod (bayar di tempat) yang uangnya dikembalikan, jadi tidak ada baris yang lolos WHERE. SUM menghasilkan NULL, sedangkan COUNT menghasilkan 0." },
      ],
    },
    {
      title: "GROUP BY: satu baris per kelompok",
      html: `<p><code>GROUP BY kolom</code> mengumpulkan baris yang nilainya sama di kolom itu menjadi satu <b>kelompok</b>. Fungsi agregasi lalu dihitung sekali untuk setiap kelompok, dan hasilnya berisi satu baris per kelompok. GROUP BY ditulis setelah WHERE dan sebelum ORDER BY.</p>
<p>GROUP BY tidak mengurutkan hasil. Kalau urutan penting, tetap tulis ORDER BY. ORDER BY boleh memakai alias dari SELECT, misalnya <code>order by jumlah_pesanan desc</code>.</p>
<p>Kalau GROUP BY berisi beberapa kolom, setiap kombinasi nilai yang muncul di data menjadi satu kelompok. GROUP BY juga boleh berisi ekspresi, misalnya <code>date_trunc('month', order_ts)::date</code> untuk ringkasan per bulan. Tulis ekspresi yang sama persis di SELECT dan di GROUP BY.</p>
<p>Bagaimana dengan NULL? Semua baris yang kolom pengelompokannya NULL dikumpulkan menjadi <b>satu</b> kelompok. Contoh keempat memperlihatkannya.</p>`,
      examples: [
        { sql: "select status, count(*) as jumlah_pesanan\nfrom app.orders\ngroup by status\norder by jumlah_pesanan desc;", note: "Lima baris, satu per status. Terbanyak completed (10.879), lalu cancelled (747), returned (319), shipped (49), dan processing (13)." },
        { sql: "select channel, status, count(*) as jumlah_pesanan\nfrom app.orders\ngroup by channel, status\norder by channel, status;", note: "15 baris: 3 channel kali 5 status. Semua pasangannya muncul di data, jadi tidak ada yang hilang. Pasangan yang tidak muncul di data tidak akan tampil sebagai baris berisi 0." },
        { sql: "select date_trunc('month', order_ts)::date as bulan,\n       count(*) as jumlah_pesanan,\n       sum(shipping_fee) as total_ongkir\nfrom app.orders\nwhere order_ts >= '2025-01-01'\ngroup by date_trunc('month', order_ts)::date\norder by bulan;", note: "Sepuluh baris, Januari sampai Oktober 2025. Pesanan terbanyak ada di Maret 2025: 737 pesanan." },
        { sql: "select voucher_code, count(*) as jumlah_pesanan\nfrom app.orders\ngroup by voucher_code\norder by jumlah_pesanan desc;", note: "Empat kelompok: tiga kode voucher dan satu kelompok NULL berisi 9.967 pesanan tanpa voucher. Bandingkan dengan COUNT(DISTINCT voucher_code) yang hasilnya 3, karena COUNT tidak menghitung NULL." },
      ],
    },
    {
      title: "Kolom di SELECT harus dikelompokkan atau diringkas (error 42803)",
      html: `<p>Setelah GROUP BY, satu baris hasil mewakili satu kelompok. Kolom yang tidak dikelompokkan bisa punya banyak nilai berbeda di dalam satu kelompok, sehingga database tidak tahu nilai mana yang harus ditampilkan. Karena itu, aturan umumnya: setiap kolom di SELECT harus ditulis di GROUP BY, <b>atau</b> berada di dalam fungsi agregasi.</p>
<pre class="sql"><code>select status, order_id, count(*)
from app.orders
group by status;

ERROR 42803: column "orders.order_id" must appear in the GROUP BY clause
or be used in an aggregate function</code></pre>
<p>Kelompok "completed" berisi 10.879 pesanan dengan 10.879 order_id berbeda. Satu baris tidak bisa menampilkan semuanya. Angka 42803 adalah kode error PostgreSQL untuk kesalahan pengelompokan (<i>grouping error</i>). Perbaikannya tergantung maksudmu:</p>
<ul><li>Kalau order_id tidak perlu, hapus dari SELECT.</li>
<li>Kalau perlu ringkasannya, bungkus dengan fungsi agregasi, misalnya <code>min(order_id)</code> untuk nomor pesanan terkecil di setiap status.</li>
<li>Kalau kamu menambahkannya ke GROUP BY, setiap pesanan menjadi kelompok sendiri. Hasilnya 12.007 baris dan count(*) selalu 1. Query-nya jalan, tetapi ringkasannya hilang.</li></ul>
<p>Kebalikannya boleh: kolom di GROUP BY tidak wajib tampil di SELECT.</p>`,
    },
    {
      title: "Nomor posisi kolom di GROUP BY dan ORDER BY",
      html: `<p>Di PostgreSQL, GROUP BY dan ORDER BY boleh berisi angka, bukan nama kolom. Angka itu berarti <b>posisi kolom</b> di SELECT, dihitung dari kiri: 1 = kolom pertama, 2 = kolom kedua, dan seterusnya. Jadi <code>group by 1</code> berarti "kelompokkan menurut kolom pertama di SELECT".</p>
<p>Kelebihannya: query lebih pendek, terutama kalau kolomnya berupa ekspresi panjang seperti <code>date_trunc('month', order_ts)::date</code>. Ekspresi itu cukup ditulis sekali di SELECT.</p>
<p>Risikonya: angka itu mengikuti urutan kolom di SELECT. Kalau urutan kolom diubah atau ada kolom baru yang disisipkan, angkanya menunjuk kolom lain. Kadang PostgreSQL menolaknya, misalnya kalau kolom pertama berubah menjadi <code>count(*)</code>, <code>group by 1</code> gagal dengan pesan <code>aggregate functions are not allowed in GROUP BY</code>. Di ORDER BY tidak ada error: hasilnya diurutkan menurut kolom lain tanpa peringatan. Angka yang melebihi jumlah kolom ditolak dengan pesan <code>GROUP BY position 3 is not in select list</code>.</p>
<p>Menulis ekspresi yang sama di SELECT dan GROUP BY, seperti dianjurkan di bagian GROUP BY, dan menulis nomor posisi sama-sama sah di PostgreSQL. Bab-bab berikutnya kadang memakai bentuk pendek ini. Untuk query yang akan dipakai lama atau dibaca orang lain, nama kolom atau ekspresi lengkap lebih mudah dipahami dan tetap benar walaupun urutan SELECT berubah.</p>`,
      examples: [
        { sql: "select date_trunc('month', order_ts)::date as bulan,\n       count(*) as jumlah_pesanan\nfrom app.orders\nwhere order_ts >= '2025-01-01'\ngroup by 1\norder by 1;", note: "group by 1 dan order by 1 menunjuk kolom pertama, yaitu bulan. Hasilnya sama dengan contoh ringkasan per bulan di bagian GROUP BY: sepuluh baris, Januari sampai Oktober 2025." },
        { sql: "select status, count(*) as jumlah_pesanan\nfrom app.orders\ngroup by 1\norder by 2 desc;", note: "order by 2 desc mengurutkan menurut kolom kedua, jumlah_pesanan, dari yang terbesar. Hasilnya sama dengan contoh pertama di bagian GROUP BY: completed (10.879) di urutan teratas." },
      ],
    },
    {
      title: "WHERE dan HAVING: urutan proses",
      html: `<p><code>HAVING</code> menyaring <b>kelompok</b> berdasarkan hasil agregasi, misalnya "hanya pelanggan dengan minimal 10 pesanan". Untuk memahami bedanya dengan WHERE, lihat urutan PostgreSQL memproses query. Urutan ini berbeda dengan urutan menulisnya:</p>
<ol><li><code>FROM</code>: ambil baris dari tabel.</li>
<li><code>WHERE</code>: buang baris yang tidak memenuhi syarat.</li>
<li><code>GROUP BY</code>: kumpulkan baris menjadi kelompok, lalu hitung fungsi agregasi.</li>
<li><code>HAVING</code>: buang kelompok yang tidak memenuhi syarat.</li>
<li><code>SELECT</code>: hitung kolom hasil, termasuk alias.</li>
<li><code>ORDER BY</code>, lalu <code>LIMIT</code>.</li></ol>
<p>Dari urutan ini muncul tiga aturan:</p>
<ul><li>WHERE tidak bisa memakai fungsi agregasi, karena saat WHERE bekerja, kelompok belum ada. PostgreSQL menolaknya dengan pesan <code>aggregate functions are not allowed in WHERE</code>, juga dengan kode 42803.</li>
<li>Alias dari SELECT tidak bisa dipakai di WHERE atau HAVING, karena alias baru dibuat di langkah 5. Tulis ulang ekspresinya: <code>having count(*) &gt;= 10</code>, bukan <code>having jumlah_pesanan &gt;= 10</code>. ORDER BY boleh memakai alias karena dikerjakan sesudah SELECT.</li>
<li>Syarat tentang isi baris (kolom asli, misalnya tanggal pesanan) ditulis di WHERE. Syarat tentang hasil agregasi ditulis di HAVING.</li></ul>`,
      examples: [{ sql: "select customer_id, count(*) as jumlah_pesanan\nfrom app.orders\nwhere order_ts >= '2025-01-01'\ngroup by customer_id\nhaving count(*) >= 10\norder by jumlah_pesanan desc, customer_id;", note: "WHERE membuang pesanan tahun 2024 lebih dulu. GROUP BY mengelompokkan sisanya per pelanggan, lalu HAVING membuang pelanggan dengan kurang dari 10 pesanan. Hasilnya 99 pelanggan; teratas pelanggan 1157 dengan 19 pesanan di tahun 2025." }],
    },
    {
      title: "Grain: satu baris hasil mewakili apa",
      html: `<p><b>Grain</b> adalah arti satu baris di tabel atau di hasil query. Kamus data TokoKita mencantumkan grain setiap tabel di baris "Satu baris mewakili": di <code>app.orders</code>, 1 baris = 1 pesanan; di <code>app.order_items</code>, 1 baris = 1 produk di dalam 1 pesanan; di <code>app.payments</code>, 1 baris = 1 transaksi pembayaran.</p>
<p>Hasil GROUP BY punya grain sendiri, yaitu kolom-kolom di GROUP BY. <code>group by channel, status</code> menghasilkan grain "1 baris = 1 pasangan channel dan status". <code>group by order_id</code> di app.payments menghasilkan grain "1 baris = 1 pesanan yang punya pembayaran".</p>
<p>Sebelum menulis query ringkasan, jawab dua pertanyaan. Pertama, grain apa yang diminta pertanyaannya? Kedua, apa grain tabel sumbernya? Kalau keduanya berbeda, kamu perlu GROUP BY. Kalau tidak dicek, angkanya bisa salah tanpa ada pesan error.</p>
<p>Contoh pertama mencari pesanan yang dibayar lebih dari sekali. Hasilnya 227 baris, sama dengan selisih di bagian COUNT(DISTINCT). Kalau syaratnya diganti <code>having count(*) &gt; 2</code>, hasilnya kosong: tidak ada pesanan yang dibayar lebih dari dua kali. Itu sebabnya selisih 11.715 − 11.488 tepat sama dengan jumlah pesanan yang dibayar dua kali.</p>
<p>Contoh kedua memperlihatkan akibatnya pada rata-rata. <code>AVG(amount)</code> merata-rata per transaksi. Pesanan yang dibayar dua kali masuk dua kali, masing-masing dengan sebagian nilainya. Kalau pertanyaannya "rata-rata uang per pesanan", bagi total uang dengan jumlah pesanan berbeda.</p>`,
      examples: [
        { sql: "select order_id, count(*) as jumlah_transaksi, sum(amount) as total_dibayar\nfrom app.payments\ngroup by order_id\nhaving count(*) > 1\norder by order_id;", note: "227 baris, satu untuk setiap pesanan yang dibayar dua kali. Kolom total_dibayar menjumlahkan kedua transaksinya." },
        { sql: "select round(avg(amount), 2) as rata_per_transaksi,\n       round(sum(amount) / count(distinct order_id), 2) as rata_per_pesanan\nfrom app.payments\nwhere status = 'success';", note: "Rata-rata per transaksi 485.099,84, sedangkan rata-rata per pesanan 494.884,60. Keduanya benar, tetapi menjawab pertanyaan yang berbeda karena grain-nya berbeda." },
      ],
    },
    {
      title: "FILTER: agregasi dengan syarat sendiri",
      html: `<p><code>fungsi(…) FILTER (WHERE syarat)</code> membuat satu fungsi agregasi hanya menghitung baris yang memenuhi syarat. Fungsi agregasi lain di query yang sama tetap melihat semua baris. Ini berbeda dengan WHERE, yang membuang baris untuk seluruh query.</p>
<p>FILTER berguna untuk menaruh beberapa hitungan bersyarat berdampingan, misalnya total pesanan dan pesanan yang dibatalkan, lalu menghitung persentasenya. Hasil COUNT bertipe bilangan bulat, jadi ingat jebakan pembagian bilangan bulat di bab 3: kalikan dengan <code>100.0</code>, bukan <code>100</code>.</p>`,
      examples: [
        { sql: "select channel,\n       count(*) as total_pesanan,\n       count(*) filter (where status = 'cancelled') as dibatalkan,\n       round(100.0 * count(*) filter (where status = 'cancelled') / count(*), 1) as persen_batal\nfrom app.orders\ngroup by channel\norder by channel;", note: "android: 346 dari 5.426 pesanan dibatalkan (6,4%); ios: 144 dari 2.361 (6,1%); web: 257 dari 4.220 (6,1%). Kalau syaratnya dipindah ke WHERE, kolom total_pesanan ikut berubah menjadi jumlah pesanan batal saja." },
        { sql: "select method,\n       sum(amount) filter (where status = 'success') as uang_diterima,\n       sum(amount) filter (where status = 'refunded') as uang_dikembalikan\nfrom app.payments\ngroup by method\norder by method;", note: "FILTER juga bisa dipakai dengan SUM. Untuk cod, uang_dikembalikan bernilai NULL karena tidak ada baris yang memenuhi syarat, sama seperti SUM dari nol baris." },
      ],
    },
  ],
  tsql: [
    { pg: "count(*), count(kolom), count(distinct kolom)", tsql: "count(*), count(kolom), count(distinct kolom)", note: "Perilakunya sama: COUNT(kolom) dan COUNT(DISTINCT) tidak menghitung NULL. Bedanya ada di tipe hasil: di PostgreSQL COUNT menghasilkan bigint, di SQL Server COUNT menghasilkan int (batasnya 2.147.483.647)." },
    { pg: "count(*)", tsql: "count_big(*)", note: "COUNT_BIG bekerja seperti COUNT, tetapi hasilnya bigint. Pakai untuk tabel yang barisnya bisa melewati batas int; di SQL Server, COUNT yang melewati batas itu gagal dengan error 8115 (<i>arithmetic overflow</i>: hasil melewati batas tipe angka)." },
    { pg: "avg(qty) = 1.4460… (numeric)", tsql: "avg(qty) = 1 (int)", note: "Di SQL Server, AVG dari kolom int menghasilkan int, jadi angka di belakang koma dibuang. Ubah tipenya dulu: avg(cast(qty as decimal(10,2))) atau avg(qty * 1.0)." },
    { pg: "sum(qty) bertipe bigint", tsql: "sum(qty) bertipe int", note: "PostgreSQL menaikkan SUM integer menjadi bigint. SQL Server mempertahankan int; pakai sum(cast(qty as bigint)) kalau totalnya bisa melewati 2.147.483.647." },
    { pg: "count(*) filter (where status = 'cancelled')", tsql: "sum(case when status = 'cancelled' then 1 else 0 end), atau count(case when status = 'cancelled' then 1 end)", note: "SQL Server tidak punya FILTER. Bentuk COUNT(CASE …) bekerja karena CASE tanpa ELSE menghasilkan NULL, dan COUNT melewati NULL." },
    { pg: "sum(amount) filter (where status = 'success')", tsql: "sum(case when status = 'success' then amount end)", note: "Sama seperti FILTER: baris yang tidak memenuhi syarat menjadi NULL dan dilewati SUM." },
    { pg: "group by bulan (alias dari SELECT)", tsql: "group by ekspresi lengkapnya", note: "PostgreSQL membolehkan alias SELECT di GROUP BY; SQL Server tidak. Menulis ekspresi lengkap di GROUP BY berlaku di keduanya." },
    { pg: "group by 1, 2 dan order by 1, 2 (nomor posisi kolom)", tsql: "group by ekspresi lengkapnya; order by 1, 2 boleh", note: "Dokumentasi GROUP BY SQL Server hanya menyebut kolom atau perhitungan dari kolom sebagai isi GROUP BY; nomor posisi kolom tidak disebut. Jadi di SQL Server tulis ekspresi lengkap di GROUP BY. ORDER BY menerima nomor posisi kolom, tetapi dokumentasinya menyarankan untuk menghindarinya karena sulit dibaca dan hasilnya bisa salah kalau urutan kolom di SELECT berubah." },
    { pg: "ERROR 42803: column … must appear in the GROUP BY clause …", tsql: "Msg 8120: Column … is invalid in the select list because it is not contained in either an aggregate function or the GROUP BY clause.", note: "Aturannya sama: kolom di SELECT harus ada di GROUP BY atau di dalam fungsi agregasi." },
    { pg: "group by voucher_code (NULL jadi satu kelompok)", tsql: "group by voucher_code", note: "Sama: SQL Server juga mengumpulkan semua NULL menjadi satu kelompok. WHERE dan HAVING juga bekerja sama." },
  ],
  summary: [
    "Agregasi meringkas banyak baris menjadi satu nilai dengan <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, dan <code>MAX</code>.",
    "<code>COUNT(*)</code> menghitung baris; <code>COUNT(kolom)</code> menghitung nilai yang tidak NULL; <code>COUNT(DISTINCT kolom)</code> menghitung nilai berbeda.",
    "Fungsi agregasi melewati NULL. Dari nol baris, SUM/AVG/MIN/MAX menghasilkan NULL, sedangkan COUNT menghasilkan 0.",
    "<code>GROUP BY</code> menghasilkan satu baris per kelompok. Setiap kolom di SELECT harus ada di GROUP BY atau di dalam fungsi agregasi (kalau tidak, error 42803).",
    "Urutan proses: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT. WHERE menyaring baris; HAVING menyaring kelompok.",
    "<code>FILTER (WHERE …)</code> membatasi satu fungsi agregasi saja. Di SQL Server, pakai <code>SUM(CASE …)</code> atau <code>COUNT(CASE …)</code>.",
    "Selalu tentukan grain: satu baris hasil mewakili apa. app.payments berisi transaksi, bukan pesanan: 227 pesanan dibayar dua kali.",
  ],
  drills: [
    { id: "sql-05-01", kind: "choice", prompt: "Tabel <code>app.orders</code> berisi 12.007 baris. Sebanyak 2.040 baris punya <code>voucher_code</code>, sisanya NULL. Apa hasil <code>select count(voucher_code) from app.orders</code>?",
      options: ["12.007", "2.040", "9.967", "3"], answer: 1,
      why: "COUNT(kolom) hanya menghitung baris yang kolomnya tidak NULL. 9.967 adalah jumlah yang NULL, dan 3 adalah hasil COUNT(DISTINCT voucher_code).", hint: "COUNT(kolom) melewati NULL." },
    { id: "sql-05-02", kind: "choice", prompt: "Kamu ingin daftar pelanggan yang punya lebih dari 5 pesanan. Di bagian mana syarat <code>count(*) &gt; 5</code> ditulis?",
      options: ["WHERE", "HAVING", "GROUP BY", "SELECT"], answer: 1,
      why: "Syaratnya memakai hasil agregasi, padahal WHERE bekerja sebelum baris dikelompokkan. HAVING bekerja setelah GROUP BY, sehingga bisa memakai count(*).", hint: "Ingat urutan proses: FROM, WHERE, GROUP BY, HAVING, SELECT." },
    { id: "sql-05-03", kind: "choice", prompt: "Apa grain hasil <code>select channel, status, count(*) from app.orders group by channel, status</code>?",
      options: ["1 baris = 1 pesanan", "1 baris = 1 channel", "1 baris = 1 pasangan channel dan status", "1 baris = 1 status"], answer: 2,
      why: "Grain hasil GROUP BY ditentukan oleh kolom-kolom di GROUP BY. Setiap kombinasi channel dan status yang muncul di data menjadi satu baris.", hint: "Lihat kolom apa saja yang ada di GROUP BY." },
    { id: "sql-05-04", kind: "choice", prompt: "Kolom <code>qty</code> bertipe integer dan berisi nilai 1, 1, dan 2. Apa hasil <code>avg(qty)</code> di SQL Server?",
      options: ["1.333333", "1", "2", "Error"], answer: 1,
      why: "Di SQL Server, AVG dari kolom int menghasilkan int, jadi 4/3 menjadi 1. PostgreSQL menghasilkan 1.3333… (numeric). Di SQL Server, ubah dulu ke desimal, misalnya avg(qty * 1.0).", hint: "Lihat bagian \"Di SQL Server\" tentang AVG." },
    { id: "sql-05-05", kind: "sql", prompt: "Tampilkan jumlah pesanan per channel: kolom <code>channel</code> dan jumlah pesanannya.",
      start: "select channel, \nfrom app.orders\n",
      solution: "select channel, count(*) as jumlah_pesanan from app.orders group by channel",
      why: "GROUP BY channel membuat satu kelompok per channel, lalu count(*) menghitung baris di setiap kelompok.", hint: "count(*) dan group by channel." },
    { id: "sql-05-06", kind: "sql", prompt: "Untuk setiap status pesanan, tampilkan <code>status</code>, jumlah pesanan, dan total ongkos kirim (<code>shipping_fee</code>).",
      solution: "select status, count(*) as jumlah_pesanan, sum(shipping_fee) as total_ongkir from app.orders group by status",
      why: "Dua fungsi agregasi dihitung untuk setiap kelompok status yang sama.", hint: "Satu GROUP BY bisa dipakai beberapa fungsi agregasi sekaligus." },
    { id: "sql-05-07", kind: "sql", prompt: "Untuk pesanan nomor 100001 sampai 100020, tampilkan <code>order_id</code>, jumlah baris isi pesanan, total barang (jumlah <code>qty</code>), dan nilai bersih pesanan (jumlah dari <code>qty * unit_price - discount</code>). Ambil dari <code>app.order_items</code>.",
      solution: "select order_id, count(*) as jumlah_baris, sum(qty) as total_barang, sum(qty * unit_price - discount) as nilai_bersih from app.order_items where order_id between 100001 and 100020 group by order_id",
      why: "Grain app.order_items adalah 1 produk per pesanan. GROUP BY order_id mengubahnya menjadi 1 baris per pesanan. SUM boleh menerima ekspresi.", hint: "where order_id between … and … lalu group by order_id." },
    { id: "sql-05-08", kind: "sql", level: "menengah", prompt: "Untuk setiap bulan di tahun 2025, tampilkan bulan (bertipe date, tanggal 1 di bulan itu), jumlah pesanan, dan jumlah pelanggan berbeda yang memesan.",
      solution: "select date_trunc('month', order_ts)::date as bulan, count(*) as jumlah_pesanan, count(distinct customer_id) as jumlah_pelanggan from app.orders where order_ts >= '2025-01-01' and order_ts < '2026-01-01' group by date_trunc('month', order_ts)::date",
      why: "date_trunc('month', …)::date mengubah setiap tanggal menjadi tanggal 1 bulannya, lalu dipakai sebagai kelompok. Pelanggan yang memesan beberapa kali di bulan yang sama dihitung sekali oleh COUNT(DISTINCT).", hint: "Tulis ekspresi date_trunc yang sama di SELECT dan GROUP BY." },
    { id: "sql-05-09", kind: "sql", prompt: "Tampilkan <code>customer_id</code> dan jumlah pesanan untuk pelanggan yang punya minimal 20 pesanan (seluruh periode data).",
      solution: "select customer_id, count(*) as jumlah_pesanan from app.orders group by customer_id having count(*) >= 20",
      why: "Syarat \"minimal 20 pesanan\" memakai hasil count(*), jadi ditulis di HAVING, bukan WHERE.", hint: "group by customer_id having count(*) >= 20" },
    { id: "sql-05-10", kind: "sql", level: "wawancara", prompt: "Untuk setiap bulan di tahun 2025, tampilkan bulan (bertipe date, tanggal 1 di bulan itu), total pesanan, jumlah pesanan berstatus <code>cancelled</code>, dan persen pesanan batal dibulatkan 1 digit di belakang koma. Semua dalam satu query.",
      solution: "select date_trunc('month', order_ts)::date as bulan, count(*) as total_pesanan, count(*) filter (where status = 'cancelled') as dibatalkan, round(100.0 * count(*) filter (where status = 'cancelled') / count(*), 1) as persen_batal from app.orders where order_ts >= '2025-01-01' and order_ts < '2026-01-01' group by date_trunc('month', order_ts)::date",
      why: "FILTER membatasi satu fungsi agregasi tanpa membuang baris untuk kolom total. 100.0 mencegah pembagian bilangan bulat. Di SQL Server, ganti FILTER dengan sum(case when status = 'cancelled' then 1 else 0 end).",
      hint: "count(*) filter (where status = 'cancelled'), lalu bagi dengan count(*)." },
    { id: "sql-05-11", kind: "sql", level: "wawancara", prompt: "Dari <code>app.payments</code>, tampilkan untuk setiap cara bayar (<code>method</code>): jumlah transaksi, total uang diterima (status <code>success</code>), dan total uang dikembalikan (status <code>refunded</code>). Biarkan NULL kalau tidak ada uang yang dikembalikan.",
      solution: "select method, count(*) as transaksi, sum(amount) filter (where status = 'success') as uang_diterima, sum(amount) filter (where status = 'refunded') as uang_dikembalikan from app.payments group by method",
      why: "Dua SUM dengan FILTER yang berbeda memisahkan uang diterima dan dikembalikan dalam satu baris per method, sementara count(*) tetap menghitung semua transaksi. Untuk cod tidak ada baris refunded, jadi hasilnya NULL.",
      hint: "sum(amount) filter (where status = …) dua kali, dengan syarat berbeda." },
    { id: "sql-05-12", kind: "fix", prompt: "Query ini seharusnya menampilkan pelanggan yang punya minimal 25 pesanan, tetapi gagal dengan error 42803. Perbaiki.",
      start: "select customer_id, count(*) as jumlah_pesanan\nfrom app.orders\nwhere count(*) >= 25\ngroup by customer_id;",
      solution: "select customer_id, count(*) as jumlah_pesanan from app.orders group by customer_id having count(*) >= 25",
      why: "WHERE bekerja sebelum baris dikelompokkan, jadi count(*) belum ada. Syarat atas hasil agregasi dipindah ke HAVING, yang ditulis setelah GROUP BY.", hint: "Pesan errornya: aggregate functions are not allowed in WHERE." },
    { id: "sql-05-13", kind: "number", prompt: "Berapa pelanggan berbeda yang pernah memesan lewat channel <code>ios</code>?",
      answerSql: "select count(distinct customer_id) from app.orders where channel = 'ios'",
      why: "select count(distinct customer_id) from app.orders where channel = 'ios'. Pelanggan yang memesan berkali-kali lewat ios dihitung sekali.", hint: "Saring dengan WHERE, lalu hitung nilai berbeda dengan COUNT(DISTINCT)." },
    { id: "sql-05-14", kind: "explain", level: "wawancara", prompt: "Rekan kerjamu menghitung \"rata-rata uang yang dibayar per pesanan\" dengan <code>select avg(amount) from app.payments where status = 'success'</code>. Jelaskan kenapa angkanya tidak menjawab pertanyaan itu, dan bagaimana memperbaikinya.",
      model: "Grain app.payments adalah 1 baris = 1 transaksi pembayaran, bukan 1 pesanan. Ada 227 pesanan yang dibayar dua kali, jadi AVG(amount) merata-rata per transaksi: pesanan itu terhitung dua kali dengan nilai yang terbagi, sehingga rata-ratanya lebih kecil. Pertanyaannya meminta grain pesanan, jadi total uang harus dibagi jumlah pesanan berbeda: sum(amount) / count(distinct order_id). Hasilnya 494.884,60, sedangkan rata-rata per transaksi 485.099,84.",
      hint: "Tanyakan dulu: satu baris di app.payments mewakili apa?" },
  ],
};
