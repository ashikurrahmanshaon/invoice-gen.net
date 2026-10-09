# Log in page and dashboard markup for invoice-gen.net (imported by build_pages.py)
from home_section import I, ICONS

ICONS.update({
    "home": '<path d="M3 11 12 4l9 7"/><path d="M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
    "doc": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    "users": '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.6a3.5 3.5 0 0 1 0 6.8M18 14.2A6.5 6.5 0 0 1 21.5 20"/>',
    "gear": '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    "logout": '<path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 17l5-5-5-5M15 12H3"/>',
    "search": '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    "menu": '<path d="M4 6h16M4 12h16M4 18h16"/>',
    "wallet": '<path d="M3 7a2 2 0 0 1 2-2h12v4"/><path d="M3 7v11a2 2 0 0 0 2 2h15V9H5a2 2 0 0 1-2-2z"/><circle cx="16" cy="14.5" r="1.2"/>',
    "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    "alert": '<path d="M12 9v4M12 17h.01"/><path d="M10.3 3.9 2 18a2 2 0 0 0 1.7 3h16.6a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/>',
    "dots": '<circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/>',
    "google": '',
})

GOOGLE = '<svg viewBox="0 0 24 24" aria-hidden="true" width="18" height="18"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.3-4.8 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 9.9l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg>'

def login_markup():
    return f'''<section class="auth">
  <div class="auth-form">
    <div class="auth-card">
      <h1 id="authTitle">Welcome back</h1>
      <p class="auth-sub" id="authSub">Log in to see your invoices, clients and payments.</p>
      <div class="tabs" role="tablist" aria-label="Log in or sign up">
        <button type="button" role="tab" data-mode="login" aria-selected="true">Log in</button>
        <button type="button" role="tab" data-mode="signup" aria-selected="false">Create account</button>
      </div>
      <p class="form-msg" id="authMsg" hidden></p>
      <form id="authForm" novalidate>
        <button type="button" class="btn btn-white btn-block" id="googleBtn">{GOOGLE} Continue with Google</button>
        <div class="divider">or with email</div>
        <label class="f"><span class="f-label">Email</span><input class="in" id="email" type="email" autocomplete="email" placeholder="you@business.com" required></label>
        <label class="f"><span class="f-label">Password</span><input class="in" id="password" type="password" autocomplete="current-password" minlength="8" placeholder="At least 8 characters" required></label>
        <button class="btn btn-primary btn-block btn-lg" id="authSubmit" type="submit">Log in</button>
        <p class="auth-links"><a href="#" id="magic">Email me a login link</a><a href="#" id="forgot">Forgot password?</a></p>
      </form>
      <form id="resetForm" hidden>
        <label class="f"><span class="f-label">New password</span><input class="in" id="newPassword" type="password" autocomplete="new-password" minlength="8" required></label>
        <button class="btn btn-primary btn-block" type="submit">Save new password</button>
      </form>
      <p class="hint auth-foot">You can also <a href="/#create">make and download invoices</a> without an account. Your saved invoices are private to you.</p>
    </div>
  </div>
  <aside class="auth-side" aria-label="Why create an account">
    <h2>Every invoice saved. Every payment tracked.</h2>
    <ul>
      <li>{I(ICONS["check"])} A dashboard of paid, outstanding and overdue</li>
      <li>{I(ICONS["check"])} Email invoices with the PDF attached</li>
      <li>{I(ICONS["check"])} Saved clients and business details</li>
      <li>{I(ICONS["check"])} Free, with no card needed</li>
    </ul>
    <div class="auth-card-mini" aria-hidden="true">
      <div><span><b>Acme Ltd</b><small>INV-0042</small></span><span>$1,250.00</span><span class="st st-paid">Paid</span></div>
      <div><span><b>Northwind</b><small>INV-0043</small></span><span>$1,900.00</span><span class="st st-sent">Sent</span></div>
      <div><span><b>Green Leaf Cafe</b><small>INV-0041</small></span><span>$360.00</span><span class="st st-over">Overdue</span></div>
    </div>
  </aside>
</section>'''

