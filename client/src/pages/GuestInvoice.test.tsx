// @vitest-environment jsdom
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";

const navigateMock = vi.hoisted(() => vi.fn());
vi.mock("wouter", () => ({ useLocation: () => ["/invoice-generator", navigateMock], Link: ({ children, ...props }: any) => <a {...props}>{children}</a> }));

import GuestInvoice from "./GuestInvoice";

describe("GuestInvoice", () => {
  beforeEach(() => { window.sessionStorage.clear(); navigateMock.mockClear(); });
  afterEach(() => { cleanup(); window.sessionStorage.clear(); });

  it("restores an in-progress draft from the browser session", async () => {
    window.sessionStorage.setItem("invoicegen-guest-draft", JSON.stringify({ business: { name: "Restored Studio", email: "", phone: "", address: "" }, customer: { name: "Restored customer", email: "", phone: "", address: "" }, invoiceNumber: "DRAFT-1", issueDate: "2026-08-22", dueDate: "", taxRate: "5", discount: "0", notes: "Saved draft", lines: [{ name: "Audit", description: "", quantity: "2", unitPrice: "100" }], currency: "USD" }));
    render(<LocaleProvider><GuestInvoice /></LocaleProvider>);
    await waitFor(() => expect(screen.getByLabelText(/Business name/)).toHaveValue("Restored Studio"));
    expect(screen.getByLabelText(/Customer name/)).toHaveValue("Restored customer");
    expect(screen.getByLabelText(/Unit price/)).toHaveValue(100);
  });

  it("creates a transient invoice without auth or a saved customer record", async () => {
    render(<LocaleProvider><GuestInvoice /></LocaleProvider>);
    fireEvent.change(screen.getByLabelText(/Business name/), { target: { value: "Acme Studio" } });
    fireEvent.change(screen.getByLabelText(/Customer name/), { target: { value: "Walk-in customer" } });
    fireEvent.change(screen.getByLabelText(/Item name/), { target: { value: "Design service" } });
    fireEvent.change(screen.getByLabelText(/Unit price/), { target: { value: "250" } });
    fireEvent.click(screen.getByRole("button", { name: "Create invoice preview" }));
    await waitFor(() => expect(navigateMock).toHaveBeenCalledWith("/invoice-generator/preview"));
    const stored = JSON.parse(window.sessionStorage.getItem("invoicegen-guest-invoice") || "null");
    expect(stored.business.name).toBe("Acme Studio");
    expect(stored.customer.name).toBe("Walk-in customer");
    expect(stored.invoice.totalAmount).toBe(25000);
  });
});
