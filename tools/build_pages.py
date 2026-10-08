#!/usr/bin/env python3
"""Generates the static HTML pages for invoice-gen.net.
Run from the repo root:  python3 tools/build_pages.py .
"""
import json, os, sys

ROOT = sys.argv[1]
SITE = "https://invoice-gen.net"
V = "3"  # asset version, bump to bust browser caches

LOGO_SVG = '''<svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="15" fill="#16213a"/><path d="M19 11h19.5L49 21.5V49a3.5 3.5 0 0 1-3.5 3.5h-26.5A3.5 3.5 0 0 1 15.5 49V14.5A3.5 3.5 0 0 1 19 11z" fill="#fff"/><path d="M38.5 11v7a3.5 3.5 0 0 0 3.5 3.5h7z" fill="#c7d1e0"/><rect x="21.5" y="27" width="17" height="3.4" rx="1.7" fill="#16213a"/><rect x="21.5" y="34" width="21" height="3.4" rx="1.7" fill="#9aa6ba"/><rect x="21.5" y="41" width="11" height="3.4" rx="1.7" fill="#9aa6ba"/><circle cx="45.5" cy="45.5" r="11" fill="#0e7c5a" stroke="#16213a" stroke-width="3.2"/><path d="M40.6 45.7l3.4 3.4 6.6-7" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'''
WORDMARK = '<span class="brand-name">invoice-gen<span class="tld">.net</span></span>'

def head(title, desc, path, extra_ld=None, noindex=False):
    url = SITE + path
    ld = [{
        "@context": "https://schema.org", "@type": "WebSite", "name": "invoice-gen.net", "url": SITE + "/",
    }, {
        "@context": "https://schema.org", "@type": "Organization", "name": "invoice-gen.net", "url": SITE + "/",
        "logo": SITE + "/assets/brand/logo-mark-256.png", "email": "support@invoice-gen.net"
    }]
    if extra_ld:
        ld += extra_ld
    ld_html = "\n".join('<script type="application/ld+json">' + json.dumps(x, ensure_ascii=False) + "</script>" for x in ld)
    robots = '<meta name="robots" content="noindex, nofollow">' if noindex else '<meta name="robots" content="index, follow, max-image-preview:large">'
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
{robots}
<link rel="canonical" href="{url}">
<meta name="theme-color" content="#16213a">
<meta property="og:type" content="website">
<meta property="og:site_name" content="invoice-gen.net">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{SITE}/assets/img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{SITE}/assets/img/og-image.png">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-16.png" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png">
<link rel="mask-icon" href="/assets/brand/safari-pinned-tab.svg" color="#16213a">
<link rel="manifest" href="/site.webmanifest">
<meta name="application-name" content="invoice-gen.net">
<meta name="apple-mobile-web-app-title" content="invoice-gen.net">
<meta name="msapplication-TileColor" content="#16213a">
<meta name="format-detection" content="telephone=no">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,600;12..96,700;12..96,800&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/css/style.css?v={V}">
{ld_html}
</head>
<body>
<a class="sr-only" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/" aria-label="invoice-gen.net home">{LOGO_SVG}{WORDMARK}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav">Menu</button>
    <nav class="nav" id="nav" aria-label="Main">
      <a href="/"{' aria-current="page"' if path == "/" else ""}>Invoice generator</a>
      <a href="/invoice-template/"{' aria-current="page"' if path == "/invoice-template/" else ""}>Templates</a>
      <a href="/how-to-make-an-invoice/"{' aria-current="page"' if path == "/how-to-make-an-invoice/" else ""}>Guide</a>
      <a href="/dashboard/" data-auth="in" hidden>My invoices</a>
      <a href="#" data-auth="in" data-signout hidden>Log out</a>
      <a href="/login/" data-auth="out">Log in</a>
      <a class="btn btn-ink btn-sm" href="/login/?signup=1" data-auth="out">Sign up free</a>
    </nav>
  </div>
