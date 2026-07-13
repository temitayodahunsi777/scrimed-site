import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedSecurityReleaseStage =
  | "synthetic_demo_ready"
  | "buyer_diligence_ready"
  | "protected_no_phi_pilot_ready"
  | "phi_preproduction_blocked"
  | "live_phi_production_blocked";

export type ScrimedSecurityReleaseDecision = "go" | "conditional_go" | "no_go";

export type ScrimedSecurityReleaseGate = {
  id: string;
  name: string;
  decision: ScrimedSecurityReleaseDecision;
  owner: string;
  evidence: string[];
  requiredBefore: ScrimedSecurityReleaseStage;
  currentStatus: "passed" | "manual_required" | "external_required" | "blocked";
  automation: string;
  blockerIfMissing: string;
  retainedBoundary: string;
};

export type ScrimedSecurityReleaseLane = {
  stage: ScrimedSecurityReleaseStage;
  label: string;
  decision: ScrimedSecurityReleaseDecision;
  allowedUse: string[];
  blockedUse: string[];
  requiredEvidence: string[];
  exitCriteria: string[];
};

export type ScrimedSecurityReleaseReadinessScorecard = {
  currentStage: ScrimedSecurityReleaseStage;
  goGateCount: number;
  conditionalGateCount: number;
  noGoGateCount: number;
  blockedStageCount: number;
  releaseAuthority: "synthetic-and-no-phi-only";
  phiAuthority: "not-authorized-production-phi";
  customerGoLiveAuthority: "not-customer-go-live-approved";
  auditHash: string;
};

export const scrimedSecurityReleaseReadinessStatus =
  "scrimed-security-release-readiness-active-no-phi-no-customer-go-live";
export const scrimedSecurityReleaseReadinessBoundary =
  "SCRIMED Security Release Readiness is a no-PHI go/no-go control ladder. It permits synthetic demos, buyer diligence, and protected no-PHI pilot preparation only. It does not approve live PHI, customer go-live, production connectors, payer submission, EHR writeback, regulated clinical use, security certification, SOC 2, HITRUST, HIPAA, FDA, penetration-test completion, or breach immunity.";

const retainedBoundary =
  "No live PHI, no production connector approval, no customer go-live, no payer submission, no EHR writeback, no clinical authority, and no security certification claim.";

export const scrimedSecurityReleaseGates: ScrimedSecurityReleaseGate[] = [
  {
    id: "no-secret-assurance",
    name: "No-secret security assurance",
    decision: "go",
    owner: "Platform security",
    evidence: ["npm run security:assurance", "npm run test:nonsecret"],
    requiredBefore: "synthetic_demo_ready",
    currentStatus: "passed",
    automation: "Static token-like scan and unsafe-claim checks cover curated source, docs, scripts, migrations, and public assets.",
    blockerIfMissing: "Cannot package demos, diligence, or protected no-PHI evidence if secrets or unsafe claims are present.",
    retainedBoundary
  },
  {
    id: "browser-and-proxy-hardening",
    name: "Browser and proxy hardening",
    decision: "go",
    owner: "Platform security",
    evidence: ["next.config.js", "proxy.ts", "npm run smoke:scrimed-cyber-defense"],
    requiredBefore: "synthetic_demo_ready",
    currentStatus: "passed",
    automation: "CSP, HSTS, CORP, COOP, no-authority headers, and middleware-bypass header stripping are contract-checked.",
    blockerIfMissing: "Public routes cannot be considered diligence-ready if hardening headers or sanitizer controls drift.",
    retainedBoundary
  },
  {
    id: "protected-route-fail-closed",
    name: "Protected route fail-closed posture",
    decision: "go",
    owner: "Platform reliability + security",
    evidence: ["npm run smoke:public", "scripts/aal2-token-policy-selftest.mjs"],
    requiredBefore: "buyer_diligence_ready",
    currentStatus: "passed",
    automation: "Public smoke verifies protected buyer, operator, AAL2, and proof routes fail closed without credentials.",
    blockerIfMissing: "Buyer diligence cannot proceed if protected routes expose data or mutate state without authorization.",
    retainedBoundary
  },
  {
    id: "aal2-authorized-happy-path",
    name: "AAL2 authorized happy path",
    decision: "conditional_go",
    owner: "Tenant admin or authorized operator",
    evidence: ["npm run smoke:aal2:token", "npm run smoke:aal2:durable-store:strict"],
    requiredBefore: "protected_no_phi_pilot_ready",
    currentStatus: "manual_required",
    automation: "Token preflight and strict durable-store smoke run only with a short-lived authorized token supplied outside source control.",
    blockerIfMissing: "Protected no-PHI pilot operations stay manual/blocked until an authorized operator validates the happy path.",
    retainedBoundary
  },
  {
    id: "waf-siem-sbom-external-review",
    name: "WAF, SIEM, SBOM, and external security review",
    decision: "no_go",
    owner: "Security lead + qualified external reviewers",
    evidence: ["external WAF policy", "redacted SIEM/log drain proof", "SBOM artifact", "external security review"],
    requiredBefore: "phi_preproduction_blocked",
    currentStatus: "external_required",
    automation: "Tracked as required external evidence; not self-attested by SCRIMED code.",
    blockerIfMissing: "PHI preproduction, regulated connectors, and customer go-live remain blocked.",
    retainedBoundary
  },
  {
    id: "baa-privacy-retention-tabletop",
    name: "BAA, privacy, retention, and incident tabletop",
    decision: "no_go",
    owner: "Privacy lead + legal + customer security",
    evidence: ["BAA or customer agreement", "privacy risk assessment", "retention policy", "incident tabletop record"],
    requiredBefore: "live_phi_production_blocked",
    currentStatus: "external_required",
    automation: "Tracked as a mandatory release lane with no code-only bypass.",
    blockerIfMissing: "Live PHI, customer go-live, and production connector activation remain blocked.",
    retainedBoundary
  }
];

