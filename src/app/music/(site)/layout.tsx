import React from 'react';
import type { Metadata } from 'next';
import { readData } from '@/lib/store';
import CreaTunePlayerProvider from '@/components/CreaTunePlayer';

export const metadata: Metadata = {
  title: { template: '%s — CreaTune', default: 'CreaTune — Independent sound studio' },
  description: 'CreaTune — independent sound studio. Original tracks, engineered end to end.',
};

export const revalidate = 0;
export const dynamic = 'force-dynamic';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getCreaTuneData(): Promise<any> {
  return readData('creatune', null);
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
