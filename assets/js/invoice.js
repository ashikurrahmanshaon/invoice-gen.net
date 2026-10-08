/* invoice-gen.net — invoice data model, maths and money formatting */
(function () {
  "use strict";
  const IG = (window.IG = window.IG || {});

  IG.CURRENCIES = [
    ["USD", "US Dollar"], ["BDT", "Bangladeshi Taka"], ["EUR", "Euro"], ["GBP", "British Pound"],
    ["INR", "Indian Rupee"], ["PKR", "Pakistani Rupee"], ["AED", "UAE Dirham"], ["SAR", "Saudi Riyal"],
    ["CAD", "Canadian Dollar"], ["AUD", "Australian Dollar"], ["SGD", "Singapore Dollar"], ["MYR", "Malaysian Ringgit"],
    ["JPY", "Japanese Yen"], ["CNY", "Chinese Yuan"], ["NGN", "Nigerian Naira"], ["KES", "Kenyan Shilling"],
    ["ZAR", "South African Rand"], ["PHP", "Philippine Peso"], ["IDR", "Indonesian Rupiah"], ["NPR", "Nepalese Rupee"],
    ["LKR", "Sri Lankan Rupee"], ["CHF", "Swiss Franc"], ["SEK", "Swedish Krona"], ["BRL", "Brazilian Real"],
    ["MXN", "Mexican Peso"], ["TRY", "Turkish Lira"], ["QAR", "Qatari Riyal"], ["KWD", "Kuwaiti Dinar"]
  ];

  IG.TEMPLATES = ["classic", "modern", "minimal"];

  IG.ACCENTS = [
    ["#16213a", "Ink navy"], ["#0e7c5a", "Stamp green"], ["#2f5bd3", "Carbon blue"],
    ["#8a2c47", "Burgundy"], ["#b4561a", "Rust"], ["#333333", "Graphite"]
  ];

  const pad = (n) => String(n).padStart(2, "0");
  IG.isoDate = function (d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  };
  IG.addDays = function (iso, days) {
    const d = iso ? new Date(iso + "T00:00:00") : new Date();
    d.setDate(d.getDate() + days);
    return IG.isoDate(d);
  };
  IG.prettyDate = function (iso) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  IG.uid = function () {
    return Math.random().toString(36).slice(2, 10);
  };

  IG.nextNumber = function () {
    const n = IG.store.get("ig_counter", 0) + 1;
    return "INV-" + String(n).padStart(4, "0");
  };
  IG.bumpNumber = function (num) {
    const m = /(\d+)\s*$/.exec(num || "");
    if (!m) return;
    const n = parseInt(m[1], 10);
    if (n > IG.store.get("ig_counter", 0)) IG.store.set("ig_counter", n);
  };

  IG.blankInvoice = function (profile) {
    const p = profile || IG.store.get("ig_profile", {}) || {};
    const today = IG.isoDate(new Date());
    return {
      id: null,
      title: "Invoice",
      number: IG.nextNumber(),
      issueDate: today,
      dueDate: IG.addDays(today, p.dueDays != null ? p.dueDays : 14),
      poNumber: "",
      currency: p.currency || "USD",
      template: p.template || "classic",
      accent: p.accent || "#16213a",
      logo: p.logo || null,
      logoW: p.logoW || 0,
      logoH: p.logoH || 0,
      from: {
        name: p.name || "",
        email: p.email || "",
        address: p.address || "",
        phone: p.phone || "",
        taxId: p.taxId || ""
      },
      to: { name: "", email: "", address: "", phone: "" },
      items: [{ id: IG.uid(), desc: "", qty: 1, rate: 0 }],
      discount: 0,
      discountType: "%",
      taxLabel: p.taxLabel || "Tax",
      taxRate: p.taxRate != null ? p.taxRate : 0,
      shipping: 0,
      paid: 0,
      notes: p.notes || "",
      terms: p.terms || "Payment is due by the due date shown above. Thank you for your business.",
      status: "draft"
    };
  };

  const num = (v) => {
    const n = parseFloat(String(v).replace(/,/g, ""));
    return isFinite(n) ? n : 0;
  };
  const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

  IG.calc = function (inv) {
    const lines = inv.items.map((it) => round2(num(it.qty) * num(it.rate)));
    const subtotal = round2(lines.reduce((a, b) => a + b, 0));
    const discount = inv.discountType === "%" ? round2(subtotal * num(inv.discount) / 100) : round2(num(inv.discount));
    const afterDiscount = Math.max(0, subtotal - discount);
    const tax = round2(afterDiscount * num(inv.taxRate) / 100);
    const shipping = round2(num(inv.shipping));
    const total = round2(afterDiscount + tax + shipping);
    const paid = round2(num(inv.paid));
    const balance = round2(total - paid);
    return { lines, subtotal, discount, tax, shipping, total, paid, balance };
  };

  const fmtCache = {};
  IG.money = function (amount, currency) {
    const c = currency || "USD";
    try {
      if (!fmtCache[c]) {
        fmtCache[c] = new Intl.NumberFormat("en-US", { style: "currency", currency: c, currencyDisplay: "narrowSymbol" });
      }
      return fmtCache[c].format(amount || 0);
    } catch (e) {
      return c + " " + (amount || 0).toFixed(2);
    }
  };

  /* PDF fonts only cover Latin-1 + €, so swap other symbols for the ISO code */
  IG.moneyPdf = function (amount, currency) {
    const s = IG.money(amount, currency);
    // eslint-disable-next-line no-control-regex
    if (/^[\u0000-ÿ€\s\-−.,0-9]*$/.test(s)) return s.replace("−", "-");
    const digits = new Intl.NumberFormat("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(amount || 0));
    return (amount < 0 ? "-" : "") + currency + " " + digits;
  };

  IG.validEmail = function (s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim());
  };
})();
