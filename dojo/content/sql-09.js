// Bab 9 SQL: window function bagian 1 (OVER, PARTITION BY, ORDER BY di dalam OVER, ROW_NUMBER, RANK, DENSE_RANK, SUM/AVG/COUNT … OVER, LAG, LEAD).
export default {
  id: "sql-09",
  part: "sql",
  title: "Window function 1",
  minutes: 80,
  goals: [
    "Menghitung angka ringkasan di samping setiap baris dengan <code>OVER</code>, tanpa meringkas baris seperti GROUP BY.",
    "Membagi baris menjadi partisi dengan <code>PARTITION BY</code>, misalnya untuk persentase terhadap total kelompok.",
    "Memberi nomor dan peringkat dengan <code>ROW_NUMBER</code>, <code>RANK</code>, dan <code>DENSE_RANK</code>, dan tahu bedanya saat ada nilai seri.",
    "Membuat total berjalan dengan <code>SUM … OVER (ORDER BY …)</code>.",
    "Membandingkan baris dengan baris sebelum dan sesudahnya dengan <code>LAG</code> dan <code>LEAD</code>.",
    "Menyaring hasil window function lewat subquery atau CTE: top-N per kelompok, baris terbaru per kunci, dan nilai tertinggi ke-N.",
  ],
  terms: [
    { term: "window function", def: "Fungsi yang menghitung nilai untuk setiap baris dari sekumpulan baris yang berhubungan dengan baris itu (jendelanya), tanpa meringkas baris. Ditulis dengan kata <code>OVER</code>, misalnya <code>count(*) over ()</code>." },
    { term: "jendela", def: "Kumpulan baris yang dilihat window function saat menghitung nilai untuk satu baris. Isinya ditentukan oleh tanda kurung setelah <code>OVER</code>. Dalam bahasa Inggris: <i>window</i>." },
    { term: "partisi", def: "Kumpulan baris yang nilainya sama di kolom-kolom yang ditulis di <code>PARTITION BY</code>. Window function dihitung terpisah untuk setiap partisi, dan barisnya tidak diringkas." },
    { term: "urutan di dalam jendela", def: "Urutan baris yang ditulis dengan <code>ORDER BY</code> di dalam <code>OVER</code>. Menentukan baris mana yang pertama untuk ROW_NUMBER, RANK, LAG, LEAD, dan total berjalan. Tidak mengatur urutan tampilan hasil." },
    { term: "nilai seri", def: "Dua baris atau lebih yang nilainya sama persis di kolom ORDER BY jendela. Di dokumentasi PostgreSQL disebut <i>peers</i>." },
    { term: "total berjalan", def: "Total yang terus bertambah dari baris ke baris: jumlah dari baris pertama sampai baris sekarang. Dalam bahasa Inggris: <i>running total</i>." },
  ],
  introduces: ["OVER", "PARTITION BY", "ROW_NUMBER()", "RANK()", "DENSE_RANK()", "LAG()", "LEAD()"],
  sections: [
    {
      title: "Window function: menghitung tanpa meringkas baris",
      html: `<p>Di bab 5, fungsi agregasi dengan GROUP BY meringkas banyak baris menjadi satu baris per kelompok. Kadang kamu butuh angka ringkasan itu <b>di samping</b> setiap baris aslinya, misalnya setiap pesanan beserta jumlah seluruh pesanan pelanggannya.</p>
<p><b>Window function</b> adalah fungsi yang menghitung nilai untuk setiap baris dari sekumpulan baris yang berhubungan dengan baris itu. Kumpulan baris itu disebut <b>jendela</b> (<i>window</i>). Bedanya dengan GROUP BY: baris tidak diringkas. Setiap baris tetap tampil sendiri, dan hasil hitungannya ditambahkan sebagai kolom baru.</p>
<p>Window function ditulis dengan kata <code>OVER</code> setelah fungsinya, misalnya <code>count(*) over ()</code>. Isi tanda kurung setelah OVER menentukan jendelanya. Kalau kosong, jendelanya adalah semua baris hasil query. Semua fungsi agregasi dari bab 5 (COUNT, SUM, AVG, MIN, MAX) bisa dipakai sebagai window function dengan menambahkan OVER.</p>
<p>Window function dihitung setelah WHERE, GROUP BY, dan HAVING. Jadi jendelanya hanya berisi baris yang lolos WHERE. LIMIT tidak mengubah isi jendela: contoh pertama hanya menampilkan 5 baris, tetapi kolom jumlah_pesanan tetap 35.</p>`,
      examples: [
        { sql: "select order_id, order_ts, shipping_fee,\n       count(*) over () as jumlah_pesanan,\n       sum(shipping_fee) over () as total_ongkir\nfrom app.orders\nwhere customer_id = 655\norder by order_ts\nlimit 5;", note: "Pelanggan 655 punya 35 pesanan dengan total ongkos kirim 498.000. Setiap pesanan tetap tampil sebagai baris sendiri, dan kedua angka ringkasan diulang di setiap baris." },
        { sql: "select customer_id,\n       count(*) as jumlah_pesanan,\n       sum(shipping_fee) as total_ongkir\nfrom app.orders\nwhere customer_id = 655\ngroup by customer_id;", note: "Angkanya sama, tetapi GROUP BY meringkas 35 baris menjadi satu baris. Kolom order_id tidak bisa ditampilkan lagi." },
      ],
    },
    {
      title: "PARTITION BY: jendela per kelompok",
      html: `<p><code>PARTITION BY kolom</code> di dalam OVER membagi baris menjadi <b>partisi</b>, yaitu kumpulan baris yang nilainya sama di kolom itu. Jendela setiap baris adalah partisinya sendiri. Partisi mirip kelompok di GROUP BY, tetapi barisnya tidak diringkas.</p>
<p>Pola yang sering dipakai adalah persentase setiap baris terhadap total kelompoknya. Contoh pertama menghitung nilai bersih setiap baris isi pesanan (<code>qty * unit_price - discount</code>), total pesanannya dengan <code>sum(…) over (partition by order_id)</code>, lalu persentasenya. Ingat jebakan pembagian bilangan bulat dari bab 3: kalikan dengan <code>100.0</code>, bukan <code>100</code>.</p>
<p>Contoh kedua memakai AVG untuk membandingkan harga setiap produk dengan rata-rata harga di kategorinya.</p>`,
      examples: [
        { sql: "select order_id, line_no,\n       qty * unit_price - discount as nilai,\n       sum(qty * unit_price - discount) over (partition by order_id) as total_pesanan,\n       round(100.0 * (qty * unit_price - discount)\n             / sum(qty * unit_price - discount) over (partition by order_id), 1) as persen\nfrom app.order_items\nwhere order_id between 100001 and 100003\norder by order_id, line_no;", note: "Pesanan 100001 punya dua baris dengan total 328.800; baris ke-2 bernilai 296.900, atau 90,3% dari pesanan. Total dihitung ulang untuk setiap pesanan. Persen pesanan 100002 berjumlah 99,9 (6,9 + 34,8 + 58,2) karena pembulatan." },
        { sql: "select product_id, product_name, list_price,\n       round(avg(list_price) over (partition by category_id), 2) as rata_kategori,\n       list_price - round(avg(list_price) over (partition by category_id), 2) as selisih\nfrom app.products\nwhere category_id = 3\norder by list_price desc;", note: "Rata-rata harga 12 produk Earphone adalah 267.233,33. Produk 8 paling mahal, 238.666,67 di atas rata-rata." },
      ],
    },
    {
      title: "ORDER BY di dalam OVER dan ROW_NUMBER",
      html: `<p>Beberapa window function butuh <b>urutan di dalam jendela</b>: baris mana yang pertama, kedua, dan seterusnya. Urutan ini ditulis dengan ORDER BY di dalam OVER, setelah PARTITION BY kalau ada.</p>
<p><code>ROW_NUMBER()</code> memberi nomor urut 1, 2, 3, dan seterusnya untuk setiap baris di partisinya, mengikuti urutan itu. Nomornya mulai lagi dari 1 di setiap partisi. Tanda kurungnya selalu kosong, karena fungsi ini tidak butuh kolom: ia hanya menghitung posisi baris.</p>
<p>ORDER BY di dalam OVER hanya mengatur cara window function menghitung. Urutan tampilan hasil tetap diatur ORDER BY di akhir query, dan keduanya boleh berbeda. Kalau ORDER BY di akhir query tidak ditulis, PostgreSQL mengembalikan baris dalam urutan apa pun yang paling cepat baginya.</p>`,
      examples: [{ sql: "select customer_id, order_id, order_ts,\n       row_number() over (partition by customer_id order by order_ts) as pesanan_ke\nfrom app.orders\nwhere customer_id in (1, 2)\norder by customer_id, order_ts;", note: "Pelanggan 1 punya 3 pesanan, pelanggan 2 punya 5. Nomor pesanan_ke mulai lagi dari 1 saat pelanggan berganti, karena partisinya berganti." }],
    },
    {
      title: "RANK dan DENSE_RANK: kalau ada nilai seri",
      html: `<p>Baris disebut <b>seri</b> kalau nilainya sama persis di kolom ORDER BY jendela. Di kategori 11 (Wadah Makanan), produk 66 dan 67 sama-sama berharga 92.900. Tiga fungsi peringkat memperlakukan baris seri secara berbeda:</p>
<ul><li><code>ROW_NUMBER()</code> tetap memberi nomor yang berbeda: 7 dan 8. Mana yang mendapat 7 tidak dijamin, karena kedua produk sama di kolom urutan dan query tidak punya aturan untuk memilih salah satunya.</li>
<li><code>RANK()</code> memberi peringkat yang sama untuk baris seri, lalu melompati angka berikutnya: 6, 7, 7, 9. Peringkat sebuah baris sama dengan nomor baris pertama di kelompok serinya.</li>
<li><code>DENSE_RANK()</code> memberi peringkat yang sama tanpa lompatan: 6, 7, 7, 8. Fungsi ini menghitung berapa banyak nilai berbeda yang ada di depannya, ditambah satu.</li></ul>
<p>Kalau kamu butuh ROW_NUMBER yang hasilnya selalu sama setiap kali dijalankan, tambahkan kolom unik sebagai penentu urutan terakhir, misalnya <code>order by list_price desc, product_id</code>. Kolom nomor_pasti di contoh memakai cara ini.</p>`,
      examples: [{ sql: "select product_id, product_name, list_price,\n       row_number() over (order by list_price desc) as nomor,\n       row_number() over (order by list_price desc, product_id) as nomor_pasti,\n       rank() over (order by list_price desc) as peringkat,\n       dense_rank() over (order by list_price desc) as peringkat_rapat\nfrom app.products\nwhere category_id = 11\norder by list_price desc, product_id;", note: "Lihat baris harga 92.900. Kolom peringkat berisi 7, 7, lalu 9; kolom peringkat_rapat berisi 7, 7, lalu 8. Kolom nomor_pasti selalu memberi 7 untuk produk 66 karena product_id-nya lebih kecil." }],
    },
    {
      title: "Window function setelah GROUP BY",
      html: `<p>Karena window function dihitung setelah GROUP BY, fungsinya dan isi OVER boleh memakai hasil agregasi.</p>
<ul><li><code>rank() over (order by count(*) desc)</code> memberi peringkat setiap kelompok berdasarkan jumlah barisnya.</li>
<li><code>sum(count(*)) over (partition by channel)</code> menjumlahkan hasil COUNT semua kelompok di channel yang sama. Bacanya dari dalam: count(*) dihitung untuk setiap kelompok oleh GROUP BY, lalu SUM … OVER menjumlahkan angka-angka itu tanpa meringkas baris.</li></ul>
<p>Contoh pertama membuktikan perbedaan tiga fungsi peringkat dengan data yang memang punya nilai seri. Contoh kedua menghitung persentase setiap status terhadap total pesanan di channel-nya.</p>`,
      examples: [
        { sql: "select customer_id, count(*) as jumlah_pesanan,\n       row_number() over (order by count(*) desc) as nomor,\n       rank() over (order by count(*) desc) as peringkat,\n       dense_rank() over (order by count(*) desc) as peringkat_rapat\nfrom app.orders\ngroup by customer_id\norder by jumlah_pesanan desc, customer_id\nlimit 8;", note: "Pelanggan 841 dan 1156 seri dengan 31 pesanan. RANK memberi keduanya 2, lalu pelanggan 78 (30 pesanan) mendapat 4: angka 3 dilompati. DENSE_RANK memberi pelanggan 78 angka 3." },
        { sql: "select channel, status, count(*) as jumlah,\n       sum(count(*)) over (partition by channel) as total_channel,\n       round(100.0 * count(*) / sum(count(*)) over (partition by channel), 1) as persen\nfrom app.orders\ngroup by channel, status\norder by channel, status;", note: "15 baris, satu per pasangan channel dan status. Di android, 4.904 dari 5.426 pesanan berstatus completed (90,4%); di web 3.838 dari 4.220 (90,9%)." },
      ],
    },
    {
      title: "Total berjalan: SUM … OVER (ORDER BY …)",
      html: `<p>Kalau OVER berisi ORDER BY, fungsi agregasi tidak lagi menghitung seluruh partisi. Ia menghitung dari baris pertama partisi sampai baris sekarang. Hasilnya disebut <b>total berjalan</b> (<i>running total</i>): total yang terus bertambah dari baris ke baris.</p>
<p>Contoh pertama memakai CTE. Ongkos kirim diringkas dulu per bulan, lalu dijumlahkan secara berjalan menurut bulan.</p>
<p>Ada satu aturan yang sering mengejutkan. "Sampai baris sekarang" artinya sampai baris sekarang <b>ditambah semua baris yang nilai ORDER BY-nya sama</b> dengan baris sekarang. Baris yang seri dijumlahkan bersamaan, sehingga semuanya mendapat angka yang sama. Aturan ini tertulis di dokumentasi PostgreSQL 18 bagian <i>Window Function Calls</i>. Contoh kedua membuktikannya: ORDER BY jendelanya hanya tanggal, dan banyak pesanan dibuat di tanggal yang sama.</p>
<p>Kalau kamu ingin angka yang naik satu per satu, tambahkan kolom unik di ORDER BY jendela, seperti kolom berjalan_per_baris. Pengaturan rinci tentang baris mana saja yang ikut dihitung disebut <i>frame</i> (bingkai jendela), dan dibahas di bab berikutnya.</p>
<p>Tanpa ORDER BY di dalam OVER, semua baris di partisi dianggap seri. Itu sebabnya <code>sum(…) over (partition by order_id)</code> di bagian sebelumnya menjumlahkan seluruh pesanan.</p>`,
      examples: [
        { sql: "with bulanan as (\n  select date_trunc('month', order_ts)::date as bulan,\n         sum(shipping_fee) as ongkir\n  from app.orders\n  where order_ts >= '2025-01-01'\n  group by date_trunc('month', order_ts)::date\n)\nselect bulan, ongkir,\n       sum(ongkir) over (order by bulan) as ongkir_berjalan\nfrom bulanan\norder by bulan;", note: "Januari 2025: 6.852.000; Februari menambah 6.087.000 sehingga totalnya 12.939.000. Angka Oktober, 70.171.000, sama dengan total ongkos kirim Januari sampai Oktober 2025." },
        { sql: "select order_id, order_ts::date as tanggal,\n       count(*) over (order by order_ts::date) as berjalan_per_tanggal,\n       count(*) over (order by order_ts::date, order_id) as berjalan_per_baris\nfrom app.orders\nwhere order_ts >= '2025-10-01' and order_ts < '2025-10-03'\norder by order_ts::date, order_id;", note: "Ada 16 pesanan tanggal 1 Oktober dan 18 pesanan tanggal 2 Oktober. Di kolom berjalan_per_tanggal, ke-16 pesanan tanggal 1 Oktober semuanya bernilai 16, dan ke-18 pesanan tanggal 2 Oktober bernilai 34 (16 + 18). Kolom berjalan_per_baris naik 1, 2, 3, sampai 34." },
      ],
    },
    {
      title: "LAG dan LEAD: melihat baris sebelum dan sesudahnya",
      html: `<p><code>LAG(kolom)</code> mengambil nilai kolom dari baris sebelumnya di partisi yang sama, menurut urutan di dalam jendela. <code>LEAD(kolom)</code> mengambil nilai dari baris sesudahnya. Kalau baris itu tidak ada (baris pertama untuk LAG, baris terakhir untuk LEAD), hasilnya NULL. Baris "sebelumnya" dan "sesudahnya" ditentukan oleh ORDER BY di dalam OVER, jadi selalu tuliskan ORDER BY untuk LAG dan LEAD.</p>
<p>Keduanya menerima dua isian tambahan: <code>lag(kolom, n, pengganti)</code>. Angka n adalah jarak baris, bawaannya 1. Pengganti adalah nilai yang dipakai kalau baris itu tidak ada, bawaannya NULL. Misalnya <code>lag(order_ts, 2)</code> mengambil pesanan dua langkah sebelumnya.</p>
<p>Pemakaian paling umum adalah jarak antar-kejadian. Tanggal pesanan dikurangi tanggal pesanan sebelumnya memberi jarak dalam hari (bab 4). Contoh kedua menghitung selisih nilai barang dengan pesanan sebelumnya. Nilai per pesanan diringkas dulu di CTE, karena grain app.order_items adalah baris barang, bukan pesanan.</p>`,
      examples: [
        { sql: "select customer_id, order_id, order_ts::date as tanggal,\n       lag(order_ts::date) over (partition by customer_id order by order_ts) as tanggal_sebelumnya,\n       order_ts::date - lag(order_ts::date) over (partition by customer_id order by order_ts) as jarak_hari,\n       lead(order_id) over (partition by customer_id order by order_ts) as pesanan_berikutnya\nfrom app.orders\nwhere customer_id in (1, 2)\norder by customer_id, order_ts;", note: "Pesanan kedua pelanggan 1 dibuat 240 hari setelah pesanan pertamanya, lalu pesanan ketiga 8 hari kemudian. Pesanan pertama setiap pelanggan tidak punya tanggal_sebelumnya (NULL), dan pesanan terakhirnya tidak punya pesanan_berikutnya." },
        { sql: "with nilai as (\n  select o.order_id, o.order_ts,\n         sum(oi.qty * oi.unit_price - oi.discount) as nilai_barang\n  from app.orders as o\n  join app.order_items as oi on oi.order_id = o.order_id\n  where o.customer_id = 2\n  group by o.order_id, o.order_ts\n)\nselect order_id, order_ts::date as tanggal, nilai_barang,\n       lag(nilai_barang) over (order by order_ts) as nilai_sebelumnya,\n       nilai_barang - lag(nilai_barang) over (order by order_ts) as selisih\nfrom nilai\norder by order_ts;", note: "Pesanan ketiga pelanggan 2 bernilai 1.298.600, naik 642.400 dari pesanan sebelumnya. Selisih pesanan pertama NULL. Kalau ditulis lag(nilai_barang, 1, 0), selisihnya menjadi 782.200, angka yang menyesatkan karena tidak ada pesanan sebelumnya." },
      ],
    },
    {
      title: "Window function tidak bisa dipakai di WHERE",
      html: `<p>Query di bawah mencoba mengambil produk termahal di setiap kategori langsung di WHERE:</p>
<pre class="sql"><code>select product_id, category_id, list_price
from app.products
where row_number() over (partition by category_id order by list_price desc) = 1;

ERROR 42P20: window functions are not allowed in WHERE</code></pre>
<p>Window function dihitung setelah WHERE, GROUP BY, dan HAVING, jadi ketiganya belum bisa melihat hasilnya. Di HAVING, PostgreSQL menolaknya dengan pesan serupa. Window function hanya boleh ditulis di SELECT dan ORDER BY. Alias dari SELECT juga tidak bisa dipakai di WHERE, seperti di bab 5.</p>
<p>Caranya: hitung window function di dalam subquery atau CTE dan beri alias, lalu saring alias itu di query luar. Pola ini dipakai untuk tiga pertanyaan yang sangat sering muncul di wawancara kerja:</p>
<ul><li><b>Top-N per kelompok</b>: N baris teratas di setiap kelompok, misalnya produk termahal per kategori. Saring <code>urutan &lt;= N</code>.</li>
<li><b>Baris pertama atau terbaru per kunci</b>: misalnya potret pertama setiap pelanggan di <code>raw.customer_snapshot</code>. Urutkan menurut tanggal (menurun dengan DESC untuk yang terbaru), lalu ambil <code>urutan = 1</code>.</li>
<li><b>Nilai tertinggi ke-N</b>: pakai DENSE_RANK, supaya nilai yang seri dihitung satu kali.</li></ul>
<p>Pilih fungsinya dengan sadar. ROW_NUMBER selalu memberi tepat N baris per kelompok, walaupun ada nilai seri di batasnya; baris seri yang terpotong dipilih tanpa aturan, kecuali kamu menambahkan kolom penentu. RANK dan DENSE_RANK menyertakan semua baris seri, sehingga hasilnya bisa lebih dari N. Untuk nilai tertinggi ke-N, RANK bisa memberi hasil kosong: di contoh ketiga, tidak ada pelanggan dengan RANK 3, karena dua pelanggan seri di peringkat 2.</p>`,
      examples: [
        { sql: "select category_id, product_id, product_name, list_price\nfrom (\n  select category_id, product_id, product_name, list_price,\n         row_number() over (partition by category_id order by list_price desc, product_id) as urutan\n  from app.products\n) as p\nwhere urutan = 1\norder by category_id;", note: "13 baris, satu produk termahal untuk setiap kategori yang punya produk. Termahal di kategori 4 (Speaker) adalah produk 22 seharga 834.900." },
        { sql: "with berurutan as (\n  select customer_id, snapshot_date, segment,\n         row_number() over (partition by customer_id order by snapshot_date) as urutan\n  from raw.customer_snapshot\n)\nselect customer_id, snapshot_date, segment\nfrom berurutan\nwhere urutan = 1\norder by customer_id\nlimit 10;", note: "Tanpa LIMIT, hasilnya 1.500 baris, satu per pelanggan. Sebanyak 1.230 pelanggan muncul pertama kali di potret 31 Januari 2025; sisanya di potret bulan-bulan berikutnya." },
        { sql: "with per_pelanggan as (\n  select customer_id, count(*) as jumlah_pesanan\n  from app.orders\n  group by customer_id\n), berperingkat as (\n  select customer_id, jumlah_pesanan,\n         dense_rank() over (order by jumlah_pesanan desc) as peringkat\n  from per_pelanggan\n)\nselect customer_id, jumlah_pesanan\nfrom berperingkat\nwhere peringkat = 3;", note: "Jumlah pesanan terbanyak ketiga adalah 30, milik pelanggan 78. Kalau DENSE_RANK diganti RANK, hasilnya kosong, karena RANK melompat dari 2 ke 4." },
      ],
    },
  ],
  tsql: [
    { pg: "fungsi(…) over (partition by … order by …)", tsql: "fungsi(…) OVER (PARTITION BY … ORDER BY …)", note: "Sintaksnya sama. Aturan bawaannya juga sama: dengan ORDER BY di dalam OVER, fungsi agregasi menghitung dari awal partisi sampai baris sekarang, termasuk baris yang seri; tanpa ORDER BY, seluruh partisi." },
    { pg: "row_number() over (), rank() over ()", tsql: "ROW_NUMBER() OVER (ORDER BY …)", note: "PostgreSQL membolehkan ROW_NUMBER, RANK, DENSE_RANK, LAG, dan LEAD tanpa ORDER BY di dalam OVER. Di SQL Server, ORDER BY di dalam OVER wajib untuk kelima fungsi itu." },
    { pg: "lag(x), lead(x), lag(x, n, pengganti)", tsql: "LAG(x), LEAD(x), LAG(x, n, pengganti)", note: "Sama, tersedia sejak SQL Server 2012. SQL Server 2022 ke atas juga punya pilihan IGNORE NULLS untuk melewati nilai NULL; PostgreSQL 18 belum mendukungnya (error sintaks)." },
    { pg: "order_ts::date - lag(order_ts::date) over (…)", tsql: "DATEDIFF(day, LAG(order_ts) OVER (…), order_ts)", note: "Seperti di bab 4, SQL Server memakai DATEDIFF untuk jarak hari." },
    { pg: "row_number(), rank(), dense_rank() bertipe bigint", tsql: "bertipe bigint", note: "Sama di keduanya." },
    { pg: "avg(qty) over (…) menghasilkan numeric", tsql: "AVG(qty) OVER (…) menghasilkan int", note: "Sama seperti AVG biasa di bab 5: di SQL Server, AVG kolom int menghasilkan int. Ubah tipenya dulu, misalnya AVG(qty * 1.0) OVER (…)." },
    { pg: "ERROR 42P20: window functions are not allowed in WHERE", tsql: "Msg 4108: Windowed functions can only appear in the SELECT or ORDER BY clauses.", note: "Aturannya sama, dan cara mengatasinya juga sama: hitung di subquery atau CTE, lalu saring di query luar." },
    { pg: "count(distinct x) over (…) → ERROR 0A000: DISTINCT is not implemented for window functions", tsql: "COUNT(DISTINCT x) OVER (…) juga ditolak", note: "Keduanya tidak membolehkan DISTINCT di dalam fungsi agregasi yang memakai OVER." },
  ],
  summary: [
    "Window function menghitung nilai untuk setiap baris dari jendelanya, tanpa meringkas baris. Ditulis dengan <code>OVER (…)</code>; <code>OVER ()</code> berarti seluruh hasil query.",
    "<code>PARTITION BY</code> membagi baris menjadi partisi. Pola persentase: <code>100.0 * x / sum(x) over (partition by kelompok)</code>.",
    "ORDER BY di dalam OVER menentukan urutan di dalam jendela, bukan urutan tampilan hasil.",
    "Saat ada nilai seri: ROW_NUMBER tetap memberi nomor berbeda (tambahkan kolom unik supaya pasti), RANK memberi angka sama lalu melompat, DENSE_RANK memberi angka sama tanpa lompatan.",
    "<code>SUM(x) OVER (ORDER BY …)</code> adalah total berjalan. Baris yang seri dijumlahkan bersamaan dan mendapat angka yang sama.",
    "<code>LAG</code> dan <code>LEAD</code> mengambil nilai dari baris sebelum dan sesudahnya; hasilnya NULL kalau baris itu tidak ada.",
    "Window function dihitung setelah WHERE, GROUP BY, dan HAVING, jadi tidak bisa dipakai di sana. Hitung di subquery atau CTE, lalu saring di query luar.",
  ],
  drills: [
    { id: "sql-09-01", kind: "choice", prompt: "Tabel <code>app.orders</code> berisi 12.007 baris. Berapa baris hasil <code>select order_id, count(*) over () from app.orders</code>?",
      options: ["1", "12.007", "Error, karena order_id tidak ada di GROUP BY", "Tergantung jumlah pelanggan"], answer: 1,
      why: "Window function tidak meringkas baris. Setiap pesanan tetap menjadi satu baris, dan kolom count berisi 12.007 di setiap baris. Error 42803 hanya muncul untuk fungsi agregasi tanpa OVER.", hint: "Apa beda window function dengan GROUP BY?" },
    { id: "sql-09-02", kind: "choice", prompt: "Jumlah pesanan empat pelanggan, diurutkan dari terbanyak: 35, 31, 31, 30. Berapa <code>RANK()</code> dan <code>DENSE_RANK()</code> untuk pelanggan dengan 30 pesanan?",
      options: ["RANK 3, DENSE_RANK 3", "RANK 4, DENSE_RANK 3", "RANK 4, DENSE_RANK 4", "RANK 3, DENSE_RANK 4"], answer: 1,
      why: "Dua pelanggan seri di peringkat 2. RANK melompati angka 3, sehingga pelanggan berikutnya mendapat 4. DENSE_RANK tidak melompat, sehingga pelanggan itu mendapat 3. Ini persis data pelanggan 655, 841, 1156, dan 78.", hint: "RANK = nomor baris pertama di kelompok serinya." },
    { id: "sql-09-03", kind: "choice", prompt: "Ada tiga pesanan tanggal 1 Oktober dan dua pesanan tanggal 2 Oktober, tanpa pesanan lain. Apa isi <code>count(*) over (order by tanggal)</code> untuk ketiga pesanan tanggal 1 Oktober?",
      options: ["1, 2, 3", "3, 3, 3", "5, 5, 5", "1, 1, 1"], answer: 1,
      why: "Dengan ORDER BY di dalam OVER, hitungannya sampai baris sekarang ditambah semua baris yang seri dengannya. Ketiga pesanan tanggal 1 Oktober seri, jadi semuanya mendapat 3. Pesanan tanggal 2 Oktober mendapat 5.", hint: "Baris yang nilai urutannya sama dihitung bersamaan." },
    { id: "sql-09-04", kind: "sql", prompt: "Tampilkan semua pesanan pelanggan 655: <code>order_id</code>, <code>order_ts</code>, dan nomor urut pesanan itu bagi pelanggannya (pesanan paling awal = 1).",
      solution: "select order_id, order_ts, row_number() over (order by order_ts) as pesanan_ke from app.orders where customer_id = 655",
      why: "ROW_NUMBER dengan ORDER BY order_ts memberi nomor 1 untuk pesanan paling awal. PARTITION BY tidak wajib di sini karena WHERE sudah hanya menyisakan satu pelanggan; menulis partition by customer_id juga benar.", hint: "row_number() over (order by …)" },
    { id: "sql-09-05", kind: "sql", prompt: "Untuk isi pesanan nomor 100001 sampai 100010, tampilkan <code>order_id</code>, <code>line_no</code>, nilai bersih baris (<code>qty * unit_price - discount</code>), dan persentase nilai baris itu terhadap total pesanannya, dibulatkan 1 digit di belakang koma.",
      solution: "select order_id, line_no, qty * unit_price - discount as nilai, round(100.0 * (qty * unit_price - discount) / sum(qty * unit_price - discount) over (partition by order_id), 1) as persen from app.order_items where order_id between 100001 and 100010",
      why: "SUM … OVER (PARTITION BY order_id) memberi total pesanan di setiap baris tanpa meringkas, sehingga nilai baris bisa dibagi totalnya. Hasilnya 20 baris.", hint: "Bagi nilai baris dengan sum(…) over (partition by order_id), dan kalikan 100.0." },
    { id: "sql-09-06", kind: "sql", prompt: "Untuk semua produk, tampilkan <code>product_id</code>, <code>category_id</code>, <code>list_price</code>, dan rata-rata <code>list_price</code> di kategorinya, dibulatkan 2 digit di belakang koma.",
      solution: "select product_id, category_id, list_price, round(avg(list_price) over (partition by category_id), 2) as rata_kategori from app.products",
      why: "AVG … OVER (PARTITION BY category_id) menghitung rata-rata per kategori dan menaruhnya di setiap baris produk. Hasilnya tetap 150 baris, satu per produk.", hint: "avg(…) over (partition by …)" },
    { id: "sql-09-07", kind: "sql", level: "menengah", prompt: "Untuk setiap bulan di tahun 2025, tampilkan bulan (bertipe date, tanggal 1 di bulan itu), jumlah pesanan bulan itu, dan jumlah pesanan berjalan sejak Januari 2025.",
      solution: "with bulanan as (select date_trunc('month', order_ts)::date as bulan, count(*) as jumlah from app.orders where order_ts >= '2025-01-01' group by date_trunc('month', order_ts)::date) select bulan, jumlah, sum(jumlah) over (order by bulan) as jumlah_berjalan from bulanan",
      why: "Ringkas dulu per bulan di CTE, lalu SUM … OVER (ORDER BY bulan) menjumlahkan dari bulan pertama sampai bulan sekarang. Setiap bulan hanya muncul sekali, jadi tidak ada baris seri. Angka Oktober adalah 5.620, jumlah seluruh pesanan 2025.",
      hint: "CTE dengan GROUP BY per bulan, lalu sum(jumlah) over (order by bulan)." },
    { id: "sql-09-08", kind: "sql", level: "menengah", prompt: "Untuk semua pesanan pelanggan nomor 1 sampai 10, tampilkan <code>customer_id</code>, <code>order_id</code>, tanggal pesanan (tanpa jam), dan jarak hari sejak pesanan sebelumnya dari pelanggan yang sama (NULL untuk pesanan pertama).",
      solution: "select customer_id, order_id, order_ts::date as tanggal, order_ts::date - lag(order_ts::date) over (partition by customer_id order by order_ts) as jarak_hari from app.orders where customer_id <= 10",
      why: "LAG mengambil tanggal pesanan sebelumnya di partisi pelanggan yang sama, menurut order_ts. Tanggal dikurangi tanggal menghasilkan jumlah hari. Untuk pesanan pertama, LAG menghasilkan NULL, sehingga selisihnya juga NULL.",
      hint: "lag(order_ts::date) over (partition by customer_id order by order_ts)" },
    { id: "sql-09-09", kind: "fix", prompt: "Query ini seharusnya menampilkan potret terbaru setiap pelanggan dari <code>raw.customer_snapshot</code>: <code>customer_id</code>, <code>snapshot_date</code>, dan <code>segment</code>. Ternyata query-nya error. Perbaiki tanpa menulis tanggal secara langsung.",
      start: "select customer_id, snapshot_date, segment\nfrom raw.customer_snapshot\nwhere row_number() over (partition by customer_id order by snapshot_date desc) = 1;",
      solution: "select customer_id, snapshot_date, segment from (select customer_id, snapshot_date, segment, row_number() over (partition by customer_id order by snapshot_date desc) as urutan from raw.customer_snapshot) as s where urutan = 1",
      why: "Window function dihitung setelah WHERE, jadi tidak boleh ditulis di WHERE (error 42P20). Hitung ROW_NUMBER di subquery atau CTE dengan alias, lalu saring urutan = 1 di query luar. Hasilnya 1.500 baris; potret terbaru semua pelanggan ternyata 31 Oktober 2025.",
      hint: "Pindahkan row_number() ke dalam subquery, beri alias, lalu saring alias itu di luar." },
    { id: "sql-09-10", kind: "number", prompt: "Di <code>raw.customer_snapshot</code>, bandingkan segmen setiap potret dengan segmen potret sebelumnya untuk pelanggan yang sama. Berapa kali segmennya berbeda dari potret sebelumnya?",
      answerSql: "select count(*) from (select segment, lag(segment) over (partition by customer_id order by snapshot_date) as segmen_sebelumnya from raw.customer_snapshot) as s where segmen_sebelumnya <> segment",
      why: "LAG mengambil segmen potret sebelumnya di partisi pelanggan yang sama. Potret pertama setiap pelanggan menghasilkan NULL, dan NULL <> segment bernilai tidak diketahui, sehingga tidak ikut dihitung. Query-nya: select count(*) from (select segment, lag(segment) over (partition by customer_id order by snapshot_date) as segmen_sebelumnya from raw.customer_snapshot) as s where segmen_sebelumnya <> segment.",
      hint: "Hitung LAG di subquery, lalu saring dan hitung di query luar." },
    { id: "sql-09-11", kind: "sql", level: "wawancara", prompt: "Tampilkan 3 produk terlaris di setiap kategori. Terlaris = jumlah <code>qty</code> terbanyak dari <code>app.order_items</code>, tanpa pesanan berstatus <code>cancelled</code>. Kalau jumlahnya seri, pilih <code>product_id</code> yang lebih kecil. Tampilkan <code>category_id</code>, <code>product_id</code>, dan jumlah qty-nya.",
      solution: "with terjual as (\n  select p.category_id, p.product_id, sum(oi.qty) as total_qty\n  from app.order_items as oi\n  join app.orders as o on o.order_id = oi.order_id\n  join app.products as p on p.product_id = oi.product_id\n  where o.status <> 'cancelled'\n  group by p.category_id, p.product_id\n), berperingkat as (\n  select category_id, product_id, total_qty,\n         row_number() over (partition by category_id order by total_qty desc, product_id) as urutan\n  from terjual\n)\nselect category_id, product_id, total_qty\nfrom berperingkat\nwhere urutan <= 3",
      why: "Pola top-N per kelompok. CTE pertama meringkas qty per produk. CTE kedua memberi nomor di setiap kategori, dari qty terbanyak, dengan product_id sebagai penentu kalau seri. Query luar mengambil nomor 1 sampai 3. Hasilnya 39 baris: 13 kategori kali 3 produk.",
      hint: "Ringkas dulu per produk, lalu row_number() over (partition by category_id order by …) di CTE kedua, lalu saring di luar." },
    { id: "sql-09-12", kind: "sql", level: "wawancara", prompt: "Tampilkan <code>customer_id</code> dan jumlah pesanan untuk pelanggan dengan jumlah pesanan terbanyak <b>kedua</b>. Kalau beberapa pelanggan seri di posisi itu, tampilkan semuanya.",
      solution: "with per_pelanggan as (\n  select customer_id, count(*) as jumlah_pesanan\n  from app.orders\n  group by customer_id\n), berperingkat as (\n  select customer_id, jumlah_pesanan,\n         dense_rank() over (order by jumlah_pesanan desc) as peringkat\n  from per_pelanggan\n)\nselect customer_id, jumlah_pesanan\nfrom berperingkat\nwhere peringkat = 2",
      why: "Nilai tertinggi kedua adalah nilai berbeda kedua, jadi pakai DENSE_RANK. Hasilnya dua pelanggan, 841 dan 1156, masing-masing 31 pesanan. ROW_NUMBER = 2 hanya memberi salah satunya, dan pilihannya tanpa aturan. Di sini RANK = 2 kebetulan sama, tetapi untuk posisi ketiga RANK memberi hasil kosong.",
      hint: "Ringkas per pelanggan dulu, lalu pilih fungsi peringkat yang tidak melompat dan tidak memisahkan nilai seri." },
    { id: "sql-09-13", kind: "sql", level: "wawancara", prompt: "Tampilkan pesanan terakhir setiap pelanggan yang pernah memesan: <code>customer_id</code>, <code>order_id</code>, <code>order_ts</code>, dan <code>status</code>.",
      solution: "select customer_id, order_id, order_ts, status\nfrom (\n  select customer_id, order_id, order_ts, status,\n         row_number() over (partition by customer_id order by order_ts desc) as urutan\n  from app.orders\n) as o\nwhere urutan = 1",
      why: "Pola baris terbaru per kunci: partisi per pelanggan, urutkan order_ts menurun, ambil nomor 1. Hasilnya 1.410 baris, satu per pelanggan yang pernah memesan. Tidak ada pelanggan dengan dua pesanan di order_ts yang sama persis, jadi hasilnya pasti.",
      hint: "row_number() over (partition by customer_id order by order_ts desc) di subquery, lalu saring urutan = 1." },
    { id: "sql-09-14", kind: "explain", prompt: "Manajer meminta \"3 produk termahal di setiap kategori\". Di satu kategori, produk ke-3 dan ke-4 harganya sama persis. Jelaskan apa yang terjadi kalau kamu memakai ROW_NUMBER, RANK, atau DENSE_RANK, dan apa yang perlu kamu tanyakan ke manajer.",
      model: "Dengan ROW_NUMBER, setiap kategori pasti mendapat tepat 3 produk, tetapi salah satu dari dua produk yang seri dibuang tanpa aturan, kecuali aku menambahkan kolom penentu seperti product_id. Dengan RANK, kedua produk seri mendapat peringkat 3, jadi kategori itu menampilkan 4 produk. Dengan DENSE_RANK, keduanya juga mendapat 3, dan kalau ada nilai seri di atasnya, produk dengan harga ketiga yang berbeda pun ikut, sehingga barisnya bisa lebih banyak lagi. Aku akan bertanya ke manajer: kalau ada harga yang sama, apakah semua produk seri ditampilkan, atau tepat 3 produk dengan aturan tertentu untuk memilih?",
      hint: "Bandingkan jumlah baris yang dihasilkan setiap fungsi saat ada nilai seri di batas 3." },
  ],
};
