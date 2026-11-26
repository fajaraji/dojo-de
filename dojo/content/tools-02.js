// Bagian 3, bab 2: Git dan GitHub (tiket A02, rencana docs/superpowers/plans/2026-11-26-dojo-bagian-3-8.md).
// Fakta Git dicek lewat Context7 /websites/git-scm dan /git/htmldocs; fakta GitHub lewat /github/docs.
// Keluaran contoh berasal dari repo latihan sungguhan (Git 2.56, Windows PowerShell 5.1).
export default {
  id: "tools-02",
  part: "tools",
  title: "Git dan GitHub",
  minutes: 75,
  goals: [
    "Menjelaskan gunanya version control dan perbedaan working tree, staging area, dan commit.",
    "Membuat repo, mencatat perubahan dengan <code>git add</code> dan <code>git commit</code>, lalu membaca riwayat dengan <code>git log --oneline</code> dan <code>git diff</code>.",
    "Menulis pesan commit yang baik dalam bahasa Inggris dengan bentuk perintah.",
    "Membuat branch, berpindah dengan <code>git switch</code>, menggabungkan dengan <code>git merge</code>, dan menyelesaikan konflik merge.",
    "Menjaga data, kata sandi, dan berkas <code>.env</code> keluar dari repo dengan <code>.gitignore</code>.",
    "Bekerja dengan GitHub: <code>clone</code>, <code>push</code>, <code>pull</code>, <code>fetch</code>, pull request, dan review.",
  ],
  terms: [
    { term: "git", def: "Program version control yang mencatat riwayat perubahan berkas di sebuah folder proyek. Setiap salinan repo menyimpan riwayat lengkapnya sendiri." },
    { term: "repo", def: "Singkatan repository: folder proyek yang riwayatnya dicatat Git. Catatannya disimpan di subfolder tersembunyi <code>.git</code>." },
    { term: "branch", def: "Jalur kerja bernama di dalam repo. Secara teknis, branch adalah penunjuk ke satu commit yang ikut maju setiap kali kamu membuat commit baru di branch itu." },
    { term: "version control", def: "Sistem yang mencatat setiap versi berkas beserta siapa yang mengubah, kapan, dan kenapa, sehingga versi lama bisa dilihat atau dikembalikan." },
    { term: "commit", def: "Satu potret isi proyek yang disimpan ke riwayat, lengkap dengan nama pembuat, waktu, dan pesan. Setiap commit punya kode unik (hash)." },
    { term: "working tree", def: "Berkas di folder proyek yang kamu lihat dan ubah sehari-hari." },
    { term: "staging area", def: "Daftar perubahan yang sudah kamu pilih untuk masuk ke commit berikutnya. Di dokumentasi Git juga disebut index." },
    { term: "merge", def: "Menggabungkan riwayat satu branch ke branch lain." },
    { term: "konflik merge", def: "Keadaan saat Git tidak bisa menggabungkan dua branch sendiri karena keduanya mengubah bagian yang sama dari satu berkas. Kamu yang memutuskan isi akhirnya." },
    { term: "remote", def: "Salinan repo di tempat lain, misalnya di GitHub, yang dipakai untuk bertukar commit. Remote bawaan hasil clone bernama origin." },
    { term: "pull request", def: "Usulan di GitHub untuk menggabungkan commit dari satu branch ke branch lain, tempat rekan meninjau perubahan sebelum digabung." },
    { term: ".gitignore", def: "Berkas berisi pola nama berkas dan folder yang tidak boleh dicatat Git, misalnya data dan berkas rahasia." },
  ],
  introduces: [],
  sections: [
    {
      title: "Kenapa perlu version control",
      html: `<p><b>Version control</b> adalah sistem yang mencatat setiap versi berkas: apa yang berubah, siapa yang mengubah, kapan, dan kenapa. Tanpa sistem ini, orang menyimpan salinan seperti <code>laporan_final.sql</code> dan <code>laporan_final2.sql</code>. Tidak ada yang tahu mana yang terbaru, dan perubahan dua orang mudah saling menimpa.</p>
<p><b>Git</b> adalah program version control yang gratis dan terbuka. Folder proyek yang riwayatnya dicatat Git disebut <b>repo</b> (dari <i>repository</i>, tempat penyimpanan). Catatannya disimpan di subfolder tersembunyi <code>.git</code>. Setiap salinan repo menyimpan riwayat lengkap, jadi kamu bisa mencatat perubahan dan melihat riwayat tanpa internet.</p>
<p><b>GitHub</b> adalah layanan web untuk menyimpan repo Git secara daring, berbagi dengan tim, dan meninjau perubahan. Git adalah program di laptopmu; GitHub adalah tempat menyimpan dan berkolaborasi.</p>
<p>Data engineer menyimpan query SQL, skrip, dan konfigurasi di Git.</p>`,
      examples: [],
    },
    {
      title: "Memasang Git dan konfigurasi awal",
      html: `<p>Di Windows, Git dipasang lewat paket Git for Windows. Cek hasilnya di PowerShell dengan <code>git --version</code>; tulisan <code>git version</code> diikuti angka berarti Git siap.</p>
<p>Sebelum mencatat perubahan pertama, perkenalkan dirimu ke Git. Nama dan email ini dicatat sebagai pembuat setiap perubahan yang kamu simpan. Opsi <code>--global</code> menyimpannya di berkas <code>.gitconfig</code> di folder pengguna, sehingga berlaku untuk semua repo di laptop itu. Pakai email akun GitHub-mu. Nama dan email ini hanya label, bukan cara masuk ke GitHub.</p>
<p>Pengaturan <code>init.defaultBranch</code> menentukan nama branch (jalur kerja, dijelaskan di bawah) pertama di repo baru. Menurut dokumentasi Git, nama bawaannya saat ini <code>master</code> dan akan menjadi <code>main</code> di Git 3.0. GitHub sudah memakai <code>main</code>, jadi atur ke <code>main</code>.</p>`,
      examples: [
        { lang: "shell", code: `git --version
git config --global user.name "Nama Kamu"
git config --global user.email "nama@example.com"
git config --global init.defaultBranch main
git config --global --list`, note: "Ganti nama dan email dengan milikmu. Perintah terakhir menampilkan semua pengaturan global, sehingga kamu bisa memeriksa ketiga isian tadi." },
      ],
    },
    {
      title: "Working tree, staging area, dan commit",
      html: `<p>Git membagi pekerjaanmu menjadi tiga tempat:</p>
<ul><li><b><i>Working tree</i></b> (pohon kerja): berkas di folder proyek yang kamu lihat dan ubah.</li>
<li><b><i>Staging area</i></b> (area persiapan), di dokumentasi Git juga disebut <i>index</i>: daftar perubahan yang sudah kamu pilih untuk disimpan berikutnya.</li>
<li><b>Riwayat</b>: kumpulan <b><i>commit</i></b>. Satu commit adalah potret isi proyek saat itu, lengkap dengan nama pembuat, waktu, dan pesan.</li></ul>
<p>Lima perintah dasar:</p>
<ul><li><code>git init</code> membuat repo dengan membuat subfolder <code>.git</code>.</li>
<li><code>git status</code> meringkas berkas mana yang baru, berubah, atau sudah di staging area.</li>
<li><code>git add nama-berkas</code> memasukkan isi berkas saat itu ke staging area. Kalau berkas diubah lagi, jalankan <code>git add</code> lagi.</li>
<li><code>git commit -m "pesan"</code> menyimpan isi staging area menjadi commit baru, dengan pesan dari opsi <code>-m</code>.</li>
<li><code>git log --oneline</code> menampilkan riwayat, satu commit per baris.</li></ul>
<p>Setiap commit punya <i>hash</i>, kode unik 40 karakter dari angka 0–9 dan huruf a–f. <code>--oneline</code> hanya menampilkan awalnya, misalnya <code>3874371</code>; hash di laptopmu pasti berbeda.</p>
<p>Di contoh, <code>Set-Content</code> adalah perintah PowerShell yang menulis teks ke berkas dan menimpa isi lamanya. Opsi <code>-b main</code> memastikan branch pertama bernama <code>main</code>.</p>
<p>Staging area membuat satu commit berisi satu perubahan utuh: dari tiga berkas yang diubah, <code>git add</code> hanya dua yang selesai, lalu commit.</p>
<p>Kesalahan umum: <code>git commit</code> sebelum <code>git add</code>. Git menolak karena belum ada yang dipilih.</p>`,
      examples: [
        { lang: "shell", code: `cd $HOME
mkdir latihan-git
cd latihan-git
git init -b main
Set-Content laporan.sql "select count(*) from app.orders;"
git status
git add laporan.sql
git status
git commit -m "Add order count query"
git log --oneline`, note: "git status pertama menampilkan laporan.sql di bagian Untracked files (berkas yang belum dicatat). Setelah git add, berkas itu pindah ke Changes to be committed. git log --oneline lalu menampilkan satu baris, misalnya 3874371 (HEAD -> main) Add order count query. HEAD adalah penanda posisimu sekarang: commit terakhir di branch main." },
      ],
    },
    {
      title: "Melihat perubahan dengan git diff",
      html: `<p><code>git diff</code> menampilkan perbedaan isi berkas, baris demi baris. Baris berawalan <code>-</code> adalah isi lama, baris berawalan <code>+</code> adalah isi baru. Ada dua bentuk yang paling sering dipakai:</p>
<ul><li><code>git diff</code> tanpa opsi: perubahan di working tree yang <b>belum</b> masuk staging area.</li>
<li><code>git diff --staged</code>: perubahan yang <b>sudah</b> masuk staging area, yaitu isi commit kalau kamu commit sekarang. <code>--staged</code> sama artinya dengan <code>--cached</code>.</li></ul>
<p>Biasakan membaca <code>git diff --staged</code> sebelum commit, supaya baris uji coba yang lupa dihapus tidak ikut tersimpan.</p>
<p>Perubahan yang salah dan belum di-commit bisa dibuang dengan <code>git restore nama-berkas</code>: berkas kembali ke isi terakhir yang tercatat, dan perubahannya hilang. <code>git restore --staged nama-berkas</code> hanya mengeluarkan berkas dari staging area tanpa mengubah isinya.</p>`,
      examples: [
        { lang: "shell", code: `Set-Content laporan.sql "select count(*) from app.orders where status = 'completed';"
git diff
git restore laporan.sql
git status`, note: "git diff menampilkan baris lama dengan tanda - dan baris baru dengan tanda +. Setelah git restore, git status melaporkan working tree clean (tidak ada perubahan), karena berkas kembali ke isi commit terakhir." },
      ],
    },
    {
      title: "Pesan commit yang baik",
      html: `<p>Pesan commit menjawab pertanyaan rekan, atau dirimu sendiri berbulan-bulan kemudian: "kenapa baris ini berubah?". Aturan yang dipakai luas:</p>
<ul><li><b>Baris pertama pendek</b>, sekitar 50 karakter paling banyak. Dokumentasi Git menyebutnya judul commit; judul inilah yang tampil di <code>git log --oneline</code>.</li>
<li><b>Bentuk perintah</b> (<i>imperative mood</i>), seolah menyuruh kode berubah: "Add order count query", bukan "Added ...". Panduan kontribusi proyek Git sendiri meminta bentuk ini.</li>
<li><b>Tanpa titik</b> di akhir judul.</li>
<li>Kalau perlu, beri baris kosong, lalu jelaskan <b>kenapa</b>. Isi perubahannya sudah terlihat di diff.</li></ul>
<p>Tulis dalam bahasa Inggris, karena tim internasional, termasuk tim remote di UK, membaca riwayat yang sama. Contoh buruk: <code>update</code>, <code>fix bug</code>, <code>wip</code>. Contoh baik: <code>Exclude cancelled orders from daily revenue</code>, <code>Fix date filter in monthly sales query</code>.</p>`,
      examples: [
        { lang: "shell", code: `git commit -m "Exclude cancelled orders from daily revenue" -m "Finance reports net revenue, so cancelled orders must not be counted."`, note: "Contoh saja, tidak perlu dijalankan. Opsi -m boleh dipakai dua kali: yang pertama menjadi judul (pendek, bentuk perintah), yang kedua menjadi paragraf penjelasan berisi alasan bisnisnya." },
      ],
    },
    {
      title: "Branch dan git switch",
      html: `<p><b><i>Branch</i></b> (cabang) adalah jalur kerja bernama di dalam repo. Secara teknis, branch hanyalah penunjuk ke satu commit. Setiap kali kamu commit di sebuah branch, penunjuknya maju ke commit baru itu.</p>
<p>Dengan branch, perubahan dikerjakan terpisah tanpa mengganggu <code>main</code>, yang berisi versi yang sudah diperiksa. Eksperimen yang gagal cukup dibuang bersama branch-nya.</p>
<ul><li><code>git switch -c nama-branch</code> membuat branch baru dari posisi sekarang, lalu langsung pindah ke sana.</li>
<li><code>git switch nama-branch</code> pindah ke branch yang sudah ada. Isi working tree ikut berubah sesuai branch tujuan.</li>
<li><code>git branch</code> menampilkan daftar branch. Branch tempatmu berada diberi tanda bintang <code>*</code>.</li>
<li><code>git branch -d nama-branch</code> menghapus branch yang sudah digabung. Git menolak dengan pesan <code>not fully merged</code> kalau commit-nya belum digabung ke branch tempatmu berada.</li></ul>
<p>Beri nama yang menjelaskan isinya, huruf kecil dengan tanda hubung, misalnya <code>fix-monthly-revenue</code>.</p>`,
      examples: [
        { lang: "shell", code: `git switch -c filter-status
Set-Content laporan.sql "select count(*) from app.orders where status = 'completed';"
git add laporan.sql
git diff --staged
git commit -m "Count only completed orders"
git branch`, note: "git branch menampilkan dua baris: * filter-status dan main. Tanda bintang menunjukkan kamu sedang berada di filter-status. Commit baru ini belum ada di main." },
      ],
    },
    {
      title: "Menggabungkan branch dengan git merge",
      html: `<p><b><i>Merge</i></b> menggabungkan riwayat branch lain ke branch tempatmu berada. Caranya: pindah dulu ke branch <b>tujuan</b>, lalu jalankan <code>git merge nama-branch-sumber</code>.</p>
<p>Ada dua kemungkinan hasil:</p>
<ul><li><b><i>Fast-forward</i></b> (maju lurus). Terjadi kalau branch tujuan tidak punya commit baru sejak branch sumber dibuat. Git cukup memajukan penunjuk branch tujuan ke commit terakhir branch sumber. Tidak ada commit baru yang dibuat.</li>
<li><b>Merge commit.</b> Terjadi kalau kedua branch sama-sama punya commit baru. Git membuat satu commit baru dengan dua induk, satu dari setiap branch.</li></ul>
<p>Pada contoh, <code>main</code> belum berubah sejak <code>filter-status</code> dibuat, jadi hasilnya fast-forward.</p>
<p>Cara lain adalah <code>git rebase</code>: commit branch-mu dibuat ulang di atas ujung branch lain, sehingga riwayatnya lurus tanpa merge commit. Karena commit dibuat ulang, hash-nya berubah. Dokumentasi Git memperingatkan agar riwayat yang sudah dibagikan tidak di-rebase. Bab ini memakai merge saja.</p>`,
      examples: [
        { lang: "shell", code: `git switch main
git merge filter-status
git log --oneline
git branch -d filter-status`, note: "Keluaran merge memuat Updating 3874371..339aacf dan Fast-forward (hash-mu berbeda). Setelah digabung, branch filter-status aman dihapus karena commit-nya sudah ada di main." },
      ],
    },
    {
      title: "Konflik merge dan cara menyelesaikannya",
      html: `<p><b>Konflik merge</b> terjadi kalau dua branch mengubah baris yang sama di berkas yang sama. Git berhenti dan meminta kamu memutuskan. Konflik itu normal dan tidak merusak apa pun.</p>
<p>Saat konflik, Git menulis kedua versi ke dalam berkas, dibatasi penanda:</p>
<pre>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD
select count(*) as jumlah_pesanan from app.orders where status = 'completed';
=======
select count(*) from app.orders where status in ('completed', 'shipped');
&gt;&gt;&gt;&gt;&gt;&gt;&gt; tambah-shipped</pre>
<p>Bagian antara <code>&lt;&lt;&lt;&lt;&lt;&lt;&lt; HEAD</code> dan <code>=======</code> adalah versi branch tempatmu berada (di sini <code>main</code>). Bagian antara <code>=======</code> dan <code>&gt;&gt;&gt;&gt;&gt;&gt;&gt;</code> adalah versi branch yang digabung. <code>git status</code> menandai berkasnya sebagai <i>both modified</i> (diubah di kedua branch).</p>
<p>Langkah menyelesaikannya:</p>
<ol><li>Tulis isi akhir yang benar. Sering kali isinya menggabungkan kedua maksud: di contoh, nama kolom dari <code>main</code> dan filter status dari <code>tambah-shipped</code>.</li>
<li>Hapus semua baris penanda.</li>
<li><code>git add nama-berkas</code> menandai konflik selesai.</li>
<li><code>git commit</code> membuat merge commit. Pesannya sudah disiapkan Git; opsi <code>--no-edit</code> memakai pesan itu tanpa membuka program penyunting teks.</li></ol>
<p>Kalau belum siap memutuskan, <code>git merge --abort</code> mengembalikan keadaan seperti sebelum merge. <code>git log --oneline --graph</code> menggambar riwayat dengan garis: dua jalur yang bercabang lalu bertemu di merge commit.</p>
<p>Kesalahan umum: lupa menghapus baris penanda, lalu <code>git add</code>. Query berisi <code>=======</code> ikut tersimpan dan gagal saat dijalankan. Baca ulang berkasnya sebelum <code>git add</code>.</p>`,
      examples: [
        { lang: "shell", code: `git switch -c tambah-shipped
Set-Content laporan.sql "select count(*) from app.orders where status in ('completed', 'shipped');"
git add laporan.sql
git commit -m "Include shipped orders in count"
git switch main
Set-Content laporan.sql "select count(*) as jumlah_pesanan from app.orders where status = 'completed';"
git add laporan.sql
git commit -m "Name the order count column"
git merge tambah-shipped
git status
Get-Content laporan.sql`, note: "git merge melaporkan CONFLICT (content): Merge conflict in laporan.sql. Get-Content (perintah PowerShell untuk menampilkan isi berkas) memperlihatkan kedua versi di antara penanda konflik." },
        { lang: "shell", code: `Set-Content laporan.sql "select count(*) as jumlah_pesanan from app.orders where status in ('completed', 'shipped');"
git add laporan.sql
git commit --no-edit
git log --oneline --graph`, note: "Grafiknya menunjukkan merge commit Merge branch 'tambah-shipped' di paling atas, lalu dua jalur: satu berisi Include shipped orders in count, satu berisi Name the order count column." },
      ],
    },
    {
      title: "Berkas yang tidak boleh masuk repo: .gitignore",
      html: `<p>Tiga kelompok berkas proyek data harus dijauhkan dari repo:</p>
<ul><li><b>Data</b>: unduhan, ekspor CSV, cadangan database. Berkasnya besar dan bisa memuat data pribadi pelanggan. GitHub memberi peringatan untuk berkas di atas 50 MiB dan menolak berkas di atas 100 MiB.</li>
<li><b>Rahasia</b> (<i>credentials</i>): kata sandi database, kunci akses layanan, token.</li>
<li><b>Berkas <code>.env</code></b>: berkas teks berisi pengaturan lokal yang biasanya rahasia, misalnya <code>DB_PASSWORD=...</code>. Jangan pernah di-commit.</li></ul>
<p>Caranya dengan berkas <b><code>.gitignore</code></b> di folder utama repo, satu pola per baris:</p>
<ul><li><code>data/</code>: folder data beserta seluruh isinya.</li>
<li><code>.env</code>: berkas bernama .env.</li>
<li><code>*.csv</code>: semua berkas berakhiran .csv. Tanda <code>*</code> cocok dengan teks apa pun kecuali garis miring.</li>
<li>Baris berawalan <code>#</code> adalah komentar; pola berawalan <code>!</code> mengecualikan berkas dari pola sebelumnya.</li></ul>
<p><code>.gitignore</code> sendiri di-commit supaya berlaku untuk seluruh tim. Contoh siap pakai tersedia di repo publik github/gitignore.</p>
<ul><li><code>.gitignore</code> hanya berlaku untuk berkas yang <b>belum</b> dicatat. Berkas yang terlanjur di-commit dikeluarkan dulu dengan <code>git rm --cached nama-berkas</code> (berkas di laptop tetap ada), lalu polanya ditambahkan.</li>
<li>Rahasia yang terlanjur di-push ke GitHub harus dianggap bocor. Menurut dokumentasi GitHub, langkah pertama adalah mencabut atau mengganti rahasianya. Menghapus berkas lewat commit baru tidak cukup, karena isinya masih ada di riwayat.</li></ul>
<p>Sebagai gantinya, commit <code>.env.example</code> berisi nama pengaturan dengan nilai kosong.</p>`,
      examples: [
        { lang: "shell", code: `mkdir data
Set-Content data\\orders.csv "order_id,status"
Set-Content .env "DB_PASSWORD=contoh-saja"
git status
Set-Content .gitignore "data/", ".env"
git status
git add .gitignore
git commit -m "Ignore local data and secrets"`, note: "git status pertama menampilkan .env dan data/ sebagai berkas yang belum dicatat. Setelah .gitignore dibuat (dua pola, satu per baris), git status kedua hanya menampilkan .gitignore." },
      ],
    },
    {
      title: "Remote dan GitHub: clone, push, pull, fetch",
      html: `<p><b><i>Remote</i></b> adalah salinan repo di tempat lain, misalnya di GitHub. Laptop dan GitHub bertukar commit lewat empat perintah:</p>
<ul><li><code>git clone URL</code> menyalin repo ke folder baru di laptop, lengkap dengan riwayatnya. Remote asalnya otomatis bernama <code>origin</code>.</li>
<li><code>git push</code> mengirim commit ke remote. Pertama kali mengirim sebuah branch, pakai <code>git push -u origin nama-branch</code>. Opsi <code>-u</code> mencatat pasangan branch di remote (<i>upstream</i>), sehingga berikutnya cukup <code>git push</code> atau <code>git pull</code>.</li>
<li><code>git fetch</code> mengambil commit baru dari remote <b>tanpa</b> mengubah branch-mu. Hasilnya disimpan di branch pelacak seperti <code>origin/main</code>.</li>
<li><code>git pull</code> menjalankan <code>git fetch</code>, lalu menggabungkan branch upstream ke branch-mu.</li></ul>
<p>Kalau remote punya commit yang belum kamu punya, <code>git push</code> ditolak (<code>rejected</code>). Jalankan <code>git pull</code>, selesaikan konflik kalau ada, lalu push lagi. Kalau lokal dan remote sama-sama punya commit baru, cara <code>git pull</code> menggabungkan bergantung pada pengaturan <code>pull.rebase</code> dan <code>pull.ff</code>. Paling aman: jangan commit langsung di <code>main</code>, sehingga <code>git pull</code> di <code>main</code> selalu fast-forward.</p>
<p>Untuk mengirim repo latihan ke GitHub, buat repo <b>kosong</b> di GitHub (tanpa README atau .gitignore, karena menurut dokumentasi GitHub berkas awal itu bisa menimbulkan konflik merge), lalu jalankan <code>git remote add origin URL</code>.</p>
<p>Kata sandi akun tidak diterima untuk perintah Git lewat HTTPS. Git for Windows membawa Git Credential Manager, yang membuka jendela browser untuk masuk ke GitHub saat pertama kali diperlukan, lalu menyimpan aksesnya di Windows.</p>`,
      examples: [
        { lang: "shell", code: `git remote add origin https://github.com/NAMA-AKUN/latihan-git.git
git remote -v
git push -u origin main`, note: "Ganti NAMA-AKUN dengan nama akun GitHub-mu, setelah membuat repo kosong bernama latihan-git di GitHub. git remote -v menampilkan alamat origin untuk memastikan URL-nya benar." },
        { lang: "shell", code: `cd $HOME
git clone https://github.com/NAMA-AKUN/latihan-git.git latihan-git-salinan
cd latihan-git-salinan
git log --oneline
git fetch
git status`, note: "Salinan hasil clone memuat seluruh riwayat. git status setelah git fetch memberi tahu apakah branch-mu tertinggal dari origin/main." },
      ],
    },
    {
      title: "Pull request, review, dan alur kerja tim",
      html: `<p><b><i>Pull request</i></b> (PR) adalah usulan di GitHub untuk menggabungkan commit dari satu branch ke branch lain, biasanya <code>main</code>. Rekan membaca setiap baris yang berubah, berkomentar di baris tertentu, dan menjalankan pemeriksaan otomatis sebelum perubahan digabung.</p>
<p>Peninjau (<i>reviewer</i>) mengirim <i>review</i> (tinjauan) dengan salah satu dari tiga keputusan:</p>
<ul><li><b>Comment</b>: masukan umum, tanpa menyetujui atau menolak.</li>
<li><b>Approve</b>: perubahan siap digabung.</li>
<li><b>Request changes</b>: ada masukan yang harus diperbaiki sebelum digabung.</li></ul>
<p>Untuk memperbaiki, cukup buat commit baru di branch yang sama lalu push. Pull request ikut diperbarui otomatis.</p>
<p>Alur kerja tim yang sederhana disebut alur <i>feature branch</i> (satu branch untuk satu perubahan):</p>
<ol><li>Perbarui <code>main</code>: <code>git switch main</code>, lalu <code>git pull</code>.</li>
<li>Buat branch untuk satu perubahan: <code>git switch -c fix-monthly-revenue</code>.</li>
<li>Kerjakan, lalu commit dalam langkah-langkah kecil.</li>
<li>Kirim branch-nya: <code>git push -u origin fix-monthly-revenue</code>.</li>
<li>Buka pull request di GitHub, jelaskan apa yang berubah dan kenapa, lalu minta review.</li>
<li>Perbaiki sampai disetujui, lalu gabungkan lewat tombol merge di GitHub.</li>
<li>Kembali ke <code>main</code>, <code>git pull</code>, dan hapus branch lokal dengan <code>git branch -d</code>.</li></ol>`,
      examples: [
        { lang: "shell", code: `git switch main
git pull
git switch -c fix-monthly-revenue
# ...ubah berkas, git add, git commit...
git push -u origin fix-monthly-revenue`, note: "Baris berawalan # adalah komentar di PowerShell dan tidak dijalankan. Setelah push, buka halaman repo di GitHub. Di atas daftar berkas muncul tombol Compare &amp; pull request untuk branch yang baru dikirim. Kalau tidak muncul, buka tab Pull requests lalu pilih New pull request." },
      ],
    },
    {
      title: "Menyimpan proyek data di Git",
      html: `<p>Repo berisi semua yang dibutuhkan untuk <b>membuat ulang</b> hasil kerja: query SQL, skrip, konfigurasi tanpa rahasia, dan dokumentasi. Datanya diambil ulang dari sumber, bukan disimpan di repo.</p>
<p>Contoh susunan folder proyek data:</p>
<pre>proyek-penjualan/
  README.md         penjelasan proyek dan cara menjalankannya
  .gitignore        data/, .env
  .env.example      nama pengaturan, nilai kosong
  sql/              query dan perintah pembuatan tabel
  scripts/          skrip pengolahan data
  notebooks/        notebook eksplorasi
  data/             data lokal, tidak di-commit</pre>
<p><i>README</i> adalah berkas penjelasan proyek; GitHub menampilkannya di halaman depan repo. <i>Notebook</i> adalah berkas yang menyimpan kode beserta hasil jalannya, termasuk teks keluaran dan gambar. Akibatnya diff-nya panjang dan bisa memuat potongan data, jadi hapus hasil jalannya sebelum commit kalau isinya sensitif.</p>
<p>Microsoft Fabric, platform yang diuji di DP-700, juga memakai Git: workspace Fabric (ruang kerja tim) bisa dihubungkan ke satu branch di repo Azure DevOps atau GitHub, dan isinya disimpan sebagai berkas di branch itu. Topik ini muncul lagi di Bagian 6.</p>`,
      examples: [],
    },
    {
      title: "Membatalkan commit yang salah",
      html: `<p>Cara memperbaiki commit yang salah bergantung pada satu pertanyaan: apakah commit itu sudah di-push?</p>
<ul><li><b>Sudah di-push:</b> pakai <code>git revert hash-commit</code>. Perintah ini membuat commit <b>baru</b> yang membalik isi commit yang salah. Riwayat lama tetap utuh, jadi rekan yang sudah menarik commit itu tidak terganggu.</li>
<li><b>Belum di-push dan commit terakhir:</b> perbaiki berkasnya, <code>git add</code>, lalu <code>git commit --amend</code>. Commit terakhir diganti dengan commit baru yang sudah diperbaiki.</li></ul>
<p>Dokumentasi Git menegaskan: jangan mengubah riwayat yang sudah dibagikan. <code>git commit --amend</code>, <code>git reset</code>, dan <code>git rebase</code> mengganti commit lama. Kalau commit lama sudah ada di remote, push berikutnya ditolak, dan memaksanya dengan <code>git push --force</code> bisa membuang commit rekan.</p>`,
      examples: [
        { lang: "shell", code: `git log --oneline
git revert --no-edit HEAD
git log --oneline`, note: "Contoh saja. HEAD berarti commit terakhir. Hasilnya satu commit baru berjudul Revert \"...\" di atas commit yang dibatalkan; tidak ada commit yang hilang dari riwayat." },
      ],
    },
  ],
  tsql: [],
  summary: [
    "Git mencatat riwayat folder proyek (repo) di subfolder .git; GitHub adalah tempat menyimpan repo secara daring dan berkolaborasi.",
    "Alur dasar: ubah berkas di working tree, pilih perubahan dengan git add (staging area), simpan dengan git commit, lihat riwayat dengan git log --oneline.",
    "git diff menampilkan perubahan yang belum di-staging; git diff --staged menampilkan isi commit berikutnya.",
    "Pesan commit: judul pendek berbahasa Inggris dalam bentuk perintah, tanpa titik, ditambah alasan kalau perlu.",
    "Branch memisahkan pekerjaan; git merge menggabungkannya secara fast-forward atau dengan merge commit.",
    "Konflik merge diselesaikan dengan menulis isi akhir, menghapus penanda, lalu git add dan git commit.",
    "Data, rahasia, dan .env masuk .gitignore. Rahasia yang terlanjur di-push harus dicabut atau diganti.",
    "Kerja tim: feature branch, git push -u, pull request, review, merge, lalu git pull di main.",
    "Commit yang sudah di-push dibatalkan dengan git revert, bukan dengan mengubah riwayat.",
  ],
  drills: [
    {
      id: "tools-02-01", kind: "paste",
      prompt: "Pastikan Git terpasang di laptopmu. Jalankan perintah di bawah, lalu tempel keluarannya.",
      command: "git --version",
      expect: String.raw`git version \d+\.\d+`,
      sampleOutput: "git version 2.56.0.windows.4",
      why: "Keluaran berbentuk git version diikuti nomor versi berarti PowerShell menemukan program Git.",
      hint: "Kalau muncul pesan bahwa git tidak dikenali, pasang Git for Windows dulu, lalu tutup dan buka lagi PowerShell.",
    },
    {
      id: "tools-02-02", kind: "paste",
      prompt: "Atur identitas dan nama branch awal (ganti nama dan email dengan milikmu), lalu tempel keluaran ketiga perintah terakhir.",
      command: `git config --global user.name "Nama Kamu"
git config --global user.email "nama@example.com"
git config --global init.defaultBranch main
git config --global user.name
git config --global user.email
git config --global init.defaultBranch`,
      expect: String.raw`\S+@\S+\.\S+[\s\S]*^\s*main\s*$`,
      sampleOutput: "Nama Kamu\nnama@example.com\nmain",
      why: "Tiga perintah terakhir membaca kembali pengaturan yang baru disimpan. Nama dan email akan tercatat di setiap commit; main menjadi nama branch pertama di repo baru.",
      hint: "Tiga perintah pertama tidak mencetak apa pun kalau berhasil. Kalau email tidak muncul, periksa tanda kutipnya.",
    },
    {
      id: "tools-02-03", kind: "paste",
      prompt: "Buat repo latihan dan commit pertama. Tempel seluruh keluarannya. Soal-soal berikutnya melanjutkan repo ini, jadi jangan hapus foldernya.",
      command: `cd $HOME
mkdir latihan-git
cd latihan-git
git init -b main
Set-Content laporan.sql "select count(*) from app.orders;"
git add laporan.sql
git commit -m "Add order count query"
git log --oneline`,
      expect: String.raw`^[0-9a-f]{7,40} (\(HEAD -> main\) )?Add order count query\s*$`,
      sampleOutput: `Initialized empty Git repository in C:/Users/kamu/latihan-git/.git/
[main (root-commit) 3874371] Add order count query
 1 file changed, 1 insertion(+)
 create mode 100644 laporan.sql
3874371 (HEAD -> main) Add order count query`,
      why: "Baris terakhir adalah keluaran git log --oneline: hash pendek commit, penanda HEAD -> main, dan judul commit. Hash-mu berbeda karena dihitung dari isi, nama pembuat, dan waktu.",
      hint: "Kalau folder latihan-git sudah ada dari percobaan sebelumnya, pakai nama folder lain. Kalau commit ditolak karena identitas belum diatur, kerjakan soal sebelumnya dulu.",
    },
    {
      id: "tools-02-04", kind: "paste",
      prompt: "Masih di folder latihan-git: buat branch filter-status, ubah query, commit, lalu tampilkan daftar branch. Tempel seluruh keluarannya.",
      command: `git switch -c filter-status
Set-Content laporan.sql "select count(*) from app.orders where status = 'completed';"
git add laporan.sql
git commit -m "Count only completed orders"
git branch`,
      expect: String.raw`(?=[\s\S]*^\*\s+filter-status\s*$)(?=[\s\S]*^\s+main\s*$)`,
      sampleOutput: `Switched to a new branch 'filter-status'
[filter-status 339aacf] Count only completed orders
 1 file changed, 1 insertion(+), 1 deletion(-)
* filter-status
  main`,
      why: "git branch menampilkan dua branch. Tanda bintang di depan filter-status menunjukkan kamu sedang berada di branch itu; commit barunya belum ada di main.",
      hint: "Pastikan kamu menjalankannya di dalam folder latihan-git (cek dengan pwd).",
    },
    {
      id: "tools-02-05", kind: "paste",
      prompt: "Gabungkan filter-status ke main, lalu tampilkan riwayat main. Tempel seluruh keluarannya.",
      command: `git switch main
git merge filter-status
git log --oneline`,
      expect: String.raw`(?=[\s\S]*^[0-9a-f]{7,40} (\([^)]*\) )?Count only completed orders\s*$)(?=[\s\S]*^[0-9a-f]{7,40} Add order count query\s*$)`,
      sampleOutput: `Switched to branch 'main'
Updating 3874371..339aacf
Fast-forward
 laporan.sql | 2 +-
 1 file changed, 1 insertion(+), 1 deletion(-)
339aacf (HEAD -> main, filter-status) Count only completed orders
3874371 Add order count query`,
      why: "main tidak punya commit baru sejak filter-status dibuat, jadi Git cukup memajukan penunjuk main (fast-forward). Riwayat main sekarang memuat kedua commit, dan HEAD -> main serta filter-status menunjuk commit yang sama.",
      hint: "Merge selalu dijalankan dari branch tujuan. Pindah dulu ke main, baru git merge nama-branch-sumber.",
    },
    {
      id: "tools-02-06", kind: "paste",
      prompt: "Buat konflik merge dengan sengaja: dua branch mengubah baris yang sama dengan cara berbeda. Tempel seluruh keluarannya, termasuk isi berkas di akhir.",
      command: `git switch -c tambah-shipped
Set-Content laporan.sql "select count(*) from app.orders where status in ('completed', 'shipped');"
git add laporan.sql
git commit -m "Include shipped orders in count"
git switch main
Set-Content laporan.sql "select count(*) as jumlah_pesanan from app.orders where status = 'completed';"
git add laporan.sql
git commit -m "Name the order count column"
git merge tambah-shipped
git status
Get-Content laporan.sql`,
      expect: String.raw`(?=[\s\S]*^<<<<<<< HEAD\s*$)(?=[\s\S]*^=======\s*$)(?=[\s\S]*^>>>>>>> tambah-shipped\s*$)`,
      sampleOutput: `Switched to a new branch 'tambah-shipped'
[tambah-shipped 6917a94] Include shipped orders in count
 1 file changed, 1 insertion(+), 1 deletion(-)
Switched to branch 'main'
[main 34d48e7] Name the order count column
 1 file changed, 1 insertion(+), 1 deletion(-)
Auto-merging laporan.sql
CONFLICT (content): Merge conflict in laporan.sql
Automatic merge failed; fix conflicts and then commit the result.
On branch main
You have unmerged paths.
  (fix conflicts and run "git commit")
  (use "git merge --abort" to abort the merge)

Unmerged paths:
  (use "git add <file>..." to mark resolution)
	both modified:   laporan.sql

no changes added to commit (use "git add" and/or "git commit -a")
<<<<<<< HEAD
select count(*) as jumlah_pesanan from app.orders where status = 'completed';
=======
select count(*) from app.orders where status in ('completed', 'shipped');
>>>>>>> tambah-shipped`,
      why: "Kedua branch mengubah satu-satunya baris di laporan.sql, jadi Git berhenti dan menulis kedua versi ke berkas. Bagian atas (HEAD) adalah versi main, bagian bawah adalah versi tambah-shipped.",
      hint: "Kalau tidak ada konflik, periksa apakah kedua commit benar-benar dibuat: satu di tambah-shipped dan satu lagi di main sesudah git switch main.",
    },
    {
      id: "tools-02-07", kind: "paste",
      prompt: "Selesaikan konfliknya: isi akhir memakai nama kolom dari main dan filter status dari tambah-shipped. Lalu tampilkan riwayat sebagai grafik dan tempel keluarannya.",
      command: `Set-Content laporan.sql "select count(*) as jumlah_pesanan from app.orders where status in ('completed', 'shipped');"
git add laporan.sql
git commit --no-edit
git log --oneline --graph`,
      expect: String.raw`(?=[\s\S]*^\*\s+[0-9a-f]{7,40}\b)(?=[\s\S]*^\|\\)(?=[\s\S]*^\|\s+\*\s+[0-9a-f]{7,40}\b.*Include shipped orders in count)(?=[\s\S]*^\*\s+\|\s+[0-9a-f]{7,40}\b.*Name the order count column)`,
      sampleOutput: `[main b4b6f4d] Merge branch 'tambah-shipped'
*   b4b6f4d (HEAD -> main) Merge branch 'tambah-shipped'
|\\
| * 6917a94 (tambah-shipped) Include shipped orders in count
* | 34d48e7 Name the order count column
|/
* 339aacf (filter-status) Count only completed orders
* 3874371 Add order count query`,
      why: "Set-Content menimpa seluruh isi berkas, sehingga penanda konflik ikut hilang. git add menandai konflik selesai, dan git commit --no-edit membuat merge commit dengan pesan yang disiapkan Git. Grafik menunjukkan dua jalur yang bertemu di merge commit itu.",
      hint: "Kalau git commit menolak dengan pesan tentang unmerged paths, berarti git add belum dijalankan setelah berkas diperbaiki.",
    },
    {
      id: "tools-02-08", kind: "paste",
      prompt: "Buat folder data dan berkas .env berisi kata sandi contoh, lalu buat .gitignore supaya keduanya tidak dicatat. Tempel keluaran git status.",
      command: `mkdir data
Set-Content data\\orders.csv "order_id,status"
Set-Content .env "DB_PASSWORD=contoh-saja"
Set-Content .gitignore "data/", ".env"
git status`,
      expect: String.raw`(?<![\s\S])(?![\s\S]*^\s*\.env\s*$)(?![\s\S]*^\s*data/)[\s\S]*^\s*\.gitignore\s*$`,
      sampleOutput: `    Directory: C:\\Users\\kamu\\latihan-git

Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----        26/11/2026     10:15                data

On branch main
Untracked files:
  (use "git add <file>..." to include in what will be committed)
	.gitignore

nothing added to commit but untracked files present (use "git add" to track)`,
      why: "Hanya .gitignore yang muncul sebagai berkas belum dicatat. .env dan folder data/ cocok dengan pola di .gitignore, jadi Git tidak menampilkannya dan tidak akan memasukkannya lewat git add biasa.",
      hint: "Set-Content dengan dua teks dipisah koma menulis dua baris. Kalau .env masih muncul, buka .gitignore dengan Get-Content dan pastikan setiap pola ada di barisnya sendiri.",
    },
    {
      id: "tools-02-09", kind: "choice",
      prompt: "Kamu mengubah dua berkas: <code>harian.sql</code> sudah selesai, <code>bulanan.sql</code> belum. Bagaimana membuat commit yang hanya berisi <code>harian.sql</code>?",
      options: [
        "<code>git commit -m \"Fix daily query\"</code> saja, Git otomatis memilih berkas yang selesai",
        "<code>git add harian.sql</code>, lalu <code>git commit -m \"Fix daily query\"</code>",
        "<code>git add bulanan.sql</code>, lalu <code>git commit -m \"Fix daily query\"</code>",
        "Hapus dulu <code>bulanan.sql</code>, lalu commit",
      ],
      answer: 1,
      why: "git commit menyimpan isi staging area. Dengan hanya memasukkan harian.sql lewat git add, commit berisi berkas itu saja, dan perubahan di bulanan.sql tetap di working tree untuk commit berikutnya.",
      hint: "Ingat urutan working tree, staging area, lalu commit.",
    },
    {
      id: "tools-02-10", kind: "choice",
      prompt: "Mana pesan commit yang paling sesuai aturan di bab ini?",
      options: [
        "<code>update query</code>",
        "<code>Added filter for cancelled orders.</code>",
        "<code>Exclude cancelled orders from daily revenue</code>",
        "<code>perbaikan query pendapatan harian</code>",
      ],
      answer: 2,
      why: "Pilihan ketiga berbahasa Inggris, berbentuk perintah, pendek, tanpa titik, dan menjelaskan apa yang berubah. Pilihan pertama terlalu umum, pilihan kedua memakai bentuk lampau dan titik, pilihan keempat tidak berbahasa Inggris.",
      hint: "Baca judulnya seolah-olah kamu menyuruh kode: \"(Please) ...\".",
    },
    {
      id: "tools-02-11", kind: "choice",
      prompt: "Berkas mana yang <b>tidak boleh</b> di-commit ke repo proyek data?",
      options: [
        "<code>.gitignore</code>",
        "<code>sql/monthly_sales.sql</code>",
        "<code>.env</code> berisi <code>DB_PASSWORD=...</code>",
        "<code>README.md</code>",
      ],
      answer: 2,
      why: ".env berisi pengaturan lokal dan rahasia seperti kata sandi database. Berkas ini masuk .gitignore. .gitignore sendiri, query SQL, dan README justru harus di-commit.",
      hint: "Mana yang berisi rahasia?",
    },
    {
      id: "tools-02-12", kind: "choice",
      prompt: "Kamu ingin melihat commit baru di GitHub tanpa mengubah branch lokalmu sama sekali. Perintah apa yang dipakai?",
      options: ["<code>git pull</code>", "<code>git fetch</code>", "<code>git push</code>", "<code>git clone</code>"],
      answer: 1,
      why: "git fetch mengambil commit baru ke branch pelacak seperti origin/main tanpa menyentuh branch-mu. git pull menjalankan fetch lalu langsung menggabungkan, git push mengirim commit, dan git clone membuat salinan repo baru.",
      hint: "Salah satu perintah ini adalah bagian pertama dari git pull.",
    },
    {
      id: "tools-02-13", kind: "choice", level: "wawancara",
      prompt: "Pewawancara bertanya: \"Branch <code>main</code> dipakai bersama tim. Kapan kamu memakai <code>git rebase</code>, dan kapan <code>git merge</code>?\" Jawaban mana yang paling tepat?",
      options: [
        "Selalu rebase, karena riwayat lurus selalu lebih baik.",
        "Rebase boleh untuk commit lokal yang belum dibagikan, supaya riwayat lurus. Untuk riwayat yang sudah dibagikan, pakai merge, karena rebase membuat ulang commit dan mengubah hash-nya.",
        "Merge dan rebase sama persis; bedanya hanya nama perintah.",
        "Rebase hanya dipakai untuk menghapus branch.",
      ],
      answer: 1,
      why: "Rebase memindahkan commit ke atas ujung branch lain dengan membuat commit baru, sehingga hash berubah. Dokumentasi Git memperingatkan agar riwayat yang sudah dibagikan tidak di-rebase. Merge mempertahankan riwayat apa adanya dan menambah merge commit kalau perlu.",
      hint: "Apa yang terjadi pada hash commit saat rebase, dan siapa saja yang sudah memegang commit lama itu?",
    },
    {
      id: "tools-02-14", kind: "explain",
      prompt: "Jelaskan dengan kalimatmu sendiri kenapa tim memakai feature branch dan pull request, bukan langsung commit ke <code>main</code>.",
      model: "Dengan feature branch, setiap perubahan dikerjakan di jalur terpisah, jadi main tetap berisi versi yang sudah diperiksa dan bisa dipakai. Pull request memberi tempat bagi rekan untuk membaca perubahan baris demi baris, memberi komentar, menjalankan pemeriksaan otomatis, lalu menyetujui atau meminta perbaikan sebelum digabung. Kesalahan tertangkap sebelum masuk main, riwayatnya tercatat bersama diskusinya, dan setiap orang tetap bisa menarik main tanpa ikut menarik pekerjaan yang belum selesai.",
      hint: "Pikirkan apa yang terjadi pada rekan yang menjalankan git pull di main kalau kamu commit query setengah jadi ke sana.",
    },
    {
      id: "tools-02-15", kind: "explain", level: "wawancara",
      prompt: "Pewawancara bertanya: \"Kamu sudah push commit yang merusak query laporan ke <code>main</code>, dan dua rekan sudah menariknya. Bagaimana kamu memperbaikinya? Bagaimana kalau commit itu juga berisi kata sandi database?\"",
      model: "Karena commit sudah dibagikan, saya tidak mengubah riwayat dengan reset, amend, atau force push, karena itu akan merusak salinan rekan. Saya memakai git revert pada commit itu: Git membuat commit baru yang membalik perubahannya, lalu saya kirim lewat pull request seperti perubahan biasa. Kalau commit itu berisi kata sandi, saya anggap kata sandinya bocor, jadi langkah pertama adalah mencabut atau mengganti kata sandi itu, karena isinya masih ada di riwayat walaupun berkasnya dihapus di commit baru. Sesudah itu saya memasukkan berkas rahasianya ke .gitignore, dan membersihkan riwayat hanya kalau tim keamanan memintanya.",
      hint: "Bedakan dua masalah: membatalkan perubahan kode yang sudah dibagikan, dan rahasia yang sudah terlihat orang lain.",
    },
  ],
};