</header>
'''

FOOT = '''<footer class="site-footer">
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand" href="/" aria-label="invoice-gen.net home">''' + LOGO_SVG + WORDMARK + '''</a>
      <p>Free invoices for freelancers and small businesses. Make one, download the PDF, or email it to your client.</p>
      <a class="btn btn-primary btn-sm" href="/">Make an invoice</a>
    </div>
    <div>
      <h2>Make invoices</h2>
      <ul>
        <li><a href="/">Invoice generator</a></li>
        <li><a href="/invoice-template/">Invoice templates</a></li>
        <li><a href="/freelance-invoice/">Freelance invoice</a></li>
        <li><a href="/how-to-make-an-invoice/">How to make an invoice</a></li>
      </ul>
    </div>
    <div>
      <h2>Account</h2>
      <ul>
        <li><a href="/login/?signup=1">Create free account</a></li>
        <li><a href="/login/">Log in</a></li>
        <li><a href="/dashboard/">My invoices</a></li>
      </ul>
    </div>
    <div>
      <h2>invoice-gen.net</h2>
      <ul>
        <li><a href="/about/">About</a></li>
        <li><a href="/contact/">Contact</a></li>
        <li><a href="/privacy/">Privacy policy</a></li>
        <li><a href="/terms/">Terms of use</a></li>
      </ul>
    </div>
  </div>
  <div class="wrap foot-base">
    <span>&copy; <span data-year>2026</span> invoice-gen.net. All rights reserved.</span>
    <span>Invoices are created in your browser. <a href="/privacy/">How we handle your data</a></span>
  </div>
</footer>
'''

BASE_JS = f'''<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js"></script>
<script src="/assets/js/config.js?v={V}"></script>
<script src="/assets/js/core.js?v={V}"></script>
'''
PDF_JS = f'''<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
'''

def page(path, title, desc, main, scripts="", ld=None, noindex=False):
    html = head(title, desc, path, ld, noindex) + '<main id="main">\n' + main + "\n</main>\n" + FOOT + BASE_JS + scripts + "</body>\n</html>\n"
    out = os.path.join(ROOT, path.strip("/"), "index.html") if path != "/" else os.path.join(ROOT, "index.html")
    if path.endswith(".html"):
        out = os.path.join(ROOT, path.strip("/"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out)

ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg>'
ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>'

# ---------------------------------------------------------------- home
FAQ = [
    ("Is invoice-gen.net really free?", "Yes. Making invoices, downloading them as PDF and printing are free with no limit. A free account adds saved invoices, saved clients and sending invoices by email."),
    ("Do I need an account to make an invoice?", "No. Fill in the invoice and press Download PDF. Your draft stays in your browser so you can come back to it. Create an account only when you want to save invoices or email them."),
    ("How do I send an invoice by email?", "Log in, fill in the invoice and press Send by email. Add your client's email address and a short message. Your client receives the invoice as a PDF attachment, and their reply goes straight to your email."),
    ("Which currencies can I use?", "28 currencies including US Dollar, Bangladeshi Taka, Euro, British Pound, Indian Rupee, UAE Dirham and Saudi Riyal. Amounts are formatted correctly for the currency you pick."),
    ("Can I add my logo, tax and discounts?", "Yes. Add your logo, a tax or VAT rate, a percentage or fixed discount, shipping, and any amount already paid. The balance due updates as you type."),
    ("Is my invoice data private?", "Without an account, your invoice never leaves your browser. With an account, invoices are stored in a secured database where only you can read them. We don't sell or share your data."),
]
faq_ld = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
    {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in FAQ]}
app_ld = {"@context": "https://schema.org", "@type": "WebApplication", "name": "invoice-gen.net invoice generator",
          "url": SITE + "/", "applicationCategory": "BusinessApplication", "operatingSystem": "Any (web browser)",
          "offers": {"@type": "Offer", "price": "0", "priceCurrency": "USD"},
          "description": "Free online invoice generator. Create professional invoices, download PDF and email them to clients."}
howto_ld = {"@context": "https://schema.org", "@type": "HowTo", "name": "How to make an invoice online", "step": [
    {"@type": "HowToStep", "name": "Fill in the invoice", "text": "Type your business details, your client and each item straight onto the invoice."},
    {"@type": "HowToStep", "name": "Check the totals", "text": "Add tax, discount or shipping. Totals and balance due update as you type."},
    {"@type": "HowToStep", "name": "Download or send", "text": "Download a PDF, print it, or email it to your client with one click."}]}

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import home_section
HOME = home_section.build(FAQ, ICON_DL, ICON_SEND)

page("/", "Free Invoice Generator: Create, Download & Email PDF Invoices | invoice-gen.net",
     "Make a professional invoice in minutes. Free online invoice generator with PDF download, email sending, 28 currencies, tax, discounts and saved clients.",
     HOME, PDF_JS + f'<script src="/assets/js/invoice.js?v={V}"></script>\n<script src="/assets/js/pdf.js?v={V}"></script>\n<script src="/assets/js/app.js?v={V}"></script>\n',
     [app_ld, faq_ld, howto_ld])

# ---------------------------------------------------------------- login
LOGIN = '''<section class="auth">
  <div class="auth-card">
    <h1 id="authTitle">Log in</h1>
    <div class="tabs" role="tablist" aria-label="Log in or sign up">
      <button type="button" role="tab" data-mode="login" aria-selected="true">Log in</button>
      <button type="button" role="tab" data-mode="signup" aria-selected="false">Sign up</button>
    </div>
    <p class="form-msg" id="authMsg" hidden></p>
    <form id="authForm" novalidate>
      <button type="button" class="btn btn-ghost btn-block" id="googleBtn"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M22.6 12.3c0-.8-.1-1.5-.2-2.3H12v4.3h5.9a5 5 0 0 1-2.2 3.3v2.8h3.6c2.1-1.9 3.3-4.8 3.3-8.1z"/><path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.2 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.9A11 11 0 0 0 12 23z"/><path fill="#FBBC05" d="M5.8 14.1a6.6 6.6 0 0 1 0-4.2V7H2.1a11 11 0 0 0 0 9.9l3.7-2.8z"/><path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2A11 11 0 0 0 2.1 7l3.7 2.9C6.7 7.3 9.1 5.4 12 5.4z"/></svg> Continue with Google</button>
      <div class="divider">or with email</div>
      <div class="field"><label for="email">Email</label><input class="input" id="email" type="email" autocomplete="email" required></div>
      <div class="field"><label for="password">Password</label><input class="input" id="password" type="password" autocomplete="current-password" minlength="8" required></div>
      <button class="btn btn-primary btn-block" id="authSubmit" type="submit">Log in</button>
      <p style="display:flex;justify-content:space-between;gap:10px;margin-top:14px;font-size:.92rem">
        <a href="#" id="magic">Email me a login link</a>
        <a href="#" id="forgot">Forgot password?</a>
      </p>
    </form>
    <form id="resetForm" hidden>
      <div class="field"><label for="newPassword">New password</label><input class="input" id="newPassword" type="password" autocomplete="new-password" minlength="8" required></div>
      <button class="btn btn-primary btn-block" type="submit">Save new password</button>
    </form>
    <p class="hint" style="margin-top:18px">You can still <a href="/">make and download invoices</a> without an account.</p>
  </div>
