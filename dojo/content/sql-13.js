// Bab 13 SQL: view, materialized view, index, rencana eksekusi (EXPLAIN), statistik tabel, dan performa.

// Tabel latihan besar (100.000 baris, data buatan) untuk melihat efek index. Dibuat ulang setiap contoh/soal.
// Setiap pelanggan (1–25.000) punya tepat 4 pesanan karena 7919 dan 25000 tidak punya faktor bersama.
const BESAR = `create schema latihan;
create table latihan.pesanan_besar (
  order_id int primary key,
  customer_id int not null,
  order_ts timestamp not null,
  channel text not null,
  status text not null,
  total_amount numeric(12,2) not null,
  email text not null
);
insert into latihan.pesanan_besar
select g,
       1 + (g * 7919) % 25000,
       timestamp '2024-01-01' + g * interval '576 seconds',
       case g % 3 when 0 then 'web' when 1 then 'android' else 'ios' end,
       case when g % 50 = 0 then 'cancelled'
            when g % 20 = 0 then 'returned'
            when g % 7 = 0 then 'processing'
            else 'completed' end,
       50000 + (g * 37 % 950) * 1000,
       'Pelanggan' || (1 + (g * 7919) % 25000) || '@mail.example'
from generate_series(1, 100000) as g;
analyze latihan.pesanan_besar;`;

// Tabel besar + index pada order_ts.
const BESAR_TS = `${BESAR}
create index pesanan_besar_order_ts_idx on latihan.pesanan_besar (order_ts);`;

// Fungsi bantu pemeriksa: menjalankan EXPLAIN (tanpa angka biaya) untuk sebuah query dan mengembalikan teks rencananya.
// Hanya dipakai di verify. Rencana dianggap memakai index kalau ada baris yang memuat kata "Index"
// (Index Scan, Index Only Scan, atau Bitmap Index Scan). Sudah diuji stabil dengan data BESAR.
const RENCANA = `create function latihan.rencana(q text) returns setof text language plpgsql as $f$
begin
  return query execute 'explain (costs off) ' || q;
end
$f$;`;

// View laporan.order_totals: satu baris per pesanan dengan nilai barangnya.
const VIEW_TOTALS = `create schema laporan;
create view laporan.order_totals as
select o.order_id, o.customer_id, o.order_ts, o.status,
       sum(oi.qty * oi.unit_price - oi.discount) as items_amount
from app.orders o
join app.order_items oi on oi.order_id = o.order_id
group by o.order_id, o.customer_id, o.order_ts, o.status;`;

// Materialized view per channel, lalu 3 pesanan web baru masuk sesudahnya (isi materialized view jadi tertinggal).
const MV_CHANNEL = `create schema laporan;
create materialized view laporan.pesanan_per_channel as
select channel, count(*) as jumlah_pesanan
from app.orders
group by channel;
insert into app.orders (order_id, customer_id, order_ts, channel, status, shipping_fee, voucher_code, handled_by, updated_at) values
  (112008, 151, timestamp '2025-10-31 19:00:00', 'web', 'processing', 15000, null, null, timestamp '2025-10-31 19:00:00'),
  (112009, 322, timestamp '2025-10-31 20:00:00', 'web', 'processing', 15000, null, null, timestamp '2025-10-31 20:00:00'),
  (112010, 151, timestamp '2025-10-31 21:00:00', 'web', 'processing', 15000, null, null, timestamp '2025-10-31 21:00:00');`;

const BULANAN = `select date_trunc('month', order_ts)::date as bulan, count(*) as jumlah_pesanan
from app.orders
group by date_trunc('month', order_ts)::date`;

