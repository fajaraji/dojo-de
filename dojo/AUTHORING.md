# Cara menulis satu bab Dojo (untuk penulis bab, termasuk agen)

Baca berkas ini sampai habis sebelum menulis. Semua path relatif ke `D:\de-practice\dojo\` kecuali disebut lain.

## Bacaan wajib sebelum menulis
1. `STYLE.md`: aturan gaya tulis (wajib dipatuhi).
2. `content/_template.js`: bentuk objek bab dan soal.
3. `content/sql-03.js` dan `content/sql-04.js`: contoh bab yang sudah lulus tinjauan. Tiru tingkat detail, nada, dan bentuk soalnya.
4. Tiket babmu di `D:\de-practice\docs\superpowers\plans\2026-11-26-dojo-v2.md` (cari judul `### <ID>:`), plus bagian "Global Constraints" dan "Prosedur standar tiket materi".
5. `data/tokokita.js`, bagian `SCHEMA_DOC` (sekitar baris 375): kamus data semua tabel. Hanya pakai tabel/kolom yang ada di sini.
6. `tools/lib/sql-features.mjs`: nama fitur SQL yang dikenali pemeriksa (isi `introduces` harus memakai nama ini).
7. `content/terms.js`: istilah yang dilacak. Istilah itu tidak boleh muncul di teks sebelum bab yang mendefinisikannya.
8. Berkas kerangka semua bab lain di `content/` (yang ber-`draft: true`): daftar `introduces` dan `terms` di sana menunjukkan apa yang SUDAH diajarkan di bab sebelum babmu dan apa yang BELUM boleh dipakai.

## Pembaca
Orang yang baru masuk dunia data, target akhirnya siap kerja sebagai data engineer. Bahasa Indonesia. Lengkap dan urut, setiap istilah (termasuk kata bahasa Inggris dan nama kolom) dijelaskan saat pertama muncul, tanpa analogi yang dipaksakan, tidak bertele-tele. PostgreSQL dijalankan sungguhan; SQL Server (T-SQL) dijelaskan berdampingan di bagian `tsql`.

