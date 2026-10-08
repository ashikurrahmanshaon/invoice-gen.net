// invoice-gen.net — "send-invoice" Supabase Edge Function
// Emails an invoice PDF to a client through Resend (https://resend.com).
//
// Secrets to set in Supabase → Edge Functions → Secrets:
//   RESEND_API_KEY   your Resend API key (starts with re_)
//   FROM_EMAIL       a sender on your verified domain, e.g. invoices@invoice-gen.net
//   DAILY_LIMIT      optional, emails per user per 24 hours (default 20)
// SUPABASE_URL and SUPABASE_ANON_KEY are provided automatically.

import { createClient } from "jsr:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const EMAIL_RE = /^[^\s@<>"]+@[^\s@<>"]+\.[^\s@<>"]{2,}$/;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Use POST." }, 405);

  const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
  const FROM_EMAIL = Deno.env.get("FROM_EMAIL");
  const LIMIT = Number(Deno.env.get("DAILY_LIMIT") ?? "20");
  if (!RESEND_API_KEY || !FROM_EMAIL) return json({ error: "Email sending isn't set up yet (missing RESEND_API_KEY or FROM_EMAIL)." }, 500);

  // who is sending?
  const supa = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
  });
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return json({ error: "Log in to send invoices by email." }, 401);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  const to = String(body.to ?? "").trim();
  const subject = String(body.subject ?? "").trim().slice(0, 200) || "Invoice";
  const message = String(body.message ?? "").slice(0, 5000);
  const fromName = String(body.fromName ?? "").replace(/[<>"\r\n]/g, "").trim().slice(0, 80) || "invoice-gen.net";
  const replyToRaw = String(body.replyTo ?? "").trim();
  const replyTo = EMAIL_RE.test(replyToRaw) ? replyToRaw : user.email;
  const fileName = (String(body.fileName ?? "invoice.pdf").replace(/[^\w.\-]+/g, "-").slice(0, 90) || "invoice") .replace(/(\.pdf)?$/i, ".pdf");
  const pdfBase64 = String(body.pdfBase64 ?? "");
  const invoiceId = typeof body.invoiceId === "string" ? body.invoiceId : null;

  if (!EMAIL_RE.test(to)) return json({ error: "That client email address doesn't look right." }, 400);
  if (!pdfBase64 || pdfBase64.length > 6_000_000) return json({ error: "The invoice PDF is missing or too large (max about 4 MB). Try a smaller logo." }, 400);

  // daily limit
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error: countErr } = await supa.from("email_log").select("id", { count: "exact", head: true }).gte("sent_at", since);
  if (countErr) return json({ error: "Could not check your sending limit. Try again." }, 500);
  if ((count ?? 0) >= LIMIT) return json({ error: `You've sent ${LIMIT} invoices in the last 24 hours, which is the daily limit. Try again later.` }, 429);

  const html = `<!doctype html><html><body style="margin:0;background:#e6ebf1;font-family:Segoe UI,Arial,sans-serif;color:#16213a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:28px 12px">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:6px;border-top:5px solid #16213a">
  <tr><td style="padding:22px 30px 0;font:700 16px Segoe UI,Arial,sans-serif;color:#16213a">${esc(fromName)}</td></tr>
  <tr><td style="padding:14px 30px 8px;font-size:15px;line-height:1.6">${esc(message).replace(/\n/g, "<br>")}</td></tr>
  <tr><td style="padding:10px 30px 26px;font-size:13px;color:#566176">The invoice is attached as a PDF (${esc(fileName)}). Reply to this email to contact ${esc(fromName)}.</td></tr>
  </table>
  <p style="font-size:12px;color:#8a93a5;margin:16px 0 0">Sent with <a href="https://invoice-gen.net" style="color:#566176;text-decoration:none"><strong style="color:#16213a">invoice-gen</strong><strong style="color:#0e7c5a">.net</strong></a>, the free invoice generator</p>
  </td></tr></table></body></html>`;

  const payload: Record<string, unknown> = {
    from: `${fromName} via invoice-gen.net <${FROM_EMAIL}>`,
    to: [to],
    reply_to: replyTo,
    subject,
    html,
    text: `${message}\n\nThe invoice is attached as a PDF.\n\nSent with invoice-gen.net`,
    attachments: [{ filename: fileName, content: pdfBase64 }],
  };
  if (body.copyMe && user.email && user.email.toLowerCase() !== to.toLowerCase()) payload.bcc = [user.email];

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const detail = await res.text();
    console.error("Resend error", res.status, detail);
    return json({ error: "The email service refused the message. Check the address and try again." }, 502);
  }

  await supa.from("email_log").insert({ user_id: user.id, invoice_id: invoiceId, to_email: to });
  return json({ ok: true });
});
