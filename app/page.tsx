import Link from "next/link";
const platformModules = [
  {
    name: "Clinical Copilot",
    summary: "Clinician decision support, patient summarization, and documentation assistance."
  },
  {
    name: "DocuTwin",
    summary: "Structured medical documentation workflows from clinical context and conversations."
  },
  {
    name: "CarePath AI",
    summary: "Patient intake, triage support, navigation, and care pathway optimization."
  },
  {
    name: "TrialCore",
    summary: "Clinical trial discovery and patient matching for research operations."
  },
  {
    name: "Watchtower",
    summary: "Regression monitoring, drift detection, trust signals, and deployment scorecards."
  },
  {
    name: "AgentOS",
    summary: "Planner, router, specialist agents, memory, TrustQA, sandboxing, audit, RBAC, and human approvals."
  },
  {
    name: "Atlas Intelligence Core",
    summary: "Structural document intelligence, evidence attribution, Trust Cards, validation, governance, and reimbursement posture."
  },
  {
    name: "PayerIQ",
    summary: "Prior authorization and RCM intelligence for policy-aware, review-gated payer workflows."
  }
];

const systemLayers = [
  "Healthcare data interoperability",
  "Agent orchestration and sandbox runtime",
  "AI reasoning and summarization",
  "Evidence-backed workflow automation",
  "Trust, governance, safety, and observability"
];

const readinessSignals = [
  { label: "Deployment", value: "Ready" },
  { label: "Product", value: "/product" },
  { label: "Pricing", value: "/api/commercial/pricing" },
  { label: "Operations", value: "/api/operations/readiness" },
  { label: "Pilot", value: "/pilot" },
  { label: "Evaluation", value: "/api/agent-os/evaluation" },
  { label: "OS Hub", value: "/hub" },
  { label: "AgentOS", value: "/api/agent-os" },
  { label: "Atlas Core", value: "/api/atlas/intelligence-core" },
  { label: "Context", value: "/api/operating-context" },
  { label: "Intake API", value: "/api/pilot/intake" },
  { label: "Agents", value: "/api/agents/workflows" },
  { label: "Workflows", value: "/api/workflows/executions" },
  { label: "Memory", value: "/api/memory" },
  { label: "Audit", value: "/api/audit" },
  { label: "Trust Cards", value: "/api/trust/cards" },
  { label: "Observability", value: "/api/observability" },
  { label: "Exec API", value: "/api/workflows/contracts" },
  { label: "Identity", value: "/api/workflows/identity-access" },
  { label: "Attempts", value: "/api/workflows/execution-attempts" },
  { label: "Deny Stub", value: "/api/workflows/implementation-readiness" },
  { label: "Exec Audit", value: "/api/workflows/execution-audit" },
  { label: "Audit Store", value: "/api/workflows/audit-persistence" },
  { label: "Results", value: "/api/workflows/results" },
  { label: "Validation", value: "/api/workflows/results/validation" },
  { label: "Promotion", value: "/api/workflows/promotion-review" },
  { label: "Quality", value: "/api/quality/gates" },
  { label: "Reviews", value: "/api/fixtures/change-review" },
  { label: "Fixtures", value: "/api/integration-fixtures/validation" },
  { label: "Synthetic", value: "/api/synthetic/validation" },
  { label: "Contracts", value: "/api/contracts" }
];

