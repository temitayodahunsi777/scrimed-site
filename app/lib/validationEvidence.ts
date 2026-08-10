export type ValidationEvidenceStatus =
  | "available-for-inspection"
  | "methodology-documented"
  | "evidence-pending-formal-validation"
  | "publication-permission-required";

export type ValidationEvidenceSection = {
  id: string;
  title: string;
  status: ValidationEvidenceStatus;
  summary: string;
  evidenceRoutes: string[];
  limitations: string[];
};

export const currentProductStatusStatement =
  "SCRIMED products are currently presented as research, demonstration, workflow, and synthetic-data environments unless a specific deployment has been separately validated, contracted, and approved.";

export const validationEvidenceSections: ValidationEvidenceSection[] = [
  {
    id: "research-technical-validation",
    title: "Research and Technical Validation",
    status: "available-for-inspection",
    summary:
      "Synthetic fixtures, typed contracts, deterministic policy tests, build checks, and interoperability conformance previews provide inspectable technical evidence.",
    evidenceRoutes: ["/synthetic/validation", "/clinical-robustness-lab", "/interoperability/evaluations", "/quality"],
    limitations: [
      "Synthetic and technical checks are not clinical validation.",
      "External site, specialty, and prospective validation remain pending."
    ]
  },
  {
    id: "safety-governance",
    title: "Safety and Governance",
    status: "available-for-inspection",
    summary:
      "Deny-by-default execution, no-PHI controls, human review, claims governance, audit evidence, and explicit clinical-production gates are visible in the product.",
    evidenceRoutes: ["/trust-center", "/claims", "/clinical-production-readiness", "/scrimed-cyber-defense"],
    limitations: [
      "Readiness controls do not constitute certification or legal approval.",
      "Live PHI and clinical execution remain blocked."
    ]
  },
  {
    id: "pilot-methodology",
    title: "Pilot Methodology",
    status: "methodology-documented",
    summary:
      "SCRIMED defines no-PHI discovery, synthetic baseline, acceptance criteria, human review, evidence capture, and expansion decisions before protected use.",
    evidenceRoutes: ["/pilots", "/pilot-value-evidence", "/pilot-success-review-command"],
    limitations: [
      "No customer outcome is represented without approved evidence.",
      "Commercial, clinical, security, privacy, and legal approvals remain external."
    ]
  },
  {
    id: "benchmarking-approach",
    title: "Benchmarking Approach",
    status: "methodology-documented",
    summary:
      "The benchmark layer measures structured-output fidelity, evidence grounding, abstention, subgroup and worst-cell performance, latency, cost, and human acceptance.",
    evidenceRoutes: ["/scrimed-clinical-benchmark-suite", "/clinical-robustness-lab", "/evaluation"],
    limitations: [
      "Benchmark performance does not prove performance in live care.",
      "High-risk evaluation requires qualified human reviewers."
    ]
  },
  {
    id: "customer-outcomes",
    title: "Customer Outcomes",
    status: "evidence-pending-formal-validation",
    summary: "Evidence pending formal validation.",
    evidenceRoutes: ["/pilot-value-evidence", "/claims"],
    limitations: [
      "No customer outcome, logo, quotation, deployment, or savings claim is currently approved for publication.",
      "Publication requires substantiation, customer permission, and claims review."
    ]
  },
  {
    id: "advisors-partners",
    title: "Advisors and Partners",
    status: "publication-permission-required",
    summary: "Evidence pending formal validation.",
    evidenceRoutes: ["/trust-center/branding", "/claims"],
    limitations: [
      "No advisor, partner, investor, or institution endorsement is implied.",
      "Names and logos require formal approval and publication permission."
    ]
  },
  {
    id: "current-product-status",
    title: "Current Product Status",
    status: "available-for-inspection",
    summary: currentProductStatusStatement,
    evidenceRoutes: ["/api/operating-mode", "/clinical-production-readiness", "/limitations-workarounds"],
    limitations: [
      "Pre-commercial and synthetic-data/demo-first.",
      "No live clinical decision-making, emergency monitoring, autonomous care, payer submission, or EHR writeback."
    ]
  }
];

export function getValidationEvidenceSummary() {
  return {
    service: "scrimed-validation-evidence",
    status: "synthetic-evidence-and-methodology-available",
    currentProductStatus: currentProductStatusStatement,
    sections: validationEvidenceSections,
    verifiedCustomerOutcomeCount: 0,
    approvedAdvisorPartnerRecognitionCount: 0,
    boundary:
      "This page reports current evidence and limitations. It does not create customer proof, clinical validation, certification, regulatory approval, production authorization, or customer go-live authority."
  };
}
