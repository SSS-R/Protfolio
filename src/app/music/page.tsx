import React from 'react';
import fs from 'fs/promises';
import path from 'path';
import MusicPlayer from '@/components/MusicPlayer';

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

export default async function MusicPage() {
  const data = await getPortfolioData();
  const tracks = data?.tracks || [];

  return (
    <div className="p-4 md:p-12 relative min-h-screen pb-32">
      {/* Background watermark */}
      <div className="watermark">SYS_AUDIO</div>

      <div className="max-w-3xl mx-auto relative z-10">
        <MusicPlayer initialTracks={tracks} />
      </div>
    </div>
  );
}