## Aturan isi (dari pemilik kursus, wajib)
- **Tidak ada rujukan maju.** Jangan memakai perintah SQL atau istilah yang baru diajarkan di bab sesudahmu, di kode maupun teks.
- **Setiap fakta tentang data dihitung dari data.** Kalau catatan contoh menyebut "pelanggan 4 dan 9 tidak punya telepon" atau "ada 747 pesanan dibatalkan", angka itu harus berasal dari query yang kamu jalankan. Jalankan query dengan: `node tools/query.mjs "select ..."` (dari folder dojo). Kata "semua", "seluruh", "hanya" harus didukung hitungan lengkap, bukan sampel.
- **Setiap klaim tentang perilaku PostgreSQL atau SQL Server dicek ke dokumentasi resmi**, bukan dari ingatan: PostgreSQL 18 (https://www.postgresql.org/docs/18/) dan SQL Server terbaru (https://learn.microsoft.com/en-us/sql/t-sql/). Perilaku PostgreSQL juga bisa dibuktikan langsung dengan `tools/query.mjs`. Kalau tidak bisa dipastikan, jangan ditulis.
- **Arti kode atau singkatan yang tidak dijelaskan di data atau kamus data** ditulis "tidak diketahui dari data", jangan ditebak.
- Kata terlarang: caveat, menyempit, worth noting. Hindari juga kata Inggris tanpa penjelasan.
- Tanggal "hari ini" di latihan = `date '2025-10-31'` (data berhenti 31 Okt 2025), bukan CURRENT_DATE.
- Semua tabel ditulis dengan nama skema (`app.orders`, `raw.web_events`).

## Bentuk dan isi bab
- Ganti seluruh isi berkas kerangka `content/<id>.js` dengan bab lengkap. Hapus `draft: true` dan komentar KERANGKA.
- Pertahankan semua isi `introduces` dan `terms` di kerangka (bab lain bergantung padanya). Boleh menambah fitur yang dikenal `KNOWN_FEATURES` atau istilah baru. Setiap `terms[].def` wajib diisi.
- Teks penjelasan (`sections[].html`, di luar `<pre>`) 700–2.000 kata.
- Bagian `tsql` berisi padanan setiap perintah baru di SQL Server, dengan catatan bila perilakunya berbeda.
- Soal minimal 10: 2 `choice`, 5 `sql` bertingkat, 1 `fix`, 1 `number`, 1 `explain`. Mulai sql-05, minimal 1 soal `level: "wawancara"`. Bab ber-`build` (membuat tabel) memakai `kind: "build"` + `verify` (query SELECT yang memeriksa isi tabel setelah perintah dijalankan).
- Setiap soal punya `hint` dan `why` (atau `model` untuk `explain`). id soal: `<id-bab>-01`, `-02`, dst.
- Soal `sql`: kalau urutan baris penting, beri `ordered: true` DAN sebut urutannya di prompt. Kalau nama kolom dinilai, beri `checkNames: true` dan sebut nama kolomnya di prompt.
- Pembanding jawaban membulatkan angka ke 2 desimal dan mengabaikan nama kolom (kecuali `checkNames`). Jumlah kolom dan isi baris harus sama.

## Batas teknis mesin latihan
- Setiap query dijalankan di dalam transaksi yang otomatis dibatalkan (`BEGIN … ROLLBACK`). Perintah BEGIN/COMMIT/ROLLBACK/END/SAVEPOINT/START TRANSACTION DITOLAK di contoh dan soal. Contoh perintah transaksi hanya boleh ditulis sebagai teks di `<pre>` di dalam `html` (tidak bisa dijalankan), dengan penjelasan bahwa mesin latihan sudah membungkus setiap jawaban dalam transaksi.
- Batas waktu query 8 detik di browser. Jaga contoh tetap ringan (data buatan di `setup` maksimal sekitar 200 ribu baris).
- `setup` (opsional, di contoh atau soal) dijalankan sebelum query di transaksi yang sama, cocok untuk membuat tabel bantu.
- Contoh dan solusi harus menghasilkan baris (kecuali diberi `expectEmpty: true`).

## Selesai kalau
1. `node tools/check-content.mjs --lesson <id>` (dari folder dojo) mencetak "Semua 1 bab lulus pemeriksaan."
2. Kamu sudah membaca ulang bab: setiap istilah dijelaskan saat pertama muncul, tidak ada rujukan maju, setiap angka di teks berasal dari query.
3. Laporan akhirmu memuat: jumlah kata, jumlah soal per jenis, daftar fakta PostgreSQL/SQL Server yang kamu cek beserta URL dokumentasinya, dan keputusan yang menyimpang dari tiket (kalau ada) beserta alasannya.

## Tambahan untuk Bagian 3–8 (alat kerja, Python, pipeline, cloud, lanjutan, karier)
Rencana: `D:\de-practice\docs\superpowers\plans\2026-11-26-dojo-bagian-3-8.md` (cari tiket babmu).

- **Context7 WAJIB untuk setiap klaim tentang alat.** Ini berlaku untuk Python, pandas, pyarrow, pytest, Git, GitHub Actions, Docker, PostgreSQL, SQL Server, Airflow, dbt, Spark, Delta Lake, Microsoft Fabric, Power BI, Kafka, Terraform, AWS, GCP, dan alat lain. Caranya: muat tool dengan ToolSearch (`select:mcp__plugin_context7_context7__resolve-library-id,mcp__plugin_context7_context7__query-docs`), cari library ID resmi (Source Reputation High), lalu tanyakan satu konsep per query.
  - **Kalau Context7 tidak bisa dipakai, BERHENTI dan laporkan.** Jangan diganti dengan WebFetch, curl, atau ingatan.
  - Laporan akhir mencantumkan library ID dan URL sumber yang dikembalikan Context7 untuk setiap fakta penting.
- **Contoh** (`sections[].examples[]`) punya `lang`:
  - `{ lang: "py", code, note, setup? }`: dijalankan di Python (Pyodide, Python 3.14, pandas 3.0.2, numpy, pyarrow 22, pytest 9). Harus mencetak sesuatu dengan `print()`.
  - `{ lang: "file", filename, code, note }`: ISI BERKAS (Dockerfile, compose.yaml, .env, skrip) yang disimpan pengguna di laptop; tampil dengan nama berkas dan tombol "Salin isi berkas".
  - `{ lang: "shell", code, note }`: perintah untuk laptop pengguna, hanya ditampilkan dengan tombol salin. Tulis untuk **PowerShell di Windows 11**. Padanan bash/Linux boleh disebut di teks.
  - Tanpa `lang`: SQL seperti sebelumnya (`sql`).
- **Data di Python:** TokoKita tersedia sebagai CSV di `/data/app/<tabel>.csv` dan `/data/raw/<tabel>.csv`, isinya sama dengan database SQL. Folder kerja yang boleh ditulisi adalah `/kerja`. Uji dengan `node tools/check-content.mjs --lesson <id>` (menjalankan Python di Node). Untuk mencoba cepat, buat skrip Node kecil yang memakai `app/py-core.js` (lihat fungsi `runPy` di `tools/check-content.mjs`).
- **Soal `py`:** `{ kind: "py", prompt, start?, solution, setup?, check?, why, hint }`.
  - Penilaian membandingkan keluaran `print` jawaban dengan solusi. Spasi di akhir baris diabaikan.
  - Prompt WAJIB menyebut persis apa yang dicetak, termasuk format dan urutannya.
  - Kalau `check` diisi, kode itu dijalankan sesudah jawaban di namespace yang sama, dan keluarannya yang dibandingkan. Cara ini cocok untuk memeriksa isi variabel atau fungsi buatan pengguna.
  - Setiap soal berdiri sendiri; variabel dari soal lain tidak terbawa.
- **Soal `paste`** (dikerjakan di laptop): `{ kind: "paste", prompt, command, expect, sampleOutput, why, hint }`.
  - `expect` adalah regex (tanpa membedakan huruf besar/kecil, multibaris) untuk keluaran yang ditempel pengguna.
  - `sampleOutput` adalah contoh keluaran benar yang realistis, dan dipakai pemeriksa untuk menguji `expect`.
  - Pola harus longgar terhadap versi atau path, tapi tetap membuktikan perintahnya berhasil.
- **Soal `number` dengan Python:** `answerPy` (kode yang mencetak satu angka), sebagai pengganti `answerSql`.
- **Fitur Python dilacak** seperti perintah SQL. Nama fiturnya ada di `tools/lib/py-features.mjs`, misalnya `py:for`, `py:print()`, `py:import pandas`, `py:f-string`, `py:comprehension`. `introduces` di kerangka setiap bab Python sudah ditentukan. Jangan memakai fitur yang belum diajarkan, dan pertahankan isi `introduces` kerangka.
- **Jumlah soal bab non-SQL:** minimal 10. Jenisnya campuran: minimal 2 `choice`, minimal 1 `explain`, minimal 1 `level: "wawancara"`, dan sisanya `py`, `paste`, atau `sql` sesuai topik. Bab konsep (cloud, lanjutan, karier) boleh lebih banyak `choice`/`explain`, tapi tetap ada latihan praktik kalau memungkinkan.
- **Bagian `tsql`** hanya diisi kalau relevan. Bab lain boleh `tsql: []`.
- **Lingkungan pengguna:** Windows 11 + PowerShell. Pengguna sedang mengejar sertifikasi **DP-700 (Microsoft Fabric Data Engineer)** sebelum 31 Des 2026 dan mengincar kerja remote untuk perusahaan UK. Kaitkan materi dengan keduanya kalau relevan, tanpa memaksakan.

## Jangan
- Jangan mengubah berkas selain `content/<id-babmu>.js`. Kalau butuh nama fitur baru di `sql-features.mjs`, istilah baru di `terms.js`, atau perubahan aplikasi, tulis kebutuhannya di laporan; jangan mengedit sendiri.
- Jangan menjalankan git (commit, push, dsb.).
