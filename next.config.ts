import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Bundle Size Optimization
  webpack: (config, { isServer, dev, buildId }) => {
    // Externalize heavy modules for server-side
    if (isServer) {
      config.externals.push({
        astrologer: "commonjs astrologer",
        sweph: "commonjs sweph",
        swisseph: "commonjs swisseph",
        "tz-lookup": "commonjs tz-lookup",
      });
    }

    // Bundle analyzer in production
    if (!dev && !isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        // Optimize icon imports - only import used icons
        "lucide-react": "lucide-react",
      };
    }

    // Performance optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: "all",
          cacheGroups: {
            // Vendor chunk for heavy dependencies
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: "vendors",
              chunks: "all",
              priority: 10,
            },
            // Separate chart calculation chunks
            astrologer: {
              test: /[\\/]node_modules[\\/](astrologer|sweph|swisseph|tz-lookup)[\\/]/,
              name: "astrologer-vendor",
              chunks: "all",
              priority: 20,
            },
            // React ecosystem chunks
            react: {
              test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
              name: "react-vendor",
              chunks: "all",
              priority: 15,
            },
          },
        },
        // Optimize module concatenation for production
        concatenateModules: true,
        // Minimize chunks
        minimize: true,
      };
    }

    return config;
  },

  // Compression and Caching
  compress: true,
  poweredByHeader: false,

  // PWA Configuration
  async rewrites() {
    return [
      {
        source: "/sw.js",
        destination: "/sw.js",
      },
      {
        source: "/manifest.json",
        destination: "/manifest.json",
      },
    ];
  },

  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Enable experimental features for performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ["lucide-react"],
  },

  // Header optimizations
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "origin-when-cross-origin",
          },
        ],
      },
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=300, s-maxage=600",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
