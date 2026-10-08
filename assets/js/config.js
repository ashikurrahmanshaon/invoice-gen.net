/*
 * invoice-gen.net — settings
 * --------------------------------------------------------------
 * Paste your Supabase project URL and "anon public" key below.
 * Find them in Supabase → Project Settings → API.
 * The anon key is safe to put in a public website: Row Level
 * Security (see supabase/schema.sql) protects every user's data.
 *
 * Leave them empty and the free invoice builder still works
 * (download PDF, print, draft saved in the browser) — only
 * log in, saved invoices and email sending need Supabase.
 */
window.IG_CONFIG = {
  SUPABASE_URL: "",       // e.g. "https://abcdefghijk.supabase.co"
  SUPABASE_ANON_KEY: "",  // e.g. "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
  SITE_URL: "https://invoice-gen.net",
  SITE_NAME: "invoice-gen.net",
  SUPPORT_EMAIL: "support@invoice-gen.net",
  DAILY_EMAIL_LIMIT: 20   // keep the same number as in the send-invoice function
};
