import type { Locale } from "@/contexts/LocaleContext";

export type SortColumn = "invoiceNumber" | "customer" | "dueDate" | "amount" | "status";
export type SortDirection = "asc" | "desc";

export type InvoiceListRow = {
  invoice: { invoiceNumber: string; dueDate: Date | string | null; totalAmount: number; status: string };
  customer: { name: string; nameBn: string | null };
};

export function invoiceDisplayName(customer: InvoiceListRow["customer"], locale: Locale) {
  return locale === "bn" ? customer.nameBn || customer.name : customer.name;
}

export function sortInvoiceRows<T extends InvoiceListRow>(rows: T[], column: SortColumn, direction: SortDirection, locale: Locale) {
  return [...rows].sort((a, b) => {
    const aValue = column === "invoiceNumber" ? a.invoice.invoiceNumber : column === "customer" ? invoiceDisplayName(a.customer, locale) : column === "dueDate" ? new Date(a.invoice.dueDate || 0).getTime() : column === "amount" ? a.invoice.totalAmount : a.invoice.status;
    const bValue = column === "invoiceNumber" ? b.invoice.invoiceNumber : column === "customer" ? invoiceDisplayName(b.customer, locale) : column === "dueDate" ? new Date(b.invoice.dueDate || 0).getTime() : column === "amount" ? b.invoice.totalAmount : b.invoice.status;
    const comparison = typeof aValue === "number" && typeof bValue === "number" ? aValue - bValue : String(aValue).localeCompare(String(bValue));
    return direction === "asc" ? comparison : -comparison;
  });
}
