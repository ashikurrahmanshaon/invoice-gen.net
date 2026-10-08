# Home page markup for invoice-gen.net (imported by build_pages.py)
# Layout: SaaS hero with an animated product mock, the invoice editor
# (guided steps on the left, live A4 preview on the right), features,
# steps, dashboard teaser, FAQ and a closing call to action.

def I(path, cls="ico"):
    return ('<svg class="' + cls + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" '
            'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + '</svg>')

ICONS = {
    "download": '<path d="M12 4v11m0 0-4-4m4 4 4-4M5 19h14"/>',
    "send": '<path d="M21 3 10 14M21 3l-7 18-4-7-7-4 18-7z"/>',
    "plus": '<path d="M12 5v14M5 12h14"/>',
    "save": '<path d="M5 4h11l3 3v13H5z"/><path d="M8 4v5h7V4M8 20v-6h8v6"/>',
    "print": '<path d="M7 8V4h10v4M7 17H5a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2"/><path d="M7 14h10v6H7z"/>',
    "check": '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    "arrow": '<path d="M5 12h14m-5-5 5 5-5 5"/>',
    "chev": '<path d="m6 9 6 6 6-6"/>',
    "image": '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
    "eye": '<path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    "pen": '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13 7 4 4"/>',
    "mail": '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6.5 8.5-6.5"/>',
    "globe": '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/>',
    "palette": '<path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.6-.8 1.6-1.6 0-.9-.6-1.3-.6-2.1 0-.9.7-1.5 1.6-1.5H17a4 4 0 0 0 4-4c0-4.9-4-8.8-9-8.8z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15" cy="7.8" r="1"/>',
    "percent": '<path d="M19 5 5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>',
    "lock": '<rect x="4.5" y="10.5" width="15" height="10" rx="2"/><path d="M8 10.5V7.5a4 4 0 0 1 8 0v3"/>',
    "file": '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
}

def step(n, key, title, sub, body, required=False):
    req = '<span class="req-badge">Required</span>' if required else ''
    first = n == 1
    return f'''
          <section class="step{' open' if first else ''}" data-step="{key}" id="step-{key}">
            <button type="button" class="step-head" aria-expanded="{'true' if first else 'false'}" aria-controls="step-{key}-body">
              <span class="step-no" aria-hidden="true"><span>{n}</span>{I(ICONS["check"], "ico step-tick")}</span>
              <span class="step-title"><b>{title}{req}</b><small data-summary="{key}">{sub}</small></span>
              {I(ICONS["chev"], "ico step-chev")}
            </button>
            <div class="step-body" id="step-{key}-body">
              <div class="step-inner">{body}
              </div>
            </div>
          </section>'''

def field(label, inner, hint="", cls=""):
    h = f'<small class="f-hint">{hint}</small>' if hint else ''
    return f'\n                  <label class="f {cls}"><span class="f-label">{label}</span>{inner}{h}</label>'

def build(FAQ, ICON_DL, ICON_SEND):
    business = (
        '''
                <div class="logo-row">
                  <div class="logo-drop" id="logoDrop" role="button" tabindex="0" aria-label="Upload your logo">
                    <img id="logoImg" alt="Your logo" hidden>
                    <span class="logo-empty" id="logoHint">''' + I(ICONS["image"]) + '''<b>Upload logo</b><small>PNG or JPG</small></span>
                    <input type="file" id="logoFile" accept="image/png,image/jpeg,image/webp" hidden>
                  </div>
                  <div class="logo-help"><p>Your logo appears at the top of the invoice. Drag an image here or click to choose.</p><button type="button" class="link-btn" id="logoRemove" hidden>Remove logo</button></div>
                </div>
                <div class="grid-2">'''
        + field("Business name", '<input class="in" data-f="from.name" placeholder="e.g. Arshaon Studio" autocomplete="organization" data-required="business">', "", "span-2")
        + field("Email", '<input class="in" type="email" data-f="from.email" placeholder="you@business.com" autocomplete="email">', "Clients reply to this address.")
        + field("Phone", '<input class="in" data-f="from.phone" placeholder="+880 1700 000000" autocomplete="tel">')
        + field("Address", '<textarea class="in" rows="2" data-f="from.address" placeholder="Street, city, country"></textarea>', "", "span-2")
        + field("Tax, VAT or BIN number", '<input class="in" data-f="from.taxId" placeholder="Optional">', "Shown under your address when filled in.", "span-2")
        + '''
                </div>
                <button type="button" class="btn btn-soft btn-sm" id="profileBtn">''' + I(ICONS["save"]) + ''' Use these details on every new invoice</button>''')

    client = (
        '''
                <div class="client-pick" id="clientPick" hidden>'''
        + field("Choose a saved client", '<select class="in" id="clientSelect"></select>')
        + '''
                </div>
                <div class="grid-2">'''
        + field("Client or company name", '<input class="in" data-f="to.name" placeholder="e.g. Acme Ltd" data-required="client">', "", "span-2")
        + field("Client email", '<input class="in" type="email" data-f="to.email" placeholder="client@company.com">', "Needed to email the invoice.")
        + field("Phone", '<input class="in" data-f="to.phone" placeholder="Optional">')
        + field("Address", '<textarea class="in" rows="2" data-f="to.address" placeholder="Client address"></textarea>', "", "span-2")
        + '''
                </div>''')

    details = (
        '''
                <div class="chips" role="group" aria-label="Document type">
                  <span class="chips-label">Type</span>
                  <button type="button" class="chip" data-title="Invoice">Invoice</button>
                  <button type="button" class="chip" data-title="Quotation">Quotation</button>
                  <button type="button" class="chip" data-title="Proforma Invoice">Proforma</button>
                  <button type="button" class="chip" data-title="Receipt">Receipt</button>
                </div>
                <div class="grid-2">'''
        + field("Title", '<input class="in" data-f="title" placeholder="Invoice">')
        + field("Invoice number", '<input class="in" id="f-number" data-f="number" autocomplete="off">', "Counts up automatically.")
        + field("Issue date", '<input class="in" type="date" data-f="issueDate">')
        + field("Due date", '<input class="in" type="date" data-f="dueDate">')
        + '''
                  <div class="chips span-2" role="group" aria-label="Quick due date">
                    <span class="chips-label">Due</span>
                    <button type="button" class="chip" data-due="0">On receipt</button>
                    <button type="button" class="chip" data-due="7">In 7 days</button>
                    <button type="button" class="chip" data-due="15">In 15 days</button>
                    <button type="button" class="chip" data-due="30">In 30 days</button>
                  </div>'''
        + field("Currency", '<select class="in" id="currency"></select>')
        + field("PO or reference", '<input class="in" data-f="poNumber" placeholder="Optional">')
        + '''
                </div>''')

    items = '''
                <div class="items-head" aria-hidden="true"><span>Description</span><span>Qty</span><span>Rate</span><span>Amount</span><span></span></div>
                <div class="item-rows" id="itemRows"></div>
                <button type="button" class="add-line" id="addLine">''' + I(ICONS["plus"]) + ''' Add item</button>
                <p class="tip">Tip: press Enter in the last Rate box to add another line.</p>'''

    payment = (
        '''
                <div class="grid-2">'''
        + field("Tax name", '<input class="in" data-f="taxLabel" placeholder="VAT, GST or Tax">')
        + field("Tax rate (%)", '<input class="in" data-f="taxRate" inputmode="decimal" placeholder="0">')
        + '''
                  <div class="f"><span class="f-label" id="discLabel">Discount</span>
                    <span class="in-group"><input class="in" data-f="discount" inputmode="decimal" placeholder="0" aria-labelledby="discLabel">
                    <span class="seg" role="group" aria-label="Discount type"><button type="button" data-disc="%">%</button><button type="button" data-disc="flat">Fixed</button></span></span>
                  </div>'''
        + field("Shipping", '<input class="in" data-f="shipping" inputmode="decimal" placeholder="0">')
        + field("Amount already paid", '<input class="in" data-f="paid" inputmode="decimal" placeholder="0">', "Deposits or part payments.")
        + field("Status", '<select class="in" id="status"><option value="draft">Draft</option><option value="sent">Sent</option><option value="paid">Paid (adds a PAID stamp)</option></select>')
        + '''
                </div>
                <div class="sum-box" aria-live="polite">
                  <div><span>Subtotal</span><b id="tSub"></b></div>
                  <div><span>Discount</span><b id="tDisc"></b></div>
                  <div><span>Tax</span><b id="tTax"></b></div>
                  <div><span>Shipping</span><b id="tShip"></b></div>
                  <div class="sum-total"><span>Total</span><b id="tTotal"></b></div>
                  <div><span>Paid</span><b id="tPaid"></b></div>
                  <div class="sum-due"><span>Balance due</span><b id="tBal"></b></div>
                </div>''')

    notes = (
        '''
                <div class="chips" role="group" aria-label="Insert payment details">
                  <span class="chips-label">Insert</span>
                  <button type="button" class="chip" data-insert="bank">Bank transfer</button>
                  <button type="button" class="chip" data-insert="mobile">bKash / Nagad</button>
                  <button type="button" class="chip" data-insert="online">PayPal / Payoneer</button>
                </div>'''
        + field("Notes", '<textarea class="in" rows="4" data-f="notes" placeholder="Payment details or a thank-you note"></textarea>', "Your client sees this under the totals.")
        + field("Terms", '<textarea class="in" rows="2" data-f="terms"></textarea>'))

    steps = (step(1, "business", "Your business", "Who the invoice is from", business, True)
             + step(2, "client", "Client", "Who you're billing", client, True)
             + step(3, "details", "Invoice details", "Number, dates and currency", details)
             + step(4, "items", "Items", "Products or services you're charging for", items, True)
             + step(5, "payment", "Tax, discount and payment", "Totals and payment status", payment)
             + step(6, "notes", "Notes and terms", "Payment details for your client", notes))

    faq_html = "\n".join(f'          <details class="qa"><summary>{q}</summary><div class="qa-body"><p>{a}</p></div></details>' for q, a in FAQ)

    return f'''<section class="hero" aria-labelledby="hero-title">
  <div class="hero-bg" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span></div>
  <div class="wrap hero-inner">
    <a class="pill reveal" href="#features"><span class="pill-tag">New</span> Three invoice designs in six colours {I(ICONS["arrow"])}</a>
    <h1 id="hero-title" class="reveal">Create professional invoices in minutes, free</h1>
    <p class="hero-lede reveal">Fill in a few simple steps, watch your invoice build itself, then download the PDF or email it to your client. No sign-up, no watermark, 28 currencies.</p>
    <div class="hero-cta reveal">
      <a class="btn btn-primary btn-lg" href="#create">Create free invoice {I(ICONS["arrow"])}</a>
      <a class="btn btn-white btn-lg" href="/dashboard/?demo=1">See the dashboard</a>
    </div>
    <ul class="hero-checks reveal">
      <li>{I(ICONS["check"])} No sign-up needed</li>
      <li>{I(ICONS["check"])} No watermark</li>
      <li>{I(ICONS["check"])} PDF and email</li>
    </ul>

    <div class="mock reveal" id="heroMock" aria-hidden="true">
      <div class="mock-bar"><span></span><span></span><span></span><em>invoice-gen.net</em></div>
      <div class="mock-body">
        <div class="mock-form">
          <div class="mf-step done"><i>{I(ICONS["check"])}</i><b>Your business</b><small>Arshaon Studio</small></div>
          <div class="mf-step done"><i>{I(ICONS["check"])}</i><b>Client</b><small>Acme Ltd</small></div>
          <div class="mf-step open"><i>4</i><b>Items</b></div>
          <div class="mf-fields">
            <div class="mf-row"><span class="mf-in" data-mtype="Brand identity design"></span><span class="mf-in sm" data-mtype="900"></span></div>
            <div class="mf-row"><span class="mf-in" data-mtype="Landing page design"></span><span class="mf-in sm" data-mtype="250"></span></div>
            <div class="mf-row"><span class="mf-in" data-mtype="Social media kit"></span><span class="mf-in sm" data-mtype="100"></span></div>
          </div>
          <div class="mf-step"><i>5</i><b>Tax and payment</b></div>
          <div class="mf-btn" id="mockBtn">{I(ICONS["download"])} Download PDF</div>
        </div>
        <div class="mock-paper">
          <div class="mp-top"><span class="mp-logo">AS</span><div><b>Invoice</b><small>INV-0042</small></div></div>
          <div class="mp-parties"><div><small>From</small><b>Arshaon Studio</b><span>Dhaka, Bangladesh</span></div><div><small>Bill to</small><b>Acme Ltd</b><span>London, UK</span></div></div>
          <div class="mp-head"><span>Description</span><span>Amount</span></div>
          <div class="mp-row" data-mrow="0"><span>Brand identity design</span><span>$900.00</span></div>
          <div class="mp-row" data-mrow="1"><span>Landing page design</span><span>$250.00</span></div>
          <div class="mp-row" data-mrow="2"><span>Social media kit</span><span>$100.00</span></div>
          <div class="mp-total"><span>Balance due</span><b id="mockTotal">$1,250.00</b></div>
        </div>
      </div>
      <div class="float f-sent"><span class="f-ico">{I(ICONS["send"])}</span><span><b>Invoice sent</b><small>to accounts@acme.com</small></span></div>
      <div class="float f-paid"><span class="f-ico paid">{I(ICONS["check"])}</span><span><b>Marked as paid</b><small>$1,250.00 from Acme Ltd</small></span></div>
    </div>
  </div>
</section>

<section class="editor-sec" id="create" aria-labelledby="create-title">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="kicker">Invoice generator</span>
      <h2 id="create-title">Create your invoice</h2>
      <p class="lede">Fill in the steps and watch the invoice update as you type. The preview matches your PDF exactly.</p>
    </div>

    <div class="editor" id="editor" data-view="edit">
      <div class="ed-top">
        <div class="progress" aria-live="polite">
          <div class="progress-track"><span id="progBar"></span></div>
          <span class="progress-text" id="progText">0 of 3 required steps done</span>
        </div>
        <div class="ed-actions">
          <button class="icon-btn" id="newBtn" type="button" title="New invoice" aria-label="New invoice">{I(ICONS["plus"])}</button>
          <button class="icon-btn" id="saveBtn" type="button" title="Save to your account" aria-label="Save to your account">{I(ICONS["save"])}</button>
          <button class="icon-btn" id="printBtn" type="button" title="Print" aria-label="Print">{I(ICONS["print"])}</button>
          <button class="btn btn-white" id="sendBtn" type="button">{ICON_SEND} Send</button>
          <button class="btn btn-primary" id="downloadBtn" type="button">{ICON_DL} Download PDF</button>
        </div>
      </div>

      <div class="ed-tabs" role="tablist" aria-label="Editor view">
        <button type="button" role="tab" data-view="edit" aria-selected="true">{I(ICONS["pen"])} Edit</button>
        <button type="button" role="tab" data-view="preview" aria-selected="false">{I(ICONS["eye"])} Preview</button>
      </div>

      <div class="ed-body">
        <div class="ed-form" id="edForm">{steps}
          <p class="cloud-note" id="cloudNote">Your draft is saved in this browser as you type.</p>
        </div>

        <div class="ed-preview" id="edPreview">
          <div class="pv-bar">
            <div class="pv-group">
              <span class="pv-label" id="tplLabel">Design</span>
              <div class="seg seg-lg" id="tplPicker" role="group" aria-labelledby="tplLabel">
                <button type="button" class="tpl-btn" data-template="classic" aria-pressed="false">Classic</button>
                <button type="button" class="tpl-btn" data-template="modern" aria-pressed="false">Modern</button>
                <button type="button" class="tpl-btn" data-template="minimal" aria-pressed="false">Minimal</button>
              </div>
            </div>
            <div class="pv-group">
              <span class="pv-label" id="accentLabel">Colour</span>
              <div class="swatches" id="swatches" role="group" aria-labelledby="accentLabel"></div>
            </div>
          </div>
          <div class="pv-stage" id="pvStage">
            <div class="pv-page" id="pvPage" role="img" aria-label="Invoice preview"></div>
          </div>
          <p class="pv-caption">A4 preview. Your PDF matches this layout.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<div class="mobile-bar" role="region" aria-label="Invoice actions">
  <button class="btn btn-white" id="mSend" type="button">{ICON_SEND} Send</button>
  <button class="btn btn-primary" id="mDownload" type="button">{ICON_DL} Download PDF</button>
</div>

<dialog class="modal" id="sendModal" aria-labelledby="sendTitle">
  <div class="modal-body">
    <h2 id="sendTitle">Email this invoice</h2>
    <p class="form-msg err" id="sendErr" hidden></p>
    <p class="form-msg ok" id="sendLoginNote" hidden><a id="sendLoginLink" href="/login/?signup=1&amp;next=%2F%23create">Create a free account</a> to send from invoice-gen.net. Your invoice stays here while you sign up. Or use your own email app below.</p>
    <label class="f"><span class="f-label">Client's email</span><input class="in" id="sendTo" type="email" autocomplete="off" placeholder="client@company.com"></label>
    <label class="f"><span class="f-label">Subject</span><input class="in" id="sendSubject"></label>
    <label class="f"><span class="f-label">Message</span><textarea class="in" id="sendMsg" rows="6"></textarea></label>
    <label class="check-line"><input type="checkbox" id="sendCopy" checked> Send me a copy</label>
    <p class="hint">The invoice is attached as a PDF. When your client replies, it goes to your email.</p>
  </div>
  <div class="modal-foot">
    <button class="btn btn-white" id="sendCancel" type="button">Cancel</button>
    <button class="btn btn-white" id="sendMailApp" type="button">Use my email app</button>
    <button class="btn btn-primary" id="sendNow" type="button">{ICON_SEND} Send invoice</button>
  </div>
</dialog>

<section class="band" id="features" aria-labelledby="features-title">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="kicker">Features</span>
      <h2 id="features-title">Everything you need to bill clients</h2>
      <p class="lede">The tools paid invoicing apps charge for, free in your browser.</p>
    </div>
    <div class="bento">
      <article class="bt bt-wide reveal" id="designs">
        <div class="bt-copy"><span class="bt-ico">{I(ICONS["palette"])}</span><h3>Three designs, six colours</h3><p>Classic, Modern or Minimal. Switch any time and the PDF follows.</p>
          <div class="bt-links"><button type="button" class="link-btn" data-use-template="classic">Use Classic</button><button type="button" class="link-btn" data-use-template="modern">Use Modern</button><button type="button" class="link-btn" data-use-template="minimal">Use Minimal</button></div>
        </div>
        <div class="bt-art designs-art" aria-hidden="true">
          <span class="mini-doc t-classic"><i></i><i></i><i></i><i></i><b></b></span>
          <span class="mini-doc t-modern"><i></i><i></i><i></i><i></i><b></b></span>
          <span class="mini-doc t-minimal"><i></i><i></i><i></i><i></i><b></b></span>
        </div>
      </article>
      <article class="bt reveal">
        <span class="bt-ico">{I(ICONS["mail"])}</span><h3>Email it in one click</h3><p>Your client gets the PDF attached. Replies land in your inbox.</p>
        <div class="bt-art mail-art" aria-hidden="true"><span class="env"></span><span class="plane">{I(ICONS["send"])}</span></div>
      </article>
      <article class="bt reveal">
        <span class="bt-ico">{I(ICONS["globe"])}</span><h3>28 currencies</h3><p>Taka, Dollar, Euro, Pound, Rupee, Dirham and more, formatted correctly.</p>
        <div class="bt-art cur-art" aria-hidden="true"><span>৳</span><span>$</span><span>€</span><span>£</span><span>₹</span></div>
      </article>
      <article class="bt reveal">
        <span class="bt-ico">{I(ICONS["percent"])}</span><h3>Tax, discounts, deposits</h3><p>Name your tax, give a discount, record part payments. Totals update live.</p>
      </article>
      <article class="bt reveal">
        <span class="bt-ico">{I(ICONS["file"])}</span><h3>Clean A4 PDF</h3><p>Crisp and print-ready with your logo. No watermark, ever.</p>
      </article>
      <article class="bt reveal">
        <span class="bt-ico">{I(ICONS["lock"])}</span><h3>Private by default</h3><p>Without an account, your invoice never leaves your browser.</p>
      </article>
    </div>
  </div>
</section>

<section class="band band-alt" aria-labelledby="how">
  <div class="wrap">
    <div class="sec-head center reveal">
      <span class="kicker">How it works</span>
      <h2 id="how">From blank page to sent in three steps</h2>
    </div>
    <ol class="steps-row">
      <li class="reveal"><span class="sr-no">1</span><h3>Fill in the steps</h3><p>Your business, your client and what you're charging for, with a hint under every field.</p></li>
      <li class="reveal"><span class="sr-no">2</span><h3>Pick a design</h3><p>Choose Classic, Modern or Minimal and a colour. The live preview shows the result.</p></li>
      <li class="reveal"><span class="sr-no">3</span><h3>Download or send</h3><p>Save a PDF, print it, or email it to your client with the PDF attached.</p></li>
    </ol>
  </div>
</section>

<section class="band" aria-labelledby="dash-title">
  <div class="wrap teaser">
    <div class="teaser-copy reveal">
      <span class="kicker">Free account</span>
      <h2 id="dash-title">A dashboard that shows who owes you what</h2>
      <p class="lede">Sign up free and every invoice is saved. See what's paid, outstanding and overdue at a glance, and keep your clients in one place.</p>
      <ul class="ticks">
        <li>{I(ICONS["check"])} Paid, outstanding and overdue totals</li>
        <li>{I(ICONS["check"])} Monthly chart of invoiced and paid</li>
        <li>{I(ICONS["check"])} Saved clients and business details</li>
      </ul>
      <div class="teaser-cta">
        <a class="btn btn-primary" href="/login/?signup=1">Create free account</a>
        <a class="btn btn-white" href="/dashboard/?demo=1">See a sample dashboard</a>
      </div>
    </div>
    <div class="dash-mock reveal" aria-hidden="true">
      <div class="dm-side"><span class="dm-logo"></span><i class="on"></i><i></i><i></i><i></i></div>
      <div class="dm-main">
        <div class="dm-kpis"><div><small>Invoiced</small><b>$18,420</b></div><div><small>Paid</small><b class="g">$14,960</b></div><div><small>Outstanding</small><b class="a">$3,460</b></div></div>
        <div class="dm-chart"><span style="--h:42%"></span><span style="--h:58%"></span><span style="--h:36%"></span><span style="--h:70%"></span><span style="--h:62%"></span><span style="--h:88%"></span></div>
        <div class="dm-list"><div><i></i><span></span><em class="p">Paid</em></div><div><i></i><span></span><em class="s">Sent</em></div><div><i></i><span></span><em class="o">Overdue</em></div></div>
      </div>
    </div>
  </div>
</section>

<section class="band band-alt" aria-labelledby="faq">
  <div class="wrap faq-grid">
    <div class="reveal">
      <span class="kicker">FAQ</span>
      <h2 id="faq">Questions people ask</h2>
      <p class="lede">Anything else? Write to <a href="mailto:support@invoice-gen.net">support@invoice-gen.net</a>.</p>
    </div>
    <div class="faq reveal">
{faq_html}
    </div>
  </div>
</section>

<section class="band" aria-labelledby="guides">
  <div class="wrap">
    <div class="sec-head reveal"><span class="kicker">Guides</span><h2 id="guides">Learn to invoice like a pro</h2></div>
    <div class="guide-links">
      <a class="reveal" href="/how-to-make-an-invoice/"><strong>How to make an invoice</strong><span>What to include, with a checklist you can follow.</span><em>Read guide {I(ICONS["arrow"])}</em></a>
      <a class="reveal" href="/invoice-template/"><strong>Invoice templates</strong><span>Free templates you can fill in online.</span><em>Read guide {I(ICONS["arrow"])}</em></a>
      <a class="reveal" href="/freelance-invoice/"><strong>Freelance invoices</strong><span>Billing hourly or by project, and getting paid on time.</span><em>Read guide {I(ICONS["arrow"])}</em></a>
    </div>
  </div>
</section>

<section class="cta-band" aria-labelledby="final-title">
  <div class="wrap">
    <div class="cta-card reveal">
      <div class="cta-glow" aria-hidden="true"></div>
      <h2 id="final-title">Your next invoice is two minutes away</h2>
      <p>Free forever. No sign-up needed to start.</p>
      <div class="cta-actions">
        <a class="btn btn-primary btn-lg" href="#create">Create free invoice {I(ICONS["arrow"])}</a>
        <a class="btn btn-glass btn-lg" href="/login/?signup=1">Sign up free</a>
      </div>
    </div>
  </div>
</section>
'''
