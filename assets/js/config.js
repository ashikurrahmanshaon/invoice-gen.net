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
  SUPABASE_URL: "https://qmzwikvsmvdzirurzkxb.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFtendpa3ZzbXZkemlydXJ6a3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1MjUyNjksImV4cCI6MjEwNzEwMTI2OX0.cV3XHbPJFPUmJbkVaF2VeF-JFOWfpXU9hd_RF4BlFrA",
  SITE_URL: "https://invoice-gen.net",
  SITE_NAME: "invoice-gen.net",
  SUPPORT_EMAIL: "support@invoice-gen.net",
  DAILY_EMAIL_LIMIT: 20   // keep the same number as in the send-invoice function
};
