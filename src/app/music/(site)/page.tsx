import React from 'react';
import type { Metadata } from 'next';
import LandingView from '@/components/creatune/LandingView';

export const metadata: Metadata = {
  title: 'CreaTune — Sound Studio',
  description: 'CreaTune — independent sound studio. Listen to original tracks.',
};

export default function MusicLandingPage() {
  return <LandingView />;
}
