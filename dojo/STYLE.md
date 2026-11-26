# Panduan gaya tulis materi Dojo

Pembaca: orang yang baru masuk dunia data dan belum tahu istilah apa pun. Tujuan akhirnya siap kerja sebagai data engineer.

## Aturan wajib

1. **Urut, tanpa lompatan.** Contoh, kode awal, dan solusi hanya boleh memakai perintah yang ada di `introduces` bab ini atau bab sebelumnya. Teks juga tidak boleh menyebut istilah yang baru dijelaskan di bab berikutnya. Kedua hal ini dicek otomatis oleh `node dojo/tools/check-content.mjs`.
2. **Setiap istilah dijelaskan saat pertama muncul.** Kata bahasa Inggris dimiringkan dan langsung diberi arti, misalnya: *query* (perintah untuk meminta data). Istilah penting juga masuk daftar `terms` bab.
3. **Satu konsep, satu subjudul**, dengan urutan:
   1. Definisi singkat dalam satu atau dua kalimat.
   2. Contoh query yang bisa dijalankan, memakai data TokoKita.
   3. Penjelasan hasilnya: apa yang terlihat dan kenapa.
   4. Kesalahan umum, kalau ada.
4. **Tanpa analogi yang dipaksakan.** Jelaskan langsung dengan data. Analogi hanya dipakai kalau benar-benar memperjelas, dan maksimal satu per bab.
5. **Ringkas.** Kalimat pendek, satu gagasan per kalimat. Tidak ada kalimat pembuka yang tidak membawa informasi.
6. **Bagian "Di SQL Server" di setiap bab**, berisi perintah yang dipelajari di bab itu dan padanannya di T-SQL, ditambah catatan kalau perilakunya berbeda.
7. **Panjang penjelasan 700–2.000 kata per bab**, di luar kode.
8. **Kata terlarang:** "caveat", "menyempit", "worth noting". Ganti dengan kalimat biasa.

## Contoh paragraf

Buruk (melompat dan memakai istilah tanpa penjelasan):
> Pakai `SELECT DISTINCT` atau `GROUP BY` untuk dedup sebelum JOIN supaya tidak fan-out.

Baik (urut dan setiap istilah dijelaskan):
> Kadang hasil query berisi baris yang sama persis lebih dari sekali. `DISTINCT` menghapus baris kembar itu, sehingga setiap kombinasi nilai hanya muncul sekali.

## Soal

Setiap bab berisi minimal 10 soal, dari yang paling mudah:
- 2 pilihan ganda (`choice`) untuk konsep.
- 5 tulis SQL (`sql`), bertingkat.
- 1 perbaiki query (`fix`).
- 1 hitung angka (`number`).
- 1 jelaskan dengan kalimat sendiri (`explain`).

Mulai bab 5 (agregasi), tambahkan minimal 1 soal `level: "wawancara"`.

Setiap soal punya `hint` (petunjuk yang membantu tanpa memberi jawaban), dan `why` (alasan jawaban) atau `model` (contoh jawaban untuk soal `explain`).
