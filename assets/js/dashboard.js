/* invoice-gen.net — dashboard: overview, invoices, clients, settings.
   With ?demo=1 (or before accounts are connected) it shows clearly-labelled sample data. */
(function () {
  "use strict";
  const IG = window.IG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => IG.esc(s);
  const today = IG.isoDate(new Date());
  const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let user = null, demo = false;
  let invoices = [], clients = [], profile = {};
  let filter = "all";

  const TITLES = {
    overview: ["Overview", ""],
    invoices: ["Invoices", "Every invoice you've saved, sent or been paid for."],
    clients: ["Clients", "The people and companies you bill."],
    settings: ["Settings", "Your business details and account."]
  };

  /* ---------- sample data ---------- */
  function sampleData() {
    const d = (offset) => IG.addDays(today, offset);
    const cl = [
      { id: "c1", name: "Acme Ltd", email: "accounts@acme.com", phone: "+44 20 7946 0000", address: "221 Baker Street, London" },
      { id: "c2", name: "Northwind Traders", email: "billing@northwind.io", phone: "", address: "Seattle, USA" },
      { id: "c3", name: "Bright Pixel Agency", email: "finance@brightpixel.co", phone: "", address: "Dhaka, Bangladesh" },
      { id: "c4", name: "Green Leaf Cafe", email: "hello@greenleaf.cafe", phone: "", address: "Chattogram, Bangladesh" },
      { id: "c5", name: "Orbit Labs", email: "ap@orbitlabs.dev", phone: "", address: "Berlin, Germany" }
    ];
    const rows = [
      ["INV-0031", "Acme Ltd", -168, 1200, "paid"], ["INV-0032", "Northwind Traders", -150, 850, "paid"],
      ["INV-0033", "Bright Pixel Agency", -131, 640, "paid"], ["INV-0034", "Orbit Labs", -112, 1800, "paid"],
      ["INV-0035", "Acme Ltd", -96, 950, "paid"], ["INV-0036", "Green Leaf Cafe", -80, 420, "paid"],
      ["INV-0037", "Northwind Traders", -66, 2100, "paid"], ["INV-0038", "Orbit Labs", -52, 1500, "paid"],
      ["INV-0039", "Bright Pixel Agency", -41, 780, "sent"], ["INV-0040", "Acme Ltd", -30, 1250, "paid"],
      ["INV-0041", "Green Leaf Cafe", -24, 360, "sent"], ["INV-0042", "Acme Ltd", -12, 1250, "sent"],
      ["INV-0043", "Northwind Traders", -6, 1900, "sent"], ["INV-0044", "Orbit Labs", -2, 980, "draft"]
    ];
    const inv = rows.map((r, i) => {
      const c = cl.find((x) => x.name === r[1]);
      return { id: "d" + i, number: r[0], client_name: r[1], client_email: c.email, issue_date: d(r[2]), due_date: d(r[2] + 14),
        currency: "USD", total: r[3], balance: r[4] === "paid" ? 0 : r[3], status: r[4], created_at: d(r[2]) };
    }).reverse();
    const prof = { name: "Arshaon Studio", email: "hello@arshaon.com", phone: "+880 1700 000000", address: "Dhanmondi, Dhaka", currency: "USD", taxLabel: "VAT", taxRate: 5, dueDays: 14 };
    return { inv, cl, prof };
  }

  /* ---------- helpers ---------- */
  function eff(r) {
    if (r.status === "sent" && r.due_date && r.due_date < today && Number(r.balance) > 0) return "overdue";
    return r.status;
  }
  function mainCurrency() {
    const n = {};
    invoices.forEach((r) => (n[r.currency] = (n[r.currency] || 0) + 1));
    const keys = Object.keys(n).sort((a, b) => n[b] - n[a]);
    return keys[0] || profile.currency || "USD";
  }
  function sum(list, field) { return list.reduce((a, r) => a + Number(r[field] || 0), 0); }
  const label = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const pill = (s) => '<span class="pill-s s-' + s + '">' + label(s) + "</span>";
  const initials = (n) => (n || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase();
  function countUp(el, to, cur) {
    if (reduce()) { el.textContent = IG.money(to, cur); return; }
    const t0 = performance.now(), ms = 900;
    const step = (t) => { const p = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - p, 3); el.textContent = IG.money(to * e, cur); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }
  function relDays(iso) {
    const diff = Math.round((new Date(iso + "T00:00:00") - new Date(today + "T00:00:00")) / 864e5);
    if (diff === 0) return "today";
    if (diff === 1) return "tomorrow";
    if (diff === -1) return "yesterday";
    return diff > 0 ? "in " + diff + " days" : Math.abs(diff) + " days ago";
  }
  function demoNote() { IG.toast("Sample data: changes aren't saved. Create a free account to track your own invoices."); }

  /* ---------- overview ---------- */
  function renderOverview() {
    const cur = mainCurrency();
    const mine = invoices.filter((r) => r.currency === cur);
    const others = invoices.length - mine.length;
    const nonDraft = mine.filter((r) => r.status !== "draft");
    const paid = mine.filter((r) => r.status === "paid");
    const open = mine.filter((r) => r.status !== "paid" && r.status !== "draft");
    const late = mine.filter((r) => eff(r) === "overdue");
    countUp($("#kInvoiced"), sum(nonDraft, "total"), cur);
    countUp($("#kPaid"), sum(paid, "total"), cur);
    countUp($("#kOpen"), sum(open, "balance"), cur);
    countUp($("#kOverdue"), sum(late, "balance"), cur);
    $("#kInvoicedSub").textContent = nonDraft.length + (nonDraft.length === 1 ? " invoice" : " invoices") + (others ? ", plus " + others + " in other currencies" : "");
    $("#kPaidSub").textContent = paid.length + " paid";
    $("#kOpenSub").textContent = open.length + " waiting for payment";
    $("#kOverdueSub").textContent = late.length ? late.length + " past the due date" : "Nothing overdue";

    renderChart(cur, mine);

    // needs attention: overdue first, then due within 7 days, then drafts
    const soon = IG.addDays(today, 7);
    const attn = []
      .concat(late.map((r) => ({ r, kind: "overdue", text: "Overdue, was due " + relDays(r.due_date) })))
      .concat(mine.filter((r) => eff(r) === "sent" && r.due_date && r.due_date <= soon).map((r) => ({ r, kind: "soon", text: "Due " + relDays(r.due_date) })))
      .concat(mine.filter((r) => r.status === "draft").map((r) => ({ r, kind: "draft", text: "Draft, not sent yet" })))
      .slice(0, 5);
    $("#attention").innerHTML = attn.length ? attn.map((a) =>
      '<li class="attn-' + a.kind + '"><span class="attn-dot"></span><div><b>' + esc(a.r.client_name || "No client") + ", " + esc(a.r.number) + "</b><small>" + a.text + "</small></div><span class=\"attn-amt\">" + IG.money(Number(a.r.balance || a.r.total), a.r.currency) + "</span></li>"
    ).join("") : '<li class="attn-empty"><b>All clear.</b><small>No overdue or draft invoices.</small></li>';

    const recent = invoices.slice(0, 5);
    $("#recent").innerHTML = recent.length ? '<div class="rows">' + recent.map(rowHtml).join("") + "</div>" : emptyInvoices();

    const h = new Date().getHours();
    const greet = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
    const name = (profile.name || (user && user.email) || "").split("@")[0];
    TITLES.overview[1] = greet + (name ? ", " + name : "") + ". Here's where your money stands.";
    if (currentTab() === "overview") $("#pageSub").textContent = TITLES.overview[1];
  }

  let chartArgs = null;
  window.addEventListener("resize", () => { clearTimeout(window.__igc); window.__igc = setTimeout(() => { if (chartArgs) renderChart.apply(null, chartArgs); }, 200); });
  function renderChart(cur, list) {
    chartArgs = [cur, list];
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"), label: d.toLocaleDateString("en-GB", { month: "short" }), inv: 0, paid: 0 });
    }
    list.forEach((r) => {
      if (r.status === "draft" || !r.issue_date) return;
      const m = months.find((x) => r.issue_date.startsWith(x.key));
      if (!m) return;
      m.inv += Number(r.total || 0);
      if (r.status === "paid") m.paid += Number(r.total || 0);
    });
    const max = Math.max(1, ...months.map((m) => m.inv));
    const raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const stepN = [1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 10].map((m) => m * mag).find((m) => m >= raw);
    const top = stepN * 4;
    const box = $("#chart"); const W = Math.max(300, Math.round(box.clientWidth || 600)), H = W < 460 ? 200 : 240, L = 46, B = 28, T = 12, R = 6;
    const cw = (W - L - R) / months.length, bw = Math.min(22, cw / 3.2);
    const y = (v) => T + (H - T - B) * (1 - v / top);
    const fmtK = (v) => (v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + "k" : String(Math.round(v)));
    let g = "";
    for (let i = 0; i <= 4; i++) {
      const v = (top / 4) * i, yy = y(v);
      g += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + yy + '" y2="' + yy + '" class="grid"/><text x="' + (L - 10) + '" y="' + (yy + 4) + '" class="ax" text-anchor="end">' + fmtK(v) + "</text>";
    }
    months.forEach((m, i) => {
      const cx = L + cw * i + cw / 2;
      const hi = H - B - y(m.inv), hp = H - B - y(m.paid);
      g += '<rect class="b-inv" x="' + (cx - bw - 2) + '" y="' + y(m.inv) + '" width="' + bw + '" height="' + Math.max(0, hi) + '" rx="5" style="--d:' + i * 60 + 'ms"><title>' + m.label + ": invoiced " + IG.money(m.inv, cur) + "</title></rect>";
      g += '<rect class="b-paid" x="' + (cx + 2) + '" y="' + y(m.paid) + '" width="' + bw + '" height="' + Math.max(0, hp) + '" rx="5" style="--d:' + (i * 60 + 30) + 'ms"><title>' + m.label + ": paid " + IG.money(m.paid, cur) + "</title></rect>";
      g += '<text x="' + cx + '" y="' + (H - 8) + '" class="ax" text-anchor="middle">' + m.label + "</text>";
    });
    $("#chart").innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Invoiced and paid per month, last six months, in ' + cur + '">' + g + "</svg>";
  }

  /* ---------- invoices ---------- */
  function rowHtml(r) {
    const s = eff(r);
    return '<div class="row" data-id="' + r.id + '">' +
      '<a class="row-main" href="/?id=' + r.id + '#create"><span class="avatar sm">' + esc(initials(r.client_name)) + '</span><span class="row-text"><b>' + esc(r.client_name || "No client") + "</b><small>" + esc(r.number) + ", due " + esc(IG.prettyDate(r.due_date) || "not set") + "</small></span></a>" +
      '<span class="row-amt">' + IG.money(Number(r.total), r.currency) + "</span>" + pill(s) +
      '<div class="row-menu"><button type="button" class="icon-btn sm" data-menu="' + r.id + '" aria-label="Actions for ' + esc(r.number) + '" aria-haspopup="true"><svg class="ico" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button></div>' +
      "</div>";
  }
  function emptyInvoices() {
    return '<div class="empty"><div class="empty-art" aria-hidden="true"><span></span><span></span><span></span></div><h3>No invoices yet</h3><p>Create your first invoice. It\'s saved here when you download, send or press Save.</p><a class="btn btn-primary" href="/?new=1#create">Create an invoice</a></div>';
  }
  function renderInvoices() {
    const counts = { all: invoices.length, draft: 0, sent: 0, overdue: 0, paid: 0 };
    invoices.forEach((r) => { counts[eff(r)] = (counts[eff(r)] || 0) + 1; });
    $$("[data-fcount]").forEach((el) => (el.textContent = counts[el.dataset.fcount] || 0));
    const q = ($("#search").value || "").toLowerCase().trim();
    const list = invoices.filter((r) => (filter === "all" || eff(r) === filter) &&
      (!q || (r.number + " " + (r.client_name || "") + " " + (r.client_email || "")).toLowerCase().includes(q)));
    const box = $("#invList");
    if (!invoices.length) { box.innerHTML = emptyInvoices(); return; }
    if (!list.length) { box.innerHTML = '<div class="empty"><h3>Nothing matches</h3><p>Try another filter or search.</p></div>'; return; }
    box.innerHTML = '<div class="rows-head"><span>Client</span><span>Amount</span><span>Status</span><span></span></div><div class="rows">' + list.map(rowHtml).join("") + "</div>";
  }

  function closeMenus() { $$(".menu-pop").forEach((m) => m.remove()); }
  function openMenu(btn) {
    closeMenus();
    const r = invoices.find((x) => x.id === btn.dataset.menu);
    if (!r) return;
    const m = document.createElement("div");
    m.className = "menu-pop";
    m.setAttribute("role", "menu");
    m.innerHTML =
      '<a role="menuitem" href="/?id=' + r.id + '#create">Open and edit</a>' +
      '<button role="menuitem" type="button" data-act="pdf">Download PDF</button>' +
      '<a role="menuitem" href="/?dup=' + r.id + '#create">Duplicate</a>' +
      (r.status !== "paid" ? '<button role="menuitem" type="button" data-act="paid">Mark as paid</button>' : '<button role="menuitem" type="button" data-act="sent">Mark as unpaid</button>') +
      '<button role="menuitem" type="button" data-act="del" class="danger">Delete</button>';
    btn.parentElement.appendChild(m);
    m.addEventListener("click", (e) => {
      const a = e.target.closest("[data-act]");
      if (!a) return;
      closeMenus();
      act(a.dataset.act, r);
    });
    const first = m.querySelector("a,button");
    if (first) first.focus();
  }

  async function act(what, r) {
    if (demo) {
      if (what === "paid" || what === "sent") { r.status = what; r.balance = what === "paid" ? 0 : r.total; renderAll(); }
      if (what === "del") { invoices = invoices.filter((x) => x !== r); renderAll(); }
      if (what === "pdf") return IG.toast("Sample data has no PDF. Create an invoice to download one.");
      return demoNote();
    }
    if (what === "del") {
      if (!window.confirm("Delete invoice " + r.number + "? This can't be undone.")) return;
      const { error } = await IG.cloud.from("invoices").delete().eq("id", r.id);
      if (error) return IG.toast("Could not delete: " + error.message, "err");
      invoices = invoices.filter((x) => x.id !== r.id);
      renderAll();
      return IG.toast("Invoice " + r.number + " deleted.");
    }
    if (what === "pdf") {
      const { data, error } = await IG.cloud.from("invoices").select("data,status").eq("id", r.id).single();
      if (error) return IG.toast(error.message, "err");
      const inv = Object.assign(IG.blankInvoice(), data.data, { status: data.status });
      try { IG.buildPdf(inv).save(IG.pdfFileName(inv)); } catch (e) { IG.toast(e.message, "err"); }
      return;
    }
    if (what === "paid" || what === "sent") {
      const { data } = await IG.cloud.from("invoices").select("data").eq("id", r.id).single();
      const patch = { status: what, balance: what === "paid" ? 0 : r.total };
      if (data) patch.data = Object.assign({}, data.data, { status: what, paid: what === "paid" ? r.total : 0 });
      const { error } = await IG.cloud.from("invoices").update(patch).eq("id", r.id);
      if (error) return IG.toast("Could not update: " + error.message, "err");
      Object.assign(r, { status: what, balance: patch.balance });
      renderAll();
      IG.toast(r.number + (what === "paid" ? " marked as paid." : " marked as unpaid."), "ok");
    }
  }

  /* ---------- clients ---------- */
  function renderClients() {
    const q = ($("#clientSearch").value || "").toLowerCase().trim();
    const list = clients.filter((c) => !q || (c.name + " " + (c.email || "")).toLowerCase().includes(q));
    const grid = $("#clientGrid");
    if (!clients.length) {
      grid.innerHTML = '<div class="empty card"><h3>No clients yet</h3><p>Add one here, or they\'re saved automatically when you save an invoice.</p><button type="button" class="btn btn-primary" data-add-client>Add your first client</button></div>';
      return;
    }
    grid.innerHTML = list.map((c) => {
      const theirs = invoices.filter((r) => (r.client_name || "").toLowerCase() === c.name.toLowerCase());
      const cur = theirs[0] ? theirs[0].currency : mainCurrency();
      const billed = sum(theirs.filter((r) => r.status !== "draft"), "total");
      const owed = sum(theirs.filter((r) => r.status !== "paid" && r.status !== "draft"), "balance");
      return '<article class="client-card" data-cid="' + c.id + '">' +
        '<div class="cc-top"><span class="avatar">' + esc(initials(c.name)) + '</span><div><b>' + esc(c.name) + "</b><small>" + esc(c.email || "No email") + "</small></div></div>" +
        '<dl class="cc-stats"><div><dt>Billed</dt><dd>' + IG.money(billed, cur) + "</dd></div><div><dt>Owed</dt><dd class=\"" + (owed ? "owed" : "") + "\">" + IG.money(owed, cur) + "</dd></div><div><dt>Invoices</dt><dd>" + theirs.length + "</dd></div></dl>" +
        '<div class="cc-actions"><button type="button" class="btn btn-soft btn-sm" data-bill="' + c.id + '">New invoice</button><button type="button" class="link-btn danger" data-del-client="' + c.id + '">Delete</button></div>' +
        "</article>";
    }).join("") || '<div class="empty card"><h3>No clients match</h3></div>';
  }

  /* ---------- settings ---------- */
  function fillSettings() {
    const f = $("#profileForm");
    ["name", "email", "phone", "address", "taxId", "taxLabel", "taxRate", "dueDays", "notes", "terms"].forEach((k) => { if (f[k]) f[k].value = profile[k] != null ? profile[k] : ""; });
    $("#setCurrency").value = profile.currency || "USD";
  }

  /* ---------- tabs ---------- */
  function currentTab() { return document.body.dataset.tab || "overview"; }
  function showTab(tab, push) {
    if (!TITLES[tab]) tab = "overview";
    document.body.dataset.tab = tab;
    $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== tab));
    $$(".side-link").forEach((b) => b.setAttribute("aria-current", b.dataset.tab === tab ? "page" : "false"));
    $("#pageTitle").textContent = TITLES[tab][0];
    $("#pageSub").textContent = TITLES[tab][1];
    const panel = $('[data-panel="' + tab + '"]');
    if (!reduce()) { panel.classList.remove("panel-in"); void panel.offsetWidth; panel.classList.add("panel-in"); }
    if (push) history.replaceState(null, "", "#" + tab);
    document.title = TITLES[tab][0] + " | invoice-gen.net";
    closeSide();
    window.scrollTo({ top: 0 });
  }
  function openSide() { $("#side").classList.add("open"); $("#scrim").hidden = false; }
  function closeSide() { $("#side").classList.remove("open"); $("#scrim").hidden = true; }

  function renderAll() {
    $('[data-count="invoices"]').textContent = invoices.length || "";
    $('[data-count="clients"]').textContent = clients.length || "";
    renderOverview(); renderInvoices(); renderClients();
  }

  async function load() {
    if (demo) {
      const s = sampleData();
      invoices = s.inv; clients = s.cl; profile = s.prof;
    } else {
      const [a, b, c] = await Promise.all([
        IG.cloud.from("invoices").select("id,number,client_name,client_email,issue_date,due_date,currency,total,balance,status,created_at").order("created_at", { ascending: false }),
        IG.cloud.from("clients").select("*").order("name"),
        IG.cloud.from("profiles").select("data").eq("id", user.id).maybeSingle()
      ]);
      if (a.error) IG.toast("Could not load invoices: " + a.error.message, "err");
      invoices = a.data || []; clients = b.data || [];
      profile = (c.data && c.data.data) || IG.store.get("ig_profile", {}) || {};
    }
    fillSettings();
    renderAll();
  }

  /* ---------- wiring ---------- */
  function bind() {
    $$(".side-link").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab, true)));
    document.addEventListener("click", (e) => {
      const go = e.target.closest("[data-goto]");
      if (go) showTab(go.dataset.goto, true);
      const menuBtn = e.target.closest("[data-menu]");
      if (menuBtn) { e.preventDefault(); const open = menuBtn.parentElement.querySelector(".menu-pop"); if (open) closeMenus(); else openMenu(menuBtn); }
      else if (!e.target.closest(".menu-pop")) closeMenus();
      const add = e.target.closest("[data-add-client]");
      if (add) $("#addClientBtn").click();
    });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeMenus(); closeSide(); } });
    $("#sideToggle").addEventListener("click", openSide);
    $("#scrim").addEventListener("click", closeSide);
    window.addEventListener("hashchange", () => showTab(location.hash.slice(1), false));

    $$(".filter").forEach((b) => b.addEventListener("click", () => {
      filter = b.dataset.filter;
      $$(".filter").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
      renderInvoices();
    }));
    $("#search").addEventListener("input", renderInvoices);
    $("#clientSearch").addEventListener("input", renderClients);

    const dlg = $("#clientModal");
    $("#addClientBtn").addEventListener("click", () => { $("#clientForm").reset(); dlg.showModal(); dlg.querySelector("input").focus(); });
    $("#clientCancel").addEventListener("click", () => dlg.close());
    $("#clientForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, name = f.cname.value.trim();
      if (!name) return IG.toast("Add the client's name.", "err");
      if (f.cemail.value && !IG.validEmail(f.cemail.value)) return IG.toast("That email address doesn't look right.", "err");
      const row = { name, email: f.cemail.value.trim() || null, phone: f.cphone.value.trim() || null, address: f.caddress.value.trim() || null };
      if (demo) { clients.push(Object.assign({ id: "c" + Date.now() }, row)); }
      else {
        const { data, error } = await IG.cloud.from("clients").insert(Object.assign({ user_id: user.id }, row)).select().single();
        if (error) return IG.toast("Could not add client: " + error.message, "err");
        clients.push(data);
      }
      clients.sort((a, b) => a.name.localeCompare(b.name));
      dlg.close();
      renderAll();
      IG.toast(name + " added.", "ok");
    });
    $("#clientGrid").addEventListener("click", async (e) => {
      const bill = e.target.closest("[data-bill]"), del = e.target.closest("[data-del-client]");
      if (bill) {
        const c = clients.find((x) => x.id === bill.dataset.bill);
        IG.store.set("ig_prefill_client", { name: c.name, email: c.email || "", phone: c.phone || "", address: c.address || "" });
        window.location.href = "/?new=1#create";
      }
      if (del) {
        const c = clients.find((x) => x.id === del.dataset.delClient);
        if (!window.confirm("Delete " + c.name + "? Invoices you already made stay as they are.")) return;
        if (!demo) {
          const { error } = await IG.cloud.from("clients").delete().eq("id", c.id);
          if (error) return IG.toast(error.message, "err");
        }
        clients = clients.filter((x) => x !== c);
        renderAll();
      }
    });

    const cur = $("#setCurrency");
    cur.innerHTML = IG.CURRENCIES.map(([c, n]) => '<option value="' + c + '">' + c + " — " + n + "</option>").join("");
    $("#profileForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const p = Object.assign({}, profile);
      ["name", "email", "phone", "address", "taxId", "taxLabel", "notes", "terms"].forEach((k) => (p[k] = f[k].value.trim()));
      p.currency = f.currency.value;
      p.taxRate = f.taxRate.value ? Number(f.taxRate.value) || 0 : 0;
      p.dueDays = f.dueDays.value ? Math.max(0, parseInt(f.dueDays.value, 10) || 0) : 14;
      if (demo) { profile = p; return demoNote(); }
      const { error } = await IG.cloud.from("profiles").upsert({ id: user.id, data: p, updated_at: new Date().toISOString() });
      if (error) return IG.toast("Could not save: " + error.message, "err");
      profile = p;
      IG.store.set("ig_profile", Object.assign({}, IG.store.get("ig_profile", {}), p));
      IG.toast("Business details saved. New invoices will use them.", "ok");
      renderOverview();
    });
    $("#pwForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (demo) return demoNote();
      const pw = e.target.newpw.value;
      if (pw.length < 8) return IG.toast("Use a password of at least 8 characters.", "err");
      const { error } = await IG.cloud.auth.updateUser({ password: pw });
      if (error) return IG.toast(error.message, "err");
      e.target.reset();
      IG.toast("Password changed.", "ok");
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    bind();
    const params = new URLSearchParams(location.search);
    demo = params.get("demo") === "1" || !IG.cloudReady;
    if (!demo) {
      user = await (IG.headerReady || IG.getUser());
      if (!user) { location.replace("/login/?next=" + encodeURIComponent("/dashboard/")); return; }
    }
    const email = demo ? "hello@arshaon.com" : user.email;
    $("#who").textContent = email;
    $("#accEmail").textContent = email;
    $("#avatar").textContent = email.charAt(0).toUpperCase();
    if (demo) {
      $("#demoBanner").hidden = false;
      $("#demoText").textContent = IG.cloudReady
        ? "You're looking at sample data. Create a free account to track your own invoices."
        : "Sample data. Your own dashboard appears here once accounts are switched on.";
      $("#signOutBtn").hidden = true;
    }
    showTab(location.hash.slice(1) || "overview", false);
    await load();
  });
})();
