# Riset: proyek di dataprojecthunt.com, seberapa dekat dengan standar kerja?

Tanggal cek: 26 November 2026.

## Cara cek

- **Sumber:** semua proyek di halaman utama https://www.dataprojecthunt.com/, setelah tombol "Load more projects" ditekan sampai habis. Ada 54 proyek dengan 53 repo GitHub unik, karena dua proyek memakai repo `rahrajlat/air-labs` yang sama.
- **Repo yang terbaca:** 52. Satu repo, `C00ldudeNoonan/economic-data-project`, sudah tidak ada (GitHub menjawab "Not Found").
- **Cara menilai:** daftar berkas tiap repo diambil dari API GitHub, lalu dicek apakah berkas untuk 7 unsur di bawah ada atau tidak. Skrip ceknya ada di folder scratchpad sesi (`analyze-dph.mjs`).
- **Keterbatasan (penting):**
  - Yang dicek hanya **keberadaan berkas**, bukan kualitas isinya. Kodenya tidak dibaca dan pipeline-nya tidak dijalankan.
  - Pola nama berkas bisa meleset. Contoh: `schema.yml` dihitung sebagai "tes" walau belum tentu berisi tes. Transformasi di notebook Spark tidak terdeteksi sebagai "pemodelan".

## Tujuh unsur yang dicek

Dasarnya adalah lowongan Data Engineer Yogyakarta yang kamu kirim, yang meminta *version control*, *containerization*, *CI/CD*, ETL/ELT, dan SQL. Ditambah praktik yang menurut asumsi saya umum diminta perusahaan.

| Unsur | Arti dengan kalimat biasa | Bukti yang dicari di repo |
|---|---|---|
| Orkestrasi | Pipeline berjalan terjadwal oleh alat penjadwal | folder `dags/`, atau berkas Airflow/Prefect/Dagster/Kestra/Bruin |
| Docker | Orang lain bisa menjalankan proyek dengan satu perintah, tanpa memasang banyak alat | `Dockerfile` atau `docker-compose.yml` |
| Pemodelan | Ada lapisan tabel yang dirancang (staging, dimensi, fakta, mart) | `dbt_project.yml`, atau berkas `.sql` di folder `models/`, `marts/`, `staging/` |
| Tes | Ada pemeriksaan otomatis untuk kode atau data | folder `tests/`, berkas `test_*.py`, Great Expectations, Soda, Deequ, `schema.yml` |
| CI | Tes berjalan otomatis setiap kali kode dikirim ke GitHub | `.github/workflows/*.yml` |
| IaC | Infrastruktur cloud dibuat lewat kode, bukan diklik manual | berkas `*.tf` (Terraform) |
| Dokumentasi | README cukup lengkap untuk dipahami orang lain | README minimal 3 KB |

## Hasil (52 repo)

| Unsur | Jumlah repo yang punya |
|---|---|
| Orkestrasi | 41 |
| Dokumentasi | 47 |
| Docker | 39 |
| Tes | 30 |
| CI | 15 |
| Pemodelan | 13 |
| IaC | 4 |

Sebaran skor (jumlah unsur yang ada, dari 7):

| Skor | 1 | 2 | 3 | 4 | 5 | 6 | 7 |
|---|---|---|---|---|---|---|---|
| Jumlah repo | 2 | 7 | 18 | 11 | 9 | 5 | 0 |

**Tidak ada satu repo pun yang memiliki ketujuh unsur.** Yang paling sering tidak ada adalah IaC (48 repo), pemodelan data (39 repo), dan CI (37 repo).

## Lima repo dengan skor tertinggi (6 dari 7)

| Repo | Jenis | Yang tidak ada |
|---|---|---|
| sonikirtan110/AQI-DATA-PIPELINE | Pipeline data kualitas udara: Airflow, dbt, Snowflake, S3 | IaC |
| thoutmose/nasa-analysis | Pipeline data NASA dan visualisasi | IaC |
| Duncan610/instacart-analytics-pipeline | Pipeline analitik e-commerce: Airflow, dbt, PostgreSQL, Snowflake | IaC |
| mdshihabullah/wikistream-event-data-pipeline-aws | Pipeline data aliran (streaming) di AWS | Pemodelan (tidak terdeteksi) |
| jvanbuel/flowrs | Alat bantu (aplikasi terminal untuk Airflow), bukan pipeline data | Pemodelan |

## Isi README tujuh proyek pipeline teratas

Angka adalah jumlah baris README yang menyebut kata kunci itu. Ini cara kasar untuk melihat apakah praktik yang tidak terlihat dari nama berkas dibahas.

