/* invoice-gen.net — dashboard: overview, invoices, clients, settings.
   Only for logged-in users: anyone else is sent to the login page. */
(function () {
  "use strict";
  const IG = window.IG;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => IG.esc(s);
  const today = IG.isoDate(new Date());
  const reduce = () => window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let user = null;
  let invoices = [], clients = [], profile = {};
  let filter = "all";

  const TITLES = {
    overview: ["Overview", ""],
    invoices: ["Invoices", "Every invoice you've saved, sent or been paid for."],
    clients: ["Clients", "The people and companies you bill."],
    settings: ["Settings", "Your business details and account."]
  };

  /* quotes, estimates, receipts and proformas are listed, but only invoices count as money billed */
  function kindOf(r) {
    const t = r.title || (r.data && r.data.title);
    if (t) return IG.docKind(t);
    const m = /^(QUO|EST|REC|PRO)/i.exec(r.number || "");
    return m ? { QUO: "quote", EST: "estimate", REC: "receipt", PRO: "proforma" }[m[1].toUpperCase()] : "invoice";
  }
  const billable = (r) => kindOf(r) === "invoice";
  const KIND_NAME = { quote: "Quote", estimate: "Estimate", receipt: "Receipt", proforma: "Proforma" };
  function eff(r) {
    if (!billable(r)) return r.status;
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

  /* ---------- overview ---------- */
  function renderOverview() {
    const cur = mainCurrency();
    const bill = invoices.filter(billable);
    const mine = bill.filter((r) => r.currency === cur);
    const others = bill.length - mine.length;
    const nonDraft = mine.filter((r) => r.status !== "draft");
    const paid = mine.filter((r) => r.status === "paid");
    const open = mine.filter((r) => r.status !== "paid" && r.status !== "draft");
    const late = mine.filter((r) => eff(r) === "overdue");
    countUp($("#kInvoiced"), sum(nonDraft, "total"), cur);
    countUp($("#kPaid"), sum(paid, "total"), cur);
    countUp($("#kOpen"), sum(open, "balance"), cur);
    countUp($("#kOverdue"), sum(late, "balance"), cur);
    $("#kInvoicedSub").textContent = nonDraft.length + (nonDraft.length === 1 ? " invoice sent" : " invoices sent") + (others ? ", plus " + others + " in other currencies" : "");
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
    const name = (profile.name || "").trim();
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
      months.push({ key: d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0"), label: d.toLocaleDateString("en-US", { month: "short" }), inv: 0, paid: 0 });
    }
    list.forEach((r) => {
      if (r.status === "draft" || !r.issue_date) return;
      const m = months.find((x) => r.issue_date.startsWith(x.key));
      if (!m) return;
      m.inv += Number(r.total || 0);
      if (r.status === "paid") m.paid += Number(r.total || 0);
    });
    if (!months.some((m) => m.inv > 0)) {
      $("#chart").innerHTML = '<div class="chart-empty"><b>No sent invoices in the last six months</b><span>Invoices you send or mark as paid show up here by month.</span></div>';
      return;
    }
    const max = Math.max(1, ...months.map((m) => m.inv));
    const raw = max / 4, mag = Math.pow(10, Math.floor(Math.log10(raw)));
    const stepN = Math.max(1, [1, 2, 2.5, 5, 10].map((m) => m * mag).find((m) => m >= raw));
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
      g += '<rect class="b-inv" x="' + (cx - bw - 2) + '" y="' + y(m.inv) + '" width="' + bw + '" height="' + Math.max(0, hi) + '" rx="2" style="--d:' + i * 60 + 'ms"><title>' + m.label + ": invoiced " + IG.money(m.inv, cur) + "</title></rect>";
      g += '<rect class="b-paid" x="' + (cx + 2) + '" y="' + y(m.paid) + '" width="' + bw + '" height="' + Math.max(0, hp) + '" rx="2" style="--d:' + (i * 60 + 30) + 'ms"><title>' + m.label + ": paid " + IG.money(m.paid, cur) + "</title></rect>";
      g += '<text x="' + cx + '" y="' + (H - 8) + '" class="ax" text-anchor="middle">' + m.label + "</text>";
    });
    $("#chart").innerHTML = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Invoiced and paid per month, last six months, in ' + cur + '">' + g + "</svg>";
  }

  /* ---------- invoices ---------- */
  function rowHtml(r) {
    const s = eff(r), k = kindOf(r), D = IG.DOCS[k];
    const when = D.receipt ? "paid " + (IG.prettyDate(r.issue_date) || "") : (D.validity ? "valid until " : "due ") + (IG.prettyDate(r.due_date) || "not set");
    return '<div class="row" data-id="' + r.id + '">' +
      '<a class="row-main" href="/app/?id=' + r.id + '"><span class="avatar sm">' + esc(initials(r.client_name)) + '</span><span class="row-text"><b>' + esc(r.client_name || "No client") + (KIND_NAME[k] ? ' <em class="kind-tag">' + KIND_NAME[k] + "</em>" : "") + "</b><small>" + esc(r.number) + ", " + esc(when) + "</small></span></a>" +
      '<span class="row-amt">' + IG.money(Number(r.total), r.currency) + "</span>" + pill(s) +
      '<div class="row-menu"><button type="button" class="icon-btn sm" data-menu="' + r.id + '" aria-label="Actions for ' + esc(r.number) + '" aria-haspopup="true"><svg class="ico" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg></button></div>' +
      "</div>";
  }
  function emptyInvoices() {
    return '<div class="empty"><div class="empty-art" aria-hidden="true"><span></span><span></span><span></span></div><h3>No invoices yet</h3><p>Create your first invoice. It\'s saved here when you download, send or press Save.</p><a class="btn btn-primary" href="/app/?new=1">Create an invoice</a></div>';
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
      '<a role="menuitem" href="/app/?id=' + r.id + '">Open and edit</a>' +
      '<button role="menuitem" type="button" data-act="pdf">Download PDF</button>' +
      '<a role="menuitem" href="/app/?dup=' + r.id + '">Duplicate</a>' +
      '<button role="menuitem" type="button" data-act="hist">Version history</button>' +
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
    if (what === "del") {
      if (!window.confirm("Delete " + r.number + "? You can bring it back from Settings, Recently deleted.")) return;
      const { error } = await IG.cloud.from("invoices").delete().eq("id", r.id);
      if (error) return IG.toast("Could not delete: " + error.message, "err");
      invoices = invoices.filter((x) => x.id !== r.id);
      renderAll();
      loadDeleted();
      return IG.toast(r.number + " deleted. Restore it any time from Settings.");
    }
    if (what === "hist") return openHistory(r);
    if (what === "pdf") {
      try { await IG.loadPdf(); } catch (e) { return IG.toast("The PDF maker could not load. Try again.", "err"); }
      const { data, error } = await IG.cloud.from("invoices").select("data,status").eq("id", r.id).single();
      if (error) return IG.toast(error.message, "err");
      const inv = Object.assign(IG.blankInvoice(), data.data, { status: data.status });
      try {
        const f = IG.savePdf(inv);
        if (!f.direct) { const w = window.open(f.url, "_blank"); if (!w) location.href = f.url; }
      } catch (e) { IG.toast(e.message, "err"); }
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

  /* ---------- history, recently deleted, backups ---------- */
  const NO_HISTORY = "History starts once the database update is installed.";
  const when = (iso) => { const d = new Date(iso); return IG.prettyDate(IG.isoDate(d)) + ", " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); };
  // the columns the dashboard reads, rebuilt from a saved invoice
  function rowFrom(data, status, extra) {
    const inv = Object.assign(IG.blankInvoice(), data, { status: status || data.status || "draft" });
    const t = IG.calc(inv);
    return Object.assign({
      user_id: user.id, number: inv.number, client_name: inv.to.name || null, client_email: inv.to.email || null,
      issue_date: inv.issueDate || null, due_date: inv.dueDate || null, currency: inv.currency,
      total: t.total, balance: inv.status === "paid" ? 0 : t.balance, status: inv.status, data: Object.assign({}, data, { status: inv.status })
    }, extra || {});
  }
  async function openHistory(r) {
    const dlg = $("#histModal"), list = $("#histList");
    $("#histTitle").textContent = "Version history: " + r.number;
    list.innerHTML = '<li class="bk-empty">Loading…</li>';
    dlg.showModal();
    const { data, error } = await IG.cloud.from("invoice_history").select("id,action,status,total,data,changed_at").eq("invoice_id", r.id).order("changed_at", { ascending: false }).limit(50);
    if (error) { list.innerHTML = '<li class="bk-empty">' + NO_HISTORY + "</li>"; return; }
    if (!data.length) { list.innerHTML = '<li class="bk-empty">No earlier versions yet.</li>'; return; }
    const word = { created: "Created", updated: "Edited", deleted: "Deleted" };
    list.innerHTML = data.map((h, i) =>
      '<li><span class="hist-t"><b>' + esc(when(h.changed_at)) + (i === 0 ? ' <em class="kind-tag">Latest</em>' : "") + "</b><small>" + word[h.action] + ", " + esc(h.status || "draft") + ", " + IG.money(h.total || 0, (h.data && h.data.currency) || r.currency) + "</small></span>" +
      (i === 0 ? "" : '<button type="button" class="btn btn-soft btn-sm" data-restore-ver="' + h.id + '">Restore</button>') + "</li>").join("");
    list.onclick = async (e) => {
      const b = e.target.closest("[data-restore-ver]"); if (!b) return;
      const h = data.find((x) => String(x.id) === b.dataset.restoreVer); if (!h) return;
      if (!window.confirm("Restore the version from " + when(h.changed_at) + "? The current version stays in the history.")) return;
      const row = rowFrom(h.data, h.status);
      const { error: e2 } = await IG.cloud.from("invoices").update(row).eq("id", r.id);
      if (e2) return IG.toast("Could not restore: " + e2.message, "err");
      Object.assign(r, row); dlg.close(); renderAll();
      IG.toast(r.number + " restored.", "ok");
    };
  }
  async function loadDeleted() {
    const box = $("#deletedList"); if (!box) return;
    const { data, error } = await IG.cloud.from("invoice_history").select("id,invoice_id,number,status,total,data,changed_at").eq("action", "deleted").order("changed_at", { ascending: false }).limit(30);
    if (error) { box.innerHTML = '<li class="bk-empty">' + NO_HISTORY + "</li>"; return; }
    const live = new Set(invoices.map((x) => x.id)), seen = new Set();
    const gone = (data || []).filter((h) => !live.has(h.invoice_id) && !seen.has(h.invoice_id) && seen.add(h.invoice_id));
    if (!gone.length) { box.innerHTML = '<li class="bk-empty">Nothing deleted.</li>'; return; }
    box.innerHTML = gone.map((h) => '<li><span class="hist-t"><b>' + esc(h.number || "Invoice") + " " + esc((h.data && h.data.to && h.data.to.name) || "") + "</b><small>Deleted " + esc(when(h.changed_at)) + ", " + IG.money(h.total || 0, (h.data && h.data.currency) || "USD") + '</small></span><button type="button" class="btn btn-soft btn-sm" data-undelete="' + h.id + '">Restore</button></li>').join("");
    box.onclick = async (e) => {
      const b = e.target.closest("[data-undelete]"); if (!b) return;
      const h = gone.find((x) => String(x.id) === b.dataset.undelete); if (!h) return;
      b.disabled = true;
      const { data: ins, error: e2 } = await IG.cloud.from("invoices").insert(rowFrom(h.data, h.status, { id: h.invoice_id })).select("id,number,client_name,client_email,issue_date,due_date,currency,total,balance,status,created_at,title:data->>title").single();
      if (e2) { b.disabled = false; return IG.toast("Could not restore: " + e2.message, "err"); }
      invoices.unshift(Object.assign({ title: (h.data && h.data.title) || "Invoice" }, ins)); renderAll(); loadDeleted();
      IG.toast((h.number || "Invoice") + " is back.", "ok");
    };
  }
  function download(name, text, type) {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 2000);
  }
  async function backupJson() {
    const [a, b, c] = await Promise.all([
      IG.cloud.from("invoices").select("*").order("created_at", { ascending: false }),
      IG.cloud.from("clients").select("*").order("name"),
      IG.cloud.from("profiles").select("data").eq("id", user.id).maybeSingle()
    ]);
    if (a.error) return IG.toast("Could not make the backup: " + a.error.message, "err");
    const out = { app: "invoice-gen.net", version: 1, exported_at: new Date().toISOString(), account: user.email, profile: (c.data && c.data.data) || profile, clients: b.data || [], invoices: a.data || [] };
    download("invoice-gen-backup-" + IG.isoDate(new Date()) + ".json", JSON.stringify(out, null, 2), "application/json");
    IG.toast("Backup downloaded: " + out.invoices.length + " documents and " + out.clients.length + " clients.", "ok");
  }
  function backupCsv() {
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const head = ["Number", "Type", "Client", "Client email", "Issue date", "Due date", "Currency", "Total", "Balance", "Status"];
    const lines = invoices.map((r) => [r.number, KIND_NAME[kindOf(r)] || "Invoice", r.client_name, r.client_email, r.issue_date, r.due_date, r.currency, r.total, r.balance, r.status].map(q).join(","));
    download("invoice-gen-invoices-" + IG.isoDate(new Date()) + ".csv", "\ufeff" + [head.map(q).join(",")].concat(lines).join("\r\n"), "text/csv");
    IG.toast(invoices.length + " documents exported. Open the file in Excel or Google Sheets.", "ok");
  }
  async function restoreFile(file) {
    let j;
    try { j = JSON.parse(await file.text()); } catch (e) { return IG.toast("That file is not an invoice-gen.net backup.", "err"); }
    if (!j || j.app !== "invoice-gen.net" || !Array.isArray(j.invoices)) return IG.toast("That file is not an invoice-gen.net backup.", "err");
    if (!window.confirm("Restore " + j.invoices.length + " documents and " + (j.clients || []).length + " clients from " + (j.exported_at || "").slice(0, 10) + "? Documents you have now stay; ones with the same ID are replaced by the backup.")) return;
    const cl = (j.clients || []).map((c) => ({ id: c.id, user_id: user.id, name: c.name, email: c.email || null, phone: c.phone || null, address: c.address || null }));
    const iv = j.invoices.map((r) => rowFrom(r.data || {}, r.status, { id: r.id }));
    if (cl.length) { const { error } = await IG.cloud.from("clients").upsert(cl); if (error) return IG.toast("Could not restore clients: " + error.message, "err"); }
    for (let i = 0; i < iv.length; i += 100) {
      const { error } = await IG.cloud.from("invoices").upsert(iv.slice(i, i + 100));
      if (error) return IG.toast("Could not restore documents: " + error.message, "err");
    }
    IG.toast("Backup restored.", "ok");
    setTimeout(() => location.reload(), 900);
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
      const all = invoices.filter((r) => (r.client_name || "").toLowerCase() === c.name.toLowerCase());
      const theirs = all.filter(billable);
      const cur = theirs[0] ? theirs[0].currency : mainCurrency();
      const billed = sum(theirs.filter((r) => r.status !== "draft"), "total");
      const owed = sum(theirs.filter((r) => r.status !== "paid" && r.status !== "draft"), "balance");
      return '<article class="client-card" data-cid="' + c.id + '">' +
        '<div class="cc-top"><span class="avatar">' + esc(initials(c.name)) + '</span><div><b>' + esc(c.name) + "</b><small>" + esc(c.email || "No email") + "</small></div></div>" +
        '<dl class="cc-stats"><div><dt>Billed</dt><dd>' + IG.money(billed, cur) + "</dd></div><div><dt>Owed</dt><dd class=\"" + (owed ? "owed" : "") + "\">" + IG.money(owed, cur) + "</dd></div><div><dt>Documents</dt><dd>" + all.length + "</dd></div></dl>" +
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
    {
      const [a, b, c] = await Promise.all([
        IG.cloud.from("invoices").select("id,number,client_name,client_email,issue_date,due_date,currency,total,balance,status,created_at,title:data->>title").order("created_at", { ascending: false }),
        IG.cloud.from("clients").select("*").order("name"),
        IG.cloud.from("profiles").select("data").eq("id", user.id).maybeSingle()
      ]);
      if (a.error) IG.toast("Could not load invoices: " + a.error.message, "err");
      invoices = a.data || []; clients = b.data || [];
      profile = (c.data && c.data.data) || IG.store.get("ig_profile", {}) || {};
    }
    IG.setRegion(profile.region || IG.guessRegion());
    fillSettings();
    renderAll();
    loadDeleted();
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
    $("#histClose").addEventListener("click", () => $("#histModal").close());
    $("#bkDownload").addEventListener("click", backupJson);
    $("#bkCsv").addEventListener("click", backupCsv);
    $("#bkRestoreBtn").addEventListener("click", () => $("#bkFile").click());
    $("#bkFile").addEventListener("change", (e) => { const f = e.target.files[0]; e.target.value = ""; if (f) restoreFile(f); });
    $("#addClientBtn").addEventListener("click", () => { $("#clientForm").reset(); dlg.showModal(); dlg.querySelector("input").focus(); });
    $("#clientCancel").addEventListener("click", () => dlg.close());
    $("#clientForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target, name = f.cname.value.trim();
      if (!name) return IG.toast("Add the client's name.", "err");
      if (f.cemail.value && !IG.validEmail(f.cemail.value)) return IG.toast("That email address doesn't look right.", "err");
      const row = { name, email: f.cemail.value.trim() || null, phone: f.cphone.value.trim() || null, address: f.caddress.value.trim() || null };
      {
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
        window.location.href = "/app/?new=1";
      }
      if (del) {
        const c = clients.find((x) => x.id === del.dataset.delClient);
        if (!window.confirm("Delete " + c.name + "? Invoices you already made stay as they are.")) return;
        const { error } = await IG.cloud.from("clients").delete().eq("id", c.id);
        if (error) return IG.toast(error.message, "err");
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
      const { error } = await IG.cloud.from("profiles").upsert({ id: user.id, data: p, updated_at: new Date().toISOString() });
      if (error) return IG.toast("Could not save: " + error.message, "err");
      profile = p;
      IG.store.set("ig_profile", Object.assign({}, IG.store.get("ig_profile", {}), p));
      IG.toast("Business details saved. New invoices will use them.", "ok");
      renderOverview();
    });
    $("#pwForm").addEventListener("submit", async (e) => {
      e.preventDefault();
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
    await IG.loadCloud();
    if (!IG.cloudReady) { location.replace("/login/?next=%2Fdashboard%2F"); return; }
    user = await (IG.headerReady || IG.getUser());
    if (!user) { location.replace("/login/?next=" + encodeURIComponent("/dashboard/" + location.hash)); return; }
    $("#who").textContent = user.email;
    $("#accEmail").textContent = user.email;
    $("#avatar").textContent = user.email.charAt(0).toUpperCase();
    showTab(location.hash.slice(1) || "overview", false);
    await load();
    document.body.classList.add("app-ready");
    // live updates: refresh when an invoice changes elsewhere, and whenever the tab comes back into view
    try {
      if (typeof IG.cloud.channel === "function") {
        let t = null;
        IG.cloud.channel("invoices-" + user.id)
          .on("postgres_changes", { event: "*", schema: "public", table: "invoices", filter: "user_id=eq." + user.id }, () => { clearTimeout(t); t = setTimeout(load, 400); })
          .subscribe();
      }
    } catch (e) { /* realtime not enabled: focus refresh below still works */ }
    document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible") load(); });
  });
})();
