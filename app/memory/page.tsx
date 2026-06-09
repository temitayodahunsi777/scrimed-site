import Link from "next/link";
import { getAgentOSSummary } from "../lib/agentOS";

export default function MemoryPage() {
  const agentOS = getAgentOSSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/agents">AgentOS</Link>
        <p className="eyebrow">Memory Fabric</p>
        <h1>SCRIMED memory is scoped, auditable, and separated by session, operational, and knowledge layers.</h1>
        <p className="hero-text">{agentOS.boundary}</p>
      </section>

      <section className="section-band hub-summary" aria-label="Memory summary">
        <article>
          <span>Layers</span>
          <strong>{agentOS.memoryFabric.length}</strong>
        </article>
        <article>
          <span>RBAC roles</span>
          <strong>{agentOS.rbacPermissions.length}</strong>
        </article>
        <article>
          <span>Audit channels</span>
          <strong>{agentOS.auditChannels.length}</strong>
        </article>
        <article>
          <span>Status</span>
          <strong>foundation-online</strong>
        </article>
      </section>

      <section className="table-section" aria-label="SCRIMED memory layers">
        {agentOS.memoryFabric.map((layer) => (
          <article className="module-row" id={layer.kind} key={layer.kind}>
            <div>
              <span>{layer.kind}</span>
              <h2>{layer.name}</h2>
            </div>
            <p>{layer.purpose}</p>
            <div>
              <strong>{layer.accessPolicy}</strong>
              <ul className="compact-list">
                <li>{layer.retention}</li>
                <li>Prohibited: {layer.prohibitedData.join(", ")}</li>
                <li>Audit: {layer.auditEvents.join(", ")}</li>
              </ul>
            </div>
          </article>
        ))}
      </section>

      <section className="section-band" aria-label="RBAC permissions">
        <div className="section-heading">
          <p className="eyebrow">RBAC permissions</p>
          <h2>Least-privilege access is required before live healthcare use.</h2>
        </div>
        <div className="principle-grid">
          {agentOS.rbacPermissions.map((role) => (
            <article key={role.role}>
              <span>{role.role}</span>
              <h3>{role.scope}</h3>
              <p>Allowed: {role.allowed.join(", ")}</p>
              <ul className="compact-list">
                <li>Denied: {role.denied.join(", ")}</li>
              </ul>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
