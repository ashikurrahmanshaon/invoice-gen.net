#!/usr/bin/env python3
"""Generates the static HTML pages for invoice-gen.net.
Run from the repo root:  python3 tools/build_pages.py .
"""
import json, os, sys

ROOT = sys.argv[1]
SITE = "https://invoice-gen.net"
# Your social media pages. Paste each full link here once the page exists, e.g.
# "https://www.facebook.com/invoicegen", "https://x.com/invoicegen", "https://www.linkedin.com/company/invoice-gen"
# They are added to Google's knowledge panel data and as icons in the footer.
SOCIAL = []
from urllib.parse import quote as _q

def og_image(path):
    """the social share picture for this page (made by tools/og_images.py), or the general one"""
    slug = "home" if path == "/" else path.strip("/").replace("/", "-")
    if os.path.exists(os.path.join(ROOT, "assets", "og", slug + ".png")):
        return f"{SITE}/assets/og/{slug}.png"
    return f"{SITE}/assets/img/og-image.png"

def share_bar(path, title):
    u = _q(SITE + path, safe=""); t = _q(title, safe="")
    links = [
        ("Facebook", f"https://www.facebook.com/sharer/sharer.php?u={u}", '<path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z"/>'),
        ("X", f"https://x.com/intent/post?url={u}&amp;text={t}", '<path d="M4 4l16 16M20 4 4 20"/>'),
        ("LinkedIn", f"https://www.linkedin.com/sharing/share-offsite/?url={u}", '<rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 10v7M8 7v.01M12 17v-4a2 2 0 0 1 4 0v4M12 10v7"/>'),
        ("WhatsApp", f"https://wa.me/?text={t}%20{u}", '<path d="M4 20l1.3-3.9A8 8 0 1 1 8 19z"/><path d="M9 9c0 3 3 6 6 6l1-1.5-2-1-1 1c-1 0-2.5-1.5-2.5-2.5l1-1-1-2z"/>'),
    ]
    a = "".join(f'<a class="share-btn" href="{h}" target="_blank" rel="noopener nofollow" aria-label="Share on {n}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ic}</svg><span>{n}</span></a>' for n, h, ic in links)
    return f'<div class="share-bar"><span class="share-h">Share this</span>{a}<button type="button" class="share-btn" data-copy="{SITE + path}" aria-label="Copy link"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg><span>Copy link</span></button></div>'
import hashlib as _hl, glob as _gl
def _asset_version(root):
    h = _hl.md5()
    for f in sorted(_gl.glob(os.path.join(root, "assets/css/style.css")) + _gl.glob(os.path.join(root, "assets/js/*.js")) + _gl.glob(os.path.join(root, "assets/brand/*.svg"))):
        h.update(open(f, "rb").read())
    return h.hexdigest()[:8]
V = _asset_version(sys.argv[1] if len(sys.argv) > 1 else ".")  # changes whenever a stylesheet or script changes
SESSION_JS = '<script>(function(d){d.classList.add("js");try{for(var i=0;i<localStorage.length;i++){if(/^sb-.+-auth-token$/.test(localStorage.key(i))){d.classList.add("has-session");break;}}}catch(e){}})(document.documentElement);</script>'

SPEC_JS = '<script type="speculationrules">{"prefetch":[{"source":"document","where":{"and":[{"href_matches":"/*"},{"not":{"href_matches":["/login/*","/dashboard/*","/*\\\\?*"]}}]},"eagerness":"moderate"}]}</script>'

LOGO_SVG = '<svg class="brand-mark" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#059669"/><g transform="translate(32 32) scale(1.24) translate(-32 -32)"><path d="M23 15h18a3 3 0 0 1 3 3v31l-3-2.4-3 2.4-3-2.4-3 2.4-3-2.4-3 2.4-3-2.4-3 2.4V18a3 3 0 0 1 3-3z" fill="#fff"/><path d="m26.2 31.8 4.2 4.2 8.2-8.6" fill="none" stroke="#059669" stroke-width="3.6" stroke-linecap="round" stroke-linejoin="round"/></g></svg>'

TOOLS = [
    ("/", "Invoice generator", "Bill a client and get paid"),
    ("/quote-generator/", "Quote generator", "Price a job before you start"),
    ("/receipt-generator/", "Receipt generator", "Confirm a payment you received"),
    ("/proforma-invoice/", "Proforma invoice", "Send a preliminary bill"),
    ("/estimate-maker/", "Estimate maker", "Give a rough cost upfront"),
    ("/timesheet-invoice/", "Timesheet invoice", "Bill shifts and hours worked"),
]
INDUSTRY = [
    ("/contractor-invoice/", "Contractor invoice"),
    ("/cleaning-invoice/", "Cleaning invoice"),
    ("/consulting-invoice/", "Consulting invoice"),
    ("/photography-invoice/", "Photography invoice"),
    ("/self-employed-invoice/", "Self-employed invoice"),
    ("/freelance-invoice/", "Freelance invoice"),
]
GUIDES = [
    ("/how-to-make-an-invoice/", "How to make an invoice"),
    ("/invoice-template/", "Invoice templates"),
    ("/invoice-vs-receipt/", "Invoice vs receipt"),
    ("/payment-terms/", "Payment terms explained"),
    ("/payment-reminder/", "Payment reminder emails"),
]
TOOL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg>'
TOOL_PATHS = {"/quote-generator/", "/receipt-generator/", "/proforma-invoice/", "/estimate-maker/", "/timesheet-invoice/", "/contractor-invoice/", "/cleaning-invoice/", "/consulting-invoice/", "/photography-invoice/", "/self-employed-invoice/"}
def _svg(path):
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>'
TOOL_ICONS = {
    "/": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
    "/quote-generator/": '<path d="M4 5h16v11H8l-4 4z"/><path d="M8 9h8M8 12h5"/>',
    "/receipt-generator/": '<path d="M6 3h12v18l-2-1.5-2 1.5-2-1.5-2 1.5-2-1.5L6 21z"/><path d="m9 11 2 2 4-4"/>',
    "/proforma-invoice/": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 15h.01M12 15h.01M15 15h.01"/>',
    "/estimate-maker/": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8 7h8M8 11h2M12 11h2M16 11h0M8 15h2M12 15h2M8 18.5h6"/>',
    "/timesheet-invoice/": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
}
TOOLS_MENU = ('<div class="np-col"><span class="np-h">Documents</span>' +
    "".join(f'<a href="{u}"><span class="np-ico">{_svg(TOOL_ICONS.get(u, ""))}</span><span><b>{n}</b><small>{d}</small></span></a>' for u, n, d in TOOLS) +
    '</div><div class="np-col np-biz"><span class="np-h">By business</span>' +
    "".join(f'<a href="{u}">{n.replace(" invoice", "")}</a>' for u, n in INDUSTRY) +
    '<a class="np-all" href="/guides/">All guides →</a></div>')
WORDMARK = '<span class="brand-name">invoice-gen<span class="tld">.net</span></span>'


