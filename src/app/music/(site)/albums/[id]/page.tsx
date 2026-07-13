import React from 'react';
import AlbumDetailView from '@/components/creatune/AlbumDetailView';

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AlbumDetailView albumId={id} />;
}
