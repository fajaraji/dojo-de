// Mengukur cara memuat data TokoKita: COPY, INSERT, dan database siap pakai (loadDataDir).
// Pemakaian: node dojo/tools/measure-load.mjs
import { generate, loadInto } from "../data/tokokita.js";
import { PGlite } from "../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

const mb = () => Math.round(process.memoryUsage().rss / 1048576);
const t0 = Date.now();
const data = generate();
console.log(`buat data: ${Date.now() - t0} ms`);
console.log("jumlah baris:", Object.entries(data.tables).map(([k, v]) => `${k}=${v.rows.length}`).join(", "));

for (const method of ["copy", "insert"]) {
  const db = await PGlite.create();
  const { ms } = await loadInto(db, data, { method });
  console.log(`muat dengan ${method}: ${ms} ms (RAM proses ${mb()} MB)`);
  if (method === "copy") {
    const dump = await db.dumpDataDir("gzip");
    const buf = new Uint8Array(await dump.arrayBuffer());
    console.log(`database siap pakai (gzip): ${(buf.length / 1048576).toFixed(2)} MB`);
    await db.close();
    const t1 = Date.now();
    const db2 = await PGlite.create({ loadDataDir: new Blob([buf]) });
    const r = await db2.query("select count(*)::int n from app.order_items");
    console.log(`nyala dari database siap pakai: ${Date.now() - t1} ms, order_items=${r.rows[0].n} (RAM proses ${mb()} MB)`);
    await db2.close();
  } else await db.close();
}
