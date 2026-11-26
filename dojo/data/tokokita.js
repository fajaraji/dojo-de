// Data latihan TokoKita: toko online fiktif.
// Dipakai di browser (worker mesin) dan di Node (uji & pemeriksa materi). Tidak boleh memakai DOM.
// Semua nilai acak berasal dari seed tetap, jadi hasilnya selalu sama.

export const SEED = 20261126;
export const DATA_CUTOFF = "2025-10-31 23:59:59"; // batas data aplikasi (batch 1)

/* ------------------------------------------------------------------ alat bantu */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const DAY = 86400000, HOUR = 3600000, MIN = 60000;
const toMs = (s) => Date.parse(s.length === 10 ? s + "T00:00:00Z" : s.replace(" ", "T") + "Z");
const fmtDate = (ms) => new Date(ms).toISOString().slice(0, 10);
const fmtTs = (ms) => new Date(ms).toISOString().slice(0, 19).replace("T", " ");
const endOfMonth = (y, m) => fmtDate(Date.UTC(y, m, 0)); // m = 1..12

function makeRand(seed) {
  const r = mulberry32(seed);
  const api = {
    next: r,
    int: (a, b) => a + Math.floor(r() * (b - a + 1)),
    chance: (p) => r() < p,
    pick: (arr) => arr[Math.floor(r() * arr.length)],
    wpick: (items, weights) => {
      let total = 0; for (const w of weights) total += w;
      let x = r() * total;
      for (let i = 0; i < items.length; i++) { x -= weights[i]; if (x < 0) return items[i]; }
      return items[items.length - 1];
    },
    shuffle: (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  };
  return api;
}
const rupiah = (x) => Math.max(1000, Math.round(x / 1000) * 1000 - 100); // contoh: 149.900

/* ------------------------------------------------------------------ data referensi */
const CITIES = [
  ["Jakarta", "DKI Jakarta", "Jawa"], ["Bogor", "Jawa Barat", "Jawa"], ["Depok", "Jawa Barat", "Jawa"],
  ["Tangerang", "Banten", "Jawa"], ["Bekasi", "Jawa Barat", "Jawa"], ["Bandung", "Jawa Barat", "Jawa"],
  ["Semarang", "Jawa Tengah", "Jawa"], ["Yogyakarta", "DI Yogyakarta", "Jawa"], ["Surakarta", "Jawa Tengah", "Jawa"],
  ["Surabaya", "Jawa Timur", "Jawa"], ["Malang", "Jawa Timur", "Jawa"], ["Denpasar", "Bali", "Bali"],
  ["Medan", "Sumatera Utara", "Sumatera"], ["Padang", "Sumatera Barat", "Sumatera"], ["Pekanbaru", "Riau", "Sumatera"],
  ["Palembang", "Sumatera Selatan", "Sumatera"], ["Bandar Lampung", "Lampung", "Sumatera"], ["Pontianak", "Kalimantan Barat", "Kalimantan"],
  ["Balikpapan", "Kalimantan Timur", "Kalimantan"], ["Banjarmasin", "Kalimantan Selatan", "Kalimantan"], ["Makassar", "Sulawesi Selatan", "Sulawesi"],
  ["Manado", "Sulawesi Utara", "Sulawesi"], ["Mataram", "Nusa Tenggara Barat", "Nusa Tenggara"], ["Jayapura", "Papua", "Papua"],
];
const CITY_WEIGHT = [14, 5, 4, 5, 5, 7, 5, 4, 3, 7, 4, 3, 5, 2, 2, 3, 2, 2, 2, 2, 3, 1, 1, 1];
const FIRST = ["Andi", "Budi", "Citra", "Dewi", "Eko", "Fajar", "Gita", "Hadi", "Indah", "Joko", "Kartika", "Lestari", "Maya", "Nanda", "Oki", "Putri", "Rizky", "Sari", "Teguh", "Utami", "Vina", "Wahyu", "Yoga", "Zahra", "Agus", "Bayu", "Dian", "Fitri", "Galih", "Hendra", "Intan", "Lukman", "Mega", "Nur", "Rina", "Sinta", "Tono", "Wulan", "Yudi", "Ayu"];
const LAST = ["Pratama", "Saputra", "Wijaya", "Santoso", "Hidayat", "Kusuma", "Nugroho", "Siregar", "Nasution", "Harahap", "Simanjuntak", "Wibowo", "Setiawan", "Gunawan", "Halim", "Purba", "Sitompul", "Rahman", "Syahputra", "Anggraini", "Permata", "Utomo", "Susanto", "Firmansyah", "Ramadhan", "Kurniawan", "Hakim", "Saragih", "Tanjung", "Lubis", "Daulay", "Pane", "Manurung", "Sembiring", "Ginting", "Tarigan", "Hutapea", "Panjaitan", "Maharani", "Wardhana"];
const SEGMENTS = ["Reguler", "Silver", "Gold"];
const CATEGORIES = [
  [1, "Elektronik", null], [2, "Audio", 1], [3, "Earphone", 2], [4, "Speaker", 2], [5, "Aksesoris HP", 1], [6, "Charger & Kabel", 5], [7, "Casing & Pelindung", 5],
  [8, "Rumah Tangga", null], [9, "Dapur", 8], [10, "Peralatan Masak", 9], [11, "Wadah Makanan", 9], [12, "Kebersihan", 8], [13, "Alat Pembersih", 12],
  [14, "Kesehatan & Kecantikan", null], [15, "Perawatan Kulit", 14], [16, "Vitamin & Suplemen", 14],
  [17, "Olahraga", null], [18, "Pakaian Olahraga", 17], [19, "Peralatan Fitness", 17],
  [20, "Buku & Alat Tulis", null], [21, "Buku", 20], [22, "Alat Tulis", 20],
];
// kategori daun: [category_id, nama-nama dasar produk, harga min, harga max]
const LEAVES = [
  [3, ["Earphone Bluetooth", "Earbuds TWS", "Headset Kabel"], 89000, 599000],
  [4, ["Speaker Bluetooth Mini", "Speaker Portabel", "Soundbar"], 149000, 1199000],
  [6, ["Charger 20W", "Kabel USB-C 1m", "Power Bank 10000mAh"], 39000, 349000],
  [7, ["Casing Silikon", "Pelindung Layar", "Casing Antibanting"], 25000, 129000],
  [10, ["Wajan Anti Lengket 26cm", "Panci Set 3 pcs", "Spatula Silikon"], 35000, 450000],
  [11, ["Kotak Makan 3 Sekat", "Toples Kaca 1L", "Botol Minum 750ml"], 25000, 150000],
  [13, ["Sapu Lantai", "Pel Putar", "Sikat Toilet"], 30000, 220000],
  [15, ["Sabun Wajah 100ml", "Pelembap 50ml", "Tabir Surya SPF50"], 35000, 180000],
  [16, ["Vitamin C 500mg", "Multivitamin 30 Tablet", "Minyak Ikan Omega-3"], 45000, 250000],
  [18, ["Kaos Lari", "Celana Training", "Kaus Kaki Olahraga"], 39000, 259000],
  [19, ["Matras Yoga 6mm", "Dumbbell 2kg", "Tali Skipping"], 35000, 299000],
  [21, ["Buku Resep Nusantara", "Novel Fiksi", "Buku Belajar SQL"], 59000, 189000],
  [22, ["Pulpen Gel 12 pcs", "Buku Catatan A5", "Stabilo 6 Warna"], 15000, 85000],
];
const BRANDS = ["Nusantara", "Sinar", "Mekar", "Kirana", "Arunika", "Satria", "Lumbung", "Garuda Home", "Prima", "Cendana"];
const VARIANTS = ["Hitam", "Putih", "Biru", "Merah", "Hijau"];
const ISLAND_FEE = { "Jawa": [9000, 12000], "Bali": [15000, 18000], "Sumatera": [15000, 18000], "Kalimantan": [20000, 25000], "Sulawesi": [20000, 25000], "Nusa Tenggara": [30000, 35000], "Papua": [30000, 35000] };
const ISLAND_DAYS = { "Jawa": [1, 3], "Bali": [2, 4], "Sumatera": [2, 4], "Kalimantan": [3, 6], "Sulawesi": [3, 6], "Nusa Tenggara": [4, 8], "Papua": [4, 8] };
const COURIERS = ["JNE", "J&T", "SiCepat", "AnterAja", "Pos Indonesia"];
const RAMADAN = [["2024-03-11", "2024-04-09"], ["2025-03-01", "2025-03-30"]];
const SPIKES = { "2024-09-09": 1.8, "2024-10-10": 1.8, "2024-11-11": 3, "2024-12-12": 2.5, "2025-09-09": 1.8, "2025-10-10": 1.8 };

/* ------------------------------------------------------------------ generator */
export function generate(seed = SEED) {
  const R = makeRand(seed);
  const tables = {};
  const put = (name, columns, rows) => { tables[name] = { columns, rows }; };

  // kota
  put("app.cities", ["city_id", "city_name", "province", "island"], CITIES.map((c, i) => [i + 1, c[0], c[1], c[2]]));
  const islandOf = (cityId) => CITIES[cityId - 1][2];

  // kategori
  put("app.categories", ["category_id", "category_name", "parent_id"], CATEGORIES.map(c => [c[0], c[1], c[2]]));

  // staf (hirarki atasan)
  const staffRows = [];
  const staffName = (i) => `${FIRST[(i * 7) % FIRST.length]} ${LAST[(i * 11 + 3) % LAST.length]}`;
  staffRows.push([1, staffName(1), "Direktur", null]);
  for (let i = 2; i <= 4; i++) staffRows.push([i, staffName(i), "Manajer", 1]);
  for (let i = 5; i <= 10; i++) staffRows.push([i, staffName(i), "Supervisor", 2 + ((i - 5) % 3)]);
  for (let i = 11; i <= 25; i++) staffRows.push([i, staffName(i), "Agen Layanan Pelanggan", 5 + ((i - 11) % 6)]);
  put("app.staff", ["staff_id", "full_name", "role", "manager_id"], staffRows);
  const agents = staffRows.filter(s => s[2] === "Agen Layanan Pelanggan").map(s => s[0]);

  // pelanggan: keadaan awal + perubahan bulanan 2025
  const firstDay = toMs("2023-01-01"), lastSignup = toMs("2025-09-30");
  const custs = [];
  for (let id = 1; id <= 1500; id++) {
    const fn = R.pick(FIRST), ln = R.pick(LAST);
    const signup = firstDay + Math.floor(Math.pow(R.next(), 1.3) * ((lastSignup - firstDay) / DAY)) * DAY;
    custs.push({
      id, name: `${fn} ${ln}`, email: `${fn}.${ln}${id}@mail.example`.toLowerCase(),
      phone: R.chance(0.04) ? null : "08" + String(R.int(1100000000, 9899999999)),
      city: R.wpick(CITIES.map((_, i) => i + 1), CITY_WEIGHT),
      segment: R.wpick(SEGMENTS, [70, 22, 8]), signup, active: 1 + Math.pow(R.next(), 3) * 8,
      changes: [], // [bulan 1..10, field, nilai]
    });
  }
  const pickCust = () => custs[R.int(0, custs.length - 1)];
  // pindah kota (sebagian pindah lalu kembali lagi)
  for (const c of R.shuffle(custs).slice(0, 170)) {
    const m = R.int(2, 9), orig = c.city;
    let to = c.city; while (to === c.city) to = R.wpick(CITIES.map((_, i) => i + 1), CITY_WEIGHT);
    c.changes.push([m, "city", to]);
    if (R.chance(0.12)) c.changes.push([R.int(m + 1, 10), "city", orig]);
  }
  // naik/turun segmen
  for (const c of R.shuffle(custs).slice(0, 320)) {
    const idx = SEGMENTS.indexOf(c.segment);
    const nidx = idx === 0 ? 1 : idx === 2 ? 1 : R.pick([0, 2]);
    c.changes.push([R.int(2, 10), "segment", SEGMENTS[nidx]]);
  }
  // koreksi email (perubahan yang tidak perlu riwayat)
  for (const c of R.shuffle(custs).slice(0, 50)) c.changes.push([R.int(2, 10), "email", c.email.replace("@mail.example", "@surel.example")]);
  for (const c of custs) c.changes.sort((a, b) => a[0] - b[0]);
  const stateAt = (c, month) => {
    const s = { city: c.city, segment: c.segment, email: c.email };
    for (const [m, f, v] of c.changes) if (m <= month) s[f] = v;
    return s;
  };
  const snapRows = [];
  for (let m = 1; m <= 10; m++) {
    const snapDate = endOfMonth(2025, m), snapMs = toMs(snapDate);
    for (const c of custs) if (c.signup <= snapMs) { const s = stateAt(c, m); snapRows.push([snapDate, c.id, c.name, s.email, s.city, s.segment]); }
  }
  put("app.customers", ["customer_id", "full_name", "email", "phone", "city_id", "segment", "signup_date"],
    custs.map(c => { const s = stateAt(c, 10); return [c.id, c.name, s.email, c.phone, s.city, s.segment, fmtDate(c.signup)]; }));
  put("raw.customer_snapshot", ["snapshot_date", "customer_id", "full_name", "email", "city_id", "segment"], snapRows);

  // produk + riwayat harga
  const products = [];
  let pid = 1;
  const perLeaf = LEAVES.map((_, i) => 11 + (i < 7 ? 1 : 0)); // 7×12 + 6×11 = 150
  LEAVES.forEach(([cat, bases, lo, hi], li) => {
    for (let k = 0; k < perLeaf[li]; k++) {
      const base = bases[k % bases.length], brand = R.pick(BRANDS);
      const variant = R.chance(0.5) ? " " + R.pick(VARIANTS) : "";
      const created = toMs("2023-01-01") + R.int(0, Math.round((toMs("2025-06-30") - toMs("2023-01-01")) / DAY)) * DAY;
      const p0 = rupiah(lo + Math.pow(R.next(), 1.6) * (hi - lo));
      products.push({ id: pid, sku: "TK-" + String(pid * 7 + 10000).padStart(5, "0"), name: `${base} ${brand}${variant}`, cat, brand, created, active: R.chance(0.92), prices: [[created, p0]] });
      pid++;
    }
  });
  for (const p of R.shuffle(products).slice(0, 45)) {
    let last = p.prices[0][1];
    const n = R.chance(0.22) ? 2 : 1;
    let from = Math.max(p.created + 30 * DAY, toMs("2024-03-01"));
    for (let k = 0; k < n; k++) {
      const when = from + R.int(20, 220) * DAY;
      if (when > toMs("2025-09-30")) break;
      last = rupiah(last * (R.chance(0.65) ? 1 + R.int(5, 20) / 100 : 1 - R.int(5, 15) / 100));
      p.prices.push([when, last]); from = when;
    }
  }
  put("app.products", ["product_id", "sku", "product_name", "category_id", "brand", "list_price", "is_active", "created_at"],
    products.map(p => [p.id, p.sku, p.name, p.cat, p.brand, p.prices[p.prices.length - 1][1], p.active, fmtDate(p.created)]));
  put("app.product_price_history", ["product_id", "price", "valid_from"],
    products.flatMap(p => p.prices.map(([ms, pr]) => [p.id, pr, fmtDate(ms)])));
  const priceAt = (p, ms) => { let pr = p.prices[0][1]; for (const [w, v] of p.prices) if (w <= ms) pr = v; return pr; };
  const popularity = R.shuffle(products.map((_, i) => i)).map(rank => 1 / Math.pow(rank + 1, 0.8));

  // pesanan, baris pesanan, pembayaran, pengiriman, retur
  const cutoff = toMs(DATA_CUTOFF);
  const sortedCust = custs.slice().sort((a, b) => a.signup - b.signup);
  const loyal = custs.filter(c => c.active > 4);
  const orders = [], items = [], payments = [], shipments = [], returns = [];
  let orderId = 100001, paymentId = 500001, returnId = 900001;
  const start = toMs("2024-01-01"), end = toMs("2025-10-31");
  const totalDays = Math.round((end - start) / DAY);
  for (let d = 0; d <= totalDays; d++) {
    const dayMs = start + d * DAY, dayStr = fmtDate(dayMs);
    const inRamadan = RAMADAN.some(([a, b]) => dayStr >= a && dayStr <= b);
    const dow = new Date(dayMs).getUTCDay();
    let mean = 15.2 * (1 + 0.18 * d / totalDays) * (inRamadan ? 1.35 : 1) * (SPIKES[dayStr] || 1) * (dow === 0 || dow === 6 ? 1.1 : 1) * (dayStr.slice(5, 7) === "12" ? 1.15 : 1);
    const n = Math.max(0, Math.round(mean * (0.75 + 0.5 * R.next())));
    let eligible = 0; while (eligible < sortedCust.length && sortedCust[eligible].signup <= dayMs) eligible++;
    if (!eligible) continue;
    const dayOrders = [];
    for (let k = 0; k < n; k++) {
      let c = null;
      if (R.chance(0.35)) for (let t = 0; t < 5 && !c; t++) { const x = R.pick(loyal); if (x.signup <= dayMs) c = x; }
      if (!c) c = sortedCust[R.int(0, eligible - 1)];
      const hour = R.wpick([0, 6, 9, 12, 15, 18, 20, 22], [2, 5, 12, 14, 12, 18, 25, 12]);
      const ts = dayMs + (hour + R.next() * 2) * HOUR + R.int(0, 59) * MIN;
      dayOrders.push({ c, ts: Math.min(ts, dayMs + DAY - 1000) });
    }
    dayOrders.sort((a, b) => a.ts - b.ts);
    for (const { c, ts } of dayOrders) {
      const month = dayStr >= "2025-01-01" ? Number(dayStr.slice(5, 7)) : 0;
      const cityNow = month ? stateAt(c, Math.max(1, month - 1)).city : c.city;
      const island = islandOf(cityNow);
      const voucher = inRamadan && R.chance(0.15) ? "RAMADAN25" : R.wpick(["HEMAT10", "GRATISONGKIR", null], [9, 7, 84]);
      const fee = voucher === "GRATISONGKIR" ? 0 : R.pick(ISLAND_FEE[island]);
      const o = { id: orderId++, cust: c.id, ts, channel: R.wpick(["web", "android", "ios"], [35, 45, 20]), voucher, fee, handled: R.chance(0.12) ? R.pick(agents) : null };
      // baris pesanan
      const nLines = R.wpick([1, 2, 3, 4, 5], [30, 30, 20, 12, 8]);
      const used = new Set(); let subtotal = 0; const lines = [];
      for (let ln = 1; ln <= nLines; ln++) {
        let p = null;
        for (let t = 0; t < 20 && !p; t++) {
          const cand = R.wpick(products, popularity);
          if (cand.created <= ts && (cand.active || ts < toMs("2025-01-01")) && !used.has(cand.id)) p = cand;
        }
        if (!p) continue;
        used.add(p.id);
        const qty = R.wpick([1, 2, 3, 4, 5], [70, 20, 7, 2, 1]);
        const price = priceAt(p, ts), gross = qty * price;
        let disc = 0;
        if (voucher === "HEMAT10") disc = Math.round(gross * 0.10 / 100) * 100;
        else if (voucher === "RAMADAN25") disc = Math.min(50000, Math.round(gross * 0.25 / 100) * 100);
        else if (R.chance(0.03)) disc = Math.round(gross * 0.05 / 100) * 100;
        lines.push([o.id, lines.length + 1, p.id, qty, price, disc]);
        subtotal += gross - disc;
      }
      if (!lines.length) { orderId--; continue; }
      items.push(...lines);
      const total = subtotal + fee;
      // status dan alur pesanan
      let status, updated;
      const method = R.wpick(["transfer_va", "ewallet", "kartu_kredit", "cod", "paylater"], [30, 35, 12, 13, 10]);
      if (R.chance(0.065)) {
        status = "cancelled"; updated = ts + R.int(10, 600) * MIN;
        if (method !== "cod" && R.chance(0.4)) payments.push([paymentId++, o.id, fmtTs(ts + R.int(1, 30) * MIN), method, total, "refunded"]);
      } else {
        const shipped = ts + R.int(2, 36) * HOUR;
        const [dmin, dmax] = ISLAND_DAYS[island];
        const delivered = shipped + R.int(dmin, dmax) * DAY + R.int(0, 10) * HOUR;
        if (shipped > cutoff) { status = "processing"; updated = ts; }
        else {
          const courier = R.pick(COURIERS);
          if (delivered > cutoff) { status = "shipped"; updated = shipped; shipments.push([o.id, courier, fmtTs(shipped), null]); }
          else {
            shipments.push([o.id, courier, fmtTs(shipped), fmtTs(delivered)]);
            status = "completed"; updated = delivered;
            if (R.chance(0.03)) {
              const rts = delivered + R.int(1, 7) * DAY + R.int(0, 12) * HOUR;
              if (rts <= cutoff) {
                status = "returned"; updated = rts;
                const ret = R.chance(0.2) && lines.length > 1 ? lines.slice(0, 2) : [R.pick(lines)];
                for (const l of ret) returns.push([returnId++, o.id, l[1], fmtTs(rts), R.int(1, l[3]), R.wpick(["rusak", "tidak sesuai pesanan", "berubah pikiran", "pengiriman terlambat"], [35, 30, 25, 10])]);
              }
            }
          }
        }
        // pembayaran
        if (method === "cod") {
          if (status === "completed" || status === "returned") payments.push([paymentId++, o.id, fmtTs(toMs(shipments[shipments.length - 1][3])), "cod", total, "success"]);
        } else {
          const paid = ts + R.int(1, 90) * MIN;
          if (R.chance(0.025)) {
            const part = Math.round(total * R.int(30, 70) / 100 / 100) * 100;
            payments.push([paymentId++, o.id, fmtTs(paid), "ewallet", part, "success"]);
            payments.push([paymentId++, o.id, fmtTs(paid + R.int(1, 15) * MIN), "transfer_va", total - part, "success"]);
          } else payments.push([paymentId++, o.id, fmtTs(paid), method, total, "success"]);
        }
      }
      orders.push([o.id, o.cust, fmtTs(ts), o.channel, status, fee, voucher, o.handled, fmtTs(updated)]);
    }
  }
  put("app.orders", ["order_id", "customer_id", "order_ts", "channel", "status", "shipping_fee", "voucher_code", "handled_by", "updated_at"], orders);
  put("app.order_items", ["order_id", "line_no", "product_id", "qty", "unit_price", "discount"], items);
  put("app.payments", ["payment_id", "order_id", "paid_ts", "method", "amount", "status"], payments);
  put("app.shipments", ["order_id", "courier", "shipped_ts", "delivered_ts"], shipments);
  put("app.returns", ["return_id", "order_id", "line_no", "return_ts", "qty", "reason"], returns);

  // data mentah: upload harga dari pemasok (teks berantakan)
  const upRows = []; let rowNo = 1;
  const skuVariants = (sku) => [sku, " " + sku.toLowerCase(), sku.replace("-", "") + " ", sku.toLowerCase()];
  const priceVariants = (p) => [`Rp ${p.toLocaleString("id-ID")}`, String(p), p.toLocaleString("id-ID"), `Rp${p.toLocaleString("id-ID")},00`, p.toLocaleString("en-US")];
  const suppliers = ["PT Sumber Elektronik", " pt sumber elektronik", "CV Mekar Abadi", "CV MEKAR ABADI ", "PT Rumah Sejahtera"];
  const chosen = R.shuffle(products).slice(0, 50);
  for (const p of chosen) {
    const eff = toMs("2025-09-01") + R.int(0, 40) * DAY;
    const newPrice = rupiah(p.prices[p.prices.length - 1][1] * (1 + R.int(-5, 12) / 100));
    const dateText = R.chance(0.5) ? fmtDate(eff) : fmtDate(eff).split("-").reverse().join("/");
    upRows.push([rowNo++, R.pick(skuVariants(p.sku)), R.chance(0.06) ? R.pick(["", "N/A"]) : R.pick(priceVariants(newPrice)), dateText, R.pick(suppliers)]);
  }
  for (let k = 0; k < 4; k++) upRows.push([rowNo++, "TK-" + String(99000 + k * 13), R.pick(priceVariants(rupiah(50000 + k * 25000))), "2025-09-15", R.pick(suppliers)]);
  for (const r of R.shuffle(upRows.slice(0, 50)).slice(0, 7)) {
    const sku = r[1].trim().toUpperCase().replace(/^TK-?/, "TK-");
    upRows.push([rowNo++, R.pick(skuVariants(sku)), r[2], r[3], R.pick(suppliers)]);
  }
  put("raw.supplier_price_upload", ["row_no", "sku_text", "price_text", "effective_date_text", "supplier"], upRows);

  // data mentah: kunjungan situs (bahan sesi kunjungan)
  const events = []; let eventId = 1;
  const visitors = R.shuffle(custs.filter(c => c.signup <= toMs("2025-09-01"))).slice(0, 450);
  const evStart = toMs("2025-09-01"), evEnd = toMs("2025-10-31");
  const sessionsAll = [];
  for (const c of visitors) {
    const nSess = R.int(1, 12);
    const starts = [];
    for (let s = 0; s < nSess; s++) starts.push(evStart + Math.floor(R.next() * (evEnd - evStart - 3 * HOUR)));
    starts.sort((a, b) => a - b);
    let lastEnd = 0;
    for (let st of starts) {
      if (st < lastEnd + 60 * MIN) st = lastEnd + 60 * MIN + R.int(0, 120) * MIN;
      if (st > evEnd) break;
      const nEv = R.int(2, 14); let t = st;
      const sess = [];
      for (let e = 0; e < nEv; e++) {
        const p = R.wpick(products, popularity);
        let type, page;
        if (e === 0) { type = "view"; page = "/"; }
        else {
          type = R.wpick(["view", "search", "add_to_cart", "checkout", "purchase"], [55, 20, 15, 6, 4]);
          page = type === "search" ? "/cari" : type === "add_to_cart" ? "/keranjang" : type === "checkout" || type === "purchase" ? "/checkout" : "/produk/" + p.sku;
        }
        sess.push([c.id, t, type, page]);
        t += R.int(5, 360) * 1000;
      }
      lastEnd = t;
      sessionsAll.push(...sess);
    }
  }
  sessionsAll.sort((a, b) => a[1] - b[1] || a[0] - b[0]);
  for (const [cid, t, type, page] of sessionsAll) events.push([eventId++, cid, fmtTs(t), type, page]);
  put("raw.web_events", ["event_id", "customer_id", "event_ts", "event_type", "page"], events);

  // data mentah: ekstrak susulan (batch 2) diterima awal November
  const b2 = [];
  const openOrders = orders.filter(o => o[4] === "processing" || o[4] === "shipped");
  for (const o of openOrders.slice(0, 60)) b2.push([o[0], o[1], o[2], o[3], o[4] === "processing" ? "shipped" : "completed", o[5], o[6], fmtTs(toMs("2025-11-01") + R.int(1, 60) * HOUR)]);
  const doneOrders = orders.filter(o => o[4] === "completed" && o[2] >= "2025-10-01");
  for (const o of R.shuffle(doneOrders).slice(0, 15)) b2.push([o[0], o[1], o[2], o[3], "returned", o[5], o[6], fmtTs(toMs("2025-11-01") + R.int(1, 140) * HOUR)]);
  let nextId = orderId;
  for (let k = 0; k < 40; k++) {
    const c = pickCust();
    const ts = toMs("2025-10-25") + R.int(0, 5 * 24 - 1) * HOUR + R.int(0, 59) * MIN;
    b2.push([nextId++, c.id, fmtTs(ts), R.wpick(["web", "android", "ios"], [35, 45, 20]), R.pick(["completed", "shipped"]), R.pick(ISLAND_FEE[islandOf(c.city)]), null, fmtTs(toMs("2025-11-01") + R.int(1, 40) * HOUR)]);
  }
  for (let k = 0; k < 250; k++) {
    const c = pickCust();
    const ts = toMs("2025-11-01") + R.int(0, 7 * 24 - 1) * HOUR + R.int(0, 59) * MIN;
    b2.push([nextId++, c.id, fmtTs(ts), R.wpick(["web", "android", "ios"], [35, 45, 20]), R.pick(["processing", "shipped"]), R.pick(ISLAND_FEE[islandOf(c.city)]), R.wpick(["HEMAT10", null], [10, 90]), fmtTs(ts + R.int(0, 30) * MIN)]);
  }
  put("raw.orders_batch2", ["order_id", "customer_id", "order_ts", "channel", "status", "shipping_fee", "voucher_code", "updated_at"], b2);

  // data mentah: laporan bulanan versi keuangan (uang masuk per bulan pembayaran)
  const fin = new Map();
  for (const p of payments) if (p[5] === "success") { const m = p[2].slice(0, 7) + "-01"; fin.set(m, (fin.get(m) || 0) + p[4]); }
  put("raw.finance_monthly", ["bln", "gross_sales"], [...fin.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)));

  return { tables };
}

