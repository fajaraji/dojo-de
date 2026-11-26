// Bab 5 Data Modeling: load bertahap (watermark, upsert dengan pemeriksaan versi, delete-insert per periode, backfill) yang aman diulang.
// Setiap latihan dijalankan di transaksi yang dibatalkan, jadi skema dw, etl, dan mart dibuat ulang di setup setiap contoh dan soal.

// Dimensi pelanggan SCD tipe 2, sama persis dengan hasil rujukan bab membangun dimensi.
const DIM_CUSTOMER = `create table dw.dim_customer (
  customer_sk integer generated always as identity primary key,
  customer_id integer not null,
  full_name text not null,
  city_id integer not null,
  city_name text not null,
  segment text not null,
  valid_from date not null,
  valid_to date not null,
  is_current boolean not null
);
insert into dw.dim_customer (customer_id, full_name, city_id, city_name, segment, valid_from, valid_to, is_current)
with potret as (
  select snapshot_date, customer_id, full_name, city_id, segment,
         lag(city_id) over (partition by customer_id order by snapshot_date) as kota_sebelumnya,
         lag(segment) over (partition by customer_id order by snapshot_date) as segmen_sebelumnya
  from raw.customer_snapshot
),
awal_versi as (
  select snapshot_date, customer_id, full_name, city_id, segment
  from potret
  where kota_sebelumnya is null or city_id <> kota_sebelumnya or segment <> segmen_sebelumnya
),
versi as (
  select a.*,
         row_number() over (partition by customer_id order by snapshot_date) as nomor_versi,
         lead(snapshot_date) over (partition by customer_id order by snapshot_date) as awal_berikutnya
  from awal_versi as a
)
select v.customer_id, v.full_name, v.city_id, ci.city_name, v.segment,
       case when v.nomor_versi = 1 then cu.signup_date else v.snapshot_date end,
       coalesce(v.awal_berikutnya - 1, date '9999-12-31'),
       v.awal_berikutnya is null
from versi as v
join app.cities as ci on ci.city_id = v.city_id
join app.customers as cu on cu.customer_id = v.customer_id
order by v.customer_id, v.snapshot_date;`;

// Tabel fakta pesanan (1 baris = 1 pesanan) dan muatan pertamanya dari app.orders.
const FACT_TABLE = `create table dw.fact_order (
  order_id          integer primary key,
  customer_sk       integer not null,
  order_date_key    integer not null,
  channel           text not null,
  status            text not null,
  shipping_fee      numeric(12,2) not null,
  source_updated_at timestamp not null
);`;
const FACT_FIRST_LOAD = `insert into dw.fact_order (order_id, customer_sk, order_date_key, channel, status, shipping_fee, source_updated_at)
select o.order_id, coalesce(d.customer_sk, -1), to_char(o.order_ts, 'YYYYMMDD')::integer,
       o.channel, o.status, o.shipping_fee, o.updated_at
from app.orders as o
left join dw.dim_customer as d
  on d.customer_id = o.customer_id
 and o.order_ts::date between d.valid_from and d.valid_to;`;
const WATERMARK_TABLE = `create table etl.load_watermark (
  table_name     text primary key,
  last_loaded_at timestamp not null
);
insert into etl.load_watermark (table_name, last_loaded_at)
select 'dw.fact_order', max(source_updated_at) from dw.fact_order;`;
const BASE = `create schema dw;\ncreate schema etl;\ncreate schema mart;\n${DIM_CUSTOMER}\n${FACT_TABLE}\n${FACT_FIRST_LOAD}\n${WATERMARK_TABLE}`;

// Pola 1: load bertahap dengan watermark (upsert, lalu geser watermark).
const LOAD_WM = `insert into dw.fact_order (order_id, customer_sk, order_date_key, channel, status, shipping_fee, source_updated_at)
select b.order_id, coalesce(d.customer_sk, -1), to_char(b.order_ts, 'YYYYMMDD')::integer,
       b.channel, b.status, b.shipping_fee, b.updated_at
from raw.orders_batch2 as b
left join dw.dim_customer as d
  on d.customer_id = b.customer_id
 and b.order_ts::date between d.valid_from and d.valid_to
where b.updated_at >= (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order')
on conflict (order_id) do update
set customer_sk       = excluded.customer_sk,
    order_date_key    = excluded.order_date_key,
    channel           = excluded.channel,
    status            = excluded.status,
    shipping_fee      = excluded.shipping_fee,
    source_updated_at = excluded.source_updated_at;

update etl.load_watermark
set last_loaded_at = (select max(source_updated_at) from dw.fact_order)
where table_name = 'dw.fact_order';`;
const AFTER_BATCH2 = `${BASE}\n${LOAD_WM}`;

// Mart harian dan pola 2: delete-insert satu bulan.
const MART_TABLE = `create table mart.orders_daily (
  order_date_key     integer not null,
  status             text not null,
  order_count        integer not null,
  shipping_fee_total numeric(14,2) not null,
  primary key (order_date_key, status)
);
insert into mart.orders_daily (order_date_key, status, order_count, shipping_fee_total)
select order_date_key, status, count(*), sum(shipping_fee)
from dw.fact_order
group by order_date_key, status;`;
// mart dibuat sebelum batch2 dimuat ke fakta: laporan Oktober masih versi lama
const MART_STALE = `${BASE}\n${MART_TABLE}\n${LOAD_WM}`;
const REFRESH_OCT = `delete from mart.orders_daily
where order_date_key between 20251001 and 20251031;

insert into mart.orders_daily (order_date_key, status, order_count, shipping_fee_total)
select order_date_key, status, count(*), sum(shipping_fee)
from dw.fact_order
where order_date_key between 20251001 and 20251031
group by order_date_key, status;`;

// Kiriman ketiga buatan bab ini: dua versi untuk 12 pesanan, 15 salinan lama, dan 5 pesanan baru.
const BATCH3 = `create table raw.orders_batch3 as
select b.order_id, b.customer_id, b.order_ts, b.channel, 'completed' as status, b.shipping_fee, b.voucher_code,
       b.updated_at + interval '1 day' as updated_at
from raw.orders_batch2 as b
join app.orders as o on o.order_id = b.order_id and o.status = 'processing'
union all
select b.order_id, b.customer_id, b.order_ts, b.channel, 'returned', b.shipping_fee, b.voucher_code,
       b.updated_at + interval '3 days'
from raw.orders_batch2 as b
join app.orders as o on o.order_id = b.order_id and o.status = 'processing'
union all
select o.order_id, o.customer_id, o.order_ts, o.channel, o.status, o.shipping_fee, o.voucher_code, o.updated_at
from app.orders as o
join raw.orders_batch2 as b on b.order_id = o.order_id and b.status = 'returned'
union all
select b.order_id + 5, b.customer_id, b.order_ts + interval '1 day', b.channel, 'processing', b.shipping_fee, b.voucher_code,
       b.updated_at + interval '1 day'
from raw.orders_batch2 as b
where b.order_id between 112293 and 112297;`;
const BATCH3_SETUP = `${AFTER_BATCH2}\n${BATCH3}`;

// Pola 3: MERGE dengan satu versi terbaru per pesanan dan pemeriksaan versi.
const MERGE_SOURCE = `(
  select v.order_id, coalesce(d.customer_sk, -1) as customer_sk,
         to_char(v.order_ts, 'YYYYMMDD')::integer as order_date_key,
         v.channel, v.status, v.shipping_fee, v.updated_at
  from (
    select b.*, row_number() over (partition by b.order_id order by b.updated_at desc) as urutan
    from raw.orders_batch3 as b
  ) as v
  left join dw.dim_customer as d
    on d.customer_id = v.customer_id
   and v.order_ts::date between d.valid_from and d.valid_to
  where v.urutan = 1
) as s`;
const MERGE_B3 = `merge into dw.fact_order as t
using ${MERGE_SOURCE}
on t.order_id = s.order_id
when matched and s.updated_at > t.source_updated_at then
  update set customer_sk = s.customer_sk, order_date_key = s.order_date_key, channel = s.channel,
             status = s.status, shipping_fee = s.shipping_fee, source_updated_at = s.updated_at
when not matched then
  insert (order_id, customer_sk, order_date_key, channel, status, shipping_fee, source_updated_at)
  values (s.order_id, s.customer_sk, s.order_date_key, s.channel, s.status, s.shipping_fee, s.updated_at);`;

