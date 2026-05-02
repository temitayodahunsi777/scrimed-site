
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
