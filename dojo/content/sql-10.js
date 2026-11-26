// Bab 10 SQL: frame (bingkai jendela), ROWS dan RANGE, FIRST_VALUE, LAST_VALUE, NTILE, rata-rata bergerak, gaps & islands, dan sesi kunjungan.
export default {
  id: "sql-10",
  part: "sql",
  title: "Window function 2",
  minutes: 90,
  goals: [
    "Menentukan baris mana yang ikut dihitung sebuah window function dengan <code>ROWS BETWEEN … PRECEDING / FOLLOWING / CURRENT ROW</code>.",
    "Menjelaskan frame bawaan, dan membuktikan beda <code>ROWS</code> dan <code>RANGE</code> saat ada nilai urutan yang sama.",
    "Mengambil nilai baris pertama dan terakhir dengan <code>FIRST_VALUE</code> dan <code>LAST_VALUE</code>, tanpa terjebak frame bawaan.",
    "Menghitung rata-rata bergerak 7 hari yang tetap benar walaupun ada hari tanpa data.",
    "Membagi pelanggan ke beberapa kelompok sama besar dengan <code>NTILE</code>.",
    "Menyelesaikan dua soal wawancara klasik: rentang hari berturut-turut (gaps &amp; islands) dan sesi kunjungan.",
  ],
  terms: [
    { term: "frame", def: "Bingkai jendela: kumpulan baris di dalam partisi yang dipakai window function untuk menghitung hasil di baris sekarang. Ditulis dengan ROWS atau RANGE di dalam OVER." },
    { term: "frame bawaan", def: "Frame yang dipakai kalau OVER berisi ORDER BY tetapi tidak menulis ROWS atau RANGE: <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>, yaitu dari baris pertama partisi sampai baris terakhir yang setara dengan baris sekarang." },
    { term: "baris setara", def: "Baris-baris yang nilai ORDER BY-nya seri (sama persis), sehingga urutannya satu sama lain tidak ditentukan. Dalam bahasa Inggris disebut <i>peer</i>." },
    { term: "rata-rata bergerak", def: "Rata-rata dari sejumlah periode terakhir (misalnya 7 hari) yang dihitung ulang di setiap baris, sehingga jendelanya ikut bergeser. Dalam bahasa Inggris disebut <i>moving average</i>." },
    { term: "gaps & islands", def: "Pola mencari rentang nilai yang berurutan tanpa putus (pulau, <i>islands</i>) dan celah di antaranya (<i>gaps</i>), misalnya hari-hari berturut-turut seorang pelanggan aktif." },
    { term: "sesi kunjungan", def: "Kumpulan aktivitas seorang pengguna yang jedanya berdekatan, dianggap satu kali kunjungan. Proses membaginya disebut <i>sessionization</i>." },
  ],
  introduces: ["ROWS BETWEEN", "ROWS", "PRECEDING", "FOLLOWING", "UNBOUNDED PRECEDING", "UNBOUNDED FOLLOWING", "CURRENT ROW", "RANGE", "RANGE BETWEEN", "FIRST_VALUE()", "LAST_VALUE()", "NTILE()"],
  sections: [
    {
      title: "Frame: baris mana yang ikut dihitung",
      html: `<p>Di bab sebelumnya, window function menghitung dari satu partisi (kelompok baris yang dibentuk PARTITION BY). <b>Frame</b> (bingkai jendela) membatasi lagi baris yang dipakai, misalnya hanya baris di sekitar baris sekarang. Frame ditulis di akhir OVER, setelah ORDER BY:</p>
<pre class="sql"><code>sum(pesanan) over (order by tanggal rows between 2 preceding and current row)</code></pre>
<p>Arti setiap kata:</p>
<ul><li><code>ROWS</code>: batas frame dihitung dalam jumlah baris.</li>
<li><code>BETWEEN awal AND akhir</code>: frame dimulai di awal dan berakhir di akhir.</li>
<li><code>n PRECEDING</code>: n baris sebelum baris sekarang. <i>Preceding</i> berarti "yang mendahului".</li>
<li><code>n FOLLOWING</code>: n baris sesudah baris sekarang. <i>Following</i> berarti "yang mengikuti".</li>
<li><code>CURRENT ROW</code>: baris sekarang.</li>
<li><code>UNBOUNDED PRECEDING</code>: baris pertama partisi; <code>UNBOUNDED FOLLOWING</code>: baris terakhir partisi. <i>Unbounded</i> berarti "tanpa batas".</li></ul>
<p>Awal frame tidak boleh berada setelah akhirnya. Kalau bagian akhir tidak ditulis, PostgreSQL memakai CURRENT ROW, sehingga <code>rows 6 preceding</code> sama dengan <code>rows between 6 preceding and current row</code>.</p>
<p>Frame hanya dipakai oleh fungsi agregat (SUM, AVG, COUNT, MIN, MAX) dan oleh FIRST_VALUE dan LAST_VALUE yang dibahas di bawah. ROW_NUMBER, RANK, DENSE_RANK, NTILE, LAG, dan LEAD selalu melihat seluruh partisi; frame yang ditulis untuk fungsi-fungsi ini tidak mengubah hasilnya.</p>
<p>Contoh di bawah menghitung jumlah pesanan per hari, 1–10 Oktober 2025. Setiap hari di bulan itu punya pesanan.</p>`,
      examples: [{ sql: `with harian as (
  select order_ts::date as tanggal, count(*) as pesanan
  from app.orders
  where order_ts >= '2025-10-01' and order_ts < '2025-10-11'
  group by order_ts::date
)
select tanggal, pesanan,
       sum(pesanan) over (order by tanggal rows between 2 preceding and current row) as total_3_hari,
       count(*) over (order by tanggal rows between 2 preceding and current row) as baris_di_frame,
       sum(pesanan) over (order by tanggal rows between 1 preceding and 1 following) as kemarin_sampai_besok
from harian
order by tanggal;`, note: "Di tanggal 1 dan 2 Oktober, baris_di_frame berisi 1 dan 2, karena belum ada dua baris sebelumnya. Mulai tanggal 3, frame selalu berisi 3 baris. Kolom terakhir di tanggal 10 hanya menjumlah 2 baris, karena tidak ada baris sesudahnya." }],
    },
    {
      title: "Frame bawaan, ROWS, dan RANGE",
      html: `<p>Kalau OVER berisi ORDER BY tetapi tidak menulis frame, PostgreSQL memakai <b>frame bawaan</b>: <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>. Itulah sebabnya SUM … OVER (ORDER BY …) di bab sebelumnya menghasilkan total berjalan.</p>
<p>Yang perlu diperhatikan adalah kata <code>RANGE</code>. Dengan <code>ROWS</code>, CURRENT ROW berarti tepat baris sekarang. Dengan <code>RANGE</code>, CURRENT ROW berarti baris sekarang <i>beserta semua <b>baris setara</b></i>, yaitu baris lain yang nilai ORDER BY-nya seri dengan baris sekarang (nilai seri sudah kamu temui di bab sebelumnya). Selama nilai urutan selalu berbeda, keduanya memberi hasil yang sama. Bedanya baru muncul kalau ada nilai seri.</p>
<p>Pelanggan 1118 punya 4 pesanan, dan dua di antaranya dibuat di tanggal yang sama, 3 September 2025. Contoh pertama mengurutkan pesanannya berdasarkan tanggal saja, lalu menghitung "pesanan ke-berapa" dengan tiga cara.</p>
<p>Dengan RANGE, kedua pesanan tanggal 3 September sama-sama mendapat angka 4, karena frame-nya ikut memasukkan baris setara. Dengan ROWS, keduanya mendapat 3 dan 4. Tetapi pesanan mana yang mendapat 3 tidak dijamin, karena urutan dua baris setara tidak ditentukan. Dokumentasi PostgreSQL memperingatkan bahwa ROWS bisa memberi hasil yang tidak bisa diduga kalau ORDER BY tidak membuat urutan yang unik.</p>
<p>Cara amannya: kalau kamu memakai ROWS, tambahkan kolom pemecah seri di ORDER BY, misalnya <code>order by order_ts::date, order_id</code>. Kalau yang kamu mau memang "semua yang tanggalnya sama dihitung bersama", pakai RANGE.</p>`,
      examples: [
        { sql: `select order_id, order_ts::date as tanggal,
       count(*) over (order by order_ts::date) as frame_bawaan,
       count(*) over (order by order_ts::date
                      range between unbounded preceding and current row) as pakai_range,
       count(*) over (order by order_ts::date
                      rows between unbounded preceding and current row) as pakai_rows
from app.orders
where customer_id = 1118
order by order_ts::date, order_id;`, note: "frame_bawaan dan pakai_range selalu sama. Di dua baris tanggal 2025-09-03, pakai_range berisi 4 dan 4, sedangkan pakai_rows berisi 3 dan 4." },
        { sql: `select order_id, order_ts::date as tanggal,
       count(*) over (order by order_ts::date, order_id
                      rows between unbounded preceding and current row) as pesanan_ke
from app.orders
where customer_id = 1118
order by order_ts::date, order_id;`, note: "Dengan order_id sebagai pemecah seri, urutannya pasti: pesanan 110913 selalu ke-3 dan 110919 selalu ke-4." },
      ],
    },
    {
      title: "FIRST_VALUE dan LAST_VALUE",
      html: `<p><code>FIRST_VALUE(x)</code> mengambil nilai x dari baris pertama frame. <code>LAST_VALUE(x)</code> mengambil nilai x dari baris terakhir frame. Keduanya berguna untuk menaruh nilai pesanan pertama atau terakhir di setiap baris, misalnya channel yang dipakai pelanggan di pesanan pertamanya.</p>
<p>FIRST_VALUE dengan frame bawaan langsung benar, karena frame bawaan selalu dimulai dari baris pertama partisi. LAST_VALUE adalah jebakan yang sangat sering terjadi. Frame bawaan berakhir di baris sekarang (beserta baris setaranya), jadi "baris terakhir frame" adalah baris sekarang itu sendiri. Hasilnya: LAST_VALUE hanya mengulang nilai baris sekarang, tanpa pesan error.</p>
<p>Cara benarnya, perlebar frame sampai akhir partisi: <code>rows between unbounded preceding and unbounded following</code>.</p>`,
      examples: [{ sql: `select order_id, order_ts,
       first_value(order_id) over (order by order_ts) as pertama,
       last_value(order_id) over (order by order_ts) as terakhir_salah,
       last_value(order_id) over (order by order_ts
                                  rows between unbounded preceding and unbounded following) as terakhir_benar,
       last_value(order_id) over (order by order_ts::date) as terakhir_per_tanggal
from app.orders
where customer_id = 1118
order by order_ts;`, note: "terakhir_salah selalu sama dengan order_id baris itu. terakhir_benar selalu 110919. Kolom terakhir mengurutkan per tanggal saja: di baris pesanan 110913 hasilnya 110919, karena pesanan 110919 adalah baris setara (tanggalnya sama) dan ikut masuk frame bawaan." }],
    },
    {
      title: "Rata-rata bergerak 7 hari",
      html: `<p><b>Rata-rata bergerak</b> 7 hari adalah rata-rata dari hari ini dan 6 hari sebelumnya, dihitung ulang setiap hari. Angka ini meredam naik-turun harian sehingga arah kenaikan atau penurunan lebih mudah terlihat. Rumusnya: <code>avg(x) over (order by tanggal rows between 6 preceding and current row)</code>.</p>
<p>Rumus ini menghitung 7 <i>baris</i>, bukan 7 <i>hari</i>. Hasilnya hanya benar kalau setiap hari punya tepat satu baris. Contohnya pesanan berstatus <code>cancelled</code> (dibatalkan): di bulan Oktober 2025 ada 33 pesanan batal, tersebar di 20 dari 31 hari. Kalau hasil GROUP BY langsung dipakai, 11 hari tanpa pembatalan tidak punya baris, sehingga "7 baris terakhir" bisa mencakup lebih dari 7 hari.</p>
<p>Contoh pertama memperlihatkan kesalahan ini. Di baris 16 Oktober, frame-nya dimulai dari 4 Oktober (kolom <code>frame_mulai</code>), jadi mencakup 13 hari, dan rata-ratanya 1,86. Hari 11–15 Oktober, yang tidak punya pembatalan, tidak ikut dihitung sebagai 0.</p>
<p>Perbaikannya: buat dulu kalender berisi semua tanggal dengan generate_series, lalu LEFT JOIN ke data harian, dan ganti NULL dengan 0 memakai COALESCE. Kalendernya dimulai 25 September, supaya rata-rata di 1 Oktober juga mencakup 7 hari penuh; baris September dibuang di SELECT terakhir. Hasilnya di 16 Oktober menjadi 0,29: hanya 2 pesanan batal (10 dan 16 Oktober) dalam 7 hari, dibagi 7.</p>
<p>PostgreSQL juga menerima RANGE dengan jarak berupa nilai, misalnya <code>range between interval '6 days' preceding and current row</code>: frame berisi baris yang tanggalnya paling jauh 6 hari sebelum tanggal baris sekarang. Jarak seperti ini hanya boleh kalau ORDER BY berisi tepat satu kolom. Cara ini menjumlah dengan benar walau ada hari kosong, tetapi AVG-nya membagi dengan jumlah hari yang punya data, bukan dengan 7, dan hari kosong tetap tidak muncul sebagai baris. Karena itu bagi SUM-nya dengan 7, seperti di contoh ketiga.</p>`,
      examples: [
        { sql: `with harian as (
  select order_ts::date as tanggal, count(*) as batal
  from app.orders
  where status = 'cancelled' and order_ts >= '2025-09-25'
  group by order_ts::date
)
select tanggal, batal,
       round(avg(batal) over (order by tanggal rows between 6 preceding and current row), 2) as rata_7_baris,
       min(tanggal) over (order by tanggal rows between 6 preceding and current row) as frame_mulai
from harian
order by tanggal;`, note: "Hari tanpa pembatalan (misalnya 7 Oktober dan 11–15 Oktober) tidak punya baris, sehingga rata-rata ini salah untuk banyak tanggal." },
        { sql: `with kalender as (
  select generate_series(date '2025-09-25', date '2025-10-31', interval '1 day')::date as tanggal
),
harian as (
  select order_ts::date as tanggal, count(*) as batal
  from app.orders
  where status = 'cancelled' and order_ts >= '2025-09-25'
  group by order_ts::date
),
lengkap as (
  select k.tanggal, coalesce(h.batal, 0) as batal
  from kalender k
  left join harian h on h.tanggal = k.tanggal
),
dengan_rata as (
  select tanggal, batal,
         round(avg(batal) over (order by tanggal rows between 6 preceding and current row), 2) as rata_7_hari
  from lengkap
)
select tanggal, batal, rata_7_hari
from dengan_rata
where tanggal >= date '2025-10-01'
order by tanggal;`, note: "Sekarang ada 31 baris, satu untuk setiap tanggal Oktober, dan hari kosong ikut terhitung sebagai 0. Penyaringan tanggal dilakukan setelah rata-rata dihitung; kalau WHERE ditaruh di query yang sama dengan AVG … OVER, baris September sudah dibuang sebelum rata-rata dihitung." },
        { sql: `with harian as (
  select order_ts::date as tanggal, count(*) as batal
  from app.orders
  where status = 'cancelled' and order_ts >= '2025-09-25'
  group by order_ts::date
),
dengan_range as (
  select tanggal, batal,
         sum(batal) over (order by tanggal range between interval '6 days' preceding and current row) as total_7_hari,
         round(avg(batal) over (order by tanggal range between interval '6 days' preceding and current row), 2) as avg_salah
  from harian
)
select tanggal, batal, total_7_hari,
       round(total_7_hari / 7.0, 2) as rata_7_hari, avg_salah
from dengan_range
where tanggal >= date '2025-10-01'
order by tanggal;`, note: "Di 16 Oktober, total_7_hari = 2 dan rata_7_hari = 0,29, sama dengan cara kalender. avg_salah berisi 1,00 karena membagi dengan 2 hari yang punya data." },
      ],
    },
    {
      title: "NTILE: membagi baris ke kelompok sama besar",
      html: `<p><code>NTILE(n)</code> membagi baris di setiap partisi menjadi n kelompok yang jumlah barisnya sama besar sebisa mungkin, mengikuti ORDER BY, lalu memberi nomor kelompok 1 sampai n. Dengan <code>ntile(4) … order by total desc</code>, kelompok 1 berisi seperempat pelanggan dengan belanja terbesar. Empat kelompok seperti ini sering disebut kuartil.</p>
<p>Di contoh ini, nilai belanja seorang pelanggan adalah jumlah <code>qty * unit_price - discount</code> dari semua baris barang di pesanannya yang statusnya bukan <code>cancelled</code>. Ada 1.406 pelanggan yang punya pesanan seperti itu. Karena 1.406 tidak habis dibagi 4, kelompoknya berisi 352, 352, 351, dan 351 pelanggan: kelompok yang lebih besar diletakkan lebih dulu. Contoh kedua memperlihatkan bahwa kelompok 1 menyumbang 54,7% dari seluruh nilai belanja.</p>
<p>Dua hal yang perlu diingat:</p>
<ul><li>NTILE membagi berdasarkan <i>jumlah baris</i>, bukan nilai. Dua baris dengan nilai sama bisa masuk kelompok berbeda kalau keduanya berada di batas kelompok. Contoh ketiga membagi 4 pesanan pelanggan 1118 menjadi 2 kelompok berdasarkan ongkos kirim: tiga pesanan berongkir 9.000, tetapi satu masuk kelompok 1 dan dua masuk kelompok 2.</li>
<li>Tambahkan pemecah seri di ORDER BY (di sini <code>customer_id</code>) supaya pelanggan dengan nilai sama selalu mendapat kelompok yang sama setiap kali query dijalankan.</li></ul>`,
      examples: [
        { sql: `with belanja as (
  select o.customer_id, sum(i.qty * i.unit_price - i.discount) as total
  from app.orders o
  join app.order_items i on i.order_id = o.order_id
  where o.status <> 'cancelled'
  group by o.customer_id
)
select customer_id, total,
       ntile(4) over (order by total desc, customer_id) as kelompok
from belanja
order by total desc, customer_id
limit 10;`, note: "Sepuluh pelanggan dengan belanja terbesar, semuanya di kelompok 1." },
        { sql: `with belanja as (
  select o.customer_id, sum(i.qty * i.unit_price - i.discount) as total
  from app.orders o
  join app.order_items i on i.order_id = o.order_id
  where o.status <> 'cancelled'
  group by o.customer_id
),
berkelompok as (
  select customer_id, total,
         ntile(4) over (order by total desc, customer_id) as kelompok
  from belanja
)
select kelompok, count(*) as pelanggan, min(total) as terkecil, max(total) as terbesar,
       sum(total) as total_belanja,
       round(100 * sum(total) / sum(sum(total)) over (), 1) as persen
from berkelompok
group by kelompok
order by kelompok;`, note: "sum(sum(total)) over () menjumlah total semua kelompok: SUM bagian dalam adalah agregasi per kelompok, SUM … OVER () bagian luar menjumlah hasil itu untuk seluruh baris." },
        { sql: `select order_id, shipping_fee,
       ntile(2) over (order by shipping_fee, order_id) as kelompok
from app.orders
where customer_id = 1118
order by shipping_fee, order_id;`, note: "Pesanan 109404 dan 110184 sama-sama berongkir 9.000, tetapi berbeda kelompok." },
      ],
    },
    {
      title: "Gaps & islands: rentang hari berturut-turut",
      html: `<p><b>Gaps &amp; islands</b> adalah pola untuk mencari rentang yang berurutan tanpa putus (pulau) dan celah di antaranya. Contoh pertanyaan: "berapa hari berturut-turut seorang pelanggan membuka situs?" Datanya dari <code>raw.web_events</code>: satu baris untuk satu aktivitas pelanggan (<i>event</i>) di situs atau aplikasi, September–Oktober 2025, dengan waktu aktivitas di kolom <code>event_ts</code>.</p>
<p>Caranya ada tiga langkah:</p>
<ol><li>Ambil setiap pasangan pelanggan dan tanggal aktif sekali saja (DISTINCT).</li>
<li>Beri nomor urut per pelanggan dengan ROW_NUMBER, lalu hitung <code>tanggal - nomor_urut</code>. Selama tanggalnya berturut-turut, tanggal dan nomor urut sama-sama naik 1, sehingga hasil pengurangannya tetap. Begitu ada hari yang terlewat, hasilnya berubah. Hasil pengurangan ini menjadi kunci pulau. Tanggal (date) dikurangi bilangan bulat menghasilkan tanggal sekian hari sebelumnya. ROW_NUMBER menghasilkan tipe bigint, dan PostgreSQL menolak date dikurangi bigint, jadi ubah dulu ke integer dengan <code>::int</code>.</li>
<li>GROUP BY pelanggan dan kunci: MIN dan MAX tanggal adalah awal dan akhir pulau, COUNT adalah panjangnya.</li></ol>
<p>Pelanggan 282 aktif di 8 tanggal. Empat tanggal, 27–30 September, berturut-turut dan mendapat kunci yang sama, 2025-09-23. Nilai kunci itu sendiri tidak punya arti; yang penting hanya sama atau tidaknya.</p>
<p>Di seluruh data ada 2.414 pulau milik 450 pelanggan. Pulau terpanjang 4 hari, dimiliki 3 pelanggan.</p>`,
      examples: [
        { sql: `with hari_aktif as (
  select distinct customer_id, event_ts::date as tanggal
  from raw.web_events
  where customer_id = 282
)
select customer_id, tanggal,
       row_number() over (partition by customer_id order by tanggal) as nomor_urut,
       tanggal - (row_number() over (partition by customer_id order by tanggal))::int as kunci
from hari_aktif
order by tanggal;`, note: "Baris 27, 28, 29, dan 30 September punya kunci yang sama. Tanggal lain berdiri sendiri." },
        { sql: `with hari_aktif as (
  select distinct customer_id, event_ts::date as tanggal
  from raw.web_events
  where customer_id = 282
),
berkunci as (
  select customer_id, tanggal,
         tanggal - (row_number() over (partition by customer_id order by tanggal))::int as kunci
  from hari_aktif
)
select customer_id, min(tanggal) as mulai, max(tanggal) as selesai, count(*) as jumlah_hari
from berkunci
group by customer_id, kunci
order by mulai;`, note: "Lima pulau: empat pulau satu hari dan satu pulau 4 hari (27–30 September)." },
      ],
    },
    {
      title: "Sesi kunjungan dari raw.web_events",
      html: `<p><b>Sesi kunjungan</b> adalah kumpulan aktivitas seorang pengguna yang jedanya berdekatan, dianggap satu kali kunjungan. Aturan yang umum dipakai: aktivitas baru dianggap sesi baru kalau jedanya lebih dari 30 menit sejak aktivitas sebelumnya. Angka 30 menit adalah aturan yang dipilih, bukan sifat data. Kolom <code>event_type</code> berisi jenis aktivitas (lima nilai, tercantum di <a href="#kamus">Kamus data</a>), dan <code>page</code> berisi halaman yang dibuka.</p>
<p>Langkahnya:</p>
<ol><li><b>Hitung jeda</b> dari aktivitas sebelumnya milik pelanggan yang sama: <code>event_ts - lag(event_ts) over (partition by customer_id order by event_ts)</code>. Hasilnya interval; di aktivitas pertama hasilnya NULL.</li>
<li><b>Tandai awal sesi</b> dengan CASE: 1 kalau jedanya NULL atau lebih dari <code>interval '30 minutes'</code>, selain itu 0.</li>
<li><b>Nomori sesi</b> dengan total berjalan dari tanda itu: <code>sum(sesi_baru) over (partition by customer_id order by event_ts)</code>. Setiap kali bertemu angka 1, nomor sesinya naik.</li>
<li><b>Ringkas per sesi</b> dengan GROUP BY pelanggan dan nomor sesi.</li></ol>
<p>Langkah 3 memakai frame bawaan (RANGE). Hasilnya sama dengan ROWS karena di data ini tidak ada dua aktivitas pelanggan yang sama di detik yang sama; jumlah pasangan <code>customer_id</code> dan <code>event_ts</code> yang kembar adalah 0.</p>
<p>Di data TokoKita, jeda antar-aktivitas pelanggan selalu paling lama 6 menit, atau paling sedikit 1 jam 2 menit 43 detik. Jadi batas 30 menit membagi aktivitas dengan jelas, dan menghasilkan 2.921 sesi. Setiap sesi itu dimulai di halaman <code>/</code>, dan halaman <code>/</code> tidak pernah muncul di tengah sesi.</p>
<p>Data aktivitas di dunia kerja biasanya jauh lebih besar. Saring pelanggan atau tanggal di langkah pertama kalau hanya butuh sebagian; contoh di bawah hanya mengambil pelanggan 2.</p>`,
      examples: [
        { sql: `with dengan_jeda as (
  select customer_id, event_id, event_ts, event_type,
         event_ts - lag(event_ts) over (partition by customer_id order by event_ts) as jeda
  from raw.web_events
  where customer_id = 2
),
dengan_tanda as (
  select *,
         case when jeda is null or jeda > interval '30 minutes' then 1 else 0 end as sesi_baru
  from dengan_jeda
)
select *,
       sum(sesi_baru) over (partition by customer_id order by event_ts) as sesi_ke
from dengan_tanda
order by event_ts;`, note: "Pelanggan 2 punya 26 aktivitas. Jeda 19 hari dan 23 hari memulai sesi ke-2 dan ke-3; semua jeda lain di bawah 6 menit." },
        { sql: `with dengan_jeda as (
  select customer_id, event_ts, event_type,
         event_ts - lag(event_ts) over (partition by customer_id order by event_ts) as jeda
  from raw.web_events
  where customer_id = 2
),
dengan_tanda as (
  select *,
         case when jeda is null or jeda > interval '30 minutes' then 1 else 0 end as sesi_baru
  from dengan_jeda
),
bernomor as (
  select *,
         sum(sesi_baru) over (partition by customer_id order by event_ts) as sesi_ke
  from dengan_tanda
)
select customer_id, sesi_ke, min(event_ts) as mulai, max(event_ts) as selesai,
       count(*) as jumlah_event,
       count(*) filter (where event_type = 'purchase') as jumlah_beli
from bernomor
group by customer_id, sesi_ke
order by sesi_ke;`, note: "Tiga sesi dengan 10, 12, dan 4 aktivitas. Tidak ada pembelian (purchase) di sesi mana pun milik pelanggan 2." },
      ],
    },
  ],
  tsql: [
    { pg: "sum(x) over (order by t rows between 6 preceding and current row)", tsql: "sum(x) over (order by t rows between 6 preceding and current row)", note: "Sama. ROWS dan RANGE ada di SQL Server sejak SQL Server 2012. Bentuk singkat rows 6 preceding juga sama artinya." },
    { pg: "range between unbounded preceding and current row", tsql: "range between unbounded preceding and current row", note: "Sama, dan frame bawaannya juga sama: kalau ada ORDER BY tanpa ROWS/RANGE, SQL Server memakai RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW." },
    { pg: "range between interval '6 days' preceding and current row", tsql: "tidak ada", note: "Di SQL Server, RANGE hanya menerima UNBOUNDED PRECEDING, UNBOUNDED FOLLOWING, dan CURRENT ROW; jarak angka (n PRECEDING/FOLLOWING) hanya boleh dengan ROWS. Pakai kalender + ROWS." },
    { pg: "groups between 1 preceding and current row", tsql: "tidak ada", note: "PostgreSQL punya mode ketiga, GROUPS (jarak dihitung dalam kelompok baris setara). Sintaks OVER di SQL Server hanya mengenal ROWS dan RANGE." },
    { pg: "row_number() over (order by t rows …)", tsql: "ditolak", note: "PostgreSQL menerima frame di fungsi peringkat tetapi mengabaikannya. SQL Server tidak menerima ROWS/RANGE di fungsi peringkat (ROW_NUMBER, RANK, DENSE_RANK, NTILE)." },
    { pg: "first_value(x) over (…), last_value(x) over (…)", tsql: "first_value(x) over (…), last_value(x) over (…)", note: "Sama, termasuk jebakan LAST_VALUE dengan frame bawaan. Di SQL Server, ORDER BY di dalam OVER wajib ditulis. Mulai SQL Server 2022 ada pilihan IGNORE NULLS untuk melewati nilai NULL." },
    { pg: "ntile(4) over (order by total desc)", tsql: "ntile(4) over (order by total desc)", note: "Sama: kelompok yang lebih besar diletakkan lebih dulu. Di SQL Server, ORDER BY wajib, dan hasilnya bertipe bigint (di PostgreSQL integer)." },
    { pg: "generate_series(date '2025-09-25', date '2025-10-31', interval '1 day')", tsql: "select dateadd(day, value, cast('2025-09-25' as date)) from generate_series(0, 36)", note: "GENERATE_SERIES ada sejak SQL Server 2022 (pengaturan <i>compatibility level</i> database minimal 160) dan hanya menerima angka, bukan tanggal. Buat deret angka, lalu tambahkan ke tanggal awal dengan DATEADD." },
    { pg: "tanggal - (row_number() over (…))::int", tsql: "dateadd(day, -row_number() over (…), tanggal)", note: "SQL Server tidak bisa mengurangi date dengan tanda minus; DATEADD menerima ROW_NUMBER langsung sebagai jumlah hari." },
    { pg: "event_ts - lag(event_ts) over (…) > interval '30 minutes'", tsql: "datediff(second, lag(event_ts) over (…), event_ts) > 1800", note: "DATEDIFF menghitung berapa batas satuan yang dilewati, bukan lama sebenarnya. datediff(minute, …) dari 10:00:59 ke 10:01:00 menghasilkan 1. Pakai satuan detik supaya tepat." },
  ],
  summary: [
    "Frame menentukan baris mana di dalam partisi yang dipakai fungsi agregat, FIRST_VALUE, dan LAST_VALUE: <code>ROWS BETWEEN awal AND akhir</code>, dengan <code>n PRECEDING</code>, <code>n FOLLOWING</code>, <code>CURRENT ROW</code>, dan <code>UNBOUNDED</code>.",
    "Frame bawaan dengan ORDER BY adalah <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>. RANGE ikut memasukkan baris setara (nilai urutan sama); ROWS berhenti tepat di baris sekarang.",
    "Kalau memakai ROWS, beri pemecah seri di ORDER BY supaya hasilnya pasti.",
    "LAST_VALUE dengan frame bawaan hanya mengulang nilai baris sekarang. Tulis <code>rows between unbounded preceding and unbounded following</code>.",
    "Rata-rata bergerak 7 hari dengan <code>rows between 6 preceding and current row</code> hanya benar kalau setiap hari punya satu baris. Buat kalender dengan generate_series dan LEFT JOIN dulu.",
    "<code>NTILE(n)</code> membagi baris menjadi n kelompok berdasarkan jumlah baris; kelompok yang lebih besar di depan.",
    "Gaps &amp; islands: tanggal dikurangi ROW_NUMBER menghasilkan kunci yang sama untuk tanggal berturut-turut.",
    "Sesi kunjungan: LAG untuk jeda, CASE untuk tanda sesi baru, SUM … OVER berjalan untuk nomor sesi.",
  ],
  drills: [
    { id: "sql-10-01", kind: "choice", prompt: "Window function ditulis <code>sum(x) over (order by tanggal)</code>, tanpa ROWS atau RANGE. Frame apa yang dipakai?",
      options: ["Seluruh partisi", "ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW", "Hanya baris sekarang"], answer: 2,
      why: "Kalau ada ORDER BY tanpa frame, frame bawaannya RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW: dari awal partisi sampai baris terakhir yang setara dengan baris sekarang. Seluruh partisi dipakai kalau OVER tidak berisi ORDER BY.",
      hint: "Ingat kata yang membuat baris dengan tanggal sama dihitung bersama." },
    { id: "sql-10-02", kind: "choice", prompt: "Ada 10 baris. Berapa isi setiap kelompok kalau dibagi dengan <code>ntile(4)</code>?",
      options: ["3, 3, 2, 2", "2, 2, 3, 3", "3, 3, 3, 1", "2, 2, 2, 4"], answer: 0,
      why: "10 dibagi 4 adalah 2 sisa 2. Sisa itu dibagikan satu per satu ke kelompok paling depan, jadi kelompok 1 dan 2 berisi 3 baris, kelompok 3 dan 4 berisi 2 baris.",
      hint: "NTILE membuat kelompok sama besar sebisa mungkin; kelebihan baris ditaruh di depan." },
    { id: "sql-10-03", kind: "choice", prompt: "<code>last_value(order_id) over (partition by customer_id order by order_ts)</code> menghasilkan apa? Di data ini <code>order_ts</code> setiap pesanan seorang pelanggan selalu berbeda.",
      options: ["order_id pesanan terakhir pelanggan itu", "order_id pesanan pertama pelanggan itu", "order_id baris itu sendiri", "Error, karena frame belum ditulis"], answer: 2,
      why: "Frame bawaan berakhir di baris sekarang (beserta baris setaranya, dan di sini tidak ada). Baris terakhir frame adalah baris sekarang, jadi LAST_VALUE mengulang order_id baris itu.",
      hint: "Di mana frame bawaan berakhir?" },
    { id: "sql-10-04", kind: "sql", prompt: "Hitung jumlah pesanan per hari untuk tanggal 1–10 Oktober 2025 (hanya dari pesanan di rentang itu). Tampilkan tanggal, jumlah pesanan, dan total pesanan hari itu ditambah 2 hari sesudahnya.",
      solution: `with harian as (
  select order_ts::date as tanggal, count(*) as pesanan
  from app.orders
  where order_ts >= '2025-10-01' and order_ts < '2025-10-11'
  group by order_ts::date
)
select tanggal, pesanan,
       sum(pesanan) over (order by tanggal rows between current row and 2 following) as total_3_hari
from harian`,
      why: "Frame dimulai di baris sekarang (CURRENT ROW) dan berakhir 2 baris sesudahnya (2 FOLLOWING). Setiap tanggal di rentang ini punya pesanan, jadi 2 baris sama dengan 2 hari. Di tanggal 9 dan 10, frame lebih pendek karena tidak ada baris sesudahnya.",
      hint: "rows between current row and 2 following" },
    { id: "sql-10-05", kind: "sql", prompt: "Untuk semua pesanan pelanggan nomor 1 sampai 10, tampilkan <code>customer_id</code>, <code>order_id</code>, <code>channel</code>, channel yang dipakai di pesanan pertama pelanggan itu (urut <code>order_ts</code>), dan jumlah hari sejak tanggal pesanan pertamanya (tanggal pesanan ini dikurangi tanggal pesanan pertama, tanpa jam).",
      solution: `select customer_id, order_id, channel,
       first_value(channel) over (partition by customer_id order by order_ts) as channel_pertama,
       order_ts::date - first_value(order_ts::date) over (partition by customer_id order by order_ts) as hari_sejak_pertama
from app.orders
where customer_id <= 10`,
      why: "FIRST_VALUE mengambil nilai dari baris pertama frame. Frame bawaan selalu dimulai dari baris pertama partisi, jadi untuk FIRST_VALUE frame tidak perlu ditulis.",
      hint: "first_value(…) over (partition by customer_id order by order_ts)" },
    { id: "sql-10-06", kind: "sql", prompt: "Bagi semua produk menjadi 4 kelompok harga dengan NTILE: kelompok 1 berisi produk termahal (<code>list_price</code> terbesar). Kalau harganya sama, <code>product_id</code> yang lebih kecil didahulukan. Tampilkan <code>product_id</code>, <code>product_name</code>, <code>list_price</code>, dan nomor kelompok.",
      solution: `select product_id, product_name, list_price,
       ntile(4) over (order by list_price desc, product_id) as kelompok
from app.products`,
      why: "Ada 27 harga yang dipakai lebih dari satu produk. Tanpa product_id sebagai pemecah seri, produk berharga sama di batas kelompok bisa mendapat nomor berbeda setiap kali query dijalankan.",
      hint: "ntile(4) over (order by list_price desc, product_id)" },
    { id: "sql-10-07", kind: "sql", level: "menengah", prompt: "Hitung jumlah pesanan lewat channel <code>ios</code> per hari, 1 September sampai 31 Oktober 2025. Setiap tanggal harus muncul, termasuk hari tanpa pesanan ios (jumlahnya 0). Tampilkan tanggal, jumlah pesanan, dan rata-rata bergerak 7 hari (hari itu dan 6 hari sebelumnya di dalam rentang ini), dibulatkan 2 digit.",
      solution: `with kalender as (
  select generate_series(date '2025-09-01', date '2025-10-31', interval '1 day')::date as tanggal
),
harian as (
  select order_ts::date as tanggal, count(*) as pesanan
  from app.orders
  where channel = 'ios' and order_ts >= '2025-09-01' and order_ts < '2025-11-01'
  group by order_ts::date
)
select k.tanggal, coalesce(h.pesanan, 0) as pesanan,
       round(avg(coalesce(h.pesanan, 0)) over (order by k.tanggal rows between 6 preceding and current row), 2) as rata_7_hari
from kalender k
left join harian h on h.tanggal = k.tanggal`,
      why: "Ada 2 hari tanpa pesanan ios (19 dan 26 September). Tanpa kalender, kedua hari itu tidak punya baris, sehingga 7 baris terakhir di sekitarnya mencakup 8 hari dan rata-ratanya salah. Kalender + LEFT JOIN + COALESCE membuat setiap hari punya tepat satu baris.",
      hint: "Buat kalender dengan generate_series, LEFT JOIN ke data harian, lalu rows between 6 preceding and current row." },
    { id: "sql-10-08", kind: "sql", level: "wawancara", prompt: "Dari <code>raw.web_events</code>, cari setiap rentang hari berturut-turut (tanpa ada hari terlewat) ketika seorang pelanggan punya minimal satu aktivitas, yang panjangnya minimal 3 hari. Tampilkan <code>customer_id</code>, tanggal mulai, tanggal selesai, dan jumlah hari.",
      solution: `with hari_aktif as (
  select distinct customer_id, event_ts::date as tanggal
  from raw.web_events
),
berkunci as (
  select customer_id, tanggal,
         tanggal - (row_number() over (partition by customer_id order by tanggal))::int as kunci
  from hari_aktif
)
select customer_id, min(tanggal) as mulai, max(tanggal) as selesai, count(*) as jumlah_hari
from berkunci
group by customer_id, kunci
having count(*) >= 3`,
      why: "Untuk tanggal berturut-turut, tanggal dan ROW_NUMBER sama-sama naik 1, jadi selisihnya tetap dan menjadi kunci pulau. DISTINCT di langkah pertama penting: kalau satu tanggal muncul dua kali, nomor urut naik tanpa tanggal naik, dan pulaunya terpecah. Hasilnya 45 rentang milik 43 pelanggan.",
      hint: "Satu baris per pelanggan per tanggal, lalu tanggal - row_number()::int sebagai kunci, lalu GROUP BY dan HAVING." },
    { id: "sql-10-09", kind: "sql", level: "wawancara", prompt: "Bagi aktivitas pelanggan nomor 1 sampai 100 di <code>raw.web_events</code> menjadi sesi kunjungan: aktivitas baru dianggap sesi baru kalau jedanya lebih dari 30 menit sejak aktivitas sebelumnya milik pelanggan yang sama. Tampilkan <code>customer_id</code>, nomor sesi pelanggan itu (mulai dari 1), waktu mulai, waktu selesai, dan jumlah aktivitas di sesi itu.",
      solution: `with dengan_jeda as (
  select customer_id, event_ts,
         event_ts - lag(event_ts) over (partition by customer_id order by event_ts) as jeda
  from raw.web_events
  where customer_id <= 100
),
dengan_tanda as (
  select *,
         case when jeda is null or jeda > interval '30 minutes' then 1 else 0 end as sesi_baru
  from dengan_jeda
),
bernomor as (
  select *,
         sum(sesi_baru) over (partition by customer_id order by event_ts) as sesi_ke
  from dengan_tanda
)
select customer_id, sesi_ke, min(event_ts) as mulai, max(event_ts) as selesai, count(*) as jumlah_event
from bernomor
group by customer_id, sesi_ke`,
      why: "LAG mengambil waktu aktivitas sebelumnya, CASE memberi angka 1 di awal setiap sesi, dan total berjalan dari angka itu menjadi nomor sesi. Menyaring pelanggan sebelum LAG aman, karena LAG hanya melihat partisi pelanggan yang sama.",
      hint: "LAG untuk jeda, CASE untuk tanda sesi baru, SUM … OVER untuk nomor sesi, lalu GROUP BY." },
    { id: "sql-10-10", kind: "fix", prompt: "Query ini seharusnya menampilkan, di setiap pesanan pelanggan nomor 1 sampai 10, waktu pesanan <i>terakhir</i> pelanggan itu. Ternyata kolom pesanan_terakhir selalu sama dengan <code>order_ts</code> baris itu. Perbaiki.",
      start: `select customer_id, order_id, order_ts,
       last_value(order_ts) over (partition by customer_id order by order_ts) as pesanan_terakhir
from app.orders
where customer_id <= 10;`,
      solution: `select customer_id, order_id, order_ts,
       last_value(order_ts) over (partition by customer_id order by order_ts
                                  rows between unbounded preceding and unbounded following) as pesanan_terakhir
from app.orders
where customer_id <= 10`,
      why: "Frame bawaan berakhir di baris sekarang, jadi LAST_VALUE mengambil baris sekarang. Perlebar frame sampai akhir partisi dengan rows between unbounded preceding and unbounded following. max(order_ts) over (partition by customer_id) tanpa ORDER BY juga memberi hasil yang benar.",
      hint: "Tambahkan frame yang berakhir di UNBOUNDED FOLLOWING." },
    { id: "sql-10-11", kind: "number", prompt: "Dengan aturan \"aktivitas baru adalah sesi baru kalau jedanya lebih dari 30 menit sejak aktivitas sebelumnya milik pelanggan yang sama\", berapa jumlah seluruh sesi kunjungan di <code>raw.web_events</code>?",
      answerSql: `with dengan_tanda as (
  select case when event_ts - lag(event_ts) over (partition by customer_id order by event_ts) <= interval '30 minutes' then 0 else 1 end as sesi_baru
  from raw.web_events
)
select sum(sesi_baru) from dengan_tanda`,
      why: "Setiap sesi dimulai dengan tepat satu tanda 1, jadi jumlah semua tanda sama dengan jumlah sesi. Aktivitas pertama setiap pelanggan (jeda NULL) masuk ELSE dan mendapat 1. Hasilnya 2.921.",
      hint: "Tidak perlu nomor sesi. Cukup jumlahkan tanda sesi baru." },
    { id: "sql-10-12", kind: "explain", prompt: "Jelaskan dengan kalimatmu sendiri beda <code>ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code> dan <code>RANGE BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW</code>. Kapan hasilnya berbeda, dan apa yang sebaiknya dilakukan kalau kamu memakai ROWS?",
      model: "ROWS menghitung baris secara fisik: frame berhenti tepat di baris sekarang. RANGE menghitung berdasarkan nilai ORDER BY: frame berhenti di baris terakhir yang nilai urutannya sama dengan baris sekarang, jadi semua baris setara ikut masuk. Hasilnya hanya berbeda kalau ada nilai ORDER BY yang sama, misalnya dua pesanan di tanggal yang sama: dengan RANGE keduanya mendapat total yang sama, dengan ROWS yang satu belum memasukkan yang lain. Karena urutan baris setara tidak ditentukan, ROWS bisa memberi hasil berbeda setiap kali dijalankan. Kalau memakai ROWS, tambahkan kolom unik sebagai pemecah seri di ORDER BY, misalnya order_id.",
      hint: "Pikirkan dua pesanan dengan tanggal yang sama." },
  ],
};
