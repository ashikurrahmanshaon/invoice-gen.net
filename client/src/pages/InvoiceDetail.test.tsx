/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";

const savePdf = vi.hoisted(() => vi.fn());
const sendMutation = vi.hoisted(() => ({ mutateAsync: vi.fn().mockResolvedValue({ success: true }), isPending: false }));
const updateMutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));

vi.mock("@/lib/invoicePdf", () => ({ createInvoicePdf: vi.fn().mockResolvedValue({ save: savePdf, output: vi.fn().mockReturnValue("data:application/pdf;base64,ZmFrZQ==") }) }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ invoices: { detail: { invalidate: vi.fn() }, list: { invalidate: vi.fn() } } }),
    invoices: {
      detail: { useQuery: () => ({ isLoading: false, isError: false, data: { invoice: { id: 1, invoiceNumber: "INV-001", customerId: 1, issueDate: new Date("2026-08-01"), dueDate: new Date("2026-08-15"), status: "draft", subtotal: 10000, taxRate: 10, taxAmount: 1000, discountAmount: 500, totalAmount: 10500, notes: null }, customer: { id: 1, name: "Ayesha Traders", nameBn: "আয়েশা ট্রেডার্স", address: null, addressBn: null, email: "ayesha@example.com", phone: null }, business: { name: "Northstar", nameBn: "নর্থস্টার", address: null, addressBn: null, email: null, phone: null }, items: [{ id: 1, name: "Consulting", nameBn: "পরামর্শ", description: null, descriptionBn: null, quantity: 1, unitPrice: 10000, lineTotal: 10000 }], history: [] } }) },
      updateStatus: { useMutation: () => updateMutation },
      sendEmail: { useMutation: () => sendMutation },
    },
  },
}));
vi.mock("wouter", () => ({ useLocation: () => ["/invoices/1", vi.fn()], useRoute: () => [true, { id: "1" }] }));

import InvoiceDetail from "./InvoiceDetail";

describe("InvoiceDetail", () => {
  afterEach(() => { savePdf.mockClear(); sendMutation.mutateAsync.mockClear(); });

  it("renders invoice totals and performs print, PDF, and email actions", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => undefined);
    render(<LocaleProvider><InvoiceDetail /></LocaleProvider>);

    expect(screen.getByText("BDT 105.00")).toBeInTheDocument();
    const printButton = screen.getByRole("button", { name: "Print / Save PDF" });
    printButton.focus();
    expect(printButton).toHaveFocus();
    fireEvent.change(screen.getByLabelText("Update payment status"), { target: { value: "paid" } });
    expect(updateMutation.mutate).toHaveBeenCalledWith({ id: 1, status: "paid" });
    fireEvent.click(printButton);
    expect(print).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "PDF" }));
    await waitFor(() => expect(savePdf).toHaveBeenCalledWith("INV-001.pdf"));
    fireEvent.click(screen.getByRole("button", { name: "Send via email" }));
    await waitFor(() => expect(sendMutation.mutateAsync).toHaveBeenCalledWith(expect.objectContaining({ id: 1, locale: "en", pdfBase64: "ZmFrZQ==" })));
    print.mockRestore();
  });
});