| Repo | load bertahap (*incremental*) | aman diulang (*idempotent*) | *backfill* | tes | SCD | star schema / fact / dim | CI/CD | monitoring / alert |
|---|---|---|---|---|---|---|---|---|
| AQI-DATA-PIPELINE | 2 | 0 | 8 | 28 | 0 | 0 | 0 | 6 |
| nasa-analysis | 0 | 1 | 0 | 28 | 0 | 0 | 9 | 19 |
| instacart-analytics-pipeline | 9 | 0 | 0 | 24 | 11 | 40 | 9 | 0 |
| wikistream-event-data-pipeline-aws | 0 | 3 | 0 | 3 | 0 | 0 | 1 | 22 |
| COVID19_Data_Engineering_Project | 0 | 0 | 0 | 7 | 0 | 3 | 0 | 0 |
| Spotify_ELT | 0 | 0 | 0 | 6 | 0 | 0 | 2 | 0 |
| silism-commerce-360-platform | 0 | 0 | 0 | 15 | 0 | 1 | 0 | 29 |

Keterangan istilah:
- *Backfill*: mengisi ulang data periode lama.
- SCD (*Slowly Changing Dimension*): cara menyimpan riwayat perubahan data master, misalnya pelanggan pindah kota.

## Kesimpulan

1. **Belum ada yang lengkap.** Menurut tujuh unsur ini, tidak ada proyek yang lengkap. Yang paling dekat dengan proyek pipeline analitik siap kerja adalah `instacart-analytics-pipeline`: README-nya membahas star schema, SCD, load bertahap, tes, dan CI. Kekurangannya ada di IaC.
2. **Banyak yang bukan pipeline data.** Sebagian proyek adalah alat bantu untuk Airflow (contohnya RunLens, Flowrs, airflow-watcher) atau eksperimen AI. Untuk kursus ini, yang dijadikan contoh hanya proyek pipeline.
3. **Celah paling umum** adalah pemodelan data, CI, dan IaC. Itu juga bagian yang paling membedakan kandidat junior di mata perekrut (asumsi saya, belum diukur).
4. **Implikasi untuk kursus:** Capstone portofolio (Bagian 8) wajib memenuhi ketujuh unsur, ditambah load bertahap yang aman diulang, *backfill*, dan monitoring.

## Tabel lengkap

Kolom unsur bernilai 1 = ada, 0 = tidak ada. Urutannya: orkestrasi, docker, pemodelan, tes, ci, iac, dokumentasi.

