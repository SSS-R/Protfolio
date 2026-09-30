// The admin panel keeps the v2 terminal theme and its Material Symbols icons.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Material Symbols is an icon font next/font doesn't provide; it's only needed here. */}
      {/* eslint-disable-next-line @next/next/no-page-custom-font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        precedence="default"
      />
      <div className="min-h-screen bg-background font-body-md">{children}</div>
    </>
  );
}
