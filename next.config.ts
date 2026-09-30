import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API routes and pages read these JSON files with fs at request time.
  // Next only traces files reached through imports, so on Vercel we must
  // explicitly include the data dir or the serverless functions ship without it.
  outputFileTracingIncludes: {
    "/**": ["./src/data/**"],
  },
  // v2 route names → v3 pages, so old links and bookmarks keep working.
  async redirects() {
    return [
      { source: '/architect', destination: '/about', permanent: true },
      { source: '/status', destination: '/about', permanent: true },
      { source: '/inventory', destination: '/work', permanent: true },
      { source: '/terminal', destination: '/contact', permanent: true },
    ];
  },
  // Cover art uploaded in production is served from Vercel Blob.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

export default nextConfig;
