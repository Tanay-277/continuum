/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.rawg.io',
        pathname: '/**',
      },
    ],
  },
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;