# ---------------------------------------------------------------- css: minified copy for the live site
import re as _re
_css = open(os.path.join(ROOT, "assets/css/style.css"), encoding="utf-8").read()
_css = _re.sub(r"/\*.*?\*/", "", _css, flags=_re.S)
_css = _re.sub(r"\s+", " ", _css)
_css = _re.sub(r"\s*([{};,>])\s*", r"\1", _css).replace(";}", "}")
open(os.path.join(ROOT, "assets/css/style.min.css"), "w", encoding="utf-8").write(_css.strip())

def head(title, desc, path, extra_ld=None, noindex=False):
    url = SITE + path
    ld = [{
        "@context": "https://schema.org", "@type": "WebSite", "name": "invoice-gen.net", "alternateName": ["invoice-gen", "Invoice Gen"], "url": SITE + "/",
        "inLanguage": "en", "publisher": {"@id": SITE + "/#org"},
    }, dict({
        "@context": "https://schema.org", "@type": "Organization", "@id": SITE + "/#org", "name": "invoice-gen.net", "url": SITE + "/",
        "logo": {"@type": "ImageObject", "url": SITE + "/assets/img/icon-512.png", "width": 512, "height": 512},
        "email": "support@invoice-gen.net",
        "description": "Free online invoice generator: invoices, quotes, receipts, estimates and proforma invoices as PDF.",
    }, **({"sameAs": SOCIAL} if SOCIAL else {}))]
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
{SPEC_JS}
<meta name="theme-color" content="#ffffff">
<meta property="og:type" content="{'article' if extra_ld and any(x.get("@type") == "Article" for x in extra_ld) else 'website'}">
<meta property="og:locale" content="en_US">
<meta property="og:site_name" content="invoice-gen.net">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{og_image(path)}?v={V}">
<meta property="og:image:type" content="image/png">
<meta property="og:image:alt" content="{title}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{og_image(path)}?v={V}">
<meta name="twitter:image:alt" content="{title}">
<link rel="icon" href="/favicon.ico?v={V}" sizes="48x48">
<link rel="icon" href="/favicon.svg?v={V}" type="image/svg+xml">
<link rel="icon" href="/favicon-32.png?v={V}" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-16.png?v={V}" sizes="16x16" type="image/png">
<link rel="apple-touch-icon" sizes="180x180" href="/assets/img/apple-touch-icon.png?v={V}">
<link rel="mask-icon" href="/assets/brand/safari-pinned-tab.svg?v={V}" color="#059669">
<link rel="manifest" href="/site.webmanifest?v={V}">
<meta name="application-name" content="invoice-gen.net">
<meta name="apple-mobile-web-app-title" content="invoice-gen.net">
<meta name="msapplication-TileColor" content="#ffffff">
<meta name="format-detection" content="telephone=no">
<link rel="preload" href="/assets/fonts/PlusJakartaSans-Variable.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/style.min.css?v={V}">
{SESSION_JS}
{ld_html}
</head>
<body>
<a class="sr-only" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap">
    <a class="brand" href="/" aria-label="invoice-gen.net home">{LOGO_SVG}{WORDMARK}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav" aria-label="Menu"><span></span><span></span><span></span></button>
    <nav class="nav" id="nav" aria-label="Main">
      <div class="nav-main">
        <a href="/"{' aria-current="page"' if path == "/" else ""}>Invoice generator</a>
        <a href="/invoice-tools/"{' aria-current="page"' if path == "/invoice-tools/" or path in TOOL_PATHS else ""}>Tools</a>
        <a href="/invoice-template/"{' aria-current="page"' if path == "/invoice-template/" else ""}>Templates</a>
        <a href="/guides/"{' aria-current="page"' if path == "/guides/" else ""}>Guides</a>
      </div>
      <div class="nav-actions">
        <a href="#" data-auth="in" data-signout hidden>Log out</a>
        <a class="btn btn-primary btn-sm" href="/dashboard/" data-auth="in" hidden>Dashboard</a>
        <a class="nav-avatar" href="/dashboard/#settings" data-auth="in" hidden aria-label="Your account"><span id="navAvatar">?</span></a>
        <a href="/login/" data-auth="out">Log in</a>
        <a class="btn btn-primary btn-sm" href="/login/?signup=1" data-auth="out">Sign up free</a>
      </div>
    </nav>
  </div>
</header>
'''

TRUST = [
    ('<path d="M12 3 4 6v6c0 4.5 3.4 8.3 8 9 4.6-.7 8-4.5 8-9V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/>', "Private by default", "Nothing you type leaves your browser unless you save it to an account."),
    ('<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>', "Secure sign-in", "HTTPS everywhere, passwords stored encrypted, and only you can open your invoices."),
    ('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 14l2 2 4-4"/>', "Free, no watermark", "Every PDF is clean and yours. No trial, no card, no limit on invoices."),
    ('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>', "Made for anywhere", "28 currencies, A4 or US Letter, and local date and number formats."),
]
TRUST_HTML = "".join(f'<li><span class="ft-ico">{_svg(i)}</span><span><b>{t}</b><small>{d}</small></span></li>' for i, t, d in TRUST)
FOOT_CTA = '''  <div class="wrap">
    <div class="foot-cta">
      <div>
        <h2>Make your next invoice in under a minute</h2>
        <p>Free, no sign-up, no watermark. Download a polished PDF or email it straight to your client.</p>
      </div>
      <div class="foot-cta-btns">
        <a class="btn btn-white" href="/#create">Create an invoice</a>
        <a class="btn btn-ghost-light" href="/login/?signup=1">Create free account</a>
      </div>
    </div>
  </div>
'''
FOOT = '''<footer class="site-footer">
<!--CTA-->  <div class="wrap"><ul class="foot-trust" aria-label="Why people trust invoice-gen.net">''' + TRUST_HTML + '''</ul></div>
  <div class="wrap foot-grid">
    <div class="foot-brand">
      <a class="brand" href="/" aria-label="invoice-gen.net home">''' + LOGO_SVG + WORDMARK + '''</a>
      <p>Professional invoices, quotes and receipts for freelancers and small businesses around the world.</p>
      <a class="foot-mail" href="mailto:support@invoice-gen.net">''' + _svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>') + '''support@invoice-gen.net</a>
    </div>
    <div>
      <h2>Tools</h2>
      <ul><li><a href="/invoice-tools/">All tools</a></li>''' + "".join(f'<li><a href="{u}">{n}</a></li>' for u, n, d in TOOLS) + '''</ul>
    </div>
    <div>
      <h2>By business</h2>
      <ul>''' + "".join(f'<li><a href="{u}">{n}</a></li>' for u, n in INDUSTRY) + '''</ul>
    </div>
    <div>
      <h2>Guides</h2>
      <ul>''' + "".join(f'<li><a href="{u}">{n}</a></li>' for u, n in GUIDES) + '''</ul>
    </div>
    <div>
      <h2>Company</h2>
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
    <nav class="foot-legal" aria-label="Legal"><a href="/privacy/">Privacy</a><a href="/terms/">Terms</a><a href="/contact/">Contact</a></nav>
  </div>
