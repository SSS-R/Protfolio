import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import CreaTunePlayerProvider from '@/components/CreaTunePlayer';

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

export default async function MusicSiteLayout({ children }: { children: React.ReactNode }) {
  const data = await getCreaTuneData();

  return (
    <CreaTunePlayerProvider
      studio={data?.studio || 'CreaTune'}
      tagline={data?.tagline || 'Independent sound studio.'}
      links={data?.links || {}}
      initialTracks={data?.tracks || []}
      albums={data?.albums || []}
      news={data?.news || null}
      nextRelease={data?.nextRelease || null}
    >
      {children}
    </CreaTunePlayerProvider>
  );
}
