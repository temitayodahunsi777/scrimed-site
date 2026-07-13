import { getHealthcareValueRealizationSummary } from "./healthcareValueRealization";
import { getPilotActivationPlannerSummary } from "./pilotActivationPlanner";
import { getPilotHandoffCommandSummary } from "./pilotHandoffCommand";
import { getPilotValueEvidenceSummary } from "./pilotValueEvidence";
import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type PilotSuccessReviewWindow = "day-30" | "day-60" | "day-90" | "post-pilot";

export type PilotSuccessReviewDomain =
  | "workflow-value"
  | "buyer-adoption"
  | "security-governance"
  | "clinical-governance"
  | "rcm-documentation"
  | "implementation"
  | "commercial-readiness"
  | "investor-diligence";

export type PilotSuccessReviewStatus =
  | "ready-for-review"
  | "review-required"
  | "evidence-gap"
  | "external-approval-required"
  | "blocked-before-claim";

export type PilotSuccessReviewAuthority = {
  phiAuthority: "not-authorized-production-phi";
  clinicalCareAuthority: "not-authorized-live-care";
  financialAuthority: "not-audited-financial-report";
  roiAuthority: "not-roi-guarantee";
  revenueAuthority: "not-revenue-guarantee";
  commercialAuthority: "not-binding-commercial-offer";
  customerActivationAuthority: "not-customer-go-live-approval";
  externalDistributionAuthority: "human-review-required";
  legalAuthority: "qualified-review-required";
};

export type PilotSuccessReviewPlan = {
  id: string;
  window: PilotSuccessReviewWindow;
  domain: PilotSuccessReviewDomain;
  name: string;
  reviewQuestion: string;
  evidenceInputs: string[];
  reviewerRole: string;
  successSignal: string;
  claimSafeOutput: string;
  blockedClaim: string;
  status: PilotSuccessReviewStatus;
  proofRoutes: string[];
  auditHash: string;
};

export type PilotSuccessEvidenceGap = {
  id: string;
  gap: string;
  impact: string;
  workaround: string;
  owner: string;
  status: PilotSuccessReviewStatus;
  proofRoute: string;
};

export type PilotExpansionReadinessItem = {
  id: string;
  opportunity: string;
  prerequisite: string;
  safeCommercialNextStep: string;
  blockedCommercialAction: string;
  reviewerOwner: string;
  readiness: PilotSuccessReviewStatus;
  proofRoutes: string[];
};

export const pilotSuccessReviewCommandRoute = "/pilot-success-review-command";
export const pilotSuccessReviewCommandApiRoute = "/api/pilot-success-review-command";
export const pilotSuccessReviewCommandBriefRoute = "/api/pilot-success-review-command/brief";
export const pilotSuccessReviewCommandStatus =
  "pilot-success-review-command-active-synthetic-no-roi-guarantee";
export const pilotSuccessReviewCommandBriefStatus =
  "pilot-success-review-command-brief-ready-human-review-required";
export const pilotSuccessReviewCommandUpdatedAt = "2026-07-09";

export const pilotSuccessReviewCommandBoundary =
  "SCRIMED Pilot Success Review Command converts synthetic pilot evidence, activation plans, and handoff packets into 30/60/90-day review plans, evidence-gap tracking, expansion readiness, and claims-safe follow-up. It does not authorize live PHI, autonomous clinical care, diagnosis, treatment, prescribing, patient outreach, payer submission, EHR writeback, production deployment, customer activation, audited financial reporting, ROI guarantees, revenue guarantees, profit guarantees, valuation assurance, binding commercial offers, certification claims, securities material, or legal/procurement approval.";

const authority: PilotSuccessReviewAuthority = {
  phiAuthority: "not-authorized-production-phi",
  clinicalCareAuthority: "not-authorized-live-care",
  financialAuthority: "not-audited-financial-report",
  roiAuthority: "not-roi-guarantee",
  revenueAuthority: "not-revenue-guarantee",
  commercialAuthority: "not-binding-commercial-offer",
  customerActivationAuthority: "not-customer-go-live-approval",
  externalDistributionAuthority: "human-review-required",
  legalAuthority: "qualified-review-required"
};

const blockedSuccessClaims = [
  "ROI guarantee",
  "revenue guarantee",
  "profit guarantee",
  "valuation assurance",
  "audited financial statement",
  "binding commercial offer",
  "customer go-live approval",
  "production deployment approval",
  "clinical validation claim",
  "certification, legal, or regulatory approval claim",
  "payer submission or coverage determination",
  "patient outreach approval",
  "live PHI processing",
  "autonomous clinical care"
];

function successHash(id: string, label: string) {
  return generateScrimedAuditHash({
    id,
    label,
    boundary: pilotSuccessReviewCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    updated: pilotSuccessReviewCommandUpdatedAt
  });
}

