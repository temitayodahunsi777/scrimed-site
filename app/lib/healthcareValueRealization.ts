import { getHealthcareOptimizationCommandSummary } from "./healthcareOptimizationCommand";
import { getInvestorAudienceReadinessSummary } from "./investorAudienceReadiness";
import { getPilotDemoCommercialReadinessSummary } from "./pilotDemoCommercialReadiness";
import { getServiceDeliverySummary } from "./serviceDelivery";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";
import { getStrategicProblemResolutionSummary } from "./strategicProblemResolution";

export type HealthcareValueDomain =
  | "clinical-workflow"
  | "patient-engagement"
  | "hospital-operations"
  | "interoperability"
  | "financial-rcm"
  | "commercial-pilot"
  | "investor-proof";

export type HealthcareValueTargetDirection = "increase" | "decrease" | "stabilize";

export type HealthcareValueMetric = {
  id: string;
  domain: HealthcareValueDomain;
  name: string;
  buyerQuestion: string;
  baselineSignal: string;
  targetDirection: HealthcareValueTargetDirection;
  measurementMethod: string;
  syntheticDataSource: string;
  evidenceScore: number;
  humanReviewRequired: true;
  allowedUse: string;
  blockedUse: string;
  proofRoutes: string[];
  owner: string;
  auditHash: string;
};

export type HealthcareValuePackage = {
  id: string;
  name: string;
  buyerAudience: string;
  valueThesis: string;
  includedMetrics: string[];
  pilotArtifact: string;
  commercialMotion: string;
  proofRoutes: string[];
  retainedBoundary: string;
  nextAction: string;
  auditHash: string;
};

export type HealthcareValueRiskControl = {
  risk: string;
  severity: "medium" | "high" | "critical";
  mitigation: string;
  proofRoute: string;
  blockedClaim: string;
};

export const healthcareValueRealizationRoute = "/healthcare-value-realization";
export const healthcareValueRealizationApiRoute = "/api/healthcare-value-realization";
export const healthcareValueRealizationBriefRoute = "/api/healthcare-value-realization/brief";
export const healthcareValueRealizationStatus =
  "healthcare-value-realization-active-synthetic-no-roi-guarantee";
export const healthcareValueRealizationBriefStatus =
  "healthcare-value-realization-brief-ready-no-financial-authority";
export const healthcareValueRealizationUpdatedAt = "2026-07-09";

export const healthcareValueRealizationBoundary =
  "SCRIMED Healthcare Value Realization converts synthetic-only optimization lanes into buyer-ready outcome metrics, pilot evidence packets, commercial proof routes, and investor diligence signals. It is a measurement framework only and does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, or customer go-live.";

