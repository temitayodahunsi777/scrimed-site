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

const buyerOutcomeCards = [
  {
    buyer: "Health systems and clinics",
    headline: "Turn operational bottlenecks into governed AI workflows.",
    proof:
      "Start with synthetic demos for access, documentation, research, interoperability, and agent governance, then move into a scoped no-PHI pilot."
  },
  {
    buyer: "Payers, operators, and transformation teams",
    headline: "Evaluate workflow intelligence before committing to production change.",
    proof:
      "SCRIMED packages proof routes, success metrics, governance gates, and delivery artifacts so the buying committee can make a decision."
  },
  {
    buyer: "Investors and strategic partners",
    headline: "See the commercial engine behind the product.",
    proof:
      "Review sellable offers, pricing tiers, margin controls, pilot paths, defensibility, and readiness evidence without crossing securities or valuation boundaries."
  }
];

const buyerPurchaseOptions = [
  {
    name: "Workflow Intelligence Assessment",
    price: "$25k-$150k",
    pitch: "A fast, finite way to identify where SCRIMED can reduce workflow friction and prepare a buyer-ready pilot decision.",
    href: "/pilot?offer=workflow-intelligence-assessment"
  },
  {
    name: "Synthetic Pilot Evaluation",
    price: "$125k-$500k",
    pitch: "A 45-90 day no-PHI pilot that gives enterprise sponsors proof, governance evidence, workflow metrics, and an expansion decision.",
    href: "/pilot?offer=synthetic-pilot-evaluation"
  },
  {
    name: "Protected Enterprise Pilot",
    price: "$400k-$2M+",
    pitch: "A controlled enterprise activation path for buyers who need protected proof, diligence rooms, onboarding, and production-readiness planning.",
    href: "/pilot?offer=protected-enterprise-pilot"
  }
];

const buyerTrustSignals = [
  "No-PHI public demos and intake paths",
  "Market-aligned pilot pricing and proof packets",
  "Human-reviewed communications, claims, and buyer handoffs",
  "Clinical production, certification, connector, and security limits shown before overclaim risk"
];

const buyerTrustProofCards = [
  {
    signal: "Evidence before expansion",
    buyerValue:
      "SCRIMED helps buyers fund the smallest useful pilot first, then expand only when workflow proof, governance evidence, and review gates support the next step."
  },
  {
    signal: "Boundaries buyers can inspect",
    buyerValue:
      "No-PHI, no-live-care, no-production-connector, no-certification, and no-ROI-guarantee limits are visible before diligence instead of hidden inside sales calls."
  },
  {
    signal: "Reliability as an operating habit",
    buyerValue:
      "Route smoke checks, claims registers, incident queues, audit trails, and human review loops make reliability a tracked operating system, not a slogan."
  },
  {
    signal: "Safety that still sells",
    buyerValue:
      "SCRIMED turns clinical, privacy, security, legal, and AI limits into safe evaluation paths, so buyers can move forward without accepting production risk too early."
  }
];