function createReviewPlan(plan: Omit<PilotSuccessReviewPlan, "auditHash">): PilotSuccessReviewPlan {
  return {
    ...plan,
    auditHash: successHash(plan.id, plan.name)
  };
}

export function getPilotSuccessReviewCommandSummary() {
  const valueEvidence = getPilotValueEvidenceSummary();
  const valueRealization = getHealthcareValueRealizationSummary();
  const activation = getPilotActivationPlannerSummary();
  const handoff = getPilotHandoffCommandSummary();

  const reviewPlans: PilotSuccessReviewPlan[] = [
    createReviewPlan({
      id: "day-30-workflow-fit-review",
      window: "day-30",
      domain: "workflow-value",
      name: "30-day workflow-fit review",
      reviewQuestion: "Did the synthetic pilot evidence map to a buyer-recognized workflow problem and owner path?",
      evidenceInputs: ["selected evidence packet", "handoff packet", "buyer owner map", "review notes"],
      reviewerRole: "Delivery Lead + Buyer Sponsor",
      successSignal: "Buyer confirms the workflow problem, owner, and next review milestone.",
      claimSafeOutput: "Workflow-fit readiness summary with evidence gaps and retained no-go boundaries.",
      blockedClaim: "No productivity, ROI, savings, or staffing reduction guarantee.",
      status: "ready-for-review",
      proofRoutes: [valueEvidence.route, activation.route, handoff.route]
    }),
    createReviewPlan({
      id: "day-30-security-governance-review",
      window: "day-30",
      domain: "security-governance",
      name: "30-day security and governance review",
      reviewQuestion: "Are data boundaries, security contacts, deployment assumptions, and questionnaire blockers documented?",
      evidenceInputs: ["security handoff", "data-boundary statement", "blocked raw-payload notes", "approval owner map"],
      reviewerRole: "Security + Data Governance",
      successSignal: "Security reviewer confirms metadata-only discovery path or lists missing approvals.",
      claimSafeOutput: "Security readiness note with unresolved approval blockers.",
      blockedClaim: "No certification, live PHI authorization, production connector approval, or security guarantee.",
      status: "external-approval-required",
      proofRoutes: [handoff.route, "/scrimed-cyber-defense", "/clinical-data-governance"]
    }),
    createReviewPlan({
      id: "day-60-adoption-friction-review",
      window: "day-60",
      domain: "buyer-adoption",
      name: "60-day buyer adoption friction review",
      reviewQuestion: "Which workflow, meeting, documentation, or owner bottlenecks are slowing pilot expansion?",
      evidenceInputs: ["handoff checklist", "implementation cadence", "artifact tracker", "reviewer notes"],
      reviewerRole: "Implementation Lead + Customer Success",
      successSignal: "Friction points are owner-bound and queued with safe workarounds.",
      claimSafeOutput: "Adoption friction map and owner-bound action register.",
      blockedClaim: "No customer activation approval, patient outreach approval, or operational outcome guarantee.",
      status: "ready-for-review",
      proofRoutes: [handoff.route, "/service-delivery", "/client-onboarding"]
    }),
    createReviewPlan({
      id: "day-60-clinical-governance-review",
      window: "day-60",
      domain: "clinical-governance",
      name: "60-day clinical governance review",
      reviewQuestion: "Does any buyer-facing language imply clinical authority beyond decision support?",
      evidenceInputs: ["clinical governance handoff", "clinical boundary language", "reviewer checklist", "escalation criteria"],
      reviewerRole: "Clinical Governance",
      successSignal: "Clinical-facing language remains decision-support-only and reviewer-gated.",
      claimSafeOutput: "Clinical governance posture note with blocked authority claims.",
      blockedClaim: "No diagnosis, treatment, prescribing, triage, final imaging interpretation, or live-care claim.",
      status: "blocked-before-claim",
      proofRoutes: [handoff.route, "/clinical-authority-readiness", "/clinical-production-readiness"]
    }),
    createReviewPlan({
      id: "day-90-commercial-readiness-review",
      window: "day-90",
      domain: "commercial-readiness",
      name: "90-day commercial readiness review",
      reviewQuestion: "Is there enough reviewed evidence to propose a next scoped paid package without overclaiming outcomes?",
      evidenceInputs: ["reviewed evidence packets", "success criteria", "risk controls", "gap register", "owner signoffs"],
      reviewerRole: "Founder + Commercial Operations + Qualified Review",
      successSignal: "Next scoped package is framed as measurement and implementation work, not guaranteed ROI.",
      claimSafeOutput: "Claims-safe expansion readiness note and next package recommendation.",
      blockedClaim: "No binding commercial offer, ROI guarantee, revenue guarantee, valuation assurance, or legal approval.",
      status: "review-required" as PilotSuccessReviewStatus,
      proofRoutes: [valueRealization.route, activation.route, "/pricing", "/offerings"]
    }),
    createReviewPlan({
      id: "post-pilot-investor-proof-review",
      window: "post-pilot",
      domain: "investor-diligence",
      name: "Post-pilot investor proof review",
      reviewQuestion: "Which route-backed proof artifacts can support investor diligence without becoming securities material?",
      evidenceInputs: ["validated route list", "risk register", "review notes", "no-go boundary map", "next milestones"],
      reviewerRole: "Founder + Qualified Reviewer",
      successSignal: "Investor narrative references route-backed evidence and clearly separates readiness from claims.",
      claimSafeOutput: "Investor diligence appendix with proof routes, risks, and next milestones.",
      blockedClaim: "No securities material, investment advice, valuation assurance, or audited financial reporting.",
      status: "review-required" as PilotSuccessReviewStatus,
      proofRoutes: [handoff.route, "/investor-audience-readiness", "/investor-readiness", "/risk-register"]
    })
  ];

  const evidenceGaps: PilotSuccessEvidenceGap[] = [
    {
      id: "missing-buyer-reviewer-notes",
      gap: "Buyer reviewer notes are missing or not mapped to evidence packets.",
      impact: "Weakens buyer confidence and makes claims harder to defend.",
      workaround: "Keep the outcome narrative internal until reviewer notes are attached.",
      owner: "Customer Success + Delivery Lead",
      status: "evidence-gap",
      proofRoute: handoff.route
    },
    {
      id: "missing-security-disposition",
      gap: "Security questionnaire or data-boundary disposition is missing.",
      impact: "Blocks protected pilot progression and enterprise IT confidence.",
      workaround: "Run metadata-only security review and document unresolved external approvals.",
      owner: "Security + Data Governance",
      status: "external-approval-required",
      proofRoute: "/scrimed-cyber-defense"
    },
    {
      id: "clinical-language-ambiguity",
      gap: "Clinical-facing summary language may be interpreted as clinical authority.",
      impact: "Creates regulatory, safety, and buyer-trust risk.",
      workaround: "Route through clinical governance and use decision-support-only language.",
      owner: "Clinical Governance",
      status: "blocked-before-claim",
      proofRoute: "/clinical-authority-readiness"
    },
    {
      id: "commercial-overclaim-risk",
      gap: "Commercial summary uses outcome language without sufficient reviewed evidence.",
      impact: "Creates ROI, revenue, valuation, or customer-activation overclaim risk.",
      workaround: "Use measurement-framework language and hold expansion packet for qualified review.",
      owner: "Commercial Operations + Qualified Review",
      status: "blocked-before-claim",
      proofRoute: valueRealization.route
    },
    {
      id: "implementation-owner-gap",
      gap: "Implementation owner, cadence, or escalation path is incomplete.",
      impact: "Slows pilot expansion and creates handoff ambiguity.",
      workaround: "Resolve owner map before proposing any expansion step.",
      owner: "Implementation Lead",
      status: "evidence-gap",
      proofRoute: "/client-onboarding"
    }
  ];

  const expansionReadiness: PilotExpansionReadinessItem[] = [
    {
      id: "workflow-expansion-scope",
      opportunity: "Expand from workflow discovery into a paid implementation sprint.",
      prerequisite: "Reviewed 30/60-day evidence packet, buyer owner notes, and implementation cadence.",
      safeCommercialNextStep: "Prepare a scoped implementation sprint recommendation with qualified review.",
      blockedCommercialAction: "No binding offer, ROI guarantee, staffing reduction claim, or customer activation approval.",
      reviewerOwner: "Founder + Delivery Lead",
      readiness: "ready-for-review",
      proofRoutes: [activation.route, handoff.route, valueRealization.route]
    },
    {
      id: "security-diligence-package",
      opportunity: "Move security questionnaire support into paid diligence.",
      prerequisite: "Security contact, questionnaire scope, data-boundary statement, and no-secret evidence packet.",
      safeCommercialNextStep: "Offer paid diligence support for questionnaire and evidence-room preparation.",
      blockedCommercialAction: "No certification claim, breach guarantee, production connector approval, or live PHI authorization.",
      reviewerOwner: "Security + Founder",
      readiness: "external-approval-required",
      proofRoutes: [handoff.route, "/scrimed-cyber-defense", "/deployment-drift-guard"]
    },
    {
      id: "rcm-documentation-package",
      opportunity: "Expand RCM documentation review into a structured prior-authorization readiness package.",
      prerequisite: "Synthetic documentation scenario, RCM reviewer notes, and payer-policy metadata boundary.",
      safeCommercialNextStep: "Propose documentation completeness review and draft packet QA.",
      blockedCommercialAction: "No payer submission, claim submission, coverage determination, reimbursement assurance, or payment execution.",
      reviewerOwner: "RCM Compliance",
      readiness: "external-approval-required",
      proofRoutes: [handoff.route, "/scrimed-clinical-benchmark-suite", valueEvidence.route]
    },
    {
      id: "investor-proof-package",
      opportunity: "Convert pilot review evidence into an investor diligence appendix.",
      prerequisite: "Validated proof routes, risk register, boundaries, and next milestone ledger.",
      safeCommercialNextStep: "Prepare claims-safe diligence appendix after founder and qualified review.",
      blockedCommercialAction: "No securities material, investment advice, valuation assurance, audited financial statement, or fundraising guarantee.",
      reviewerOwner: "Founder + Qualified Reviewer",
      readiness: "review-required",
      proofRoutes: [handoff.route, "/investor-audience-readiness", "/risk-register"]
    }
  ];

  return {
    service: "scrimed-pilot-success-review-command",
    status: pilotSuccessReviewCommandStatus,
    briefStatus: pilotSuccessReviewCommandBriefStatus,
    route: pilotSuccessReviewCommandRoute,
    apiRoute: pilotSuccessReviewCommandApiRoute,
    briefRoute: pilotSuccessReviewCommandBriefRoute,
    updated: pilotSuccessReviewCommandUpdatedAt,
    boundary: pilotSuccessReviewCommandBoundary,
    policyVersion: scrimedSafetyPolicyVersion,
    authority,
    sourceAlignment: {
      pilotValueEvidenceStatus: valueEvidence.status,
      healthcareValueRealizationStatus: valueRealization.status,
      activationPlannerStatus: activation.status,
      handoffCommandStatus: handoff.status,
      handoffPacketCount: handoff.packetCount
    },
    reviewPlanCount: reviewPlans.length,
    evidenceGapCount: evidenceGaps.length,
    expansionReadinessCount: expansionReadiness.length,
    blockedClaimCount: blockedSuccessClaims.length,
    blockedBeforeClaimCount: reviewPlans.filter((plan) => plan.status === "blocked-before-claim").length + evidenceGaps.filter((gap) => gap.status === "blocked-before-claim").length,
    externalApprovalRequiredCount: reviewPlans.filter((plan) => plan.status === "external-approval-required").length + evidenceGaps.filter((gap) => gap.status === "external-approval-required").length + expansionReadiness.filter((item) => item.readiness === "external-approval-required").length,
    proofRouteCount: new Set([
      ...reviewPlans.flatMap((plan) => plan.proofRoutes),
      ...evidenceGaps.map((gap) => gap.proofRoute),
      ...expansionReadiness.flatMap((item) => item.proofRoutes)
    ]).size,
    reviewPlans,
    topReviewPlans: reviewPlans.slice(0, 4),
    evidenceGaps,
    expansionReadiness,
    blockedClaims: blockedSuccessClaims,
    nextBestMove:
      "Attach reviewer notes to the selected handoff packet, run the evidence-gap checklist, and prepare a claims-safe 30/60/90-day review summary before any buyer or investor distribution."
  };
}