</footer>
'''

BASE_JS = f'''<script src="/assets/js/config.js?v={V}" defer></script>
<script src="/assets/js/core.js?v={V}" defer></script>
<script src="/assets/js/motion.js?v={V}" defer></script>
'''
PDF_JS = '''<script src="/assets/vendor/jspdf.umd.min.js?v=2.5.1" defer></script>
<script src="/assets/vendor/jspdf.plugin.autotable.min.js?v=3.8.2" defer></script>
'''

def page(path, title, desc, main, scripts="", ld=None, noindex=False, chrome=True, cta=True):
    h = head(title, desc, path, ld, noindex)
    if not chrome:
        a = h.index('<header class="site-header">'); b = h.index('</header>') + len('</header>\n')
        h = h[:a] + h[b:]
        h = h.replace('<body>', '<body class="app-body">')
        # dashboard: no saved login in this browser -> straight to the login page, before anything renders
        h = h.replace('</head>', '<script>if(!document.documentElement.classList.contains("has-session"))location.replace("/login/?next="+encodeURIComponent(location.pathname+location.search+location.hash));</script>\n</head>')
    if path in ("/login/", "/dashboard/", "/app/"):
        # sign-in pages: start fetching the sign-in library and connecting to the server right away
        h = h.replace("</head>", '<link rel="preconnect" href="https://qmzwikvsmvdzirurzkxb.supabase.co" crossorigin>\n<link rel="preload" href="/assets/vendor/supabase.js?v=2.45.4" as="script">\n</head>', 1)
    html = h + '<main id="main">\n' + main + "\n</main>\n" + (FOOT.replace("<!--CTA-->", FOOT_CTA if cta else "") if chrome else "") + BASE_JS + scripts + "</body>\n</html>\n"
    out = os.path.join(ROOT, path.strip("/"), "index.html") if path != "/" else os.path.join(ROOT, "index.html")
    if path.endswith(".html"):
        out = os.path.join(ROOT, path.strip("/"))
    os.makedirs(os.path.dirname(out), exist_ok=True)
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print("wrote", out)

ICON_DL = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/></svg>'
ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z"/></svg>'

# ---------------------------------------------------------------- home
FAQ = [
    ("Can I bill hours and shifts?", "Yes. Choose Timesheet invoice above the invoice. Add each shift with the date, work type, start, end and break, and the hours and total are worked out for you. The PDF includes the full timesheet."),
    ("Is invoice-gen.net really free?", "Yes. Making invoices, downloading them as PDF and printing are free with no limit. A free account adds saved invoices, saved clients and sending invoices by email."),
    ("Do I need an account to make an invoice?", "No. Fill in the invoice and press Download PDF. Your draft stays in your browser so you can come back to it. Create an account only when you want to save invoices or email them."),
    ("How do I send an invoice by email?", "Log in, fill in the invoice and press Send by email. Add your client's email address and a short message. Your client receives the invoice as a PDF attachment, and their reply goes straight to your email."),
    ("Which currencies can I use?", "28 currencies including US Dollar, Euro, British Pound, Canadian Dollar, Australian Dollar, Swiss Franc, Japanese Yen and Indian Rupee. Amounts are formatted correctly for the currency you pick."),
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

page("/", "Free Invoice Generator: Create & Download PDF Invoices Online",
     "Make a professional invoice in minutes. Free online invoice generator with PDF download, email sending, 28 currencies, tax, discounts and saved clients.",
     HOME, f'<script src="/assets/js/invoice.js?v={V}" defer></script>\n<script src="/assets/js/pdf.js?v={V}" defer></script>\n<script src="/assets/js/app.js?v={V}" defer></script>\n',
     [app_ld, faq_ld, howto_ld])

# ---------------------------------------------------------------- keyword tool pages
# Each page is the full working generator, opened with its own document type,
# plus a short guide and FAQ written for that search.
GEN_JS = f'<script src="/assets/js/invoice.js?v={V}" defer></script>\n<script src="/assets/js/pdf.js?v={V}" defer></script>\n<script src="/assets/js/app.js?v={V}" defer></script>\n'

def guide_band(h2, intro, cols):
    items = "".join(f'<div><dt>{t}</dt><dd>{d}</dd></div>' for t, d in cols)
    return f'''<section class="band" aria-label="{h2}">
  <div class="wrap split-2">
    <div>
      <h2>{h2}</h2>
      <p class="lede">{intro}</p>
    </div>
    <dl class="feat">{items}</dl>
  </div>
</section>

'''

def related_band(path):
    links = [(u, n) for u, n in INDUSTRY if u != path][:5] + [(u, n) for u, n, d in TOOLS if u not in ("/", path)][:3]
    items = "".join(f'<li><a href="{u}"><b>{n}</b></a></li>' for u, n in links)
    return f'''<section class="band band-line" aria-label="More invoice generators">
  <div class="wrap">
    <h2>More free generators</h2>
    <ul class="chips-links">{items}</ul>
    {share_bar(path, "Free online invoice tools")}
  </div>
</section>

