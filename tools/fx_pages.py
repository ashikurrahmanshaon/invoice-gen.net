# Currency converter pages (imported by build_pages.py). Live rates are filled in by assets/js/fx.js.
NAMES = {"USD": "US Dollar", "EUR": "Euro", "GBP": "British Pound", "INR": "Indian Rupee", "BDT": "Bangladeshi Taka",
         "CAD": "Canadian Dollar", "AUD": "Australian Dollar", "AED": "UAE Dirham", "PKR": "Pakistani Rupee", "SAR": "Saudi Riyal"}
PAIRS = [("EUR", "USD"), ("USD", "EUR"), ("USD", "GBP"), ("GBP", "USD"), ("EUR", "GBP"), ("GBP", "EUR"),
         ("USD", "INR"), ("USD", "BDT"), ("USD", "CAD"), ("USD", "AUD"), ("USD", "AED"), ("GBP", "INR"),
         ("USD", "PKR"), ("EUR", "BDT"), ("GBP", "BDT"), ("SAR", "BDT"),
         ("BDT", "USD"), ("INR", "USD"), ("CAD", "USD"), ("AUD", "USD"), ("AED", "USD"), ("INR", "GBP"),
         ("PKR", "USD"), ("BDT", "EUR"), ("BDT", "GBP"), ("BDT", "SAR")]

def pair_path(a, b):
    return f"/{a.lower()}-to-{b.lower()}/"

def converter(a, b, amount="100"):
    return f'''<div class="fx-card" id="fx">
  <div class="fx-row">
    <label class="fx-f fx-amt"><span>Amount</span><input class="in" id="fxAmount" inputmode="decimal" value="{amount}" aria-label="Amount to convert"></label>
    <label class="fx-f"><span>From</span><select class="in" id="fxFrom" data-start="{a}" aria-label="Convert from"><option value="{a}">{a} — {NAMES.get(a, a)}</option></select></label>
    <button type="button" class="fx-swap" id="fxSwap" aria-label="Swap currencies" title="Swap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg></button>
    <label class="fx-f"><span>To</span><select class="in" id="fxTo" data-start="{b}" aria-label="Convert to"><option value="{b}">{b} — {NAMES.get(b, b)}</option></select></label>
  </div>
  <div class="fx-out" aria-live="polite">
    <p class="fx-result" id="fxResult"><span class="fx-in">Loading today's rate…</span><b>&nbsp;</b></p>
    <p class="fx-rate" id="fxRate">&nbsp;</p>
    <p class="fx-upd" id="fxUpdated">&nbsp;</p>
  </div>
  <div class="fx-foot">
    <a class="btn btn-primary" id="fxUse" href="/?new=1&amp;currency={b}#create"><span>Make an invoice in <span id="fxUseName">{b}</span></span></a>
    <small id="fxSource"></small>
  </div>
</div>'''

def tables():
    return '''<div class="fx-tables">
  <div class="fx-tbl"><h2 id="fxT1h">&nbsp;</h2><table><thead><tr><th>Amount</th><th>Converted</th></tr></thead><tbody id="fxTable1"></tbody></table></div>
  <div class="fx-tbl"><h2 id="fxT2h">&nbsp;</h2><table><thead><tr><th>Amount</th><th>Converted</th></tr></thead><tbody id="fxTable2"></tbody></table></div>
</div>'''

def chips(skip=None):
    return '<ul class="chips-links fx-pairs">' + "".join(
        f'<li><a href="{pair_path(a, b)}"><b>{a} to {b}</b></a></li>' for a, b in PAIRS if (a, b) != skip) + '<li><a href="/currency-converter/"><b>All currencies</b></a></li></ul>'

INVOICE_TIPS = '''<h2>Invoicing a client in another currency</h2>
<p>When you bill a client abroad, agree the currency before you start. Most clients prefer to pay in their own currency; you take the exchange risk. If you bill in your own currency, they take it.</p>
<ul>
<li><b>Pick the currency on the invoice.</b> The <a href="/">invoice generator</a> has 28 currencies and formats the amounts the way that country writes them.</li>
<li><b>Use today's rate when you quote.</b> Rates move every day. Say in your terms how long the price holds, for example "valid for 14 days".</li>
<li><b>Mention who pays bank fees.</b> International transfers can cost both sides. Wise, Payoneer or PayPal are often cheaper than a bank wire.</li>
<li><b>Keep records in your own currency too.</b> For tax, most countries want income recorded in the local currency at the rate on the day you were paid.</li>
</ul>'''

def faq_pairs(a, b):
    na, nb = NAMES.get(a, a), NAMES.get(b, b)
    return [
        (f"What is the {a} to {b} exchange rate today?", f"The converter at the top of this page shows today's {na} to {nb} rate. Rates are updated every day from a market data source and are mid-market rates, the midpoint between buying and selling prices."),
        ("Is this the rate my bank will give me?", "Not exactly. Banks and payment apps add a margin or a fee on top of the mid-market rate, so the amount you receive is usually a little lower. Check the final amount with your provider before you send money."),
        (f"How do I invoice in {nb}?", f"Open the free invoice generator, choose {b} in Currency, and add your items. The totals, tax and PDF are all shown in {nb}. The Make an invoice button on this page sets {b} for you."),
        ("How often do the rates change?", "Exchange rates move all the time while markets are open. This page uses daily reference rates, which are good for quotes, invoices and budgeting, not for trading."),
    ]

def faq_html(pairs):
    return "\n".join(f'<details class="qa"><summary>{q}</summary><div class="qa-body"><p>{x}</p></div></details>' for q, x in pairs)
