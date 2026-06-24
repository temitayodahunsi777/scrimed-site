import Link from "next/link";
import { getHubSummary, hubModules, hubSignals } from "../lib/scrimedHub";

const consoleViews = [
  {
    name: "Readiness",
    href: "/hub/readiness",
    summary: "Review foundation checks, non-blocking watches, and gated clinical integrations."
  },
  {
    name: "Context",
    href: "/operating-context",
    summary: "Review SCRIMED's mission, principles, operating models, and decision framework."
  },
  {
    name: "SCRIMED Product Console",
    href: "/product",
    summary: "Review SCRIMED Atlas Pilot offers, buyer workflows, proof routes, deployment stages, and production boundaries."
  },
  {
    name: "Navigation Audit",
    href: "/navigation",
    summary: "Review page route inventory, API route pattern counts, smoke coverage, protected fail-closed checks, and retained AAL2 or external-review boundaries."
  },
  {
    name: "Service Reliability",
    href: "/service-reliability",
    summary: "Review product/service controls, fault classes, efficiency improvements, owners, proof routes, and retained authority boundaries."
  },
  {
    name: "Capital Vitality",
    href: "/capital-vitality",
    summary: "Review revenue capabilities, competitive moat evidence, investor milestones, funding workstreams, and retained external-review gates."
  },
  {
    name: "Pilot Deal Room",
    href: "/pilot-deal-room",
    summary: "Review the organized buyer path from public product proof to sales opportunity, protected Buyer Pilot Room, audited packet, and paid synthetic pilot."
  },
  {
    name: "Healthcare Intelligence OS",
    href: "/healthcare-intelligence-os",
    summary: "Review SCRIMED's Agent Runtime, Clinical Knowledge Graph, Validation Trust Lab, model router, sovereign deployment, and production gates."
  },
  {
    name: "Clinical Authority Readiness",
    href: "/clinical-authority-readiness",
    summary: "Review hard gates for live care, PHI processing, legal approval, regional approval, reimbursement, security certification, connectors, and production authorization."
  },
  {
    name: "Agent Workspace",
    href: "/agent-workspace",
    summary: "Review Persistent Agent Workspace v1 work orders, resumable state, model-router policy, reviewer checkpoints, audit timeline, proof packets, and limitation-resolution paths."
  },
  {
    name: "Pilot Evidence Dashboard",
    href: "/pilot-evidence",
    summary: "Inspect buyer and investor proof across product console, AgentOS, Atlas, TrustOS, protected workspaces, demos, pilots, and readiness gates."
  },
  {
    name: "Pilot Intake",
    href: "/pilot",
    summary: "Capture enterprise buyer segment, workflow targets, readiness needs, governance requirements, and CRM handoff scope."
  },
  {
    name: "Sales Operations",
    href: "/sales-operations",
    summary: "Manage tenant-admin opportunity ownership, pipeline decisions, audited proposals, and controlled CRM synchronization."
  },
  {
    name: "Demo Center",
    href: "/demos",
    summary: "Inspect five executable buyer demos with guided steps, proof routes, outcomes, governance boundaries, and production exclusions."
  },
  {
    name: "Pilot Programs",
    href: "/pilots",
    summary: "Compare structured enterprise programs by duration, deliverables, buyer inputs, success metrics, governance gates, and engagement model."
  },
  {
    name: "Protected Pilot Workspace",
    href: "/pilot-workspace",
    summary: "Inspect tenant identity, durable synthetic sessions, append-only audit controls, rate limits, and downloadable proof packets."
  },
  {
    name: "Provider Security Reviews",
    href: "/pilot-workspace/access",
    summary: "Record no-PHI security, privacy, BAA/DPA, credential, incident-response, retention/residency, and rollback readiness metadata after provider adapter contracts are ready."
  },
  {
    name: "Procurement Evidence Registry",
    href: "/pilot-workspace/access",
    summary: "Route security questionnaires, privacy questionnaires, vendor-risk, technical diligence, legal procurement, commercial, data-governance, and implementation evidence without storing confidential artifacts."
  },
  {
    name: "Pricing",
    href: "/pricing",
    summary: "Review SCRIMED pricing tiers, sales motion, value metrics, buyer route strategy, and commercial guardrails."
  },
  {
    name: "Public Market Readiness",
    href: "/public-market-readiness",
    summary: "Review KPI definitions, unit economics, compliance logs, customer proof, margin discipline, model-efficiency controls, and investor narrative."
  },
  {
    name: "Market Activation",
    href: "/market-activation",
    summary: "Review revenue streams, target audiences, FaithCore messaging, communications, PR, advertising, and claims-safe growth controls."
  },
  {
    name: "Global Reach",
    href: "/global-reach",
    summary: "Review region focus, buyer localization packs, partner channels, procurement questions, competitive edge, and retained global approval gates."
  },
  {
    name: "Sales Attribution",
    href: "/sales-attribution",
    summary: "Review CRM-safe source tracking, UTM/referrer capture, revenue routing, deployment profile mapping, and sales cadence."
  },
  {
    name: "Attribution Analytics",
    href: "/attribution-analytics",
    summary: "Review source-to-pilot cohorts across campaign, buyer type, deployment profile, offer, cadence, proof packet, and sales outcome."
  },
  {
    name: "Source Intelligence",
    href: "/source-intelligence",
    summary: "Review public standards and platform signals converted into SCRIMED-specific implementation themes and governance boundaries."
  },
  {
    name: "Deployment Profiles",
    href: "/deployment-profiles",
    summary: "Review managed cloud, private cloud, hospital-controlled, sovereign, and edge/on-prem deployment readiness profiles."
  },
  {
    name: "Operations",
    href: "/operations",
    summary: "Review publishing, deployment, DNS, Wix routing, quality tooling, and security blockers with owners and fallbacks."
  },
  {
    name: "Trust Center",
    href: "/trust-center",
    summary: "Inspect legal, security, privacy, brand, governance, marketing, PR, sales, advertising, claims controls, owners, and launch gates."
  },
  {
    name: "Trust Safety Ops",
    href: "/trust-safety-operations",
    summary: "Inspect 24/7 trust, safety, copyright, legal, security, monitoring, auditing, incident, and continuous-improvement agent operations."
  },
  {
    name: "TrustOS",
    href: "/trust-os",
    summary: "Run executable governance decisions through PHI Shield, Agent Firewall, Clinical Guardian, model routing, explainability, and Clinical Trace."
  },
  {
    name: "Claims Register",
    href: "/claims",
    summary: "Review approved, evidence-required, and prohibited public statements before website, sales, marketing, PR, partnership, or advertising use."
  },
  {
    name: "AgentOS Evaluation",
    href: "/evaluation",
    summary: "Generate synthetic AgentOS plans with Atlas Trust Cards, structural document intelligence, audit preview, and observability signals."
  },
  {
    name: "Agents",
    href: "/agents",
    summary: "Review SCRIMED AgentOS v1 control plane, planner, router, specialist registry, RBAC, MCP connectors, and human-review boundaries."
  },
  {
    name: "Memory",
    href: "/memory",
    summary: "Review session, operational, and knowledge memory fabric with retention, prohibited data, RBAC, and audit policies."
  },
  {
    name: "Audit",
    href: "/audit",
    summary: "Review audit channels, human approval checkpoints, AI Asset Registry, shadow AI detection, and governance trails."
  },
  {
    name: "Observability",
    href: "/observability",
    summary: "Review continuous validation metrics for denial reduction, time saved, revenue impact, escalation, override, and trust signals."
  },
  {
    name: "Atlas Intelligence Core",
    href: "/atlas",
    summary: "Review structural document intelligence, evidence layer, Trust Cards, sandbox runtime, reimbursement posture, and governance systems."
  },
  {
    name: "Workflows",
    href: "/workflows",
    summary: "Review synthetic workflow execution readiness for staged module workflows."
  },
  {
    name: "Contracts",
    href: "/workflows/contracts",
    summary: "Review governed execution API contracts before any workflow execution endpoint is implemented."
  },
  {
    name: "Identity",
    href: "/workflows/identity-access",
    summary: "Review production authentication, tenant isolation, roles, patient context, service auth, consent, and break-glass decisions."
  },
  {
    name: "Attempts",
    href: "/workflows/execution-attempts",
    summary: "Review idempotency, durable attempt state, retry, replay, concurrency, failure quarantine, and rate-limit decisions."
  },
  {
    name: "Safety",
    href: "/workflows/runtime-safety",
    summary: "Review throttles, abuse signals, connector containment, emergency shutdown, escalation, override, restoration, and safety-drill decisions."
  },
  {
    name: "Deny Stubs",
    href: "/workflows/implementation-readiness",
    summary: "Review locked execution endpoints and production prerequisites before any workflow can run."
  },
  {
    name: "Execution Audit",
    href: "/workflows/execution-audit",
    summary: "Review metadata-only evidence headers and never-capture policy for denied execution attempts."
  },
  {
    name: "Audit Store",
    href: "/workflows/audit-persistence",
    summary: "Review durable audit storage, retention, access, encryption, incident response, regional residency, and alerting decisions."
  },
  {
    name: "Results",
    href: "/workflows/results",
    summary: "Review deterministic result fixtures and validation diffs before live automation."
  },
  {
    name: "Result Check",
    href: "/workflows/results/validation",
    summary: "Inspect result-fixture diff checks for expected outputs, traces, reviews, and blocked actions."
  },
  {
    name: "Promotion",
    href: "/workflows/promotion-review",
    summary: "Review synthetic-only promotion approvals and retained blocked actions."
  },
  {
    name: "Quality",
    href: "/quality",
    summary: "Inspect active quality gates, planned production requirements, and replacement validation paths."
  },
  {
    name: "Synthetic",
    href: "/synthetic/validation",
    summary: "Review deterministic synthetic checks before any live clinical connector is introduced."
  },
  {
    name: "Events",
    href: "/hub/events",
    summary: "Track repository, product, operations, integration, and deployment milestones."
  },
  {
    name: "Interoperability",
    href: "/interoperability",
    summary: "Review FHIR, HL7 v2, DICOM/DICOMweb, X12, IHE, pharmacy, device, and terminology conformance boundaries."
  },
  {
    name: "Conformance",
    href: "/interoperability/evaluations",
    summary: "Inspect executable FHIR R4 and US Core, SMART App Launch, and DICOMweb synthetic test kits with retained live-use blockers."
  },
  {
    name: "Integrations",
    href: "/integrations",
    summary: "Inspect integration contracts before any live clinical data connector is implemented."
  },
  {
    name: "Fixtures",
    href: "/integrations/fixture-validation",
    summary: "Review integration fixture coverage, safeguard mapping, and expected-output fingerprints."
  },
  {
    name: "Review",
    href: "/fixtures/change-review",
    summary: "Review approved fixture fingerprints before workflow and connector changes depend on them."
  }
];

