import Link from "next/link";
import {
  getProtectedPilotWorkspaceSummary,
  protectedPilotApiContracts
} from "../lib/protectedPilotWorkspace";

export const metadata = {
  title: "SCRIMED Protected Pilot Workspace",
  description:
    "Review SCRIMED tenant-authenticated synthetic pilot workspaces, durable evidence sessions, append-only audit controls, and enterprise proof packets."
};

export default function ProtectedPilotWorkspacePage() {
  const summary = getProtectedPilotWorkspaceSummary();

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/product">Product Console</Link>
        <p className="eyebrow">Protected Pilot Workspace</p>
        <h1>Tenant-isolated pilot evidence, durable audit trails, and buyer-ready proof packets.</h1>
        <p className="hero-text">
          SCRIMED protected pilot workspaces turn governed synthetic evaluations into durable enterprise evidence
          while identity, authorization, rate limits, human review, and product boundaries stay explicit.
        </p>
        <div className="hero-actions">
          <a className="primary-action" href="/api/pilot-workspaces/preview-proof-packet">
            Download Synthetic Proof Packet
          </a>
          <a className="secondary-action" href="/api/pilot-workspaces/readiness">
            Inspect Readiness API
          </a>
        </div>
      </section>

      <section className="section-band hub-summary" aria-label="Protected pilot workspace summary">
        <article>
          <span>Status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Identity</span>
          <strong>{summary.infrastructure.identity.configured ? "connected" : "activation required"}</strong>
        </article>
        <article>
          <span>Durable store</span>
          <strong>{summary.infrastructure.durableStore.configured ? "connected" : "activation required"}</strong>
        </article>
        <article>
          <span>Tenant isolation</span>
          <strong>{summary.infrastructure.tenantIsolation.provider}</strong>
        </article>
        <article>
          <span>Distributed limit</span>
          <strong>{summary.infrastructure.rateLimit.configured ? "connected" : "activation required"}</strong>
        </article>
        <article>
          <span>Product boundary</span>
          <strong>synthetic only</strong>
        </article>
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Enterprise control plane</p>
          <h2>Protected mutations fail closed until production identity and storage are connected.</h2>
          <p className="section-copy">{summary.boundary}</p>
        </div>
        <div className="layer-list">
          {summary.capabilities.map((capability, index) => (
            <div className="layer-row" key={capability}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{capability}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="Protected pilot infrastructure">
        <div className="section-heading">
          <p className="eyebrow">Infrastructure</p>
          <h2>Selected production controls and their current activation state.</h2>
        </div>
        <div className="principle-grid">
          {[
            summary.infrastructure.identity,
            summary.infrastructure.durableStore,
            summary.infrastructure.tenantIsolation,
            {
              ...summary.infrastructure.rateLimit,
              control: summary.infrastructure.rateLimit.fallback
            }
          ].map((control) => (
            <article key={control.provider}>
              <span>{control.configured ? "configured" : "activation required"}</span>
              <h3>{control.provider}</h3>
              <p>{control.control}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Protected pilot API contracts">
        <div className="section-heading">
          <p className="eyebrow">Protected API contracts</p>
          <h2>Tenant membership and row-level security constrain every durable workspace operation.</h2>
        </div>
        {protectedPilotApiContracts.map((contract) => (
          <article className="module-row" key={`${contract.method}-${contract.route}`}>
            <div>
              <span>{contract.method}</span>
              <h2>{contract.route}</h2>
            </div>
            <p>{contract.access}</p>
            <strong>{contract.purpose}</strong>
          </article>
        ))}
      </section>

      <section className="table-section" aria-label="Protected pilot roles">
        <div className="section-heading">
          <p className="eyebrow">Role controls</p>
          <h2>Tenant roles grant the minimum pilot capability required.</h2>
        </div>
        {summary.roles.map((role) => (
          <article className="module-row" key={role.role}>
            <div>
              <span>tenant role</span>
              <h2>{role.role}</h2>
            </div>
            <ul className="compact-list">
              {role.permissions.map((permission) => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
            <ul className="compact-list">
              {role.restrictions.map((restriction) => (
                <li key={restriction}>{restriction}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Activation gates</p>
          <h2>Production activation remains a verified infrastructure and governance decision.</h2>
        </div>
        <div className="layer-list">
          {summary.activationGates.map((gate, index) => (
            <div className="layer-row" key={gate}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{gate}</strong>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