</section>'''
page("/login/", "Log in or sign up | invoice-gen.net", "Log in to invoice-gen.net to save invoices and clients and email invoices to your clients.",
     LOGIN, f'<script src="/assets/js/invoice.js?v={V}"></script>\n<script src="/assets/js/auth.js?v={V}"></script>\n', noindex=True)

# ---------------------------------------------------------------- dashboard
DASH = '''<section class="dash">
  <div class="wrap" id="dashMain">
    <div class="dash-head">
      <div>
        <h1>Your invoices</h1>
        <p class="hint" style="margin:6px 0 0">Logged in as <span id="who"></span></p>
      </div>
      <a class="btn btn-primary" href="/?new=1">New invoice</a>
    </div>
    <dl class="figures">
      <div><dt>Invoiced</dt><dd id="figInvoiced">–</dd></div>
      <div><dt>Paid</dt><dd id="figPaid">–</dd></div>
      <div><dt>Still owed</dt><dd id="figOpen">–</dd></div>
    </dl>
    <div class="tabs" role="tablist" aria-label="Dashboard sections">
      <button type="button" role="tab" data-tab="invoices" aria-selected="true">Invoices</button>
      <button type="button" role="tab" data-tab="clients" aria-selected="false">Clients</button>
      <button type="button" role="tab" data-tab="account" aria-selected="false">Account</button>
    </div>

    <div data-panel="invoices">
      <div class="field" style="max-width:360px"><label for="search">Search</label><input class="input" id="search" type="search" placeholder="Invoice number or client"></div>
      <div class="table-wrap" id="invTable" hidden>
        <table class="data">
          <thead><tr><th>Number</th><th>Client</th><th>Issued</th><th>Due</th><th class="num">Total</th><th>Status</th><th><span class="sr-only">Actions</span></th></tr></thead>
          <tbody id="invRows"></tbody>
        </table>
      </div>
      <div class="card empty" id="invEmpty" hidden>
        <h3>No invoices yet</h3>
        <p>Make your first invoice. It's saved here when you download, send or press Save.</p>
        <a class="btn btn-primary" href="/?new=1">Make an invoice</a>
      </div>
    </div>

    <div data-panel="clients" hidden>
      <div class="split">
        <form class="card" id="clientForm">
          <h2 style="font-size:1.2rem">Add a client</h2>
          <div class="field"><label for="cname">Name</label><input class="input" id="cname" name="cname" required></div>
          <div class="field"><label for="cemail">Email</label><input class="input" id="cemail" name="cemail" type="email"></div>
          <div class="field"><label for="cphone">Phone</label><input class="input" id="cphone" name="cphone"></div>
          <div class="field"><label for="caddress">Address</label><textarea class="input" id="caddress" name="caddress" rows="3"></textarea></div>
          <button class="btn btn-primary btn-block" type="submit">Add client</button>
        </form>
        <div>
          <div class="table-wrap" id="clientTable" hidden>
            <table class="data">
              <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th><span class="sr-only">Actions</span></th></tr></thead>
              <tbody id="clientRows"></tbody>
            </table>
          </div>
          <div class="card empty" id="clientEmpty" hidden><h3>No clients yet</h3><p>Add one here, or they're saved automatically when you save an invoice.</p></div>
        </div>
      </div>
    </div>

    <div data-panel="account" hidden>
      <div class="split">
        <div class="card">
          <h2 style="font-size:1.2rem">Account</h2>
          <p>Email: <strong id="accEmail"></strong></p>
          <p class="hint">Your business details (name, address, logo, tax) are set on the invoice page with “Save my details for next time”.</p>
          <button class="btn btn-ghost" data-signout type="button">Log out</button>
        </div>
        <form class="card" id="pwForm">
          <h2 style="font-size:1.2rem">Change password</h2>
          <div class="field"><label for="newpw">New password</label><input class="input" id="newpw" name="newpw" type="password" autocomplete="new-password" minlength="8"></div>
          <button class="btn btn-ink" type="submit">Change password</button>
          <p class="hint" style="margin-top:14px">To delete your account and all invoices, email <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>.</p>
        </form>
      </div>
    </div>
  </div>
