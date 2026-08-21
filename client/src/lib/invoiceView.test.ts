import { describe, expect, it } from "vitest";
import { invoiceDisplayName, sortInvoiceRows } from "./invoiceView";

const rows = [
  { invoice: { invoiceNumber: "INV-002", dueDate: "2026-08-18", totalAmount: 7500, status: "paid" }, customer: { name: "Ayesha", nameBn: "আয়েশা" } },
  { invoice: { invoiceNumber: "INV-001", dueDate: "2026-08-12", totalAmount: 2500, status: "draft" }, customer: { name: "Bashir", nameBn: "বশির" } },
];

describe("invoice view helpers", () => {
  it("selects the Bangla customer name when Bengali is active", () => {
    expect(invoiceDisplayName(rows[0].customer, "bn")).toBe("আয়েশা");
    expect(invoiceDisplayName(rows[0].customer, "en")).toBe("Ayesha");
  });

  it("sorts invoice rows by amount and invoice number without mutating the source", () => {
    expect(sortInvoiceRows(rows, "amount", "asc", "en").map((row) => row.invoice.invoiceNumber)).toEqual(["INV-001", "INV-002"]);
    expect(sortInvoiceRows(rows, "invoiceNumber", "desc", "en").map((row) => row.invoice.invoiceNumber)).toEqual(["INV-002", "INV-001"]);
    expect(rows[0].invoice.invoiceNumber).toBe("INV-002");
  });
});
