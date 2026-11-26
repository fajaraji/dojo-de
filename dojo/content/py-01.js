// Bab 1 Python: nilai, variabel, tipe, operator, teks, dan konversi tipe.
// Fakta tentang Python dicek lewat Context7: /python/cpython (dokumentasi resmi Python 3), /python/peps (PEP 8),
// /websites/pyodide_en_stable (Pyodide), /websites/postgresql (ROUND di PostgreSQL), /microsoftdocs/fabric-docs (notebook Fabric).
export default {
  id: "py-01",
  part: "python",
  title: "Python dasar: nilai, variabel, tipe, operator",
  minutes: 60,
  goals: [
    "Menjelaskan kapan data engineer memakai Python di samping SQL.",
    "Menjalankan Python di Dojo, dan tahu cara memasangnya di laptop Windows.",
    "Mencetak hasil dengan <code>print()</code> dan memeriksa tipe nilai dengan <code>type()</code>.",
    "Menyimpan nilai di variabel dengan nama yang mengikuti PEP 8.",
    "Menghitung dengan operator aritmetika, lalu membulatkan dengan <code>round()</code> dan tahu bedanya dengan ROUND di PostgreSQL.",
    "Membandingkan nilai, menggabung syarat dengan <code>and</code>/<code>or</code>/<code>not</code>, dan memeriksa None dengan <code>is</code>.",
    "Merapikan teks dengan f-string dan metode teks, lalu mengubah teks menjadi angka.",
  ],
  terms: [
    { term: "variabel", def: "Nama yang menunjuk ke sebuah nilai, misalnya <code>ongkir = 15000</code>. Nilainya bisa diganti kapan saja dengan tanda <code>=</code>." },
    { term: "tipe data python", def: "Jenis sebuah nilai di Python, yang menentukan operasi apa yang bisa dilakukan. Tipe dasarnya int (bilangan bulat), float (angka desimal), str (teks), bool (True/False), dan NoneType (hanya berisi None)." },
    { term: "fungsi bawaan", def: "Fungsi yang sudah tersedia di Python tanpa perlu dibuat atau dipasang, misalnya <code>print()</code>, <code>type()</code>, dan <code>len()</code>." },
    { term: "pyodide", def: "Python resmi (CPython) yang dipindahkan ke WebAssembly, sehingga bisa berjalan di browser. Dojo memakainya untuk menjalankan kode Python-mu." },
    { term: "metode", def: "Fungsi yang menempel pada sebuah nilai dan dipanggil dengan titik, misalnya <code>sku.upper()</code>." },
    { term: "f-string", def: "Teks yang diawali huruf <code>f</code>, misalnya <code>f\"Ongkir {ongkir}\"</code>. Isi kurung kurawal dihitung lalu dimasukkan ke teks." },
    { term: "pembulatan ke genap", def: "Aturan <code>round()</code> di Python: kalau nilai tepat di tengah dua kandidat, dipilih kandidat yang genap. <code>round(2.5)</code> menjadi 2. Disebut juga <i>banker's rounding</i>." },
  ],
  introduces: ["py:print()","py:type()","py:int()","py:float()","py:str()","py:bool()","py:round()","py:abs()","py:len()","py:True","py:False","py:None","py:and","py:or","py:not","py:in","py:is","py:f-string"],
  sections: [
    {
      title: "Kenapa data engineer butuh Python",
      html: `<p>SQL bekerja di dalam database. Banyak pekerjaan data engineer terjadi sebelum data masuk ke database, atau di luar database sama sekali:</p>
<ul><li><b>Membaca berkas.</b> Sistem lain sering mengirim data sebagai berkas teks atau berkas Excel, bukan sebagai tabel.</li>
<li><b>Mengambil data dari API.</b> API (<i>application programming interface</i>) adalah alamat web yang mengirim data kalau diminta oleh program lain.</li>
<li><b>Otomatisasi.</b> Langkah yang sama, misalnya "ambil data, rapikan, simpan", perlu dijalankan setiap hari tanpa diketik ulang.</li></ul>
<p>Python adalah bahasa pemrograman yang cocok untuk ketiga pekerjaan itu. Python tidak menggantikan SQL. Di kursus ini, Python dipakai untuk mengambil dan merapikan data, lalu SQL dipakai untuk mengolahnya di database.</p>
<p>Kaitannya dengan DP-700: notebook di Microsoft Fabric (dokumen berisi sel kode yang dijalankan satu per satu) mendukung kernel Python (kernel adalah mesin yang menjalankan kode di notebook), dan PySpark (Python untuk mesin pengolah data besar Spark) termasuk bahasa yang didukung. Jadi Python yang kamu pelajari di sini terpakai juga di Fabric.</p>`,
    },
    {
      title: "Menjalankan Python di Dojo dan di laptop",
      html: `<p>Di Dojo, kode Python dijalankan oleh <b>Pyodide</b>, yaitu Python resmi (CPython) yang dipindahkan ke WebAssembly (format program yang bisa dijalankan langsung oleh browser) supaya bisa berjalan di browser. Versinya Python 3.14. Saat pertama kali dipakai, browser perlu memuat Pyodide lebih dulu, jadi tunggu sebentar. Setiap contoh dan soal dijalankan dari awal, sehingga variabel dari soal lain tidak terbawa.</p>
<p>Di laptop Windows, pasang Python lewat <b>Python install manager</b>, alat resmi dari tim Python. Alat ini bisa diunduh dari python.org/downloads atau dipasang dari Microsoft Store; menurut dokumentasi resmi, keduanya sama. Setelah terpasang, buka PowerShell baru. Perintah <code>py install 3.14</code> memasang Python 3.14, versi yang sama dengan Dojo. Kalau belum ada Python sama sekali, mengetik <code>python</code> saja juga memasang versi stabil terbaru secara otomatis.</p>
<p>Perintah pertama yang perlu kamu kenal adalah <code>print()</code>. Ini <b>fungsi bawaan</b>: fungsi yang sudah tersedia tanpa perlu dibuat. Isi tanda kurung dicetak ke layar. Kalau isinya lebih dari satu nilai dan dipisah koma, nilai-nilai itu dicetak dengan satu spasi di antaranya.</p>
<p>Teks ditulis di antara tanda kutip, boleh kutip satu (<code>'...'</code>) atau kutip dua (<code>"..."</code>); hasilnya sama. Tanda <code>#</code> memulai <i>komentar</i> (catatan untuk pembaca kode): semua yang ada sesudahnya sampai akhir baris diabaikan Python.</p>`,
      examples: [
        { lang: "shell", code: "py install 3.14\npython --version\npy list", note: "Baris pertama memasang Python 3.14. Baris kedua mencetak versinya, misalnya <code>Python 3.14.2</code>. Baris ketiga menampilkan semua versi Python yang terpasang di laptopmu." },
        { lang: "py", code: `print("Halo, TokoKita")
print("Ongkir pesanan 100001:", 15000)  # dua nilai, dipisah satu spasi`, note: "Ongkir pesanan 100001 di <code>app.orders</code> memang 15000. Komentar di akhir baris kedua tidak ikut dicetak." },
      ],
    },
    {
      title: "Nilai dan tipe data",
      html: `<p>Setiap nilai di Python punya <b>tipe data</b>. Tipe menentukan operasi apa yang bisa dilakukan pada nilai itu. Lima tipe dasar:</p>
<div class="tw"><table class="t"><tr><th>Tipe</th><th>Isi</th><th>Contoh</th><th>Padanan di PostgreSQL</th></tr>
<tr><td><code>int</code></td><td>bilangan bulat</td><td><code>15000</code></td><td><code>integer</code></td></tr>
<tr><td><code>float</code></td><td>angka desimal perkiraan</td><td><code>450900.0</code></td><td><code>double precision</code></td></tr>
<tr><td><code>str</code></td><td>teks (<i>string</i>)</td><td><code>"TK-10931"</code></td><td><code>text</code></td></tr>
<tr><td><code>bool</code></td><td>benar atau salah</td><td><code>True</code>, <code>False</code></td><td><code>boolean</code></td></tr>
<tr><td><code>NoneType</code></td><td>hanya satu nilai: <code>None</code>, artinya "tidak ada nilai"</td><td><code>None</code></td><td>NULL</td></tr></table></div>
<p>Angka bertitik seperti <code>450900.0</code> otomatis bertipe float. Teks <code>"15000"</code> bertipe str walaupun isinya angka. <code>True</code>, <code>False</code>, dan <code>None</code> ditulis dengan huruf besar di depan.</p>
<p>Fungsi bawaan <code>type()</code> memberi tahu tipe sebuah nilai. Fungsi ini sering dipakai saat data tidak sesuai harapan, misalnya angka yang ternyata tersimpan sebagai teks.</p>`,
      examples: [{ lang: "py", code: `print(type(15000))
print(type(450900.0))
print(type("TK-10931"))
print(type(True))
print(type(None))`, note: "Nilai diambil dari TokoKita: ongkir 15000, harga produk 1, SKU produk, kolom <code>is_active</code>, dan <code>voucher_code</code> yang kosong (NULL) di pesanan 100001. Hasilnya ditulis dalam bentuk <code>&lt;class 'int'&gt;</code>; kata <i>class</i> di sini cukup dibaca sebagai \"tipe\"." }],
    },
    {
      title: "Variabel dan penamaan",
      html: `<p><b>Variabel</b> adalah nama yang menunjuk ke sebuah nilai. Tanda <code>=</code> berarti "simpan nilai di kanan ke nama di kiri", bukan "sama dengan". Variabel bisa diberi nilai baru kapan saja, bahkan dengan tipe yang berbeda.</p>
<p>Aturan nama variabel dari dokumentasi Python:</p>
<ul><li>Boleh berisi huruf, angka, dan garis bawah <code>_</code>, tetapi tidak boleh diawali angka. <code>ongkir2</code> boleh, <code>2ongkir</code> tidak.</li>
<li>Huruf besar dan kecil dibedakan: <code>Ongkir</code> dan <code>ongkir</code> adalah dua variabel berbeda.</li>
<li>Kata kunci Python (kata yang punya arti khusus dalam bahasa Python), misalnya <code>None</code>, <code>True</code>, <code>and</code>, <code>is</code>, tidak boleh dipakai sebagai nama.</li></ul>
<p><b>PEP 8</b>, panduan gaya resmi Python, menyarankan nama variabel ditulis huruf kecil, dengan kata dipisah garis bawah: <code>harga_satuan</code>, bukan <code>HargaSatuan</code> atau <code>hargasatuan</code>. Gaya ini sering disebut <i>snake_case</i>. Nilai yang tidak pernah diubah (konstanta) ditulis huruf besar semua, misalnya <code>ONGKIR_STANDAR</code>. Gaya ini sama dengan nama kolom TokoKita seperti <code>shipping_fee</code>, sehingga nama di Python dan di database mudah dicocokkan.</p>`,
      examples: [{ lang: "py", code: `nama_produk = "Earphone Bluetooth Satria Biru"
harga = 450900
print(nama_produk, harga)

harga = 450900.0   # nilai baru, tipenya juga berubah
print(harga, type(harga))`, note: "Variabel <code>harga</code> mula-mula berisi int, lalu diganti float. Python tidak melarangnya, jadi kamu yang harus menjaga tipe tetap sesuai maksud." }],
    },
    {
      title: "Operator aritmetika",
      html: `<p>Operator hitung di Python:</p>
<div class="tw"><table class="t"><tr><th>Operator</th><th>Arti</th><th>Contoh</th><th>Hasil</th></tr>
<tr><td><code>+ - *</code></td><td>tambah, kurang, kali</td><td><code>31900 + 296900</code></td><td><code>328800</code></td></tr>
<tr><td><code>/</code></td><td>bagi, hasilnya selalu float</td><td><code>7 / 2</code></td><td><code>3.5</code></td></tr>
<tr><td><code>//</code></td><td>bagi lalu dibulatkan ke bawah</td><td><code>7 // 2</code></td><td><code>3</code></td></tr>
<tr><td><code>%</code></td><td>sisa bagi</td><td><code>7 % 2</code></td><td><code>1</code></td></tr>
<tr><td><code>**</code></td><td>pangkat</td><td><code>10 ** 3</code></td><td><code>1000</code></td></tr></table></div>
<p>Perhatikan bedanya dengan PostgreSQL. Di PostgreSQL, <code>7 / 2</code> dua bilangan bulat hasilnya 3. Di Python, <code>/</code> selalu menghasilkan float, walaupun hasilnya bulat: <code>10 / 2</code> menjadi <code>5.0</code>. Kalau kamu memang ingin hasil bulat, pakai <code>//</code>.</p>
<p><code>//</code> membulatkan ke bawah, ke arah minus tak hingga. Untuk angka negatif, hasilnya mungkin mengejutkan: <code>-7 // 2</code> adalah <code>-4</code>, bukan -3.</p>
<p>Urutan hitungnya: <code>**</code> lebih dulu, lalu <code>* / // %</code>, lalu <code>+ -</code>. Pakai tanda kurung kalau ragu. Membagi dengan nol menghasilkan error <code>ZeroDivisionError</code>.</p>`,
      examples: [{ lang: "py", code: `# isi pesanan 100001: dua barang, masing-masing qty 1
harga_1 = 31900
harga_2 = 296900
ongkir = 15000

nilai_barang = harga_1 + harga_2
print(nilai_barang + ongkir)
print(nilai_barang / 2)
print(125 // 12, 125 % 12)`, note: "Angka pesanan diambil dari <code>app.order_items</code> dan <code>app.orders</code>. Baris kedua mencetak <code>164400.0</code>, karena <code>/</code> selalu menghasilkan float. Baris ketiga: 125 barang mengisi 10 kardus isi 12, sisa 5 barang." }],
    },
    {
      title: "round() dan abs()",
      html: `<p><code>round(angka)</code> membulatkan ke bilangan bulat dan hasilnya int. <code>round(angka, n)</code> membulatkan ke n digit di belakang titik. n boleh negatif: <code>round(63900, -3)</code> membulatkan ke ribuan terdekat, menjadi <code>64000</code>.</p>
<p>Ada satu aturan yang berbeda dari pelajaran sekolah. Menurut dokumentasi Python, kalau nilai tepat di tengah dua kandidat, <code>round()</code> memilih kandidat yang <b>genap</b>. Jadi <code>round(0.5)</code> dan <code>round(2.5)</code> menjadi 0 dan 2, sedangkan <code>round(1.5)</code> menjadi 2. Aturan ini disebut <b>pembulatan ke genap</b> (<i>banker's rounding</i>).</p>
<p>PostgreSQL berbeda. Menurut dokumentasi PostgreSQL, <code>ROUND</code> untuk tipe numeric membulatkan nilai tengah menjauhi nol: <code>round(2.5)</code> menjadi 3, dan <code>round(12500, -3)</code> menjadi 13000. Python memberi 2 dan 12000. Kalau hasil hitungan Python dibandingkan dengan laporan dari SQL, selisih kecil bisa datang dari sini.</p>
<p>Ada satu jebakan lagi. Float menyimpan angka dalam bentuk biner (susunan angka 0 dan 1), sehingga kebanyakan angka desimal tidak tersimpan tepat. <code>2.675</code> sebenarnya tersimpan sedikit di bawah 2.675, sehingga <code>round(2.675, 2)</code> menjadi 2.67. Dokumentasi Python menyebut ini bukan kesalahan (<i>bug</i>) Python, melainkan akibat cara float menyimpan angka.</p>
<p><code>abs()</code> memberi nilai mutlak (tanpa tanda minus). Fungsi ini berguna untuk selisih, misalnya selisih harga yang bisa positif atau negatif.</p>`,
      examples: [{ lang: "py", code: `print(round(0.5), round(1.5), round(2.5), round(3.5))
print(round(12500, -3), round(13500, -3))
print(round(2.675, 2))
print(round(450900 / 7), round(450900 / 7, 2))
print(abs(296900 - 31900), abs(31900 - 296900))`, note: "Baris pertama: 0 2 2 4. Setiap nilai tengah dibulatkan ke angka genap terdekat. Baris kedua: 12000 dan 14000, dengan aturan yang sama di ribuan. Baris terakhir sama-sama 265000." }],
    },
    {
      title: "Perbandingan dan logika",
      html: `<p>Operator perbandingan menghasilkan bool: <code>==</code> (sama dengan), <code>!=</code> (tidak sama), <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>. Ingat, satu <code>=</code> berarti menyimpan, dua <code>==</code> berarti membandingkan. Perbandingan boleh dirangkai: <code>100000 &lt;= harga &lt;= 500000</code> sama dengan BETWEEN di SQL.</p>
<p>Syarat digabung dengan <code>and</code>, <code>or</code>, dan <code>not</code>, seperti AND, OR, NOT di SQL. Urutannya: <code>not</code> dulu, lalu <code>and</code>, lalu <code>or</code>.</p>
<p>Setiap nilai juga punya arti benar atau salah. Yang dianggap salah: <code>False</code>, <code>None</code>, angka nol (<code>0</code>, <code>0.0</code>), dan teks kosong <code>""</code>. Semua nilai lain dianggap benar.</p>
<p><code>and</code> dan <code>or</code> tidak selalu menghasilkan True/False; keduanya mengembalikan salah satu nilai yang dibandingkan. <code>x or y</code> memberi <code>x</code> kalau x dianggap benar, dan <code>y</code> kalau tidak. Ini bisa dipakai untuk nilai pengganti, mirip COALESCE: <code>voucher or "TANPA VOUCHER"</code>. Bedanya, COALESCE hanya mengganti NULL, sedangkan <code>or</code> juga mengganti <code>0</code> dan <code>""</code>. Di <code>app.orders</code> ada 772 pesanan dengan <code>shipping_fee</code> 0. Untuk pesanan seperti itu, <code>ongkir or 15000</code> memberi 15000, padahal ongkirnya memang 0.</p>
<p>Jebakan klasik di wawancara: <code>0.1 + 0.2 == 0.3</code> hasilnya <code>False</code>. Seperti 2.675 tadi, 0.1 dan 0.2 tidak tersimpan tepat, sehingga jumlahnya <code>0.30000000000000004</code>. Jangan membandingkan float dengan <code>==</code>; bulatkan dulu, atau simpan rupiah sebagai int. Int di Python selalu tepat, berapa pun besarnya.</p>`,
      examples: [{ lang: "py", code: `harga = 450900
aktif = True
print(harga > 400000 and aktif)
print(100000 <= harga <= 500000)
print(not aktif)
print("" or "TANPA VOUCHER", "HEMAT10" or "TANPA VOUCHER")
print(0.1 + 0.2, 0.1 + 0.2 == 0.3, round(0.1 + 0.2, 2) == 0.3)`, note: "Baris keempat mencetak TANPA VOUCHER lalu HEMAT10: teks kosong dianggap salah, jadi <code>or</code> memberi nilai kedua. Baris terakhir menunjukkan jebakan float dan cara amannya." }],
    },
    {
      title: "in, is, dan None",
      html: `<p><code>in</code> memeriksa apakah sebuah teks ada di dalam teks lain, mirip <code>LIKE '%...%'</code> di SQL. Huruf besar dan kecil dibedakan, jadi <code>"bluetooth" in "Earphone Bluetooth"</code> hasilnya False. <code>not in</code> adalah kebalikannya.</p>
<p><code>None</code> dipakai untuk "tidak ada nilai", seperti NULL. Cara memeriksanya: <code>x is None</code> atau <code>x is not None</code>. <code>is</code> memeriksa apakah dua nama menunjuk ke <b>objek yang sama persis</b> (objek adalah satu nilai yang tersimpan selama program berjalan), sedangkan <code>==</code> memeriksa apakah <b>nilainya</b> sama. Hanya ada satu objek None di seluruh program, jadi <code>is None</code> selalu tepat. PEP 8 menulis bahwa perbandingan dengan None sebaiknya selalu memakai <code>is</code> atau <code>is not</code>, tidak pernah <code>==</code>.</p>
<p>Bedanya dengan SQL: di SQL, <code>NULL = NULL</code> hasilnya NULL (tidak diketahui). Di Python, <code>None == None</code> hasilnya True. Walau begitu, tetap tulis <code>is None</code>. Ini mengikuti PEP 8, dan sama dengan kebiasaan IS NULL di SQL.</p>
<p>Jangan memakai <code>is</code> untuk membandingkan angka atau teks. Untuk itu selalu pakai <code>==</code>.</p>`,
      examples: [{ lang: "py", code: `nama_produk = "Earphone Bluetooth Satria Biru"
print("Bluetooth" in nama_produk, "bluetooth" in nama_produk)
print("TWS" not in nama_produk)

voucher = None          # pesanan 100001 tanpa voucher
print(voucher is None, voucher is not None)`, note: "Pesanan 100001 di <code>app.orders</code> punya <code>voucher_code</code> NULL; di Python nilai itu menjadi None." }],
    },
    {
      title: "Teks: menggabung, f-string, dan len()",
      html: `<p>Dua teks bisa digabung dengan <code>+</code>, seperti <code>||</code> di SQL. Tetapi teks dan angka tidak bisa digabung langsung. Python tidak mengubah angka menjadi teks diam-diam:</p>
<pre>print("Ongkir: " + 15000)
TypeError: can only concatenate str (not "int") to str</pre>
<p>Cara yang lebih rapi adalah <b>f-string</b>: teks yang diawali huruf <code>f</code>. Ekspresi di dalam kurung kurawal <code>{}</code> dihitung, lalu hasilnya dimasukkan ke teks. Sesudah titik dua di dalam kurung kurawal, kamu bisa menulis format angka:</p>
<ul><li><code>{harga:,}</code>: pemisah ribuan dengan koma, <code>450,900</code>.</li>
<li><code>{harga:,.2f}</code>: pemisah ribuan dan dua digit desimal, <code>450,900.00</code>.</li>
<li><code>{persen:.1f}</code>: satu digit desimal.</li></ul>
<p>Pemisah ribuan bawaan Python selalu koma, dengan kelompok tiga digit. Untuk format rupiah dengan titik, ganti komanya dengan <code>.replace(",", ".")</code> (dijelaskan di bagian berikutnya).</p>
<p><code>len()</code> menghitung jumlah karakter sebuah teks, termasuk spasi. Fungsi ini sama dengan LENGTH di SQL.</p>`,
      examples: [{ lang: "py", code: `nama_produk = "Earphone Bluetooth Satria Biru"
harga = 450900
ongkir = 15000

print("Ongkir: " + str(ongkir))
print(f"{nama_produk}: {harga:,}")
print(f"Total: {harga + ongkir:,.2f}")
print(f"Rp {harga:,}".replace(",", "."))
print(len(nama_produk), len(" tk-10931"))`, note: "<code>str(ongkir)</code> mengubah angka menjadi teks supaya bisa digabung. Baris terakhir mencetak 30 dan 9: spasi di depan <code>\" tk-10931\"</code> ikut dihitung." }],
    },
    {
      title: "Metode teks",
      html: `<p><b>Metode</b> adalah fungsi yang menempel pada sebuah nilai dan dipanggil dengan titik: <code>nilai.metode()</code>. Lima metode teks yang paling sering dipakai saat merapikan data:</p>
<div class="tw"><table class="t"><tr><th>Metode</th><th>Arti</th><th>Padanan SQL</th></tr>
<tr><td><code>.upper()</code>, <code>.lower()</code></td><td>huruf besar semua, huruf kecil semua</td><td>UPPER, LOWER</td></tr>
<tr><td><code>.strip()</code></td><td>membuang spasi di awal dan akhir</td><td>TRIM</td></tr>
<tr><td><code>.replace(a, b)</code></td><td>mengganti setiap <code>a</code> dengan <code>b</code></td><td>REPLACE</td></tr>
<tr><td><code>.split(pemisah)</code></td><td>memecah teks di setiap pemisah; tanpa pemisah, dipecah di spasi</td><td>mirip SPLIT_PART</td></tr></table></div>
<p>Metode teks tidak mengubah teks aslinya. Metode itu membuat teks baru, jadi simpan hasilnya ke variabel kalau ingin dipakai lagi. Beberapa metode boleh dirangkai: <code>sku.strip().upper()</code> dijalankan dari kiri ke kanan.</p>
<p>Contoh di bawah memakai nilai asli dari <code>raw.supplier_price_upload</code>, berkas harga dari pemasok yang formatnya tidak seragam. Baris 1 berisi SKU <code>" tk-10931"</code> (dengan spasi di depan) dan harga <code>"Rp 63.900"</code>. Baris 9 berisi nama pemasok <code>" pt sumber elektronik"</code>.</p>
<p>Hasil <code>.split()</code> dicetak di dalam kurung siku, misalnya <code>['2025', '09', '16']</code>: beberapa teks yang berurutan. Cara mengambil isinya satu per satu dibahas di bab berikutnya.</p>`,
      examples: [{ lang: "py", code: `sku = " tk-10931"
pemasok = " pt sumber elektronik"
harga_teks = "Rp 63.900"

print(sku.strip().upper())
print(pemasok.strip().upper())
print(harga_teks.replace("Rp", "").replace(".", "").strip())
print("2025-09-16".split("-"))
print(sku)`, note: "Baris terakhir masih mencetak SKU dengan spasi di depan: <code>sku</code> tidak berubah, karena hasil <code>.strip().upper()</code> tidak disimpan. Tanggal <code>2025-09-16</code> berasal dari kolom <code>effective_date_text</code> baris 2." }],
    },
    {
      title: "Konversi tipe dan ValueError",
      html: `<p>Data dari berkas hampir selalu datang sebagai teks. Sebelum dihitung, teks harus diubah ke tipe yang benar, seperti CAST di SQL:</p>
<ul><li><code>int(x)</code>: menjadi bilangan bulat. Spasi di awal dan akhir boleh, jadi <code>int(" 42 ")</code> menjadi 42. Dari float, angka di belakang titik <b>dibuang</b>, bukan dibulatkan: <code>int(63.9)</code> menjadi 63.</li>
<li><code>float(x)</code>: menjadi angka desimal.</li>
<li><code>str(x)</code>: menjadi teks.</li>
<li><code>bool(x)</code>: menjadi True/False dengan aturan benar-salah tadi. Hati-hati, <code>bool("0")</code> adalah True, karena <code>"0"</code> teks yang tidak kosong.</li></ul>
<p>Kalau teksnya tidak berbentuk angka, Python berhenti dengan error <code>ValueError</code>. Tiga contoh:</p>
<pre>int("12.5")
ValueError: invalid literal for int() with base 10: '12.5'

int("")
ValueError: invalid literal for int() with base 10: ''

float("Rp 63.900")
ValueError: could not convert string to float: 'Rp 63.900'</pre>
<p>Dua contoh terakhir nyata di <code>raw.supplier_price_upload</code>: kolom <code>price_text</code> di baris 2 berisi teks kosong, dan di baris 1 berisi <code>Rp 63.900</code>. Cara membaca error: di laptop, Python mencetak beberapa baris yang diawali <code>Traceback</code>. Baris terakhirlah yang paling penting, berisi jenis error dan penyebabnya. Jenis error yang lain yang sudah kamu lihat: <code>TypeError</code> (tipe tidak cocok untuk operasi itu) dan <code>ZeroDivisionError</code> (membagi dengan nol).</p>
<p>Cara mengatasinya: rapikan teks dulu dengan metode teks, baru ubah tipenya. Cara menangani error tanpa menghentikan program dibahas di bab tersendiri nanti.</p>`,
      examples: [{ lang: "py", code: `harga_teks = "Rp 63.900"
bersih = harga_teks.replace("Rp", "").replace(".", "").strip()
harga = int(bersih)
print(harga + 3000, type(harga))

print(int(" 42 "), int(63.9), float("63.9"), str(15000) + "!")
print(bool(0), bool(""), bool("0"), bool(None))`, note: "Setelah dibersihkan dan diubah menjadi int, harga bisa dihitung. Baris terakhir mencetak False False True False." }],
    },
    {
      title: "Padanan SQL yang sudah kamu kenal",
      html: `<div class="tw"><table class="t"><tr><th>PostgreSQL</th><th>Python</th><th>Catatan</th></tr>
<tr><td><code>CAST(x AS int)</code>, <code>x::int</code></td><td><code>int(x)</code></td><td>Python tidak menerima <code>"12.5"</code> untuk int.</td></tr>
<tr><td><code>ROUND(x, n)</code></td><td><code>round(x, n)</code></td><td>Nilai tengah: PostgreSQL menjauhi nol, Python ke genap.</td></tr>
<tr><td><code>7 / 2</code> (hasil 3)</td><td><code>7 // 2</code></td><td><code>7 / 2</code> di Python memberi 3.5.</td></tr>
<tr><td><code>'TK' || '-10931'</code></td><td><code>"TK" + "-10931"</code></td><td>Angka harus diubah dengan <code>str()</code> atau ditulis lewat f-string.</td></tr>
<tr><td>NULL, <code>IS NULL</code></td><td><code>None</code>, <code>is None</code></td><td><code>None == None</code> di Python True.</td></tr>
<tr><td><code>COALESCE(x, 'y')</code></td><td><code>x or "y"</code></td><td><code>or</code> juga mengganti 0 dan teks kosong.</td></tr>
<tr><td><code>=</code>, <code>&lt;&gt;</code></td><td><code>==</code>, <code>!=</code></td><td>Satu <code>=</code> di Python berarti menyimpan ke variabel.</td></tr>
<tr><td><code>LIKE '%Bluetooth%'</code></td><td><code>"Bluetooth" in x</code></td><td>Keduanya membedakan huruf besar dan kecil. Padanan ILIKE: ubah dulu dengan <code>.lower()</code>.</td></tr>
<tr><td>UPPER, LOWER, TRIM, REPLACE, LENGTH</td><td><code>.upper()</code>, <code>.lower()</code>, <code>.strip()</code>, <code>.replace()</code>, <code>len()</code></td><td></td></tr></table></div>`,
    },
  ],
  tsql: [],
  summary: [
    "Python melengkapi SQL untuk berkas, API, dan otomatisasi. Di Dojo, Python berjalan di browser lewat Pyodide; di laptop, pasang lewat Python install manager.",
    "Tipe dasar: int, float, str, bool, dan None. Periksa dengan <code>type()</code>.",
    "Nama variabel memakai snake_case sesuai PEP 8. <code>=</code> menyimpan, <code>==</code> membandingkan.",
    "<code>/</code> selalu menghasilkan float, <code>//</code> membagi lalu membulatkan ke bawah, <code>%</code> sisa bagi, <code>**</code> pangkat.",
    "<code>round()</code> membulatkan nilai tengah ke genap (<code>round(2.5)</code> = 2), berbeda dengan ROUND numeric di PostgreSQL (3).",
    "Float tidak tepat: <code>0.1 + 0.2 == 0.3</code> False. Simpan rupiah sebagai int.",
    "Periksa None dengan <code>is None</code>. <code>x or nilai_pengganti</code> mirip COALESCE, tetapi juga mengganti 0 dan teks kosong.",
    "f-string dengan format <code>:,</code> dan <code>:,.2f</code> merapikan angka. Metode teks membuat teks baru, bukan mengubah yang lama.",
    "<code>int()</code>/<code>float()</code> menghasilkan ValueError kalau teksnya bukan angka. Rapikan teks dulu, baru ubah tipenya.",
  ],
  drills: [
    { id: "py-01-01", kind: "choice", prompt: "Apa yang dicetak <code>print(7 / 2)</code> di Python?", options: ["3", "3.5", "3.0", "Error, karena 7 dan 2 bilangan bulat"], answer: 1, why: "Di Python, <code>/</code> selalu menghasilkan float, jadi 7 / 2 = 3.5. Ini berbeda dengan PostgreSQL, yang memberi 3 untuk dua bilangan bulat. Hasil 3 di Python didapat dengan <code>7 // 2</code>.", hint: "Ingat bedanya <code>/</code> dan <code>//</code>." },
    { id: "py-01-02", kind: "choice", prompt: "Apa yang dicetak <code>print(round(2.5))</code> di Python?", options: ["2", "3", "2.0", "2.5"], answer: 0, why: "Nilai 2.5 tepat di tengah 2 dan 3. <code>round()</code> memilih yang genap, yaitu 2, dan hasilnya int karena n tidak diisi. ROUND untuk numeric di PostgreSQL memberi 3.", hint: "Pembulatan ke genap." },
    { id: "py-01-03", kind: "py", prompt: "Cetak tipe dari empat nilai ini, satu per baris dan sesuai urutan: <code>15000</code>, <code>15000.0</code>, <code>\"15000\"</code>, dan <code>None</code>. Keluarannya empat baris seperti <code>&lt;class 'int'&gt;</code>.", start: "# cetak tipe setiap nilai dengan type()\n", solution: `print(type(15000))
print(type(15000.0))
print(type("15000"))
print(type(None))`, why: "Angka tanpa titik bertipe int, angka bertitik float, apa pun di dalam tanda kutip str, dan None bertipe NoneType.", hint: "Masukkan setiap nilai ke <code>type()</code>, lalu bungkus dengan <code>print()</code>." },
    { id: "py-01-04", kind: "py", prompt: "Pesanan 100001 berisi dua barang (qty 1) seharga 31900 dan 296900, dengan ongkir 15000. Cetak dua baris: (1) total yang dibayar (harga kedua barang ditambah ongkir), (2) rata-rata harga kedua barang memakai <code>/</code>. Hasilnya <code>343800</code> lalu <code>164400.0</code>.", start: "harga_1 = 31900\nharga_2 = 296900\nongkir = 15000\n", solution: `harga_1 = 31900
harga_2 = 296900
ongkir = 15000
print(harga_1 + harga_2 + ongkir)
print((harga_1 + harga_2) / 2)`, why: "Tanda kurung memastikan kedua harga dijumlah dulu sebelum dibagi. Tanpa kurung, hanya <code>harga_2</code> yang dibagi 2. <code>/</code> selalu menghasilkan float, sehingga tercetak 164400.0.", hint: "Rata-rata = (harga_1 + harga_2) / 2. Perhatikan urutan hitung." },
    { id: "py-01-05", kind: "py", prompt: "Gudang punya 125 barang yang dikemas ke kardus isi 12. Cetak dua baris: jumlah kardus yang terisi penuh, lalu sisa barang yang tidak masuk kardus penuh. Hasilnya <code>10</code> lalu <code>5</code>.", start: "barang = 125\nisi_kardus = 12\n", solution: `barang = 125
isi_kardus = 12
print(barang // isi_kardus)
print(barang % isi_kardus)`, why: "<code>//</code> memberi hasil bagi yang dibulatkan ke bawah (10), dan <code>%</code> memberi sisanya (5). Kalau diperiksa: 10 × 12 + 5 = 125.", hint: "Satu operator untuk hasil bagi bulat, satu lagi untuk sisa bagi." },
    { id: "py-01-06", kind: "py", prompt: "Cetak satu baris persis seperti ini: <code>Earphone Bluetooth Satria Biru: Rp 450.900</code>. Pakai f-string dengan variabel <code>nama_produk</code> dan <code>harga</code>, dan pemisah ribuan titik.", start: "nama_produk = \"Earphone Bluetooth Satria Biru\"\nharga = 450900\n", solution: `nama_produk = "Earphone Bluetooth Satria Biru"
harga = 450900
harga_teks = f"{harga:,}".replace(",", ".")
print(f"{nama_produk}: Rp {harga_teks}")`, why: "<code>{harga:,}</code> memberi <code>450,900</code> dengan pemisah koma. <code>.replace(\",\", \".\")</code> menggantinya dengan titik sesuai format rupiah. Harga ini adalah <code>list_price</code> produk 1 di <code>app.products</code>.", hint: "Buat dulu teks harganya dengan format <code>:,</code>, ganti komanya, lalu gabungkan di f-string kedua." },
    { id: "py-01-07", kind: "py", prompt: "Dua nilai dari <code>raw.supplier_price_upload</code> perlu dirapikan. Cetak dua baris: SKU tanpa spasi dan dengan huruf besar (<code>TK-10931</code>), lalu nama pemasok tanpa spasi dan dengan huruf besar (<code>PT SUMBER ELEKTRONIK</code>).", start: "sku = \" tk-10931\"\npemasok = \" pt sumber elektronik\"\n", solution: `sku = " tk-10931"
pemasok = " pt sumber elektronik"
print(sku.strip().upper())
print(pemasok.strip().upper())`, why: "<code>.strip()</code> membuang spasi di depan, lalu <code>.upper()</code> mengubah semua huruf menjadi besar. Metode dirangkai dari kiri ke kanan.", hint: "Rangkai dua metode teks dengan titik." },
    { id: "py-01-08", kind: "py", prompt: "Ubah <code>harga_teks = \"Rp 63.900\"</code> menjadi bilangan bulat. Cetak dua baris: nilainya (<code>63900</code>), lalu tipenya (<code>&lt;class 'int'&gt;</code>).", start: "harga_teks = \"Rp 63.900\"\n", solution: `harga_teks = "Rp 63.900"
harga = int(harga_teks.replace("Rp", "").replace(".", "").strip())
print(harga)
print(type(harga))`, why: "<code>int(\"Rp 63.900\")</code> langsung gagal dengan ValueError. Buang dulu <code>Rp</code> dan titik ribuan, lalu spasi, baru ubah dengan <code>int()</code>. Baris tipe membuktikan hasilnya angka, bukan teks <code>\"63900\"</code>.", hint: "Bersihkan teks dengan <code>.replace()</code> dan <code>.strip()</code>, lalu bungkus dengan <code>int()</code>." },
    { id: "py-01-09", kind: "py", prompt: "Pesanan 100001 tidak memakai voucher (<code>voucher_1 = None</code>), pesanan 100002 memakai <code>\"HEMAT10\"</code>. Cetak tiga baris: (1) hasil pemeriksaan apakah <code>voucher_1</code> None dengan cara yang disarankan PEP 8 (<code>True</code>), (2) <code>voucher_1</code> dengan pengganti <code>TANPA VOUCHER</code> kalau kosong, (3) <code>voucher_2</code> dengan pengganti yang sama (<code>HEMAT10</code>).", start: "voucher_1 = None\nvoucher_2 = \"HEMAT10\"\n", solution: `voucher_1 = None
voucher_2 = "HEMAT10"
print(voucher_1 is None)
print(voucher_1 or "TANPA VOUCHER")
print(voucher_2 or "TANPA VOUCHER")`, why: "PEP 8 menyarankan <code>is None</code>. <code>or</code> memberi nilai pertama kalau nilai itu dianggap benar, dan nilai kedua kalau tidak; None dianggap salah, jadi baris kedua mencetak TANPA VOUCHER.", hint: "Pakai <code>is</code> untuk baris pertama, dan <code>or</code> untuk dua baris berikutnya." },
    { id: "py-01-10", kind: "py", prompt: "Cetak tiga baris bool untuk produk ini: (1) apakah nama mengandung <code>Bluetooth</code> DAN harga di atas 400000 (<code>True</code>), (2) apakah nama mengandung <code>bluetooth</code> huruf kecil (<code>False</code>), (3) apakah nama yang sudah diubah ke huruf kecil mengandung <code>bluetooth</code> (<code>True</code>).", start: "nama_produk = \"Earphone Bluetooth Satria Biru\"\nharga = 450900\n", solution: `nama_produk = "Earphone Bluetooth Satria Biru"
harga = 450900
print("Bluetooth" in nama_produk and harga > 400000)
print("bluetooth" in nama_produk)
print("bluetooth" in nama_produk.lower())`, why: "<code>in</code> membedakan huruf besar dan kecil, jadi <code>bluetooth</code> tidak ditemukan di nama aslinya. Mengubah nama ke huruf kecil dulu membuat pencarian tidak peka huruf besar, mirip ILIKE di PostgreSQL.", hint: "Baris ketiga: pakai <code>.lower()</code> pada nama produk sebelum <code>in</code>." },
    { id: "py-01-11", kind: "py", prompt: "Kode ini error dengan <code>TypeError</code>. Perbaiki supaya mencetak <code>Ongkir: 15000</code>.", start: "ongkir = 15000\nprint(\"Ongkir: \" + ongkir)\n", solution: `ongkir = 15000
print("Ongkir: " + str(ongkir))`, why: "Teks dan int tidak bisa digabung dengan <code>+</code>. Ubah angkanya menjadi teks dengan <code>str()</code>. Cara lain yang sama hasilnya: <code>print(f\"Ongkir: {ongkir}\")</code>.", hint: "Salah satu sisi <code>+</code> harus diubah tipenya." },
    { id: "py-01-12", kind: "number", prompt: "Ongkir 12500 dibulatkan ke ribuan terdekat dengan <code>round(12500, -3)</code> di Python. Berapa hasilnya?", answerPy: "print(round(12500, -3))", why: "12500 tepat di tengah 12000 dan 13000. Python memilih kandidat genap (12 genap), jadi hasilnya 12000. PostgreSQL <code>round(12500, -3)</code> memberi 13000.", hint: "Nilai tengah dibulatkan ke kandidat genap." },
    { id: "py-01-13", kind: "choice", level: "wawancara", prompt: "Apa yang dicetak <code>print(0.1 + 0.2 == 0.3)</code>?", options: ["True", "False", "Error", "0.3"], answer: 1, why: "Float disimpan dalam bentuk biner, dan 0.1 maupun 0.2 tidak tersimpan tepat. Jumlahnya 0.30000000000000004, jadi tidak sama dengan 0.3. Bandingkan setelah dibulatkan, misalnya <code>round(0.1 + 0.2, 2) == 0.3</code>, atau simpan uang sebagai int.", hint: "Coba cetak <code>0.1 + 0.2</code> saja." },
    { id: "py-01-14", kind: "choice", prompt: "Apa yang terjadi saat <code>int(\"12.5\")</code> dijalankan?", options: ["Hasilnya 12", "Hasilnya 12.5", "Hasilnya 13", "Error ValueError"], answer: 3, why: "<code>int()</code> dari teks hanya menerima teks bilangan bulat. Teks <code>\"12.5\"</code> ditolak dengan ValueError. Kalau angkanya sudah float, <code>int(12.5)</code> memberi 12 (angka di belakang titik dibuang).", hint: "Bedakan int dari teks dan int dari float." },
    { id: "py-01-15", kind: "explain", level: "wawancara", prompt: "Jelaskan bedanya <code>is</code> dan <code>==</code> di Python, dan kenapa memeriksa None ditulis <code>x is None</code>, bukan <code>x == None</code>.", model: "<code>==</code> membandingkan nilai: apakah isinya sama. <code>is</code> membandingkan identitas: apakah dua nama menunjuk ke objek yang sama persis. None hanya ada satu di seluruh program, jadi <code>x is None</code> tepat dan jelas maksudnya. PEP 8 menyarankan perbandingan dengan None selalu memakai <code>is</code> atau <code>is not</code>, tidak pernah <code>==</code>. Untuk angka dan teks, pakai <code>==</code>, karena dua nilai yang sama belum tentu objek yang sama.", hint: "Satu memeriksa isi, satu memeriksa apakah bendanya sama. Sebut juga aturan PEP 8." },
  ],
};