def nav_btn(tab, icon, label, count=False):
    c = f'<span class="nav-count" data-count="{tab}"></span>' if count else ''
    return f'<button type="button" class="side-link" data-tab="{tab}">{I(ICONS[icon])}<span>{label}</span>{c}</button>'

def dash_markup(LOGO_SVG, WORDMARK):
    return f'''<div class="app" id="app">
  <aside class="side" id="side" aria-label="Dashboard menu">
    <a class="brand" href="/" aria-label="invoice-gen.net home">{LOGO_SVG}{WORDMARK}</a>
    <nav class="side-nav">
      {nav_btn("overview", "home", "Overview")}
      {nav_btn("invoices", "doc", "Invoices", True)}
      {nav_btn("clients", "users", "Clients", True)}
      {nav_btn("settings", "gear", "Settings")}
    </nav>
    <a class="btn btn-primary btn-block side-new" href="/?new=1#create">{I(ICONS["plus"])} New invoice</a>
    <div class="side-user">
      <span class="avatar" id="avatar">?</span>
      <div class="side-user-text"><b id="who">Loading…</b><button type="button" class="link-btn" data-signout id="signOutBtn">Log out</button></div>
    </div>
  </aside>
  <div class="side-scrim" id="scrim" hidden></div>

  <div class="app-main">
    <header class="app-top">
      <button type="button" class="icon-btn side-toggle" id="sideToggle" aria-label="Open menu">{I(ICONS["menu"])}</button>
      <a class="brand m-brand" href="/" aria-label="invoice-gen.net home">{LOGO_SVG}{WORDMARK}</a>
      <div class="app-title"><h1 id="pageTitle">Overview</h1><p id="pageSub"></p></div>
      <a class="btn btn-primary top-new" href="/?new=1#create">{I(ICONS["plus"])} <span>New invoice</span></a>
    </header>

    <section class="panel" data-panel="overview" aria-labelledby="pageTitle">
      <div class="kpis">
        <div class="kpi"><span class="kpi-ico">{I(ICONS["doc"])}</span><small>Total invoiced</small><b id="kInvoiced">–</b><em id="kInvoicedSub"></em></div>
        <div class="kpi"><span class="kpi-ico g">{I(ICONS["wallet"])}</span><small>Paid</small><b id="kPaid">–</b><em id="kPaidSub"></em></div>
        <div class="kpi"><span class="kpi-ico s">{I(ICONS["clock"])}</span><small>Outstanding</small><b id="kOpen">–</b><em id="kOpenSub"></em></div>
        <div class="kpi"><span class="kpi-ico r">{I(ICONS["alert"])}</span><small>Overdue</small><b id="kOverdue">–</b><em id="kOverdueSub"></em></div>
      </div>
      <div class="ov-grid">
        <div class="card chart-card">
          <div class="card-head"><h2>Last 6 months</h2><div class="legend"><span class="lg-inv">Invoiced</span><span class="lg-paid">Paid</span></div></div>
          <div class="chart" id="chart"></div>
        </div>
        <div class="card">
          <div class="card-head"><h2>Needs attention</h2></div>
          <ul class="attn" id="attention"></ul>
        </div>
      </div>
      <div class="card">
        <div class="card-head"><h2>Recent invoices</h2><button type="button" class="link-btn" data-goto="invoices">View all</button></div>
        <div id="recent"></div>
      </div>
    </section>

    <section class="panel" data-panel="invoices" hidden>
      <div class="list-bar">
        <div class="filters" role="tablist" aria-label="Filter by status">
          <button type="button" class="filter" data-filter="all" aria-selected="true">All <span data-fcount="all"></span></button>
          <button type="button" class="filter" data-filter="draft" aria-selected="false">Draft <span data-fcount="draft"></span></button>
          <button type="button" class="filter" data-filter="sent" aria-selected="false">Sent <span data-fcount="sent"></span></button>
          <button type="button" class="filter" data-filter="overdue" aria-selected="false">Overdue <span data-fcount="overdue"></span></button>
          <button type="button" class="filter" data-filter="paid" aria-selected="false">Paid <span data-fcount="paid"></span></button>
        </div>
        <label class="search">{I(ICONS["search"])}<span class="sr-only">Search invoices</span><input class="in" id="search" type="search" placeholder="Search number or client"></label>
      </div>
      <div class="card flush" id="invList"></div>
    </section>

    <section class="panel" data-panel="clients" hidden>
      <div class="list-bar">
        <label class="search">{I(ICONS["search"])}<span class="sr-only">Search clients</span><input class="in" id="clientSearch" type="search" placeholder="Search clients"></label>
        <button type="button" class="btn btn-primary" id="addClientBtn">{I(ICONS["plus"])} Add client</button>
      </div>
      <div class="client-grid" id="clientGrid"></div>
    </section>

    <section class="panel" data-panel="settings" hidden>
      <div class="settings-grid">
        <form class="card" id="profileForm">
          <div class="card-head"><h2>Business details</h2></div>
          <p class="hint">These fill in every new invoice automatically.</p>
          <div class="grid-2">
            <label class="f span-2"><span class="f-label">Business name</span><input class="in" name="name" placeholder="e.g. Northline Studio"></label>
            <label class="f"><span class="f-label">Email</span><input class="in" name="email" type="email"></label>
            <label class="f"><span class="f-label">Phone</span><input class="in" name="phone"></label>
            <label class="f span-2"><span class="f-label">Address</span><textarea class="in" name="address" rows="2"></textarea></label>
            <label class="f"><span class="f-label">Tax or VAT ID</span><input class="in" name="taxId"></label>
            <label class="f"><span class="f-label">Default currency</span><select class="in" name="currency" id="setCurrency"></select></label>
            <label class="f"><span class="f-label">Tax name</span><input class="in" name="taxLabel" placeholder="VAT"></label>
            <label class="f"><span class="f-label">Default tax rate (%)</span><input class="in" name="taxRate" inputmode="decimal"></label>
            <label class="f"><span class="f-label">Payment due after (days)</span><input class="in" name="dueDays" inputmode="numeric" placeholder="14"></label>
            <label class="f span-2"><span class="f-label">Default notes (payment details)</span><textarea class="in" name="notes" rows="3"></textarea></label>
            <label class="f span-2"><span class="f-label">Default terms</span><textarea class="in" name="terms" rows="2"></textarea></label>
          </div>
          <button class="btn btn-primary" type="submit">Save business details</button>
        </form>
        <div class="settings-side">
          <div class="card">
            <div class="card-head"><h2>Account</h2></div>
            <p class="acc-email">Signed in as <b id="accEmail"></b></p>
            <form id="pwForm">
              <label class="f"><span class="f-label">New password</span><input class="in" name="newpw" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters"></label>
              <button class="btn btn-white" type="submit">Change password</button>
            </form>
          </div>
          <div class="card">
            <div class="card-head"><h2>Your data</h2></div>
            <p class="hint">To delete your account and all invoices, email <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a> from your account address.</p>
            <button type="button" class="btn btn-white" data-signout>{I(ICONS["logout"])} Log out</button>
          </div>
        </div>
      </div>
    </section>
  </div>
</div>

<dialog class="modal" id="clientModal" aria-labelledby="clientModalTitle">
  <form id="clientForm" method="dialog">
    <div class="modal-body">
      <h2 id="clientModalTitle">Add a client</h2>
      <label class="f"><span class="f-label">Name</span><input class="in" name="cname" required placeholder="Client or company name"></label>
      <div class="grid-2">
        <label class="f"><span class="f-label">Email</span><input class="in" name="cemail" type="email"></label>
        <label class="f"><span class="f-label">Phone</span><input class="in" name="cphone"></label>
      </div>
      <label class="f"><span class="f-label">Address</span><textarea class="in" name="caddress" rows="2"></textarea></label>
    </div>
    <div class="modal-foot">
      <button class="btn btn-white" type="button" id="clientCancel">Cancel</button>
      <button class="btn btn-primary" type="submit">Save client</button>
    </div>
  </form>
</dialog>'''
