export type ScrimedAllowedAction =
  | "synthetic-evaluation"
  | "demo-workflow"
  | "clinical-robustness-lab"
  | "audit-preparation"
  | "investor-buyer-diligence"
  | "internal-testing";

export type ScrimedBlockedAction =
  | "live-phi"
  | "clinical-diagnosis"
  | "treatment-recommendation"
  | "prescribing"
  | "patient-outreach"
  | "payer-submission"
  | "ehr-writeback"
  | "production-connector-approval"
  | "certification-validation-claim";

export type ScrimedPolicyDecision = {
  allowed: boolean;
  status: "allowed" | "blocked";
  statusCode: 200 | 403;
  policyVersion: string;
  route: string;
  requestedAction: string;
  inputClassification: "synthetic-no-phi" | "metadata-only" | "phi-or-sensitive-risk" | "unknown";
  phiDetected: boolean;
  synthetic: boolean;
  matchedAllowedActions: ScrimedAllowedAction[];
  matchedBlockedActions: ScrimedBlockedAction[];
  reason: string;
  noGoBoundaries: string[];
};

export const scrimedSafetyPolicyVersion = "scrimed-safety-governance-v2026-06-29";

export const scrimedAllowedActions: Record<ScrimedAllowedAction, string> = {
  "synthetic-evaluation": "Synthetic, no-PHI workflow evaluation and readiness scoring.",
  "demo-workflow": "No-PHI demo workflows, buyer proof, and synthetic examples.",
  "clinical-robustness-lab": "Synthetic clinical robustness and adversarial readiness testing.",
  "audit-preparation": "Readiness audits, control mapping, evidence packets, and internal review.",
  "investor-buyer-diligence": "Investor, buyer, and enterprise diligence material without regulated claims.",
  "internal-testing": "No-secret, no-PHI local and CI tests."
};

export const scrimedBlockedActions: Record<ScrimedBlockedAction, string> = {
  "live-phi": "Live PHI/ePHI, patient identifiers, source charts, production credentials, or live records.",
  "clinical-diagnosis": "Autonomous or final diagnosis, triage replacement, or clinical decision authority.",
  "treatment-recommendation": "Autonomous treatment plans, patient-specific care instructions, or therapy selection.",
  prescribing: "Medication prescribing, medication changes, order placement, or pharmacy actions.",
  "patient-outreach": "Patient texting, calling, emailing, portal messaging, or outreach automation.",
  "payer-submission": "Claims submission, prior authorization submission, appeal filing, or reimbursement assurance.",
  "ehr-writeback": "EHR writeback, chart filing, record mutation, order entry, or connector writes.",
  "production-connector-approval": "Production EHR, payer, device, imaging, or third-party connector activation approval.",
  "certification-validation-claim": "HIPAA, SOC 2, HITRUST, FDA, ONC, clinical validation, security, or accessibility certification claims."
};

export const scrimedNoGoBoundaries = Object.values(scrimedBlockedActions);

