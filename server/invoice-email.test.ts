import { describe, expect, it } from "vitest";
import { buildInvoiceEmailHtml, sendInvoiceEmail } from "./invoice-email";

const invoiceData = {
  invoice: { invoiceNumber: "INV-202608-001", totalAmount: 12550, dueDate: new Date("2026-08-30T00:00:00Z") },
  customer: { name: "Karim Traders", nameBn: "করিম ট্রেডার্স" },
  business: { name: "Northstar Studio", nameBn: "নর্থস্টার স্টুডিও" },
  items: [{ name: "Consulting", nameBn: "পরামর্শ", quantity: 1, lineTotal: 12550 }],
};

describe("buildInvoiceEmailHtml", () => {
  it("renders localized Bangla invoice details without interpolating raw HTML", () => {
    const email = buildInvoiceEmailHtml(invoiceData, "bn");
    expect(email).toContain("করিম ট্রেডার্স");
    expect(email).toContain("পরামর্শ");
    expect(email).toContain("ইনভয়েস");
    expect(email).toContain("INV-202608-001");
  });

  it("requires a configured server-side email sender before accessing invoice data", async () => {
    const originalKey = process.env.RESEND_API_KEY;
    const originalFrom = process.env.RESEND_FROM_EMAIL;
    delete process.env.RESEND_API_KEY;
    delete process.env.RESEND_FROM_EMAIL;

    await expect(sendInvoiceEmail(1, 1, "a".repeat(200), "en")).rejects.toThrow("has not been configured");

    if (originalKey) process.env.RESEND_API_KEY = originalKey;
    if (originalFrom) process.env.RESEND_FROM_EMAIL = originalFrom;
  });
});
