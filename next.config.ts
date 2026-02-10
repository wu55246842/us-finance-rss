import type { NextConfig } from "next";

if (process.env.NODE_ENV === 'development') {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
}

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.financea.me' }],
        destination: 'https://financea.me/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
// Trigger restart 01/23/2026 20:36:09
// Trigger restart 01/23/2026 21:14:14
