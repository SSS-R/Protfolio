import { ImageResponse } from 'next/og';

export const alt = 'Sultan Sajed Shahriar — full-stack systems, AI agent tooling, quantum cryptography research';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

// Share card: the site's ink / bone / signal system, set in type only.
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 64,
          background: '#0b0b0c',
          color: '#ece7df',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 22, letterSpacing: 4, color: '#8c877f' }}>
          <span>PORTFOLIO</span>
          <span>DHAKA, BANGLADESH</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 30, color: '#8c877f' }}>
            <div style={{ width: 14, height: 14, borderRadius: 999, background: '#ff5a1f' }} />
            Full-stack systems · AI agent tooling · Quantum cryptography
          </div>
          <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 0.9, letterSpacing: -5, marginTop: 28 }}>Sultan Sajed</div>
          <div style={{ fontSize: 132, fontWeight: 800, lineHeight: 0.9, letterSpacing: -5 }}>Shahriar</div>
        </div>
      </div>
    ),
    size,
  );
}