'''

def tool_page(path, doc, title, desc, h1, lead, guide, faq, mode="standard", unit=""):
    ld_faq = {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in faq]}
    ld_app = dict(app_ld, name="invoice-gen.net " + h1.lower(), url=SITE + path, description=desc)
    crumb = {"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": h1, "item": SITE + path}]}
    main = home_section.build(faq, ICON_DL, ICON_SEND, h1=h1, lead=lead, doc=doc, extra=guide_band(*guide) + related_band(path), mode=mode, unit=unit)
    page(path, title, desc, main, GEN_JS, [ld_app, ld_faq, crumb])

tool_page("/timesheet-invoice/", "Invoice",
    "Timesheet Invoice Generator: Bill Hours and Shifts (Free PDF)",
    "Turn your shifts into an invoice. Add date, start, end and break; hours and totals work themselves out. For restaurant, kitchen and hourly work. Free PDF.",
    "Free Timesheet Invoice Generator",
    "Bill the hours you worked. Add each shift with its start, end and break, and the hours, total and tax are worked out for you. Then download a clean PDF with your timesheet attached.",
    ("What goes on a timesheet invoice", "Hourly workers in restaurants, kitchens, hotels, cleaning and events are paid for time. A clear timesheet invoice shows every shift, so the client can check it and pay quickly.", [
        ("Every shift", "Date, work type, start and end time, break and hours for each day you worked."),
        ("Breaks taken off", "Unpaid breaks are subtracted, so the hours match what you are owed."),
        ("Night shifts", "A shift that ends after midnight, like 22:00 to 02:00, still counts the right hours."),
        ("Total hours and rate", "One summary line: total hours times your rate per hour."),
        ("Tax and registration", "Add VAT or sales tax, and your tax or company number in the notes."),
        ("Where you worked", "Add the work address. It shows next to the client as Ship to.")]),
    [("How are the hours worked out?", "Hours are the time from start to end, minus the break. If the end time is earlier than the start, the shift ran past midnight and the hours are counted correctly. You can also type the hours yourself."),
     ("Can I add my logo?", "Yes. Tap Add your logo at the top of the invoice. It appears on the PDF above your name."),
     ("Who is this for?", "Anyone paid by the hour: kitchen and restaurant staff, house and cleaning help, bar and event staff, carers, tutors and freelancers who track time."),
     ("Is it free?", "Yes. Creating and downloading timesheet invoices is free, with no watermark and no sign-up. A free account saves your invoices and lets you email them.")],
    mode="timesheet")

tool_page("/quote-generator/", "Quotation",
    "Free Quote Generator: Create a Professional Quotation PDF | invoice-gen.net",
    "Make a professional quote in minutes. Add your logo, items, tax and a valid-until date, then download the PDF or email it. Free, no sign-up.",
    "Free Quote Generator",
    "Price the job before you start. Fill in the quotation, set how long the price is valid, then download a polished PDF or email it to your client.",
    ("What to put on a quote", "A clear quote wins the job and avoids arguments later. These are the parts clients look for.", [
        ("Quote number and date", "So you and your client can refer to the same version."),
        ("Valid until", "How long the price holds. 14 or 30 days is common."),
        ("Itemised work", "Each task or product with quantity and price."),
        ("Tax and discounts", "Show them separately so the total is easy to check."),
        ("Terms", "Deposit, payment schedule and what is not included."),
        ("Next step", "Tell the client how to accept, for example by replying to the email.")]),
    [("What is the difference between a quote and an invoice?", "A quote is the price you offer before the work starts. An invoice asks for payment after the client has agreed and the work or delivery is done. When a quote is accepted, change the title to Invoice and send it as your bill."),
     ("Is this quote generator free?", "Yes. Creating, downloading and printing quotes is free with no limit and no watermark. A free account lets you save quotes and email them to clients."),
     ("How long should a quote be valid?", "Most businesses use 14 or 30 days. Set the Valid until date on the quote so the client knows when the price may change."),
     ("Can I turn a quote into an invoice?", "Yes. Open the quote, change the title at the top from Quotation to Invoice, update the dates and download or send it again.")])

tool_page("/receipt-generator/", "Receipt",
    "Free Receipt Generator: Make a Payment Receipt PDF Online | invoice-gen.net",
    "Create a professional payment receipt in seconds. Add what was paid, the payment date and method, then download a PDF or email it. Free receipt maker, no sign-up.",
    "Free Receipt Generator",
    "Confirm a payment you received. Fill in the receipt, mark it as paid, then download the PDF or email it to your customer.",
    ("What to put on a receipt", "A receipt is proof of payment. Customers keep it for their records and tax, so make it complete.", [
        ("Receipt number", "A unique number for every payment."),
        ("Payment date", "The day the money was received."),
        ("What was paid for", "Each item or service with its price."),
        ("Amount and currency", "The total received, with tax shown if you charge it."),
        ("Payment method", "Cash, card, bank transfer or PayPal. Pick it under Paid by."),
        ("Your business details", "Name, address and tax ID if you have one.")]),
    [("What is the difference between a receipt and an invoice?", "An invoice asks for payment. A receipt confirms that payment has been received. Many businesses send an invoice first and a receipt once the client pays."),
     ("How do I show that the receipt is paid?", "Receipts are marked as paid automatically. The amount paid matches the total, the balance shows zero and the PDF gets a Paid stamp. For a part payment, change the amount paid."),
     ("Is the receipt generator free?", "Yes, it's free with no limit and no watermark. You don't need an account to download or print receipts."),
     ("Can I email a receipt?", "Yes. With a free account, press Send by email and your customer receives the receipt as a PDF attachment.")])

tool_page("/proforma-invoice/", "Proforma Invoice",
    "Free Proforma Invoice Generator: Create a Proforma PDF Online",
    "Create a proforma invoice online for free. Ideal for advance payments, customs and international orders. Add items, tax and shipping, then download the PDF or email it.",
    "Free Proforma Invoice Generator",
    "Send a preliminary bill before the goods ship or the work begins. Fill in the proforma invoice, then download the PDF or email it to your buyer.",
    ("When to use a proforma invoice", "A proforma invoice tells the buyer exactly what they will be billed, before the sale is final.", [
        ("Advance payment", "Ask for a deposit or full payment before you start."),
        ("International orders", "Buyers often need one to arrange import permits or a letter of credit."),
        ("Customs", "Shows the value and description of goods being shipped."),
        ("Internal approval", "Lets the buyer's finance team approve the purchase."),
        ("Shipping and terms", "Include delivery cost, delivery date and payment terms."),
        ("Final invoice later", "Send a normal invoice once the goods are delivered.")]),
    [("What is a proforma invoice?", "A proforma invoice is a preliminary bill sent before goods are delivered or work is done. It shows what the buyer will pay but is not a demand for payment in the accounting sense."),
     ("Is a proforma invoice legally binding?", "Usually not. It's an estimate of the final invoice. Rules differ by country, so check with your accountant for tax purposes."),
     ("Can I convert a proforma into a final invoice?", "Yes. Change the title at the top to Invoice, update the number and dates, and send it once the order is complete."),
     ("Is it free?", "Yes. Creating and downloading proforma invoices is free, with no watermark and no sign-up.")])

tool_page("/estimate-maker/", "Estimate",
    "Free Estimate Maker: Create a Job Estimate PDF Online | invoice-gen.net",
    "Make a professional estimate for any job in minutes. Itemise labour and materials, add tax and a valid-until date, then download the PDF or email it. Free, no sign-up.",
    "Free Estimate Maker",
    "Give your client a clear idea of the cost before you start. Fill in the estimate, then download a polished PDF or email it.",
    ("What to put on an estimate", "Estimates are approximate, so explain what the price depends on.", [
        ("Labour and materials", "List them on separate lines so the client sees where the money goes."),
        ("Valid until", "Prices for materials change. Say how long the estimate holds."),
        ("Assumptions", "What you expect to find on the job, and what would change the price."),
        ("Tax", "Add your tax or VAT rate so the total is realistic."),
        ("Deposit", "If you need one before starting, say how much in the terms."),
        ("Contact details", "So the client can accept or ask questions quickly.")]),
    [("What is the difference between an estimate and a quote?", "An estimate is an approximate price that may change as the work goes on. A quote is a fixed price for the work described. Use whichever matches how you price the job."),
     ("Is the estimate maker free?", "Yes. Make, download and print estimates for free, with no limit and no watermark."),
     ("Can I turn an estimate into an invoice?", "Yes. When the job is done, change the title to Invoice, adjust the amounts to the final figures and send it."),
     ("Can I add my logo?", "Yes. Click Add your logo at the top of the estimate. It appears on the PDF too.")])

# ---------------------------------------------------------------- login
import app_pages
LOGIN = app_pages.login_markup()
# ---------------------------------------------------------------- invoices by business
tool_page("/contractor-invoice/", "Invoice",
    "Contractor Invoice Template: Labour and Materials (Free PDF)",
    "Create a contractor invoice with labour, materials, deposits and tax. Free template for builders, electricians, plumbers and handymen. Download the PDF or email it.",
    "Free Contractor Invoice Template",
    "Bill a job the way clients expect: labour and materials on separate lines, the deposit taken off, and the balance clear. Download the PDF or email it from the site.",
    ("How to invoice a contracting job", "Clients compare your invoice with the quote. Keep the same structure so it is easy to approve.", [
        ("Job address", "Add the site address in the client details or the notes, so the invoice matches the job."),
        ("Labour", "One line per trade or stage, with hours or days and your rate."),
        ("Materials", "List the main materials with quantity and unit price. Group small parts as one line."),
        ("Deposit", "Enter any deposit already paid in Amount paid. The balance due updates by itself."),
        ("Changes", "Add agreed extra work as its own line, like Additional socket, kitchen."),
        ("Licence and tax", "Put your licence or registration number in an extra field, and add sales tax or VAT if you charge it.")]),
    [("What should a contractor invoice include?", "Your business name and licence number, the client and job address, a unique invoice number and date, labour and materials as separate lines, tax, any deposit paid, the balance due and how to pay."),
     ("Should I list materials separately?", "Yes. Clients trust an invoice more when they can see labour and materials apart. It also makes it easier to match the invoice against your quote."),
     ("How do I show a deposit?", "Enter the deposit in Amount paid. The invoice shows the total, the amount already paid and the balance still due."),
     ("Is it free?", "Yes. Make and download as many contractor invoices as you need, with no watermark and no sign-up.")])

tool_page("/cleaning-invoice/", "Invoice",
    "Free Cleaning Invoice Template: Bill Hours and Visits | invoice-gen.net",
    "Make a cleaning invoice in minutes. Add each visit's start and end time and the hours and total are worked out for you. For house and office cleaners. Free PDF.",
    "Free Cleaning Invoice Template",
    "Add each cleaning visit with its date, type, start and end time. Hours, total and tax are worked out for you, and the PDF lists every visit so your client can check it.",
    ("What a cleaning invoice should show", "Regular clients pay faster when they can see exactly which visits they are paying for.", [
        ("Each visit", "Date, type of clean, start and end time, and hours."),
        ("Type of clean", "Regular clean, deep cleaning, end of tenancy, office or windows."),
        ("Hourly rate", "One rate per hour, shown next to the total hours."),
        ("Supplies", "If you charge for products, switch to a standard invoice and add them as lines."),
        ("Address", "Add the cleaning address as the work address. It shows as Ship to."),
        ("Payment details", "Bank details or a payment link in the notes, so paying takes a minute.")]),
    [("Can I invoice by the hour?", "Yes. This page opens a timesheet invoice: enter start and end times and the hours are worked out for you, minus any break."),
     ("Can I invoice a fixed price per clean?", "Yes. Switch to Standard invoice at the top and add each clean as a line with quantity 1 and your price."),
     ("How often should I invoice regular clients?", "Weekly or monthly is common. Add all visits in the period to one invoice so your client pays once."),
     ("Is it free?", "Yes. Cleaning invoices are free to make and download, with no watermark.")],
    mode="timesheet")

tool_page("/consulting-invoice/", "Invoice",
    "Consulting Invoice Template: Hourly and Retainer Billing (Free)",
    "Create a consulting invoice for hourly work, day rates or retainers. Free template with tax, 28 currencies and PDF download. Email it to your client in one click.",
    "Free Consulting Invoice Template",
    "Bill hours, days or a monthly retainer. Describe the work clearly, set your rate and currency, then download a polished PDF or email it to your client.",
    ("How consultants usually bill", "Pick the model you agreed with the client and keep it the same on every invoice.", [
        ("Hourly", "Hours as the quantity and your hourly rate. Describe the work and the period."),
        ("Day rate", "Switch Bill items by to Days in the options and enter the number of days."),
        ("Retainer", "One line, like Advisory retainer, October 2026, with quantity 1."),
        ("Expenses", "Travel or software at cost, each on its own line."),
        ("Purchase order", "Large companies often need their PO number. Add it in PO / ref."),
        ("Currency", "Invoice in your client's currency to make paying easy.")]),
    [("How do I write a consulting invoice?", "Add your details and your client's, give the invoice a number and due date, then list your hours, days or retainer with the rate. Add tax if you are registered and put your payment details in the notes."),
     ("What payment terms do consultants use?", "Net 14 or Net 30 is common. Companies often pay on a 30-day cycle, so agree the terms before you start."),
     ("Can I bill in another currency?", "Yes. Choose from 28 currencies in the options panel. Amounts are formatted the way your client expects."),
     ("Is it free?", "Yes, with no limit and no watermark.")],
    unit="hours")

tool_page("/photography-invoice/", "Invoice",
    "Photography Invoice Template: Shoots, Editing, Prints (Free)",
    "Make a photography invoice for shoots, editing, prints and travel. Free template with your logo, deposits and PDF download. For wedding, event and portrait work.",
    "Free Photography Invoice Template",
    "Bill a shoot the way you quoted it: session, editing, prints and travel on their own lines, with your logo on top and any booking deposit taken off the balance.",
    ("What to put on a photography invoice", "A clear invoice also reminds the client what they are getting.", [
        ("Session", "The shoot itself, with the date and length, like Wedding coverage, 8 hours."),
        ("Editing", "Number of edited images or hours of retouching."),
        ("Products", "Prints, albums or USB, each with quantity and price."),
        ("Travel", "Mileage or travel fee as a separate line."),
        ("Booking deposit", "Enter the deposit in Amount paid so the balance due is right."),
        ("Usage", "For commercial work, note the licence or usage rights in the terms.")]),
    [("Should I take a deposit?", "Most photographers take 25 to 50 percent to book the date. Invoice the deposit first, then enter it as Amount paid on the final invoice."),
     ("Can I add my logo?", "Yes. Tap Add your logo at the top of the invoice. It appears on the PDF."),
     ("How do I mark an invoice as paid?", "Set the status to Paid in the options. The PDF gets a Paid stamp, which works as a receipt."),
     ("Is it free?", "Yes. No watermark and no sign-up needed.")])

tool_page("/self-employed-invoice/", "Invoice",
    "Free Self-Employed Invoice Template: Simple PDF Invoices | invoice-gen.net",
    "A simple invoice template for self-employed people and sole traders. Add your name, your client, what you did and the price, then download the PDF. Free, no sign-up.",
    "Free Self-Employed Invoice Template",
    "You don't need a company to send a proper invoice. Use your own name, add your client and the work, and download a clean PDF in a minute.",
    ("Invoicing when you are self-employed", "A sole trader invoice needs the same basics as any business invoice.", [
        ("Your name", "Your own name or trading name, with your address and email."),
        ("Unique number", "Number every invoice in order, like INV-0001, INV-0002."),
        ("What you did", "A short, plain description and the date or period of the work."),
        ("Tax", "Only add VAT or sales tax if you are registered to charge it."),
        ("Payment", "Your bank details or payment link in the notes."),
        ("Records", "Keep a copy of every invoice for your tax return. A free account saves them for you.")]),
    [("Can I send an invoice without a company?", "Yes. Self-employed people and sole traders invoice under their own name. Use your name or trading name at the top."),
     ("Do I have to charge tax?", "Only if you are registered for VAT, GST or sales tax. If you are not, leave the tax rate at 0."),
     ("How do I number my invoices?", "Use a simple sequence and never reuse a number. invoice-gen.net counts up for you automatically."),
     ("Is it free?", "Yes. Free to make, download and print, with no watermark.")])

page("/login/", "Log in or sign up | invoice-gen.net", "Log in to invoice-gen.net to save invoices and clients and email invoices to your clients.",
     LOGIN, f'<script src="/assets/js/invoice.js?v={V}" defer></script>\n<script src="/assets/js/auth.js?v={V}" defer></script>\n', noindex=True, cta=False)

# ---------------------------------------------------------------- dashboard
DASH = app_pages.dash_markup(LOGO_SVG, WORDMARK)
page("/dashboard/", "Dashboard | invoice-gen.net", "Your saved invoices and clients on invoice-gen.net.",
     DASH, f'<script src="/assets/js/invoice.js?v={V}" defer></script>\n<script src="/assets/js/pdf.js?v={V}" defer></script>\n<script src="/assets/js/dashboard.js?v={V}" defer></script>\n', noindex=True, chrome=False)

# ---------------------------------------------------------------- app editor (logged in)
_ed = home_section.build(FAQ, ICON_DL, ICON_SEND)
_a = _ed.index('<div class="wrap gen-head">'); _b = _ed.index('<div class="wrap gen-grid">')
_ed = _ed[:_a] + _ed[_b:]
_ed = _ed[:_ed.index('<section class="band', _ed.index('</dialog>'))]
_ed = _ed.replace('aria-labelledby="gen-title"', 'aria-labelledby="wsTitle"')
WS = app_pages.workspace_markup(_ed, LOGO_SVG, WORDMARK)
page("/app/", "Invoice editor | invoice-gen.net", "Create and edit invoices in your invoice-gen.net account.",
     WS, f'<script src="/assets/js/invoice.js?v={V}" defer></script>\n<script src="/assets/js/pdf.js?v={V}" defer></script>\n<script src="/assets/js/app.js?v={V}" defer></script>\n', noindex=True, chrome=False)

# ---------------------------------------------------------------- articles
import datetime
TODAY = datetime.date.today().isoformat()
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
{share_bar(path, h1) if path not in ("/about/", "/contact/", "/privacy/", "/terms/") else ""}
</article>'''
    art_ld = {"@context": "https://schema.org", "@type": "Article", "headline": h1, "description": desc,
              "mainEntityOfPage": SITE + path, "datePublished": "2026-10-01", "dateModified": TODAY,
              "author": {"@type": "Organization", "name": "invoice-gen.net", "url": SITE + "/"},
              "publisher": {"@type": "Organization", "name": "invoice-gen.net", "logo": {"@type": "ImageObject", "url": SITE + "/assets/img/icon-512.png"}},
              "image": og_image(path)}
    extra = [art_ld] if path not in ("/about/", "/contact/", "/privacy/", "/terms/") else []
    page(path, title, desc, main, "", [crumb_ld] + extra + (ld or []))

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
    <li><strong>How to pay:</strong> bank details, PayPal or a payment link.</li>
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

