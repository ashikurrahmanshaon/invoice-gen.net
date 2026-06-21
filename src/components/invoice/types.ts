export interface InvoiceItem {
  description: string;
  quantity: string | number;
  unit_price: string | number;
  amount: number;
}

export interface InvoiceData {
  logoUrl: string;
  invoiceNumber: string;
  companyDetails: string;
  clientDetails: string;
  issueDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes: string;
  taxRate: number;
  discountAmount: number;
  subtotal: number;
  taxAmount: number;
  total: number;
}