const blockedHealthcareValueClaims = [
  "live PHI processing",
  "autonomous clinical care",
  "diagnosis, treatment, prescribing, or triage",
  "patient outreach without consent and human approval",
  "payer submission or coverage determination",
  "EHR, RIS, PACS, HIS, pharmacy, or production connector writeback",
  "final imaging interpretation",
  "production deployment or customer go-live approval",
  "certification, legal, or regulatory approval claim",
  "audited financial statement",
  "ROI guarantee",
  "revenue guarantee",
  "profit guarantee",
  "valuation assurance"
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function valueHash(id: string, label: string) {
  return generateScrimedAuditHash({
    id,
    label,
    boundary: healthcareValueRealizationBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: healthcareValueRealizationUpdatedAt
  });
}

function createMetric(metric: Omit<HealthcareValueMetric, "auditHash">): HealthcareValueMetric {
  return {
    ...metric,
    evidenceScore: clampScore(metric.evidenceScore),
    auditHash: valueHash(metric.id, metric.name)
  };
}

function createPackage(valuePackage: Omit<HealthcareValuePackage, "auditHash">): HealthcareValuePackage {
  return {
    ...valuePackage,
    auditHash: valueHash(valuePackage.id, valuePackage.name)
  };
}

export function getHealthcareValueRealizationSummary() {
  const optimization = getHealthcareOptimizationCommandSummary();
  const pilotReadiness = getPilotDemoCommercialReadinessSummary();
  const serviceDelivery = getServiceDeliverySummary();
  const investorReadiness = getInvestorAudienceReadinessSummary();
  const problemResolution = getStrategicProblemResolutionSummary();

  const metrics: HealthcareValueMetric[] = [
    createMetric({
      id: "documentation-time-saved-proxy",
      domain: "clinical-workflow",
      name: "Documentation time saved proxy",
      buyerQuestion: "Can SCRIMED reduce documentation burden without generating autonomous clinical decisions?",
      baselineSignal: "Synthetic current-state note assembly and review time benchmark.",
      targetDirection: "decrease",
      measurementMethod:
        "Compare synthetic baseline packet assembly time against reviewer-gated SCRIMED draft packet time.",
      syntheticDataSource: "/clinical-robustness-lab and /healthcare-optimization-command synthetic workflows",
      evidenceScore: 91,
      humanReviewRequired: true,
      allowedUse: "Pilot value hypothesis and workflow-readiness measurement.",
      blockedUse: "Not an audited labor-savings claim or staffing-reduction guarantee.",
      proofRoutes: [optimization.route, "/clinical-robustness-lab", "/scrimed-agent-governance"],
      owner: "Clinical Workflow + Pilot Delivery"
    }),
    createMetric({
      id: "missing-documentation-risk-reduction",
      domain: "clinical-workflow",
      name: "Missing documentation risk reduction",
      buyerQuestion: "Can SCRIMED surface missing evidence before a packet reaches clinical, payer, or audit review?",
      baselineSignal: "Synthetic packet with incomplete symptoms, functional status, timing, and source fields.",
      targetDirection: "decrease",
      measurementMethod:
        "Score structured documentation gap detection before any payer submission or clinical action is attempted.",
      syntheticDataSource: "/scrimed-clinical-benchmark-suite and documentation-before-authorization fixtures",
      evidenceScore: 94,
      humanReviewRequired: true,
      allowedUse: "No-PHI documentation readiness and reviewer queue planning.",
      blockedUse: "Not payer submission, coverage advice, or medical necessity determination.",
      proofRoutes: ["/scrimed-clinical-benchmark-suite", "/scrimed-hybrid-retrieval"],
      owner: "Documentation QA + Revenue Cycle"
    }),
    createMetric({
      id: "referral-cycle-time-readiness",
      domain: "patient-engagement",
      name: "Referral cycle-time readiness",
      buyerQuestion: "Can SCRIMED identify referral leakage and delay signals before patient communication occurs?",
      baselineSignal: "Synthetic referral status, missing packet, wait-time, and provider-match state.",
      targetDirection: "decrease",
      measurementMethod: "Track synthetic time from referral intake signal to human-reviewed routing recommendation.",
      syntheticDataSource: "/health-records and /scrimed-patient-context-gateway synthetic continuity scenarios",
      evidenceScore: 88,
      humanReviewRequired: true,
      allowedUse: "Referral workflow assessment and closed-loop pilot scoping.",
      blockedUse: "Not patient outreach, provider scheduling, or live referral command.",
      proofRoutes: ["/scrimed-patient-context-gateway", "/health-records"],
      owner: "Patient Access + Care Coordination"
    }),
    createMetric({
      id: "prior-auth-packet-completeness",
      domain: "financial-rcm",
      name: "Prior authorization packet completeness",
      buyerQuestion: "Can SCRIMED make documentation completeness measurable before human submission review?",
      baselineSignal: "Synthetic policy requirements mapped to synthetic documentation evidence.",
      targetDirection: "increase",
      measurementMethod:
        "Measure required-evidence coverage, missing-language flags, source provenance, and reviewer signoff state.",
      syntheticDataSource: "/pilot-demo-commercial-readiness and benchmark-suite prior-auth fixtures",
      evidenceScore: 93,
      humanReviewRequired: true,
      allowedUse: "Reviewer-ready draft packet and demo-pilot proof.",
      blockedUse: "Not claim submission, payer submission, or payment assurance.",
      proofRoutes: [pilotReadiness.route, "/scrimed-clinical-benchmark-suite"],
      owner: "RCM + Payer Workflow"
    }),
    createMetric({
      id: "patient-education-comprehension-readiness",
      domain: "patient-engagement",
      name: "Patient education comprehension readiness",
      buyerQuestion: "Can SCRIMED improve readability and continuity without giving medical advice as final authority?",
      baselineSignal: "Synthetic education material with health literacy, language, accessibility, and source gaps.",
      targetDirection: "increase",
      measurementMethod:
        "Score plain-language readability, source attribution, uncertainty statements, and escalation wording.",
      syntheticDataSource: "/scrimed-patient-context-gateway and /scrimed-intelligence-platform synthetic education nodes",
      evidenceScore: 90,
      humanReviewRequired: true,
      allowedUse: "Patient education draft quality review.",
      blockedUse: "Not treatment instruction, prescribing guidance, or patient outreach authorization.",
      proofRoutes: ["/scrimed-patient-context-gateway", "/scrimed-intelligence-platform"],
      owner: "CareExplain + Patient Education"
    }),
    createMetric({
      id: "follow-up-completion-readiness",
      domain: "patient-engagement",
      name: "Follow-up completion readiness",
      buyerQuestion: "Can SCRIMED identify follow-up risk without contacting patients or changing care plans?",
      baselineSignal: "Synthetic care-plan tasks, appointment state, access barriers, and consent flags.",
      targetDirection: "increase",
      measurementMethod:
        "Track human-reviewed follow-up risk flags and handoff completeness across synthetic patient journey states.",
      syntheticDataSource: "/healthcare-intelligence-os and /health-records synthetic patient journey fixtures",
      evidenceScore: 87,
      humanReviewRequired: true,
      allowedUse: "Care coordination planning and reviewer handoff design.",
      blockedUse: "Not appointment scheduling, outreach execution, or care-plan modification.",
      proofRoutes: ["/healthcare-intelligence-os", "/health-records"],
      owner: "Care Coordination"
    }),
    createMetric({
      id: "hospital-capacity-signal-review",
      domain: "hospital-operations",
      name: "Hospital capacity signal review",
      buyerQuestion: "Can SCRIMED support operational situational awareness without issuing production commands?",
      baselineSignal: "Synthetic bed, staffing, throughput, discharge, and escalation signals.",
      targetDirection: "stabilize",
      measurementMethod:
        "Count synthetic signal classification accuracy, owner routing, and escalation completeness.",
      syntheticDataSource: "/enterprise-healthcare-infrastructure and /scrimed-operating-command metadata",
      evidenceScore: 86,
      humanReviewRequired: true,
      allowedUse: "Operational readiness assessment and command-center demo.",
      blockedUse: "Not staffing command, bed assignment, or emergency operations authority.",
      proofRoutes: ["/enterprise-healthcare-infrastructure", "/scrimed-operating-command"],
      owner: "Hospital Operations"
    }),
    createMetric({
      id: "interoperability-discovery-completeness",
      domain: "interoperability",
      name: "Interoperability discovery completeness",
      buyerQuestion: "Can SCRIMED scope standards, interfaces, and risks before live connector work?",
      baselineSignal: "Synthetic system map across FHIR, HL7, DICOM, X12, RIS, HIS, PACS, VPN, VM, database, and firewall readiness.",
      targetDirection: "increase",
      measurementMethod:
        "Measure connector inventory completeness, authority gaps, standards mapping, and retained hard stops.",
      syntheticDataSource: "/enterprise-healthcare-infrastructure and /clinical-data-fabric readiness metadata",
      evidenceScore: 92,
      humanReviewRequired: true,
      allowedUse: "Integration discovery and implementation scoping.",
      blockedUse: "Not production connector approval or raw schema exposure.",
      proofRoutes: ["/enterprise-healthcare-infrastructure", "/clinical-data-fabric"],
      owner: "Interoperability + Security"
    }),
    createMetric({
      id: "source-contract-completeness",
      domain: "interoperability",
      name: "Source contract completeness",
      buyerQuestion: "Can SCRIMED prove what each output was grounded in without exposing raw payloads?",
      baselineSignal: "Synthetic source list with missing provenance, stale evidence, or absent reviewer route.",
      targetDirection: "increase",
      measurementMethod:
        "Score citation coverage, source trust tier, evidence freshness, redaction boundary, and audit hash presence.",
      syntheticDataSource: "/scrimed-hybrid-retrieval and /scrimed-intelligence-platform provenance fixtures",
      evidenceScore: 95,
      humanReviewRequired: true,
      allowedUse: "Trust and auditability proof.",
      blockedUse: "Not certification, legal approval, or production validation.",
      proofRoutes: ["/scrimed-hybrid-retrieval", "/scrimed-intelligence-platform"],
      owner: "Trust Engine"
    }),
    createMetric({
      id: "agent-trace-completeness",
      domain: "commercial-pilot",
      name: "Agent trace completeness",
      buyerQuestion: "Can SCRIMED show what the system did, why, and what stayed blocked?",
      baselineSignal: "Synthetic agent run with policy decisions, tool calls, model routing, and reviewer notes.",
      targetDirection: "increase",
      measurementMethod:
        "Score trace fields, policy decisions, tool permissions, latency/cost metadata, and failure reason capture.",
      syntheticDataSource: "/scrimed-llmops-observability and /scrimed-agent-governance traces",
      evidenceScore: 96,
      humanReviewRequired: true,
      allowedUse: "Buyer diligence, audit preparation, and pilot QA.",
      blockedUse: "Not proof of protected tenant execution without AAL2 evidence.",
      proofRoutes: ["/scrimed-llmops-observability", "/scrimed-agent-governance"],
      owner: "Platform Reliability + TrustOps"
    }),
    createMetric({
      id: "denied-claim-review-readiness",
      domain: "financial-rcm",
      name: "Denied claim review readiness",
      buyerQuestion: "Can SCRIMED help teams find appeal-prep gaps without submitting claims or appeals?",
      baselineSignal: "Synthetic denial reason, missing documentation, payer policy, and appeal packet metadata.",
      targetDirection: "increase",
      measurementMethod:
        "Score missing evidence detection, policy grounding, reviewer assignment, and blocked-submission enforcement.",
      syntheticDataSource: "/scrimed-clinical-benchmark-suite and /service-delivery RCM templates",
      evidenceScore: 89,
      humanReviewRequired: true,
      allowedUse: "Appeal-prep workflow review and RCM pilot design.",
      blockedUse: "Not billing submission, appeal submission, or reimbursement guarantee.",
      proofRoutes: [serviceDelivery.route, "/scrimed-clinical-benchmark-suite"],
      owner: "RCM + Compliance"
    }),
    createMetric({
      id: "buyer-pilot-conversion-readiness",
      domain: "commercial-pilot",
      name: "Buyer pilot conversion readiness",
      buyerQuestion: "Can SCRIMED translate demos into scoped, reviewable, margin-safe pilot packages?",
      baselineSignal: "Synthetic buyer segment, demo path, scope, acceptance criteria, pricing lane, and risk gate.",
      targetDirection: "increase",
      measurementMethod:
        "Measure package completeness, retained boundaries, proof routes, owner assignment, and external-review gates.",
      syntheticDataSource: "/pilot-demo-commercial-readiness and /service-delivery commercial packets",
      evidenceScore: 91,
      humanReviewRequired: true,
      allowedUse: "Sales readiness and pilot scoping.",
      blockedUse: "Not signed quote, customer permission, revenue forecast, or procurement approval.",
      proofRoutes: [pilotReadiness.route, serviceDelivery.route],
      owner: "Sales + Delivery"
    }),
    createMetric({
      id: "investor-proof-completeness",
      domain: "investor-proof",
      name: "Investor proof completeness",
      buyerQuestion: "Can SCRIMED show measurable operating maturity without overstating launch or certification status?",
      baselineSignal: "Synthetic diligence artifact manifest with gaps in safety, proof routes, and no-go boundaries.",
      targetDirection: "increase",
      measurementMethod:
        "Score product proof, smoke coverage, auditability, safety boundaries, risk register, and next milestones.",
      syntheticDataSource: "/investor-audience-readiness and /investor-readiness diligence snapshots",
      evidenceScore: 90,
      humanReviewRequired: true,
      allowedUse: "Investor diligence readiness and narrative sharpening.",
      blockedUse: "Not securities material, valuation assurance, or investment advice.",
      proofRoutes: [investorReadiness.route, "/investor-readiness"],
      owner: "Founder + Investor Relations"
    }),
    createMetric({
      id: "problem-resolution-value-closure",
      domain: "commercial-pilot",
      name: "Problem-resolution value closure",
      buyerQuestion: "Can SCRIMED close operational gaps with owner-bound, safe workarounds before pilots scale?",
      baselineSignal: "Strategic problem queue with severity, owner, workaround, proof route, and retained authority.",
      targetDirection: "increase",
      measurementMethod:
        "Track completed safe workarounds, unresolved external approvals, and proof-route freshness.",
      syntheticDataSource: "/strategic-problem-resolution problem ledger",
      evidenceScore: 88,
      humanReviewRequired: true,
      allowedUse: "Internal execution, buyer risk discussion, and launch-readiness planning.",
      blockedUse: "Not external approval, legal clearance, or production launch permission.",
      proofRoutes: [problemResolution.route, "/launch-readiness"],
      owner: "Executive Operations"
    })
  ];

  const valuePackages: HealthcareValuePackage[] = [
    createPackage({
      id: "thirty-day-workflow-value-discovery",
      name: "30-day workflow value discovery",
      buyerAudience: "Clinical operations, CIO, CMIO, ambulatory leadership",
      valueThesis:
        "Identify high-friction workflows, missing evidence points, and review gates that can be measured before live PHI or production connectors.",
      includedMetrics: [
        "documentation-time-saved-proxy",
        "missing-documentation-risk-reduction",
        "problem-resolution-value-closure"
      ],
      pilotArtifact: "No-PHI workflow value map with owner-bound next actions and retained hard stops.",
      commercialMotion: "Paid discovery assessment with optional pilot conversion.",
      proofRoutes: [optimization.route, problemResolution.route, serviceDelivery.route],
      retainedBoundary: "Measurement framework only; not an ROI guarantee or clinical outcome claim.",
      nextAction: "Package the top buyer workflow into a no-PHI acceptance-criteria sheet."
    }),
    createPackage({
      id: "sixty-day-operations-optimization-pilot",
      name: "60-day no-PHI operations optimization pilot",
      buyerAudience: "Hospital operations, service line leadership, access center teams",
      valueThesis:
        "Run synthetic event loops across referral, capacity, documentation, and follow-up workflows to prove operational control surfaces.",
      includedMetrics: [
        "referral-cycle-time-readiness",
        "follow-up-completion-readiness",
        "hospital-capacity-signal-review"
      ],
      pilotArtifact: "Synthetic dashboard packet with signal review, owner routing, and human escalation records.",
      commercialMotion: "Fixed-fee pilot with no production action and explicit review-gated expansion criteria.",
      proofRoutes: ["/health-records", "/scrimed-patient-context-gateway", "/enterprise-healthcare-infrastructure"],
      retainedBoundary: "No patient outreach, scheduling, operational command, or live-care authority.",
      nextAction: "Define buyer-specific synthetic event feed and reviewer acceptance rubric."
    }),
    createPackage({
      id: "ninety-day-enterprise-evidence-packet",
      name: "90-day enterprise value evidence packet",
      buyerAudience: "Enterprise diligence, innovation committees, investors, board observers",
      valueThesis:
        "Unify smoke results, policy boundaries, proof routes, trace completeness, and product readiness into one reviewable evidence packet.",
      includedMetrics: [
        "agent-trace-completeness",
        "source-contract-completeness",
        "investor-proof-completeness"
      ],
      pilotArtifact: "Diligence-ready evidence ledger with audit hashes, no-go boundaries, and release prerequisites.",
      commercialMotion: "Enterprise diligence package supporting partner, investor, and pilot review.",
      proofRoutes: ["/investor-readiness", investorReadiness.route, "/scrimed-llmops-observability"],
      retainedBoundary: "Not certification, valuation assurance, securities material, or customer go-live approval.",
      nextAction: "Bind each artifact to dated validation commands and owner attestations."
    }),
    createPackage({
      id: "interoperability-readiness-value-packet",
      name: "Interoperability readiness value packet",
      buyerAudience: "CIO, integration teams, security reviewers, data governance committees",
      valueThesis:
        "Clarify standards, connectors, payload boundaries, network assumptions, and validation responsibilities before production integration.",
      includedMetrics: [
        "interoperability-discovery-completeness",
        "source-contract-completeness",
        "agent-trace-completeness"
      ],
      pilotArtifact: "Connector discovery matrix with standards map, proof routes, and approval blockers.",
      commercialMotion: "Technical discovery workstream that de-risks implementation before contract expansion.",
      proofRoutes: ["/enterprise-healthcare-infrastructure", "/clinical-data-fabric", "/scrimed-hybrid-retrieval"],
      retainedBoundary: "Not production connector approval, raw schema exposure, or EHR writeback.",
      nextAction: "Generate buyer-specific integration checklist with security and data-governance owners."
    }),
    createPackage({
      id: "patient-engagement-readiness-packet",
      name: "Patient engagement readiness packet",
      buyerAudience: "Patient access, care coordination, outpatient leadership, patient experience teams",
      valueThesis:
        "Show how comprehension, follow-up risk, referral delay, and consent boundaries become measurable without contacting real patients.",
      includedMetrics: [
        "patient-education-comprehension-readiness",
        "follow-up-completion-readiness",
        "referral-cycle-time-readiness"
      ],
      pilotArtifact: "Synthetic patient journey packet with education, access, and continuity review gates.",
      commercialMotion: "No-PHI patient experience pilot scoped around review-only recommendations.",
      proofRoutes: ["/scrimed-patient-context-gateway", "/health-records", "/client-onboarding"],
      retainedBoundary: "No live outreach, patient-specific care instruction, or automated scheduling.",
      nextAction: "Create accessible synthetic journey demos for elderly and complex-care buyer personas."
    }),
    createPackage({
      id: "rcm-documentation-readiness-packet",
      name: "Revenue-cycle documentation readiness packet",
      buyerAudience: "RCM leaders, payer operations, prior authorization teams, compliance reviewers",
      valueThesis:
        "Measure documentation completeness, denial-review readiness, and policy grounding before payer submission or billing activity.",
      includedMetrics: [
        "prior-auth-packet-completeness",
        "denied-claim-review-readiness",
        "missing-documentation-risk-reduction"
      ],
      pilotArtifact: "Reviewer-gated RCM packet with missing evidence, policy links, and blocked-submission proof.",
      commercialMotion: "RCM workflow pilot with strict human approval gates and no payer action.",
      proofRoutes: [pilotReadiness.route, serviceDelivery.route, "/scrimed-clinical-benchmark-suite"],
      retainedBoundary: "No payer submission, billing submission, reimbursement guarantee, or payment assurance.",
      nextAction: "Add buyer-specific documentation-before-authorization rubric to the demo packet."
    })
  ];

  const riskControls: HealthcareValueRiskControl[] = [
    {
      risk: "ROI overclaim",
      severity: "critical",
      mitigation: "Use proxy metrics, label all outputs as measurement framework evidence, and require external finance review.",
      proofRoute: healthcareValueRealizationRoute,
      blockedClaim: "ROI guarantee"
    },
    {
      risk: "Revenue overclaim",
      severity: "critical",
      mitigation: "Separate sales-readiness metrics from revenue forecasts and block guarantee language in contracts and briefs.",
      proofRoute: "/growth-engine",
      blockedClaim: "revenue guarantee"
    },
    {
      risk: "Clinical outcome overclaim",
      severity: "critical",
      mitigation: "Keep all clinical-facing metrics review-gated and state they are not diagnosis, treatment, or live patient-care evidence.",
      proofRoute: "/clinical-production-readiness",
      blockedClaim: "clinical outcome guarantee"
    },
    {
      risk: "Payer submission ambiguity",
      severity: "high",
      mitigation: "Keep RCM artifacts as draft completeness checks and require human approval before any payer workflow.",
      proofRoute: "/scrimed-clinical-benchmark-suite",
      blockedClaim: "payer submission authority"
    },
    {
      risk: "Connector authority confusion",
      severity: "high",
      mitigation: "Bind each interoperability metric to synthetic conformance and production-approval blockers.",
      proofRoute: "/enterprise-healthcare-infrastructure",
      blockedClaim: "production connector approved"
    },
    {
      risk: "Investor diligence misread",
      severity: "high",
      mitigation: "Label investor evidence as readiness artifacts, not securities materials or valuation assurance.",
      proofRoute: "/investor-audience-readiness",
      blockedClaim: "valuation assurance"
    },
    {
      risk: "Audit evidence staleness",
      severity: "medium",
      mitigation: "Require dated route validation, audit hashes, and smoke results before a packet is shared.",
      proofRoute: "/deployment-drift-guard",
      blockedClaim: "always current evidence"
    },
    {
      risk: "Human review bypass",
      severity: "critical",
      mitigation: "All metrics and packages carry humanReviewRequired or retainedBoundary fields and never authorize live action.",
      proofRoute: "/scrimed-agent-governance",
      blockedClaim: "autonomous approval"
    }
  ];

  const domainCounts = metrics.reduce<Record<HealthcareValueDomain, number>>(
    (counts, metric) => ({
      ...counts,
      [metric.domain]: counts[metric.domain] + 1
    }),
    {
      "clinical-workflow": 0,
      "patient-engagement": 0,
      "hospital-operations": 0,
      interoperability: 0,
      "financial-rcm": 0,
      "commercial-pilot": 0,
      "investor-proof": 0
    }
  );

  return {
    service: "scrimed-healthcare-value-realization",
    status: healthcareValueRealizationStatus,
    briefStatus: healthcareValueRealizationBriefStatus,
    route: healthcareValueRealizationRoute,
    apiRoute: healthcareValueRealizationApiRoute,
    briefRoute: healthcareValueRealizationBriefRoute,
    updated: healthcareValueRealizationUpdatedAt,
    boundary: healthcareValueRealizationBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    authority: {
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      financialAuthority: "not-audited-financial-report",
      roiAuthority: "not-roi-guarantee",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      valuationAuthority: "not-valuation-assurance",
      productionAuthority: "not-production-authorized",
      payerAuthority: "not-authorized",
      ehrWritebackAuthority: "not-authorized",
      certificationAuthority: "not-certified"
    },
    sourceAlignment: {
      optimizationStatus: optimization.status,
      optimizationLaneCount: optimization.laneCount,
      pilotReadinessStatus: pilotReadiness.status,
      serviceDeliveryStatus: serviceDelivery.status,
      investorReadinessStatus: investorReadiness.status,
      strategicProblemCount: problemResolution.problemCount
    },
    metricCount: metrics.length,
    packageCount: valuePackages.length,
    riskControlCount: riskControls.length,
    domainCounts,
    humanReviewRequiredCount: metrics.filter((metric) => metric.humanReviewRequired).length,
    averageEvidenceScore: clampScore(
      metrics.reduce((total, metric) => total + metric.evidenceScore, 0) / metrics.length
    ),
    proofRouteCount: new Set([
      ...metrics.flatMap((metric) => metric.proofRoutes),
      ...valuePackages.flatMap((valuePackage) => valuePackage.proofRoutes)
    ]).size,
    blockedActionCount: blockedHealthcareValueClaims.length,
    metrics,
    topMetrics: metrics.slice(0, 6),
    valuePackages,
    topPackages: valuePackages.slice(0, 4),
    riskControls,
    blockedActions: blockedHealthcareValueClaims,
    nextBestMove:
      "Convert the top buyer workflow into a value-evidence packet with baseline proxy, target direction, measurement method, proof route, audit hash, human-review gate, and retained no-go boundary."
  };
}

export function buildHealthcareValueRealizationBrief() {
  const summary = getHealthcareValueRealizationSummary();

  return [
    "# SCRIMED Healthcare Value Realization Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Value metrics: ${summary.metricCount}`,
    `Value packages: ${summary.packageCount}`,
    `Risk controls: ${summary.riskControlCount}`,
    `Average evidence score: ${summary.averageEvidenceScore}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is a synthetic-only measurement framework. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, final imaging interpretation, production deployment, certification claims, audited financial reporting, valuation assurance, revenue guarantees, profit guarantees, ROI guarantees, or customer go-live. It is not an ROI guarantee.",
    "",
    "## Top Value Metrics",
    ...summary.topMetrics.map(
      (metric) =>
        `- ${metric.name} (${metric.domain}, evidence ${metric.evidenceScore}): ${metric.measurementMethod} Proof: ${metric.proofRoutes.join(", ")}`
    ),
    "",
    "## Value Packages",
    ...summary.valuePackages.map(
      (valuePackage) =>
        `- ${valuePackage.name}: ${valuePackage.valueThesis} Boundary: ${valuePackage.retainedBoundary} Next: ${valuePackage.nextAction}`
    ),
    "",
    "## Risk Controls",
    ...summary.riskControls.map(
      (control) =>
        `- ${control.risk} (${control.severity}): ${control.mitigation} Blocked claim: ${control.blockedClaim}`
    ),
    "",
    "## Blocked Claims",
    ...summary.blockedActions.map((action) => `- ${action}`),
    "",
    `Next best move: ${summary.nextBestMove}`
  ].join("\n");
}
