// Bab 8 SQL: CTE (WITH), CTE berantai, WITH RECURSIVE untuk hirarki, dan generate_series untuk deret angka dan tanggal.
export default {
  id: "sql-08",
  part: "sql",
  title: "CTE dan query panjang",
  minutes: 80,
  goals: [
    "Memberi nama pada satu langkah query dengan <code>WITH</code> (CTE), lalu memakainya seperti tabel.",
    "Memecah query panjang menjadi beberapa CTE berantai yang dibaca dari atas ke bawah, dan membandingkannya dengan subquery.",
    "Menelusuri hirarki (kategori bertingkat, atasan dan bawahan) dengan <code>WITH RECURSIVE</code>, lengkap dengan kolom kedalaman.",
    "Mengenali rekursi tanpa ujung dan memberinya batas.",
    "Membuat deret angka dan tanggal dengan <code>generate_series</code>, lalu menampilkan tanggal tanpa data sebagai 0.",
  ],
  terms: [
    { term: "CTE", def: "<i>Common Table Expression</i> (ungkapan tabel bersama): hasil sebuah query yang diberi nama di bagian <code>WITH</code>, lalu dipakai seperti tabel oleh query yang sama. Nama itu hanya berlaku sampai query tersebut selesai." },
    { term: "cte berantai", def: "Beberapa CTE di dalam satu <code>WITH</code>, dipisah koma, ketika CTE yang ditulis belakangan memakai CTE yang ditulis sebelumnya." },
    { term: "hirarki", def: "Susunan bertingkat antara induk dan anak, misalnya kategori dan subkategori, atau atasan dan bawahan. Di tabel biasanya disimpan sebagai kolom yang merujuk ke tabel itu sendiri, seperti <code>parent_id</code> atau <code>manager_id</code>." },
    { term: "akar dan daun", def: "Di sebuah hirarki, akar adalah baris paling atas yang tidak punya induk; daun adalah baris paling bawah yang tidak punya anak." },
    { term: "rekursif", def: "Merujuk ke dirinya sendiri. Query rekursif memakai hasilnya sendiri untuk menghasilkan baris berikutnya, berulang sampai tidak ada baris baru." },
    { term: "anchor", def: "Bagian awal <code>WITH RECURSIVE</code>, sebelum <code>UNION ALL</code>. Dijalankan sekali dan menghasilkan baris pertama. Kata Inggris <i>anchor</i> berarti jangkar." },
    { term: "bagian rekursif", def: "Bagian <code>WITH RECURSIVE</code> sesudah <code>UNION ALL</code> yang merujuk ke nama CTE itu sendiri. Dijalankan berulang; setiap putaran hanya memakai baris yang baru dihasilkan putaran sebelumnya." },
    { term: "kedalaman", def: "Tingkat sebuah baris di hirarki, dihitung dari titik awal rekursi, misalnya 1 untuk akar, 2 untuk anaknya, dan seterusnya." },
    { term: "deret", def: "Urutan nilai dengan jarak tetap, misalnya 1, 2, 3, atau tanggal 1 di setiap bulan. Di PostgreSQL dibuat dengan <code>generate_series</code>." },
  ],
  introduces: ["WITH", "WITH RECURSIVE", "GENERATE_SERIES()"],
  sections: [
    {
      title: "CTE: memberi nama pada satu langkah query",
      html: `<p>Query yang sungguhan sering panjang: menyaring, meringkas, lalu menggabung hasil ringkasan itu dengan tabel lain. Kalau semuanya ditulis dalam satu SELECT, query menjadi sulit dibaca dan sulit diperiksa. <code>WITH</code> memecahnya menjadi langkah-langkah yang diberi nama.</p>
<p>Setiap langkah bernama itu disebut <b>CTE</b>, singkatan dari <i>Common Table Expression</i> (ungkapan tabel bersama). Bentuknya:</p>
<pre>with nama_langkah as (
  select ...
)
select ... from nama_langkah;</pre>
<p>Query di dalam tanda kurung dijalankan, hasilnya diberi nama <code>nama_langkah</code>, lalu query utama di bawahnya memakai nama itu seperti nama tabel. Dokumentasi PostgreSQL menyebut CTE sebagai tabel sementara yang hanya ada selama satu query. Setelah query selesai, nama itu hilang. Kalau query berikutnya menulis <code>select * from nama_langkah</code>, PostgreSQL menolak dengan pesan <code>relation "nama_langkah" does not exist</code> (tabel itu tidak ada).</p>
<p>Nama CTE ditulis tanpa nama skema, karena CTE bukan tabel yang tersimpan di database. Pilih nama yang menjelaskan isinya, misalnya <code>pesanan_oktober</code>, bukan <code>t1</code>.</p>`,
      examples: [{ sql: "with pesanan_oktober as (\n  select order_id, customer_id, status\n  from app.orders\n  where order_ts >= '2025-10-01' and order_ts < '2025-11-01'\n)\nselect status, count(*) as jumlah\nfrom pesanan_oktober\ngroup by status\norder by jumlah desc;", note: "Langkah pertama mengambil 590 pesanan Oktober 2025. Query utama meringkasnya per status: 482 completed, 49 shipped, 33 cancelled, 13 returned, dan 13 processing." }],
    },
    {
      title: "CTE berantai: beberapa langkah dalam satu WITH",
      html: `<p>Satu <code>WITH</code> boleh berisi banyak CTE, dipisah koma. Kata WITH hanya ditulis sekali, di depan CTE pertama. CTE yang ditulis belakangan boleh memakai CTE yang ditulis sebelumnya. Inilah <b>CTE berantai</b>. Arah sebaliknya tidak boleh: tanpa kata RECURSIVE (dibahas nanti di bab ini), CTE hanya boleh merujuk ke CTE yang ada di atasnya.</p>
<p>Ingat soal di bab 6: total nilai barang dan total pembayaran per pesanan. Kalau <code>app.order_items</code> dan <code>app.payments</code> langsung digabung, angkanya berlipat. Jalan yang aman adalah meringkas setiap tabel sendiri-sendiri, baru menggabung hasil ringkasannya. Dengan CTE, setiap ringkasan mendapat nama:</p>
<ol><li><code>barang</code>: total nilai barang per pesanan. Grain-nya satu baris per pesanan.</li>
<li><code>bayar</code>: total pembayaran per pesanan, juga satu baris per pesanan.</li>
<li>Query utama menggabung keduanya lewat <code>order_id</code>. Karena kedua sisi sudah satu baris per pesanan, tidak ada baris yang berlipat.</li></ol>
<p>Pemakaian LEFT JOIN menjaga pesanan yang tidak punya pembayaran, dan COALESCE mengubah total bayarnya dari NULL menjadi 0.</p>
<p>Contoh kedua menambah langkah ketiga, <code>per_pesanan</code>, yang memakai dua CTE sebelumnya dan ongkos kirim dari <code>app.orders</code>. Query utamanya memeriksa apakah total bayar sama dengan total barang ditambah ongkos kirim. Hasilnya: kecocokan itu berlaku untuk semua 11.488 pesanan yang punya pembayaran, dan 519 pesanan tidak punya pembayaran sama sekali.</p>`,
      examples: [
        { sql: "with barang as (\n  select order_id, sum(qty * unit_price - discount) as total_barang\n  from app.order_items\n  group by order_id\n),\nbayar as (\n  select order_id, sum(amount) as total_bayar\n  from app.payments\n  group by order_id\n)\nselect b.order_id, b.total_barang, coalesce(y.total_bayar, 0) as total_bayar\nfrom barang as b\nleft join bayar as y on y.order_id = b.order_id\nwhere b.order_id between 100131 and 100135\norder by b.order_id;", note: "Pesanan 100132 kini benar: 323.600 untuk barang dan 338.600 untuk pembayaran, sama dengan hasil menghitung kedua tabel satu per satu di bab 6." },
        { sql: "with barang as (\n  select order_id, sum(qty * unit_price - discount) as total_barang\n  from app.order_items\n  group by order_id\n),\nbayar as (\n  select order_id, sum(amount) as total_bayar\n  from app.payments\n  group by order_id\n),\nper_pesanan as (\n  select o.order_id, b.total_barang, o.shipping_fee, y.total_bayar\n  from app.orders as o\n  join barang as b on b.order_id = o.order_id\n  left join bayar as y on y.order_id = o.order_id\n)\nselect case\n         when total_bayar is null then 'tanpa pembayaran'\n         when total_bayar = total_barang + shipping_fee then 'cocok'\n         else 'beda'\n       end as hasil_cek,\n       count(*) as jumlah_pesanan\nfrom per_pesanan\ngroup by 1\norder by 1;", note: "Tidak ada baris 'beda'. Langkah per_pesanan memakai barang dan bayar, yang ditulis di atasnya." },
      ],
    },
    {
      title: "CTE atau subquery?",
      html: `<p>Hasil yang sama bisa ditulis dengan subquery dari bab 7. Subquery juga boleh ditaruh di FROM: hasilnya diperlakukan seperti tabel dan wajib diberi alias. Contoh pertama di bawah adalah contoh <code>barang</code> dan <code>bayar</code> tadi, ditulis dengan dua subquery di FROM.</p>
<p>Hasilnya sama persis. Perbedaannya ada pada cara membaca:</p>
<ul><li><b>Urutan baca.</b> Dengan subquery, pembaca harus mulai dari bagian paling dalam. Dengan CTE, langkahnya dibaca dari atas ke bawah, sesuai urutan kerjanya.</li>
<li><b>Nama.</b> Setiap CTE punya nama yang menjelaskan isinya. Subquery di FROM hanya punya alias, yang sering pendek.</li>
<li><b>Dipakai ulang.</b> Satu CTE boleh dipakai beberapa kali di query yang sama. Subquery yang sama harus ditulis ulang setiap kali dibutuhkan.</li></ul>
<p>Contoh kedua memakai satu CTE tiga kali. <code>per_pelanggan</code> menghitung jumlah pesanan setiap pelanggan. Query utama memakainya untuk menghitung rata-rata (8,52 pesanan, dihitung dari 1.410 pelanggan yang pernah memesan), lalu menghitung pelanggan yang jumlah pesanannya di atas rata-rata: 502 orang.</p>
<p>Soal kecepatan: menurut dokumentasi PostgreSQL, CTE yang bukan rekursif dan hanya dipakai sekali biasanya dilebur ke query utama, sehingga dikerjakan sama seperti subquery. CTE yang dipakai lebih dari sekali dihitung terpisah satu kali. Jadi pilih CTE terutama karena lebih mudah dibaca, bukan karena lebih cepat.</p>`,
      examples: [
        { sql: "select b.order_id, b.total_barang, coalesce(y.total_bayar, 0) as total_bayar\nfrom (select order_id, sum(qty * unit_price - discount) as total_barang\n      from app.order_items\n      group by order_id) as b\nleft join (select order_id, sum(amount) as total_bayar\n           from app.payments\n           group by order_id) as y on y.order_id = b.order_id\nwhere b.order_id between 100131 and 100135\norder by b.order_id;", note: "Hasilnya sama dengan contoh CTE sebelumnya. Bandingkan mana yang lebih mudah dibaca." },
        { sql: "with per_pelanggan as (\n  select customer_id, count(*) as jumlah_pesanan\n  from app.orders\n  group by customer_id\n)\nselect count(*) as pelanggan_di_atas_rata,\n       (select round(avg(jumlah_pesanan), 2) from per_pelanggan) as rata_rata\nfrom per_pelanggan\nwhere jumlah_pesanan > (select avg(jumlah_pesanan) from per_pelanggan);", note: "per_pelanggan ditulis sekali dan dipakai tiga kali: di FROM dan di dua subquery skalar." },
      ],
    },
    {
      title: "Kebiasaan menulis query panjang",
      html: `<p>Beberapa kebiasaan yang membuat query panjang mudah dirawat:</p>
<ul><li><b>Satu CTE, satu tujuan.</b> Misalnya satu langkah menyaring, satu langkah meringkas, satu langkah menggabung.</li>
<li><b>Tahu grain setiap langkah.</b> Tulis di kepalamu (atau di komentar <code>--</code>) apa arti satu baris di setiap CTE. Kalau dua CTE yang akan digabung sama-sama satu baris per pesanan, gabungannya aman.</li>
<li><b>Periksa per langkah.</b> Untuk melihat isi satu langkah, ganti sementara query utamanya menjadi <code>select * from nama_langkah limit 5</code>. Langkah lain tidak perlu diubah.</li>
<li><b>Query utama tetap pendek.</b> Idealnya query utama hanya memilih kolom akhir dan urutan.</li></ul>
<p>Contoh di bawah memakai CTE <code>barang</code> yang sama, tetapi query utamanya hanya mengintip isi langkah itu.</p>`,
      examples: [{ sql: "with barang as (\n  select order_id, sum(qty * unit_price - discount) as total_barang\n  from app.order_items\n  group by order_id\n)\n-- query utama sementara: mengintip isi langkah barang\nselect * from barang\norder by order_id\nlimit 5;", note: "Setelah isi langkahnya terlihat benar, kembalikan query utama seperti semula." }],
    },
    {
      title: "Hirarki: tabel yang merujuk ke dirinya sendiri",
      html: `<p><b>Hirarki</b> adalah susunan bertingkat antara induk dan anak. Di TokoKita ada dua:</p>
<ul><li><code>app.categories</code>: kolom <code>parent_id</code> berisi nomor kategori induk, di tabel yang sama. Kategori paling atas punya <code>parent_id</code> NULL.</li>
<li><code>app.staff</code>: kolom <code>manager_id</code> berisi nomor atasan langsung, juga di tabel yang sama. Direktur punya <code>manager_id</code> NULL.</li></ul>
<p>Baris paling atas disebut <b>akar</b>, baris paling bawah yang tidak punya anak disebut <b>daun</b>. <code>app.categories</code> berisi 22 kategori: 5 akar, 10 kategori di tingkat kedua, dan 7 di tingkat ketiga. Kedalamannya tidak sama. Elektronik dan Rumah Tangga punya tiga tingkat (Elektronik → Audio → Earphone), sedangkan Kesehatan & Kecantikan, Olahraga, dan Buku & Alat Tulis hanya dua tingkat. Ke-150 produk di <code>app.products</code> semuanya ada di kategori daun.</p>
<p>Di bab 6 kamu memakai self join untuk menampilkan atasan langsung. Satu self join hanya naik satu tingkat. Untuk sampai ke akar, kamu harus menambah satu join per tingkat, dan jumlah tingkatnya harus diketahui lebih dulu. Kalau besok ada kategori tingkat keempat, query itu salah tanpa pesan error. Untuk hirarki yang kedalamannya tidak tetap, dipakai query rekursif.</p>`,
      examples: [{ sql: "select category_id, category_name, parent_id\nfrom app.categories\norder by category_id;", note: "Earphone (3) punya induk Audio (2), dan Audio punya induk Elektronik (1). Elektronik punya parent_id NULL, jadi ia akar." }],
    },
    {
      title: "WITH RECURSIVE: anchor dan bagian rekursif",
      html: `<p><b>Rekursif</b> berarti merujuk ke dirinya sendiri. <code>WITH RECURSIVE</code> membuat CTE yang boleh memakai hasilnya sendiri. Bentuknya selalu dua bagian yang disambung <code>UNION ALL</code>:</p>
<ol><li><b>Anchor</b> (jangkar), bagian sebelum UNION ALL: query biasa yang dijalankan sekali dan menghasilkan baris awal. Dokumentasi PostgreSQL menyebutnya <i>non-recursive term</i>.</li>
<li><b>Bagian rekursif</b>, bagian sesudah UNION ALL: query yang merujuk ke nama CTE itu sendiri. Dokumentasi PostgreSQL menyebutnya <i>recursive term</i>.</li></ol>
<p>Cara kerjanya, menurut dokumentasi PostgreSQL: anchor dijalankan, hasilnya masuk ke hasil akhir dan ke sebuah tabel kerja. Lalu bagian rekursif dijalankan dengan nama CTE berisi tabel kerja itu, yaitu hanya baris yang baru dihasilkan putaran sebelumnya. Baris barunya masuk ke hasil akhir dan menjadi isi tabel kerja berikutnya. Putaran berulang sampai bagian rekursif tidak menghasilkan baris lagi.</p>
<p>Contoh di bawah menghitung 1 sampai 5. Anchor menghasilkan 1. Putaran pertama membaca 1 dan menghasilkan 2, putaran berikutnya 3, lalu 4, lalu 5. Saat membaca 5, syarat <code>n &lt; 5</code> salah, sehingga tidak ada baris baru dan rekursi berhenti. Tulisan <code>angka (n)</code> memberi nama kolom CTE; daftar nama kolom ini boleh ditulis untuk CTE apa pun.</p>
<p>Kalau satu WITH berisi beberapa CTE dan salah satunya rekursif, kata RECURSIVE cukup ditulis sekali, langsung setelah WITH.</p>`,
      examples: [{ sql: "with recursive angka (n) as (\n  select 1               -- anchor\n  union all\n  select n + 1           -- bagian rekursif\n  from angka\n  where n < 5\n)\nselect n from angka;", note: "Lima baris. Syarat WHERE di bagian rekursif adalah yang menghentikan rekursi." }],
    },
    {
      title: "Jalur kategori dari akar ke daun",
      html: `<p>Untuk hirarki kategori, anchor-nya adalah semua akar (<code>parent_id is null</code>). Bagian rekursifnya mencari anak dari baris putaran sebelumnya: kategori yang <code>parent_id</code>-nya sama dengan <code>category_id</code> di CTE. Putaran pertama menemukan 10 kategori tingkat kedua, putaran kedua menemukan 7 kategori tingkat ketiga, dan putaran ketiga tidak menemukan apa pun, sehingga rekursi berhenti sendiri.</p>
<p>Dua kolom dibawa dari putaran ke putaran:</p>
<ul><li><code>kedalaman</code>: 1 di anchor, lalu ditambah 1 setiap turun satu tingkat.</li>
<li><code>jalur</code>: nama kategori induk disambung nama anaknya dengan <code>' &gt; '</code>.</li></ul>
<p>Urutkan hasilnya menurut jalur, maka setiap anak tampil tepat di bawah induknya.</p>`,
      examples: [
        { sql: "with recursive pohon as (\n  select category_id, category_name, 1 as kedalaman,\n         category_name as jalur\n  from app.categories\n  where parent_id is null\n  union all\n  select c.category_id, c.category_name, p.kedalaman + 1,\n         p.jalur || ' > ' || c.category_name\n  from app.categories as c\n  join pohon as p on c.parent_id = p.category_id\n)\nselect category_id, kedalaman, jalur\nfrom pohon\norder by jalur;", note: "22 baris, sama dengan jumlah kategori. Contoh jalur: Elektronik &gt; Audio &gt; Earphone." },
        { sql: "with recursive pohon as (\n  select category_id, 1 as kedalaman\n  from app.categories\n  where parent_id is null\n  union all\n  select c.category_id, p.kedalaman + 1\n  from app.categories as c\n  join pohon as p on c.parent_id = p.category_id\n)\nselect kedalaman, count(*) as jumlah_kategori\nfrom pohon\ngroup by kedalaman\norder by kedalaman;", note: "5 kategori di kedalaman 1, 10 di kedalaman 2, dan 7 di kedalaman 3." },
      ],
    },
    {
      title: "Rantai atasan dan daftar bawahan",
      html: `<p>Hirarki bisa ditelusuri ke dua arah. Arahnya ditentukan oleh syarat join di bagian rekursif:</p>
<ul><li><b>Naik ke atasan:</b> <code>s.staff_id = r.manager_id</code>. Cari karyawan yang nomornya sama dengan atasan baris sebelumnya.</li>
<li><b>Turun ke bawahan:</b> <code>s.manager_id = b.staff_id</code>. Cari karyawan yang atasannya adalah baris sebelumnya.</li></ul>
<p>Struktur <code>app.staff</code>: 1 direktur, 3 manajer, 6 supervisor, dan 15 agen layanan pelanggan, jadi empat tingkat. Contoh pertama mulai dari Putri Maharani (staff_id 25) dan naik sampai direktur. Rekursi berhenti saat sampai di Hadi Halim, karena <code>manager_id</code>-nya NULL dan tidak ada karyawan yang cocok dengan NULL.</p>
<p>Contoh kedua mulai dari manajer Oki Kurniawan (staff_id 2) dan turun: 2 supervisor di bawahnya langsung, lalu 5 agen di bawah kedua supervisor itu.</p>`,
      examples: [
        { sql: "with recursive rantai as (\n  select staff_id, full_name, role, manager_id, 0 as naik\n  from app.staff\n  where staff_id = 25\n  union all\n  select s.staff_id, s.full_name, s.role, s.manager_id, r.naik + 1\n  from app.staff as s\n  join rantai as r on s.staff_id = r.manager_id\n)\nselect naik, staff_id, full_name, role\nfrom rantai\norder by naik;", note: "Empat baris: Putri Maharani, Joko Pratama (supervisor), Galih Siregar (manajer), Hadi Halim (direktur)." },
        { sql: "with recursive bawahan as (\n  select staff_id, full_name, role, 0 as tingkat\n  from app.staff\n  where staff_id = 2\n  union all\n  select s.staff_id, s.full_name, s.role, b.tingkat + 1\n  from app.staff as s\n  join bawahan as b on s.manager_id = b.staff_id\n)\nselect tingkat, staff_id, full_name, role\nfrom bawahan\norder by tingkat, staff_id;", note: "Delapan baris: Oki Kurniawan sendiri (tingkat 0), 2 supervisor (tingkat 1), dan 5 agen (tingkat 2)." },
      ],
    },
    {
      title: "Rekursi tanpa ujung dan cara memberi batas",
      html: `<p>Rekursi hanya berhenti kalau bagian rekursif akhirnya tidak menghasilkan baris. Dokumentasi PostgreSQL mengingatkan: kalau itu tidak pernah terjadi, query berputar tanpa ujung. PostgreSQL tidak punya batas jumlah putaran bawaan. Query di bawah ini lupa syarat <code>where n &lt; 5</code>, sehingga terus menghitung. Jangan dijalankan; di Dojo, query seperti ini dihentikan setelah 8 detik dan mesin latihan dinyalakan ulang.</p>
<pre>-- JANGAN DIJALANKAN: tidak berujung
with recursive angka (n) as (
  select 1
  union all
  select n + 1 from angka
)
select n from angka;</pre>
<p>Penyebab lain adalah data yang berputar. Misalnya, karena salah input, A atasan B, B atasan C, dan C atasan A. Penelusuran atasan tidak akan pernah sampai ke NULL. Data <code>app.staff</code> sendiri tidak berputar; contoh di bawah membuat data berputar kecil dengan tiga SELECT yang disambung UNION ALL.</p>
<p>Cara memberi batas yang berlaku di semua database: bawa kolom kedalaman, lalu tulis syarat di WHERE bagian rekursif, misalnya <code>where p.kedalaman &lt; 6</code>. Pilih batas yang jelas di atas kedalaman hirarki yang wajar (hirarki karyawan TokoKita hanya empat tingkat). Kalau hasilnya menyentuh batas itu, curigai datanya berputar.</p>
<p>Menurut dokumentasi PostgreSQL, kalau UNION ALL diganti UNION, baris yang sama persis dengan baris sebelumnya dibuang. Itu bisa menghentikan putaran, tetapi hanya kalau barisnya benar-benar kembar. Begitu ada kolom kedalaman atau jalur, setiap putaran menghasilkan baris berbeda, sehingga UNION tidak menolong. PostgreSQL juga punya klausa <code>CYCLE</code> khusus untuk mendeteksi putaran; bab ini memakai kolom kedalaman karena cara itu juga berlaku di SQL Server.</p>`,
      examples: [{ sql: "with recursive atasan (staff_id, manager_id) as (\n  select 1, 3\n  union all select 2, 1\n  union all select 3, 2\n),\nputaran as (\n  select 1 as staff_id, 0 as kedalaman\n  union all\n  select a.manager_id, p.kedalaman + 1\n  from atasan as a\n  join putaran as p on a.staff_id = p.staff_id\n  where p.kedalaman < 6\n)\nselect staff_id, kedalaman\nfrom putaran;", note: "Nomor 1, 3, 2 berulang terus: 1 → 3 → 2 → 1 → 3 → 2 → 1. Tanpa syarat kedalaman &lt; 6, query ini tidak berujung. CTE atasan bukan rekursif; kata RECURSIVE tetap cukup ditulis sekali di depan WITH." }],
    },
    {
      title: "generate_series: deret angka dan tanggal",
      html: `<p><code>generate_series(awal, akhir, langkah)</code> adalah fungsi yang menghasilkan banyak baris: satu baris untuk setiap nilai dari awal sampai akhir, dengan jarak sebesar langkah. Hasil seperti ini disebut <b>deret</b>. Karena hasilnya berupa baris, fungsi ini ditulis di FROM, seperti tabel. Alias yang diberikan (<code>as n</code>) sekaligus menjadi nama kolomnya.</p>
<ul><li>Untuk angka, langkah boleh tidak ditulis; nilai bawaannya 1. <code>generate_series(1, 5)</code> menghasilkan 1 sampai 5.</li>
<li>Kalau awal lebih besar dari akhir dan langkahnya positif, hasilnya nol baris. Langkah 0 ditolak dengan error.</li>
<li>Untuk tanggal, langkahnya wajib berupa interval, misalnya <code>interval '1 month'</code> atau <code>interval '1 day'</code>.</li></ul>
<p>Satu hal yang perlu diketahui: PostgreSQL tidak punya generate_series khusus untuk tipe date. Kalau awal dan akhirnya ditulis sebagai date, keduanya diubah ke timestamp with time zone (timestamptz, dibahas di bab 4), sehingga hasilnya juga bertipe itu. Tambahkan <code>::date</code> di kolom hasilnya kalau yang dibutuhkan tanggal saja.</p>`,
      examples: [
        { sql: "select n\nfrom generate_series(0, 100, 25) as n;", note: "0, 25, 50, 75, 100. Nilai akhir ikut kalau tepat jatuh di salah satu langkah." },
        { sql: "select bulan::date as bulan\nfrom generate_series(date '2025-01-01', date '2025-12-01', interval '1 month') as bulan;", note: "12 baris: tanggal 1 di setiap bulan tahun 2025. Deret ini tidak membaca tabel apa pun, jadi November dan Desember tetap ada walaupun data TokoKita berhenti 31 Oktober 2025." },
      ],
    },
    {
      title: "Menampilkan tanggal tanpa data sebagai 0",
      html: `<p>GROUP BY hanya menghasilkan kelompok yang punya baris. Kalau pada suatu tanggal tidak ada pesanan, tanggal itu tidak muncul sama sekali di hasil, padahal laporan harian biasanya harus menampilkan semua tanggal. Grafik yang dibuat dari hasil seperti itu juga menyesatkan, karena tanggal yang kosong dilompati begitu saja.</p>
<p>Polanya tiga langkah, cocok ditulis dengan CTE:</p>
<ol><li>Buat deret semua tanggal dengan generate_series. Ini kerangkanya.</li>
<li>Ringkas data per tanggal di CTE lain.</li>
<li>LEFT JOIN kerangka ke ringkasan, lalu ubah NULL menjadi 0 dengan COALESCE.</li></ol>
<p>Contoh: jumlah pesanan yang ditangani agen layanan pelanggan (<code>handled_by</code> tidak kosong) setiap tanggal di Oktober 2025. Ada 65 pesanan seperti itu. Tanpa kerangka tanggal, hasilnya hanya 26 baris. Dengan kerangka, hasilnya 31 baris, dan tanggal 3, 8, 11, 15, serta 26 Oktober tampil dengan 0.</p>`,
      examples: [{ sql: "with tanggal as (\n  select d::date as tgl\n  from generate_series(date '2025-10-01', date '2025-10-31', interval '1 day') as d\n),\nditangani as (\n  select order_ts::date as tgl, count(*) as jumlah\n  from app.orders\n  where handled_by is not null\n    and order_ts >= '2025-10-01' and order_ts < '2025-11-01'\n  group by order_ts::date\n)\nselect t.tgl, coalesce(d.jumlah, 0) as jumlah_pesanan\nfrom tanggal as t\nleft join ditangani as d on d.tgl = t.tgl\norder by t.tgl;", note: "Kerangka tanggal ada di kiri LEFT JOIN, supaya semua 31 tanggal tetap ada." }],
    },
  ],
  tsql: [
    { pg: "with nama as (select …) select … from nama", tsql: ";with nama as (select …) select … from nama", note: "Bentuknya sama. Dokumentasi SQL Server mensyaratkan pernyataan sebelum WITH diakhiri titik koma kalau keduanya ada dalam satu kumpulan perintah (<i>batch</i>). Karena itu banyak orang menulis titik koma tepat di depan WITH, supaya aman walaupun pernyataan sebelumnya lupa diberi titik koma." },
    { pg: "with a as (…), b as (select … from a) select …", tsql: "with a as (…), b as (select … from a) select …", note: "Sama: CTE dipisah koma, dan hanya boleh merujuk ke CTE yang ditulis sebelumnya." },
    { pg: "order by di dalam CTE", tsql: "tidak boleh, kecuali bersama TOP atau OFFSET/FETCH", note: "PostgreSQL mengizinkan ORDER BY di dalam CTE. Di kedua dialek, urutan hasil akhir tetap ditentukan oleh ORDER BY di query utama." },
    { pg: "with recursive nama as (…)", tsql: "with nama as (…)", note: "SQL Server tidak punya kata RECURSIVE. CTE otomatis menjadi rekursif kalau merujuk ke dirinya sendiri." },
    { pg: "anchor union all bagian_rekursif", tsql: "anchor union all bagian_rekursif", note: "Di SQL Server hanya UNION ALL yang boleh di antara anchor dan bagian rekursif. Bagian rekursif juga tidak boleh memakai GROUP BY, DISTINCT, TOP, LEFT/RIGHT JOIN, atau subquery." },
    { pg: "p.jalur || ' > ' || c.category_name", tsql: "cast(p.jalur + ' > ' + c.category_name as varchar(500))", note: "SQL Server mewajibkan tipe data setiap kolom di bagian rekursif sama persis dengan di anchor. Contoh di dokumentasi resminya membungkus kolom teks di kedua bagian dengan CONVERT(VARCHAR(255), …)." },
    { pg: "tidak ada batas putaran bawaan", tsql: "batas bawaan 100 putaran: … option (maxrecursion 500)", note: "Di SQL Server, query berhenti dengan error kalau rekursi melewati 100 putaran. OPTION (MAXRECURSION n) ditulis di akhir query utama, bukan di dalam CTE; n antara 0 dan 32.767, dan 0 berarti tanpa batas. Di PostgreSQL, batas harus kamu tulis sendiri di WHERE." },
    { pg: "select n from generate_series(1, 5) as n", tsql: "select value from generate_series(1, 5)", note: "GENERATE_SERIES baru ada sejak SQL Server 2022 (16.x), dan database-nya harus memakai tingkat kompatibilitas (<i>compatibility level</i>) minimal 160, kecuali pengaturan ALLOW_BUILTIN_TVF_IN_ALL_COMPAT_LEVELS dinyalakan. Database yang dipindah dari versi lama tetap memakai tingkat lamanya; cek dengan select name, compatibility_level from sys.databases. Kolom hasilnya selalu bernama value." },
    { pg: "generate_series(date '2025-01-01', date '2025-12-01', interval '1 month')", tsql: "select dateadd(month, value, cast('2025-01-01' as date)) from generate_series(0, 11)", note: "GENERATE_SERIES di SQL Server hanya menerima angka (tinyint, smallint, int, bigint, decimal, numeric), tidak menerima tanggal. Buat deret angka, lalu tambahkan ke tanggal awal dengan DATEADD. Di versi sebelum 2022, deret biasanya dibuat dengan CTE rekursif; ingat batas 100 putarannya." },
    { pg: "CTE dipakai beberapa kali", tsql: "CTE dipakai beberapa kali", note: "Dokumentasi SQL Server menyebut hasil CTE tidak disimpan: setiap kali nama CTE dipakai, query-nya dijalankan ulang. PostgreSQL menghitung CTE yang dipakai lebih dari sekali satu kali saja." },
  ],
  summary: [
    "CTE (<code>WITH nama AS (…)</code>) memberi nama pada hasil sebuah query. Nama itu dipakai seperti tabel, tetapi hanya berlaku di query yang sama.",
    "Beberapa CTE dipisah koma dalam satu WITH; CTE yang ditulis belakangan boleh memakai yang ditulis sebelumnya.",
    "Pecah query panjang menjadi langkah bernama dengan grain yang jelas. Periksa setiap langkah dengan <code>select * from nama_langkah limit 5</code>.",
    "CTE dan subquery bisa memberi hasil yang sama. CTE dipilih karena dibaca dari atas ke bawah dan bisa dipakai ulang.",
    "<code>WITH RECURSIVE</code> terdiri dari anchor (dijalankan sekali) dan bagian rekursif (diulang sampai tidak ada baris baru), disambung UNION ALL.",
    "Arah join di bagian rekursif menentukan arah penelusuran: naik ke atasan atau turun ke bawahan.",
    "Rekursi tanpa ujung terjadi kalau bagian rekursif selalu menghasilkan baris. Bawa kolom kedalaman dan batasi di WHERE.",
    "<code>generate_series</code> membuat deret angka atau tanggal. LEFT JOIN dari deret tanggal ke ringkasan data menampilkan tanggal tanpa data sebagai 0.",
  ],
  drills: [
    { id: "sql-08-01", kind: "choice", prompt: "Kamu menjalankan <code>with ringkas as (select …) select * from ringkas;</code>, lalu di query berikutnya menulis <code>select * from ringkas;</code>. Apa yang terjadi pada query kedua?",
      options: ["Menampilkan hasil yang sama dengan query pertama", "Error: relation \"ringkas\" does not exist", "Menampilkan tabel kosong", "PostgreSQL menjalankan ulang isi CTE ringkas"], answer: 1,
      why: "Nama CTE hanya berlaku di dalam query yang mendefinisikannya. Setelah query pertama selesai, nama ringkas hilang, jadi query kedua mencari tabel bernama ringkas dan tidak menemukannya.", hint: "Sampai kapan nama sebuah CTE berlaku?" },
    { id: "sql-08-02", kind: "choice", prompt: "Di sebuah <code>WITH RECURSIVE</code>, apa yang dibaca bagian rekursif setiap kali dijalankan?",
      options: ["Seluruh isi tabel asli", "Semua baris yang sudah dihasilkan sejak anchor", "Hanya baris yang baru dihasilkan putaran sebelumnya", "Hanya baris anchor"], answer: 2,
      why: "Setiap putaran, nama CTE di bagian rekursif berisi tabel kerja, yaitu baris yang baru dihasilkan putaran sebelumnya. Karena itu rekursi berhenti begitu satu putaran tidak menghasilkan baris baru.", hint: "Ingat tabel kerja di penjelasan cara kerja rekursi." },
    { id: "sql-08-03", kind: "sql", prompt: "Buat CTE bernama <code>pesanan_oktober</code> berisi pesanan yang dibuat di bulan Oktober 2025, lalu dari CTE itu tampilkan <code>channel</code> dan jumlah pesanannya.",
      solution: "with pesanan_oktober as (\n  select order_id, channel\n  from app.orders\n  where order_ts >= '2025-10-01' and order_ts < '2025-11-01'\n)\nselect channel, count(*) as jumlah_pesanan\nfrom pesanan_oktober\ngroup by channel",
      why: "CTE menyaring pesanan Oktober dengan rentang setengah terbuka; query utama mengelompokkan hasilnya per channel.", hint: "with pesanan_oktober as (select … where order_ts >= … and order_ts < …) select channel, count(*) from pesanan_oktober group by …" },
    { id: "sql-08-04", kind: "sql", prompt: "Untuk setiap <code>channel</code>, tampilkan rata-rata total nilai barang <b>per pesanan</b> (total <code>qty * unit_price - discount</code> satu pesanan), dibulatkan 2 desimal. Pakai CTE: langkah pertama menghitung total per pesanan.",
      solution: "with barang as (\n  select order_id, sum(qty * unit_price - discount) as total_barang\n  from app.order_items\n  group by order_id\n)\nselect o.channel, round(avg(b.total_barang), 2) as rata_rata_per_pesanan\nfrom app.orders as o\njoin barang as b on b.order_id = o.order_id\ngroup by o.channel",
      why: "Kalau AVG langsung dihitung dari app.order_items, hasilnya rata-rata per baris barang (sekitar 202.938), bukan per pesanan. Langkah barang membuat grain satu baris per pesanan dulu, baru query utama merata-ratakannya per channel. Hasilnya antara 465.170,24 (web) dan 497.053,88 (ios).",
      hint: "Grain langkah pertama: satu baris per pesanan. Baru setelah itu join ke app.orders untuk mengambil channel." },
    { id: "sql-08-05", kind: "sql", ordered: true, prompt: "Tampilkan setiap bulan dari Januari sampai Oktober 2025 (tanggal 1 setiap bulan, bertipe date) dan jumlah pesanan dari pelanggan yang tinggal di Jayapura (<code>city_id</code> 24) pada bulan itu. Bulan tanpa pesanan tampil dengan 0. Urutkan dari bulan paling awal.",
      solution: "with bulan as (\n  select b::date as bulan\n  from generate_series(date '2025-01-01', date '2025-10-01', interval '1 month') as b\n),\npesanan as (\n  select date_trunc('month', o.order_ts)::date as bulan, count(*) as jumlah\n  from app.orders as o\n  join app.customers as c on c.customer_id = o.customer_id\n  where c.city_id = 24 and o.order_ts >= '2025-01-01'\n  group by 1\n)\nselect b.bulan, coalesce(p.jumlah, 0) as jumlah_pesanan\nfrom bulan as b\nleft join pesanan as p on p.bulan = b.bulan\norder by b.bulan",
      why: "Pelanggan Jayapura tidak membuat pesanan di bulan Februari 2025, jadi GROUP BY biasa hanya menghasilkan 9 bulan. Deret bulan dari generate_series menjadi kerangka 10 bulan, LEFT JOIN menjaga Februari, dan COALESCE mengubah NULL menjadi 0.",
      hint: "Kerangka bulan dari generate_series di kiri LEFT JOIN. Ringkasan per bulan memakai date_trunc('month', …)::date supaya bisa dicocokkan." },
    { id: "sql-08-06", kind: "sql", prompt: "Tampilkan semua bawahan Galih Siregar (<code>staff_id</code> 4), langsung maupun tidak langsung: <code>staff_id</code>, <code>full_name</code>, dan tingkat (1 untuk bawahan langsung, 2 untuk bawahan dari bawahan langsung, dan seterusnya). Galih Siregar sendiri tidak ditampilkan.",
      solution: "with recursive bawahan as (\n  select staff_id, full_name, 1 as tingkat\n  from app.staff\n  where manager_id = 4\n  union all\n  select s.staff_id, s.full_name, b.tingkat + 1\n  from app.staff as s\n  join bawahan as b on s.manager_id = b.staff_id\n)\nselect staff_id, full_name, tingkat\nfrom bawahan",
      why: "Anchor-nya bawahan langsung (manager_id = 4), sehingga Galih Siregar sendiri tidak ikut dan tingkatnya mulai dari 1. Bagian rekursif turun dengan s.manager_id = b.staff_id. Hasilnya 7 orang: 2 supervisor dan 5 agen.",
      hint: "Mulai anchor dari karyawan yang manager_id-nya 4, bukan dari staff_id 4." },
    { id: "sql-08-07", kind: "sql", level: "menengah", prompt: "Hitung jumlah produk di setiap kategori paling atas (akar). Tampilkan nama kategori akar dan jumlah produknya. Ingat, produk hanya tercatat di kategori daun, dan kedalaman setiap cabang berbeda.",
      solution: "with recursive akar as (\n  select category_id, category_name as kategori_utama\n  from app.categories\n  where parent_id is null\n  union all\n  select c.category_id, a.kategori_utama\n  from app.categories as c\n  join akar as a on c.parent_id = a.category_id\n)\nselect a.kategori_utama, count(p.product_id) as jumlah_produk\nfrom akar as a\njoin app.products as p on p.category_id = a.category_id\ngroup by a.kategori_utama",
      why: "CTE rekursif memasangkan setiap kategori dengan nama akarnya: anchor membawa nama akar, dan bagian rekursif mewariskan nama itu ke anak, cucu, dan seterusnya, berapa pun kedalamannya. Setelah itu produk cukup digabung lewat category_id. Hasilnya: Elektronik 48, Rumah Tangga 36, dan tiga akar lainnya masing-masing 22.",
      hint: "Bawa kolom nama akar dari anchor ke setiap putaran tanpa diubah." },
    { id: "sql-08-08", kind: "sql", level: "wawancara", prompt: "Untuk setiap karyawan (25 orang), tampilkan <code>staff_id</code>, tingkat (direktur = 1), dan jalur nama dari direktur sampai karyawan itu, dipisah <code>' &gt; '</code>. Contoh untuk Putri Maharani: <code>Hadi Halim &gt; Galih Siregar &gt; Joko Pratama &gt; Putri Maharani</code>.",
      solution: "with recursive jalur as (\n  select staff_id, 1 as tingkat, full_name as jalur_nama\n  from app.staff\n  where manager_id is null\n  union all\n  select s.staff_id, j.tingkat + 1, j.jalur_nama || ' > ' || s.full_name\n  from app.staff as s\n  join jalur as j on s.manager_id = j.staff_id\n)\nselect staff_id, tingkat, jalur_nama\nfrom jalur",
      why: "Mulai dari akar (direktur, manager_id NULL), lalu turun: setiap putaran menambah 1 ke tingkat dan menyambung nama bawahan ke jalur atasannya. Rekursi berhenti setelah tingkat 4, karena agen tidak punya bawahan. Pola ini dipakai untuk membuat kolom jalur lengkap di tabel organisasi atau kategori.",
      hint: "Anchor: direktur. Bagian rekursif: turun ke bawahan, sambil membawa tingkat dan jalur." },
    { id: "sql-08-09", kind: "fix", prompt: "Query ini seharusnya menampilkan Wahyu Hutapea (<code>staff_id</code> 3) beserta semua bawahannya, langsung maupun tidak langsung, dengan tingkat (0 untuk Wahyu sendiri). Ternyata yang muncul justru Wahyu dan direktur. Perbaiki.",
      start: "with recursive bawahan as (\n  select staff_id, full_name, manager_id, 0 as tingkat\n  from app.staff\n  where staff_id = 3\n  union all\n  select s.staff_id, s.full_name, s.manager_id, b.tingkat + 1\n  from app.staff as s\n  join bawahan as b on s.staff_id = b.manager_id\n)\nselect staff_id, full_name, tingkat\nfrom bawahan;",
      solution: "with recursive bawahan as (\n  select staff_id, full_name, manager_id, 0 as tingkat\n  from app.staff\n  where staff_id = 3\n  union all\n  select s.staff_id, s.full_name, s.manager_id, b.tingkat + 1\n  from app.staff as s\n  join bawahan as b on s.manager_id = b.staff_id\n)\nselect staff_id, full_name, tingkat\nfrom bawahan",
      why: "Syarat s.staff_id = b.manager_id mencari atasan dari baris sebelumnya, jadi penelusurannya naik ke direktur. Untuk turun ke bawahan, cari karyawan yang atasannya adalah baris sebelumnya: s.manager_id = b.staff_id. Hasil yang benar 8 baris: Wahyu, 2 supervisor, dan 5 agen.",
      hint: "Arah join di bagian rekursif menentukan naik atau turun." },
    { id: "sql-08-10", kind: "number", prompt: "Berapa tanggal di bulan Oktober 2025 yang tidak punya satu pun pesanan berstatus <code>returned</code> (dihitung menurut tanggal pesanan dibuat, <code>order_ts</code>)?",
      answerSql: "with tanggal as (\n  select d::date as tgl\n  from generate_series(date '2025-10-01', date '2025-10-31', interval '1 day') as d\n)\nselect count(*)\nfrom tanggal as t\nwhere not exists (\n  select 1 from app.orders as o\n  where o.status = 'returned' and o.order_ts::date = t.tgl\n)",
      why: "Buat deret 31 tanggal, lalu hitung tanggal yang tidak punya pasangan pesanan returned: with tanggal as (select d::date as tgl from generate_series(date '2025-10-01', date '2025-10-31', interval '1 day') as d) select count(*) from tanggal as t where not exists (select 1 from app.orders as o where o.status = 'returned' and o.order_ts::date = t.tgl). Hanya 10 tanggal yang punya pesanan returned, jadi jawabannya 21.",
      hint: "Tanggal yang tidak punya data tidak akan muncul dari app.orders. Mulai dari deret tanggal." },
    { id: "sql-08-11", kind: "explain", prompt: "Rekanmu menulis query <code>WITH RECURSIVE</code> untuk menelusuri atasan setiap karyawan dari data sistem HR yang baru dimuat. Query-nya tidak pernah selesai. Jelaskan kemungkinan penyebabnya, dan bagaimana kamu menulis ulang query itu supaya pasti berhenti.",
      model: "Rekursi hanya berhenti kalau bagian rekursif suatu saat tidak menghasilkan baris. Ada dua kemungkinan penyebab. Pertama, syarat berhentinya tidak ada atau salah, misalnya join yang selalu menemukan pasangan. Kedua, datanya berputar: misalnya A tercatat sebagai atasan B, B atasan C, dan C atasan A, sehingga penelusuran tidak pernah sampai ke direktur yang atasannya NULL. PostgreSQL tidak punya batas putaran bawaan, jadi batasnya harus ditulis sendiri: bawa kolom kedalaman yang ditambah 1 setiap putaran, lalu tulis WHERE kedalaman < batas di bagian rekursif, dengan batas jauh di atas jumlah tingkat organisasi yang wajar. Setelah itu periksa baris yang menyentuh batas, karena itulah tanda data yang berputar. Di SQL Server ada batas bawaan 100 putaran (MAXRECURSION), tetapi batas di WHERE tetap lebih jelas.",
      hint: "Kapan rekursi berhenti? Apa yang terjadi kalau data atasan saling menunjuk?" },
  ],
};
