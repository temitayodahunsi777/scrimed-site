import { getScrimedEnterpriseAccelerationSummary } from "./scrimedEnterpriseAcceleration";
import { getScrimedGuidedExecutionSummary } from "./scrimedGuidedExecution";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { getScrimedMarketExecutionSummary } from "./scrimedMarketExecution";
import { getScrimedOperatingCommandCenterSummary } from "./scrimedOperatingCommandCenter";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedFocusLane =
  | "revenue"
  | "product"
  | "trust-safety"
  | "investor"
  | "operations"
  | "platform";

export type ScrimedFocusHorizon = "now" | "next" | "blocked";

export type ScrimedFocusItem = {
  id: string;
  lane: ScrimedFocusLane;
  horizon: ScrimedFocusHorizon;
  sourceSystem: string;
  objective: string;
  whyNow: string;
  owner: string;
  proofRoute: string;
  apiRoute: string;
  nextAction: string;
  valueScore: number;
  riskScore: number;
  effortScore: number;
  focusScore: number;
  humanReviewRequired: true;
  retainedBoundary: string;
  blockedActions: string[];
  policyVersion: typeof scrimedSafetyPolicyVersion;
  syntheticOnly: true;
  auditHash: string;
};

export type ScrimedExecutionFocusScorecard = {
  nowCount: number;
  nextCount: number;
  blockedCount: number;
  averageNowFocusScore: number;
  highestValueLane: ScrimedFocusLane;
  safetyPosture: "synthetic-human-reviewed";
  productionReadiness: false;
};

export const scrimedExecutionFocusStatus = "scrimed-execution-focus-active-synthetic-no-phi";
export const scrimedExecutionFocusApiRoute = "/api/scrimed-execution-focus";
export const scrimedExecutionFocusBriefRoute = "/api/scrimed-execution-focus/brief";
export const scrimedExecutionFocusPageRoute = "/scrimed-execution-focus";
export const scrimedExecutionFocusBoundary =
  "SCRIMED Execution Focus Engine is a synthetic/no-PHI prioritization control surface. It ranks safe next actions, proof routes, owner lanes, and retained gates without granting live patient-data authority, clinical authority, payer submission authority, EHR mutation authority, certification claims, investment advice, revenue guarantees, or customer go-live approval.";

export const scrimedExecutionFocusOperatingRules = [
  "Prioritize revenue proof, trust proof, and buyer/investor clarity before adding broader surface area.",
  "Every focus item must point to a proof route, API route, owner lane, retained boundary, and audit hash.",
  "Blocked items remain visible, but the engine can only recommend approval-path workarounds.",
  "All sensitive, clinical-facing, payer-facing, public, legal, or investor-facing use requires human review.",
  "Execution focus is metadata-only; it does not mutate systems, contact patients, submit payer packets, or write records."
];

const defaultBlockedActions = [
  "No PHI or live patient data",
  "No autonomous clinical care or final clinical authority",
  "No treatment, prescribing, patient outreach, payer submission, billing submission, or EHR mutation",
  "No production connector approval, certification claim, customer go-live approval, or revenue guarantee"
];

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function focusScore(valueScore: number, riskScore: number, effortScore: number, horizon: ScrimedFocusHorizon) {
  const base = valueScore * 0.55 + (100 - riskScore) * 0.25 + (100 - effortScore) * 0.2;
  return horizon === "blocked" ? Math.min(45, clampScore(base)) : clampScore(base);
}

function focusItem(
  input: Omit<ScrimedFocusItem, "focusScore" | "humanReviewRequired" | "policyVersion" | "syntheticOnly" | "auditHash">
): ScrimedFocusItem {
  const focus = focusScore(input.valueScore, input.riskScore, input.effortScore, input.horizon);
  return {
    ...input,
    focusScore: focus,
    humanReviewRequired: true,
    policyVersion: scrimedSafetyPolicyVersion,
    syntheticOnly: true,
    auditHash: generateScrimedAuditHash({
      id: input.id,
      horizon: input.horizon,
      proofRoute: input.proofRoute,
      focusScore: focus,
      policyVersion: scrimedSafetyPolicyVersion,
      retainedBoundary: input.retainedBoundary
    })
  };
}