/* ------------------------------------------------------------------ kamus data */
const C = (name, type, description) => ({ name, type, description });
export const SCHEMA_DOC = [
  { table: "app.cities", grain: "1 baris = 1 kota", description: "Daftar kota tempat pelanggan tinggal.", columns: [
    C("city_id", "integer", "Nomor unik kota (kunci utama)."), C("city_name", "text", "Nama kota."), C("province", "text", "Nama provinsi."), C("island", "text", "Pulau atau kelompok wilayah, dipakai untuk menentukan ongkos kirim.")] },
  { table: "app.customers", grain: "1 baris = 1 pelanggan, berisi keadaan terbaru (31 Okt 2025)", description: "Data pelanggan di aplikasi. Kalau pelanggan pindah kota, nilai lama ditimpa; riwayatnya hanya ada di raw.customer_snapshot.", columns: [
    C("customer_id", "integer", "Nomor unik pelanggan (kunci utama)."), C("full_name", "text", "Nama lengkap."), C("email", "text", "Alamat email terbaru."),
    C("phone", "text", "Nomor telepon. Kosong (NULL) kalau pelanggan tidak mengisinya."), C("city_id", "integer", "Kota tempat tinggal saat ini, merujuk ke app.cities."),
    C("segment", "text", "Tingkat keanggotaan saat ini: Reguler, Silver, atau Gold."), C("signup_date", "date", "Tanggal pelanggan mendaftar.")] },
  { table: "app.categories", grain: "1 baris = 1 kategori", description: "Kategori produk bertingkat. Kategori induk tidak punya parent_id.", columns: [
    C("category_id", "integer", "Nomor unik kategori (kunci utama)."), C("category_name", "text", "Nama kategori."), C("parent_id", "integer", "Kategori induk, merujuk ke tabel ini sendiri. NULL untuk kategori paling atas.")] },
  { table: "app.products", grain: "1 baris = 1 produk", description: "Daftar produk yang dijual.", columns: [
    C("product_id", "integer", "Nomor unik produk (kunci utama)."), C("sku", "text", "Kode produk yang tertulis di kemasan dan dipakai pemasok, misalnya TK-10007."),
    C("product_name", "text", "Nama produk."), C("category_id", "integer", "Kategori produk, merujuk ke app.categories."), C("brand", "text", "Merek."),
    C("list_price", "numeric(12,2)", "Harga jual terbaru dalam rupiah. Harga pada tanggal tertentu ada di app.product_price_history."),
    C("is_active", "boolean", "true kalau produk masih dijual."), C("created_at", "date", "Tanggal produk mulai dijual.")] },
  { table: "app.product_price_history", grain: "1 baris = 1 harga yang berlaku mulai tanggal tertentu untuk 1 produk", description: "Riwayat harga produk. Harga berlaku sejak valid_from sampai ada baris berikutnya untuk produk yang sama.", columns: [
    C("product_id", "integer", "Produk, merujuk ke app.products."), C("price", "numeric(12,2)", "Harga dalam rupiah."), C("valid_from", "date", "Tanggal mulai berlakunya harga.")] },
  { table: "app.staff", grain: "1 baris = 1 karyawan", description: "Karyawan TokoKita beserta atasannya.", columns: [
    C("staff_id", "integer", "Nomor unik karyawan (kunci utama)."), C("full_name", "text", "Nama lengkap."), C("role", "text", "Jabatan."), C("manager_id", "integer", "Atasan langsung, merujuk ke tabel ini sendiri. NULL untuk direktur.")] },
  { table: "app.orders", grain: "1 baris = 1 pesanan", description: "Pesanan dari pelanggan, Januari 2024 sampai 31 Oktober 2025.", columns: [
    C("order_id", "integer", "Nomor unik pesanan (kunci utama)."), C("customer_id", "integer", "Pelanggan yang memesan, merujuk ke app.customers."),
    C("order_ts", "timestamp", "Tanggal dan jam pesanan dibuat."), C("channel", "text", "Tempat pesanan dibuat: web, android, atau ios."),
    C("status", "text", "Status terakhir: processing (belum dikirim), shipped (sedang dikirim), completed (diterima), cancelled (dibatalkan), returned (ada barang yang dikembalikan)."),
    C("shipping_fee", "numeric(12,2)", "Ongkos kirim yang dibayar pelanggan, dalam rupiah."), C("voucher_code", "text", "Kode voucher yang dipakai. NULL kalau tidak memakai voucher."),
    C("handled_by", "integer", "Agen layanan pelanggan yang menangani pesanan, merujuk ke app.staff. NULL kalau pelanggan tidak menghubungi layanan pelanggan."),
    C("updated_at", "timestamp", "Waktu terakhir status pesanan berubah.")] },
  { table: "app.order_items", grain: "1 baris = 1 produk di dalam 1 pesanan", description: "Isi pesanan. Kunci utamanya gabungan order_id dan line_no.", columns: [
    C("order_id", "integer", "Pesanan, merujuk ke app.orders."), C("line_no", "integer", "Nomor urut baris di dalam pesanan, mulai dari 1."), C("product_id", "integer", "Produk, merujuk ke app.products."),
    C("qty", "integer", "Jumlah barang."), C("unit_price", "numeric(12,2)", "Harga satuan pada saat pesanan dibuat, dalam rupiah."), C("discount", "numeric(12,2)", "Potongan harga untuk baris ini, dalam rupiah (bukan persen).")] },
  { table: "app.payments", grain: "1 baris = 1 transaksi pembayaran", description: "Pembayaran pesanan. Satu pesanan bisa punya dua pembayaran (dibayar sebagian dengan e-wallet, sisanya transfer).", columns: [
    C("payment_id", "integer", "Nomor unik pembayaran (kunci utama)."), C("order_id", "integer", "Pesanan yang dibayar, merujuk ke app.orders."), C("paid_ts", "timestamp", "Tanggal dan jam uang diterima."),
    C("method", "text", "Cara bayar: transfer_va, ewallet, kartu_kredit, cod (bayar di tempat), paylater."), C("amount", "numeric(12,2)", "Jumlah uang, dalam rupiah."),
    C("status", "text", "success (uang diterima) atau refunded (uang dikembalikan karena pesanan dibatalkan).")] },
  { table: "app.shipments", grain: "1 baris = 1 pengiriman = 1 pesanan", description: "Pengiriman pesanan. Pesanan yang dibatalkan atau belum dikirim tidak punya baris di sini.", columns: [
    C("order_id", "integer", "Pesanan yang dikirim (kunci utama), merujuk ke app.orders."), C("courier", "text", "Jasa pengiriman."),
    C("shipped_ts", "timestamp", "Tanggal dan jam barang diserahkan ke kurir."), C("delivered_ts", "timestamp", "Tanggal dan jam barang diterima. NULL kalau masih di perjalanan.")] },
  { table: "app.returns", grain: "1 baris = 1 pengembalian untuk 1 baris pesanan", description: "Barang yang dikembalikan pelanggan.", columns: [
    C("return_id", "integer", "Nomor unik pengembalian (kunci utama)."), C("order_id", "integer", "Pesanan, merujuk ke app.order_items bersama line_no."), C("line_no", "integer", "Baris pesanan yang barangnya dikembalikan."),
    C("return_ts", "timestamp", "Tanggal dan jam barang dikembalikan."), C("qty", "integer", "Jumlah barang yang dikembalikan."), C("reason", "text", "Alasan pengembalian.")] },
  { table: "raw.customer_snapshot", grain: "1 baris = 1 pelanggan pada 1 tanggal potret (akhir bulan, Jan–Okt 2025)", description: "Potret data pelanggan yang diambil setiap akhir bulan. Dipakai untuk membangun riwayat perubahan pelanggan.", columns: [
    C("snapshot_date", "date", "Tanggal potret diambil (hari terakhir bulan)."), C("customer_id", "integer", "Nomor pelanggan."), C("full_name", "text", "Nama pada tanggal potret."),
    C("email", "text", "Email pada tanggal potret."), C("city_id", "integer", "Kota pada tanggal potret."), C("segment", "text", "Segmen pada tanggal potret.")] },
  { table: "raw.supplier_price_upload", grain: "1 baris = 1 baris di berkas upload pemasok", description: "Berkas harga baru dari pemasok, apa adanya. Semua kolom berupa teks kecuali nomor baris (row_no), formatnya tidak seragam, dan ada baris dobel.", columns: [
    C("row_no", "integer", "Nomor baris di berkas."), C("sku_text", "text", "Kode produk seperti yang diketik pemasok."), C("price_text", "text", "Harga seperti yang diketik pemasok, misalnya 'Rp 125.000' atau '125000'."),
    C("effective_date_text", "text", "Tanggal mulai berlaku, dalam format DD/MM/YYYY atau YYYY-MM-DD."), C("supplier", "text", "Nama pemasok seperti yang diketik.")] },
  { table: "raw.web_events", grain: "1 baris = 1 aktivitas pelanggan di situs atau aplikasi", description: "Catatan aktivitas pelanggan (Sep–Okt 2025): melihat halaman, mencari, memasukkan ke keranjang, checkout, dan membeli.", columns: [
    C("event_id", "bigint", "Nomor unik aktivitas."), C("customer_id", "integer", "Pelanggan yang beraktivitas."), C("event_ts", "timestamp", "Tanggal dan jam aktivitas."),
    C("event_type", "text", "Jenis aktivitas: view, search, add_to_cart, checkout, purchase."), C("page", "text", "Halaman yang dibuka.")] },
  { table: "raw.orders_batch2", grain: "1 baris = 1 pesanan baru atau pesanan yang berubah status", description: "Ekstrak susulan yang diterima awal November 2025: pesanan baru, pesanan lama yang statusnya berubah, dan pesanan akhir Oktober yang baru tercatat.", columns: [
    C("order_id", "integer", "Nomor pesanan."), C("customer_id", "integer", "Pelanggan."), C("order_ts", "timestamp", "Tanggal dan jam pesanan dibuat."), C("channel", "text", "web, android, atau ios."),
    C("status", "text", "Status terbaru."), C("shipping_fee", "numeric(12,2)", "Ongkos kirim, dalam rupiah."), C("voucher_code", "text", "Kode voucher, NULL kalau tidak ada."),
    C("updated_at", "timestamp", "Waktu baris ini terakhir berubah di sistem sumber.")] },
  { table: "raw.finance_monthly", grain: "1 baris = 1 bulan", description: "Laporan bulanan tim keuangan: total uang yang benar-benar diterima (pembayaran berstatus success) per bulan tanggal pembayaran, termasuk ongkos kirim.", columns: [
    C("bln", "date", "Tanggal 1 di bulan laporan."), C("gross_sales", "numeric(14,2)", "Total uang diterima pada bulan itu, dalam rupiah.")] },
];

