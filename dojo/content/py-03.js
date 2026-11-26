// Bab 3 Bagian 4 (Python): fungsi, modul standar, dan penanganan error, dengan data mentah raw.supplier_price_upload.

// 61 baris raw.supplier_price_upload sebagai list tuple (row_no, sku_text, price_text, effective_date_text, supplier),
// disalin apa adanya dari /data/raw/supplier_price_upload.csv. Dipakai sebagai setup soal (tidak terlihat pengguna).
const UPLOAD = `upload = [
    (1, ' tk-10931', 'Rp 63.900', '29/09/2025', 'CV Mekar Abadi'),
    (2, 'TK-10280', '', '2025-09-16', ' pt sumber elektronik'),
    (3, 'TK10812 ', '229.900', '2025-09-02', 'PT Rumah Sejahtera'),
    (4, ' tk-10098', 'Rp 370.900', '05/09/2025', 'CV Mekar Abadi'),
    (5, 'TK11029 ', 'Rp 13.900', '01/09/2025', 'CV Mekar Abadi'),
    (6, 'TK10623 ', 'Rp 155.900', '2025-09-23', 'CV Mekar Abadi'),
    (7, ' tk-10357', '192900', '2025-10-07', 'PT Sumber Elektronik'),
    (8, 'TK10476 ', '34,900', '29/09/2025', 'CV Mekar Abadi'),
    (9, 'tk-10413', 'Rp 46.900', '07/10/2025', ' pt sumber elektronik'),
    (10, 'TK-10553', '103900', '2025-10-04', 'PT Rumah Sejahtera'),
    (11, 'TK10231 ', 'Rp141.900,00', '2025-09-30', 'PT Sumber Elektronik'),
    (12, ' tk-11043', '55.900', '11/10/2025', 'CV MEKAR ABADI '),
    (13, 'tk-10063', '223,900', '19/09/2025', ' pt sumber elektronik'),
    (14, 'TK-10329', '112.900', '2025-09-06', 'PT Sumber Elektronik'),
    (15, 'TK-10749', '72900', '2025-10-03', 'PT Rumah Sejahtera'),
    (16, ' tk-10959', 'Rp 159.900', '25/09/2025', ' pt sumber elektronik'),
    (17, 'tk-10980', 'Rp 16.900', '11/09/2025', 'PT Sumber Elektronik'),
    (18, 'TK10490 ', 'Rp 79.900', '2025-09-02', 'CV Mekar Abadi'),
    (19, 'TK10672 ', 'Rp100.900,00', '2025-10-08', 'PT Rumah Sejahtera'),
    (20, 'TK-10294', '43900', '2025-09-07', 'CV Mekar Abadi'),
    (21, ' tk-10441', 'Rp105.900,00', '11/09/2025', 'PT Sumber Elektronik'),
    (22, 'TK-11022', 'Rp 57.900', '2025-09-15', ' pt sumber elektronik'),
    (23, ' tk-10924', '100,900', '2025-09-30', 'CV MEKAR ABADI '),
    (24, ' tk-10364', '139,900', '30/09/2025', ' pt sumber elektronik'),
    (25, ' tk-10665', '165900', '2025-09-16', ' pt sumber elektronik'),
    (26, ' tk-10525', '33900', '26/09/2025', 'CV Mekar Abadi'),
    (27, 'TK10238 ', 'Rp 101.900', '2025-10-02', 'PT Rumah Sejahtera'),
    (28, ' tk-10315', '46,900', '17/09/2025', 'PT Sumber Elektronik'),
    (29, 'TK-10392', 'Rp343.900,00', '09/10/2025', 'CV Mekar Abadi'),
    (30, 'tk-10266', 'Rp59.900,00', '2025-09-08', 'CV MEKAR ABADI '),
    (31, ' tk-10847', '57,900', '19/09/2025', 'CV MEKAR ABADI '),
    (32, 'tk-10399', 'Rp 140.900', '02/09/2025', 'CV MEKAR ABADI '),
    (33, 'tk-10588', 'Rp 103.900', '2025-10-06', 'CV MEKAR ABADI '),
    (34, 'TK10602 ', '37,900', '2025-09-04', 'PT Sumber Elektronik'),
    (35, ' tk-10434', '152900', '23/09/2025', ' pt sumber elektronik'),
    (36, 'TK-10056', 'Rp510.900,00', '2025-09-03', 'PT Sumber Elektronik'),
    (37, 'TK-10756', '211.900', '25/09/2025', 'CV Mekar Abadi'),
    (38, ' tk-10581', 'Rp178.900,00', '2025-09-01', ' pt sumber elektronik'),
    (39, ' tk-10966', '132,900', '2025-09-04', 'CV MEKAR ABADI '),
    (40, ' tk-10700', 'Rp 140.900', '02/09/2025', ' pt sumber elektronik'),
    (41, ' tk-10770', 'Rp 147.900', '2025-09-23', ' pt sumber elektronik'),
    (42, 'TK-10917', 'Rp 59.900', '2025-09-21', 'CV MEKAR ABADI '),
    (43, 'tk-10994', 'Rp 26.900', '2025-09-14', 'CV MEKAR ABADI '),
    (44, 'tk-10791', 'Rp85.900,00', '2025-09-09', 'PT Sumber Elektronik'),
    (45, 'TK10070 ', '306900', '30/09/2025', 'CV Mekar Abadi'),
    (46, ' tk-10217', 'Rp234.900,00', '09/09/2025', 'CV Mekar Abadi'),
    (47, ' tk-10609', 'Rp 32.900', '05/09/2025', ' pt sumber elektronik'),
    (48, 'tk-10728', 'Rp114.900,00', '04/09/2025', ' pt sumber elektronik'),
    (49, 'tk-10574', '155900', '10/10/2025', 'CV Mekar Abadi'),
    (50, 'TK-10182', 'Rp 284.900', '2025-09-18', ' pt sumber elektronik'),
    (51, 'TK-99000', 'Rp 49.900', '2025-09-15', ' pt sumber elektronik'),
    (52, 'TK-99013', 'Rp74.900,00', '2025-09-15', 'PT Sumber Elektronik'),
    (53, 'TK-99026', '99.900', '2025-09-15', 'PT Sumber Elektronik'),
    (54, 'TK-99039', '124.900', '2025-09-15', ' pt sumber elektronik'),
    (55, ' tk-10364', '139,900', '30/09/2025', ' pt sumber elektronik'),
    (56, ' tk-10966', '132,900', '2025-09-04', 'CV Mekar Abadi'),
    (57, ' tk-11043', '55.900', '11/10/2025', 'PT Rumah Sejahtera'),
    (58, 'TK10525 ', '33900', '26/09/2025', 'CV MEKAR ABADI '),
    (59, ' tk-10231', 'Rp141.900,00', '2025-09-30', ' pt sumber elektronik'),
    (60, 'TK10266 ', 'Rp59.900,00', '2025-09-08', 'CV MEKAR ABADI '),
    (61, 'TK-10791', 'Rp85.900,00', '2025-09-09', 'PT Rumah Sejahtera'),
]
`;

// fungsi bantu yang sudah jadi untuk soal validasi
const FUNGSI_BANTU = `import datetime as dt

def bersihkan_sku(teks):
    rapi = teks.strip().upper().replace("-", "")
    return "TK-" + rapi[2:]

def bersihkan_harga(teks):
    t = teks.strip()
    if t == "":
        raise ValueError("harga kosong")
    if t.endswith(",00"):
        t = t[:-3]
    t = t.replace("Rp", "").replace(" ", "").replace(".", "").replace(",", "")
    try:
        return int(t)
    except ValueError:
        raise ValueError(f"harga tidak bisa dibaca: {teks}")

def baca_tanggal(teks):
    if "/" in teks:
        return dt.datetime.strptime(teks, "%d/%m/%Y").date()
    return dt.date.fromisoformat(teks)
`;

