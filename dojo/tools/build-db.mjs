// Membuat database siap pakai berisi data TokoKita: dojo/data/tokokita-db.tgz
// Browser cukup memuat berkas ini, tanpa membuat database dari nol (lebih cepat, puncak RAM lebih rendah).
// Jalankan ulang setiap kali dojo/data/tokokita.js berubah: node dojo/tools/build-db.mjs
import fs from "node:fs";
import { generate, loadInto } from "../data/tokokita.js";
import { PGlite } from "../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

const out = new URL("../data/tokokita-db.tgz", import.meta.url);
const db = await PGlite.create();
const { ms } = await loadInto(db, generate());
await db.exec("vacuum;");
const dump = await db.dumpDataDir("gzip");
const buf = new Uint8Array(await dump.arrayBuffer());
fs.writeFileSync(out, buf);
await db.close();
console.log(`data dimuat dalam ${ms} ms; berkas ${(buf.length / 1048576).toFixed(2)} MB → ${out.pathname}`);
