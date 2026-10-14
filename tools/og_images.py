"""Make a 1200x630 social share picture for each public page (Facebook, X, LinkedIn, WhatsApp...).
Run from the site folder with a local server on port 8767:  python3 -m http.server 8767 &  python3 tools/og_images.py
Pictures go to assets/og/<page>.png and build_pages.py uses them automatically."""
import asyncio, os
from playwright.async_api import async_playwright
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + "/"
mark = open(R + "assets/brand/mark.svg").read()

# path: (pill, headline, sub, word on the card, total, chip)
PAGES = {
    "/": ("No sign-up, no watermark", "Free invoice generator", "Create professional invoices in seconds. Download the PDF or email it to your client.", "Invoice", "$1,250.00", "Paid in full"),
    "/quote-generator/": ("Free quote maker", "Quote generator", "Send a clear price quote with a valid-until date. Download the PDF in one click.", "Quote", "$3,480.00", "Quote accepted"),
    "/receipt-generator/": ("Free receipt maker", "Receipt generator", "Make a payment receipt with a PAID stamp. Cash, card or bank transfer.", "Receipt", "$420.00", "Paid in full"),
    "/proforma-invoice/": ("Free proforma maker", "Proforma invoice", "Request payment in advance with a professional proforma invoice PDF.", "Proforma Invoice", "$5,900.00", "Ready to send"),
    "/estimate-maker/": ("Free estimate maker", "Job estimate maker", "Price a job before you start. Labour, materials and a clear total.", "Estimate", "$2,760.00", "Estimate sent"),
    "/timesheet-invoice/": ("Hours and shifts", "Timesheet invoice", "Add each shift with start, end and break. Hours and totals work out for you.", "Invoice", "$1,032.00", "38.5 hours"),
    "/invoice-tools/": ("All free tools", "Invoicing tools", "Invoice, quote, receipt, estimate and proforma, all free, with PDF download.", "Invoice", "$1,250.00", "PDF ready"),
    "/invoice-template/": ("Free template", "Invoice template", "Fill in online, pick a design and download a polished PDF invoice.", "Invoice", "$1,250.00", "PDF downloaded"),
    "/freelance-invoice/": ("For freelancers", "Freelance invoice", "Bill clients by the hour or project and get paid faster.", "Invoice", "$2,400.00", "Paid in full"),
    "/contractor-invoice/": ("For contractors", "Contractor invoice", "Labour and materials on one clear invoice. Free PDF download.", "Invoice", "$6,815.00", "Paid in full"),
    "/consulting-invoice/": ("For consultants", "Consulting invoice", "Hourly and retainer billing on a professional consulting invoice.", "Invoice", "$4,500.00", "Paid in full"),
    "/photography-invoice/": ("For photographers", "Photography invoice", "Bill shoots, editing and prints with a clean photography invoice.", "Invoice", "$1,850.00", "Deposit paid"),
    "/cleaning-invoice/": ("For cleaning services", "Cleaning invoice", "Bill hours and visits for homes and offices. Free PDF download.", "Invoice", "$360.00", "Paid in full"),
    "/self-employed-invoice/": ("For the self-employed", "Self-employed invoice", "Simple, professional invoices for sole traders. Free, no sign-up.", "Invoice", "$950.00", "Paid in full"),
    "/how-to-make-an-invoice/": ("Step-by-step guide", "How to make an invoice", "What to include, a checklist, and a free generator to do it in minutes.", "Invoice", "$1,250.00", "Checklist done"),
    "/invoice-vs-receipt/": ("Guide", "Invoice vs receipt", "The difference, and when to send each one to your customer.", "Receipt", "$1,250.00", "Paid in full"),
    "/payment-terms/": ("Guide", "Invoice payment terms", "Net 30, due on receipt and more, explained with examples.", "Invoice", "$1,250.00", "Due in 30 days"),
    "/payment-reminder/": ("Email templates", "Payment reminders", "Polite, firm and final reminder emails for unpaid invoices.", "Invoice", "$1,250.00", "Reminder sent"),
    "/guides/": ("Free guides", "Invoicing guides", "Templates, payment terms and reminders to help you get paid on time.", "Invoice", "$1,250.00", "Paid on time"),
    "/uk-invoice-template/": ("HMRC VAT rules", "UK invoice template", "VAT number, tax point and VAT at 20%, 5% or 0%. Pounds and A4.", "Invoice", "£1,500.00", "VAT 20% added"),
    "/gst-invoice/": ("Australia and NZ", "GST tax invoice", "ABN, GST at 10% and the words Tax Invoice, as the ATO requires.", "Tax Invoice", "A$1,375.00", "GST included"),
    "/canada-invoice-template/": ("GST and HST", "Canada invoice template", "Your GST/HST number, GST at 5% or HST for your province.", "Invoice", "C$1,312.50", "GST 5% added"),
    "/eu-vat-invoice/": ("EU VAT Directive", "EU VAT invoice", "Both VAT IDs, date of supply, VAT per rate and reverse charge.", "Invoice", "€1.487,50", "Reverse charge"),
    "/uae-vat-invoice/": ("FTA rules", "UAE VAT tax invoice", "Your TRN, the customer's TRN, VAT at 5% and amounts in AED.", "Tax Invoice", "AED 5,250.00", "VAT 5% added"),
    "/gst-invoice-india/": ("GST Rule 46", "GST invoice for India", "GSTIN, HSN/SAC, place of supply, CGST + SGST or IGST.", "Tax Invoice", "Rs. 11,800.00", "GST 18% added"),
    "/web-design-invoice/": ("For web designers", "Web design invoice", "Project stages, hours, hosting and care plans on one invoice.", "Invoice", "$3,600.00", "Deposit paid"),
    "/graphic-design-invoice/": ("For designers", "Graphic design invoice", "Concepts, revisions, final files and usage rights.", "Invoice", "$1,200.00", "Paid in full"),
    "/construction-invoice/": ("For builders", "Construction invoice", "Stages, labour, materials, variations and deposits.", "Invoice", "$18,450.00", "Stage 2 done"),
    "/landscaping-invoice/": ("For lawn care", "Landscaping invoice", "Visits, mowing, plants, mulch and green waste.", "Invoice", "$540.00", "Paid in full"),
    "/tutoring-invoice/": ("For tutors", "Tutoring invoice", "Lessons by the hour or in packages, for parents and schools.", "Invoice", "$360.00", "Paid in full"),
    "/handyman-invoice/": ("For handymen", "Handyman invoice", "Call-out fee, labour by the hour and parts, from your phone.", "Invoice", "$285.00", "Paid on the spot"),
    "/invoice-number/": ("Guide", "How to number invoices", "Formats that work, what tax offices expect, and fixing mistakes.", "Invoice", "INV-0042", "Next: INV-0043"),
    "/how-to-write-a-quote/": ("Guide", "How to write a quote", "What to include so clients say yes, with a free template.", "Quote", "$5,100.00", "Quote accepted"),
    "/deposit-invoice/": ("Guide", "Deposit invoices", "Ask for a deposit, then show it paid on the final invoice.", "Invoice", "$3,570.00", "Deposit 30% paid"),
}

