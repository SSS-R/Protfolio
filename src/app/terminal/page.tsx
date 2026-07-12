import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import ClientTerminal from '@/components/ClientTerminal';

async function getPortfolioData() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/portfolio.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read portfolio data:', error);
    return null;
  }
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
