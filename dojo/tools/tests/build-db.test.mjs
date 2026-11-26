// Uji T02: berkas database siap pakai (dibuat oleh dojo/tools/build-db.mjs).
// Jalankan: node --test dojo/tools/tests/build-db.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { generate } from "../../data/tokokita.js";
import { PGlite } from "../../vendor-npm/node_modules/@electric-sql/pglite/dist/index.js";

const DB_FILE = new URL("../../data/tokokita-db.tgz", import.meta.url);

test("database siap pakai berisi jumlah baris yang sama dengan generator", async () => {
  assert.ok(fs.existsSync(DB_FILE), "berkas data/tokokita-db.tgz belum dibuat (jalankan node dojo/tools/build-db.mjs)");
  const db = await PGlite.create({ loadDataDir: new Blob([fs.readFileSync(DB_FILE)]) });
  for (const [name, t] of Object.entries(generate().tables)) {
    const r = await db.query(`select count(*)::int as n from ${name}`);
    assert.equal(r.rows[0].n, t.rows.length, `jumlah baris ${name}`);
  }
  await db.close();
});