def html(pill, h1, sub, word, total, chip):
    big = 80 if len(h1) <= 22 else 68
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:J;src:url(http://localhost:8767/assets/fonts/PlusJakartaSans-Variable.woff2) format("woff2");font-weight:200 800}}
*{{box-sizing:border-box}}body{{margin:0;width:1200px;height:630px;font-family:J;overflow:hidden;color:#0f172a;background:#ecfdf5}}
.l{{position:absolute;left:72px;top:68px;width:610px}}
.brand{{display:flex;align-items:center;gap:14px;font-weight:800;font-size:30px;letter-spacing:-.03em}}.brand svg{{width:58px;height:58px}}.brand em{{font-style:normal;color:#8d968f;font-weight:600}}
.pill{{display:inline-flex;gap:10px;align-items:center;margin-top:44px;background:#fff;border-radius:999px;padding:6px 18px 6px 6px;font-size:19px;font-weight:600;color:#475569;box-shadow:inset 0 0 0 1.5px #e6e8f2}}.pill b{{background:#e8f8ef;color:#0b8a52;border-radius:999px;padding:3px 12px}}
h1{{font-size:{big}px;line-height:1;letter-spacing:-.05em;font-weight:800;margin:20px 0 20px}}
p{{font-size:25px;color:#475569;margin:0;line-height:1.4;max-width:30ch}}
.inv{{position:absolute;right:70px;top:96px;width:400px;background:#fff;border-radius:22px;padding:30px 28px 34px;box-shadow:0 0 0 1px #e1e6e2,0 30px 60px -30px rgba(11,15,12,.35)}}
.inv h2{{margin:0;text-align:right;color:#047857;font-size:{34 if len(word) < 12 else 28}px;letter-spacing:-.04em;font-weight:800}}
.meta{{margin-top:12px;display:grid;gap:8px;justify-items:end}}.meta i{{display:block;height:8px;background:#eef0f6;border-radius:4px}}
.th{{margin-top:30px;height:32px;background:#047857;border-radius:8px}}
.row{{display:flex;justify-content:space-between;align-items:center;padding:14px 4px;border-bottom:1px solid #f0f1f7}}.row i{{display:block;height:8px;background:#eef0f6;border-radius:4px}}
.tot{{margin-top:22px;margin-left:auto;width:270px;display:flex;justify-content:space-between;align-items:center;background:#059669;color:#fff;border-radius:12px;padding:13px 16px;font-weight:700;font-size:17px;white-space:nowrap}}.tot b{{font-size:21px;letter-spacing:-.02em}}
.chip{{position:absolute;right:400px;top:330px;background:#fff;border-radius:14px;padding:12px 16px;font-size:17px;font-weight:700;box-shadow:0 14px 30px -14px rgba(11,15,12,.35),0 0 0 1px #e1e6e2;display:flex;gap:10px;align-items:center}}
.chip i{{width:32px;height:32px;border-radius:10px;display:grid;place-items:center;font-style:normal;font-size:18px;background:#e8f8ef;color:#0b8a52}}
.url{{position:absolute;right:70px;bottom:44px;font-size:20px;font-weight:700;color:#047857;letter-spacing:-.01em}}
</style></head><body>
<div class="l"><div class="brand">{mark}<div>invoice-gen<em>.net</em></div></div>
<div class="pill"><b>Free</b>{pill}</div><h1>{h1}</h1><p>{sub}</p></div>
<div class="inv"><h2>{word}</h2><div class="meta"><i style="width:150px"></i><i style="width:120px"></i><i style="width:135px"></i></div>
<div class="th"></div>
<div class="row"><i style="width:180px"></i><i style="width:60px"></i></div><div class="row"><i style="width:140px"></i><i style="width:60px"></i></div><div class="row"><i style="width:165px"></i><i style="width:60px"></i></div>
<div class="tot"><span>Total</span><b>{total}</b></div></div><div class="chip"><i>✓</i>{chip}</div>
<div class="url">invoice-gen.net</div>
</body></html>'''

def slug(path):
    return "home" if path == "/" else path.strip("/").replace("/", "-")

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(); pg = await b.new_page(viewport={"width": 1200, "height": 630})
        for path, args in PAGES.items():
            open(R + "og_tmp.html", "w").write(html(*args))
            await pg.goto("http://localhost:8767/og_tmp.html?p=" + slug(path), wait_until="load")
            await pg.evaluate("document.fonts.ready"); await pg.wait_for_timeout(150)
            await pg.screenshot(path=R + "assets/og/" + slug(path) + ".png")
            print("made", slug(path))
        await b.close()
    os.remove(R + "og_tmp.html")

if __name__ == "__main__":
    asyncio.run(main())
