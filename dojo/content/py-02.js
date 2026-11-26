// Bab 2 Python: alur program (if, for, while, break, continue, pass) dan koleksi (list, tuple, dict, set),
// enumerate, zip, sum/min/max, comprehension, list of dict, dan padanannya di SQL.
// Fakta tentang Python dicek lewat Context7 (/python/cpython: Doc/tutorial/controlflow.rst,
// Doc/tutorial/datastructures.rst, Doc/tutorial/introduction.rst, Doc/builtins/functions.rst, Doc/builtins/stdtypes.rst);
// fakta tentang PostgreSQL lewat Context7 (/websites/postgresql/18).
// Data contoh: enam pesanan pertama app.orders (order_id 100001–100006), ongkos kirim ditulis sebagai bilangan bulat.
export default {
  id: "py-02",
  part: "python",
  title: "Alur program dan koleksi: if, for, list, dict, set",
  minutes: 75,
  goals: [
    "Memilih blok kode yang dijalankan dengan <code>if</code>, <code>elif</code>, dan <code>else</code>, dan menulis indentasi dengan benar.",
    "Mengulang kode dengan <code>for</code> dan <code>while</code>, lalu mengendalikannya dengan <code>break</code> dan <code>continue</code>.",
    "Menyimpan dan mengolah data dengan list, tuple, dict, dan set.",
    "Memakai <code>enumerate()</code>, <code>zip()</code>, <code>sum()</code>, <code>min()</code>, <code>max()</code>, <code>sorted()</code>, dan comprehension.",
    "Mengolah data baris berbentuk list of dict, dan mengenali padanannya dengan WHERE, GROUP BY, DISTINCT, UNION, INTERSECT, dan EXCEPT di SQL.",
  ],
  terms: [
    { term: "list", def: "Koleksi berurutan yang ditulis di antara kurung siku, misalnya <code>[15000, 18000]</code>. Isinya bisa diubah, ditambah, dan boleh kembar." },
    { term: "dict", def: "Koleksi pasangan kunci dan nilai, misalnya <code>{\"web\": 3}</code>. Kunci dalam satu dict selalu unik. Singkatan dari <i>dictionary</i>." },
    { term: "indentasi", def: "Jarak menjorok di awal baris. Python memakainya untuk menentukan baris mana yang termasuk satu blok. Disarankan 4 spasi per tingkat." },
    { term: "perulangan", def: "Blok kode yang dijalankan berulang kali, dengan <code>for</code> atau <code>while</code>. Disebut juga <i>loop</i>." },
    { term: "indeks", def: "Nomor posisi isi sebuah list atau tuple. Dimulai dari 0; indeks negatif dihitung dari belakang." },
    { term: "slicing", def: "Mengambil sebagian list dengan <code>daftar[awal:akhir]</code>. Posisi awal ikut, posisi akhir tidak." },
    { term: "tuple", def: "Koleksi berurutan yang isinya dipisah koma, biasanya di dalam kurung biasa, misalnya <code>(\"web\", 3)</code>. Isinya tidak bisa diubah setelah dibuat." },
    { term: "set", def: "Koleksi tanpa nilai kembar dan tanpa urutan, misalnya <code>{151, 322}</code>. Disebut juga himpunan." },
    { term: "kunci", def: "Bagian pasangan di dict yang dipakai untuk mencari nilainya. Disebut juga <i>key</i>." },
    { term: "comprehension", def: "Cara singkat membuat list atau dict dari sebuah perulangan dalam satu ekspresi, misalnya <code>[x for x in data if x &gt; 0]</code>." },
    { term: "list of dict", def: "List yang setiap isinya sebuah dict. Setiap dict mewakili satu baris data, dengan nama kolom sebagai kunci." },
  ],
  introduces: ["py:if","py:elif","py:else","py:for","py:while","py:break","py:continue","py:range()","py:list()","py:dict()","py:set()","py:tuple()","py:enumerate()","py:zip()","py:sorted()","py:sum()","py:min()","py:max()","py:comprehension","py:pass"],
  sections: [
    {
      title: "Memilih jalan: if, elif, else",
      html: `<p>Sejauh ini setiap baris kode dijalankan berurutan dari atas ke bawah. Pernyataan <code>if</code> membuat sebuah blok kode hanya dijalankan kalau syaratnya bernilai <code>True</code>. <code>elif</code> (singkatan dari <i>else if</i>, artinya "kalau tidak, kalau") memberi syarat berikutnya. <code>else</code> ("kalau tidak") menangkap semua sisanya.</p>
<p>Python memeriksa syarat dari atas ke bawah dan hanya menjalankan blok pertama yang syaratnya benar. Sesudah itu syarat lain tidak diperiksa lagi. <code>elif</code> boleh tidak ada atau ada banyak, dan <code>else</code> boleh tidak ditulis.</p>
<p>Baris <code>if</code>, <code>elif</code>, dan <code>else</code> diakhiri titik dua. Baris di bawahnya ditulis menjorok ke dalam. Jarak menjorok ini disebut <b>indentasi</b>, dan Python memakainya untuk menentukan baris mana yang termasuk satu blok. Semua baris dalam satu blok harus menjorok sama jauh. Panduan gaya resmi Python (PEP 8) menyarankan 4 spasi per tingkat, tanpa tab.</p>`,
      examples: [
        { lang: "py", code: `status = "cancelled"
ongkir = 18000

if status == "completed":
    print("Pesanan selesai")
elif status == "cancelled":
    print("Pesanan dibatalkan")
    print("Ongkir yang dikembalikan:", ongkir)
else:
    print("Pesanan masih berjalan")
print("Pemeriksaan selesai")`,
          note: "Syarat pertama bernilai False, syarat <code>elif</code> bernilai True, jadi dua baris di blok <code>elif</code> dijalankan dan blok <code>else</code> dilewati. Baris terakhir tidak menjorok, sehingga bukan bagian blok mana pun dan selalu dijalankan." },
      ],
    },
    {
      title: "Kesalahan indentasi dan pass",
      html: `<p>Kalau baris sesudah titik dua lupa dijorokkan, atau tab dan spasi dicampur, Python menolak menjalankan kode dan menampilkan <code>IndentationError</code>.</p>
<p>Kadang sebuah blok sengaja dibiarkan kosong, misalnya karena isinya belum ditulis. Python tidak menerima blok kosong, jadi isi dengan <code>pass</code>: pernyataan yang tidak melakukan apa-apa.</p>`,
      examples: [
        { lang: "py", code: `status = "returned"

if status == "returned":
    pass  # penanganan retur belum ditulis
else:
    print("Bukan retur")
print("Selesai")`,
          note: "Blok <code>if</code> dijalankan, tetapi <code>pass</code> tidak melakukan apa-apa. Yang tercetak hanya baris terakhir." },
      ],
    },
    {
      title: "Mengulang dengan for dan range()",
      html: `<p><b>Perulangan</b> (<i>loop</i>) menjalankan sebuah blok berulang kali. <code>for</code> mengambil isi sebuah koleksi satu per satu, sesuai urutannya, lalu menjalankan bloknya sekali untuk setiap isi. Variabel sesudah kata <code>for</code> berisi nilai yang sedang diproses.</p>
<p>Fungsi <code>range()</code> membuat deretan bilangan bulat untuk diulang. <code>range(4)</code> berisi 0, 1, 2, 3. <code>range(1, 4)</code> berisi 1, 2, 3. Angka ketiga adalah langkahnya: <code>range(0, 10, 3)</code> berisi 0, 3, 6, 9. Angka akhir tidak pernah ikut.</p>
<p>Pola yang sering dipakai adalah menjumlahkan di dalam perulangan. Variabel penampung diisi 0 sebelum perulangan, lalu ditambah di setiap putaran. <code>total += fee</code> adalah cara singkat menulis <code>total = total + fee</code>.</p>`,
      examples: [
        { lang: "py", code: `for i in range(1, 4):
    print("Putaran", i)

total = 0
for fee in [15000, 18000, 15000]:
    total += fee
    print("Tambah", fee, "menjadi", total)
print("Total ongkir:", total)`,
          note: "Perulangan pertama berjalan tiga kali dengan <code>i</code> bernilai 1, 2, dan 3; angka 4 tidak ikut. Perulangan kedua mengambil setiap ongkos kirim dan menambahkannya ke <code>total</code>. Baris terakhir tidak menjorok, jadi baru dijalankan sekali sesudah perulangan selesai." },
      ],
    },
    {
      title: "while, break, dan continue",
      html: `<p><code>while</code> mengulang bloknya selama syaratnya bernilai True. Pakai <code>while</code> kalau jumlah putaran belum diketahui di awal, misalnya "coba lagi sampai berhasil, paling banyak tiga kali". Pastikan ada sesuatu di dalam blok yang suatu saat membuat syaratnya False. Kalau tidak, perulangan berjalan tanpa ujung, dan mesin latihan menghentikannya setelah batas waktu.</p>
<p><code>break</code> menghentikan perulangan terdalam saat itu juga. <code>continue</code> melompati sisa blok dan langsung ke putaran berikutnya. Keduanya bisa dipakai di <code>for</code> maupun <code>while</code>.</p>`,
      examples: [
        { lang: "py", code: `percobaan = 1
batas = 3
while percobaan <= batas:
    print(f"Percobaan ke-{percobaan}")
    percobaan += 1

for fee in [15000, 0, 12000, 0, 9000]:
    if fee == 0:
        print("Ketemu pesanan gratis ongkir")
        break
    print("Ongkir", fee)`,
          note: "<code>percobaan += 1</code> membuat syarat <code>while</code> akhirnya False setelah putaran ketiga. Di perulangan kedua, <code>break</code> berjalan pada angka 0 yang pertama, jadi 12000, 0, dan 9000 sesudahnya tidak diproses sama sekali." },
        { lang: "py", code: `statuses = ["completed", "cancelled", "completed", "returned", "completed"]
selesai = 0
for s in statuses:
    if s != "completed":
        continue
    selesai += 1
print("Pesanan selesai:", selesai)`,
          note: "Untuk status selain completed, <code>continue</code> melompati baris <code>selesai += 1</code>. Hasilnya 3." },
      ],
    },
    {
      title: "list: indeks dan slicing",
      html: `<p><b>list</b> adalah koleksi berurutan yang ditulis di antara kurung siku, misalnya <code>["web", "android", "ios"]</code>. Isinya boleh kembar dan boleh berbeda tipe. Setiap isi punya <b>indeks</b> (nomor posisi) yang dimulai dari 0, jadi isi pertama ada di indeks 0. Indeks negatif dihitung dari belakang: <code>-1</code> adalah isi terakhir.</p>
<p><b>Slicing</b> (mengiris) mengambil sebagian list dengan <code>daftar[awal:akhir]</code>. Posisi awal ikut, posisi akhir tidak, sama seperti <code>range()</code>. Kalau awal tidak ditulis, irisan mulai dari 0; kalau akhir tidak ditulis, irisan sampai ujung. Hasil slicing selalu list baru.</p>
<p><code>len()</code> menghitung jumlah isi list, dan <code>in</code> memeriksa apakah sebuah nilai ada di dalamnya.</p>`,
      examples: [
        { lang: "py", code: `ongkir = [15000, 18000, 15000, 12000, 18000, 12000]
print(ongkir[0])
print(ongkir[-1])
print(ongkir[1:3])
print(ongkir[:2])
print(ongkir[-2:])
print(len(ongkir))
print(9000 in ongkir)`,
          note: "<code>ongkir[1:3]</code> mengambil indeks 1 dan 2, tidak termasuk indeks 3. <code>ongkir[-2:]</code> mengambil dua isi terakhir. Ada 6 isi, jadi indeks terbesar adalah 5." },
      ],
    },
    {
      title: "Kesalahan indeks",
      html: `<p>Mengambil indeks yang tidak ada, misalnya <code>ongkir[6]</code> pada list berisi 6 nilai, menghasilkan <code>IndexError</code>. Kesalahan ini sering terjadi karena lupa bahwa indeks dimulai dari 0. Slicing tidak pernah memberi error seperti ini: posisi di luar batas dipotong ke batas list, sehingga <code>ongkir[4:100]</code> hanya berisi dua isi terakhir.</p>`,
      examples: [],
    },
    {
      title: "Mengubah list: append, extend, pop",
      html: `<p>list bisa diubah setelah dibuat. <code>.append(x)</code> menambah satu nilai di ujung. <code>.extend(koleksi)</code> menambah semua isi koleksi lain di ujung. <code>.pop()</code> membuang isi terakhir dan mengembalikannya, sedangkan <code>.pop(0)</code> membuang isi di indeks 0. Nilai di posisi tertentu diganti dengan <code>daftar[i] = nilai_baru</code>.</p>
<p>Fungsi <code>list()</code> membuat list dari koleksi lain, misalnya <code>list(range(3))</code> menghasilkan <code>[0, 1, 2]</code>.</p>
<p>Kesalahan umum: menulis <code>cadangan = kanal</code> lalu mengira sudah punya salinan. Tanda <code>=</code> tidak pernah menyalin list. Kedua nama menunjuk list yang sama, jadi perubahan lewat satu nama terlihat dari nama lain. Untuk membuat salinan, pakai <code>kanal[:]</code> atau <code>kanal.copy()</code>.</p>`,
      examples: [
        { lang: "py", code: `kanal = ["web", "android"]
kanal.append("ios")
kanal.extend(["web", "web"])
print(kanal)
terakhir = kanal.pop()
print(terakhir, kanal)
print(list(range(3)))

cadangan = kanal
salinan = kanal[:]
kanal.append("toko")
print(cadangan)
print(salinan)`,
          note: "<code>cadangan</code> ikut berisi <code>'toko'</code> karena ia list yang sama dengan <code>kanal</code>. <code>salinan</code> dibuat dengan slicing, jadi ia list baru dan tidak berubah." },
      ],
    },
    {
      title: "Mengurutkan: sorted() dan .sort()",
      html: `<p><code>sorted(koleksi)</code> mengembalikan list <b>baru</b> yang sudah urut dan membiarkan aslinya. Metode <code>.sort()</code> mengurutkan list itu sendiri dan mengembalikan <code>None</code>. Keduanya menerima <code>reverse=True</code> untuk mengurutkan dari besar ke kecil. Teks diurutkan huruf demi huruf menurut nomor Unicode-nya (Unicode adalah standar yang memberi setiap huruf sebuah nomor).</p>
<p>Kesalahan umum: menulis <code>urut = ongkir.sort()</code>. Isi <code>urut</code> menjadi <code>None</code>, karena <code>.sort()</code> tidak mengembalikan list. Pakai <code>sorted()</code> kalau butuh list urut yang baru.</p>`,
      examples: [
        { lang: "py", code: `ongkir = [15000, 18000, 0, 12000]
print(sorted(ongkir))
print(sorted(ongkir, reverse=True))
print(ongkir)

hasil = ongkir.sort()
print(hasil)
print(ongkir)`,
          note: "Dua baris pertama tidak mengubah <code>ongkir</code>. Sesudah <code>.sort()</code>, isi <code>ongkir</code> sendiri yang berubah, sedangkan <code>hasil</code> berisi None." },
      ],
    },
    {
      title: "tuple: urutan yang tidak bisa diubah",
      html: `<p><b>tuple</b> mirip list, tetapi isinya tidak bisa diubah setelah dibuat. tuple ditulis sebagai nilai yang dipisah koma, biasanya di dalam kurung biasa, misalnya <code>("web", 3)</code>. Mencoba mengganti isinya menghasilkan <code>TypeError</code>. tuple cocok untuk nilai yang selalu datang bersama, misalnya pasangan (kanal, jumlah pesanan). Fungsi <code>tuple()</code> membuat tuple dari koleksi lain.</p>
<p>Isi tuple bisa dibongkar ke beberapa variabel sekaligus, misalnya <code>kanal, jumlah = ("web", 3)</code>. Cara ini disebut <i>unpacking</i> (membongkar), dan jumlah variabel di kiri harus sama dengan jumlah isi.</p>
<p>Dua tuple dibandingkan isi demi isi dari kiri. Karena itu <code>sorted()</code> pada list berisi tuple mengurutkan menurut isi pertama, lalu menurut isi kedua kalau isi pertamanya sama.</p>`,
      examples: [
        { lang: "py", code: `pasangan = ("web", 3)
kanal, jumlah = pasangan
print(kanal, jumlah)
print(tuple(["ios", 2]))

ringkas = [("web", 3), ("android", 3), ("ios", 2), ("android", 1)]
print(sorted(ringkas))`,
          note: "Kedua tuple <code>android</code> diurutkan menurut angka kedua, karena isi pertamanya sama." },
      ],
    },
    {
      title: "dict: pasangan kunci dan nilai",
      html: `<p><b>dict</b> (<i>dictionary</i>) menyimpan pasangan <b>kunci</b> dan nilai, ditulis <code>{"kunci": nilai}</code>. Kunci dalam satu dict selalu unik; menyimpan ke kunci yang sudah ada menimpa nilai lamanya. Nilai diambil dengan <code>d["kunci"]</code>, dan pasangan baru ditambah dengan <code>d["kunci_baru"] = nilai</code>. Teks, angka, dan tuple boleh menjadi kunci; list dan dict tidak boleh.</p>
<p>Mengambil kunci yang tidak ada dengan kurung siku menghasilkan <code>KeyError</code>. Metode <code>.get(kunci)</code> mengembalikan None kalau kuncinya tidak ada, dan <code>.get(kunci, nilai_bawaan)</code> mengembalikan nilai bawaan yang kamu tentukan. <code>in</code> memeriksa apakah sebuah kunci ada.</p>
<p><code>.keys()</code>, <code>.values()</code>, dan <code>.items()</code> memberi kunci, nilai, dan pasangan (kunci, nilai) untuk diulang. Sejak Python 3.7, dict dijamin menyimpan urutan saat kunci dimasukkan. Mengganti nilai kunci yang sudah ada tidak mengubah urutannya. Fungsi <code>dict()</code> juga bisa membuat dict, misalnya dari list berisi pasangan tuple.</p>`,
      examples: [
        { lang: "py", code: `p = {"order_id": 100005, "status": "cancelled", "channel": "android"}
print(p["status"])
p["status"] = "returned"
p["shipping_fee"] = 18000
print(p)
print(p.get("voucher_code"))
print(p.get("voucher_code", "tanpa voucher"))
print("channel" in p)

for kunci, nilai in p.items():
    print(kunci, "=", nilai)
print(list(p.keys()))
print(dict([("web", 3), ("ios", 2)]))`,
          note: "Mengganti <code>status</code> tidak memindahkan posisinya; <code>shipping_fee</code> masuk paling akhir karena paling akhir ditambahkan. Kunci <code>voucher_code</code> tidak ada, jadi <code>.get()</code> memberi None atau nilai bawaan, bukan error." },
      ],
    },
    {
      title: "Menghitung frekuensi dengan dict",
      html: `<p>Pola dict yang paling sering dipakai adalah dict penghitung: kuncinya kelompok, nilainya jumlah. Untuk setiap data, ambil hitungan lama dengan <code>.get(kunci, 0)</code>, tambah 1, lalu simpan lagi. Nilai bawaan 0 membuat kelompok yang baru pertama kali muncul tidak menimbulkan KeyError.</p>
<p>Hasilnya sama dengan <code>SELECT channel, count(*) FROM app.orders GROUP BY channel</code>. Bedanya, dict menyimpan urutan kemunculan pertama setiap kunci, sedangkan PostgreSQL tidak menjamin urutan baris tanpa ORDER BY. Dengan cara yang sama, dict penjumlah (nilai ditambah ongkos kirim, bukan 1) setara dengan <code>sum(shipping_fee)</code> per kelompok.</p>`,
      examples: [
        { lang: "py", code: `kanal = ["web", "web", "android", "ios", "android", "android"]
hitung = {}
for k in kanal:
    hitung[k] = hitung.get(k, 0) + 1
print(hitung)

for k, n in sorted(hitung.items()):
    print(k, n)`,
          note: "Ini kanal enam pesanan pertama TokoKita. <code>sorted(hitung.items())</code> mengurutkan pasangan tuple menurut nama kanal, mirip <code>ORDER BY channel</code>." },
      ],
    },
    {
      title: "set: nilai unik dan operasi himpunan",
      html: `<p><b>set</b> (himpunan) adalah koleksi tanpa nilai kembar dan tanpa urutan. Set dibuat dengan kurung kurawal, misalnya <code>{151, 322}</code>, atau dengan <code>set(koleksi)</code> yang sekaligus membuang nilai kembar. <code>{}</code> yang kosong membuat dict, bukan set; set kosong ditulis <code>set()</code>. Metode <code>.add(x)</code> menambah satu nilai.</p>
<p>Karena set tidak berurutan, mencetak set atau mengulangnya bisa menampilkan isi dalam urutan yang tidak kamu duga. Kalau urutan penting, ubah dulu dengan <code>sorted()</code>.</p>
<p>Operasi himpunan di set punya padanan langsung di SQL. <code>a | b</code> (gabungan) berisi nilai yang ada di salah satu atau keduanya, seperti UNION. <code>a &amp; b</code> (irisan) berisi nilai yang ada di keduanya, seperti INTERSECT. <code>a - b</code> (selisih) berisi nilai di <code>a</code> yang tidak ada di <code>b</code>, seperti EXCEPT. Ketiga perintah SQL itu juga membuang baris kembar kalau tidak ditulis ALL, sama dengan set.</p>`,
      examples: [
        { lang: "py", code: `beli_oktober = [151, 322, 633, 151, 369]
beli_november = [322, 211, 633, 124]
a = set(beli_oktober)
b = set(beli_november)
print(len(beli_oktober), len(a))
print(sorted(a | b))
print(sorted(a & b))
print(sorted(a - b))`,
          note: "Data ini contoh buatan: nomor pelanggan yang membeli di dua bulan. Pelanggan 151 muncul dua kali di list, tetapi sekali di set, jadi isi set 4 bukan 5. Pelanggan 322 dan 633 membeli di kedua bulan." },
      ],
    },
    {
      title: "enumerate() dan zip()",
      html: `<p><code>enumerate(koleksi)</code> memberi pasangan (nomor urut, isi) di setiap putaran. Nomornya mulai dari 0, atau dari angka lain dengan <code>start=</code>. <code>zip(a, b)</code> memasangkan isi beberapa koleksi berdasarkan posisinya: isi pertama dengan isi pertama, isi kedua dengan isi kedua, dan seterusnya. <code>zip()</code> berhenti di koleksi yang paling pendek, dan sisa koleksi yang lebih panjang diabaikan tanpa pesan.</p>`,
      examples: [
        { lang: "py", code: `produk = ["Earphone Bluetooth Satria Biru", "Earbuds TWS Cendana", "Headset Kabel Kirana"]
harga = [450900, 243900, 105900]
for no, nama in enumerate(produk, start=1):
    print(no, nama)
for nama, h in zip(produk, harga):
    print(nama, "->", h)
print(list(zip(["a", "b", "c"], [1, 2])))`,
          note: "Nama dan harga ini tiga produk pertama di <code>app.products</code>. Baris terakhir menunjukkan zip berhenti di koleksi terpendek: <code>'c'</code> tidak punya pasangan sehingga hilang." },
      ],
    },
    {
      title: "sum(), min(), max()",
      html: `<p><code>sum()</code> menjumlahkan semua angka di sebuah koleksi. <code>min()</code> dan <code>max()</code> mengambil nilai terkecil dan terbesar. Ketiganya padanan SUM, MIN, dan MAX di SQL. Perilakunya berbeda pada koleksi kosong: <code>sum([])</code> menghasilkan 0, sedangkan <code>min([])</code> dan <code>max([])</code> menghasilkan <code>ValueError</code>. Untuk menghindarinya, beri <code>default=</code>, nilai yang dikembalikan kalau koleksinya kosong.</p>`,
      examples: [
        { lang: "py", code: `ongkir = [15000, 18000, 15000, 12000, 18000, 12000]
print(sum(ongkir), min(ongkir), max(ongkir))
print(sum([]))
print(max([], default=0))`,
          note: "Jumlah enam ongkos kirim adalah 90000, terkecil 12000, terbesar 18000." },
      ],
    },
    {
      title: "Comprehension",
      html: `<p><b>Comprehension</b> adalah cara singkat membuat list atau dict dari perulangan, dalam satu ekspresi. <code>[ekspresi for x in koleksi if syarat]</code>, dengan ekspresi berarti potongan kode yang menghasilkan nilai, artinya: untuk setiap <code>x</code> yang memenuhi syarat, hitung ekspresinya dan kumpulkan ke list baru. Bagian <code>if</code> boleh tidak ditulis. Bentuk dict-nya <code>{kunci: nilai for x in koleksi}</code>.</p>
<p>Comprehension tidak bisa melakukan apa pun yang tidak bisa dilakukan <code>for</code> dengan <code>.append()</code>; tulisannya saja yang lebih pendek. Urutan <code>for</code> dan <code>if</code> di dalamnya sama dengan urutan kalau ditulis sebagai blok biasa.</p>`,
      examples: [
        { lang: "py", code: `ongkir = [15000, 18000, 0, 12000, 0]
berbayar = [f for f in ongkir if f > 0]
print(berbayar)

ribuan = []
for f in ongkir:
    if f > 0:
        ribuan.append(f // 1000)
print(ribuan)
print([f // 1000 for f in ongkir if f > 0])

kode = {k: len(k) for k in ["web", "android", "ios"]}
print(kode)`,
          note: "Blok <code>for</code> di tengah dan comprehension di bawahnya menghasilkan list yang sama. <code>//</code> adalah pembagian yang membuang bagian pecahan (pembulatan ke bawah), jadi 15000 // 1000 menjadi 15." },
      ],
    },
    {
      title: "Data baris: list of dict dan padanannya di SQL",
      html: `<p>Data berbentuk tabel sering dibawa di Python sebagai <b>list of dict</b>: satu list yang setiap isinya sebuah dict, satu dict untuk satu baris, dengan nama kolom sebagai kunci. Bentuk ini juga yang kamu dapat saat membaca data JSON, format teks yang umum dipakai API (layanan yang memberi data kepada program lain lewat internet) untuk mengirim data. Menurut dokumentasi Python, objek JSON dibaca menjadi dict dan array JSON menjadi list.</p>
<p>Perintah SQL yang sudah kamu kenal punya padanan langsung:</p>
<ul><li><code>WHERE status = 'completed'</code> sama dengan <code>if p["status"] == "completed"</code> di dalam <code>for</code>.</li>
<li><code>SELECT order_id</code> sama dengan <code>[p["order_id"] for p in pesanan]</code>.</li>
<li><code>GROUP BY channel</code> dengan <code>count(*)</code> atau <code>sum()</code> sama dengan dict penghitung atau dict penjumlah.</li>
<li><code>DISTINCT</code> sama dengan <code>set()</code>, dan <code>ORDER BY</code> sama dengan <code>sorted()</code>.</li></ul>`,
      examples: [
        { lang: "py", code: `pesanan = [
    {"order_id": 100001, "customer_id": 151, "status": "completed", "channel": "web", "shipping_fee": 15000},
    {"order_id": 100002, "customer_id": 322, "status": "completed", "channel": "web", "shipping_fee": 18000},
    {"order_id": 100003, "customer_id": 633, "status": "completed", "channel": "android", "shipping_fee": 15000},
    {"order_id": 100004, "customer_id": 1291, "status": "completed", "channel": "ios", "shipping_fee": 12000},
    {"order_id": 100005, "customer_id": 369, "status": "cancelled", "channel": "android", "shipping_fee": 18000},
    {"order_id": 100006, "customer_id": 211, "status": "completed", "channel": "android", "shipping_fee": 12000},
]

ongkir_per_kanal = {}
for p in pesanan:
    if p["status"] != "completed":
        continue
    k = p["channel"]
    ongkir_per_kanal[k] = ongkir_per_kanal.get(k, 0) + p["shipping_fee"]

for k, total in sorted(ongkir_per_kanal.items()):
    print(k, total)`,
          note: "Isinya enam pesanan pertama <code>app.orders</code>. Kodenya setara dengan <code>select channel, sum(shipping_fee) from app.orders where status = 'completed' group by channel order by channel</code> untuk enam baris itu. Pesanan 100005 dibatalkan, jadi ongkir android hanya 15000 + 12000 = 27000." },
      ],
    },
  ],
  tsql: [],
  summary: [
    "<code>if</code>/<code>elif</code>/<code>else</code> menjalankan blok pertama yang syaratnya True. Blok ditandai titik dua dan indentasi 4 spasi; salah indentasi memberi IndentationError. <code>pass</code> mengisi blok kosong.",
    "<code>for</code> mengulang isi koleksi sesuai urutannya; <code>range(awal, akhir, langkah)</code> tidak menyertakan angka akhir. <code>while</code> mengulang selama syaratnya True, jadi pastikan syaratnya bisa menjadi False.",
    "<code>break</code> keluar dari perulangan terdalam, <code>continue</code> lompat ke putaran berikutnya.",
    "list berurutan dan bisa diubah: indeks mulai 0, <code>-1</code> isi terakhir, slicing <code>[awal:akhir]</code> tanpa posisi akhir. <code>=</code> tidak menyalin list; pakai <code>[:]</code> atau <code>.copy()</code>.",
    "<code>sorted()</code> membuat list urut baru; <code>.sort()</code> mengubah list itu sendiri dan mengembalikan None.",
    "tuple tidak bisa diubah dan bisa dibongkar ke beberapa variabel. dict menyimpan kunci unik dengan urutan masuk; <code>.get(kunci, bawaan)</code> menghindari KeyError.",
    "set membuang nilai kembar dan tidak berurutan. <code>|</code>, <code>&amp;</code>, <code>-</code> setara UNION, INTERSECT, EXCEPT.",
    "<code>enumerate()</code> memberi nomor urut, <code>zip()</code> memasangkan koleksi dan berhenti di yang terpendek. <code>min()</code>/<code>max()</code> pada koleksi kosong error kecuali diberi <code>default=</code>.",
    "Data baris dibawa sebagai list of dict. WHERE setara if di dalam for, GROUP BY setara dict penghitung, DISTINCT setara set.",
  ],
  drills: [
    { id: "py-02-01", kind: "choice", prompt: "Apa yang dicetak <code>print(list(range(2, 6)))</code>?",
      options: ["[2, 3, 4, 5]", "[2, 3, 4, 5, 6]", "[3, 4, 5, 6]", "[0, 1, 2, 3, 4, 5]"], answer: 0,
      why: "<code>range(2, 6)</code> mulai dari 2 dan berhenti sebelum 6. Angka akhir tidak pernah ikut.",
      hint: "Ingat aturan angka akhir di range(), sama dengan aturan posisi akhir di slicing." },
    { id: "py-02-02", kind: "py", prompt: "Untuk setiap nilai di <code>ongkir</code>, cetak satu baris berisi nilai itu, satu spasi, lalu labelnya: <code>gratis</code> kalau nilainya 0, <code>murah</code> kalau di bawah 12000, dan <code>biasa</code> untuk sisanya. Urutan baris sama dengan urutan list. Baris pertama harus <code>15000 biasa</code>.",
      start: `ongkir = [15000, 0, 9000, 12000, 18000]
for fee in ongkir:
    # tulis if, elif, else di sini
    pass`,
      solution: `ongkir = [15000, 0, 9000, 12000, 18000]
for fee in ongkir:
    if fee == 0:
        print(fee, "gratis")
    elif fee < 12000:
        print(fee, "murah")
    else:
        print(fee, "biasa")`,
      why: "Syarat diperiksa dari atas. 0 juga di bawah 12000, jadi syarat <code>fee == 0</code> harus ditulis lebih dulu; kalau urutannya dibalik, 0 diberi label murah. 12000 tidak di bawah 12000, jadi masuk <code>else</code>.",
      hint: "<code>print(fee, \"gratis\")</code> sudah memberi spasi di antara kedua nilai. Perhatikan urutan syarat untuk nilai 0." },
    { id: "py-02-03", kind: "py", prompt: "Cetak satu angka: jumlah <code>shipping_fee</code> dari pesanan yang <code>status</code>-nya <code>completed</code>. Ini padanan <code>select sum(shipping_fee) from ... where status = 'completed'</code>.",
      start: `pesanan = [
    {"order_id": 100001, "status": "completed", "shipping_fee": 15000},
    {"order_id": 100002, "status": "completed", "shipping_fee": 18000},
    {"order_id": 100005, "status": "cancelled", "shipping_fee": 18000},
    {"order_id": 100006, "status": "completed", "shipping_fee": 12000},
    {"order_id": 100009, "status": "completed", "shipping_fee": 0},
]
total = 0
`,
      solution: `pesanan = [
    {"order_id": 100001, "status": "completed", "shipping_fee": 15000},
    {"order_id": 100002, "status": "completed", "shipping_fee": 18000},
    {"order_id": 100005, "status": "cancelled", "shipping_fee": 18000},
    {"order_id": 100006, "status": "completed", "shipping_fee": 12000},
    {"order_id": 100009, "status": "completed", "shipping_fee": 0},
]
total = 0
for p in pesanan:
    if p["status"] == "completed":
        total += p["shipping_fee"]
print(total)`,
      why: "<code>if</code> di dalam <code>for</code> berperan seperti WHERE: hanya baris yang lolos syarat yang ditambahkan. Hasilnya 15000 + 18000 + 12000 + 0 = 45000.",
      hint: "Ulang setiap dict di <code>pesanan</code>, periksa <code>p[\"status\"]</code>, lalu tambahkan <code>p[\"shipping_fee\"]</code> ke <code>total</code>." },
    { id: "py-02-04", kind: "py", prompt: "Pakai <code>while</code> dan <code>break</code> untuk mencari indeks pertama di <code>ongkir</code> yang nilainya 0. Cetak satu baris: <code>Indeks pertama: </code> diikuti indeksnya.",
      start: `ongkir = [15000, 18000, 0, 12000, 0]
i = 0
while i < len(ongkir):
    i += 1
`,
      solution: `ongkir = [15000, 18000, 0, 12000, 0]
i = 0
while i < len(ongkir):
    if ongkir[i] == 0:
        break
    i += 1
print("Indeks pertama:", i)`,
      why: "Syarat <code>i &lt; len(ongkir)</code> menjamin perulangan berhenti walau tidak ada angka 0. <code>break</code> berhenti di indeks 2, sebelum <code>i += 1</code> dijalankan, jadi nilai <code>i</code> tetap 2. Indeks dimulai dari 0, sehingga angka 0 pertama (isi ketiga) ada di indeks 2.",
      hint: "Periksa <code>ongkir[i]</code> sebelum menambah <code>i</code>. Cetak sesudah perulangan." },
    { id: "py-02-05", kind: "py", prompt: "Dari list <code>kota</code>, cetak tiga baris: (1) list dua kota pertama, (2) kota terakhir sebagai teks, (3) list kota di indeks 2 sampai 4 (Depok, Tangerang, Bekasi). Baris pertama harus <code>['Jakarta', 'Bogor']</code>.",
      start: `kota = ["Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi", "Bandung"]
`,
      solution: `kota = ["Jakarta", "Bogor", "Depok", "Tangerang", "Bekasi", "Bandung"]
print(kota[:2])
print(kota[-1])
print(kota[2:5])`,
      why: "<code>kota[:2]</code> mengambil indeks 0 dan 1. <code>kota[-1]</code> adalah isi terakhir dan hasilnya teks, bukan list. Supaya indeks 4 ikut, posisi akhir irisan harus 5.",
      hint: "Posisi akhir slicing tidak ikut, jadi tulis satu angka lebih besar dari indeks terakhir yang kamu mau." },
    { id: "py-02-06", kind: "choice", prompt: "Apa yang dicetak kode ini?<pre>ongkir = [18000, 12000, 15000]\nurut = ongkir.sort()\nprint(urut)</pre>",
      options: ["[12000, 15000, 18000]", "[18000, 12000, 15000]", "None", "Error, karena list tidak punya metode sort"], answer: 2,
      why: "<code>.sort()</code> mengurutkan list <code>ongkir</code> itu sendiri dan mengembalikan None. Isi <code>ongkir</code> menjadi urut, tetapi <code>urut</code> berisi None. Pakai <code>urut = sorted(ongkir)</code> untuk mendapat list urut yang baru.",
      hint: "Apa yang dikembalikan metode yang mengubah list di tempat?" },
    { id: "py-02-07", kind: "py", prompt: "Kode ini berhenti dengan <code>KeyError</code>. Perbaiki sehingga mencetak jumlah pesanan per kanal, satu baris per kanal dengan format <code>kanal jumlah</code> (misalnya <code>web 3</code>), urut menurut kemunculan pertama kanal di list.",
      start: `kanal = ["web", "web", "android", "ios", "android", "android", "web", "ios"]
hitung = {}
for k in kanal:
    hitung[k] += 1
for k, n in hitung.items():
    print(k, n)`,
      solution: `kanal = ["web", "web", "android", "ios", "android", "android", "web", "ios"]
hitung = {}
for k in kanal:
    hitung[k] = hitung.get(k, 0) + 1
for k, n in hitung.items():
    print(k, n)`,
      why: "<code>hitung[k] += 1</code> perlu membaca <code>hitung[k]</code> lebih dulu, padahal kunci itu belum ada saat kanal pertama kali muncul. <code>hitung.get(k, 0)</code> memberi 0 untuk kunci baru. dict menyimpan urutan masuk, jadi hasilnya web 3, android 3, ios 2.",
      hint: "Cari cara membaca nilai dict yang memberi angka bawaan kalau kuncinya belum ada." },
    { id: "py-02-08", kind: "py", prompt: "<code>bulan_1</code> dan <code>bulan_2</code> berisi nomor pelanggan yang berbelanja di dua bulan. Cetak tiga baris, masing-masing berupa list yang diurutkan dari kecil ke besar: (1) pelanggan yang berbelanja di salah satu atau kedua bulan, (2) pelanggan yang berbelanja di kedua bulan, (3) pelanggan yang hanya berbelanja di <code>bulan_1</code>.",
      start: `bulan_1 = [151, 322, 633, 151, 1291]
bulan_2 = [322, 369, 633, 211, 369]
`,
      solution: `bulan_1 = [151, 322, 633, 151, 1291]
bulan_2 = [322, 369, 633, 211, 369]
a = set(bulan_1)
b = set(bulan_2)
print(sorted(a | b))
print(sorted(a & b))
print(sorted(a - b))`,
      why: "<code>|</code>, <code>&amp;</code>, dan <code>-</code> adalah padanan UNION, INTERSECT, dan EXCEPT. <code>set()</code> membuang nilai kembar seperti 151 dan 369. Set tidak berurutan, jadi <code>sorted()</code> diperlukan supaya hasilnya selalu sama.",
      hint: "Ubah kedua list menjadi set dulu, lalu bungkus setiap hasil operasi dengan sorted()." },
    { id: "py-02-09", kind: "py", prompt: "Cetak satu baris per produk dengan format <code>nomor. nama: harga</code>, nomor mulai dari 1, urut sesuai list. Baris pertama harus <code>1. Earphone Bluetooth Satria Biru: 450900</code>. Pakai <code>enumerate()</code> dan <code>zip()</code>.",
      start: `produk = ["Earphone Bluetooth Satria Biru", "Earbuds TWS Cendana", "Headset Kabel Kirana"]
harga = [450900, 243900, 105900]
`,
      solution: `produk = ["Earphone Bluetooth Satria Biru", "Earbuds TWS Cendana", "Headset Kabel Kirana"]
harga = [450900, 243900, 105900]
for no, (nama, h) in enumerate(zip(produk, harga), start=1):
    print(f"{no}. {nama}: {h}")`,
      why: "<code>zip()</code> memasangkan nama dan harga menjadi tuple, lalu <code>enumerate(..., start=1)</code> menambahkan nomor urut mulai 1. Tuple pasangan dibongkar dengan <code>(nama, h)</code>. f-string membuat format titik dan titik dua tanpa spasi tambahan.",
      hint: "Isi enumerate di setiap putaran adalah (nomor, pasangan); pasangan itu sendiri tuple (nama, harga)." },
    { id: "py-02-10", kind: "py", prompt: "Dari <code>pesanan</code>, buat dua hasil dengan comprehension lalu cetak masing-masing di satu baris: (1) list <code>order_id</code> pesanan yang statusnya bukan <code>completed</code>, urut sesuai list; (2) dict dengan <code>order_id</code> sebagai kunci dan <code>shipping_fee</code> sebagai nilai, untuk pesanan <code>completed</code> saja, urut sesuai list.",
      start: `pesanan = [
    {"order_id": 100001, "status": "completed", "shipping_fee": 15000},
    {"order_id": 100005, "status": "cancelled", "shipping_fee": 18000},
    {"order_id": 100006, "status": "completed", "shipping_fee": 12000},
    {"order_id": 100049, "status": "returned", "shipping_fee": 12000},
]
`,
      solution: `pesanan = [
    {"order_id": 100001, "status": "completed", "shipping_fee": 15000},
    {"order_id": 100005, "status": "cancelled", "shipping_fee": 18000},
    {"order_id": 100006, "status": "completed", "shipping_fee": 12000},
    {"order_id": 100049, "status": "returned", "shipping_fee": 12000},
]
print([p["order_id"] for p in pesanan if p["status"] != "completed"])
print({p["order_id"]: p["shipping_fee"] for p in pesanan if p["status"] == "completed"})`,
      why: "Bagian <code>if</code> di comprehension menyaring baris seperti WHERE, dan ekspresi di depan <code>for</code> memilih nilai seperti SELECT. Dict comprehension memakai bentuk <code>kunci: nilai</code>.",
      hint: "Bentuknya <code>[ekspresi for p in pesanan if syarat]</code> dan <code>{kunci: nilai for p in pesanan if syarat}</code>." },
    { id: "py-02-11", kind: "py", prompt: "Cetak tiga baris: (1) jumlah semua <code>shipping_fee</code>, (2) nilai terkecil, (3) nilai terbesar, dari list <code>pesanan</code>. Pakai comprehension untuk mengambil kolom <code>shipping_fee</code>, lalu <code>sum()</code>, <code>min()</code>, dan <code>max()</code>.",
      start: `pesanan = [
    {"order_id": 100007, "shipping_fee": 12000},
    {"order_id": 100008, "shipping_fee": 12000},
    {"order_id": 100009, "shipping_fee": 0},
    {"order_id": 100010, "shipping_fee": 9000},
]
`,
      solution: `pesanan = [
    {"order_id": 100007, "shipping_fee": 12000},
    {"order_id": 100008, "shipping_fee": 12000},
    {"order_id": 100009, "shipping_fee": 0},
    {"order_id": 100010, "shipping_fee": 9000},
]
fees = [p["shipping_fee"] for p in pesanan]
print(sum(fees))
print(min(fees))
print(max(fees))`,
      why: "Comprehension mengambil satu kolom dari list of dict menjadi list angka, seperti <code>select shipping_fee</code>. Hasilnya 33000, 0, dan 12000. Data ini pesanan 100007–100010 di <code>app.orders</code>.",
      hint: "Ambil dulu list angkanya: <code>[p[\"shipping_fee\"] for p in pesanan]</code>." },
    { id: "py-02-12", kind: "number", prompt: "Daftar nomor pelanggan dari sebuah laporan: <code>[151, 322, 633, 151, 1291, 369, 322, 151, 211]</code>. Berapa pelanggan unik di daftar itu? Hitung dengan Python, lalu ketik angkanya.",
      answerPy: `print(len(set([151, 322, 633, 151, 1291, 369, 322, 151, 211])))`,
      why: "<code>set()</code> membuang nilai kembar (151 muncul tiga kali, 322 dua kali), lalu <code>len()</code> menghitung isinya: 151, 322, 633, 1291, 369, 211, yaitu 6. Ini padanan <code>count(distinct customer_id)</code>.",
      hint: "Buang dulu nilai kembarnya, lalu hitung isinya." },
    { id: "py-02-13", kind: "choice", prompt: "Kamu menjalankan <code>print({\"web\", \"ios\", \"android\"})</code>. Pernyataan mana yang benar?",
      options: ["Selalu tercetak dalam urutan web, ios, android", "Selalu tercetak urut abjad", "Ketiga nilai tercetak, tetapi urutannya tidak dijamin", "Error, karena set harus dibuat dengan set()"], answer: 2,
      why: "set tidak berurutan, jadi urutan saat dicetak atau diulang bisa berbeda dari urutan penulisan. Kurung kurawal berisi nilai membuat set; hanya <code>{}</code> yang kosong yang membuat dict. Pakai <code>sorted()</code> kalau urutannya penting.",
      hint: "Beda list dan set bukan hanya soal nilai kembar." },
    { id: "py-02-14", kind: "explain", prompt: "Jelaskan dengan kalimatmu sendiri kenapa pola <code>hitung[k] = hitung.get(k, 0) + 1</code> di dalam <code>for</code> setara dengan <code>GROUP BY k</code> dan <code>count(*)</code> di SQL. Sebutkan juga satu perbedaan urutan hasil di antara keduanya.",
      model: "Setiap putaran membaca satu baris. Kolom k dipakai sebagai kunci dict, dan karena kunci dict selalu unik, semua baris dengan nilai k yang sama masuk ke kunci yang sama, sama seperti GROUP BY mengumpulkan baris yang nilainya sama. Setiap baris menambah 1 ke kuncinya, jadi nilai akhirnya adalah jumlah baris per kelompok, seperti count(*). get(k, 0) memberi 0 untuk kelompok yang baru pertama kali muncul. Perbedaannya: dict menyimpan urutan kemunculan pertama setiap kunci, sedangkan PostgreSQL tidak menjamin urutan baris hasil GROUP BY tanpa ORDER BY. Di kedua tempat, urutan yang pasti harus diminta sendiri, dengan sorted() di Python atau ORDER BY di SQL.",
      hint: "Pikirkan apa yang terjadi pada dua baris dengan nilai k yang sama, dan apa yang dijamin dict soal urutan." },
    { id: "py-02-15", kind: "py", level: "wawancara",
      prompt: "Pertanyaan wawancara: \"Hapus nilai kembar dari sebuah list, tetapi pertahankan urutan kemunculan pertamanya.\" Cetak satu baris: list hasilnya. Untuk <code>kunjungan</code> di bawah, hasilnya diawali <code>[151, 322, ...</code>.",
      start: `kunjungan = [151, 322, 151, 633, 322, 1291, 151, 369]
`,
      solution: `kunjungan = [151, 322, 151, 633, 322, 1291, 151, 369]
sudah = set()
hasil = []
for c in kunjungan:
    if c in sudah:
        continue
    sudah.add(c)
    hasil.append(c)
print(hasil)`,
      why: "<code>set(kunjungan)</code> saja membuang nilai kembar, tetapi set tidak berurutan sehingga urutan aslinya tidak terjamin. Solusinya: set <code>sudah</code> mencatat nilai yang pernah dilihat, dan list <code>hasil</code> menyimpan urutan. Memeriksa <code>in</code> di set cepat, jadi cara ini cukup satu kali lewat data. Cara lain yang juga benar: <code>list(dict.fromkeys(kunjungan))</code>, karena dict menyimpan urutan masuk dan kuncinya unik.",
      hint: "Pakai dua wadah: satu untuk mengingat nilai yang sudah pernah muncul, satu untuk hasil berurutan." },
    { id: "py-02-16", kind: "py", level: "wawancara",
      prompt: "Pertanyaan wawancara (<i>two-sum</i>): \"Di list <code>harga</code> ada tepat satu pasangan barang yang jumlah harganya sama dengan <code>anggaran</code>. Cari indeks kedua barang itu.\" Cetak satu baris: indeks yang lebih kecil, satu spasi, lalu indeks yang lebih besar.",
      start: `harga = [105900, 243900, 450900, 183900, 99000]
anggaran = 427800
`,
      solution: `harga = [105900, 243900, 450900, 183900, 99000]
anggaran = 427800
posisi = {}
for i, h in enumerate(harga):
    pasangan = anggaran - h
    if pasangan in posisi:
        print(posisi[pasangan], i)
        break
    posisi[h] = i`,
      why: "Cara langsung memakai dua <code>for</code> bersarang dan memeriksa setiap pasangan, sehingga jumlah pemeriksaannya tumbuh sebanding kuadrat panjang list. Cara dengan dict cukup satu kali lewat: untuk setiap harga, hitung pasangan yang dibutuhkan (<code>anggaran - h</code>), lalu periksa apakah pasangan itu sudah pernah dilihat. dict <code>posisi</code> menyimpan harga sebagai kunci dan indeksnya sebagai nilai. Di sini 243900 + 183900 = 427800, jadi hasilnya <code>1 3</code>.",
      hint: "Saat berada di harga h, harga pasangan yang kamu cari adalah anggaran - h. Simpan harga yang sudah dilewati di dict beserta indeksnya." },
  ],
};