export default function Home() {
  return (
    <main>
      <section className="hero-shell">
        <nav className="nav-bar" aria-label="Primary navigation">
          <a className="brand-mark" href="#top" aria-label="SCRIMED home">
            <span className="brand-symbol">S</span>
            <span>SCRIMED</span>
          </a>
          <div className="nav-links">
            <Link href="/product">Product</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/operations">Operations</Link>
            <Link href="/pilot">Pilot</Link>
            <Link href="/evaluation">Evaluation</Link>
            <Link href="/hub">Hub</Link>
            <Link href="/atlas">Atlas</Link>
            <Link href="/platform">Platform</Link>
            <Link href="/agents">Agents</Link>
            <Link href="/observability">Observability</Link>
            <Link href="/quality">Quality</Link>
            <Link href="/synthetic">Synthetic</Link>
            <Link href="/integrations">Integrations</Link>
            <Link href="/trust">Trust</Link>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">AI-native healthcare intelligence</p>
            <h1>SCRIMED is building the operating intelligence layer for modern healthcare.</h1>
            <p className="hero-text">
              Solving For A Better Tomorrow through clinical intelligence, workflow automation, healthcare data interoperability, trustworthy AI agents, and continuous trust monitoring across AI-enabled care systems.
            </p>
            <div className="hero-actions" aria-label="Primary calls to action">
              <Link className="primary-action" href="/pilot">Request Pilot</Link>
              <Link className="secondary-action" href="/product">Open Product Console</Link>
              <Link className="secondary-action" href="/pricing">Review Pricing</Link>
              <Link className="secondary-action" href="/evaluation">Run Evaluation</Link>
              <Link className="secondary-action" href="/hub">Open OS Hub</Link>
              <a className="secondary-action" href="https://www.scrimedsolutions.com">Official website</a>
            </div>
          </div>

          <aside className="command-surface" aria-label="SCRIMED command surface preview">
            <div className="surface-header">
              <span>Command Center</span>
              <strong>Operational</strong>
            </div>
            <div className="signal-grid">
              {readinessSignals.map((signal) => (
                <div className="signal-tile" key={signal.label}>
                  <span>{signal.label}</span>
                  <strong>{signal.value}</strong>
                </div>
              ))}
            </div>
            <div className="trace-panel">
              <div>
                <span className="trace-dot" /> Watchtower monitoring active
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Synthetic workflow fixtures ready
              </div>
              <div>
                <span className="trace-dot" /> Pricing and sales motion ready
              </div>
              <div>
                <span className="trace-dot trace-dot-muted" /> Operations blocker register active
              </div>
              <div>
                <span className="trace-dot trace-dot-muted" /> Clinical connectors remain gated
              </div>
              <div>
                <span className="trace-dot" /> Global operating doctrine codified
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Agent governance registry online
              </div>
              <div>
                <span className="trace-dot" /> AgentOS evaluation workspace ready
              </div>
              <div>
                <span className="trace-dot" /> AgentOS planner and router layer online
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Atlas Trust Cards staged
              </div>
              <div>
                <span className="trace-dot" /> Memory, audit, and observability surfaces exposed
              </div>
              <div>
                <span className="trace-dot" /> Integration fixture diffs active
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Three synthetic workflows staged
              </div>
              <div>
                <span className="trace-dot" /> Result validation and promotion review active
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Governed execution contracts defined
              </div>
              <div>
                <span className="trace-dot trace-dot-muted" /> Identity and access decision register active
              </div>
              <div>
                <span className="trace-dot trace-dot-muted" /> Execution-attempt idempotency model pending
              </div>
              <div>
                <span className="trace-dot" /> Execution endpoints locked by default
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Denied execution audit boundary active
              </div>
              <div>
                <span className="trace-dot trace-dot-muted" /> Audit persistence decision register active
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-band" id="platform">
        <div className="section-heading">
          <p className="eyebrow">Platform modules</p>
          <h2>Built as a healthcare intelligence ecosystem, not a single-purpose tool.</h2>
        </div>
        <div className="module-grid">
          {platformModules.map((module) => (
            <article className="module-card" key={module.name}>
              <h3>{module.name}</h3>
              <p>{module.summary}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="section-band split-band" id="trust">
        <div>
          <p className="eyebrow">Architecture</p>
          <h2>Data, intelligence, workflow, and trust layers move together.</h2>
          <p className="section-copy">
            SCRIMED is designed to sit above existing healthcare infrastructure and connect fragmented clinical, operational, and research workflows into a governed intelligence layer.
          </p>
        </div>
        <div className="layer-list">
          {systemLayers.map((layer, index) => (
            <div className="layer-row" key={layer}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{layer}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band roadmap-band" id="roadmap">
        <div className="section-heading">
          <p className="eyebrow">Execution path</p>
          <h2>Current focus: govern product workflows with synthetic fixtures and contract-only execution boundaries before live integrations.</h2>
        </div>
        <div className="roadmap-list">
          <article>
            <span>Phase 1</span>
            <h3>Core foundations</h3>
            <p>Stabilize the repository, deployment, documentation, and first health signals.</p>
          </article>
          <article>
            <span>Phase 2</span>
            <h3>Synthetic validation</h3>
            <p>Exercise workflows against deterministic scenarios without production clinical data.</p>
          </article>
          <article>
            <span>Phase 3</span>
            <h3>Workflow systems</h3>
            <p>Bring DocuTwin, CarePath, TrialCore, and reporting workflows into validated product paths.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
