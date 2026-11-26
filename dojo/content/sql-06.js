// Bab 6 SQL: menggabung tabel dengan JOIN, primary key, foreign key, dan jebakan baris berlipat.
export default {
  id: "sql-06",
  part: "sql",
  title: "Menggabung tabel: JOIN",
  minutes: 90,
  goals: [
    "Menjelaskan primary key, foreign key, dan relasi satu-ke-banyak di data TokoKita.",
    "Menggabung dua tabel atau lebih dengan <code>JOIN … ON</code>, memakai alias tabel dan <code>USING</code>.",
    "Memilih <code>INNER JOIN</code>, <code>LEFT JOIN</code>, <code>RIGHT JOIN</code>, <code>FULL JOIN</code>, atau <code>CROSS JOIN</code> sesuai pertanyaan.",
    "Mencari baris yang tidak punya pasangan (anti-join) dan menggabung tabel dengan dirinya sendiri (self join).",
    "Mengenali baris berlipat (<i>fan-out</i>) dan menjumlahkan angka tanpa berlipat.",
  ],
  terms: [
    { term: "join", def: "Perintah untuk menggabung baris dari dua tabel menjadi satu baris hasil, berdasarkan syarat yang ditulis setelah ON. Kata Inggris <i>join</i> berarti menggabung." },
    { term: "primary key", def: "Kolom (atau gabungan kolom) yang nilainya unik dan tidak boleh kosong, sehingga menjadi tanda pengenal setiap baris. Disebut juga kunci utama. Satu tabel paling banyak punya satu primary key." },
    { term: "foreign key", def: "Kolom yang nilainya harus ada di primary key tabel lain (atau tabel yang sama). Database menolak nilai yang tidak punya pasangan. Disebut juga kunci tamu." },
    { term: "relasi satu-ke-banyak", def: "Hubungan dua tabel ketika satu baris di tabel pertama bisa punya banyak baris pasangan di tabel kedua, misalnya satu pesanan dengan banyak baris barang." },
    { term: "alias tabel", def: "Nama pendek untuk sebuah tabel di dalam satu query, misalnya <code>app.orders as o</code>." },
    { term: "outer join", def: "Nama kelompok untuk LEFT JOIN, RIGHT JOIN, dan FULL JOIN: join yang tetap menyimpan baris tanpa pasangan dan mengisi kolom pasangannya dengan NULL." },
    { term: "anti-join", def: "Pola untuk mencari baris yang tidak punya pasangan: LEFT JOIN, lalu ambil baris yang primary key tabel kanannya NULL." },
    { term: "self join", def: "Join sebuah tabel dengan dirinya sendiri, memakai dua alias berbeda, misalnya karyawan dengan atasannya." },
    { term: "baris berlipat", def: "Baris yang tersalin beberapa kali karena join dengan tabel yang punya banyak pasangan, sehingga SUM dan COUNT ikut berlipat. Dalam bahasa Inggris disebut <i>fan-out</i>." },
  ],
  introduces: ["JOIN", "INNER JOIN", "ON", "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "CROSS JOIN", "USING"],
  sections: [
    {
      title: "Kenapa data dipisah ke beberapa tabel",
      html: `<p>Data TokoKita disimpan di banyak tabel. Satu pesanan tercatat di <code>app.orders</code>, isi barangnya di <code>app.order_items</code>, dan pembayarannya di <code>app.payments</code>. Nama pelanggan tidak ditulis ulang di setiap pesanan; pesanan hanya menyimpan nomor pelanggannya di kolom <code>customer_id</code>. Nama dan alamat email cukup disimpan sekali di <code>app.customers</code>.</p>
<p>Supaya tabel-tabel ini bisa dihubungkan, setiap tabel punya <b>primary key</b> (kunci utama): kolom yang nilainya unik dan tidak boleh kosong, sehingga menjadi tanda pengenal setiap baris. Primary key <code>app.orders</code> adalah <code>order_id</code>. Primary key boleh terdiri dari beberapa kolom: di <code>app.order_items</code>, kuncinya gabungan <code>order_id</code> dan <code>line_no</code> (nomor urut baris di dalam pesanan).</p>
<p>Kolom <code>customer_id</code> di <code>app.orders</code> adalah <b>foreign key</b> (kunci tamu): nilainya harus ada di primary key tabel lain, yaitu <code>app.customers</code>. Database menolak pesanan dengan nomor pelanggan yang tidak terdaftar. Foreign key boleh NULL kalau kolomnya mengizinkan. Contohnya <code>handled_by</code> di <code>app.orders</code>, yang merujuk ke <code>app.staff</code> dan kosong kalau pesanan tidak ditangani layanan pelanggan.</p>
<p>Hubungan pesanan dan isi barangnya disebut <b>relasi satu-ke-banyak</b>: satu baris di <code>app.orders</code> bisa punya banyak baris pasangan di <code>app.order_items</code>. Pesanan 100132 di bawah ini punya satu baris pesanan dan tiga baris barang.</p>`,
      examples: [
        { sql: "select order_id, customer_id, order_ts, status, shipping_fee\nfrom app.orders\nwhere order_id = 100132;", note: "Satu baris. Kolom customer_id berisi 883, yaitu nomor pelanggan di app.customers." },
        { sql: "select order_id, line_no, product_id, qty, unit_price, discount\nfrom app.order_items\nwhere order_id = 100132;", note: "Tiga baris dengan order_id yang sama. order_id di sini adalah foreign key ke app.orders." },
      ],
    },
    {
      title: "JOIN dan ON: menggabung dua tabel",
      html: `<p><b>JOIN</b> menggabung baris dari dua tabel menjadi satu baris hasil. Syarat penggabungannya ditulis setelah <code>ON</code>. Database memasangkan setiap baris tabel kiri (tabel yang ditulis sebelum JOIN) dengan setiap baris tabel kanan (setelah JOIN), lalu hanya menyimpan pasangan yang syarat ON-nya benar.</p>
<p><code>JOIN</code> sama dengan <code>INNER JOIN</code>; kata INNER (dalam) boleh ditulis atau tidak. INNER JOIN hanya menyimpan baris yang punya pasangan. Baris yang tidak punya pasangan di tabel lain hilang dari hasil.</p>
<p>Karena kedua tabel punya kolom <code>customer_id</code>, nama kolom ditulis lengkap dengan nama tabelnya: <code>app.orders.customer_id</code>. Syarat yang paling umum adalah foreign key sama dengan primary key yang dirujuknya.</p>`,
      examples: [{ sql: "select app.orders.order_id, app.orders.order_ts, app.customers.full_name\nfrom app.orders\njoin app.customers on app.customers.customer_id = app.orders.customer_id\nwhere app.orders.order_id between 100131 and 100135;", note: "Setiap pesanan kini membawa nama pelanggannya. Semua 12.007 pesanan punya pasangan, karena customer_id tidak boleh kosong dan wajib ada di app.customers." }],
    },
    {
      title: "Alias tabel dan nama kolom yang kembar",
      html: `<p>Menulis <code>app.orders.order_id</code> berulang kali melelahkan. <b>Alias tabel</b> adalah nama pendek untuk tabel di dalam satu query: <code>from app.orders as o</code>. Kata AS boleh dihilangkan (<code>app.orders o</code>). Setelah alias dipasang, nama asli tabel tidak boleh dipakai lagi di query itu: <code>select app.orders.order_id from app.orders as o</code> ditolak.</p>
<p>Kalau nama kolom ada di dua tabel dan kamu tidak menulis aliasnya, PostgreSQL menolak query dengan pesan <code>column reference "customer_id" is ambiguous</code>. Artinya, database tidak tahu kolom dari tabel mana yang kamu maksud. Biasakan menulis alias di depan <i>setiap</i> kolom saat ada join, walaupun namanya tidak kembar. Pembaca query langsung tahu asal setiap kolom.</p>
<p>JOIN bisa disambung. Contoh di bawah menggabung tiga tabel: pesanan ke pelanggan, lalu pelanggan ke kota.</p>`,
      examples: [{ sql: "select o.order_id, c.full_name, ci.city_name, ci.island\nfrom app.orders as o\njoin app.customers as c on c.customer_id = o.customer_id\njoin app.cities as ci on ci.city_id = c.city_id\nwhere o.order_id between 100131 and 100135;", note: "JOIN kedua memakai kolom dari hasil JOIN pertama (c.city_id). Urutannya: pesanan → pelanggan → kota." }],
    },
    {
      title: "USING: kalau nama kolom penghubungnya sama",
      html: `<p>Kalau kolom penghubung di kedua tabel bernama sama, syaratnya bisa ditulis lebih pendek: <code>join app.payments using (order_id)</code> sama dengan <code>on p.order_id = o.order_id</code>. Kata Inggris <i>using</i> berarti memakai.</p>
<p>Ada satu perbedaan. Dengan USING, kolom penghubung hanya muncul sekali di hasil <code>select *</code>, dan boleh ditulis tanpa alias (<code>order_id</code> saja). Dengan ON, kedua salinannya muncul. Kolom lain yang kembar tetap harus diberi alias. Di contoh ini, <code>app.orders</code> dan <code>app.payments</code> sama-sama punya kolom <code>status</code> dengan arti berbeda: status pesanan dan status pembayaran.</p>`,
      examples: [{ sql: "select order_id, o.status as status_pesanan, p.payment_id, p.method, p.amount, p.status as status_bayar\nfrom app.orders as o\njoin app.payments as p using (order_id)\nwhere order_id = 100132;", note: "Pesanan 100132 dibayar dua kali (dompet digital lalu transfer bank), jadi baris pesanannya muncul dua kali." }],
    },
    {
      title: "LEFT JOIN: simpan semua baris tabel kiri",
      html: `<p><code>LEFT JOIN</code> (<i>left</i> berarti kiri) menyimpan <b>semua</b> baris tabel kiri. Baris yang punya pasangan digabung seperti biasa. Baris yang tidak punya pasangan tetap muncul sekali, dan semua kolom dari tabel kanan diisi NULL.</p>
<p>LEFT JOIN, RIGHT JOIN, dan FULL JOIN disebut <b>outer join</b> (gabungan luar), karena ikut menyimpan baris di luar pasangan yang cocok. Kata OUTER boleh ditulis: <code>left outer join</code> sama dengan <code>left join</code>.</p>
<p>Contoh di bawah menampilkan pelanggan nomor 13 sampai 15 beserta pesanannya. Pelanggan 13 punya 5 pesanan, pelanggan 15 punya 6, dan pelanggan 14 tidak punya pesanan sama sekali. Dengan JOIN biasa, pelanggan 14 akan hilang. Dengan LEFT JOIN, ia muncul satu kali dengan <code>order_id</code> NULL.</p>
<p>Akibatnya, jumlah baris LEFT JOIN selalu sama dengan atau lebih banyak dari jumlah baris tabel kiri. <code>app.customers</code> berisi 1.500 baris; LEFT JOIN ke <code>app.orders</code> menghasilkan 12.097 baris: 12.007 pesanan ditambah 90 pelanggan tanpa pesanan.</p>
<p>Saat menghitung dengan LEFT JOIN, pakai <code>COUNT(kolom_kanan)</code>, bukan <code>COUNT(*)</code>. COUNT(*) menghitung baris berisi NULL tadi sebagai 1, sehingga pelanggan tanpa pesanan tercatat punya 1 pesanan.</p>`,
      examples: [{ sql: "select c.customer_id, c.full_name, o.order_id, o.order_ts\nfrom app.customers as c\nleft join app.orders as o on o.customer_id = c.customer_id\nwhere c.customer_id between 13 and 15\norder by c.customer_id, o.order_id;", note: "12 baris: 5 untuk pelanggan 13, 1 baris berisi NULL untuk pelanggan 14, dan 6 untuk pelanggan 15." }],
    },
    {
      title: "Syarat di ON atau di WHERE",
      html: `<p>Pada INNER JOIN, syarat tambahan boleh ditulis di ON atau di WHERE; hasilnya sama. Pada outer join, letaknya mengubah hasil. Syarat di ON diterapkan <i>saat</i> mencari pasangan. Syarat di WHERE diterapkan <i>setelah</i> join selesai, termasuk ke baris yang kolom kanannya NULL.</p>
<p>Contoh: kita ingin setiap karyawan beserta jumlah pesanan yang ditanganinya di bulan Oktober 2025. Ada 25 karyawan. Kalau syarat tanggal ditaruh di ON, karyawan tanpa pesanan Oktober tetap muncul dengan jumlah 0. Kalau ditaruh di WHERE, baris karyawan itu punya <code>order_ts</code> NULL, syarat tanggalnya tidak benar, lalu barisnya dibuang. Hasilnya sama dengan INNER JOIN, dan hanya 14 karyawan yang tersisa.</p>
<p>Aturannya: syarat untuk tabel kanan sebuah LEFT JOIN ditaruh di ON. Syarat untuk tabel kiri ditaruh di WHERE.</p>`,
      examples: [
        { sql: "select count(distinct s.staff_id) as jumlah_karyawan, count(o.order_id) as jumlah_pesanan\nfrom app.staff as s\nleft join app.orders as o on o.handled_by = s.staff_id\n  and o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01';", note: "Syarat tanggal di ON: 25 karyawan, 65 pesanan." },
        { sql: "select count(distinct s.staff_id) as jumlah_karyawan, count(o.order_id) as jumlah_pesanan\nfrom app.staff as s\nleft join app.orders as o on o.handled_by = s.staff_id\nwhere o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01';", note: "Syarat tanggal di WHERE: hanya 14 karyawan. Jumlah pesanannya tetap 65, tetapi 11 karyawan dengan 0 pesanan hilang." },
      ],
    },
    {
      title: "Anti-join: mencari yang tidak punya pasangan",
      html: `<p>Pertanyaan seperti "pelanggan mana yang belum pernah memesan?" dijawab dengan pola <b>anti-join</b>: LEFT JOIN, lalu ambil hanya baris yang kolom kanannya NULL.</p>
<p>Kolom yang diperiksa harus kolom yang tidak mungkin NULL di tabel kanan, biasanya primary key-nya (<code>o.order_id</code>). Kalau kamu memeriksa kolom yang memang boleh kosong, misalnya <code>o.voucher_code</code>, pesanan tanpa voucher ikut terhitung sebagai "tidak punya pasangan".</p>
<p>Hasilnya: 90 pelanggan belum pernah memesan. Tanggal daftar mereka antara 20 Juli 2024 dan 29 September 2025.</p>`,
      examples: [{ sql: "select c.customer_id, c.full_name, c.signup_date\nfrom app.customers as c\nleft join app.orders as o on o.customer_id = c.customer_id\nwhere o.order_id is null\norder by c.customer_id;", note: "90 baris. Syarat o.order_id is null ditaruh di WHERE dengan sengaja: kita memang ingin membuang baris yang punya pasangan." }],
    },
    {
      title: "RIGHT JOIN dan FULL JOIN",
      html: `<p><code>RIGHT JOIN</code> (<i>right</i> berarti kanan) kebalikan LEFT JOIN: semua baris tabel kanan disimpan. <code>a right join b</code> sama dengan <code>b left join a</code>. Kamu bisa selalu menulis LEFT JOIN dan mengatur urutan tabelnya, sehingga tabel yang semua barisnya ingin disimpan selalu ada di kiri.</p>
<p><code>FULL JOIN</code> (<i>full</i> berarti penuh; boleh ditulis <code>full outer join</code>) menyimpan semua baris dari <b>kedua</b> tabel. Baris yang tidak punya pasangan di sisi mana pun tetap muncul, dengan kolom sisi lainnya NULL. FULL JOIN berguna untuk membandingkan dua daftar, misalnya mencari data yang ada di satu sistem tetapi tidak ada di sistem lain.</p>
<p>Contoh di bawah menggabung karyawan dengan pesanan yang mereka tangani, lalu menghitung tiga kelompok. Ada 10.589 pesanan tanpa agen (<code>handled_by</code> kosong), 10 karyawan yang tidak pernah menangani pesanan, dan 1.418 pasangan yang cocok.</p>`,
      examples: [
        { sql: "select c.customer_id, c.full_name, o.order_id\nfrom app.orders as o\nright join app.customers as c on c.customer_id = o.customer_id\nwhere c.customer_id between 13 and 15\norder by c.customer_id, o.order_id;", note: "Hasilnya sama persis dengan contoh LEFT JOIN sebelumnya, karena urutan tabelnya dibalik." },
        { sql: "select case\n         when s.staff_id is null then 'pesanan tanpa agen'\n         when o.order_id is null then 'karyawan tanpa pesanan'\n         else 'cocok'\n       end as kelompok,\n       count(*) as jumlah_baris\nfrom app.staff as s\nfull join app.orders as o on o.handled_by = s.staff_id\ngroup by 1;", note: "Kesepuluh karyawan tanpa pesanan adalah nomor 1 sampai 10 (direktur, manajer, dan supervisor)." },
      ],
    },
    {
      title: "CROSS JOIN: semua kombinasi",
      html: `<p><code>CROSS JOIN</code> (<i>cross</i> berarti silang) memasangkan setiap baris tabel kiri dengan setiap baris tabel kanan, tanpa syarat. Jumlah barisnya hasil kali jumlah baris kedua tabel: 24 kota dikali 25 karyawan menjadi 600 baris.</p>
<p>CROSS JOIN dipakai untuk membuat semua kombinasi, misalnya kerangka tabel ongkos kirim untuk setiap pasangan kota asal dan kota tujuan. Contoh kedua di bawah memakai tabel <code>app.cities</code> dua kali dengan dua alias, lalu mengambil kota-kota di Sulawesi: 2 kota × 2 kota = 4 pasangan.</p>
<p>Hati-hati: menulis dua tabel dipisah koma (<code>from app.cities, app.staff</code>) juga menghasilkan semua kombinasi. Kalau syarat penggabungnya lupa ditulis di WHERE, hasilnya bisa jutaan baris tanpa pesan error. Sebaliknya, JOIN biasa tanpa ON ditolak PostgreSQL dengan pesan <i>syntax error</i> (kesalahan tata bahasa SQL).</p>`,
      examples: [
        { sql: "select count(*) as jumlah_baris\nfrom app.cities\ncross join app.staff;", note: "24 × 25 = 600." },
        { sql: "select asal.city_name as kota_asal, tujuan.city_name as kota_tujuan\nfrom app.cities as asal\ncross join app.cities as tujuan\nwhere asal.island = 'Sulawesi' and tujuan.island = 'Sulawesi'\norder by 1, 2;", note: "Makassar dan Manado, masing-masing dipasangkan dengan dirinya sendiri dan dengan kota lainnya." },
      ],
    },
    {
      title: "Self join: tabel digabung dengan dirinya sendiri",
      html: `<p>Kolom <code>manager_id</code> di <code>app.staff</code> merujuk ke <code>staff_id</code> di tabel yang sama: atasan seorang karyawan juga karyawan. Untuk menampilkan nama karyawan di samping nama atasannya, tabel ini digabung dengan dirinya sendiri. Cara ini disebut <b>self join</b> (<i>self</i> berarti diri sendiri).</p>
<p>Alias wajib di sini, karena tabelnya sama. Satu alias mewakili karyawan (<code>k</code>), satu lagi mewakili atasan (<code>a</code>). Pakai LEFT JOIN, karena direktur tidak punya atasan (<code>manager_id</code> NULL). Dengan JOIN biasa, direktur hilang dan hasilnya hanya 24 baris, bukan 25.</p>`,
      examples: [{ sql: "select k.staff_id, k.full_name, k.role, a.full_name as nama_atasan\nfrom app.staff as k\nleft join app.staff as a on a.staff_id = k.manager_id\norder by k.staff_id;", note: "Baris pertama, Hadi Halim (Direktur), punya nama_atasan NULL." }],
    },
    {
      title: "Baris berlipat (fan-out)",
      html: `<p>Ingat <b>grain</b> dari bab sebelumnya: apa yang diwakili satu baris. Grain <code>app.order_items</code> adalah satu barang di dalam satu pesanan; grain <code>app.payments</code> adalah satu transaksi pembayaran. Kalau dua tabel yang sama-sama "banyak" untuk satu pesanan digabung, grain hasilnya menjadi satu pasangan barang dan pembayaran.</p>
<p>Pesanan 100132 punya 3 barang dan 2 pembayaran. Hasil gabungannya 3 × 2 = 6 baris. Setiap barang tersalin dua kali (sekali per pembayaran), dan setiap pembayaran tersalin tiga kali (sekali per barang). Inilah <b>baris berlipat</b>, dalam bahasa Inggris <i>fan-out</i>. Query-nya tidak error, tetapi SUM ikut berlipat: nilai barang terbaca 647.200 (seharusnya 323.600), dan pembayaran terbaca 1.015.800 (seharusnya 338.600).</p>
<p>Cara mengenalinya: bandingkan <code>COUNT(*)</code> dengan <code>COUNT(DISTINCT primary key)</code> setiap tabel. Kalau jumlah baris lebih banyak dari jumlah barang yang berbeda, ada salinan.</p>
<p>Cara paling aman: jumlahkan setiap tabel "banyak" di query terpisah, satu per satu, seperti dua contoh terakhir. Untuk pesanan yang punya pembayaran, totalnya cocok: 338.600 = 323.600 nilai barang + 15.000 ongkos kirim. Kecocokan ini berlaku di seluruh 11.488 pesanan yang punya pembayaran. Di bab-bab berikutnya ada cara yang lebih rapi untuk menggabung kedua total itu dalam satu query. Soal wawancara di bab ini menantangmu melakukannya hanya dengan perintah yang sudah kamu kenal.</p>`,
      examples: [
        { sql: "select oi.line_no, oi.qty * oi.unit_price - oi.discount as nilai_barang, p.payment_id, p.amount\nfrom app.order_items as oi\njoin app.payments as p on p.order_id = oi.order_id\nwhere oi.order_id = 100132\norder by oi.line_no, p.payment_id;", note: "6 baris. Setiap nilai_barang muncul dua kali, setiap amount muncul tiga kali." },
        { sql: "select count(*) as jumlah_baris,\n       count(distinct oi.line_no) as jumlah_barang,\n       count(distinct p.payment_id) as jumlah_pembayaran,\n       sum(oi.qty * oi.unit_price - oi.discount) as nilai_barang_berlipat,\n       sum(p.amount) as pembayaran_berlipat\nfrom app.order_items as oi\njoin app.payments as p on p.order_id = oi.order_id\nwhere oi.order_id = 100132;", note: "6 baris untuk 3 barang dan 2 pembayaran. Kedua SUM salah." },
        { sql: "select sum(qty * unit_price - discount) as nilai_barang\nfrom app.order_items\nwhere order_id = 100132;", note: "Dihitung dari satu tabel saja: 323.600." },
        { sql: "select sum(amount) as total_bayar\nfrom app.payments\nwhere order_id = 100132;", note: "Dihitung dari satu tabel saja: 338.600." },
      ],
    },
  ],
  tsql: [
    { pg: "join … on … / inner join … on …", tsql: "join … on … / inner join … on …", note: "Sama. INNER boleh dihilangkan di kedua dialek." },
    { pg: "left join, right join, full join", tsql: "left join, right join, full join", note: "Sama. Kata OUTER boleh ditulis atau tidak." },
    { pg: "cross join", tsql: "cross join", note: "Sama. FROM dua tabel dipisah koma juga menghasilkan semua kombinasi di SQL Server." },
    { pg: "join app.payments using (order_id)", tsql: "join app.payments as p on p.order_id = o.order_id", note: "SQL Server tidak punya USING. Tata bahasa JOIN di SQL Server hanya menerima ON, kecuali CROSS JOIN." },
    { pg: "from app.orders as o", tsql: "from app.orders as o", note: "Sama. AS boleh dihilangkan, dan setelah alias dipasang, nama asli tabel tidak boleh dipakai lagi di query itu." },
    { pg: "syarat di ON atau WHERE pada outer join", tsql: "sama", note: "Di kedua dialek, syarat di ON diterapkan sebelum join, syarat di WHERE setelah join." },
    { pg: "primary key, foreign key", tsql: "primary key, foreign key", note: "Konsepnya sama: satu tabel paling banyak satu primary key, kolomnya tidak boleh NULL, dan foreign key menolak nilai yang tidak ada di tabel rujukan." },
  ],
  summary: [
    "Primary key adalah tanda pengenal unik setiap baris. Foreign key adalah kolom yang merujuk ke primary key tabel lain. Join yang umum memasangkan keduanya.",
    "<code>JOIN</code> (sama dengan <code>INNER JOIN</code>) hanya menyimpan baris yang punya pasangan. <code>LEFT JOIN</code> menyimpan semua baris tabel kiri; kolom kanan yang tidak punya pasangan diisi NULL.",
    "Beri alias pada setiap tabel dan tulis alias di depan setiap kolom. <code>USING (kolom)</code> boleh dipakai kalau nama kolom penghubungnya sama.",
    "Pada outer join, syarat untuk tabel kanan ditaruh di ON. Kalau ditaruh di WHERE, hasilnya berubah menjadi INNER JOIN.",
    "Anti-join: LEFT JOIN lalu <code>WHERE kanan.primary_key IS NULL</code>. Self join: satu tabel dengan dua alias.",
    "<code>FULL JOIN</code> menyimpan baris tanpa pasangan dari kedua sisi. <code>CROSS JOIN</code> membuat semua kombinasi; jumlah barisnya hasil kali.",
    "Menggabung dua tabel \"banyak\" sekaligus membuat baris berlipat, dan SUM ikut berlipat. Periksa dengan COUNT(*) lawan COUNT(DISTINCT primary key).",
  ],
  drills: [
    { id: "sql-06-01", kind: "choice", prompt: "Pesanan A punya 4 baris barang dan 3 pembayaran. Berapa baris hasil <code>app.order_items</code> JOIN <code>app.payments</code> untuk pesanan A?",
      options: ["3", "4", "7", "12"], answer: 3,
      why: "Setiap baris barang dipasangkan dengan setiap pembayaran pesanan yang sama: 4 × 3 = 12 baris. Inilah baris berlipat.", hint: "Setiap barang bertemu setiap pembayaran." },
    { id: "sql-06-02", kind: "choice", prompt: "Kamu menulis <code>app.customers c LEFT JOIN app.orders o ON o.customer_id = c.customer_id</code>. Apa isi kolom <code>o.order_id</code> untuk pelanggan yang belum pernah memesan?",
      options: ["Baris pelanggan itu tidak muncul", "0", "NULL", "Nomor pesanan terakhir di tabel"], answer: 2,
      why: "LEFT JOIN menyimpan semua baris tabel kiri. Kalau tidak ada pasangan, semua kolom tabel kanan diisi NULL.", hint: "LEFT JOIN tidak membuang baris kiri." },
    { id: "sql-06-03", kind: "sql", prompt: "Untuk pesanan nomor 100001 sampai 100010, tampilkan <code>order_id</code>, <code>order_ts</code>, dan <code>full_name</code> pelanggan yang memesan.",
      solution: "select o.order_id, o.order_ts, c.full_name from app.orders as o join app.customers as c on c.customer_id = o.customer_id where o.order_id between 100001 and 100010",
      why: "Pesanan dan pelanggan dihubungkan lewat foreign key o.customer_id yang merujuk ke primary key c.customer_id.", hint: "from app.orders as o join app.customers as c on …" },
    { id: "sql-06-04", kind: "sql", prompt: "Hitung jumlah pelanggan di setiap pulau. Tampilkan <code>island</code> dan jumlah pelanggannya.",
      solution: "select ci.island, count(*) as jumlah_pelanggan from app.customers as c join app.cities as ci on ci.city_id = c.city_id group by ci.island",
      why: "Pulau ada di app.cities, pelanggan di app.customers. Gabungkan lewat city_id, lalu kelompokkan per pulau. COUNT(*) aman di sini karena setiap pelanggan hanya punya satu kota.", hint: "Join ke app.cities, lalu GROUP BY island." },
    { id: "sql-06-05", kind: "sql", prompt: "Tampilkan <code>order_id</code> dan <code>status</code> semua pesanan yang tidak punya satu pun baris di <code>app.payments</code>.",
      solution: "select o.order_id, o.status from app.orders as o left join app.payments as p on p.order_id = o.order_id where p.payment_id is null",
      why: "Pola anti-join: LEFT JOIN ke app.payments, lalu ambil baris yang primary key pembayarannya NULL. Hasilnya 519 pesanan.", hint: "LEFT JOIN, lalu where p.payment_id is null." },
    { id: "sql-06-06", kind: "sql", prompt: "Tampilkan setiap karyawan (25 orang): <code>staff_id</code>, <code>full_name</code>, dan nama atasannya. Karyawan tanpa atasan tetap ditampilkan dengan nama atasan kosong.",
      solution: "select k.staff_id, k.full_name, a.full_name as nama_atasan from app.staff as k left join app.staff as a on a.staff_id = k.manager_id",
      why: "Self join: app.staff dipakai dua kali dengan alias berbeda. LEFT JOIN menjaga direktur, yang manager_id-nya NULL.", hint: "Dua alias untuk app.staff; hubungkan a.staff_id dengan k.manager_id." },
    { id: "sql-06-07", kind: "sql", level: "menengah", prompt: "Untuk setiap karyawan (25 orang), tampilkan <code>staff_id</code>, <code>full_name</code>, dan jumlah pesanan yang ditanganinya (<code>handled_by</code>). Karyawan yang tidak pernah menangani pesanan tampil dengan jumlah 0.",
      solution: "select s.staff_id, s.full_name, count(o.order_id) as jumlah_pesanan from app.staff as s left join app.orders as o on o.handled_by = s.staff_id group by s.staff_id, s.full_name",
      why: "LEFT JOIN menjaga 10 karyawan tanpa pesanan. COUNT(o.order_id) menghitung 0 untuk mereka; COUNT(*) akan salah menghitung 1, karena baris berisi NULL tetap satu baris.", hint: "Hitung kolom dari tabel kanan, bukan COUNT(*)." },
    { id: "sql-06-08", kind: "fix", prompt: "Query ini seharusnya menampilkan <b>semua</b> pelanggan di kota nomor 24 (Jayapura) beserta jumlah pesanan mereka di bulan Oktober 2025, dengan 0 untuk yang tidak memesan. Ternyata sebagian pelanggan hilang. Perbaiki.",
      start: "select c.customer_id, c.full_name, count(o.order_id) as pesanan_oktober\nfrom app.customers as c\nleft join app.orders as o on o.customer_id = c.customer_id\nwhere c.city_id = 24\n  and o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01'\ngroup by c.customer_id, c.full_name;",
      solution: "select c.customer_id, c.full_name, count(o.order_id) as pesanan_oktober from app.customers as c left join app.orders as o on o.customer_id = c.customer_id and o.order_ts >= '2025-10-01' and o.order_ts < '2025-11-01' where c.city_id = 24 group by c.customer_id, c.full_name",
      why: "Syarat tanggal untuk tabel kanan (app.orders) ada di WHERE, sehingga pelanggan tanpa pesanan Oktober (order_ts NULL) dibuang, dan hanya 5 dari 16 pelanggan yang tersisa. Pindahkan syarat tanggal ke ON. Syarat kota tetap di WHERE karena untuk tabel kiri.", hint: "Syarat untuk tabel kanan LEFT JOIN ditaruh di mana?" },
    { id: "sql-06-09", kind: "number", prompt: "Berapa pelanggan di <code>app.customers</code> yang belum pernah membuat pesanan?",
      answerSql: "select count(*) from app.customers as c left join app.orders as o on o.customer_id = c.customer_id where o.order_id is null",
      why: "Anti-join: select count(*) from app.customers as c left join app.orders as o on o.customer_id = c.customer_id where o.order_id is null.", hint: "LEFT JOIN, ambil yang o.order_id-nya NULL, lalu hitung." },
    { id: "sql-06-10", kind: "sql", level: "wawancara", prompt: "Untuk setiap pesanan, tampilkan <code>order_id</code>, total nilai barang (jumlah <code>qty * unit_price - discount</code> dari <code>app.order_items</code>), dan total pembayaran (jumlah <code>amount</code> dari <code>app.payments</code>, semua status; 0 kalau pesanan tidak punya pembayaran). Tulis dalam <b>satu</b> query SELECT dengan JOIN, tanpa angka berlipat. Setiap pesanan punya minimal satu baris barang.",
      solution: "select oi.order_id,\n       round(sum(oi.qty * oi.unit_price - oi.discount) / (count(*) / count(distinct oi.line_no)), 2) as total_barang,\n       round(coalesce(sum(p.amount), 0) / count(distinct oi.line_no), 2) as total_bayar\nfrom app.order_items as oi\nleft join app.payments as p on p.order_id = oi.order_id\ngroup by oi.order_id",
      why: "Dalam satu pesanan, gabungan barang dan pembayaran berisi (jumlah barang × jumlah salinan) baris. Setiap baris barang tersalin sebanyak count(*) / count(distinct line_no) kali: sama dengan jumlah pembayaran, atau 1 kalau tidak ada pembayaran (LEFT JOIN tetap menyimpan satu baris per barang). Jadi SUM nilai barang dibagi jumlah salinan itu. Pembagian bilangan bulat di sini aman, karena count(*) selalu kelipatan jumlah barang. Setiap pembayaran tersalin sekali per barang, jadi SUM amount dibagi count(distinct line_no); COALESCE mengubah NULL menjadi 0 untuk pesanan tanpa pembayaran. Bukti untuk pesanan 100132: query ini memberi 323.600 dan 338.600, sama dengan select sum(qty * unit_price - discount) from app.order_items where order_id = 100132 dan select sum(amount) from app.payments where order_id = 100132. Hasilnya juga sudah dicocokkan untuk seluruh 12.007 pesanan.",
      hint: "Hitung dulu berapa kali setiap baris tersalin: bandingkan count(*) dengan count(distinct oi.line_no) per pesanan. Jangan lupa pesanan tanpa pembayaran." },
    { id: "sql-06-11", kind: "explain", prompt: "Rekanmu menggabung <code>app.order_items</code> dan <code>app.payments</code> lalu menjumlahkan <code>amount</code>. Total pembayarannya lebih besar dari laporan keuangan. Jelaskan kenapa itu terjadi dan bagaimana kamu memeriksanya.",
      model: "Satu pesanan bisa punya banyak barang dan lebih dari satu pembayaran. Saat kedua tabel digabung lewat order_id, setiap pembayaran dipasangkan dengan setiap barang, sehingga satu pembayaran muncul sebanyak jumlah barangnya. SUM(amount) ikut berlipat. Untuk memeriksanya, bandingkan COUNT(*) dengan COUNT(DISTINCT p.payment_id): kalau baris lebih banyak dari pembayaran yang berbeda, ada salinan. Perbaikannya: jumlahkan amount dari app.payments saja, tanpa digabung dengan barang, atau bagi dengan jumlah salinannya.",
      hint: "Pikirkan grain hasil gabungan: satu baris mewakili apa?" },
  ],
};
