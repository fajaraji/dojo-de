// Bab 2 SQL: menyaring baris dengan WHERE, dan menangani NULL.
export default {
  id: "sql-02",
  part: "sql",
  title: "Menyaring baris: WHERE dan NULL",
  minutes: 70,
  goals: [
    "Mengambil hanya baris yang memenuhi syarat dengan <code>WHERE</code>.",
    "Membandingkan angka, teks, dan tanggal dengan benar.",
    "Menggabungkan beberapa syarat dengan <code>AND</code>, <code>OR</code>, <code>NOT</code>, dan tanda kurung.",
    "Memakai <code>IN</code>, <code>BETWEEN</code>, <code>LIKE</code>, dan <code>ILIKE</code>.",
    "Menyaring sel kosong dengan <code>IS NULL</code> dan menghindari jebakan NULL.",
  ],
  terms: [
    { term: "syarat", def: "Pernyataan yang hasilnya benar atau salah untuk setiap baris, misalnya <code>island = 'Jawa'</code>. Disebut juga <i>kondisi</i> atau <i>predikat</i>." },
    { term: "operator perbandingan", def: "Tanda untuk membandingkan dua nilai: <code>=</code>, <code>&lt;&gt;</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>." },
    { term: "logika tiga nilai", def: "Di SQL, hasil sebuah syarat bisa benar, salah, atau <i>tidak diketahui</i>. Hasil tidak diketahui muncul kalau ada NULL yang ikut dibandingkan." },
    { term: "rentang setengah terbuka", def: "Cara menulis rentang waktu dengan batas bawah ikut (<code>&gt;=</code>) dan batas atas tidak ikut (<code>&lt;</code>), misalnya satu bulan penuh." },
  ],
  introduces: ["WHERE", "=", "<>", "!=", "<", ">", "<=", ">=", "AND", "OR", "NOT", "IN", "NOT IN", "BETWEEN", "LIKE", "ILIKE", "IS NULL", "IS NOT NULL", "NULL", "TRUE", "FALSE"],
  sections: [
    {
      title: "WHERE: hanya baris yang memenuhi syarat",
      html: `<p>Sampai sekarang setiap query mengambil semua baris tabel (atau sebagian dengan LIMIT). Pekerjaan sehari-hari hampir selalu butuh <b>sebagian</b> baris saja: pesanan bulan ini, pelanggan di Jakarta, produk yang masih dijual.</p>
<p><code>WHERE</code> diikuti sebuah <b>syarat</b>. Database memeriksa syarat itu untuk setiap baris, lalu hanya menyimpan baris yang hasilnya benar. Letak WHERE setelah FROM dan sebelum ORDER BY.</p>
<p>Urutan bagian query yang sudah kamu kenal sekarang: <code>SELECT</code> → <code>FROM</code> → <code>WHERE</code> → <code>ORDER BY</code> → <code>LIMIT</code>. Urutan ini wajib; menukar posisinya membuat query salah tulis.</p>`,
      examples: [{ sql: "select product_name, list_price\nfrom app.products\nwhere list_price > 500000\norder by list_price desc;", note: "Hanya produk dengan harga di atas 500.000 rupiah yang tampil. Angka ditulis tanpa titik ribuan." }],
    },
    {
      title: "Operator perbandingan",
      html: `<p>Syarat paling sederhana membandingkan isi kolom dengan sebuah nilai:</p>
<div class="tw"><table class="t"><tr><th>Operator</th><th>Arti</th><th>Contoh</th></tr>
<tr><td><code>=</code></td><td>sama dengan</td><td><code>status = 'cancelled'</code></td></tr>
<tr><td><code>&lt;&gt;</code> atau <code>!=</code></td><td>tidak sama dengan</td><td><code>channel &lt;&gt; 'web'</code></td></tr>
<tr><td><code>&lt;</code>, <code>&gt;</code></td><td>lebih kecil, lebih besar</td><td><code>qty &gt; 2</code></td></tr>
<tr><td><code>&lt;=</code>, <code>&gt;=</code></td><td>lebih kecil atau sama, lebih besar atau sama</td><td><code>shipping_fee &lt;= 12000</code></td></tr></table></div>
<p>Untuk angka, tulis angkanya langsung tanpa tanda kutip dan tanpa titik ribuan: <code>500000</code>, bukan <code>500.000</code>. Desimal memakai titik: <code>2.5</code>.</p>`,
    },
    {
      title: "Membandingkan teks",
      html: `<p>Teks ditulis di antara tanda kutip tunggal: <code>'Jawa'</code>. Tanda kutip ganda (<code>"…"</code>) punya arti lain di PostgreSQL, yaitu nama kolom atau tabel, jadi jangan dipakai untuk teks.</p>
<p>Perbandingan teks di PostgreSQL <b>membedakan huruf besar dan kecil</b>. <code>'Jawa'</code> dan <code>'jawa'</code> dianggap berbeda. Contoh kedua di bawah tidak menghasilkan baris sama sekali, karena tidak ada pulau yang ditulis dengan huruf kecil semua.</p>`,
      examples: [
        { sql: "select city_name, province\nfrom app.cities\nwhere island = 'Jawa';", note: "Sebelas kota di Pulau Jawa." },
        { sql: "select city_name, province\nfrom app.cities\nwhere island = 'jawa';", note: "Hasilnya kosong, karena 'jawa' tidak sama dengan 'Jawa'.", expectEmpty: true },
      ],
    },
    {
      title: "Membandingkan tanggal dan waktu",
      html: `<p>Tanggal juga ditulis dalam tanda kutip dengan format <code>'YYYY-MM-DD'</code> (tahun-bulan-tanggal), misalnya <code>'2025-10-01'</code>. PostgreSQL selalu membaca format ini dengan benar. Di SQL Server ada pengecualian, yang dibahas di tabel "Di SQL Server" di akhir bab.</p>
<p>Hati-hati dengan kolom yang berisi tanggal <i>dan</i> jam, seperti <code>order_ts</code> (kapan pesanan dibuat). Tanggal tanpa jam dibaca sebagai jam 00:00:00. Jadi untuk mengambil semua pesanan bulan Oktober 2025, cara yang benar adalah <b>rentang setengah terbuka</b>: mulai dari tanggal 1 Oktober (ikut), sampai sebelum tanggal 1 November (tidak ikut).</p>
<pre class="sql"><code>where order_ts &gt;= '2025-10-01' and order_ts &lt; '2025-11-01'</code></pre>
<p>Kalau batas atasnya ditulis <code>&lt;= '2025-10-31'</code>, pesanan tanggal 31 Oktober setelah jam 00:00:00 tidak ikut terhitung, dan kesalahan ini tidak memunculkan pesan error apa pun.</p>`,
      examples: [{ sql: "select order_id, order_ts, status\nfrom app.orders\nwhere order_ts >= '2025-10-31' and order_ts < '2025-11-01'\norder by order_ts\nlimit 10;", note: "Sepuluh pesanan pertama tanggal 31 Oktober 2025. Perhatikan jam di kolom order_ts." }],
    },
    {
      title: "AND, OR, NOT, dan tanda kurung",
      html: `<p>Beberapa syarat bisa digabung:</p>
<ul><li><code>AND</code>: baris disimpan kalau <b>kedua</b> syarat benar.</li>
<li><code>OR</code>: baris disimpan kalau <b>salah satu</b> syarat benar.</li>
<li><code>NOT</code>: membalik hasil syarat di belakangnya.</li></ul>
<p>Kalau AND dan OR dipakai bersamaan, database mengerjakan AND lebih dulu. Akibatnya, <code>channel = 'ios' or channel = 'android' and status = 'cancelled'</code> dibaca sebagai "semua pesanan iOS, ditambah pesanan Android yang dibatalkan". Kalau maksudmu "pesanan iOS atau Android yang dibatalkan", pakai tanda kurung:</p>`,
      examples: [{ sql: "select order_id, channel, status\nfrom app.orders\nwhere (channel = 'ios' or channel = 'android')\n  and status = 'cancelled'\norder by order_id\nlimit 10;", note: "Tanda kurung memastikan OR dikerjakan lebih dulu. Biasakan memakai kurung setiap kali AND dan OR muncul bersama." }],
    },
    {
      title: "IN dan NOT IN: salah satu dari daftar",
      html: `<p>Contoh di bawah memakai kolom <code>segment</code>, yaitu tingkat keanggotaan pelanggan: Reguler, Silver, atau Gold.</p>
<p>Menulis banyak OR untuk kolom yang sama cepat menjadi panjang. <code>IN</code> memeriksa apakah nilai kolom termasuk salah satu isi daftar. <code>NOT IN</code> kebalikannya. Daftar ditulis di dalam tanda kurung, dipisahkan koma.</p>`,
      examples: [{ sql: "select full_name, segment, city_id\nfrom app.customers\nwhere segment in ('Gold', 'Silver')\n  and city_id in (1, 6, 10)\norder by full_name\nlimit 10;", note: "Pelanggan Gold atau Silver yang tinggal di Jakarta (1), Bandung (6), atau Surabaya (10)." }],
    },
    {
      title: "BETWEEN: rentang nilai",
      html: `<p><code>BETWEEN a AND b</code> sama dengan <code>&gt;= a AND &lt;= b</code>: kedua batasnya <b>ikut</b>. Cocok untuk angka, misalnya rentang harga. Untuk kolom tanggal-dan-jam, hindari BETWEEN dan pakai rentang setengah terbuka, karena alasan yang dijelaskan di bagian tanggal.</p>`,
      examples: [{ sql: "select product_name, list_price\nfrom app.products\nwhere list_price between 100000 and 150000\norder by list_price;", note: "Produk dengan harga dari 100.000 sampai 150.000 rupiah, termasuk kedua batasnya." }],
    },
    {
      title: "LIKE dan ILIKE: mencari pola teks",
      html: `<p><code>LIKE</code> mencocokkan teks dengan sebuah pola. Dua tanda khusus dipakai di dalam pola:</p>
<ul><li><code>%</code> berarti "teks apa saja, boleh kosong". <code>'%Bluetooth%'</code> cocok dengan semua teks yang mengandung kata Bluetooth.</li>
<li><code>_</code> berarti "tepat satu karakter apa saja". Karakter adalah satu tanda dalam teks: huruf, angka, spasi, atau tanda baca.</li></ul>
<p>Seperti tanda sama dengan, <code>LIKE</code> membedakan huruf besar dan kecil. <code>ILIKE</code> sama dengan LIKE, tapi tidak membedakan huruf besar dan kecil. Dokumentasi SQL Server tidak memuat ILIKE; padanannya ada di tabel "Di SQL Server".</p>`,
      examples: [{ sql: "select sku, product_name\nfrom app.products\nwhere product_name ilike '%bluetooth%'\norder by product_name;", note: "Semua produk yang namanya mengandung kata bluetooth, ditulis dengan huruf besar maupun kecil." }],
    },
    {
      title: "NULL: sel yang tidak berisi nilai",
      html: `<p>Di Bab 1 kamu sudah melihat NULL: tanda bahwa sebuah sel tidak berisi nilai. Contohnya pelanggan yang tidak mengisi telepon, atau pesanan yang tidak memakai voucher (<code>voucher_code</code>).</p>
<p>NULL berarti "nilainya tidak diketahui". Karena itu, membandingkan apa pun dengan NULL hasilnya juga <i>tidak diketahui</i>, bukan benar dan bukan salah. Inilah <b>logika tiga nilai</b>. WHERE hanya menyimpan baris yang syaratnya <i>benar</i>, sehingga baris dengan hasil "tidak diketahui" ikut terbuang.</p>
<p>Akibat pertama: <code>where phone = null</code> tidak pernah menemukan apa pun. Untuk mencari sel kosong, pakai <code>IS NULL</code>, dan untuk kebalikannya <code>IS NOT NULL</code>.</p>`,
      examples: [
        { sql: "select customer_id, full_name, phone\nfrom app.customers\nwhere phone = null;", note: "Kosong, walaupun ada pelanggan tanpa telepon. Perbandingan dengan = null selalu tidak diketahui.", expectEmpty: true },
        { sql: "select customer_id, full_name, phone\nfrom app.customers\nwhere phone is null\norder by customer_id\nlimit 10;", note: "IS NULL adalah cara yang benar untuk mencari sel kosong." },
      ],
    },
    {
      title: "Jebakan NULL saat memakai \"tidak sama dengan\"",
      html: `<p>Akibat kedua lebih sulit terlihat. Misalnya kamu ingin pesanan yang <i>tidak</i> memakai voucher HEMAT10, lalu menulis <code>voucher_code &lt;&gt; 'HEMAT10'</code>. Untuk pesanan tanpa voucher, <code>voucher_code</code> berisi NULL, sehingga hasil perbandingannya tidak diketahui, dan pesanan itu ikut terbuang. Padahal pesanan tanpa voucher jelas tidak memakai HEMAT10.</p>
<p>Kalau baris kosong harus ikut, tulis secara terang-terangan:</p>
<pre class="sql"><code>where voucher_code &lt;&gt; 'HEMAT10' or voucher_code is null</code></pre>
<p>Hal yang sama berlaku untuk <code>NOT IN</code>. Setiap kali kamu menulis syarat "tidak sama dengan" pada kolom yang bisa kosong, tanyakan: apakah baris yang kosong seharusnya ikut?</p>`,
      examples: [{ sql: "select order_id, voucher_code\nfrom app.orders\nwhere order_ts >= '2025-10-01' and order_ts < '2025-11-01'\n  and (voucher_code <> 'HEMAT10' or voucher_code is null)\norder by order_id\nlimit 10;", note: "Pesanan Oktober 2025 yang tidak memakai HEMAT10, termasuk pesanan tanpa voucher (NULL)." }],
    },
    {
      title: "Kolom benar/salah",
      html: `<p>Beberapa kolom hanya berisi <code>true</code> (benar) atau <code>false</code> (salah). Tipe ini disebut <i>boolean</i>. Contohnya <code>is_active</code> di tabel produk, yang menandai apakah produk masih dijual. Kolom seperti ini bisa dibandingkan langsung: <code>where is_active = false</code>.</p>`,
      examples: [{ sql: "select sku, product_name, created_at\nfrom app.products\nwhere is_active = false\norder by created_at;", note: "Produk yang sudah tidak dijual." }],
    },
  ],
  tsql: [
    { pg: "where product_name ilike '%x%'", tsql: "where product_name like '%x%'", note: "Dokumentasi T-SQL tidak memuat ILIKE. Perbandingan teks di SQL Server, termasuk LIKE dan =, mengikuti <i>collation</i> (aturan membandingkan teks). Collation bawaan dipilih saat SQL Server dipasang, mengikuti pengaturan bahasa Windows. Untuk Windows berbahasa Inggris (Amerika Serikat), bawaannya SQL_Latin1_General_CP1_CI_AS. CI di nama itu singkatan <i>case-insensitive</i> (tidak membedakan huruf besar-kecil), sehingga LIKE dan = juga tidak membedakannya. Collation bisa diganti per database atau per kolom, jadi cek pengaturan database tempatmu bekerja." },
    { pg: "where is_active = true", tsql: "where is_active = 1", note: "Dokumentasi SQL Server memakai tipe BIT untuk nilai benar/salah. BIT berisi 1, 0, atau NULL, dan panduan migrasi Microsoft memetakan tipe boolean PostgreSQL ke BIT." },
    { pg: "<> dan !=", tsql: "<> dan !=", note: "Keduanya dikenali di kedua dialek. <> adalah bentuk standar SQL." },
    { pg: "where order_ts >= '2025-10-01'", tsql: "where order_ts >= '20251001'", note: "Untuk kolom bertipe date dan datetime2, 'YYYY-MM-DD' aman. Untuk tipe lama datetime, cara bacanya bisa berubah mengikuti pengaturan bahasa dan urutan tanggal yang sedang dipakai koneksimu ke SQL Server, jadi tulis 'YYYYMMDD' tanpa tanda minus." },
    { pg: "is null / is not null", tsql: "is null / is not null", note: "Perilaku NULL sama. Fungsi pengganti NULL dibahas di bab 3." },
  ],
  summary: [
    "<code>WHERE</code> menyimpan hanya baris yang syaratnya benar. Urutan bagian query: SELECT, FROM, WHERE, ORDER BY, LIMIT.",
    "Teks ditulis dengan kutip tunggal dan membedakan huruf besar-kecil. Pakai <code>ILIKE</code> untuk pencarian tanpa membedakan huruf.",
    "Untuk kolom tanggal-dan-jam, pakai rentang setengah terbuka: <code>&gt;= awal and &lt; awal_periode_berikutnya</code>.",
    "AND dikerjakan sebelum OR. Pakai tanda kurung setiap kali keduanya muncul bersama.",
    "Perbandingan dengan NULL hasilnya tidak diketahui. Pakai <code>IS NULL</code>, dan ingat bahwa syarat \"tidak sama dengan\" membuang baris yang kosong.",
  ],
  drills: [
    { id: "sql-02-01", kind: "choice", prompt: "Query <code>select city_name from app.cities where island = 'jawa'</code> dijalankan. Apa hasilnya?",
      options: ["Sebelas kota di Pulau Jawa", "Tidak ada baris, karena 'jawa' berbeda dengan 'Jawa'", "Error, karena teks harus ditulis dengan kutip ganda", "Semua 24 kota"], answer: 1,
      why: "Perbandingan teks di PostgreSQL membedakan huruf besar dan kecil. Data menulis 'Jawa', jadi syarat 'jawa' tidak cocok dengan baris mana pun.",
      hint: "Ingat aturan huruf besar dan kecil untuk teks." },
    { id: "sql-02-02", kind: "choice", prompt: "Kenapa <code>where phone = null</code> tidak menemukan pelanggan tanpa telepon?",
      options: ["Karena tidak ada pelanggan tanpa telepon", "Karena perbandingan dengan NULL hasilnya tidak diketahui, dan WHERE hanya menyimpan baris yang hasilnya benar", "Karena null harus ditulis 'null' dengan tanda kutip", "Karena kolom phone bertipe angka"], answer: 1,
      why: "NULL berarti nilainya tidak diketahui, sehingga perbandingan apa pun dengan NULL juga tidak diketahui. Untuk mencari sel kosong, pakai IS NULL.",
      hint: "Ingat logika tiga nilai." },
    { id: "sql-02-03", kind: "sql", prompt: "Tampilkan <code>product_name</code> dan <code>list_price</code> untuk produk dengan harga di atas 500.000 rupiah.",
      solution: "select product_name, list_price from app.products where list_price > 500000",
      why: "Operator > membandingkan angka. Angka ditulis tanpa titik ribuan.", hint: "where list_price > 500000" },
    { id: "sql-02-04", kind: "sql", prompt: "Tampilkan <code>order_id</code> dan <code>order_ts</code> untuk pesanan dari aplikasi iOS (<code>channel</code> = 'ios') yang dibatalkan (<code>status</code> = 'cancelled').",
      solution: "select order_id, order_ts from app.orders where channel = 'ios' and status = 'cancelled'",
      why: "Kedua syarat harus benar sekaligus, jadi digabung dengan AND.", hint: "Dua syarat, digabung dengan AND." },
    { id: "sql-02-05", kind: "sql", prompt: "Tampilkan <code>full_name</code> dan <code>segment</code> untuk pelanggan bersegmen Gold atau Silver yang tinggal di kota nomor 1 (Jakarta).",
      solution: "select full_name, segment from app.customers where segment in ('Gold', 'Silver') and city_id = 1",
      why: "IN menggantikan dua syarat OR untuk kolom yang sama, sehingga tidak perlu repot dengan tanda kurung. Syarat kota digabung dengan AND.",
      hint: "segment in (…) and city_id = 1" },
    { id: "sql-02-06", kind: "sql", prompt: "Tampilkan <code>order_id</code>, <code>order_ts</code>, dan <code>status</code> untuk semua pesanan bulan September 2025. Pastikan pesanan tanggal 30 September jam berapa pun ikut terhitung.",
      solution: "select order_id, order_ts, status from app.orders where order_ts >= '2025-09-01' and order_ts < '2025-10-01'",
      why: "Rentang setengah terbuka: mulai tanggal 1 September (ikut) sampai sebelum tanggal 1 Oktober (tidak ikut). Semua jam di tanggal 30 September ikut.",
      hint: "Batas atasnya tanggal 1 bulan berikutnya, dengan tanda <." },
    { id: "sql-02-07", kind: "sql", prompt: "Tampilkan <code>sku</code> dan <code>product_name</code> untuk produk yang namanya mengandung kata \"kaos\", ditulis dengan huruf besar maupun kecil.",
      solution: "select sku, product_name from app.products where product_name ilike '%kaos%'",
      why: "ILIKE tidak membedakan huruf besar dan kecil, dan % di kedua sisi berarti kata itu boleh berada di mana saja di nama produk.",
      hint: "ilike dengan tanda % di depan dan di belakang kata." },
    { id: "sql-02-08", kind: "sql", prompt: "Tampilkan <code>customer_id</code> dan <code>full_name</code> untuk pelanggan yang tidak mengisi nomor telepon.",
      solution: "select customer_id, full_name from app.customers where phone is null",
      why: "Sel kosong dicari dengan IS NULL, bukan dengan = null.", hint: "is null" },
    { id: "sql-02-09", kind: "fix",
      prompt: "Query ini seharusnya menampilkan pesanan bulan Oktober 2025 yang <b>tidak</b> memakai voucher HEMAT10, termasuk pesanan tanpa voucher. Ternyata pesanan tanpa voucher tidak muncul. Perbaiki.",
      start: "select order_id, voucher_code\nfrom app.orders\nwhere order_ts >= '2025-10-01' and order_ts < '2025-11-01'\n  and voucher_code <> 'HEMAT10';",
      solution: "select order_id, voucher_code from app.orders where order_ts >= '2025-10-01' and order_ts < '2025-11-01' and (voucher_code <> 'HEMAT10' or voucher_code is null)",
      why: "Untuk pesanan tanpa voucher, voucher_code berisi NULL, sehingga <> 'HEMAT10' hasilnya tidak diketahui dan barisnya terbuang. Tambahkan or voucher_code is null di dalam tanda kurung.",
      hint: "Baris yang voucher_code-nya kosong harus ikut. Jangan lupa tanda kurung karena ada AND dan OR." },
    { id: "sql-02-10", kind: "number",
      prompt: "Berapa harga (<code>list_price</code>) produk termurah di kategori nomor 3 (Earphone)? Kolom kategorinya <code>category_id</code>.",
      answerSql: "select list_price from app.products where category_id = 3 order by list_price limit 1",
      why: "Saring kategori dengan WHERE, urutkan harga dari kecil ke besar, lalu ambil satu baris teratas.",
      hint: "where category_id = 3, lalu order by list_price dan limit 1." },
    { id: "sql-02-11", kind: "sql", prompt: "Tampilkan <code>product_name</code> dan <code>list_price</code> untuk produk dengan harga dari 50.000 sampai 75.000 rupiah, termasuk kedua batasnya.",
      solution: "select product_name, list_price from app.products where list_price between 50000 and 75000",
      why: "BETWEEN mengikutkan kedua batas, sama dengan >= 50000 and <= 75000.", hint: "between … and …" },
    { id: "sql-02-12", kind: "explain",
      prompt: "Jelaskan dengan kalimatmu sendiri: kenapa <code>where voucher_code &lt;&gt; 'HEMAT10'</code> tidak mengembalikan pesanan yang tidak memakai voucher, dan bagaimana memperbaikinya?",
      model: "Pesanan tanpa voucher punya voucher_code NULL, artinya nilainya tidak diketahui. Membandingkan NULL dengan apa pun hasilnya juga tidak diketahui, bukan benar. WHERE hanya menyimpan baris yang syaratnya benar, jadi pesanan tanpa voucher terbuang. Perbaikannya, tambahkan syarat untuk baris kosong secara terang-terangan: voucher_code <> 'HEMAT10' or voucher_code is null.",
      hint: "Pikirkan apa hasil perbandingan NULL <> 'HEMAT10'." },
  ],
};
