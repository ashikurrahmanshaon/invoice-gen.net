/* invoice-gen.net — currency converter with daily exchange rates
   Rates: ExchangeRate-API open access (https://www.exchangerate-api.com), Frankfurter (ECB) as a backup.
   Rates are kept in the browser for an hour so the page is instant on return visits. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const box = $("#fx");
  if (!box) return;

  const POPULAR = ["USD", "EUR", "GBP", "CAD", "AUD", "INR", "BDT", "AED", "SAR", "JPY", "CHF", "CNY", "SGD", "PKR", "NGN", "ZAR"];
  const AMOUNTS = [1, 5, 10, 25, 50, 100, 250, 500, 1000, 5000, 10000];
  const KEY = "ig_fx_usd", HOUR = 36e5;
  let rates = null, updated = null, source = "";

  const names = (() => { try { return new Intl.DisplayNames(["en"], { type: "currency" }); } catch (e) { return null; } })();
  const nameOf = (c) => { try { return (names && names.of(c)) || c; } catch (e) { return c; } };
  const store = {
    get() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } },
    set(v) { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch (e) { /* private mode */ } }
  };

  async function fetchRates() {
    const cached = store.get();
    if (cached && Date.now() - cached.at < HOUR) return cached;
    try {
      const r = await fetch("https://open.er-api.com/v6/latest/USD");
      const j = await r.json();
      if (j.result !== "success") throw new Error("rates");
      const v = { at: Date.now(), rates: j.rates, updated: j.time_last_update_unix * 1000, source: "er" };
      store.set(v); return v;
    } catch (e) {
      const r = await fetch("https://api.frankfurter.app/latest?from=USD");
      const j = await r.json();
      const v = { at: Date.now(), rates: Object.assign({ USD: 1 }, j.rates), updated: new Date(j.date + "T16:00:00Z").getTime(), source: "ecb" };
      store.set(v); return v;
    }
  }

  const from = $("#fxFrom"), to = $("#fxTo"), amt = $("#fxAmount");
  const digits = (c) => { try { return new Intl.NumberFormat("en", { style: "currency", currency: c }).resolvedOptions().maximumFractionDigits; } catch (e) { return 2; } };
  const money = (n, c) => {
    try { return new Intl.NumberFormat("en", { style: "currency", currency: c, currencyDisplay: "code", maximumFractionDigits: Math.max(2, digits(c)) }).format(n).replace(/ /g, " "); }
    catch (e) { return n.toFixed(2) + " " + c; }
  };
  const num = (n, d) => n.toLocaleString("en", { minimumFractionDigits: d, maximumFractionDigits: d });
  const rate = (a, b) => rates[b] / rates[a];
  const precise = (r) => r >= 100 ? num(r, 2) : r >= 1 ? num(r, 4) : num(r, 6);

  function fillSelects() {
    const all = Object.keys(rates).filter((c) => /^[A-Z]{3}$/.test(c));
    const rest = all.filter((c) => POPULAR.indexOf(c) < 0).sort();
    const opt = (c) => '<option value="' + c + '">' + c + " — " + nameOf(c) + "</option>";
    const html = '<optgroup label="Popular">' + POPULAR.filter((c) => rates[c]).map(opt).join("") + '</optgroup><optgroup label="All currencies">' + rest.map(opt).join("") + "</optgroup>";
    [from, to].forEach((s) => { const v = s.dataset.start || s.value; s.innerHTML = html; s.value = v; });
  }

  function render() {
    if (!rates) return;
    const a = from.value, b = to.value;
    const n = Math.max(0, parseFloat(String(amt.value).replace(/,/g, "")) || 0);
    const r = rate(a, b);
    $("#fxResult").innerHTML = '<span class="fx-in">' + money(n, a) + " =</span><b>" + money(n * r, b) + "</b>";
    $("#fxRate").textContent = "1 " + a + " = " + precise(r) + " " + b + "\n1 " + b + " = " + precise(1 / r) + " " + a;
    const d = new Date(updated);
    $("#fxUpdated").textContent = "Rates updated " + d.toLocaleString("en", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZoneName: "short" }) + ". Mid-market rates, for reference.";
    const t1 = $("#fxTable1"), t2 = $("#fxTable2");
    if (t1) {
      $("#fxT1h").textContent = a + " to " + b;
      t1.innerHTML = AMOUNTS.map((x) => "<tr><td>" + money(x, a) + "</td><td>" + money(x * r, b) + "</td></tr>").join("");
    }
    if (t2) {
      $("#fxT2h").textContent = b + " to " + a;
      t2.innerHTML = AMOUNTS.map((x) => "<tr><td>" + money(x, b) + "</td><td>" + money(x / r, a) + "</td></tr>").join("");
    }
    const use = $("#fxUse"); if (use) use.href = "/?new=1&currency=" + b + "#create";
    const useName = $("#fxUseName"); if (useName) useName.textContent = b;
    document.querySelectorAll("[data-fx-name]").forEach((el) => { el.textContent = nameOf(el.dataset.fxName === "from" ? a : b); });
    box.classList.add("fx-ready");
  }

  $("#fxSwap").addEventListener("click", () => { const v = from.value; from.value = to.value; to.value = v; render(); });
  [from, to].forEach((s) => s.addEventListener("change", render));
  amt.addEventListener("input", render);

  fetchRates().then((v) => {
    rates = v.rates; updated = v.updated; source = v.source;
    const src = $("#fxSource");
    if (src) src.innerHTML = source === "ecb"
      ? 'Rates by <a href="https://www.frankfurter.app" target="_blank" rel="noopener nofollow">Frankfurter</a> (European Central Bank).'
      : '<a href="https://www.exchangerate-api.com" target="_blank" rel="noopener nofollow">Rates By Exchange Rate API</a>.';
    fillSelects(); render();
  }).catch(() => {
    $("#fxResult").innerHTML = "<b>Rates could not load</b>";
    $("#fxRate").textContent = "Check your internet connection and reload the page.";
  });
})();
