'use client';

export default function PrintButton({ className = '' }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.print()} data-magnetic className={className}>
      Save as PDF
    </button>
  );
}