export const scrimedSecurityReleaseLanes: ScrimedSecurityReleaseLane[] = [
  {
    stage: "synthetic_demo_ready",
    label: "Synthetic demo ready",
    decision: "go",
    allowedUse: ["Public no-PHI demos", "Synthetic evaluation", "Investor/buyer proof review", "Internal security assurance"],
    blockedUse: ["Live PHI", "Customer go-live", "EHR writeback", "Payer submission"],
    requiredEvidence: ["No-secret assurance", "Browser hardening", "Proxy sanitizer", "Safety governance"],
    exitCriteria: ["Public smoke passes", "Security assurance passes", "No unsafe claims detected"]
  },
  {
    stage: "buyer_diligence_ready",
    label: "Buyer diligence ready",
    decision: "go",
    allowedUse: ["Buyer diligence packets", "Protected evidence review", "No-PHI pilot scoping"],
    blockedUse: ["Production credentials", "Raw connector payloads", "Customer deployment claims"],
    requiredEvidence: ["Protected routes fail closed", "No-authority headers", "Risk and boundary docs"],
    exitCriteria: ["Protected route smoke passes", "Security release ladder remains no-PHI"]
  },
  {
    stage: "protected_no_phi_pilot_ready",
    label: "Protected no-PHI pilot ready",
    decision: "conditional_go",
    allowedUse: ["AAL2 protected no-PHI pilot workspace", "Short-lived authorized operator smoke", "Evidence binding"],
    blockedUse: ["Live records", "Production connector writes", "Autonomous clinical action"],
    requiredEvidence: ["Strict AAL2 happy path", "Tenant role verification", "Durable-store feature flag enabled"],
    exitCriteria: ["Authorized operator smoke passes", "Reviewer roles verified", "No PHI fixtures used"]
  },
  {
    stage: "phi_preproduction_blocked",
    label: "PHI preproduction blocked",
    decision: "no_go",
    allowedUse: ["Planning only", "External evidence collection", "Customer security questionnaire preparation"],
    blockedUse: ["PHI ingestion", "PHI model routing", "Production connector approval"],
    requiredEvidence: ["WAF", "SIEM", "SBOM", "external security review", "privacy risk assessment"],
    exitCriteria: ["Qualified external reviewers approve evidence", "Legal/privacy owners sign release packet"]
  },
  {
    stage: "live_phi_production_blocked",
    label: "Live PHI production blocked",
    decision: "no_go",
    allowedUse: ["No code-only activation"],
    blockedUse: ["Customer go-live", "Live PHI processing", "EHR writeback", "Payer submission", "Clinical production claims"],
    requiredEvidence: ["BAA/customer agreement", "incident tabletop", "retention policy", "customer-specific threat model"],
    exitCriteria: ["Formal customer, legal, privacy, security, and clinical governance approvals exist outside code"]
  }
];

export function getScrimedSecurityReleaseReadinessScorecard(): ScrimedSecurityReleaseReadinessScorecard {
  const goGateCount = scrimedSecurityReleaseGates.filter((gate) => gate.decision === "go").length;
  const conditionalGateCount = scrimedSecurityReleaseGates.filter((gate) => gate.decision === "conditional_go").length;
  const noGoGateCount = scrimedSecurityReleaseGates.filter((gate) => gate.decision === "no_go").length;
  const blockedStageCount = scrimedSecurityReleaseLanes.filter((lane) => lane.decision === "no_go").length;

  return {
    currentStage: "buyer_diligence_ready",
    goGateCount,
    conditionalGateCount,
    noGoGateCount,
    blockedStageCount,
    releaseAuthority: "synthetic-and-no-phi-only",
    phiAuthority: "not-authorized-production-phi",
    customerGoLiveAuthority: "not-customer-go-live-approved",
    auditHash: generateScrimedAuditHash({
      status: scrimedSecurityReleaseReadinessStatus,
      safetyPolicyVersion: scrimedSafetyPolicyVersion,
      gates: scrimedSecurityReleaseGates.map((gate) => [gate.id, gate.decision, gate.currentStatus]),
      lanes: scrimedSecurityReleaseLanes.map((lane) => [lane.stage, lane.decision])
    })
  };
}

export function getScrimedSecurityReleaseReadinessSummary() {
  return {
    service: "scrimed-security-release-readiness",
    status: scrimedSecurityReleaseReadinessStatus,
    boundary: scrimedSecurityReleaseReadinessBoundary,
    safetyPolicyVersion: scrimedSafetyPolicyVersion,
    scorecard: getScrimedSecurityReleaseReadinessScorecard(),
    gates: scrimedSecurityReleaseGates,
    lanes: scrimedSecurityReleaseLanes,
    nextRequiredOperatorActions: [
      "Run strict AAL2 durable-store happy path with a short-lived authorized token before protected no-PHI pilot use.",
      "Attach WAF, bot controls, SIEM/log drains, SBOM, and external security review before PHI preproduction.",
      "Complete BAA/customer agreement, privacy assessment, retention policy, and incident tabletop before live PHI production.",
      "Keep all production connector, payer submission, EHR writeback, and customer go-live language blocked until external approvals exist."
    ]
  };
}
