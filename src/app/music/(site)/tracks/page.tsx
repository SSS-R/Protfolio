import React from 'react';
import type { Metadata } from 'next';
import TracksView from '@/components/creatune/TracksView';

export const metadata: Metadata = {
  title: 'All Songs — CreaTune',
  description: 'The full CreaTune catalogue.',
};

export default function TracksPage() {
  return <TracksView />;
}
