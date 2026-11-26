// Penghubung halaman dengan worker mesin: menyalakan, menjalankan query satu per satu, batas waktu, dan nyala ulang.
export function createEngine({ base, dbUrl, timeoutMs = 8000, initTimeoutMs = 90000, onStatus = () => {} }) {
  let worker = null, readyPromise = null, seq = 0, chain = Promise.resolve();
  const pending = new Map();

  function spawn() {
    worker = new Worker(new URL("./engine-worker.js", import.meta.url), { type: "module" });
    worker.onmessage = (e) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      clearTimeout(p.timer);
      p.resolve(e.data);
    };
    worker.onerror = (e) => {
      const message = "Mesin berhenti: " + (e.message || "worker tidak bisa dijalankan (kemungkinan diblokir aturan keamanan browser)");
      for (const p of pending.values()) { clearTimeout(p.timer); p.resolve({ ok: false, error: { message } }); }
      pending.clear();
    };
  }

  function stop() {
    if (worker) worker.terminate();
    worker = null;
    for (const p of pending.values()) clearTimeout(p.timer);
    pending.clear();
  }

  function call(msg, ms, timeoutMessage) {
    return new Promise((resolve) => {
      const id = ++seq;
      const timer = ms ? setTimeout(() => {
        pending.delete(id);
        resolve({ ok: false, timedOut: true, error: { message: timeoutMessage } });
      }, ms) : null;
      pending.set(id, { resolve, timer });
      worker.postMessage({ id, ...msg });
    });
  }

  async function start() {
    spawn();
    onStatus("Mengunduh dan menyalakan mesin PostgreSQL (sekitar 22 MB, hanya saat kunjungan pertama)…");
    const t0 = performance.now();
    const r = await call({ type: "init", base, dbUrl }, initTimeoutMs,
      `Mesin belum siap setelah ${Math.round(initTimeoutMs / 1000)} detik. Kemungkinan koneksi internet lambat.`);
    if (!r.ok) {
      stop();
      readyPromise = null; // percobaan berikutnya (menjalankan query lagi) akan menyalakan ulang dari awal
      const msg = r.timedOut
        ? r.error.message + " Materi tetap bisa dibaca. Jalankan query lagi untuk mencoba ulang, atau muat ulang halaman."
        : "Mesin SQL tidak bisa berjalan di browser ini. Materi tetap bisa dibaca. Penyebab: " + (r.error && r.error.message);
      onStatus(msg, true);
      throw new Error(r.error && r.error.message || "gagal menyalakan mesin");
    }
    onStatus(`PostgreSQL siap (${((performance.now() - t0) / 1000).toFixed(1)} detik, ${r.source})`);
  }

  function ready() {
    if (!readyPromise) readyPromise = start();
    return readyPromise;
  }

  function restart() {
    stop();
    readyPromise = null;
    return ready();
  }

  function run(sql, { setup = "", isolate = true } = {}) {
    const job = chain.then(async () => {
      try { await ready(); } catch (e) { return { ok: false, error: { message: "Mesin SQL belum siap: " + e.message } }; }
      const r = await call({ type: "run", sql, setup, isolate }, timeoutMs,
        `Query dihentikan karena berjalan lebih dari ${timeoutMs / 1000} detik. Mesin dinyalakan ulang. Periksa apakah query-mu punya batas, misalnya rekursi yang tidak pernah berhenti.`);
      if (r.timedOut) {
        onStatus("Query dihentikan, mesin sedang dinyalakan ulang…");
        try { await restart(); } catch { /* status sudah diisi oleh start() */ }
      }
      return r;
    });
    chain = job.catch(() => {});
    return job;
  }

  return { ready, run, restart };
}