export default {
  id: "sql-13",
  part: "sql",
  title: "View, index, dan performa",
  minutes: 90,
  goals: [
    "Membuat, mengganti, dan menghapus view dengan <code>CREATE VIEW</code>, <code>CREATE OR REPLACE VIEW</code>, dan <code>DROP VIEW</code>.",
    "Membedakan view dan materialized view, lalu memperbarui materialized view dengan <code>REFRESH MATERIALIZED VIEW</code>.",
    "Membaca rencana eksekusi dari <code>EXPLAIN</code> dan <code>EXPLAIN ANALYZE</code>: Seq Scan, Index Scan, Bitmap Heap Scan, cost, rows, dan waktu nyata.",
    "Membuat index dengan <code>CREATE INDEX</code>, termasuk index komposit dan index pada ekspresi seperti <code>lower(email)</code>.",
    "Menjelaskan kapan index dipakai dan kapan tidak: selektivitas, statistik tabel (<code>ANALYZE</code>), dan syarat WHERE yang SARGable.",
    "Menimbang biaya index untuk INSERT dan UPDATE.",
  ],
  terms: [
    { term: "view", def: "Query SELECT yang disimpan dengan sebuah nama dan bisa dipakai seperti tabel. View tidak menyimpan data; query-nya dijalankan ulang setiap kali view dipakai." },
    { term: "materialized view", def: "View yang hasil query-nya disimpan seperti tabel. Isinya tidak ikut berubah saat tabel asal berubah, sampai dijalankan <code>REFRESH MATERIALIZED VIEW</code>." },
    { term: "katalog", def: "Tabel dan view bawaan PostgreSQL yang berisi keterangan tentang objek di database, misalnya <code>pg_views</code>, <code>pg_matviews</code>, <code>pg_indexes</code>, dan <code>pg_stats</code>." },
    { term: "index", def: "Struktur data terpisah dari tabel yang menyimpan nilai satu kolom atau lebih dalam keadaan terurut, beserta letak barisnya di tabel, sehingga baris bisa ditemukan tanpa membaca seluruh tabel." },
    { term: "b-tree", def: "Jenis index bawaan PostgreSQL. Bisa dipakai untuk syarat <code>=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, BETWEEN, IN, IS NULL, dan LIKE dengan awalan tetap." },
    { term: "rencana eksekusi", def: "Langkah-langkah yang dipilih PostgreSQL untuk menjalankan sebuah query (bahasa Inggris: <i>execution plan</i>). Ditampilkan dengan <code>EXPLAIN</code>." },
    { term: "planner", def: "Bagian PostgreSQL yang menyusun rencana eksekusi: membandingkan beberapa cara mengambil data dan memilih yang perkiraan biayanya paling kecil." },
    { term: "seq scan", def: "<i>Sequential scan</i>: membaca seluruh tabel dari awal sampai akhir, lalu menyaring baris dengan syarat WHERE." },
    { term: "index scan", def: "Mencari letak baris lewat index, lalu mengambil hanya baris itu dari tabel. Di rencana eksekusi muncul sebagai Index Scan atau Bitmap Index Scan + Bitmap Heap Scan." },
    { term: "statistik tabel", def: "Ringkasan isi tabel yang dikumpulkan <code>ANALYZE</code>: jumlah baris, jumlah halaman, dan per kolom proporsi NULL, jumlah nilai berbeda, serta nilai yang paling sering muncul." },
    { term: "selektivitas", def: "Proporsi baris yang lolos sebuah syarat WHERE. Syarat yang meloloskan sedikit baris disebut selektif." },
    { term: "sargable", def: "Sifat syarat WHERE yang bisa memakai index, yaitu kolomnya berdiri sendiri di satu sisi perbandingan, tidak dibungkus fungsi atau diubah tipenya." },
    { term: "index komposit", def: "Index atas beberapa kolom sekaligus, diurutkan menurut kolom pertama, lalu kolom kedua, dan seterusnya." },
  ],
  introduces: ["CREATE VIEW", "DROP VIEW", "CREATE MATERIALIZED VIEW", "REFRESH MATERIALIZED VIEW", "CREATE INDEX", "EXPLAIN", "EXPLAIN ANALYZE", "ANALYZE", "MATERIALIZED"],
  sections: [
    {
      title: "View: query yang diberi nama",
      html: `<p><b>View</b> adalah query SELECT yang disimpan di database dengan sebuah nama. Setelah dibuat, view bisa dipakai di FROM seperti tabel. View tidak menyimpan data: setiap kali view dipakai, PostgreSQL menjalankan ulang query di dalamnya terhadap tabel asalnya.</p>
<p>Perintahnya <code>CREATE VIEW nama AS SELECT …</code>. Nama view ditulis dengan skema, sama seperti tabel. Contoh di bawah membuat skema <code>laporan</code>, lalu view <code>laporan.order_totals</code>: satu baris per pesanan, dengan nilai barang (<code>items_amount</code>, yaitu jumlah × harga satuan − potongan) yang dihitung dari <code>app.order_items</code>.</p>
<p>Kegunaan view: query panjang yang sering dipakai cukup ditulis sekali, dan semua orang memakai rumus yang sama. Kalau rumus nilai barang berubah, cukup view-nya yang diubah.</p>
<p>Setiap contoh dijalankan dalam transaksi yang dibatalkan, jadi skema dan view-nya dibuat ulang di setiap contoh.</p>`,
      examples: [
        { sql: `${VIEW_TOTALS}\n\nselect *\nfrom laporan.order_totals\norder by order_id\nlimit 5;`, note: "Hasilnya terlihat seperti tabel biasa, padahal setiap baris dihitung saat itu juga dari app.orders dan app.order_items." },
        { sql: `${VIEW_TOTALS}\n\nupdate app.orders set status = 'cancelled' where order_id = 100001;\n\nselect order_id, status, items_amount\nfrom laporan.order_totals\nwhere order_id = 100001;`, note: "Pesanan 100001 aslinya berstatus completed. View langsung menunjukkan status baru, karena view menjalankan ulang query-nya setiap kali dipakai." },
      ],
    },
    {
      title: "Mengganti dan menghapus view",
      html: `<p><code>CREATE OR REPLACE VIEW</code> mengganti query sebuah view yang sudah ada, atau membuatnya kalau belum ada. Aturannya: query baru harus menghasilkan kolom yang sama (nama, urutan, dan tipe data sama), tetapi boleh menambah kolom baru di akhir. Kalau urutan kolom diubah, PostgreSQL menolak dengan pesan seperti <code>cannot change name of view column "order_id" to "status"</code>. Untuk perubahan seperti itu, hapus dulu view-nya, lalu buat lagi.</p>
<p><code>DROP VIEW nama</code> menghapus view. Data di tabel asalnya tidak tersentuh, karena view memang tidak menyimpan data. <code>DROP VIEW IF EXISTS nama</code> tidak menghasilkan error kalau view-nya belum ada, sehingga cocok untuk skrip yang dijalankan berulang. Sebaliknya, tabel yang masih dipakai view tidak bisa dihapus begitu saja: PostgreSQL menolak dengan pesan <code>cannot drop table … because other objects depend on it</code>.</p>
<p>Daftar view tersimpan di <b>katalog</b> <code>pg_views</code>. Katalog adalah tabel dan view bawaan PostgreSQL yang berisi keterangan tentang objek di database. Kolom <code>definition</code> di <code>pg_views</code> berisi query view tersebut.</p>`,
      examples: [
        { sql: `${VIEW_TOTALS}\n\ncreate or replace view laporan.order_totals as\nselect o.order_id, o.customer_id, o.order_ts, o.status,\n       sum(oi.qty * oi.unit_price - oi.discount) as items_amount,\n       count(*) as line_count\nfrom app.orders o\njoin app.order_items oi on oi.order_id = o.order_id\ngroup by o.order_id, o.customer_id, o.order_ts, o.status;\n\nselect *\nfrom laporan.order_totals\norder by order_id\nlimit 5;`, note: "Kolom line_count (jumlah baris pesanan) ditambahkan di akhir, jadi CREATE OR REPLACE VIEW diterima." },
        { sql: `${VIEW_TOTALS}\n\ndrop view laporan.order_totals;\n\nselect count(*) as jumlah_view\nfrom pg_views\nwhere schemaname = 'laporan';`, note: "Setelah DROP VIEW, tidak ada lagi view di skema laporan." },
      ],
    },
    {
      title: "Materialized view: hasil query yang disimpan",
      html: `<p><b>Materialized view</b> menjalankan query-nya saat dibuat, lalu menyimpan hasilnya seperti tabel. Membacanya cepat karena tidak dihitung ulang, tetapi isinya tidak ikut berubah saat tabel asal berubah. Untuk memperbarui isinya, jalankan <code>REFRESH MATERIALIZED VIEW nama</code>: seluruh isi lama dibuang dan diganti hasil query yang baru.</p>
<p>Kedua contoh di bawah membuat view dan materialized view dengan query yang sama (jumlah pesanan per bulan), lalu memasukkan satu pesanan baru. Contoh kedua menjalankan REFRESH sebelum membaca.</p>
<p>Hal lain yang perlu diketahui:</p>
<ul><li><code>WITH NO DATA</code> di akhir CREATE MATERIALIZED VIEW membuat materialized view yang belum terisi. Membacanya menghasilkan error <code>has not been populated</code> sampai dijalankan REFRESH.</li>
<li>Materialized view tidak bisa diubah langsung dengan INSERT atau UPDATE. Isinya hanya berasal dari query-nya.</li>
<li>Selama REFRESH biasa berjalan, query lain yang membaca materialized view itu bisa tertahan. <code>REFRESH MATERIALIZED VIEW CONCURRENTLY</code> tidak menahan pembaca, tetapi syaratnya materialized view sudah terisi dan punya UNIQUE index pada kolom biasa (index dijelaskan di bagian-bagian berikutnya).</li>
<li>Menghapusnya memakai <code>DROP MATERIALIZED VIEW</code>, bukan DROP VIEW.</li></ul>
<p>Kapan memakai yang mana: view kalau data harus selalu terbaru dan query-nya cukup cepat. Materialized view kalau query-nya berat, dibaca berkali-kali, dan data yang sedikit tertinggal masih bisa diterima, misalnya ringkasan penjualan yang di-REFRESH setiap malam oleh program penjadwal.</p>`,
      examples: [
        { sql: `create schema laporan;\ncreate view laporan.pesanan_bulanan_v as\n${BULANAN};\ncreate materialized view laporan.pesanan_bulanan_m as\n${BULANAN};\n\ninsert into app.orders (order_id, customer_id, order_ts, channel, status, shipping_fee, voucher_code, handled_by, updated_at)\nvalues (112008, 151, timestamp '2025-10-31 20:00:00', 'web', 'processing', 15000, null, null, timestamp '2025-10-31 20:00:00');\n\nselect v.bulan, v.jumlah_pesanan as dari_view, m.jumlah_pesanan as dari_materialized_view\nfrom laporan.pesanan_bulanan_v v\njoin laporan.pesanan_bulanan_m m on m.bulan = v.bulan\nwhere v.bulan = date '2025-10-01';`, note: "Oktober 2025 punya 590 pesanan. Setelah satu pesanan baru masuk, view menunjukkan 591, sedangkan materialized view masih 590." },
        { sql: `create schema laporan;\ncreate view laporan.pesanan_bulanan_v as\n${BULANAN};\ncreate materialized view laporan.pesanan_bulanan_m as\n${BULANAN};\n\ninsert into app.orders (order_id, customer_id, order_ts, channel, status, shipping_fee, voucher_code, handled_by, updated_at)\nvalues (112008, 151, timestamp '2025-10-31 20:00:00', 'web', 'processing', 15000, null, null, timestamp '2025-10-31 20:00:00');\n\nrefresh materialized view laporan.pesanan_bulanan_m;\n\nselect v.bulan, v.jumlah_pesanan as dari_view, m.jumlah_pesanan as dari_materialized_view\nfrom laporan.pesanan_bulanan_v v\njoin laporan.pesanan_bulanan_m m on m.bulan = v.bulan\nwhere v.bulan = date '2025-10-01';`, note: "Setelah REFRESH, keduanya menunjukkan 591." },
      ],
    },
    {
      title: "Tabel latihan besar",
      html: `<p>Efek index baru terasa pada tabel yang besar. Tabel TokoKita terbesar, <code>app.order_items</code>, hanya berisi 28.495 baris. Karena itu bagian-bagian berikutnya memakai tabel buatan <code>latihan.pesanan_besar</code> berisi 100.000 pesanan fiktif. Tabel ini bukan data TokoKita. Tabel ini dibuat otomatis sebelum setiap contoh dan soal yang memakainya, dengan perintah berikut:</p>
<pre class="sql"><code>create table latihan.pesanan_besar (
  order_id int primary key, customer_id int not null, order_ts timestamp not null,
  channel text not null, status text not null, total_amount numeric(12,2) not null, email text not null
);
insert into latihan.pesanan_besar
select g,
       1 + (g * 7919) % 25000,                                    -- customer_id
       timestamp '2024-01-01' + g * interval '576 seconds',       -- order_ts
       case g % 3 when 0 then 'web' when 1 then 'android' else 'ios' end,
       case when g % 50 = 0 then 'cancelled' when g % 20 = 0 then 'returned'
            when g % 7 = 0 then 'processing' else 'completed' end,
       50000 + (g * 37 % 950) * 1000,                             -- total_amount
       'Pelanggan' || (1 + (g * 7919) % 25000) || '@mail.example' -- email
from generate_series(1, 100000) as g;
analyze latihan.pesanan_besar;</code></pre>
<p>Isinya: 25.000 pelanggan, masing-masing tepat 4 pesanan. Pesanan dibuat setiap 9 menit 36 detik, dari 1 Januari 2024 00:09:36 sampai 28 Oktober 2025 16:00:00, sehingga satu hari berisi sekitar 150 pesanan. Email ditulis dengan huruf P besar, misalnya <code>Pelanggan4242@mail.example</code>. Perintah <code>ANALYZE</code> di akhir dijelaskan di bagian statistik tabel.</p>`,
      examples: [{ setup: BESAR, sql: "select status, count(*) as jumlah\nfrom latihan.pesanan_besar\ngroup by status\norder by jumlah desc;", note: "completed 80.572 baris, processing 13.428, returned 4.000, dan cancelled 2.000. Pembagian yang tidak rata ini dipakai di bagian selektivitas." }],
    },
    {
      title: "Rencana eksekusi dan EXPLAIN",
      html: `<p>Sebelum menjalankan query, PostgreSQL menyusun <b>rencana eksekusi</b> (<i>execution plan</i>): langkah-langkah untuk mengambil datanya. Bagian yang menyusunnya disebut <b>planner</b> (perencana). Planner membandingkan beberapa cara dan memilih yang perkiraan biayanya paling kecil. Tulis <code>EXPLAIN</code> di depan query untuk melihat rencananya. Query-nya sendiri tidak dijalankan.</p>
<p>Cara membaca hasil contoh di bawah:</p>
<ul><li><code>Seq Scan on pesanan_besar</code>: <b>seq scan</b> (<i>sequential scan</i>), membaca seluruh tabel dari awal sampai akhir.</li>
<li><code>Filter: (customer_id = 4242)</code>: syarat WHERE dicek pada setiap baris yang dibaca, dan hanya baris yang lolos yang diteruskan.</li>
<li><code>cost=0.00..2455.00</code>: perkiraan biaya. Angka pertama adalah biaya sebelum baris pertama bisa dikeluarkan, angka kedua biaya sampai semua baris selesai. Satuannya bebas, bukan milidetik; gunanya untuk membandingkan rencana yang satu dengan yang lain.</li>
<li><code>rows=4</code>: perkiraan jumlah baris yang dihasilkan. <code>width</code>: perkiraan rata-rata lebar satu baris, dalam byte.</li></ul>
<p>Semua angka di EXPLAIN adalah perkiraan, dan bisa sedikit berbeda di komputermu. Kesalahan umum: membaca cost sebagai waktu.</p>`,
      examples: [{ setup: BESAR, sql: "explain\nselect *\nfrom latihan.pesanan_besar\nwhere customer_id = 4242;", note: "Belum ada index pada customer_id, jadi satu-satunya cara adalah membaca seluruh tabel." }],
    },
    {
      title: "Index: mencari tanpa membaca seluruh tabel",
      html: `<p><b>Index</b> adalah struktur data terpisah dari tabel. Isinya nilai satu kolom (atau lebih) dalam keadaan terurut, beserta letak baris asalnya di tabel. Karena terurut, PostgreSQL bisa langsung menemukan nilai 4242 tanpa membaca 100.000 baris.</p>
<p>Perintahnya <code>CREATE INDEX nama ON tabel (kolom)</code>. Kalau nama tidak ditulis, PostgreSQL memilih nama dari nama tabel dan kolomnya, misalnya <code>pesanan_besar_customer_id_idx</code>. Jenis bawaannya <b>B-tree</b>. Index B-tree bisa dipakai untuk syarat <code>=</code>, <code>&lt;</code>, <code>&lt;=</code>, <code>&gt;</code>, <code>&gt;=</code>, BETWEEN, IN, dan IS NULL, juga untuk ORDER BY.</p>
<p>Setelah index dibuat, rencananya berubah. Ada tiga bentuk yang sering muncul:</p>
<ul><li><b>Seq Scan</b>: membaca seluruh tabel.</li>
<li><b>Index Scan</b>: menelusuri index, lalu mengambil baris dari tabel satu per satu menurut urutan index. Biasanya dipilih untuk sangat sedikit baris, misalnya satu baris.</li>
<li><b>Bitmap Index Scan</b> lalu <b>Bitmap Heap Scan</b>: dua langkah. Langkah dalam (baris yang menjorok ke kanan, ditandai <code>-&gt;</code>) mengumpulkan letak semua baris yang cocok dari index. Langkah luar mengurutkan letak itu menurut posisinya di tabel, lalu membaca halaman tabel (blok berukuran tetap tempat baris disimpan) sekali jalan. <code>Recheck Cond</code> adalah syarat yang dicek ulang pada baris yang diambil.</li></ul>
<p>Istilah <b>index scan</b> di bab ini mencakup Index Scan dan pasangan Bitmap: keduanya memakai index. <code>Index Cond</code> adalah syarat yang dikerjakan lewat index; <code>Filter</code> adalah syarat yang dicek setelah baris diambil.</p>
<p>Membuat index pada tabel besar bisa lama. Selama index dibuat dengan CREATE INDEX biasa, tabel tetap bisa dibaca, tetapi INSERT, UPDATE, dan DELETE ditahan sampai selesai.</p>`,
      examples: [{ setup: BESAR, sql: "create index pesanan_besar_customer_idx\n  on latihan.pesanan_besar (customer_id);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere customer_id = 4242;", note: "Rencananya sekarang Bitmap Heap Scan di atas Bitmap Index Scan memakai pesanan_besar_customer_idx. Perkiraan cost turun dari ribuan menjadi puluhan." }],
    },
    {
      title: "EXPLAIN ANALYZE: waktu yang sebenarnya",
      html: `<p><code>EXPLAIN ANALYZE</code> benar-benar menjalankan query, lalu menampilkan rencananya beserta angka nyata:</p>
<ul><li><code>actual time=awal..akhir</code>: waktu nyata dalam milidetik sampai baris pertama dan sampai baris terakhir. <code>rows</code> di bagian ini adalah jumlah baris yang benar-benar dihasilkan (PostgreSQL 18 menulisnya dengan dua angka desimal, misalnya 4.00). <code>loops</code>: berapa kali langkah itu dijalankan.</li>
<li><code>Rows Removed by Filter</code>: jumlah baris yang dibaca tetapi dibuang karena tidak lolos syarat.</li>
<li><code>Buffers: shared hit=…</code>: jumlah halaman data yang ditemukan di memori PostgreSQL (<i>cache</i>); <code>read</code> berarti halaman harus dibaca dari penyimpanan. Sejak PostgreSQL 18, baris Buffers otomatis muncul di EXPLAIN ANALYZE.</li>
<li><code>Planning Time</code>: waktu menyusun rencana. <code>Execution Time</code>: waktu menjalankannya.</li></ul>
<p>Bandingkan dua contoh di bawah. Tanpa index, Seq Scan membaca seluruh 1.205 halaman tabel dan membuang 99.996 baris. Dengan index, hanya beberapa halaman yang dibaca. Di percobaan penulis, Execution Time tanpa index sekitar 6–33 milidetik, dengan index di bawah 2 milidetik. Angkamu akan berbeda dan berubah setiap kali dijalankan, jadi bandingkan besarnya saja.</p>
<p>Karena query benar-benar dijalankan, EXPLAIN ANALYZE pada INSERT, UPDATE, atau DELETE benar-benar mengubah data. Di server sungguhan, bungkus dalam transaksi lalu batalkan:</p>
<pre class="sql"><code>begin;
explain analyze update app.orders set status = 'cancelled' where order_id = 100001;
rollback;</code></pre>
<p>Di mesin latihan ini, perintah transaksi tidak bisa dipakai karena setiap jawaban sudah otomatis dibungkus transaksi yang dibatalkan.</p>`,
      examples: [
        { setup: BESAR, sql: "explain analyze\nselect *\nfrom latihan.pesanan_besar\nwhere customer_id = 4242;", note: "Lihat Rows Removed by Filter dan Buffers: seluruh tabel dibaca untuk mendapat 4 baris." },
        { setup: BESAR, sql: "create index pesanan_besar_customer_idx\n  on latihan.pesanan_besar (customer_id);\n\nexplain analyze\nselect *\nfrom latihan.pesanan_besar\nwhere customer_id = 4242;", note: "Hasilnya tetap 4 baris, tetapi jumlah halaman yang dibaca dan Execution Time jauh lebih kecil." },
      ],
    },
    {
      title: "PRIMARY KEY dan UNIQUE otomatis membuat index",
      html: `<p>PostgreSQL otomatis membuat index unik setiap kali tabel diberi PRIMARY KEY atau UNIQUE. Index unik menolak dua baris dengan nilai yang sama, dan sekaligus mempercepat pencarian. Daftar index ada di katalog <code>pg_indexes</code>, dengan kolom <code>indexname</code> (nama index) dan <code>indexdef</code> (perintah pembuatnya).</p>
<p>Di skema <code>app</code>, setiap tabel punya satu index dari primary key-nya. <code>app.products</code> punya satu index lagi dari UNIQUE pada <code>sku</code>. Tabel di skema <code>raw</code> tidak punya primary key, sehingga tidak punya index sama sekali.</p>`,
      examples: [
        { sql: "select indexname, indexdef\nfrom pg_indexes\nwhere schemaname = 'app' and tablename = 'products';", note: "products_pkey dibuat dari primary key product_id, products_sku_key dari UNIQUE pada sku. Keduanya tidak pernah dibuat dengan CREATE INDEX." },
        { setup: BESAR, sql: "explain\nselect *\nfrom latihan.pesanan_besar\nwhere order_id = 54321;", note: "Index Scan memakai pesanan_besar_pkey, index dari primary key order_id. Karena hasilnya satu baris, planner memilih Index Scan, bukan Bitmap." },
      ],
    },
    {
      title: "Statistik tabel, ANALYZE, dan selektivitas",
      html: `<p>Planner menebak jumlah baris (angka <code>rows</code> di EXPLAIN) dari <b>statistik tabel</b>: ringkasan isi tabel yang dikumpulkan perintah <code>ANALYZE</code>. Statistik itu antara lain jumlah baris dan halaman (kolom <code>reltuples</code> dan <code>relpages</code> di katalog <code>pg_class</code>), lalu per kolom di katalog <code>pg_stats</code>: <code>null_frac</code> (proporsi NULL), <code>n_distinct</code> (jumlah nilai berbeda; angka negatif berarti perbandingan terhadap jumlah baris, -1 artinya semua nilai berbeda), <code>most_common_vals</code> (nilai yang paling sering), dan <code>most_common_freqs</code> (proporsi setiap nilai itu).</p>
<p>Untuk tabel besar, ANALYZE hanya membaca contoh acak, sehingga angkanya perkiraan dan sedikit berubah setiap kali ANALYZE dijalankan. Di server biasa, proses latar belakang bernama autovacuum menjalankan ANALYZE secara otomatis. Setelah memuat banyak data sekaligus, jalankan ANALYZE sendiri; tanpa statistik yang baru, planner bisa memilih rencana yang buruk. Itulah sebabnya tabel latihan ditutup dengan <code>analyze latihan.pesanan_besar</code>.</p>
<p>Dari statistik, planner memperkirakan <b>selektivitas</b>: proporsi baris yang lolos sebuah syarat WHERE. Syarat <code>status = 'cancelled'</code> meloloskan 2% baris, jadi sangat selektif, dan index layak dipakai. Syarat <code>status = 'completed'</code> meloloskan sekitar 80% baris. Mengambil sebanyak itu lewat index berarti melompat ke hampir semua halaman tabel, ditambah membaca index-nya. Membaca tabel lurus dari awal lebih murah, sehingga planner memilih Seq Scan walaupun index-nya ada. Index tidak dipakai bukan berarti index-nya rusak.</p>`,
      examples: [
        { setup: BESAR, sql: "select attname, n_distinct, most_common_vals, most_common_freqs\nfrom pg_stats\nwhere schemaname = 'latihan' and tablename = 'pesanan_besar'\n  and attname in ('status', 'channel');", note: "Proporsi status mendekati angka sebenarnya (0,81; 0,13; 0,04; 0,02), tetapi tidak persis sama, dan berubah sedikit setiap kali contoh ini dijalankan karena ANALYZE memakai contoh acak." },
        { setup: BESAR, sql: "create index pesanan_besar_status_idx\n  on latihan.pesanan_besar (status);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere status = 'cancelled';", note: "2% baris: planner memakai index (Bitmap Index Scan)." },
        { setup: BESAR, sql: "create index pesanan_besar_status_idx\n  on latihan.pesanan_besar (status);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere status = 'completed';", note: "Sekitar 80% baris: index yang sama diabaikan, planner memilih Seq Scan." },
      ],
    },
    {
      title: "Syarat yang SARGable",
      html: `<p>Syarat WHERE yang bisa memakai index disebut <b>SARGable</b>. Syaratnya: kolom yang di-index berdiri sendiri di satu sisi perbandingan. Index pada <code>order_ts</code> menyimpan nilai <code>order_ts</code> apa adanya, bukan hasil <code>date_trunc('day', order_ts)</code> atau <code>order_ts::date</code>. Kalau kolomnya dibungkus fungsi atau diubah tipenya, PostgreSQL harus menghitung fungsi itu untuk setiap baris, jadi index pada kolom itu tidak bisa dipakai.</p>
<p>Ada dua cara memperbaikinya:</p>
<ol><li><b>Tulis ulang syaratnya</b> supaya kolomnya berdiri sendiri. "Pesanan tanggal 3 Maret 2025" ditulis sebagai rentang setengah terbuka: <code>order_ts &gt;= '2025-03-03' and order_ts &lt; '2025-03-04'</code>. Hasilnya sama, dan index bisa dipakai.</li>
<li><b>Buat index pada ekspresinya</b>, kalau ekspresi itu memang selalu dipakai. Untuk mencari email tanpa membedakan huruf besar dan kecil, query memakai <code>lower(email) = '…'</code>; buat index <code>on latihan.pesanan_besar (lower(email))</code>. Ekspresinya ditulis di dalam tanda kurung. Index seperti ini lebih mahal dirawat, karena ekspresinya dihitung ulang saat baris dimasukkan atau diubah.</li></ol>
<p>LIKE juga begitu. <code>email like 'Pelanggan4242@%'</code> (awalan tetap) bisa memakai index B-tree, karena semua nilai dengan awalan itu letaknya berdekatan di index. <code>email like '%4242@mail.example'</code> (diawali %) tidak bisa, karena awalannya tidak diketahui. Catatan: database di mesin latihan ini memakai aturan urutan teks "C", sehingga index biasa sudah cukup untuk LIKE dengan awalan. Di server yang memakai aturan urutan bahasa lain, index untuk LIKE perlu dibuat dengan kelas operator khusus: <code>create index … (email text_pattern_ops)</code>.</p>`,
      examples: [
        { setup: BESAR, sql: "create index pesanan_besar_order_ts_idx\n  on latihan.pesanan_besar (order_ts);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere date_trunc('day', order_ts) = timestamp '2025-03-03';", note: "Seq Scan, walaupun ada index pada order_ts. Perkiraan rows=500 juga meleset jauh dari 150, karena statistik hanya ada untuk kolom order_ts, bukan untuk hasil date_trunc." },
        { setup: BESAR, sql: "create index pesanan_besar_order_ts_idx\n  on latihan.pesanan_besar (order_ts);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere order_ts >= timestamp '2025-03-03'\n  and order_ts <  timestamp '2025-03-04';", note: "Syarat yang sama ditulis sebagai rentang: Index Scan memakai pesanan_besar_order_ts_idx, dan perkiraan rows mendekati 150." },
        { setup: BESAR, sql: "create index pesanan_besar_email_lower_idx\n  on latihan.pesanan_besar (lower(email));\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere lower(email) = 'pelanggan4242@mail.example';", note: "Index dibuat pada lower(email), jadi syarat lower(email) = … bisa memakai index." },
        { setup: BESAR, sql: "create index pesanan_besar_email_idx\n  on latihan.pesanan_besar (email);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere email like 'Pelanggan4242@%';", note: "Awalan tetap: Index Scan. Lihat Index Cond: PostgreSQL mengubah LIKE menjadi rentang email >= 'Pelanggan4242@' and email < 'Pelanggan4242A'." },
        { setup: BESAR, sql: "create index pesanan_besar_email_idx\n  on latihan.pesanan_besar (email);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere email like '%4242@mail.example';", note: "Diawali %: Seq Scan." },
      ],
    },
    {
      title: "Index komposit dan urutan kolom",
      html: `<p><b>Index komposit</b> adalah index atas beberapa kolom, misalnya <code>(customer_id, order_ts)</code>. Isinya diurutkan menurut kolom pertama, lalu di dalam nilai kolom pertama yang sama, menurut kolom kedua. Index seperti ini paling efektif kalau WHERE membatasi kolom paling kiri: syarat <code>=</code> pada kolom-kolom depan, ditambah syarat rentang pada kolom berikutnya. Contohnya "pesanan pelanggan 4242 sejak 1 Januari 2025".</p>
<p>Kalau WHERE hanya membatasi kolom kedua (<code>order_ts</code>), nilai yang dicari tersebar di seluruh index, satu kelompok untuk setiap customer_id. Di contoh kedua, planner memilih Seq Scan. Jadi urutan kolom penting: taruh di depan kolom yang paling sering dipakai dengan <code>=</code>.</p>
<p>Sejak PostgreSQL 18 ada <i>skip scan</i>: index komposit tetap bisa dipakai tanpa syarat pada kolom pertama, tetapi biasanya hanya kalau kolom pertama punya sedikit nilai berbeda. Dokumentasi PostgreSQL juga menyarankan index komposit dipakai seperlunya; index lebih dari tiga kolom jarang membantu.</p>`,
      examples: [
        { setup: BESAR, sql: "create index pesanan_besar_cust_ts_idx\n  on latihan.pesanan_besar (customer_id, order_ts);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere customer_id = 4242\n  and order_ts >= timestamp '2025-01-01';", note: "Kedua syarat masuk Index Cond: index langsung menuju customer_id 4242, lalu ke order_ts mulai 1 Januari 2025." },
        { setup: BESAR, sql: "create index pesanan_besar_cust_ts_idx\n  on latihan.pesanan_besar (customer_id, order_ts);\n\nexplain\nselect *\nfrom latihan.pesanan_besar\nwhere order_ts >= timestamp '2025-03-03'\n  and order_ts <  timestamp '2025-03-04';", note: "Tanpa syarat pada customer_id, index komposit ini tidak dipakai. Index pada order_ts saja (bagian sebelumnya) cocok untuk query ini." },
      ],
    },
    {
      title: "Harga sebuah index",
      html: `<p>Index tidak gratis. Setiap kali data berubah, misalnya saat INSERT atau UPDATE, PostgreSQL juga harus memperbarui setiap index di tabel itu. Index juga memakan ruang penyimpanan: index primary key <code>pesanan_besar_pkey</code> saja berisi 276 halaman, dibandingkan 1.205 halaman tabelnya.</p>
<p>Contoh di bawah memasukkan 20.000 pesanan baru dan mengukur waktunya dengan EXPLAIN ANALYZE, sekali hanya dengan index primary key, sekali dengan tiga index tambahan. Di percobaan penulis, yang pertama sekitar 45–120 milidetik dan yang kedua sekitar 385–440 milidetik.</p>
<p>Pegangan praktis:</p>
<ul><li>Buat index untuk query yang sering dan penting, lalu buktikan dengan EXPLAIN bahwa index itu dipakai. Index yang tidak dipakai hanya memperlambat perubahan data.</li>
<li>Saat mengisi tabel baru dengan banyak data, cara tercepat adalah mengisi datanya dulu, baru membuat index, lalu menjalankan ANALYZE. </li>
<li>Kalau query lambat padahal ada index, periksa dulu: apakah syaratnya SARGable, apakah syaratnya cukup selektif, dan apakah statistiknya baru.</li></ul>`,
      examples: [
        { setup: BESAR, sql: "explain analyze\ninsert into latihan.pesanan_besar\nselect 100000 + g, 1 + (g * 7919) % 25000,\n       timestamp '2025-10-29' + g * interval '4 seconds',\n       'web', 'processing', 100000,\n       'Pelanggan' || (1 + (g * 7919) % 25000) || '@mail.example'\nfrom generate_series(1, 20000) as g;", note: "Hanya index primary key yang perlu diperbarui." },
        { setup: BESAR, sql: "create index on latihan.pesanan_besar (customer_id);\ncreate index on latihan.pesanan_besar (order_ts);\ncreate index on latihan.pesanan_besar (lower(email));\n\nexplain analyze\ninsert into latihan.pesanan_besar\nselect 100000 + g, 1 + (g * 7919) % 25000,\n       timestamp '2025-10-29' + g * interval '4 seconds',\n       'web', 'processing', 100000,\n       'Pelanggan' || (1 + (g * 7919) % 25000) || '@mail.example'\nfrom generate_series(1, 20000) as g;", note: "Bandingkan Execution Time dan Buffers dengan contoh sebelumnya: empat index harus diperbarui untuk setiap baris baru." },
      ],
    },
  ],
  tsql: [
    { pg: "create view laporan.v as select …", tsql: "create view laporan.v as select …", note: "Di SQL Server, CREATE VIEW harus menjadi perintah pertama dalam satu <i>batch</i> (kelompok perintah yang dikirim sekaligus; pisahkan dengan GO). ORDER BY tidak boleh ada di dalam view kecuali bersama TOP." },
    { pg: "create or replace view laporan.v as …", tsql: "create or alter view laporan.v as …", note: "CREATE OR ALTER tersedia sejak SQL Server 2016 SP1. Di PostgreSQL, CREATE OR REPLACE hanya boleh menambah kolom di akhir." },
    { pg: "drop view if exists laporan.v", tsql: "drop view if exists laporan.v", note: "IF EXISTS tersedia sejak SQL Server 2016." },
    { pg: "create materialized view laporan.m as select …", tsql: "create view laporan.m with schemabinding as select …, count_big(*) as n … group by …;\ncreate unique clustered index ix_m on laporan.m (…);", note: "SQL Server tidak punya materialized view. Padanannya <i>indexed view</i>: view WITH SCHEMABINDING yang diberi unique clustered index, sehingga hasilnya disimpan. Syaratnya banyak, antara lain nama tabel dua bagian (skema.tabel) dan COUNT_BIG(*) kalau ada GROUP BY. Indexed view ikut diperbarui otomatis setiap kali tabel asalnya berubah, sehingga perubahan data bisa jauh lebih lambat. Di edisi Standard, query harus memakai petunjuk WITH (NOEXPAND) untuk membaca indexed view secara langsung." },
    { pg: "refresh materialized view laporan.m", tsql: "(tidak ada)", note: "Tidak diperlukan, karena indexed view diperbarui otomatis bersama tabel asalnya." },
    { pg: "create index ix on t (kolom)", tsql: "create [nonclustered] index ix on t (kolom)", note: "Tanpa kata CLUSTERED, SQL Server membuat <i>nonclustered index</i>: struktur terpisah dengan penunjuk ke baris tabel, seperti index PostgreSQL di bab ini. <i>Clustered index</i> menentukan urutan penyimpanan baris tabel itu sendiri, jadi hanya boleh satu per tabel. Tabel tanpa clustered index disebut <i>heap</i>." },
    { pg: "primary key, unique", tsql: "primary key, unique", note: "PRIMARY KEY otomatis membuat clustered index, kecuali tabel sudah punya clustered index (maka dibuat nonclustered). UNIQUE otomatis membuat nonclustered index." },
    { pg: "create index … (lower(email))", tsql: "alter table t add email_lower as lower(email);\ncreate index ix on t (email_lower);", note: "SQL Server tidak membuat index langsung pada ekspresi; buat dulu <i>computed column</i> (kolom hitungan) lalu index kolom itu. Perbandingan teks di SQL Server biasanya sudah tidak membedakan huruf besar/kecil (tergantung collation, lihat bab 2), jadi LOWER sering tidak diperlukan." },
    { pg: "explain select …", tsql: "Query → Display Estimated Execution Plan (SSMS), atau set showplan_xml on", note: "Query tidak dijalankan. Rencana tampil sebagai gambar di tab Execution Plan. Nama langkahnya berbeda: Table Scan (heap) atau Clustered Index Scan untuk membaca seluruh tabel, Index Seek atau Clustered Index Seek untuk mencari lewat index, Key Lookup atau RID Lookup untuk mengambil baris tabel." },
    { pg: "explain analyze select …", tsql: "Query → Include Actual Execution Plan (SSMS), atau set statistics xml on", note: "Query dijalankan, lalu rencana nyata ditampilkan setelah selesai." },
    { pg: "Buffers dan Execution Time di EXPLAIN ANALYZE", tsql: "set statistics io on; set statistics time on;", note: "STATISTICS IO menampilkan <i>logical reads</i> (halaman dibaca dari memori) dan <i>physical reads</i> (dari disk) per tabel. STATISTICS TIME menampilkan milidetik untuk parse, compile, dan eksekusi." },
    { pg: "analyze t", tsql: "update statistics t", note: "SQL Server memperbarui statistik secara otomatis sesuai kebutuhan; UPDATE STATISTICS atau sp_updatestats dipakai kalau perlu lebih sering." },
    { pg: "select * from pg_indexes where tablename = 't'", tsql: "exec sp_helpindex 't'", note: "" },
  ],
  summary: [
    "View adalah query bernama yang dijalankan ulang setiap kali dipakai; view tidak menyimpan data, jadi selalu terbaru.",
    "<code>CREATE OR REPLACE VIEW</code> hanya boleh menambah kolom di akhir; untuk perubahan lain, <code>DROP VIEW</code> lalu buat lagi.",
    "Materialized view menyimpan hasil query. Cepat dibaca, tetapi isinya tertinggal sampai dijalankan <code>REFRESH MATERIALIZED VIEW</code>.",
    "<code>EXPLAIN</code> menampilkan rencana eksekusi tanpa menjalankan query; cost dan rows adalah perkiraan, cost bukan milidetik.",
    "<code>EXPLAIN ANALYZE</code> menjalankan query dan menampilkan waktu nyata, baris nyata, dan halaman yang dibaca (Buffers).",
    "Index B-tree mempercepat pencarian dengan <code>=</code>, rentang, IN, IS NULL, dan LIKE berawalan tetap. PRIMARY KEY dan UNIQUE otomatis membuat index.",
    "Planner memakai index kalau syaratnya selektif. Syarat yang meloloskan sebagian besar baris lebih murah dikerjakan dengan Seq Scan.",
    "Jangan bungkus kolom ber-index dengan fungsi di WHERE. Tulis ulang sebagai rentang, atau buat index pada ekspresinya.",
    "Index komposit paling berguna kalau WHERE membatasi kolom paling kiri.",
    "Setiap index memperlambat INSERT dan UPDATE serta memakan ruang. Jalankan <code>ANALYZE</code> setelah memuat banyak data.",
  ],
  drills: [
    { id: "sql-13-01", kind: "choice", prompt: "Kamu membuat view <code>laporan.v1</code> dan materialized view <code>laporan.m1</code> dengan query yang sama atas <code>app.orders</code>. Setelah itu 10 pesanan baru masuk. Tanpa perintah tambahan apa pun, mana yang langsung memuat 10 pesanan baru itu?",
      options: ["Hanya laporan.v1", "Hanya laporan.m1", "Keduanya", "Tidak keduanya"], answer: 0,
      why: "View menjalankan ulang query-nya setiap kali dipakai, jadi selalu terbaru. Materialized view menyimpan hasil saat dibuat, dan baru berubah setelah REFRESH MATERIALIZED VIEW.", hint: "Mana yang menyimpan hasil, dan mana yang hanya menyimpan query?" },
    { id: "sql-13-02", kind: "choice", prompt: "Tabel punya index pada kolom <code>order_ts</code>. Syarat mana yang bisa memakai index itu untuk mencari pesanan tanggal 3 Maret 2025?",
      options: ["<code>where order_ts::date = date '2025-03-03'</code>", "<code>where date_trunc('day', order_ts) = timestamp '2025-03-03'</code>", "<code>where order_ts &gt;= timestamp '2025-03-03' and order_ts &lt; timestamp '2025-03-04'</code>", "<code>where extract(day from order_ts) = 3 and extract(month from order_ts) = 3</code>"], answer: 2,
      why: "Hanya pilihan C yang membiarkan order_ts berdiri sendiri (SARGable). Pilihan lain membungkus kolom dengan fungsi atau mengubah tipenya, sehingga index pada order_ts tidak bisa dipakai.", hint: "Index menyimpan nilai order_ts apa adanya." },
    { id: "sql-13-03", kind: "sql", prompt: "Dari katalog <code>pg_indexes</code>, tampilkan <code>indexname</code> semua index milik tabel <code>app.order_items</code>.",
      solution: "select indexname from pg_indexes where schemaname = 'app' and tablename = 'order_items'",
      why: "Hasilnya satu index, order_items_pkey, yang otomatis dibuat dari primary key gabungan (order_id, line_no).", hint: "Saring dengan schemaname dan tablename." },
    { id: "sql-13-04", kind: "sql", prompt: "Tampilkan <code>tablename</code> dan jumlah index setiap tabel di skema <code>app</code>, menurut katalog <code>pg_indexes</code>. Urutkan menurut <code>tablename</code>.",
      solution: "select tablename, count(*) as jumlah_index from pg_indexes where schemaname = 'app' group by tablename order by tablename", ordered: true,
      why: "Setiap tabel punya satu index dari primary key-nya; app.products punya dua karena sku juga UNIQUE. Tidak ada satu pun yang dibuat dengan CREATE INDEX.", hint: "group by tablename, lalu count(*)." },
    { id: "sql-13-05", kind: "sql", setup: VIEW_TOTALS, prompt: "View <code>laporan.order_totals</code> sudah dibuat otomatis untuk soal ini (sama dengan contoh di bagian view: <code>order_id</code>, <code>customer_id</code>, <code>order_ts</code>, <code>status</code>, <code>items_amount</code>). Tampilkan <code>order_id</code> dan <code>items_amount</code> untuk 5 pesanan dengan nilai barang terbesar, urut dari yang terbesar.",
      solution: "select order_id, items_amount from laporan.order_totals order by items_amount desc limit 5", ordered: true,
      why: "View dipakai di FROM persis seperti tabel. ORDER BY ... DESC lalu LIMIT 5.", hint: "order by items_amount desc limit 5" },
    { id: "sql-13-06", kind: "sql", level: "menengah", setup: VIEW_TOTALS, prompt: "Dengan view <code>laporan.order_totals</code> (sudah dibuat otomatis) dan tabel <code>app.customers</code>, tampilkan <code>segment</code> dan total <code>items_amount</code> semua pesanan untuk setiap segment pelanggan.",
      solution: "select c.segment, sum(t.items_amount) as total_items from laporan.order_totals t join app.customers c on c.customer_id = t.customer_id group by c.segment",
      why: "View bisa di-JOIN dengan tabel lain seperti tabel biasa.", hint: "JOIN view dengan app.customers lewat customer_id, lalu GROUP BY segment." },
    { id: "sql-13-07", kind: "sql", setup: BESAR, prompt: "Hitung selektivitas setiap status di <code>latihan.pesanan_besar</code>: tampilkan <code>status</code>, jumlah baris, dan persentasenya terhadap seluruh baris (dibulatkan 2 desimal). Urutkan dari jumlah terbanyak.",
      solution: "select status, count(*) as jumlah, round(100.0 * count(*) / (select count(*) from latihan.pesanan_besar), 2) as persen from latihan.pesanan_besar group by status order by jumlah desc", ordered: true,
      why: "completed 80,57%, processing 13,43%, returned 4%, cancelled 2%. Index pada status hanya layak dipakai untuk nilai yang selektif seperti cancelled.", hint: "Bagi count(*) per status dengan jumlah seluruh baris; pakai 100.0 supaya tidak terjadi pembagian bilangan bulat." },
    { id: "sql-13-08", kind: "build", setup: "create schema laporan;", prompt: "Skema <code>laporan</code> sudah ada. Buat view <code>laporan.pelanggan_pesanan</code> dengan dua kolom: <code>customer_id</code> dan <code>jumlah_pesanan</code> (jumlah pesanan pelanggan itu di <code>app.orders</code>). Pemeriksa akan membaca seluruh isi view-mu.",
      solution: "create view laporan.pelanggan_pesanan as select customer_id, count(*) as jumlah_pesanan from app.orders group by customer_id;",
      verify: "select customer_id, jumlah_pesanan from laporan.pelanggan_pesanan order by customer_id",
      why: "CREATE VIEW nama AS diikuti query SELECT biasa. Nama kolom view diambil dari nama kolom (atau alias) di SELECT.", hint: "create view laporan.pelanggan_pesanan as select … group by customer_id;" },
    { id: "sql-13-09", kind: "build", setup: VIEW_TOTALS, prompt: "View <code>laporan.order_totals</code> sudah ada (kolom <code>order_id</code>, <code>customer_id</code>, <code>order_ts</code>, <code>status</code>, <code>items_amount</code>, dari <code>app.orders</code> JOIN <code>app.order_items</code>). Dengan <code>CREATE OR REPLACE VIEW</code>, tambahkan kolom <code>line_count</code> (jumlah baris di <code>app.order_items</code> untuk pesanan itu) tanpa mengubah kolom yang sudah ada.",
      solution: "create or replace view laporan.order_totals as select o.order_id, o.customer_id, o.order_ts, o.status, sum(oi.qty * oi.unit_price - oi.discount) as items_amount, count(*) as line_count from app.orders o join app.order_items oi on oi.order_id = o.order_id group by o.order_id, o.customer_id, o.order_ts, o.status;",
      verify: "select order_id, status, items_amount, line_count from laporan.order_totals where order_id between 100001 and 100020 order by order_id",
      why: "Kolom baru harus diletakkan di akhir. Kalau line_count ditaruh di tengah, PostgreSQL menolak karena nama atau urutan kolom lama berubah.", hint: "Salin query view lama, tambahkan count(*) as line_count sebagai kolom terakhir." },
    { id: "sql-13-10", kind: "build", setup: "create schema laporan;", prompt: "Skema <code>laporan</code> sudah ada. Buat <b>materialized view</b> <code>laporan.pesanan_per_channel</code> dengan kolom <code>channel</code> dan <code>jumlah_pesanan</code> (jumlah pesanan per channel di <code>app.orders</code>). Pemeriksa membaca isinya dan memastikan objeknya benar-benar materialized view.",
      solution: "create materialized view laporan.pesanan_per_channel as select channel, count(*) as jumlah_pesanan from app.orders group by channel;",
      verify: "select m.channel, m.jumlah_pesanan, (select relkind::text from pg_class where oid = 'laporan.pesanan_per_channel'::regclass) as jenis_objek from laporan.pesanan_per_channel m order by m.channel",
      why: "CREATE MATERIALIZED VIEW menjalankan query-nya saat itu juga dan menyimpan hasilnya: android 5.426, ios 2.361, web 4.220.", hint: "create materialized view … as select channel, count(*) … group by channel;" },
    { id: "sql-13-11", kind: "fix", setup: MV_CHANNEL, prompt: "Materialized view <code>laporan.pesanan_per_channel</code> (kolom <code>channel</code>, <code>jumlah_pesanan</code>) dibuat dari <code>app.orders</code>. Sesudah itu, 3 pesanan baru lewat web masuk ke <code>app.orders</code>. Query laporan di bawah masih menunjukkan web 4.220. Perbaiki supaya laporannya memuat pesanan baru, tetap dengan membaca dari materialized view itu.",
      start: "select channel, jumlah_pesanan\nfrom laporan.pesanan_per_channel\norder by channel;",
      solution: "refresh materialized view laporan.pesanan_per_channel;\nselect channel, jumlah_pesanan from laporan.pesanan_per_channel order by channel;", ordered: true,
      why: "Materialized view tidak ikut berubah saat tabel asal berubah. REFRESH MATERIALIZED VIEW menjalankan ulang query-nya, sehingga web menjadi 4.223.", hint: "Isi materialized view perlu diperbarui sebelum dibaca." },
    { id: "sql-13-12", kind: "build", setup: BESAR, prompt: "Tabel <code>latihan.pesanan_besar</code> (100.000 baris, lihat bagian tabel latihan besar) sudah ada dan hanya punya index primary key. Query <code>select * from latihan.pesanan_besar where customer_id = 4242</code> masih memakai Seq Scan. Buat index yang membuat query itu bisa memakai index. Nama index bebas.",
      solution: "create index pesanan_besar_customer_idx on latihan.pesanan_besar (customer_id);",
      verify: "select coalesce(bool_or(indexdef ~ ' USING [a-z]+ \\(customer_id[ ,)]'), false) as ada_index_customer_id from pg_indexes where schemaname = 'latihan' and tablename = 'pesanan_besar'",
      why: "CREATE INDEX … ON latihan.pesanan_besar (customer_id) membuat index B-tree pada customer_id. Index komposit yang kolom pertamanya customer_id, misalnya (customer_id, order_ts), juga bisa dipakai query ini dan diterima. Pemeriksa membaca katalog pg_indexes (apakah ada index yang kolom pertamanya customer_id), bukan waktu query, karena waktu berbeda di setiap komputer.", hint: "create index nama on tabel (kolom);" },
    { id: "sql-13-13", kind: "build", level: "wawancara", setup: BESAR_TS, prompt: "Tabel <code>latihan.pesanan_besar</code> sudah punya index pada <code>order_ts</code>. Buat view <code>latihan.pesanan_3_maret</code> berisi semua kolom pesanan yang dibuat tanggal 3 Maret 2025 (pukul berapa pun), dengan syarat WHERE yang bisa memakai index itu. Pemeriksa menghitung baris view-mu dan menjalankan EXPLAIN untuk memastikan rencananya memakai index.",
      solution: "create view latihan.pesanan_3_maret as select * from latihan.pesanan_besar where order_ts >= timestamp '2025-03-03' and order_ts < timestamp '2025-03-04';",
      verify: `${RENCANA}\nselect (select count(*) from latihan.pesanan_3_maret) as jumlah_baris,\n       (select bool_or(p like '%Index%') from latihan.rencana('select * from latihan.pesanan_3_maret') as p) as pakai_index;`,
      why: "Rentang setengah terbuka membiarkan order_ts berdiri sendiri, jadi index bisa dipakai (150 baris). date_trunc('day', order_ts) atau order_ts::date memberi baris yang sama, tetapi rencananya Seq Scan.", hint: "Hindari fungsi pada order_ts. Pakai >= awal hari dan < awal hari berikutnya." },
    { id: "sql-13-14", kind: "build", setup: BESAR, prompt: "Aplikasi mencari pesanan berdasarkan email tanpa membedakan huruf besar dan kecil: <code>select * from latihan.pesanan_besar where lower(email) = 'pelanggan4242@mail.example'</code>. Tabelnya hanya punya index primary key. Buat index yang membuat query itu (tanpa diubah) bisa memakai index. Pemeriksa menjalankan EXPLAIN untuk query itu.",
      solution: "create index pesanan_besar_email_lower_idx on latihan.pesanan_besar (lower(email));",
      verify: `${RENCANA}\nselect (select count(*) from latihan.pesanan_besar where lower(email) = 'pelanggan4242@mail.example') as jumlah_baris,\n       (select bool_or(p like '%Index%') from latihan.rencana($q$select * from latihan.pesanan_besar where lower(email) = 'pelanggan4242@mail.example'$q$) as p) as pakai_index;`,
      why: "Index pada email menyimpan email apa adanya, bukan lower(email), jadi tidak bisa dipakai. Index pada ekspresi lower(email) cocok dengan syarat query.", hint: "Ekspresi di dalam index harus sama dengan ekspresi di WHERE." },
    { id: "sql-13-15", kind: "number", setup: BESAR, prompt: "Tabel <code>latihan.pesanan_besar</code> belum punya index pada <code>status</code>. Kalau kamu menjalankan <code>explain analyze select * from latihan.pesanan_besar where status = 'cancelled'</code>, berapa angka di baris <code>Rows Removed by Filter</code>?",
      answerSql: "select count(*) from latihan.pesanan_besar where status <> 'cancelled'",
      why: "Seq Scan membaca 100.000 baris dan hanya 2.000 yang berstatus cancelled, jadi 98.000 baris dibuang oleh Filter. Bisa dihitung langsung: select count(*) from latihan.pesanan_besar where status <> 'cancelled'.", hint: "Seq Scan membaca semua baris. Jumlah baris per status ada di contoh bagian tabel latihan besar." },
    { id: "sql-13-16", kind: "explain", level: "wawancara", prompt: "Rekanmu bilang: \"Query laporan ini lambat, padahal kolom <code>order_ts</code> sudah di-index: <code>select … from app.orders where date_trunc('month', order_ts) = '2025-10-01'</code>.\" Jelaskan kenapa index-nya tidak menolong, bagaimana kamu membuktikannya, dan dua cara memperbaikinya.",
      model: "Index pada order_ts menyimpan nilai order_ts apa adanya, sedangkan WHERE membandingkan hasil date_trunc('month', order_ts). Karena kolomnya dibungkus fungsi, syaratnya tidak SARGable dan PostgreSQL harus menghitung date_trunc untuk setiap baris dengan Seq Scan. Buktinya: jalankan EXPLAIN (atau EXPLAIN ANALYZE) dan lihat Seq Scan dengan Filter date_trunc, bukan Index Scan atau Bitmap Index Scan. Perbaikan pertama: tulis ulang sebagai rentang order_ts >= '2025-10-01' and order_ts < '2025-11-01', sehingga index yang ada bisa dipakai. Perbaikan kedua: kalau ekspresi itu memang selalu dipakai, buat index pada ekspresinya, create index … (date_trunc('month', order_ts)). Setelah itu cek lagi dengan EXPLAIN, dan pastikan statistiknya baru dengan ANALYZE. Kalau syaratnya meloloskan sebagian besar baris tabel, Seq Scan memang bisa jadi pilihan terbaik.",
      hint: "Apa yang disimpan index, dan apa yang dibandingkan WHERE?" },
  ],
};
