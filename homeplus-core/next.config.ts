import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },

  // ─── Legacy static site redirects ───
  // Forwards old grade-7/science/ paths to the new database-backed course.
  // Static folder is preserved as fallback until Units B-E are manually verified.
  async redirects() {
    return [
      {
        source: '/grade-7/science',
        destination: '/student/courses/g7-science',
        permanent: false, // 302 — change to true once static folder is deleted
      },
      {
        source: '/grade-7/science/:path*',
        destination: '/student/courses/g7-science',
        permanent: false,
      },
      {
        source: '/grade-7',
        destination: '/student/courses',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
