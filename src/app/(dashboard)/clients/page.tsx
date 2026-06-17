'use strict';

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/context/auth';
import { dbService, Client, Invoice } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import {
  Plus,
  Search,
  Users,
  Edit2,
  Trash2,
  FileText,
  DollarSign,
  History,
  TrendingUp,
  Clock,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';

export default function ClientsPage() {
  const { user } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selected client for history detail view
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);

  // Edit / Add Client Modal
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);
  
  // Delete Check
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);

  const loadData = async () => {
    if (!user) return;
    try {
      const clientData = await dbService.getClients(user.id);
      setClients(clientData);
      
      const invoiceData = await dbService.getInvoices(user.id);
      setInvoices(invoiceData);

      // Default select first client for history panel on desktop
      if (clientData.length > 0) {
        setSelectedClientId(clientData[0].id);
      }
    } catch (err) {
      console.error('Failed to load clients data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleOpenAddModal = () => {
    setEditingClient(null);
    setClientForm({ name: '', email: '', phone: '', address: '' });
    setIsClientModalOpen(true);
  };

  const handleOpenEditModal = (client: Client, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting for history panel
    setEditingClient(client);
    setClientForm({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    });
    setIsClientModalOpen(true);
  };

  const handleClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientForm.name || !user) return;
    setSubmitting(true);
    try {
      if (editingClient) {
        const updated = await dbService.updateClient(editingClient.id, clientForm);
        setClients(clients.map((c) => (c.id === editingClient.id ? updated : c)));
      } else {
        const added = await dbService.createClient({
          user_id: user.id,
          name: clientForm.name,
          email: clientForm.email,
          phone: clientForm.phone,
          address: clientForm.address,
        });
        setClients([...clients, added]);
        setSelectedClientId(added.id);
      }
      setIsClientModalOpen(false);
    } catch (err) {
      console.error('Failed to save client:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;
    try {
      await dbService.deleteClient(deleteClientId);
      setClients(clients.filter((c) => c.id !== deleteClientId));
      
      if (selectedClientId === deleteClientId) {
        const remaining = clients.filter((c) => c.id !== deleteClientId);
        setSelectedClientId(remaining.length > 0 ? remaining[0].id : null);
      }
      setDeleteClientId(null);
    } catch (err) {
      console.error('Delete Client Failed:', err);
    }
  };

  // Filter clients based on search
  const filteredClients = clients.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Client invoice metrics lookup
  const clientStats = useMemo(() => {
    const statsMap: {
      [clientId: string]: {
        totalBilled: number;
        totalPaid: number;
        totalPending: number;
        invoices: Invoice[];
      };
    } = {};

    clients.forEach((c) => {
      statsMap[c.id] = { totalBilled: 0, totalPaid: 0, totalPending: 0, invoices: [] };
    });

    invoices.forEach((inv) => {
      if (statsMap[inv.client_id]) {
        statsMap[inv.client_id].invoices.push(inv);
        statsMap[inv.client_id].totalBilled += inv.total;
        
        if (inv.status === 'paid') {
          statsMap[inv.client_id].totalPaid += inv.total;
        } else if (inv.status === 'pending' || inv.status === 'overdue') {
          statsMap[inv.client_id].totalPending += inv.total;
        }
      }
    });

    return statsMap;
  }, [clients, invoices]);

  const selectedClient = clients.find((c) => c.id === selectedClientId);
  const selectedStats = selectedClientId ? clientStats[selectedClientId] : null;

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 h-96 bg-secondary animate-pulse rounded-lg" />
          <div className="h-96 bg-secondary animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Title Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Clients</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage contact directories and view invoice payment histories.</p>
        </div>
        <Button size="sm" onClick={handleOpenAddModal}>
          <Plus size={16} className="mr-2" /> Add Client
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Client Directory List (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <div className="relative w-full">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground/60" />
                <input
                  type="text"
                  placeholder="Search clients by company name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-transparent pl-10 pr-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredClients.length > 0 ? (
                <div className="divide-y divide-border/40 max-h-[60vh] overflow-y-auto pr-1">
                  {filteredClients.map((client) => {
                    const stats = clientStats[client.id] || { totalBilled: 0, totalPending: 0 };
                    const isSelected = selectedClientId === client.id;
                    return (
                      <div
                        key={client.id}
                        onClick={() => setSelectedClientId(client.id)}
                        className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-primary/5 border-l-2 border-primary'
                            : 'hover:bg-secondary/25 border-l-2 border-transparent'
                        }`}
                      >
                        <div className="space-y-1 min-w-0">
                          <h4 className="font-bold text-sm text-foreground truncate">{client.name}</h4>
                          <p className="text-xs text-muted-foreground truncate">{client.email || 'No email saved'}</p>
                        </div>
                        
                        <div className="flex items-center space-x-6">
                          <div className="text-right hidden sm:block">
                            <p className="text-xs text-muted-foreground">Outstanding</p>
                            <p className={`text-xs font-semibold ${stats.totalPending > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                              {formatCurrency(stats.totalPending)}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0"
                              onClick={(e) => handleOpenEditModal(client, e)}
                              title="Edit Client"
                            >
                              <Edit2 size={13} />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteClientId(client.id);
                              }}
                              title="Delete Client"
                            >
                              <Trash2 size={13} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-sm text-muted-foreground space-y-3">
                  <Users size={36} className="mx-auto text-muted-foreground/40 animate-pulse" />
                  <p className="font-semibold">No clients registered</p>
                  <p className="text-xs max-w-xs mx-auto">Click "Add Client" to register your first corporate contact details.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Client History Panel (5 cols) */}
        <div className="lg:col-span-5">
          {selectedClient && selectedStats ? (
            <div className="space-y-6">
              {/* Stats card */}
              <Card className="shadow-sm border-primary/20">
                <CardHeader>
                  <CardTitle className="text-base font-bold flex items-center justify-between">
                    <span>Client Summary</span>
                    <History size={16} className="text-primary" />
                  </CardTitle>
                  <CardDescription className="font-bold text-sm text-foreground">{selectedClient.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Info details */}
                  <div className="text-xs space-y-2 border-b border-border/40 pb-4">
                    <p className="text-muted-foreground">Email: <span className="font-medium text-foreground">{selectedClient.email || 'N/A'}</span></p>
                    <p className="text-muted-foreground">Phone: <span className="font-medium text-foreground">{selectedClient.phone || 'N/A'}</span></p>
                    <p className="text-muted-foreground">Address: <span className="font-medium text-foreground leading-relaxed">{selectedClient.address || 'N/A'}</span></p>
                  </div>

                  {/* Financial metrics */}
                  <div className="grid grid-cols-3 gap-3 text-center pt-2">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Invoiced</p>
                      <p className="text-sm font-extrabold text-foreground">{formatCurrency(selectedStats.totalBilled)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Paid</p>
                      <p className="text-sm font-extrabold text-success">{formatCurrency(selectedStats.totalPaid)}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold">Outstanding</p>
                      <p className="text-sm font-extrabold text-warning">{formatCurrency(selectedStats.totalPending)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chronological Invoice Listing */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Billing History</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  {selectedStats.invoices.length > 0 ? (
                    <div className="divide-y divide-border/40 max-h-80 overflow-y-auto pr-1">
                      {selectedStats.invoices.map((inv) => (
                        <div key={inv.id} className="flex justify-between items-center p-3 text-xs hover:bg-secondary/15 transition-colors">
                          <div className="space-y-0.5">
                            <Link href={`/invoices/${inv.id}`} className="font-bold text-primary hover:underline">
                              {inv.invoice_number}
                            </Link>
                            <p className="text-[10px] text-muted-foreground">Due: {inv.due_date}</p>
                          </div>
                          <div className="text-right flex items-center space-x-3">
                            <span className="font-bold">{formatCurrency(inv.total, inv.currency)}</span>
                            <span
                              className={`inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                inv.status === 'paid'
                                  ? 'bg-success/15 text-success'
                                  : inv.status === 'pending'
                                    ? 'bg-warning/15 text-warning'
                                    : inv.status === 'overdue'
                                      ? 'bg-destructive/15 text-destructive'
                                      : 'bg-muted text-muted-foreground'
                              }`}
                            >
                              {inv.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-xs text-muted-foreground italic">
                      No invoices sent to this client yet.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="shadow-sm border-dashed">
              <CardContent className="p-8 text-center text-xs text-muted-foreground italic">
                Select a client contact from the directory to review outstanding balances and invoice logs.
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add / Edit Client Modal */}
      <Modal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        title={editingClient ? 'Edit Client Details' : 'Add New Client Contacts'}
        size="md"
      >
        <form onSubmit={handleClientSubmit} className="space-y-4">
          <Input
            label="Client / Company Name"
            required
            placeholder="Acme Corp"
            value={clientForm.name}
            onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
          />
          <Input
            label="Billing Email"
            type="email"
            placeholder="billing@acme.com"
            value={clientForm.email}
            onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
          />
          <Input
            label="Contact Phone"
            placeholder="+1 (555) 012-3456"
            value={clientForm.phone}
            onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
          />
          <Textarea
            label="Corporate / Billing Address"
            rows={3}
            placeholder="123 Industrial Way, Suite A, Boston, MA 02108"
            value={clientForm.address}
            onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
          />
          <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsClientModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" type="submit" isLoading={submitting}>
              {editingClient ? 'Update Details' : 'Register Client'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Client Confirmation Modal */}
      <Modal
        isOpen={!!deleteClientId}
        onClose={() => setDeleteClientId(null)}
        title="Confirm Client Removal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to remove this client contact from your directory? 
          </p>
          <p className="text-xs text-warning border border-warning/20 bg-warning/5 p-3.5 rounded-lg leading-relaxed font-semibold">
            Note: Deleting a client contact does not automatically delete invoices associated with them, but they will show as "Unknown Client".
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-border/40">
            <Button variant="outline" size="sm" onClick={() => setDeleteClientId(null)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteClient}>
              Remove Permanent
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
