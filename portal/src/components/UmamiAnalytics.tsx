import Script from "next/script";

/**
 * Self-hosted Umami analytics (https://analytics.lconsulting.se) — the
 * portfolio standard; never Google Analytics.
 *
 * Renders nothing unless NEXT_PUBLIC_UMAMI_WEBSITE_ID is set, so local dev and
 * a production build without an ID are silent rather than pointing at a
 * placeholder site. NEXT_PUBLIC_* values are inlined at build time: in
 * production they arrive as Docker build args from the server's .env (see
 * docker-compose.prod.yml), which means changing the ID requires a redeploy.
 */
const websiteId = process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
const scriptUrl =
  process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL ||
  "https://analytics.lconsulting.se/script.js";
const hostUrl =
  process.env.NEXT_PUBLIC_UMAMI_HOST_URL || "https://analytics.lconsulting.se";

export function UmamiAnalytics() {
  if (!websiteId) return null;

  return (
    <Script
      src={scriptUrl}
      data-website-id={websiteId}
      data-host-url={hostUrl}
      strategy="afterInteractive"
    />
  );
}
