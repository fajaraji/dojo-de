// Uji mandiri di halaman (#uji): membuktikan mesin, isolasi data, dan pemulihan dari query macet.
import { generate } from "../data/tokokita.js";

export async function selfTest(engine) {
  const out = [];
  const add = (name, ok, detail) => out.push({ name, ok, detail });

  const t0 = performance.now();
  try {
    await engine.ready();
    const ms = Math.round(performance.now() - t0);
    add("1. Mesin siap dalam waktu kurang dari 20 detik", ms < 20000, `${ms} ms`);
  } catch (e) {
    add("1. Mesin siap dalam waktu kurang dari 20 detik", false, String(e && e.message || e));
    return out;
  }

  const expected = generate().tables["app.orders"].rows.length;
  const count = async () => {
    const r = await engine.run("select count(*)::int as n from app.orders");
    return r.ok ? r.results[r.results.length - 1].rows[0][0] : `gagal: ${r.error.message}`;
  };
  const n = await count();
  add("2. Jumlah baris app.orders sama dengan generator", n === expected, `${n} (seharusnya ${expected})`);

  const t1 = performance.now();
  const loop = await engine.run("with recursive r(n) as (select 1 union all select n+1 from r) select count(*) from r");
  const after = await engine.run("select 1 as hidup");
  add("3. Query tanpa ujung dihentikan, lalu mesin bisa dipakai lagi",
    loop.ok === false && loop.timedOut === true && after.ok === true,
    `berhenti setelah ${Math.round(performance.now() - t1)} ms; query berikutnya ${after.ok ? "berhasil" : "gagal: " + after.error.message}`);

  // app.payments tidak dirujuk tabel lain, jadi DELETE benar-benar menghapus semua baris di dalam latihan.
  const payExpected = generate().tables["app.payments"].rows.length;
  const del = await engine.run("delete from app.payments; select count(*)::int from app.payments");
  const inside = del.ok ? del.results[del.results.length - 1].rows[0][0] : null;
  const later = await engine.run("select count(*)::int from app.payments");
  const n2 = later.ok ? later.results[0].rows[0][0] : null;
  add("4. DELETE di dalam latihan tidak mengubah data untuk soal berikutnya", del.ok && inside === 0 && n2 === payExpected,
    `DELETE ${del.ok ? `berjalan (di dalam latihan tersisa ${inside} baris)` : "gagal: " + del.error.message}; sesudahnya ${n2} baris (seharusnya ${payExpected})`);

  // END sama dengan COMMIT di PostgreSQL; harus ditolak supaya perubahan tidak tersimpan.
  const end = await engine.run("delete from app.payments; end; select 1");
  const after2 = await engine.run("select count(*)::int from app.payments");
  const n3 = after2.ok ? after2.results[0].rows[0][0] : null;
  add("5. Perintah END (sama dengan COMMIT) ditolak dan data tetap utuh", end.ok === false && n3 === payExpected,
    `${end.ok ? "END tidak ditolak" : "ditolak: " + end.error.message}; sesudahnya ${n3} baris (seharusnya ${payExpected})`);
  return out;
}