def faq_ld(pairs):
    return {"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [
        {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}} for q, a in pairs]}

def faq_html(pairs):
    return "  <h2>Questions</h2>\n" + "\n".join(f'  <h3>{q}</h3>\n  <p>{a}</p>' for q, a in pairs) + "\n"

IVR_FAQ = [
    ("Is a paid invoice the same as a receipt?", "Often it can serve as one. If you mark an invoice as paid and it shows the amount and date received, many clients accept it as proof of payment. Some businesses still prefer a separate receipt."),
    ("Do I need to send both?", "Send an invoice to ask for payment. Send a receipt when the client asks for proof, or when they paid on the spot without an invoice."),
    ("Can I make a receipt for free?", "Yes. Use the free receipt generator, mark it as paid and download the PDF."),
]
article("/invoice-vs-receipt/", "Invoice vs Receipt: The Difference and When to Send Each",
        "An invoice asks for payment; a receipt confirms it. Learn the difference, what each must include, and when to send an invoice, a receipt or both.",
        "Invoice vs receipt: what's the difference?", "Invoice vs receipt", '''  <p>An <strong>invoice</strong> asks your client to pay. A <strong>receipt</strong> confirms that they already did. They look alike, but they happen at different moments and do different jobs.</p>
  <table>
    <thead><tr><th></th><th>Invoice</th><th>Receipt</th></tr></thead>
    <tbody>
      <tr><td>When</td><td>Before payment</td><td>After payment</td></tr>
      <tr><td>Purpose</td><td>Requests payment</td><td>Proves payment</td></tr>
      <tr><td>Key dates</td><td>Issue date and due date</td><td>Date the money was received</td></tr>
      <tr><td>Shows</td><td>Balance due and how to pay</td><td>Amount paid and payment method</td></tr>
      <tr><td>Number</td><td>Invoice number, like INV-0042</td><td>Receipt number, often linked to the invoice</td></tr>
    </tbody>
  </table>
  <h2>When to send an invoice</h2>
  <p>Send an invoice when you have delivered work or goods and expect to be paid later. It gives your client a due date and the details they need to pay, and gives you a record for your accounts.</p>
  <h2>When to send a receipt</h2>
  <p>Send a receipt when a client pays you, especially if they paid in cash, on the spot, or asked for proof for their own records or expenses.</p>
  <h2>Turning an invoice into a receipt</h2>
  <p>On invoice-gen.net you can open a paid invoice, set the status to <strong>Paid</strong> and enter the amount paid. The PDF gets a Paid stamp and a zero balance. Or use the <a href="/receipt-generator/">receipt generator</a> to make a separate receipt.</p>
''' + faq_html(IVR_FAQ) + CTA, ld=[faq_ld(IVR_FAQ)])

