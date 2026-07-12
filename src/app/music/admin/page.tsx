import React from 'react';
import type { Metadata } from 'next';
import ClientCreaTuneAdmin from '@/components/ClientCreaTuneAdmin';

export const metadata: Metadata = {
  title: 'CreaTune — Studio Admin',
  robots: { index: false, follow: false },
};

export default function CreaTuneAdminPage() {
  return <ClientCreaTuneAdmin />;
}
