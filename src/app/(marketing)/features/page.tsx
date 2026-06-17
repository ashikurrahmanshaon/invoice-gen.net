import React from 'react';
import { Metadata } from 'next';
import FeaturesClient from './features-client';

export const metadata: Metadata = {
  title: 'Features - Invoice-Gen.Net',
  description: 'Explore the features of Invoice-Gen.Net. Professional invoice creation, client tracking, payment logs, PDF exports, and AI-assisted invoice parsing.',
};

export default function FeaturesPage() {
  return <FeaturesClient />;
}
