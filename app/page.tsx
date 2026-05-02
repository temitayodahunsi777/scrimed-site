export default function Home() {
  return (
    <main style={{ padding: 40, fontFamily: "Arial, sans-serif" }}>
      <h1>SCRIMED OS Hub v1.7.1</h1>
      <p>Status: Ready</p>
      <p>Deployment: Vercel-safe</p>

      <h2>Modules</h2>
      <ul>
        <li>Command Center</li>
        <li>Guardian Layer</li>
        <li>Spec-to-Agent Engine</li>
        <li>ROI Engine</li>
        <li>TrustCore</li>
        <li>Clinical Ontology</li>
      </ul>

      <h2>Routes</h2>
      <ul>
        <li>/scrimed-os</li>
        <li>/api/health</li>
        <li>/api/scrimed-os/status</li>
        <li>/api/scrimed-os/readiness</li>
        <li>/api/scrimed-os/events</li>
      </ul>
    </main>
  );
}
