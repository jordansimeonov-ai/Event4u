/** * PROJECT POLICY: 
 * - Root index files are PROXY BOOTSTRAPPERS. DO NOT EDIT.
 * - Source code resides ONLY in /src directory.
 * - Use Relative Paths only.
 */

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'starosel.com',
      },
      {
        protocol: 'https',
        hostname: 'grandhotelsofia.bg',
      },
      {
        protocol: 'https',
        hostname: 'www.hotelyastrebets.bg',
      }
    ],
  },
};

export default nextConfig;