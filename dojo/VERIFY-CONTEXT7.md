# Verifikasi materi Dojo dengan Context7 (untuk agen peninjau)

Pemilik kursus mewajibkan setiap klaim teknis di materi dicocokkan dengan dokumentasi resmi lewat **Context7**. Verifikasi sebelumnya memakai situs dokumentasi langsung, bukan Context7, jadi sekarang semua bab diverifikasi ulang.

## Alat wajib
- `mcp__plugin_context7_context7__resolve-library-id` lalu `mcp__plugin_context7_context7__query-docs`. Kalau tool ini belum dimuat, muat dengan ToolSearch (`select:mcp__plugin_context7_context7__resolve-library-id,mcp__plugin_context7_context7__query-docs`).
- **Kalau Context7 tidak bisa dipakai (tool tidak ada, error berulang), BERHENTI dan laporkan.** Jangan menggantinya dengan WebFetch, curl, atau ingatan.
- ID pustaka yang sudah diketahui:
  - PostgreSQL 18: `/websites/postgresql/18`
  - SQL Server / T-SQL: `/microsoftdocs/sql-docs`
  - Untuk Power BI, Microsoft Fabric, DAX, dbt, Delta Lake, Parquet, dan lainnya: cari dengan `resolve-library-id`, lalu pilih yang Source Reputation-nya High dan berasal dari pemilik resminya.
- Perilaku PostgreSQL boleh dibuktikan tambahan dengan `node tools/query.mjs "select ..."` (dari folder `D:\de-practice\dojo`, PostgreSQL 18.6 asli). Tetapi setiap klaim tetap harus punya rujukan Context7.

## Yang diverifikasi
Semua klaim tentang perilaku alat dan bahasa di:
- teks `sections[].html` dan catatan contoh (`examples[].note`);
- tabel `tsql`, yaitu baris padanan SQL Server, yang paling berisiko;
- `terms[].def`, `goals`, `summary`;
- `prompt`, `hint`, `why`, dan `model` soal.

Contoh klaim:
- tipe hasil fungsi;
- aturan NULL;
- versi SQL Server yang memperkenalkan fitur;
- sintaks yang didukung atau tidak didukung;
- pesan dan kode error;
- perilaku bawaan, misalnya frame window atau aturan collation;
- definisi konsep Kimball, Power BI, Fabric, Delta, dan dbt.

Angka yang berasal dari data TokoKita sudah dicek dengan query oleh dua peninjau. Lewati, kecuali kamu melihat sesuatu yang janggal.

## Cara kerja per klaim
1. Tanyakan ke Context7 satu konsep per query.
2. Beri status: **cocok**, **salah**, atau **tidak ditemukan di Context7**.
3. **Salah:** perbaiki langsung di berkas bab, dengan bahasa Indonesia dan gaya yang sama (lihat `STYLE.md` dan `AUTHORING.md`). Jangan memakai perintah atau istilah yang belum diajarkan.
4. **Tidak ditemukan di Context7:** coba 2–3 query lain. Kalau tetap tidak ada, ubah menjadi kalimat yang bisa dipastikan, atau hapus. Kalimat yang menyatakan "X tidak ada di SQL Server" harus didukung dokumen yang menyatakannya, atau ditulis sebagai "dokumentasi sintaks X tidak memuat …".

## Selesai kalau
- `node tools/check-content.mjs --lesson <id>` lulus untuk setiap bab yang kamu ubah. Jalankan dari folder `D:\de-practice\dojo`.
- Catatan ditulis ke `D:\de-practice\docs\riset\2026-11-26-context7-<kelompok>.md`, berisi tabel per bab: klaim (kutipan pendek), status, rujukan Context7 (library ID + URL sumber yang dikembalikan Context7), dan perbaikan. Gunakan bahasa Indonesia yang jelas.
- Laporan akhir berisi:
  - jumlah klaim yang dicek;
  - daftar klaim salah beserta perbaikannya;
  - klaim yang tidak ditemukan beserta tindakannya;
  - konfirmasi bahwa semua rujukan berasal dari Context7.

## Jangan
- Jangan mengubah berkas di luar kelompok babmu. Agen lain bekerja paralel di bab lain.
- Jangan menjalankan git.
- Simpan berkas sementara di subfolder unik `D:\Documents and Settings\fajar.pamungkas\AppData\Local\Temp\claude\a73757ede5d382b1\b8b6cf88-39d0-46d9-b59b-6cf08ac46a09\scratchpad\c7-<kelompok>\`.
