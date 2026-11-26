// Penghubung halaman dengan worker Python (Pyodide): menyalakan saat pertama dipakai, menjalankan kode
// satu per satu, batas waktu, dan nyala ulang. Bentuknya sama dengan engine.js (mesin SQL).
export function createPyEngine({ base, timeoutMs = 10000, initTimeoutMs = 120000, onStatus = () => {} }) {
  let worker = null, readyPromise = null, seq = 0, chain = Promise.resolve();
  const pending = new Map();

  function spawn() {
    worker = new Worker(new URL("./py-worker.js", import.meta.url), { type: "module" });
    worker.onmessage = (e) => {
      const p = pending.get(e.data.id);
      if (!p) return;
      pending.delete(e.data.id);
      clearTimeout(p.timer);
      p.resolve(e.data);
    };
    worker.onerror = (e) => {
      const message = "Mesin Python berhenti: " + (e.message || "worker tidak bisa dijalankan (kemungkinan diblokir aturan keamanan browser)");
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
    onStatus("Mengunduh dan menyalakan mesin Python (sekitar 13 MB; pandas dan pustaka lain diunduh saat pertama dipakai)…");
    const t0 = performance.now();
    const r = await call({ type: "init", base }, initTimeoutMs,
      `Mesin Python belum siap setelah ${Math.round(initTimeoutMs / 1000)} detik. Kemungkinan koneksi internet lambat.`);
    if (!r.ok) {
      stop();
      readyPromise = null;
      const msg = r.timedOut
        ? r.error.message + " Materi tetap bisa dibaca. Jalankan kode lagi untuk mencoba ulang, atau muat ulang halaman."
        : "Mesin Python tidak bisa berjalan di browser ini. Materi tetap bisa dibaca. Penyebab: " + (r.error && r.error.message);
      onStatus(msg, true);
      throw new Error(r.error && r.error.message || "gagal menyalakan mesin Python");
    }
    onStatus(`Python siap (${((performance.now() - t0) / 1000).toFixed(1)} detik)`);
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

  function run(code, { setup = "" } = {}) {
    const job = chain.then(async () => {
      try { await ready(); } catch (e) { return { ok: false, error: { message: "Mesin Python belum siap: " + e.message } }; }
      const prepMsg = { type: "prepare", code: setup + "\n" + code };
      const prepTimeout = `Pustaka Python belum selesai diunduh setelah ${Math.round(initTimeoutMs / 1000)} detik. Kemungkinan koneksi internet lambat.`;
      let prep = await call(prepMsg, initTimeoutMs, prepTimeout);
      if (prep.restart) {
        // pyarrow harus di-import sebelum pandas; worker dinyalakan ulang supaya urutannya benar
        onStatus("Menyiapkan pustaka Parquet, mesin Python dinyalakan ulang…");
        try { await restart(); } catch (e) { return { ok: false, error: { message: "Mesin Python belum siap: " + e.message } }; }
        prep = await call(prepMsg, initTimeoutMs, prepTimeout);
      }
      if (!prep.ok) {
        if (prep.timedOut) { stop(); readyPromise = null; }
        return { ok: false, error: { message: prep.error.message } };
      }
      const r = await call({ type: "run", code, setup }, timeoutMs,
        `Kode dihentikan karena berjalan lebih dari ${timeoutMs / 1000} detik. Mesin dinyalakan ulang. Periksa perulangan yang tidak pernah berhenti, misalnya while yang syaratnya selalu benar.`);
      if (r.timedOut) {
        onStatus("Kode dihentikan, mesin Python sedang dinyalakan ulang…");
        try { await restart(); } catch { /* status sudah diisi oleh start() */ }
      }
      return r;
    });
    chain = job.catch(() => {});
    return job;
  }

  return { ready, run, restart };
}
