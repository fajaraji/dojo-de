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

## Jangan
- Jangan mengubah berkas selain `content/<id-babmu>.js`. Kalau butuh nama fitur baru di `sql-features.mjs`, istilah baru di `terms.js`, atau perubahan aplikasi, tulis kebutuhannya di laporan; jangan mengedit sendiri.
- Jangan menjalankan git (commit, push, dsb.).
