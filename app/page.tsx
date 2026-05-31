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
  }
];

const systemLayers = [
  "Healthcare data interoperability",
  "AI reasoning and summarization",
  "Workflow automation",
  "Trust, safety, and observability"
];

const readinessSignals = [
  { label: "Deployment", value: "Ready" },
  { label: "OS Hub", value: "/hub" },
  { label: "Context", value: "/api/operating-context" },
  { label: "Agents", value: "/api/agents/workflows" },
  { label: "Workflows", value: "/api/workflows/executions" },
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
            <a href="/hub">Hub</a>
            <a href="/platform">Platform</a>
            <a href="/agents">Agents</a>
            <a href="/quality">Quality</a>
            <a href="/synthetic">Synthetic</a>
            <a href="/integrations">Integrations</a>
            <a href="/trust">Trust</a>
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
              <a className="primary-action" href="/hub">Open OS Hub</a>
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
                <span className="trace-dot trace-dot-muted" /> Clinical connectors remain gated
              </div>
              <div>
                <span className="trace-dot" /> Global operating doctrine codified
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Agent governance registry online
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
          <h2>Current focus: validate product workflows with synthetic clinical fixtures before live integrations.</h2>
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
