'use strict';

import { createClient } from '@supabase/supabase-js';

// Interfaces
export interface Profile {
  id: string;
  company_name: string;
  company_email: string;
  company_phone: string;
  company_address: string;
  logo_url: string;
  currency: string;
  is_premium: boolean;
  brand_color?: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  created_at: string;
}

export interface InvoiceItem {
  id: string;
  invoice_id?: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  user_id: string;
  client_id: string;
  invoice_number: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue';
  issue_date: string;
  due_date: string;
  currency: string;
  tax_rate: number;
  tax_amount: number;
  discount_rate: number;
  discount_amount: number;
  subtotal: number;
  total: number;
  notes: string;
  created_at: string;
  items: InvoiceItem[];
  client?: Client;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  notes: string;
}

// Config Check
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = false;

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

// Mock Seed Data
const DEFAULT_PROFILE: Profile = {
  id: 'mock-user-123',
  company_name: 'invoice-gen.net Inc.',
  company_email: 'billing@invoice-gen.net',
  company_phone: '+1 (555) 123-4567',
  company_address: '100 Pine Street, San Francisco, CA 94111',
  logo_url: '',
  currency: 'USD',
  is_premium: false,
  brand_color: 'indigo',
};

const DEFAULT_CLIENTS: Client[] = [
  {
    id: 'client-1',
    user_id: 'mock-user-123',
    name: 'Google LLC',
    email: 'billing@google.com',
    phone: '+1 (650) 253-0000',
    address: '1600 Amphitheatre Pkwy, Mountain View, CA 94043',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-2',
    user_id: 'mock-user-123',
    name: 'Stripe Inc.',
    email: 'invoicing@stripe.com',
    phone: '+1 (415) 123-4567',
    address: '354 Oyster Point Blvd, South San Francisco, CA 94080',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'client-3',
    user_id: 'mock-user-123',
    name: 'Acme Corp',
    email: 'accounting@acme.com',
    phone: '+1 (800) 555-0199',
    address: '123 Industrial Way, Suite A, Boston, MA 02108',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 'inv-1',
    user_id: 'mock-user-123',
    client_id: 'client-1',
    invoice_number: 'INV-2026-0001',
    status: 'paid',
    issue_date: '2026-05-10',
    due_date: '2026-06-10',
    currency: 'USD',
    tax_rate: 8.25,
    tax_amount: 825,
    discount_rate: 0,
    discount_amount: 0,
    subtotal: 10000,
    total: 10825,
    notes: 'Thank you for your business! Payment was received via direct wire transfer.',
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item-1', description: 'Enterprise UI/UX Consulting Services (May 2026)', quantity: 80, unit_price: 125, amount: 10000 },
    ],
  },
  {
    id: 'inv-2',
    user_id: 'mock-user-123',
    client_id: 'client-2',
    invoice_number: 'INV-2026-0002',
    status: 'pending',
    issue_date: '2026-06-01',
    due_date: '2026-07-01',
    currency: 'USD',
    tax_rate: 5.0,
    tax_amount: 250,
    discount_rate: 10,
    discount_amount: 500,
    subtotal: 5000,
    total: 4750,
    notes: 'Please submit payment within 30 days. Contact accounts@invoice-gen.net for inquiries.',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item-2', description: 'Custom Dashboard Development', quantity: 1, unit_price: 3500, amount: 3500 },
      { id: 'item-3', description: 'API Integration Support', quantity: 10, unit_price: 150, amount: 1500 },
    ],
  },
  {
    id: 'inv-3',
    user_id: 'mock-user-123',
    client_id: 'client-3',
    invoice_number: 'INV-2026-0003',
    status: 'overdue',
    issue_date: '2026-05-01',
    due_date: '2026-06-01',
    currency: 'USD',
    tax_rate: 0,
    tax_amount: 0,
    discount_rate: 0,
    discount_amount: 0,
    subtotal: 2400,
    total: 2400,
    notes: 'LATE PAYMENT FEE APPLIES AFTER DUE DATE.',
    created_at: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item-4', description: 'Product Brand Design & Guideline Book', quantity: 1, unit_price: 2400, amount: 2400 },
    ],
  },
  {
    id: 'inv-4',
    user_id: 'mock-user-123',
    client_id: 'client-1',
    invoice_number: 'INV-2026-0004',
    status: 'draft',
    issue_date: '2026-06-15',
    due_date: '2026-07-15',
    currency: 'USD',
    tax_rate: 10,
    tax_amount: 150,
    discount_rate: 0,
    discount_amount: 0,
    subtotal: 1500,
    total: 1650,
    notes: 'Draft invoice for monthly maintenance contract.',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    items: [
      { id: 'item-5', description: 'Monthly System Maintenance & DevOps Monitoring', quantity: 1, unit_price: 1500, amount: 1500 },
    ],
  },
];

