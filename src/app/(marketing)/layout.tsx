import React from 'react';
import Navbar from '@/components/marketing/Navbar';
import Footer from '@/components/marketing/Footer';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="no-print">
        <Navbar />
      </div>
      <main className="flex-grow">{children}</main>
      <div className="no-print">
        <Footer />
      </div>
    </div>
  );
}
