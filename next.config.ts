import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API routes and pages read these JSON files with fs at request time.
  // Next only traces files reached through imports, so on Vercel we must
  // explicitly include the data dir or the serverless functions ship without it.
  outputFileTracingIncludes: {
    "/**": ["./src/data/**"],
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
