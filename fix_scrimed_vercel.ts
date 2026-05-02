import fs from "fs";
import path from "path";

// Ensure app directory exists
const appDir = path.join(process.cwd(), "app");
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir);
}

// ROOT PAGE (THIS FIXES YOUR 404)
fs.writeFileSync(
  path.join(appDir, "page.tsx"),
  `
export default function Home() {
  return (
    <main style={{padding: 40, fontFamily: "Arial"}}>
      <h1>SCRIMED OS Hub v1.7.1</h1>
      <p>Status: Operational</p>

      <ul>
        <li><a href="/api/status">/api/status</a></li>
        <li><a href="/api/readiness">/api/readiness</a></li>
        <li><a href="/api/events">/api/events</a></li>
      </ul>
    </main>
  );
}
`
);

// API ROUTES
const apiDir = path.join(appDir, "api");
if (!fs.existsSync(apiDir)) fs.mkdirSync(apiDir);

// STATUS
fs.mkdirSync(path.join(apiDir, "status"), { recursive: true });
fs.writeFileSync(
  path.join(apiDir, "status", "route.ts"),
  `
export async function GET() {
  return Response.json({ status: "online" });
}
`
);

// READINESS
fs.mkdirSync(path.join(apiDir, "readiness"), { recursive: true });
fs.writeFileSync(
  path.join(apiDir, "readiness", "route.ts"),
  `
export async function GET() {
  return Response.json({ readiness: 100 });
}
`
);

// EVENTS
fs.mkdirSync(path.join(apiDir, "events"), { recursive: true });
fs.writeFileSync(
  path.join(apiDir, "events", "route.ts"),
  `
export async function GET() {
  return Response.json({
    events: ["system_initialized", "vercel_deployed"]
  });
}
`
);

// package.json fix
fs.writeFileSync(
  "package.json",
  JSON.stringify(
    {
      name: "scrimed-site",
      private: true,
      scripts: {
        build: "next build",
        start: "next start",
        dev: "next dev"
      },
      dependencies: {
        next: "latest",
        react: "latest",
        "react-dom": "latest"
      }
    },
    null,
    2
  )
);

// next config
fs.writeFileSync(
  "next.config.js",
  `
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
};
module.exports = nextConfig;
`
);

console.log("SCRIMED FIX APPLIED");
