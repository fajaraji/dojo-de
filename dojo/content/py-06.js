// Bab 6 Python: pandas 2 — membersihkan data mentah (raw.supplier_price_upload, raw.customer_snapshot),
// tipe data (str pandas 3, to_numeric, Int64), tanggal (to_datetime, .dt, resample), drop_duplicates,
// validasi sederhana, dan Parquet (to_parquet/read_parquet, pyarrow.parquet).
// Fakta pandas dicek lewat Context7 /pandas-dev/pandas (user_guide/text.rst, basics.rst, integer_na.rst,
// timeseries.rst, indexing.rst, io.rst, scale.rst, whatsnew/v2.0.0.rst, v3.0.0.rst, pandas/core/frame.py,
// pandas/io/parquet.py); Parquet lewat /apache/parquet-site (Concepts, File Format); pyarrow lewat /apache/arrow
// (docs/source/python/parquet/parquet.rst, python/pyarrow/parquet/core.py, tests/test_table.py);
// Delta Lake lewat /delta-io/delta (delta-faq.mdx); Fabric lewat /microsoftdocs/fabric-docs (onelake/*).
// Angka dari data dihitung dengan kode Python di Pyodide dan dicocokkan dengan tools/query.mjs.

const BERSIH = `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
sku = "TK-" + u["sku_text"].str.strip().str.upper().str.replace("-", "", regex=False).str[2:]
teks = (u["price_text"].str.removesuffix(",00")
        .str.replace("Rp", "", regex=False).str.replace(" ", "", regex=False)
        .str.replace(".", "", regex=False).str.replace(",", "", regex=False))
harga = pd.to_numeric(teks, errors="coerce")
tgl = pd.to_datetime(u["effective_date_text"], format="%d/%m/%Y", errors="coerce").fillna(
      pd.to_datetime(u["effective_date_text"], format="%Y-%m-%d", errors="coerce"))
bersih = pd.DataFrame({"row_no": u["row_no"], "sku": sku, "harga": harga, "berlaku_mulai": tgl})`;

