// Bab 1 SQL: data, tabel, dan SELECT pertama.
export default {
  id: "sql-01",
  part: "sql",
  title: "Data, tabel, dan SELECT pertama",
  minutes: 60,
  goals: [
    "Menjelaskan apa itu database, tabel, baris, kolom, dan skema.",
    "Menulis query untuk mengambil kolom tertentu dari sebuah tabel.",
    "Memberi nama lain pada kolom hasil dengan <code>AS</code>.",
    "Mengurutkan hasil dengan <code>ORDER BY</code> dan membatasi jumlah baris dengan <code>LIMIT</code> dan <code>OFFSET</code>.",
  ],
  terms: [
    { term: "data", def: "Catatan tentang kejadian atau benda, misalnya pesanan, pelanggan, atau produk." },
    { term: "database", def: "Tempat menyimpan data secara teratur di dalam tabel, sehingga data bisa dicari dan diolah." },
    { term: "tabel", def: "Kumpulan data sejenis yang disusun dalam baris dan kolom, seperti satu lembar kerja di Excel." },
    { term: "baris", def: "Satu catatan di dalam tabel, misalnya satu kota atau satu pesanan. Disebut juga <i>row</i> atau <i>record</i>." },
    { term: "kolom", def: "Satu jenis keterangan yang dimiliki setiap baris, misalnya nama kota. Disebut juga <i>column</i> atau <i>field</i>." },
    { term: "skema", def: "Kelompok tabel di dalam database. Nama lengkap tabel ditulis skema.tabel, misalnya app.cities." },
    { term: "SQL", def:"<i>Structured Query Language</i>, bahasa untuk meminta dan mengolah data di database." },
    { term: "query", def: "Satu perintah SQL, misalnya perintah untuk mengambil daftar kota." },
    { term: "dialek", def: "Variasi SQL milik satu produk database. Dasarnya sama, tapi beberapa perintah berbeda." },
    { term: "NULL", def:"Tanda bahwa sebuah sel tidak berisi nilai apa pun. Di hasil query tertulis NULL. Bab 2 membahasnya lebih dalam." },
  ],
  introduces: ["SELECT", "FROM", "SELECT *", "AS", "LIMIT", "OFFSET", "ORDER BY", "ASC", "DESC"],
  sections: [
    {
      title: "Data disimpan dalam tabel",
      html: `<p>Toko online seperti TokoKita mencatat banyak hal: siapa pelanggannya, produk apa yang dijual, dan pesanan apa saja yang masuk. Semua catatan itu disebut <b>data</b>, dan disimpan di sebuah <b>database</b>.</p>
<p>Di dalam database, data disusun dalam <b>tabel</b>. Satu tabel berisi satu jenis data. Ada tabel untuk kota, tabel untuk pelanggan, tabel untuk produk, dan seterusnya. Berikut tiga baris pertama tabel kota TokoKita:</p>
<div class="tw"><table class="t"><tr><th>city_id</th><th>city_name</th><th>province</th><th>island</th></tr>
<tr><td class="num">1</td><td>Jakarta</td><td>DKI Jakarta</td><td>Jawa</td></tr>
<tr><td class="num">2</td><td>Bogor</td><td>Jawa Barat</td><td>Jawa</td></tr>
<tr><td class="num">3</td><td>Depok</td><td>Jawa Barat</td><td>Jawa</td></tr></table></div>
<p>Setiap <b>baris</b> mewakili satu kota. Setiap <b>kolom</b> berisi satu jenis keterangan tentang kota itu: nomor kota (<code>city_id</code>), nama kota (<code>city_name</code>), provinsi (<code>province</code>), dan pulau (<code>island</code>). Tabel ini berisi 24 baris, satu untuk setiap kota tempat pelanggan TokoKita tinggal.</p>
<p>Nama kolom di sini ditulis dalam bahasa Inggris dengan huruf kecil dan garis bawah, misalnya <code>city_name</code>. Cara ini umum di perusahaan, jadi biasakan membacanya. Arti setiap kolom bisa kamu lihat di halaman <a href="#kamus">Kamus data TokoKita</a>.</p>
<p>Ada satu hal yang perlu kamu kenali sejak awal: kadang sebuah sel tidak berisi apa-apa. Misalnya pelanggan yang tidak mengisi nomor telepon. Database menandai sel kosong seperti itu dengan <b>NULL</b>. Kalau kamu melihat tulisan NULL di hasil query, artinya selnya tidak berisi nilai.</p>`,
    },
    {
      title: "Skema: kelompok tabel",
      html: `<p>Database perusahaan bisa berisi ratusan tabel. Supaya rapi, tabel dikelompokkan ke dalam <b>skema</b>. Tabel TokoKita disimpan di dua skema:</p>
<ul><li><code>app</code>: tabel yang dipakai aplikasi toko setiap hari, misalnya <code>app.customers</code> (pelanggan) dan <code>app.orders</code> (pesanan).</li>
<li><code>raw</code>: data mentah yang datang dari berkas atau sistem lain, misalnya <code>raw.supplier_price_upload</code> (berkas harga dari pemasok).</li></ul>
<p>Saat menulis query, sebut tabel dengan nama lengkapnya: nama skema, titik, lalu nama tabel. Jadi tabel kota ditulis <code>app.cities</code>. Kalau kamu hanya menulis <code>cities</code>, PostgreSQL akan menjawab bahwa tabel itu tidak ditemukan.</p>`,
    },
    {
      title: "SQL, query, dan dialek",
      html: `<p>Untuk meminta data dari database, kita memakai <b>SQL</b> (<i>Structured Query Language</i>). Satu perintah SQL disebut <b>query</b>. Query ditulis dalam bahasa yang mirip kalimat bahasa Inggris pendek, lalu database menjalankannya dan mengembalikan <b>hasil query</b> berupa tabel.</p>
<p>Ada banyak produk database. Yang paling sering kamu temui adalah PostgreSQL dan SQL Server. Keduanya memakai SQL, tapi masing-masing punya <b>dialek</b>: sebagian besar perintah sama, sebagian kecil berbeda. Dialek SQL Server disebut T-SQL (<i>Transact-SQL</i>).</p>
<p>Semua query di kursus ini dijalankan oleh PostgreSQL sungguhan di browsermu. Di akhir setiap bab ada tabel "Di SQL Server" yang menunjukkan padanan T-SQL untuk perintah yang baru kamu pelajari, supaya kamu bisa memakainya di SSMS (<i>SQL Server Management Studio</i>, aplikasi untuk menulis query di SQL Server).</p>`,
    },
    {
      title: "SELECT dan FROM: mengambil kolom",
      html: `<p>Query paling dasar terdiri dari dua bagian:</p>
<ul><li><code>SELECT</code> diikuti daftar kolom yang ingin ditampilkan, dipisahkan koma.</li>
<li><code>FROM</code> diikuti nama tabel tempat kolom itu berada.</li></ul>
<p>Jalankan contoh di bawah. Query ini meminta nama kota dan provinsinya dari tabel <code>app.cities</code>.</p>`,
      examples: [{ sql: "select city_name, province\nfrom app.cities;", note: "Hasilnya 24 baris dengan dua kolom, sesuai urutan yang ditulis di SELECT. Kolom lain (city_id dan island) tidak ikut tampil karena tidak diminta." }],
    },
    {
      title: "Aturan penulisan query",
      html: `<p>Beberapa aturan yang berlaku untuk semua query:</p>
<ul><li><b>Huruf besar atau kecil sama saja untuk kata perintah.</b> <code>select</code>, <code>SELECT</code>, dan <code>Select</code> dibaca sama. Di kursus ini kata perintah kadang ditulis besar di penjelasan supaya mudah dibedakan dari nama kolom.</li>
<li><b>Spasi dan baris baru bebas.</b> Query boleh ditulis dalam satu baris atau beberapa baris. Menulis setiap bagian di baris sendiri membuat query panjang lebih mudah dibaca.</li>
<li><b>Titik koma (<code>;</code>) menandai akhir query.</b> Kalau hanya ada satu query, titik koma boleh dihilangkan. Kalau ada beberapa query sekaligus, titik koma memisahkan satu dengan yang lain.</li>
<li><b>Koma memisahkan nama kolom.</b> Lupa koma adalah salah tulis yang mudah terjadi, dan akibatnya akan kamu lihat di bagian AS.</li>
<li><b>Komentar</b> adalah catatan untuk manusia, tidak dijalankan. Tulis dua tanda minus (<code>--</code>), lalu semua teks setelahnya sampai akhir baris diabaikan database.</li></ul>`,
      examples: [{ sql: "-- nama dan email pelanggan\nselect full_name, email\nfrom app.customers\nlimit 5;", note: "Baris pertama adalah komentar, jadi database langsung membaca dari kata select. Bagian limit 5 dijelaskan di subbab berikutnya." }],
    },
    {
      title: "LIMIT: membatasi jumlah baris",
      html: `<p>Tabel <code>app.customers</code> berisi 1.500 pelanggan, dan tabel pesanan berisi lebih dari 12 ribu baris. Saat kamu baru ingin melihat isi sebuah tabel, menampilkan semuanya tidak perlu. <code>LIMIT n</code> di akhir query membatasi hasil menjadi paling banyak n baris.</p>
<p>Ada satu hal penting: tanpa perintah pengurutan, database <b>tidak menjamin baris mana</b> yang keluar duluan. <code>LIMIT 5</code> hanya menjamin jumlahnya paling banyak 5. Kalau kamu butuh "5 yang pertama menurut sesuatu", misalnya 5 pelanggan yang paling awal mendaftar, kamu harus mengurutkannya dulu dengan <code>ORDER BY</code>, yang dibahas sebentar lagi.</p>`,
      examples: [{ sql: "select full_name, segment\nfrom app.customers\nlimit 5;", note: "Hasilnya 5 baris. Baris mana yang keluar tidak dijamin, jadi jangan memakai hasil seperti ini untuk menjawab pertanyaan seperti \"siapa pelanggan pertama\"." }],
    },
    {
      title: "SELECT *: semua kolom",
      html: `<p>Tanda bintang (<code>*</code>) setelah SELECT berarti "semua kolom", dengan urutan sesuai susunan tabelnya. Cara ini praktis untuk melihat isi tabel yang belum kamu kenal.</p>
<p>Salah satu kolom yang muncul adalah <code>sku</code> (<i>stock keeping unit</i>), yaitu kode unik produk yang tertulis di kemasan dan dipakai pemasok, misalnya TK-10007.</p>
<p>Di pekerjaan nyata, sebutkan kolom yang memang dibutuhkan. Query dengan <code>*</code> ikut mengambil kolom yang tidak dipakai, sehingga hasilnya lebih besar dari yang perlu. Hasilnya juga bisa berubah diam-diam kalau suatu hari tabel itu ditambah kolom baru.</p>`,
      examples: [{ sql: "select *\nfrom app.products\nlimit 3;", note: "Semua delapan kolom tabel produk tampil: product_id, sku, product_name, category_id, brand, list_price, is_active, dan created_at." }],
    },
    {
      title: "AS: memberi nama lain pada kolom hasil",
      html: `<p>Nama kolom di database sering singkat atau berbahasa Inggris. Untuk laporan, kamu bisa memberi nama lain pada kolom hasil dengan <code>AS</code>. Nama lain ini disebut <b>alias</b>. Alias hanya mengubah judul kolom di hasil query; isi dan nama kolom di tabel aslinya tidak berubah.</p>
<p>Kata <code>AS</code> sebenarnya boleh dihilangkan, selama aliasnya bukan kata perintah SQL seperti <code>from</code>: <code>select product_name nama_produk</code> juga memberi alias. Inilah sebabnya lupa koma berbahaya. Kalau kamu menulis <code>select product_name list_price</code> (tanpa koma), PostgreSQL tidak menganggapnya salah. Ia menampilkan <i>satu</i> kolom berisi nama produk, dengan judul <code>list_price</code>. Selalu tulis <code>AS</code> supaya maksudmu jelas.</p>`,
      examples: [{ sql: "select product_name as nama_produk,\n       list_price as harga\nfrom app.products\nlimit 5;", note: "Judul kolom hasil berubah menjadi nama_produk dan harga. Alias yang terdiri dari satu kata dengan huruf kecil bisa ditulis tanpa tanda kutip." }],
    },
    {
      title: "ORDER BY: mengurutkan hasil",
      html: `<p><code>ORDER BY</code> mengurutkan baris hasil berdasarkan satu atau beberapa kolom. Letaknya setelah FROM.</p>
<ul><li><code>ASC</code> (<i>ascending</i>) berarti dari kecil ke besar: angka kecil ke besar, tanggal lama ke baru, huruf A ke Z. Ini urutan bawaan, jadi <code>ASC</code> boleh tidak ditulis.</li>
<li><code>DESC</code> (<i>descending</i>) berarti dari besar ke kecil.</li></ul>`,
      examples: [
        { sql: "select product_name, list_price\nfrom app.products\norder by list_price asc\nlimit 5;", note: "Lima produk termurah, dari yang paling murah." },
        { sql: "select product_name, list_price\nfrom app.products\norder by list_price desc\nlimit 5;", note: "Lima produk termahal, dari yang paling mahal." },
      ],
    },
    {
      title: "Mengurutkan dengan beberapa kolom",
      html: `<p>Kamu bisa menulis beberapa kolom di ORDER BY, dipisahkan koma. Database mengurutkan berdasarkan kolom pertama dulu. Kolom kedua hanya dipakai untuk baris yang nilai kolom pertamanya sama.</p>
<p>Ini juga cara menangani nilai yang sama persis, misalnya dua produk dengan harga yang sama. Tanpa kolom kedua, urutan di antara keduanya tidak dijamin, dan hasil "5 produk termahal" bisa berbeda dari satu kali menjalankan ke kali berikutnya. Kolom kedua seperti ini disebut <b>penentu urutan</b> (<i>tie-breaker</i>).</p>`,
      examples: [{ sql: "select province, city_name\nfrom app.cities\norder by province, city_name;", note: "Kota diurutkan per provinsi dari A ke Z. Di dalam provinsi yang sama, misalnya Jawa Barat, kotanya diurutkan dari A ke Z juga." }],
    },
    {
      title: "OFFSET: melewati beberapa baris",
      html: `<p><code>OFFSET n</code> melewati n baris pertama sebelum mulai menampilkan hasil. Bersama <code>LIMIT</code>, perintah ini dipakai untuk membuat halaman, seperti daftar produk di toko online yang menampilkan 5 produk per halaman.</p>
<p>Urutan bacanya: urutkan dulu (<code>ORDER BY</code>), lewati n baris (<code>OFFSET</code>), lalu ambil paling banyak sejumlah baris tertentu (<code>LIMIT</code>). Karena itu OFFSET hanya masuk akal kalau ada ORDER BY.</p>`,
      examples: [{ sql: "select product_name, list_price\nfrom app.products\norder by list_price desc, product_name\nlimit 5 offset 5;", note: "Ini \"halaman kedua\" daftar produk termahal: peringkat 6 sampai 10." }],
    },
  ],
  tsql: [
    { pg: "SELECT … LIMIT 5", tsql: "SELECT TOP (5) …", note: "Di SQL Server, jumlah baris ditulis tepat setelah SELECT. Sintaks SELECT di dokumentasi SQL Server tidak memuat LIMIT. Tulis angkanya di dalam kurung; TOP 5 tanpa kurung masih diterima, tetapi dokumentasinya menyarankan untuk tidak memakainya." },
    { pg: "ORDER BY … LIMIT 5 OFFSET 5", tsql: "ORDER BY … OFFSET 5 ROWS FETCH NEXT 5 ROWS ONLY", note: "Di SQL Server, OFFSET wajib ditulis bersama ORDER BY." },
    { pg: "\"nama kolom\"", tsql: "[nama kolom] atau \"nama kolom\"", note: "Tanda ini dipakai untuk nama yang mengandung spasi. SQL Server menerima kutip ganda dengan pengaturan bawaannya, sedangkan [ ] selalu diterima apa pun pengaturannya. Di PostgreSQL, nama tanpa tanda kutip selalu dibaca sebagai huruf kecil." },
    { pg: "app.cities", tsql: "dbo.cities", note: "Skema bawaan SQL Server bernama dbo. Nama lengkap di SQL Server bisa tiga bagian: database.skema.tabel." },
    { pg: "-- komentar", tsql: "-- komentar", note: "Sama di kedua dialek." },
  ],
  summary: [
    "Database menyimpan data dalam tabel. Satu baris adalah satu catatan, satu kolom adalah satu jenis keterangan.",
    "Tabel dikelompokkan dalam skema dan ditulis lengkap: <code>app.cities</code>.",
    "<code>SELECT kolom FROM skema.tabel</code> mengambil kolom tertentu; <code>SELECT *</code> mengambil semua kolom.",
    "<code>AS</code> memberi nama lain pada kolom hasil. Lupa koma diam-diam membuat alias.",
    "<code>ORDER BY</code> mengurutkan (<code>ASC</code> kecil ke besar, <code>DESC</code> besar ke kecil). Tambahkan kolom kedua sebagai penentu urutan.",
    "<code>LIMIT</code> membatasi jumlah baris, <code>OFFSET</code> melewati baris. Tanpa ORDER BY, baris mana yang keluar tidak dijamin.",
  ],
  drills: [
    { id: "sql-01-01", kind: "choice", prompt: "Di tabel <code>app.cities</code>, satu baris mewakili apa?",
      options: ["Satu provinsi", "Satu kota", "Satu pulau", "Satu pelanggan"], answer: 1,
      why: "Tabel kota berisi satu baris untuk setiap kota. Provinsi dan pulau hanyalah keterangan (kolom) dari kota itu, sehingga satu provinsi bisa muncul di beberapa baris.",
      hint: "Lihat contoh tabel di awal bab: apa yang berbeda di setiap baris?" },
    { id: "sql-01-02", kind: "choice", prompt: "Query <code>select product_name from app.products limit 5</code> dijalankan dua kali. Apa yang dijamin oleh database?",
      options: ["Kelima baris dan urutannya selalu sama", "Hanya jumlah barisnya (paling banyak 5), bukan baris mana yang keluar", "Selalu lima produk termurah", "Selalu lima produk yang paling baru"], answer: 1,
      why: "Tanpa ORDER BY, database bebas mengembalikan baris mana pun. LIMIT hanya membatasi jumlahnya. Untuk \"5 yang pertama menurut sesuatu\", urutkan dulu dengan ORDER BY.",
      hint: "Ingat bagian LIMIT: apa yang terjadi kalau tidak ada perintah pengurutan?" },
    { id: "sql-01-03", kind: "sql", prompt: "Tampilkan nama kota (<code>city_name</code>) dan pulaunya (<code>island</code>) untuk semua kota di tabel <code>app.cities</code>.",
      start: "select \nfrom app.cities;", solution: "select city_name, island from app.cities",
      why: "SELECT menyebut kolom yang diminta, dipisahkan koma. FROM menyebut tabelnya lengkap dengan skema.",
      hint: "Tulis dua nama kolom setelah select, dipisahkan koma." },
    { id: "sql-01-04", kind: "sql", prompt: "Tampilkan semua kolom untuk semua karyawan di tabel <code>app.staff</code>.",
      solution: "select * from app.staff",
      why: "Tanda * berarti semua kolom. Karena tidak ada LIMIT, semua 25 karyawan ikut tampil.",
      hint: "Ada satu tanda yang berarti \"semua kolom\"." },
    { id: "sql-01-05", kind: "sql", checkNames: true,
      prompt: "Untuk semua produk, tampilkan <code>sku</code> dengan judul kolom <code>kode</code>, dan <code>product_name</code> dengan judul kolom <code>nama</code>. Soal ini memeriksa judul kolom juga.",
      start: "select sku, product_name\nfrom app.products;", solution: "select sku as kode, product_name as nama from app.products",
      why: "AS memberi alias pada kolom hasil. Isi kolomnya tetap sama, hanya judulnya yang berubah.",
      hint: "Tambahkan as kode setelah sku, dan as nama setelah product_name." },
    { id: "sql-01-06", kind: "sql", ordered: true,
      prompt: "Tampilkan 5 pelanggan yang paling awal mendaftar: kolom <code>full_name</code> dan <code>signup_date</code>, urut dari tanggal paling awal. Kalau tanggal daftarnya sama, urutkan berdasarkan <code>customer_id</code> dari kecil ke besar.",
      solution: "select full_name, signup_date from app.customers order by signup_date, customer_id limit 5",
      why: "Urutkan dulu berdasarkan tanggal (ASC, dari paling awal), lalu customer_id sebagai penentu urutan untuk tanggal yang sama. Baru setelah itu batasi 5 baris.",
      hint: "Pakai order by dengan dua kolom: signup_date lalu customer_id. LIMIT ditulis paling akhir." },
    { id: "sql-01-07", kind: "sql", ordered: true,
      prompt: "Tampilkan 5 produk termahal: <code>product_name</code> dan <code>list_price</code>, dari yang paling mahal. Kalau harganya sama, urutkan <code>product_name</code> dari A ke Z.",
      solution: "select product_name, list_price from app.products order by list_price desc, product_name limit 5",
      why: "DESC mengurutkan dari besar ke kecil. product_name menjadi penentu urutan untuk harga yang sama, dengan urutan bawaan A ke Z.",
      hint: "order by list_price desc, product_name" },
    { id: "sql-01-08", kind: "sql", ordered: true,
      prompt: "Lanjutan soal sebelumnya: tampilkan produk termahal peringkat 6 sampai 10, dengan kolom dan urutan yang sama.",
      solution: "select product_name, list_price from app.products order by list_price desc, product_name limit 5 offset 5",
      why: "OFFSET 5 melewati lima produk teratas, lalu LIMIT 5 mengambil lima berikutnya.",
      hint: "Sama dengan soal sebelumnya, ditambah offset." },
    { id: "sql-01-09", kind: "fix", ordered: true,
      prompt: "Query ini seharusnya menampilkan nama dan harga 5 produk termahal. Ternyata hasilnya hanya satu kolom berjudul <code>list_price</code> yang isinya nama produk. Perbaiki query-nya. Kalau harga sama, urutkan nama produk dari A ke Z.",
      start: "select product_name list_price\nfrom app.products\norder by list_price desc\nlimit 5;",
      solution: "select product_name, list_price from app.products order by list_price desc, product_name limit 5",
      why: "Tanpa koma, list_price dibaca sebagai alias untuk product_name. Tambahkan koma, dan tambahkan product_name sebagai penentu urutan.",
      hint: "Ada satu tanda baca yang hilang di baris SELECT." },
    { id: "sql-01-10", kind: "number",
      prompt: "Berapa harga produk termahal di TokoKita (dalam rupiah)? Cari dengan query di Ruang coba SQL, lalu tulis angkanya.",
      answerSql: "select list_price from app.products order by list_price desc limit 1",
      why: "Urutkan harga dari besar ke kecil, lalu ambil satu baris teratas: select list_price from app.products order by list_price desc limit 1.",
      hint: "Gabungkan ORDER BY … DESC dengan LIMIT 1." },
    { id: "sql-01-11", kind: "explain",
      prompt: "Jelaskan dengan kalimatmu sendiri: kenapa query yang memakai LIMIT untuk mencari \"yang teratas\" harus memakai ORDER BY, dan kapan perlu kolom kedua di ORDER BY?",
      model: "LIMIT hanya membatasi jumlah baris. Tanpa ORDER BY, database bebas memilih baris mana yang keluar, sehingga hasil \"5 teratas\" bisa salah atau berubah-ubah. ORDER BY menentukan urutannya, baru LIMIT mengambil bagian atasnya. Kolom kedua diperlukan kalau kolom pertama bisa berisi nilai yang sama, supaya urutan di antara nilai yang sama juga pasti.",
      hint: "Pikirkan apa yang dijamin LIMIT, dan apa yang terjadi pada dua baris dengan nilai yang sama." },
  ],
};