export default function HubPage() {
  const summary = getHubSummary();

  return (
    <main>
      <section className="page-hero hub-hero">
        <Link className="back-link" href="/">SCRIMED</Link>
        <p className="eyebrow">SCRIMED OS Hub</p>
        <h1>A command surface for platform readiness, module state, and trust signals.</h1>
        <p className="hero-text">
          The OS Hub gives SCRIMED a single operational view of product modules, deployment state, readiness signals, and the next integration frontier.
        </p>
      </section>

      <section className="section-band hub-summary" aria-label="SCRIMED OS Hub summary">
        <article>
          <span>Hub status</span>
          <strong>{summary.status}</strong>
        </article>
        <article>
          <span>Modules</span>
          <strong>{summary.moduleCount}</strong>
        </article>
        <article>
          <span>Staged</span>
          <strong>{summary.stagedModules}</strong>
        </article>
        <article>
          <span>Foundation</span>
          <strong>{summary.activeModules}</strong>
        </article>
        <article>
          <span>Product demos</span>
          <strong>{summary.demoPilotProgramSummary.executableDemos}</strong>
        </article>
        <article>
          <span>Pilot programs</span>
          <strong>{summary.demoPilotProgramSummary.pilotCount}</strong>
        </article>
        <article>
          <span>Readiness domains</span>
          <strong>{summary.enterpriseReadinessSummary.domainCount}</strong>
        </article>
        <article>
          <span>Controlled claims</span>
          <strong>{summary.enterpriseReadinessSummary.claims.total}</strong>
        </article>
        <article>
          <span>Global regions</span>
          <strong>{summary.globalPartnerLocalizationSummary.regionCount}</strong>
        </article>
        <article>
          <span>Buyer packs</span>
          <strong>{summary.globalPartnerLocalizationSummary.buyerPackCount}</strong>
        </article>
        <article>
          <span>Authority domains</span>
          <strong>{summary.clinicalAuthorityReadinessSummary.authorityDomainCount}</strong>
        </article>
        <article>
          <span>Authority fixes</span>
          <strong>{summary.clinicalAuthorityReadinessSummary.containedWithWorkaroundCount}</strong>
        </article>
        <article>
          <span>Reliability controls</span>
          <strong>{summary.serviceReliabilitySummary.controlCount}</strong>
        </article>
        <article>
          <span>Fault classes</span>
          <strong>{summary.serviceReliabilitySummary.faultClassCount}</strong>
        </article>
        <article>
          <span>Revenue capabilities</span>
          <strong>{summary.capitalVitalitySummary.revenueCapabilityCount}</strong>
        </article>
        <article>
          <span>Moat signals</span>
          <strong>{summary.capitalVitalitySummary.moatSignalCount}</strong>
        </article>
        <article>
          <span>Investor milestones</span>
          <strong>{summary.capitalVitalitySummary.investorMilestoneCount}</strong>
        </article>
        <article>
          <span>Funding workstreams</span>
          <strong>{summary.capitalVitalitySummary.fundingWorkstreamCount}</strong>
        </article>
      </section>

      <section className="section-band principle-grid" aria-label="Hub console views">
        {consoleViews.map((view) => (
          <article key={view.name}>
            <h3>{view.name}</h3>
            <p>{view.summary}</p>
            <Link className="module-link" href={view.href}>Open {view.name}</Link>
          </article>
        ))}
      </section>

      <section className="section-band split-band">
        <div>
          <p className="eyebrow">Operating signals</p>
          <h2>What the hub is watching now.</h2>
        </div>
        <div className="layer-list">
          {hubSignals.map((signal, index) => (
            <div className="layer-row" key={signal.name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{signal.name}: {signal.value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="table-section" aria-label="Hub module control surface">
        {hubModules.map((module) => (
          <article className="module-row" key={module.name}>
            <div>
              <span>{module.phase}</span>
              <h2>{module.name}</h2>
            </div>
            <p>{module.owner}</p>
            <Link className="module-link" href={module.route}>{module.objective}</Link>
          </article>
        ))}
      </section>
    </main>
  );
}
