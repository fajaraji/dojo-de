// Menyiapkan mesin Python (Pyodide) yang di-host sendiri di dojo/vendor/pyodide-<versi>/.
// Menyalin berkas inti dari paket npm, lalu mengunduh hanya wheel paket yang dipakai materi
// (beserta dependensinya) dari CDN resmi Pyodide, memeriksa sha256-nya terhadap pyodide-lock.json,
// dan menulis pyodide-lock.json yang sudah disaring.
// Pemakaian: node dojo/tools/build-pyodide.mjs
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const npmDir = path.join(here, "../vendor-npm/node_modules/pyodide");
const { version } = JSON.parse(fs.readFileSync(path.join(npmDir, "package.json"), "utf8"));
const outDir = path.join(here, `../vendor/pyodide-${version}`);
const CDN = `https://cdn.jsdelivr.net/pyodide/v${version}/full/`;

// paket yang di-import oleh materi kursus
const WANT = ["pandas", "pyarrow", "pytest"];
const CORE = ["pyodide.mjs", "pyodide.asm.mjs", "pyodide.asm.wasm", "python_stdlib.zip"];

const lock = JSON.parse(fs.readFileSync(path.join(npmDir, "pyodide-lock.json"), "utf8"));
const need = new Set();
const visit = (name) => {
  const key = name.toLowerCase();
  if (need.has(key)) return;
  const p = lock.packages[key];
  if (!p) throw new Error(`paket ${name} tidak ada di pyodide-lock.json`);
  need.add(key);
  for (const d of p.depends) visit(d);
};
WANT.forEach(visit);

fs.mkdirSync(outDir, { recursive: true });
for (const f of CORE) fs.copyFileSync(path.join(npmDir, f), path.join(outDir, f));

let total = 0;
for (const key of [...need].sort()) {
  const p = lock.packages[key];
  const dest = path.join(outDir, p.file_name);
  let buf = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
  if (!buf || crypto.createHash("sha256").update(buf).digest("hex") !== p.sha256) {
    const res = await fetch(CDN + p.file_name);
    if (!res.ok) throw new Error(`gagal mengunduh ${p.file_name}: HTTP ${res.status}`);
    buf = Buffer.from(await res.arrayBuffer());
    const sum = crypto.createHash("sha256").update(buf).digest("hex");
    if (sum !== p.sha256) throw new Error(`sha256 ${p.file_name} tidak cocok`);
    fs.writeFileSync(dest, buf);
  }
  total += buf.length;
  console.log(`${p.file_name}  ${(buf.length / 1048576).toFixed(1)} MB`);
}

const filtered = { ...lock, packages: Object.fromEntries([...need].map(k => [k, lock.packages[k]])) };
fs.writeFileSync(path.join(outDir, "pyodide-lock.json"), JSON.stringify(filtered));
const core = CORE.reduce((s, f) => s + fs.statSync(path.join(outDir, f)).size, 0);
console.log(`\n${need.size} paket, wheel ${(total / 1048576).toFixed(1)} MB, inti ${(core / 1048576).toFixed(1)} MB → ${outDir}`);
