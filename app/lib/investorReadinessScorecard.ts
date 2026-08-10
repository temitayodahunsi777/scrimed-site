import { createClinicalEvidenceHash } from "./clinicalEvidenceControls";

export const investorReadinessScorecardVersion =
  "scrimed-investor-readiness-scorecard-v1-2026-08-09";

export type InvestorReadinessConfidence = "low" | "moderate" | "high";
export type InvestorReadinessMaturity =
  | "foundation"
  | "integrated"
  | "review-ready"
  | "external-proof-required";

export type InvestorReadinessDimension = {
  id: string;
  label: string;
  score: number;
  confidence: InvestorReadinessConfidence;
  maturity: InvestorReadinessMaturity;
  evidenceSources: string[];
  deficiencies: string[];
  nextAction: string;
};

const dimensions: InvestorReadinessDimension[] = [
  {
    id: "architecture-maturity",
    label: "Architecture maturity",
    score: 78,
    confidence: "high",
    maturity: "integrated",
    evidenceSources: ["/scrimed-control-plane", "/scrimed-work", "/production-architecture"],
    deficiencies: ["No independently operated production reference architecture."],
    nextAction: "Complete exact-head review and preserve a traceable architecture delta for the follow-on candidate."
  },
  {
    id: "security",
    label: "Security",
    score: 74,
    confidence: "high",
    maturity: "review-ready",
    evidenceSources: ["/trust-center", "SECURITY.md", "artifacts/security/scrimed-sbom.json"],
    deficiencies: ["External penetration testing and production incident exercises are not recorded."],
    nextAction: "Run an independent security review against the exact candidate and retain remediated evidence."
  },
  {
    id: "governance",
    label: "Governance",
    score: 82,
    confidence: "high",
    maturity: "integrated",
    evidenceSources: ["/scrimed-agent-governance", "/approvals-readiness", "/validation-evidence"],
    deficiencies: ["Several qualified human approvals remain external and candidate-bound."],
    nextAction: "Obtain the fresh exact-head reviewer disposition without converting it into merge or production authority."
  },
  {
    id: "evidence",
    label: "Evidence",
    score: 58,
    confidence: "moderate",
    maturity: "external-proof-required",
    evidenceSources: ["/validation-evidence", "/clinical-robustness-lab", "/healthcare-value-realization"],
    deficiencies: ["No independently verified customer outcome or clinical-effect evidence."],
    nextAction: "Execute one governed synthetic pilot and define the external-validation protocol before making outcome claims."
  },
  {
    id: "product-clarity",
    label: "Product clarity",
    score: 70,
    confidence: "moderate",
    maturity: "review-ready",
    evidenceSources: ["/offerings", "/documentation-before-authorization", "/demos"],
    deficiencies: ["The broad catalog still needs buyer-specific packaging around one near-term wedge."],
    nextAction: "Lead with Workflow Intelligence Assessment and Documentation Before Authorization for the first diligence path."
  },
  {
    id: "commercialization",
    label: "Commercialization",
    score: 42,
    confidence: "moderate",
    maturity: "external-proof-required",
    evidenceSources: ["/offerings", "/pilot-demo-commercial-readiness", "/commercial-pricing"],
    deficiencies: ["No verified customers, contracted revenue, conversion evidence, or renewal cohort is represented."],
    nextAction: "Secure a bounded paid no-PHI assessment with nonbinding pricing and explicit success criteria."
  },
  {
    id: "capital-efficiency",
    label: "Capital efficiency",
    score: 52,
    confidence: "low",
    maturity: "foundation",
    evidenceSources: ["/capital-vitality", "/healthcare-value-realization"],
    deficiencies: ["Measured task cost, reviewer burden, delivery capacity, and acquisition cost baselines are incomplete."],
    nextAction: "Collect complete synthetic-pilot cost inputs and have finance review the scenario assumptions."
  },
  {
    id: "model-portability",
    label: "Model portability",
    score: 76,
    confidence: "high",
    maturity: "integrated",
    evidenceSources: ["/scrimed-model-router", "/scrimed-compute-fabric", "/model-intelligence-registry"],
    deficiencies: ["External provider eligibility and protected-data terms remain unverified."],
    nextAction: "Complete one provider-neutral conformance comparison with outage and no-eligible-model paths."
  },
  {
    id: "integration-depth",
    label: "Integration depth",
    score: 62,
    confidence: "moderate",
    maturity: "foundation",
    evidenceSources: ["/interoperability", "/clinical-data-fabric", "/enterprise-healthcare-infrastructure"],
    deficiencies: ["Interfaces are synthetic and no production EHR, payer, device, or imaging connection is authorized."],
    nextAction: "Validate one read-only synthetic connector through conformance, revocation, audit, and rollback tests."
  },
  {
    id: "sovereign-readiness",
    label: "Sovereign readiness",
    score: 48,
    confidence: "moderate",
    maturity: "foundation",
    evidenceSources: ["/clinical-assurance-control-plane", "/global-enterprise-command"],
    deficiencies: ["No regional enclave deployment, recovery drill, or legal authorization has been completed."],
    nextAction: "Run a synthetic enclave recovery and materially independent fallback exercise."
  },
  {
    id: "release-discipline",
    label: "Release discipline",
    score: 80,
    confidence: "high",
    maturity: "review-ready",
    evidenceSources: ["docs/release/PR25_FROZEN_REVIEW_BASELINE.md", "/approvals-readiness"],
    deficiencies: ["The fresh exact-head independent approval is still pending."],
    nextAction: "Keep PR #25 frozen and accept only a disposition bound to its current SHA and evidence fingerprints."
  },
  {
    id: "ip-moat-maturity",
    label: "IP and moat maturity",
    score: 64,
    confidence: "moderate",
    maturity: "integrated",
    evidenceSources: ["artifacts/investor/moat-registry.json", "/scrimed-control-plane"],
    deficiencies: ["Differentiation evidence is mostly implementation-backed and not yet externally benchmarked."],
    nextAction: "Tie each moat to a reproducible benchmark, pilot artifact, or governance outcome."
  },
  {
    id: "customer-proof",
    label: "Customer proof",
    score: 20,
    confidence: "high",
    maturity: "external-proof-required",
    evidenceSources: ["/validation-evidence", "/pilot-demo-commercial-readiness"],
    deficiencies: ["Verified customer outcomes, publication permissions, and renewal evidence are unavailable."],
    nextAction: "Do not imply traction; pursue a scoped design partnership or paid no-PHI assessment with evidence rights defined."
  },
  {
    id: "regulatory-posture",
    label: "Regulatory posture",
    score: 44,
    confidence: "moderate",
    maturity: "external-proof-required",
    evidenceSources: ["docs/REGULATORY_INTENDED_USE_REGISTER.md", "/approvals-readiness"],
    deficiencies: ["Qualified counsel and clinical/regulatory review remain external."],
    nextAction: "Obtain role-qualified review of intended use and claims before any protected deployment or regulated positioning."
  }
];

export function getInvestorReadinessScorecard() {
  const averageScore = Math.round(
    dimensions.reduce((sum, dimension) => sum + dimension.score, 0) /
      dimensions.length
  );
  const summary = {
    service: "scrimed-investor-readiness-scorecard" as const,
    version: investorReadinessScorecardVersion,
    status: "internal-readiness-evidence-not-investment-outcome" as const,
    scoreMethod:
      "Deterministic internal readiness rubric based on implemented evidence and recorded deficiencies; not a probability of funding, valuation, or commercial success.",
    averageScore,
    dimensions,
    externalProofRequiredCount: dimensions.filter(
      (dimension) => dimension.maturity === "external-proof-required"
    ).length,
    boundary:
      "This scorecard supports internal diligence preparation only. It does not imply investment, partnership, revenue, customers, regulatory approval, production readiness, or external validation.",
    nextBestAction:
      "Complete the exact-head review, then use one evidence-scoped synthetic workflow pilot to improve customer proof, unit economics, and commercialization evidence without enabling PHI or production actions."
  };

  return {
    ...summary,
    evidenceHash: createClinicalEvidenceHash(summary)
  };
}