export function buildPilotSuccessReviewCommandBrief() {
  const summary = getPilotSuccessReviewCommandSummary();

  return [
    "# SCRIMED Pilot Success Review Command Brief",
    "",
    `Status: ${summary.status}`,
    `Updated: ${summary.updated}`,
    `Review plans: ${summary.reviewPlanCount}`,
    `Evidence gaps: ${summary.evidenceGapCount}`,
    `Expansion readiness items: ${summary.expansionReadinessCount}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is synthetic-only success review planning. It does not authorize live PHI, autonomous clinical care, patient outreach, payer submission, EHR writeback, production deployment, customer activation, audited financial reporting, ROI guarantees, revenue guarantees, profit guarantees, valuation assurance, binding commercial offers, certification claims, securities material, or legal/procurement approval.",
    "",
    "## Review Plans",
    ...summary.reviewPlans.map(
      (plan) =>
        `- ${plan.name} (${plan.window}, ${plan.status}): ${plan.reviewQuestion} Output: ${plan.claimSafeOutput}`
    ),
    "",
    "## Evidence Gaps",
    ...summary.evidenceGaps.map(
      (gap) =>
        `- ${gap.gap} (${gap.status}): ${gap.workaround} Owner: ${gap.owner}`
    ),
    "",
    "## Expansion Readiness",
    ...summary.expansionReadiness.map(
      (item) =>
        `- ${item.opportunity} (${item.readiness}): ${item.safeCommercialNextStep} Blocked: ${item.blockedCommercialAction}`
    ),
    "",
    `Next best move: ${summary.nextBestMove}`
  ].join("\n");
}
