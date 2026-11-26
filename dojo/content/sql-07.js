// Bab 7 SQL: subquery, EXISTS, ANY/ALL, tabel turunan, dan operasi himpunan.
export default {
  id: "sql-07",
  part: "sql",
  title: "Subquery, EXISTS, dan operasi himpunan",
  minutes: 90,
  goals: [
    "Menulis subquery skalar di WHERE dan SELECT, dan subquery untuk <code>IN</code>.",
    "Menulis subquery berkorelasi, serta memakai <code>EXISTS</code> dan <code>NOT EXISTS</code> untuk mencari baris yang punya atau tidak punya pasangan.",
    "Menjelaskan kenapa <code>NOT IN</code> memberi hasil kosong kalau subquery berisi NULL, dan cara menghindarinya.",
    "Membandingkan nilai dengan banyak hasil subquery memakai <code>ANY</code> dan <code>ALL</code>.",
    "Memakai tabel turunan (subquery di FROM) untuk meringkas hasil ringkasan, dan untuk menjumlah dua tabel \"banyak\" tanpa angka berlipat.",
    "Menggabung dan membandingkan hasil dua query dengan <code>UNION</code>, <code>UNION ALL</code>, <code>INTERSECT</code>, dan <code>EXCEPT</code>.",
  ],
  terms: [
    { term: "subquery", def: "Query SELECT yang ditulis di dalam query lain, di dalam tanda kurung. Query yang membungkusnya disebut query luar. Disebut juga query dalam." },
    { term: "subquery skalar", def: "Subquery yang menghasilkan tepat satu baris dan satu kolom, yaitu satu nilai. Boleh dipakai di mana pun sebuah nilai boleh ditulis." },
    { term: "subquery berkorelasi", def: "Subquery yang memakai kolom dari query luar, sehingga hasilnya bergantung pada baris luar yang sedang diperiksa. Secara konsep dihitung ulang untuk setiap baris query luar." },
    { term: "tabel turunan", def: "Subquery yang ditulis di FROM dan dipakai seperti tabel biasa. Tabelnya hanya ada selama query berjalan. Dalam bahasa Inggris disebut <i>derived table</i>." },
    { term: "operasi himpunan", def: "Perintah yang menggabung atau membandingkan baris hasil dua query: <code>UNION</code>, <code>UNION ALL</code>, <code>INTERSECT</code>, dan <code>EXCEPT</code>. Kedua query harus punya jumlah kolom yang sama dan tipe data yang cocok." },
  ],
  introduces: ["SUBQUERY", "EXISTS", "NOT EXISTS", "ANY", "ALL", "UNION", "UNION ALL", "INTERSECT", "EXCEPT"],
  sections: [
    {
      title: "Subquery: query di dalam query",
      html: `<p><b>Subquery</b> adalah query SELECT yang ditulis di dalam query lain, selalu di dalam tanda kurung. Query yang membungkusnya disebut <i>query luar</i>; subquery-nya disebut juga <i>query dalam</i>. Awalan <i>sub</i>, seperti pada kata subbab, berarti bagian dari sesuatu yang lebih besar.</p>
<p>Bentuk paling sederhana adalah <b>subquery skalar</b>: subquery yang menghasilkan tepat satu baris dan satu kolom, yaitu satu nilai. Kata <i>skalar</i> berarti nilai tunggal. Subquery skalar boleh ditulis di mana pun sebuah nilai boleh ditulis: di WHERE, di SELECT, atau di dalam rumus.</p>
<p>Contoh: produk yang harganya di atas rata-rata semua produk. Tanpa subquery, kamu menjalankan dua query: satu untuk menghitung rata-rata (146.373,33), lalu menyalin angkanya ke query kedua. Dengan subquery, keduanya ditulis sekali. Hasilnya 50 dari 150 produk.</p>
<p>Kesalahan umum: subquery skalar menghasilkan lebih dari satu baris. PostgreSQL menolaknya dengan pesan <code>more than one row returned by a subquery used as an expression</code> (subquery yang dipakai sebagai nilai mengembalikan lebih dari satu baris). Sebaliknya, kalau subquery skalar tidak menghasilkan baris sama sekali, tidak ada error: nilainya dianggap NULL.</p>`,
      examples: [
        { sql: "select product_id, product_name, list_price\nfrom app.products\nwhere list_price > (select avg(list_price) from app.products)\norder by list_price desc;", note: "50 baris. Subquery di dalam kurung menghasilkan satu angka, lalu setiap produk dibandingkan dengan angka itu." },
        { sql: "select product_name, list_price,\n       round((select avg(list_price) from app.products), 2) as rata_rata,\n       round(list_price - (select avg(list_price) from app.products), 2) as selisih\nfrom app.products\norder by product_id\nlimit 5;", note: "Subquery skalar di SELECT: nilainya sama untuk setiap baris, dan bisa dipakai di dalam rumus." },
      ],
    },
    {
      title: "IN (subquery): daftar dari query lain",
      html: `<p>Di Bab 2, <code>IN</code> memeriksa nilai terhadap daftar yang kamu ketik sendiri, misalnya <code>in (1, 6, 10)</code>. Daftar itu juga bisa berasal dari subquery. Subquery untuk IN boleh menghasilkan banyak baris, tetapi hanya satu kolom.</p>
<p>Contoh: pelanggan yang memesan di bulan Oktober 2025. Subquery mengambil <code>customer_id</code> dari pesanan Oktober; query luar mengambil pelanggan yang nomornya ada di daftar itu. Hasilnya 454 pelanggan.</p>
<p>Bandingkan dengan JOIN. <code>app.customers</code> JOIN pesanan Oktober menghasilkan 590 baris untuk 454 pelanggan, karena pelanggan yang memesan dua kali muncul dua kali. IN tidak menyalin baris query luar: setiap pelanggan muncul paling banyak sekali. Pakai IN (atau EXISTS, di bawah) kalau pertanyaannya "yang punya pasangan" dan kamu tidak butuh kolom dari tabel lain. Pakai JOIN kalau kolom dari kedua tabel dibutuhkan.</p>
<p>Kesalahan umum: salah menulis nama kolom di subquery. <code>where product_id in (select product_id from app.categories)</code> tidak error, padahal <code>app.categories</code> tidak punya kolom <code>product_id</code>. Kalau sebuah kolom tidak ditemukan di tabel subquery, database mencarinya di tabel query luar. Di sini <code>product_id</code> dibaca sebagai kolom <code>app.products</code>, syaratnya selalu benar (karena <code>app.categories</code> berisi 22 baris), dan hasilnya semua 150 produk. Tulis alias di depan setiap kolom di subquery. Dengan <code>select c.product_id from app.categories as c</code>, kesalahannya langsung ditolak: <code>column c.product_id does not exist</code>.</p>`,
      examples: [
        { sql: "select c.customer_id, c.full_name, c.segment\nfrom app.customers as c\nwhere c.customer_id in (\n  select o.customer_id\n  from app.orders as o\n  where o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01'\n)\norder by c.customer_id;", note: "454 baris, satu per pelanggan." },
        { sql: "select count(*) as jumlah_baris,\n       count(distinct c.customer_id) as jumlah_pelanggan\nfrom app.customers as c\njoin app.orders as o on o.customer_id = c.customer_id\nwhere o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01';", note: "Dengan JOIN: 590 baris untuk 454 pelanggan yang sama." },
      ],
    },
    {
      title: "Subquery berkorelasi",
      html: `<p>Subquery di atas bisa dijalankan sendiri, terpisah dari query luar. <b>Subquery berkorelasi</b> berbeda: ia memakai kolom dari query luar, sehingga hasilnya bergantung pada baris luar yang sedang diperiksa. Kata <i>korelasi</i> berarti hubungan. Secara konsep, subquery ini dihitung ulang untuk setiap baris query luar, memakai nilai kolom luar baris itu.</p>
<p>Contoh pertama menghitung jumlah pesanan dan waktu pesanan terakhir untuk pelanggan 13 sampai 15. Syarat <code>o.customer_id = c.customer_id</code> menghubungkan subquery dengan baris pelanggan di luar. Hasilnya sama dengan contoh LEFT JOIN di Bab 6: 5, 0, dan 6 pesanan. Perhatikan pelanggan 14: COUNT atas nol baris menghasilkan 0, sedangkan MAX atas nol baris menghasilkan NULL.</p>
<p>Subquery berkorelasi juga bisa ditulis di WHERE. Contoh kedua mencari produk yang harganya di atas rata-rata kategorinya sendiri. Tabel yang sama dipakai dua kali, jadi alias wajib: <code>p</code> untuk produk di luar, <code>p2</code> untuk produk sekategori di dalam. Hasilnya 67 produk.</p>`,
      examples: [
        { sql: "select c.customer_id, c.full_name,\n       (select count(*) from app.orders as o where o.customer_id = c.customer_id) as jumlah_pesanan,\n       (select max(o.order_ts) from app.orders as o where o.customer_id = c.customer_id) as pesanan_terakhir\nfrom app.customers as c\nwhere c.customer_id between 13 and 15\norder by c.customer_id;", note: "Pelanggan 14 tidak punya pesanan: jumlah_pesanan 0, pesanan_terakhir NULL." },
        { sql: "select p.product_id, p.product_name, p.category_id, p.list_price\nfrom app.products as p\nwhere p.list_price > (\n  select avg(p2.list_price)\n  from app.products as p2\n  where p2.category_id = p.category_id\n)\norder by p.category_id, p.list_price desc;", note: "67 baris. Rata-rata yang dipakai berbeda untuk setiap kategori." },
      ],
    },
    {
      title: "EXISTS dan NOT EXISTS",
      html: `<p><code>EXISTS (subquery)</code> bernilai benar kalau subquery menghasilkan minimal satu baris, dan salah kalau tidak ada baris sama sekali. Kata Inggris <i>exists</i> berarti ada. Kolom yang dipilih subquery tidak penting, karena yang diperiksa hanya ada atau tidaknya baris. Kebiasaan umum adalah menulis <code>select 1</code>.</p>
<p>EXISTS hampir selalu dipakai dengan subquery berkorelasi. Contoh pertama mencari pelanggan yang memesan lewat aplikasi iOS di bulan Oktober 2025: 122 pelanggan. Seperti IN, setiap pelanggan muncul sekali.</p>
<p><code>NOT EXISTS</code> kebalikannya: benar kalau subquery tidak menghasilkan baris. Inilah cara kedua menulis anti-join dari Bab 6, dan biasanya lebih mudah dibaca: "produk yang tidak ada di pesanan Oktober". Setiap produk dari 150 produk pernah muncul di <code>app.order_items</code>, tetapi 13 produk tidak muncul di pesanan bulan Oktober 2025. Sembilan di antaranya memang sudah tidak dijual (<code>is_active</code> false).</p>`,
      examples: [
        { sql: "select c.customer_id, c.full_name\nfrom app.customers as c\nwhere exists (\n  select 1\n  from app.orders as o\n  where o.customer_id = c.customer_id\n    and o.channel = 'ios'\n    and o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01'\n)\norder by c.customer_id;", note: "122 baris." },
        { sql: "select p.product_id, p.product_name, p.is_active\nfrom app.products as p\nwhere not exists (\n  select 1\n  from app.order_items as oi\n  join app.orders as o on o.order_id = oi.order_id\n  where oi.product_id = p.product_id\n    and o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01'\n)\norder by p.product_id;", note: "13 baris: 4 produk aktif dan 9 produk yang sudah tidak dijual." },
      ],
    },
    {
      title: "NOT IN dan NULL: jebakan yang sering ditanyakan",
      html: `<p>Pertanyaan: karyawan mana yang tidak pernah menangani pesanan? Bab 6 menemukan 10 orang. Dengan NOT IN, query-nya terlihat wajar, tetapi hasilnya kosong.</p>
<p>Penyebabnya NULL. Kolom <code>handled_by</code> kosong untuk 10.589 pesanan, sehingga hasil subquery ikut berisi NULL. <code>x NOT IN (a, b, NULL)</code> sama artinya dengan <code>x &lt;&gt; a AND x &lt;&gt; b AND x &lt;&gt; NULL</code>. Bagian terakhir selalu <i>tidak diketahui</i> (logika tiga nilai dari Bab 2). Untuk karyawan yang tidak ada di daftar, hasilnya tidak diketahui, bukan benar, sehingga WHERE membuangnya. Untuk karyawan yang ada di daftar, hasilnya salah. Tidak ada satu baris pun yang lolos.</p>
<p>Dua cara memperbaikinya:</p>
<ul><li>Pakai NOT EXISTS. NOT EXISTS hanya bertanya apakah ada baris pasangan, sehingga NULL di <code>handled_by</code> tidak berpengaruh.</li>
<li>Kalau tetap memakai NOT IN, buang NULL di dalam subquery dengan <code>where o.handled_by is not null</code>.</li></ul>
<p>IN tanpa NOT tidak terganggu masalah ini di WHERE. Kalau nilainya cocok, hasilnya benar. Kalau tidak cocok dan daftar berisi NULL, hasilnya tidak diketahui, dan barisnya terbuang, sama seperti kalau hasilnya salah. Aturan praktis: untuk pertanyaan "tidak punya pasangan", biasakan NOT EXISTS.</p>`,
      examples: [
        { sql: "select s.staff_id, s.full_name\nfrom app.staff as s\nwhere s.staff_id not in (select o.handled_by from app.orders as o);", note: "Kosong, padahal ada 10 karyawan yang tidak pernah menangani pesanan.", expectEmpty: true },
        { sql: "select s.staff_id, s.full_name, s.role\nfrom app.staff as s\nwhere not exists (\n  select 1 from app.orders as o where o.handled_by = s.staff_id\n)\norder by s.staff_id;", note: "10 baris: karyawan nomor 1 sampai 10." },
        { sql: "select s.staff_id, s.full_name, s.role\nfrom app.staff as s\nwhere s.staff_id not in (\n  select o.handled_by from app.orders as o where o.handled_by is not null\n)\norder by s.staff_id;", note: "Setelah NULL dibuang dari subquery, NOT IN memberi 10 baris yang sama." },
      ],
    },
    {
      title: "ANY dan ALL: membandingkan dengan setiap hasil",
      html: `<p>Operator perbandingan biasa (<code>&gt;</code>, <code>=</code>, dan lainnya) hanya bisa dipakai dengan subquery skalar. Untuk subquery yang menghasilkan banyak baris, tambahkan <code>ANY</code> atau <code>ALL</code> setelah operatornya:</p>
<ul><li><code>&gt; ALL (subquery)</code>: lebih besar dari <i>semua</i> hasil subquery, artinya lebih besar dari nilai terbesarnya. Kata Inggris <i>all</i> berarti semua.</li>
<li><code>&gt; ANY (subquery)</code>: lebih besar dari <i>setidaknya satu</i> hasil, artinya lebih besar dari nilai terkecilnya. Kata Inggris <i>any</i> berarti salah satu. <code>SOME</code> adalah nama lain untuk ANY.</li>
<li><code>= ANY</code> sama dengan IN, dan <code>&lt;&gt; ALL</code> sama dengan NOT IN, termasuk jebakan NULL-nya.</li></ul>
<p>Contoh: kategori 7 (Casing &amp; Pelindung) berisi 12 produk dengan harga 24.900 sampai 110.900. Ada 67 produk yang lebih mahal dari semua produk kategori 7, dan 145 produk yang lebih mahal dari setidaknya satu produknya. Lima produk sisanya berharga 24.900 atau kurang.</p>
<p>Hati-hati kalau subquery tidak menghasilkan baris. ALL atas nol baris bernilai <i>benar</i>, dan ANY atas nol baris bernilai <i>salah</i>. Kategori 1 (Elektronik) tidak punya produk langsung; produk elektronik tercatat di kategori yang lebih rinci, misalnya Earphone (3) dan Speaker (4). Akibatnya, "lebih mahal dari semua produk kategori 1" meloloskan semua 150 produk. Periksa dulu bahwa subquery memang berisi baris sebelum memakai ALL.</p>`,
      examples: [
        { sql: "select product_id, product_name, list_price\nfrom app.products\nwhere list_price > all (select list_price from app.products where category_id = 7)\norder by list_price\nlimit 10;", note: "Produk termurah di hasil ini lebih mahal dari 110.900, harga tertinggi di kategori 7." },
        { sql: "select count(*) filter (where list_price > all (select list_price from app.products where category_id = 7)) as lebih_dari_semua,\n       count(*) filter (where list_price > any (select list_price from app.products where category_id = 7)) as lebih_dari_salah_satu,\n       count(*) filter (where list_price > all (select list_price from app.products where category_id = 1)) as all_subquery_kosong,\n       count(*) filter (where list_price > any (select list_price from app.products where category_id = 1)) as any_subquery_kosong\nfrom app.products;", note: "67, 145, 150, dan 0. Dua kolom terakhir menunjukkan hasil ALL dan ANY saat subquery kosong." },
      ],
    },
    {
      title: "Subquery di FROM: tabel turunan",
      html: `<p>Hasil sebuah query juga berbentuk tabel: baris dan kolom. Karena itu, subquery bisa ditulis di FROM, lalu dipakai seperti tabel biasa. Subquery di FROM disebut <b>tabel turunan</b> (<i>derived table</i>), karena tabelnya diturunkan dari query lain dan hanya ada selama query itu berjalan.</p>
<p>Tabel turunan dibutuhkan untuk meringkas hasil ringkasan. Contoh: berapa rata-rata jumlah pesanan per pelanggan? Langkah pertama menghitung jumlah pesanan setiap pelanggan dengan GROUP BY. Langkah kedua merata-ratakan angka itu. <code>avg(count(*))</code> ditolak dengan pesan <code>aggregate function calls cannot be nested</code> (fungsi agregasi tidak boleh bersarang), jadi langkah pertama ditaruh di tabel turunan. Hasilnya 8,52 pesanan, dihitung dari 1.410 pelanggan yang pernah memesan.</p>
<p>Grain tabel turunan ini satu baris per pelanggan, dan ia bisa di-JOIN ke tabel lain. Contoh kedua menggabungkannya dengan <code>app.customers</code> untuk melihat rata-rata per segmen: Gold 8,91, Silver 8,59, dan Reguler 8,41.</p>
<p>Soal alias: standar SQL mewajibkan alias untuk tabel turunan, misalnya <code>as per_pelanggan</code>. PostgreSQL sejak versi 16 mengizinkan alias dihilangkan, tetapi SQL Server tetap mewajibkannya. Selalu tulis alias, supaya query-mu jalan di kedua dialek dan kolomnya bisa dirujuk dengan jelas.</p>`,
      examples: [
        { sql: "select count(*) as jumlah_pelanggan,\n       round(avg(per_pelanggan.jumlah_pesanan), 2) as rata_rata_pesanan\nfrom (\n  select customer_id, count(*) as jumlah_pesanan\n  from app.orders\n  group by customer_id\n) as per_pelanggan;", note: "1.410 pelanggan, rata-rata 8,52 pesanan." },
        { sql: "select c.segment,\n       count(*) as jumlah_pelanggan,\n       round(avg(pp.jumlah_pesanan), 2) as rata_rata_pesanan\nfrom (\n  select customer_id, count(*) as jumlah_pesanan\n  from app.orders\n  group by customer_id\n) as pp\njoin app.customers as c on c.customer_id = pp.customer_id\ngroup by c.segment\norder by c.segment;", note: "Tabel turunan pp di-JOIN seperti tabel biasa." },
      ],
    },
    {
      title: "Menjumlah barang dan pembayaran tanpa angka berlipat",
      html: `<p>Di Bab 6, menggabung <code>app.order_items</code> dan <code>app.payments</code> sekaligus membuat baris berlipat. Pesanan 100132 punya 3 barang dan 2 pembayaran, sehingga gabungannya 6 baris dan kedua SUM salah. Soal wawancara bab itu memperbaikinya dengan membagi SUM dengan jumlah salinan. Cara itu benar, tetapi sulit dibaca dan mudah keliru.</p>
<p>Dengan tabel turunan, caranya lebih rapi: ringkas setiap tabel "banyak" lebih dulu, baru gabungkan.</p>
<ol><li>Tabel turunan <code>b</code> menjumlahkan nilai barang per pesanan. Grain-nya satu baris per pesanan.</li>
<li>Tabel turunan <code>p</code> menjumlahkan pembayaran per pesanan. Grain-nya juga satu baris per pesanan.</li>
<li>Keduanya di-JOIN ke <code>app.orders</code> lewat <code>order_id</code>. Setiap pesanan bertemu paling banyak satu baris <code>b</code> dan satu baris <code>p</code>, jadi tidak ada yang tersalin.</li></ol>
<p>Tabel <code>p</code> disambung dengan LEFT JOIN, karena 519 pesanan tidak punya pembayaran; COALESCE mengubah totalnya menjadi 0. Hasil untuk pesanan 100132 adalah 323.600 dan 338.600, sama dengan Bab 6. Untuk seluruh 12.007 pesanan, hasil query ini sama persis dengan jawaban soal wawancara Bab 6.</p>
<p>Aturannya: sebelum menggabung beberapa tabel, samakan dulu grain-nya dengan meringkas di tabel turunan.</p>`,
      examples: [
        { sql: "select o.order_id,\n       b.total_barang,\n       coalesce(p.total_bayar, 0) as total_bayar\nfrom app.orders as o\njoin (\n  select order_id, sum(qty * unit_price - discount) as total_barang\n  from app.order_items\n  group by order_id\n) as b on b.order_id = o.order_id\nleft join (\n  select order_id, sum(amount) as total_bayar\n  from app.payments\n  group by order_id\n) as p on p.order_id = o.order_id\nwhere o.order_id between 100130 and 100135\norder by o.order_id;", note: "Pesanan 100132: 323.600 dan 338.600, tanpa pembagian apa pun." },
      ],
    },
    {
      title: "Operasi himpunan: UNION, UNION ALL, INTERSECT, EXCEPT",
      html: `<p>JOIN menggabung tabel ke samping: kolom dari dua tabel dipasang dalam satu baris. <b>Operasi himpunan</b> bekerja ke bawah: baris hasil query kedua ditumpuk di bawah baris hasil query pertama, atau dibandingkan dengannya. Kata <i>himpunan</i> di sini berarti kumpulan baris hasil query.</p>
<ul><li><code>UNION</code>: semua baris dari kedua query, tanpa baris kembar.</li>
<li><code>UNION ALL</code>: semua baris dari kedua query, baris kembar tetap ada.</li>
<li><code>INTERSECT</code>: baris yang ada di kedua hasil. Kata Inggris <i>intersect</i> berarti beririsan.</li>
<li><code>EXCEPT</code>: baris di hasil pertama yang tidak ada di hasil kedua. Kata Inggris <i>except</i> berarti kecuali.</li></ul>
<p>Aturannya: kedua query harus menghasilkan jumlah kolom yang sama, dengan tipe data yang cocok di posisi yang sama. Kalau jumlahnya berbeda, PostgreSQL menolak dengan pesan <code>each UNION query must have the same number of columns</code>. Kalau tipenya tidak cocok, misalnya angka dengan teks, pesannya <code>UNION types integer and text cannot be matched</code>. Nama kolom hasil diambil dari query pertama. ORDER BY ditulis sekali di akhir dan berlaku untuk seluruh hasil.</p>
<p>Contoh dengan pelanggan: 1.097 pelanggan memesan di 2024, dan 1.352 pelanggan memesan di 2025.</p>
<ul><li>UNION: 1.410 pelanggan, yaitu 1.500 pelanggan dikurangi 90 yang belum pernah memesan (Bab 6).</li>
<li>UNION ALL: 2.449 baris, yaitu 1.097 + 1.352. Pelanggan yang memesan di kedua tahun muncul dua kali.</li>
<li>INTERSECT: 1.039 pelanggan yang memesan di kedua tahun.</li>
<li>EXCEPT: 58 pelanggan yang memesan di 2024 tetapi tidak di 2025. Urutan query penting: kalau dibalik, hasilnya 313 pelanggan yang memesan di 2025 tetapi tidak di 2024.</li></ul>
<p>Kalau beberapa operasi ditulis tanpa tanda kurung, INTERSECT dikerjakan lebih dulu, lalu UNION dan EXCEPT dari kiri ke kanan. Pakai tanda kurung supaya urutannya jelas.</p>
<p>Ada perbedaan penting dengan NOT IN: saat mencari baris kembar, operasi himpunan menganggap dua NULL sama. Karena itu, karyawan EXCEPT <code>handled_by</code> tetap menemukan 10 karyawan, walaupun <code>handled_by</code> berisi NULL.</p>
<p>Di pekerjaan ETL, operasi himpunan sering dipakai untuk membandingkan data. Contoh terakhir memeriksa ekstrak susulan <code>raw.orders_batch2</code> (365 baris). Menurut kamus data, ekstrak ini berisi pesanan baru, pesanan lama yang statusnya berubah, dan pesanan akhir Oktober yang baru tercatat. Hasilnya: 290 nomor pesanan belum ada di <code>app.orders</code>, dan 75 sudah ada.</p>`,
      examples: [
        { sql: "select customer_id from app.orders\nwhere order_ts >= '2024-01-01' and order_ts < '2025-01-01'\nexcept\nselect customer_id from app.orders\nwhere order_ts >= '2025-01-01' and order_ts < '2026-01-01'\norder by customer_id;", note: "58 baris. ORDER BY di akhir berlaku untuk hasil EXCEPT, bukan untuk query kedua saja." },
        { sql: "select 'union' as operasi, count(*) as jumlah_baris\nfrom (select customer_id from app.orders where order_ts < '2025-01-01'\n      union\n      select customer_id from app.orders where order_ts >= '2025-01-01') as t\nunion all\nselect 'union all', count(*)\nfrom (select customer_id from app.orders where order_ts < '2025-01-01' group by customer_id\n      union all\n      select customer_id from app.orders where order_ts >= '2025-01-01' group by customer_id) as t\nunion all\nselect 'intersect', count(*)\nfrom (select customer_id from app.orders where order_ts < '2025-01-01'\n      intersect\n      select customer_id from app.orders where order_ts >= '2025-01-01') as t;", note: "1.410, 2.449, dan 1.039. Hasilnya sendiri disusun dengan UNION ALL; nama kolom operasi dan jumlah_baris diambil dari query pertama. Di bagian union all, GROUP BY membuat setiap pelanggan muncul sekali per tahun." },
        { sql: "select staff_id from app.staff\nexcept\nselect handled_by from app.orders\norder by staff_id;", note: "10 baris, sama dengan NOT EXISTS. NULL di handled_by tidak mengganggu EXCEPT." },
        { sql: "select 'belum ada di app.orders' as kelompok, count(*) as jumlah\nfrom (select order_id from raw.orders_batch2\n      except\n      select order_id from app.orders) as baru\nunion all\nselect 'sudah ada di app.orders', count(*)\nfrom (select order_id from raw.orders_batch2\n      intersect\n      select order_id from app.orders) as lama;", note: "290 dan 75, jumlahnya 365 baris ekstrak susulan." },
      ],
    },
  ],
  tsql: [
    { pg: "where list_price > (select avg(list_price) from …)", tsql: "sama", note: "Subquery skalar sama di kedua dialek. SQL Server juga menolak subquery skalar yang menghasilkan lebih dari satu nilai." },
    { pg: "x in (select …), x not in (select …)", tsql: "sama", note: "Jebakan NULL berlaku juga: dokumentasi SQL Server menyebut nilai NULL dari subquery yang dibandingkan dengan IN atau NOT IN menghasilkan UNKNOWN (tidak diketahui)." },
    { pg: "exists (select 1 …), not exists (select 1 …)", tsql: "sama", note: "Dokumentasi SQL Server biasa menulis <code>exists (select * …)</code>. Keduanya sama, karena kolom di subquery EXISTS tidak dipakai." },
    { pg: "> all (select …), > any (select …)", tsql: "sama", note: "SOME juga nama lain untuk ANY di SQL Server. <code>= ANY</code> sama dengan IN, <code>&lt;&gt; ALL</code> sama dengan NOT IN." },
    { pg: "from (select …) as t", tsql: "from (select …) as t", note: "PostgreSQL 16 ke atas mengizinkan alias tabel turunan dihilangkan. Dokumentasi FROM di SQL Server menyebut alias tabel turunan wajib (<i>required</i>)." },
    { pg: "order by di dalam subquery", tsql: "hanya boleh bersama TOP atau OFFSET … FETCH", note: "Di SQL Server, subquery hanya boleh memakai ORDER BY kalau ada TOP atau OFFSET … FETCH. ORDER BY di situ hanya menentukan baris mana yang diambil; urutan hasil akhir tetap ditentukan oleh ORDER BY di query utama." },
    { pg: "union, union all", tsql: "union, union all", note: "Sama. ORDER BY ditulis sekali di akhir, setelah query terakhir." },
    { pg: "intersect, except", tsql: "intersect, except", note: "Sama, termasuk urutan pengerjaan: INTERSECT lebih dulu, lalu EXCEPT dan UNION dari kiri ke kanan. Dua NULL dianggap sama. Nama kolom diambil dari query pertama. Tata bahasa SQL Server tidak punya INTERSECT ALL dan EXCEPT ALL, yang ada di PostgreSQL." },
    { pg: "kolom di subquery yang tidak ada di tabel subquery", tsql: "sama", note: "Di kedua dialek, kolom itu dicari di tabel query luar tanpa pesan error. Tulis alias di depan setiap kolom." },
  ],
  summary: [
    "Subquery adalah query di dalam tanda kurung di dalam query lain. Subquery skalar menghasilkan satu nilai; kalau hasilnya lebih dari satu baris, query ditolak.",
    "<code>IN (subquery)</code> dan <code>EXISTS</code> mencari baris yang punya pasangan tanpa menyalin baris query luar, berbeda dengan JOIN.",
    "Subquery berkorelasi memakai kolom query luar dan dihitung untuk setiap baris luar. Tulis alias di depan setiap kolom.",
    "<code>NOT IN</code> memberi hasil kosong kalau subquery berisi NULL. Pakai <code>NOT EXISTS</code>, atau buang NULL di subquery.",
    "<code>&gt; ALL</code> berarti lebih besar dari nilai terbesar, <code>&gt; ANY</code> lebih besar dari nilai terkecil. ALL atas subquery kosong selalu benar.",
    "Tabel turunan (subquery di FROM) dipakai untuk meringkas hasil ringkasan dan untuk menyamakan grain sebelum JOIN. Selalu beri alias.",
    "<code>UNION</code> membuang baris kembar, <code>UNION ALL</code> tidak. <code>INTERSECT</code> mengambil irisan, <code>EXCEPT</code> mengambil selisih. Jumlah kolom dan tipe datanya harus cocok.",
  ],
  drills: [
    { id: "sql-07-01", kind: "choice", prompt: "Sebuah subquery menghasilkan nilai 3, 7, dan NULL. Apa yang terjadi pada baris yang syarat WHERE-nya <code>5 NOT IN (subquery)</code>?",
      options: ["Syaratnya benar, baris disimpan", "Syaratnya salah, baris dibuang", "Syaratnya tidak diketahui (NULL), baris dibuang", "Query error"], answer: 2,
      why: "5 NOT IN (3, 7, NULL) sama dengan 5 <> 3 AND 5 <> 7 AND 5 <> NULL. Bagian terakhir tidak diketahui, jadi seluruh syarat tidak diketahui. WHERE hanya menyimpan baris yang syaratnya benar.", hint: "Uraikan NOT IN menjadi beberapa <> yang disambung AND." },
    { id: "sql-07-02", kind: "choice", prompt: "Query A menghasilkan 1.097 <code>customer_id</code> yang berbeda, query B menghasilkan 1.352 <code>customer_id</code> yang berbeda, dan 1.039 nomor ada di keduanya. Berapa baris hasil <code>A UNION B</code>?",
      options: ["2.449", "1.410", "1.039", "313"], answer: 1,
      why: "UNION membuang baris kembar: 1.097 + 1.352 − 1.039 = 1.410. Angka 2.449 adalah hasil UNION ALL, dan 1.039 hasil INTERSECT.", hint: "Nomor yang ada di kedua query hanya dihitung sekali." },
    { id: "sql-07-03", kind: "sql", prompt: "Tampilkan <code>product_id</code>, <code>product_name</code>, dan <code>list_price</code> semua produk yang harganya di atas rata-rata harga semua produk.",
      solution: "select product_id, product_name, list_price from app.products where list_price > (select avg(list_price) from app.products)",
      why: "Subquery skalar menghitung rata-rata satu kali, lalu setiap produk dibandingkan dengannya. Hasilnya 50 produk.", hint: "where list_price > (select avg(…) from …)" },
    { id: "sql-07-04", kind: "sql", prompt: "Tampilkan <code>customer_id</code> dan <code>full_name</code> pelanggan yang membuat minimal satu pesanan lewat <code>channel</code> 'ios' di bulan Oktober 2025. Setiap pelanggan muncul sekali.",
      solution: "select c.customer_id, c.full_name from app.customers as c where c.customer_id in (select o.customer_id from app.orders as o where o.channel = 'ios' and o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01')",
      why: "IN (atau EXISTS) tidak menyalin baris pelanggan walaupun pelanggan itu memesan beberapa kali. Hasilnya 122 pelanggan. JOIN biasa akan memunculkan pelanggan yang sama lebih dari sekali.", hint: "where c.customer_id in (select o.customer_id from app.orders as o where …)" },
    { id: "sql-07-05", kind: "sql", prompt: "Untuk setiap produk di kategori 3 (Earphone), tampilkan <code>product_id</code>, <code>product_name</code>, dan jumlah <code>qty</code> di <code>app.order_items</code> untuk produk itu (semua status pesanan; 0 kalau tidak ada). Pakai subquery berkorelasi di SELECT.",
      solution: "select p.product_id, p.product_name, coalesce((select sum(oi.qty) from app.order_items as oi where oi.product_id = p.product_id), 0) as terjual from app.products as p where p.category_id = 3",
      why: "Subquery memakai p.product_id dari query luar, jadi dihitung untuk setiap produk. SUM atas nol baris menghasilkan NULL, sehingga COALESCE mengubahnya menjadi 0.", hint: "(select sum(oi.qty) from app.order_items as oi where oi.product_id = p.product_id)" },
    { id: "sql-07-06", kind: "sql", prompt: "Tampilkan <code>product_id</code>, <code>product_name</code>, dan <code>is_active</code> semua produk yang tidak muncul di pesanan mana pun di bulan Oktober 2025 (semua status pesanan).",
      solution: "select p.product_id, p.product_name, p.is_active from app.products as p where not exists (select 1 from app.order_items as oi join app.orders as o on o.order_id = oi.order_id where oi.product_id = p.product_id and o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01')",
      why: "NOT EXISTS benar kalau subquery berkorelasi tidak menemukan baris. Tanggal pesanan ada di app.orders, jadi subquery menggabung app.order_items dengan app.orders. Hasilnya 13 produk.", hint: "where not exists (select 1 from app.order_items … join app.orders … where oi.product_id = p.product_id and …)" },
    { id: "sql-07-07", kind: "sql", level: "menengah", prompt: "Untuk setiap <code>segment</code> pelanggan, tampilkan rata-rata jumlah pesanan per pelanggan, dibulatkan 2 desimal. Hitung hanya pelanggan yang pernah memesan. Kolom: <code>segment</code> dan rata-ratanya.",
      solution: "select c.segment, round(avg(pp.jumlah_pesanan), 2) as rata_rata_pesanan from (select customer_id, count(*) as jumlah_pesanan from app.orders group by customer_id) as pp join app.customers as c on c.customer_id = pp.customer_id group by c.segment",
      why: "Agregasi tidak boleh bersarang, jadi jumlah pesanan per pelanggan dihitung dulu di tabel turunan. Tabel itu lalu di-JOIN ke app.customers dan dirata-ratakan per segmen: Gold 8,91, Reguler 8,41, Silver 8,59.", hint: "from (select customer_id, count(*) as jumlah_pesanan from app.orders group by customer_id) as pp join …" },
    { id: "sql-07-08", kind: "sql", level: "menengah", prompt: "Tampilkan <code>order_id</code> di <code>raw.orders_batch2</code> yang belum ada di <code>app.orders</code>.",
      solution: "select order_id from raw.orders_batch2 except select order_id from app.orders",
      why: "EXCEPT mengambil baris di hasil pertama yang tidak ada di hasil kedua. Hasilnya 290 nomor pesanan. NOT EXISTS juga benar.", hint: "select … from raw.orders_batch2 except select … from app.orders" },
    { id: "sql-07-09", kind: "fix", prompt: "Query ini seharusnya menampilkan karyawan yang tidak pernah menangani pesanan (<code>handled_by</code>), dengan kolom <code>staff_id</code>, <code>full_name</code>, dan <code>role</code>. Hasilnya kosong. Perbaiki.",
      start: "select s.staff_id, s.full_name, s.role\nfrom app.staff as s\nwhere s.staff_id not in (select o.handled_by from app.orders as o);",
      solution: "select s.staff_id, s.full_name, s.role from app.staff as s where not exists (select 1 from app.orders as o where o.handled_by = s.staff_id)",
      why: "handled_by berisi NULL untuk pesanan yang tidak ditangani layanan pelanggan, sehingga NOT IN tidak pernah benar. NOT EXISTS tidak terpengaruh NULL dan memberi 10 karyawan. Menambahkan where o.handled_by is not null di subquery juga benar.", hint: "Apa isi subquery untuk pesanan yang tidak ditangani siapa pun?" },
    { id: "sql-07-10", kind: "number", prompt: "Berapa pelanggan yang membuat pesanan di tahun 2024 <b>dan</b> juga di tahun 2025?",
      answerSql: "select count(*) from (select customer_id from app.orders where order_ts >= '2024-01-01' and order_ts < '2025-01-01' intersect select customer_id from app.orders where order_ts >= '2025-01-01' and order_ts < '2026-01-01') as t",
      why: "INTERSECT mengambil nomor pelanggan yang ada di kedua hasil, lalu tabel turunan dihitung: select count(*) from (select customer_id from app.orders where order_ts >= '2024-01-01' and order_ts < '2025-01-01' intersect select customer_id from app.orders where order_ts >= '2025-01-01' and order_ts < '2026-01-01') as t.", hint: "INTERSECT dua daftar customer_id, lalu hitung barisnya." },
    { id: "sql-07-11", kind: "sql", level: "wawancara", prompt: "Tampilkan <code>customer_id</code> dan <code>full_name</code> pelanggan yang membuat pesanan di tahun 2024 tetapi tidak membuat pesanan sama sekali di tahun 2025.",
      solution: "select c.customer_id, c.full_name from app.customers as c where exists (select 1 from app.orders as o where o.customer_id = c.customer_id and o.order_ts >= '2024-01-01' and o.order_ts < '2025-01-01') and not exists (select 1 from app.orders as o where o.customer_id = c.customer_id and o.order_ts >= '2025-01-01' and o.order_ts < '2026-01-01')",
      why: "EXISTS memastikan ada pesanan 2024, NOT EXISTS memastikan tidak ada pesanan 2025. Hasilnya 58 pelanggan. Cara lain: EXCEPT dua daftar customer_id di tabel turunan, lalu JOIN ke app.customers untuk mengambil nama. Pewawancara sering memeriksa apakah kamu memakai NOT IN pada kolom yang bisa NULL; di sini customer_id tidak boleh kosong, jadi NOT IN juga aman.", hint: "Dua syarat: ada pesanan 2024 (EXISTS) dan tidak ada pesanan 2025 (NOT EXISTS)." },
    { id: "sql-07-12", kind: "sql", level: "wawancara", prompt: "Untuk setiap pelanggan yang pernah memesan, tampilkan <code>customer_id</code>, jumlah pesanannya (dari <code>app.orders</code>), dan total <code>amount</code> pembayaran berstatus 'success' untuk pesanan-pesanannya (0 kalau tidak ada). Tidak boleh ada angka berlipat.",
      solution: "select op.customer_id, op.jumlah_pesanan, coalesce(pp.total_bayar, 0) as total_bayar from (select customer_id, count(*) as jumlah_pesanan from app.orders group by customer_id) as op left join (select o.customer_id, sum(p.amount) as total_bayar from app.payments as p join app.orders as o on o.order_id = p.order_id where p.status = 'success' group by o.customer_id) as pp on pp.customer_id = op.customer_id",
      why: "Kalau app.orders langsung di-JOIN ke app.payments, pesanan yang dibayar dua kali terhitung dua kali di COUNT. Ringkas dulu di dua tabel turunan yang grain-nya satu baris per pelanggan, lalu gabungkan. LEFT JOIN dan COALESCE menjaga 5 pelanggan yang tidak punya pembayaran success. Hasilnya 1.410 baris, jumlah pesanannya 12.007, dan total bayarnya sama dengan SUM(amount) seluruh pembayaran success.",
      hint: "Satu tabel turunan untuk jumlah pesanan per pelanggan, satu lagi untuk total pembayaran per pelanggan (pembayaran perlu di-JOIN ke app.orders untuk tahu pelanggannya)." },
    { id: "sql-07-13", kind: "explain", prompt: "Rekanmu ingin menampilkan total nilai barang dan total pembayaran per pesanan, lalu menulis <code>app.orders</code> JOIN <code>app.order_items</code> JOIN <code>app.payments</code> dengan GROUP BY <code>order_id</code>. Jelaskan kenapa angkanya salah, dan bagaimana tabel turunan memperbaikinya.",
      model: "Satu pesanan bisa punya banyak barang dan lebih dari satu pembayaran. Kalau ketiga tabel digabung sekaligus, setiap barang dipasangkan dengan setiap pembayaran pesanan yang sama, sehingga barisnya berlipat dan kedua SUM ikut berlipat. Tabel turunan memperbaikinya dengan meringkas setiap tabel lebih dulu: satu subquery di FROM menjumlahkan nilai barang per order_id, satu lagi menjumlahkan pembayaran per order_id. Grain keduanya sama dengan app.orders, yaitu satu baris per pesanan, jadi saat di-JOIN setiap pesanan hanya bertemu satu baris dari masing-masing. Pembayaran disambung dengan LEFT JOIN dan COALESCE, supaya pesanan tanpa pembayaran tetap muncul dengan 0.",
      hint: "Pikirkan grain setiap tabel sebelum dan sesudah diringkas." },
  ],
};