/* ------------------------------------------------------------------ struktur tabel (PostgreSQL) */
export const DDL = `
create schema app;
create schema raw;
create table app.cities (city_id int primary key, city_name text not null, province text not null, island text not null);
create table app.categories (category_id int primary key, category_name text not null, parent_id int references app.categories);
create table app.staff (staff_id int primary key, full_name text not null, role text not null, manager_id int references app.staff);
create table app.customers (customer_id int primary key, full_name text not null, email text not null, phone text, city_id int not null references app.cities, segment text not null, signup_date date not null);
create table app.products (product_id int primary key, sku text not null unique, product_name text not null, category_id int not null references app.categories, brand text not null, list_price numeric(12,2) not null, is_active boolean not null, created_at date not null);
create table app.product_price_history (product_id int not null references app.products, price numeric(12,2) not null, valid_from date not null, primary key (product_id, valid_from));
create table app.orders (order_id int primary key, customer_id int not null references app.customers, order_ts timestamp not null, channel text not null, status text not null, shipping_fee numeric(12,2) not null, voucher_code text, handled_by int references app.staff, updated_at timestamp not null);
create table app.order_items (order_id int not null references app.orders, line_no int not null, product_id int not null references app.products, qty int not null, unit_price numeric(12,2) not null, discount numeric(12,2) not null, primary key (order_id, line_no));
create table app.payments (payment_id int primary key, order_id int not null references app.orders, paid_ts timestamp not null, method text not null, amount numeric(12,2) not null, status text not null);
create table app.shipments (order_id int primary key references app.orders, courier text not null, shipped_ts timestamp not null, delivered_ts timestamp);
create table app.returns (return_id int primary key, order_id int not null, line_no int not null, return_ts timestamp not null, qty int not null, reason text not null, foreign key (order_id, line_no) references app.order_items);
create table raw.customer_snapshot (snapshot_date date, customer_id int, full_name text, email text, city_id int, segment text);
create table raw.supplier_price_upload (row_no int, sku_text text, price_text text, effective_date_text text, supplier text);
create table raw.web_events (event_id bigint, customer_id int, event_ts timestamp, event_type text, page text);
create table raw.orders_batch2 (order_id int, customer_id int, order_ts timestamp, channel text, status text, shipping_fee numeric(12,2), voucher_code text, updated_at timestamp);
create table raw.finance_monthly (bln date, gross_sales numeric(14,2));
`;
// urutan muat mengikuti foreign key
export const LOAD_ORDER = ["app.cities", "app.categories", "app.staff", "app.customers", "app.products", "app.product_price_history", "app.orders", "app.order_items", "app.payments", "app.shipments", "app.returns", "raw.customer_snapshot", "raw.supplier_price_upload", "raw.web_events", "raw.orders_batch2", "raw.finance_monthly"];

