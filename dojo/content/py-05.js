// Bab 5 Python: pandas 1. DataFrame dan Series, membaca CSV, memilih kolom, filter baris, loc/iloc, kolom baru,
// urutan, groupby + agg, merge (inner, left, validate, indicator), baris berlipat, drop_duplicates, NaN.
// Fakta tentang pandas dicek lewat Context7: /pandas-dev/pandas (doc/source/whatsnew/v3.0.0.rst, web/pandas/community/blog/pandas-3.0.md,
// doc/source/user_guide/{dsintro,10min,basics,indexing,groupby,merging,missing_data,migration,gotchas,io,text,user_defined_functions}.rst,
// doc/source/getting_started/comparison/comparison_with_sql.rst, pandas/core/base.py, pandas/core/frame.py);
// NumPy lewat /numpy/numpy (doc/source/user/misc.rst). Setiap angka di teks dicocokkan dengan query SQL (tools/query.mjs).
export default {
  id: "py-05",
  part: "python",
  // draft: kuota Context7 habis sebelum semua klaim terverifikasi (lihat laporan penulis). Hapus setelah sisa klaim dicek.
  draft: true,
  title: "pandas 1: DataFrame, filter, kelompok, gabung",
  minutes: 75,
  goals: [
    "Membaca CSV menjadi DataFrame dengan <code>pd.read_csv</code>, lalu memeriksa ukuran, nama kolom, dan tipe kolomnya.",
    "Memilih kolom dan menyaring baris dengan syarat (<code>&amp;</code>, <code>|</code>, <code>~</code>, <code>isin</code>, <code>between</code>), serta memakai <code>loc</code> dan <code>iloc</code>.",
    "Membuat kolom baru dengan operasi vektor, lalu mengurutkan dan mengambil n baris teratas.",
    "Mengelompokkan data dengan <code>groupby</code> + <code>agg</code>, <code>value_counts</code>, dan <code>nunique</code>.",
    "Menggabung tabel dengan <code>merge</code>, mencegah baris berlipat dengan <code>validate=</code>, dan membuat anti-join dengan <code>indicator=</code>.",
    "Menangani nilai kosong (NaN) dengan <code>isna</code> dan <code>fillna</code>, dan mencocokkan setiap hasil dengan query SQL padanannya.",
  ],
  terms: [
    { term: "dataframe", def: "Struktur data dua dimensi di pandas: baris dan kolom berlabel, dan setiap kolom boleh bertipe berbeda. Mirip tabel SQL." },
    { term: "series", def: "Struktur data satu dimensi di pandas: deretan nilai bertipe sama dengan label baris (index). Satu kolom DataFrame adalah satu Series." },
    { term: "pandas", def: "Pustaka pihak ketiga Python untuk mengolah data berbentuk tabel: membaca berkas, menyaring, mengelompokkan, dan menggabung." },
    { term: "dtype", def: "Tipe data satu kolom pandas, misalnya <code>int64</code> (bilangan bulat), <code>float64</code> (angka desimal), <code>str</code> (teks), atau <code>bool</code>." },
    { term: "operasi vektor", def: "Operasi yang dijalankan pada seluruh kolom sekaligus, misalnya <code>df[\"qty\"] * df[\"unit_price\"]</code>, tanpa menulis perulangan per baris." },
    { term: "mask boolean", def: "Series berisi True/False, satu nilai per baris, yang dipakai untuk memilih baris: baris bernilai True diambil." },
    { term: "nan", def: "<i>Not a Number</i>, penanda nilai kosong di pandas, mirip NULL di SQL. <code>NaN == NaN</code> hasilnya False, jadi periksa dengan <code>isna()</code>." },
  ],
  introduces: ["py:import pandas","py:import numpy"],
  sections: [
    {
      title: "Kenapa pandas",
      html: `<p>Di bab sebelumnya kamu menghitung pesanan per status dengan modul csv dan dict. Caranya benar, tetapi panjang: setiap baris dibaca satu per satu, lalu dijumlahkan sendiri. <b>pandas</b> adalah pustaka pihak ketiga untuk data berbentuk tabel. Dengan pandas, pekerjaan seperti WHERE, GROUP BY, dan JOIN di SQL cukup ditulis satu baris.</p>
<p>Dua struktur data utamanya:</p>
<ul><li><b>DataFrame</b>: menurut dokumentasi pandas, struktur dua dimensi berlabel yang kolomnya boleh bertipe berbeda, mirip tabel SQL.</li>
<li><b>Series</b>: deretan nilai satu dimensi berlabel. Satu kolom DataFrame adalah satu Series.</li></ul>
<p>Label baris disebut <i>index</i>. Ini berbeda dengan index database di bab SQL: di pandas, index hanya nama atau nomor baris. Kalau tidak ditentukan, isinya 0, 1, 2, dan seterusnya.</p>
<p>Dokumentasi pandas menulis import dengan nama pendek <code>pd</code>, dan NumPy (pustaka hitung angka yang dipakai pandas di dalamnya) dengan <code>np</code>. Semua kode di bab ini mengikuti kebiasaan itu. <code>pd.read_csv()</code> membaca berkas CSV menjadi DataFrame.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
print(orders.shape)
print(list(orders.columns))
print(orders[["order_id", "channel", "status", "shipping_fee"]].head(3))`, note: "<code>shape</code> berisi (jumlah baris, jumlah kolom): 12007 pesanan dan 9 kolom, sama dengan <code>select count(*) from app.orders</code>. <code>head(3)</code> mengambil 3 baris pertama, seperti LIMIT 3. Tanpa angka, <code>head()</code> mengambil 5 baris. Angka 0, 1, 2 di kiri adalah index." }],
    },
    {
      title: "Melihat isi: dtypes, info, describe",
      html: `<p>Setiap kolom punya <b>dtype</b> (tipe data kolom). <code>read_csv</code> menebaknya dari isi berkas:</p>
<ul><li><code>int64</code>: bilangan bulat; <code>float64</code>: angka desimal; <code>bool</code>: True/False.</li>
<li><code>str</code>: teks. Ini tipe teks baru di pandas 3.0. Versi sebelumnya memakai <code>object</code>, jadi kode lama yang memeriksa <code>dtype == object</code> tidak cocok lagi.</li></ul>
<p>Sel kosong di CSV dibaca sebagai <b>NaN</b>, penanda nilai kosong di pandas. Kolom bilangan bulat yang punya NaN berubah menjadi float64. Itu sebabnya <code>handled_by</code> (nomor karyawan) bertipe float64.</p>
<p>Akibat tebakan tipe bisa lebih parah. Kolom <code>phone</code> di <code>app.customers</code> berisi teks seperti <code>087883032573</code>. Karena isinya hanya angka (dan 65 sel kosong), pandas membacanya sebagai float64, dan angka 0 di depan hilang. Cara memaksa tipe kolom dibahas di bab berikutnya. Untuk sekarang, biasakan memeriksa dtype setiap kali membaca berkas.</p>
<p><code>info()</code> mencetak ringkasan: jumlah baris, dtype, dan jumlah nilai yang tidak kosong per kolom. <code>describe()</code> menghitung statistik kolom angka: jumlah nilai, rata-rata, simpangan baku (ukuran sebaran nilai), minimum, kuartil, dan maksimum. Menurut dokumentasi, kolom teks tidak ikut secara bawaan.</p>`,
      examples: [
        { lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
orders.info()`, note: "<code>voucher_code</code> hanya 2040 non-null: 9967 pesanan tanpa voucher, sama dengan <code>count(*) filter (where voucher_code is null)</code> di SQL. <code>handled_by</code> 1418 non-null dan bertipe float64." },
        { lang: "py", code: `import pandas as pd

customers = pd.read_csv("/data/app/customers.csv")
print(customers["phone"].dtype)
print(customers["phone"].head(3).tolist())
print(customers["phone"].isna().sum())`, note: "Di database, telepon pelanggan 1 tertulis <code>087883032573</code>. Di sini menjadi <code>87883032573.0</code>. <code>.tolist()</code> mengubah Series menjadi list biasa." },
      ],
    },
    {
      title: "Memilih kolom",
      html: `<p><code>df["status"]</code> (satu nama di dalam kurung siku) memberi satu kolom sebagai <b>Series</b>. <code>df[["order_id", "status"]]</code> (list nama kolom di dalam kurung siku) memberi <b>DataFrame</b> berisi kolom-kolom itu, seperti <code>SELECT order_id, status</code>. Bedanya penting, karena Series dan DataFrame punya metode yang berbeda.</p>
<p>Series punya metode hitung yang dipanggil dengan titik: <code>.sum()</code>, <code>.mean()</code> (rata-rata), <code>.min()</code>, <code>.max()</code>, <code>.count()</code> (jumlah nilai tidak kosong). Ini metode pandas, bukan fungsi bawaan <code>sum()</code> Python.</p>
<p>Untuk mencetak DataFrame dengan rapi, pakai <code>print(df.to_string(index=False))</code>. Hasilnya semua baris dan kolom, tanpa index. Tabel yang lebar tidak dipotong dengan "..." seperti pada <code>print(df)</code>.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
print(type(orders["status"]))
print(type(orders[["status"]]))
print(orders["shipping_fee"].sum(), orders["shipping_fee"].max())
print(orders[["order_id", "status"]].head(3).to_string(index=False))`, note: "Total ongkir 151.132.000 dan ongkir terbesar 35.000, sama dengan <code>select sum(shipping_fee), max(shipping_fee) from app.orders</code>." }],
    },
    {
      title: "Menyaring baris dengan syarat",
      html: `<p><code>orders["status"] == "completed"</code> tidak menghasilkan satu True/False, tetapi satu Series berisi True/False untuk setiap baris. Series ini disebut <b>mask boolean</b>. <code>orders[mask]</code> mengambil baris yang bernilai True, seperti WHERE.</p>
<p>Syarat digabung dengan <code>&amp;</code> (dan), <code>|</code> (atau), dan <code>~</code> (bukan), bukan dengan <code>and</code>, <code>or</code>, <code>not</code>. Menurut dokumentasi pandas, setiap syarat <b>wajib</b> diberi kurung: <code>(a == 1) &amp; (b == 2)</code>. Tanpa kurung, Python menghitung <code>&amp;</code> lebih dulu daripada <code>==</code>, dan hasilnya error. Memakai <code>and</code> juga error, dengan pesan <code>The truth value of a Series is ambiguous</code>: Python tidak tahu apakah satu Series berisi banyak nilai harus dianggap True atau False.</p>
<p>Dua metode lain:</p>
<ul><li><code>.isin([...])</code>: sama dengan IN.</li>
<li><code>.between(a, b)</code>: sama dengan BETWEEN, kedua batas ikut. Contoh di bawah membuktikannya: pesanan dengan ongkir tepat 15000 ikut terhitung.</li></ul>
<p><code>df.query("...")</code> adalah cara lain yang menulis syarat sebagai teks, misalnya <code>orders.query("status == 'completed' and channel == 'web'")</code>. Di dalam teks query, <code>and</code> boleh dipakai. Variabel Python di dalamnya diawali <code>@</code>, misalnya <code>"shipping_fee &gt; @batas"</code>.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
web_selesai = orders[(orders["status"] == "completed") & (orders["channel"] == "web")]
print(len(web_selesai))
print(orders["status"].isin(["cancelled", "returned"]).sum())
print(orders["shipping_fee"].between(10000, 15000).sum())
print((~(orders["status"] == "completed")).sum())
print(len(orders.query("status == 'completed' and channel == 'web'")))`, note: "Hasilnya 3838, 1066, 4865, 1128, dan 3838. Kelimanya sama dengan query SQL padanannya. <code>.sum()</code> pada mask menghitung jumlah True, karena True dihitung 1 dan False 0. Ongkir di rentang itu hanya 12000 (3875 pesanan) dan 15000 (990 pesanan); 3875 + 990 = 4865." }],
    },
    {
      title: "loc dan iloc",
      html: `<p>Ada dua cara memilih baris dan kolom sekaligus:</p>
<ul><li><code>df.loc[baris, kolom]</code> memilih berdasarkan <b>label</b> index dan nama kolom. Bagian baris boleh berupa mask boolean. Kalau dipotong dengan <code>loc[2:4]</code>, label akhir <b>ikut</b>, berbeda dengan slicing list.</li>
<li><code>df.iloc[baris, kolom]</code> memilih berdasarkan <b>posisi</b> (0, 1, 2, ...). <code>iloc[2:4]</code> mengambil posisi 2 dan 3, seperti slicing list.</li></ul>
<p>Setelah difilter, index tidak dinomori ulang. Pesanan batal pertama ada di label 4, jadi pada hasil filter <code>loc[4]</code> dan <code>iloc[0]</code> menunjuk baris yang sama.</p>
<p>Perubahan penting di pandas 3.0: <i>Copy-on-Write</i> menjadi satu-satunya mode. Artinya, hasil setiap pemilihan baris atau kolom selalu berperilaku sebagai salinan. Mengubah hasil itu tidak mengubah DataFrame asalnya. Akibatnya, penulisan bertingkat seperti <code>df[mask]["kolom"] = 0</code> tidak pernah mengubah <code>df</code> (pandas memberi peringatan <code>ChainedAssignmentError</code>). Ubah dalam satu langkah dengan <code>df.loc[mask, "kolom"] = 0</code>.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
batal = orders[orders["status"] == "cancelled"]
print(batal.index[:3].tolist())
print(batal.loc[4, "order_id"], batal.iloc[0]["order_id"])
print(orders.loc[2:4, "order_id"].tolist(), orders.iloc[2:4]["order_id"].tolist())

batal["shipping_fee"] = 0
print(batal["shipping_fee"].sum(), orders.loc[orders["status"] == "cancelled", "shipping_fee"].sum())`, note: "<code>loc[2:4]</code> memberi 3 pesanan, <code>iloc[2:4]</code> memberi 2. Baris terakhir: <code>batal</code> berubah menjadi 0, sedangkan ongkir pesanan batal di <code>orders</code> tetap 9.108.000." }],
    },
    {
      title: "Kolom baru dengan operasi vektor",
      html: `<p><code>df["baru"] = ...</code> membuat kolom baru. Ekspresi di kanan dihitung untuk seluruh kolom sekaligus. Cara ini disebut <b>operasi vektor</b>. Tidak perlu <code>for</code> per baris. Menurut dokumentasi pandas, operasi vektor jauh lebih cepat daripada perulangan per baris di Python, karena dikerjakan oleh NumPy.</p>
<p>Nilai satu baris <code>app.order_items</code> adalah <code>qty * unit_price - discount</code> (diskon dalam rupiah, bukan persen).</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

items = pd.read_csv("/data/app/order_items.csv")
items["line_total"] = items["qty"] * items["unit_price"] - items["discount"]
print(items[["order_id", "qty", "unit_price", "discount", "line_total"]].head(3).to_string(index=False))
print(items["line_total"].sum())`, note: "Total 5.782.717.000, sama dengan <code>select sum(qty * unit_price - discount) from app.order_items</code>." }],
    },
    {
      title: "Mengurutkan dan mengambil n teratas",
      html: `<p><code>sort_values("kolom")</code> mengurutkan dari kecil ke besar, seperti ORDER BY. <code>ascending=False</code> membalik urutannya. Untuk beberapa kolom, beri list: <code>sort_values(["brand", "list_price"])</code>. Lalu <code>head(n)</code> mengambil n baris pertama, seperti LIMIT.</p>
<p>Hati-hati dengan nilai seri (sama besar). Produk 8 dan 20 sama-sama berharga 505.900. Kalau batas n jatuh di antara keduanya, produk mana yang terambil tidak dijamin. Tambahkan kolom kedua sebagai penentu, seperti di SQL.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

products = pd.read_csv("/data/app/products.csv")
termahal = products.sort_values("list_price", ascending=False).head(3)
print(termahal[["product_id", "product_name", "list_price"]].to_string(index=False))`, note: "Padanannya <code>select product_id, product_name, list_price from app.products order by list_price desc limit 3</code>." }],
    },
    {
      title: "Mengelompokkan: groupby dan agg",
      html: `<p><code>df.groupby("kolom")</code> membagi baris per nilai kolom itu, seperti GROUP BY. Setelahnya, <code>.agg()</code> menghitung ringkasan per kelompok. Bentuk yang disarankan dokumentasi pandas adalah <i>named aggregation</i>: <code>nama_hasil=("kolom", "fungsi")</code>. Nama di kiri menjadi nama kolom hasil. Fungsi yang sering dipakai: <code>"sum"</code>, <code>"mean"</code>, <code>"min"</code>, <code>"max"</code>, <code>"count"</code> (nilai tidak kosong), <code>"size"</code> (semua baris, termasuk yang kosong), dan <code>"nunique"</code> (jumlah nilai unik, seperti COUNT DISTINCT).</p>
<p>Kunci kelompok menjadi index hasil. <code>.reset_index()</code> mengubahnya kembali menjadi kolom biasa.</p>
<p>Dua jalan pintas: <code>s.value_counts()</code> menghitung baris per nilai, urut dari yang terbanyak. <code>s.nunique()</code> menghitung jumlah nilai unik.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
selesai = orders[orders["status"] == "completed"]
per_kanal = selesai.groupby("channel").agg(
    jumlah=("order_id", "size"),
    total_ongkir=("shipping_fee", "sum"),
    rata_ongkir=("shipping_fee", "mean"),
).reset_index()
print(per_kanal.round(2).to_string(index=False))
print(orders["customer_id"].nunique())`, note: "Sama dengan <code>select channel, count(*), sum(shipping_fee), round(avg(shipping_fee), 2) from app.orders where status = 'completed' group by channel</code>: android 4904, ios 2137, web 3838. Ada 1410 pelanggan yang pernah memesan." }],
    },
    {
      title: "Kelompok kosong: groupby membuang NaN",
      html: `<p>Ini perbedaan penting dengan SQL. Di SQL, GROUP BY membuat satu kelompok untuk NULL. Menurut dokumentasi pandas, <code>groupby</code> secara bawaan <b>membuang</b> kunci NaN (<code>dropna=True</code>). <code>value_counts()</code> juga membuang NaN secara bawaan. Kalau kelompok kosong perlu dihitung, beri <code>dropna=False</code>.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
print(orders.groupby("voucher_code").size())
print(orders.groupby("voucher_code", dropna=False).size())`, note: "Hasil pertama hanya 3 kelompok voucher. Hasil kedua punya kelompok NaN berisi 9967 pesanan, sama dengan baris NULL di <code>select voucher_code, count(*) from app.orders group by voucher_code</code>." }],
    },
    {
      title: "Menggabung tabel: merge",
      html: `<p><code>kiri.merge(kanan, on="kolom", how="...")</code> menggabung dua DataFrame, seperti JOIN. <code>on</code> adalah kolom kunci yang sama di kedua tabel. <code>how</code> bawaannya <code>"inner"</code> (INNER JOIN); <code>"left"</code> sama dengan LEFT JOIN. Kolom bernama sama yang bukan kunci diberi akhiran <code>_x</code> dan <code>_y</code>.</p>
<p><code>validate=</code> memeriksa keunikan kunci <b>sebelum</b> merge. <code>"many_to_one"</code> berarti kunci di tabel kanan harus unik; <code>"one_to_one"</code> berarti unik di kedua tabel. Kalau syaratnya dilanggar, merge berhenti dengan error <code>MergeError</code>. Ini cara murah untuk memastikan grain hasil tidak berubah tanpa disadari.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

items = pd.read_csv("/data/app/order_items.csv")
products = pd.read_csv("/data/app/products.csv")
items["line_total"] = items["qty"] * items["unit_price"] - items["discount"]

gabung = items.merge(products[["product_id", "brand"]], on="product_id", how="inner", validate="many_to_one")
print(len(gabung))
per_merek = gabung.groupby("brand").agg(baris=("line_total", "size"), omzet=("line_total", "sum")).reset_index()
print(per_merek.sort_values("omzet", ascending=False).head(3).to_string(index=False))`, note: "Jumlah baris tetap 28495, sama dengan <code>app.order_items</code>: setiap produk hanya muncul sekali di <code>app.products</code>. Tiga merek teratas (Lumbung, Cendana, Kirana) sama dengan query JOIN + GROUP BY + ORDER BY + LIMIT 3." }],
    },
    {
      title: "Anti-join dengan indicator",
      html: `<p><code>indicator=True</code> menambah kolom <code>_merge</code> yang menunjukkan asal setiap baris: <code>both</code> (kunci ada di kedua tabel), <code>left_only</code> (hanya di kiri), atau <code>right_only</code> (hanya di kanan). Left merge lalu ambil <code>left_only</code> adalah <b>anti-join</b>, padanan NOT EXISTS.</p>
<p>Kunci di tabel kanan dibuat unik dulu dengan <code>drop_duplicates()</code> (dibahas di bawah), supaya tidak ada baris berlipat.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
payments = pd.read_csv("/data/app/payments.csv")
dibayar = payments[["order_id"]].drop_duplicates()
cek = orders.merge(dibayar, on="order_id", how="left", indicator=True)
belum = cek[cek["_merge"] == "left_only"]
print(len(belum))
for status, n in belum["status"].value_counts().items():
    print(status, n)`, note: "519 pesanan tanpa pembayaran: 513 dibatalkan, 4 dikirim, 2 diproses. Sama dengan <code>select count(*) from app.orders o where not exists (select 1 from app.payments p where p.order_id = o.order_id)</code>." }],
    },
    {
      title: "Baris berlipat saat merge",
      html: `<p>Jebakan yang sama dengan bab JOIN SQL. Menurut kamus data, satu pesanan bisa punya dua pembayaran. Di <code>app.payments</code> ada 227 pesanan seperti itu. Kalau <code>orders</code> di-merge dengan <code>payments</code>, pesanan itu muncul dua kali, dan ongkirnya ikut terjumlah dua kali. Merge tidak error; angkanya saja yang salah.</p>
<p>Cara mencegahnya:</p>
<ul><li>Pasang <code>validate="one_to_one"</code> kalau kamu mengira kuncinya unik. Merge langsung gagal kalau dugaanmu salah.</li>
<li>Ringkas tabel "banyak" dulu, atau saring dengan <code>isin</code> tanpa merge.</li></ul>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
payments = pd.read_csv("/data/app/payments.csv")

salah = orders.merge(payments, on="order_id")
print(len(salah), salah["shipping_fee"].sum())

benar = orders[orders["order_id"].isin(payments["order_id"])]
print(len(benar), benar["shipping_fee"].sum())

try:
    orders.merge(payments, on="order_id", validate="one_to_one")
except Exception as e:
    print(type(e).__name__)`, note: "Merge memberi 11715 baris dan ongkir 147.559.000. Yang benar 11488 pesanan dengan ongkir 144.809.000; selisihnya 2.750.000. Kedua angka sama dengan SQL: JOIN biasa memberi 147.559.000, dan <code>where exists</code> memberi 144.809.000." }],
    },
    {
      title: "Membuang baris kembar: drop_duplicates",
      html: `<p><code>df.drop_duplicates()</code> membuang baris yang sama persis di semua kolom. <code>subset=</code> membatasi kolom yang dibandingkan. <code>keep="first"</code> (bawaan) menyimpan kemunculan pertama, <code>"last"</code> yang terakhir, dan <code>False</code> membuang semuanya. Hasilnya DataFrame baru; yang asli tidak berubah.</p>
<p>Karena "pertama" mengikuti urutan baris, urutkan dulu. Contoh di bawah mengambil pesanan pertama setiap pelanggan, padanan <code>row_number() over (partition by customer_id order by order_ts, order_id) = 1</code>.</p>`,
      examples: [{ lang: "py", code: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
pertama = orders.sort_values(["order_ts", "order_id"]).drop_duplicates(subset="customer_id")
print(len(pertama))
for kanal, n in pertama["channel"].value_counts().items():
    print(kanal, n)`, note: "1410 baris, satu per pelanggan: android 664, web 476, ios 270. Angkanya sama dengan query <code>row_number()</code> di atas. <code>order_ts</code> bertipe teks berformat <code>YYYY-MM-DD HH:MM:SS</code>, jadi urutan teksnya sama dengan urutan waktu." }],
    },
    {
      title: "NaN, None, isna, dan fillna",
      html: `<p>pandas memakai NaN untuk nilai kosong. Menurut panduan migrasi pandas 3.0, None di kolom teks juga diubah menjadi NaN. Jadi jangan memeriksa nilai kosong dengan <code>is None</code>.</p>
<p>NaN juga tidak sama dengan dirinya sendiri. Dokumentasi NumPy menulis <code>np.nan == np.nan</code> selalu False. Akibatnya, <code>df["voucher_code"] == np.nan</code> tidak menemukan satu baris pun, seperti <code>= NULL</code> di SQL. Pakai <code>.isna()</code> (seperti IS NULL) atau <code>.notna()</code> (IS NOT NULL).</p>
<p><code>.fillna(nilai)</code> mengganti NaN dengan nilai lain, seperti COALESCE. Fungsi hitung seperti <code>.sum()</code> dan <code>.mean()</code> melewati NaN secara bawaan, seperti SUM dan AVG di SQL.</p>`,
      examples: [{ lang: "py", code: `import numpy as np
import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
v = orders["voucher_code"]
print(np.nan == np.nan, (v == np.nan).sum(), v.isna().sum())
print(v.iloc[0], v.iloc[0] is None)
for kode, n in v.fillna("TANPA VOUCHER").value_counts().items():
    print(kode, n)`, note: "<code>(v == np.nan).sum()</code> memberi 0, sedangkan <code>isna()</code> menemukan 9967. Voucher pesanan pertama tercetak <code>nan</code>, dan <code>is None</code> memberi False." }],
    },
    {
      title: "Padanan SQL",
      html: `<div class="tw"><table class="t"><tr><th>SQL</th><th>pandas</th></tr>
<tr><td><code>SELECT a, b</code></td><td><code>df[["a", "b"]]</code></td></tr>
<tr><td><code>WHERE a = 1 AND b IN (...)</code></td><td><code>df[(df["a"] == 1) &amp; df["b"].isin([...])]</code></td></tr>
<tr><td><code>BETWEEN</code>, <code>NOT</code></td><td><code>.between(x, y)</code>, <code>~</code></td></tr>
<tr><td><code>IS NULL</code>, <code>COALESCE</code></td><td><code>.isna()</code>, <code>.fillna()</code></td></tr>
<tr><td><code>ORDER BY a DESC LIMIT n</code></td><td><code>.sort_values("a", ascending=False).head(n)</code></td></tr>
<tr><td><code>GROUP BY</code> + agregasi</td><td><code>.groupby("a").agg(nama=("kolom", "fungsi"))</code>; NULL ikut hanya dengan <code>dropna=False</code></td></tr>
<tr><td><code>COUNT(DISTINCT a)</code></td><td><code>df["a"].nunique()</code></td></tr>
<tr><td><code>JOIN</code>, <code>LEFT JOIN</code></td><td><code>.merge(..., on=..., how="inner")</code>, <code>how="left"</code></td></tr>
<tr><td><code>NOT EXISTS</code></td><td><code>how="left", indicator=True</code>, lalu <code>_merge == "left_only"</code></td></tr>
<tr><td><code>DISTINCT</code></td><td><code>.drop_duplicates()</code></td></tr></table></div>`,
    },
  ],
  tsql: [],
  summary: [
    "DataFrame adalah tabel berlabel; satu kolomnya adalah Series. <code>pd.read_csv</code> membaca CSV, sel kosong menjadi NaN.",
    "Periksa <code>shape</code>, <code>columns</code>, dan <code>dtypes</code> setiap kali membaca berkas. Kolom bulat yang punya NaN menjadi float64, dan teks berisi angka bisa kehilangan 0 di depan. Teks bertipe <code>str</code> di pandas 3.0.",
    "Filter dengan mask boolean: <code>&amp;</code>, <code>|</code>, <code>~</code>, dengan kurung di setiap syarat. <code>isin</code> = IN, <code>between</code> = BETWEEN (kedua batas ikut).",
    "<code>loc</code> memilih berdasarkan label (potongan menyertakan label akhir), <code>iloc</code> berdasarkan posisi. Dengan Copy-on-Write, ubah data dalam satu langkah: <code>df.loc[mask, \"kolom\"] = nilai</code>.",
    "Kolom baru dihitung dengan operasi vektor, tanpa perulangan. <code>sort_values</code> + <code>head(n)</code> = ORDER BY + LIMIT.",
    "<code>groupby().agg(nama=(\"kolom\", \"fungsi\"))</code> = GROUP BY. Bedanya, kunci NaN dibuang kecuali <code>dropna=False</code>.",
    "<code>merge</code> = JOIN. Pasang <code>validate=</code> untuk menangkap baris berlipat, dan <code>indicator=True</code> untuk anti-join.",
    "NaN tidak sama dengan dirinya sendiri: pakai <code>isna()</code>, bukan <code>== np.nan</code> atau <code>is None</code>. Cocokkan setiap angka dengan query SQL padanannya.",
  ],
  drills: [
    { id: "py-05-01", kind: "choice", prompt: "<code>orders</code> adalah DataFrame. Apa tipe <code>orders[\"status\"]</code> dan <code>orders[[\"status\"]]</code>?", options: ["Keduanya Series", "Series, lalu DataFrame", "DataFrame, lalu Series", "Keduanya DataFrame"], answer: 1, why: "Satu nama kolom di dalam kurung siku memberi Series (satu kolom). List nama kolom, walaupun isinya satu, memberi DataFrame.", hint: "Perhatikan jumlah kurung siku." },
    { id: "py-05-02", kind: "choice", prompt: "Apa yang terjadi saat <code>orders[(orders[\"status\"] == \"completed\") and (orders[\"channel\"] == \"web\")]</code> dijalankan?", options: ["Memberi 3838 pesanan web yang selesai", "Error ValueError: The truth value of a Series is ambiguous", "Memberi semua pesanan", "Memberi DataFrame kosong"], answer: 1, why: "<code>and</code> meminta satu nilai True/False dari setiap sisi, padahal Series berisi banyak nilai. pandas menolaknya dengan ValueError. Pakai <code>&amp;</code>, dengan kurung di setiap syarat.", hint: "Operator gabungan syarat di pandas berbeda dengan di Python biasa." },
    { id: "py-05-03", kind: "py", prompt: "Baca <code>/data/app/orders.csv</code> ke variabel <code>orders</code>. Cetak dua baris: (1) <code>orders.shape</code>, yaitu <code>(12007, 9)</code>; (2) list tiga nama kolom pertama, yaitu <code>['order_id', 'customer_id', 'order_ts']</code>.", start: "import pandas as pd\n\n", solution: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
print(orders.shape)
print(list(orders.columns)[:3])`, why: "<code>shape</code> berisi (jumlah baris, jumlah kolom). <code>columns</code> diubah menjadi list dengan <code>list()</code>, lalu dipotong dengan slicing <code>[:3]</code>.", hint: "<code>pd.read_csv(alamat)</code>, lalu <code>shape</code> dan <code>columns</code>." },
    { id: "py-05-04", kind: "py", prompt: "Hitung pesanan berstatus <code>returned</code> yang dibuat lewat kanal <code>android</code>. Cetak satu angka: <code>154</code>.", start: "import pandas as pd\n\norders = pd.read_csv(\"/data/app/orders.csv\")\n", solution: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
mask = (orders["status"] == "returned") & (orders["channel"] == "android")
print(mask.sum())`, why: "Dua syarat digabung dengan <code>&amp;</code>, masing-masing diberi kurung. Jumlah True di mask sama dengan jumlah baris yang cocok; <code>len(orders[mask])</code> juga benar. SQL: <code>select count(*) from app.orders where status = 'returned' and channel = 'android'</code> memberi 154.", hint: "Buat mask dengan <code>&amp;</code>, lalu hitung True-nya." },
    { id: "py-05-05", kind: "py", prompt: "Hitung pesanan yang ongkirnya (<code>shipping_fee</code>) dari 20000 sampai 30000 (kedua batas ikut) DAN statusnya <code>completed</code> atau <code>returned</code>. Pakai <code>between</code> dan <code>isin</code>. Cetak satu angka: <code>1326</code>.", start: "import pandas as pd\n\norders = pd.read_csv(\"/data/app/orders.csv\")\n", solution: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
mask = orders["shipping_fee"].between(20000, 30000) & orders["status"].isin(["completed", "returned"])
print(mask.sum())`, why: "<code>between(20000, 30000)</code> menyertakan kedua batas, seperti BETWEEN. <code>isin</code> sama dengan IN. Hasilnya sama dengan <code>where shipping_fee between 20000 and 30000 and status in ('completed', 'returned')</code>.", hint: "<code>between</code> dan <code>isin</code> sudah menghasilkan mask, jadi tinggal digabung dengan <code>&amp;</code>." },
    { id: "py-05-06", kind: "py", prompt: "Dari <code>/data/app/order_items.csv</code>, buat kolom <code>line_total</code> = <code>qty * unit_price - discount</code>. Cetak dua baris: (1) jumlah <code>line_total</code> untuk <code>product_id</code> 137 (<code>810317700</code>); (2) jumlah <code>qty</code> produk itu (<code>4920</code>).", start: "import pandas as pd\n\nitems = pd.read_csv(\"/data/app/order_items.csv\")\n", solution: `import pandas as pd

items = pd.read_csv("/data/app/order_items.csv")
items["line_total"] = items["qty"] * items["unit_price"] - items["discount"]
produk = items[items["product_id"] == 137]
print(produk["line_total"].sum())
print(produk["qty"].sum())`, why: "Kolom baru dihitung dengan operasi vektor untuk semua 28495 baris sekaligus, lalu disaring. SQL: <code>select sum(qty * unit_price - discount), sum(qty) from app.order_items where product_id = 137</code>.", hint: "Buat kolomnya dulu, saring baris produk 137, lalu <code>.sum()</code> dua kolom." },
    { id: "py-05-07", kind: "py", prompt: "Kelompokkan <code>orders</code> per <code>status</code> dengan named aggregation: kolom <code>jumlah</code> (banyak baris) dan <code>total_ongkir</code> (jumlah <code>shipping_fee</code>). Jadikan <code>status</code> kolom biasa, urutkan menurut <code>status</code> (A–Z), lalu cetak dengan <code>print(hasil.to_string(index=False))</code>. Kolomnya berurutan: status, jumlah, total_ongkir.", start: "import pandas as pd\n\norders = pd.read_csv(\"/data/app/orders.csv\")\n", solution: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
hasil = orders.groupby("status").agg(
    jumlah=("order_id", "size"),
    total_ongkir=("shipping_fee", "sum"),
).reset_index().sort_values("status")
print(hasil.to_string(index=False))`, why: "Named aggregation memberi nama kolom hasil langsung. <code>reset_index()</code> memindahkan <code>status</code> dari index menjadi kolom. Padanannya <code>select status, count(*), sum(shipping_fee) from app.orders group by status order by status</code>: cancelled 747, completed 10879, processing 13, returned 319, shipped 49.", hint: "<code>.agg(jumlah=(\"order_id\", \"size\"), total_ongkir=(\"shipping_fee\", \"sum\"))</code>." },
    { id: "py-05-08", kind: "py", prompt: "Dari <code>/data/app/payments.csv</code>, hitung jumlah transaksi per <code>method</code> dengan <code>value_counts()</code>. Cetak satu baris per cara bayar, format <code>method jumlah</code> (dipisah satu spasi), urut dari yang terbanyak. Baris pertama <code>ewallet 4112</code>.", start: "import pandas as pd\n\npayments = pd.read_csv(\"/data/app/payments.csv\")\n", solution: `import pandas as pd

payments = pd.read_csv("/data/app/payments.csv")
for method, n in payments["method"].value_counts().items():
    print(method, n)`, why: "<code>value_counts()</code> mengurutkan dari jumlah terbanyak. <code>.items()</code> memberi pasangan (nilai, jumlah) seperti dict, sehingga bisa dicetak dengan <code>for</code>. SQL: <code>select method, count(*) from app.payments group by method order by 2 desc</code>.", hint: "<code>for kunci, n in series.items():</code>" },
    { id: "py-05-09", kind: "py", prompt: "Cari pelanggan di <code>/data/app/customers.csv</code> yang belum pernah memesan (tidak ada di <code>orders</code>), dengan left merge dan <code>indicator=True</code>. Cetak dua baris: (1) jumlahnya (<code>90</code>); (2) list 5 <code>customer_id</code> terkecil (<code>[14, 18, 37, 46, 54]</code>).", start: "import pandas as pd\n\ncustomers = pd.read_csv(\"/data/app/customers.csv\")\norders = pd.read_csv(\"/data/app/orders.csv\")\n", solution: `import pandas as pd

customers = pd.read_csv("/data/app/customers.csv")
orders = pd.read_csv("/data/app/orders.csv")
pemesan = orders[["customer_id"]].drop_duplicates()
cek = customers.merge(pemesan, on="customer_id", how="left", indicator=True)
belum = cek[cek["_merge"] == "left_only"]
print(len(belum))
print(belum["customer_id"].sort_values().head(5).tolist())`, why: "Kunci di kanan dibuat unik dulu supaya tidak ada baris berlipat. Baris <code>left_only</code> adalah pelanggan tanpa pesanan, padanan <code>where not exists (select 1 from app.orders o where o.customer_id = c.customer_id)</code>.", hint: "Merge <code>how=\"left\"</code>, <code>indicator=True</code>, lalu saring <code>_merge == \"left_only\"</code>." },
    { id: "py-05-10", kind: "py", level: "wawancara", prompt: "Kode ini dimaksudkan menghitung total ongkir pesanan yang punya minimal satu pembayaran berstatus <code>success</code>, tetapi hasilnya 144693000, terlalu besar. Perbaiki supaya mencetak angka yang benar: <code>141943000</code>.", start: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
payments = pd.read_csv("/data/app/payments.csv")
sukses = payments[payments["status"] == "success"]
gabung = orders.merge(sukses, on="order_id")
print(gabung["shipping_fee"].sum())
`, solution: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
payments = pd.read_csv("/data/app/payments.csv")
sukses = payments[payments["status"] == "success"]
dibayar = orders[orders["order_id"].isin(sukses["order_id"])]
print(dibayar["shipping_fee"].sum())`, why: "Ada 227 pesanan yang punya dua pembayaran success. Merge menyalin pesanan itu dua kali, sehingga ongkirnya terjumlah dua kali (baris berlipat). <code>isin</code> hanya menyaring <code>orders</code>, jadi setiap pesanan dihitung sekali. Cara lain: merge dengan <code>sukses[[\"order_id\"]].drop_duplicates()</code>. SQL padanannya <code>where order_id in (select order_id from app.payments where status = 'success')</code>.", hint: "Satu pesanan bisa punya dua pembayaran. Pakai cara yang tidak menambah baris <code>orders</code>." },
    { id: "py-05-11", kind: "py", level: "wawancara", prompt: "Untuk setiap <code>brand</code>, cari 2 produk dengan omzet terbesar. Omzet = jumlah <code>qty * unit_price - discount</code> di <code>order_items</code>, dan brand diambil dari <code>products</code>. Hasilnya DataFrame <code>hasil</code> dengan kolom <code>brand</code>, <code>product_id</code>, <code>omzet</code>, urut menurut brand (A–Z) lalu omzet (terbesar dulu). Cetak dengan <code>print(hasil.to_string(index=False))</code>.", start: "import pandas as pd\n\nitems = pd.read_csv(\"/data/app/order_items.csv\")\nproducts = pd.read_csv(\"/data/app/products.csv\")\n", solution: `import pandas as pd

items = pd.read_csv("/data/app/order_items.csv")
products = pd.read_csv("/data/app/products.csv")
items["line_total"] = items["qty"] * items["unit_price"] - items["discount"]
gabung = items.merge(products[["product_id", "brand"]], on="product_id", validate="many_to_one")
per_produk = gabung.groupby(["brand", "product_id"]).agg(omzet=("line_total", "sum")).reset_index()
teratas = per_produk.sort_values("omzet", ascending=False).groupby("brand").head(2)
hasil = teratas.sort_values(["brand", "omzet"], ascending=[True, False])
print(hasil.to_string(index=False))`, why: "Langkahnya: hitung omzet per (brand, produk), urutkan dari omzet terbesar, lalu <code>groupby(\"brand\").head(2)</code> mengambil 2 baris pertama setiap brand. Padanan SQL-nya <code>row_number() over (partition by brand order by omzet desc) &lt;= 2</code>. Hasilnya sama dengan query itu: misalnya Lumbung produk 137 (810.317.700) dan 71. Tidak ada omzet seri di dua posisi teratas setiap brand, jadi hasilnya pasti.", hint: "groupby dua kolom untuk omzet, urutkan, lalu <code>.groupby(\"brand\").head(2)</code>. Urutkan ulang untuk dicetak." },
    { id: "py-05-12", kind: "number", prompt: "Berapa pelanggan unik yang pernah membuat pesanan lewat kanal <code>ios</code>? Hitung dengan pandas.", answerPy: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
print(orders.loc[orders["channel"] == "ios", "customer_id"].nunique())`, why: "Saring baris ios, lalu <code>nunique()</code> pada <code>customer_id</code>: 1007. Sama dengan <code>select count(distinct customer_id) from app.orders where channel = 'ios'</code>.", hint: "<code>loc[mask, \"customer_id\"]</code> lalu <code>nunique()</code>." },
    { id: "py-05-13", kind: "choice", prompt: "Apa yang terjadi pada <code>orders.merge(payments, on=\"order_id\", validate=\"one_to_one\")</code> dengan data TokoKita?", options: ["Berhasil, 12007 baris", "Berhasil, 11715 baris", "Error MergeError, karena ada order_id yang muncul dua kali di payments", "Baris kembar dibuang otomatis"], answer: 2, why: "<code>validate</code> memeriksa keunikan kunci sebelum merge. 227 pesanan punya dua pembayaran, jadi <code>order_id</code> di <code>payments</code> tidak unik dan merge dihentikan. Tanpa <code>validate</code>, merge berhasil dengan 11715 baris berlipat.", hint: "<code>one_to_one</code> menuntut kunci unik di kedua tabel." },
    { id: "py-05-14", kind: "py", prompt: "Ganti voucher kosong di <code>orders</code> dengan teks <code>TANPA VOUCHER</code>, lalu hitung jumlah pesanan per voucher dengan <code>value_counts()</code>. Cetak satu baris per voucher, format <code>kode jumlah</code>, urut dari yang terbanyak. Baris pertama <code>TANPA VOUCHER 9967</code>.", start: "import pandas as pd\n\norders = pd.read_csv(\"/data/app/orders.csv\")\n", solution: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
for kode, n in orders["voucher_code"].fillna("TANPA VOUCHER").value_counts().items():
    print(kode, n)`, why: "Tanpa <code>fillna</code>, <code>value_counts()</code> membuang NaN dan pesanan tanpa voucher tidak terhitung. <code>fillna</code> mirip <code>coalesce(voucher_code, 'TANPA VOUCHER')</code>. Hasilnya TANPA VOUCHER 9967, HEMAT10 1044, GRATISONGKIR 772, RAMADAN25 224.", hint: "<code>.fillna(\"TANPA VOUCHER\")</code> sebelum <code>.value_counts()</code>." },
    { id: "py-05-15", kind: "py", prompt: "Ambil pesanan pertama setiap pelanggan: urutkan <code>orders</code> menurut <code>order_ts</code> lalu <code>order_id</code>, kemudian buang <code>customer_id</code> kembar dengan <code>drop_duplicates</code>. Cetak jumlah barisnya (<code>1410</code>), lalu satu baris per kanal pesanan pertama itu, format <code>kanal jumlah</code>, urut dari yang terbanyak.", start: "import pandas as pd\n\norders = pd.read_csv(\"/data/app/orders.csv\")\n", solution: `import pandas as pd

orders = pd.read_csv("/data/app/orders.csv")
pertama = orders.sort_values(["order_ts", "order_id"]).drop_duplicates(subset="customer_id")
print(len(pertama))
for kanal, n in pertama["channel"].value_counts().items():
    print(kanal, n)`, why: "<code>drop_duplicates(subset=\"customer_id\")</code> menyimpan kemunculan pertama (bawaan <code>keep=\"first\"</code>). Karena data sudah diurutkan, yang tersimpan adalah pesanan paling awal. Hasilnya android 664, web 476, ios 270, sama dengan query <code>row_number() over (partition by customer_id order by order_ts, order_id) = 1</code>.", hint: "Urutkan dulu, baru <code>drop_duplicates(subset=...)</code>." },
    { id: "py-05-16", kind: "explain", level: "wawancara", prompt: "<code>orders.groupby(\"voucher_code\").size()</code> memberi 3 baris, sedangkan <code>select voucher_code, count(*) from app.orders group by voucher_code</code> memberi 4 baris. Jelaskan penyebabnya dan cara menyamakan hasilnya. Jelaskan juga kenapa <code>(orders[\"voucher_code\"] == np.nan).sum()</code> memberi 0.", model: "Sel voucher yang kosong dibaca pandas sebagai NaN. Secara bawaan <code>groupby</code> membuang kunci NaN (<code>dropna=True</code>), sedangkan GROUP BY di SQL membuat satu kelompok untuk NULL. Hasil SQL punya baris keempat untuk 9967 pesanan tanpa voucher. Untuk menyamakan, pakai <code>groupby(\"voucher_code\", dropna=False)</code>, atau ganti NaN dengan <code>fillna</code> dulu. <code>== np.nan</code> memberi 0 karena NaN tidak pernah sama dengan apa pun, termasuk dirinya sendiri, seperti <code>= NULL</code> di SQL. Nilai kosong dicari dengan <code>isna()</code>.", hint: "Apa yang dilakukan groupby pada kunci kosong secara bawaan? Dan apa hasil <code>np.nan == np.nan</code>?" },
  ],
};
