const scriptPolicy =
  process.env.NODE_ENV === "development"
    ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'"
    : "script-src 'self' 'unsafe-inline'";

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "child-src 'none'",
  "form-action 'self'",
  "frame-src 'none'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  scriptPolicy,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "manifest-src 'self'",
  "media-src 'self' data:",
  "worker-src 'self' blob:",
  "connect-src 'self' https://*.vercel-insights.com https://*.vercel.com https://*.supabase.co wss://*.supabase.co",
  "upgrade-insecure-requests"
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "X-DNS-Prefetch-Control", value: "off" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Download-Options", value: "noopen" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(), usb=(), accelerometer=(), autoplay=(), bluetooth=(), browsing-topics=(), display-capture=(), encrypted-media=(), gyroscope=(), magnetometer=(), midi=(), publickey-credentials-get=(self), serial=(), xr-spatial-tracking=()"
  },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  { key: "Origin-Agent-Cluster", value: "?1" },
  { key: "X-SCRIMED-Cyber-Defense", value: "headers-proxy-safety-no-secrets" },
  { key: "X-SCRIMED-Security-Certification", value: "not-security-certified" },
  { key: "X-SCRIMED-PHI-Authority", value: "not-authorized-production-phi" },
  { key: "X-SCRIMED-Clinical-Care-Authority", value: "not-authorized-live-care" },
  { key: "X-SCRIMED-Production-Connector-Authority", value: "not-production-connector-approved" }
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};

module.exports = nextConfig;
