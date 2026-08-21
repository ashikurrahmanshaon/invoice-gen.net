/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";

const createMutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const updateMutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const editorRoute = vi.hoisted(() => ({ active: false }));
const existingInvoice = {
  invoice: { id: 9, invoiceNumber: "INV-009", customerId: 1, issueDate: new Date("2026-08-01"), dueDate: null, taxRate: 0, discountAmount: 0, notes: null },
  items: [{ id: 1, productId: null, name: "Consulting", nameBn: "পরামর্শ", description: null, descriptionBn: null, quantity: 1, unitPrice: 10000 }],
};

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ invoices: { list: { invalidate: vi.fn() }, detail: { invalidate: vi.fn() } } }),
    customers: { list: { useQuery: () => ({ data: [{ id: 1, name: "Ayesha", nameBn: "আয়েশা" }] }) } },
    products: { list: { useQuery: () => ({ data: [] }) } },
    invoices: {
      nextNumber: { useQuery: () => ({ data: "INV-202608-001" }) },
      detail: { useQuery: () => ({ data: editorRoute.active ? existingInvoice : undefined, isLoading: false }) },
      create: { useMutation: () => createMutation },
      update: { useMutation: () => updateMutation },
    },
  },
}));
vi.mock("wouter", () => ({ useLocation: () => ["/invoices/new", vi.fn()], useRoute: () => editorRoute.active ? [true, { id: "9" }] : [false, null] }));

import NewInvoice from "./NewInvoice";

function renderForm() { return render(<LocaleProvider><NewInvoice /></LocaleProvider>); }

describe("NewInvoice", () => {
  afterEach(() => { cleanup(); createMutation.mutate.mockClear(); updateMutation.mutate.mockClear(); editorRoute.active = false; });

  it("creates an invoice from labeled keyboard-accessible form controls", async () => {
    renderForm();
    const customer = screen.getByLabelText(/Customer/);
    customer.focus();
    expect(customer).toHaveFocus();
    fireEvent.change(customer, { target: { value: "1" } });
    fireEvent.change(screen.getAllByLabelText(/^Name/)[0], { target: { value: "Consulting" } });
    fireEvent.change(screen.getByLabelText(/Unit price/), { target: { value: "100" } });
    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));
    await waitFor(() => expect(createMutation.mutate).toHaveBeenCalledWith(expect.objectContaining({ customerId: 1, invoiceNumber: "INV-202608-001", items: [expect.objectContaining({ name: "Consulting", quantity: 1, unitPrice: 10000 })] })));
  });

  it("preloads an existing invoice and routes changes to the update mutation", async () => {
    editorRoute.active = true;
    renderForm();
    await waitFor(() => expect(screen.getByDisplayValue("INV-009")).toBeInTheDocument());
    fireEvent.change(screen.getAllByLabelText(/^Name/)[0], { target: { value: "Updated consulting" } });
    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));
    await waitFor(() => expect(updateMutation.mutate).toHaveBeenCalledWith(expect.objectContaining({ id: 9, data: expect.objectContaining({ items: [expect.objectContaining({ name: "Updated consulting" })] }) })));
  });
});
