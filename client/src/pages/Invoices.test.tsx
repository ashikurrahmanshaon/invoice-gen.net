/** @vitest-environment jsdom */
import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LocaleProvider } from "@/contexts/LocaleContext";

const statusMutation = vi.hoisted(() => ({ mutate: vi.fn(), isPending: false }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ invoices: { list: { invalidate: vi.fn() } } }),
    invoices: {
      list: { useQuery: () => ({ isLoading: false, data: [
        { invoice: { id: 1, invoiceNumber: "INV-002", issueDate: new Date("2026-08-02"), dueDate: new Date("2026-08-20"), totalAmount: 15000, status: "paid", createdAt: new Date("2026-08-02") }, customer: { name: "Ayesha", nameBn: "আয়েশা" } },
        { invoice: { id: 2, invoiceNumber: "INV-001", issueDate: new Date("2026-08-01"), dueDate: new Date("2026-08-12"), totalAmount: 5000, status: "draft", createdAt: new Date("2026-08-01") }, customer: { name: "Bashir", nameBn: "বশির" } },
      ] }) },
      updateStatus: { useMutation: () => statusMutation },
    },
  },
}));
vi.mock("wouter", () => ({ useLocation: () => ["/invoices", vi.fn()] }));

import Invoices from "./Invoices";

describe("Invoices", () => {
  afterEach(() => statusMutation.mutate.mockClear());

  it("sorts rendered invoice rows when a sortable header is clicked", () => {
    render(<LocaleProvider><Invoices /></LocaleProvider>);
    const table = screen.getByRole("table");
    const firstRecord = within(table).getAllByRole("row")[1];
    expect(within(firstRecord).getByText("INV-002")).toBeInTheDocument();

    const numberHeader = screen.getByRole("button", { name: /Invoice no\./ });
    numberHeader.focus();
    expect(numberHeader).toHaveFocus();
    fireEvent.click(numberHeader);

    const sortedFirstRecord = within(table).getAllByRole("row")[1];
    expect(within(sortedFirstRecord).getByText("INV-001")).toBeInTheDocument();
  });
});
