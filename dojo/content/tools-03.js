// Bab A03 (Bagian 3): Docker dan Docker Compose. Semua klaim tentang Docker, Docker Desktop, Compose,
// image postgres, image python, dan pgAdmin dicek lewat Context7 (lihat laporan tiket A03).
export default {
  id: "tools-03",
  part: "tools",
  title: "Docker dan Docker Compose",
  minutes: 75,
  goals: [
    "Menjelaskan masalah \"jalan di laptopku saja\" dan bagaimana container menyelesaikannya.",
    "Membedakan image, container, registry, dan tag.",
    "Memasang Docker Desktop di Windows 11 dengan WSL 2 dan memeriksa hasilnya.",
    "Menjalankan dan mengelola container dengan <code>docker run</code>, <code>ps</code>, <code>logs</code>, <code>stop</code>, dan <code>rm</code>.",
    "Menyimpan data PostgreSQL di volume dan menyambung dengan <code>psql</code> di dalam container.",
    "Membuat image sendiri dengan Dockerfile, lalu menjalankan PostgreSQL + pgAdmin dengan Docker Compose.",
    "Menjaga rahasia tetap di luar image dan membersihkan container, image, serta volume yang tidak dipakai.",
  ],
  terms: [
    { term: "docker", def: "Alat untuk membungkus program beserta semua kebutuhannya menjadi image, lalu menjalankannya sebagai container dengan cara yang sama di komputer mana pun." },
    { term: "container", def: "Image yang sedang dijalankan: proses yang terisolasi dengan sistem berkas, jaringan, dan daftar proses sendiri. Perubahan berkas di dalamnya masuk ke lapisan tulis milik container itu dan hilang saat container dihapus." },
    { term: "image", def: "Paket berisi program dan semua kebutuhannya, tersusun dari lapisan yang hanya bisa dibaca. Image adalah cetakan; container dibuat dari image." },
    { term: "registry", def: "Tempat menyimpan dan membagikan image. Registry bawaan Docker adalah Docker Hub (docker.io)." },
    { term: "tag", def: "Label versi atau varian sebuah image, ditulis sesudah titik dua, misalnya <code>postgres:18.7</code>. Tanpa tag, Docker memakai <code>latest</code>." },
    { term: "volume", def: "Tempat penyimpanan yang dikelola Docker dan hidup terpisah dari container, sehingga datanya tetap ada setelah container dihapus." },
    { term: "port", def: "Nomor pintu jaringan yang dipakai program untuk menerima sambungan, misalnya 5432 untuk PostgreSQL." },
    { term: "dockerfile", def: "Berkas teks berisi instruksi (FROM, WORKDIR, COPY, RUN, CMD) untuk membangun image." },
    { term: "docker compose", def: "Alat yang membaca berkas <code>compose.yaml</code> berisi beberapa layanan, lalu menjalankan semuanya dengan satu perintah." },
    { term: "wsl 2", def: "<i>Windows Subsystem for Linux</i> versi 2: fitur Windows untuk menjalankan Linux. Docker Desktop memakainya untuk menjalankan container Linux di Windows." },
  ],
  introduces: [],
  sections: [
    {
      title: "Masalah \"jalan di laptopku saja\"",
      html: `<p>Skrip atau database butuh versi program tertentu (misalnya PostgreSQL 18, bukan 16), pustaka tambahan, dan pengaturan tertentu. Kalau rekan kerjamu memasang versi lain, skrip yang jalan di laptopmu bisa gagal di laptopnya atau di server. Keluhan ini dikenal sebagai <i>"it works on my machine"</i> (jalan di laptopku saja).</p>
<p><b>Docker</b> membungkus program beserta semua kebutuhannya ke dalam satu paket, lalu menjalankan paket itu dengan cara yang sama di komputer mana pun yang memasang Docker. Menurut dokumentasi Docker, dengan cara inilah Docker menyelesaikan masalah tadi.</p>
<p>Container berbeda dari mesin virtual (komputer tiruan lengkap dengan sistem operasinya sendiri). Container berbagi <i>kernel</i> (inti sistem operasi) dengan komputer yang menjalankannya, sehingga container Linux butuh kernel Linux. Di Windows, kernel itu disediakan lewat WSL 2.</p>
<p>Data engineer memakai Docker untuk menjalankan database latihan tanpa memasangnya di Windows, menyamakan lingkungan kerja tim, dan mengemas <i>pipeline</i> (rangkaian langkah pengolahan data) supaya bisa dijalankan di server.</p>`,
    },
    {
      title: "Image, container, dan registry",
      html: `<ul><li><b>Image</b>: paket berisi berkas program dan semua kebutuhannya, tersusun dari beberapa lapisan (<i>layer</i>) yang hanya bisa dibaca. Image tidak berjalan; ia cetakan.</li>
<li><b>Container</b>: image yang sedang dijalankan, sebagai proses terisolasi dengan sistem berkas, jaringan, dan daftar proses sendiri. Dari satu image bisa dibuat banyak container. Setiap container mendapat lapisan tulis sendiri di atas lapisan image, dan semua perubahan berkas di dalam container masuk ke lapisan itu.</li>
<li><b>Registry</b>: tempat menyimpan dan membagikan image. Registry bawaan adalah Docker Hub (<code>docker.io</code>), tempat image resmi seperti <code>postgres</code> dan <code>python</code> (kelompok Docker Official Images).</li></ul>
<p>Nama image ditulis <code>nama:tag</code>. <b>Tag</b> adalah label versi atau varian, misalnya <code>postgres:18.7</code>. Tanpa tag, Docker memakai <code>latest</code>, yang belum tentu versi yang kamu harapkan. Menurut daftar tag resmi image postgres saat bab ini ditulis, <code>postgres:latest</code> menunjuk ke PostgreSQL 19.0, sedangkan kursus ini memakai PostgreSQL 18. Karena itu bab ini menulis tag yang pasti: <code>postgres:18.7</code>. Tag <code>18</code> berpindah ke rilis 18 terbaru; tag <code>18.7</code> tetap berisi PostgreSQL 18.7.</p>
<p>Kesalahan umum: mengira menghapus container juga menghapus image-nya. Image tetap tersimpan setelah container dihapus, sehingga container baru bisa dibuat lagi tanpa mengunduh ulang.</p>`,
    },
    {
      title: "Memasang Docker Desktop di Windows 11",
      html: `<p><b>Docker Desktop</b> adalah aplikasi Docker untuk komputer pribadi (Windows, macOS, dan Linux). Di Windows, Docker Desktop menjalankan container Linux di dalam mesin virtual Linux yang disediakan <b>WSL 2</b> (<i>Windows Subsystem for Linux</i> versi 2, fitur Windows untuk menjalankan Linux). Ringkasan persyaratan resminya untuk prosesor x86_64 (Intel atau AMD biasa):</p>
<ul><li>WSL versi 2.1.5 atau lebih baru. Cek dengan <code>wsl --version</code>. Kalau perintah itu tidak menampilkan versi, kemungkinan WSL-mu versi lama bawaan Windows; perbarui dengan <code>wsl --update</code> di PowerShell yang dijalankan sebagai administrator.</li>
<li>Windows 11 64-bit versi 23H2 (build 22631) atau lebih baru. Daftar resminya menyebut edisi Enterprise, Pro, atau Education.</li>
<li>Prosesor 64-bit dengan SLAT (fitur prosesor untuk virtualisasi), RAM 8 GB, dan virtualisasi aktif di BIOS/UEFI (pengaturan dasar komputer sebelum Windows menyala).</li>
<li>Layanan Windows bernama Server (LanmanServer) aktif dengan mode mulai Automatic.</li></ul>
<p>Unduh <code>Docker Desktop Installer.exe</code> dari docs.docker.com, jalankan, pilih WSL 2 di halaman konfigurasi, dan mulai ulang Windows kalau diminta. Lalu buka Docker Desktop dari menu Start dan setujui perjanjian langganannya. Docker Desktop gratis untuk pemakaian pribadi, pendidikan, proyek <i>open source</i> nonkomersial, dan usaha kecil (kurang dari 250 karyawan dan pendapatan tahunan kurang dari 10 juta dolar AS). Perusahaan yang lebih besar wajib berlangganan, jadi tanyakan ke tim IT sebelum memasangnya di laptop kantor.</p>`,
      examples: [
        { lang: "shell", code: "wsl --version\ndocker --version\ndocker compose version", note: "Docker Desktop harus sedang berjalan setiap kali kamu memakai perintah <code>docker</code>. <code>docker --version</code> mencetak satu baris berbentuk <code>Docker version 28.4.0, build d8eb465</code>; angkanya mengikuti versi yang terpasang. <code>docker compose version</code> menampilkan versi Docker Compose, yang ikut terpasang bersama Docker Desktop." },
        { lang: "shell", code: "docker run hello-world", note: "Docker tidak menemukan image <code>hello-world</code> di laptopmu, jadi ia mengunduhnya dari Docker Hub, membuat container, lalu menjalankannya. Container itu mencetak pesan yang diawali <code>Hello from Docker!</code> dan langsung berhenti." },
      ],
    },
    {
      title: "docker run: menjalankan container",
      html: `<p><code>docker run</code> membuat container baru dari sebuah image lalu menjalankannya. Kalau image belum ada di laptop, Docker mengunduhnya dulu dari registry. Bentuk umumnya <code>docker run [pilihan] image[:tag] [perintah]</code>: pilihan (<i>option</i>) ditulis sebelum nama image, dan apa pun sesudah nama image adalah perintah yang dijalankan di dalam container.</p>
<div class="tw"><table class="t"><tr><th>Pilihan</th><th>Arti</th></tr>
<tr><td><code>-d</code> (<code>--detach</code>)</td><td>Container berjalan di latar belakang, sehingga terminal langsung bisa dipakai lagi. Docker mencetak id container.</td></tr>
<tr><td><code>--name latihan-pg</code></td><td>Memberi nama container. Tanpa ini, Docker memberi nama acak. Nama memudahkan perintah lain menunjuk container itu.</td></tr>
<tr><td><code>-p 5432:5432</code></td><td>Membuka <b>port</b>. Angka kiri adalah port di laptop, angka kanan port di dalam container. Tanpa <code>-p</code>, program di dalam container tidak bisa dihubungi dari laptop.</td></tr>
<tr><td><code>-e NAMA=nilai</code></td><td>Mengisi variabel lingkungan, yaitu pengaturan berbentuk pasangan nama dan nilai yang dibaca program saat mulai.</td></tr>
<tr><td><code>-v nama-volume:/folder</code></td><td>Memasang volume (dibahas dua bagian lagi).</td></tr>
<tr><td><code>--rm</code></td><td>Menghapus container secara otomatis begitu container berhenti.</td></tr></table></div>
<p>Port di laptop harus belum dipakai program lain. Kalau kamu sudah memasang PostgreSQL langsung di Windows, port 5432 mungkin terpakai; ganti angka kirinya, misalnya <code>-p 5433:5432</code>. Secara bawaan, port terbuka di semua alamat jaringan laptop. Untuk database latihan, batasi ke laptop sendiri dengan <code>-p 127.0.0.1:5432:5432</code>.</p>`,
    },
    {
      title: "Mengelola container: ps, logs, stop, rm",
      html: `<ul><li><code>docker ps</code> menampilkan container yang sedang berjalan; <code>docker ps -a</code> juga yang sudah berhenti. Kolom STATUS berisi <code>Up …</code> untuk container yang berjalan dan <code>Exited (…)</code> untuk yang sudah berhenti.</li>
<li><code>docker logs nama</code> menampilkan keluaran program di dalam container. <code>-f</code> terus mengikuti keluaran baru (berhenti mengikuti dengan Ctrl+C; containernya tetap berjalan), <code>--tail 20</code> hanya 20 baris terakhir. Kalau container gagal menyala, baca log dulu.</li>
<li><code>docker stop nama</code> mengirim sinyal berhenti ke program di dalam container. Kalau program belum berhenti setelah batas waktu, Docker memaksanya berhenti.</li>
<li><code>docker rm nama</code> menghapus container yang sudah berhenti; <code>docker rm -f nama</code> memaksa container yang masih berjalan berhenti lalu menghapusnya.</li></ul>
<p>Kesalahan umum: menjalankan <code>docker run --name latihan-pg …</code> dua kali. Perintah kedua ditolak karena nama itu masih dipakai container pertama, walaupun sudah berhenti. Hapus container lamanya dengan <code>docker rm</code>, atau pakai nama lain.</p>`,
      examples: [
        { lang: "shell", code: "docker ps -a\ndocker logs --tail 20 latihan-pg\ndocker stop latihan-pg\ndocker rm latihan-pg", note: "Urutan yang aman untuk membuang container: lihat daftarnya, baca log kalau perlu, hentikan, lalu hapus. Perintah ini baru berguna setelah container <code>latihan-pg</code> dibuat di bagian PostgreSQL di bawah." },
      ],
    },
    {
      title: "Volume: data yang bertahan",
      html: `<p>Berkas yang ditulis program di dalam container masuk ke lapisan tulis container itu, dan lapisan ini ikut hilang saat container dihapus. Untuk database, artinya semua tabel ikut hilang.</p>
<p><b>Volume</b> adalah tempat penyimpanan yang dikelola Docker dan hidup terpisah dari container. Data di volume tetap ada setelah containernya dihapus, dan volume itu bisa dipasang lagi ke container baru. Pasang dengan <code>-v nama-volume:/folder/di/container</code>; kalau volume itu belum ada, Docker membuatnya.</p>
<p>Selain volume bernama, ada volume tanpa nama (<i>anonymous volume</i>) yang diberi nama acak oleh Docker. Image postgres sudah menandai folder datanya sebagai tempat volume. Kalau kamu lupa memasang volume bernama, data masuk ke volume tanpa nama yang sulit dikenali dan tidak dipakai lagi oleh container baru. Dengan <code>--rm</code>, volume tanpa nama itu ikut dihapus saat container berhenti.</p>
<p>Jangan mengubah isi volume langsung dari Windows; dokumentasi Docker menyebut cara itu tidak didukung dan bisa merusak data. Akses isinya lewat container.</p>`,
      examples: [
        { lang: "shell", code: "docker volume ls\ndocker volume rm latihan-pgdata", note: "<code>docker volume ls</code> menampilkan semua volume. <code>docker volume rm</code> menghapus volume beserta seluruh datanya, dan gagal kalau volume itu masih dipakai sebuah container. Jalankan baris kedua hanya kalau kamu memang ingin membuang data latihan." },
      ],
    },
    {
      title: "Menjalankan PostgreSQL resmi di Docker",
      html: `<p>Image <code>postgres</code> hanya mewajibkan satu variabel lingkungan: <code>POSTGRES_PASSWORD</code>, kata sandi pengguna super (pengguna dengan semua hak). Nama pengguna supernya bawaan <code>postgres</code>; <code>POSTGRES_USER</code> menggantinya sekaligus membuat database bernama sama.</p>
<p>Mulai PostgreSQL 18, image ini menyimpan data di subfolder per versi di bawah <code>/var/lib/postgresql</code> dan menyarankan satu volume di folder itu. Panduan lama untuk versi 17 ke bawah memasang volume di <code>/var/lib/postgresql/data</code>; kalau image 18 menemukan data lama di sana, container berhenti dengan pesan error.</p>
<p>Saat pertama menyala dengan volume kosong, container membuat database baru dan menulis <code>PostgreSQL init process complete; ready for start up.</code> di log. Kalau volume sudah berisi database, log menulis <code>… Skipping initialization</code>. Karena itu <code>POSTGRES_PASSWORD</code> dan <code>POSTGRES_USER</code> hanya berpengaruh saat volume masih kosong: mengganti kata sandi di <code>docker run</code> berikutnya tidak mengubah kata sandi database yang sudah ada.</p>
<p>Untuk menyambung, jalankan <code>psql</code> (program baris perintah PostgreSQL) yang ada di dalam image lewat <code>docker exec</code>, yang menjalankan perintah di container yang sedang berjalan. <code>-it</code> membuka sesi interaktif (keluar dengan <code>\\q</code>); <code>psql -c "…"</code> menjalankan satu perintah lalu selesai.</p>
<p>Kata sandi tidak diminta karena image postgres mengizinkan sambungan dari dalam container yang sama tanpa kata sandi. Sambungan dari luar container, misalnya dari laptopmu atau container lain, tetap wajib memakai kata sandi.</p>`,
      examples: [
        { lang: "shell", code: "docker run -d --name latihan-pg -e POSTGRES_PASSWORD=latihan123 -p 5432:5432 -v latihan-pgdata:/var/lib/postgresql postgres:18.7\ndocker logs latihan-pg", note: "Tunggu beberapa detik sesudah baris pertama sebelum menjalankan perintah lain ke database. Kata sandi <code>latihan123</code> hanya untuk database latihan di laptopmu (lihat bagian rahasia di bawah)." },
        { lang: "shell", code: "docker exec latihan-pg psql -U postgres -c \"select version()\"\ndocker exec -it latihan-pg psql -U postgres", note: "Baris pertama menjalankan satu query lalu selesai. Baris kedua membuka sesi psql interaktif; ketik <code>\\q</code> untuk keluar." },
      ],
    },
    {
      title: "Dockerfile: membuat image sendiri",
      html: `<p><b>Dockerfile</b> adalah berkas teks berisi instruksi untuk membangun image. Instruksi yang paling sering dipakai:</p>
<div class="tw"><table class="t"><tr><th>Instruksi</th><th>Arti</th></tr>
<tr><td><code>FROM image:tag</code></td><td>Image dasar yang dipakai sebagai titik awal.</td></tr>
<tr><td><code>WORKDIR /app</code></td><td>Folder kerja untuk instruksi sesudahnya. Folder dibuat kalau belum ada.</td></tr>
<tr><td><code>COPY sumber tujuan</code></td><td>Menyalin berkas dari folder proyekmu ke dalam image.</td></tr>
<tr><td><code>RUN perintah</code></td><td>Menjalankan perintah saat image dibangun, misalnya memasang pustaka. Hasilnya menjadi lapisan baru.</td></tr>
<tr><td><code>CMD ["program", "argumen"]</code></td><td>Program bawaan yang dijalankan saat container mulai. Kalau ada beberapa CMD, hanya yang terakhir yang dipakai.</td></tr></table></div>
<p>Contoh di bawah membuat image untuk skrip Python satu baris (Python dipelajari di Bagian 4; <code>print("…")</code> mencetak teks). Buat folder kosong, misalnya <code>latihan-docker\\halo-python</code>, berisi <code>halo.py</code> dan <code>Dockerfile</code> (tanpa ekstensi). Periksa dengan <code>Get-ChildItem</code> bahwa nama berkasnya tidak berakhiran <code>.txt</code>.</p>
<p>Image dasarnya <code>python:3.14-slim</code>. Varian <i>slim</i> hanya berisi paket sistem minimum yang dibutuhkan Python, sehingga lebih kecil. Tag <code>3.14-slim</code> berpindah ke rilis 3.14 terbaru. Tulis CMD dalam bentuk daftar seperti di contoh; dokumentasi Docker menyarankan bentuk ini supaya program menerima sinyal berhenti dengan benar.</p>
<p><code>docker build -t halo-python:1.0 .</code> membangun image. <code>-t</code> memberi nama dan tag. Titik di akhir berarti folder saat ini dipakai sebagai <i>build context</i>, yaitu kumpulan berkas yang dikirim ke Docker dan boleh disalin oleh COPY.</p>`,
      examples: [
        { lang: "file", filename: "halo.py", code: "print(\"Halo dari dalam container\")", note: "Ini isi berkas <code>halo.py</code>, bukan perintah PowerShell. Simpan dengan editor teks, misalnya VS Code." },
        { lang: "file", filename: "Dockerfile", code: "FROM python:3.14-slim\nWORKDIR /app\nCOPY halo.py .\nCMD [\"python\", \"halo.py\"]", note: "Ini isi berkas <code>Dockerfile</code>, bukan perintah PowerShell. Simpan di folder yang sama dengan <code>halo.py</code>." },
        { lang: "shell", code: "cd latihan-docker\\halo-python\ndocker build -t halo-python:1.0 .\ndocker run --rm halo-python:1.0", note: "Jalankan dari folder yang berisi Dockerfile. <code>docker run</code> mencetak <code>Halo dari dalam container</code>, lalu container berhenti dan langsung dihapus karena <code>--rm</code>. Image <code>halo-python:1.0</code> tetap ada." },
      ],
    },
    {
      title: "Docker Compose: beberapa layanan sekaligus",
      html: `<p>Beberapa perintah <code>docker run</code> panjang cepat merepotkan. <b>Docker Compose</b> membaca berkas YAML (format teks yang strukturnya ditentukan indentasi) bernama <code>compose.yaml</code> yang menjelaskan semua layanan (<i>service</i>), lalu menjalankan semuanya dengan satu perintah. Compose ikut terpasang di Docker Desktop dan dipanggil dengan <code>docker compose</code> (pakai spasi). <code>docker-compose</code> (pakai tanda hubung) adalah Compose versi 1 yang lama, dan kunci <code>version:</code> di berkas lama kini diabaikan.</p>
<p>Contoh di bawah menjalankan PostgreSQL dan pgAdmin (aplikasi web untuk mengelola PostgreSQL). Buat folder <code>latihan-compose</code> berisi <code>compose.yaml</code> dan <code>.env</code>. Yang perlu dipahami:</p>
<ul><li>Compose membuat satu jaringan untuk proyek, dan setiap layanan bisa dihubungi layanan lain dengan nama layanannya. Dari pgAdmin, alamat database adalah <code>db</code> port <code>5432</code> (port di dalam container), bukan <code>localhost</code>.</li>
<li>Nama proyek diambil dari nama folder, sehingga container bernama misalnya <code>latihan-compose-db-1</code>.</li>
<li>Bagian <code>volumes</code> paling bawah mendaftarkan volume bernama.</li>
<li><code>depends_on</code> menyalakan <code>db</code> sebelum <code>pgadmin</code>, tetapi tidak menunggu database siap menerima sambungan. Untuk menunggu, Compose punya <code>healthcheck</code> dengan <code>condition: service_healthy</code>.</li>
<li>Nilai seperti <code>POSTGRES_PASSWORD</code> diisi dari berkas <code>.env</code> di samping <code>compose.yaml</code>.</li>
<li>pgAdmin mewajibkan <code>PGADMIN_DEFAULT_EMAIL</code> dan <code>PGADMIN_DEFAULT_PASSWORD</code> untuk akun admin pertama. Email itu dipakai sebagai nama login; pgAdmin menolak domain khusus seperti <code>example.test</code>, jadi contoh ini memakai <code>user@domain.com</code> seperti dokumentasi pgAdmin. pgAdmin mendengarkan port 80 di dalam container, yang di sini dibuka sebagai port 5050.</li></ul>
<p><code>docker compose down</code> menghapus container dan jaringan proyek, tetapi volume bernama tetap ada. <code>docker compose down -v</code> juga menghapus volume bernama, dan datanya hilang permanen.</p>`,
      examples: [
        { lang: "file", filename: "compose.yaml", code: "services:\n  db:\n    image: postgres:18.7\n    environment:\n      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}\n    ports:\n      - \"5432:5432\"\n    volumes:\n      - pgdata:/var/lib/postgresql\n\n  pgadmin:\n    image: dpage/pgadmin4:9.19\n    environment:\n      PGADMIN_DEFAULT_EMAIL: \${PGADMIN_EMAIL}\n      PGADMIN_DEFAULT_PASSWORD: \${PGADMIN_PASSWORD}\n    ports:\n      - \"5050:80\"\n    depends_on:\n      - db\n    volumes:\n      - pgadmin-data:/var/lib/pgadmin\n\nvolumes:\n  pgdata:\n  pgadmin-data:", note: "Ini isi berkas <code>compose.yaml</code>, bukan perintah PowerShell. Indentasi memakai spasi, bukan tab. Tag <code>9.19</code> adalah rilis pgAdmin terbaru saat bab ini ditulis (29 Oktober 2026). Kalau container <code>latihan-pg</code> dari bagian sebelumnya masih berjalan, hentikan dulu karena keduanya memakai port 5432 di laptop." },
        { lang: "file", filename: ".env", code: "POSTGRES_PASSWORD=latihan123\nPGADMIN_EMAIL=user@domain.com\nPGADMIN_PASSWORD=latihan123", note: "Ini isi berkas <code>.env</code>, bukan perintah. Berkas ini berisi rahasia, jadi masukkan <code>.env</code> ke <code>.gitignore</code> supaya tidak ikut ter-commit." },
        { lang: "shell", code: "cd latihan-compose\ndocker compose up -d\ndocker compose ps\ndocker compose logs db\ndocker compose exec db psql -U postgres -c \"select version()\"\ndocker compose down", note: "<code>up -d</code> mengunduh image yang belum ada, membuat jaringan, volume, dan container, lalu menjalankannya di latar belakang. <code>ps</code> menampilkan container proyek ini saja. <code>exec</code> adalah padanan <code>docker exec</code> untuk sebuah layanan. Sebelum <code>down</code>, buka <code>http://localhost:5050</code>, masuk dengan email dan kata sandi dari <code>.env</code>, lalu tambahkan server dengan alamat <code>db</code>, port 5432, pengguna <code>postgres</code>. Jalankan <code>down</code> terakhir, setelah selesai berlatih." },
      ],
    },
    {
      title: "Rahasia jangan masuk ke image",
      html: `<p>Image bisa dikirim ke registry dan dibaca siapa pun yang punya akses ke sana. Jangan pernah menulis kata sandi atau kunci API (kode rahasia untuk mengakses suatu layanan) di Dockerfile, termasuk lewat <code>ENV</code> dan <code>ARG</code>: dokumentasi Docker menyebut nilai keduanya tetap tersimpan di image akhir. Jangan juga menyalin berkas rahasia ke image dengan COPY.</p>
<ul><li>Simpan rahasia di berkas <code>.env</code> di luar image, dan masukkan <code>.env</code> ke <code>.gitignore</code>.</li>
<li>Buat berkas <code>.dockerignore</code> (daftar berkas yang tidak ikut dikirim sebagai build context, mirip <code>.gitignore</code>) berisi <code>.env</code> dan <code>.git</code>, supaya <code>COPY . .</code> (menyalin seluruh isi folder) tidak ikut menyalin rahasia.</li>
<li>Untuk lingkungan sungguhan, dokumentasi Docker mengingatkan bahwa kata sandi di variabel lingkungan bisa bocor tanpa sengaja, dan menyarankan fitur <code>secrets</code> di Compose. Image postgres mendukungnya lewat <code>POSTGRES_PASSWORD_FILE</code>.</li></ul>
<p>Kata sandi <code>latihan123</code> di bab ini hanya layak untuk database latihan tanpa data sungguhan.</p>`,
    },
    {
      title: "Kebersihan: membuang yang tidak dipakai",
      html: `<p>Image, container yang sudah berhenti, volume, dan sisa proses build (<i>build cache</i>) terus memakan ruang disk. <code>docker system df</code> menampilkan ringkasannya; kolom RECLAIMABLE adalah ruang yang bisa dibebaskan karena tidak sedang dipakai.</p>
<ul><li><code>docker rm nama</code>, <code>docker image rm nama:tag</code>, dan <code>docker volume rm nama</code> menghapus satu container, image, atau volume.</li>
<li><code>docker system prune</code> menghapus semua container yang sudah berhenti, jaringan yang tidak dipakai, image tanpa nama, dan build cache, setelah meminta konfirmasi. Volume tidak ikut terhapus. Dengan <code>--volumes</code>, yang ikut terhapus hanya volume tanpa nama yang tidak dipakai.</li></ul>
<p>Periksa dulu dengan <code>docker ps -a</code> dan <code>docker volume ls</code> sebelum menghapus. Volume berisi database tidak bisa dikembalikan setelah dihapus.</p>`,
      examples: [
        { lang: "shell", code: "docker system df\ndocker ps -a\ndocker image ls\ndocker volume ls", note: "Empat perintah ini hanya menampilkan; tidak ada yang dihapus. Pakai hasilnya untuk memutuskan apa yang boleh dibuang." },
      ],
    },
  ],
  tsql: [],
  summary: [
    "Image adalah cetakan yang tidak berubah; container adalah image yang sedang berjalan; registry (Docker Hub) tempat image disimpan dan dibagikan.",
    "Untuk database, tulis tag yang pasti, misalnya <code>postgres:18.7</code>. Tanpa tag, Docker memakai <code>latest</code>, yang untuk postgres sekarang menunjuk ke versi 19.",
    "Di Windows 11, Docker Desktop memakai WSL 2 (minimal versi 2.1.5) untuk menjalankan container Linux.",
    "<code>docker run -d --name … -p laptop:container -e NAMA=nilai -v volume:/folder image:tag</code>; kelola dengan <code>ps</code>, <code>logs</code>, <code>stop</code>, <code>rm</code>.",
    "Data di lapisan tulis container hilang saat container dihapus. Simpan data database di volume bernama; untuk postgres 18 ke atas, pasang di <code>/var/lib/postgresql</code>.",
    "Dockerfile (FROM, WORKDIR, COPY, RUN, CMD) membangun image sendiri dengan <code>docker build -t nama:tag .</code>.",
    "<code>compose.yaml</code> menjalankan beberapa layanan dengan <code>docker compose up -d</code>; layanan saling memanggil dengan nama layanan; <code>down</code> menyimpan volume, <code>down -v</code> menghapusnya.",
    "Rahasia tidak boleh ada di image (termasuk ENV dan ARG). Simpan di <code>.env</code> yang masuk <code>.gitignore</code> dan <code>.dockerignore</code>.",
  ],
  drills: [
    {
      id: "tools-03-01", kind: "choice",
      prompt: "Pernyataan mana yang benar tentang image dan container?",
      options: [
        "Image adalah container yang sedang berjalan.",
        "Container dibuat dari image, dan satu image bisa dipakai untuk membuat banyak container.",
        "Menghapus container otomatis menghapus image-nya.",
        "Setiap perubahan berkas di dalam container langsung mengubah image-nya.",
      ],
      answer: 1,
      why: "Image adalah cetakan yang hanya bisa dibaca. Setiap container dari image itu mendapat lapisan tulis sendiri, sehingga perubahan di container tidak mengubah image. Image tetap tersimpan setelah container dihapus.",
      hint: "Ingat mana yang cetakan dan mana yang sedang berjalan.",
    },
    {
      id: "tools-03-02", kind: "choice",
      prompt: "Kamu menjalankan <code>docker run -d --name pg2 -e POSTGRES_PASSWORD=latihan123 -p 5433:5432 postgres:18.7</code>. Ke port berapa alat di laptopmu harus menyambung?",
      options: ["5432", "5433", "5050", "Tidak bisa disambung dari laptop"],
      answer: 1,
      why: "Pada <code>-p</code>, angka kiri adalah port di laptop dan angka kanan port di dalam container. PostgreSQL di dalam container tetap mendengarkan 5432, tetapi dari laptop kamu menyambung ke 5433.",
      hint: "Angka mana yang milik laptop: kiri atau kanan?",
    },
    {
      id: "tools-03-03", kind: "choice",
      prompt: "Kenapa bab ini menulis <code>postgres:18.7</code>, bukan <code>postgres</code> saja?",
      options: [
        "Karena tanpa tag, Docker menolak menjalankan image.",
        "Karena tanpa tag, Docker memakai <code>latest</code>, dan <code>latest</code> untuk image postgres sekarang menunjuk ke PostgreSQL 19, bukan 18.",
        "Karena tag <code>18.7</code> berpindah otomatis ke rilis terbaru.",
        "Karena image tanpa tag tidak punya volume.",
      ],
      answer: 1,
      why: "Tag yang tidak ditulis berarti <code>latest</code>. Image yang ditunjuk <code>latest</code> berganti seiring rilis baru, termasuk pindah ke versi utama berikutnya, sehingga perintah yang sama bisa menghasilkan versi berbeda di hari lain. Tag <code>18.7</code> tetap berisi PostgreSQL 18.7.",
      hint: "Tag apa yang dipakai Docker kalau kamu tidak menulis tag?",
    },
    {
      id: "tools-03-04", kind: "paste",
      prompt: "Pastikan perintah <code>docker</code> sudah terpasang. Jalankan perintah di bawah, lalu tempel keluarannya.",
      command: "docker --version",
      expect: String.raw`Docker version \d+\.\d+\.\d+`,
      sampleOutput: "Docker version 28.4.0, build d8eb465",
      why: "Keluaran <code>Docker version …, build …</code> menunjukkan perintah <code>docker</code> ada di PATH dan bisa dijalankan dari PowerShell. Angka versinya boleh berbeda.",
      hint: "Kalau PowerShell menjawab bahwa <code>docker</code> tidak dikenal, buka dulu Docker Desktop, lalu buka jendela PowerShell baru.",
    },
    {
      id: "tools-03-05", kind: "paste",
      prompt: "Jalankan container uji pertama, lalu tempel seluruh keluarannya.",
      command: "docker run hello-world",
      expect: String.raw`Hello from Docker!`,
      sampleOutput: "Unable to find image 'hello-world:latest' locally\nlatest: Pulling from library/hello-world\nStatus: Downloaded newer image for hello-world:latest\n\nHello from Docker!\nThis message shows that your installation appears to be working correctly.\n\nTo generate this message, Docker took the following steps:\n 1. The Docker client contacted the Docker daemon.\n 2. The Docker daemon pulled the \"hello-world\" image from the Docker Hub.\n    (amd64)\n 3. The Docker daemon created a new container from that image which runs the\n    executable that produces the output you are currently reading.\n 4. The Docker daemon streamed that output to the Docker client, which sent it\n    to your terminal.",
      why: "Pesan <code>Hello from Docker!</code> hanya muncul kalau Docker berhasil mengunduh image, membuat container, dan menjalankannya. Baris \"Unable to find image\" di awal wajar: image belum ada di laptopmu, jadi Docker mengunduhnya.",
      hint: "Docker Desktop harus sedang berjalan. Kalau muncul error yang menyebut Docker tidak bisa dihubungi, buka Docker Desktop, tunggu sampai selesai menyala, lalu ulangi.",
    },
    {
      id: "tools-03-06", kind: "paste",
      prompt: "Jalankan PostgreSQL 18 dengan volume bernama <code>latihan-pgdata</code>, lalu tampilkan daftar container yang berjalan. Tempel keluarannya. Kalau container <code>latihan-pg</code> sudah kamu buat dari contoh di atas dan masih berjalan, cukup jalankan baris kedua.",
      command: "docker run -d --name latihan-pg -e POSTGRES_PASSWORD=latihan123 -p 5432:5432 -v latihan-pgdata:/var/lib/postgresql postgres:18.7\ndocker ps",
      expect: String.raw`postgres:18\.\d+.*\bUp\b.*latihan-pg`,
      sampleOutput: "5b1d0c8e3f4a92d7c6e1b0a9f8e7d6c5b4a39281706f5e4d3c2b1a0918273645\nCONTAINER ID   IMAGE           COMMAND                  CREATED          STATUS          PORTS                                         NAMES\n5b1d0c8e3f4a   postgres:18.7   \"docker-entrypoint.s…\"   12 seconds ago   Up 11 seconds   0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp   latihan-pg",
      why: "Baris pertama keluaran adalah id container yang dicetak <code>docker run -d</code>. Di tabel <code>docker ps</code>, kolom STATUS berisi <code>Up …</code> yang berarti container berjalan, dan kolom PORTS menunjukkan port 5432 laptop diteruskan ke port 5432 container.",
      hint: "Kalau STATUS tidak muncul atau container tidak ada di daftar, jalankan <code>docker logs latihan-pg</code> dan baca pesan errornya. Salah satu penyebabnya: port 5432 sudah dipakai program lain.",
    },
    {
      id: "tools-03-07", kind: "paste",
      prompt: "Jalankan satu query di dalam container lewat <code>psql</code>, lalu tempel keluarannya.",
      command: "docker exec latihan-pg psql -U postgres -c \"select version()\"",
      expect: String.raw`PostgreSQL 18\.\d+`,
      sampleOutput: "                                                       version\n--------------------------------------------------------------------------------------------------------------------\n PostgreSQL 18.7 (Debian 18.7-1.pgdg13+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 14.2.0-19) 14.2.0, 64-bit\n(1 row)",
      why: "<code>docker exec</code> menjalankan <code>psql</code> yang ada di dalam image. <code>-c</code> membuat psql menjalankan satu perintah lalu selesai. Kata sandi tidak diminta karena sambungan berasal dari dalam container yang sama.",
      hint: "Kalau muncul error sambungan tepat setelah container dibuat, tunggu beberapa detik lalu ulangi. Perhatikan tanda kutip ganda di sekitar query.",
    },
    {
      id: "tools-03-08", kind: "paste",
      prompt: "Buktikan bahwa data di volume bertahan setelah container dihapus. Jalankan dulu tiga perintah ini satu per satu:<pre class=\"sh\"><code>docker exec latihan-pg psql -U postgres -c \"create table catatan (isi text); insert into catatan values ('masih ada');\"\ndocker rm -f latihan-pg\ndocker run -d --name latihan-pg -e POSTGRES_PASSWORD=latihan123 -p 5432:5432 -v latihan-pgdata:/var/lib/postgresql postgres:18.7</code></pre>Tunggu beberapa detik, lalu jalankan perintah di bawah dan tempel keluarannya.",
      command: "docker exec latihan-pg psql -U postgres -c \"select isi from catatan\"",
      expect: String.raw`^\s*masih ada\s*$[\s\S]*\(\d+ rows?\)`,
      sampleOutput: "    isi\n-----------\n masih ada\n(1 row)",
      why: "Container lama sudah dihapus, tetapi container baru memasang volume <code>latihan-pgdata</code> yang sama, sehingga tabel <code>catatan</code> masih ada. Log container baru juga menulis <code>Skipping initialization</code>, karena volumenya sudah berisi database.",
      hint: "Pastikan perintah <code>docker run</code> yang kedua memakai <code>-v latihan-pgdata:/var/lib/postgresql</code> yang sama persis. Tanpa volume itu, container baru membuat database kosong.",
    },
    {
      id: "tools-03-09", kind: "paste",
      prompt: "Buat folder berisi <code>halo.py</code> dan <code>Dockerfile</code> seperti di bagian Dockerfile. Dari folder itu, bangun image lalu jalankan. Tempel seluruh keluarannya.",
      command: "docker build -t halo-python:1.0 .\ndocker run --rm halo-python:1.0",
      expect: String.raw`^Halo dari dalam container\s*$`,
      sampleOutput: "[+] Building 8.4s (8/8) FINISHED\n => [internal] load build definition from Dockerfile                        0.0s\n => [internal] load metadata for docker.io/library/python:3.14-slim         1.9s\n => [internal] load .dockerignore                                           0.0s\n => [1/3] FROM docker.io/library/python:3.14-slim                           5.6s\n => [internal] load build context                                           0.0s\n => [2/3] WORKDIR /app                                                      0.3s\n => [3/3] COPY halo.py .                                                    0.0s\n => exporting to image                                                      0.4s\n => => naming to docker.io/library/halo-python:1.0                          0.0s\nHalo dari dalam container",
      why: "<code>docker build</code> membaca Dockerfile dan membangun image <code>halo-python:1.0</code> lapis demi lapis. <code>docker run</code> lalu menjalankan CMD dari image itu, yaitu <code>python halo.py</code>, yang mencetak satu baris.",
      hint: "Kalau Docker tidak menemukan Dockerfile, kamu belum berada di folder yang benar, atau nama berkasnya berakhiran <code>.txt</code>. Periksa dengan <code>Get-ChildItem</code>.",
    },
    {
      id: "tools-03-10", kind: "paste",
      prompt: "Buat folder <code>latihan-compose</code> berisi <code>compose.yaml</code> dan <code>.env</code> seperti di bagian Docker Compose. Hentikan dulu container <code>latihan-pg</code> kalau masih berjalan (<code>docker stop latihan-pg</code>), karena keduanya memakai port 5432. Dari folder itu, jalankan perintah di bawah dan tempel keluarannya.",
      command: "docker compose up -d\ndocker compose ps",
      expect: String.raw`^(?=[\s\S]*-db-1\s+postgres:18\.\d+\s.*\bUp\b)(?=[\s\S]*-pgadmin-1\s+dpage/pgadmin4:\S+\s.*\bUp\b)`,
      sampleOutput: "[+] Running 5/5\n ✔ Network latihan-compose_default           Created   0.1s\n ✔ Volume \"latihan-compose_pgdata\"            Created   0.0s\n ✔ Volume \"latihan-compose_pgadmin-data\"      Created   0.0s\n ✔ Container latihan-compose-db-1             Started   0.6s\n ✔ Container latihan-compose-pgadmin-1        Started   0.9s\nNAME                        IMAGE                 COMMAND                  SERVICE   CREATED          STATUS          PORTS\nlatihan-compose-db-1        postgres:18.7         \"docker-entrypoint.s…\"   db        10 seconds ago   Up 9 seconds    0.0.0.0:5432->5432/tcp, [::]:5432->5432/tcp\nlatihan-compose-pgadmin-1   dpage/pgadmin4:9.19   \"/entrypoint.sh\"         pgadmin   10 seconds ago   Up 9 seconds    0.0.0.0:5050->80/tcp, [::]:5050->80/tcp",
      why: "<code>docker compose ps</code> menampilkan dua container milik proyek ini, masing-masing dengan STATUS <code>Up …</code>. Nama container diawali nama folder proyek, diikuti nama layanan dan nomor.",
      hint: "Kalau Compose mengeluh variabel belum diisi, periksa bahwa berkas <code>.env</code> ada di folder yang sama dengan <code>compose.yaml</code> dan namanya persis <code>.env</code>. Kalau sebuah container tidak <code>Up</code>, baca lognya dengan <code>docker compose logs nama-layanan</code>.",
    },
    {
      id: "tools-03-11", kind: "choice",
      prompt: "pgAdmin berjalan sebagai layanan <code>pgadmin</code> di <code>compose.yaml</code> bab ini. Saat menambahkan server di pgAdmin, alamat dan port mana yang benar untuk database?",
      options: ["localhost, port 5432", "db, port 5432", "localhost, port 5050", "db, port 80"],
      answer: 1,
      why: "pgAdmin berjalan di container sendiri, jadi <code>localhost</code> baginya adalah container pgAdmin itu, bukan laptopmu. Compose menaruh semua layanan di satu jaringan, dan setiap layanan bisa dihubungi dengan nama layanannya. Port yang dipakai adalah port di dalam container database, yaitu 5432.",
      hint: "Dari dalam jaringan Compose, layanan saling memanggil dengan nama apa?",
    },
    {
      id: "tools-03-12", kind: "choice",
      prompt: "Kamu membuat tabel di database layanan <code>db</code>, lalu menjalankan <code>docker compose down</code> dan <code>docker compose up -d</code> lagi. Apa yang terjadi dengan tabel itu?",
      options: [
        "Hilang, karena <code>down</code> menghapus semua yang dibuat <code>up</code>.",
        "Masih ada, karena <code>down</code> tanpa <code>-v</code> tidak menghapus volume bernama <code>pgdata</code>.",
        "Masih ada, karena data database disimpan di dalam image <code>postgres:18.7</code>.",
        "Hilang, karena container baru selalu membuat database kosong.",
      ],
      answer: 1,
      why: "Secara bawaan, <code>docker compose down</code> hanya menghapus container dan jaringan. Volume bernama yang didaftarkan di bagian <code>volumes</code> tetap ada, dan dipasang lagi oleh <code>up</code> berikutnya. Hanya <code>down -v</code> yang menghapus volume itu.",
      hint: "Bedakan <code>down</code> dan <code>down -v</code>.",
    },
    {
      id: "tools-03-13", kind: "paste",
      prompt: "Lihat berapa ruang disk yang dipakai Docker di laptopmu, lalu tempel keluarannya.",
      command: "docker system df",
      expect: String.raw`TYPE\s+TOTAL\s+ACTIVE\s+SIZE\s+RECLAIMABLE[\s\S]*Local Volumes`,
      sampleOutput: "TYPE            TOTAL     ACTIVE    SIZE      RECLAIMABLE\nImages          4         2         1.21GB    612.4MB (50%)\nContainers      2         2         1.3MB     0B (0%)\nLocal Volumes   3         2         61.7MB    48.2MB (78%)\nBuild Cache     9         0         2.18kB    2.18kB",
      why: "Kolom RECLAIMABLE menunjukkan ruang yang bisa dibebaskan karena tidak sedang dipakai. Angka di baris Local Volumes termasuk volume database; periksa dulu isinya sebelum menghapus.",
      hint: "Perintah ini hanya menampilkan, tidak menghapus apa pun. Docker Desktop harus sedang berjalan.",
    },
    {
      id: "tools-03-14", kind: "explain",
      prompt: "Rekanmu menulis <code>ENV DB_PASSWORD=rahasia123</code> di Dockerfile, lalu mengirim image-nya ke Docker Hub. Jelaskan masalahnya dan cara yang lebih aman.",
      model: "Nilai ENV ikut tersimpan di image akhir, jadi siapa pun yang bisa mengunduh image itu bisa membaca kata sandinya. Kata sandi itu harus dianggap bocor dan diganti. Cara yang lebih aman: kata sandi tidak ditulis di Dockerfile sama sekali, melainkan diberikan saat container dijalankan, misalnya dari berkas .env yang masuk .gitignore dan .dockerignore. Untuk lingkungan sungguhan, pakai fitur secrets di Compose; image postgres bisa membaca kata sandi dari berkas lewat POSTGRES_PASSWORD_FILE.",
      hint: "Apa saja yang ikut tersimpan di image, dan siapa yang bisa membaca image di registry?",
    },
    {
      id: "tools-03-15", kind: "explain", level: "wawancara",
      prompt: "Pertanyaan wawancara: \"Apa beda image dan container? Kalau kami menjalankan PostgreSQL di container, kenapa datanya harus disimpan di volume?\" Jawab dengan kalimatmu sendiri.",
      model: "Image adalah paket yang hanya bisa dibaca, berisi program dan semua kebutuhannya; container adalah image yang sedang dijalankan, dan dari satu image bisa dibuat banyak container. Setiap container punya lapisan tulis sendiri, dan lapisan itu ikut hilang saat container dihapus. Container sering dihapus dan dibuat ulang, misalnya saat memperbarui image dari 18.7 ke rilis 18 berikutnya, jadi data yang hanya ada di lapisan tulis akan hilang. Volume dikelola Docker terpisah dari container, sehingga data database tetap ada dan bisa dipasang ke container baru. Untuk image postgres 18 ke atas, volumenya dipasang di /var/lib/postgresql. Volume juga perlu dicadangkan, karena menghapus volume berarti menghapus datanya.",
      hint: "Jelaskan dulu apa yang terjadi pada berkas di container saat container dihapus.",
    },
  ],
};
