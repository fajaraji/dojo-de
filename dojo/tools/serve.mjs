// Server statis lokal untuk menguji dojo dengan aturan keamanan (CSP) yang meniru Artifact.
// Pemakaian: node dojo/tools/serve.mjs <port> <folder-akar>
// Awalan path memilih tingkat CSP:
//   /strict/...  tanpa izin WebAssembly maupun eval
//   /wasm/...    dengan 'wasm-unsafe-eval' (izin WebAssembly saja)
//   /eval/...    dengan 'unsafe-eval' (izin eval + WebAssembly)
//   /open/...    tanpa CSP sama sekali
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const port = Number(process.argv[2] || 8765);
const root = path.resolve(process.argv[3] || ".");
const types = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".wasm": "application/wasm",
  ".data": "application/octet-stream", ".gz": "application/gzip", ".tgz": "application/gzip", ".tar": "application/x-tar",
  ".png": "image/png", ".svg": "image/svg+xml", ".md": "text/markdown; charset=utf-8", ".sql": "text/plain; charset=utf-8",
};
const cdn = "https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com";
// Mode /wasm/ memakai aturan yang sama persis dengan dojo/_headers (yang dipakai Cloudflare Pages).
function productionCsp() {
  const file = path.join(root, "_headers");
  if (!fs.existsSync(file)) return null;
  const m = /Content-Security-Policy:\s*(.+)/.exec(fs.readFileSync(file, "utf8"));
  return m ? m[1].trim() : null;
}
function csp(mode) {
  if (mode === "open") return null;
  if (mode === "wasm" && productionCsp()) return productionCsp();
  const extra = mode === "wasm" ? " 'wasm-unsafe-eval'" : mode === "eval" ? " 'unsafe-eval'" : "";
  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' ${cdn}${extra}`,
    "worker-src 'self' blob:",
    "connect-src 'self'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
  ].join("; ");
}

http.createServer((req, res) => {
  const url = new URL(req.url, "http://localhost");
  const parts = url.pathname.split("/").filter(Boolean);
  let mode = "wasm";
  if (["strict", "wasm", "eval", "open"].includes(parts[0])) mode = parts.shift();
  let rel = decodeURIComponent(parts.join("/"));
  let file = path.join(root, rel);
  if (!file.startsWith(root)) { res.writeHead(403).end("forbidden"); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
  // Di Artifact, folder vendor/ terbit di samping halaman. Saat uji lokal, arahkan ke dojo/vendor/.
  if (!fs.existsSync(file) && rel.includes("vendor/")) file = path.join(root, rel.slice(rel.indexOf("vendor/")));
  if (!fs.existsSync(file)) { res.writeHead(404, { "Content-Type": "text/plain" }).end("404 " + rel); return; }
  const headers = { "Content-Type": types[path.extname(file).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" };
  const policy = csp(mode);
  if (policy) headers["Content-Security-Policy"] = policy;
  res.writeHead(200, headers);
  fs.createReadStream(file).pipe(res);
}).listen(port, () => console.log(`dojo server: http://localhost:${port}/  (akar: ${root})`));
