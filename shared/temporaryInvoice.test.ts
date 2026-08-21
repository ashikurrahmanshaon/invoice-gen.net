import { describe, expect, it } from "vitest";
import { buildTemporaryInvoiceData } from "./invoice";

describe("buildTemporaryInvoiceData", () => {
  it("creates preview-ready data without a persisted customer id", () => {
    const result = buildTemporaryInvoiceData({
      invoice: { invoiceNumber: "TEMP-001", currencyCode: "USD", subtotal: 2500, taxAmount: 250, totalAmount: 2750 },
      customer: { name: "Walk-in customer", email: "walkin@example.com" },
      items: [{ name: "Consulting", quantity: 2, unitPrice: 1250 }],
    });
    expect(result.invoice.id).toBe("temporary");
    expect(result.customer.id).toBe("temporary");
    expect(result.customer.name).toBe("Walk-in customer");
    expect(result.items[0]?.lineTotal).toBe(2500);
    expect(result.history).toEqual([]);
  });

  it("rejects a temporary invoice without a customer name", () => {
    expect(() => buildTemporaryInvoiceData({ invoice: { invoiceNumber: "TEMP-002", currencyCode: "BDT", subtotal: 0, taxAmount: 0, totalAmount: 0 }, customer: { name: "   " }, items: [] })).toThrow("temporary customer name");
  });
});
