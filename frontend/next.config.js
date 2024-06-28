const { createProxyMiddleware } = require("http-proxy-middleware");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://ec2-44-201-164-40.compute-1.amazonaws.com:2500/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
