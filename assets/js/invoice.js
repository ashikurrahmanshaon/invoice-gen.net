/* invoice-gen.net — invoice data model, maths and money formatting */
(function () {
  "use strict";
  const IG = (window.IG = window.IG || {});

  IG.CURRENCIES = [
    ["USD", "US Dollar"], ["EUR", "Euro"], ["GBP", "British Pound"], ["CAD", "Canadian Dollar"],
    ["AUD", "Australian Dollar"], ["CHF", "Swiss Franc"], ["JPY", "Japanese Yen"], ["SGD", "Singapore Dollar"],
    ["AED", "UAE Dirham"], ["SAR", "Saudi Riyal"], ["INR", "Indian Rupee"], ["BDT", "Bangladeshi Taka"],
    ["NZD", "New Zealand Dollar"], ["CNY", "Chinese Yuan"], ["NGN", "Nigerian Naira"], ["KES", "Kenyan Shilling"],
    ["ZAR", "South African Rand"], ["PHP", "Philippine Peso"], ["IDR", "Indonesian Rupiah"], ["NPR", "Nepalese Rupee"],
    ["MYR", "Malaysian Ringgit"], ["PKR", "Pakistani Rupee"], ["SEK", "Swedish Krona"], ["BRL", "Brazilian Real"],
    ["MXN", "Mexican Peso"], ["TRY", "Turkish Lira"], ["QAR", "Qatari Riyal"], ["KWD", "Kuwaiti Dinar"]
  ];

  // Labels that change with the document type typed at the top (Invoice, Quote, Receipt...)
  IG.DOC_TITLES = ["Invoice", "Quotation", "Quote", "Receipt", "Proforma Invoice", "Estimate", "Tax Invoice", "Bill"];
  IG.docLabels = function (title) {
    const t = String(title || "").toLowerCase();
    if (t.indexOf("quot") >= 0) return { no: "Quote no.", due: "Valid until", bal: "Total due" };
    if (t.indexOf("estimate") >= 0) return { no: "Estimate no.", due: "Valid until", bal: "Estimated total" };
    if (t.indexOf("receipt") >= 0) return { no: "Receipt no.", due: "Payment date", bal: "Balance due" };
    return { no: "Invoice no.", due: "Due date", bal: "Balance due" };
  };

  IG.TEMPLATES = ["classic", "modern", "minimal"];

  IG.ACCENTS = [["#047857", "Emerald"], ["#0f172a", "Navy"], ["#1d4ed8", "Blue"], ["#7c3aed", "Purple"], ["#be123c", "Red"], ["#c2410c", "Orange"]];

  const pad = (n) => String(n).padStart(2, "0");
  IG.isoDate = function (d) {
    return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
  };
  IG.addDays = function (iso, days) {
    const d = iso ? new Date(iso + "T00:00:00") : new Date();
    d.setDate(d.getDate() + days);
    return IG.isoDate(d);
  };
  IG.prettyDate = function (iso) { return IG.formatDate(iso); };

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
    const reg = IG.REGIONS[p.region] ? p.region : IG.guessRegion();
    return {
      id: null,
      title: "Invoice",
      region: reg,
      unit: "qty",
      fields: [],
      number: IG.nextNumber(),
      issueDate: today,
      dueDate: IG.addDays(today, p.dueDays != null ? p.dueDays : 14),
      poNumber: "",
      currency: p.currency || IG.REGIONS[reg].cur || "USD",
      template: (p.tplPicked && p.template) || "classic",
      accent: p.accent || "#047857",
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
      mode: "standard",
      service: p.service || "",
      hourRate: p.hourRate || "",
      shipTo: "",
      shifts: [IG.blankShift(today)],
      discount: 0,
      discountType: "%",
      taxLabel: p.taxLabel || IG.REGIONS[reg].tax,
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

  /* ---------- timesheet (shifts with start, end and break) ---------- */
  IG.WORK_TYPES = ["Kitchen", "House", "Kitchen & House", "House (Deep Cleaning)", "Bar", "Service", "Front of house", "Cleaning", "Dishwashing", "Delivery", "Event", "Training"];
  IG.BREAKS = [0, 15, 30, 45, 60, 90];
  IG.blankShift = function (date) {
    return { id: IG.uid(), date: date || IG.isoDate(new Date()), type: "", start: "", end: "", brk: 0, hours: "", manual: false };
  };
  const mins = (t) => { const m = /^(\d{1,2}):(\d{2})/.exec(t || ""); return m ? (+m[1]) * 60 + (+m[2]) : null; };
  /* hours between start and end, minus the break; an end at or before the start runs past midnight */
  IG.autoHours = function (s) {
    const a = mins(s.start), b = mins(s.end);
    if (a == null || b == null) return null;
    let d = b - a;
    if (d <= 0) d += 1440;
    d -= +s.brk || 0;
    return Math.max(0, Math.round((d / 60 + Number.EPSILON) * 100) / 100);
  };
  IG.shiftHours = function (s) {
    if (!s.manual) { const h = IG.autoHours(s); if (h != null) return h; }
    const n = parseFloat(String(s.hours == null ? "" : s.hours).replace(",", "."));
    return isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : 0;
  };
  IG.totalHours = function (inv) {
    return Math.round((inv.shifts || []).reduce((a, s) => a + IG.shiftHours(s), 0) * 100) / 100;
  };
  IG.isTimesheet = (inv) => inv && inv.mode === "timesheet";
  IG.effectiveItems = function (inv) {
    if (!IG.isTimesheet(inv)) return inv.items || [];
    return [{ id: "ts", desc: (inv.service || "").trim() || "Hours worked", qty: IG.totalHours(inv), rate: inv.hourRate }];
  };
  IG.fmtHours = function (h) {
    const loc = (IG.REGIONS[IG.region] || IG.REGIONS.us).locale;
    try { return new Intl.NumberFormat(loc, { maximumFractionDigits: 2 }).format(h || 0); } catch (e) { return String(h || 0); }
  };
  IG.fmtTime = function (t) {
    const m = mins(t);
    if (m == null) return "";
    const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, "0");
    if (IG.region === "us") return ((h % 12) || 12) + ":" + mm + (h < 12 ? " AM" : " PM");
    return String(h).padStart(2, "0") + ":" + mm;
  };
  IG.fmtBreak = (b) => (+b ? (+b) + " min" : "0 min");

  IG.calc = function (inv) {
    const lines = IG.effectiveItems(inv).map((it) => round2(num(it.qty) * num(it.rate)));
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

  /* Regional styles: number format, date format, paper size and the usual tax name */
  IG.REGIONS = {
    us: { name: "United States", locale: "en-US", paper: "letter", tax: "Sales tax", date: "mdy", cur: "USD" },
    uk: { name: "United Kingdom", locale: "en-GB", paper: "a4", tax: "VAT", date: "dmy-text", cur: "GBP" },
    eu: { name: "Europe", locale: "de-DE", paper: "a4", tax: "VAT", date: "dmy-dot", cur: "EUR" },
    ca: { name: "Canada / Australia", locale: "en-CA", paper: "letter", tax: "GST", date: "dmy-text", cur: "CAD" },
    asia: { name: "East Asia", locale: "en-SG", paper: "a4", tax: "Tax", date: "iso", cur: "USD" },
    sa: { name: "South Asia", locale: "en-IN", paper: "a4", tax: "GST", date: "dmy-slash", cur: "INR" },
    me: { name: "Middle East", locale: "en-AE", paper: "a4", tax: "VAT", date: "dmy-slash", cur: "AED" }
  };
  IG.TAX_NAMES = ["Tax", "Sales tax", "VAT", "GST", "Sales Tax"];
  IG.guessRegion = function () {
    const l = (navigator.language || "en-US").toLowerCase();
    if (l === "en-gb" || l === "en-ie") return "uk";
    if (/^en-(ca|au|nz)/.test(l) || /^fr-ca/.test(l)) return "ca";
    if (/^(de|fr|es|it|nl|pt|pl|sv|da|fi|nb|no|cs|sk|hu|ro|el|bg|hr|sl|et|lv|lt)/.test(l)) return "eu";
    if (/^(ja|zh|ko|th|vi|id|ms|fil)/.test(l) || /^en-(sg|my|ph|hk)/.test(l)) return "asia";
    if (/^(hi|bn|ur|ta|te|ne|si)/.test(l) || /^en-(in|pk|bd|lk|np)/.test(l)) return "sa";
    if (/^(ar|he|fa)/.test(l) || /^en-(ae|sa|qa|kw|bh|om)/.test(l)) return "me";
    return "us";
  };
  IG.region = "us";
  IG.setRegion = function (r) { IG.region = IG.REGIONS[r] ? r : "us"; };
  const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  IG.formatDate = function (iso, region) {
    if (!iso) return "";
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d)) return iso;
    const R = IG.REGIONS[region || IG.region] || IG.REGIONS.us;
    const dd = String(d.getDate()).padStart(2, "0"), mm = String(d.getMonth() + 1).padStart(2, "0"), y = d.getFullYear();
    switch (R.date) {
      case "mdy": return MON[d.getMonth()] + " " + d.getDate() + ", " + y;
      case "dmy-dot": return dd + "." + mm + "." + y;
      case "dmy-slash": return dd + "/" + mm + "/" + y;
      case "iso": return y + "-" + mm + "-" + dd;
      default: return d.getDate() + " " + MON[d.getMonth()] + " " + y;
    }
  };
  /* What the quantity column counts */
  IG.UNITS = {
    qty: { name: "Quantity", q: "Qty", r: "Rate" },
    hours: { name: "Hours", q: "Hours", r: "Rate / hr" },
    days: { name: "Days", q: "Days", r: "Rate / day" }
  };

  const fmtCache = {};
  IG.money = function (amount, currency) {
    const c = currency || "USD";
    const loc = (IG.REGIONS[IG.region] || IG.REGIONS.us).locale;
    const key = loc + c;
    try {
      if (!fmtCache[key]) {
        fmtCache[key] = new Intl.NumberFormat(loc, { style: "currency", currency: c, currencyDisplay: "narrowSymbol" });
      }
      return fmtCache[key].format(amount || 0);
    } catch (e) {
      return c + " " + (amount || 0).toFixed(2);
    }
  };

  /* PDF fonts only cover Latin-1 + €, so swap other symbols for the ISO code */
  IG.moneyPdf = function (amount, currency) {
    const s = IG.money(amount, currency);
    // eslint-disable-next-line no-control-regex
    if (/^[\u0000-ÿ€\s\-−.,0-9]*$/.test(s)) return s.replace("−", "-");
    const digits = new Intl.NumberFormat((IG.REGIONS[IG.region] || IG.REGIONS.us).locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.abs(amount || 0));
    return (amount < 0 ? "-" : "") + currency + " " + digits;
  };

  IG.validEmail = function (s) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || "").trim());
  };
})();
