import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import ClientInventory from '@/components/ClientInventory';

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

export default async function Inventory() {
  const data = await getPortfolioData();
  const projects = data?.projects || [];

  return (
    <ClientInventory projects={projects} />
  );
}
