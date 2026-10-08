# invoice-gen.net — step-by-step setup guide

Ei folder ta-i tomar puro website. Kono build lage na — sob file shorasori Hostinger e jabe.

**Ki ache site e**
- Invoice editor: bam pashe 6 ta step (Your business, Client, Details, Items, Tax, Notes), dan pashe live A4 preview, 3 ta design x 6 rong
- Dashboard: Overview (hisab, 6 masher chart, "Needs attention"), Invoices (filter, search, mark paid, duplicate, PDF), Clients, Settings
- Supabase connect korar age `/dashboard/` e sample data dekhay (`/dashboard/?demo=1` sobshomoy sample dekhay)
- Invoice generator (home page): invoice er upor shorasori type, logo, 28 currency, tax/discount/shipping, paid amount, 6 colour, Paid stamp
- PDF download, print
- Email e invoice pathano (PDF attach hoye jay, client reply korle tomar email e ashe)
- Login / signup (email+password, magic link, Google), dashboard (invoice list, status, search, duplicate, delete), saved clients
- SEO: title/description, Open Graph image, schema.org (WebApplication, FAQ, HowTo, Breadcrumb), sitemap.xml, robots.txt, 3 ta guide page, fast static HTML, HTTPS redirect, caching (.htaccess)

**File gulo**
```
index.html                  home = invoice generator
login/  dashboard/          account pages
invoice-template/  how-to-make-an-invoice/  freelance-invoice/   SEO guide pages
about/ contact/ privacy/ terms/ 404.html
assets/css/style.css        design
assets/js/config.js         <-- Supabase key ekhane boshabe
assets/js/*.js              app code
supabase/schema.sql         database (ekbar run korbe)
supabase/functions/send-invoice/index.ts   email pathanor function
.htaccess robots.txt sitemap.xml site.webmanifest
```

Supabase chara-o site chole (invoice banano + PDF). Login, save aar email er jonno nicher Step 2–4 korte hobe.

---

## Step 1 — GitHub e code rakho

1. https://github.com e account khulo (thakle login).
2. Upore **+ → New repository**. Name: `invoice-gen`. **Public** ba **Private** dutoi chole. "Add a README" tick **diyo na**. **Create repository**.
3. Windows e **GitHub Desktop** install koro: https://desktop.github.com → GitHub account diye login.
4. GitHub Desktop → **File → Add local repository** → ei `invoice-gen` folder ta select koro → "create a repository" bolle **Create repository** chapo.
5. Niche Summary te likho `First version` → **Commit to main** → upore **Publish repository** → tomar `invoice-gen` repo select kore publish.

Pore jokhon-i kono file change korbe: GitHub Desktop e **Commit → Push origin**. Hostinger nije update niye nebe (Step 5).

## Step 2 — Supabase (login + database)

1. https://supabase.com → **Start your project** → GitHub diye signup → **New project**. Name `invoice-gen`, region **Singapore** (Bangladesh er kache), ekta strong database password rekhe dao. Free plan.
2. Bam pashe **SQL Editor → New query** → `supabase/schema.sql` file er sob lekha copy-paste → **Run**. "Success" dekhabe.
3. **Project Settings → API** theke copy koro:
   - **Project URL**
   - **anon public** key
4. `assets/js/config.js` khule boshao:
   ```js
   SUPABASE_URL: "https://xxxx.supabase.co",
   SUPABASE_ANON_KEY: "eyJhbGci....",
   ```
   (anon key public website e rakha safe — database er RLS rule protiti user er data alada rakhe.)
5. **Authentication → URL Configuration**:
   - Site URL: `https://invoice-gen.net`
   - Redirect URLs e add: `https://invoice-gen.net/**`
6. (Optional) Google login: **Authentication → Providers → Google** on koro. Google Cloud Console e OAuth client banate hoy — Supabase er page e link + step deya thake. Na korle Google button e chap dile ekta message dekhabe, baki login thik chole.

## Step 3 — Resend (email pathano)

1. https://resend.com → signup (free: 3,000 email/month, 100/din).
2. **Domains → Add domain** → `invoice-gen.net`. Resend kichu DNS record (TXT, MX) dekhabe.
3. Hostinger hPanel → **Domains → invoice-gen.net → DNS / Nameservers → DNS records** → Resend er protiti record **Add record** kore boshao. 10–30 minute por Resend e **Verify** chapo → "Verified".
4. Resend → **API Keys → Create API key** → copy (`re_...` diye shuru).

## Step 4 — Email function Supabase e deploy