const homepageDecisionPaths = [
  {
    audience: "Founder, executive sponsor, or company operator",
    route: "/company-assessment",
    summary: "Assess SCRIMED as a whole across product, services, revenue, margin, approvals, cybersecurity, AI, health-record safety, launch, investors, limitations, and proof routes."
  },
  {
    audience: "Clinical production readiness owners",
    route: "/clinical-production-readiness",
    summary: "Track the required tasks still incomplete before live clinical care, PHI, production connectors, regulated claims, customer go-live, and global clinical deployment."
  },
  {
    audience: "Demo, pilot, and pricing owners",
    route: "/pilot-demo-commercial-readiness",
    summary: "Map demos into recommended pilot packages, price bands, proof assets, market benchmarks, no-PHI intake, and margin-safe hard stops before buyer calls."
  },
  {
    audience: "Launch owners and executive sponsors",
    route: "/launch-readiness",
    summary: "Review strict branded-domain gates, sandbox DNS classification, fallback boundaries, product/service launch tracks, and hard stops."
  },
  {
    audience: "Providers and operators",
    route: "/product",
    summary: "Inspect product offers, workflow demos, AgentOS, proof routes, and governed pilot boundaries."
  },
  {
    audience: "Service delivery owners",
    route: "/service-delivery",
    summary: "Turn packaged offers into scoped work orders, acceptance criteria, delivery artifacts, buyer handoffs, and retained authority gates."
  },
  {
    audience: "Product, sales, and strategy reviewers",
    route: "/competitive-intelligence",
    summary: "Review public competitor patterns translated into SCRIMED-specific build paths, proof metrics, API posture, payer workflows, and no-copy guardrails."
  },
  {
    audience: "Legal, privacy, cyber, and competitor-defense reviewers",
    route: "/competitive-defense",
    summary: "Review competitor threat profiles, weakness relief, claims-safe counter-positioning, privacy gates, cybersecurity controls, and infiltration-deterrence hard stops."
  },
  {
    audience: "Operators and release reviewers",
    route: "/navigation",
    summary: "Review page inventory, API route count, route groups, smoke coverage, protected fail-closed checks, and retained AAL2 boundaries."
  },
  {
    audience: "Reliability and execution owners",
    route: "/service-reliability",
    summary: "Review product/service controls, fault classes, efficiency improvements, owners, proof routes, and retained approval boundaries."
  },
  {
    audience: "Enterprise scale operators",
    route: "/enterprise-scalability",
    summary: "Review capacity planning, tenant scale, queueing, SLO readiness, incidents, support load, global deployment, and usage-cost controls."
  },
  {
    audience: "API, UI, and AI platform operators",
    route: "/platform-power",
    summary: "Review API contracts, operator UI paths, AI model-route readiness, agent approvals, eval loops, evidence retrieval, and cost controls."
  },
  {
    audience: "Efficiency and bottleneck owners",
    route: "/operational-efficiency",
    summary: "Resolve cross-system gaps, inefficiencies, bottlenecks, hard stops, proof-route gaps, and margin/control drag through owned sprints."
  },
  {
    audience: "Boundary and workaround owners",
    route: "/limitations-workarounds",
    summary: "Turn blocked requests into safe workaround packets, escalation owners, proof routes, expiration rules, and graduation gates."
  },
  {
    audience: "Revenue, board, and funding reviewers",
    route: "/investor-audience-readiness",
    summary: "Review weakness relief, competitive edge, sellable value, and audience packets for angels, strategics, private investors, faith-based clinics, and partners."
  },
  {
    audience: "Founder and commercial operators",
    route: "/growth-engine",
    summary: "Prioritize buyer segments, sellable offers, conversion lanes, revenue proof steps, bottlenecks, owners, and proof routes."
  },
  {
    audience: "Legal, finance, and enterprise operators",
    route: "/enterprise-business-ops",
    summary: "Review revenue capabilities, margin controls, legal/accounting/tax roles, deal desk, contract authority, billing readiness, operating cadences, and blocked enterprise claims."
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
    audience: "Approval, certification, and global assurance reviewers",
    route: "/global-certification-readiness",
    summary: "Review HIPAA/BAA, FDA CDS/SaMD, SOC 2, HITRUST, ISO, EU AI Act, GDPR, NHS DTAC, MHRA, Australia Essential Eight, regional packs, and blocked certification claims."
  },
  {
    audience: "QA, audit, and innovation owners",
    route: "/continuous-review-audit",
    summary: "Review 24/7 agent-assisted accuracy checks, evidence attribution, claims guard, security drift, QA regression, incident learning, and internal-only future research."
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
    route: "/investor-audience-readiness",
    summary: "Review investor/audience packets, capital vitality, KPI discipline, unit economics, moat proof, customer proof, and investor narrative without securities, solicitation, or valuation claims."
  },
  {
    audience: "Enterprise pilot sponsors",
    route: "/pilot-deal-room",
    summary: "Move from buyer proof to pricing, protected evidence, activation gates, and pilot execution path."
  }
];

