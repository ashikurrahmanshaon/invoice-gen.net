# Invoice-Gen.Net 

**Invoice-Gen.Net** is a multi-tenant B2B SaaS invoicing platform built specifically for freelancers, agencies, consultants, and small businesses. It replaces bulky accounting software with a highly-focused, streamlined utility to create invoices, manage clients, track payments, and export beautiful, vector-clean PDFs.

Built on **Next.js**, **Supabase** (PostgreSQL with Row-Level Security), and **Stripe** for payment processing.

## 🚀 Deployment (Hostinger / Node.js)

This project is configured for a standalone Node.js environment, perfect for deployment on platforms like Hostinger.

1. **Install dependencies:** `npm install`
2. **Build for production:** `npm run build`
3. **Start the server:** `npm run start`

The `next.config.ts` uses `output: "standalone"` to bundle the application efficiently for a custom Node.js server.

---

## 🗺️ Full Site Map & Architecture

### Global Elements
- **Navigation:** Features, Solutions, Product Tour, Security, Pricing, About, Contact, plus dynamic Log In / Go to Workspace buttons.
- **Footer:** Three routing columns (Product, Company, Legal & Help), security reassurances, and Stripe/Supabase trust markers.

### 1. Homepage (`/`)
The primary marketing landing page designed to drive subscriptions.
- **Dynamic Hero:** Highlights the core value proposition against bulky accounting software.
- **Trust Signals:** "Trusted by" logo wall, customer testimonials, and a transparent FAQ accordion.
- **Conversion Drivers:** A visual "How it Works" 3-step process and an embedded Pricing Preview to reduce click-friction.
- **Persona Targeting:** Specific value pitches for Freelancers, Agencies, Consultants, and Small Businesses.

### 2. Core Feature Pages
- **Features (`/features`):** Deep-dive into Invoice Creation, Client Management, Payment Tracking, Audit Logs, Vector-Clean PDFs, Dark Mode, Analytics, and the AI Invoice Assistant.
- **Solutions (`/solutions`):** The product reframed by audience. Maps specific pains (e.g., losing billable time) to specific Invoice-Gen.Net solutions (e.g., instant clean PDF export).
- **Product Tour (`/product-tour`):** An interactive 5-step walkthrough (Create Client, Draft Invoice, Send Invoice, Track Balance, Export PDF) demonstrating the UI.

### 3. Trust & Security
- **Security (`/security`):** Details our PostgreSQL Row-Level Security (RLS) isolation, AES-256 encryption, TLS 1.3, automated backups, and strict data ownership policies (GDPR/PCI-DSS aligned).
- **About (`/about`):** Outlines our core values: Reliability, Transparency, and Customer First.

### 4. Pricing & Support
- **Pricing (`/pricing`):** Four tiers (Free, Starter, Pro, Business) with monthly/annual toggles and a comprehensive feature comparison matrix.
- **Help Center (`/help-center`):** Searchable support hub with categories for getting started, creating invoices, and exporting formats.
- **Contact (`/contact`):** Direct support request form backed by a personal 24-hour SLA guarantee.

## 🛠 Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS v4, Lucide React (Icons).
- **Backend/Database:** Supabase (Auth, PostgreSQL, Row-Level Security).
- **Payments:** Stripe API integration.
- **Deployment:** Next.js Standalone output optimized for Node.js servers.
