import React from 'react';
import type { Metadata } from 'next';
import fs from 'fs/promises';
import path from 'path';
import ClientCreaTune from '@/components/ClientCreaTune';

export const metadata: Metadata = {
  title: 'CreaTune — Sound Studio',
  description: 'CreaTune — independent sound studio. Listen to original tracks.',
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

async function getCreaTuneData() {
  try {
    const filePath = path.join(process.cwd(), 'src/data/creatune.json');
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(fileContent);
  } catch (error) {
    console.error('Failed to read CreaTune data:', error);
    return null;
  }
}

export default async function MusicPage() {
  const data = await getCreaTuneData();

  return (
    <ClientCreaTune
      studio={data?.studio || 'CreaTune'}
      tagline={data?.tagline || 'Independent sound studio.'}
      links={data?.links || {}}
      initialTracks={data?.tracks || []}
      albums={data?.albums || []}
    />
  );
}
