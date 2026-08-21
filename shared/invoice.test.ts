import { describe, expect, it } from "vitest";
import { calculateInvoiceTotals, formatBdt } from "./invoice";

describe("calculateInvoiceTotals", () => {
  it("calculates line subtotals, VAT, and a fixed discount in poisha", () => {
    expect(calculateInvoiceTotals([
      { name: "Design", quantity: 2, unitPrice: 12500 },
      { name: "Consulting", quantity: 1, unitPrice: 8000 },
    ], 10, 2000)).toEqual({
      subtotal: 33000,
      taxAmount: 3300,
      discountAmount: 2000,
      totalAmount: 34300,
    });
  });

  it("does not allow the total to fall below zero", () => {
    expect(calculateInvoiceTotals([{ name: "Service", quantity: 1, unitPrice: 1000 }], 0, 5000)).toEqual({
      subtotal: 1000,
      taxAmount: 0,
      discountAmount: 1000,
      totalAmount: 0,
    });
  });

  it("renders BDT values from integer poisha", () => {
    expect(formatBdt(12550, "en-BD")).toContain("125.50");
  });
});
