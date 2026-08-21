import { formatBdt } from "../shared/invoice";
import { getInvoiceDetail, updateInvoiceStatus } from "./db";

type EmailLocale = "en" | "bn";

function escapeHtml(value: string | null | undefined) {
  return (value ?? "").replace(/[&<>'"]/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" }[character] ?? character));
}

function localizedText(primary: string | null | undefined, bengali: string | null | undefined, locale: EmailLocale) {
  return escapeHtml(locale === "bn" ? bengali || primary : primary || bengali);
}

export function buildInvoiceEmailHtml(data: any, locale: EmailLocale) {
  const { invoice, customer, business, items } = data;
  const isBengali = locale === "bn";
  const company = localizedText(business?.name, business?.nameBn, locale) || "InvoiceFlow";
  const recipient = localizedText(customer.name, customer.nameBn, locale);
  const currency = (value: number) => formatBdt(value, isBengali ? "bn-BD" : "en-BD");
  const rows = items.map((item: any) => `<tr><td style="padding:10px 0;border-bottom:1px solid #e2e8f0">${localizedText(item.name, item.nameBn, locale)}</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right">${item.quantity}</td><td style="padding:10px 0;border-bottom:1px solid #e2e8f0;text-align:right">${currency(item.lineTotal)}</td></tr>`).join("");
  const labels = isBengali ? { hello: "প্রিয়", sent: "আপনার জন্য একটি ইনভয়েস সংযুক্ত করা হয়েছে।", invoice: "ইনভয়েস", amount: "সর্বমোট", due: "শেষ তারিখ", thanks: "ধন্যবাদ", item: "পণ্য", qty: "পরিমাণ", total: "মোট" } : { hello: "Hello", sent: "An invoice has been attached for your review.", invoice: "Invoice", amount: "Grand total", due: "Due date", thanks: "Thank you", item: "Item", qty: "Qty", total: "Total" };
  const dueDate = invoice.dueDate ? new Intl.DateTimeFormat(isBengali ? "bn-BD" : "en-BD", { day: "numeric", month: "long", year: "numeric" }).format(new Date(invoice.dueDate)) : "—";
  return `<!doctype html><html><body style="margin:0;background:#f4f8ff;font-family:Arial,'Hind Siliguri',sans-serif;color:#0f172a"><div style="max-width:620px;margin:32px auto;background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #dbeafe"><div style="padding:28px 32px;background:#1d4ed8;color:#ffffff"><div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;opacity:.85">InvoiceFlow</div><div style="margin-top:8px;font-size:24px;font-weight:700">${company}</div></div><div style="padding:32px"><p style="margin:0;font-size:16px">${labels.hello} ${recipient},</p><p style="margin:16px 0 24px;line-height:1.6;color:#475569">${labels.sent}</p><div style="padding:18px;border-radius:12px;background:#eff6ff"><div style="font-size:13px;color:#1d4ed8;font-weight:700;text-transform:uppercase">${labels.invoice}</div><div style="font-size:22px;font-weight:700;margin-top:4px">${escapeHtml(invoice.invoiceNumber)}</div><div style="margin-top:12px;font-size:14px;color:#475569">${labels.due}: ${dueDate}</div></div><table style="width:100%;border-collapse:collapse;margin-top:24px;font-size:14px"><thead><tr style="color:#64748b;text-align:left"><th style="padding-bottom:10px">${labels.item}</th><th style="padding-bottom:10px;text-align:right">${labels.qty}</th><th style="padding-bottom:10px;text-align:right">${labels.total}</th></tr></thead><tbody>${rows}</tbody></table><div style="margin-top:22px;padding-top:18px;border-top:1px solid #e2e8f0;text-align:right"><span style="font-size:14px;color:#475569">${labels.amount}</span><div style="font-size:22px;font-weight:700;margin-top:4px">${currency(invoice.totalAmount)}</div></div><p style="margin:26px 0 0;color:#64748b;font-size:14px">${labels.thanks},<br/>${company}</p></div></div></body></html>`;
}

export async function sendInvoiceEmail(userId: number, invoiceId: number, pdfBase64: string, locale: EmailLocale) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) throw new Error("Invoice email delivery has not been configured. Add a verified sender and API key in project settings.");
  const data = await getInvoiceDetail(userId, invoiceId);
  if (!data.customer.email) throw new Error("This customer does not have an email address.");
  const subject = locale === "bn" ? `ইনভয়েস ${data.invoice.invoiceNumber}` : `Invoice ${data.invoice.invoiceNumber}`;
  const response = await fetch("https://api.resend.com/emails", { method: "POST", headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" }, body: JSON.stringify({ from, to: [data.customer.email], subject, html: buildInvoiceEmailHtml(data, locale), attachments: [{ filename: `${data.invoice.invoiceNumber}.pdf`, content: pdfBase64 }] }) });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Invoice email could not be sent: ${detail || response.statusText}`);
  }
  if (data.invoice.status === "draft" || data.invoice.status === "overdue") await updateInvoiceStatus(userId, invoiceId, "sent");
  return { success: true } as const;
}