export default {
  id: "py-06",
  part: "python",
  draft: true, // KERANGKA: masih draf sampai klaim yang belum diverifikasi dicek lewat Context7 (kuota Context7 habis 26 Nov 2026)
  title: "pandas 2: data kotor, tanggal, dan Parquet",
  minutes: 90,
  goals: [
    "Merapikan kolom teks dengan metode <code>.str</code>: <code>strip</code>, <code>upper</code>, <code>replace</code>, <code>removesuffix</code>, dan potongan posisi.",
    "Mengubah teks ke angka dan tanggal dengan <code>pd.to_numeric</code> dan <code>pd.to_datetime</code>, lalu menghitung baris yang gagal diubah.",
    "Memilih tipe data yang tepat: <code>str</code> di pandas 3, <code>float64</code>, dan bilangan bulat yang boleh kosong <code>Int64</code>.",
    "Meringkas data per bulan dengan <code>.dt</code> dan <code>resample</code>, dan mencocokkannya dengan DATE_TRUNC di SQL.",
    "Membuang baris dobel dengan <code>drop_duplicates(subset=, keep=)</code>, termasuk aturan \"ambil versi terbaru\".",
    "Menulis dan membaca Parquet, membandingkan ukurannya dengan CSV, dan membaca metadata berkas dengan <code>pyarrow.parquet</code>.",
  ],
  terms: [
    { term: "data kotor", def: "Data yang isinya benar tetapi cara penulisannya tidak seragam: spasi berlebih, huruf besar/kecil bercampur, format angka atau tanggal berbeda-beda, sel kosong, atau baris dobel." },
    { term: "dtype", def: "Tipe data sebuah kolom pandas, misalnya <code>int64</code>, <code>float64</code>, <code>str</code>, atau <code>datetime64[us]</code>. Singkatan dari <i>data type</i>." },
    { term: "NaN", def: "Penanda nilai kosong yang dipakai pandas untuk kolom angka dan kolom <code>str</code>. Singkatan dari <i>not a number</i>." },
    { term: "NaT", def: "Penanda nilai kosong untuk kolom tanggal di pandas. Singkatan dari <i>not a time</i>." },
    { term: "Int64", def: "Tipe bilangan bulat pandas yang boleh berisi nilai kosong (ditampilkan <code>&lt;NA&gt;</code>), sehingga kolom bilangan bulat tidak berubah menjadi pecahan." },
    { term: "parquet", def: "Format berkas biner yang menyimpan data per kolom, lengkap dengan tipe setiap kolom dan metadata di akhir berkas." },
    { term: "format kolumnar", def: "Cara menyimpan tabel kolom demi kolom, bukan baris demi baris, sehingga pembaca bisa mengambil kolom yang dibutuhkan saja." },
    { term: "row group", def: "Potongan baris di dalam berkas Parquet. Setiap row group berisi satu column chunk untuk setiap kolom." },
    { term: "lakehouse", def: "Penyimpanan berkas dalam jumlah besar (data lake) yang tabelnya bisa di-query seperti gudang data. Dibahas di Bagian 6." },
  ],
  introduces: ["py:import pyarrow"],
  sections: [
    {
      title: "Membaca data mentah dan melihat tipenya",
      html: `<p>Bab ini membersihkan berkas yang sama dengan bab SQL "Teks, tanggal, dan membersihkan data mentah": <code>raw.supplier_price_upload</code>, berkas harga dari pemasok. Isinya <b>data kotor</b>: datanya benar, tetapi cara penulisannya tidak seragam. Hasil akhirnya harus sama dengan hasil SQL.</p>
<p>Setiap kolom DataFrame punya <b>dtype</b> (<i>data type</i>, tipe data). <code>read_csv</code> menebak tipe dari isi berkas. Sejak pandas 3.0, kolom berisi teks otomatis bertipe <code>str</code>. Tipe ini hanya boleh berisi teks atau nilai kosong, dan di mesin Dojo disimpan dengan pyarrow (pustaka Apache Arrow untuk Python). Sel kosong di CSV dibaca sebagai <b>NaN</b> (<i>not a number</i>), penanda nilai kosong pandas.</p>`,
      examples: [
        { lang: "py", code: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
print(u.dtypes)
print(len(u), "baris")
print(u.isna().sum())
print(u.head(4))`,
          note: "Hanya <code>row_no</code> yang dibaca sebagai angka (<code>int64</code>); empat kolom lain bertipe <code>str</code>. Ada 61 baris dan satu sel kosong di <code>price_text</code> (baris 2), yang tampil sebagai NaN. Spasi di <code>'TK10812 '</code> (baris 3) ikut terbaca, karena di berkas CSV teks itu diberi tanda kutip." },
      ],
    },
    {
      title: "Merapikan teks dengan .str",
      html: `<p>Kolom bertipe <code>str</code> punya kumpulan metode teks lewat <code>.str</code>. Setiap metode dijalankan untuk semua baris sekaligus, dan baris yang kosong dilewati (tetap NaN). Padanannya dengan bab SQL:</p>
<ul><li><code>.str.strip()</code> = TRIM, membuang spasi di awal dan akhir.</li>
<li><code>.str.upper()</code> = UPPER.</li>
<li><code>.str.replace("-", "", regex=False)</code> = REPLACE. Tulis <code>regex=False</code> supaya teks yang dicari dibaca apa adanya, bukan sebagai pola khusus (<i>regular expression</i>).</li>
<li><code>.str[2:]</code> mengambil potongan teks mulai posisi 2, seperti slicing pada list, setara SUBSTRING mulai karakter ke-3.</li></ul>
<p>Metode bisa dirangkai: hasil satu metode langsung menjadi masukan metode berikutnya.</p>`,
      examples: [
        { lang: "py", code: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
sku = "TK-" + u["sku_text"].str.strip().str.upper().str.replace("-", "", regex=False).str[2:]
print(pd.DataFrame({"mentah": u["sku_text"], "bersih": sku}).head(5))
print("kode unik mentah:", u["sku_text"].nunique())
print("kode unik bersih:", sku.nunique())`,
          note: "Rumusnya sama dengan bab SQL: buang spasi, huruf besar, buang tanda minus, ambil mulai karakter ke-3, lalu pasang lagi <code>TK-</code>. Sebelum dirapikan ada 58 kode berbeda; sesudahnya 54, sama dengan <code>count(distinct …)</code> di SQL." },
      ],
    },
    {
      title: "Teks menjadi angka: pd.to_numeric dan astype",
      html: `<p>Harga ditulis dalam enam bentuk, misalnya <code>'Rp 63.900'</code>, <code>'34,900'</code>, dan <code>'Rp141.900,00'</code>. Langkahnya sama dengan SQL: buang <code>,00</code> di akhir dengan <code>.str.removesuffix(",00")</code>, buang "Rp", spasi, titik, dan koma, lalu ubah ke angka.</p>
<p>Ada dua cara mengubah tipe. <code>astype("float64")</code> langsung gagal dengan <code>ValueError</code> kalau ada satu saja teks yang bukan angka. <code>pd.to_numeric(kolom, errors="coerce")</code> mengubah teks yang gagal menjadi NaN, sehingga kamu bisa menghitung baris yang gagal lalu memeriksanya. Hasilnya bertipe <code>float64</code> (bilangan pecahan), karena NaN adalah nilai pecahan.</p>`,
      examples: [
        { lang: "py", code: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
try:
    u["price_text"].astype("float64")
except ValueError as e:
    print("astype gagal:", e)

langsung = pd.to_numeric(u["price_text"], errors="coerce")
print("gagal tanpa dibersihkan:", langsung.isna().sum())

teks = (u["price_text"].str.removesuffix(",00")
        .str.replace("Rp", "", regex=False).str.replace(" ", "", regex=False)
        .str.replace(".", "", regex=False).str.replace(",", "", regex=False))
harga = pd.to_numeric(teks, errors="coerce")
print("gagal sesudah dibersihkan:", harga.isna().sum())
print("terisi:", harga.count(), "| total:", int(harga.sum()), "| tipe:", harga.dtype)`,
          note: "Tanpa dibersihkan, 44 dari 61 harga gagal diubah. Sesudah dibersihkan hanya 1 yang kosong, yaitu baris 2 yang memang tidak berisi harga. Jumlahnya 60 harga dengan total 7.499.000, sama dengan <code>count(harga)</code> dan <code>sum(harga)</code> di SQL." },
      ],
    },
    {
      title: "Bilangan bulat yang boleh kosong: Int64",
      html: `<p>Karena NaN adalah nilai pecahan, kolom bilangan bulat yang punya sel kosong dibaca sebagai <code>float64</code>. Contohnya <code>handled_by</code> di <code>app.orders</code> (nomor staf yang menangani pesanan). Nomor staf <code>3.0</code> terlihat aneh, dan nomor yang sangat besar bisa berubah nilainya kalau disimpan sebagai pecahan.</p>
<p>Tipe <b>Int64</b> (huruf I besar) adalah bilangan bulat yang boleh kosong. Nilai kosongnya ditampilkan <code>&lt;NA&gt;</code>. Ubah dengan <code>astype("Int64")</code>.</p>`,
      examples: [
        { lang: "py", code: `import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
print("sebelum:", o["handled_by"].dtype)
o["handled_by"] = o["handled_by"].astype("Int64")
print("sesudah:", o["handled_by"].dtype)
print("kosong:", o["handled_by"].isna().sum(), "dari", len(o))
print(o["handled_by"].dropna().head(3))`,
          note: "10.589 dari 12.007 pesanan tidak ditangani staf. Isinya tetap bilangan bulat, tanpa <code>.0</code>." },
      ],
    },
    {
      title: "Tanggal: pd.to_datetime dengan format",
      html: `<p><code>pd.to_datetime</code> mengubah teks menjadi tanggal bertipe <code>datetime64[us]</code>. Di pandas 3, satuan terkecilnya mikrodetik (<code>us</code>). Tulis bentuk teksnya di <code>format=</code>, misalnya <code>"%d/%m/%Y"</code> untuk 29/09/2025 (<code>%d</code> hari, <code>%m</code> bulan, <code>%Y</code> tahun empat angka). Dengan <code>errors="coerce"</code>, teks yang tidak cocok menjadi <b>NaT</b> (<i>not a time</i>), penanda tanggal kosong.</p>
<p>Berkas pemasok memakai dua format. Caranya: baca dengan format pertama, baca lagi dengan format kedua, lalu isi yang kosong dari hasil pertama dengan hasil kedua memakai <code>fillna</code>.</p>
<p>Dua jalan pintas yang salah:</p>
<ul><li>Tanpa <code>format=</code>, pandas menebak format dari nilai pertama yang terisi, lalu memakai format itu untuk semua baris. Di berkas ini hasilnya error di baris 2.</li>
<li><code>format="mixed"</code> menebak format setiap baris sendiri-sendiri. <code>dayfirst=True</code> berarti "utamakan hari di depan", tetapi aturan ini tidak mutlak. Gabungan keduanya membaca '2025-09-02' sebagai 9 Februari, bukan 2 September, tanpa error sama sekali.</li></ul>`,
      examples: [
        { lang: "py", code: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
teks = u["effective_date_text"]
tgl = pd.to_datetime(teks, format="%d/%m/%Y", errors="coerce").fillna(
      pd.to_datetime(teks, format="%Y-%m-%d", errors="coerce"))
print(tgl.dtype, "| kosong:", tgl.isna().sum())
print("paling awal:", tgl.min(), "| paling akhir:", tgl.max())

tebak = pd.to_datetime(teks, format="mixed", dayfirst=True)
print("salah baca dengan mixed + dayfirst:", (tebak != tgl).sum())
print(teks[2], "dibaca", tebak[2])`,
          note: "Semua 61 tanggal terbaca, dari 1 September sampai 11 Oktober 2025, sama dengan MIN dan MAX di SQL. Cara <code>mixed</code> + <code>dayfirst</code> salah membaca 17 tanggal berformat YYYY-MM-DD yang harinya 12 atau kurang. Kesalahan ini tidak memunculkan error, jadi selalu tulis <code>format=</code>." },
      ],
    },
    {
      title: "Bagian tanggal dan ringkasan per bulan",
      html: `<p>Kolom tanggal punya metode lewat <code>.dt</code>, misalnya <code>.dt.year</code> (tahun) dan <code>.dt.month</code> (nomor bulan), setara EXTRACT di SQL.</p>
<p>Untuk meringkas per bulan, pakai <code>resample("MS", on="kolom")</code>. <code>"MS"</code> (<i>month start</i>) mengelompokkan baris per bulan dan memberi label tanggal 1 setiap bulan, sama seperti <code>date_trunc('month', …)</code>. <code>on=</code> menyebut kolom tanggal yang dipakai. Setelah itu tulis kolom dan cara meringkasnya, seperti pada <code>groupby</code>.</p>`,
      examples: [
        { lang: "py", code: `import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
o["order_ts"] = pd.to_datetime(o["order_ts"], format="%Y-%m-%d %H:%M:%S")
print(o["order_ts"].dt.year.value_counts().sort_index())

o25 = o[o["order_ts"] >= "2025-01-01"]
per_bulan = o25.resample("MS", on="order_ts")["order_id"].count()
print(per_bulan)`,
          note: "6.387 pesanan di 2024 dan 5.620 di 2025. Jumlah per bulan 2025 (546 di Januari sampai 590 di Oktober) sama persis dengan <code>select date_trunc('month', order_ts), count(*) … group by 1</code> di SQL." },
      ],
    },
    {
      title: "Baris dobel: drop_duplicates",
      html: `<p><code>drop_duplicates(subset=[…], keep=…)</code> membuang baris yang nilainya sama di kolom-kolom <code>subset</code>. Tanpa <code>subset</code>, semua kolom dibandingkan. <code>keep</code> menentukan baris mana yang disimpan: <code>"first"</code> (bawaan) menyimpan yang pertama, <code>"last"</code> yang terakhir, dan <code>False</code> membuang semua baris yang punya kembaran. Hasilnya DataFrame baru; DataFrame asal tidak berubah.</p>
<p>Di bab SQL "Mengubah data dengan aman", baris dobel berkas pemasok adalah baris yang kode bersih, teks harga, dan teks tanggalnya sama, dan baris bernomor terkecil disimpan. Di pandas: <code>keep="first"</code> pada data yang urut menurut <code>row_no</code>.</p>
<p>Aturan "ambil versi terbaru" dibuat dengan dua langkah: urutkan menurut tanggal, lalu <code>keep="last"</code>. Contohnya keadaan pelanggan per 30 Juni 2025 dari <code>raw.customer_snapshot</code>.</p>`,
      examples: [
        { lang: "py", code: `${BERSIH}

bersih["price_text"] = u["price_text"]
bersih["date_text"] = u["effective_date_text"]
unik = bersih.drop_duplicates(subset=["sku", "price_text", "date_text"], keep="first")
print("tersisa:", len(unik), "dari", len(bersih))
print("terbuang:", sorted(set(bersih["row_no"]) - set(unik["row_no"])))
print("total harga:", int(unik["harga"].sum()))`,
          note: "Tujuh baris terbuang, yaitu baris 55 sampai 61, dan tersisa 54. Hasilnya sama dengan DELETE di bab SQL. Teks harga dan teks tanggal asli ditambahkan sebagai kolom supaya aturannya persis sama dengan SQL." },
        { lang: "py", code: `import pandas as pd

s = pd.read_csv("/data/raw/customer_snapshot.csv")
s["snapshot_date"] = pd.to_datetime(s["snapshot_date"], format="%Y-%m-%d")
juni = s[s["snapshot_date"] <= "2025-06-30"].sort_values("snapshot_date")

terbaru = juni.drop_duplicates(subset="customer_id", keep="last")
terlama = juni.drop_duplicates(subset="customer_id", keep="first")
print("pelanggan:", len(terbaru))
print("terbaru:", terbaru["segment"].value_counts().sort_index().to_dict())
print("salah pilih keep:", terlama["segment"].value_counts().sort_index().to_dict())`,
          note: "Ada 1.394 pelanggan sampai 30 Juni. Dengan <code>keep=\"last\"</code>, jumlah per segmen (Gold 129, Reguler 856, Silver 409) sama dengan potret 30 Juni di SQL. Dengan <code>keep=\"first\"</code>, setiap pelanggan diambil dari potret pertamanya, sehingga jumlahnya berbeda: Gold 122, Reguler 954, Silver 318." },
      ],
    },
    {
      title: "Validasi sederhana: menghitung baris yang gagal",
      html: `<p>Sebelum data dipakai, hitung berapa baris yang gagal di setiap pemeriksaan. Setiap pemeriksaan menghasilkan Series berisi True/False. Gabungkan dengan <code>|</code> (atau) dan <code>&amp;</code> (dan), lalu balik dengan <code>~</code>. <code>.sum()</code> pada Series True/False menghitung jumlah True. <code>.isin(daftar)</code> bernilai True kalau nilainya ada di daftar, mirip IN di SQL. <code>.duplicated(subset=…)</code> menandai baris kembaran dengan aturan <code>keep</code> yang sama.</p>
<p>Laporkan jumlah per pemeriksaan, bukan hanya totalnya. Satu baris bisa gagal di lebih dari satu pemeriksaan, jadi totalnya bisa lebih kecil dari jumlah semua angka.</p>`,
      examples: [
        { lang: "py", code: `${BERSIH}
p = pd.read_csv("/data/app/products.csv")

harga_kosong = bersih["harga"].isna()
sku_asing = ~bersih["sku"].isin(p["sku"])
dobel = pd.DataFrame({"s": sku, "h": u["price_text"], "t": u["effective_date_text"]}).duplicated()
gagal = harga_kosong | sku_asing | dobel
print("harga kosong:", harga_kosong.sum())
print("kode tidak ada di app.products:", sku_asing.sum(), bersih.loc[sku_asing, "row_no"].tolist())
print("dobel:", dobel.sum())
print("gagal:", gagal.sum(), "| lolos:", (~gagal).sum())`,
          note: "1 harga kosong, 4 kode produk tidak dikenal (baris 51–54, angka yang sama dengan bab SQL), dan 7 baris dobel. Tidak ada baris yang gagal di dua pemeriksaan, jadi 12 baris gagal dan 49 lolos." },
      ],
    },
    {
      title: "Parquet: format kolumnar",
      html: `<p>CSV adalah teks biasa, ditulis baris demi baris. Berkas itu tidak menyimpan tipe kolom, sehingga setiap pembaca harus menebak lagi: tanggal kembali menjadi teks dan <code>Int64</code> kembali menjadi <code>float64</code>.</p>
<p><b>Parquet</b> adalah format berkas biner sumber terbuka dari proyek Apache. Datanya disimpan per kolom (<b>format kolumnar</b>):</p>
<ul><li>Berkas dibagi menjadi satu atau lebih <b>row group</b> (potongan baris). Setiap row group berisi satu <i>column chunk</i> (potongan kolom) untuk setiap kolom.</li>
<li>Di akhir berkas ada metadata: daftar kolom beserta tipenya, letak setiap column chunk, dan statistik seperti nilai terkecil, terbesar, dan jumlah nilai kosong.</li>
<li>Setiap kolom dikompresi sendiri. pandas memakai kompresi <code>snappy</code> kalau tidak diminta lain. Nilai dalam satu kolom bertipe sama dan sering berulang, sehingga mudah dipadatkan.</li></ul>
<p>Tulis dengan <code>df.to_parquet(path, engine="pyarrow", index=False)</code> dan baca dengan <code>pd.read_parquet(path)</code>. Kalau <code>engine</code> tidak ditulis, pandas memakai pyarrow bila tersedia. <code>index=False</code> mencegah nomor baris DataFrame ikut ditulis sebagai kolom.</p>`,
      examples: [
        { lang: "py", code: `import os
import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
for kolom in ["order_ts", "updated_at"]:
    o[kolom] = pd.to_datetime(o[kolom], format="%Y-%m-%d %H:%M:%S")
o["handled_by"] = o["handled_by"].astype("Int64")

o.to_csv("/kerja/orders.csv", index=False)
o.to_parquet("/kerja/orders.parquet", engine="pyarrow", index=False)
csv = os.path.getsize("/kerja/orders.csv")
pq_ = os.path.getsize("/kerja/orders.parquet")
print(f"CSV: {csv} byte | Parquet: {pq_} byte | {round(pq_ / csv * 100)}% dari CSV")

dari_csv = pd.read_csv("/kerja/orders.csv")
dari_pq = pd.read_parquet("/kerja/orders.parquet")
print(pd.DataFrame({"dari CSV": dari_csv.dtypes, "dari Parquet": dari_pq.dtypes}))`,
          note: "Di mesin Dojo, CSV-nya 915.881 byte dan Parquet-nya 321.086 byte, sekitar 35%. Setelah dibaca ulang, Parquet mengembalikan <code>datetime64[us]</code> dan <code>Int64</code> persis seperti saat ditulis; CSV mengembalikan teks dan <code>float64</code>." },
      ],
    },
    {
      title: "Membaca sebagian kolom dan melihat metadata",
      html: `<p>Karena kolom disimpan terpisah, <code>pd.read_parquet(path, columns=[…])</code> hanya membaca kolom yang diminta. Untuk tabel lebar, cara ini jauh lebih hemat waktu dan memori. Di CSV, setiap baris tetap harus dibaca utuh.</p>
<p>Metadata bisa dibaca tanpa membaca datanya dengan modul <code>pyarrow.parquet</code>:</p>
<ul><li><code>pq.read_metadata(path)</code> memberi <code>num_rows</code>, <code>num_columns</code>, dan <code>num_row_groups</code>.</li>
<li><code>.row_group(i).column(j).statistics</code> memberi nilai <code>min</code>, <code>max</code>, dan <code>null_count</code> sebuah column chunk. Mesin query memakai statistik ini untuk melewati row group yang pasti tidak berisi data yang dicari.</li>
<li><code>pq.ParquetFile(path).schema_arrow</code> memberi skema (daftar kolom dan tipenya). <code>.field("nama").type</code> memberi tipe satu kolom.</li></ul>`,
      examples: [
        { lang: "py", code: `import pyarrow.parquet as pq
import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
o["order_ts"] = pd.to_datetime(o["order_ts"], format="%Y-%m-%d %H:%M:%S")
o.to_parquet("/kerja/orders.parquet", index=False)

sebagian = pd.read_parquet("/kerja/orders.parquet", columns=["order_id", "status"])
print(sebagian.shape)

meta = pq.read_metadata("/kerja/orders.parquet")
print("baris:", meta.num_rows, "| kolom:", meta.num_columns, "| row group:", meta.num_row_groups)
st = meta.row_group(0).column(0).statistics
print("order_id min:", st.min, "| max:", st.max, "| kosong:", st.null_count)

skema = pq.ParquetFile("/kerja/orders.parquet").schema_arrow
for nama in ["order_id", "order_ts", "status"]:
    print(nama, skema.field(nama).type)`,
          note: "Hanya 2 kolom yang dibaca. Metadata mencatat 12.007 baris, 9 kolom, 1 row group, dan nomor pesanan 100001–112007. Tipe <code>large_string</code> adalah tipe teks Arrow; <code>timestamp[us]</code> adalah tanggal-jam bersatuan mikrodetik." },
      ],
    },
    {
      title: "Parquet, lakehouse, dan Microsoft Fabric",
      html: `<p>Parquet adalah dasar penyimpanan modern untuk analitik. Delta Lake menyimpan isi tabel sebagai berkas Parquet, ditambah catatan transaksi (folder <code>_delta_log</code>) yang mencatat setiap perubahan. Di Microsoft Fabric, OneLake menyimpan data tabel dalam format Delta Parquet, dan Delta adalah format bawaan tabel di <b>lakehouse</b>. Lakehouse adalah penyimpanan berkas dalam jumlah besar (<i>data lake</i>) yang tabelnya bisa di-query seperti gudang data. Ini materi ujian DP-700.</p>
<p>Delta Lake dan Fabric dibahas rinci di Bagian 6. Untuk sekarang, cukup ingat: tabel di lakehouse pada dasarnya adalah kumpulan berkas Parquet seperti yang baru kamu tulis.</p>`,
    },
  ],
  tsql: [],
  summary: [
    "Lihat dulu dtype dan nilai kosong setiap kolom. Di pandas 3, teks bertipe <code>str</code> dan sel kosong menjadi NaN.",
    "Rangkai metode <code>.str</code> (strip, upper, replace dengan <code>regex=False</code>, removesuffix, potongan posisi) untuk menyeragamkan teks.",
    "<code>pd.to_numeric(…, errors=\"coerce\")</code> dan <code>pd.to_datetime(…, format=…, errors=\"coerce\")</code> mengubah nilai yang gagal menjadi NaN/NaT, sehingga baris gagal bisa dihitung.",
    "Selalu tulis <code>format=</code> untuk tanggal. <code>format=\"mixed\"</code> + <code>dayfirst=True</code> bisa salah membaca tanggal tanpa error.",
    "<code>Int64</code> menjaga bilangan bulat yang boleh kosong. <code>resample(\"MS\", on=…)</code> setara DATE_TRUNC per bulan.",
    "\"Ambil versi terbaru\" = urutkan menurut tanggal, lalu <code>drop_duplicates(subset=kunci, keep=\"last\")</code>.",
    "Parquet menyimpan tipe kolom, lebih kecil dari CSV, bisa dibaca per kolom, dan menjadi dasar Delta Lake dan OneLake.",
  ],
  drills: [
    { id: "py-06-01", kind: "choice", prompt: "Kenapa <code>pd.read_parquet(path, columns=[\"status\"])</code> bisa jauh lebih cepat daripada membaca CSV yang sama lalu memilih kolom <code>status</code>?",
      options: ["Parquet menyimpan data per kolom, jadi kolom lain tidak perlu dibaca", "Parquet selalu berisi lebih sedikit baris", "CSV tidak bisa dibaca pandas tanpa pyarrow", "Parquet menyimpan data sebagai teks biasa"], answer: 0,
      why: "Di Parquet setiap kolom disimpan di column chunk sendiri, dan metadata di akhir berkas mencatat letaknya. Pembaca langsung melompat ke kolom yang diminta. CSV ditulis baris demi baris, sehingga semua baris harus dibaca utuh.", hint: "Ingat arti format kolumnar." },
    { id: "py-06-02", kind: "choice", prompt: "Apa hasil <code>pd.to_numeric(pd.Series([\"12\", \"abc\"]), errors=\"coerce\")</code>?",
      options: ["Error ValueError", "12.0 dan NaN, bertipe float64", "12 dan \"abc\", bertipe str", "Hanya satu baris: 12"], answer: 1,
      why: "Dengan <code>errors=\"coerce\"</code>, teks yang tidak bisa diubah menjadi NaN. Karena ada NaN, hasilnya bertipe float64. Jumlah baris tidak berubah.", hint: "coerce artinya memaksa: yang gagal diganti penanda kosong." },
    { id: "py-06-03", kind: "choice", prompt: "Kolom tanggal berisi '29/09/2025' dan '2025-09-02'. Kode <code>pd.to_datetime(kolom, format=\"mixed\", dayfirst=True)</code> dijalankan tanpa error. Bagaimana '2025-09-02' dibaca?",
      options: ["2 September 2025", "9 Februari 2025", "NaT", "Error"], answer: 1,
      why: "<code>format=\"mixed\"</code> menebak setiap baris sendiri-sendiri, dan <code>dayfirst=True</code> mengutamakan hari di depan. Hasilnya '2025-09-02' dibaca 9 Februari, tanpa error. Di berkas pemasok, 17 tanggal salah baca dengan cara ini. Tulis format untuk setiap bentuk dengan <code>format=</code>.", hint: "Lihat contoh di subjudul tanggal." },
    { id: "py-06-04", kind: "py", prompt: "Dari <code>/data/raw/supplier_price_upload.csv</code>, rapikan <code>sku_text</code> ke bentuk <code>TK-12345</code> (buang spasi, huruf besar, buang tanda minus, ambil mulai posisi 2, pasang lagi <code>TK-</code>). Cetak dua baris: jumlah kode unik hasil perapian, lalu kode bersih baris pertama berkas (row_no 1).",
      start: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
sku = u["sku_text"].str.upper()
print(sku.nunique())
print(sku[0])`,
      solution: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
sku = "TK-" + u["sku_text"].str.strip().str.upper().str.replace("-", "", regex=False).str[2:]
print(sku.nunique())
print(sku[0])`,
      why: "Rangkaian <code>.str.strip().str.upper().str.replace(\"-\", \"\", regex=False).str[2:]</code> sama dengan rumus SQL bab teks dan tanggal. Hasilnya 54 kode unik, dan ' tk-10931' menjadi TK-10931.", hint: "Kode awal hanya mengubah huruf. Spasi dan tanda minus yang tidak seragam masih membuat kode yang sama terhitung berbeda." },
    { id: "py-06-05", kind: "py", prompt: "Ubah <code>price_text</code> di <code>/data/raw/supplier_price_upload.csv</code> menjadi angka: buang <code>,00</code> di akhir, buang \"Rp\", spasi, titik, dan koma, lalu <code>pd.to_numeric(…, errors=\"coerce\")</code>. Cetak tiga baris: jumlah harga yang terisi, jumlah yang kosong, dan total harga sebagai bilangan bulat (<code>int(...)</code>).",
      start: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
harga = pd.to_numeric(u["price_text"], errors="coerce")
print(harga.count())
print(harga.isna().sum())
print(int(harga.sum()))`,
      solution: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
teks = (u["price_text"].str.removesuffix(",00")
        .str.replace("Rp", "", regex=False).str.replace(" ", "", regex=False)
        .str.replace(".", "", regex=False).str.replace(",", "", regex=False))
harga = pd.to_numeric(teks, errors="coerce")
print(harga.count())
print(harga.isna().sum())
print(int(harga.sum()))`,
      why: "Tanpa dibersihkan, 44 harga gagal diubah. Sesudah dibersihkan, 60 harga terisi, 1 kosong (baris 2), dan totalnya 7.499.000, sama dengan SUM di SQL. <code>removesuffix</code> harus dijalankan sebelum koma dibuang; kalau tidak, 'Rp141.900,00' menjadi 14190000.", hint: "Urutannya penting: buang ',00' dulu, baru tanda-tanda lain." },
    { id: "py-06-06", kind: "py", prompt: "Ubah <code>effective_date_text</code> di <code>/data/raw/supplier_price_upload.csv</code> menjadi tanggal. Ada dua format: DD/MM/YYYY dan YYYY-MM-DD. Pakai <code>format=</code> untuk keduanya dan <code>errors=\"coerce\"</code>, lalu gabungkan dengan <code>fillna</code>. Cetak tiga baris: jumlah tanggal kosong, tanggal paling awal, dan tanggal paling akhir (cetak langsung hasil <code>min()</code> dan <code>max()</code>).",
      start: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
tgl = pd.to_datetime(u["effective_date_text"], format="%d/%m/%Y", errors="coerce")
print(tgl.isna().sum())
print(tgl.min())
print(tgl.max())`,
      solution: `import pandas as pd

u = pd.read_csv("/data/raw/supplier_price_upload.csv")
teks = u["effective_date_text"]
tgl = pd.to_datetime(teks, format="%d/%m/%Y", errors="coerce").fillna(
      pd.to_datetime(teks, format="%Y-%m-%d", errors="coerce"))
print(tgl.isna().sum())
print(tgl.min())
print(tgl.max())`,
      why: "Format pertama mengisi tanggal berformat DD/MM/YYYY dan membuat sisanya NaT. <code>fillna</code> mengisi NaT itu dari hasil format kedua. Hasilnya 0 kosong, dari 2025-09-01 sampai 2025-10-11.", hint: "Hasil kode awal masih punya NaT untuk tanggal berformat YYYY-MM-DD." },
    { id: "py-06-07", kind: "py", prompt: "Baca <code>/data/app/orders.csv</code>. Ubah <code>handled_by</code> menjadi bilangan bulat yang boleh kosong. Cetak dua baris: dtype kolom itu, lalu jumlah nilai kosongnya.",
      start: `import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
print(o["handled_by"].dtype)
print(o["handled_by"].isna().sum())`,
      solution: `import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
o["handled_by"] = o["handled_by"].astype("Int64")
print(o["handled_by"].dtype)
print(o["handled_by"].isna().sum())`,
      why: "<code>astype(\"Int64\")</code> (huruf I besar) mengubah float64 menjadi Int64. Nilai kosong tetap ada (10.589) dan tampil sebagai &lt;NA&gt;.", hint: "Tipe bilangan bulat yang boleh kosong ditulis dengan huruf besar di depan." },
    { id: "py-06-08", kind: "py", prompt: "Dari <code>/data/app/orders.csv</code>, hitung jumlah pesanan per bulan untuk pesanan sejak 1 Januari 2025, memakai <code>order_ts</code> (ubah dulu ke tanggal dengan <code>format=\"%Y-%m-%d %H:%M:%S\"</code>). Cetak satu baris: jumlah per bulan, urut dari Januari, sebagai list Python (<code>.tolist()</code>).",
      start: `import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
o["order_ts"] = pd.to_datetime(o["order_ts"], format="%Y-%m-%d %H:%M:%S")
`,
      solution: `import pandas as pd

o = pd.read_csv("/data/app/orders.csv")
o["order_ts"] = pd.to_datetime(o["order_ts"], format="%Y-%m-%d %H:%M:%S")
o25 = o[o["order_ts"] >= "2025-01-01"]
print(o25.resample("MS", on="order_ts")["order_id"].count().tolist())`,
      why: "<code>resample(\"MS\", on=\"order_ts\")</code> mengelompokkan per awal bulan, seperti <code>date_trunc('month', order_ts)</code>. Hasilnya 10 angka, dari 546 (Januari) sampai 590 (Oktober). <code>groupby(o25[\"order_ts\"].dt.month)</code> juga memberi angka yang sama, karena datanya hanya satu tahun.", hint: "Saring baris 2025 dulu, lalu pakai resample dengan on=." },
    { id: "py-06-09", kind: "py", level: "wawancara", prompt: "Pertanyaan wawancara: \"Dari tabel potret pelanggan, ambil keadaan setiap pelanggan per 30 Juni 2025, yaitu versi terbaru setiap pelanggan dari potret sampai tanggal itu.\" Kode di bawah memberi jumlah per segmen yang salah. Perbaiki. Cetak dua baris: jumlah pelanggan, lalu jumlah per segmen sebagai dict (<code>value_counts().sort_index().to_dict()</code>).",
      start: `import pandas as pd

s = pd.read_csv("/data/raw/customer_snapshot.csv")
s["snapshot_date"] = pd.to_datetime(s["snapshot_date"], format="%Y-%m-%d")
juni = s[s["snapshot_date"] <= "2025-06-30"].sort_values("snapshot_date")
hasil = juni.drop_duplicates(subset="customer_id")
print(len(hasil))
print(hasil["segment"].value_counts().sort_index().to_dict())`,
      solution: `import pandas as pd

s = pd.read_csv("/data/raw/customer_snapshot.csv")
s["snapshot_date"] = pd.to_datetime(s["snapshot_date"], format="%Y-%m-%d")
juni = s[s["snapshot_date"] <= "2025-06-30"].sort_values("snapshot_date")
hasil = juni.drop_duplicates(subset="customer_id", keep="last")
print(len(hasil))
print(hasil["segment"].value_counts().sort_index().to_dict())`,
      why: "Bawaan <code>keep</code> adalah \"first\", jadi kode awal mengambil potret paling lama setiap pelanggan. Setelah diurutkan menurut tanggal, <code>keep=\"last\"</code> mengambil yang terbaru: 1.394 pelanggan, Gold 129, Reguler 856, Silver 409, sama dengan potret 30 Juni di SQL. Di wawancara, sebut juga bahwa urutan harus ditentukan dengan sort, bukan dari urutan berkas.", hint: "Jumlah pelanggannya sudah benar; yang salah adalah versi mana yang disimpan." },
    { id: "py-06-10", kind: "py", prompt: "Berkas pemasok yang sudah dirapikan tersedia di DataFrame <code>bersih</code> (kolom <code>row_no</code>, <code>sku</code>, <code>harga</code>, <code>berlaku_mulai</code>; dibuat otomatis). Buang baris dobel menurut <code>sku</code>, <code>harga</code>, dan <code>berlaku_mulai</code>, simpan baris yang muncul pertama. Cetak dua baris: jumlah baris yang tersisa, lalu total harga sebagai bilangan bulat.",
      setup: BERSIH,
      start: `print(len(bersih))
print(int(bersih["harga"].sum()))`,
      solution: `unik = bersih.drop_duplicates(subset=["sku", "harga", "berlaku_mulai"], keep="first")
print(len(unik))
print(int(unik["harga"].sum()))`,
      why: "Tersisa 54 baris, sama dengan hasil DELETE di bab SQL \"Mengubah data dengan aman\". Total harga turun dari 7.499.000 menjadi 6.848.700 karena tujuh salinan (baris 55–61) tidak lagi terhitung dua kali.", hint: "Pakai subset berisi tiga kolom; keep=\"first\" adalah bawaan, tetapi tulis saja supaya jelas." },
    { id: "py-06-11", kind: "py", prompt: "DataFrame <code>bersih</code> (berkas pemasok yang sudah dirapikan) dibuat otomatis. Tulis ke <code>/kerja/harga.parquet</code> tanpa index, lalu baca lagi hanya kolom <code>sku</code> dan <code>harga</code>. Cetak dua baris: <code>shape</code> hasil bacaan, lalu dtype kolom <code>harga</code>.",
      setup: BERSIH,
      start: `bersih.to_csv("/kerja/harga.csv", index=False)
baca = pd.read_csv("/kerja/harga.csv")
print(baca.shape)
print(baca["harga"].dtype)`,
      solution: `bersih.to_parquet("/kerja/harga.parquet", index=False)
baca = pd.read_parquet("/kerja/harga.parquet", columns=["sku", "harga"])
print(baca.shape)
print(baca["harga"].dtype)`,
      why: "<code>columns=</code> hanya membaca dua kolom, jadi shape-nya (61, 2). Tipe <code>float64</code> tersimpan di berkas Parquet, sehingga tidak perlu ditebak ulang.", hint: "to_parquet untuk menulis, read_parquet dengan columns= untuk membaca." },
    { id: "py-06-12", kind: "py", prompt: "Berkas <code>/kerja/orders.parquet</code> (isi <code>app.orders</code>) dibuat otomatis. Tanpa membaca datanya dengan pandas, pakai <code>pyarrow.parquet</code> untuk mencetak tiga baris: jumlah baris, jumlah kolom, lalu jumlah nilai kosong (<code>null_count</code>) kolom <code>handled_by</code> di row group pertama. <code>handled_by</code> adalah kolom ke-8 (nomor posisi 7).",
      setup: `import pandas as pd
pd.read_csv("/data/app/orders.csv").to_parquet("/kerja/orders.parquet", index=False)`,
      start: `import pyarrow.parquet as pq

meta = pq.read_metadata("/kerja/orders.parquet")
`,
      solution: `import pyarrow.parquet as pq

meta = pq.read_metadata("/kerja/orders.parquet")
print(meta.num_rows)
print(meta.num_columns)
print(meta.row_group(0).column(7).statistics.null_count)`,
      why: "Metadata Parquet mencatat 12.007 baris dan 9 kolom, dan statistik column chunk <code>handled_by</code> mencatat 10.589 nilai kosong. Semua angka ini dibaca dari akhir berkas, tanpa membaca isi kolomnya.", hint: "read_metadata → num_rows, num_columns; row_group(0).column(7).statistics → null_count." },
    { id: "py-06-13", kind: "number", prompt: "Di berkas pemasok, berapa baris yang <b>lolos</b> ketiga pemeriksaan sekaligus: harga terisi setelah dibersihkan, kode produk bersih ada di <code>app.products.sku</code>, dan bukan baris dobel (kode bersih, <code>price_text</code>, dan <code>effective_date_text</code> sama dengan baris sebelumnya)?",
      answerPy: `${BERSIH}
p = pd.read_csv("/data/app/products.csv")
dobel = pd.DataFrame({"s": sku, "h": u["price_text"], "t": u["effective_date_text"]}).duplicated()
gagal = bersih["harga"].isna() | ~bersih["sku"].isin(p["sku"]) | dobel
print((~gagal).sum())`,
      why: "1 harga kosong, 4 kode tidak dikenal (baris 51–54), dan 7 baris dobel (baris 55–61), tanpa baris yang gagal di dua pemeriksaan. 61 − 12 = 49 baris lolos.", hint: "Gabungkan tiga Series True/False dengan |, balik dengan ~, lalu .sum()." },
    { id: "py-06-14", kind: "explain", level: "wawancara", prompt: "Pertanyaan wawancara: \"Data mentah dari sistem sumber akan disimpan di lakehouse dan dibaca berkali-kali oleh analis. Kenapa kamu menyimpannya sebagai Parquet, bukan CSV?\" Jawab dengan kalimatmu sendiri, sebut minimal tiga alasan.",
      model: "Pertama, Parquet menyimpan tipe setiap kolom, jadi tanggal tetap tanggal dan bilangan bulat yang boleh kosong tetap bilangan bulat. CSV hanya teks, sehingga setiap pembaca harus menebak tipe lagi dan bisa menebak berbeda. Kedua, Parquet menyimpan data per kolom dan mengompresi setiap kolom, sehingga berkasnya lebih kecil; di data pesanan TokoKita, Parquet sekitar 35% ukuran CSV. Ketiga, analis biasanya hanya butuh beberapa kolom. Parquet bisa dibaca per kolom, dan statistik min/max di metadata membuat mesin query bisa melewati row group yang tidak relevan, sehingga lebih cepat dan lebih murah. Terakhir, Parquet adalah dasar Delta Lake dan OneLake di Microsoft Fabric, jadi formatnya langsung cocok dengan lakehouse.",
      hint: "Pikirkan tipe data, ukuran berkas, membaca sebagian kolom, dan alat yang dipakai di lakehouse." },
  ],
};
