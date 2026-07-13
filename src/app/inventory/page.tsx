import React from 'react';
import { readData } from '@/lib/store';
import ClientInventory from '@/components/ClientInventory';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPortfolioData(): Promise<any> {
  return readData('portfolio', null);
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Inventory() {
  const data = await getPortfolioData();
  const projects = data?.projects || [];

  return (
    <ClientInventory projects={projects} />
  );
}