PT_FAQ = [
    ("What does Net 30 mean?", "Net 30 means the full amount is due 30 days after the invoice date. Net 7 and Net 14 work the same way with 7 or 14 days."),
    ("What payment terms should I use?", "For individuals and small clients, 7 or 14 days works well. Larger companies often pay on Net 30. For a new client or a big job, ask for a deposit upfront."),
    ("Can I charge a late fee?", "In many countries you can, if it was agreed in advance. State it in your terms, for example: a late fee of 2% per month applies after the due date. Check the rules where you work."),
]
article("/payment-terms/", "Invoice Payment Terms Explained: Net 30, Due on Receipt and More",
        "What Net 7, Net 30, due on receipt and 2/10 Net 30 mean, which payment terms to choose, and example wording you can copy onto your invoices.",
        "Invoice payment terms explained", "Payment terms", '''  <p>Payment terms tell your client <strong>when</strong> and <strong>how</strong> to pay. Clear terms are one of the simplest ways to get paid on time.</p>
  <h2>Common payment terms</h2>
  <table>
    <thead><tr><th>Term</th><th>What it means</th></tr></thead>
    <tbody>
      <tr><td>Due on receipt</td><td>Pay as soon as the invoice arrives.</td></tr>
      <tr><td>Net 7 / Net 14</td><td>Pay within 7 or 14 days of the invoice date.</td></tr>
      <tr><td>Net 30</td><td>Pay within 30 days. Common with larger companies.</td></tr>
      <tr><td>EOM</td><td>Pay by the end of the month the invoice was issued.</td></tr>
      <tr><td>2/10 Net 30</td><td>2% discount if paid within 10 days, otherwise the full amount within 30 days.</td></tr>
      <tr><td>50% upfront</td><td>Half before the work starts, the rest on delivery.</td></tr>
    </tbody>
  </table>
  <h2>Which terms to choose</h2>
  <ul>
    <li><strong>New client or large job:</strong> ask for a deposit, then Net 7 on the final invoice.</li>
    <li><strong>Regular small clients:</strong> Net 7 or Net 14.</li>
    <li><strong>Large companies:</strong> Net 30 is normal. Ask early if they need a purchase order number.</li>
  </ul>
  <h2>Wording you can copy</h2>
  <ul>
    <li>Payment is due within 14 days of the invoice date.</li>
    <li>Please pay by bank transfer and use the invoice number as the reference.</li>
    <li>A deposit of 50% is due before work begins. The balance is due on completion.</li>
  </ul>
  <p>On invoice-gen.net, choose <strong>Payment due</strong> in the options to set the due date, and edit the <strong>Terms</strong> box at the bottom of the invoice.</p>
''' + faq_html(PT_FAQ) + CTA, ld=[faq_ld(PT_FAQ)])

