// import { createProxyMiddleware } from "http-proxy-middleware";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["app.requestly.io", "i.scdn.co"],
  },
  // async rewrites() {
  //   return [
  //     {
  //       source: "/api/:path*",
  //       destination: "http://localhost:2500/:path*",
  //     },
  //   ];
  // },
};

export default nextConfig;
