import React from 'react';
import { readData } from '@/lib/store';
import ClientTerminal from '@/components/ClientTerminal';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getPortfolioData(): Promise<any> {
  return readData('portfolio', null);
}

export const revalidate = 0;
export const dynamic = 'force-dynamic';

export default async function Terminal() {
  const data = await getPortfolioData();
  const terminalCommands = data?.terminalCommands || [];

  return (
    <ClientTerminal initialCommands={terminalCommands} />
  );
}
