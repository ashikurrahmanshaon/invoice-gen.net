'use strict';

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { dbService, Invoice } from '@/services/db';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  TrendingUp,
  FileText,
  Clock,
  AlertCircle,
  Plus,
  Sparkles,
  UserPlus,
  ArrowRight,
  TrendingDown,
  Eye,
  Printer,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function DashboardOverview() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');

  useEffect(() => {
    setMounted(true);
    const loadDashboardData = async () => {
      if (!user) return;
      try {
        const data = await dbService.getInvoices(user.id);
        setInvoices(data);
      } catch (err) {
        console.error('Failed to load dashboard invoices:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [user]);

  // Calculations
  const filteredInvoices = statusFilter === 'all'
    ? invoices
    : invoices.filter((inv) => inv.status === statusFilter);

  const totalRevenue = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);

  const paidCount = invoices.filter((inv) => inv.status === 'paid').length;
  const pendingCount = invoices.filter((inv) => inv.status === 'pending').length;
  const overdueCount = invoices.filter((inv) => inv.status === 'overdue').length;

  const pendingAmount = invoices
    .filter((inv) => inv.status === 'pending')
    .reduce((sum, inv) => sum + inv.total, 0);

  const overdueAmount = invoices
    .filter((inv) => inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  // Chart Data: Invoices by status distribution
  const statusData = [
    { name: 'Paid', value: paidCount, color: '#10b981' },
    { name: 'Pending', value: pendingCount, color: '#f59e0b' },
    { name: 'Overdue', value: overdueCount, color: '#ef4444' },
  ].filter((item) => item.value > 0);

  // Chart Data: Monthly revenue estimation (grouped by issue date month)
  const getMonthlyRevenueData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTotals: { [key: string]: { billed: number; paid: number } } = {};
    
    // Initialize current year months
    const currentYear = new Date().getFullYear();
    for (let i = 0; i < 6; i++) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      monthlyTotals[mLabel] = { billed: 0, paid: 0 };
    }

    invoices.forEach((inv) => {
      const date = new Date(inv.issue_date);
      const mLabel = `${months[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (monthlyTotals[mLabel] !== undefined) {
        monthlyTotals[mLabel].billed += inv.total;
        if (inv.status === 'paid') {
          monthlyTotals[mLabel].paid += inv.total;
        }
      }
    });

    return Object.keys(monthlyTotals)
      .map((key) => ({
        month: key,
        Billed: monthlyTotals[key].billed,
        Paid: monthlyTotals[key].paid,
      }))
      .reverse();
  };

  const monthlyChartData = getMonthlyRevenueData();
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoices[0]?.currency || 'USD',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-secondary animate-pulse rounded-lg" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-80 bg-secondary animate-pulse rounded-lg" />
          <div className="h-80 bg-secondary animate-pulse rounded-lg" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track metrics and manage client invoices for {user?.user_metadata?.company_name || 'your company'}.
          </p>
        </div>

        {/* Quick actions row */}
        <div className="flex flex-wrap gap-3">
          <Link href="/invoices/new">
            <Button size="sm">
              <Plus size={16} className="mr-2" /> New Invoice
            </Button>
          </Link>
          <Link href="/ai-assistant">
            <Button size="sm" variant="outline" className="border-primary/20 hover:border-primary/40 text-primary">
              <Sparkles size={16} className="mr-2 text-primary" /> AI Assistant
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI metric grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* KPI 1 */}
        <Card 
          onClick={() => setStatusFilter('all')}
          title="Click to show all invoices"
          className={`cursor-pointer transition-all duration-200 shadow-sm relative overflow-hidden group hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
            statusFilter === 'all' ? 'ring-2 ring-primary border-primary bg-primary/[0.01]' : 'hover:border-primary/30'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Total Revenue</span>
            <TrendingUp size={16} className="text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center">
              <span className="text-success font-medium inline-flex items-center mr-1">
                +12.5%
              </span>
              from last 30 days
            </p>
          </CardContent>
        </Card>

        {/* KPI 2 */}
        <Card 
          onClick={() => setStatusFilter(statusFilter === 'paid' ? 'all' : 'paid')}
          title="Click to filter table by Paid invoices"
          className={`cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
            statusFilter === 'paid' ? 'ring-2 ring-success border-success bg-success/[0.02]' : 'hover:border-success/30'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Paid Invoices</span>
            <FileText size={16} className="text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{paidCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {invoices.length} total generated invoices
            </p>
          </CardContent>
        </Card>

        {/* KPI 3 */}
        <Card 
          onClick={() => setStatusFilter(statusFilter === 'pending' ? 'all' : 'pending')}
          title="Click to filter table by Pending invoices"
          className={`cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
            statusFilter === 'pending' ? 'ring-2 ring-warning border-warning bg-warning/[0.02]' : 'hover:border-warning/30'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Pending Invoices</span>
            <Clock size={16} className="text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Outstanding: <span className="font-semibold text-foreground">{formatCurrency(pendingAmount)}</span>
            </p>
          </CardContent>
        </Card>

        {/* KPI 4 */}
        <Card 
          onClick={() => setStatusFilter(statusFilter === 'overdue' ? 'all' : 'overdue')}
          title="Click to filter table by Overdue invoices"
          className={`cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.01] active:scale-[0.99] ${
            statusFilter === 'overdue' ? 'ring-2 ring-destructive border-destructive bg-destructive/[0.02]' : 'hover:border-destructive/30'
          }`}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overdue Invoices</span>
            <AlertCircle size={16} className="text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-extrabold">{overdueCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Unpaid overdue: <span className="font-semibold text-destructive">{formatCurrency(overdueAmount)}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts Grid */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">Billing History</CardTitle>
              <CardDescription>Billed versus Paid volume over the last 6 months.</CardDescription>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBilled" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tickLine={false} axisLine={false} style={{ fontSize: '11px', fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      borderColor: 'hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="Billed" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorBilled)" />
                  <Area type="monotone" dataKey="Paid" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorPaid)" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status Distribution */}
          <Card className="shadow-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base font-bold">Invoices Breakdown</CardTitle>
              <CardDescription>Share of invoices by current status.</CardDescription>
            </CardHeader>
            <CardContent className="h-60 flex items-center justify-center">
              {statusData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '11px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground italic">No invoice distribution data available.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Activity Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table (2/3 width) */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <span>Recent Invoices</span>
                {statusFilter !== 'all' && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border flex items-center gap-1.5 ${
                    statusFilter === 'paid'
                      ? 'bg-success/10 text-success border-success/20'
                      : statusFilter === 'pending'
                        ? 'bg-warning/10 text-warning border-warning/20'
                        : 'bg-destructive/10 text-destructive border-destructive/20'
                  }`}>
                    {statusFilter}
                    <button 
                      onClick={() => setStatusFilter('all')} 
                      className="hover:bg-black/10 dark:hover:bg-white/10 rounded-full p-0.5 cursor-pointer ml-0.5 font-extrabold line-height-none flex items-center justify-center h-3 w-3"
                      title="Clear filter"
                    >
                      &times;
                    </button>
                  </span>
                )}
              </CardTitle>
              <CardDescription>
                {statusFilter === 'all' 
                  ? 'Quick overview of your latest billing logs.' 
                  : `Showing latest ${statusFilter} invoices.`}
              </CardDescription>
            </div>
            <Link href="/invoices" className="text-xs text-primary font-semibold hover:underline flex items-center">
              View All <ArrowRight size={14} className="ml-1" />
            </Link>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground text-left text-xs uppercase tracking-wider">
                      <th className="pb-3 font-semibold">Number</th>
                      <th className="pb-3 font-semibold">Client</th>
                      <th className="pb-3 font-semibold">Issue Date</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredInvoices.slice(0, 5).map((inv) => (
                      <tr key={inv.id} className="hover:bg-secondary/25 transition-colors">
                        <td className="py-3.5 font-medium">
                          <Link href={`/invoices/${inv.id}`} className="text-primary hover:underline">
                            {inv.invoice_number}
                          </Link>
                        </td>
                        <td className="py-3.5 text-muted-foreground">{inv.client?.name || 'Unknown Client'}</td>
                        <td className="py-3.5 text-muted-foreground">{inv.issue_date}</td>
                        <td className="py-3.5 font-semibold">{formatCurrency(inv.total)}</td>
                        <td className="py-3.5">
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
                        <td className="py-3.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <Link href={`/invoices/${inv.id}`} title="View details">
                              <span className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer block">
                                <Eye size={14} />
                              </span>
                            </Link>
                            <Link href={`/invoices/${inv.id}?print=true`} title="Print / Download PDF">
                              <span className="p-1 rounded hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer block">
                                <Printer size={14} />
                              </span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-sm text-muted-foreground italic">
                {invoices.length > 0 
                  ? `No ${statusFilter} invoices found.` 
                  : 'No invoices found. Click "New Invoice" to create one.'}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Client Contacts Quick List */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-bold">Invoicing Quick Setup</CardTitle>
            <CardDescription>Speed up your invoicing process.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/invoices/new" className="flex items-center space-x-3 p-3.5 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors">
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Plus size={16} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold">Standard Invoicing</h4>
                <p className="text-[11px] text-muted-foreground">Select clients, write items, and export.</p>
              </div>
            </Link>

            <Link href="/ai-assistant" className="flex items-center space-x-3 p-3.5 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors">
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <Sparkles size={16} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold">AI Text-to-Invoice</h4>
                <p className="text-[11px] text-muted-foreground">Paste contract terms to auto-draft details.</p>
              </div>
            </Link>

            <Link href="/clients" className="flex items-center space-x-3 p-3.5 rounded-lg border border-border/60 hover:bg-secondary/40 transition-colors">
              <div className="h-9 w-9 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                <UserPlus size={16} />
              </div>
              <div className="flex-1 text-left">
                <h4 className="text-sm font-semibold">Client Directory</h4>
                <p className="text-[11px] text-muted-foreground">Add and edit companies in your contacts list.</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
