/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Handle server-side modules
      config.resolve.alias = {
        ...config.resolve.alias,
        canvas: false,
      };
    }

    // Handle PDF.js worker files
    config.module.rules.push({
      test: /\.worker\.js$/,
      use: { loader: "worker-loader" },
    });

    return config;
  },
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
  },
};

module.exports = nextConfig;
