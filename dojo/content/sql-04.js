// Bab 4 SQL: fungsi teks, fungsi tanggal, dan membersihkan data mentah.
export default {
  id: "sql-04",
  part: "sql",
  title: "Teks, tanggal, dan membersihkan data mentah",
  minutes: 80,
  goals: [
    "Merapikan teks dengan <code>UPPER</code>, <code>LOWER</code>, <code>TRIM</code>, dan <code>REPLACE</code>.",
    "Menggabung dan memotong teks dengan <code>||</code>, <code>CONCAT</code>, <code>SUBSTRING</code>, <code>LEFT</code>, <code>POSITION</code>, dan <code>SPLIT_PART</code>.",
    "Mengolah tanggal dengan <code>DATE_TRUNC</code>, <code>EXTRACT</code>, <code>INTERVAL</code>, dan pengurangan tanggal.",
    "Mengubah teks menjadi tanggal dengan <code>TO_DATE</code>, dan tanggal menjadi teks dengan <code>TO_CHAR</code>.",
    "Membersihkan data mentah yang formatnya tidak seragam, selangkah demi selangkah.",
  ],
  terms: [
    { term: "fungsi", def: "Perintah bernama yang menerima nilai di dalam tanda kurung dan mengembalikan hasil, misalnya <code>UPPER(full_name)</code>." },
    { term: "data mentah", def: "Data apa adanya dari sumbernya (berkas, sistem lain), sebelum dirapikan. Di TokoKita ada di skema <code>raw</code>." },
    { term: "format ISO", def: "Cara menulis tanggal tahun-bulan-tanggal, misalnya 2025-10-31. Bisa diurutkan dan dibandingkan dengan benar." },
    { term: "interval", def: "Nilai berupa lama waktu, misalnya 3 hari atau 2 jam. Dipakai untuk menambah atau mengurangi tanggal." },
  ],
  introduces: ["UPPER()", "LOWER()", "TRIM()", "LENGTH()", "SUBSTRING()", "LEFT()", "REPLACE()", "POSITION()", "SPLIT_PART()", "||", "CONCAT()",
    "CURRENT_DATE", "NOW()", "DATE_TRUNC()", "EXTRACT()", "INTERVAL", "AGE()", "TO_CHAR()", "TO_DATE()"],
  sections: [
    {
      title: "Fungsi teks dasar",
      html: `<p><b>Fungsi</b> adalah perintah bernama yang menerima nilai di dalam tanda kurung, lalu mengembalikan hasil. Kamu sudah memakai beberapa di bab sebelumnya, seperti ROUND dan COALESCE. Bab ini menambah fungsi untuk teks dan tanggal.</p>
<ul><li><code>UPPER(x)</code> mengubah teks menjadi huruf besar semua; <code>LOWER(x)</code> menjadi huruf kecil semua.</li>
<li><code>LENGTH(x)</code> menghitung jumlah karakter, termasuk spasi.</li>
<li><code>TRIM(x)</code> membuang spasi di awal dan akhir teks. Spasi di tengah tidak tersentuh.</li>
<li><code>REPLACE(x, 'lama', 'baru')</code> mengganti semua potongan teks 'lama' dengan 'baru'. Untuk menghapus sesuatu, ganti dengan teks kosong <code>''</code>.</li></ul>
<p>Fungsi bisa dibungkus fungsi lain. Yang paling dalam dikerjakan lebih dulu: <code>UPPER(TRIM(x))</code> membuang spasi dulu, lalu mengubah ke huruf besar.</p>`,
      examples: [{ sql: "select full_name,\n       upper(full_name) as besar,\n       lower(full_name) as kecil,\n       length(full_name) as panjang\nfrom app.customers\norder by customer_id\nlimit 5;", note: "Fungsi tidak mengubah isi tabel. Hasilnya hanya ada di hasil query." }],
    },
    {
      title: "Menggabung teks",
      html: `<p>Ada dua cara menggabung teks:</p>
<ul><li>Operator <code>||</code>: <code>full_name || ' (' || segment || ')'</code>.</li>
<li>Fungsi <code>CONCAT(a, b, …)</code>, yang menerima banyak nilai sekaligus.</li></ul>
<p>Perbedaannya ada pada NULL. Dengan <code>||</code>, kalau salah satu bagiannya NULL, seluruh hasilnya NULL. <code>CONCAT</code> menganggap NULL sebagai teks kosong. Kalau kolom yang digabung bisa kosong, pilih CONCAT, atau bungkus kolom itu dengan COALESCE.</p>`,
      examples: [{ sql: "select customer_id,\n       full_name || ' - ' || phone as pakai_operator,\n       concat(full_name, ' - ', phone) as pakai_concat\nfrom app.customers\nwhere customer_id <= 10\norder by customer_id;", note: "Pelanggan nomor 4 dan 9 tidak punya telepon. Di kolom pakai_operator hasilnya NULL, di kolom pakai_concat namanya tetap tampil." }],
    },
    {
      title: "Mengambil potongan teks",
      html: `<p>Fungsi untuk mengambil sebagian teks:</p>
<ul><li><code>LEFT(x, n)</code>: n karakter pertama.</li>
<li><code>SUBSTRING(x FROM awal FOR panjang)</code>: potongan mulai dari karakter ke-awal, sepanjang panjang karakter. Bagian FOR boleh dihilangkan untuk mengambil sampai akhir. Penomoran karakter dimulai dari 1.</li>
<li><code>POSITION('cari' IN x)</code>: posisi pertama teks 'cari' di dalam x. Hasilnya 0 kalau tidak ditemukan.</li>
<li><code>SPLIT_PART(x, pemisah, n)</code>: memecah teks di setiap pemisah, lalu mengambil bagian ke-n.</li></ul>
<p>Contoh: <b>domain</b> email adalah alamat penyedia email, yaitu bagian setelah tanda @ (misalnya mail.example). Dengan SPLIT_PART, cukup ambil bagian kedua.</p>`,
      examples: [{ sql: "select email,\n       position('@' in email) as posisi_at,\n       split_part(email, '@', 1) as nama_akun,\n       split_part(email, '@', 2) as domain,\n       left(email, 3) as tiga_huruf_awal\nfrom app.customers\norder by customer_id\nlimit 5;", note: "SPLIT_PART memotong email menjadi dua bagian di tanda @: bagian ke-1 sebelum @, bagian ke-2 sesudahnya." }],
    },
    {
      title: "Tanggal hari ini, dan kenapa jarang dipakai di latihan",
      html: `<p><code>CURRENT_DATE</code> memberi tanggal hari ini, dan <code>NOW()</code> memberi tanggal dan jam sekarang. Keduanya dipakai di pekerjaan nyata untuk syarat seperti "pesanan 7 hari terakhir".</p>
<p>Data TokoKita berhenti pada 31 Oktober 2025. Kalau latihan memakai CURRENT_DATE, jawabannya akan berubah setiap hari. Karena itu, latihan di kursus ini memakai tanggal tetap sebagai "hari ini", yaitu <code>date '2025-10-31'</code>. Kata <code>date</code> di depan teks memberi tahu PostgreSQL bahwa teks itu adalah tanggal. Dengan cara yang sama, <code>timestamp '2025-10-31 08:00:00'</code> membuat nilai tanggal-dan-jam.</p>
<p>Soal zona waktu: kolom bertipe <code>timestamp</code> di TokoKita tidak menyimpan zona waktu, dan kamus data juga tidak menyebutnya. Di kursus ini, anggap semuanya dalam WIB (Waktu Indonesia Barat, tujuh jam di depan waktu UTC, waktu acuan dunia). Sistem nyata sering memakai <code>timestamptz</code>. Tipe ini menyimpan satu titik waktu yang pasti (disimpan dalam UTC), lalu menampilkannya sesuai zona waktu yang sedang dipakai, misalnya WIB atau WITA. Hati-hati saat membandingkan data dari dua sistem yang zonanya berbeda.</p>`,
      examples: [{ sql: "select current_date as hari_ini_sebenarnya,\n       now() as sekarang,\n       date '2025-10-31' as hari_ini_di_latihan;", note: "Dua kolom pertama mengikuti jam dan zona waktu komputermu; kolom ketiga selalu sama." }],
    },
    {
      title: "Menghitung dengan tanggal",
      html: `<p>Ada dua operasi dasar dengan tanggal:</p>
<ul><li><b>Tanggal dikurangi tanggal</b> menghasilkan jumlah hari, berupa bilangan bulat. <code>date '2025-10-31' - signup_date</code> adalah lama pelanggan terdaftar, dalam hari.</li>
<li><b>Tanggal ditambah atau dikurangi interval.</b> <code>order_ts + interval '3 days'</code> adalah tiga hari setelah pesanan dibuat. Satuan yang bisa dipakai antara lain <code>'2 hours'</code>, <code>'1 month'</code>, dan <code>'1 year'</code>.</li></ul>
<p>Untuk kolom tanggal-dan-jam, ubah dulu ke tanggal dengan <code>::date</code> kalau yang dibutuhkan jumlah hari. Kalau dua timestamp dikurangi langsung, hasilnya interval, misalnya <code>2 days 05:30:00</code>.</p>
<p><code>AGE(a, b)</code> menghitung selisih dua tanggal dalam tahun, bulan, dan hari, misalnya <code>2 years 3 mons 4 days</code>. Fungsi ini cocok untuk umur atau masa keanggotaan.</p>`,
      examples: [
        { sql: "select order_id, shipped_ts, delivered_ts,\n       delivered_ts::date - shipped_ts::date as hari_kirim,\n       delivered_ts - shipped_ts as lama_tepat,\n       shipped_ts + interval '7 days' as batas_tiba\nfrom app.shipments\nwhere order_id between 100001 and 100010;", note: "hari_kirim berupa bilangan bulat; lama_tepat berupa interval yang menyertakan jam." },
        { sql: "select full_name, signup_date,\n       age(date '2025-10-31', signup_date) as lama_jadi_pelanggan\nfrom app.customers\norder by customer_id\nlimit 5;", note: "AGE menulis selisihnya dalam tahun (years), bulan (mons), dan hari (days)." },
      ],
    },
    {
      title: "DATE_TRUNC dan EXTRACT",
      html: `<p><code>DATE_TRUNC('satuan', x)</code> memotong tanggal ke awal satuan itu. <code>date_trunc('month', order_ts)</code> mengubah semua pesanan bulan Maret menjadi tanggal 1 Maret jam 00:00. Fungsi ini dipakai untuk melaporkan data per bulan. Satuan lain: <code>'year'</code>, <code>'quarter'</code>, <code>'week'</code>, dan <code>'day'</code>. Untuk kolom bertipe timestamp seperti <code>order_ts</code>, hasilnya juga bertipe timestamp; tambahkan <code>::date</code> kalau hanya butuh tanggal.</p>
<p><code>EXTRACT(bagian FROM x)</code> mengambil satu bagian sebagai angka: <code>year</code>, <code>month</code>, <code>day</code>, <code>hour</code>, atau <code>dow</code> (hari dalam minggu: 0 = Minggu sampai 6 = Sabtu).</p>`,
      examples: [{ sql: "select order_id, order_ts,\n       date_trunc('month', order_ts)::date as bulan,\n       extract(year from order_ts) as tahun,\n       extract(hour from order_ts) as jam,\n       extract(dow from order_ts) as hari_ke\nfrom app.orders\nwhere order_id between 100001 and 100008;", note: "Semua pesanan di bulan yang sama mendapat nilai bulan yang sama. Itu sebabnya DATE_TRUNC dipakai untuk mengelompokkan data per bulan." }],
    },
    {
      title: "TO_CHAR dan TO_DATE: tanggal ↔ teks",
      html: `<p><code>TO_CHAR(tanggal, 'pola')</code> mengubah tanggal menjadi teks dengan format tertentu. Pola yang umum: <code>YYYY</code> (tahun), <code>MM</code> (bulan dua digit), <code>DD</code> (tanggal), dan <code>HH24:MI</code> (jam dan menit). Contohnya <code>to_char(order_ts, 'YYYY-MM')</code> menghasilkan teks seperti 2025-10.</p>
<p><code>TO_DATE(teks, 'pola')</code> kebalikannya: membaca teks menjadi tanggal. Fungsi ini dibutuhkan untuk data mentah yang memakai format selain ISO, misalnya <code>to_date('29/09/2025', 'DD/MM/YYYY')</code>.</p>
<p>Simpan dan bandingkan tanggal sebagai tipe <code>date</code> atau <code>timestamp</code>, bukan sebagai teks. Sebagai teks, '01/12/2024' dianggap lebih kecil dari '15/02/2023', karena keduanya dibandingkan sebagai teks, bukan sebagai tanggal. Kamu bisa membuktikannya sendiri: <code>select '01/12/2024' &lt; '15/02/2023'</code> menghasilkan true. Pakai TO_CHAR hanya untuk tampilan akhir.</p>`,
      examples: [{ sql: "select order_ts,\n       to_char(order_ts, 'YYYY-MM') as bulan_teks,\n       to_char(order_ts, 'DD/MM/YYYY HH24:MI') as format_indonesia,\n       to_date('29/09/2025', 'DD/MM/YYYY') as dari_teks\nfrom app.orders\nwhere order_id = 100001;", note: "Dua kolom TO_CHAR berupa teks; kolom terakhir berupa tanggal." }],
    },
    {
      title: "Membersihkan data mentah: berkas harga dari pemasok",
      html: `<p>Tabel <code>raw.supplier_price_upload</code> berisi berkas harga baru dari pemasok, apa adanya. Semua kolomnya bertipe teks, kecuali nomor baris berkas (<code>row_no</code>, bilangan bulat), dan formatnya tidak seragam:</p>
<ul><li>Kode produk ditulis <code>' tk-10931'</code>, <code>'TK10812 '</code>, atau <code>'TK-10553'</code>, padahal di tabel produk formatnya <code>TK-10553</code>.</li>
<li>Harga ditulis <code>'Rp 63.900'</code>, <code>'229.900'</code>, <code>'192900'</code>, <code>'34,900'</code>, <code>'Rp141.900,00'</code>, atau kosong.</li>
<li>Tanggal ditulis <code>'29/09/2025'</code> atau <code>'2025-09-16'</code>.</li></ul>
<p>Data seperti ini sangat umum di pekerjaan. Langkah membersihkannya:</p>
<ol><li><b>Lihat dulu semua variasinya.</b> Jangan menebak. Urutkan kolomnya dan baca setiap bentuk yang ada.</li>
<li><b>Seragamkan teksnya.</b> TRIM untuk spasi, UPPER untuk huruf, REPLACE untuk tanda yang berbeda-beda.</li>
<li><b>Ubah ke tipe yang benar.</b> Angka dengan <code>::numeric</code>, tanggal dengan TO_DATE. Teks kosong ubah dulu ke NULL dengan NULLIF. Ingat, teks kosong (<code>''</code>, teks tanpa satu huruf pun) <i>bukan</i> NULL: syarat <code>is not null</code> tetap meloloskannya, sehingga <code>''::numeric</code> akan gagal.</li>
<li><b>Periksa hasilnya</b> berdampingan dengan teks aslinya.</li>
<li><b>Jangan pernah menimpa data mentah.</b> Pembersihan dilakukan di query atau di tabel baru, supaya kalau ada kesalahan, kamu selalu bisa mengulang dari data aslinya.</li></ol>
<p>Contoh pertama merapikan kode produk: buang spasi, jadikan huruf besar, buang semua tanda minus, lalu pasang lagi satu tanda minus setelah "TK". Contoh kedua membaca dua format tanggal dengan CASE. Contoh ketiga membersihkan harga: buang ",00" di akhir kalau ada, buang "Rp", spasi, titik, dan koma, lalu ubah ke angka.</p>`,
      examples: [
        { sql: "select row_no, sku_text,\n       'TK-' || substring(replace(upper(trim(sku_text)), '-', '') from 3) as sku_bersih\nfrom raw.supplier_price_upload\norder by row_no\nlimit 10;", note: "Baca dari dalam ke luar: trim, upper, replace, substring mulai karakter ke-3 (melewati 'TK'), lalu digabung lagi dengan 'TK-'." },
        { sql: "select row_no, effective_date_text,\n       case\n         when effective_date_text like '__/__/____' then to_date(effective_date_text, 'DD/MM/YYYY')\n         else to_date(effective_date_text, 'YYYY-MM-DD')\n       end as berlaku_mulai\nfrom raw.supplier_price_upload\norder by row_no\nlimit 10;", note: "Pola '__/__/____' cocok dengan teks berformat DD/MM/YYYY (setiap _ adalah satu karakter)." },
        { sql: "select row_no, price_text,\n       nullif(replace(replace(replace(replace(\n         case when price_text like '%,00' then left(price_text, length(price_text) - 3) else price_text end,\n         'Rp', ''), ' ', ''), '.', ''), ',', ''), '')::numeric as harga\nfrom raw.supplier_price_upload\norder by row_no\nlimit 12;", note: "Baris ke-2 harganya kosong, sehingga hasilnya NULL. Semua bentuk lain menjadi angka yang sama formatnya." },
      ],
    },
  ],
  tsql: [
    { pg: "length(x)", tsql: "len(x)", note: "LEN di SQL Server tidak menghitung spasi di akhir teks." },
    { pg: "a || b", tsql: "a + b, atau concat(a, b); a || b mulai SQL Server 2025", note: "Dengan + dan ||, hasilnya NULL kalau salah satu bagiannya NULL. CONCAT menganggap NULL sebagai teks kosong, sama seperti di PostgreSQL." },
    { pg: "position('@' in email)", tsql: "charindex('@', email)", note: "Sama-sama menulis teks yang dicari lebih dulu; CHARINDEX memakai koma, bukan IN." },
    { pg: "split_part(email, '@', 2)", tsql: "substring(email, charindex('@', email) + 1, len(email))", note: "Dokumentasi fungsi teks SQL Server tidak memuat SPLIT_PART. STRING_SPLIT ada, tapi menghasilkan baris, bukan kolom." },
    { pg: "now(), current_date", tsql: "getdate(), cast(getdate() as date)", note: "Dokumentasi T-SQL terbaru juga memuat current_date (hasilnya bertipe date); kalau SQL Server tempatmu bekerja belum mengenalnya, pakai cast(getdate() as date). getdate() bertipe datetime dan tidak menyertakan zona waktu, sedangkan now() di PostgreSQL bertipe timestamptz." },
    { pg: "order_ts + interval '3 days'", tsql: "dateadd(day, 3, order_ts)", note: "" },
    { pg: "tanggal_b - tanggal_a", tsql: "datediff(day, tanggal_a, tanggal_b)", note: "Di SQL Server, nilai bertipe date tidak bisa dikurangi dengan tanda minus. Pakai DATEDIFF untuk mendapat jumlah hari." },
    { pg: "date_trunc('month', x)", tsql: "datetrunc(month, x), atau datefromparts(year(x), month(x), 1)", note: "DATETRUNC baru ada sejak SQL Server 2022." },
    { pg: "extract(year from x)", tsql: "year(x), atau datepart(year, x)", note: "" },
    { pg: "to_char(x, 'YYYY-MM')", tsql: "format(x, 'yyyy-MM')", note: "Pola huruf di FORMAT berbeda: yyyy untuk tahun, MM untuk bulan." },
    { pg: "to_date(x, 'DD/MM/YYYY')", tsql: "try_convert(date, x, 103)", note: "Angka 103 adalah kode format DD/MM/YYYY. TRY_CONVERT menghasilkan NULL kalau gagal, bukan error." },
  ],
  summary: [
    "Fungsi bisa dibungkus fungsi lain; yang paling dalam dikerjakan lebih dulu.",
    "<code>TRIM</code>, <code>UPPER</code>/<code>LOWER</code>, dan <code>REPLACE</code> adalah alat utama untuk menyeragamkan teks.",
    "<code>||</code> menghasilkan NULL kalau ada bagian yang NULL; <code>CONCAT</code> menganggap NULL sebagai teks kosong.",
    "Tanggal dikurangi tanggal menghasilkan jumlah hari; tambahkan <code>interval</code> untuk menggeser tanggal.",
    "<code>DATE_TRUNC('month', x)</code> dipakai untuk mengelompokkan per bulan; <code>EXTRACT</code> mengambil satu bagian tanggal sebagai angka.",
    "Bandingkan tanggal sebagai tanggal, bukan teks. Pakai <code>TO_DATE</code> untuk membaca format lain, dan <code>TO_CHAR</code> hanya untuk tampilan.",
    "Bersihkan data mentah selangkah demi selangkah, dan jangan pernah menimpa data aslinya.",
  ],
  drills: [
    { id: "sql-04-01", kind: "choice", prompt: "Apa hasil <code>'Telepon: ' || NULL</code>?",
      options: ["'Telepon: '", "'Telepon: NULL'", "NULL", "Error"], answer: 2,
      why: "Operator || menghasilkan NULL kalau salah satu bagiannya NULL. CONCAT('Telepon: ', NULL) akan menghasilkan 'Telepon: '.", hint: "Ingat perbedaan || dan CONCAT." },
    { id: "sql-04-02", kind: "choice", prompt: "Apa hasil <code>date_trunc('month', timestamp '2025-03-17 14:25:00')</code>?",
      options: ["2025-03-17 00:00:00", "2025-03-01 00:00:00", "2025-03-31 23:59:59", "3"], answer: 1,
      why: "DATE_TRUNC memotong ke awal satuan: awal bulan Maret adalah tanggal 1 jam 00:00:00.", hint: "Potong ke awal bulan." },
    { id: "sql-04-03", kind: "sql", prompt: "Untuk pelanggan nomor 1 sampai 20, tampilkan <code>customer_id</code>, nama dalam huruf besar semua, dan domain email (bagian setelah tanda @).",
      solution: "select customer_id, upper(full_name) as nama, split_part(email, '@', 2) as domain from app.customers where customer_id <= 20",
      why: "UPPER mengubah ke huruf besar; SPLIT_PART dengan pemisah '@' mengambil bagian kedua, yaitu domain.", hint: "upper(…) dan split_part(email, '@', 2)" },
    { id: "sql-04-04", kind: "sql", prompt: "Dari <code>raw.supplier_price_upload</code>, tampilkan <code>row_no</code> dan kode produk yang sudah dirapikan ke format <code>TK-12345</code> untuk semua baris.",
      solution: "select row_no, 'TK-' || substring(replace(upper(trim(sku_text)), '-', '') from 3) as sku_bersih from raw.supplier_price_upload",
      why: "TRIM membuang spasi, UPPER menyeragamkan huruf, REPLACE membuang semua tanda minus, lalu SUBSTRING mengambil angka setelah 'TK' dan digabung lagi dengan 'TK-'.", hint: "Lihat contoh pertama di bagian membersihkan data mentah." },
    { id: "sql-04-05", kind: "sql", prompt: "Dari <code>raw.supplier_price_upload</code>, tampilkan <code>row_no</code> dan tanggal berlaku bertipe <code>date</code>. Ingat ada dua format: DD/MM/YYYY dan YYYY-MM-DD.",
      solution: "select row_no, case when effective_date_text like '__/__/____' then to_date(effective_date_text, 'DD/MM/YYYY') else to_date(effective_date_text, 'YYYY-MM-DD') end as berlaku_mulai from raw.supplier_price_upload",
      why: "CASE memilih pola TO_DATE yang sesuai dengan format setiap baris.", hint: "case when … like '__/__/____' then to_date(…) else to_date(…) end" },
    { id: "sql-04-06", kind: "sql", prompt: "Untuk pesanan nomor 100001 sampai 100010, tampilkan <code>order_id</code>, tanggal pesanan tanpa jam, tahun, dan bulan (sebagai angka).",
      solution: "select order_id, order_ts::date as tanggal, extract(year from order_ts) as tahun, extract(month from order_ts) as bulan from app.orders where order_id between 100001 and 100010",
      why: "::date membuang jam; EXTRACT mengambil tahun dan bulan sebagai angka.", hint: "order_ts::date, extract(year from …), extract(month from …)" },
    { id: "sql-04-07", kind: "sql", prompt: "Untuk pengiriman pesanan nomor 100001 sampai 100100 yang sudah sampai (<code>delivered_ts</code> tidak kosong), tampilkan <code>order_id</code> dan lama pengiriman dalam hari (tanggal sampai dikurangi tanggal dikirim, tanpa jam).",
      solution: "select order_id, delivered_ts::date - shipped_ts::date as hari_kirim from app.shipments where order_id between 100001 and 100100 and delivered_ts is not null",
      why: "Ubah kedua kolom ke date dulu, lalu kurangkan; hasilnya jumlah hari berupa bilangan bulat.", hint: "delivered_ts::date - shipped_ts::date" },
    { id: "sql-04-08", kind: "sql", level: "menengah", prompt: "Dari <code>raw.supplier_price_upload</code>, tampilkan <code>row_no</code> dan harga bertipe angka untuk semua baris yang kolom <code>price_text</code>-nya bukan teks kosong (<code>''</code>). Kolom ini tidak berisi NULL.",
      solution: "select row_no, replace(replace(replace(replace(case when price_text like '%,00' then left(price_text, length(price_text) - 3) else price_text end, 'Rp', ''), ' ', ''), '.', ''), ',', '')::numeric as harga from raw.supplier_price_upload where price_text <> ''",
      why: "Buang ',00' di akhir dulu (bagian desimal), baru buang 'Rp', spasi, titik, dan koma. Teks yang tersisa hanya angka, sehingga aman diubah ke numeric.",
      hint: "Mulai dari CASE untuk ',00', lalu bungkus dengan REPLACE satu per satu." },
    { id: "sql-04-09", kind: "fix", prompt: "Query ini seharusnya menampilkan kontak setiap pelanggan nomor 1 sampai 50 dalam bentuk \"nama - telepon\", dan \"nama - tanpa telepon\" kalau teleponnya kosong. Ternyata pelanggan tanpa telepon hasilnya kosong. Perbaiki.",
      start: "select customer_id,\n       full_name || ' - ' || phone as kontak\nfrom app.customers\nwhere customer_id <= 50;",
      solution: "select customer_id, full_name || ' - ' || coalesce(phone, 'tanpa telepon') as kontak from app.customers where customer_id <= 50",
      why: "Kalau phone NULL, seluruh hasil || menjadi NULL. Bungkus phone dengan COALESCE supaya NULL diganti teks 'tanpa telepon'.", hint: "Ganti phone yang kosong sebelum digabung." },
    { id: "sql-04-10", kind: "number", prompt: "Berapa hari pelanggan nomor 1 sudah terdaftar, dihitung sampai tanggal 31 Oktober 2025?",
      answerSql: "select date '2025-10-31' - signup_date from app.customers where customer_id = 1",
      why: "Tanggal dikurangi tanggal menghasilkan jumlah hari: select date '2025-10-31' - signup_date from app.customers where customer_id = 1.", hint: "Pakai date '2025-10-31' sebagai hari ini." },
    { id: "sql-04-11", kind: "explain", prompt: "Kamu menerima berkas Excel dari tim lapangan untuk dimasukkan ke database. Tulis urutan langkahmu untuk membersihkannya, dan jelaskan kenapa data aslinya tidak boleh ditimpa.",
      model: "Pertama, muat berkas apa adanya ke tabel mentah. Lalu lihat semua variasi isi setiap kolom penting, jangan menebak. Seragamkan teks dengan TRIM, UPPER, dan REPLACE. Ubah ke tipe yang benar: angka dengan ::numeric, tanggal dengan TO_DATE, teks kosong ke NULL dengan NULLIF. Periksa hasilnya berdampingan dengan teks asli. Data asli tidak ditimpa supaya kalau aturan pembersihan ternyata salah, kita bisa mengulang dari awal dan membuktikan dari mana sebuah angka berasal.",
      hint: "Ingat lima langkah di bagian membersihkan data mentah." },
  ],
};
