import Link from "next/link";

const modules = [
  "Command Center",
  "Guardian Layer",
  "Spec-to-Agent Engine",
  "ROI Engine",
  "TrustCore",
  "Clinical Ontology"
];

const apiCards = [
  "/api/health",
  "/api/scrimed-os/status",
  "/api/scrimed-os/readiness",
  "/api/scrimed-os/events"
];

function Dashboard() {
  return (
    <main style={{ maxWidth: 960, margin: "0 auto", padding: "48px 20px" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: 8 }}>SCRIMED OS Hub v1.7.1</h1>
      <p style={{ marginTop: 0, marginBottom: 6 }}><strong>Status:</strong> Ready</p>
      <p style={{ marginTop: 0, marginBottom: 24 }}><strong>Deployment:</strong> Vercel-safe</p>

      <section style={{ marginBottom: 24 }}>
        <h2>Modules</h2>
        <ul>
          {modules.map((module) => (
            <li key={module}>{module}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h2>API Status</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          {apiCards.map((route) => (
            <article key={route} style={{ border: "1px solid #334155", borderRadius: 8, padding: 12, background: "#111827" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{route}</p>
              <p style={{ marginBottom: 0 }}><Link href={route} style={{ color: "#38bdf8" }}>Check JSON</Link></p>
            </article>
          ))}
        </div>
      </section>

      <p>
        Dashboard alias: <Link href="/scrimed-os" style={{ color: "#38bdf8" }}>/scrimed-os</Link>
      </p>
    </main>
  );
}

export default function HomePage() {
  return <Dashboard />;
}

export { Dashboard };
