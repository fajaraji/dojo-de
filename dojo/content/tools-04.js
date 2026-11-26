// Bab 4 Bagian 3: PostgreSQL 18 dan SQL Server 2025 di laptop lewat Docker, psql, sqlcmd, SSMS, dan memuat data TokoKita.
export default {
  id: "tools-04",
  part: "tools",
  title: "PostgreSQL dan SQL Server di laptop",
  minutes: 90,
  goals: [
    "Menjalankan PostgreSQL 18 di Docker dengan volume, lalu memakainya lewat <code>psql</code>.",
    "Memuat data TokoKita ke PostgreSQL dan SQL Server di laptopmu sendiri.",
    "Menjalankan SQL Server 2025 di Docker dan memakainya lewat <code>sqlcmd</code> dan SSMS.",
    "Menjalankan ulang latihan T-SQL dari Bagian 1 (TOP, CHARINDEX, ISNULL, DATEADD, MERGE) di SQL Server sungguhan dan mengenali perbedaan dialeknya.",
    "Memakai password contoh dengan aman: hanya di laptop, port hanya untuk laptop sendiri, dan tidak pernah di produksi.",
  ],
  terms: [
    { term: "server database", def: "Program yang terus berjalan, menyimpan data di disk, dan melayani perintah SQL dari program lain lewat jaringan, misalnya PostgreSQL atau SQL Server." },
    { term: "klien database", def: "Program yang terhubung ke server database untuk mengirim perintah SQL dan menampilkan hasilnya, misalnya psql, sqlcmd, SSMS, atau DBeaver." },
    { term: "psql", def: "Klien baris perintah resmi PostgreSQL. Selain SQL, psql mengenal perintah meta yang diawali garis miring terbalik, misalnya <code>\\dt</code>." },
    { term: "sqlcmd", def: "Klien baris perintah SQL Server. Ada dua varian: sqlcmd (ODBC) yang sudah ada di dalam image SQL Server, dan sqlcmd (Go) yang bisa dipasang sendiri di Windows." },
    { term: "SSMS", def: "<i>SQL Server Management Studio</i>: aplikasi Windows gratis dari Microsoft untuk mengelola SQL Server dan menulis query T-SQL dengan tampilan grafis." },
  ],
  introduces: [],
  sections: [
    {
      title: "Kenapa latihan di laptop",
      html: `<p>Selama Bagian 1 dan 2, query-mu dijalankan oleh mesin latihan di browser. Mesin itu PostgreSQL sungguhan, tapi lingkungannya disederhanakan: tidak ada password, tidak ada jaringan, dan setiap jawaban otomatis dibatalkan.</p>
<p>Di tempat kerja, database berjalan sebagai <b>server database</b>: program yang terus menyala, menyimpan data di disk, dan menunggu perintah dari jaringan. Kamu terhubung ke server itu memakai <b>klien database</b>, yaitu program yang mengirim SQL lalu menampilkan hasilnya. Untuk terhubung, kamu butuh alamat server, <i>port</i> (nomor pintu jaringan yang didengarkan server), nama pengguna, dan password.</p>
<p>Di bab ini kamu menyalakan dua server di laptop memakai Docker: PostgreSQL 18 dan SQL Server 2025, lalu memuat data TokoKita yang sama ke keduanya. Hasilnya, query T-SQL dari bagian "Di SQL Server" di setiap bab bisa kamu coba langsung.</p>
<p>Kaitannya dengan DP-700: Warehouse di Microsoft Fabric mendukung T-SQL penuh, dan bisa dibuka dengan SSMS memakai <i>SQL connection string</i> (alamat koneksi) dari Fabric. Jadi kebiasaan memakai sqlcmd dan SSMS di laptop terbawa ke Fabric.</p>`,
      examples: [{ sql: "select count(*) as jumlah_pesanan\nfrom app.orders;", note: "Di mesin latihan hasilnya 12007. Setelah data dimuat, query yang sama di laptopmu, baik di PostgreSQL maupun di SQL Server, harus memberi angka yang sama." }],
    },
    {
      title: "PostgreSQL 18 di Docker",
      html: `<p>Image resmi <code>postgres</code> di Docker Hub hanya mewajibkan satu pengaturan: <code>POSTGRES_PASSWORD</code>, yaitu password untuk pengguna utama <code>postgres</code>. Nilainya tidak boleh kosong.</p>
<p>Pakai tag <code>postgres:18</code>, bukan <code>postgres</code> saja. Tanpa tag, Docker memakai tag <code>latest</code>, yang menurut daftar tag resmi sekarang sudah menunjuk ke PostgreSQL 19. Kursus ini memakai PostgreSQL 18.</p>
<p><b>Volume untuk PostgreSQL 18 berbeda dari versi lama.</b> Mulai versi 18, image ini menyimpan data di <code>/var/lib/postgresql/18/docker</code>, dan dokumentasinya meminta volume dipasang di <code>/var/lib/postgresql</code>. Banyak tutorial lama memasang volume di <code>/var/lib/postgresql/data</code>. Itu cara untuk versi 17 ke bawah. Kalau kamu memakai cara lama di versi 18, data tidak tersimpan di volume yang kamu maksud.</p>
<p>Dua hal lain di perintah di bawah:</p>
<ul><li><code>-p 127.0.0.1:5432:5432</code> membuka port 5432 hanya untuk laptopmu sendiri. Tanpa <code>127.0.0.1:</code>, Docker membuka port itu di semua alamat jaringan laptop, sehingga komputer lain di jaringan yang sama bisa mencoba masuk.</li>
<li>Tanda <code>\`</code> (<i>backtick</i>) di akhir baris memberi tahu PowerShell bahwa perintahnya berlanjut ke baris berikutnya. Jangan ada spasi sesudahnya.</li></ul>
<p>Pengaturan <code>POSTGRES_PASSWORD</code> hanya berlaku saat volume masih kosong. Kalau volume <code>pgdata</code> sudah berisi database, password lama tetap dipakai.</p>`,
      examples: [{ lang: "shell", code: "docker run -d --name pg18 `\n  -e POSTGRES_PASSWORD=contoh-pg-laptop `\n  -p 127.0.0.1:5432:5432 `\n  -v pgdata:/var/lib/postgresql `\n  postgres:18\n\ndocker ps", note: "docker ps harus menampilkan container pg18. Volume pgdata dibuat otomatis kalau belum ada. Password di sini hanya contoh untuk laptop." }],
    },
    {
      title: "psql: klien baris perintah PostgreSQL",
      html: `<p><b>psql</b> sudah ada di dalam image <code>postgres</code>, jadi kamu tidak perlu memasangnya di Windows. Jalankan psql di dalam container dengan <code>docker exec -it</code>. Opsi <code>-i</code> membuat input dari keyboard tetap tersambung, dan <code>-t</code> menyediakan layar terminal untuk program itu.</p>
<p>Dari dalam container, psql tidak meminta password. Image ini memakai autentikasi <i>trust</i> untuk koneksi lokal di dalam container. Koneksi dari luar container, misalnya dari aplikasi GUI di Windows, tetap wajib memakai password.</p>
<p>Di prompt psql, perintah SQL baru dikirim ke server setelah kamu mengetik titik koma. Selain SQL, psql mengenal <b>perintah meta</b> yang diawali garis miring terbalik:</p>
<div class="tw"><table class="t"><tr><th>Perintah</th><th>Isi</th></tr>
<tr><td><code>\\l</code></td><td>daftar database</td></tr>
<tr><td><code>\\dn</code></td><td>daftar skema buatan pengguna</td></tr>
<tr><td><code>\\dt app.*</code></td><td>daftar tabel di skema <code>app</code></td></tr>
<tr><td><code>\\d app.orders</code></td><td>kolom, tipe, NOT NULL, primary key, dan foreign key satu tabel</td></tr>
<tr><td><code>\\q</code></td><td>keluar dari psql</td></tr></table></div>
<p>Pola seperti <code>app.*</code> bisa dipakai di semua perintah <code>\\d</code>. Huruf di pola diubah menjadi huruf kecil, sama seperti nama di SQL.</p>
<p>Untuk menjalankan satu perintah tanpa masuk ke prompt, pakai <code>-c</code>. Untuk menjalankan isi berkas, pakai <code>-f</code>. Dengan keduanya, psql langsung selesai setelah perintahnya jalan.</p>`,
      examples: [{ lang: "shell", code: "docker exec -it pg18 psql -U postgres\n\n# di prompt postgres=# ketik:\n#   \\l\n#   select version();\n#   \\q", note: "Prompt postgres=# menunjukkan nama database yang sedang dipakai. Baris berawalan # adalah komentar PowerShell, jangan disalin ke prompt." }],
    },
    {
      title: "Memuat data TokoKita ke PostgreSQL",
      html: `<p>Data TokoKita tersedia sebagai berkas SQL berisi perintah <code>create schema</code>, <code>create table</code>, dan <code>insert</code> untuk semua tabel di skema <code>app</code> dan <code>raw</code>. Isinya dibuat dari data yang sama dengan mesin latihan.</p>
<p>Unduh <a href="data/tokokita-postgres.sql" download>tokokita-postgres.sql</a> ke folder Downloads. Di PowerShell, <code>$HOME</code> berisi folder pengguna Windows-mu, biasanya <code>C:\\Users\\&lt;nama&gt;</code>, jadi lokasi berkasnya <code>$HOME\\Downloads\\tokokita-postgres.sql</code>.</p>
<p>Langkahnya:</p>
<ol><li>Buat database kosong bernama <code>tokokita</code>.</li>
<li>Salin berkas ke dalam container dengan <code>docker cp</code>.</li>
<li>Jalankan berkas itu dengan psql.</li></ol>
<p>Dua opsi menjaga pemuatan tetap bersih:</p>
<ul><li><code>-v ON_ERROR_STOP=1</code> membuat psql berhenti di error pertama. Tanpa itu, psql meneruskan perintah berikutnya, dan hasilnya database yang terisi sebagian.</li>
<li><code>-1</code> membungkus seluruh isi berkas dalam satu transaksi. Kalau ada yang gagal, semuanya dibatalkan, dan kamu tinggal memperbaiki lalu mengulang.</li></ul>
<p>Selama berjalan, psql mencetak satu baris untuk setiap perintah, misalnya <code>CREATE TABLE</code> atau <code>INSERT 0 1000</code>. Angka terakhir di baris INSERT adalah jumlah baris yang dimasukkan.</p>`,
      examples: [{ lang: "shell", code: "docker exec pg18 psql -U postgres -c \"create database tokokita\"\n\ndocker cp \"$HOME\\Downloads\\tokokita-postgres.sql\" pg18:/tmp/tokokita-postgres.sql\n\ndocker exec pg18 psql -U postgres -d tokokita -v ON_ERROR_STOP=1 -1 -f /tmp/tokokita-postgres.sql\n\ndocker exec pg18 psql -U postgres -d tokokita -c \"\\dn\"", note: "Setelah selesai, \\dn menampilkan skema app dan raw (ditambah public, skema bawaan setiap database). Di sini docker exec tidak memakai -it karena tidak ada yang perlu diketik." }],
    },
    {
      title: "SQL Server 2025 di Docker",
      html: `<p>Microsoft menerbitkan image SQL Server untuk Linux di <code>mcr.microsoft.com/mssql/server</code>. Versi terbaru di panduan resminya adalah SQL Server 2025, dengan tag <code>2025-latest</code>. Tanpa pengaturan edisi, container ini memakai edisi Developer. Menurut dokumentasinya, edisi Developer berisi semua fitur edisi Enterprise, tetapi lisensinya hanya untuk pengembangan dan pengujian, bukan untuk server produksi.</p>
<p>Dua pengaturan wajib:</p>
<ul><li><code>ACCEPT_EULA=Y</code>: menyatakan kamu menerima lisensi penggunanya.</li>
<li><code>MSSQL_SA_PASSWORD</code>: password untuk <code>sa</code>, akun administrator bawaan SQL Server. Nama lama <code>SA_PASSWORD</code> sudah tidak dianjurkan.</li></ul>
<p>Password <code>sa</code> harus memenuhi aturan password SQL Server: minimal 8 karakter, dan berisi karakter dari tiga di antara empat kelompok: huruf besar, huruf kecil, angka, dan simbol. Kalau aturan ini tidak dipenuhi, container tidak bisa menyiapkan SQL Server lalu berhenti.</p>
<p>Di PowerShell, jangan memakai tanda <code>$</code> di password yang ditulis di antara tanda kutip ganda. PowerShell menganggap <code>$</code> sebagai awal nama variabel dan menggantinya dengan isi variabel itu.</p>
<p>Data SQL Server disimpan di <code>/var/opt/mssql</code>, jadi volume dipasang di sana. Volume bernama tetap ada walaupun container dihapus. Kalau kamu membuat container baru dengan volume lama, SQL Server memakai password <code>sa</code> yang tersimpan di volume, bukan nilai <code>MSSQL_SA_PASSWORD</code> yang baru.</p>
<p>Setelah <code>docker run</code>, tunggu sebentar. Server baru siap menerima koneksi setelah lognya menulis <code>SQL Server is now ready for client connections</code>. Kalau sqlcmd gagal masuk tepat setelah container dinyalakan, tunggu beberapa saat lalu ulangi.</p>`,
      examples: [{ lang: "shell", code: "docker run -d --name sql1 --hostname sql1 `\n  -e \"ACCEPT_EULA=Y\" `\n  -e \"MSSQL_SA_PASSWORD=Contoh#Laptop2025\" `\n  -p 127.0.0.1:1433:1433 `\n  -v sqldata:/var/opt/mssql `\n  mcr.microsoft.com/mssql/server:2025-latest\n\ndocker ps", note: "Kolom STATUS untuk sql1 harus berisi Up. Kalau berisi Exited, baca pesan errornya dengan docker logs sql1. Password yang tidak memenuhi aturan adalah salah satu penyebabnya." }],
    },
    {
      title: "sqlcmd: klien baris perintah SQL Server",
      html: `<p>Ada dua varian <b>sqlcmd</b>:</p>
<ul><li><b>sqlcmd (ODBC)</b> sudah ada di dalam image SQL Server, di <code>/opt/mssql-tools18/bin/sqlcmd</code>. Kamu tidak perlu memasang apa pun.</li>
<li><b>sqlcmd (Go)</b> bisa dipasang di Windows dengan <code>winget install sqlcmd</code>, lalu dijalankan langsung dari PowerShell, misalnya <code>sqlcmd -S localhost,1433 -U sa</code>. Perhatikan: SQL Server menulis port setelah koma, bukan titik dua.</li></ul>
<p>sqlcmd (ODBC) versi 18 aman secara bawaan: koneksi wajib dienkripsi dan sertifikat server diperiksa. SQL Server di container memakai sertifikat buatannya sendiri yang tidak dikenal laptopmu, sehingga pemeriksaan itu gagal. Opsi <code>-C</code> membuat sqlcmd memercayai sertifikat server tanpa memeriksanya. Pakai hanya untuk server latihan di laptop; dokumentasi Microsoft memperingatkan bahwa cara ini membuka celah penyadapan, jadi jangan dipakai untuk server sungguhan.</p>
<p>Opsi yang paling sering dipakai:</p>
<div class="tw"><table class="t"><tr><th>Opsi</th><th>Arti</th></tr>
<tr><td><code>-S localhost</code></td><td>alamat server (tambahkan <code>,port</code> kalau bukan 1433)</td></tr>
<tr><td><code>-U sa</code></td><td>nama login. Tanpa <code>-P</code>, sqlcmd menanyakan password, sehingga password tidak tertulis di perintah</td></tr>
<tr><td><code>-d tokokita</code></td><td>database yang dipakai</td></tr>
<tr><td><code>-Q "…"</code></td><td>jalankan query lalu keluar. Jangan menulis GO di sini</td></tr>
<tr><td><code>-i berkas.sql</code></td><td>jalankan isi berkas</td></tr>
<tr><td><code>-b</code></td><td>berhenti kalau ada error</td></tr></table></div>
<p>Tanpa <code>-Q</code> dan <code>-i</code>, sqlcmd membuka prompt <code>1&gt;</code>. Berbeda dengan psql, perintah di prompt sqlcmd baru dikirim ke server setelah kamu mengetik <code>GO</code> di baris sendiri. Keluar dengan <code>EXIT</code> atau <code>QUIT</code>.</p>`,
      examples: [{ lang: "shell", code: "docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -Q \"SELECT @@VERSION\"", note: "sqlcmd menanyakan password sa. Keluarannya diawali Microsoft SQL Server 2025 dan menyebut edisi Developer on Linux." }],
    },
    {
      title: "Memuat data TokoKita ke SQL Server",
      html: `<p>Unduh <a href="data/tokokita-sqlserver.sql" download>tokokita-sqlserver.sql</a>. Berkas ini membuat database <code>tokokita</code>, skema <code>app</code> dan <code>raw</code>, lalu tabel yang sama dengan versi PostgreSQL, dengan tipe data T-SQL: <code>nvarchar</code> untuk teks, <code>datetime2</code> untuk tanggal dan jam, dan <code>bit</code> untuk benar/salah. Isinya dibagi menjadi beberapa <i>batch</i> (kelompok perintah) yang dipisahkan GO.</p>
<p>Caranya mirip PostgreSQL: salin berkas ke container, lalu jalankan dengan <code>-i</code>. Opsi <code>-b</code> menghentikan proses di error pertama.</p>
<p>Akibat tipe <code>bit</code>: kolom <code>is_active</code> di <code>app.products</code> tampil sebagai 1 atau 0, dan filternya ditulis <code>where is_active = 1</code>, bukan <code>where is_active</code>.</p>`,
      examples: [{ lang: "shell", code: "docker cp \"$HOME\\Downloads\\tokokita-sqlserver.sql\" sql1:/tmp/tokokita-sqlserver.sql\n\ndocker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -b -i /tmp/tokokita-sqlserver.sql\n\ndocker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -d tokokita -Q \"SELECT COUNT(*) AS jumlah_pesanan FROM app.orders\"", note: "Perintah terakhir harus mencetak 12007, sama dengan PostgreSQL." }],
    },
    {
      title: "Latihan T-SQL Bagian 1 di SQL Server sungguhan",
      html: `<p>Sekarang jalankan padanan T-SQL dari Bagian 1 dan bandingkan dengan hasil PostgreSQL di mesin latihan.</p>
<p><b>TOP.</b> <code>SELECT TOP (3) order_id, order_ts FROM app.orders ORDER BY order_ts DESC</code> memberi pesanan 112007, 112006, dan 112005, sama dengan <code>LIMIT 3</code> di PostgreSQL. Tanpa ORDER BY, dokumentasi menyatakan TOP mengambil baris dalam urutan yang tidak tentu.</p>
<p><b>CHARINDEX.</b> <code>CHARINDEX('@', email)</code> memberi posisi huruf @, dimulai dari 1, dan 0 kalau tidak ditemukan. Untuk pelanggan 1, 2, dan 3 hasilnya 15, 14, dan 15, sama dengan <code>position('@' in email)</code>.</p>
<p><b>Huruf besar dan kecil.</b> Perbedaan inilah yang paling sering mengejutkan. Di PostgreSQL, <code>where status = 'COMPLETED'</code> menghasilkan 0 pesanan, karena isinya ditulis dengan huruf kecil. Di SQL Server dengan <i>collation</i> (aturan membandingkan teks) <code>SQL_Latin1_General_CP1_CI_AS</code>, bawaan untuk sistem berbahasa Inggris AS, query yang sama menghasilkan 10879, sama dengan <code>'completed'</code>. CI berarti <i>case-insensitive</i>, tidak membedakan huruf besar dan kecil. Cek collation server-mu dengan <code>SELECT SERVERPROPERTY('Collation')</code>.</p>
<p><b>ISNULL.</b> Hasil ISNULL bertipe sama dengan nilai pertama. <code>SELECT ISNULL(CAST(NULL AS varchar(3)), 'tanpa voucher')</code> menghasilkan teks yang terpotong menjadi tiga karakter, karena pengganti diubah ke <code>varchar(3)</code>. <code>COALESCE</code> tidak memotongnya.</p>
<p><b>DATEADD.</b> Tipe hasil DATEADD mengikuti tipe masukannya. <code>DATEADD(month, 1, CAST('2025-08-31' AS date))</code> menghasilkan <code>2025-09-30</code> bertipe date. Kalau masukannya teks biasa seperti <code>'2025-08-31'</code>, hasilnya bertipe datetime: <code>2025-09-30 00:00:00.000</code>. Di PostgreSQL, date ditambah interval selalu menghasilkan timestamp. Ketiganya sama-sama memakai tanggal terakhir bulan tujuan.</p>`,
      examples: [
        { lang: "shell", code: "docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -d tokokita -Q \"SELECT COUNT(*) AS jumlah FROM app.orders WHERE status = 'COMPLETED'; SELECT DATEADD(month, 1, CAST('2025-08-31' AS date)) AS dateadd_date, DATEADD(month, 1, '2025-08-31') AS dateadd_teks;\"", note: "Dua query dipisahkan titik koma di dalam -Q. Hasil pertama 10879 kalau collation-mu CI." },
        { sql: "select count(*) as jumlah\nfrom app.orders\nwhere status = 'COMPLETED';", note: "PostgreSQL membedakan huruf besar dan kecil saat membandingkan teks dengan =, jadi hasilnya 0." },
        { sql: "select date '2025-08-31' + interval '1 month' as hasil;", note: "Hasilnya 2025-09-30 00:00:00 bertipe timestamp, bukan date." },
      ],
    },
    {
      title: "MERGE dan GO di prompt sqlcmd",
      html: `<p>Di bab 12 kamu menyamakan pesanan dengan <code>raw.orders_batch2</code> memakai MERGE. Coba lagi di SQL Server, langsung ke <code>app.orders</code>, di dalam transaksi supaya bisa dibatalkan. Buka prompt sqlcmd, lalu ketik baris demi baris:</p>
<pre class="sql"><code>docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -d tokokita

1&gt; BEGIN TRANSACTION;
2&gt; MERGE app.orders AS t
3&gt; USING raw.orders_batch2 AS s ON t.order_id = s.order_id
4&gt; WHEN MATCHED THEN UPDATE SET status = s.status, updated_at = s.updated_at
5&gt; WHEN NOT MATCHED THEN INSERT (order_id, customer_id, order_ts, channel, status, shipping_fee, voucher_code, updated_at)
6&gt;   VALUES (s.order_id, s.customer_id, s.order_ts, s.channel, s.status, s.shipping_fee, s.voucher_code, s.updated_at);
7&gt; SELECT COUNT(*) AS jumlah_pesanan FROM app.orders;
8&gt; GO
1&gt; ROLLBACK TRANSACTION;
2&gt; SELECT COUNT(*) AS jumlah_pesanan FROM app.orders;
3&gt; GO
1&gt; EXIT</code></pre>
<p>Hasil pertama 12297: 75 pesanan lama diubah statusnya dan 290 pesanan baru ditambahkan. Setelah <code>ROLLBACK TRANSACTION</code>, semua perubahan sejak <code>BEGIN TRANSACTION</code> dihapus, dan jumlahnya kembali 12007.</p>
<p>Sekarang hapus titik koma di akhir MERGE lalu ulangi. SQL Server menolak dengan error 10713: <i>A MERGE statement must be terminated by a semi-colon</i>. Ini kesalahan sintaks, sehingga tidak ada satu perintah pun di batch itu yang dijalankan. PostgreSQL tidak punya aturan khusus ini untuk MERGE: akhir input juga dianggap akhir perintah, seperti di mesin latihan.</p>`,
    },
    {
      title: "SSMS dan alat GUI lain",
      html: `<p><b>SSMS</b> adalah aplikasi Windows gratis dari Microsoft untuk mengelola SQL Server. Pasang dari halaman resmi SSMS di learn.microsoft.com, atau lewat PowerShell dengan <code>winget install --id Microsoft.SQLServerManagementStudio -e</code>.</p>
<p>Di jendela <i>Connect to Server</i>:</p>
<ul><li><b>Server name</b>: <code>localhost,1433</code></li>
<li><b>Authentication</b>: SQL Server Authentication, login <code>sa</code>, password yang kamu pakai di <code>docker run</code></li>
<li>Centang <b>Trust server certificate</b>, dengan alasan yang sama seperti <code>-C</code> di sqlcmd. Pilihan ini hanya untuk server latihan.</li></ul>
<p>Setelah terhubung, <i>Object Explorer</i> menampilkan database, skema, dan tabel dalam bentuk pohon, padanan grafis dari <code>\\l</code>, <code>\\dn</code>, dan <code>\\dt</code>. Klik New Query untuk menulis T-SQL.</p>
<p><b>Azure Data Studio sudah dihentikan</b> pada 28 Februari 2026 dan tidak lagi menerima pembaruan atau perbaikan keamanan. Tutorial lama sering memakainya. Penggantinya adalah Visual Studio Code dengan ekstensi MSSQL, atau SSMS.</p>
<p>Alat GUI lain yang boleh kamu coba, tidak wajib:</p>
<ul><li><b>pgAdmin 4</b>: alat pengelola PostgreSQL yang <i>open source</i> (kode programnya terbuka dan gratis), tersedia sebagai aplikasi desktop atau sebagai image Docker <code>dpage/pgadmin4</code>.</li>
<li><b>DBeaver Community</b>: alat gratis yang bisa terhubung ke banyak database, termasuk PostgreSQL dan SQL Server, sehingga dua server latihanmu bisa dibuka dari satu aplikasi.</li></ul>
<p>Untuk koneksi dari GUI ke PostgreSQL, pakai host <code>localhost</code>, port 5432, pengguna <code>postgres</code>, dan password dari <code>POSTGRES_PASSWORD</code>.</p>`,
    },
    {
      title: "Password dan keamanan",
      html: `<p>Password di bab ini, <code>contoh-pg-laptop</code> dan <code>Contoh#Laptop2025</code>, sengaja dibuat mudah dikenali sebagai contoh. Aturannya:</p>
<ul><li><b>Jangan pernah memakai password contoh di server produksi</b>, dan jangan memakai password yang sama dengan akun lain milikmu.</li>
<li>Password yang ditulis di <code>docker run</code> tersimpan sebagai variabel lingkungan di dalam container. Dokumentasi Microsoft menyarankan mengganti password <code>sa</code> setelah container dibuat untuk lingkungan produksi, dengan <code>ALTER LOGIN sa WITH PASSWORD = '…'</code>.</li>
<li>Buka port hanya untuk laptopmu dengan <code>-p 127.0.0.1:…</code>, seperti di bab ini.</li>
<li>Saat menjalankan sqlcmd, tinggalkan <code>-P</code> supaya password ditanyakan, bukan ditulis di perintah.</li>
<li>Jangan menyimpan password di berkas yang masuk ke repo Git atau dibagikan di GitHub.</li>
<li><code>sa</code> dan <code>postgres</code> adalah akun dengan hak penuh. Di tempat kerja, aplikasi dan laporan memakai akun sendiri dengan hak secukupnya.</li></ul>`,
    },
    {
      title: "Menghentikan, menyalakan, dan menghapus",
      html: `<p><code>docker stop pg18 sql1</code> mematikan kedua server, dan <code>docker start pg18 sql1</code> menyalakannya lagi dengan data yang sama. Kamu tidak perlu memuat ulang TokoKita setiap kali menyalakan laptop.</p>
<p><code>docker rm pg18</code> menghapus container, tetapi volume bernama seperti <code>pgdata</code> dan <code>sqldata</code> tetap ada, bahkan dengan <code>docker rm -v</code>. Data baru hilang permanen kalau kamu menjalankan <code>docker volume rm pgdata</code>. Perintah itu tidak bisa dibatalkan.</p>`,
      examples: [{ lang: "shell", code: "docker stop pg18 sql1\ndocker start pg18 sql1\n\n# menghapus container dan datanya (tidak bisa dibatalkan):\n# docker rm -f pg18\n# docker volume rm pgdata", note: "Baris penghapusan sengaja diberi tanda komentar #. Hapus tanda # hanya kalau kamu benar-benar ingin memulai dari awal." }],
    },
  ],
  tsql: [
    { pg: "psql -c \"…\" / psql -f berkas.sql", tsql: "sqlcmd -Q \"…\" / sqlcmd -i berkas.sql", note: "Jangan menulis GO di dalam -Q. Opsi -b di sqlcmd berpadanan dengan ON_ERROR_STOP di psql: berhenti di error pertama." },
    { pg: "titik koma mengirim perintah (prompt psql)", tsql: "GO di baris sendiri mengirim batch (prompt sqlcmd)", note: "GO dikenali sqlcmd dan SSMS, bukan perintah T-SQL; alat itu tidak pernah mengirim GO ke server. Keluar dari psql dengan \\q, dari sqlcmd dengan EXIT atau QUIT." },
    { pg: "\\l, \\dn, \\dt app.*", tsql: "select name from sys.databases; select name from sys.schemas; select name from sys.tables", note: "sys.databases berisi satu baris per database, sys.tables satu baris per tabel pengguna di database yang sedang dipakai. Di SSMS, Object Explorer menampilkan hal yang sama." },
    { pg: "\\d app.orders", tsql: "exec sp_help 'app.orders'", note: "sp_help mengembalikan beberapa hasil sekaligus, salah satunya daftar kolom dengan tipe, panjang, apakah boleh NULL, dan collation." },
    { pg: "where status = 'COMPLETED' → 0 baris", tsql: "where status = 'COMPLETED' → 10879 baris", note: "Dengan collation SQL_Latin1_General_CP1_CI_AS, = tidak membedakan huruf besar dan kecil. Cek collation server dengan SERVERPROPERTY('Collation')." },
    { pg: "position('@' in email)", tsql: "charindex('@', email)", note: "Keduanya mulai menghitung dari 1 dan memberi 0 kalau tidak ditemukan. CHARINDEX membandingkan teks mengikuti collation masukannya." },
    { pg: "coalesce(x, 'tanpa voucher')", tsql: "isnull(x, 'tanpa voucher')", note: "ISNULL bertipe sama dengan nilai pertama, sehingga pengganti yang lebih panjang bisa terpotong. COALESCE ada di kedua dialek." },
    { pg: "date '2025-08-31' + interval '1 month' (timestamp)", tsql: "dateadd(month, 1, cast('2025-08-31' as date)) (date)", note: "Tipe hasil DATEADD sama dengan tipe masukannya. Kalau masukannya teks biasa, hasilnya datetime." },
    { pg: "merge into t using s on … ;", tsql: "merge t using s on … ;", note: "Di SQL Server titik koma di akhir MERGE wajib; tanpa itu muncul error 10713 dan seluruh batch tidak dijalankan." },
    { pg: "boolean: where is_active", tsql: "bit: where is_active = 1", note: "bit berisi 1, 0, atau NULL. Teks 'TRUE' dan 'FALSE' bisa diubah menjadi 1 dan 0." },
  ],
  summary: [
    "Server database terus berjalan dan melayani perintah dari klien seperti psql, sqlcmd, dan SSMS.",
    "PostgreSQL 18: pakai tag postgres:18 dan pasang volume di /var/lib/postgresql, bukan /var/lib/postgresql/data.",
    "Muat berkas SQL dengan psql -v ON_ERROR_STOP=1 -1 -f; di SQL Server dengan sqlcmd -b -i.",
    "SQL Server 2025 di container: ACCEPT_EULA=Y, MSSQL_SA_PASSWORD yang kuat, edisi Developer (bukan untuk produksi), sqlcmd ada di /opt/mssql-tools18/bin.",
    "-C dan Trust server certificate hanya untuk server latihan di laptop.",
    "Perbedaan yang terasa di SQL Server sungguhan: perbandingan teks tidak membedakan huruf besar-kecil (collation CI), GO memisahkan batch, MERGE wajib titik koma, ISNULL dan DATEADD mengikuti tipe masukannya.",
    "Azure Data Studio sudah dihentikan sejak 28 Februari 2026; pakai SSMS atau VS Code dengan ekstensi MSSQL.",
    "Password contoh hanya untuk laptop. Buka port dengan 127.0.0.1, dan jangan simpan password di repo.",
  ],
  drills: [
    { id: "tools-04-01", kind: "choice", prompt: "Kamu menjalankan <code>postgres:18</code> dan ingin datanya tetap ada walaupun container dihapus lalu dibuat ulang. Di mana volume harus dipasang?",
      options: ["<code>/var/lib/postgresql/data</code>", "<code>/var/lib/postgresql</code>", "<code>/tmp</code>", "Tidak perlu volume; data otomatis tersimpan di image"], answer: 1,
      why: "Mulai PostgreSQL 18, image resmi menyimpan data di /var/lib/postgresql/18/docker, dan volume yang dianjurkan dipasang di /var/lib/postgresql. Path /var/lib/postgresql/data adalah cara untuk versi 17 ke bawah. Image tidak pernah menyimpan perubahan datamu.",
      hint: "Ingat perubahan tata letak folder di image versi 18." },
    { id: "tools-04-02", kind: "choice", prompt: "Apa fungsi opsi <code>-C</code> di <code>/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C</code>?",
      options: ["Membuat database baru", "Memercayai sertifikat server tanpa memeriksanya, supaya koneksi ke SQL Server latihan dengan sertifikat buatan sendiri tidak ditolak", "Mematikan enkripsi password sa", "Menjalankan query lalu keluar"], answer: 1,
      why: "sqlcmd (ODBC) versi 18 mewajibkan enkripsi dan memeriksa sertifikat server. Sertifikat buatan SQL Server di container tidak dikenal laptopmu, jadi -C dipakai untuk melewati pemeriksaan itu. Karena membuka celah penyadapan, -C hanya cocok untuk server latihan. Menjalankan query lalu keluar adalah -Q.",
      hint: "Huruf C di sini berkaitan dengan sertifikat (certificate)." },
    { id: "tools-04-03", kind: "choice", prompt: "Tutorial lama menyuruhmu memasang Azure Data Studio untuk membuka SQL Server. Apa yang sebaiknya kamu lakukan sekarang (November 2026)?",
      options: ["Tetap memasang Azure Data Studio karena masih menerima pembaruan", "Memakai SSMS, atau Visual Studio Code dengan ekstensi MSSQL, karena Azure Data Studio sudah dihentikan pada 28 Februari 2026", "Memakai psql untuk SQL Server", "Tidak ada alat GUI untuk SQL Server di Windows"], answer: 1,
      why: "Menurut dokumentasi Microsoft, Azure Data Studio dihentikan pada 28 Februari 2026 dan tidak lagi menerima pembaruan atau perbaikan keamanan. Penggantinya Visual Studio Code dengan ekstensi MSSQL; SSMS juga tetap didukung. psql hanya untuk PostgreSQL.",
      hint: "Alat yang tidak lagi menerima perbaikan keamanan sebaiknya tidak dipasang." },
    { id: "tools-04-04", kind: "choice", prompt: "Container SQL Server lamamu sudah dihapus, tetapi volume <code>sqldata</code> masih ada. Kamu membuat container baru dengan <code>-v sqldata:/var/opt/mssql</code> dan <code>MSSQL_SA_PASSWORD</code> yang berbeda. Password mana yang dipakai untuk login <code>sa</code>?",
      options: ["Password baru dari MSSQL_SA_PASSWORD", "Password lama yang tersimpan di volume", "Tidak ada password; sa bisa masuk tanpa password", "Container gagal menyala"], answer: 1,
      why: "Dokumentasi Microsoft menyebut SQL Server mengabaikan MSSQL_SA_PASSWORD kalau container memakai volume data yang sudah ada; password sa yang tersimpan di data itulah yang berlaku. PostgreSQL berperilaku serupa: POSTGRES_PASSWORD hanya berlaku saat volume masih kosong.",
      hint: "Pengaturan password hanya dipakai saat server dibuat pertama kali." },
    { id: "tools-04-05", kind: "choice", prompt: "Password <code>sa</code> mana yang diterima aturan password bawaan SQL Server?",
      options: ["<code>latihan</code>", "<code>latihan123</code>", "<code>Contoh#Laptop2025</code>", "<code>12345678</code>"], answer: 2,
      why: "Aturannya: minimal 8 karakter, berisi karakter dari tiga di antara empat kelompok (huruf besar, huruf kecil, angka, simbol). latihan terlalu pendek dan hanya huruf kecil; latihan123 hanya dua kelompok; 12345678 hanya angka. Contoh#Laptop2025 punya keempatnya. Tetap ingat: password contoh hanya untuk laptop.",
      hint: "Hitung berapa kelompok karakter di setiap pilihan." },
    { id: "tools-04-06", kind: "paste", prompt: "Setelah memuat <code>tokokita-postgres.sql</code>, hitung jumlah pesanan di PostgreSQL laptopmu. Jalankan perintah ini dan tempel keluarannya.",
      command: "docker exec pg18 psql -U postgres -d tokokita -c \"select count(*) from app.orders\"",
      expect: "^\\s*12007\\s*$",
      sampleOutput: " count \n-------\n 12007\n(1 row)",
      why: "Hasilnya harus 12007, sama dengan mesin latihan di browser. Kalau angkanya berbeda atau muncul error relation \"app.orders\" does not exist, pemuatan berkas belum selesai atau dijalankan ke database lain (cek -d tokokita).",
      hint: "Jalankan dulu tiga langkah di bagian Memuat data TokoKita ke PostgreSQL." },
    { id: "tools-04-07", kind: "paste", prompt: "Lihat struktur tabel pesanan dengan perintah meta psql <code>\\d</code>. Tempel keluarannya.",
      command: "docker exec pg18 psql -U postgres -d tokokita -c \"\\d app.orders\"",
      expect: "order_id\\s*\\|\\s*integer[\\s\\S]*voucher_code\\s*\\|\\s*text",
      sampleOutput: "                          Table \"app.orders\"\n    Column    |            Type             | Collation | Nullable | Default \n--------------+-----------------------------+-----------+----------+---------\n order_id     | integer                     |           | not null | \n customer_id  | integer                     |           | not null | \n order_ts     | timestamp without time zone |           | not null | \n channel      | text                        |           | not null | \n status       | text                        |           | not null | \n shipping_fee | numeric(12,2)               |           | not null | \n voucher_code | text                        |           |          | \n handled_by   | integer                     |           |          | \n updated_at   | timestamp without time zone |           | not null | \nIndexes:\n    \"orders_pkey\" PRIMARY KEY, btree (order_id)\nForeign-key constraints:\n    \"orders_customer_id_fkey\" FOREIGN KEY (customer_id) REFERENCES app.customers(customer_id)\n    \"orders_handled_by_fkey\" FOREIGN KEY (handled_by) REFERENCES app.staff(staff_id)\nReferenced by:\n    TABLE \"app.order_items\" CONSTRAINT \"order_items_order_id_fkey\" FOREIGN KEY (order_id) REFERENCES app.orders(order_id)\n    TABLE \"app.payments\" CONSTRAINT \"payments_order_id_fkey\" FOREIGN KEY (order_id) REFERENCES app.orders(order_id)\n    TABLE \"app.shipments\" CONSTRAINT \"shipments_order_id_fkey\" FOREIGN KEY (order_id) REFERENCES app.orders(order_id)",
      why: "\\d menampilkan setiap kolom dengan tipe dan keterangan NOT NULL, lalu primary key dan foreign key tabel itu. Kolom voucher_code dan handled_by boleh kosong, sesuai kamus data. Satu -c hanya boleh berisi satu perintah meta atau SQL, tidak dicampur.",
      hint: "Perintahnya \\d diikuti nama tabel lengkap dengan skemanya." },
    { id: "tools-04-08", kind: "paste", prompt: "Pastikan SQL Server di container sudah berjalan. Jalankan perintah ini, masukkan password <code>sa</code> saat ditanya, lalu tempel keluarannya.",
      command: "docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -Q \"SELECT @@VERSION\"",
      expect: "Microsoft SQL Server 20\\d\\d",
      sampleOutput: "Password: \n\n---------------------------------------------------------------\nMicrosoft SQL Server 2025 (RTM) - 17.0.1000.7 (X64) \n\tOct 21 2025 12:05:57 \n\tCopyright (C) 2025 Microsoft Corporation\n\tEnterprise Developer Edition (64-bit) on Linux (Ubuntu 24.04.3 LTS) <X64>\n\n(1 rows affected)",
      why: "@@VERSION berisi versi SQL Server, edisi, dan sistem operasi tempatnya berjalan. Di container, sistem operasinya Linux walaupun laptopmu Windows. Kalau muncul error sertifikat, periksa apakah -C sudah ditulis; kalau login gagal tepat setelah docker run, tunggu sebentar lalu ulangi.",
      hint: "Tanpa -P, sqlcmd menanyakan password. Ketik password yang kamu pakai di MSSQL_SA_PASSWORD." },
    { id: "tools-04-09", kind: "paste", prompt: "Setelah memuat <code>tokokita-sqlserver.sql</code>, jalankan query T-SQL TOP ini di SQL Server: tiga pesanan terbaru, diurutkan dari <code>order_ts</code> terbaru. Tempel keluarannya.",
      command: "docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -d tokokita -Q \"SELECT TOP (3) order_id, order_ts FROM app.orders ORDER BY order_ts DESC;\"",
      expect: "112007[\\s\\S]*112006[\\s\\S]*112005",
      sampleOutput: "Password: \norder_id    order_ts\n----------- ---------------------------\n     112007 2025-10-31 22:57:41.0000000\n     112006 2025-10-31 21:20:33.0000000\n     112005 2025-10-31 20:42:31.0000000\n\n(3 rows affected)",
      why: "Hasilnya sama dengan order by order_ts desc limit 3 di PostgreSQL: 112007, 112006, 112005. Tampilan jamnya bisa berbeda dari PostgreSQL, misalnya dengan tambahan pecahan detik, tetapi nilainya sama.",
      hint: "Kalau muncul Invalid object name 'app.orders', periksa -d tokokita dan apakah pemuatan berkas sudah berhasil." },
    { id: "tools-04-10", kind: "paste", prompt: "Rasakan perbedaan collation. Hitung pesanan dengan status yang ditulis huruf besar <code>'COMPLETED'</code> di SQL Server, lalu tempel keluarannya. (Di PostgreSQL, query yang sama menghasilkan 0.)",
      command: "docker exec -it sql1 /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -d tokokita -Q \"SELECT COUNT(*) AS jumlah FROM app.orders WHERE status = 'COMPLETED'; SELECT SERVERPROPERTY('Collation') AS collation_server;\"",
      expect: "\\b10879\\b[\\s\\S]*_CI_",
      sampleOutput: "Password: \njumlah\n-----------\n      10879\n\n(1 rows affected)\ncollation_server\n------------------------------\nSQL_Latin1_General_CP1_CI_AS\n\n(1 rows affected)",
      why: "Dengan collation SQL_Latin1_General_CP1_CI_AS, 'COMPLETED' dianggap sama dengan 'completed', sehingga hasilnya 10879, sama dengan jumlah pesanan berstatus completed. Di PostgreSQL hasilnya 0. Kalau collation server-mu berakhiran _CS_ (case-sensitive), hasilnya 0 juga di SQL Server.",
      hint: "Perhatikan bagian CI di nama collation." },
    { id: "tools-04-11", kind: "sql", prompt: "Di SQL Server kamu menjalankan <code>SELECT TOP (5) customer_id, CHARINDEX('@', email) AS posisi_at FROM app.customers ORDER BY customer_id;</code>. Tulis padanannya di PostgreSQL. Kolom: <code>customer_id</code>, <code>posisi_at</code>; urutkan dari <code>customer_id</code> terkecil.",
      start: "select customer_id,\n       \nfrom app.customers\n",
      solution: "select customer_id,\n       position('@' in email) as posisi_at\nfrom app.customers\norder by customer_id\nlimit 5;",
      ordered: true, checkNames: true,
      why: "CHARINDEX('@', email) berpadanan dengan position('@' in email); keduanya mulai dari 1. TOP (5) … ORDER BY menjadi ORDER BY … LIMIT 5. Hasilnya 15, 14, 15, 14, 16, sama di kedua server.",
      hint: "Di PostgreSQL, teks yang dicari ditulis lebih dulu, lalu IN, lalu kolomnya. Jumlah baris dibatasi di akhir query." },
    { id: "tools-04-12", kind: "number", prompt: "Di sesi sqlcmd bagian MERGE, berapa jumlah baris <code>app.orders</code> yang dicetak <b>sebelum</b> <code>ROLLBACK TRANSACTION</code>? Hitung dari data dengan query PostgreSQL.",
      answerSql: "select (select count(*) from app.orders)\n     + (select count(*) from raw.orders_batch2 b\n        where not exists (select 1 from app.orders o where o.order_id = b.order_id))",
      why: "MERGE menambah baris batch2 yang nomornya belum ada di app.orders (290 baris) dan hanya mengubah yang sudah ada (75 baris). Jadi 12007 + 290 = 12297. Setelah ROLLBACK, jumlahnya kembali 12007.",
      hint: "Baris yang di-UPDATE tidak menambah jumlah. Hitung baris batch2 yang tidak punya pasangan di app.orders dengan NOT EXISTS." },
    { id: "tools-04-13", kind: "explain", prompt: "Jelaskan dengan kalimatmu sendiri kenapa <code>docker run</code> untuk PostgreSQL dan SQL Server di bab ini memakai volume bernama (<code>-v pgdata:…</code>, <code>-v sqldata:…</code>), dan apa yang terjadi pada data TokoKita kalau kamu menjalankan <code>docker rm -f pg18</code>, lalu <code>docker volume rm pgdata</code>.",
      model: "Container dibuat untuk bisa dihapus dan dibuat ulang, misalnya saat ganti versi image. Data database disimpan di volume bernama yang terpisah dari container, sehingga TokoKita yang sudah dimuat tetap ada walaupun container dihapus. docker rm -f pg18 hanya menghapus container; volume pgdata tetap ada, dan container baru dengan -v pgdata:/var/lib/postgresql langsung memakai data lama, termasuk password lamanya. docker volume rm pgdata menghapus datanya secara permanen dan tidak bisa dibatalkan; setelah itu TokoKita harus dimuat ulang dari berkas SQL. Untuk PostgreSQL 18 volume harus dipasang di /var/lib/postgresql, untuk SQL Server di /var/opt/mssql.",
      hint: "Bedakan apa yang terhapus oleh docker rm dan oleh docker volume rm." },
    { id: "tools-04-14", kind: "explain", level: "wawancara", prompt: "Pertanyaan wawancara: \"Tim kami memakai SQL Server, tapi kamu terbiasa PostgreSQL. Sebuah query laporan yang benar di PostgreSQL akan dipindah ke SQL Server. Apa yang kamu periksa, dan bagaimana kamu mengujinya sebelum dijalankan di produksi?\"",
      model: "Saya menyiapkan SQL Server di laptop dengan Docker (edisi Developer) dan memuat salinan data yang sama, supaya hasilnya bisa dibandingkan baris per baris dengan PostgreSQL. Yang saya periksa: (1) sintaks: LIMIT menjadi TOP (n) dengan ORDER BY atau OFFSET … FETCH, position menjadi CHARINDEX, interval menjadi DATEADD, boolean menjadi bit (= 1); (2) collation: SQL Server bawaan tidak membedakan huruf besar-kecil, jadi filter teks dan GROUP BY bisa memberi hasil berbeda; (3) tipe hasil: ISNULL dan DATEADD mengikuti tipe masukan, ISNULL bisa memotong teks; (4) MERGE wajib diakhiri titik koma, dan skrip dipisah GO untuk sqlcmd atau SSMS. Lalu saya bandingkan jumlah baris dan total angka utama di kedua server, menjalankan perubahan data di dalam transaksi yang bisa dibatalkan, dan baru mengirim ke produksi setelah hasilnya sama. Saya tidak memakai akun sa atau password contoh di luar laptop.",
      hint: "Bagi jawabanmu: lingkungan uji, perbedaan dialek yang dicek, dan cara membuktikan hasilnya sama." },
  ],
};