const DEFAULT_PAYMENTS: Payment[] = [
  {
    id: 'pay-1',
    invoice_id: 'inv-1',
    amount: 10825,
    payment_date: '2026-05-20T14:30:00Z',
    payment_method: 'Wire Transfer',
    notes: 'Full payment received.',
  },
];

// Helper to seed localStorage
const initializeLocalStorage = () => {
  if (typeof window === 'undefined') return;
  if (!localStorage.getItem('sip_profile')) {
    localStorage.setItem('sip_profile', JSON.stringify(DEFAULT_PROFILE));
  }
  if (!localStorage.getItem('sip_clients')) {
    localStorage.setItem('sip_clients', JSON.stringify(DEFAULT_CLIENTS));
  }
  if (!localStorage.getItem('sip_invoices')) {
    localStorage.setItem('sip_invoices', JSON.stringify(DEFAULT_INVOICES));
  }
  if (!localStorage.getItem('sip_payments')) {
    localStorage.setItem('sip_payments', JSON.stringify(DEFAULT_PAYMENTS));
  }
};

// Database Service Adapter
export const dbService = {
  // Profiles
  async getProfile(userId: string): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      if (error) throw error;
      return data;
    } else {
      initializeLocalStorage();
      const profile = localStorage.getItem('sip_profile');
      return profile ? JSON.parse(profile) : DEFAULT_PROFILE;
    }
  },

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<Profile> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      initializeLocalStorage();
      const current = localStorage.getItem('sip_profile');
      const profile: Profile = current ? JSON.parse(current) : DEFAULT_PROFILE;
      const updated = { ...profile, ...updates };
      localStorage.setItem('sip_profile', JSON.stringify(updated));
      return updated;
    }
  },

  // Clients
  async getClients(userId: string): Promise<Client[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', userId)
        .order('name');
      if (error) throw error;
      return data;
    } else {
      initializeLocalStorage();
      const clientsStr = localStorage.getItem('sip_clients');
      const clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
      return clients.filter((c) => c.user_id === userId || userId === 'mock-user-123');
    }
  },

  async createClient(client: Omit<Client, 'id' | 'created_at'>): Promise<Client> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .insert([client])
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      initializeLocalStorage();
      const newClient: Client = {
        ...client,
        id: `client-${Date.now()}`,
        created_at: new Date().toISOString(),
      };
      const clientsStr = localStorage.getItem('sip_clients');
      const clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
      clients.push(newClient);
      localStorage.setItem('sip_clients', JSON.stringify(clients));
      return newClient;
    }
  },

  async updateClient(clientId: string, updates: Partial<Client>): Promise<Client> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      initializeLocalStorage();
      const clientsStr = localStorage.getItem('sip_clients');
      let clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
      const index = clients.findIndex((c) => c.id === clientId);
      if (index === -1) throw new Error('Client not found');
      clients[index] = { ...clients[index], ...updates };
      localStorage.setItem('sip_clients', JSON.stringify(clients));
      return clients[index];
    }
  },

  async deleteClient(clientId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('clients').delete().eq('id', clientId);
      if (error) throw error;
      return true;
    } else {
      initializeLocalStorage();
      const clientsStr = localStorage.getItem('sip_clients');
      let clients: Client[] = clientsStr ? JSON.parse(clientsStr) : [];
      clients = clients.filter((c) => c.id !== clientId);
      localStorage.setItem('sip_clients', JSON.stringify(clients));
      return true;
    }
  },

  // Invoices
  async getInvoices(userId: string): Promise<Invoice[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*), client:clients(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      initializeLocalStorage();
      const invoicesStr = localStorage.getItem('sip_invoices');
      const invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
      const filtered = invoices.filter((inv) => inv.user_id === userId || userId === 'mock-user-123');

      // Populate client info
      const clients = await this.getClients(userId);
      return filtered.map((inv) => ({
        ...inv,
        client: clients.find((c) => c.id === inv.client_id),
      }));
    }
  },

  async getInvoiceById(invoiceId: string): Promise<Invoice | null> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*), client:clients(*)')
        .eq('id', invoiceId)
        .single();
      if (error) return null;
      return data;
    } else {
      initializeLocalStorage();
      const invoicesStr = localStorage.getItem('sip_invoices');
      const invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
      const invoice = invoices.find((inv) => inv.id === invoiceId);
      if (!invoice) return null;

      const clients = await this.getClients(invoice.user_id);
      return {
        ...invoice,
        client: clients.find((c) => c.id === invoice.client_id),
      };
    }
  },

  async createInvoice(invoice: Omit<Invoice, 'id' | 'created_at'>): Promise<Invoice> {
    if (isSupabaseConfigured && supabase) {
      const { items, ...invoiceData } = invoice;
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .insert([invoiceData])
        .select()
        .single();

      if (invError) throw invError;

      const itemsWithInvId = items.map((item) => ({
        ...item,
        invoice_id: invData.id,
      }));

      const { data: itemData, error: itemError } = await supabase
        .from('invoice_items')
        .insert(itemsWithInvId)
        .select();

      if (itemError) throw itemError;

      return {
        ...invData,
        items: itemData,
      };
    } else {
      initializeLocalStorage();
      const invoiceId = `inv-${Date.now()}`;
      const newInvoice: Invoice = {
        ...invoice,
        id: invoiceId,
        created_at: new Date().toISOString(),
        items: invoice.items.map((item, index) => ({
          ...item,
          id: `item-${Date.now()}-${index}`,
          invoice_id: invoiceId,
        })),
      };

      const invoicesStr = localStorage.getItem('sip_invoices');
      const invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
      invoices.push(newInvoice);
      localStorage.setItem('sip_invoices', JSON.stringify(invoices));
      
      const clients = await this.getClients(invoice.user_id);
      newInvoice.client = clients.find((c) => c.id === invoice.client_id);
      return newInvoice;
    }
  },

  async updateInvoice(invoiceId: string, updates: Partial<Invoice>): Promise<Invoice> {
    if (isSupabaseConfigured && supabase) {
      const { items, client, ...invoiceData } = updates;
      
      // Update basic fields
      const { data: invData, error: invError } = await supabase
        .from('invoices')
        .update(invoiceData)
        .eq('id', invoiceId)
        .select()
        .single();

      if (invError) throw invError;

      if (items) {
        // Simple update: delete old items and re-insert new ones
        const { error: delError } = await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);
          
        if (delError) throw delError;

        const itemsWithInvId = items.map((item) => {
          const { id, ...rest } = item;
          return {
            ...rest,
            invoice_id: invoiceId,
          };
        });

        const { data: itemData, error: itemError } = await supabase
          .from('invoice_items')
          .insert(itemsWithInvId)
          .select();

        if (itemError) throw itemError;
        invData.items = itemData;
      } else {
        // Fetch current items
        const { data: itemData } = await supabase
          .from('invoice_items')
          .select('*')
          .eq('invoice_id', invoiceId);
        invData.items = itemData || [];
      }

      return invData;
    } else {
      initializeLocalStorage();
      const invoicesStr = localStorage.getItem('sip_invoices');
      let invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
      const index = invoices.findIndex((inv) => inv.id === invoiceId);
      if (index === -1) throw new Error('Invoice not found');

      const currentInvoice = invoices[index];
      const items = updates.items 
        ? updates.items.map((item, idx) => ({
            ...item,
            id: item.id || `item-${Date.now()}-${idx}`,
            invoice_id: invoiceId,
          }))
        : currentInvoice.items;

      const { client: updateClient, ...updatesWithoutClient } = updates;

      invoices[index] = {
        ...currentInvoice,
        ...updatesWithoutClient,
        items,
        updated_at: new Date().toISOString(),
      } as Invoice;

      localStorage.setItem('sip_invoices', JSON.stringify(invoices));
      
      const clients = await this.getClients(invoices[index].user_id);
      invoices[index].client = clients.find((c) => c.id === invoices[index].client_id);
      return invoices[index];
    }
  },

  async deleteInvoice(invoiceId: string): Promise<boolean> {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('invoices').delete().eq('id', invoiceId);
      if (error) throw error;
      return true;
    } else {
      initializeLocalStorage();
      const invoicesStr = localStorage.getItem('sip_invoices');
      let invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
      invoices = invoices.filter((inv) => inv.id !== invoiceId);
      localStorage.setItem('sip_invoices', JSON.stringify(invoices));
      return true;
    }
  },

  // Payments
  async getPayments(invoiceId: string): Promise<Payment[]> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('invoice_id', invoiceId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      return data;
    } else {
      initializeLocalStorage();
      const paymentsStr = localStorage.getItem('sip_payments');
      const payments: Payment[] = paymentsStr ? JSON.parse(paymentsStr) : [];
      return payments.filter((p) => p.invoice_id === invoiceId);
    }
  },

  async recordPayment(payment: Omit<Payment, 'id' | 'payment_date'>): Promise<Payment> {
    if (isSupabaseConfigured && supabase) {
      const { data, error } = await supabase
        .from('payments')
        .insert([payment])
        .select()
        .single();
      if (error) throw error;

      // Update invoice status if fully paid
      // First get total paid
      const { data: pData } = await supabase
        .from('payments')
        .select('amount')
        .eq('invoice_id', payment.invoice_id);
      
      const totalPaid = (pData || []).reduce((sum, p) => sum + Number(p.amount), 0);

      // Get invoice total
      const { data: inv } = await supabase
        .from('invoices')
        .select('total')
        .eq('id', payment.invoice_id)
        .single();

      if (inv && totalPaid >= Number(inv.total)) {
        await supabase
          .from('invoices')
          .update({ status: 'paid' })
          .eq('id', payment.invoice_id);
      } else {
        await supabase
          .from('invoices')
          .update({ status: 'pending' })
          .eq('id', payment.invoice_id);
      }

      return data;
    } else {
      initializeLocalStorage();
      const newPayment: Payment = {
        ...payment,
        id: `pay-${Date.now()}`,
        payment_date: new Date().toISOString(),
      };
      
      const paymentsStr = localStorage.getItem('sip_payments');
      const payments: Payment[] = paymentsStr ? JSON.parse(paymentsStr) : [];
      payments.push(newPayment);
      localStorage.setItem('sip_payments', JSON.stringify(payments));

      // Update invoice status
      const allPayments = payments.filter((p) => p.invoice_id === payment.invoice_id);
      const totalPaid = allPayments.reduce((sum, p) => sum + p.amount, 0);

      const invoicesStr = localStorage.getItem('sip_invoices');
      let invoices: Invoice[] = invoicesStr ? JSON.parse(invoicesStr) : [];
      const index = invoices.findIndex((inv) => inv.id === payment.invoice_id);
      if (index !== -1) {
        const invoice = invoices[index];
        if (totalPaid >= invoice.total) {
          invoice.status = 'paid';
        } else {
          invoice.status = 'pending';
        }
        localStorage.setItem('sip_invoices', JSON.stringify(invoices));
      }

      return newPayment;
    }
  },

  // Auto Invoice Numbering generator
  async getNextInvoiceNumber(userId: string): Promise<string> {
    const invoices = await this.getInvoices(userId);
    if (invoices.length === 0) {
      return 'INV-2026-0001';
    }
    
    // Sort invoices to find the latest
    // Try to parse invoice numbers to extract numbers if format is typical
    const numbers = invoices
      .map((inv) => {
        const parts = inv.invoice_number.split('-');
        const lastPart = parts[parts.length - 1];
        const parsed = parseInt(lastPart, 10);
        return isNaN(parsed) ? 0 : parsed;
      })
      .filter((n) => n > 0);

    const maxNumber = numbers.length > 0 ? Math.max(...numbers) : invoices.length;
    const nextNumber = maxNumber + 1;
    const padded = String(nextNumber).padStart(4, '0');
    return `INV-2026-${padded}`;
  },
};
