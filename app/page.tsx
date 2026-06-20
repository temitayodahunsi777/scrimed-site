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
    name: "TrustOS",
    summary: "Executable healthcare AI governance through PHI Shield, Agent Firewall, Clinical Guardian, model routing, explainability, and Clinical Trace."
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

const homepageDecisionPaths = [
  {
    audience: "Providers and operators",
    route: "/product",
    summary: "Inspect product offers, workflow demos, AgentOS, proof routes, and governed pilot boundaries."
  },
  {
    audience: "Security and compliance",
    route: "/trust-center",
    summary: "Review claims controls, privacy posture, protected workspaces, auditability, and diligence gates."
  },
  {
    audience: "Clinical authority reviewers",
    route: "/clinical-authority-readiness",
    summary: "Review retained gates for live care, PHI processing, legal approval, regional approval, reimbursement, security certification, and production clinical authorization."
  },
  {
    audience: "Procurement and vendor-risk",
    route: "/pilot-workspace/access",
    summary: "Review metadata-only routing for questionnaires, SOC and pentest evidence, legal artifacts, vendor-risk, implementation, and buyer diligence without storing sensitive artifacts."
  },
  {
    audience: "Global buyers and partners",
    route: "/global-reach",
    summary: "Review region focus, buyer localization packs, partner channels, procurement questions, and retained legal/privacy/clinical gates."
  },
  {
    audience: "Investors and board reviewers",
    route: "/public-market-readiness",
    summary: "Review KPI discipline, unit economics, customer proof, model-efficiency controls, and investor narrative."
  },
  {
    audience: "Enterprise pilot sponsors",
    route: "/pilot-deal-room",
    summary: "Move from buyer proof to pricing, protected evidence, activation gates, and pilot execution path."
  }
];

const readinessSignals = [
  { label: "Deployment", value: "Ready" },
  { label: "Product", value: "/product" },
  { label: "Deal Room", value: "/pilot-deal-room" },
  { label: "Demos", value: "/demos" },
  { label: "Programs", value: "/pilots" },
  { label: "Pricing", value: "/api/commercial/pricing" },
  { label: "Authority", value: "/api/clinical-authority-readiness" },
  { label: "Global", value: "/api/global-reach" },
  { label: "Operations", value: "/api/operations/readiness" },
  { label: "Trust Center", value: "/api/enterprise-readiness" },
  { label: "Claims", value: "/api/enterprise-readiness/claims" },
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
  { label: "TrustOS", value: "/api/trust-os/evaluate" },
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
            <Link href="/pilot-deal-room">Deal Room</Link>
            <Link href="/demos">Demos</Link>
            <Link href="/pilots">Programs</Link>
            <Link href="/pricing">Pricing</Link>
            <Link href="/clinical-authority-readiness">Authority</Link>
            <Link href="/global-reach">Global</Link>
            <Link href="/trust-center">Trust Center</Link>
            <Link href="/pilot">Pilot</Link>
            <Link href="/hub">Hub</Link>
          </div>
        </nav>

        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">AI-native healthcare intelligence</p>
            <h1>SCRIMED Healthcare Intelligence OS.</h1>
            <p className="hero-text">
              Solving For A Better Tomorrow through clinical intelligence, workflow automation, healthcare data interoperability, trustworthy AI agents, and continuous trust monitoring across AI-enabled care systems.
            </p>
            <div className="hero-actions" aria-label="Primary calls to action">
              <Link className="primary-action" href="/pilot">Request Pilot</Link>
              <Link className="secondary-action" href="/demos">Inspect Demos</Link>
              <Link className="secondary-action" href="/pilots">Compare Pilot Programs</Link>
              <Link className="secondary-action" href="/product">Open Product Console</Link>
              <Link className="secondary-action" href="/pilot-deal-room">Open Deal Room</Link>
              <Link className="secondary-action" href="/pricing">Review Pricing</Link>
              <Link className="secondary-action" href="/clinical-authority-readiness">Review Authority Readiness</Link>
              <Link className="secondary-action" href="/global-reach">Review Global Reach</Link>
              <Link className="secondary-action" href="/evaluation">Run Evaluation</Link>
              <Link className="secondary-action" href="/trust-center">Review Trust Center</Link>
              <Link className="secondary-action" href="/trust-os">Run TrustOS Decision</Link>
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
              {readinessSignals.slice(0, 10).map((signal) => (
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
                <span className="trace-dot trace-dot-alt" /> Pilot Deal Room links sales proof to buyer-room diligence
              </div>
              <div>
                <span className="trace-dot trace-dot-muted" /> Operations blocker register active
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Enterprise readiness and claims control active
              </div>
              <div>
                <span className="trace-dot trace-dot-muted" /> Clinical connectors remain gated
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Clinical authority hard gates mapped
              </div>
              <div>
                <span className="trace-dot" /> Global operating doctrine codified
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Global buyer and partner packs active
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Agent governance registry online
              </div>
              <div>
                <span className="trace-dot" /> AgentOS evaluation workspace ready
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> TrustOS governance decisions executable
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Five executable buyer demos ready
              </div>
              <div>
                <span className="trace-dot" /> Four governed pilot programs packaged
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

      <section className="table-section" aria-label="SCRIMED navigation paths">
        <div className="section-heading">
          <p className="eyebrow">Start here</p>
          <h2>Find the right SCRIMED path by role.</h2>
          <p className="section-copy">
            SCRIMED is organized for enterprise evaluation: product value, diligence evidence, investor readiness, and protected pilot execution each have a clear surface.
          </p>
        </div>
        {homepageDecisionPaths.map((path) => (
          <article className="module-row" key={path.audience}>
            <div>
              <span>path</span>
              <h2>{path.audience}</h2>
            </div>
            <p>{path.summary}</p>
            <Link className="module-link" href={path.route}>
              Open path
            </Link>
          </article>
        ))}
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
