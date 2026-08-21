export type InvoiceItemInput = {
  name: string;
  quantity: number;
  unitPrice: number;
};

export type InvoiceTotals = {
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
};

/**
 * All money values are stored as integer poisha (1 BDT = 100 poisha), preventing decimal rounding errors.
 * Tax rates are submitted as user-facing percentage values such as 15 for 15%.
 */
export function calculateInvoiceTotals(
  items: InvoiceItemInput[],
  taxRate: number,
  discountAmount: number,
): InvoiceTotals {
  const subtotal = items.reduce((sum, item) => sum + Math.round(item.quantity * item.unitPrice), 0);
  const normalizedTaxRate = Math.max(0, Math.min(100, taxRate));
  const taxAmount = Math.round((subtotal * normalizedTaxRate) / 100);
  const normalizedDiscount = Math.max(0, Math.min(subtotal + taxAmount, Math.round(discountAmount)));

  return {
    subtotal,
    taxAmount,
    discountAmount: normalizedDiscount,
    totalAmount: Math.max(0, subtotal + taxAmount - normalizedDiscount),
  };
}

export function formatBdt(amountInPoisha: number, locale = "en-BD") {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "BDT",
    minimumFractionDigits: 2,
  }).format(amountInPoisha / 100);
}