export default {
  id: "py-03",
  part: "python",
  title: "Fungsi, modul, dan penanganan error",
  minutes: 90,
  goals: [
    "Membuat fungsi dengan <code>def</code>, parameter, nilai bawaan, argumen bernama, dan <code>return</code>, termasuk mengembalikan beberapa nilai sekaligus.",
    "Menulis fungsi kecil yang hasilnya hanya bergantung pada masukannya, sehingga mudah dicoba dan diuji.",
    "Memakai <code>lambda</code> untuk <code>sorted(key=...)</code>, serta <code>map</code>, <code>filter</code>, <code>any</code>, dan <code>all</code>.",
    "Memakai modul standar <code>math</code>, <code>datetime</code>, dan <code>random</code>, dan membedakannya dari pustaka pihak ketiga yang dipasang dengan pip.",
    "Membaca traceback, menangani error dengan <code>try</code>/<code>except</code>/<code>else</code>/<code>finally</code>, dan membuat error sendiri dengan <code>raise</code>.",
    "Memvalidasi data mentah baris per baris dan mengumpulkan baris yang gagal, tanpa berhenti di baris gagal pertama.",
  ],
  terms: [
    { term: "fungsi python", def: "Blok kode bernama yang dibuat dengan <code>def</code>. Fungsi menerima nilai lewat parameter, menjalankan isinya setiap kali dipanggil, dan mengembalikan hasil dengan <code>return</code>." },
    { term: "modul", def: "Berkas berisi kode Python (fungsi, variabel) yang bisa dipakai program lain lewat <code>import</code>. Nama modul adalah nama berkasnya tanpa akhiran <code>.py</code>." },
    { term: "exception", def: "Error yang terjadi saat program berjalan, misalnya <code>ValueError</code>. Kalau tidak ditangani dengan <code>try</code>/<code>except</code>, program berhenti dan Python mencetak traceback." },
    { term: "parameter", def: "Nama di dalam kurung <code>def</code> yang menampung nilai masukan fungsi. Nilai yang dikirim saat fungsi dipanggil disebut argumen." },
    { term: "fungsi murni", def: "Fungsi yang hasilnya hanya bergantung pada argumennya dan tidak mengubah apa pun di luar dirinya. Masukan yang sama selalu memberi hasil yang sama." },
    { term: "traceback", def: "Laporan yang dicetak Python saat terjadi error: urutan baris kode yang sedang dijalankan, dengan jenis error dan pesannya di baris paling bawah." },
    { term: "pustaka pihak ketiga", def: "Paket Python buatan pihak lain yang tidak ikut terpasang bersama Python, misalnya pandas. Dipasang dari PyPI dengan pip." },
  ],
  introduces: ["py:def","py:return","py:lambda","py:import math","py:import datetime","py:import random","py:try","py:except","py:finally","py:raise","py:assert","py:isinstance()","py:map()","py:filter()","py:any()","py:all()"],
  sections: [
    {
      title: "Fungsi: def dan return",
      html: `<p>Langkah yang sama sering perlu dijalankan berkali-kali, misalnya merapikan teks harga di setiap baris data. <b>Fungsi</b> memberi nama pada sekumpulan langkah, supaya langkah itu cukup ditulis sekali lalu dipanggil berkali-kali.</p>
<p>Fungsi dibuat dengan kata <code>def</code>, diikuti nama fungsi, tanda kurung berisi <b>parameter</b>, lalu titik dua. Isi fungsi ditulis menjorok ke dalam. Parameter adalah nama yang menampung nilai masukan. Nilai yang kamu kirim saat memanggil fungsi disebut <i>argumen</i>.</p>
<p><code>return</code> menghentikan fungsi dan mengirim hasilnya kembali ke tempat fungsi dipanggil. Hasil itu bisa disimpan ke variabel, dicetak, atau dikirim ke fungsi lain.</p>
<p>Membuat fungsi belum menjalankan isinya. Isinya baru berjalan saat fungsi dipanggil dengan nama dan tanda kurung, misalnya <code>harga_setelah_diskon(63900, 5000)</code>.</p>`,
      examples: [{ lang: "py", code: `def harga_setelah_diskon(harga, diskon):
    hasil = harga - diskon
    return hasil

print(harga_setelah_diskon(63900, 5000))
print(harga_setelah_diskon(229900, 0))

total = harga_setelah_diskon(63900, 5000) + harga_setelah_diskon(13900, 1000)
print(total)`, note: "Fungsi yang sama dipanggil tiga kali dengan argumen berbeda. Hasil return dipakai seperti nilai biasa: dicetak, atau dijumlahkan." }],
    },
    {
      title: "Nilai bawaan dan argumen bernama",
      html: `<p>Parameter boleh diberi <b>nilai bawaan</b> dengan tanda <code>=</code>, misalnya <code>qty=1</code>. Kalau argumennya tidak dikirim, nilai bawaan yang dipakai. Parameter tanpa nilai bawaan wajib diisi, dan harus ditulis sebelum parameter yang punya nilai bawaan.</p>
<p>Saat memanggil, argumen bisa dikirim menurut urutan (argumen posisi) atau dengan nama, misalnya <code>ongkir=15000</code> (argumen bernama). Argumen bernama boleh ditulis dalam urutan apa pun, tetapi harus ditulis sesudah semua argumen posisi. Argumen bernama membuat panggilan lebih mudah dibaca: <code>total_bayar(63900, ongkir=15000)</code> lebih jelas daripada <code>total_bayar(63900, 1, 15000)</code>.</p>
<p>Kesalahan umum: memakai list atau dict sebagai nilai bawaan, misalnya <code>daftar=[]</code>. Nilai bawaan dibuat <b>sekali saja</b>, saat <code>def</code> dijalankan, lalu dipakai bersama oleh semua panggilan. Kalau fungsi menambah isi list itu, isi dari panggilan sebelumnya ikut terbawa. Cara yang benar: pakai <code>daftar=None</code>, lalu di dalam fungsi tulis <code>if daftar is None: daftar = []</code>.</p>`,
      examples: [{ lang: "py", code: `def total_bayar(harga, qty=1, ongkir=0):
    return harga * qty + ongkir

print(total_bayar(63900))
print(total_bayar(63900, 2))
print(total_bayar(63900, ongkir=15000))
print(total_bayar(ongkir=15000, harga=63900, qty=3))`, note: "Panggilan pertama memakai qty=1 dan ongkir=0. Panggilan terakhir memakai argumen bernama semua, sehingga urutannya bebas." }],
    },
    {
      title: "Mengembalikan beberapa nilai, dan None",
      html: `<p>Satu <code>return</code> bisa mengirim beberapa nilai yang dipisah koma. Python membungkusnya menjadi satu tuple. Di tempat pemanggilan, tuple itu bisa langsung dibongkar ke beberapa variabel: <code>termurah, termahal = rentang_harga(...)</code>. Jumlah variabel di kiri harus sama dengan jumlah nilai.</p>
<p>Fungsi yang tidak punya <code>return</code>, atau yang selesai tanpa mencapai <code>return</code>, tetap mengembalikan nilai, yaitu <code>None</code>. Ini sering membingungkan: fungsi yang hanya <code>print</code> terlihat "menghasilkan" sesuatu di layar, padahal nilai kembaliannya <code>None</code>.</p>
<p>Di pekerjaan data engineer, fungsi dipakai di <i>pipeline</i>, yaitu rangkaian langkah otomatis yang mengambil data dari sumber, merapikannya, lalu menyimpannya. Di pipeline, fungsi sebaiknya mengembalikan hasil dengan <code>return</code>, dan pemanggilnya yang memutuskan hasil itu dicetak atau disimpan.</p>`,
      examples: [{ lang: "py", code: `def rentang_harga(daftar_harga):
    return min(daftar_harga), max(daftar_harga)

termurah, termahal = rentang_harga([63900, 229900, 13900, 192900])
print(termurah, termahal)

hasil = rentang_harga([63900, 229900])
print(hasil, type(hasil))

def sapa(nama):
    print(f"Halo, {nama}")

kembalian = sapa("Tim Data")
print(kembalian)`, note: "Fungsi sapa mencetak teks, tetapi tidak punya return, sehingga nilai kembaliannya None." }],
    },
    {
      title: "Docstring dan ruang lingkup variabel",
      html: `<p><b>Docstring</b> adalah teks bertanda kutip tiga (<code>"""..."""</code>) di baris pertama isi fungsi. Isinya penjelasan singkat apa yang dikerjakan fungsi. Python menyimpannya di <code>nama_fungsi.__doc__</code>. Beberapa alat memakai docstring untuk membuat dokumentasi otomatis, jadi biasakan menulisnya.</p>
<p>Contoh di bawah memakai beberapa <i>method</i> teks, yaitu fungsi yang menempel pada nilai teks dan dipanggil dengan titik. <code>.strip()</code> membuang spasi di awal dan akhir. <code>.upper()</code> mengubah ke huruf besar. <code>.replace("-", "")</code> mengganti semua tanda minus dengan teks kosong. Ketiganya menghasilkan teks baru; teks aslinya tidak berubah. <code>rapi[2:]</code> mengambil teks mulai karakter ketiga sampai akhir (penomoran dimulai dari 0).</p>
<p><b>Ruang lingkup</b> (<i>scope</i>) menentukan di mana sebuah variabel dikenal. Variabel yang diisi di dalam fungsi adalah variabel lokal: hanya ada selama fungsi berjalan, dan tidak terlihat dari luar. Fungsi boleh <i>membaca</i> variabel di luar dirinya. Tetapi kalau kamu mengisi variabel bernama sama di dalam fungsi, Python membuat variabel lokal baru, dan variabel di luar tidak berubah.</p>`,
      examples: [{ lang: "py", code: `def bersihkan_pemasok(teks):
    """Membuang spasi di awal dan akhir, lalu mengubah nama pemasok ke huruf besar."""
    rapi = teks.strip().upper()
    return rapi

print(bersihkan_pemasok(" pt sumber elektronik"))
print(bersihkan_pemasok("CV Mekar Abadi"))
print(bersihkan_pemasok.__doc__)

batas = 100000

def mahal(harga):
    return harga > batas

def ubah_batas():
    batas = 50000
    return batas

print(mahal(229900))
print(ubah_batas(), batas)`, note: "Fungsi mahal membaca batas dari luar. Di ubah_batas, batas = 50000 membuat variabel lokal baru, sehingga batas di luar tetap 100000." }],
    },
    {
      title: "Fungsi kecil yang mudah diuji",
      html: `<p><b>Fungsi murni</b> adalah fungsi yang hasilnya hanya bergantung pada argumennya, dan tidak mengubah apa pun di luar dirinya: tidak mengubah variabel luar, tidak menulis berkas, tidak mencetak. Masukan yang sama selalu memberi hasil yang sama.</p>
<p>Untuk pipeline data, pola ini sangat berguna. Pecah pembersihan menjadi fungsi kecil, satu tugas per fungsi: satu untuk kode produk, satu untuk harga, satu untuk tanggal. Setiap fungsi bisa dicoba sendiri dengan beberapa contoh nilai, tanpa menjalankan seluruh pipeline. Kalau suatu hari pemasok mengirim format baru, kamu cukup memperbaiki satu fungsi lalu mencobanya lagi.</p>
<p>Cara paling sederhana mencoba fungsi: bandingkan hasilnya dengan hasil yang kamu harapkan memakai <code>==</code>. Kalau semuanya <code>True</code>, fungsi bekerja untuk contoh-contoh itu.</p>`,
      examples: [{ lang: "py", code: `def bersihkan_sku(teks):
    """Merapikan kode produk pemasok menjadi bentuk TK-12345."""
    rapi = teks.strip().upper().replace("-", "")
    return "TK-" + rapi[2:]

print(bersihkan_sku(" tk-10931") == "TK-10931")
print(bersihkan_sku("TK10812 ") == "TK-10812")
print(bersihkan_sku("TK-10553") == "TK-10553")`, note: "Tiga bentuk kode produk dari raw.supplier_price_upload (baris 1, 3, dan 10) dirapikan ke bentuk yang sama." }],
    },
    {
      title: "lambda, map, filter, any, dan all",
      html: `<p><code>lambda</code> membuat fungsi kecil tanpa nama, dalam satu baris, dengan bentuk <code>lambda parameter: ekspresi</code>. Ekspresi adalah potongan kode yang menghasilkan nilai, misalnya <code>baris[1]</code> atau <code>t != ""</code>. Isinya hanya boleh satu ekspresi, dan hasil ekspresi itu yang dikembalikan. Pemakaian paling umum adalah argumen <code>key</code> di <code>sorted</code>: fungsi yang dipanggil sekali untuk setiap elemen, dan hasilnya dipakai sebagai dasar urutan. <code>reverse=True</code> membalik urutan menjadi dari besar ke kecil.</p>
<p>Empat fungsi bawaan lain menerima fungsi atau kumpulan nilai:</p>
<ul><li><code>map(f, data)</code> menjalankan <code>f</code> pada setiap elemen.</li>
<li><code>filter(f, data)</code> hanya menyimpan elemen yang hasil <code>f</code>-nya benar.</li>
<li><code>any(data)</code> bernilai <code>True</code> kalau minimal satu elemen benar. Untuk kumpulan kosong, hasilnya <code>False</code>.</li>
<li><code>all(data)</code> bernilai <code>True</code> kalau semua elemen benar. Untuk kumpulan kosong, hasilnya <code>True</code>.</li></ul>
<p><code>map</code> dan <code>filter</code> tidak langsung menghasilkan list. Bungkus dengan <code>list(...)</code> untuk melihat isinya. Dokumentasi Python menyebut kedua fungsi ini bisa digantikan comprehension. Kalau kamu butuh mengubah dan menyaring sekaligus, comprehension biasanya lebih mudah dibaca (ini pendapat penulis kursus): <code>[int(t) for t in teks_harga if t != ""]</code>. <code>map</code> enak dipakai kalau fungsinya sudah ada, misalnya <code>map(int, ...)</code>.</p>`,
      examples: [
        { lang: "py", code: `harga_baru = [("TK-10931", 63900), ("TK-10812", 229900), ("TK-11029", 13900), ("TK-10357", 192900)]

urut = sorted(harga_baru, key=lambda baris: baris[1], reverse=True)
for sku, harga in urut:
    print(sku, harga)`, note: "key mengambil elemen kedua (harga) dari setiap tuple. Tanpa key, sorted mengurutkan menurut elemen pertama, yaitu kode produk." },
        { lang: "py", code: `teks_harga = ["63900", "229900", "", "13900"]

terisi = list(filter(lambda t: t != "", teks_harga))
angka = list(map(int, terisi))
print(terisi)
print(angka)

print(any([t == "" for t in teks_harga]))
print(all([h > 0 for h in angka]))
print(any([]), all([]))

print([int(t) for t in teks_harga if t != ""])`, note: "Baris terakhir memberi hasil yang sama dengan filter lalu map, dalam satu comprehension." },
      ],
    },
    {
      title: "Modul dan import: math",
      html: `<p><b>Modul</b> adalah berkas berisi kode Python yang bisa dipakai program lain. Python sudah membawa banyak modul siap pakai, yang disebut <b>pustaka standar</b> (<i>standard library</i>). Untuk memakainya, tulis <code>import nama_modul</code> di awal kode, lalu panggil isinya dengan titik: <code>math.ceil(...)</code>. Ada dua bentuk lain: <code>from math import ceil</code> mengambil satu nama saja sehingga bisa dipanggil tanpa <code>math.</code>, dan <code>import datetime as dt</code> memberi nama pendek pada modul.</p>
<p>Modul <code>math</code> berisi fungsi hitung. <code>math.ceil(x)</code> membulatkan ke atas ke bilangan bulat terdekat, dan <code>math.floor(x)</code> membulatkan ke bawah. Contoh pemakaian di pekerjaan data: menghitung berapa kelompok kiriman (<i>batch</i>) yang dibutuhkan kalau 61 baris dikirim 25 baris sekali jalan.</p>
<p>Bilangan pecahan (<code>float</code>) disimpan sebagai perkiraan, sehingga <code>0.1 + 0.2 == 0.3</code> bernilai <code>False</code>. Untuk membandingkan dua float, pakai <code>math.isclose(a, b)</code>.</p>`,
      examples: [{ lang: "py", code: `import math

print(math.ceil(61 / 25))
print(math.floor(229900 / 1000))
print(0.1 + 0.2 == 0.3, math.isclose(0.1 + 0.2, 0.3))

from math import ceil
print(ceil(7 / 2))`, note: "61 / 25 = 2,44. Dibulatkan ke atas menjadi 3 batch, karena sisa 11 baris tetap perlu satu batch sendiri." }],
    },
    {
      title: "Pustaka standar dan pustaka pihak ketiga",
      html: `<p>Pustaka standar ikut terpasang bersama Python. Penginstal Python untuk Windows biasanya menyertakan seluruh pustaka standar. Jadi <code>math</code>, <code>datetime</code>, dan <code>random</code> bisa langsung di-<code>import</code>.</p>
<p><b>Pustaka pihak ketiga</b> dibuat pihak lain dan tidak ikut terpasang. Contohnya pandas, pustaka untuk mengolah data berbentuk tabel. Pustaka seperti ini diambil dari <b>PyPI</b> (<i>Python Package Index</i>), tempat publik berisi ratusan ribu paket, memakai <b>pip</b>, program pemasang paket yang sudah ikut di penginstal resmi Python. Di Windows, dokumentasi pip memakai bentuk <code>py -m pip ...</code>. Di Linux dan macOS bentuknya <code>python -m pip ...</code>.</p>
<p>Di mesin latihan Dojo kamu tidak perlu memasang apa pun: paket yang dipakai kursus sudah disiapkan. Perintah di bawah hanya untuk laptopmu. Versi paket bisa dikunci dengan <code>==</code>, supaya laptopmu dan server memakai versi yang sama.</p>`,
      examples: [{ lang: "shell", code: `py -m pip --version
py -m pip install pandas
py -m pip install "pandas==3.0.2"
py -m pip list`, note: "Baris kedua memasang versi terbaru pandas. Baris ketiga memasang versi tertentu. Dokumentasi pip menulis versi di dalam tanda kutip ganda untuk Windows, karena tanda seperti > dan < bisa dibaca shell sebagai perintah lain. pip list menampilkan semua paket yang terpasang." }],
    },
    {
      title: "Tanggal dengan datetime",
      html: `<p>Modul <code>datetime</code> punya tiga jenis nilai yang paling sering dipakai:</p>
<ul><li><code>date</code>: tanggal saja, misalnya <code>dt.date(2025, 10, 31)</code>.</li>
<li><code>datetime</code>: tanggal dan jam, misalnya <code>dt.datetime(2025, 10, 31, 8, 30)</code>.</li>
<li><code>timedelta</code>: lama waktu, misalnya <code>dt.timedelta(days=7)</code>.</li></ul>
<p>Dokumentasi Python menyarankan <code>import datetime as dt</code>, supaya nama modul <code>datetime</code> tidak tertukar dengan jenis nilai <code>datetime</code> di dalamnya.</p>
<p>Padanannya dengan SQL yang sudah kamu pelajari:</p>
<ul><li><code>x.replace(day=1)</code> mengganti hari menjadi 1, sehingga hasilnya tanggal awal bulan. Ini padanan <code>DATE_TRUNC('month', x)</code>.</li>
<li><code>x - interval '7 days'</code> setara dengan <code>x - dt.timedelta(days=7)</code>.</li>
<li>Tanggal dikurangi tanggal menghasilkan <code>timedelta</code>; jumlah harinya ada di <code>.days</code>.</li>
<li><code>TO_DATE(teks, 'DD/MM/YYYY')</code> setara dengan <code>dt.datetime.strptime(teks, "%d/%m/%Y")</code>, lalu <code>.date()</code> untuk membuang jamnya. <code>%d</code> adalah hari dua digit, <code>%m</code> bulan dua digit, dan <code>%Y</code> tahun empat digit.</li>
<li><code>TO_CHAR</code> setara dengan <code>.strftime(format)</code>, yang mengubah tanggal menjadi teks.</li></ul>
<p>Teks berformat ISO (<code>2025-09-16</code>) bisa dibaca dengan <code>dt.date.fromisoformat(teks)</code>.</p>
<p>Bedanya dengan SQL: <code>timedelta</code> tidak punya satuan bulan atau tahun. Satuannya hanya <code>weeks</code>, <code>days</code>, <code>hours</code>, <code>minutes</code>, <code>seconds</code>, <code>milliseconds</code>, dan <code>microseconds</code>. Jadi tidak ada padanan langsung untuk <code>interval '1 month'</code>.</p>`,
      examples: [{ lang: "py", code: `import datetime as dt

hari_ini = dt.date(2025, 10, 31)
print(hari_ini)
print(hari_ini.replace(day=1))
print(hari_ini - dt.timedelta(days=7))

selisih = hari_ini - dt.date(2025, 9, 1)
print(selisih.days)

berlaku = dt.datetime.strptime("29/09/2025", "%d/%m/%Y").date()
print(berlaku, berlaku.strftime("%d-%m-%Y"))
print(dt.date.fromisoformat("2025-09-16"))

waktu = dt.datetime(2025, 10, 31, 8, 30)
print(waktu + dt.timedelta(hours=2))`, note: "Tanggal '29/09/2025' adalah effective_date_text baris 1 di raw.supplier_price_upload. Setelah dibaca, tanggal bisa dihitung dan dibandingkan, tidak lagi sekadar teks." }],
    },
    {
      title: "Angka acak yang bisa diulang: random",
      html: `<p>Modul <code>random</code> memilih nilai secara acak. <code>random.sample(data, k)</code> memilih <code>k</code> elemen berbeda, dan <code>random.randint(a, b)</code> memilih satu bilangan bulat dari <code>a</code> sampai <code>b</code>, termasuk keduanya. Di pekerjaan data, ini dipakai misalnya untuk mengambil beberapa baris acak yang diperiksa manual.</p>
<p>Supaya hasilnya bisa diulang, panggil <code>random.seed(angka)</code> lebih dulu. <i>Seed</i> adalah nilai awal pembuat angka acak: seed yang sama memberi urutan yang sama, sehingga rekan kerjamu bisa memeriksa baris yang sama persis. Dokumentasi hanya menjamin urutan yang sama untuk fungsi <code>random()</code> antarversi Python. Untuk fungsi lain seperti <code>sample</code>, anggap hasilnya hanya pasti sama di versi Python yang sama.</p>
<p>Jangan memakai <code>random</code> untuk membuat password atau token (kode rahasia untuk masuk ke sebuah sistem). Dokumentasi Python melarangnya untuk keperluan keamanan dan menyarankan modul <code>secrets</code>.</p>`,
      examples: [{ lang: "py", code: `import random

nomor_baris = list(range(1, 62))

random.seed(2025)
print(random.sample(nomor_baris, 5))

random.seed(2025)
print(random.sample(nomor_baris, 5))

print(random.randint(1, 61))`, note: "Dua baris pertama keluarannya sama persis karena seed-nya sama. Angka 1 sampai 61 adalah nomor baris berkas pemasok." }],
    },
    {
      title: "Membaca traceback",
      html: `<p><b>Exception</b> adalah error yang terjadi saat program berjalan. Kalau tidak ditangani, program berhenti dan Python mencetak <b>traceback</b>. Fungsi di bawah lupa membuang <code>,00</code> di akhir harga, sehingga gagal di baris 11 berkas pemasok:</p>
<pre>def bersihkan_harga(teks):
    t = teks.replace("Rp", "").replace(" ", "").replace(".", "")
    return int(t)

print(bersihkan_harga("Rp 63.900"))
print(bersihkan_harga("Rp141.900,00"))</pre>
<p>Di mesin latihan, bagian akhir traceback-nya seperti ini:</p>
<pre>  File "&lt;exec&gt;", line 6, in &lt;module&gt;
  File "&lt;exec&gt;", line 3, in bersihkan_harga
ValueError: invalid literal for int() with base 10: '141900,00'</pre>
<p>Baca dari bawah ke atas:</p>
<ol><li>Baris terakhir: jenis error (<code>ValueError</code>) dan pesannya. <code>int()</code> menerima teks <code>'141900,00'</code> yang bukan bilangan bulat.</li>
<li>Di atasnya: tempat error terjadi, yaitu baris 3 di dalam fungsi <code>bersihkan_harga</code>.</li>
<li>Lebih atas lagi: siapa yang memanggil, yaitu baris 6 di kode utama (<code>&lt;module&gt;</code>).</li></ol>
<p>Di laptop, Python juga mencetak isi baris kodenya di bawah setiap baris <code>File</code>. Jenis exception yang sering muncul: <code>ValueError</code> (nilai tidak sesuai, misalnya teks bukan angka), <code>TypeError</code> (jenis nilai salah, misalnya teks ditambah angka), <code>ZeroDivisionError</code> (pembagian dengan nol), <code>NameError</code> (nama variabel belum ada), dan <code>KeyError</code> (kunci tidak ada di dict).</p>`,
      examples: [{ lang: "py", code: `teks = "Rp141.900,00"
t = teks.replace("Rp", "").replace(" ", "").replace(".", "")
print(t)
print(t.endswith(",00"))
print(int(t[:-3]))`, note: "Mencetak nilai antara membantu menemukan sumber error. .endswith(\",00\") memeriksa akhiran teks, dan t[:-3] membuang tiga karakter terakhir." }],
    },
    {
      title: "Menangani error: try, except, else, finally",
      html: `<p><code>try</code> menjalankan kode yang mungkin gagal. Kalau terjadi exception, Python mencari <code>except</code> yang jenisnya cocok, lalu menjalankan isinya, dan program tidak berhenti. Bagian lain bersifat pilihan:</p>
<ul><li><code>else</code> berjalan hanya kalau <code>try</code> tidak menghasilkan error.</li>
<li><code>finally</code> selalu berjalan, ada error atau tidak. Biasanya dipakai untuk membereskan sesuatu, misalnya menutup koneksi.</li>
<li><code>except ValueError as err</code> menyimpan exception-nya di variabel <code>err</code>, sehingga pesannya bisa dicetak atau dicatat.</li></ul>
<p>Selalu tulis jenis exception-nya, misalnya <code>except ValueError:</code>. <code>except:</code> tanpa jenis menangkap <i>semua</i> error, termasuk salah ketik nama variabel (<code>NameError</code>). Akibatnya bug di kodemu ikut tersembunyi, dan data yang salah lolos diam-diam. Beberapa jenis bisa ditangkap sekaligus dengan tuple: <code>except (ValueError, TypeError):</code>.</p>`,
      examples: [{ lang: "py", code: `def ke_angka(teks):
    hasil = None
    try:
        hasil = int(teks)
    except ValueError as err:
        print("gagal:", err)
    else:
        print("berhasil:", hasil)
    finally:
        print("  pemeriksaan selesai")
    return hasil

print(ke_angka("192900"))
print(ke_angka("Rp 63.900"))`, note: "Untuk '192900' yang berjalan adalah try, else, lalu finally. Untuk 'Rp 63.900', int() gagal, sehingga yang berjalan except lalu finally, dan fungsi mengembalikan None." }],
    },
    {
      title: "raise, assert, dan isinstance",
      html: `<p><code>raise</code> membuat exception sendiri, misalnya <code>raise ValueError("harga kosong")</code>. Pakai ini saat data tidak memenuhi aturan, dan tulis pesan yang menjelaskan apa yang salah serta nilainya. Pesan seperti <code>harga tidak bisa dibaca: Rp 12.9OO</code> jauh lebih berguna daripada <code>error</code>.</p>
<p>Di dalam <code>except</code>, kamu boleh <code>raise</code> exception baru dengan pesan yang lebih jelas, seperti di fungsi <code>bersihkan_harga</code> di bawah.</p>
<p><code>assert kondisi, "pesan"</code> memeriksa sebuah kondisi. Kalau kondisinya salah, Python menghasilkan <code>AssertionError</code> dengan pesan itu. <code>assert</code> cocok untuk pemeriksaan sederhana saat kamu mencoba kode. Jangan memakainya untuk memvalidasi data di produksi (sistem yang dipakai sungguhan setiap hari): kalau Python dijalankan dengan pilihan <code>-O</code> (optimasi), semua <code>assert</code> dibuang dan tidak dijalankan. Untuk validasi data, pakai <code>if</code> dan <code>raise</code>.</p>
<p><code>isinstance(nilai, jenis)</code> memeriksa jenis sebuah nilai, misalnya <code>isinstance(63900, int)</code>. Jenisnya boleh tuple, misalnya <code>(int, float)</code>. Hati-hati: <code>True</code> dan <code>False</code> juga dianggap <code>int</code>, karena di Python <code>bool</code> adalah turunan <code>int</code>.</p>`,
      examples: [{ lang: "py", code: `def bersihkan_harga(teks):
    """Mengubah teks harga pemasok menjadi rupiah (int)."""
    t = teks.strip()
    if t == "":
        raise ValueError("harga kosong")
    if t.endswith(",00"):
        t = t[:-3]
    t = t.replace("Rp", "").replace(" ", "").replace(".", "").replace(",", "")
    try:
        return int(t)
    except ValueError:
        raise ValueError(f"harga tidak bisa dibaca: {teks}")

for teks in ["Rp 63.900", "Rp141.900,00", "34,900", "192900", "", "Rp 12.9OO"]:
    try:
        print(teks, "->", bersihkan_harga(teks))
    except ValueError as err:
        print("ditolak:", err)

hasil = bersihkan_harga("229.900")
assert isinstance(hasil, int), "hasil harus int"
print(isinstance(hasil, int), isinstance("229900", int), isinstance(hasil, (int, float)))
print(isinstance(True, int))`, note: "Lima teks pertama adalah bentuk harga yang ada di raw.supplier_price_upload. 'Rp 12.9OO' adalah contoh salah ketik buatan (huruf O, bukan angka 0)." }],
    },
    {
      title: "Validasi baris per baris: kumpulkan yang gagal",
      html: `<p>Data mentah hampir selalu punya baris yang rusak. Kalau program berhenti di baris rusak pertama, kamu hanya tahu satu masalah. Kamu perbaiki, jalankan lagi, berhenti lagi di masalah berikutnya. Untuk ribuan baris, cara ini sangat lambat.</p>
<p>Pola yang lebih baik:</p>
<ol><li>Siapkan dua list: <code>bersih</code> untuk baris yang lolos, dan <code>gagal</code> untuk baris yang ditolak.</li>
<li>Untuk setiap baris, panggil fungsi pembersih di dalam <code>try</code>.</li>
<li>Kalau berhasil, masukkan hasilnya ke <code>bersih</code>. Kalau muncul <code>ValueError</code>, catat nomor baris dan pesannya di <code>gagal</code>, lalu lanjut ke baris berikutnya.</li>
<li>Di akhir, cetak ringkasan: berapa yang lolos, berapa yang gagal, dan alasannya.</li></ol>
<p>Dengan begitu, satu kali jalan sudah memberi daftar lengkap masalah yang bisa dikirim ke pemasok. Kodenya juga tetap pendek, karena setiap aturan ada di fungsinya sendiri.</p>
<p>Contoh di bawah memakai 12 baris pertama <code>raw.supplier_price_upload</code>, ditulis langsung sebagai list tuple. Cara membaca berkasnya dibahas di bab berikutnya. Di 12 baris ini hanya baris 2 yang gagal, karena harganya kosong. Di seluruh 61 baris berkas, dengan aturan yang sama, baris 2 juga satu-satunya yang gagal.</p>`,
      examples: [{ lang: "py", code: `import datetime as dt

upload = [
    (1, ' tk-10931', 'Rp 63.900', '29/09/2025', 'CV Mekar Abadi'),
    (2, 'TK-10280', '', '2025-09-16', ' pt sumber elektronik'),
    (3, 'TK10812 ', '229.900', '2025-09-02', 'PT Rumah Sejahtera'),
    (4, ' tk-10098', 'Rp 370.900', '05/09/2025', 'CV Mekar Abadi'),
    (5, 'TK11029 ', 'Rp 13.900', '01/09/2025', 'CV Mekar Abadi'),
    (6, 'TK10623 ', 'Rp 155.900', '2025-09-23', 'CV Mekar Abadi'),
    (7, ' tk-10357', '192900', '2025-10-07', 'PT Sumber Elektronik'),
    (8, 'TK10476 ', '34,900', '29/09/2025', 'CV Mekar Abadi'),
    (9, 'tk-10413', 'Rp 46.900', '07/10/2025', ' pt sumber elektronik'),
    (10, 'TK-10553', '103900', '2025-10-04', 'PT Rumah Sejahtera'),
    (11, 'TK10231 ', 'Rp141.900,00', '2025-09-30', 'PT Sumber Elektronik'),
    (12, ' tk-11043', '55.900', '11/10/2025', 'CV MEKAR ABADI '),
]

def bersihkan_sku(teks):
    rapi = teks.strip().upper().replace("-", "")
    return "TK-" + rapi[2:]

def bersihkan_harga(teks):
    t = teks.strip()
    if t == "":
        raise ValueError("harga kosong")
    if t.endswith(",00"):
        t = t[:-3]
    t = t.replace("Rp", "").replace(" ", "").replace(".", "").replace(",", "")
    try:
        return int(t)
    except ValueError:
        raise ValueError(f"harga tidak bisa dibaca: {teks}")

def baca_tanggal(teks):
    if "/" in teks:
        return dt.datetime.strptime(teks, "%d/%m/%Y").date()
    return dt.date.fromisoformat(teks)

def rapikan_baris(baris):
    no, sku, harga, tanggal, pemasok = baris
    return (no, bersihkan_sku(sku), bersihkan_harga(harga), baca_tanggal(tanggal), pemasok.strip().upper())

bersih, gagal = [], []
for baris in upload:
    try:
        bersih.append(rapikan_baris(baris))
    except ValueError as err:
        gagal.append((baris[0], str(err)))

print(f"lolos: {len(bersih)}, gagal: {len(gagal)}")
for no, pesan in gagal:
    print(f"baris {no}: {pesan}")
for no, sku, harga, tanggal, pemasok in bersih[:3]:
    print(no, sku, harga, tanggal, pemasok)`, note: "Baris 2 ditolak dengan pesan 'harga kosong', dan program tetap memproses 11 baris lainnya. str(err) mengubah exception menjadi teks pesannya." }],
    },
  ],
  tsql: [],
  summary: [
    "<code>def</code> membuat fungsi; <code>return</code> mengirim hasil. Fungsi tanpa <code>return</code> mengembalikan <code>None</code>.",
    "Nilai bawaan membuat argumen boleh tidak diisi; argumen bernama membuat panggilan jelas. Jangan memakai list atau dict sebagai nilai bawaan.",
    "<code>return a, b</code> mengembalikan tuple yang bisa dibongkar ke beberapa variabel.",
    "Variabel yang diisi di dalam fungsi bersifat lokal. Fungsi murni yang kecil mudah dicoba dan diperbaiki.",
    "<code>lambda</code> cocok untuk <code>sorted(key=...)</code>. <code>any</code> dan <code>all</code> memeriksa kumpulan nilai; comprehension sering lebih jelas daripada <code>map</code>/<code>filter</code>.",
    "Pustaka standar (<code>math</code>, <code>datetime</code>, <code>random</code>) langsung bisa di-import; pustaka pihak ketiga dipasang dengan <code>py -m pip install</code>.",
    "<code>replace(day=1)</code> dan <code>timedelta</code> adalah padanan <code>DATE_TRUNC</code> dan <code>INTERVAL</code>; <code>strptime</code>/<code>strftime</code> padanan <code>TO_DATE</code>/<code>TO_CHAR</code>.",
    "Baca traceback dari bawah. Tangkap exception yang spesifik, <code>raise</code> dengan pesan yang jelas, dan kumpulkan baris gagal alih-alih berhenti di baris pertama.",
  ],
  drills: [
    { id: "py-03-01", kind: "choice", prompt: "Apa yang tercetak oleh kode ini?<pre>def cetak_total(a, b):\n    print(a + b)\n\nhasil = cetak_total(2, 3)\nprint(hasil)</pre>",
      options: ["5 lalu 5", "5 lalu None", "None saja", "Error, karena tidak ada return"], answer: 1,
      why: "cetak_total mencetak 5, tetapi tidak punya return, sehingga nilai kembaliannya None. print(hasil) mencetak None.",
      hint: "Bedakan apa yang dicetak dengan apa yang dikembalikan." },
    { id: "py-03-02", kind: "choice", prompt: "Kamu memanggil <code>int(teks)</code> untuk teks harga dari pemasok, dan ingin menangani teks yang bukan angka. Mana yang paling tepat?",
      options: ["<code>except:</code> tanpa jenis, supaya semua error tertangkap", "<code>except ValueError:</code>", "<code>finally:</code> saja, tanpa except", "Tidak perlu ditangani; biarkan program berhenti diam-diam"], answer: 1,
      why: "int() menghasilkan ValueError untuk teks yang bukan bilangan bulat. except tanpa jenis juga menangkap error lain, misalnya salah ketik nama variabel, sehingga bug ikut tersembunyi. finally tidak menangani error; error tetap muncul setelah finally selesai.",
      hint: "Tangkap hanya jenis error yang memang kamu perkirakan." },
    { id: "py-03-03", kind: "py", prompt: "Buat fungsi <code>bersihkan_sku(teks)</code> yang merapikan kode produk pemasok menjadi bentuk <code>TK-12345</code>: buang spasi di awal dan akhir, ubah ke huruf besar, buang semua tanda minus, lalu gabungkan <code>\"TK-\"</code> dengan angka sesudah dua huruf pertama. Pemeriksa akan memanggil fungsimu untuk <code>' tk-10931'</code>, <code>'TK10812 '</code>, dan <code>'TK-10553'</code>, lalu mencetak hasilnya, satu per baris.",
      start: "def bersihkan_sku(teks):\n    rapi = teks.strip()\n    return rapi\n",
      solution: "def bersihkan_sku(teks):\n    rapi = teks.strip().upper().replace(\"-\", \"\")\n    return \"TK-\" + rapi[2:]\n",
      check: "print(bersihkan_sku(' tk-10931'))\nprint(bersihkan_sku('TK10812 '))\nprint(bersihkan_sku('TK-10553'))",
      why: "strip() membuang spasi, upper() menyeragamkan huruf, replace(\"-\", \"\") membuang tanda minus sehingga semua bentuk menjadi TK12345. rapi[2:] mengambil angkanya, lalu digabung dengan \"TK-\".",
      hint: "Sambung method dengan titik: teks.strip().upper().replace(...). Lalu \"TK-\" + rapi[2:]." },
    { id: "py-03-04", kind: "py", prompt: "Buat fungsi <code>ringkas_harga(daftar)</code> yang mengembalikan tiga nilai sekaligus: jumlah elemen, harga termurah, dan harga termahal, dalam urutan itu. Pemeriksa akan menjalankan <code>n, lo, hi = ringkas_harga([63900, 229900, 13900])</code> lalu <code>print(n, lo, hi)</code>, kemudian <code>print(ringkas_harga([5000]))</code>. Keluaran yang diharapkan: <code>3 13900 229900</code> lalu <code>(1, 5000, 5000)</code>.",
      start: "def ringkas_harga(daftar):\n    print(len(daftar), min(daftar), max(daftar))\n",
      solution: "def ringkas_harga(daftar):\n    return len(daftar), min(daftar), max(daftar)\n",
      check: "n, lo, hi = ringkas_harga([63900, 229900, 13900])\nprint(n, lo, hi)\nprint(ringkas_harga([5000]))",
      why: "return dengan beberapa nilai yang dipisah koma mengembalikan satu tuple. Tuple itu bisa dibongkar ke tiga variabel, atau dicetak utuh dengan tanda kurung.",
      hint: "Ganti print dengan return. Nilai dipisah koma." },
    { id: "py-03-05", kind: "py", prompt: "Variabel <code>harga_baru</code> berisi pasangan (kode produk, harga) dari enam baris <code>raw.supplier_price_upload</code> yang sudah dirapikan. Urutkan dari harga termahal dengan <code>sorted</code> dan <code>lambda</code>, lalu cetak 3 teratas, satu per baris, dengan format <code>kode harga</code> (dipisah satu spasi), misalnya <code>TK-10056 510900</code>.",
      start: "harga_baru = [(\"TK-10931\", 63900), (\"TK-10812\", 229900), (\"TK-10098\", 370900), (\"TK-10357\", 192900), (\"TK-10392\", 343900), (\"TK-10056\", 510900)]\n\nurut = sorted(harga_baru)\nfor sku, harga in urut[:3]:\n    print(sku, harga)\n",
      solution: "harga_baru = [(\"TK-10931\", 63900), (\"TK-10812\", 229900), (\"TK-10098\", 370900), (\"TK-10357\", 192900), (\"TK-10392\", 343900), (\"TK-10056\", 510900)]\n\nurut = sorted(harga_baru, key=lambda baris: baris[1], reverse=True)\nfor sku, harga in urut[:3]:\n    print(sku, harga)\n",
      why: "Tanpa key, sorted mengurutkan menurut kode produk. key=lambda baris: baris[1] memakai harga sebagai dasar urutan, dan reverse=True membuatnya dari besar ke kecil. urut[:3] mengambil tiga elemen pertama.",
      hint: "sorted(harga_baru, key=lambda baris: ..., reverse=True)" },
    { id: "py-03-06", kind: "py", prompt: "Dari <code>teks_harga = [\"63900\", \"\", \"229900\", \"13900\", \"\"]</code>, cetak tiga baris: (1) list angka (int) dari teks yang tidak kosong, memakai <code>filter</code> lalu <code>map</code>; (2) hasil <code>any</code>: apakah ada teks kosong; (3) hasil <code>all</code>: apakah semua angka di baris 1 lebih besar dari 10000. Keluaran: <code>[63900, 229900, 13900]</code>, <code>True</code>, <code>True</code>.",
      start: "teks_harga = [\"63900\", \"\", \"229900\", \"13900\", \"\"]\n",
      solution: "teks_harga = [\"63900\", \"\", \"229900\", \"13900\", \"\"]\nangka = list(map(int, filter(lambda t: t != \"\", teks_harga)))\nprint(angka)\nprint(any([t == \"\" for t in teks_harga]))\nprint(all([h > 10000 for h in angka]))\n",
      why: "filter membuang teks kosong, map(int, ...) mengubah sisanya ke int, dan list(...) membuat hasilnya bisa dicetak. any bernilai True kalau minimal satu elemen benar; all bernilai True kalau semuanya benar.",
      hint: "Bungkus dari dalam ke luar: list(map(int, filter(lambda t: ..., teks_harga)))." },
    { id: "py-03-07", kind: "py", prompt: "Pakai <code>import datetime as dt</code>. Anggap hari ini <code>dt.date(2025, 10, 31)</code>. Cetak tiga baris: (1) awal bulan hari ini, (2) tanggal 7 hari sebelum hari ini, (3) hari ini dalam format teks <code>31/10/2025</code> memakai <code>strftime</code>. Keluaran: <code>2025-10-01</code>, <code>2025-10-24</code>, <code>31/10/2025</code>.",
      start: "import datetime as dt\n\nhari_ini = dt.date(2025, 10, 31)\n",
      solution: "import datetime as dt\n\nhari_ini = dt.date(2025, 10, 31)\nprint(hari_ini.replace(day=1))\nprint(hari_ini - dt.timedelta(days=7))\nprint(hari_ini.strftime(\"%d/%m/%Y\"))\n",
      why: "replace(day=1) setara dengan DATE_TRUNC('month', ...) untuk tanggal. Mengurangi timedelta(days=7) setara dengan - interval '7 days'. strftime(\"%d/%m/%Y\") setara dengan TO_CHAR(..., 'DD/MM/YYYY').",
      hint: "replace(day=1), dt.timedelta(days=7), dan strftime(\"%d/%m/%Y\")." },
    { id: "py-03-08", kind: "py", prompt: "Kolom <code>effective_date_text</code> di <code>raw.supplier_price_upload</code> memakai dua format: <code>DD/MM/YYYY</code> dan <code>YYYY-MM-DD</code>. Buat fungsi <code>baca_tanggal(teks)</code> yang mengembalikan nilai <code>date</code> untuk kedua format. Pemeriksa akan mencetak <code>baca_tanggal('29/09/2025')</code>, <code>baca_tanggal('2025-09-16')</code>, dan <code>type(baca_tanggal('01/09/2025')).__name__</code>, satu per baris. Keluaran: <code>2025-09-29</code>, <code>2025-09-16</code>, <code>date</code>.",
      start: "import datetime as dt\n\ndef baca_tanggal(teks):\n    return dt.date.fromisoformat(teks)\n",
      solution: "import datetime as dt\n\ndef baca_tanggal(teks):\n    if \"/\" in teks:\n        return dt.datetime.strptime(teks, \"%d/%m/%Y\").date()\n    return dt.date.fromisoformat(teks)\n",
      check: "print(baca_tanggal('29/09/2025'))\nprint(baca_tanggal('2025-09-16'))\nprint(type(baca_tanggal('01/09/2025')).__name__)",
      why: "Teks yang mengandung '/' dibaca dengan strptime dan format %d/%m/%Y. strptime menghasilkan datetime, jadi .date() membuang jamnya. Teks ISO dibaca dengan date.fromisoformat.",
      hint: "if \"/\" in teks: pakai strptime(..., \"%d/%m/%Y\").date(); selain itu fromisoformat." },
    { id: "py-03-09", kind: "py", level: "menengah", prompt: "Buat fungsi <code>bersihkan_harga(teks)</code> yang mengembalikan harga sebagai int. Aturannya: (1) buang spasi di awal dan akhir; (2) kalau hasilnya kosong, <code>raise ValueError(\"harga kosong\")</code>; (3) kalau berakhiran <code>,00</code>, buang tiga karakter terakhir; (4) buang <code>Rp</code>, spasi, titik, dan koma; (5) ubah ke int; kalau gagal, <code>raise ValueError</code> dengan pesan <code>harga tidak bisa dibaca: </code> diikuti teks aslinya. Pemeriksa akan mencetak hasil untuk <code>'Rp 63.900'</code>, <code>'Rp141.900,00'</code>, dan <code>'34,900'</code>, lalu pesan error untuk <code>''</code> dan <code>'Rp 12.9OO'</code> (contoh salah ketik buatan). Keluaran: <code>63900</code>, <code>141900</code>, <code>34900</code>, <code>harga kosong</code>, <code>harga tidak bisa dibaca: Rp 12.9OO</code>.",
      start: "def bersihkan_harga(teks):\n    t = teks.strip()\n    # lanjutkan di sini\n    return int(t)\n",
      solution: "def bersihkan_harga(teks):\n    t = teks.strip()\n    if t == \"\":\n        raise ValueError(\"harga kosong\")\n    if t.endswith(\",00\"):\n        t = t[:-3]\n    t = t.replace(\"Rp\", \"\").replace(\" \", \"\").replace(\".\", \"\").replace(\",\", \"\")\n    try:\n        return int(t)\n    except ValueError:\n        raise ValueError(f\"harga tidak bisa dibaca: {teks}\")\n",
      check: "print(bersihkan_harga('Rp 63.900'))\nprint(bersihkan_harga('Rp141.900,00'))\nprint(bersihkan_harga('34,900'))\nfor t in ['', 'Rp 12.9OO']:\n    try:\n        bersihkan_harga(t)\n    except ValueError as err:\n        print(err)",
      why: "',00' harus dibuang sebelum koma dihapus; kalau tidak, '141.900,00' menjadi 14190000. Pesan error yang menyebut teks aslinya memudahkan orang lain mencari baris yang salah.",
      hint: "Urutannya penting: cek kosong, buang ',00', baru replace satu per satu. Bungkus int(t) dengan try/except ValueError." },
    { id: "py-03-10", kind: "py", level: "menengah", setup: UPLOAD + "\n" + FUNGSI_BANTU,
      prompt: "Variabel <code>upload</code> sudah berisi 61 baris <code>raw.supplier_price_upload</code> sebagai list tuple <code>(row_no, sku_text, price_text, effective_date_text, supplier)</code>. Fungsi <code>bersihkan_sku</code>, <code>bersihkan_harga</code>, dan <code>baca_tanggal</code> dari bab ini juga sudah tersedia; <code>bersihkan_harga</code> menghasilkan <code>ValueError</code> untuk harga yang tidak bisa dibaca. Proses setiap baris dengan ketiga fungsi itu. Kumpulkan baris yang gagal (nomor baris dan pesan error), jangan berhenti di baris gagal pertama. Cetak <code>lolos: X, gagal: Y</code>, lalu untuk setiap baris gagal cetak <code>baris N: pesan</code>.",
      start: "bersih, gagal = [], []\nfor baris in upload:\n    no, sku, harga, tanggal, pemasok = baris\n    bersih.append((no, bersihkan_sku(sku), bersihkan_harga(harga), baca_tanggal(tanggal)))\nprint(f\"lolos: {len(bersih)}, gagal: {len(gagal)}\")\n",
      solution: "bersih, gagal = [], []\nfor baris in upload:\n    no, sku, harga, tanggal, pemasok = baris\n    try:\n        bersih.append((no, bersihkan_sku(sku), bersihkan_harga(harga), baca_tanggal(tanggal)))\n    except ValueError as err:\n        gagal.append((no, str(err)))\nprint(f\"lolos: {len(bersih)}, gagal: {len(gagal)}\")\nfor no, pesan in gagal:\n    print(f\"baris {no}: {pesan}\")\n",
      why: "Kode awal berhenti di baris 2 karena harganya kosong. Dengan try/except di dalam for, baris gagal dicatat lalu perulangan lanjut. Hasilnya 60 baris lolos dan 1 baris gagal (baris 2: harga kosong).",
      hint: "Letakkan try di dalam for, bukan di luar. Di except, tambahkan (no, str(err)) ke gagal." },
    { id: "py-03-11", kind: "py", prompt: "Pakai <code>import random</code>. Panggil <code>random.seed(2025)</code>, lalu pilih 5 nomor baris dari 1 sampai 61 dengan <code>random.sample(range(1, 62), 5)</code> dan simpan ke variabel <code>contoh</code>. Cetak <code>contoh</code>, lalu cetak <code>sorted(contoh)</code>. Jangan memanggil fungsi random lain di antaranya.",
      start: "import random\n\ncontoh = random.sample(range(1, 62), 5)\nprint(contoh)\nprint(sorted(contoh))\n",
      solution: "import random\n\nrandom.seed(2025)\ncontoh = random.sample(range(1, 62), 5)\nprint(contoh)\nprint(sorted(contoh))\n",
      why: "Dengan seed yang sama, random.sample memberi pilihan yang sama setiap kali dijalankan di versi Python yang sama. Tanpa seed, pilihannya berubah setiap kali kode dijalankan.",
      hint: "random.seed(2025) harus dipanggil sebelum random.sample." },
    { id: "py-03-12", kind: "number", prompt: "Di <code>raw.supplier_price_upload</code>, tanggal berlaku paling awal adalah 1 September 2025 dan paling akhir 11 Oktober 2025. Berapa hari jaraknya (tanggal akhir dikurangi tanggal awal)? Hitung dengan <code>datetime</code>.",
      answerPy: "import datetime as dt\nprint((dt.date(2025, 10, 11) - dt.date(2025, 9, 1)).days)",
      why: "Tanggal dikurangi tanggal menghasilkan timedelta; .days berisi jumlah harinya: (dt.date(2025, 10, 11) - dt.date(2025, 9, 1)).days = 40.",
      hint: "(tanggal_akhir - tanggal_awal).days" },
    { id: "py-03-13", kind: "choice", level: "wawancara", prompt: "Apa yang tercetak oleh kode ini?<pre>def catat(no_baris, daftar=[]):\n    daftar.append(no_baris)\n    return daftar\n\nprint(catat(2))\nprint(catat(8))</pre>",
      options: ["[2] lalu [8]", "[2] lalu [2, 8]", "[2, 8] lalu [2, 8]", "Error, karena daftar tidak boleh diubah"], answer: 1,
      why: "Nilai bawaan dibuat sekali saat def dijalankan, lalu dipakai bersama oleh semua panggilan. Panggilan kedua menambah 8 ke list yang sama. Perbaikannya: daftar=None, lalu di dalam fungsi if daftar is None: daftar = [].",
      hint: "Kapan list [] di nilai bawaan dibuat: setiap panggilan, atau sekali saja?" },
    { id: "py-03-14", kind: "explain", level: "wawancara", prompt: "Rekan kerjamu memvalidasi data di pipeline produksi dengan <code>assert harga &gt; 0, \"harga harus positif\"</code>. Jelaskan risikonya dan apa yang sebaiknya dipakai.",
      model: "assert ditujukan untuk pemeriksaan saat mengembangkan kode. Kalau Python dijalankan dengan pilihan -O, semua assert dibuang, sehingga harga nol atau negatif lolos tanpa pemberitahuan. Untuk validasi data, tulis if harga <= 0: raise ValueError(f\"harga harus positif: {harga}\"). Cara ini selalu berjalan, jenis error-nya jelas, dan pesannya memuat nilai yang salah. Pemanggil juga bisa menangkap ValueError untuk mengumpulkan baris yang gagal.",
      hint: "Apa yang terjadi pada assert kalau Python dijalankan dengan -O?" },
    { id: "py-03-15", kind: "explain", prompt: "Kenapa saat memvalidasi berkas pemasok lebih baik mengumpulkan semua baris yang gagal daripada menghentikan program di baris gagal pertama? Dan kenapa aturan pembersihan sebaiknya dipecah menjadi fungsi kecil?",
      model: "Kalau program berhenti di baris gagal pertama, kita hanya tahu satu masalah, lalu harus memperbaiki dan menjalankan ulang berkali-kali. Dengan mengumpulkan baris gagal beserta pesannya, satu kali jalan sudah memberi daftar lengkap yang bisa dikirim ke pemasok, sementara baris yang benar tetap diproses. Fungsi kecil yang murni (misalnya bersihkan_harga, baca_tanggal) bisa dicoba sendiri dengan beberapa contoh nilai, mudah dibaca, dan kalau format pemasok berubah cukup satu fungsi yang diperbaiki.",
      hint: "Pikirkan berapa kali program harus dijalankan ulang, dan apa yang perlu diubah kalau formatnya berubah." },
  ],
};