</section>'''
page("/dashboard/", "My invoices | invoice-gen.net", "Your saved invoices and clients on invoice-gen.net.",
     DASH, PDF_JS + f'<script src="/assets/js/invoice.js?v={V}"></script>\n<script src="/assets/js/pdf.js?v={V}"></script>\n<script src="/assets/js/dashboard.js?v={V}"></script>\n', noindex=True)

# ---------------------------------------------------------------- articles
def article(path, title, desc, h1, crumbs_name, body, ld=None):
    crumb_ld = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": crumbs_name, "item": SITE + path}]}
    main = f'''<section class="page-head">
  <div class="wrap">
    <p class="crumbs"><a href="/">Home</a> / {crumbs_name}</p>
    <h1>{h1}</h1>
  </div>
</section>
<article class="article">
{body}
</article>'''
    page(path, title, desc, main, "", [crumb_ld] + (ld or []))

CTA = '''  <div class="cta-box">
    <h2>Make your invoice now</h2>
    <p>Free, no sign-up needed. Download the PDF or email it to your client.</p>
    <a class="btn btn-primary" href="/#create">Open the invoice generator</a>
  </div>'''

article("/how-to-make-an-invoice/", "How to Make an Invoice: Step-by-Step Guide with Checklist | invoice-gen.net",
        "Learn how to make an invoice that gets paid on time: what to include, how to number invoices, payment terms, and a free checklist.",
        "How to make an invoice", "How to make an invoice", '''  <p>An invoice is a request for payment. It tells your client what you did, how much it costs, and when and how to pay. A clear invoice gets paid faster and keeps your records straight for tax time.</p>
  <h2>What every invoice must include</h2>
  <ul>
    <li><strong>The word “Invoice”</strong> at the top, so it isn't mistaken for a quote.</li>
    <li><strong>A unique invoice number</strong>, such as INV-0001, INV-0002. Never reuse a number.</li>
    <li><strong>Issue date and due date.</strong> The due date is the date payment is expected.</li>
    <li><strong>Your details:</strong> business name, address, email, phone, and your tax or VAT number if you have one.</li>
    <li><strong>Your client's details:</strong> name or company, address and email.</li>
    <li><strong>Each item or service</strong> with a short description, quantity, rate and line amount.</li>
    <li><strong>Subtotal, tax, discount and total</strong>, clearly shown.</li>
    <li><strong>How to pay:</strong> bank details, mobile banking number or payment link.</li>
  </ul>
  <h2>Step by step</h2>
  <ol>
    <li>Open the <a href="/">invoice generator</a> and add your logo and business details.</li>
    <li>Give the invoice a number. invoice-gen.net counts up for you automatically.</li>
    <li>Set the issue date and a due date. 7, 14 or 30 days are common.</li>
    <li>Add your client's name, address and email.</li>
    <li>List each service or product. Use plain descriptions your client will recognise, like “Logo design, 3 concepts”.</li>
    <li>Add tax if you charge it, plus any discount or shipping.</li>
    <li>Write payment instructions in the Notes box.</li>
    <li>Download the PDF or press Send by email.</li>
  </ol>
  <h2>Choosing payment terms</h2>
  <table>
    <thead><tr><th>Term</th><th>Meaning</th></tr></thead>
    <tbody>
      <tr><td>Due on receipt</td><td>Pay as soon as the invoice arrives.</td></tr>
      <tr><td>Net 7 / Net 14</td><td>Pay within 7 or 14 days of the issue date.</td></tr>
      <tr><td>Net 30</td><td>Pay within 30 days. Common for companies.</td></tr>
      <tr><td>50% upfront</td><td>Half before work starts, half on delivery. Good for new clients.</td></tr>
    </tbody>
  </table>
  <h2>Tips for getting paid faster</h2>
  <ul>
    <li>Send the invoice the day the work is delivered.</li>
    <li>Make paying easy: put full payment details on the invoice.</li>
    <li>Send a polite reminder a few days before the due date.</li>
    <li>Mark invoices as paid so you always know who still owes you.</li>
  </ul>