export function buildScrimedExecutionFocusItems(): ScrimedFocusItem[] {
  return [
    focusItem({
      id: "buyer-proof-to-pilot",
      lane: "revenue",
      horizon: "now",
      sourceSystem: "scrimed-market-execution + pilot-demo-commercial-readiness",
      objective: "Convert clean-room market execution into a buyer proof-to-pilot path.",
      whyNow: "This is the shortest path from demo interest to scoped no-PHI revenue while preserving all production hard stops.",
      owner: "Revenue + Product",
      proofRoute: "/pilot-demo-commercial-readiness",
      apiRoute: "/api/pilot-demo-commercial-readiness",
      nextAction: "Package the top two no-PHI buyer demos with pricing band, proof packet, reviewer role, and pilot acceptance criteria.",
      valueScore: 96,
      riskScore: 24,
      effortScore: 28,
      retainedBoundary: "Commercial proof only; no contract approval, PHI authority, ROI guarantee, or customer go-live.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "security-diligence-trust-center",
      lane: "trust-safety",
      horizon: "now",
      sourceSystem: "scrimed-cyber-defense + trust-center",
      objective: "Make security, privacy, audit, and residual-risk posture easier for buyers and investors to diligence.",
      whyNow: "Trust proof reduces sales friction and prevents unsafe overclaiming as market interest increases.",
      owner: "Security + Trust",
      proofRoute: "/scrimed-cyber-defense",
      apiRoute: "/api/scrimed-cyber-defense",
      nextAction: "Surface token redaction, proxy sanitization, protected-route monitoring, incident lanes, and residual risks in the buyer proof packet.",
      valueScore: 94,
      riskScore: 18,
      effortScore: 32,
      retainedBoundary: "Security readiness only; not a certification, breach guarantee, or customer security approval.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "investor-diligence-narrative",
      lane: "investor",
      horizon: "now",
      sourceSystem: "investor-readiness + scrimed-enterprise-acceleration",
      objective: "Bind investor narrative to evidence artifacts, product surface, revenue motion, and retained boundaries.",
      whyNow: "Investor confidence depends on crisp proof and credible restraint, not broader claims.",
      owner: "Founder + Finance + Product",
      proofRoute: "/investor-readiness",
      apiRoute: "/api/investor-readiness/status",
      nextAction: "Prepare a five-part diligence snapshot: product proof, trust controls, commercial path, no-go boundaries, and next milestone.",
      valueScore: 92,
      riskScore: 22,
      effortScore: 26,
      retainedBoundary: "Investor diligence readiness only; not investment advice, securities material, valuation assurance, or audited financial reporting.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "execution-hygiene-command-surface",
      lane: "operations",
      horizon: "now",
      sourceSystem: "scrimed-operating-command + navigation-audit",
      objective: "Keep the highest-impact lanes visible, ranked, and proof-linked so execution does not fragment.",
      whyNow: "The platform now has many modules; ranking reduces bottlenecks and protects build velocity.",
      owner: "Platform Operations",
      proofRoute: "/scrimed-operating-command",
      apiRoute: "/api/scrimed-operating-command",
      nextAction: "Use weekly operating review to advance only the top safe items and keep blocked items in approval-path workstreams.",
      valueScore: 88,
      riskScore: 16,
      effortScore: 18,
      retainedBoundary: "Planning and recommendation only; no protected execution, production deployment, or external communication authority.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "clinical-production-approval-ladder",
      lane: "trust-safety",
      horizon: "next",
      sourceSystem: "clinical-production-readiness + boundary-release-approvals",
      objective: "Turn preserved clinical no-go boundaries into an explicit approval evidence ladder.",
      whyNow: "This creates the path to future permission without prematurely claiming readiness.",
      owner: "Clinical Safety + Compliance",
      proofRoute: "/clinical-production-readiness",
      apiRoute: "/api/clinical-production-readiness",
      nextAction: "Map each boundary to evidence, owner, reviewer credential, validation artifact, and external approval requirement.",
      valueScore: 90,
      riskScore: 46,
      effortScore: 48,
      retainedBoundary: "Approval path only; live clinical authority remains blocked until qualified review and external approval.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "interoperability-proof-catalog",
      lane: "platform",
      horizon: "next",
      sourceSystem: "clinical-data-fabric + patient-context-gateway",
      objective: "Create a proof catalog for FHIR, HL7, DICOM metadata, payer policy, consent, provenance, and no-writeback controls.",
      whyNow: "Enterprise buyers need interoperability confidence before technical pilots become serious.",
      owner: "Interoperability + Platform",
      proofRoute: "/clinical-data-fabric",
      apiRoute: "/api/clinical-data-fabric",
      nextAction: "Attach each connector concept to schema validation, provenance, PHI boundary, and writeback-denial evidence.",
      valueScore: 86,
      riskScore: 38,
      effortScore: 44,
      retainedBoundary: "Connector readiness metadata only; no production connector approval or live system-of-record mutation.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "validated-demo-pitch-runbooks",
      lane: "product",
      horizon: "next",
      sourceSystem: "scrimed-guided-execution + scrimed-proof-packet-studio",
      objective: "Turn demos into repeatable runbooks for buyers, investors, clinics, partners, and operators.",
      whyNow: "Repeatable proof increases sales consistency and lowers founder-dependent delivery overhead.",
      owner: "Product + Sales",
      proofRoute: "/scrimed-proof-packet-studio",
      apiRoute: "/api/scrimed-proof-packet-studio",
      nextAction: "Create one proof packet per audience with route-backed evidence, acceptance criteria, pricing motion, and next-step owner.",
      valueScore: 84,
      riskScore: 26,
      effortScore: 36,
      retainedBoundary: "Synthetic proof packaging only; no legal offer, customer activation, revenue guarantee, or production authority.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "aal2-protected-smoke-operator",
      lane: "operations",
      horizon: "blocked",
      sourceSystem: "AAL2 durable-store protected smoke",
      objective: "Run protected authenticated evidence only when a fresh authorized AAL2 token and enabled target store are available.",
      whyNow: "Protected evidence strengthens diligence, but fail-closed behavior must remain stronger than convenience.",
      owner: "Authorized Tenant Admin / Pilot Lead / Reviewer",
      proofRoute: "/qa-aal2-run-evidence",
      apiRoute: "/api/qa-evidence/aal2-smoke-readiness",
      nextAction: "Use the documented local token helper, then run the strict smoke only against a target with protected writes enabled.",
      valueScore: 78,
      riskScore: 62,
      effortScore: 42,
      retainedBoundary: "Operator-run only; no token logging, no bypass, no role weakening, and no durable write if protected store is disabled.",
      blockedActions: defaultBlockedActions
    }),
    focusItem({
      id: "live-phi-and-clinical-authority",
      lane: "trust-safety",
      horizon: "blocked",
      sourceSystem: "boundary-release-approvals",
      objective: "Preserve the highest-risk live data and clinical authority boundaries until evidence, legal, security, privacy, and clinical review are complete.",
      whyNow: "SCRIMED can sell governed synthetic pilots now while building the approval path for future clinical production.",
      owner: "Clinical Governance + Legal + Security",
      proofRoute: "/boundary-release-approvals",
      apiRoute: "/api/boundary-release-approvals",
      nextAction: "Keep live data, final clinical authority, patient outreach, payer submission, and record mutation blocked while collecting approval evidence.",
      valueScore: 100,
      riskScore: 95,
      effortScore: 86,
      retainedBoundary: "Boundary release requires qualified review, documented controls, external approvals where applicable, and human governance.",
      blockedActions: defaultBlockedActions
    })
  ];
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

export function getScrimedExecutionFocusSummary() {
  const market = getScrimedMarketExecutionSummary();
  const enterprise = getScrimedEnterpriseAccelerationSummary();
  const guided = getScrimedGuidedExecutionSummary();
  const operating = getScrimedOperatingCommandCenterSummary();
  const focusItems = buildScrimedExecutionFocusItems().sort((a, b) => {
    if (a.horizon !== b.horizon) {
      const order: Record<ScrimedFocusHorizon, number> = { now: 0, next: 1, blocked: 2 };
      return order[a.horizon] - order[b.horizon];
    }

    return b.focusScore - a.focusScore;
  });
  const nowItems = focusItems.filter((item) => item.horizon === "now");
  const nextItems = focusItems.filter((item) => item.horizon === "next");
  const blockedItems = focusItems.filter((item) => item.horizon === "blocked");
  const laneCounts = focusItems.reduce<Record<ScrimedFocusLane, number>>(
    (counts, item) => {
      counts[item.lane] += 1;
      return counts;
    },
    { revenue: 0, product: 0, "trust-safety": 0, investor: 0, operations: 0, platform: 0 }
  );
  const highestValueLane = focusItems.reduce((best, item) => {
    return item.valueScore > best.valueScore ? item : best;
  }, focusItems[0]).lane;

  return {
    service: "scrimed-execution-focus",
    status: scrimedExecutionFocusStatus,
    apiRoute: scrimedExecutionFocusApiRoute,
    briefRoute: scrimedExecutionFocusBriefRoute,
    pageRoute: scrimedExecutionFocusPageRoute,
    boundary: scrimedExecutionFocusBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    sourceSystems: [
      { service: market.service, status: market.status, route: market.pageRoute },
      { service: enterprise.service, status: enterprise.status, route: "/scrimed-enterprise-acceleration" },
      { service: guided.service, status: guided.status, route: guided.pageRoute },
      { service: operating.service, status: operating.status, route: "/scrimed-operating-command" }
    ],
    focusItems,
    nowItems,
    nextItems,
    blockedItems,
    laneCounts,
    operatingRules: scrimedExecutionFocusOperatingRules,
    scorecard: {
      nowCount: nowItems.length,
      nextCount: nextItems.length,
      blockedCount: blockedItems.length,
      averageNowFocusScore: average(nowItems.map((item) => item.focusScore)),
      highestValueLane,
      safetyPosture: "synthetic-human-reviewed",
      productionReadiness: false
    } satisfies ScrimedExecutionFocusScorecard,
    recommendedNextBuildStep:
      "Run SCRIMED from the now-focus queue: buyer proof-to-pilot, security diligence trust proof, investor evidence snapshot, and weekly operating hygiene before expanding more modules.",
    productionReadiness: false,
    noPhiConfirmed: true,
    humanReviewRequired: true
  };
}

export function buildScrimedExecutionFocusBrief() {
  const summary = getScrimedExecutionFocusSummary();

  return [
    "# SCRIMED Execution Focus Engine",
    "",
    `Status: ${summary.status}`,
    `Policy: ${summary.policyVersion}`,
    `API: ${summary.apiRoute}`,
    `Page: ${summary.pageRoute}`,
    "",
    summary.boundary,
    "",
    "## Now Focus",
    ...summary.nowItems.map(
      (item) =>
        `- ${item.id}: score=${item.focusScore}; owner=${item.owner}; route=${item.proofRoute}; next=${item.nextAction}`
    ),
    "",
    "## Next Focus",
    ...summary.nextItems.map(
      (item) =>
        `- ${item.id}: score=${item.focusScore}; owner=${item.owner}; route=${item.proofRoute}; boundary=${item.retainedBoundary}`
    ),
    "",
    "## Blocked Until Approved",
    ...summary.blockedItems.map(
      (item) =>
        `- ${item.id}: score=${item.focusScore}; owner=${item.owner}; retained boundary=${item.retainedBoundary}`
    ),
    "",
    "## Operating Rules",
    ...summary.operatingRules.map((rule) => `- ${rule}`),
    "",
    summary.recommendedNextBuildStep
  ].join("\n");
}
