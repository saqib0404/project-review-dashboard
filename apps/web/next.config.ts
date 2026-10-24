import type { NextConfig } from "next";

const apiOrigin = process.env.API_INTERNAL_URL ?? "http://localhost:5000";

const parsedApiOrigin = new URL(apiOrigin);

const isLocalhost =
  parsedApiOrigin.hostname === "localhost" ||
  parsedApiOrigin.hostname === "127.0.0.1" ||
  parsedApiOrigin.hostname === "::1" ||
  parsedApiOrigin.hostname === "[::1]";

if (
  !["http:", "https:"].includes(parsedApiOrigin.protocol) ||
  parsedApiOrigin.username ||
  parsedApiOrigin.password ||
  parsedApiOrigin.pathname !== "/" ||
  parsedApiOrigin.search ||
  parsedApiOrigin.hash
) {
  throw new Error("API_INTERNAL_URL must be a valid HTTP(S) origin.");
}

if (parsedApiOrigin.protocol !== "https:" && !isLocalhost) {
  throw new Error("Remote API_INTERNAL_URL must use HTTPS.");
}

if (
  process.env.VERCEL_ENV === "production" &&
  (isLocalhost || parsedApiOrigin.protocol !== "https:")
) {
  throw new Error(
    "Production deployment requires a remote HTTPS API_INTERNAL_URL.",
  );
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${parsedApiOrigin.origin}/api/v1/:path*`,
      },
    ];
  },
};

export default nextConfig;
