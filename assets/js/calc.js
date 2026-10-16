/* invoice-gen.net — calculators: VAT, GST, sales tax, late fee, due date, hourly rate, margin */
(function () {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const box = document.querySelector("[data-calc]");
  if (!box) return;
  const kind = box.dataset.calc;
  const n = (id) => { const e = $(id); return e ? Math.max(0, parseFloat(String(e.value).replace(/,/g, "")) || 0) : 0; };
  const f2 = (x) => (isFinite(x) ? x : 0).toLocaleString("en", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct = (x) => (isFinite(x) ? Math.round(x * 100) / 100 : 0).toLocaleString("en", { maximumFractionDigits: 2 }) + "%";
  const r2 = (x) => Math.round((x + Number.EPSILON) * 100) / 100;
  const set = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  const show = (id, on) => { const e = $(id); if (e) e.closest(".cf").hidden = !on; };
  const segVal = (id) => { const b = document.querySelector("#" + id + ' [aria-pressed="true"]'); return b ? b.dataset.v : ""; };
  const iso = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  const day = (s) => { const d = new Date((s || iso(new Date())) + "T00:00:00"); return isNaN(d) ? new Date() : d; };
  const pretty = (d) => d.toLocaleDateString("en", { day: "numeric", month: "long", year: "numeric" });

  // the custom-rate box shows only when "Other rate" is picked
  const rateOf = (selId, customId) => {
    const v = $(selId).value; show(customId, v === "custom");
    return v === "custom" ? n(customId) : parseFloat(v) || 0;
  };

  const RUN = {
    vat() {
      const mode = segVal("vMode"), a = n("vAmount"), rate = rateOf("vRate", "vCustom") / 100;
      const net = mode === "add" ? a : a / (1 + rate), vat = r2(net * rate), gross = r2(net + vat);
      set("vNet", f2(r2(net))); set("vVat", f2(vat)); set("vGross", f2(mode === "add" ? gross : a));
      set("vMainL", mode === "add" ? "Total with VAT" : "Price without VAT");
      set("vMain", f2(mode === "add" ? gross : r2(net)));
    },
    gst() {
      const mode = segVal("gMode"), a = n("gAmount"), rate = rateOf("gRate", "gCustom") / 100;
      const net = mode === "add" ? a : a / (1 + rate), tax = r2(net * rate);
      set("gNet", f2(r2(net))); set("gTax", f2(tax)); set("gHalf", f2(r2(tax / 2)) + " + " + f2(r2(tax - r2(tax / 2))));
      set("gGross", f2(mode === "add" ? r2(net + tax) : a));
      set("gMainL", mode === "add" ? "Total with GST" : "GST included");
      set("gMain", f2(mode === "add" ? r2(net + tax) : tax));
    },
    stax() {
      const mode = segVal("sMode"), a = n("sAmount"), rate = n("sRate") / 100;
      const net = mode === "add" ? a : a / (1 + rate), tax = r2(net * rate);
      set("sNet", f2(r2(net))); set("sTax", f2(tax)); set("sGross", f2(mode === "add" ? r2(net + tax) : a));
      set("sMainL", mode === "add" ? "Total with tax" : "Price before tax");
      set("sMain", f2(mode === "add" ? r2(net + tax) : r2(net)));
    },
    late() {
      const type = segVal("lType"), a = n("lAmount"), rate = n("lRate"), fixed = n("lFixed");
      const days = Math.max(0, Math.round((day($("lPaid").value) - day($("lDue").value)) / 864e5));
      const rl = $("lRate").closest(".cf").querySelector(".cf-l"), suf = $("lRate").parentElement.querySelector(".cf-suf");
      rl.textContent = type === "year" ? "Interest per year" : type === "month" ? "Interest per month" : "Late fee";
      if (suf) suf.hidden = type === "flat";
      const charge = days === 0 ? 0 : type === "year" ? r2(a * rate / 100 * days / 365) : type === "month" ? r2(a * rate / 100 * days / 30) : rate;
      const fee = days > 0 ? fixed : 0;
      set("lDays", days + (days === 1 ? " day" : " days")); set("lInt", f2(charge)); set("lFee", f2(fee));
      set("lTotal", f2(r2(a + charge + fee))); set("lMain", f2(r2(charge + fee)));
    },
    due() {
      const start = day($("dDate").value), t = $("dTerms").value, biz = $("dBiz").checked;
      show("dCustom", t === "custom");
      let d = new Date(start);
      if (t === "eom" || t === "eom30") { d = new Date(start.getFullYear(), start.getMonth() + 1, 0); if (t === "eom30") d.setDate(d.getDate() + 30); }
      else {
        let k = t === "custom" ? Math.round(n("dCustom")) : parseInt(t, 10) || 0;
        if (biz) { while (k > 0) { d.setDate(d.getDate() + 1); if (d.getDay() !== 0 && d.getDay() !== 6) k--; } }
        else d.setDate(d.getDate() + k);
      }
      const left = Math.round((d - day()) / 864e5);
      set("dMain", pretty(d)); set("dWeek", d.toLocaleDateString("en", { weekday: "long" }));
      set("dLeft", left === 0 ? "Due today" : left > 0 ? left + " days to go" : -left + " days overdue");
    },
    rate() {
      const weeks = Math.max(1, 52 - n("rWeeks")), hours = n("rHours") * weeks;
      const need = (n("rIncome") + n("rCosts")) * (1 + n("rBuffer") / 100);
      const h = hours ? need / hours : 0;
      set("rMain", f2(r2(h))); set("rDay", f2(r2(h * 8))); set("rBill", Math.round(hours).toLocaleString("en"));
      set("rMonth", f2(r2(h * hours / 12)));
    },
    margin() {
      const mode = segVal("mMode"), cost = n("mCost");
      show("mPrice", mode === "price"); show("mPct", mode !== "price");
      const pl = $("mPct").closest(".cf").querySelector(".cf-l"); pl.textContent = mode === "markup" ? "Target markup" : "Target margin";
      let price = n("mPrice");
      if (mode === "margin") { const m = Math.min(99.99, n("mPct")) / 100; price = cost / (1 - m); }
      if (mode === "markup") price = cost * (1 + n("mPct") / 100);
      const profit = price - cost;
      set("mMain", f2(r2(price))); set("mProfit", f2(r2(profit)));
      set("mMargin", price ? pct(profit / price * 100) : "–"); set("mMarkup", cost ? pct(profit / cost * 100) : "–");
    }
  };

  // sensible starting dates
  const today = iso(new Date());
  if ($("dDate") && !$("dDate").value) $("dDate").value = today;
  if ($("lPaid") && !$("lPaid").value) $("lPaid").value = today;
  if ($("lDue") && !$("lDue").value) { const d = new Date(); d.setDate(d.getDate() - 30); $("lDue").value = iso(d); }

  const run = () => { try { RUN[kind](); } catch (e) { /* keep the page usable */ } };
  box.addEventListener("input", run);
  box.addEventListener("change", run);
  box.addEventListener("click", (e) => {
    const b = e.target.closest(".seg [data-v]"); if (!b) return;
    b.parentElement.querySelectorAll("[data-v]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    run();
  });
  run();
})();
