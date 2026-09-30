import React from 'react';
import type { Metadata } from 'next';
import LandingView from '@/components/creatune/LandingView';

export const metadata: Metadata = {
  title: { absolute: 'CreaTune — Independent sound studio' },
  description: 'CreaTune — independent sound studio. Listen to original tracks.',
};

export default function MusicLandingPage() {
  return <LandingView />;
}
