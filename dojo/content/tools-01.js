// Bab 1 Alat kerja: terminal, PowerShell di Windows 11, padanan bash di Linux, dan WSL.
// Fakta tentang PowerShell, bash, coreutils, grep, dan WSL dicek lewat Context7
// (/microsoftdocs/powershell-docs, /websites/gnu_software_bash_manual_html_node,
//  /websites/gnu_software_coreutils_manual_html_node, /websites/gnu_software_grep_manual_html_node, /microsoftdocs/wsl).
export default {
  id: "tools-01",
  part: "tools",
  title: "Terminal, PowerShell, dan Linux dasar",
  minutes: 75,
  goals: [
    "Membuka PowerShell di Windows 11 dan mengenali versinya.",
    "Berpindah folder dengan path absolut dan path relatif.",
    "Membuat, menyalin, memindah, dan menghapus berkas dan folder dengan aman.",
    "Membaca dan mencari isi berkas, lalu menyambung perintah dengan pipa <code>|</code>.",
    "Menyimpan keluaran perintah ke berkas, membaca variabel lingkungan dan PATH, dan memeriksa kode keluar program.",
    "Menerjemahkan perintah PowerShell ke bash di Linux, dan memeriksa WSL di laptopmu.",
  ],
  terms: [
    { term: "terminal", def: "Jendela tempat kamu mengetik perintah dan membaca hasilnya dalam bentuk teks." },
    { term: "path", def: "Alamat sebuah berkas atau folder, misalnya <code>C:\\Users\\budi\\latihan-dojo\\pesanan.csv</code>." },
    { term: "shell", def: "Program di dalam terminal yang membaca perintahmu, menjalankannya, lalu menampilkan hasilnya. Contohnya PowerShell di Windows dan bash di Linux." },
    { term: "direktori kerja", def: "Folder tempat shell sedang berada. Path relatif dihitung dari folder ini. Disebut juga lokasi saat ini." },
    { term: "path absolut", def: "Path lengkap dari akar drive, misalnya <code>C:\\Users\\budi\\latihan-dojo</code>. Artinya selalu sama di folder mana pun kamu berada." },
    { term: "path relatif", def: "Path yang dihitung dari direktori kerja, misalnya <code>.\\data\\pesanan.csv</code> atau <code>..\\arsip</code>." },
    { term: "cmdlet", def: "Perintah bawaan PowerShell. Namanya berpola Kata-kerja-Kata-benda, misalnya <code>Get-ChildItem</code>." },
    { term: "parameter", def: "Bagian perintah yang diawali tanda minus untuk mengatur cara kerjanya, misalnya <code>-Path</code> atau <code>-Recurse</code>. Di bash biasa disebut opsi atau <i>flag</i>." },
    { term: "argumen", def: "Nilai yang kamu berikan kepada perintah atau parameter, misalnya nama berkas <code>pesanan.csv</code>." },
    { term: "alias", def: "Nama pendek untuk sebuah perintah. Di PowerShell, <code>cd</code> adalah alias dari <code>Set-Location</code>." },
    { term: "pipa", def: "Tanda <code>|</code> yang mengirim hasil satu perintah menjadi masukan perintah berikutnya. Disebut juga <i>pipeline</i>." },
    { term: "variabel lingkungan", def: "Pasangan nama dan nilai teks yang disimpan sistem operasi dan diwariskan ke program yang dijalankan, misalnya <code>PATH</code>. Disebut juga <i>environment variable</i>." },
    { term: "kode keluar", def: "Angka yang dikembalikan program saat selesai. 0 berarti berhasil, angka lain berarti gagal. Disebut juga <i>exit code</i>." },
    { term: "bash", def: "Shell bawaan sistem operasi GNU, yang berjalan di hampir semua versi Unix dan dipakai di Linux. Perintahnya berbeda dengan PowerShell, tetapi konsepnya sama." },
    { term: "wsl", def: "Windows Subsystem for Linux: fitur Windows untuk menjalankan Linux langsung di laptop Windows." },
  ],
  introduces: [],
  sections: [
    {
      title: "Terminal dan shell",
      html: `<p><b>Terminal</b> adalah jendela tempat kamu mengetik perintah. Program yang membaca dan menjalankan perintah itu disebut <b>shell</b>. Di Windows, shell yang dipakai di kursus ini adalah PowerShell. Di Linux, shell yang paling umum adalah bash.</p>
<p>Data engineer memakai terminal setiap hari, karena tiga alasan:</p>
<ul><li><b>Server tidak punya layar.</b> Komputer tempat data diproses biasanya berjalan di pusat data atau di cloud, dan dikendalikan lewat perintah teks.</li>
<li><b>Perintah bisa diulang.</b> Langkah yang ditulis sebagai perintah bisa disimpan, dijalankan lagi besok, atau dijalankan otomatis oleh komputer. Klik di layar tidak bisa diulang semudah itu.</li>
<li><b>Banyak alat kerja dijalankan dari terminal.</b> Alat yang dipelajari di bab-bab berikutnya juga dijalankan dari sini.</li></ul>
<p>Windows 11 sudah membawa <b>Windows PowerShell 5.1</b>. Ada juga <b>PowerShell 7</b>, produk terpisah yang harus dipasang sendiri. Keduanya bisa terpasang bersamaan: Windows PowerShell dijalankan dengan <code>powershell.exe</code>, PowerShell 7 dengan <code>pwsh.exe</code>. Semua perintah di bab ini jalan di keduanya.</p>
<p>Untuk membuka PowerShell, tekan tombol Start, ketik <code>PowerShell</code>, lalu pilih Windows PowerShell. Baris yang diawali <code>PS C:\\Users\\...&gt;</code> disebut <i>prompt</i> (tanda bahwa shell siap menerima perintah). Ketik perintah, lalu tekan Enter.</p>`,
      examples: [{ lang: "shell", code: "$PSVersionTable.PSVersion", note: "<code>$PSVersionTable</code> adalah variabel bawaan yang berisi informasi versi PowerShell. Kolom <code>Major</code> bernilai 5 di Windows PowerShell 5.1 dan 7 di PowerShell 7." }],
    },
    {
      title: "Bentuk sebuah perintah",
      html: `<p>Perintah bawaan PowerShell disebut <b>cmdlet</b>. Namanya terdiri dari kata kerja dan kata benda yang dipisah tanda minus, misalnya <code>Get-ChildItem</code> (ambil isi folder) atau <code>Remove-Item</code> (hapus item). Pola ini memudahkan menebak nama perintah.</p>
<p>Sesudah nama perintah, kamu bisa menulis <b>parameter</b>, yaitu kata yang diawali tanda minus, diikuti <b>argumen</b> (nilainya). Pada <code>Get-ChildItem -Path C:\\Windows</code>, parameternya <code>-Path</code> dan argumennya <code>C:\\Windows</code>. Beberapa parameter tidak butuh nilai, misalnya <code>-Recurse</code>; parameter seperti ini disebut <i>switch</i> (sakelar: ditulis berarti aktif). Beberapa parameter boleh ditulis tanpa namanya, cukup nilainya di posisi yang benar. Karena itu <code>Get-ChildItem C:\\Windows</code> sama artinya.</p>
<p>Hal lain yang perlu kamu tahu sejak awal:</p>
<ul><li>Nama perintah dan parameter PowerShell tidak membedakan huruf besar dan kecil. <code>get-childitem</code> sama dengan <code>Get-ChildItem</code>.</li>
<li>Banyak cmdlet punya <b>alias</b>, yaitu nama pendek. <code>ls</code> dan <code>dir</code> adalah alias <code>Get-ChildItem</code>; <code>cd</code> adalah alias <code>Set-Location</code>.</li>
<li>Tekan Tab untuk melengkapi nama perintah, nama parameter, atau path. Ini mengurangi salah ketik.</li>
<li><code>Get-Help</code> menampilkan penjelasan sebuah perintah, dan <code>Get-Command</code> mencari perintah yang tersedia.</li></ul>`,
      examples: [{ lang: "shell", code: "Get-Help Get-ChildItem\nGet-Command -Name Get-Child*", note: "Tanda <code>*</code> berarti \"teks apa saja\", jadi baris kedua mencari semua perintah yang namanya diawali <code>Get-Child</code>." }],
    },
    {
      title: "Folder, path, dan direktori kerja",
      html: `<p>Setiap berkas punya alamat yang disebut <b>path</b>. Shell selalu sedang berada di satu folder, yang disebut <b>direktori kerja</b>. <code>Get-Location</code> (alias <code>pwd</code>) menampilkan folder itu, dan <code>Set-Location</code> (alias <code>cd</code>) memindahkanmu ke folder lain.</p>
<p>Path ada dua jenis:</p>
<ul><li><b>Path absolut</b> ditulis lengkap dari huruf drive, misalnya <code>C:\\Users\\budi\\latihan-dojo</code>. Hasilnya sama di mana pun direktori kerjamu.</li>
<li><b>Path relatif</b> dihitung dari direktori kerja. Tanda <code>.</code> berarti folder saat ini, dan <code>..</code> berarti folder induknya. Kalau direktori kerjamu <code>C:\\Windows</code>, path <code>.\\System</code> menunjuk <code>C:\\Windows\\System</code>, dan <code>..\\Program Files</code> menunjuk <code>C:\\Program Files</code>.</li></ul>
<p>Tanda <code>~</code> di awal path berarti folder pengguna (<i>home</i>), biasanya <code>C:\\Users\\&lt;nama&gt;</code>. Variabel <code>$HOME</code> berisi path yang sama.</p>
<p>Kesalahan umum:</p>
<ul><li>Path yang mengandung spasi harus diapit tanda kutip, misalnya <code>cd "C:\\Program Files"</code>. Tanpa kutip, PowerShell membaca <code>Files</code> sebagai argumen terpisah.</li>
<li>Path relatif di skrip yang dijalankan otomatis bergantung pada direktori kerja saat itu. Kalau direktori kerjanya berbeda, skrip membaca berkas yang salah atau tidak menemukan apa pun.</li></ul>
<p>PowerShell menerima <code>\\</code> maupun <code>/</code> sebagai pemisah folder. Program lain di Windows belum tentu menerima <code>/</code>, jadi di Windows pakai <code>\\</code>.</p>`,
      examples: [{ lang: "shell", code: "Get-Location\nSet-Location ~\nSet-Location ..\nGet-Location\nSet-Location ~", note: "Setelah <code>Set-Location ..</code> kamu berada di folder induk folder pengguna, biasanya <code>C:\\Users</code>. Baris terakhir membawamu kembali ke folder pengguna." }],
    },
    {
      title: "Melihat isi folder: Get-ChildItem",
      html: `<p><code>Get-ChildItem</code> menampilkan isi sebuah folder. Tanpa path, yang ditampilkan isi direktori kerja. Di Windows, aliasnya <code>ls</code>, <code>dir</code>, dan <code>gci</code>.</p>
<p>Hasilnya berupa tabel dengan kolom <code>Mode</code> (atribut item: <code>d</code> folder, <code>a</code> arsip atau <i>archive</i>, <code>r</code> hanya-baca, <code>h</code> tersembunyi), <code>LastWriteTime</code> (kapan terakhir diubah), <code>Length</code> (ukuran dalam byte), dan <code>Name</code>.</p>
<p>Tiga parameter yang sering dipakai:</p>
<ul><li><code>-Force</code> ikut menampilkan berkas tersembunyi.</li>
<li><code>-Recurse</code> ikut menampilkan isi semua subfolder.</li>
<li><code>-Filter</code> membatasi berdasarkan nama, misalnya <code>-Filter *.csv</code> untuk semua berkas berakhiran .csv.</li></ul>
<p>Hati-hati memakai <code>-Recurse</code> di folder besar seperti <code>C:\\</code>: hasilnya sangat panjang dan lama. Tekan Ctrl+C untuk menghentikan perintah yang sedang berjalan.</p>`,
      examples: [{ lang: "shell", code: "Get-ChildItem $HOME\nGet-ChildItem $HOME -Force\nGet-ChildItem $HOME\\Documents -Filter *.xlsx", note: "Bandingkan baris pertama dan kedua: <code>-Force</code> memunculkan berkas dan folder yang biasanya disembunyikan." }],
    },
    {
      title: "Membuat, menyalin, memindah, dan menghapus",
      html: `<p>Lima cmdlet untuk mengelola berkas dan folder:</p>
<div class="tw"><table class="t"><tr><th>Tujuan</th><th>Perintah</th><th>Catatan</th></tr>
<tr><td>Membuat folder atau berkas</td><td><code>New-Item -ItemType Directory</code> atau <code>-ItemType File</code></td><td>Dengan <code>-Force</code>, folder yang sudah ada dibiarkan; berkas yang sudah ada ditimpa menjadi kosong.</td></tr>
<tr><td>Menyalin</td><td><code>Copy-Item</code></td><td>Menyalin folder beserta isinya butuh <code>-Recurse</code>. Berkas di tujuan ditimpa tanpa bertanya.</td></tr>
<tr><td>Memindah</td><td><code>Move-Item</code></td><td>Kalau tujuan berisi nama baru, berkas sekaligus berganti nama.</td></tr>
<tr><td>Mengganti nama</td><td><code>Rename-Item</code></td><td>Hanya mengganti nama, tidak bisa memindah.</td></tr>
<tr><td>Menghapus</td><td><code>Remove-Item</code></td><td>Folder yang masih berisi butuh <code>-Recurse</code>; tanpa itu PowerShell bertanya dulu.</td></tr></table></div>
<p>Dokumentasi Microsoft menggolongkan <code>Remove-Item</code> sebagai perintah yang bisa membuat perubahan besar yang tidak bisa dibatalkan. Karena itu, biasakan dua kebiasaan aman:</p>
<ul><li>Jalankan dulu dengan <code>-WhatIf</code>. PowerShell hanya menulis apa yang <i>akan</i> dihapus, tanpa menghapus apa pun.</li>
<li>Pakai path absolut saat menghapus, supaya tidak salah folder karena direktori kerja yang berbeda dari dugaanmu.</li></ul>
<p>Contoh di bawah membuat folder latihan <code>latihan-dojo</code> di folder penggunamu. Folder ini dipakai di contoh dan soal berikutnya.</p>`,
      examples: [
        { lang: "shell", code: "New-Item -ItemType Directory -Path \"$HOME\\latihan-dojo\" -Force\nSet-Location \"$HOME\\latihan-dojo\"\nNew-Item -ItemType File -Path catatan.txt -Force\nCopy-Item catatan.txt catatan-cadangan.txt\nMove-Item catatan-cadangan.txt arsip-catatan.txt\nGet-ChildItem", note: "Hasil akhirnya dua berkas: <code>catatan.txt</code> dan <code>arsip-catatan.txt</code>. <code>Move-Item</code> di sini memindah ke folder yang sama dengan nama baru, jadi hasilnya sama dengan mengganti nama." },
        { lang: "shell", code: "Remove-Item \"$HOME\\latihan-dojo\\arsip-catatan.txt\" -WhatIf\nRemove-Item \"$HOME\\latihan-dojo\\arsip-catatan.txt\"", note: "Baris pertama hanya mencetak <code>What if: Performing the operation \"Remove File\" ...</code>. Baris kedua benar-benar menghapus. Folder latihan sendiri baru dihapus setelah semua soal bab ini selesai: keluar dulu dengan <code>Set-Location ~</code>, lalu jalankan <code>Remove-Item \"$HOME\\latihan-dojo\" -Recurse</code>." },
      ],
    },
    {
      title: "Membaca dan mencari isi berkas",
      html: `<p><code>Set-Content</code> menulis teks ke berkas dan menimpa isi lamanya. <code>Get-Content</code> (alias <code>cat</code>, <code>gc</code>, <code>type</code>) menampilkan isi berkas baris per baris. Untuk berkas besar, ambil sebagian saja: <code>-TotalCount 5</code> untuk 5 baris pertama, <code>-Tail 5</code> untuk 5 baris terakhir.</p>
<p><code>Select-String</code> mencari teks di dalam berkas, mirip <code>grep</code> di Linux. Untuk setiap baris yang cocok, hasilnya menampilkan nama berkas, nomor baris, dan isi baris itu, dipisah titik dua. Dua sifat bawaannya perlu diingat:</p>
<ul><li>Pencarian tidak membedakan huruf besar dan kecil. Tambahkan <code>-CaseSensitive</code> kalau perlu membedakan.</li>
<li>Pola dibaca sebagai <i>regular expression</i> (pola teks dengan tanda khusus, misalnya <code>.</code> berarti "satu karakter apa saja"). Tambahkan <code>-SimpleMatch</code> kalau kamu mencari teks apa adanya.</li></ul>
<p>Contoh berikut membuat <code>pesanan.csv</code> berisi enam pesanan pertama dari tabel <code>app.orders</code> TokoKita (order_id 100001 sampai 100006) dan kolom statusnya. Dari enam pesanan itu, hanya 100005 yang berstatus <code>cancelled</code>. <code>$baris = ...</code> menyimpan daftar teks ke variabel PowerShell bernama <code>$baris</code>; tanda koma memisahkan setiap baris.</p>`,
      examples: [{ lang: "shell", code: "Set-Location \"$HOME\\latihan-dojo\"\n$baris = \"order_id,status\", \"100001,completed\", \"100002,completed\", \"100003,completed\", \"100004,completed\", \"100005,cancelled\", \"100006,completed\"\nSet-Content -Path pesanan.csv -Value $baris\nGet-Content pesanan.csv -TotalCount 3\nSelect-String -Path pesanan.csv -Pattern \"cancelled\"", note: "Baris terakhir mencetak <code>pesanan.csv:6:100005,cancelled</code>: pesanan yang dibatalkan ada di baris ke-6 berkas, karena baris pertama berisi judul kolom." }],
    },
    {
      title: "Pipa: menyambung perintah",
      html: `<p><b>Pipa</b> (<code>|</code>) mengirim hasil perintah di kirinya ke perintah di kanannya. Perintah diproses dari kiri ke kanan, dan hasil perintah terakhir ditampilkan di layar.</p>
<p>Ada satu perbedaan penting dengan bash. Di bash, yang mengalir di pipa adalah teks. Di PowerShell, yang mengalir adalah <b>objek</b>: data yang punya sifat bernama (<i>property</i>), misalnya objek berkas punya <code>Name</code> dan <code>Length</code>. Karena itu kamu bisa menyaring berdasarkan sifat, tanpa memotong-motong teks.</p>
<p>Cmdlet yang paling sering dipakai di tengah pipa:</p>
<ul><li><code>Where-Object</code> menyaring objek, misalnya <code>Where-Object Length -GT 0</code> (ukuran lebih dari 0).</li>
<li><code>Select-Object</code> memilih sifat tertentu (<code>-Property Name, Length</code>) atau beberapa objek pertama (<code>-First 3</code>).</li>
<li><code>Measure-Object</code> menghitung jumlah objek yang masuk (<code>Count</code>).</li></ul>
<p>Urutan penting: saring dulu, baru pilih kolom. Kalau <code>Select-Object</code> sudah membuang sebuah sifat, <code>Where-Object</code> sesudahnya tidak bisa menyaring dengan sifat itu.</p>`,
      examples: [{ lang: "shell", code: "Set-Location \"$HOME\\latihan-dojo\"\nGet-Content pesanan.csv | Select-String \"completed\" | Measure-Object\nGet-ChildItem | Where-Object Length -GT 0 | Select-Object -Property Name, Length", note: "Baris kedua menghitung baris berisi <code>completed</code>: hasilnya <code>Count : 5</code>. Baris ketiga hanya menampilkan berkas yang isinya tidak kosong, misalnya <code>pesanan.csv</code>. <code>catatan.txt</code> berukuran 0 byte, jadi tidak ikut tampil." }],
    },
    {
      title: "Mengarahkan keluaran ke berkas",
      html: `<p>Tanda <code>&gt;</code> menyimpan keluaran perintah ke berkas dan menimpa isi lamanya tanpa peringatan. Tanda <code>&gt;&gt;</code> menambahkan keluaran di akhir berkas. Kalau berkasnya belum ada, keduanya membuat berkas baru.</p>
<p>Perhatikan <b>encoding</b> (cara teks disimpan sebagai byte). Di Windows PowerShell 5.1, <code>&gt;</code> dan <code>&gt;&gt;</code> menulis UTF-16LE. Di PowerShell 7, keduanya menulis UTF-8 tanpa BOM (penanda di awal berkas). Kalau berkasnya akan dibaca program lain yang mengharapkan UTF-8, jangan bergantung pada bawaan ini. Pakai <code>Out-File</code> dengan encoding yang ditulis jelas, misalnya <code>Out-File -FilePath hasil.txt -Encoding utf8</code>.</p>`,
      examples: [{ lang: "shell", code: "Set-Location \"$HOME\\latihan-dojo\"\n\"baris satu\" > log.txt\n\"baris dua\" >> log.txt\nGet-Content log.txt\nGet-ChildItem | Out-File -FilePath daftar.txt -Encoding utf8", note: "Jalankan tiga baris pertama dua kali: isi <code>log.txt</code> tetap dua baris, karena <code>&gt;</code> selalu memulai berkas dari kosong." }],
    },
    {
      title: "Variabel lingkungan dan PATH",
      html: `<p><b>Variabel lingkungan</b> adalah pasangan nama dan nilai teks yang dibawa setiap program. Program menerimanya dari program yang menjalankannya. Di PowerShell, variabel lingkungan dibaca dan diubah dengan awalan <code>$env:</code>, misalnya <code>$env:USERPROFILE</code>.</p>
<p>Variabel yang paling penting adalah <b>PATH</b>: daftar folder tempat sistem mencari program. Saat kamu mengetik <code>where.exe</code>, Windows mencarinya di folder-folder PATH satu per satu. Di Windows, folder dalam PATH dipisah titik koma (<code>;</code>); di Linux dan macOS dipisah titik dua (<code>:</code>). <code>Get-Command nama-program</code> memberi tahu di folder mana sebuah program ditemukan.</p>
<p>Mengubah variabel dengan <code>$env:NAMA = "nilai"</code> hanya berlaku di jendela PowerShell itu dan program yang dijalankan dari sana. Jendela baru tidak ikut berubah. Untuk perubahan permanen, pakai pengaturan Windows: System, Advanced system settings, tab Advanced, tombol Environment Variables. Kesalahan umum: baru memasang program, tetapi perintahnya "tidak dikenal" di jendela PowerShell yang sudah terbuka sejak sebelumnya, karena jendela itu masih memakai PATH lama. Tutup dan buka lagi jendelanya.</p>
<p>Data engineer memakai variabel lingkungan untuk menyimpan pengaturan seperti alamat server database, supaya nilai itu tidak ditulis langsung di dalam skrip.</p>`,
      examples: [{ lang: "shell", code: "$env:PATH -split ';' | Select-Object -First 3\nGet-Command where.exe\n$env:DOJO_LATIHAN = \"halo\"\n$env:DOJO_LATIHAN", note: "<code>-split ';'</code> memecah teks PATH di setiap titik koma, sehingga setiap folder tampil di barisnya sendiri. <code>Get-Command</code> menunjukkan bahwa <code>where.exe</code> ada di <code>C:\\Windows\\system32</code>." }],
    },
    {
      title: "Menjalankan program dan kode keluar",
      html: `<p>Program yang ada di folder PATH cukup dipanggil dengan namanya. Program atau skrip di direktori kerja harus diawali <code>.\\</code>, misalnya <code>.\\impor.ps1</code>. Ini fitur keamanan PowerShell: tanpa path, PowerShell tidak menjalankan berkas dari folder saat ini walaupun berkasnya ada. Kalau sebuah nama tidak ditemukan, PowerShell menampilkan error <code>The term '...' is not recognized as the name of a cmdlet, function, script file, or operable program</code>.</p>
<p>Setiap program mengembalikan <b>kode keluar</b> saat selesai. Nilai 0 berarti berhasil, angka lain berarti gagal. PowerShell menyimpan kode keluar program terakhir di <code>$LASTEXITCODE</code>. Variabel <code>$?</code> berisi <code>True</code> kalau perintah terakhir berhasil dan <code>False</code> kalau gagal.</p>
<p>Kode keluar penting untuk data engineer. Program yang menjalankan tugas otomatis pada jam tertentu tidak membaca pesan di layar. Program itu hanya melihat kode keluar untuk memutuskan apakah tugas berhasil. Satu hal yang sering terlewat: kalau program dari luar PowerShell gagal, PowerShell tidak menganggapnya error. Skripmu harus memeriksa <code>$LASTEXITCODE</code> sendiri, lalu keluar dengan <code>exit</code> dan angka bukan nol.</p>`,
      examples: [{ lang: "shell", code: "powershell.exe -NoProfile -Command \"exit 3\"\n$LASTEXITCODE\nwhere.exe powershell\n$LASTEXITCODE", note: "Baris pertama menjalankan PowerShell baru yang langsung keluar dengan kode 3, jadi <code>$LASTEXITCODE</code> berisi 3. <code>-NoProfile</code> membuatnya tidak memuat pengaturan pribadi, sehingga lebih cepat. <code>where.exe</code> menemukan programnya, jadi kode keluarnya 0." }],
    },
    {
      title: "Padanan bash di Linux",
      html: `<p>Di server Linux kamu akan bertemu shell lain, yaitu <b>bash</b> (shell bawaan sistem operasi GNU). Konsepnya sama dengan yang sudah kamu pelajari; nama perintahnya berbeda:</p>
<div class="tw"><table class="t"><tr><th>PowerShell</th><th>bash/Linux</th><th>Arti</th></tr>
<tr><td><code>Get-Location</code></td><td><code>pwd</code></td><td>tampilkan direktori kerja</td></tr>
<tr><td><code>Set-Location</code></td><td><code>cd</code></td><td>pindah folder; <code>cd</code> tanpa argumen kembali ke folder pengguna</td></tr>
<tr><td><code>Get-ChildItem -Force</code></td><td><code>ls -a</code></td><td>isi folder; di Linux, berkas yang namanya diawali titik disembunyikan tanpa <code>-a</code></td></tr>
<tr><td><code>New-Item -ItemType Directory</code></td><td><code>mkdir -p</code></td><td>buat folder</td></tr>
<tr><td><code>Copy-Item -Recurse</code>, <code>Move-Item</code>, <code>Remove-Item -Recurse</code></td><td><code>cp -r</code>, <code>mv</code>, <code>rm -r</code></td><td>salin, pindah, hapus</td></tr>
<tr><td><code>Get-Content -TotalCount 5</code></td><td><code>cat</code>, <code>head -n 5</code></td><td>baca isi berkas</td></tr>
<tr><td><code>Select-String</code></td><td><code>grep</code></td><td>cari teks; <code>grep</code> membedakan huruf besar dan kecil kecuali diberi <code>-i</code></td></tr>
<tr><td><code>$env:NAMA = "nilai"</code></td><td><code>export NAMA=nilai</code></td><td>atur variabel lingkungan untuk program yang dijalankan sesudahnya</td></tr>
<tr><td><code>$LASTEXITCODE</code></td><td><code>echo $?</code></td><td>kode keluar perintah terakhir</td></tr></table></div>
<p>Perbedaan yang paling sering membuat pemula tersandung:</p>
<ul><li>Linux membedakan huruf besar dan kecil di nama berkas: <code>Data.csv</code> dan <code>data.csv</code> adalah dua berkas berbeda.</li>
<li>Pemisah folder adalah <code>/</code>, dan path absolut diawali <code>/</code>, misalnya <code>/home/budi/latihan-dojo</code>.</li>
<li>Pipa bash mengirim teks, bukan objek.</li>
<li>Berkas skrip harus diberi izin jalan dulu dengan <code>chmod +x</code>. Bash mencari perintah tanpa garis miring hanya di folder PATH, jadi skrip di folder saat ini dijalankan dengan <code>./skrip.sh</code>.</li></ul>
<p>Contoh perintah yang sama dengan contoh <code>Select-String</code> sebelumnya, <b>untuk bash/Linux</b> (jangan dijalankan di PowerShell):</p>
<pre class="sh"><code>cd ~/latihan-dojo
grep -n cancelled pesanan.csv
cat pesanan.csv | grep completed &gt; selesai.txt
echo $?
chmod +x impor.sh
./impor.sh</code></pre>
<p><code>grep -n</code> menambahkan nomor baris di depan setiap baris yang cocok. Kode keluar <code>grep</code> adalah 0 kalau ada baris yang cocok, 1 kalau tidak ada, dan 2 kalau terjadi error.</p>`,
    },
    {
      title: "WSL: Linux di dalam Windows",
      html: `<p><b>WSL</b> (Windows Subsystem for Linux) menjalankan Linux langsung di Windows, tanpa memasang ulang laptop. Versi bawaannya, WSL 2, menjalankan kernel Linux asli (inti sistem operasi Linux) di dalam mesin virtual ringan yang dikelola Windows. Setiap Linux yang terpasang disebut <i>distribusi</i>, misalnya Ubuntu atau Debian.</p>
<p>Cara memasangnya: buka PowerShell sebagai administrator (klik kanan, Run as administrator), jalankan <code>wsl --install</code>, lalu nyalakan ulang laptop. Perintah itu menyalakan fitur yang dibutuhkan, menjadikan WSL 2 sebagai bawaan, dan memasang Ubuntu.</p>
<p>Dua perintah untuk memeriksa keadaannya:</p>
<ul><li><code>wsl --status</code>: distribusi bawaan, versi WSL bawaan, dan versi kernel.</li>
<li><code>wsl --list --verbose</code> (singkatnya <code>wsl -l -v</code>): daftar distribusi, apakah sedang berjalan, dan versi WSL masing-masing.</li></ul>
<p>Dari dalam Linux, drive <code>C:</code> terlihat sebagai <code>/mnt/c</code>. Akses berkas antarsistem seperti ini bisa jauh lebih lambat. Simpan berkas proyek di sistem berkas tempat alatnya berjalan: di <code>/home/&lt;nama&gt;/</code> kalau kamu memakai alat Linux, di <code>C:\\Users\\&lt;nama&gt;\\</code> kalau kamu memakai alat Windows.</p>`,
      examples: [{ lang: "shell", code: "wsl --status\nwsl --list --verbose", note: "Kalau WSL belum terpasang di laptopmu, kedua perintah ini belum bisa menampilkan informasi distribusi. Memasang WSL tidak wajib untuk bab ini." }],
    },
  ],
  tsql: [],
  summary: [
    "Terminal adalah jendela perintah; shell (PowerShell, bash) yang membaca dan menjalankan perintahnya. Windows 11 membawa Windows PowerShell 5.1; PowerShell 7 dipasang terpisah sebagai <code>pwsh.exe</code>.",
    "Cmdlet berpola Kata-kerja-Kata-benda, diikuti parameter berawalan <code>-</code> dan argumennya. <code>Get-Help</code>, <code>Get-Command</code>, dan tombol Tab membantu menemukan perintah.",
    "Path absolut ditulis lengkap dari drive; path relatif dihitung dari direktori kerja (<code>.</code> folder saat ini, <code>..</code> folder induk, <code>~</code> folder pengguna).",
    "<code>New-Item</code>, <code>Copy-Item</code>, <code>Move-Item</code>, <code>Rename-Item</code>, <code>Remove-Item</code> mengelola berkas. Sebelum menghapus, jalankan dengan <code>-WhatIf</code> dan pakai path absolut.",
    "<code>Get-Content</code> membaca berkas, <code>Select-String</code> mencari teks (tanpa membedakan huruf besar/kecil), dan pipa <code>|</code> mengalirkan objek ke perintah berikutnya.",
    "<code>&gt;</code> menimpa, <code>&gt;&gt;</code> menambah. Encoding bawaannya berbeda antara PowerShell 5.1 dan 7, jadi pakai <code>Out-File -Encoding utf8</code> untuk berkas data.",
    "<code>$env:NAMA</code> membaca dan mengatur variabel lingkungan untuk sesi itu saja. PATH berisi folder tempat program dicari, dipisah <code>;</code> di Windows dan <code>:</code> di Linux.",
    "Kode keluar 0 berarti berhasil. Di PowerShell lihat <code>$LASTEXITCODE</code>; di bash lihat <code>$?</code>. Bash membedakan huruf besar/kecil di nama berkas dan memakai <code>/</code>.",
    "WSL menjalankan Linux di Windows. Periksa dengan <code>wsl --status</code> dan <code>wsl -l -v</code>.",
  ],
  drills: [
    { id: "tools-01-01", kind: "choice", prompt: "Direktori kerjamu <code>C:\\Users\\budi\\proyek</code>. Berkas mana yang dibaca oleh <code>Get-Content .\\data\\pesanan.csv</code>?",
      options: ["C:\\data\\pesanan.csv", "C:\\Users\\budi\\proyek\\data\\pesanan.csv", "C:\\Users\\budi\\data\\pesanan.csv", "Tidak ada; Get-Content hanya menerima path absolut"], answer: 1,
      why: "<code>.\\</code> berarti direktori kerja, jadi path relatif itu disambung ke <code>C:\\Users\\budi\\proyek</code>. Get-Content menerima path absolut maupun relatif.",
      hint: "Titik di awal path berarti folder tempatmu sedang berada." },
    { id: "tools-01-02", kind: "paste", prompt: "Buka PowerShell, jalankan perintah berikut, lalu tempel seluruh keluarannya. Dari angka di kolom <code>Major</code>, kamu tahu sedang memakai Windows PowerShell 5.1 atau PowerShell 7.",
      command: "$PSVersionTable.PSVersion",
      expect: "^\\s*Major\\s+Minor[\\s\\S]*?^\\s*[57]\\s+\\d+\\s+\\d+",
      sampleOutput: "\nMajor  Minor  Build  Revision\n-----  -----  -----  --------\n5      1      26100  7705\n",
      why: "Windows PowerShell 5.1 menampilkan Major 5 dan Minor 1. PowerShell 7 menampilkan Major 7. Perintah di bab ini jalan di keduanya.",
      hint: "Ketik perintahnya persis, termasuk tanda <code>$</code> di depan, lalu tekan Enter." },
    { id: "tools-01-03", kind: "paste", prompt: "Tampilkan direktori kerjamu dengan <code>Get-Location</code>, lalu tempel keluarannya.",
      command: "Get-Location",
      expect: "^\\s*Path\\s*$[\\s\\S]*?^\\s*-{4}\\s*$[\\s\\S]*?^\\s*[a-z]:\\\\",
      sampleOutput: "\nPath\n----\nC:\\Users\\budi\n\n",
      why: "Get-Location mengembalikan objek lokasi dengan sifat <code>Path</code>, yaitu path absolut direktori kerjamu. Path yang tampil bergantung pada folder tempat PowerShell dibuka. Alias <code>pwd</code> memberi hasil yang sama.",
      hint: "Hasilnya berupa judul <code>Path</code>, garis, lalu path absolut yang diawali huruf drive." },
    { id: "tools-01-04", kind: "paste", prompt: "Buat folder latihan di folder penggunamu, masuk ke dalamnya, buat berkas kosong <code>catatan.txt</code>, lalu tampilkan isi folder. Tempel seluruh keluarannya. Folder ini dipakai di soal-soal berikutnya.",
      command: "New-Item -ItemType Directory -Path \"$HOME\\latihan-dojo\" -Force\nSet-Location \"$HOME\\latihan-dojo\"\nNew-Item -ItemType File -Path catatan.txt -Force\nGet-ChildItem",
      expect: "latihan-dojo[\\s\\S]*Mode\\s+LastWriteTime[\\s\\S]*catatan\\.txt",
      sampleOutput: "\n    Directory: C:\\Users\\budi\n\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----        11/26/2026  10:15 AM                latihan-dojo\n\n\n    Directory: C:\\Users\\budi\\latihan-dojo\n\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----        11/26/2026  10:15 AM              0 catatan.txt\n\n\n    Directory: C:\\Users\\budi\\latihan-dojo\n\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----        11/26/2026  10:15 AM              0 catatan.txt\n",
      why: "New-Item mencetak item yang baru dibuat. <code>-Force</code> membuat perintah ini aman diulang: folder yang sudah ada dibiarkan, dan catatan.txt dibuat ulang sebagai berkas kosong. Get-ChildItem terakhir membuktikan berkasnya ada di folder latihan.",
      hint: "Salin keempat baris sekaligus. Kalau muncul tulisan merah, baca baris pertamanya: biasanya ada tanda kutip yang hilang." },
    { id: "tools-01-05", kind: "choice", prompt: "Kamu ingin menghapus folder <code>C:\\Users\\budi\\arsip-lama</code> beserta isinya, tetapi ingin melihat dulu apa saja yang akan terhapus. Perintah mana yang paling aman dijalankan pertama kali?",
      options: ["Remove-Item C:\\Users\\budi\\arsip-lama -Recurse -Force", "Remove-Item C:\\Users\\budi\\arsip-lama -Recurse -WhatIf", "Remove-Item .\\arsip-lama", "Get-Content C:\\Users\\budi\\arsip-lama -Recurse"], answer: 1,
      why: "<code>-WhatIf</code> hanya mencetak apa yang akan dihapus tanpa menghapus apa pun, dan path absolut memastikan folder yang dituju benar. <code>-Force</code> justru menghapus juga berkas tersembunyi dan hanya-baca. Path relatif bergantung pada direktori kerja. Get-Content membaca isi berkas, bukan daftar isi folder.",
      hint: "Cari parameter yang membuat perintah hanya \"berandai-andai\"." },
    { id: "tools-01-06", kind: "paste", prompt: "Di folder latihan, buat <code>pesanan.csv</code> berisi enam pesanan pertama TokoKita, lalu cari baris yang berisi <code>cancelled</code>. Tempel keluarannya.",
      command: "Set-Location \"$HOME\\latihan-dojo\"\n$baris = \"order_id,status\", \"100001,completed\", \"100002,completed\", \"100003,completed\", \"100004,completed\", \"100005,cancelled\", \"100006,completed\"\nSet-Content -Path pesanan.csv -Value $baris\nSelect-String -Path pesanan.csv -Pattern \"cancelled\"",
      expect: "pesanan\\.csv:6:100005,cancelled",
      sampleOutput: "\npesanan.csv:6:100005,cancelled\n\n",
      why: "Select-String mencetak nama berkas, nomor baris, dan isi baris, dipisah titik dua. Pesanan 100005 ada di baris ke-6 karena baris pertama berisi judul kolom.",
      hint: "Kalau muncul error \"Cannot find path\", kerjakan dulu soal pembuatan folder <code>latihan-dojo</code>." },
    { id: "tools-01-07", kind: "paste", prompt: "Pakai pipa untuk menghitung berapa baris <code>pesanan.csv</code> yang berisi <code>completed</code>. Tempel keluarannya.",
      command: "Set-Location \"$HOME\\latihan-dojo\"\nGet-Content pesanan.csv | Select-String \"completed\" | Measure-Object",
      expect: "^\\s*Count\\s*:\\s*5\\s*$",
      sampleOutput: "\n\nCount    : 5\nAverage  :\nSum      :\nMaximum  :\nMinimum  :\nProperty :\n\n",
      why: "Get-Content mengirim setiap baris ke Select-String, yang hanya meneruskan baris berisi \"completed\". Measure-Object menghitung objek yang sampai kepadanya: 5 dari 6 pesanan berstatus completed.",
      hint: "Butuh berkas pesanan.csv dari soal sebelumnya. Hasil yang dicari ada di baris <code>Count</code>." },
    { id: "tools-01-08", kind: "paste", prompt: "Tulis dua baris ke <code>log.txt</code>, yang pertama dengan <code>&gt;</code> dan yang kedua dengan <code>&gt;&gt;</code>, lalu tampilkan isinya. Tempel keluarannya. Coba jalankan dua kali dan perhatikan isinya tetap dua baris.",
      command: "Set-Location \"$HOME\\latihan-dojo\"\n\"baris satu\" > log.txt\n\"baris dua\" >> log.txt\nGet-Content log.txt",
      expect: "^\\s*baris satu\\s*$\\s*^\\s*baris dua\\s*$",
      sampleOutput: "baris satu\nbaris dua\n",
      why: "<code>&gt;</code> menimpa isi berkas, sehingga setiap kali dijalankan berkas dimulai dari kosong. <code>&gt;&gt;</code> menambahkan baris di akhir. Kalau baris pertama juga memakai <code>&gt;&gt;</code>, berkas akan bertambah panjang setiap kali perintah diulang.",
      hint: "Tempel hasil Get-Content saja sudah cukup." },
    { id: "tools-01-09", kind: "choice", prompt: "Kamu masuk ke server Linux dengan bash. Perintah mana yang padanan dari <code>Get-Content app.log | Select-String \"ERROR\"</code>?",
      options: ["cat app.log | grep ERROR", "ls app.log &gt; grep ERROR", "cat app.log &gt; grep ERROR", "export app.log | grep ERROR"], answer: 0,
      why: "<code>cat</code> mencetak isi berkas dan pipa mengirimnya ke <code>grep</code>, yang menyaring baris. Tanda <code>&gt;</code> justru menulis keluaran ke berkas bernama \"grep\". Satu perbedaan: grep membedakan huruf besar dan kecil, sedangkan Select-String tidak; padanan yang persis adalah <code>grep -i ERROR</code>.",
      hint: "Cari pasangan \"baca berkas\" dan \"cari teks\" yang disambung pipa." },
    { id: "tools-01-10", kind: "paste", prompt: "Tampilkan tiga folder pertama di PATH-mu, satu per baris. Tempel keluarannya.",
      command: "$env:PATH -split ';' | Select-Object -First 3",
      expect: "^\\s*[a-z]:\\\\[^\\r\\n]*$",
      sampleOutput: "C:\\Windows\\system32\nC:\\Windows\\\nC:\\Windows\\System32\\Wbem\n",
      why: "PATH di Windows adalah satu teks panjang berisi folder yang dipisah titik koma. <code>-split ';'</code> memecahnya, dan <code>Select-Object -First 3</code> mengambil tiga yang pertama. Windows mencari program di folder-folder ini, berurutan.",
      hint: "Isi PATH berbeda di setiap laptop. Yang penting setiap baris berisi path folder yang diawali huruf drive." },
    { id: "tools-01-11", kind: "paste", prompt: "Atur variabel lingkungan <code>DOJO_LATIHAN</code>, lalu jalankan PowerShell baru dari jendela yang sama untuk membacanya. Tempel keluarannya.",
      command: "$env:DOJO_LATIHAN = \"halo-dari-induk\"\npowershell.exe -NoProfile -Command '$env:DOJO_LATIHAN'",
      expect: "^\\s*halo-dari-induk\\s*$",
      sampleOutput: "halo-dari-induk\n",
      why: "PowerShell kedua adalah program yang dijalankan dari jendela pertama, jadi ia mewarisi variabel lingkungan jendela pertama. Tanda kutip tunggal membuat <code>$env:DOJO_LATIHAN</code> dikirim apa adanya dan baru dibaca oleh PowerShell kedua. Jendela PowerShell lain yang dibuka dari menu Start tidak punya variabel ini.",
      hint: "Jalankan kedua baris di jendela yang sama." },
    { id: "tools-01-12", kind: "choice", prompt: "Di jendela PowerShell A kamu menjalankan <code>$env:DB_HOST = \"localhost\"</code>. Lalu kamu membuka jendela PowerShell B dari menu Start dan menjalankan <code>$env:DB_HOST</code>. Apa hasilnya di jendela B?",
      options: ["localhost", "Kosong, karena perubahan $env: hanya berlaku di jendela A dan program yang dijalankan dari sana", "Error, karena DB_HOST hanya bisa dibaca administrator", "localhost, tetapi baru setelah laptop dinyalakan ulang"], answer: 1,
      why: "Perubahan lewat <code>$env:</code> hanya berlaku di sesi PowerShell itu. Jendela B dibuka dari menu Start, bukan dari jendela A, jadi tidak mewarisinya. Untuk perubahan permanen, pakai pengaturan Environment Variables di Windows.",
      hint: "Ingat dari mana sebuah program menerima variabel lingkungannya." },
    { id: "tools-01-13", kind: "paste", prompt: "Jalankan PowerShell baru yang langsung keluar dengan kode 3, lalu tampilkan kode keluarnya. Tempel keluarannya.",
      command: "powershell.exe -NoProfile -Command \"exit 3\"\n$LASTEXITCODE",
      expect: "^\\s*3\\s*$",
      sampleOutput: "3\n",
      why: "<code>exit 3</code> membuat PowerShell kedua selesai dengan kode keluar 3, dan PowerShell pertama menyimpannya di <code>$LASTEXITCODE</code>. Kode bukan nol berarti gagal; inilah yang dibaca program penjadwal untuk tahu sebuah tugas gagal.",
      hint: "Baris pertama tidak mencetak apa pun. Angka muncul dari baris kedua." },
    { id: "tools-01-14", kind: "choice", prompt: "Kamu memakai alat Linux di WSL untuk mengolah ribuan berkas CSV. Di mana sebaiknya berkas-berkas itu disimpan?",
      options: ["Di /mnt/c/Users/&lt;nama&gt;/proyek, supaya mudah dibuka dari Windows", "Di sistem berkas Linux, misalnya /home/&lt;nama&gt;/proyek", "Di mana saja, kecepatannya sama", "Di C:\\Windows\\System32, supaya masuk PATH"], answer: 1,
      why: "Dokumentasi WSL menyarankan menyimpan berkas di sistem berkas tempat alatnya berjalan. Alat Linux yang membaca <code>/mnt/c</code> (drive C: dari dalam Linux) bisa jauh lebih lambat. System32 adalah folder sistem Windows dan bukan tempat data.",
      hint: "Akses antarsistem berkas adalah bagian yang lambat." },
    { id: "tools-01-15", kind: "explain", prompt: "Jelaskan dengan kalimatmu sendiri beda path absolut dan path relatif. Lalu jelaskan kenapa skrip yang dijalankan otomatis setiap malam sebaiknya tidak bergantung pada path relatif.",
      model: "Path absolut ditulis lengkap dari huruf drive, misalnya C:\\data\\pesanan.csv, dan selalu menunjuk berkas yang sama. Path relatif, misalnya .\\pesanan.csv, dihitung dari direktori kerja, jadi artinya berubah kalau direktori kerjanya berubah. Skrip otomatis bisa dijalankan dari direktori kerja yang berbeda dengan saat kamu mengujinya. Akibatnya skrip bisa membaca berkas yang salah atau tidak menemukan berkas sama sekali. Karena itu skrip sebaiknya memakai path absolut, atau di awal skrip berpindah dulu ke folder yang benar dengan Set-Location.",
      hint: "Pikirkan: path relatif dihitung dari mana, dan apakah titik awal itu selalu sama?" },
    { id: "tools-01-16", kind: "explain", level: "wawancara",
      prompt: "Pertanyaan wawancara: \"Skrip PowerShell harian kami memanggil program impor data. Kemarin programnya gagal, tetapi penjadwal tugas mencatat skripnya berhasil. Apa kemungkinan penyebabnya, dan bagaimana kamu memperbaikinya?\"",
      model: "Program impor itu program dari luar PowerShell. Kalau program seperti itu gagal, ia mengembalikan kode keluar bukan nol, tetapi PowerShell tidak menganggapnya error dan tetap lanjut ke baris berikutnya. Kalau perintah terakhir skrip berhasil, skrip selesai dengan kode 0, sehingga penjadwal mencatatnya berhasil. Perbaikannya: setelah memanggil program, periksa $LASTEXITCODE. Kalau tidak 0, tulis pesan error yang jelas lalu hentikan skrip dengan exit dan kode bukan nol, misalnya exit $LASTEXITCODE. Dengan begitu penjadwal tahu tugasnya gagal dan bisa memberi peringatan. Saya juga akan menguji ini dengan sengaja membuat program gagal dan memastikan penjadwal mencatatnya gagal.",
      hint: "Bagaimana penjadwal tahu sebuah tugas gagal, dan apakah PowerShell otomatis berhenti saat program luar gagal?" },
  ],
};
