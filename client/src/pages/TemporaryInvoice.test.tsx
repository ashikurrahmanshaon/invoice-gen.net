// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";

const navigateMock = vi.hoisted(() => vi.fn());
const pdfMock = vi.hoisted(() => ({ save: vi.fn(), output: vi.fn(() => "data:application/pdf;base64,abc") }));
const createPdfMock = vi.hoisted(() => vi.fn(async () => pdfMock));
vi.mock("wouter", () => ({ useLocation: () => ["/invoices/temporary", navigateMock] }));
vi.mock("@/lib/invoicePdf", () => ({ createInvoicePdf: createPdfMock }));

import TemporaryInvoice from "./TemporaryInvoice";

const temporaryData = { invoice: { invoiceNumber: "TEMP-001", currencyCode: "USD", issueDate: "2026-08-21", dueDate: null, status: "draft", subtotal: 2500, taxRate: 0, taxAmount: 0, discountAmount: 0, totalAmount: 2500, notes: null }, customer: { id: "temporary", name: "Walk-in customer", nameBn: null, email: "walkin@example.com", phone: null, address: null, addressBn: null }, business: null, history: [], items: [{ id: 1, name: "Consulting", nameBn: null, description: null, descriptionBn: null, quantity: 1, unitPrice: 2500, lineTotal: 2500 }] };

describe("TemporaryInvoice", () => {
  beforeEach(() => { window.sessionStorage.setItem("invoicegen-temporary-invoice", JSON.stringify(temporaryData)); pdfMock.save.mockClear(); pdfMock.output.mockClear(); createPdfMock.mockClear(); navigateMock.mockClear(); });
  afterEach(() => { cleanup(); window.sessionStorage.clear(); vi.restoreAllMocks(); });

  it("renders temporary customer preview and supports print and PDF actions", async () => {
    render(<LocaleProvider><TemporaryInvoice /></LocaleProvider>);
    await waitFor(() => expect(screen.getByText("TEMP-001")).toBeInTheDocument());
    expect(screen.getByText("Walk-in customer")).toBeInTheDocument();
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => undefined);
    fireEvent.click(screen.getByRole("button", { name: /Print/ }));
    expect(printSpy).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole("button", { name: "PDF" }));
    await waitFor(() => expect(createPdfMock).toHaveBeenCalledOnce());
    expect(pdfMock.save).toHaveBeenCalledWith("TEMP-001.pdf");
  });
});
