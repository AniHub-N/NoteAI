import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  /* config options here */
};

// Make Sentry optional during build to avoid 404s/Build failures if not configured
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
    silent: true,
    org: process.env.SENTRY_ORG || "notes-ai",
    project: process.env.SENTRY_PROJECT || "javascript-nextjs",
  })
  : nextConfig;
