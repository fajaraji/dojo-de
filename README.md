# Dojo Data Engineer

Kursus berbahasa Indonesia untuk menjadi data engineer, mulai dari nol. Setiap query dijalankan oleh PostgreSQL sungguhan di browser ([PGlite](https://github.com/electric-sql/pglite), lisensi Apache-2.0), dan setiap bab membahas padanannya di SQL Server.

Rencana dan status pengerjaan: [`docs/superpowers/plans/2026-11-26-dojo-v2.md`](docs/superpowers/plans/2026-11-26-dojo-v2.md).

## Menjalankan di laptop

Butuh Node.js.

```bash
node dojo/tools/serve.mjs 8765 dojo
```

Buka `http://localhost:8765/wasm/`. Awalan `/wasm/` meniru aturan keamanan halaman yang dipakai di Cloudflare Pages.

## Uji otomatis

Sekali saja, pasang PGlite untuk alat uji:

```bash
cd dojo/vendor-npm && npm ci
```

Lalu, dari folder akar:

```bash
node --test dojo/tools/tests/
node dojo/tools/check-content.mjs
```

`check-content.mjs` menjalankan semua contoh dan solusi soal di PostgreSQL, dan menolak bab yang memakai perintah atau istilah sebelum bab yang mengajarkannya.

## Data latihan

TokoKita adalah toko online fiktif. Generatornya ada di `dojo/data/tokokita.js`. Setelah generator diubah, buat ulang database siap pakai:

```bash
node dojo/tools/build-db.mjs
```

## Struktur

- `dojo/` — situs yang diterbitkan (tanpa proses build)
  - `app/` — halaman, mesin di Web Worker, pemeriksa jawaban
  - `content/` — bab materi (`sql-01.js`, …) dan urutannya (`index.js`)
  - `data/` — generator data dan database siap pakai
  - `vendor/pglite-0.5.16/` — berkas mesin PostgreSQL
  - `tools/` — server lokal, pemeriksa materi, uji otomatis
- `docs/` — rencana dan catatan riset
