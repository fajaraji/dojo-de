// Membuat berkas SQL data TokoKita untuk dimuat ke database di laptop (bab "PostgreSQL dan SQL Server di laptop"):
//   dojo/data/tokokita-postgres.sql   → PostgreSQL (psql -f)
//   dojo/data/tokokita-sqlserver.sql  → SQL Server (sqlcmd -i)
// Isinya sama dengan database latihan di browser (generator dengan seed tetap).
// Pemakaian: node dojo/tools/export-sql.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { generate, toPostgresSql, LOAD_ORDER } from "../data/tokokita.js";

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, "../data");
const data = generate();

const head = (dialect) => `-- Data latihan TokoKita (Dojo Data Engineer), untuk ${dialect}.
-- Dibuat oleh dojo/tools/export-sql.mjs dari generator dengan seed tetap 20261126.
-- Isinya sama dengan database latihan di https://dojo-de.pages.dev
`;

// PostgreSQL: memakai DDL dan data yang sama dengan database di browser
fs.writeFileSync(path.join(outDir, "tokokita-postgres.sql"), head("PostgreSQL") + toPostgresSql(data));

// SQL Server: tipe disesuaikan (text → nvarchar, boolean → bit, timestamp → datetime2(0)), rujukan foreign key
// ditulis lengkap dengan kolomnya, dan CREATE SCHEMA dijalankan sebagai batch tersendiri (GO).
const SS_DDL = `
CREATE SCHEMA app;
GO
CREATE SCHEMA raw;
GO
CREATE TABLE app.cities (city_id int PRIMARY KEY, city_name nvarchar(100) NOT NULL, province nvarchar(100) NOT NULL, island nvarchar(50) NOT NULL);
CREATE TABLE app.categories (category_id int PRIMARY KEY, category_name nvarchar(100) NOT NULL, parent_id int REFERENCES app.categories (category_id));
CREATE TABLE app.staff (staff_id int PRIMARY KEY, full_name nvarchar(100) NOT NULL, role nvarchar(50) NOT NULL, manager_id int REFERENCES app.staff (staff_id));
CREATE TABLE app.customers (customer_id int PRIMARY KEY, full_name nvarchar(100) NOT NULL, email nvarchar(200) NOT NULL, phone nvarchar(30), city_id int NOT NULL REFERENCES app.cities (city_id), segment nvarchar(20) NOT NULL, signup_date date NOT NULL);
CREATE TABLE app.products (product_id int PRIMARY KEY, sku nvarchar(50) NOT NULL UNIQUE, product_name nvarchar(200) NOT NULL, category_id int NOT NULL REFERENCES app.categories (category_id), brand nvarchar(100) NOT NULL, list_price numeric(12,2) NOT NULL, is_active bit NOT NULL, created_at date NOT NULL);
CREATE TABLE app.product_price_history (product_id int NOT NULL REFERENCES app.products (product_id), price numeric(12,2) NOT NULL, valid_from date NOT NULL, PRIMARY KEY (product_id, valid_from));
CREATE TABLE app.orders (order_id int PRIMARY KEY, customer_id int NOT NULL REFERENCES app.customers (customer_id), order_ts datetime2(0) NOT NULL, channel nvarchar(20) NOT NULL, status nvarchar(20) NOT NULL, shipping_fee numeric(12,2) NOT NULL, voucher_code nvarchar(50), handled_by int REFERENCES app.staff (staff_id), updated_at datetime2(0) NOT NULL);
CREATE TABLE app.order_items (order_id int NOT NULL REFERENCES app.orders (order_id), line_no int NOT NULL, product_id int NOT NULL REFERENCES app.products (product_id), qty int NOT NULL, unit_price numeric(12,2) NOT NULL, discount numeric(12,2) NOT NULL, PRIMARY KEY (order_id, line_no));
CREATE TABLE app.payments (payment_id int PRIMARY KEY, order_id int NOT NULL REFERENCES app.orders (order_id), paid_ts datetime2(0) NOT NULL, method nvarchar(30) NOT NULL, amount numeric(12,2) NOT NULL, status nvarchar(20) NOT NULL);
CREATE TABLE app.shipments (order_id int PRIMARY KEY REFERENCES app.orders (order_id), courier nvarchar(50) NOT NULL, shipped_ts datetime2(0) NOT NULL, delivered_ts datetime2(0));
CREATE TABLE app.returns (return_id int PRIMARY KEY, order_id int NOT NULL, line_no int NOT NULL, return_ts datetime2(0) NOT NULL, qty int NOT NULL, reason nvarchar(200) NOT NULL, FOREIGN KEY (order_id, line_no) REFERENCES app.order_items (order_id, line_no));
CREATE TABLE raw.customer_snapshot (snapshot_date date, customer_id int, full_name nvarchar(100), email nvarchar(200), city_id int, segment nvarchar(20));
CREATE TABLE raw.supplier_price_upload (row_no int, sku_text nvarchar(100), price_text nvarchar(100), effective_date_text nvarchar(100), supplier nvarchar(200));
CREATE TABLE raw.web_events (event_id bigint, customer_id int, event_ts datetime2(0), event_type nvarchar(30), page nvarchar(200));
CREATE TABLE raw.orders_batch2 (order_id int, customer_id int, order_ts datetime2(0), channel nvarchar(20), status nvarchar(20), shipping_fee numeric(12,2), voucher_code nvarchar(50), updated_at datetime2(0));
CREATE TABLE raw.finance_monthly (bln date, gross_sales numeric(14,2));
GO
`;
const ssValue = (v) => {
  if (v === null || v === undefined) return "NULL";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "1" : "0";
  return "N'" + String(v).replace(/'/g, "''") + "'";
};
// SQL Server menerima paling banyak 1.000 baris per INSERT … VALUES
let ss = head("SQL Server") + "SET NOCOUNT ON;\nGO\n" + SS_DDL;
for (const name of LOAD_ORDER) {
  const t = data.tables[name];
  for (let i = 0; i < t.rows.length; i += 1000) {
    const chunk = t.rows.slice(i, i + 1000).map(r => "(" + r.map(ssValue).join(", ") + ")").join(",\n");
    ss += `INSERT INTO ${name} (${t.columns.join(", ")}) VALUES\n${chunk};\n`;
  }
  ss += "GO\n";
}
fs.writeFileSync(path.join(outDir, "tokokita-sqlserver.sql"), ss);

for (const f of ["tokokita-postgres.sql", "tokokita-sqlserver.sql"]) {
  console.log(`${f}  ${(fs.statSync(path.join(outDir, f)).size / 1048576).toFixed(1)} MB`);
}