/* ------------------------------------------------------------------ memuat ke PGlite */
const copyValue = (v) => {
  if (v === null || v === undefined) return "\\N";
  if (typeof v === "boolean") return v ? "t" : "f";
  return String(v).replace(/\\/g, "\\\\").replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r");
};
const sqlValue = (v) => {
  if (v === null || v === undefined) return "null";
  if (typeof v === "number") return String(v);
  if (typeof v === "boolean") return v ? "true" : "false";
  return "'" + String(v).replace(/'/g, "''") + "'";
};

/** Membuat skema + tabel lalu mengisi data. method "copy" memakai COPY dari blob, "insert" memakai INSERT per 1.000 baris. */
export async function loadInto(db, data, { method = "copy" } = {}) {
  const t0 = Date.now();
  await db.exec(DDL);
  for (const name of LOAD_ORDER) {
    const t = data.tables[name];
    if (!t || !t.rows.length) continue;
    const cols = t.columns.join(", ");
    if (method === "copy") {
      const text = t.rows.map(r => r.map(copyValue).join("\t")).join("\n") + "\n";
      await db.query(`copy ${name} (${cols}) from '/dev/blob'`, [], { blob: new Blob([text]) });
    } else {
      for (let i = 0; i < t.rows.length; i += 1000) {
        const chunk = t.rows.slice(i, i + 1000).map(r => "(" + r.map(sqlValue).join(",") + ")").join(",\n");
        await db.exec(`insert into ${name} (${cols}) values ${chunk};`);
      }
    }
  }
  await db.exec("analyze;");
  return { ms: Date.now() - t0 };
}

/** Teks SQL lengkap (struktur + data) untuk dipakai di luar dojo, misalnya PostgreSQL di laptop. */
export function toPostgresSql(data) {
  const parts = [DDL];
  for (const name of LOAD_ORDER) {
    const t = data.tables[name];
    for (let i = 0; i < t.rows.length; i += 1000) {
      parts.push(`insert into ${name} (${t.columns.join(", ")}) values\n` + t.rows.slice(i, i + 1000).map(r => "(" + r.map(sqlValue).join(",") + ")").join(",\n") + ";");
    }
  }
  return parts.join("\n");
}
