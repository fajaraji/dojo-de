// Bab 4 Python: berkas teks dan encoding, with open(), modul csv, modul json, JSON Lines, pathlib, dan os.environ.
// Fakta tentang Python dicek lewat Context7: /python/cpython (dokumentasi resmi Python: functions.rst, tutorial/inputoutput.rst,
// tutorial/errors.rst, library/csv.rst, library/json.rst, library/pathlib.rst, library/os.rst, howto/unicode.rst, library/codecs.rst,
// glossary.rst, whatsnew/3.15.rst). Angka data dihitung dengan tools/query.mjs dan dengan menjalankan kode di Pyodide.
export default {
  id: "py-04",
  part: "python",
  title: "Berkas: CSV, JSON, dan pathlib",
  minutes: 75,
  goals: [
    "Menjelaskan apa itu encoding, dan kenapa selalu menulis <code>encoding=\"utf-8\"</code> saat membuka berkas.",
    "Membuka berkas dengan <code>with open(...)</code> dalam mode baca, tulis, dan tambah, lalu membacanya baris demi baris.",
    "Membaca dan menulis CSV dengan modul <code>csv</code>, lalu mengubah teks menjadi angka sendiri.",
    "Menghitung pesanan per status dari <code>/data/app/orders.csv</code> tanpa pandas, dan mencocokkannya dengan SQL.",
    "Membersihkan berkas harga pemasok yang berantakan lalu menyimpannya sebagai CSV baru.",
    "Membaca dan menulis JSON, termasuk JSON bertingkat dan JSON Lines.",
    "Menyusun alamat berkas dengan <code>pathlib.Path</code> dan membaca konfigurasi dari variabel lingkungan dengan <code>os.environ</code>.",
  ],
  terms: [
    { term: "csv", def: "<i>Comma-separated values</i>: berkas teks berisi tabel. Satu baris teks = satu baris data, nilai antarkolom dipisah koma, dan baris pertama biasanya berisi nama kolom (<i>header</i>)." },
    { term: "json", def: "<i>JavaScript Object Notation</i>: format teks untuk data bertingkat, berisi objek <code>{\"kunci\": nilai}</code> dan larik <code>[nilai, nilai]</code>. Format ini banyak dipakai API untuk mengirim data." },
    { term: "encoding", def: "Aturan untuk mengubah karakter teks menjadi byte (angka 0–255) yang disimpan di disk, dan sebaliknya. Berkas yang ditulis dengan satu encoding harus dibaca dengan encoding yang sama." },
    { term: "utf-8", def: "Encoding yang bisa menyimpan semua karakter Unicode. Huruf dan angka biasa (ASCII) memakai 1 byte, karakter lain 2 sampai 4 byte. Menurut dokumentasi Python, UTF-8 sudah menjadi standar de facto, termasuk di hampir semua halaman web." },
    { term: "mode berkas", def: "Huruf di argumen kedua <code>open()</code> yang menentukan cara berkas dibuka: <code>\"r\"</code> baca, <code>\"w\"</code> tulis (isi lama dihapus), <code>\"a\"</code> tambah di akhir." },
    { term: "json lines", def: "Berkas berisi satu objek JSON per baris, biasanya berakhiran <code>.jsonl</code>. Bisa dibaca dan ditambah baris demi baris tanpa memuat seluruh berkas." },
    { term: "konfigurasi", def: "Nilai yang mengatur perilaku program tetapi bisa berbeda di setiap tempat program dijalankan, misalnya alamat server database atau password. Disimpan di luar kode." },
  ],
  introduces: ["py:with","py:open()","py:import csv","py:import json","py:import pathlib","py:import os"],
  sections: [
    {
      title: "Berkas teks dan encoding",
      html: `<p>Sebagian besar data yang dikirim antarsistem berbentuk <b>berkas teks</b>: CSV dari aplikasi kasir, JSON dari API, log dari server. Di disk, berkas teks bukan disimpan sebagai huruf, melainkan sebagai deretan <b>byte</b> (angka 0 sampai 255). <b>Encoding</b> adalah aturan yang mengubah huruf menjadi byte saat menulis, dan byte menjadi huruf saat membaca.</p>
<p>Salah satu encoding yang paling umum adalah <b>UTF-8</b>. Menurut dokumentasi Python, UTF-8 bisa menyimpan semua karakter Unicode. Karakter dengan kode di bawah 128 (huruf Latin tanpa tanda, angka, tanda baca biasa) disimpan sebagai 1 byte. Karakter lain disimpan sebagai 2, 3, atau 4 byte. Metode teks <code>.encode("utf-8")</code> menunjukkan byte-nya.</p>
<p>Masalah muncul kalau berkas ditulis dengan satu encoding tetapi dibaca dengan encoding lain. Hasilnya huruf rusak, seperti contoh di bawah: tanda pound sterling (£) yang ditulis dalam UTF-8 lalu dibaca dengan encoding Windows lama <code>cp1252</code>.</p>
<p>Kenapa ini penting di Windows: di Python 3.14, kalau <code>encoding</code> tidak ditulis, Python memakai <i>locale encoding</i> (encoding bawaan sistem). Di Windows, itu adalah ANSI code page, misalnya <code>cp1252</code>, bukan UTF-8. Mulai Python 3.15, bawaannya menjadi UTF-8. Dokumentasi Python menyarankan selalu menulis argumen <code>encoding</code> supaya kode berperilaku sama di semua versi. Di bab ini setiap <code>open()</code> menulis <code>encoding="utf-8"</code>.</p>
<p>Satu hal lagi: beberapa program Windows menulis tiga byte penanda di awal berkas UTF-8, yang disebut <i>BOM</i> (<i>byte order mark</i>). Menurut dokumentasi Python, Notepad salah satunya. Kalau nama kolom pertama hasil bacaanmu diawali karakter aneh, buka berkas dengan <code>encoding="utf-8-sig"</code>, yang melewati penanda itu kalau ada.</p>`,
      examples: [{ lang: "py", code: `print(len("Bandung"), len("Bandung".encode("utf-8")))
print(len("£12,50"), len("£12,50".encode("utf-8")))

with open("/kerja/contoh.txt", "w", encoding="utf-8") as f:
    f.write("Harga: £12,50\\n")

with open("/kerja/contoh.txt", encoding="utf-8") as f:
    print(f.read().strip())
with open("/kerja/contoh.txt", encoding="cp1252") as f:
    print(f.read().strip())`, note: "\"Bandung\" berisi 7 karakter dan 7 byte. \"£12,50\" berisi 6 karakter tetapi 7 byte, karena £ memakai 2 byte di UTF-8. Dibaca dengan cp1252, kedua byte itu dianggap dua huruf terpisah, sehingga muncul <code>Â£</code>. Teks £12,50 hanya contoh buatan; data TokoKita sendiri tidak berisi karakter di luar ASCII." }],
    },
    {
      title: "Membuka berkas dengan with open()",
      html: `<p><code>open(alamat, mode, encoding=...)</code> membuka berkas dan mengembalikan <i>objek berkas</i>, yaitu nilai yang punya metode untuk membaca dan menulis. Argumen kedua adalah <b>mode berkas</b>:</p>
<div class="tw"><table class="t"><tr><th>Mode</th><th>Arti</th><th>Kalau berkas sudah ada</th></tr>
<tr><td><code>"r"</code></td><td>baca (bawaan kalau mode tidak ditulis)</td><td>dibaca dari awal; kalau tidak ada, error <code>FileNotFoundError</code></td></tr>
<tr><td><code>"w"</code></td><td>tulis</td><td><b>isi lama dihapus</b> lebih dulu</td></tr>
<tr><td><code>"a"</code></td><td>tambah (<i>append</i>)</td><td>tulisan baru ditambahkan di akhir</td></tr></table></div>
<p>Berkas yang dibuka harus ditutup. Objek berkas menampung tulisan di memori lebih dulu (disebut <i>buffer</i>), jadi sebelum berkas ditutup, tulisan bisa belum sampai ke disk. Pernyataan <code>with</code> mengurus penutupan: begitu blok yang menjorok di bawahnya selesai, berkas ditutup, <b>termasuk kalau terjadi error di tengah blok</b>. Itulah alasan <code>with open(...) as f:</code> menjadi cara baku. Nama <code>f</code> setelah <code>as</code> menunjuk ke objek berkas.</p>
<p>Metode yang dipakai: <code>f.write(teks)</code> menulis teks apa adanya. Baris baru tidak ditambahkan otomatis, jadi akhiri dengan <code>\\n</code> (tanda ganti baris). <code>f.read()</code> membaca seluruh isi berkas menjadi satu teks.</p>
<p>Kesalahan umum: membuka berkas hasil kerja kemarin dengan mode <code>"w"</code> padahal maksudnya menambah. Isinya langsung kosong sebelum satu huruf pun ditulis.</p>`,
      examples: [{ lang: "py", code: `with open("/kerja/catatan.txt", "w", encoding="utf-8") as f:
    f.write("pesanan 100001 diterima\\n")
    f.write("pesanan 100002 diterima\\n")

with open("/kerja/catatan.txt", "a", encoding="utf-8") as f:
    f.write("pesanan 100003 diterima\\n")

with open("/kerja/catatan.txt", encoding="utf-8") as f:
    isi = f.read()
print(isi)
print("sudah ditutup:", f.closed)

with open("/kerja/catatan.txt", "w", encoding="utf-8") as f:
    f.write("mulai lagi\\n")
with open("/kerja/catatan.txt", encoding="utf-8") as f:
    print(f.read())`, note: "Mode <code>\"a\"</code> menambah baris ketiga. Setelah blok <code>with</code> selesai, <code>f.closed</code> bernilai True. Membuka lagi dengan <code>\"w\"</code> menghapus ketiga baris itu, sehingga tinggal \"mulai lagi\". Folder <code>/kerja</code> adalah satu-satunya folder yang boleh kamu tulisi di Dojo, dan sudah menjadi direktori kerja." }],
    },
    {
      title: "Membaca baris demi baris",
      html: `<p><code>f.read()</code> memuat seluruh berkas ke memori sekaligus. Untuk berkas besar, misalnya log berukuran beberapa gigabyte, cara itu bisa menghabiskan memori. Cara yang lebih hemat adalah mengulang objek berkas dengan <code>for</code>: setiap putaran mengambil satu baris, dan baris sebelumnya tidak disimpan. Dokumentasi Python menyebut cara ini hemat memori, cepat, dan sederhana.</p>
<p>Setiap baris yang dibaca masih membawa tanda ganti baris <code>\\n</code> di ujungnya (kecuali baris terakhir berkas yang tidak diakhiri <code>\\n</code>). Buang dengan <code>.strip()</code> sebelum diolah. Metode teks <code>.startswith(awalan)</code> bernilai True kalau teks diawali <code>awalan</code>.</p>`,
      examples: [{ lang: "py", code: `jumlah_baris = 0
oktober_31 = 0
with open("/data/app/orders.csv", encoding="utf-8") as f:
    for nomor, baris in enumerate(f, start=1):
        if nomor <= 2:
            print(baris.endswith("\\n"), baris.strip())
        jumlah_baris = jumlah_baris + 1
        kolom = baris.strip().split(",")
        if kolom[2].startswith("2025-10-31"):
            oktober_31 = oktober_31 + 1

print("baris:", jumlah_baris, "pesanan:", jumlah_baris - 1)
print("pesanan 31 Okt 2025:", oktober_31)`, note: "Berkas punya 12.008 baris: 1 baris header dan 12.007 pesanan, sama dengan <code>select count(*) from app.orders</code>. Ada 17 pesanan pada 31 Oktober 2025, sama dengan hasil SQL <code>where order_ts::date = date '2025-10-31'</code>. Memecah dengan <code>.split(\",\")</code> aman di berkas ini karena tidak ada nilai yang berisi koma; bagian berikutnya menunjukkan kapan cara itu salah." }],
    },
    {
      title: "Modul csv: reader dan writer",
      html: `<p>Di CSV, nilai yang berisi koma dibungkus tanda kutip ganda, misalnya <code>"34,900"</code>. Tanda kutip di dalam nilai ditulis dua kali (<code>""</code>). Memecah baris dengan <code>.split(",")</code> tidak memahami aturan ini. Modul bawaan <code>csv</code> memahaminya. Muat dengan <code>import csv</code>.</p>
<ul><li><code>csv.reader(f)</code> membaca baris demi baris. Setiap baris menjadi list berisi teks.</li>
<li><code>next(pembaca)</code> mengambil satu baris berikutnya. Biasanya dipakai untuk mengambil header lebih dulu.</li>
<li><code>csv.writer(f)</code> menulis; <code>.writerow(list)</code> menulis satu baris, dan memberi tanda kutip sendiri kalau nilainya berisi koma atau kutip.</li></ul>
<p>Dokumentasi Python meminta berkas CSV dibuka dengan <code>newline=""</code>, baik untuk membaca maupun menulis. Alasannya: modul <code>csv</code> mengurus tanda ganti baris sendiri. Tanpa <code>newline=""</code>, nilai berkutip yang berisi ganti baris tidak terbaca benar, dan di Windows saat menulis ditambahkan karakter <code>\\r</code> ekstra di akhir setiap baris.</p>
<p>Dua hal yang wajib diingat: <b>semua nilai dibaca sebagai teks</b>, termasuk angka. Modul <code>csv</code> tidak mengubah tipe; kamu yang mengubahnya dengan <code>int()</code> atau <code>float()</code>. Lalu, <b>sel kosong dibaca sebagai teks kosong <code>''</code>, bukan None</b>. Saat menulis, None ditulis sebagai sel kosong.</p>`,
      examples: [
        { lang: "py", code: `import csv

baris = '8,"TK10476 ","34,900",29/09/2025,CV Mekar Abadi'
print(len(baris.split(",")), baris.split(","))
for kolom in csv.reader([baris]):
    print(len(kolom), kolom)`, note: "Ini baris 8 dari <code>/data/raw/supplier_price_upload.csv</code>. <code>.split(\",\")</code> menghasilkan 6 bagian karena memotong harga \"34,900\" menjadi dua, dan tanda kutipnya ikut terbawa. <code>csv.reader</code> menghasilkan 5 kolom yang benar. <code>csv.reader</code> menerima objek berkas atau list berisi teks." },
        { lang: "py", code: `import csv

with open("/data/app/orders.csv", encoding="utf-8", newline="") as f:
    pembaca = csv.reader(f)
    header = next(pembaca)
    pertama = next(pembaca)

print(header)
print(pertama)
print(type(pertama[5]), pertama[5] + pertama[5], int(pertama[5]) + int(pertama[5]))
print(pertama[6] == "", pertama[6] is None)

with open("/kerja/dua_baris.csv", "w", encoding="utf-8", newline="") as f:
    penulis = csv.writer(f)
    penulis.writerow(["sku", "harga_teks", "catatan"])
    penulis.writerow(["TK-10476", "34,900", None])
with open("/kerja/dua_baris.csv", encoding="utf-8", newline="") as f:
    print(f.read())`, note: "Ongkir <code>shipping_fee</code> pesanan 100001 dibaca sebagai teks \"15000\". Teks ditambah teks menjadi \"1500015000\", bukan 30000. <code>voucher_code</code> pesanan ini NULL di database, dan di CSV terbaca <code>''</code>, bukan None. Saat menulis, \"34,900\" otomatis dibungkus kutip dan None menjadi sel kosong." },
      ],
    },
    {
      title: "DictReader: menghitung pesanan per status",
      html: `<p><code>csv.DictReader(f)</code> memakai baris pertama sebagai nama kolom, lalu mengembalikan setiap baris berikutnya sebagai dict. Kamu menulis <code>baris["status"]</code> alih-alih <code>baris[4]</code>, sehingga kode tetap benar walaupun urutan kolom berubah. Kalau sebuah baris lebih pendek dari header, kolom yang hilang diisi None.</p>
<p><code>csv.DictWriter(f, fieldnames=[...])</code> kebalikannya: menulis dict sebagai baris, dengan urutan kolom dari <code>fieldnames</code>. <code>.writeheader()</code> menulis baris header.</p>
<p>Contoh di bawah menghitung jumlah pesanan dan total ongkir per status, seperti GROUP BY di SQL. Metode dict <code>.get(kunci, 0)</code> mengambil nilai kunci, atau 0 kalau kunci itu belum ada. Hasilnya dibandingkan dengan query SQL di bawahnya.</p>`,
      examples: [
        { lang: "py", code: `import csv

jumlah = {}
ongkir = {}
with open("/data/app/orders.csv", encoding="utf-8", newline="") as f:
    for baris in csv.DictReader(f):
        status = baris["status"]
        jumlah[status] = jumlah.get(status, 0) + 1
        ongkir[status] = ongkir.get(status, 0) + int(baris["shipping_fee"])

for status in sorted(jumlah, key=lambda s: jumlah[s], reverse=True):
    print(status, jumlah[status], ongkir[status])`, note: "Urutan dari jumlah terbanyak: completed 10.879, cancelled 747, returned 319, shipped 49, processing 13. <code>int(...)</code> wajib, karena tanpa itu ongkir berupa teks dan <code>0 + \"15000\"</code> menghasilkan TypeError." },
        { sql: `select status, count(*) as jumlah, sum(shipping_fee) as ongkir
from app.orders
group by status
order by jumlah desc`, note: "Angkanya sama persis dengan hasil Python. Di pekerjaan nyata, mencocokkan hitungan seperti ini adalah cara cepat membuktikan bahwa berkas yang kamu baca lengkap." },
      ],
    },
    {
      title: "Membersihkan berkas harga pemasok",
      html: `<p><code>/data/raw/supplier_price_upload.csv</code> berisi 61 baris harga baru dari pemasok, dengan format yang tidak seragam:</p>
<ul><li>SKU: <code>" tk-10931"</code>, <code>"TK10812 "</code>, <code>TK-10280</code>. Ada spasi di tepi, huruf kecil, dan tanda minus yang hilang.</li>
<li>Harga: <code>Rp 63.900</code>, <code>229.900</code>, <code>"34,900"</code>, <code>"Rp141.900,00"</code>, <code>192900</code>, dan satu sel kosong (baris 2).</li>
<li>Tanggal: 27 baris memakai DD/MM/YYYY (<code>29/09/2025</code>), sisanya YYYY-MM-DD.</li>
<li>Nama pemasok: <code>" pt sumber elektronik"</code> dan <code>"CV MEKAR ABADI "</code> untuk pemasok yang sama.</li></ul>
<p>Satu keputusan harus diambil: titik dan koma di harga dianggap pemisah ribuan, dan <code>,00</code> di akhir dianggap sen nol. Keputusan ini dicek ke data. Setelah dibersihkan, setiap harga yang SKU-nya ada di <code>app.products</code> (56 baris) berada di antara 94% dan 113% dari <code>list_price</code> produk itu. Kalau titik dianggap desimal, <code>229.900</code> akan menjadi 229,9 rupiah, jauh dari harga produknya.</p>
<p>Dua metode teks baru: <code>.removesuffix(akhiran)</code> membuang akhiran kalau ada, dan <code>.removeprefix(awalan)</code> membuang awalan kalau ada. Kalau tidak ada, teks dikembalikan apa adanya.</p>`,
      examples: [{ lang: "py", code: `import csv

def bersihkan_sku(teks):
    sku = teks.strip().upper()
    if not sku.startswith("TK-"):
        sku = "TK-" + sku.removeprefix("TK")
    return sku

def bersihkan_harga(teks):
    t = teks.replace("Rp", "").strip().removesuffix(",00")
    if t == "" or t == "N/A":
        return None
    return int(t.replace(".", "").replace(",", ""))

def bersihkan_tanggal(teks):
    t = teks.strip()
    if "/" in t:
        bagian = t.split("/")
        t = f"{bagian[2]}-{bagian[1]}-{bagian[0]}"
    return t

hasil = []
with open("/data/raw/supplier_price_upload.csv", encoding="utf-8", newline="") as f:
    for baris in csv.DictReader(f):
        hasil.append({
            "row_no": int(baris["row_no"]),
            "sku": bersihkan_sku(baris["sku_text"]),
            "harga": bersihkan_harga(baris["price_text"]),
            "tanggal_berlaku": bersihkan_tanggal(baris["effective_date_text"]),
            "pemasok": baris["supplier"].strip().upper(),
        })

kolom = ["row_no", "sku", "harga", "tanggal_berlaku", "pemasok"]
with open("/kerja/harga_bersih.csv", "w", encoding="utf-8", newline="") as f:
    penulis = csv.DictWriter(f, fieldnames=kolom)
    penulis.writeheader()
    for h in hasil:
        penulis.writerow(h)

print("ditulis:", len(hasil), "tanpa harga:", len([h for h in hasil if h["harga"] is None]))
with open("/kerja/harga_bersih.csv", encoding="utf-8", newline="") as f:
    for nomor, baris in enumerate(f):
        if nomor < 4:
            print(baris.strip())`, note: "Semua 61 baris ditulis; satu baris (row_no 2) tanpa harga, dan None-nya ditulis sebagai sel kosong. Tidak ada baris bertanda N/A di berkas ini, tetapi pemeriksaannya tetap ada untuk kiriman berikutnya. Berkas ini juga berisi baris dobel; menghitungnya ada di soal." }],
    },
    {
      title: "JSON: dari teks ke dict dan sebaliknya",
      html: `<p><b>JSON</b> adalah format teks untuk data bertingkat. Banyak API mengirim data sebagai JSON. Bentuknya mirip dict dan list Python, dengan beberapa perbedaan yang tercantum di tabel. Kunci objek JSON harus berupa teks berkutip ganda.</p>
<div class="tw"><table class="t"><tr><th>JSON</th><th>Python</th></tr>
<tr><td>objek <code>{"a": 1}</code></td><td>dict</td></tr>
<tr><td>larik <code>[1, 2]</code></td><td>list (tuple juga ditulis sebagai larik)</td></tr>
<tr><td>teks <code>"web"</code></td><td>str</td></tr>
<tr><td>angka bulat / desimal</td><td>int / float</td></tr>
<tr><td><code>true</code>, <code>false</code></td><td>True, False</td></tr>
<tr><td><code>null</code></td><td>None</td></tr></table></div>
<p>Modul <code>json</code> punya empat fungsi utama. Yang berakhiran <i>s</i> (<i>string</i>) bekerja dengan teks, yang tanpa <i>s</i> bekerja dengan berkas:</p>
<ul><li><code>json.loads(teks)</code>: teks JSON menjadi nilai Python. <code>json.load(f)</code>: sama, dari berkas.</li>
<li><code>json.dumps(nilai)</code>: nilai Python menjadi teks JSON. <code>json.dump(nilai, f)</code>: sama, ditulis ke berkas.</li></ul>
<p>Dua argumen penting untuk <code>dumps</code>/<code>dump</code>: <code>indent=2</code> membuat teks rapi menjorok 2 spasi per tingkat. <code>ensure_ascii=False</code> menulis karakter non-ASCII apa adanya; bawaannya (True) mengubahnya menjadi kode seperti <code>\\u00a3</code>.</p>
<p>Kesalahan umum: teks yang bukan JSON sah, misalnya memakai kutip tunggal, membuat <code>json.loads</code> gagal dengan <code>JSONDecodeError</code> (sejenis ValueError). Nilai yang tidak ada di tabel, misalnya tanggal dari modul datetime, membuat <code>dumps</code> gagal dengan TypeError. Ubah dulu menjadi teks dengan <code>str()</code>.</p>`,
      examples: [{ lang: "py", code: `import json
import datetime

teks = '{"order_id": 100002, "channel": "web", "voucher_code": "HEMAT10", "handled_by": null, "shipping_fee": 18000}'
pesanan = json.loads(teks)
print(type(pesanan), pesanan["voucher_code"], pesanan["handled_by"])

produk = json.loads('{"sku": "TK-10007", "is_active": true, "list_price": 450900.0}')
print(produk["is_active"], type(produk["list_price"]))

print(json.dumps(pesanan))
print(json.dumps({"simbol": "£"}), json.dumps({"simbol": "£"}, ensure_ascii=False))

try:
    json.loads("{'order_id': 100002}")
except ValueError as e:
    print("bukan JSON:", e)
try:
    json.dumps({"tanggal": datetime.date(2025, 10, 31)})
except TypeError as e:
    print(e)
print(json.dumps({"tanggal": str(datetime.date(2025, 10, 31))}))`, note: "Nilai pesanan 100002 dan produk TK-10007 sesuai isi <code>app.orders</code> dan <code>app.products</code>. <code>null</code> menjadi None, <code>true</code> menjadi True, dan kebalikannya saat <code>dumps</code>. Tanggal harus diubah menjadi teks \"2025-10-31\" sebelum ditulis." }],
    },
    {
      title: "JSON bertingkat seperti respons API",
      html: `<p>Respons API biasanya bertingkat: satu objek pesanan berisi list barang, dan setiap barang adalah objek lagi. Di tabel, data ini tersebar di <code>app.orders</code>, <code>app.order_items</code>, dan <code>app.products</code>. Contoh di bawah menyusun pesanan 100002 menjadi satu dokumen JSON dari ketiga berkas CSV, menyimpannya ke <code>/kerja</code>, lalu membacanya lagi.</p>
<p>Untuk mengambil nilai di dalam dokumen bertingkat, rangkai kunci dan nomor urut: <code>dokumen["items"][1]["product_name"]</code> berarti "kunci items, barang kedua, kunci product_name". Ekspresi <code>pesanan["voucher_code"] or None</code> mengubah teks kosong dari CSV menjadi None, karena teks kosong dianggap False.</p>`,
      examples: [{ lang: "py", code: `import csv
import json

nama_produk = {}
with open("/data/app/products.csv", encoding="utf-8", newline="") as f:
    for p in csv.DictReader(f):
        nama_produk[p["product_id"]] = p["product_name"]

with open("/data/app/orders.csv", encoding="utf-8", newline="") as f:
    pesanan = [o for o in csv.DictReader(f) if o["order_id"] == "100002"][0]

barang = []
with open("/data/app/order_items.csv", encoding="utf-8", newline="") as f:
    for b in csv.DictReader(f):
        if b["order_id"] == "100002":
            barang.append({"line_no": int(b["line_no"]), "product_name": nama_produk[b["product_id"]],
                           "qty": int(b["qty"]), "unit_price": int(b["unit_price"]), "discount": int(b["discount"])})

dokumen = {"order_id": int(pesanan["order_id"]), "status": pesanan["status"],
           "voucher_code": pesanan["voucher_code"] or None, "handled_by": pesanan["handled_by"] or None,
           "items": barang}

with open("/kerja/pesanan_100002.json", "w", encoding="utf-8") as f:
    json.dump(dokumen, f, indent=2, ensure_ascii=False)

with open("/kerja/pesanan_100002.json", encoding="utf-8") as f:
    dibaca = json.load(f)
print(dibaca["items"][1]["product_name"])
print(sum(b["qty"] * b["unit_price"] - b["discount"] for b in dibaca["items"]))
print(dibaca["voucher_code"], dibaca["handled_by"])`, note: "Pesanan 100002 punya 3 barang. Barang kedua adalah Sapu Lantai Sinar. Total barang setelah potongan adalah 415.500 rupiah. <code>handled_by</code> pesanan ini NULL di database, dan setelah ditulis lalu dibaca lagi dari JSON nilainya tetap None. Buka berkas <code>/kerja/pesanan_100002.json</code> dengan contoh <code>f.read()</code> di atas kalau ingin melihat teks JSON-nya." }],
    },
    {
      title: "JSON Lines: satu objek per baris",
      html: `<p>Satu berkas JSON biasa berisi satu nilai utuh. Menurut dokumentasi Python, memanggil <code>json.dump</code> berkali-kali ke berkas yang sama menghasilkan berkas JSON yang tidak sah. Untuk data yang terus bertambah, misalnya catatan aktivitas pengguna, dipakai <b>JSON Lines</b>: setiap baris adalah satu objek JSON lengkap, biasanya dengan akhiran <code>.jsonl</code>. Baris baru cukup ditambahkan dengan mode <code>"a"</code>, dan pembacaan bisa baris demi baris dengan <code>json.loads</code>. Alat baris perintah <code>python -m json.tool</code> punya opsi <code>--json-lines</code> untuk memeriksa berkas seperti ini.</p>`,
      examples: [{ lang: "py", code: `import csv
import json

with open("/data/app/orders.csv", encoding="utf-8", newline="") as f_in, \\
     open("/kerja/pesanan_2025-10-31.jsonl", "w", encoding="utf-8") as f_out:
    for o in csv.DictReader(f_in):
        if o["order_ts"].startswith("2025-10-31"):
            baris = {"order_id": int(o["order_id"]), "channel": o["channel"], "status": o["status"]}
            f_out.write(json.dumps(baris) + "\\n")

jumlah = 0
per_status = {}
with open("/kerja/pesanan_2025-10-31.jsonl", encoding="utf-8") as f:
    for nomor, baris in enumerate(f):
        objek = json.loads(baris)
        if nomor == 0:
            print(baris.strip())
        jumlah = jumlah + 1
        per_status[objek["status"]] = per_status.get(objek["status"], 0) + 1
print(jumlah, per_status)`, note: "Satu <code>with</code> boleh membuka dua berkas sekaligus, dipisah koma; garis miring terbalik di akhir baris pertama menyambung pernyataan ke baris berikutnya. Ada 17 pesanan pada 31 Oktober 2025: 11 processing, 3 shipped, dan 3 cancelled, sama dengan hasil <code>select status, count(*) from app.orders where order_ts::date = date '2025-10-31' group by status</code>." }],
    },
    {
      title: "pathlib: alamat berkas sebagai objek",
      html: `<p>Sejauh ini alamat berkas ditulis sebagai teks. Modul <code>pathlib</code> menyediakan <code>Path</code>, objek alamat yang lebih mudah diolah. Muat dengan <code>from pathlib import Path</code>.</p>
<ul><li>Operator <code>/</code> menyambung bagian alamat: <code>Path("/data") / "app" / "orders.csv"</code>. Di Windows, Path menerima garis miring biasa <code>/</code> maupun garis miring terbalik <code>\\</code>.</li>
<li><code>.name</code> nama berkas, <code>.stem</code> nama tanpa akhiran, <code>.suffix</code> akhiran (ekstensi) termasuk titiknya, <code>.parent</code> folder induknya.</li>
<li><code>.exists()</code> bernilai True kalau berkas atau folder itu ada.</li>
<li><code>.glob("*.csv")</code> mencari berkas yang cocok dengan pola; <code>*</code> berarti "teks apa pun". Urutan hasilnya tidak dijamin, jadi bungkus dengan <code>sorted()</code>.</li>
<li><code>.mkdir(parents=True, exist_ok=True)</code> membuat folder beserta folder induk yang belum ada, dan tidak error kalau folder sudah ada, seperti <code>mkdir -p</code> di Linux. Tanpa <code>exist_ok=True</code>, folder yang sudah ada membuat <code>FileExistsError</code>.</li></ul>
<p>Objek Path bisa langsung diberikan ke <code>open()</code>.</p>`,
      examples: [{ lang: "py", code: `from pathlib import Path

folder = Path("/data") / "app"
berkas = folder / "orders.csv"
print(berkas, berkas.name, berkas.stem, berkas.suffix, berkas.parent)
print(berkas.exists(), (folder / "tidak_ada.csv").exists())

for p in sorted(Path("/data/raw").glob("*.csv")):
    print(p.stem)

keluaran = Path("/kerja") / "laporan" / "2025-10"
keluaran.mkdir(parents=True, exist_ok=True)
keluaran.mkdir(parents=True, exist_ok=True)
with open(keluaran / "ringkas.txt", "w", encoding="utf-8") as f:
    f.write("selesai\\n")
print(sorted(Path("/kerja/laporan").glob("*/*.txt")))`, note: "Folder <code>/data/raw</code> berisi 5 berkas CSV. <code>mkdir</code> kedua tidak error berkat <code>exist_ok=True</code>. Pola <code>*/*.txt</code> mencari berkas .txt di satu tingkat folder di bawah <code>/kerja/laporan</code>." }],
    },
    {
      title: "os.environ dan rahasia di luar kode",
      html: `<p>Di bab Terminal kamu sudah mengatur variabel lingkungan dengan <code>$env:NAMA = "nilai"</code> di PowerShell. Program Python membacanya lewat <code>os.environ</code>, dari modul bawaan <code>os</code> (<code>import os</code>). <code>os.environ</code> berperilaku seperti dict berisi teks. Menurut dokumentasi Python, isinya diambil saat modul <code>os</code> pertama kali dimuat, dan di Windows nama variabelnya diubah menjadi huruf besar.</p>
<ul><li><code>os.environ.get("NAMA", "bawaan")</code> mengembalikan nilai, atau "bawaan" kalau variabel itu tidak ada.</li>
<li><code>os.environ["NAMA"]</code> membuat KeyError kalau tidak ada. Cocok untuk nilai wajib, supaya program berhenti dengan jelas.</li>
<li><code>os.getcwd()</code> mengembalikan direktori kerja saat ini.</li></ul>
<p>Variabel lingkungan dipakai untuk <b>konfigurasi</b>: nilai yang berbeda di laptop, server uji, dan server produksi, seperti alamat database. Aturan pentingnya: <b>jangan menulis password, token, atau kunci API di kode</b>. Kode disimpan di Git dan dibaca banyak orang. Menurut dokumentasi GitHub, rahasia yang sudah di-commit menjadi bagian riwayat Git dan tetap bisa dibaca walaupun dihapus di commit berikutnya, sehingga rahasia itu harus dicabut dan diganti. Simpan rahasia di variabel lingkungan atau berkas <code>.env</code> yang dicantumkan di <code>.gitignore</code>.</p>`,
      examples: [
        { lang: "py", code: `import os

host = os.environ.get("TOKOKITA_DB_HOST", "localhost")
print("host:", host)
print("password diatur?", "TOKOKITA_DB_PASSWORD" in os.environ)

os.environ["TOKOKITA_DB_HOST"] = "db-uji"
print("host:", os.environ.get("TOKOKITA_DB_HOST", "localhost"))
print("direktori kerja:", os.getcwd())`, note: "Di Dojo variabel <code>TOKOKITA_DB_HOST</code> tidak ada, jadi baris pertama mencetak nilai bawaan <code>localhost</code>. Mengubah <code>os.environ</code> berlaku untuk program ini dan program lain yang dijalankannya sesudah itu, bukan untuk jendela PowerShell yang menjalankannya." },
        { lang: "file", filename: "muat_harga.py", code: `import os

host = os.environ.get("TOKOKITA_DB_HOST", "localhost")
password = os.environ["TOKOKITA_DB_PASSWORD"]  # KeyError kalau belum diatur

print(f"Menyambung ke {host} dengan password {len(password)} karakter")`, note: "Password tidak tertulis di berkas ini, dan tidak pernah dicetak; yang dicetak hanya panjangnya." },
        { lang: "shell", code: `$env:TOKOKITA_DB_PASSWORD = "ganti-dengan-password-latihanmu"
python muat_harga.py`, note: "Variabel diatur di jendela PowerShell itu saja, lalu dibaca program Python yang dijalankan dari sana. Di bash: <code>export TOKOKITA_DB_PASSWORD=...</code>." },
      ],
    },
  ],
  tsql: [],
  summary: [
    "Selalu tulis <code>encoding=\"utf-8\"</code> di <code>open()</code>. Di Python 3.14 di Windows, bawaannya ANSI code page (misalnya cp1252), bukan UTF-8.",
    "<code>with open(...) as f:</code> menutup berkas begitu blok selesai, termasuk saat error. Mode <code>\"w\"</code> menghapus isi lama, <code>\"a\"</code> menambah di akhir.",
    "Ulangi objek berkas dengan <code>for</code> untuk membaca baris demi baris tanpa memuat seluruh berkas ke memori.",
    "Modul <code>csv</code> memahami nilai berkutip. Buka berkas dengan <code>newline=\"\"</code>. Semua nilai terbaca sebagai teks, dan sel kosong menjadi <code>''</code>, bukan None.",
    "<code>json.loads</code>/<code>json.load</code> membaca, <code>json.dumps</code>/<code>json.dump</code> menulis. <code>null</code> ↔ None, <code>true</code> ↔ True. Pakai <code>indent</code> dan <code>ensure_ascii=False</code> untuk teks yang mudah dibaca.",
    "JSON Lines menyimpan satu objek JSON per baris, sehingga bisa ditambah dan dibaca baris demi baris.",
    "<code>Path</code> menyusun alamat dengan <code>/</code>, dan punya <code>.exists()</code>, <code>.glob()</code>, <code>.mkdir(parents=True, exist_ok=True)</code>, <code>.stem</code>, <code>.suffix</code>.",
    "Konfigurasi dan rahasia dibaca dari <code>os.environ</code>, tidak ditulis di kode.",
  ],
  drills: [
    { id: "py-04-01", kind: "choice", prompt: "Berkas <code>/kerja/log.txt</code> sudah berisi 500 baris. Kamu menjalankan <code>with open(\"/kerja/log.txt\", \"w\", encoding=\"utf-8\") as f: f.write(\"baru\\n\")</code>. Apa isi berkas sesudahnya?",
      options: ["500 baris lama ditambah baris \"baru\" di akhir", "Hanya satu baris: \"baru\"", "Error, karena berkas sudah ada", "500 baris lama, karena berkas yang sudah ada tidak bisa ditulis ulang"], answer: 1,
      why: "Mode <code>\"w\"</code> menghapus isi berkas lebih dulu, baru menulis. Untuk menambah di akhir, pakai mode <code>\"a\"</code>.",
      hint: "Lihat tabel mode berkas: apa yang terjadi pada berkas yang sudah ada?" },
    { id: "py-04-02", kind: "choice", prompt: "Kamu membaca <code>/data/app/orders.csv</code> dengan <code>csv.DictReader</code>. Pesanan 100001 tidak memakai voucher (NULL di database). Apa nilai <code>baris[\"voucher_code\"]</code> untuk pesanan itu?",
      options: ["None", "'' (teks kosong)", "0", "'NULL'"], answer: 1,
      why: "Di CSV, NULL ditulis sebagai sel kosong, dan modul <code>csv</code> membaca sel kosong sebagai teks kosong <code>''</code>. Modul ini tidak mengubah tipe apa pun, jadi tidak ada None. Ubah sendiri dengan <code>baris[\"voucher_code\"] or None</code> kalau perlu.",
      hint: "Modul csv selalu mengembalikan teks." },
    { id: "py-04-03", kind: "choice", prompt: "Rekanmu menulis <code>open(\"data.csv\")</code> tanpa argumen encoding. Di laptopnya (Linux) berkas UTF-8 terbaca benar, tetapi di laptop Windows dengan Python 3.14 muncul huruf rusak. Kenapa?",
      options: ["Windows tidak bisa membaca berkas UTF-8", "Tanpa encoding, Python 3.14 memakai locale encoding; di Windows itu ANSI code page seperti cp1252, bukan UTF-8", "Berkas CSV harus selalu dibuka dengan mode \"rb\"", "open() hanya bisa membaca berkas ASCII"], answer: 1,
      why: "Encoding bawaan <code>open()</code> di Python 3.14 bergantung pada sistem. Di Windows, itu ANSI code page. Mulai Python 3.15 bawaannya UTF-8, tetapi dokumentasi Python menyarankan selalu menulis <code>encoding=\"utf-8\"</code> supaya hasilnya sama di semua versi.",
      hint: "Baca lagi bagian berkas teks dan encoding." },
    { id: "py-04-04", kind: "py", prompt: "Baca <code>/data/app/customers.csv</code> baris demi baris dengan <code>for</code> (tanpa modul csv), lalu cetak jumlah pelanggan, yaitu jumlah baris dikurangi 1 baris header. Cetak satu angka saja.",
      start: `jumlah = 0
with open("/data/app/customers.csv", encoding="utf-8") as f:
    pass
print(jumlah)`,
      solution: `jumlah = 0
with open("/data/app/customers.csv", encoding="utf-8") as f:
    for baris in f:
        jumlah = jumlah + 1
print(jumlah - 1)`,
      why: "Mengulang objek berkas memberi satu baris per putaran. Berkas punya 1.501 baris: 1 header dan 1.500 pelanggan, sama dengan <code>select count(*) from app.customers</code>.",
      hint: "Ganti <code>pass</code> dengan perulangan <code>for baris in f:</code> yang menambah penghitung, lalu kurangi 1 saat mencetak." },
    { id: "py-04-05", kind: "py", prompt: "Dengan <code>csv.DictReader</code>, hitung jumlah pesanan per <code>channel</code> di <code>/data/app/orders.csv</code>. Cetak satu baris per channel, diurutkan menurut nama channel (abjad), dengan format <code>channel jumlah</code>, misalnya <code>web 1234</code>.",
      start: `import csv

jumlah = {}
with open("/data/app/orders.csv", encoding="utf-8", newline="") as f:
    for baris in csv.DictReader(f):
        pass
`,
      solution: `import csv

jumlah = {}
with open("/data/app/orders.csv", encoding="utf-8", newline="") as f:
    for baris in csv.DictReader(f):
        jumlah[baris["channel"]] = jumlah.get(baris["channel"], 0) + 1
for channel in sorted(jumlah):
    print(channel, jumlah[channel])`,
      why: "Polanya sama dengan hitungan per status: <code>.get(kunci, 0) + 1</code>. Hasilnya android 5426, ios 2361, web 4220, sama dengan <code>select channel, count(*) from app.orders group by channel order by channel</code>.",
      hint: "<code>sorted(jumlah)</code> mengurutkan kunci dict." },
    { id: "py-04-06", kind: "py", prompt: "Hitung total <code>shipping_fee</code> untuk pesanan berstatus <code>completed</code> di <code>/data/app/orders.csv</code>. Cetak satu bilangan bulat tanpa pemisah ribuan.",
      start: `import csv

total = 0
with open("/data/app/orders.csv", encoding="utf-8", newline="") as f:
    for baris in csv.DictReader(f):
        if baris["status"] == "completed":
            total = total + baris["shipping_fee"]
print(total)`,
      solution: `import csv

total = 0
with open("/data/app/orders.csv", encoding="utf-8", newline="") as f:
    for baris in csv.DictReader(f):
        if baris["status"] == "completed":
            total = total + int(baris["shipping_fee"])
print(total)`,
      why: "Nilai dari CSV selalu teks. <code>0 + \"15000\"</code> membuat TypeError, jadi ubah dulu dengan <code>int()</code>. Hasilnya 137129000, sama dengan <code>select sum(shipping_fee) from app.orders where status = 'completed'</code>.",
      hint: "Jalankan kode awalnya dan baca pesan errornya." },
    { id: "py-04-07", kind: "py", prompt: "Kolom <code>is_active</code> di <code>/data/app/products.csv</code> berisi teks <code>true</code> atau <code>false</code>. Hitung produk yang masih aktif, lalu cetak satu angka. Hati-hati: <code>bool(\"false\")</code> bernilai True.",
      start: `import csv

aktif = 0
with open("/data/app/products.csv", encoding="utf-8", newline="") as f:
    for p in csv.DictReader(f):
        if bool(p["is_active"]):
            aktif = aktif + 1
print(aktif)`,
      solution: `import csv

aktif = 0
with open("/data/app/products.csv", encoding="utf-8", newline="") as f:
    for p in csv.DictReader(f):
        if p["is_active"] == "true":
            aktif = aktif + 1
print(aktif)`,
      why: "<code>bool()</code> pada teks hanya memeriksa apakah teks kosong. Teks \"false\" tidak kosong, jadi True, dan kode awal menghitung semua 150 produk. Bandingkan teksnya langsung. Hasilnya 141, sama dengan <code>select count(*) from app.products where is_active</code>.",
      hint: "Bandingkan isi teksnya dengan <code>==</code>." },
    { id: "py-04-08", kind: "py", prompt: "Baca <code>/data/app/cities.csv</code>, lalu tulis kota yang <code>island</code>-nya <code>Sulawesi</code> ke <code>/kerja/kota_sulawesi.csv</code> dengan <code>csv.DictWriter</code>. Kolomnya <code>city_id,city_name</code> (dengan header), urut seperti di berkas asal. Kode pemeriksa akan mencetak isi berkasmu; kodemu tidak perlu mencetak apa pun.",
      setup: `from pathlib import Path
Path("/kerja/kota_sulawesi.csv").unlink(missing_ok=True)`,
      start: `import csv

with open("/data/app/cities.csv", encoding="utf-8", newline="") as f:
    kota = [k for k in csv.DictReader(f) if k["island"] == "Sulawesi"]
`,
      solution: `import csv

with open("/data/app/cities.csv", encoding="utf-8", newline="") as f:
    kota = [k for k in csv.DictReader(f) if k["island"] == "Sulawesi"]

with open("/kerja/kota_sulawesi.csv", "w", encoding="utf-8", newline="") as f:
    penulis = csv.DictWriter(f, fieldnames=["city_id", "city_name"], extrasaction="ignore")
    penulis.writeheader()
    for k in kota:
        penulis.writerow(k)`,
      check: `with open("/kerja/kota_sulawesi.csv", encoding="utf-8", newline="") as f:
    print(f.read().strip())`,
      why: "Dict dari DictReader berisi kolom <code>province</code> dan <code>island</code> juga. DictWriter bawaannya menolak kunci yang tidak ada di <code>fieldnames</code> dengan ValueError; <code>extrasaction=\"ignore\"</code> membuat kunci lebih itu diabaikan. Cara lain: buat dict baru berisi dua kunci saja. Isinya 21 Makassar dan 22 Manado.",
      hint: "Buka berkas tujuan dengan mode \"w\" dan <code>newline=\"\"</code>, panggil <code>writeheader()</code>, lalu <code>writerow</code> untuk setiap kota." },
    { id: "py-04-09", kind: "py", prompt: "Variabel <code>respons</code> berisi teks JSON seperti yang dikirim API untuk pesanan 100002. Ubah menjadi dict, lalu cetak dalam satu baris: jumlah barang di <code>items</code> dan total <code>qty * unit_price - discount</code> semua barang, dipisah spasi. Contoh format: <code>3 415500</code>.",
      setup: `respons = '{"order_id": 100002, "status": "completed", "voucher_code": "HEMAT10", "items": [{"line_no": 1, "product_id": 74, "qty": 1, "unit_price": 31900, "discount": 3200}, {"line_no": 2, "product_id": 82, "qty": 1, "unit_price": 160900, "discount": 16100}, {"line_no": 3, "product_id": 26, "qty": 1, "unit_price": 268900, "discount": 26900}]}'`,
      start: `import json

data = respons
print(len(data["items"]))`,
      solution: `import json

data = json.loads(respons)
total = sum(b["qty"] * b["unit_price"] - b["discount"] for b in data["items"])
print(len(data["items"]), total)`,
      why: "<code>respons</code> masih teks; <code>json.loads</code> mengubahnya menjadi dict, dan <code>items</code> menjadi list berisi dict. Angka di JSON langsung menjadi int, jadi tidak perlu <code>int()</code>. Hasilnya 3 415500, sama dengan total baris pesanan 100002 di <code>app.order_items</code>.",
      hint: "Pakai <code>json.loads</code>, lalu ulangi <code>data[\"items\"]</code>." },
    { id: "py-04-10", kind: "py", prompt: "Cetak dict <code>{\"pemasok\": \"CV Mekar Abadi\", \"harga\": 63900, \"catatan\": \"dicek ✓\"}</code> sebagai teks JSON dengan indentasi 2 spasi, dan tanda ✓ ditulis apa adanya (bukan kode <code>\\u2713</code>).",
      start: `import json

data = {"pemasok": "CV Mekar Abadi", "harga": 63900, "catatan": "dicek ✓"}
print(json.dumps(data))`,
      solution: `import json

data = {"pemasok": "CV Mekar Abadi", "harga": 63900, "catatan": "dicek ✓"}
print(json.dumps(data, indent=2, ensure_ascii=False))`,
      why: "<code>indent=2</code> memberi satu kunci per baris dengan jorok 2 spasi. Tanpa <code>ensure_ascii=False</code>, karakter non-ASCII ditulis sebagai kode <code>\\u2713</code>.",
      hint: "Ada dua argumen yang perlu ditambahkan ke <code>json.dumps</code>." },
    { id: "py-04-11", kind: "py", prompt: "Dari <code>/data/raw/web_events.csv</code>, tulis setiap aktivitas ber-<code>event_type</code> <code>purchase</code> ke <code>/kerja/purchase.jsonl</code> sebagai JSON Lines, dengan kunci <code>event_id</code> (int) dan <code>customer_id</code> (int). Lalu baca berkas itu baris demi baris dengan <code>json.loads</code>, dan cetak dalam satu baris: jumlah baris dan <code>event_id</code> baris pertama, dipisah spasi.",
      start: `import csv
import json

with open("/data/raw/web_events.csv", encoding="utf-8", newline="") as f_in, \\
     open("/kerja/purchase.jsonl", "w", encoding="utf-8") as f_out:
    for e in csv.DictReader(f_in):
        pass
`,
      solution: `import csv
import json

with open("/data/raw/web_events.csv", encoding="utf-8", newline="") as f_in, \\
     open("/kerja/purchase.jsonl", "w", encoding="utf-8") as f_out:
    for e in csv.DictReader(f_in):
        if e["event_type"] == "purchase":
            f_out.write(json.dumps({"event_id": int(e["event_id"]), "customer_id": int(e["customer_id"])}) + "\\n")

jumlah = 0
pertama = None
with open("/kerja/purchase.jsonl", encoding="utf-8") as f:
    for baris in f:
        objek = json.loads(baris)
        if pertama is None:
            pertama = objek["event_id"]
        jumlah = jumlah + 1
print(jumlah, pertama)`,
      why: "Setiap baris ditulis sebagai satu teks JSON diikuti <code>\\n</code>. Hasilnya 835 13: ada 835 aktivitas purchase, dan yang pertama adalah event_id 13, sama dengan <code>select count(*), min(event_id) from raw.web_events where event_type = 'purchase'</code>.",
      hint: "Tulis dengan <code>f_out.write(json.dumps(...) + \"\\n\")</code>, lalu buka lagi berkasnya untuk dibaca." },
    { id: "py-04-12", kind: "py", prompt: "Dengan <code>pathlib.Path</code> dan <code>.glob</code>, cari semua berkas <code>.csv</code> di <code>/data/app</code>. Cetak nama berkas tanpa akhiran (<code>.stem</code>) satu per baris, urut abjad, lalu di baris terakhir cetak jumlah berkasnya.",
      start: `from pathlib import Path

folder = Path("/data/app")
`,
      solution: `from pathlib import Path

folder = Path("/data/app")
berkas = sorted(folder.glob("*.csv"))
for p in berkas:
    print(p.stem)
print(len(berkas))`,
      why: "Urutan hasil <code>glob</code> tidak dijamin, jadi diurutkan dengan <code>sorted</code>. Ada 11 berkas, satu per tabel skema <code>app</code>.",
      hint: "<code>sorted(folder.glob(\"*.csv\"))</code> memberi list Path yang sudah urut." },
    { id: "py-04-13", kind: "number", prompt: "Rapikan <code>sku_text</code> di <code>/data/raw/supplier_price_upload.csv</code> dengan aturan di contoh (buang spasi, huruf besar, pastikan berawalan <code>TK-</code>). Berapa SKU berbeda yang ada di berkas itu?",
      answerPy: `import csv

def bersihkan_sku(teks):
    sku = teks.strip().upper()
    if not sku.startswith("TK-"):
        sku = "TK-" + sku.removeprefix("TK")
    return sku

with open("/data/raw/supplier_price_upload.csv", encoding="utf-8", newline="") as f:
    print(len(set(bersihkan_sku(b["sku_text"]) for b in csv.DictReader(f))))`,
      why: "Berkas punya 61 baris, tetapi setelah dirapikan hanya ada 54 SKU berbeda. Tujuh baris adalah kiriman dobel untuk SKU yang sama, dengan harga dan tanggal yang sama; sebagian nama pemasoknya berbeda, dan pemasok mana yang benar tidak diketahui dari data. Tanpa dirapikan, <code>\" tk-10364\"</code> dan <code>\"TK-10364\"</code> akan terhitung dua SKU.",
      hint: "Masukkan SKU yang sudah dirapikan ke sebuah set, lalu hitung isinya dengan <code>len()</code>." },
    { id: "py-04-14", kind: "explain", prompt: "Rekanmu menulis <code>password = \"Rahasia123\"</code> langsung di skrip pipeline, lalu meng-commit skrip itu ke Git. Jelaskan dengan kalimatmu sendiri kenapa ini berbahaya, dan bagaimana skrip sebaiknya mendapatkan password.",
      model: "Skrip di Git bisa dibaca siapa pun yang punya akses ke repositori, dan password itu tetap tersimpan di riwayat commit walaupun barisnya dihapus kemudian. Password juga sama di semua tempat skrip dijalankan, sehingga menggantinya berarti mengubah kode. Sebaiknya password disimpan di luar kode, misalnya di variabel lingkungan, lalu dibaca dengan <code>os.environ[\"TOKOKITA_DB_PASSWORD\"]</code>. Kalau memakai berkas <code>.env</code>, berkas itu dicantumkan di <code>.gitignore</code>. Password yang sudah terlanjur di-commit harus diganti.",
      hint: "Pikirkan siapa saja yang bisa membaca isi repositori dan riwayatnya." },
    { id: "py-04-15", kind: "py", level: "wawancara", prompt: "Pertanyaan wawancara: \"Berkas CSV kiriman partner kadang punya baris rusak. Bagaimana kamu memuatnya tanpa membuat seluruh proses gagal?\" Berkas <code>/kerja/pesanan_partner.csv</code> (sudah disiapkan) punya header <code>order_id,channel,shipping_fee</code>. Baca dengan <code>csv.reader</code>. Baris dianggap rusak kalau jumlah kolomnya bukan 3, atau <code>shipping_fee</code>-nya tidak bisa diubah dengan <code>int()</code>. Cetak tiga baris: <code>bagus: N</code>, <code>rusak: N</code>, lalu <code>baris rusak: </code> diikuti nomor baris berkas (<code>pembaca.line_num</code>) yang rusak dipisah koma tanpa spasi, misalnya <code>baris rusak: 3,7</code>.",
      setup: `with open("/kerja/pesanan_partner.csv", "w", encoding="utf-8", newline="") as f:
    f.write("order_id,channel,shipping_fee\\n100001,web,15000\\n100002,web\\n100003,android,15000\\n100004,ios,lima belas ribu\\n100005,web,18000,extra\\n100006,android,12000\\n")`,
      start: `import csv

bagus = 0
rusak = []
with open("/kerja/pesanan_partner.csv", encoding="utf-8", newline="") as f:
    pembaca = csv.reader(f)
    header = next(pembaca)
    for kolom in pembaca:
        bagus = bagus + 1
`,
      solution: `import csv

bagus = 0
rusak = []
with open("/kerja/pesanan_partner.csv", encoding="utf-8", newline="") as f:
    pembaca = csv.reader(f)
    header = next(pembaca)
    for kolom in pembaca:
        if len(kolom) != len(header):
            rusak.append(pembaca.line_num)
            continue
        try:
            int(kolom[2])
        except ValueError:
            rusak.append(pembaca.line_num)
            continue
        bagus = bagus + 1

print("bagus:", bagus)
print("rusak:", len(rusak))
print("baris rusak: " + ",".join(str(n) for n in rusak))`,
      why: "Prinsipnya: periksa setiap baris, pisahkan yang rusak, catat nomor barisnya, lalu lanjutkan. Jangan menghentikan seluruh muatan karena satu baris, tetapi juga jangan membuangnya diam-diam. Baris 3 kurang satu kolom, baris 5 ongkirnya bukan angka, dan baris 6 punya kolom lebih. Di pekerjaan nyata, baris rusak disimpan ke berkas terpisah dan jumlahnya dilaporkan. <code>line_num</code> menghitung baris teks yang sudah dibaca, termasuk header.",
      hint: "Periksa <code>len(kolom)</code> dulu, lalu bungkus <code>int(kolom[2])</code> dengan try/except ValueError. <code>\",\".join(...)</code> menggabung teks dengan koma." },
    { id: "py-04-16", kind: "py", level: "wawancara", prompt: "Pertanyaan wawancara: \"Berkas log aktivitas berukuran 20 GB, sedangkan memori laptopmu 8 GB. Bagaimana menghitung jumlah aktivitas per jenis?\" Kerjakan dengan <code>/data/raw/web_events.csv</code> sebagai gantinya: baca baris demi baris dengan <code>csv.DictReader</code> tanpa menyimpan baris ke list, hitung jumlah per <code>event_type</code>, lalu cetak <code>event_type jumlah</code> satu per baris, urut abjad menurut event_type.",
      start: `import csv

with open("/data/raw/web_events.csv", encoding="utf-8", newline="") as f:
    semua = list(csv.DictReader(f))
print(len(semua))`,
      solution: `import csv

jumlah = {}
with open("/data/raw/web_events.csv", encoding="utf-8", newline="") as f:
    for e in csv.DictReader(f):
        jumlah[e["event_type"]] = jumlah.get(e["event_type"], 0) + 1
for jenis in sorted(jumlah):
    print(jenis, jumlah[jenis])`,
      why: "<code>list(...)</code> memuat semua baris ke memori; dengan berkas 20 GB, program akan kehabisan memori. Mengulang pembaca baris demi baris hanya menyimpan satu baris dan dict hitungan yang kecil (5 kunci). Hasilnya add_to_cart 3092, checkout 1230, purchase 835, search 4109, view 14293, sama dengan <code>select event_type, count(*) from raw.web_events group by event_type</code>.",
      hint: "Hapus <code>list(...)</code>; ulangi <code>csv.DictReader(f)</code> langsung di dalam blok <code>with</code>." },
  ],
};
