// Uji T04: pemeriksa materi menolak perintah yang dipakai sebelum diajarkan.
// Jalankan: node --test dojo/tools/tests/check-content.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../check-content.mjs", import.meta.url));
const fixture = fileURLToPath(new URL("./fixtures/maju", import.meta.url));

test("DISTINCT di bab-1 ditolak karena baru diajarkan di bab-2", () => {
  const r = spawnSync(process.execPath, [script, "--dir", fixture], { encoding: "utf8", timeout: 120000 });
  assert.equal(r.status, 1, r.stdout + r.stderr);
  assert.match(r.stdout, /bab-1: DISTINCT dipakai sebelum diajarkan \(diajarkan di bab-2\)/);
});

test("catatan tabel SQL Server ikut diperiksa untuk kata terlarang", () => {
  const r = spawnSync(process.execPath, [script, "--dir", fixture], { encoding: "utf8", timeout: 120000 });
  assert.match(r.stdout, /bab-1: memakai kata terlarang caveat/);
});