PR_FAQ = [
    ("When should I send a payment reminder?", "A friendly reminder a few days before the due date works well. Send a second one on the day after the due date, and a firmer one a week later."),
    ("Should I attach the invoice again?", "Yes. Attach the PDF every time so your client doesn't have to search for it."),
    ("What if the client still doesn't pay?", "Call them, check the invoice reached the right person, and offer a payment plan if needed. If it is still unpaid, look at your local small claims process."),
]
article("/payment-reminder/", "Payment Reminder Email Templates for Unpaid Invoices | invoice-gen.net",
        "Polite and firm payment reminder emails you can copy for unpaid and overdue invoices, with tips on when to send each one.",
        "Payment reminder emails for unpaid invoices", "Payment reminder", '''  <p>Most late payments are simply forgotten. A short, polite reminder usually fixes it. Here are three emails you can copy and adjust.</p>
  <h2>1. Friendly reminder, before the due date</h2>
  <blockquote><p>Subject: Invoice INV-0042 due on 14 March</p><p>Hi Sam,<br>A quick reminder that invoice INV-0042 for $1,250.00 is due on 14 March. I've attached it again for convenience. Payment details are at the bottom of the invoice.<br>Thanks,<br>Alex</p></blockquote>
  <h2>2. Gentle follow-up, just after the due date</h2>
  <blockquote><p>Subject: Invoice INV-0042 is now due</p><p>Hi Sam,<br>Invoice INV-0042 for $1,250.00 was due yesterday. Could you let me know when payment is planned? If it's already on its way, thank you and please ignore this message.<br>Best,<br>Alex</p></blockquote>
  <h2>3. Firm reminder, a week or more overdue</h2>
  <blockquote><p>Subject: Overdue: invoice INV-0042</p><p>Hi Sam,<br>Invoice INV-0042 for $1,250.00 is now 8 days overdue. Please arrange payment by Friday, 22 March. If there's a problem with the invoice, reply and I'll sort it out straight away.<br>Regards,<br>Alex</p></blockquote>
  <h2>Tips that help</h2>
  <ul>
    <li>Keep it short and friendly. Assume it was an oversight.</li>
    <li>Always include the invoice number, amount and due date.</li>
    <li>Attach the invoice PDF again.</li>
    <li>With a free account, your dashboard shows which invoices are overdue, and you can resend them in one click.</li>
  </ul>
''' + faq_html(PR_FAQ) + CTA, ld=[faq_ld(PR_FAQ)])

article("/guides/", "Invoicing Guides: Templates, Payment Terms and Reminders | invoice-gen.net",
        "Free guides for freelancers and small businesses: how to make an invoice, payment terms, reminders, receipts, and invoice templates for your type of work.",
        "Invoicing guides", "Guides", '''  <p>Short, practical guides to invoicing and getting paid. Each one links to a free generator so you can put it into practice straight away.</p>
  <h2>Getting paid</h2>
  <ul>''' + "".join(f'<li><a href="{u}">{n}</a></li>' for u, n in GUIDES) + '''</ul>
  <h2>Invoice templates by business</h2>
  <ul>''' + "".join(f'<li><a href="{u}">{n}</a></li>' for u, n in INDUSTRY) + '''<li><a href="/timesheet-invoice/">Timesheet invoice for restaurant and hourly staff</a></li></ul>
  <h2>Other documents</h2>
  <ul>''' + "".join(f'<li><a href="{u}">{n}</a></li>' for u, n, d in TOOLS if u != "/") + '''</ul>
''' + CTA)

article("/about/", "About invoice-gen.net", "invoice-gen.net is a free invoice generator for freelancers and small businesses.",
        "About invoice-gen.net", "About", '''  <p class="lead">invoice-gen.net is a free online invoice generator for freelancers, small shops and growing businesses that need a professional invoice without buying accounting software.</p>
  <div class="facts">
    <div><b>Free to use</b><span>Make, download and print invoices with no account and no watermark.</span></div>
    <div><b>Built for speed</b><span>Type straight onto the invoice. Totals, tax and the balance due work themselves out.</span></div>
    <div><b>Your data stays yours</b><span>Without an account, invoices never leave your browser. With one, only you can see them.</span></div>
  </div>
  <h2>Free account</h2>
  <p>A free account adds saved invoices, a client list, paid and overdue tracking, and sending invoices to clients by email with the PDF attached.</p>
  <h2>Get in touch</h2>
  <p>Questions or ideas for the next feature? <a href="/contact/">Contact us</a>.</p>
''' + CTA)

article("/contact/", "Contact invoice-gen.net", "Contact the invoice-gen.net team for help, feedback or account questions. We reply by email, usually within one working day.",
        "Contact", "Contact", '''  <p class="lead">Help, feedback or business enquiries: we read every message.</p>
  <div class="contact-card">
    <div><span class="cc-label">Email</span><a class="cc-mail" href="mailto:support@invoice-gen.net">support@invoice-gen.net</a><span class="cc-note">We usually reply within two working days.</span></div>
    <a class="btn btn-dark" href="mailto:support@invoice-gen.net">Send an email</a>
  </div>
  <h2>Delete your account</h2>
  <p>To delete your account and all your saved invoices, email us from the address you signed up with. We will confirm once everything is removed.</p>
  <h2>Before you write</h2>
  <p>Most questions are answered in the <a href="/#faq">FAQ</a> and the <a href="/how-to-make-an-invoice/">invoice guide</a>.</p>''')

article("/privacy/", "Privacy Policy | invoice-gen.net", "How invoice-gen.net collects, uses and protects your information, including invoices, client details and account data.",
        "Privacy policy", "Privacy policy", '''  <p><em>Last updated: 8 October 2026</em></p>
  <h2>Without an account</h2>
  <p>Invoices you make without an account stay in your browser tab and are cleared when you close it. They are not sent to our servers. PDFs are created in your browser.</p>
  <h2>With an account</h2>
  <p>We store your email address, your invoices, clients and business details so you can use them again. Data is stored with Supabase and protected so that only your account can read it. Passwords are stored encrypted (hashed); we cannot see them. We do not sell your data.</p>
  <h2>Emailing invoices</h2>
  <p>When you send an invoice by email, we pass the recipient's address, your message and the PDF to our email provider (Resend) to deliver it. We keep a record of the send (time and recipient) to prevent abuse.</p>
  <h2>Cookies and analytics</h2>
  <p>We use browser storage to keep you logged in and to keep your draft. If we add analytics or advertising, this page will be updated and, where required, we will ask for your consent.</p>
  <h2>Your choices</h2>
  <p>You can edit or delete any invoice or client in your dashboard. To delete your account entirely, email <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>.</p>
  <p class="hint">This policy is a starting point. Have it reviewed for the laws that apply to your business.</p>''')