''' + CTA)

article("/invoice-template/", "Free Invoice Template: Fill In Online and Download PDF | invoice-gen.net",
        "Free invoice template you can fill in online. Add your logo, choose a colour and currency, then download a PDF or email it. No Word or Excel needed.",
        "Free invoice template", "Invoice template", '''  <p>The invoice on our <a href="/">home page</a> is a ready-made template. Type into it like a form, then download a PDF. There's nothing to install, and no Word or Excel file to fix when the columns break.</p>
  <h2>What the template includes</h2>
  <ul>
    <li>Your logo, business name, address, email, phone and tax number</li>
    <li>Invoice number, issue date, due date and an optional PO or reference number</li>
    <li>Unlimited line items with quantity, rate and automatic amounts</li>
    <li>Discount (percent or fixed), tax or VAT with your own label, shipping</li>
    <li>Amount already paid and the balance due</li>
    <li>Notes for payment details and a terms section</li>
  </ul>
  <h2>Make it yours</h2>
  <p>Pick one of six colours for the header and table, choose from 28 currencies, and add your logo. Mark an invoice as paid to add a Paid stamp to the PDF, which works as a simple receipt.</p>
  <h2>Template ideas by business type</h2>
  <table>
    <thead><tr><th>Business</th><th>How to fill in the lines</th></tr></thead>
    <tbody>
      <tr><td>Freelancer or consultant</td><td>Hours as quantity, hourly rate as rate</td></tr>
      <tr><td>Designer or developer</td><td>One line per deliverable or project stage</td></tr>
      <tr><td>Shop or online seller</td><td>One line per product, add shipping</td></tr>
      <tr><td>Agency</td><td>Monthly retainer as one line, extras below</td></tr>
      <tr><td>Contractor</td><td>Labour and materials as separate lines</td></tr>
    </tbody>
  </table>
