/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";

const createMutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const updateMutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
const editorRoute = vi.hoisted(() => ({ active: false }));
const navigateMock = vi.hoisted(() => vi.fn());
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
vi.mock("wouter", () => ({ useLocation: () => ["/invoices/new", navigateMock], useRoute: () => editorRoute.active ? [true, { id: "9" }] : [false, null] }));

import NewInvoice from "./NewInvoice";

function renderForm() { return render(<LocaleProvider><NewInvoice /></LocaleProvider>); }

describe("NewInvoice", () => {
  afterEach(() => { cleanup(); createMutation.mutate.mockClear(); updateMutation.mutate.mockClear(); navigateMock.mockClear(); window.sessionStorage.clear(); editorRoute.active = false; });

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

  it("submits the saved-customer form through a direct form event", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByDisplayValue("INV-202608-001")).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/Customer/), { target: { value: "1" } });
    fireEvent.change(screen.getAllByLabelText(/^Name/)[0], { target: { value: "Keyboard consulting" } });
    fireEvent.change(screen.getByLabelText(/Unit price/), { target: { value: "100" } });
    fireEvent.submit(screen.getByTestId("generate-invoice").closest("form") as HTMLFormElement);
    await waitFor(() => expect(createMutation.mutate).toHaveBeenCalledWith(expect.objectContaining({ customerId: 1, items: [expect.objectContaining({ name: "Keyboard consulting" })] })));
  });

  it("submits the temporary-customer form through a direct form event", async () => {
    renderForm();
    await waitFor(() => expect(screen.getByDisplayValue("INV-202608-001")).toBeInTheDocument());
    fireEvent.click(screen.getByTestId("temporary-customer-mode"));
    fireEvent.change(screen.getByLabelText(/Temporary customer/), { target: { value: "Form-only customer" } });
    fireEvent.change(screen.getAllByLabelText(/^Name/)[1], { target: { value: "Form-only service" } });
    fireEvent.change(screen.getByLabelText(/Unit price/), { target: { value: "25" } });
    fireEvent.submit(screen.getByTestId("generate-invoice").closest("form") as HTMLFormElement);
    await waitFor(() => expect(window.sessionStorage.getItem("invoicegen-temporary-invoice")).not.toBeNull());
    expect(navigateMock).toHaveBeenCalledWith("/invoices/temporary");
  });

  it("preloads an existing invoice and routes changes to the update mutation", async () => {
    editorRoute.active = true;
    renderForm();
    await waitFor(() => expect(screen.getByDisplayValue("INV-009")).toBeInTheDocument());
    fireEvent.change(screen.getAllByLabelText(/^Name/)[0], { target: { value: "Updated consulting" } });
    fireEvent.click(screen.getByRole("button", { name: "Create invoice" }));
    await waitFor(() => expect(updateMutation.mutate).toHaveBeenCalledWith(expect.objectContaining({ id: 9, data: expect.objectContaining({ items: [expect.objectContaining({ name: "Updated consulting" })] }) })));
  });

  it("generates a temporary invoice without calling the saved-invoice mutation", async () => {
    const user = userEvent.setup();
    renderForm();
    await waitFor(() => expect(screen.getByDisplayValue("INV-202608-001")).toBeInTheDocument());
    await user.click(screen.getByTestId("temporary-customer-mode"));
    await user.clear(screen.getByLabelText(/Temporary customer/));
    await user.type(screen.getByLabelText(/Temporary customer/), "Walk-in customer");
    await user.clear(screen.getAllByLabelText(/^Name/)[1]);
    await user.type(screen.getAllByLabelText(/^Name/)[1], "One-time service");
    await user.clear(screen.getByLabelText(/Unit price/));
    await user.type(screen.getByLabelText(/Unit price/), "50");
    expect(screen.getAllByLabelText(/^Name/)[1]).toHaveValue("One-time service");
    expect(screen.getAllByLabelText(/^Name/)[2]).toHaveValue("");
    expect(screen.getByDisplayValue("50")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("generate-invoice"));
    await waitFor(() => expect(window.sessionStorage.getItem("invoicegen-temporary-invoice")).not.toBeNull());
    expect(JSON.parse(window.sessionStorage.getItem("invoicegen-temporary-invoice") || "{}")).toEqual(expect.objectContaining({ invoice: expect.objectContaining({ id: "temporary", currencyCode: "BDT" }), customer: expect.objectContaining({ id: "temporary", name: "Walk-in customer" }) }));
    expect(navigateMock).toHaveBeenCalledWith("/invoices/temporary");
    expect(createMutation.mutate).not.toHaveBeenCalled();
  });
});