article("/terms/", "Terms of Use | invoice-gen.net", "The terms for using invoice-gen.net, the free online invoice generator, including accounts, acceptable use and liability.",
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

# ---------------------------------------------------------------- all tools page
INDUSTRY_DESC = {
    "/contractor-invoice/": "Labour and materials on separate lines, deposit taken off.",
    "/cleaning-invoice/": "Each visit with start and end time, hours worked out for you.",
    "/consulting-invoice/": "Hourly, day rate or monthly retainer billing.",
    "/photography-invoice/": "Session, editing, prints and travel, with a booking deposit.",
    "/self-employed-invoice/": "A simple invoice under your own name.",
    "/freelance-invoice/": "Hourly or project work, clients at home or abroad.",
}
GUIDE_DESC = {
    "/how-to-make-an-invoice/": "What to include, step by step, with a checklist.",
    "/invoice-template/": "What the free template includes and how to fill it in.",
    "/invoice-vs-receipt/": "What each one is for, and when to send it.",
    "/payment-terms/": "Net 30, due on receipt and deposits, with wording to copy.",
    "/payment-reminder/": "Three polite to firm emails for unpaid invoices.",
}
ARROW_SVG = _svg('<path d="M5 12h14m-5-5 5 5-5 5"/>')
def _card(u, n, d, icon=""):
    ico = f'<span class="tc-ico">{_svg(icon)}</span>' if icon else ""
    return f'<li><a class="tc" href="{u}">{ico}<span class="tc-t"><b>{n}</b><small>{d}</small></span><span class="tc-go" aria-hidden="true">{ARROW_SVG}</span></a></li>'

TOOLS_MAIN = f"""<section class="page-head tools-head">
  <div class="wrap">
    <p class="crumbs"><a href="/">Home</a> / Tools</p>
    <h1>Free invoicing tools</h1>
    <p class="lede">Every tool opens the same simple editor, set up for that job. No sign-up, no watermark.</p>
  </div>
</section>
<section class="band tools-band" aria-labelledby="t-docs">
  <div class="wrap">
    <h2 id="t-docs">Documents</h2>
    <ul class="tool-grid">{"".join(_card(u, n, d, TOOL_ICONS.get(u, "")) for u, n, d in TOOLS)}</ul>
  </div>
</section>
<section class="band band-line tools-band" aria-labelledby="t-biz">
  <div class="wrap">
    <h2 id="t-biz">Invoice templates by business</h2>
    <ul class="tool-grid tool-grid-sm">{"".join(_card(u, n, INDUSTRY_DESC.get(u, "")) for u, n in INDUSTRY)}</ul>
  </div>
</section>
<section class="band band-line tools-band" aria-labelledby="t-guides">
  <div class="wrap">
    <h2 id="t-guides">Guides</h2>
    <ul class="tool-grid tool-grid-sm">{"".join(_card(u, n, GUIDE_DESC.get(u, "")) for u, n in GUIDES)}</ul>
  </div>
</section>"""
page("/invoice-tools/", "Free Invoicing Tools: Invoice, Quote, Receipt and More",
     "All free invoicing tools in one place: invoice, quote, receipt, proforma, estimate and timesheet generators, templates by business and practical guides.",
     TOOLS_MAIN, "", [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": SITE + "/"},
        {"@type": "ListItem", "position": 2, "name": "Tools", "item": SITE + "/invoice-tools/"}]}])

page("/404.html", "Page not found | invoice-gen.net", "This page doesn't exist.",
     '''<section class="article notfound"><p class="nf-code">404</p><h1>That page doesn't exist</h1><p>The link may be old or mistyped. Everything you need starts on the invoice generator.</p><p class="nf-actions"><a class="btn btn-primary" href="/">Make an invoice</a><a class="btn btn-ghost" href="/how-to-make-an-invoice/">Read the guide</a></p></section>''',
     noindex=True)

# ---------------------------------------------------------------- sitemap
import datetime
TODAY = datetime.date.today().isoformat()
SITEMAP = [("/", "weekly", "1.0")] + [(u, "monthly", "0.9") for u, n, d in TOOLS if u != "/"] + [
    ("/invoice-tools/", "monthly", "0.8"), ("/invoice-template/", "monthly", "0.8"), ("/how-to-make-an-invoice/", "monthly", "0.8"),
    ("/freelance-invoice/", "monthly", "0.8")] + [(u, "monthly", "0.8") for u, n in INDUSTRY if u != "/freelance-invoice/"] + [
    ("/guides/", "monthly", "0.7"), ("/invoice-vs-receipt/", "monthly", "0.7"), ("/payment-terms/", "monthly", "0.7"), ("/payment-reminder/", "monthly", "0.7"), ("/about/", "yearly", "0.4"), ("/contact/", "yearly", "0.4"),
    ("/privacy/", "yearly", "0.2"), ("/terms/", "yearly", "0.2")]
with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8") as f:
    f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n')
    for u, c, pr in SITEMAP:
        img = og_image(u)
        im = f"<image:image><image:loc>{img}</image:loc></image:image>" if "/assets/og/" in img else ""
        f.write(f"  <url><loc>{SITE}{u}</loc><lastmod>{TODAY}</lastmod><changefreq>{c}</changefreq><priority>{pr}</priority>{im}</url>\n")
    f.write("</urlset>\n")
print("wrote sitemap.xml")

# ---------------------------------------------------------------- llms.txt (for AI answer engines: ChatGPT, Perplexity, Gemini, Claude)
import re as _re2, html as _html
def _meta(u):
    fp = os.path.join(ROOT, "index.html") if u == "/" else os.path.join(ROOT, u.strip("/"), "index.html")
    t = open(fp, encoding="utf-8").read()
    title = _html.unescape(_re2.search(r"<title>(.*?)</title>", t).group(1))
    desc = _html.unescape(_re2.search(r'name="description" content="(.*?)"', t).group(1))
    return title, desc
_groups = [("Free generators", [u for u, n, d in TOOLS] + ["/invoice-tools/", "/invoice-template/"]),
           ("Invoices by business", [u for u, n in INDUSTRY]),
           ("Guides", ["/how-to-make-an-invoice/", "/invoice-vs-receipt/", "/payment-terms/", "/payment-reminder/", "/guides/"]),
           ("About", ["/about/", "/contact/", "/privacy/", "/terms/"])]
with open(os.path.join(ROOT, "llms.txt"), "w", encoding="utf-8") as f:
    f.write("# invoice-gen.net\n\n> Free online invoice generator. Make invoices, quotes, receipts, estimates and proforma invoices in the browser and download a PDF, with no sign-up and no watermark. 28 currencies, tax and VAT, discounts, logos, and invoice styles for the US, UK, EU, Canada, Australia, Japan, Asia, the Middle East and more. A free account adds saved invoices, saved clients, a payments dashboard and emailing invoices.\n\n")
    seen = set()
    for g, urls in _groups:
        f.write(f"## {g}\n\n")
        for u in urls:
            if u in seen: continue
            seen.add(u); ti, de = _meta(u)
            f.write(f"- [{ti}]({SITE}{u}): {de}\n")
        f.write("\n")
print("wrote llms.txt")