''' + CTA)

article("/freelance-invoice/", "Freelance Invoice Generator: Bill Clients and Get Paid | invoice-gen.net",
        "Create freelance invoices for hourly or project work. Free generator with PDF download, email sending, multiple currencies and payment tracking.",
        "Freelance invoices that get paid", "Freelance invoice", '''  <p>As a freelancer, your invoice is often the last thing a client sees from you. A clean, clear invoice looks professional and removes any reason to delay payment.</p>
  <h2>Hourly or project billing</h2>
  <p><strong>Hourly:</strong> put the hours in Qty and your hourly rate in Rate. Describe the work and the period, like “Website updates, 1–15 March”.</p>
  <p><strong>Project:</strong> one line per milestone or deliverable with quantity 1. For large projects, invoice a deposit first and record it in Amount paid on the final invoice.</p>
  <h2>Working with clients abroad</h2>
  <ul>
    <li>Invoice in the client's currency (for example USD, GBP or EUR) to make paying easy for them.</li>
    <li>Write your bank details or payment link (Payoneer, Wise, PayPal) in Notes.</li>
    <li>Leave tax at 0% unless you're registered to charge it.</li>
  </ul>
  <h2>Keep track of what's owed</h2>
  <p>With a free account, every invoice is saved to your dashboard. You can see your total invoiced, paid and still owed, mark invoices as paid, and spot overdue ones at a glance.</p>
''' + CTA)

article("/about/", "About invoice-gen.net", "invoice-gen.net is a free invoice generator for freelancers and small businesses.",
        "About invoice-gen.net", "About", '''  <p>invoice-gen.net is a free online invoice generator. It's made for freelancers, small shops and growing businesses who need a professional invoice without buying accounting software.</p>
  <p>You can make and download invoices without an account. A free account adds saved invoices, a client list and sending invoices by email.</p>
  <p>Questions or ideas? <a href="/contact/">Get in touch</a>.</p>''')

article("/contact/", "Contact invoice-gen.net", "Contact the invoice-gen.net team for help or feedback.",
        "Contact", "Contact", '''  <p>For help, feedback or business enquiries, email <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>. We usually reply within two working days.</p>
  <p>To delete your account and all your saved invoices, email us from the address you signed up with.</p>''')

article("/privacy/", "Privacy Policy | invoice-gen.net", "How invoice-gen.net collects, uses and protects your information.",
        "Privacy policy", "Privacy policy", '''  <p><em>Last updated: 8 October 2026</em></p>
  <h2>Without an account</h2>
  <p>Invoices you make without an account stay in your own browser (local storage). They are not sent to our servers. PDFs are created in your browser.</p>
  <h2>With an account</h2>
  <p>We store your email address, your invoices, clients and business details so you can use them again. Data is stored with Supabase and protected so that only your account can read it.</p>
  <h2>Emailing invoices</h2>
  <p>When you send an invoice by email, we pass the recipient's address, your message and the PDF to our email provider (Resend) to deliver it. We keep a record of the send (time and recipient) to prevent abuse.</p>
  <h2>Cookies and analytics</h2>
  <p>We use browser storage to keep you logged in and to keep your draft. If we add analytics or advertising, this page will be updated and, where required, we will ask for your consent.</p>
  <h2>Your choices</h2>
  <p>You can edit or delete any invoice or client in your dashboard. To delete your account entirely, email <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>.</p>
  <p class="hint">This policy is a starting point. Have it reviewed for the laws that apply to your business.</p>''')

article("/terms/", "Terms of Use | invoice-gen.net", "The terms for using invoice-gen.net.",
        "Terms of use", "Terms of use", '''  <p><em>Last updated: 8 October 2026</em></p>
  <p>By using invoice-gen.net you agree to these terms.</p>
  <h2>Using the service</h2>
  <ul>
    <li>invoice-gen.net is provided free of charge, as is, without warranty.</li>
    <li>You are responsible for the accuracy of your invoices, including tax amounts and legal requirements in your country.</li>
    <li>Do not use invoice-gen.net to send spam, fake invoices or fraudulent payment requests. We may suspend accounts that do.</li>
    <li>Email sending has a daily limit per account to protect deliverability.</li>
  </ul>
  <h2>Your content</h2>
  <p>You own your invoices and data. You give us permission to store and process them only to provide the service.</p>
  <h2>Changes</h2>
  <p>We may update these terms and the service. Significant changes will be announced on this page.</p>
  <p class="hint">These terms are a starting point. Have them reviewed for the laws that apply to your business.</p>''')

# ---------------------------------------------------------------- 404
page("/404.html", "Page not found | invoice-gen.net", "This page doesn't exist.",
     '''<section class="article notfound"><p class="nf-code">404</p><h1>That page doesn't exist</h1><p>The link may be old or mistyped. Everything you need starts on the invoice generator.</p><p class="nf-actions"><a class="btn btn-primary" href="/">Make an invoice</a><a class="btn btn-ghost" href="/how-to-make-an-invoice/">Read the guide</a></p></section>''',
     noindex=True)
