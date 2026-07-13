export type EnterpriseRiskCategory =
  | "PHI/privacy"
  | "clinical safety"
  | "model hallucination"
  | "model drift"
  | "bias"
  | "cybersecurity"
  | "vendor dependency"
  | "cost spike/API abuse"
  | "auditability"
  | "regulatory claims"
  | "EHR integration"
  | "payer workflow"
  | "deployment security";

export type EnterpriseRiskSeverity = "critical" | "high" | "medium";
export type EnterpriseRiskLikelihood = "likely" | "possible" | "unlikely";
export type EnterpriseRiskStatus = "controlled" | "mitigating" | "blocked-before-production";

export type EnterpriseRisk = {
  id: string;
  category: EnterpriseRiskCategory;
  severity: EnterpriseRiskSeverity;
  likelihood: EnterpriseRiskLikelihood;
  mitigation: string;
  ownerPlaceholder: string;
  currentStatus: EnterpriseRiskStatus;
  evidenceLink: string;
};

export const enterpriseRiskRegisterRoute = "/risk-register";
export const enterpriseRiskRegisterApiRoute = "/api/risk-register";
export const enterpriseRiskRegisterStatus = "enterprise-risk-register-active-no-phi";
export const enterpriseRiskRegisterUpdatedAt = "2026-06-29";