const readinessSignals = [
  { label: "Company", value: "/api/company-assessment" },
  { label: "Clinical Prod", value: "/api/clinical-production-readiness" },
  { label: "Demo Pricing", value: "/api/pilot-demo-commercial-readiness" },
  { label: "Deployment", value: "Ready" },
  { label: "Product", value: "/product" },
  { label: "Delivery", value: "/api/service-delivery" },
  { label: "Launch", value: "/api/launch-readiness" },
  { label: "Defense", value: "/api/competitive-defense" },
  { label: "Efficiency", value: "/operational-efficiency" },
  { label: "Market Intel", value: "/api/competitive-intelligence" },
  { label: "Deal Room", value: "/pilot-deal-room" },
  { label: "Onboarding", value: "/client-onboarding" },
  { label: "Demos", value: "/demos" },
  { label: "Programs", value: "/pilots" },
  { label: "Pricing", value: "/api/commercial/pricing" },
  { label: "Authority", value: "/api/clinical-authority-readiness" },
  { label: "Navigation", value: "/api/navigation-audit" },
  { label: "Reliability", value: "/api/service-reliability" },
  { label: "Scale", value: "/api/enterprise-scalability" },
  { label: "Platform Power", value: "/api/platform-power" },
  { label: "Workarounds", value: "/api/limitations-workarounds" },
  { label: "Investors", value: "/api/investor-audience-readiness" },
  { label: "Capital", value: "/api/capital-vitality" },
  { label: "Growth", value: "/api/growth-engine" },
  { label: "Business Ops", value: "/api/enterprise-business-ops" },
  { label: "Global", value: "/api/global-reach" },
  { label: "Certifications", value: "/api/global-certification-readiness" },
  { label: "24/7 Review", value: "/api/continuous-review-audit" },
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
  { label: "Attempt Envelope", value: "/api/workflows/execution-attempts/envelope" },
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
        <div className="hero-grid" id="top">
          <div className="hero-copy">
            <p className="eyebrow">Buy governed healthcare AI with proof before production risk</p>
            <h1>SCRIMED helps healthcare leaders turn messy workflows into governed AI pilots buyers can trust.</h1>
            <p className="hero-text">
              Launch a no-PHI product demo, choose the right pilot package, see market-aligned pricing, and give your buying committee the proof, trust boundaries, and implementation path needed to move forward.
            </p>
            <div className="hero-actions" aria-label="Primary calls to action">
              <Link className="primary-action" href="/pilot-demo-commercial-readiness">Find Your Pilot Path</Link>
              <Link className="secondary-action" href="/demos">Watch Product Demos</Link>
              <Link className="secondary-action" href="/offerings">See What You Can Buy</Link>
              <Link className="secondary-action" href="/pricing">Review Pricing</Link>
              <Link className="secondary-action" href="/pilot">Request a Pilot</Link>
              <Link className="secondary-action" href="/investor-audience-readiness">Investor Readiness</Link>
            </div>
          </div>

          <aside className="command-surface" aria-label="SCRIMED command surface preview">
            <div className="surface-header">
              <span>Buyer Proof Center</span>
              <strong>Ready to evaluate</strong>
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
                <span className="trace-dot trace-dot-alt" /> Five public demos route directly into pilot packages, price bands, and no-PHI intake
              </div>
              <div>
                <span className="trace-dot" /> Four governed pilot programs are packaged for assessment, synthetic evaluation, protected enterprise pilots, and AI governance
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Buyer proof includes pricing posture, delivery artifacts, trust boundaries, and diligence-ready operating routes
              </div>
              <div>
                <span className="trace-dot" /> Investor and partner packets show sellable value, moat signals, audience fit, and retained review gates
              </div>
              <div>
                <span className="trace-dot trace-dot-alt" /> Clinical production, PHI, connector, certification, and live-care claims remain visibly gated
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED buyer outcomes">
        <div className="section-heading">
          <p className="eyebrow">Why buyers choose SCRIMED</p>
          <h2>Healthcare AI is crowded. SCRIMED sells the missing layer: governed workflow intelligence with proof before production exposure.</h2>
        </div>
        <div className="principle-grid">
          {buyerOutcomeCards.map((card) => (
            <article key={card.buyer}>
              <span>{card.buyer}</span>
              <h3>{card.headline}</h3>
              <p>{card.proof}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED purchase options">
        <div className="section-heading">
          <p className="eyebrow">What you can buy now</p>
          <h2>Start with a clear commercial package, then expand only when the proof supports it.</h2>
          <p className="section-copy">
            Public demos are free and no-PHI. Paid work begins when SCRIMED starts doing buyer-specific assessment, pilot, diligence, or protected evidence work.
          </p>
        </div>
        {buyerPurchaseOptions.map((option) => (
          <article className="module-row" key={option.name}>
            <div>
              <span>{option.price}</span>
              <h2>{option.name}</h2>
            </div>
            <p>{option.pitch}</p>
            <Link className="module-link" href={option.href}>
              Scope this package
            </Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band" aria-label="Buyer trust signals">
        <div>
          <p className="eyebrow">Built for buying committees</p>
          <h2>SCRIMED gives executives, operators, compliance teams, and investors a reason to keep moving.</h2>
          <p className="section-copy">
            The sales path is designed to be persuasive and disciplined: show the value, prove the workflow, price the pilot, and keep unsafe claims out of the room.
          </p>
        </div>
        <div className="layer-list">
          {buyerTrustSignals.map((signal, index) => (
            <div className="layer-row" key={signal}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="section-band" aria-label="SCRIMED trust reliability and safety proof">
        <div className="section-heading">
          <p className="eyebrow">Trust that helps close the deal</p>
          <h2>The safest healthcare AI to buy is the one that proves value before it asks for production risk.</h2>
          <p className="section-copy">
            SCRIMED sells trust, reliability, and safety as part of the product: every buyer path shows what is ready, what is gated, what evidence exists, and what review is required next.
          </p>
        </div>
        <div className="principle-grid">
          {buyerTrustProofCards.map((card) => (
            <article key={card.signal}>
              <span>trust proof</span>
              <h3>{card.signal}</h3>
              <p>{card.buyerValue}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="SCRIMED navigation paths">
        <div className="section-heading">
          <p className="eyebrow">Choose your buying path</p>
          <h2>Move from interest to demo, pricing, diligence, or investment readiness without guessing where to click.</h2>
          <p className="section-copy">
            Buyers get the commercial story first. Clinical, security, legal, and production-readiness routes stay visible so serious diligence can happen without weakening claims control.
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
