/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    // Alias 'canvas' to false to prevent Webpack from bundling it
    config.resolve.alias.canvas = false;

    return config;
  },
};

export default nextConfig;
  