Shobcheye shohoj upay (browser theke, kichu install lage na):

1. Supabase → **Edge Functions → Deploy a new function → Via Editor**.
2. Function name: **`send-invoice`** (thik ei naam).
3. Editor er sob lekha muche `supabase/functions/send-invoice/index.ts` er lekha paste → **Deploy function**.
4. **Edge Functions → Secrets** (ba Project Settings → Edge Functions) e add koro:
   - `RESEND_API_KEY` = tomar `re_...` key
   - `FROM_EMAIL` = `invoices@invoice-gen.net`
   - `DAILY_LIMIT` = `20` (ekjon user din e koto email pathate parbe)

Ekhon site e login kore **Send by email** chaple client er kache PDF shoho email jabe.

## Step 5 — Hostinger e live koro (GitHub theke auto-deploy)

1. hPanel → **Websites → invoice-gen.net → Dashboard**.
2. Bam menu **Advanced → GIT**.
3. **Create a New Repository**:
   - Repository: `https://github.com/TOMAR-USERNAME/invoice-gen.git`
   - Branch: `main`
   - Directory: **khali rakho** (tahole `public_html` e deploy hobe)
   - `public_html` e aage kono file thakle (default index.php ityadi) **File Manager** theke age delete koro, noile deploy fail korbe.
4. **Create** → tarpor list e **Deploy** chapo.
5. Private repo hole: Hostinger ekta **SSH key** dekhabe → GitHub repo → **Settings → Deploy keys → Add deploy key** e paste.
6. Auto update: Hostinger GIT page e **Auto Deployment** er **Webhook URL** copy → GitHub repo → **Settings → Webhooks → Add webhook** → Payload URL e paste → **Add webhook**. Ekhon protibar Push korle site nije update hobe.
7. **Security → SSL** → free SSL **Install** (sadharonoto auto on thake). Tarpor `https://invoice-gen.net` khulo — site live!

> Jodi GIT option na pao (kichu plan e): hPanel → **File Manager → public_html** → sob file (`.htaccess` shoho) **Upload** koro. Kaj eki.

## Step 6 — Google e rank (SEO)

1. https://search.google.com/search-console → **Add property → Domain** → `invoice-gen.net` → je TXT record dibe ta Hostinger DNS e add → Verify.
2. **Sitemaps** → `sitemap.xml` likhe **Submit**.
3. **URL inspection** → `https://invoice-gen.net/` → **Request indexing**.
4. Bing Webmaster Tools e o same (Search Console theke import kora jay).
5. Rank barate: protimash 2–4 ta notun guide page (jemon "invoice vs receipt", "how to invoice in Bangladesh", "VAT invoice format", "Upwork/Fiverr client invoice") — `how-to-make-an-invoice/` folder copy kore lekha bodlao, `sitemap.xml` e URL add koro. Facebook group, Reddit, freelancer community te share koro — backlink ashbe.

> Shotti kotha: "free invoice generator" khub competitive keyword. Site technically SEO-ready, kintu rank ashe content + backlink + shomoy (3–6 mash) diye. Shuru te "invoice generator Bangladesh", "BDT invoice", "freelance invoice USD" er moto chhoto keyword target koro.

## Change kora

- **Support email**: `assets/js/config.js` aar `contact/`, `dashboard/` page e `support@invoice-gen.net` — Hostinger **Emails** e ei mailbox banao ba tomar email diye bodlao.
- **Privacy / Terms**: starting draft — nijer business er jonno ekbar check kore nio.
- **CSS/JS change korle**: page gulor `?v=1` ke `?v=2` koro jate user der browser notun file nay.
- **Bangla text**: website e Bangla type kora jay, kintu PDF er built-in font Bangla akkhor dekhate pare na (`?` ashe). Invoice er lekha English e rakho; dorkar hole Bangla font add kora jabe.

## Pore taka income (monetize)

- Google AdSense: site live + kichu content hole apply koro; guide page gulote ad bosano bhalo (generator page clean rakho).
- Pro plan (pore): unlimited email, recurring invoice, payment link, custom branding chhara "Made with invoice-gen" — Supabase + Stripe/bKash diye add kora jabe.

## Page gulo bodlano (developer der jonno)

HTML page gulo `tools/build_pages.py` aar `tools/home_section.py` theke toiri hoy. Lekha bodlate oi file e change koro, tarpor repo folder theke run koro:

```
python3 tools/build_pages.py .
```

`tools/` folder ta website e kauke dekhano hoy na (`.htaccess` block kore).
