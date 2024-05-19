const { createProxyMiddleware } = require("http-proxy-middleware");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination:
          "http://ec2-44-204-194-140.compute-1.amazonaws.com:2500/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
