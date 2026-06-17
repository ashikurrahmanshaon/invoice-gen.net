'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { dbService, Invoice } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  Plus,
  Search,
  FileText,
  Filter,
  Eye,
  Edit2,
  Trash2,
  AlertTriangle,
  ChevronDown,
  Download,
  Printer,
} from 'lucide-react';

export default function InvoicesListPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue' | 'draft'>('all');
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadInvoices = async () => {
    if (!user) return;
    try {
      const data = await dbService.getInvoices(user.id);
      setInvoices(data);
    } catch (err) {
      console.error('Failed to load invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, [user]);

  const handleDelete = async () => {
    if (!deleteInvoiceId) return;
    setIsDeleting(true);
    try {
      await dbService.deleteInvoice(deleteInvoiceId);
      setInvoices(invoices.filter((inv) => inv.id !== deleteInvoiceId));
      setDeleteInvoiceId(null);
    } catch (err) {
      console.error('Failed to delete invoice:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.invoice_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    if (filteredInvoices.length === 0) {
      alert('No invoices available to export.');
      return;
    }
    
    // CSV Header row
    const headers = [
      'Invoice Number',
      'Client Name',
      'Client Email',
      'Issue Date',
      'Due Date',
      'Subtotal',
      'Tax Rate (%)',
      'Tax Amount',
      'Discount Amount',
      'Total Amount',
      'Currency',
      'Status'
    ];

    // CSV Data rows
    const rows = filteredInvoices.map((inv) => [
      inv.invoice_number,
      inv.client?.name || 'Unknown Client',
      inv.client?.email || '',
      inv.issue_date,
      inv.due_date,
      inv.subtotal,
      inv.tax_rate,
      inv.tax_amount,
      inv.discount_amount,
      inv.total,
      inv.currency,
      inv.status
    ]);

    // Construct CSV content
    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((val) => {
        const strVal = String(val === null || val === undefined ? '' : val);
        if (strVal.includes(',') || strVal.includes('"') || strVal.includes('\n')) {
          return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(','))
    ].join('\n');

    // Create a blob and link to download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `invoices_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
          <div className="h-10 w-32 bg-secondary animate-pulse rounded" />
        </div>
        <div className="h-12 bg-secondary animate-pulse rounded" />
        <div className="h-80 bg-secondary animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Invoices</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage and track billing invoices sent to clients.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download size={16} className="mr-2" /> Export CSV
          </Button>
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus size={16} className="mr-2" /> Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      {/* Filter and Search controls */}
      <Card className="shadow-sm">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
            <input
              type="text"
              placeholder="Search by invoice number or client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          {/* Status filter tabs */}
          <div className="flex overflow-x-auto gap-1 p-1 bg-secondary/40 rounded-lg border border-border/40 no-scrollbar self-start md:self-auto">
            {(['all', 'paid', 'pending', 'overdue', 'draft'] as const).map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-card text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Invoice list table */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {filteredInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-xs uppercase tracking-wider bg-secondary/15">
                    <th className="p-4 font-semibold">Invoice ID</th>
                    <th className="p-4 font-semibold">Client</th>
                    <th className="p-4 font-semibold">Issue Date</th>
                    <th className="p-4 font-semibold">Due Date</th>
                    <th className="p-4 font-semibold">Amount</th>
                    <th className="p-4 font-semibold">Status</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="p-4 font-bold text-primary">
                        <Link href={`/invoices/${inv.id}`} className="hover:underline">
                          {inv.invoice_number}
                        </Link>
                      </td>
                      <td className="p-4 font-medium text-foreground">
                        {inv.client?.name || 'Unknown Client'}
                      </td>
                      <td className="p-4 text-muted-foreground">{inv.issue_date}</td>
                      <td className="p-4 text-muted-foreground">{inv.due_date}</td>
                      <td className="p-4 font-bold text-foreground">
                        {formatCurrency(inv.total, inv.currency)}
                      </td>
                      <td className="p-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium uppercase border ${
                            inv.status === 'paid'
                              ? 'bg-success/10 text-success border-success/20'
                              : inv.status === 'pending'
                                ? 'bg-warning/10 text-warning border-warning/20'
                                : inv.status === 'overdue'
                                  ? 'bg-destructive/10 text-destructive border-destructive/20'
                                  : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link href={`/invoices/${inv.id}`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0" title="View details">
                              <Eye size={14} />
                            </Button>
                          </Link>
                          <Link href={`/invoices/${inv.id}?print=true`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground" title="Print / Download PDF">
                              <Printer size={14} />
                            </Button>
                          </Link>
                          <Link href={`/invoices/${inv.id}/edit`}>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-foreground" title="Edit invoice">
                              <Edit2 size={14} />
                            </Button>
                          </Link>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                            onClick={() => setDeleteInvoiceId(inv.id)}
                            title="Delete invoice"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground space-y-3">
              <FileText size={48} className="mx-auto text-muted-foreground/40" />
              <p className="text-base font-medium">No invoices found</p>
              <p className="text-xs text-muted-foreground/80 max-w-sm mx-auto">
                No billing logs match your filter/query. Create a new invoice or adjust your filter selections.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteInvoiceId}
        onClose={() => setDeleteInvoiceId(null)}
        title="Confirm Invoice Deletion"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-3 text-destructive">
            <AlertTriangle size={24} />
            <span className="font-semibold text-sm">Warning: This action is irreversible</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Are you sure you want to delete this invoice? It will remove all invoice line items and transaction history permanently.
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setDeleteInvoiceId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDelete} isLoading={isDeleting}>
              Delete Permanent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