| Repo | Skor | Unsur | README (KB) | Jumlah berkas |
|---|---|---|---|---|
| sonikirtan110/AQI-DATA-PIPELINE | 6 | 1 1 1 1 1 0 1 | 13.2 | 48 |
| thoutmose/nasa-analysis | 6 | 1 1 1 1 1 0 1 | 40.8 | 375 |
| Duncan610/instacart-analytics-pipeline | 6 | 1 1 1 1 1 0 1 | 25.6 | 67 |
| mdshihabullah/wikistream-event-data-pipeline-aws | 6 | 1 1 0 1 1 1 1 | 38.7 | 107 |
| jvanbuel/flowrs | 6 | 1 1 0 1 1 1 1 | 4.4 | 272 |
| omercengiz/flowsense-engine | 5 | 1 1 0 1 1 0 1 | 16.6 | 153 |
| AhmedAliAli811/COVID19_Data_Engineering_Project | 5 | 1 1 1 1 0 0 1 | 4.1 | 96 |
| EcklBar/Spotify_ELT | 5 | 1 1 0 1 1 0 1 | 3.3 | 27 |
| ram07eng/airflow-watcher | 5 | 1 1 0 1 1 0 1 | 39.8 | 238 |
| Silism/silism-commerce-360-platform | 5 | 1 1 1 1 0 0 1 | 28 | 667 |
| rahrajlat/airflow-widgets | 5 | 1 1 1 1 0 0 1 | 11.5 | 60 |
| SaiPurushoth/dbt-clickhouse-accelerator | 5 | 1 1 1 1 0 0 1 | 7.8 | 66 |
| rahrajlat/cricket-analysis | 5 | 1 1 1 1 0 0 1 | 10.7 | 43 |
| rahrajlat/air-labs | 5 | 1 1 1 1 0 0 1 | 3.5 | 124 |
| AhmedAliAli811/Server-Log-Processing-Using-Spark | 4 | 1 1 0 1 0 0 1 | 16.8 | 24 |
| AlejandroMorgante/agentic-airflow-demo | 4 | 1 1 0 1 0 0 1 | 14.8 | 66 |
| PotemkinAlexey/airflow-local-debug | 4 | 1 0 0 1 1 0 1 | 12 | 96 |
| vojay-dev/gemini-playroom-diet | 4 | 1 1 0 1 0 0 1 | 21.8 | 94 |
| rahrajlat/airflow-ai-ops | 4 | 1 1 0 1 0 0 1 | 9.6 | 59 |
| markov-ngz/Asphalt | 4 | 1 1 0 1 1 0 0 | 2 | 295 |
| cybermaxs/github-stars-monitor | 4 | 0 0 1 1 1 0 1 | 4.6 | 43 |
| sonGokuKhk98/Formula_1 | 4 | 1 1 1 0 0 0 1 | 19.5 | 80 |
| abeltavares/batch-data-pipeline | 4 | 1 1 0 1 0 0 1 | 23.7 | 43 |
| CharbelDaher34/anip | 4 | 1 1 0 1 0 0 1 | 15.5 | 88 |
| Ravteja98/astro-stock-tracker | 4 | 1 1 0 1 0 0 1 | 3.3 | 17566 |
| rahrajlat/astro-airflow-hackathon | 3 | 1 1 0 0 0 0 1 | 21.4 | 82 |
| rahrajlat/Gentui | 3 | 0 0 0 1 1 0 1 | 6.7 | 136 |
| rahrajlat/airflow-run-lens | 3 | 1 1 0 0 0 0 1 | 7 | 20 |
| zeynepclktn/digital-shelf-etl-pipeline | 3 | 1 1 0 0 0 0 1 | 2.9 | 11 |
| milosacim/strava-analytics | 3 | 1 0 1 1 0 0 0 | 2.1 | 24 |
| Kvriem/football-lakehouse | 3 | 1 1 0 0 0 0 1 | 9.1 | 36 |
| phanindrapalisetty/basalt | 3 | 0 1 0 1 0 0 1 | 4.7 | 43 |
| ponderedw/airflow-schedule-insights | 3 | 1 1 0 0 1 0 0 | 2.1 | 50 |
| rahrajlat/airflow-schedule-heatmap | 3 | 1 1 0 0 0 0 1 | 5.4 | 50 |
| iamniteshjangir/semantic-py | 3 | 0 0 0 1 1 0 1 | 16.6 | 74 |
| reshefsharvit/ufc-data-warehouse | 3 | 1 0 1 1 0 0 0 | 0.8 | 112 |
| ImenBenAmar/Pipline-Data-Medical | 3 | 1 1 0 0 0 0 1 | 12.3 | 26 |
| aurelpow/yelp-batch-pipeline | 3 | 1 1 0 0 0 0 1 | 19.2 | 51 |
| rahrajlat/airflow-weather-llm | 3 | 1 1 0 0 0 0 1 | 8.8 | 11 |
| Abdullahdurrani/reddit-de | 3 | 1 1 0 0 0 0 1 | 4.5 | 19 |
| orion512/baskpipe | 3 | 0 0 0 0 1 1 1 | 5 | 177 |
| rahrajlat/airflow-daggie | 3 | 1 1 0 0 0 0 1 | 3.3 | 33 |
| marclamberti/airflogotchi | 3 | 1 1 0 0 0 0 1 | 6.6 | 35 |
| vikneshwara-r-b/spotify_azure_de_project | 2 | 0 0 0 0 0 1 1 | 27.8 | 39 |
| rahrajlat/vsflow-vscode | 2 | 1 0 0 0 0 0 1 | 13.1 | 41 |
| danielv089/drift-detective | 2 | 0 0 0 1 0 0 1 | 6.9 | 23 |
| ImenBenAmar/Real-Time-Sales-Streaming-Pipeline | 2 | 1 0 0 0 0 0 1 | 25.1 | 11 |
| NvkAnirudh/Real-Time-ECommerce-Sales-Analytics-Pipeline | 2 | 0 1 0 0 0 0 1 | 4.5 | 16 |
| willywairagu/RealTimeDataWarehouses | 2 | 1 1 0 0 0 0 0 | 2.7 | 23 |
| abeltavares/real-time-data-pipeline | 2 | 0 1 0 0 0 0 1 | 10 | 19 |
| ImenBenAmar/Tweets_Sentiment_Streaming | 1 | 0 0 0 0 0 0 1 | 9.2 | 36 |
| vikneshwara-r-b/yelp-open-dataset-medallion-architecture-snowflake | 1 | 0 0 0 0 0 0 1 | 9.4 | 9 |
