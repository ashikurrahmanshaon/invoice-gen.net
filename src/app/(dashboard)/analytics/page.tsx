'use strict';

'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth';
import { dbService, Invoice, Payment, Profile } from '@/services/db';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  BarChart3,
  Users,
  DollarSign,
  Calendar,
  Wallet,
  ArrowUpRight,
  Crown,
  History,
  Clock,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from 'recharts';

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadAnalyticsData = async () => {
      if (!user) return;
      try {
        const prof = await dbService.getProfile(user.id);
        setProfile(prof);

        const invList = await dbService.getInvoices(user.id);
        setInvoices(invList);

        // Fetch payments for all invoices
        const allPayments: Payment[] = [];
        for (const inv of invList) {
          const paymentsForInv = await dbService.getPayments(inv.id);
          allPayments.push(...paymentsForInv);
        }
        
        // Sort payments by date descending
        allPayments.sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());
        setPayments(allPayments);
      } catch (err) {
        console.error('Failed to load analytics data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadAnalyticsData();
  }, [user]);

  // Math calculations
  const totalBilledVal = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const totalPaidVal = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((sum, inv) => sum + inv.total, 0);
  
  const totalOutstandingVal = invoices
    .filter((inv) => inv.status === 'pending' || inv.status === 'overdue')
    .reduce((sum, inv) => sum + inv.total, 0);

  const paymentRate = totalBilledVal > 0 ? (totalPaidVal / totalBilledVal) * 100 : 0;

  // Group invoices by client for contribution donut chart
  const clientContributions = useMemo(() => {
    const map: { [name: string]: number } = {};
    invoices.forEach((inv) => {
      if (inv.status === 'paid') {
        const name = inv.client?.name || 'Unknown Client';
        map[name] = (map[name] || 0) + inv.total;
      }
    });

    const colors = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#3b82f6', '#8b5cf6'];
    return Object.keys(map)
      .map((name, idx) => ({
        name,
        value: map[name],
        color: colors[idx % colors.length],
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // top 5
  }, [invoices]);

  // Group billing volume by month
  const monthlyVolumeData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const dataMap: { [label: string]: { Billed: number; Received: number } } = {};

    // Last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mLabel = `${months[d.getMonth()]} ${d.getFullYear().toString().substring(2)}`;
      dataMap[mLabel] = { Billed: 0, Received: 0 };
    }

    invoices.forEach((inv) => {
      const date = new Date(inv.issue_date);
      const mLabel = `${months[date.getMonth()]} ${date.getFullYear().toString().substring(2)}`;
      if (dataMap[mLabel]) {
        dataMap[mLabel].Billed += inv.total;
        if (inv.status === 'paid') {
          dataMap[mLabel].Received += inv.total;
        }
      }
    });

    return Object.keys(dataMap).map((key) => ({
      month: key,
      Billed: dataMap[key].Billed,
      Received: dataMap[key].Received,
    }));
  }, [invoices]);

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading || !profile) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-44 bg-secondary animate-pulse rounded" />
        <div className="h-96 bg-secondary animate-pulse rounded-lg" />
      </div>
    );
  }

  const isPremiumUser = profile.is_premium;

  return (
    <div className="space-y-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center">
            <BarChart3 className="mr-2 text-primary" /> Revenue Analytics
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Observe monthly collections, invoice cycles, and top customer breakdowns.
          </p>
        </div>
        
        {!isPremiumUser && (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20 animate-pulse">
            <Crown size={12} className="mr-1.5" /> PRO Feature Demo
          </span>
        )}
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Gross Billings</span>
            <DollarSign size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{formatCurrency(totalBilledVal, profile.currency)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Sum of all generated invoice totals</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collections</span>
            <TrendingUp size={16} className="text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-success">{formatCurrency(totalPaidVal, profile.currency)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Actual revenue registered as Paid</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Outstanding</span>
            <Clock size={16} className="text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold text-warning">{formatCurrency(totalOutstandingVal, profile.currency)}</div>
            <p className="text-[10px] text-muted-foreground mt-1">Pending and overdue balances</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Collection Rate</span>
            <BarChart3 size={16} className="text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-extrabold">{paymentRate.toFixed(1)}%</div>
            <p className="text-[10px] text-muted-foreground mt-1">Paid invoice ratio to billed amounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Recharts Displays */}
      {mounted && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Bar charts */}
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Monthly Billing Volume</CardTitle>
              <CardDescription>Billed invoicing values compared against collections received.</CardDescription>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                  <Bar dataKey="Billed" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Received" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Top client Contributions */}
          <Card className="shadow-sm flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Top Customer Shares</CardTitle>
              <CardDescription>Billed revenue share contributed by your top 5 clients.</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              {clientContributions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={clientContributions}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {clientContributions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val: any) => formatCurrency(Number(val || 0), profile.currency)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        borderColor: 'hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-muted-foreground italic">No paid transactions logged yet.</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payments Ledger table */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <div>
            <CardTitle className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center">
              <History size={16} className="mr-1.5" /> Payments Transaction Ledger
            </CardTitle>
            <CardDescription>A chronological ledger detailing every payment transaction completed.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground text-xs uppercase tracking-wider bg-secondary/15">
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold">Payment ID</th>
                    <th className="p-4 font-semibold">Method</th>
                    <th className="p-4 font-semibold">Reference Notes</th>
                    <th className="p-4 font-semibold text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-secondary/15 transition-colors">
                      <td className="p-4 text-muted-foreground">
                        {new Date(p.payment_date).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-mono text-xs">{p.id}</td>
                      <td className="p-4 font-semibold">{p.payment_method}</td>
                      <td className="p-4 text-muted-foreground italic">
                        {p.notes ? `"${p.notes}"` : 'No notes'}
                      </td>
                      <td className="p-4 text-right font-extrabold text-success">
                        +{formatCurrency(p.amount, profile.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-muted-foreground italic">
              No transactions logged yet. Payments recorded on invoices will appear here.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
