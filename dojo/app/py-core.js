// Logika inti mesin Python yang dipakai bersama oleh worker di browser (py-worker.js) dan pemeriksa materi
// di Node (tools/check-content.mjs), supaya keduanya menjalankan kode dengan cara yang persis sama.
import { generate } from "../data/tokokita.js";

function csvCell(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n\r]|^\s|\s$/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}

/** Menulis data TokoKita sebagai CSV ke /data/app/*.csv dan /data/raw/*.csv, lalu pindah ke folder kerja /kerja. */
export function writeData(py) {
  const data = generate();
  for (const [name, t] of Object.entries(data.tables)) {
    const [schema, table] = name.split(".");
    py.FS.mkdirTree(`/data/${schema}`);
    const lines = [t.columns.join(","), ...t.rows.map(r => r.map(csvCell).join(","))];
    py.FS.writeFile(`/data/${schema}/${table}.csv`, lines.join("\n") + "\n");
  }
  py.FS.mkdirTree("/kerja");
  py.runPython("import os; os.chdir('/kerja')");
}

// Memuat dan meng-import lebih dulu paket berat yang dipakai kode, supaya:
// 1) waktu unduh dan import pertama tidak terhitung ke batas waktu kode pengguna;
// 2) pyarrow selalu di-import sebelum pandas. pyarrow 22 gagal ("No type extension with name
//    arrow.py_extension_type") kalau di-import setelah pandas di proses yang sama; pandas juga
//    memakai pyarrow diam-diam untuk to_parquet/read_parquet.
const HEAVY = ["pyarrow", "pandas", "numpy", "pytest"];
export async function prepare(py, code) {
  const found = new Set(py.pyodide_py.code.find_imports(code).toJs());
  if (/parquet/i.test(code)) found.add("pyarrow");
  const loaded = (name) => py.runPython(`import sys; ${JSON.stringify(name)} in sys.modules`);
  if (found.has("pyarrow") && !loaded("pyarrow") && loaded("pandas")) return { ok: false, restart: true };
  const quiet = () => {};
  await py.loadPackagesFromImports(code, { messageCallback: quiet, errorCallback: quiet });
  if (found.has("pyarrow")) await py.loadPackage("pyarrow", { messageCallback: quiet, errorCallback: quiet });
  for (const name of HEAVY) if (found.has(name)) await py.runPythonAsync(`import ${name}`);
  return { ok: true };
}

/** Menjalankan kode di namespace baru (setup lebih dulu). Hasil: { ok, stdout, stderr, error? }. */
export async function runCode(py, code, setup = "") {
  let out = "", err = "";
  const ns = py.globals.get("dict")();
  try {
    py.setStdout({ batched: (s) => { out += s + "\n"; } });
    py.setStderr({ batched: (s) => { err += s + "\n"; } });
    if (setup) await py.runPythonAsync(setup, { globals: ns });
    await py.runPythonAsync(code, { globals: ns });
    return { ok: true, stdout: out, stderr: err };
  } catch (e) {
    // pesan error Python: baris terakhir traceback sebagai ringkasan
    const message = String(e && e.message || e);
    const lines = message.trim().split("\n");
    return { ok: false, stdout: out, stderr: err, error: { message: lines[lines.length - 1], traceback: message } };
  } finally {
    ns.destroy();
  }
}
