// Worker mesin Python: menjalankan Pyodide (Python 3.14 di WebAssembly) yang di-host sendiri.
// Logika menulis data, menyiapkan paket, dan menjalankan kode ada di py-core.js (dipakai juga pemeriksa materi).
import { loadPyodide } from "../vendor/pyodide-314.0.7/pyodide.mjs";
import { writeData, prepare, runCode } from "./py-core.js";

let py = null;

self.onmessage = async (e) => {
  const m = e.data;
  try {
    if (m.type === "init") {
      py = await loadPyodide({ indexURL: m.base });
      writeData(py);
      self.postMessage({ id: m.id, ok: true });
    } else if (m.type === "prepare") {
      self.postMessage({ id: m.id, ...(await prepare(py, m.code)) });
    } else if (m.type === "run") {
      const t0 = performance.now();
      const r = await runCode(py, m.code, m.setup || "");
      self.postMessage({ id: m.id, ...r, ms: Math.round(performance.now() - t0) });
    }
  } catch (err) {
    self.postMessage({ id: m.id, ok: false, error: { message: String(err && err.message || err) } });
  }
};