const phiPatterns = [
  /\b\d{3}-\d{2}-\d{4}\b/i,
  /\b(?:mrn|medical record number|member id|subscriber id|policy id)\s*[:#]?\s*[a-z0-9-]{4,}\b/i,
  /\b(?:dob|date of birth)\s*[:#]?\s*\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/i,
  /\b[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}\b/i,
  /\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/i
];

const blockedPatterns: Array<{ action: ScrimedBlockedAction; pattern: RegExp }> = [
  { action: "live-phi", pattern: /\b(live phi|ephi|real patient|source chart|production patient|patient identifier)\b/i },
  { action: "clinical-diagnosis", pattern: /\b(diagnose|diagnosis|triage patient|final clinical decision)\b/i },
  { action: "treatment-recommendation", pattern: /\b(treat|treatment recommendation|care plan recommendation|therapy selection)\b/i },
  { action: "prescribing", pattern: /\b(prescribe|prescribing|order medication|change medication|pharmacy)\b/i },
  { action: "patient-outreach", pattern: /\b(text|call|email|notify|message)\b.*\b(patient|member)\b/i },
  { action: "payer-submission", pattern: /\b(submit|file|send)\b.*\b(claim|prior auth|authorization|appeal|payer)\b/i },
  { action: "ehr-writeback", pattern: /\b(write|file|post|update|commit|mutate)\b.*\b(ehr|chart|record|order)\b/i },
  { action: "production-connector-approval", pattern: /\b(production connector|approve connector|go live connector|live ehr|live payer)\b/i },
  { action: "certification-validation-claim", pattern: /\b(hipaa certified|soc 2 certified|hitrust certified|fda cleared|onc certified|clinically validated|security certified)\b/i }
];

const allowedPatterns: Array<{ action: ScrimedAllowedAction; pattern: RegExp }> = [
  { action: "synthetic-evaluation", pattern: /\b(synthetic|no-phi|fixture|evaluation)\b/i },
  { action: "demo-workflow", pattern: /\b(demo|pilot|buyer proof|sample)\b/i },
  { action: "clinical-robustness-lab", pattern: /\b(robustness|adversarial|hallucination|missing data)\b/i },
  { action: "audit-preparation", pattern: /\b(audit|readiness|evidence|control|proof)\b/i },
  { action: "investor-buyer-diligence", pattern: /\b(investor|buyer|diligence|enterprise)\b/i },
  { action: "internal-testing", pattern: /\b(test|smoke|contract|ci)\b/i }
];

function unique<T>(values: T[]) {
  return Array.from(new Set(values));
}

export function classifyScrimedInput(inputText = "") {
  const phiDetected = phiPatterns.some((pattern) => pattern.test(inputText));
  const synthetic = /\b(synthetic|no-phi|metadata-only|demo|fixture|readiness)\b/i.test(inputText);

  return {
    phiDetected,
    synthetic,
    inputClassification: phiDetected
      ? "phi-or-sensitive-risk"
      : synthetic
        ? "synthetic-no-phi"
        : inputText.trim()
          ? "metadata-only"
          : "unknown"
  } as const;
}

export function evaluateScrimedSafetyGate(input: {
  route: string;
  requestedAction: string;
  inputText?: string;
  allowMetadataOnly?: boolean;
}): ScrimedPolicyDecision {
  const searchable = [input.route, input.requestedAction, input.inputText ?? ""].join(" ");
  const classification = classifyScrimedInput(searchable);
  const matchedBlockedActions = unique(
    blockedPatterns
      .filter(({ pattern }) => pattern.test(searchable))
      .map(({ action }) => action)
  );
  const matchedAllowedActions = unique(
    allowedPatterns
      .filter(({ pattern }) => pattern.test(searchable))
      .map(({ action }) => action)
  );
  const blocked = classification.phiDetected || matchedBlockedActions.length > 0;
  const allowed =
    !blocked &&
    (matchedAllowedActions.length > 0 || Boolean(input.allowMetadataOnly));

  return {
    allowed,
    status: allowed ? "allowed" : "blocked",
    statusCode: allowed ? 200 : 403,
    policyVersion: scrimedSafetyPolicyVersion,
    route: input.route,
    requestedAction: input.requestedAction,
    inputClassification: classification.inputClassification,
    phiDetected: classification.phiDetected,
    synthetic: classification.synthetic,
    matchedAllowedActions,
    matchedBlockedActions,
    reason: allowed
      ? "Request stays inside SCRIMED's current synthetic, no-PHI, human-reviewed readiness boundary."
      : "Request is blocked by SCRIMED's current no-PHI, no-live-care, no-autonomous-action safety policy.",
    noGoBoundaries: scrimedNoGoBoundaries
  };
}

export function scrimedSafetyHeaders(decision?: ScrimedPolicyDecision) {
  return {
    "X-SCRIMED-Safety-Policy": scrimedSafetyPolicyVersion,
    "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
    "X-SCRIMED-Clinical-Authority": "not-authorized-live-care",
    "X-SCRIMED-Autonomous-Clinical-Authority": "not-authorized-autonomous-clinical-action",
    "X-SCRIMED-Production-Connector-Authority": "not-production-connector-approved",
    "X-SCRIMED-Certification-Authority": "not-certified-readiness-only",
    ...(decision
      ? {
          "X-SCRIMED-Safety-Decision": decision.status,
          "X-SCRIMED-Input-Classification": decision.inputClassification
        }
      : {})
  };
}

export function getScrimedSafetyGovernanceSummary() {
  const allowedDemoDecision = evaluateScrimedSafetyGate({
    route: "/clinical-robustness-lab",
    requestedAction: "synthetic evaluation demo workflow robustness audit preparation",
    allowMetadataOnly: true
  });
  const blockedPhiDecision = evaluateScrimedSafetyGate({
    route: "/api/safety-governance/self-test",
    requestedAction: "write live PHI to EHR and diagnose patient"
  });

  return {
    service: "scrimed-safety-governance-gate",
    policyVersion: scrimedSafetyPolicyVersion,
    status: "active-fail-closed",
    allowedActions: scrimedAllowedActions,
    blockedActions: scrimedBlockedActions,
    noGoBoundaries: scrimedNoGoBoundaries,
    selfTest: {
      allowedDemoDecision,
      blockedPhiDecision,
      failClosedVerified: allowedDemoDecision.allowed && !blockedPhiDecision.allowed
    }
  };
}