export const enterpriseRisks: EnterpriseRisk[] = [
  {
    id: "risk-phi-privacy",
    category: "PHI/privacy",
    severity: "critical",
    likelihood: "possible",
    mitigation: "Keep public and demo surfaces synthetic/no-PHI; require BAA/DPA, data classification, retention, deletion, and incident controls before live data.",
    ownerPlaceholder: "Privacy and security owner",
    currentStatus: "blocked-before-production",
    evidenceLink: "/clinical-production-readiness"
  },
  {
    id: "risk-clinical-safety",
    category: "clinical safety",
    severity: "critical",
    likelihood: "possible",
    mitigation: "Require human review, TrustOS gates, Clinical Robustness Lab scorecards, and no autonomous clinical authority.",
    ownerPlaceholder: "Clinical governance owner",
    currentStatus: "mitigating",
    evidenceLink: "/clinical-robustness-lab"
  },
  {
    id: "risk-model-hallucination",
    category: "model hallucination",
    severity: "high",
    likelihood: "possible",
    mitigation: "Require citations, evidence cards, unsupported-claim refusals, and hallucination-risk scorecards.",
    ownerPlaceholder: "AI safety owner",
    currentStatus: "mitigating",
    evidenceLink: "/clinical-robustness-lab"
  },
  {
    id: "risk-model-drift",
    category: "model drift",
    severity: "high",
    likelihood: "possible",
    mitigation: "Use model registry placeholders, eval snapshots, regression checks, and canary/rollback gates before provider activation.",
    ownerPlaceholder: "MLOps owner",
    currentStatus: "mitigating",
    evidenceLink: "/api/workflows/execution-attempts/envelope"
  },
  {
    id: "risk-bias",
    category: "bias",
    severity: "high",
    likelihood: "possible",
    mitigation: "Track demographic bias risk in synthetic robustness scenarios and require reviewer disposition before any clinical claim expands.",
    ownerPlaceholder: "Responsible AI owner",
    currentStatus: "mitigating",
    evidenceLink: "/clinical-robustness-lab"
  },
  {
    id: "risk-cybersecurity",
    category: "cybersecurity",
    severity: "critical",
    likelihood: "possible",
    mitigation: "Preserve AAL2, least privilege, token redaction, fail-closed APIs, rate limits, and provider-call kill switch.",
    ownerPlaceholder: "Security owner",
    currentStatus: "mitigating",
    evidenceLink: "/competitive-defense"
  },
  {
    id: "risk-vendor-dependency",
    category: "vendor dependency",
    severity: "medium",
    likelihood: "possible",
    mitigation: "Use provider-neutral model routing with synthetic fallback and future adapters for OpenAI, Anthropic, Google, NVIDIA, Azure, AWS, and open models.",
    ownerPlaceholder: "Platform owner",
    currentStatus: "controlled",
    evidenceLink: "/api/investor-readiness/status"
  },
  {
    id: "risk-cost-spike-api-abuse",
    category: "cost spike/API abuse",
    severity: "high",
    likelihood: "possible",
    mitigation: "Keep provider calls disabled by default, use request thresholds, rate limits, safe errors, and cost guardrail contract checks.",
    ownerPlaceholder: "Platform reliability owner",
    currentStatus: "controlled",
    evidenceLink: "/api/investor-readiness/status"
  },
  {
    id: "risk-auditability",
    category: "auditability",
    severity: "high",
    likelihood: "possible",
    mitigation: "Bind execution attempts to policy decisions, hashes, model route metadata, reviewer gates, and durable-store readiness.",
    ownerPlaceholder: "TrustOps owner",
    currentStatus: "mitigating",
    evidenceLink: "/api/workflows/execution-attempts/durable-store"
  },
  {
    id: "risk-regulatory-claims",
    category: "regulatory claims",
    severity: "critical",
    likelihood: "possible",
    mitigation: "Block HIPAA/SOC/HITRUST/FDA/ONC/security/accessibility certification and clinical validation claims until qualified approval exists.",
    ownerPlaceholder: "Legal and compliance owner",
    currentStatus: "blocked-before-production",
    evidenceLink: "/approvals-readiness"
  },
  {
    id: "risk-ehr-integration",
    category: "EHR integration",
    severity: "critical",
    likelihood: "possible",
    mitigation: "Keep EHR writeback and production connectors blocked; use synthetic FHIR/HL7/DICOM readiness only.",
    ownerPlaceholder: "Interoperability owner",
    currentStatus: "blocked-before-production",
    evidenceLink: "/interoperability"
  },
  {
    id: "risk-payer-workflow",
    category: "payer workflow",
    severity: "high",
    likelihood: "possible",
    mitigation: "Allow synthetic policy synthesis and reviewer-held packets only; block payer submission, final coding, claims, appeals, and reimbursement guarantees.",
    ownerPlaceholder: "RCM/payer workflow owner",
    currentStatus: "blocked-before-production",
    evidenceLink: "/workflows/execution-attempts"
  },
  {
    id: "risk-deployment-security",
    category: "deployment security",
    severity: "high",
    likelihood: "possible",
    mitigation: "Use build/smoke validation, fail-closed protected routes, DNS readiness, rate limits, and no-secret tests before promotion.",
    ownerPlaceholder: "Platform reliability owner",
    currentStatus: "mitigating",
    evidenceLink: "/launch-readiness"
  }
];

function countBy<T extends string>(values: T[]) {
  return values.reduce<Record<T, number>>((counts, value) => {
    counts[value] = (counts[value] ?? 0) + 1;
    return counts;
  }, {} as Record<T, number>);
}

export function getEnterpriseRiskRegisterSummary() {
  return {
    service: "scrimed-enterprise-risk-register",
    route: enterpriseRiskRegisterRoute,
    apiRoute: enterpriseRiskRegisterApiRoute,
    status: enterpriseRiskRegisterStatus,
    updated: enterpriseRiskRegisterUpdatedAt,
    riskCount: enterpriseRisks.length,
    criticalCount: enterpriseRisks.filter((risk) => risk.severity === "critical").length,
    blockedBeforeProductionCount: enterpriseRisks.filter(
      (risk) => risk.currentStatus === "blocked-before-production"
    ).length,
    severityCounts: countBy(enterpriseRisks.map((risk) => risk.severity)),
    statusCounts: countBy(enterpriseRisks.map((risk) => risk.currentStatus)),
    risks: enterpriseRisks,
    boundary:
      "The risk register is a readiness control. It is not legal advice, clinical validation, security certification, regulatory approval, PHI authority, production connector approval, or customer go-live approval."
  };
}
