
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  // Statische Dateien für Uploads bereitstellen
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/uploads/:path*',
      },
    ];
  },
}

module.exports = nextConfig;