// Bab 3 SQL: kolom hitungan, tipe data, CASE, COALESCE, NULLIF, dan DISTINCT.
export default {
  id: "sql-03",
  part: "sql",
  title: "Kolom hitungan, CASE, dan nilai kosong",
  minutes: 70,
  goals: [
    "Membuat kolom baru dari hasil hitungan kolom lain.",
    "Mengenali tipe data utama dan menghindari jebakan pembagian bilangan bulat.",
    "Mengubah tipe data dengan <code>CAST</code> atau <code>::</code>, dan membulatkan angka dengan <code>ROUND</code>.",
    "Mengelompokkan nilai dengan <code>CASE WHEN</code>.",
    "Mengganti NULL dengan <code>COALESCE</code>, membuat NULL dengan <code>NULLIF</code>, dan menghapus baris kembar dengan <code>DISTINCT</code>.",
  ],
  terms: [
    { term: "ekspresi", def: "Rumus yang menghasilkan sebuah nilai untuk setiap baris, misalnya <code>qty * unit_price</code>." },
    { term: "tipe data", def: "Jenis isi sebuah kolom atau nilai, misalnya bilangan bulat, angka desimal, teks, tanggal, atau benar/salah. Tipe menentukan operasi apa yang bisa dilakukan." },
    { term: "konversi tipe", def: "Mengubah nilai dari satu tipe ke tipe lain, misalnya teks '2025-10-01' menjadi tanggal. Disebut juga <i>casting</i>." },
    { term: "DISTINCT", def: "Kata yang menghapus baris kembar dari hasil query, sehingga setiap kombinasi nilai hanya muncul sekali." },
  ],
  introduces: ["ROUND()", "CAST()", "::", "CASE", "WHEN", "THEN", "ELSE", "END", "COALESCE()", "NULLIF()", "DISTINCT"],
  sections: [
    {
      title: "Kolom hasil hitungan",
      html: `<p>Isi SELECT tidak harus nama kolom. Kamu bisa menulis <b>ekspresi</b>, yaitu rumus yang dihitung untuk setiap baris. Operator hitung yang tersedia: <code>+</code> (tambah), <code>-</code> (kurang), <code>*</code> (kali), <code>/</code> (bagi), dan <code>%</code> (sisa bagi).</p>
<p>Tabel <code>app.order_items</code> menyimpan isi setiap pesanan: jumlah barang (<code>qty</code>), harga satuan (<code>unit_price</code>), dan potongan harga dalam rupiah (<code>discount</code>). Nilai kotor satu baris adalah qty dikali harga satuan; nilai bersihnya nilai kotor dikurangi potongan.</p>
<p>Urutan hitungnya sama dengan matematika di sekolah: kali, bagi, dan sisa bagi dikerjakan sebelum tambah dan kurang. <code>qty * unit_price - discount</code> berarti (qty kali harga) dikurangi potongan, sesuai maksud kita. Sebaliknya, <code>discount / qty * unit_price</code> berarti (potongan dibagi qty) dikali harga, yang hampir pasti bukan maksudmu. Kalau ragu, pakai tanda kurung. Tanda kurung di sekitar bagian yang memang dihitung lebih dulu, misalnya <code>(qty * unit_price) - discount</code>, tidak mengubah hasil, dan membuat maksud rumus terlihat jelas bagi orang lain.</p>`,
      examples: [{ sql: "select order_id, line_no, qty, unit_price, discount,\n       qty * unit_price as nilai_kotor,\n       qty * unit_price - discount as nilai_bersih\nfrom app.order_items\nwhere order_id = 100001;", note: "Dua kolom terakhir tidak ada di tabel. Keduanya dihitung saat query berjalan. Beri alias supaya judul kolomnya jelas; tanpa alias, PostgreSQL memberi judul ?column?." }],
    },
    {
      title: "Tipe data",
      html: `<p>Setiap kolom punya <b>tipe data</b>. Tipe menentukan isi yang boleh disimpan dan operasi yang bisa dilakukan. Tipe yang paling sering kamu temui:</p>
<div class="tw"><table class="t"><tr><th>Tipe di PostgreSQL</th><th>Isi</th><th>Contoh di TokoKita</th></tr>
<tr><td><code>integer</code> (atau <code>int</code>)</td><td>bilangan bulat</td><td><code>qty</code>, <code>order_id</code></td></tr>
<tr><td><code>numeric(12,2)</code></td><td>angka desimal yang tepat, cocok untuk uang</td><td><code>unit_price</code>, <code>amount</code></td></tr>
<tr><td><code>text</code></td><td>teks</td><td><code>full_name</code>, <code>status</code></td></tr>
<tr><td><code>date</code></td><td>tanggal</td><td><code>signup_date</code></td></tr>
<tr><td><code>timestamp</code></td><td>tanggal dan jam</td><td><code>order_ts</code></td></tr>
<tr><td><code>boolean</code></td><td>benar atau salah</td><td><code>is_active</code></td></tr></table></div>
<p>Angka dalam <code>numeric(12,2)</code> berarti paling banyak 12 digit, 2 di antaranya di belakang koma. Untuk uang, selalu pakai <code>numeric</code>. Ada juga tipe angka perkiraan seperti <code>real</code> dan <code>double precision</code>; tipe ini bisa menghasilkan selisih kecil di digit belakang, sehingga tidak cocok untuk uang.</p>
<p>Tipe setiap kolom TokoKita tercantum di <a href="#kamus">Kamus data</a>.</p>`,
    },
    {
      title: "Jebakan pembagian bilangan bulat",
      html: `<p>Kalau dua bilangan bulat dibagi, PostgreSQL membuang angka di belakang koma: <code>7 / 2</code> hasilnya <code>3</code>, bukan 3,5. Kesalahan ini tidak memunculkan pesan error, sehingga mudah terlewat, misalnya saat menghitung persentase dari dua kolom bilangan bulat.</p>
<p>Supaya hasilnya desimal, salah satu angka harus bertipe desimal. Caranya bisa dengan menulis <code>2.0</code> sebagai pengganti <code>2</code>, atau mengubah tipenya (dibahas di bagian berikutnya). Contoh di bawah tidak memakai FROM, karena tidak mengambil data dari tabel mana pun; PostgreSQL boleh menjalankan SELECT seperti ini untuk menghitung nilai langsung.</p>`,
      examples: [{ sql: "select 7 / 2 as bagi_bulat,\n       7 / 2.0 as bagi_desimal,\n       7 % 2 as sisa_bagi;", note: "Hasilnya 3, 3.5000000000000000, dan 1. Angka nol yang panjang akan dirapikan dengan ROUND." }],
    },
    {
      title: "ROUND: membulatkan angka",
      html: `<p><code>ROUND(angka, n)</code> membulatkan angka menjadi n digit di belakang koma. Tanpa n, angka dibulatkan menjadi bilangan bulat.</p>
<p>Contoh berikut menghitung persentase potongan harga setiap baris pesanan. Kolom <code>discount</code> bertipe numeric, jadi pembagiannya sudah desimal. Hasilnya dikali 100 supaya menjadi persen, lalu dibulatkan menjadi satu digit di belakang koma.</p>`,
      examples: [{ sql: "select order_id, line_no, discount, qty * unit_price as nilai_kotor,\n       round(discount / (qty * unit_price) * 100, 1) as persen_diskon\nfrom app.order_items\nwhere order_id between 100001 and 100030\n  and discount > 0;", note: "Tanda kurung di (qty * unit_price) memastikan pembaginya nilai kotor, bukan hanya qty." }],
    },
    {
      title: "CAST dan :: — mengubah tipe data",
      html: `<p><b>Konversi tipe</b> mengubah nilai dari satu tipe ke tipe lain. Ada dua cara menulisnya, hasilnya sama:</p>
<ul><li><code>CAST(nilai AS tipe)</code>: bentuk standar SQL, juga ada di SQL Server.</li>
<li><code>nilai::tipe</code>: bentuk singkat khas PostgreSQL.</li></ul>
<p>Konversi dipakai untuk tiga keperluan umum: mengubah bilangan bulat menjadi desimal supaya pembagian tidak terpotong, mengubah teks menjadi tanggal atau angka, dan mengambil bagian tanggal dari kolom tanggal-dan-jam.</p>`,
      examples: [
        { sql: "select order_id, order_ts,\n       order_ts::date as tanggal_pesan,\n       cast(shipping_fee as integer) as ongkir_bulat\nfrom app.orders\nwhere order_id = 100001;", note: "order_ts::date membuang jam, sehingga yang tersisa hanya tanggal. cast(… as integer) mengubah ongkir dari numeric menjadi bilangan bulat. Kalau ada angka di belakang koma, PostgreSQL membulatkannya ke bilangan bulat terdekat: cast(2.7 as integer) hasilnya 3." },
        { sql: "select order_id, line_no, qty,\n       qty / 4 as bagi_bulat,\n       qty::numeric / 4 as bagi_desimal\nfrom app.order_items\nwhere order_id between 100001 and 100005;", note: "qty bertipe integer. Setelah diubah ke numeric, pembagiannya tidak lagi terpotong." },
      ],
    },
    {
      title: "CASE WHEN: memberi label berdasarkan syarat",
      html: `<p><code>CASE</code> membuat nilai baru berdasarkan syarat. Bentuknya:</p>
<pre class="sql"><code>case
  when syarat_1 then hasil_1
  when syarat_2 then hasil_2
  else hasil_lain
end</code></pre>
<p>Database memeriksa syarat dari atas ke bawah, lalu berhenti di syarat pertama yang benar. Karena itu, urutan WHEN penting. Kalau tidak ada yang benar, hasilnya diambil dari ELSE. Kalau ELSE tidak ditulis, hasilnya NULL.</p>
<p>Dua kesalahan yang paling sering terjadi:</p>
<ul><li><b>Urutan WHEN terbalik.</b> Kalau <code>when list_price &lt; 200000 then 'sedang'</code> ditulis lebih dulu, produk seharga 24.900 juga berhenti di situ, sehingga label 'murah' tidak pernah muncul.</li>
<li><b>Lupa ELSE.</b> Nilai yang tidak masuk syarat mana pun menjadi NULL tanpa peringatan. Tulis ELSE, walaupun isinya hanya 'lainnya', supaya kasus yang terlewat langsung terlihat.</li></ul>
<p>Semua hasil THEN dan ELSE harus bisa dijadikan satu tipe yang sama. Bilangan bulat dan angka desimal boleh dicampur (hasilnya menjadi numeric), tapi teks seperti 'murah' di satu cabang dan angka di cabang lain membuat query gagal.</p>`,
      examples: [{ sql: "select product_name, list_price,\n       case\n         when list_price < 50000 then 'murah'\n         when list_price < 200000 then 'sedang'\n         else 'mahal'\n       end as kelas_harga\nfrom app.products\norder by list_price\nlimit 15;", note: "Lima belas produk termurah ini semuanya di bawah 50.000 (yang paling mahal 37.900), jadi semuanya berhenti di WHEN pertama dan berlabel 'murah'. Hapus baris limit 15 untuk melihat label lain: produk seharga 137.900 gagal di WHEN pertama lalu berhenti di WHEN kedua ('sedang'), dan produk seharga 200.000 ke atas masuk ELSE ('mahal')." }],
    },
    {
      title: "NULL di dalam hitungan, dan COALESCE",
      html: `<p>Hitungan apa pun yang melibatkan NULL hasilnya NULL: <code>10 + NULL</code> adalah NULL, karena salah satu nilainya tidak diketahui.</p>
<p><code>COALESCE(a, b, …)</code> mengembalikan nilai pertama yang tidak NULL. Fungsi ini dipakai untuk mengganti sel kosong dengan nilai pengganti, misalnya teks "tanpa voucher" atau angka 0.</p>
<p>Pilih nilai pengganti dengan hati-hati. Mengganti NULL dengan 0 tepat kalau kosong memang berarti "tidak ada", misalnya tidak ada potongan. Kalau kosong berarti "belum diketahui", mengganti dengan 0 membuat data terlihat lebih pasti daripada kenyataannya.</p>`,
      examples: [{ sql: "select order_id, voucher_code,\n       coalesce(voucher_code, 'tanpa voucher') as voucher\nfrom app.orders\nwhere order_ts >= '2025-10-31'\norder by order_id\nlimit 10;", note: "Kolom pertama menampilkan NULL apa adanya; kolom kedua menggantinya dengan teks." }],
    },
    {
      title: "NULLIF: mengubah nilai tertentu menjadi NULL",
      html: `<p><code>NULLIF(a, b)</code> kebalikan dari COALESCE: hasilnya NULL kalau a sama dengan b, dan a kalau tidak sama. Kegunaan utamanya mencegah pembagian dengan nol. Membagi dengan 0 membuat query gagal; membagi dengan NULL menghasilkan NULL, sehingga query tetap berjalan.</p>
<p>Contohnya, ongkos kirim bisa 0. Di data TokoKita ada 772 pesanan dengan ongkir 0, dan semuanya memakai voucher GRATISONGKIR. Contoh di bawah membagi angka 100.000 dengan ongkos kirim setiap pesanan. Untuk pesanan dengan ongkir 0, pembagian biasa akan gagal. Dengan <code>NULLIF(shipping_fee, 0)</code> sebagai pembagi, hasilnya NULL dan query tetap berjalan.</p>`,
      examples: [{ sql: "select order_id, voucher_code, shipping_fee,\n       nullif(shipping_fee, 0) as ongkir_atau_kosong,\n       round(100000 / nullif(shipping_fee, 0), 2) as kali_ongkir\nfrom app.orders\nwhere order_id between 100001 and 100040\norder by shipping_fee\nlimit 10;", note: "Pesanan dengan ongkir 0 menghasilkan NULL di dua kolom terakhir, bukan error." }],
    },
    {
      title: "DISTINCT: menghapus baris kembar",
      html: `<p><code>DISTINCT</code> ditulis tepat setelah SELECT. Kata ini menghapus baris yang kembar, sehingga setiap kombinasi nilai hanya muncul sekali.</p>
<p>DISTINCT berlaku untuk <b>seluruh kolom</b> di SELECT, bukan hanya kolom pertama. <code>select distinct channel, status</code> menghasilkan setiap pasangan channel dan status yang ada, bukan daftar channel saja. Dua baris dianggap kembar hanya kalau semua kolomnya sama.</p>
<p>Pakai DISTINCT untuk melihat isi yang mungkin dari sebuah kolom, misalnya daftar status pesanan. Jangan memakainya untuk "menutupi" baris dobel yang tidak kamu pahami asalnya; cari dulu kenapa barisnya dobel.</p>`,
      examples: [
        { sql: "select distinct status\nfrom app.orders\norder by status;", note: "Lima status yang dipakai pesanan TokoKita." },
        { sql: "select distinct channel, status\nfrom app.orders\norder by channel, status;", note: "Setiap pasangan channel dan status yang benar-benar muncul di data." },
      ],
    },
  ],
  tsql: [
    { pg: "coalesce(a, b)", tsql: "coalesce(a, b) atau isnull(a, b)", note: "ISNULL hanya menerima dua nilai dan tidak ada di PostgreSQL. COALESCE menerima banyak nilai dan berlaku di keduanya." },
    { pg: "case when … then … else … end", tsql: "case when … then … else … end, atau iif(syarat, a, b)", note: "IIF adalah singkatan khas SQL Server untuk CASE dengan satu syarat." },
    { pg: "nilai::date", tsql: "cast(nilai as date) atau convert(date, nilai)", note: "Di SQL Server, :: bukan tanda konversi tipe (tanda itu dipakai untuk keperluan lain), jadi pakai CAST atau CONVERT." },
    { pg: "7 / 2 = 3", tsql: "7 / 2 = 3", note: "Pembagian bilangan bulat juga terpotong di SQL Server." },
    { pg: "cast(2.7 as integer) = 3", tsql: "cast(2.7 as int) = 2", note: "PostgreSQL membulatkan ke bilangan bulat terdekat; SQL Server membuang angka di belakang koma." },
    { pg: "round(3.456, 1) = 3.5", tsql: "round(3.456, 1) = 3.500", note: "Di SQL Server, ROUND mempertahankan jumlah digit di belakang koma dan mengisinya dengan nol." },
    { pg: "text, numeric, boolean", tsql: "varchar/nvarchar, decimal, bit", note: "Nama tipe data berbeda; isinya serupa." },
  ],
  summary: [
    "SELECT bisa berisi ekspresi (rumus) seperti <code>qty * unit_price - discount</code>. Beri alias supaya judul kolomnya jelas.",
    "Pembagian dua bilangan bulat membuang angka di belakang koma. Jadikan salah satunya desimal: <code>7 / 2.0</code> atau <code>7::numeric / 2</code>.",
    "<code>CAST(x AS tipe)</code> dan <code>x::tipe</code> mengubah tipe data; <code>ROUND(x, n)</code> membulatkan.",
    "<code>CASE WHEN</code> diperiksa dari atas ke bawah dan berhenti di syarat pertama yang benar. Tanpa ELSE, hasilnya NULL.",
    "Hitungan dengan NULL hasilnya NULL. <code>COALESCE</code> mengganti NULL; <code>NULLIF(x, 0)</code> mencegah pembagian dengan nol.",
    "<code>DISTINCT</code> menghapus baris kembar dan berlaku untuk semua kolom di SELECT.",
  ],
  drills: [
    { id: "sql-03-01", kind: "choice", prompt: "Apa hasil <code>select 7 / 2</code> di PostgreSQL?",
      options: ["3.5", "3", "4", "Error karena hasilnya bukan bilangan bulat"], answer: 1,
      why: "Kedua angka adalah bilangan bulat, jadi hasil pembagiannya juga bilangan bulat dan angka di belakang koma dibuang.", hint: "Ingat bagian jebakan pembagian." },
    { id: "sql-03-02", kind: "choice", prompt: "Query <code>select distinct channel, status from app.orders</code> menghasilkan apa?",
      options: ["Daftar channel unik saja", "Setiap pasangan channel dan status yang muncul di data, masing-masing sekali", "Semua pesanan tanpa baris dobel di kolom channel", "Error, DISTINCT hanya untuk satu kolom"], answer: 1,
      why: "DISTINCT berlaku untuk semua kolom di SELECT. Dua baris dianggap kembar hanya kalau channel dan status-nya sama.", hint: "DISTINCT melihat seluruh baris hasil." },
    { id: "sql-03-03", kind: "sql", prompt: "Untuk pesanan nomor 100002, tampilkan <code>line_no</code>, <code>qty</code>, <code>unit_price</code>, dan nilai kotor setiap baris (qty dikali harga satuan).",
      solution: "select line_no, qty, unit_price, qty * unit_price as nilai_kotor from app.order_items where order_id = 100002",
      why: "Nilai kotor dihitung dengan ekspresi qty * unit_price untuk setiap baris.", hint: "Tambahkan ekspresi qty * unit_price di SELECT." },
    { id: "sql-03-04", kind: "sql", prompt: "Untuk pesanan nomor 100010 sampai 100020, tampilkan <code>order_id</code>, <code>line_no</code>, dan nilai bersih setiap baris (nilai kotor dikurangi <code>discount</code>).",
      solution: "select order_id, line_no, qty * unit_price - discount as nilai_bersih from app.order_items where order_id between 100010 and 100020",
      why: "Nilai bersih = qty * unit_price - discount. BETWEEN mengikutkan pesanan 100010 dan 100020.", hint: "where order_id between … and …" },
    { id: "sql-03-05", kind: "sql", prompt: "Tampilkan <code>product_name</code>, <code>list_price</code>, dan kolom kelas harga: 'murah' kalau di bawah 50.000, 'sedang' kalau di bawah 200.000, selain itu 'mahal'.",
      solution: "select product_name, list_price, case when list_price < 50000 then 'murah' when list_price < 200000 then 'sedang' else 'mahal' end as kelas_harga from app.products",
      why: "CASE memeriksa syarat dari atas. Harga di bawah 50.000 berhenti di WHEN pertama, jadi WHEN kedua cukup memeriksa < 200000.", hint: "case when … then … when … then … else … end" },
    { id: "sql-03-06", kind: "sql", prompt: "Untuk pesanan yang dibuat tanggal 31 Oktober 2025, tampilkan <code>order_id</code> dan kolom voucher yang berisi <code>voucher_code</code>, atau teks 'tanpa voucher' kalau kosong.",
      solution: "select order_id, coalesce(voucher_code, 'tanpa voucher') as voucher from app.orders where order_ts >= '2025-10-31' and order_ts < '2025-11-01'",
      why: "COALESCE mengembalikan nilai pertama yang tidak NULL. Rentang tanggalnya ditulis setengah terbuka.", hint: "coalesce(voucher_code, 'tanpa voucher')" },
    { id: "sql-03-07", kind: "sql", ordered: true, prompt: "Tampilkan daftar merek (<code>brand</code>) produk tanpa ada yang dobel, urut dari A ke Z.",
      solution: "select distinct brand from app.products order by brand",
      why: "DISTINCT menghapus merek yang kembar; ORDER BY mengurutkannya.", hint: "select distinct …" },
    { id: "sql-03-08", kind: "sql", prompt: "Untuk baris pesanan nomor 100001 sampai 100100 yang punya potongan (<code>discount</code> lebih dari 0), tampilkan <code>order_id</code>, <code>line_no</code>, dan persen potongan dari nilai kotor, dibulatkan 1 digit di belakang koma.",
      solution: "select order_id, line_no, round(discount / (qty * unit_price) * 100, 1) as persen_diskon from app.order_items where order_id between 100001 and 100100 and discount > 0",
      why: "Persen potongan = discount dibagi nilai kotor, dikali 100. Tanda kurung di (qty * unit_price) penting supaya pembaginya nilai kotor.", hint: "round(… * 100, 1)" },
    { id: "sql-03-09", kind: "fix", prompt: "Query ini seharusnya menghitung jumlah barang dalam lusin (12 barang = 1 lusin) dengan 2 digit di belakang koma, untuk pesanan nomor 100001. Ternyata semua hasilnya 0. Perbaiki.",
      start: "select order_id, line_no, qty,\n       round(qty / 12, 2) as lusin\nfrom app.order_items\nwhere order_id = 100001;",
      solution: "select order_id, line_no, qty, round(qty / 12.0, 2) as lusin from app.order_items where order_id = 100001",
      why: "qty dan 12 sama-sama bilangan bulat, jadi pembagiannya membuang angka di belakang koma sebelum ROUND bekerja. Jadikan salah satunya desimal, misalnya 12.0 atau qty::numeric.", hint: "Ingat jebakan pembagian bilangan bulat." },
    { id: "sql-03-10", kind: "number", prompt: "Berapa nilai bersih (nilai kotor dikurangi potongan) baris pertama (<code>line_no</code> = 1) di pesanan nomor 100001?",
      answerSql: "select qty * unit_price - discount from app.order_items where order_id = 100001 and line_no = 1",
      why: "select qty * unit_price - discount from app.order_items where order_id = 100001 and line_no = 1", hint: "Saring dua kolom sekaligus dengan AND." },
    { id: "sql-03-11", kind: "explain", prompt: "Jelaskan dengan kalimatmu sendiri: kapan NULL sebaiknya diganti 0 dengan COALESCE, dan kapan sebaiknya dibiarkan NULL?",
      model: "Ganti dengan 0 kalau kosong memang berarti \"tidak ada\", misalnya tidak ada potongan harga, sehingga angkanya aman dijumlah atau ditampilkan. Biarkan NULL kalau kosong berarti \"belum diketahui\", misalnya data yang belum diisi, karena mengganti dengan 0 membuat data terlihat pasti padahal tidak, dan bisa mengubah hasil hitungan seperti rata-rata.",
      hint: "Bedakan antara \"tidak ada\" dan \"tidak diketahui\"." },
  ],
};
