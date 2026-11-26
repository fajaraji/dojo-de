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

// Dijalankan sebelum setiap run supaya tidak ada keadaan yang terbawa dari run sebelumnya:
// - modul buatan pengguna di /kerja dibuang dari sys.modules (kalau tidak, versi lamanya yang dipakai,
//   misalnya berkas tes pytest yang sudah diubah tetap menjalankan isi lama);
// - pengaturan logging dikembalikan ke awal (basicConfig di run sebelumnya membuat basicConfig berikutnya diam);
// - _dojo_run menangkap SystemExit (sys.exit) supaya tidak mematikan mesin; kodenya dikembalikan sebagai exitCode.
const RESET_STATE = `
import sys as _s, logging as _lg
for _k, _m in list(_s.modules.items()):
    _f = getattr(_m, "__file__", None) or ""
    if str(_f).startswith("/kerja"):
        _s.modules.pop(_k, None)
_root = _lg.getLogger()
for _h in _root.handlers[:]:
    _root.removeHandler(_h)
    try: _h.close()
    except Exception: pass
_root.setLevel(_lg.WARNING)
for _lgr in list(_lg.Logger.manager.loggerDict.values()):
    if isinstance(_lgr, _lg.Logger):
        for _h in _lgr.handlers[:]:
            _lgr.removeHandler(_h)
        _lgr.setLevel(_lg.NOTSET)
        _lgr.propagate = True
if "/kerja" not in _s.path:
    _s.path.insert(0, "/kerja")
if "_dojo_run" not in globals():
    from pyodide.code import eval_code_async as _eca
    async def _dojo_run(code, ns):
        try:
            await _eca(code, ns)
            return None
        except SystemExit as e:
            return e.code if e.code is not None else 0
del _k, _m, _f, _root, _lgr
`;

/** Menjalankan kode di namespace baru (setup lebih dulu). Hasil: { ok, stdout, stderr, exitCode?, error? }. */
export async function runCode(py, code, setup = "") {
  let out = "", err = "";
  // folder kerja dikosongkan setiap run, seperti namespace: berkas dari soal atau solusi sebelumnya
  // tidak boleh terbawa (kalau terbawa, jawaban yang salah bisa terlihat benar)
  py.runPython("import os, shutil; os.chdir('/'); shutil.rmtree('/kerja', ignore_errors=True); os.makedirs('/kerja'); os.chdir('/kerja')");
  py.runPython(RESET_STATE);
  const ns = py.globals.get("dict")();
  // kode dijalankan seperti skrip: __name__ == "__main__"
  ns.set("__name__", "__main__");
  try {
    py.setStdout({ batched: (s) => { out += s + "\n"; } });
    py.setStderr({ batched: (s) => { err += s + "\n"; } });
    const runner = py.globals.get("_dojo_run");
    let exitCode = null;
    try {
      if (setup) exitCode = await runner(setup, ns);
      if (exitCode === undefined || exitCode === null) exitCode = await runner(code, ns);
    } finally { runner.destroy(); }
    const r = { ok: true, stdout: out, stderr: err };
    if (exitCode !== undefined && exitCode !== null) r.exitCode = exitCode;
    return r;
  } catch (e) {
    // pesan error Python: baris terakhir traceback sebagai ringkasan
    const message = String(e && e.message || e);
    const lines = message.trim().split("\n");
    return { ok: false, stdout: out, stderr: err, error: { message: lines[lines.length - 1], traceback: message } };
  } finally {
    ns.destroy();
  }
}