// Pola 4: backfill Oktober 2025 dari gabungan app.orders dan batch2, versi terbaru per pesanan.
const BACKFILL_OCT = `delete from dw.fact_order
where order_date_key between 20251001 and 20251031;

insert into dw.fact_order (order_id, customer_sk, order_date_key, channel, status, shipping_fee, source_updated_at)
with semua_versi as (
  select order_id, customer_id, order_ts, channel, status, shipping_fee, updated_at from app.orders
  union all
  select order_id, customer_id, order_ts, channel, status, shipping_fee, updated_at from raw.orders_batch2
),
terbaru as (
  select *, row_number() over (partition by order_id order by updated_at desc) as urutan
  from semua_versi
  where order_ts >= '2025-10-01' and order_ts < '2025-11-01'
)
select v.order_id, coalesce(d.customer_sk, -1), to_char(v.order_ts, 'YYYYMMDD')::integer,
       v.channel, v.status, v.shipping_fee, v.updated_at
from terbaru as v
left join dw.dim_customer as d
  on d.customer_id = v.customer_id
 and v.order_ts::date between d.valid_from and d.valid_to
where v.urutan = 1;`;

// Verify: hanya dibaca mesin, tidak ditampilkan ke pengguna.
const VERIFY_FACT = `select status, count(*) as pesanan, sum(shipping_fee) as ongkir,
       sum(customer_sk) as total_sk, sum(order_date_key) as total_tanggal,
       count(*) filter (where customer_sk = -1) as tanpa_pelanggan,
       max(source_updated_at) as versi_terakhir,
       (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order') as watermark
from dw.fact_order
group by status`;
const VERIFY_MART = `select order_date_key / 100 as bulan, status, count(*) as baris,
       sum(order_count) as pesanan, sum(shipping_fee_total) as ongkir
from mart.orders_daily
group by order_date_key / 100, status`;

const LOOKUP = `left join dw.dim_customer as d
  on d.customer_id = b.customer_id
 and b.order_ts::date between d.valid_from and d.valid_to`;

