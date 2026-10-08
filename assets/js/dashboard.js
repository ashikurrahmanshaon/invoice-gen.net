/* invoice-gen.net — dashboard: invoices, clients, account */
(function () {
  "use strict";
  const IG = window.IG;
  const $ = (s, r) => (r || document).querySelector(s);
  let user = null;
  let invoices = [];
  let clients = [];
  const today = IG.isoDate(new Date());

  function effectiveStatus(row) {
    if (row.status === "sent" && row.due_date && row.due_date < today && Number(row.balance) > 0) return "overdue";
    return row.status;
  }

  function sums(filterFn, field) {
    const by = {};
    invoices.filter(filterFn).forEach((r) => {
      by[r.currency] = (by[r.currency] || 0) + Number(r[field] || 0);
    });
    const keys = Object.keys(by);
    if (!keys.length) return IG.money(0, "USD");
    return keys.map((c) => IG.money(by[c], c)).join("\n");
  }

  function renderFigures() {
    $("#figInvoiced").textContent = sums(() => true, "total");
    $("#figPaid").textContent = sums((r) => r.status === "paid", "total");
    $("#figOpen").textContent = sums((r) => r.status !== "paid" && r.status !== "draft", "balance");
    ["#figInvoiced", "#figPaid", "#figOpen"].forEach((s) => ($(s).style.whiteSpace = "pre-line"));
  }

  function renderInvoices() {
    const q = ($("#search").value || "").toLowerCase().trim();
    const rows = invoices.filter((r) => !q || (r.number + " " + (r.client_name || "") + " " + (r.client_email || "")).toLowerCase().includes(q));
    const body = $("#invRows");
    $("#invEmpty").hidden = invoices.length > 0;
    $("#invTable").hidden = invoices.length === 0;
    body.innerHTML = rows.map((r) => {
      const st = effectiveStatus(r);
      return "<tr>" +
        '<td><a href="/?id=' + r.id + '"><strong>' + IG.esc(r.number) + "</strong></a></td>" +
        "<td>" + IG.esc(r.client_name || "—") + "</td>" +
        "<td>" + IG.esc(IG.prettyDate(r.issue_date)) + "</td>" +
        "<td>" + IG.esc(IG.prettyDate(r.due_date)) + "</td>" +
        '<td class="num">' + IG.esc(IG.money(Number(r.total), r.currency)) + "</td>" +
        '<td><select class="status" data-status="' + r.id + '" data-v="' + st + '" aria-label="Status of ' + IG.esc(r.number) + '">' +
          ["draft", "sent", "paid", "overdue"].map((s) => '<option value="' + s + '"' + (s === st ? " selected" : "") + ">" + s[0].toUpperCase() + s.slice(1) + "</option>").join("") +
        "</select></td>" +
        '<td><div class="acts">' +
          '<a class="btn btn-ghost btn-sm" href="/?id=' + r.id + '">Open</a>' +
          '<button class="btn btn-ghost btn-sm" data-pdf="' + r.id + '">PDF</button>' +
          '<a class="btn btn-ghost btn-sm" href="/?dup=' + r.id + '">Duplicate</a>' +
          '<button class="btn btn-danger btn-sm" data-del="' + r.id + '" aria-label="Delete ' + IG.esc(r.number) + '">Delete</button>' +
        "</div></td></tr>";
    }).join("");
    if (invoices.length && !rows.length) body.innerHTML = '<tr><td colspan="7" class="empty">No invoices match “' + IG.esc(q) + "”.</td></tr>";
  }

  function renderClients() {
    const body = $("#clientRows");
    $("#clientEmpty").hidden = clients.length > 0;
    $("#clientTable").hidden = clients.length === 0;
    body.innerHTML = clients.map((c) =>
      "<tr><td><strong>" + IG.esc(c.name) + "</strong></td><td>" + IG.esc(c.email || "—") + "</td><td>" + IG.esc(c.phone || "—") + "</td>" +
      '<td><div class="acts"><button class="btn btn-danger btn-sm" data-delclient="' + c.id + '">Delete</button></div></td></tr>'
    ).join("");
  }

  async function load() {
    const [a, b] = await Promise.all([
      IG.cloud.from("invoices").select("id,number,client_name,client_email,issue_date,due_date,currency,total,balance,status,updated_at").order("created_at", { ascending: false }),
      IG.cloud.from("clients").select("*").order("name")
    ]);
    if (a.error) IG.toast("Could not load invoices: " + a.error.message, "err");
    invoices = a.data || [];
    clients = b.data || [];
    renderFigures();
    renderInvoices();
    renderClients();
  }

  function showTab(name) {
    document.querySelectorAll("[data-tab]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
    document.querySelectorAll("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== name));
  }

  document.addEventListener("DOMContentLoaded", async () => {
    if (!IG.cloudReady) {
      $("#dashMain").innerHTML = '<div class="card empty"><h3>Accounts are not switched on yet</h3><p>Add your Supabase keys in assets/js/config.js (see README).</p></div>';
      return;
    }
    user = await (IG.headerReady || IG.getUser());
    if (!user) {
      window.location.replace("/login/?next=/dashboard/");
      return;
    }
    $("#who").textContent = user.email;
    $("#accEmail").textContent = user.email;

    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => showTab(b.dataset.tab)));
    $("#search").addEventListener("input", renderInvoices);

    $("#invRows").addEventListener("change", async (e) => {
      const sel = e.target.closest("[data-status]");
      if (!sel) return;
      const id = sel.dataset.status;
      const status = sel.value;
      sel.dataset.v = status;
      const row = invoices.find((r) => r.id === id);
      const patch = { status };
      if (row) {
        const { data } = await IG.cloud.from("invoices").select("data").eq("id", id).single();
        if (data) patch.data = Object.assign({}, data.data, { status });
      }
      const { error } = await IG.cloud.from("invoices").update(patch).eq("id", id);
      if (error) return IG.toast("Could not change status: " + error.message, "err");
      if (row) row.status = status;
      renderFigures();
      IG.toast("Marked as " + status + ".", "ok");
    });

    $("#invRows").addEventListener("click", async (e) => {
      const del = e.target.closest("[data-del]");
      const pdf = e.target.closest("[data-pdf]");
      if (del) {
        const row = invoices.find((r) => r.id === del.dataset.del);
        if (!window.confirm("Delete invoice " + (row ? row.number : "") + "? This can't be undone.")) return;
        const { error } = await IG.cloud.from("invoices").delete().eq("id", del.dataset.del);
        if (error) return IG.toast("Could not delete: " + error.message, "err");
        invoices = invoices.filter((r) => r.id !== del.dataset.del);
        renderFigures();
        renderInvoices();
        IG.toast("Invoice deleted.");
      }
      if (pdf) {
        const { data, error } = await IG.cloud.from("invoices").select("data,status").eq("id", pdf.dataset.pdf).single();
        if (error) return IG.toast(error.message, "err");
        const inv = Object.assign(IG.blankInvoice(), data.data, { status: data.status });
        try { IG.buildPdf(inv).save(IG.pdfFileName(inv)); } catch (err) { IG.toast(err.message, "err"); }
      }
    });

    $("#clientForm").addEventListener("submit", async (e) => {
      e.preventDefault();
      const f = e.target;
      const name = f.cname.value.trim();
      if (!name) return IG.toast("Add the client's name.", "err");
      if (f.cemail.value && !IG.validEmail(f.cemail.value)) return IG.toast("That email address doesn't look right.", "err");
      const { data, error } = await IG.cloud.from("clients").insert({
        user_id: user.id, name, email: f.cemail.value.trim() || null, phone: f.cphone.value.trim() || null, address: f.caddress.value.trim() || null
      }).select().single();
      if (error) return IG.toast("Could not add client: " + error.message, "err");
      clients.push(data);
      clients.sort((a, b) => a.name.localeCompare(b.name));
      renderClients();
      f.reset();
      IG.toast(name + " added.", "ok");
    });

    $("#clientRows").addEventListener("click", async (e) => {
      const b = e.target.closest("[data-delclient]");
      if (!b) return;
      if (!window.confirm("Delete this client? Invoices you already made stay as they are.")) return;
      const { error } = await IG.cloud.from("clients").delete().eq("id", b.dataset.delclient);
      if (error) return IG.toast(error.message, "err");
      clients = clients.filter((c) => c.id !== b.dataset.delclient);
      renderClients();
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

    showTab("invoices");
    load();
  });
})();
