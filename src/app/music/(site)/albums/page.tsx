import React from 'react';
import type { Metadata } from 'next';
import AlbumsView from '@/components/creatune/AlbumsView';

export const metadata: Metadata = {
  title: 'Albums',
  description: 'CreaTune albums and releases.',
};

export default function AlbumsPage() {
  return <AlbumsView />;
}