export default {
  id: "model-05",
  part: "model",
  title: "Load bertahap & aman diulang",
  minutes: 100,
  goals: [
    "Membedakan load penuh dan load bertahap, serta memilih kapan memakai masing-masing.",
    "Mempelajari isi ekstrak susulan dengan query sebelum memuatnya: pesanan baru, koreksi, dan data terlambat.",
    "Memuat hanya baris yang baru atau berubah dengan tabel watermark, dan memilih kolom watermark yang tepat.",
    "Menerapkan koreksi dengan upsert (<code>ON CONFLICT</code> atau <code>MERGE</code>) yang hanya menimpa dengan versi yang lebih baru.",
    "Mengisi ulang satu periode dengan delete-insert, dan memuat ulang rentang lama (backfill) tanpa menggandakan baris.",
    "Membuktikan sebuah proses muat idempoten dengan menjalankannya dua kali.",
  ],
  terms: [
    { term: "pipeline", def: "Rangkaian langkah otomatis yang memindahkan data dari sumber ke tujuan, misalnya dari <code>raw</code> ke tabel fakta lalu ke mart, biasanya dijalankan terjadwal." },
    { term: "ekstrak", def: "Salinan data yang diambil dari sistem sumber pada satu waktu, lalu dikirim ke gudang data. <code>raw.orders_batch2</code> adalah satu ekstrak." },
    { term: "load penuh", def: "<i>Full load</i>: tabel tujuan dikosongkan, lalu diisi ulang dengan seluruh data sumber setiap kali proses muat dijalankan." },
    { term: "load bertahap", def: "<i>Incremental load</i>: setiap kali proses muat dijalankan, hanya baris yang baru atau berubah sejak pemuatan terakhir yang diambil, lalu ditambahkan atau diperbarui di tabel tujuan." },
    { term: "watermark", def: "Penanda sampai mana data sudah dimuat, biasanya nilai waktu perubahan terbesar yang sudah masuk. Disimpan di tabel tersendiri dan dibaca setiap kali proses muat berikutnya dijalankan." },
    { term: "idempoten", def: "Sifat proses muat yang aman diulang: dijalankan sekali, dua kali, atau setelah gagal di tengah, isi tabel tujuan akhirnya sama." },
    { term: "data terlambat", def: "<i>Late-arriving data</i>: baris yang tanggal kejadiannya sudah lewat, tetapi baru sampai di gudang data setelah periode itu dimuat atau dilaporkan." },
    { term: "upsert", def: "Gabungan <i>update</i> dan <i>insert</i>: tambahkan baris kalau kuncinya belum ada, ubah kalau sudah ada. Di PostgreSQL ditulis dengan <code>INSERT … ON CONFLICT … DO UPDATE</code> atau <code>MERGE</code>." },
    { term: "delete-insert", def: "Pola muat ulang satu periode: hapus semua baris periode itu di tabel tujuan, lalu isi lagi dari sumber, di dalam satu transaksi." },
    { term: "backfill", def: "Memuat ulang data untuk rentang waktu lama, misalnya setelah ada data terlambat atau setelah aturan pemuatan diperbaiki." },
  ],
  introduces: [],
  sections: [
    {
      title: "Load penuh dan load bertahap",
      html: `<p>Ada dua cara memuat data dari sumber ke gudang data. <b>Load penuh</b> (<i>full load</i>) mengosongkan tabel tujuan, lalu mengisinya lagi dengan seluruh data sumber. <b>Load bertahap</b> (<i>incremental load</i>) hanya mengambil baris yang baru atau berubah sejak pemuatan terakhir, lalu menambahkan atau memperbaruinya di tabel tujuan.</p>
<p>Load penuh sederhana dan hasilnya benar selama sumbernya lengkap. Kelemahannya ada pada ukuran: setiap kali dijalankan, seluruh riwayat dibaca ulang, padahal yang berubah hanya sedikit. Load penuh juga mustahil kalau sumbernya hanya mengirim perubahan. Ekstrak susulan TokoKita, <code>raw.orders_batch2</code>, adalah contohnya. <b>Ekstrak</b> adalah salinan data yang diambil dari sistem sumber pada satu waktu. Ekstrak ini hanya berisi 365 baris, sedangkan <code>app.orders</code> berisi 12.007 pesanan.</p>
<p>Load bertahap hemat, tetapi lebih banyak jebakannya. Bab ini membahas empat pola untuk menanganinya: watermark (penanda sampai mana data sudah dimuat), upsert dengan pemeriksaan versi (menimpa baris lama hanya dengan versi yang lebih baru), delete-insert per periode (hapus lalu isi ulang satu bulan), dan backfill (memuat ulang rentang waktu lama). Keempatnya dipakai di dalam <b>pipeline</b>, yaitu rangkaian langkah otomatis yang memindahkan data dari sumber ke tujuan, biasanya terjadwal.</p>
<p>Semua pola itu harus <b>idempoten</b>. Di bab mengubah data, idempoten berarti dijalankan sekali atau dua kali, hasil akhirnya sama. Di pipeline, artinya lebih luas: proses muat boleh diulang kapan saja, termasuk setelah gagal di tengah jalan atau saat jadwal tidak sengaja jalan dua kali, dan isi tabel tujuan tetap benar. Karena itu, setiap soal build di bab ini memintamu menulis perintah yang sama <b>dua kali</b> berturut-turut. Hasilnya harus sama dengan kalau dijalankan sekali.</p>`,
      examples: [{ sql: "select (select count(*) from app.orders) as pesanan_di_aplikasi,\n       (select count(*) from raw.orders_batch2) as baris_ekstrak_susulan;", note: "Load penuh membaca ulang 12.007 baris setiap kali; load bertahap cukup mengolah 365 baris ekstrak susulan." }],
    },
    {
      title: "Mengenal raw.orders_batch2 sebelum memuatnya",
      html: `<p>Sebelum menulis proses muat, pelajari dulu isi ekstraknya dengan query. Kolomnya sama dengan <code>app.orders</code>, tanpa <code>handled_by</code>. Menurut kamus data, <code>updated_at</code> adalah waktu baris itu terakhir berubah di sistem sumber. Tidak ada kolom yang mencatat kapan ekstrak diambil. Hasil query di bawah:</p>
<ul><li>365 baris dengan 365 nomor pesanan berbeda, jadi tidak ada nomor kembar di dalam ekstrak ini.</li>
<li>75 nomor sudah ada di <code>app.orders</code>. Kolom yang berbeda hanya <code>status</code> dan <code>updated_at</code>: 48 pesanan berubah dari shipped menjadi completed, 12 dari processing menjadi shipped, dan 15 dari completed menjadi returned. Baris seperti ini disebut koreksi: nomornya sama dengan baris yang sudah dimuat, isinya lebih baru.</li>
<li>290 nomor baru (112008 sampai 112297). Sebanyak 250 di antaranya dipesan 1 sampai 7 November 2025.</li>
<li>40 pesanan baru lainnya dipesan 25 sampai 29 Oktober 2025, padahal <code>app.orders</code> sudah berisi pesanan sampai 31 Oktober 2025 pukul 22:57:41. Inilah <b>data terlambat</b> (<i>late-arriving data</i>): tanggal kejadiannya sudah lewat, tetapi barisnya baru datang setelah periode itu dimuat.</li>
<li>Nilai <code>updated_at</code> berkisar dari 1 November 2025 pukul 00:47 sampai 8 November 2025 pukul 00:02, termasuk untuk 115 baris yang tanggal pesanannya Oktober.</li></ul>`,
      examples: [
        { sql: "select o.order_id is not null as sudah_ada,\n       o.status as status_lama, b.status as status_baru,\n       count(*) as baris\nfrom raw.orders_batch2 as b\nleft join app.orders as o on o.order_id = b.order_id\ngroup by o.order_id is not null, o.status, b.status\norder by sudah_ada, status_lama, status_baru;", note: "Baris dengan sudah_ada = true adalah koreksi status. Baris dengan sudah_ada = false adalah pesanan baru, sehingga status_lama-nya NULL." },
        { sql: "select o.order_id is not null as sudah_ada,\n       b.order_ts < '2025-11-01' as dipesan_oktober,\n       count(*) as baris,\n       min(b.order_ts) as pesanan_paling_awal, max(b.order_ts) as pesanan_paling_akhir,\n       min(b.updated_at) as berubah_paling_awal, max(b.updated_at) as berubah_paling_akhir\nfrom raw.orders_batch2 as b\nleft join app.orders as o on o.order_id = b.order_id\ngroup by o.order_id is not null, b.order_ts < '2025-11-01'\norder by sudah_ada, dipesan_oktober;", note: "Baris kedua adalah data terlambat: pesanan baru bertanggal Oktober, tetapi updated_at-nya November." },
      ],
    },
    {
      title: "Tabel-tabel di bab ini",
      html: `<p>Tabel fakta isi pesanan (satu baris per produk di dalam pesanan) butuh baris dari <code>app.order_items</code>, padahal batch2 tidak membawa isi pesanan: tidak ada satu pun baris di <code>app.order_items</code> untuk nomor di atas 112007. Karena itu bab ini memakai tabel fakta sendiri dengan grain satu baris per pesanan, <code>dw.fact_order</code>:</p>
<ul><li><code>order_id</code>: nomor pesanan, kunci utama (degenerate dimension).</li>
<li><code>customer_sk</code>: surrogate key versi pelanggan yang berlaku pada tanggal pesanan, dicari di <code>dw.dim_customer</code> (SCD tipe 2, sama dengan bab membangun dimensi). Kalau tidak ditemukan, diisi -1.</li>
<li><code>order_date_key</code>: tanggal pesanan berbentuk YYYYMMDD, sama dengan <code>date_key</code> di dimensi tanggal.</li>
<li><code>channel</code>, <code>status</code>, <code>shipping_fee</code>: disalin dari sumber.</li>
<li><code>source_updated_at</code>: nilai <code>updated_at</code> dari sumber. Kolom ini menunjukkan versi mana yang sedang tersimpan.</li></ul>
<p>Muatan pertamanya berasal dari <code>app.orders</code>. Tabel <code>etl.load_watermark</code> (skema <code>etl</code> untuk tabel catatan proses muat) menyimpan satu baris per tabel tujuan: <code>table_name</code> dan <code>last_loaded_at</code>. Isinya adalah <code>updated_at</code> terbesar yang sudah masuk, yaitu 31 Oktober 2025 pukul 23:20:33. Semua tabel ini dibuat otomatis sebelum contoh dan soal yang membutuhkannya.</p>`,
      examples: [{ setup: BASE, sql: "select w.table_name, w.last_loaded_at,\n       (select count(*) from dw.fact_order) as pesanan_di_fakta\nfrom etl.load_watermark as w;", note: "Fakta berisi 12.007 pesanan dari app.orders. Watermark menunjuk updated_at terbesar di antaranya." }],
    },
    {
      title: "Jebakan pertama: INSERT biasa dijalankan dua kali",
      html: `<p>INSERT biasa tidak idempoten. Di tabel tanpa primary key, menjalankannya dua kali menggandakan semua baris, tanpa pesan error apa pun. Contoh di bawah memasukkan batch2 dua kali ke tabel tanpa constraint: hasilnya 730 baris untuk 365 nomor pesanan. Semua total di laporan akan menjadi dua kali lipat.</p>
<p>Di tabel dengan primary key, masalahnya muncul lebih awal. Memasukkan batch2 ke <code>dw.fact_order</code> dengan INSERT biasa sudah gagal di percobaan pertama, karena 75 nomor koreksi sudah ada:</p>
<pre class="sql"><code>ERROR: duplicate key value violates unique constraint "fact_order_pkey"</code></pre>
<p>Primary key mencegah baris dobel, tetapi tidak menerapkan koreksinya. Yang dibutuhkan adalah upsert, yang dibahas di bagian berikutnya bersama watermark.</p>`,
      examples: [{ sql: "create schema latihan;\ncreate table latihan.pesanan_masuk as\nselect * from raw.orders_batch2 where false;\n\ninsert into latihan.pesanan_masuk select * from raw.orders_batch2;\ninsert into latihan.pesanan_masuk select * from raw.orders_batch2;\n\nselect count(*) as baris, count(distinct order_id) as nomor_pesanan\nfrom latihan.pesanan_masuk;", note: "<code>where false</code> membuat tabel dengan kolom yang sama tanpa satu baris pun. Dua INSERT yang sama menghasilkan 730 baris untuk 365 nomor." }],
    },
    {
      title: "Watermark: memuat hanya yang baru atau berubah",
      html: `<p><b>Watermark</b> adalah penanda sampai mana data sudah dimuat. Setiap kali dijalankan, proses muat bertahap melakukan empat langkah:</p>
<ol><li>Baca watermark dari <code>etl.load_watermark</code>.</li>
<li>Ambil baris sumber yang waktu perubahannya tidak lebih awal dari watermark.</li>
<li>Muat baris itu ke tabel tujuan dengan upsert: <code>INSERT … ON CONFLICT (order_id) DO UPDATE</code> dari bab mengubah data. Pesanan baru ditambahkan, koreksi menimpa baris lama.</li>
<li>Geser watermark ke waktu perubahan terbesar yang sekarang ada di tabel tujuan.</li></ol>
<p>Urutan langkah 3 dan 4 penting. Kalau watermark digeser lebih dulu lalu langkah 3 gagal, baris itu tidak akan pernah diambil lagi. Di produksi (database yang dipakai sungguhan, bukan latihan), kedua langkah dijalankan dalam satu transaksi.</p>
<p>Kolom mana yang dipakai sebagai watermark? Contoh pertama membandingkan tiga pilihan, masing-masing dengan nilai terbesar di <code>app.orders</code> sebagai watermark:</p>
<ul><li><code>order_ts</code> (tanggal pesanan) hanya meloloskan 250 baris. Sebanyak 115 baris terlewat: 75 koreksi untuk pesanan lama dan 40 data terlambat. Tanggal pesanan tidak berubah saat statusnya berubah, dan data terlambat justru bertanggal lama.</li>
<li><code>order_id</code> meloloskan 290 pesanan baru, termasuk yang terlambat, tetapi tetap melewatkan 75 koreksi.</li>
<li><code>updated_at</code> meloloskan semua 365 baris, karena setiap perubahan, termasuk baris yang terlambat masuk, mendapat waktu perubahan baru.</li></ul>
<p>Jadi watermark sebaiknya memakai waktu perubahan atau waktu ekstrak, bukan tanggal kejadian. Syaratnya, kolom itu benar-benar diisi ulang setiap kali baris berubah. Untuk batch2, kamus data menulis bahwa <code>updated_at</code> adalah waktu baris itu terakhir berubah di sistem sumber; untuk sumber lain, periksa dulu.</p>
<p>Contoh kedua menjalankan pola lengkapnya dua kali. Putaran kedua tidak mengubah apa-apa: watermark sudah 8 November 2025 pukul 00:02, jadi hanya baris dengan waktu itu yang terbaca ulang, dan upsert menimpanya dengan nilai yang sama.</p>`,
      examples: [
        { sql: "select count(*) filter (where order_ts > (select max(order_ts) from app.orders)) as lolos_order_ts,\n       count(*) filter (where order_id > (select max(order_id) from app.orders)) as lolos_order_id,\n       count(*) filter (where updated_at > (select max(updated_at) from app.orders)) as lolos_updated_at\nfrom raw.orders_batch2;", note: "Hanya updated_at yang menangkap koreksi dan data terlambat." },
        { setup: BASE, sql: `-- putaran 1\n${LOAD_WM}\n\n-- putaran 2, perintah yang sama persis\n${LOAD_WM}\n\nselect count(*) as pesanan,\n       count(*) filter (where status = 'returned') as returned,\n       (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order') as watermark\nfrom dw.fact_order;`, note: "12.297 pesanan (12.007 lama ditambah 290 baru), dan watermark bergeser ke 8 November 2025 pukul 00:02. Hasilnya sama kalau putaran kedua dihapus." },
      ],
    },
    {
      title: "Memilih > atau >= untuk watermark",
      html: `<p>Di batch2, banyak baris berbagi nilai <code>updated_at</code> yang sama: 37 nilai dipakai oleh lebih dari satu baris, total 98 baris. Contohnya, 5 baris tercatat tepat pada 1 November 2025 pukul 05:00:00.</p>
<p>Misalkan proses muat sebelumnya berhenti dengan watermark 05:00:00, dan salah satu dari lima baris itu baru tersimpan di sumber setelah ekstrak diambil. Dengan syarat <code>updated_at &gt; watermark</code>, baris itu tidak akan pernah terambil, karena waktunya tidak lebih besar dari watermark. Dengan <code>&gt;=</code>, baris pada waktu yang sama dengan watermark selalu dibaca ulang, sehingga tidak ada yang terlewat. Akibatnya, beberapa baris dimuat dua kali. Itu aman hanya kalau pemuatannya upsert, karena INSERT biasa akan menggandakannya.</p>
<p>Pilihan bab ini: <code>&gt;=</code> ditambah upsert. Waktu yang sama makin sering muncul kalau sumbernya mencatat waktu dengan pembulatan, seperti batch2 yang hanya sampai menit. Tipe <code>timestamp</code> di PostgreSQL sendiri menyimpan waktu sampai satu mikrodetik (sepersejuta detik).</p>`,
      examples: [{ sql: "select count(*) filter (where updated_at > timestamp '2025-11-01 05:00:00') as pakai_lebih_besar,\n       count(*) filter (where updated_at >= timestamp '2025-11-01 05:00:00') as pakai_lebih_besar_sama,\n       count(*) filter (where updated_at = timestamp '2025-11-01 05:00:00') as tepat_di_watermark\nfrom raw.orders_batch2;", note: "Selisih dua kolom pertama adalah 5 baris yang waktunya sama persis dengan watermark." }],
    },
    {
      title: "Koreksi: hanya timpa dengan versi yang lebih baru",
      html: `<p>Upsert biasa selalu menimpa baris lama. Itu berbahaya kalau sumber mengirim ulang versi lama, misalnya ekstrak yang diulang dari cadangan. Status returned bisa tertimpa lagi oleh completed. Pasang pemeriksaan versi: timpa hanya kalau waktu perubahan sumber lebih baru dari <code>source_updated_at</code> yang tersimpan.</p>
<ul><li>Dengan MERGE: <code>when matched and s.updated_at &gt; t.source_updated_at then update …</code>. Baris yang syaratnya tidak benar dilewati.</li>
<li>Dengan ON CONFLICT: <code>do update set … where dw.fact_order.source_updated_at &lt; excluded.source_updated_at</code>. Menurut dokumentasi PostgreSQL, hanya baris yang syarat WHERE-nya benar yang diubah.</li></ul>
<p>Jebakan kedua adalah <b>baris koreksi yang punya nomor sama di satu kiriman</b>. Kalau satu pesanan berubah dua kali sebelum ekstrak diambil, ekstraknya bisa membawa dua baris bernomor sama. MERGE dan ON CONFLICT DO UPDATE sama-sama menolaknya:</p>
<pre class="sql"><code>ERROR: MERGE command cannot affect row a second time</code></pre>
<p>Solusinya, ambil satu versi terbaru per nomor dulu dengan <code>row_number() over (partition by order_id order by updated_at desc)</code>, lalu pakai hanya baris bernomor urut 1.</p>
<p>Contoh di bawah memakai <code>raw.orders_batch3</code>, kiriman ketiga yang dibuat khusus untuk bab ini (bukan bagian data TokoKita), dan fakta yang sudah berisi batch2. Isinya 44 baris: 12 pesanan lama yang di batch2 berubah dari processing menjadi shipped, masing-masing dengan dua versi (completed sehari kemudian, lalu returned tiga hari kemudian); 15 salinan versi lama (completed) dari pesanan yang di batch2 sudah returned; dan 5 pesanan baru, 112298 sampai 112302. Hasilnya: 12 pesanan diubah menjadi returned, 5 pesanan ditambahkan, dan 15 salinan lama dilewati.</p>`,
      examples: [{ setup: BATCH3_SETUP, sql: `with hasil as (\n  ${MERGE_B3.replace(/;$/, "").replace(/\n/g, "\n  ")}\n  returning merge_action() as tindakan\n)\nselect tindakan, count(*) as baris\nfrom hasil\ngroup by tindakan\norder by tindakan;`, note: "Tidak ada baris DELETE, dan 15 salinan lama tidak muncul sama sekali karena tidak ada tindakan untuknya." }],
    },
    {
      title: "Urutan: dimensi dulu, baru fakta",
      html: `<p>Proses muat fakta mencari <code>customer_sk</code> di dimensi. Kalau fakta dimuat sebelum dimensi diperbarui, pelanggan baru belum punya baris di dimensi. JOIN biasa membuang pesanannya, dan LEFT JOIN dengan COALESCE memberinya kunci -1, kunci yang di bab membangun dimensi dipakai untuk unknown member. Pesanan itu lalu tercatat sebagai milik pelanggan tidak diketahui, sampai dimuat ulang.</p>
<p>Contoh di bawah meniru keadaan terburuk: dimensi pelanggan masih kosong saat batch2 dimuat. Semua 365 baris mendapat -1. Yang 75 bahkan merusak baris lama: kunci pelanggan yang tadinya benar ditimpa -1 oleh upsert. Di pipeline, jadwalkan langkah dimensi sebelum langkah fakta, dan jalankan langkah fakta hanya kalau langkah dimensi berhasil.</p>`,
      examples: [{ setup: BASE, sql: `delete from dw.dim_customer;  -- meniru dimensi yang belum dimuat\n\n${LOAD_WM}\n\nselect count(*) filter (where customer_sk = -1) as pesanan_tanpa_pelanggan\nfrom dw.fact_order;`, note: "Di setup, dimensi sudah terisi dan semua 12.007 pesanan lama punya kunci pelanggan. Setelah dimensi dikosongkan, 365 pesanan mendapat -1." }],
    },
    {
      title: "Delete-insert: mengisi ulang satu periode",
      html: `<p>Mart <code>mart.orders_daily</code> berisi jumlah pesanan (<code>order_count</code>) dan total ongkos kirim (<code>shipping_fee_total</code>) per tanggal pesanan (<code>order_date_key</code>) dan status, dengan primary key pada tanggal dan status. Laporan Oktober dibuat dari fakta sebelum batch2 masuk: 590 pesanan. Setelah batch2, fakta berisi 630 pesanan Oktober, dan status 75 di antaranya berubah. Inilah jebakan data terlambat: data jatuh ke periode yang sudah dilaporkan, sehingga laporan itu harus diperbarui, bukan hanya November yang ditambahkan.</p>
<p><b>Delete-insert</b> mengisi ulang satu periode: hapus semua baris Oktober di mart, lalu isi lagi dari fakta. Pola ini idempoten, karena putaran kedua menghapus persis apa yang dimasukkan putaran pertama. Upsert tidak cukup di sini, karena ada kombinasi yang harus hilang. Misalnya, 13 pesanan processing di Oktober tersebar di 2 tanggal. Setelah batch2, tinggal 1 pesanan processing di 1 tanggal, jadi satu baris mart harus hilang, padahal upsert tidak pernah menghapus baris.</p>
<p>Di produksi, DELETE dan INSERT wajib berada di satu transaksi:</p>
<pre class="sql"><code>begin;
delete from mart.orders_daily where order_date_key between 20251001 and 20251031;
insert into mart.orders_daily (…) select … where order_date_key between 20251001 and 20251031 group by …;
commit;</code></pre>
<p>Tanpa transaksi, orang yang membuka laporan di antara kedua perintah melihat Oktober kosong, dan kalau INSERT gagal, Oktober tetap kosong. Di dalam transaksi, menurut dokumentasi PostgreSQL, perubahan yang belum di-COMMIT tidak terlihat oleh transaksi lain, lalu terlihat bersamaan saat COMMIT. Kotak di atas hanya untuk dibaca; mesin latihan sudah membungkus setiap jawaban dalam transaksi.</p>`,
      examples: [{ setup: MART_STALE, sql: `-- putaran 1\n${REFRESH_OCT}\n\n-- putaran 2\n${REFRESH_OCT}\n\nselect status, sum(order_count) as pesanan_oktober, count(*) as baris_mart\nfrom mart.orders_daily\nwhere order_date_key between 20251001 and 20251031\ngroup by status\norder by status;`, note: "Di setup, mart dibuat sebelum batch2 masuk ke fakta. Setelah delete-insert, Oktober memakai angka terbaru: 630 pesanan, dan processing tinggal 1." }],
    },
    {
      title: "Backfill: memuat ulang rentang lama",
      html: `<p><b>Backfill</b> adalah memuat ulang data untuk rentang waktu lama, misalnya karena ada data terlambat, karena aturan pemuatan baru saja diperbaiki, atau karena tabel baru perlu diisi riwayatnya. Bedanya dengan load bertahap rutin: rentangnya ditentukan dengan tanggal, bukan dengan watermark.</p>
<p>Contoh: fakta baru berisi muatan pertama dari <code>app.orders</code>, dan kita ingin memperbaiki Oktober 2025 saja. Sumber kebenarannya gabungan <code>app.orders</code> dan batch2. Untuk setiap pesanan bertanggal Oktober, ambil versi dengan <code>updated_at</code> terbesar memakai ROW_NUMBER, lalu delete-insert rentang Oktober di fakta. Hasilnya 630 pesanan Oktober tanpa baris dobel, dan menjalankannya dua kali memberi hasil yang sama.</p>
<p>Backfill tidak mengubah watermark. Proses rutin berikutnya tetap membaca batch2 mulai 31 Oktober 2025 pukul 23:20:33, termasuk 115 baris Oktober yang baru saja dimuat. Itu aman, karena proses rutinnya upsert. Setelah backfill fakta, jangan lupa delete-insert periode yang sama di mart.</p>`,
      examples: [{ setup: BASE, sql: `-- putaran 1\n${BACKFILL_OCT}\n\n-- putaran 2\n${BACKFILL_OCT}\n\nselect count(*) filter (where order_date_key between 20251001 and 20251031) as pesanan_oktober,\n       count(*) filter (where order_date_key >= 20251101) as pesanan_november,\n       (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order') as watermark\nfrom dw.fact_order;`, note: "Pesanan November tidak ikut, karena di luar rentang backfill. Watermark tetap 31 Oktober 2025 pukul 23:20:33." }],
    },
  ],
  tsql: [
    { pg: "last_loaded_at timestamp", tsql: "last_loaded_at datetime2(7)", note: "datetime2 menyimpan waktu sampai 100 nanodetik, dengan 7 digit pecahan detik sebagai bawaan; timestamp di PostgreSQL sampai 1 mikrodetik. Hindari tipe datetime: nilainya dibulatkan ke kelipatan .000, .003, atau .007 detik, dan dokumentasi menyarankan tidak memakainya untuk pekerjaan baru. Kalau datetime dibandingkan dengan datetime2, dokumentasi menyarankan CAST ke datetime2 secara tertulis. Simpan watermark dengan tipe yang sama dengan kolom sumbernya." },
    { pg: "where b.updated_at >= (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order')", tsql: "where b.updated_at >= (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order')", note: "Pola watermark sama persis: baca watermark, ambil baris yang lebih baru, upsert, lalu geser watermark dengan UPDATE." },
    { pg: "insert … on conflict (order_id) do update set … where dw.fact_order.source_updated_at < excluded.source_updated_at", tsql: "merge dw.fact_order as t using (…) as s on t.order_id = s.order_id when matched and s.updated_at > t.source_updated_at then update set … when not matched by target then insert (…) values (…);", note: "SQL Server tidak punya ON CONFLICT; padanannya MERGE. MERGE wajib diakhiri titik koma; tanpa itu muncul error 10713. Boleh ada paling banyak dua WHEN MATCHED; kalau dua, yang pertama wajib memakai AND, dan satu harus UPDATE, satu lagi DELETE." },
    { pg: "row_number() over (partition by order_id order by updated_at desc) … where urutan = 1", tsql: "row_number() over (partition by order_id order by updated_at desc) … where urutan = 1", note: "Sama di kedua dialek. Di SQL Server, kalau lebih dari satu baris sumber cocok dengan satu baris tujuan saat UPDATE, MERGE juga ditolak dengan error, jadi buang versi lama lebih dulu." },
    { pg: "merge into dw.fact_order as t …", tsql: "merge dw.fact_order with (holdlock) as t …", note: "Di bagian tentang proses yang berjalan bersamaan, dokumentasi SQL Server menulis: dalam beberapa keadaan ketika MERGE diharapkan menambah sekaligus mengubah kunci unik, petunjuk (<i>hint</i>) HOLDLOCK mencegah pelanggaran kunci unik. HOLDLOCK sama dengan tingkat isolasi SERIALIZABLE (tingkat isolasi adalah aturan seberapa jauh transaksi yang berjalan bersamaan saling menahan), paling aman tetapi paling banyak menahan proses lain. Dokumentasi juga menyebut, kalau banyak proses berjalan bersamaan, INSERT, UPDATE, dan DELETE terpisah bisa lebih cepat daripada MERGE." },
    { pg: "begin; delete …; insert …; commit;", tsql: "set xact_abort on; begin transaction; delete …; insert …; commit transaction;", note: "Di PostgreSQL, setelah satu perintah gagal, perintah berikutnya di transaksi itu ditolak sampai transaksi ditutup dengan ROLLBACK (bab mengubah data). Di SQL Server, bawaannya XACT_ABORT OFF: dalam beberapa kasus hanya perintah yang gagal yang dibatalkan, lalu transaksi berlanjut, sehingga COMMIT bisa menyimpan DELETE tanpa INSERT. Dengan SET XACT_ABORT ON, error saat perintah berjalan membatalkan seluruh transaksi." },
    { pg: "returning merge_action()", tsql: "output $action", note: "$action bertipe nvarchar(10) dan berisi INSERT, UPDATE, atau DELETE untuk setiap baris yang diubah MERGE." },
    { pg: "(tidak ada padanan langsung)", tsql: "kolom bertipe rowversion", note: "rowversion adalah angka biner 8 byte yang dibuat otomatis dan naik setiap kali baris ditambah atau diubah. Nilainya bukan tanggal atau jam. Karena nilainya selalu naik, pola watermark yang sama bisa dipakai: muat baris yang rowversion-nya lebih besar dari nilai terakhir yang sudah dimuat. Di SQL Server, timestamp adalah nama lain rowversion yang sudah usang, dan berbeda dengan tipe timestamp di standar ISO yang dipakai PostgreSQL." },
  ],
  summary: [
    "Load penuh mengisi ulang semuanya; load bertahap hanya mengolah yang baru atau berubah. Load bertahap lebih hemat, tetapi harus dirancang supaya idempoten.",
    "Pelajari ekstrak dengan query sebelum memuatnya: berapa yang baru, berapa koreksi, berapa data terlambat, dan rentang waktunya.",
    "Watermark memakai waktu perubahan atau waktu ekstrak, bukan tanggal kejadian. Tanggal kejadian melewatkan koreksi dan data terlambat.",
    "Pakai <code>&gt;=</code> untuk watermark ditambah upsert, supaya baris dengan waktu yang sama tidak terlewat. Geser watermark setelah data masuk, di transaksi yang sama.",
    "Upsert koreksi hanya kalau versinya lebih baru, dan ambil satu versi terbaru per kunci sebelum MERGE atau ON CONFLICT.",
    "Muat dimensi sebelum fakta; kalau tidak, fakta menunjuk ke kunci -1.",
    "Delete-insert per periode (dalam satu transaksi) memperbarui laporan yang kena data terlambat. Backfill memuat ulang rentang lama berdasarkan tanggal, tanpa menyentuh watermark.",
    "Uji setiap proses muat dengan menjalankannya dua kali. Hasilnya harus sama.",
  ],
  drills: [
    { id: "model-05-01", kind: "choice", prompt: "Proses muat mana yang idempoten?",
      options: ["<code>insert into mart.orders_daily select … where order_date_key between 20251001 and 20251031 group by …</code>", "Hapus semua baris Oktober di <code>mart.orders_daily</code>, lalu isi lagi baris Oktober dari fakta, dalam satu transaksi", "<code>insert into dw.fact_order select … from raw.orders_batch2</code> pada tabel tanpa primary key", "Geser watermark lebih dulu, baru muat datanya, tanpa transaksi"], answer: 1,
      why: "Delete-insert per periode menghapus persis apa yang akan diisi ulang, jadi menjalankannya dua kali memberi isi yang sama. INSERT biasa menggandakan baris atau ditolak primary key, dan watermark yang digeser lebih dulu membuat data hilang kalau pemuatannya gagal.", hint: "Bayangkan setiap pilihan dijalankan dua kali berturut-turut." },
    { id: "model-05-02", kind: "choice", prompt: "Watermark terakhir 2025-11-01 05:00:00. Di sumber, ada baris dengan <code>updated_at</code> tepat 05:00:00 yang baru tersimpan setelah ekstrak sebelumnya diambil. Syarat mana yang memastikan baris itu terambil, dan apa syarat tambahannya?",
      options: ["<code>updated_at &gt; watermark</code>; tidak ada syarat tambahan", "<code>updated_at &gt;= watermark</code>; pemuatannya harus upsert, karena beberapa baris akan terbaca ulang", "<code>order_ts &gt;= watermark</code>; pemuatannya boleh INSERT biasa", "<code>updated_at &lt; watermark</code>; pemuatannya harus delete-insert"], answer: 1,
      why: "Dengan >, baris yang waktunya sama dengan watermark tidak pernah lolos. Dengan >=, baris itu terambil, tetapi baris lain di waktu yang sama ikut terbaca ulang, jadi pemuatannya harus upsert supaya tidak dobel.", hint: "Baris pada waktu yang sama persis dengan watermark: lolos di > atau di >=?" },
    { id: "model-05-03", kind: "choice", prompt: "Pipeline malam ini memuat <code>dw.fact_order</code> lebih dulu, baru <code>dw.dim_customer</code>. Hari ini ada pelanggan baru yang langsung memesan. Apa akibatnya pada pesanan itu, kalau pencarian kuncinya memakai LEFT JOIN dan <code>coalesce(d.customer_sk, -1)</code>?",
      options: ["Pesanannya ditolak primary key", "Pesanannya mendapat customer_sk -1, karena versi pelanggan belum ada di dimensi saat fakta dimuat", "Pesanannya otomatis diperbaiki saat dimensi dimuat", "Tidak ada akibat, urutan langkah tidak penting"], answer: 1,
      why: "Saat fakta dimuat, dimensi belum punya baris untuk pelanggan baru, jadi LEFT JOIN tidak menemukan pasangan dan COALESCE memberi -1. Kunci itu tidak berubah sendiri; perlu dimuat ulang. Jadwalkan dimensi sebelum fakta.", hint: "Apa isi dimensi pada saat fakta mencari kuncinya?" },
    { id: "model-05-04", kind: "sql", prompt: "Untuk setiap baris <code>raw.orders_batch2</code>, periksa apakah nomornya sudah ada di <code>app.orders</code>. Tampilkan dua kolom: penanda sudah ada (true atau false) dan jumlah baris.",
      solution: "select o.order_id is not null as sudah_ada, count(*) as baris from raw.orders_batch2 as b left join app.orders as o on o.order_id = b.order_id group by o.order_id is not null",
      why: "LEFT JOIN menjaga semua baris batch2; order_id dari app.orders bernilai NULL untuk pesanan baru. Hasilnya 75 sudah ada (koreksi) dan 290 baru.", hint: "left join app.orders, lalu group by o.order_id is not null." },
    { id: "model-05-05", kind: "sql", prompt: "Tampilkan data terlambat di <code>raw.orders_batch2</code>: pesanan yang nomornya belum ada di <code>app.orders</code> tetapi dipesan sebelum 1 November 2025. Kolomnya <code>order_id</code>, <code>order_ts</code>, dan <code>updated_at</code>.",
      solution: "select b.order_id, b.order_ts, b.updated_at from raw.orders_batch2 as b where not exists (select 1 from app.orders as o where o.order_id = b.order_id) and b.order_ts < '2025-11-01'",
      why: "NOT EXISTS memilih pesanan baru, dan syarat order_ts memilih yang bertanggal Oktober. Hasilnya 40 pesanan bertanggal 25 sampai 29 Oktober 2025, semuanya dengan updated_at di November.", hint: "Dua syarat: tidak ada di app.orders (NOT EXISTS), dan order_ts < '2025-11-01'." },
    { id: "model-05-06", kind: "sql", prompt: "Untuk semua pesanan di <code>raw.orders_batch2</code> yang nomornya sudah ada di <code>app.orders</code>, tampilkan <code>order_id</code>, status lama (dari <code>app.orders</code>), dan status baru (dari batch2).",
      solution: "select b.order_id, o.status as status_lama, b.status as status_baru from raw.orders_batch2 as b join app.orders as o on o.order_id = b.order_id",
      why: "JOIN biasa hanya menyisakan nomor yang ada di kedua tabel: 75 koreksi. Semuanya berbeda status, dan kolom lain selain updated_at tidak berubah.", hint: "join app.orders as o on o.order_id = b.order_id" },
    { id: "model-05-07", kind: "sql", prompt: "Tampilkan setiap nilai <code>updated_at</code> di <code>raw.orders_batch2</code> yang dipakai lebih dari satu baris, beserta jumlah barisnya.",
      solution: "select updated_at, count(*) as baris from raw.orders_batch2 group by updated_at having count(*) > 1",
      why: "GROUP BY updated_at dengan HAVING count(*) > 1 menemukan 37 nilai yang dipakai 98 baris. Nilai-nilai inilah yang membuat pilihan > atau >= di watermark menjadi penting.", hint: "group by updated_at having count(*) > 1" },
    { id: "model-05-08", kind: "sql", level: "menengah", prompt: "Gabungkan semua versi pesanan dari <code>app.orders</code> dan <code>raw.orders_batch2</code> (kolom <code>order_id</code>, <code>order_ts</code>, <code>status</code>, <code>updated_at</code>). Untuk setiap pesanan yang dipesan di Oktober 2025, ambil satu versi dengan <code>updated_at</code> terbesar. Tampilkan jumlah pesanan per <code>status</code>.",
      solution: "with semua_versi as (select order_id, order_ts, status, updated_at from app.orders union all select order_id, order_ts, status, updated_at from raw.orders_batch2), terbaru as (select order_id, status, row_number() over (partition by order_id order by updated_at desc) as urutan from semua_versi where order_ts >= '2025-10-01' and order_ts < '2025-11-01') select status, count(*) as pesanan from terbaru where urutan = 1 group by status",
      why: "UNION ALL menjaga kedua versi setiap koreksi, lalu ROW_NUMBER per order_id yang diurutkan dari updated_at terbesar memilih versi terbaru. Totalnya 630 pesanan Oktober. Inilah sumber untuk backfill Oktober.", hint: "CTE semua_versi dengan UNION ALL, CTE terbaru dengan row_number() over (partition by order_id order by updated_at desc), lalu ambil urutan = 1." },
    { id: "model-05-09", kind: "build", setup: BASE,
      prompt: `Tabel <code>dw.fact_order</code> (kunci utama <code>order_id</code>; kolom <code>customer_sk</code>, <code>order_date_key</code>, <code>channel</code>, <code>status</code>, <code>shipping_fee</code>, <code>source_updated_at</code>), <code>dw.dim_customer</code>, dan <code>etl.load_watermark</code> (baris <code>table_name = 'dw.fact_order'</code>) sudah dibuat otomatis dan berisi muatan pertama dari <code>app.orders</code>. Tulis load bertahap dengan watermark:
<ol><li>Ambil baris <code>raw.orders_batch2</code> yang <code>updated_at</code>-nya lebih besar dari atau sama dengan watermark.</li>
<li>Upsert ke <code>dw.fact_order</code>: <code>customer_sk</code> dari versi <code>dw.dim_customer</code> yang berlaku pada tanggal pesanan (-1 kalau tidak ada), <code>order_date_key</code> berbentuk YYYYMMDD, <code>source_updated_at</code> dari <code>updated_at</code>, dan kolom lain disalin.</li>
<li>Geser watermark ke <code>source_updated_at</code> terbesar di <code>dw.fact_order</code>.</li></ol>
Tulis semuanya <b>dua kali</b> berturut-turut. Hasil akhirnya harus sama dengan kalau dijalankan sekali.`,
      solution: `${LOAD_WM}\n\n${LOAD_WM}`, verify: VERIFY_FACT,
      why: "INSERT … SELECT … ON CONFLICT (order_id) DO UPDATE menambah 290 pesanan dan menimpa 75 koreksi. Watermark bergeser ke 2025-11-08 00:02:00. Di putaran kedua hanya baris pada waktu itu yang terbaca ulang, dan upsert menimpanya dengan nilai yang sama. Pemeriksa membandingkan jumlah pesanan, ongkos kirim, kunci, dan watermark per status.",
      hint: `insert into dw.fact_order (…) select … from raw.orders_batch2 as b ${LOOKUP.replace(/\n\s*/g, " ")} where b.updated_at >= (select last_loaded_at from etl.load_watermark where …) on conflict (order_id) do update set …; lalu update etl.load_watermark set last_loaded_at = (select max(source_updated_at) from dw.fact_order) where …;` },
    { id: "model-05-10", kind: "build", level: "menengah", setup: BATCH3_SETUP,
      prompt: "Tabel <code>dw.fact_order</code> (kolom sama dengan soal sebelumnya) sudah berisi <code>app.orders</code> dan batch2. Tabel <code>raw.orders_batch3</code> (kolom sama dengan <code>raw.orders_batch2</code>, dibuat otomatis untuk soal ini) berisi 44 baris: sebagian pesanan muncul dua kali dengan versi berbeda, sebagian adalah salinan versi lama, dan ada 5 pesanan baru. Dengan satu MERGE ke <code>dw.fact_order</code>: pakai hanya versi dengan <code>updated_at</code> terbesar per <code>order_id</code>; ubah baris yang sudah ada hanya kalau <code>updated_at</code> sumber lebih baru dari <code>source_updated_at</code>; tambahkan pesanan yang belum ada. Cari <code>customer_sk</code> seperti soal sebelumnya. Tulis MERGE-nya <b>dua kali</b> berturut-turut.",
      solution: `${MERGE_B3}\n\n${MERGE_B3}`, verify: VERIFY_FACT,
      why: "ROW_NUMBER di sumber MERGE membuang versi lama, sehingga tidak ada baris tujuan yang cocok dengan dua baris sumber. Syarat AND s.updated_at > t.source_updated_at melewatkan 15 salinan lama, sehingga status returned tidak tertimpa completed. Di putaran kedua semua baris sudah cocok dan tidak ada yang lebih baru, jadi tidak ada yang berubah.",
      hint: "merge into dw.fact_order as t using (select … from (select b.*, row_number() over (partition by b.order_id order by b.updated_at desc) as urutan from raw.orders_batch3 as b) as v left join dw.dim_customer … where v.urutan = 1) as s on t.order_id = s.order_id when matched and s.updated_at > t.source_updated_at then update set … when not matched then insert (…) values (…);" },
    { id: "model-05-11", kind: "build", setup: MART_STALE,
      prompt: "Tabel <code>mart.orders_daily</code> (kolom <code>order_date_key</code>, <code>status</code>, <code>order_count</code> = jumlah pesanan, <code>shipping_fee_total</code> = total ongkos kirim; kunci utama <code>order_date_key</code> dan <code>status</code>) dibuat dari <code>dw.fact_order</code> sebelum batch2 masuk. Sekarang <code>dw.fact_order</code> sudah berisi batch2. Perbarui baris Oktober 2025 saja (<code>order_date_key</code> 20251001 sampai 20251031) dengan delete-insert dari <code>dw.fact_order</code>. Baris di luar Oktober tidak boleh berubah. Tulis kedua perintahnya <b>dua kali</b> berturut-turut.",
      solution: `${REFRESH_OCT}\n\n${REFRESH_OCT}`, verify: VERIFY_MART,
      why: "DELETE menghapus semua baris Oktober, termasuk kombinasi tanggal dan status yang sekarang sudah tidak ada, lalu INSERT … SELECT … GROUP BY mengisinya dari fakta terbaru. Putaran kedua menghapus dan mengisi ulang baris yang sama. Pesanan November tidak dimasukkan, karena tidak diminta.",
      hint: "delete from mart.orders_daily where order_date_key between 20251001 and 20251031; lalu insert into mart.orders_daily (…) select order_date_key, status, count(*), sum(shipping_fee) from dw.fact_order where … group by …;" },
    { id: "model-05-12", kind: "build", level: "menengah", setup: BASE,
      prompt: "Tabel <code>dw.fact_order</code> baru berisi muatan pertama dari <code>app.orders</code>. Lakukan backfill Oktober 2025: untuk setiap pesanan yang <code>order_ts</code>-nya di Oktober 2025, ambil versi dengan <code>updated_at</code> terbesar dari gabungan <code>app.orders</code> dan <code>raw.orders_batch2</code>, lalu ganti semua baris Oktober di <code>dw.fact_order</code> dengan versi-versi itu (kolom diisi seperti soal watermark). Jangan ubah <code>etl.load_watermark</code>, dan jangan muat pesanan November. Tulis backfill-nya <b>dua kali</b> berturut-turut.",
      solution: `${BACKFILL_OCT}\n\n${BACKFILL_OCT}`, verify: VERIFY_FACT,
      why: "DELETE rentang Oktober lalu INSERT versi terbaru per pesanan membuat 630 pesanan Oktober tanpa baris dobel; putaran kedua menghapus dan mengisi ulang baris yang sama. Watermark tetap 2025-10-31 23:20:33, karena backfill ditentukan dengan rentang tanggal, bukan dengan watermark. Upsert dari sumber yang sama juga benar.",
      hint: "delete from dw.fact_order where order_date_key between 20251001 and 20251031; lalu insert into dw.fact_order (…) with semua_versi as (… union all …), terbaru as (… row_number() …) select … from terbaru as v left join dw.dim_customer … where v.urutan = 1;" },
    { id: "model-05-13", kind: "fix", setup: BASE,
      prompt: "Load bertahap ini seharusnya memuat semua baris baru dan berubah dari <code>raw.orders_batch2</code> ke <code>dw.fact_order</code>, lalu menampilkan jumlah pesanan Oktober 2025 per status. Ternyata koreksi status dan data terlambat bulan Oktober tidak masuk. Perbaiki.",
      start: `insert into dw.fact_order (order_id, customer_sk, order_date_key, channel, status, shipping_fee, source_updated_at)\nselect b.order_id, coalesce(d.customer_sk, -1), to_char(b.order_ts, 'YYYYMMDD')::integer,\n       b.channel, b.status, b.shipping_fee, b.updated_at\nfrom raw.orders_batch2 as b\n${LOOKUP}\nwhere b.order_ts >= (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order')\non conflict (order_id) do update\nset status = excluded.status, source_updated_at = excluded.source_updated_at;\n\nselect status, count(*) as pesanan\nfrom dw.fact_order\nwhere order_date_key between 20251001 and 20251031\ngroup by status\norder by status;`,
      solution: `insert into dw.fact_order (order_id, customer_sk, order_date_key, channel, status, shipping_fee, source_updated_at)\nselect b.order_id, coalesce(d.customer_sk, -1), to_char(b.order_ts, 'YYYYMMDD')::integer,\n       b.channel, b.status, b.shipping_fee, b.updated_at\nfrom raw.orders_batch2 as b\n${LOOKUP}\nwhere b.updated_at >= (select last_loaded_at from etl.load_watermark where table_name = 'dw.fact_order')\non conflict (order_id) do update\nset status = excluded.status, source_updated_at = excluded.source_updated_at;\n\nselect status, count(*) as pesanan\nfrom dw.fact_order\nwhere order_date_key between 20251001 and 20251031\ngroup by status\norder by status;`,
      why: "Watermark diisi dari updated_at, tetapi syaratnya membandingkannya dengan order_ts. Tanggal pesanan 75 koreksi dan 40 data terlambat semuanya sebelum watermark, jadi 115 baris itu terlewat. Bandingkan updated_at dengan watermark.", hint: "Kolom sumber mana yang berisi waktu perubahan, dan kolom mana yang berisi tanggal pesanan?" },
    { id: "model-05-14", kind: "number", prompt: "Setelah data terlambat dari <code>raw.orders_batch2</code> ikut dihitung, berapa pesanan berbeda yang dipesan di bulan Oktober 2025 (dari <code>app.orders</code> dan <code>raw.orders_batch2</code>)?",
      answerSql: "select count(*) from (select order_id from app.orders where order_ts >= '2025-10-01' and order_ts < '2025-11-01' union select order_id from raw.orders_batch2 where order_ts >= '2025-10-01' and order_ts < '2025-11-01') as x",
      why: "UNION membuang nomor yang muncul di kedua tabel (75 koreksi), jadi setiap pesanan dihitung sekali: select count(*) from (select order_id from app.orders where order_ts >= '2025-10-01' and order_ts < '2025-11-01' union select order_id from raw.orders_batch2 where order_ts >= '2025-10-01' and order_ts < '2025-11-01') as x. Hasilnya 590 pesanan lama ditambah 40 data terlambat.", hint: "Gabungkan nomor pesanan Oktober dari kedua tabel dengan UNION (bukan UNION ALL), lalu hitung." },
    { id: "model-05-15", kind: "explain", level: "wawancara", prompt: "Pertanyaan wawancara: bagaimana kamu memastikan pipeline load bertahap aman diulang? Bahas watermark, koreksi, data terlambat, dan apa yang terjadi kalau proses gagal di tengah jalan.",
      model: "Saya menguji setiap langkah dengan menjalankannya dua kali dan membandingkan hasilnya. Watermark saya simpan di tabel sendiri, berisi waktu perubahan terbesar yang sudah dimuat, bukan tanggal kejadian, karena tanggal kejadian melewatkan koreksi dan data terlambat. Syaratnya >= supaya baris dengan waktu yang sama tidak terlewat, dan karena itu pemuatannya upsert (MERGE atau ON CONFLICT DO UPDATE) dengan kunci yang dijaga primary key, supaya baris yang terbaca ulang tidak dobel. Koreksi hanya menimpa kalau versinya lebih baru, dan sebelum MERGE saya ambil satu versi terbaru per kunci. Muat data dan geser watermark terjadi dalam satu transaksi, jadi kalau gagal di tengah, semuanya batal dan watermark tidak maju. Mart per periode saya isi ulang dengan delete-insert dalam satu transaksi, sehingga data terlambat yang jatuh ke bulan lalu ikut memperbarui laporannya. Untuk memperbaiki rentang lama, saya backfill berdasarkan rentang tanggal tanpa menyentuh watermark. Terakhir, dimensi dimuat sebelum fakta supaya fakta tidak menunjuk ke kunci -1.",
      hint: "Sebut kolom watermark, > atau >=, upsert dengan pemeriksaan versi, transaksi, delete-insert, backfill, dan urutan dimensi-fakta." },
  ],
};
