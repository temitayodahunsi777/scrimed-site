import { getApprovalsReadinessSummary } from "./approvalsReadiness";
import { getBoundaryResolutionSummary } from "./boundaryResolution";
import { getCapitalVitalitySummary } from "./capitalVitality";
import { getClientOnboardingCommunicationsSummary } from "./clientOnboardingCommunications";
import { getClinicalAuthorityReadinessSummary } from "./clinicalAuthorityReadiness";
import { getCompanyAssessmentSummary } from "./companyAssessment";
import { getContinuousReviewAuditSummary } from "./continuousReviewAudit";
import { getEnterpriseBusinessOpsSummary } from "./enterpriseBusinessOperations";
import { getEnterpriseScalabilityOperationsSummary } from "./enterpriseScalabilityOperations";
import { getGlobalCertificationReadinessSummary } from "./globalCertificationReadiness";
import { getGrowthEngineSummary } from "./growthEngine";
import { getHealthRecordsSafetyExchangeSummary } from "./healthRecordsSafetyExchange";
import { getInvestorAudienceReadinessSummary } from "./investorAudienceReadiness";
import { getLaunchReadinessSummary } from "./launchReadinessOperations";
import { getOperationalEfficiencySummary } from "./operationalEfficiency";
import { getPlatformPowerSummary } from "./platformPowerOperations";
import { getProductServicePortfolioSummary } from "./productServicePortfolio";
import { getPublicMarketReadinessSummary } from "./publicMarketReadiness";
import { getReleaseContinuitySummary } from "./releaseContinuity";
import { getServiceDeliverySummary } from "./serviceDelivery";
import { getServiceReliabilitySummary } from "./serviceReliability";

export type ClinicalProductionTaskStatus =
  | "foundation-active"
  | "evidence-build-required"
  | "ready-for-owner-review"
  | "external-review-required"
  | "blocked-before-approval";

export type ClinicalProductionTaskPriority = "critical" | "high" | "medium";

export type ClinicalProductionReadinessTask = {
  id: string;
  category:
    | "governance"
    | "privacy-security"
    | "clinical-safety"
    | "regulatory"
    | "interoperability"
    | "ai-quality"
    | "operations"
    | "commercial-legal"
    | "global";
  task: string;
  priority: ClinicalProductionTaskPriority;
  status: ClinicalProductionTaskStatus;
  productionComplete: boolean;
  owner: string;
  requiredFor: string;
  completionCriteria: string[];
  currentEvidenceRoutes: string[];
  missingBeforeClinicalProduction: string[];
  dependencies: string[];
  currentUseWhilePending: string;
  retainedBoundary: string;
};

export type CurrentCapabilityMotion = {
  name: string;
  status: "activate-now" | "package-now" | "review-before-sale";
  audience: string;
  strategicUse: string;
  financialUse: string;
  structuralUse: string;
  nextAction: string;
  proofRoutes: string[];
  blockedClaims: string[];
};

export type ClinicalProductionSourceReference = {
  name: string;
  jurisdiction: "United States" | "European Union" | "Global";
  sourceType: "official-government" | "official-regulator" | "official-standard";
  url: string;
  reviewedAt: string;
  readinessUse: string;
};

export type ClinicalProductionGate = {
  gate: string;
  owner: string;
  blocks: string[];
  completionSignal: string;
};

export const clinicalProductionReadinessRoute = "/clinical-production-readiness";
export const clinicalProductionReadinessApiRoute = "/api/clinical-production-readiness";
export const clinicalProductionReadinessBriefRoute =
  "/api/clinical-production-readiness/brief";
export const clinicalProductionReadinessStatus =
  "clinical-production-readiness-task-ledger-active";
export const clinicalProductionReadinessBriefStatus =
  "clinical-production-readiness-brief-ready-no-clinical-authority";
export const clinicalProductionReadinessUpdatedAt = "2026-06-26";

export const clinicalProductionReadinessBoundary =
  "SCRIMED Clinical Production Readiness is a source-controlled task ledger and operating tracker for the work required before live clinical production, PHI/ePHI scope, production EHR or payer connectivity, patient-impacting AI, regulated clinical claims, customer go-live, and global clinical deployment. It does not grant legal advice, medical advice, regulatory approval, HIPAA compliance, SOC 2/HITRUST/ISO certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, PHI processing authority, production connector approval, customer permission, launch approval, reimbursement assurance, contractual SLA, revenue guarantee, profit guarantee, securities material, investment advice, valuation assurance, or live clinical care authority.";

export const clinicalProductionSourceReferences: ClinicalProductionSourceReference[] = [
  {
    name: "HHS HIPAA Security Rule",
    jurisdiction: "United States",
    sourceType: "official-government",
    url: "https://www.hhs.gov/hipaa/for-professionals/security/index.html",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor HIPAA risk analysis, ePHI safeguard mapping, access controls, audit controls, incident response, BAA/DPA, and breach-process readiness."
  },
  {
    name: "FDA Clinical Decision Support Software Guidance",
    jurisdiction: "United States",
    sourceType: "official-regulator",
    url: "https://www.fda.gov/regulatory-information/search-fda-guidance-documents/clinical-decision-support-software",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor intended-use, human-review transparency, non-device CDS criteria, and escalation to regulated device review where claims require it."
  },
  {
    name: "FDA AI/ML Software as a Medical Device",
    jurisdiction: "United States",
    sourceType: "official-regulator",
    url: "https://www.fda.gov/medical-devices/software-medical-device-samd/artificial-intelligence-and-machine-learning-software-medical-device",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor AI-enabled SaMD lifecycle controls, model-change governance, performance monitoring, transparency, clinical evidence, and quality-management escalation."
  },
  {
    name: "ONC Health IT Certification and Interoperability",
    jurisdiction: "United States",
    sourceType: "official-government",
    url: "https://www.healthit.gov/topic/certification-ehrs/about-onc-health-it-certification-program",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor ONC certification, API, interoperability, USCDI, and health-IT connector claim review before SCRIMED represents certified health IT capability."
  },
  {
    name: "NIST Cybersecurity Framework 2.0",
    jurisdiction: "United States",
    sourceType: "official-government",
    url: "https://www.nist.gov/cyberframework",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor cyber governance, risk identification, protection, detection, response, recovery, and enterprise security operating evidence."
  },
  {
    name: "NIST AI Risk Management Framework",
    jurisdiction: "United States",
    sourceType: "official-government",
    url: "https://www.nist.gov/itl/ai-risk-management-framework",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor AI inventory, risk measurement, model evaluation, human oversight, incident learning, and TrustOS evidence language."
  },
  {
    name: "EU Artificial Intelligence Act",
    jurisdiction: "European Union",
    sourceType: "official-regulator",
    url: "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor EU high-risk AI triage, technical documentation, logs, data governance, human oversight, cybersecurity, robustness, accuracy, and post-market planning."
  },
  {
    name: "European Commission GDPR Legal Framework",
    jurisdiction: "European Union",
    sourceType: "official-government",
    url: "https://commission.europa.eu/law/law-topic/data-protection/legal-framework-eu-data-protection_en",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor controller/processor role mapping, lawful basis, DPIA, cross-border transfer, data-subject rights, retention, deletion, and DPA/SCC workflows."
  },
  {
    name: "ISO 13485 Medical Devices Quality Management",
    jurisdiction: "Global",
    sourceType: "official-standard",
    url: "https://www.iso.org/standard/59752.html",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor medical-device quality management escalation if SCRIMED enters regulated medical-device or SaMD territory."
  },
  {
    name: "ISO/IEC 42001 AI Management System",
    jurisdiction: "Global",
    sourceType: "official-standard",
    url: "https://www.iso.org/standard/42001",
    reviewedAt: clinicalProductionReadinessUpdatedAt,
    readinessUse:
      "Anchor AI management-system policy, objectives, risk treatment, traceability, audit cadence, and continual improvement."
  }
];

export const clinicalProductionGates: ClinicalProductionGate[] = [
  {
    gate: "Clinical authority and intended use",
    owner: "Clinical governance, product, and regulatory counsel",
    blocks: ["diagnosis", "treatment", "triage", "patient messaging", "clinical recommendations"],
    completionSignal:
      "Approved intended-use statement, clinical governance owner, hazard analysis, human-review policy, and regulated-product pathway decision."
  },
  {
    gate: "PHI/ePHI and privacy authority",
    owner: "Privacy, security, legal, and customer compliance",
    blocks: ["PHI ingestion", "patient identifiers", "source records", "production credentials"],
    completionSignal:
      "Executed BAA/DPA or written non-PHI determination, HIPAA risk analysis, data classification, retention, deletion, and breach process."
  },
  {
    gate: "Production connector and EHR/payer authority",
    owner: "Interoperability, security, customer integration, and platform partner",
    blocks: ["live FHIR reads", "EHR writeback", "HL7 feeds", "payer submissions", "record mutation"],
    completionSignal:
      "Customer sandbox acceptance, conformance evidence, least-privilege connector policy, monitoring, rollback, and platform/customer approval."
  },
  {
    gate: "Security assurance and vendor-risk acceptance",
    owner: "Security, compliance, procurement, and customer vendor-risk",
    blocks: ["security certification claims", "production vendor acceptance", "enterprise go-live"],
    completionSignal:
      "Independent assessment path, control inventory, access reviews, incident response, backup/recovery evidence, subprocessor register, and customer acceptance."
  },
  {
    gate: "Customer production go-live authority",
    owner: "Customer executive sponsor, SCRIMED release steward, support, legal, security, and clinical governance",
    blocks: ["production tenant activation", "customer SSO", "automated invites", "live workflows"],
    completionSignal:
      "Signed go-live checklist, SOW/MSA/BAA/DPA alignment, SSO/RBAC acceptance, monitoring, 24/7 escalation, rollback, shutdown, and post-launch review cadence."
  }
];

function statusWeight(status: ClinicalProductionTaskStatus) {
  if (status === "ready-for-owner-review") return 68;
  if (status === "foundation-active") return 55;
  if (status === "evidence-build-required") return 38;
  if (status === "external-review-required") return 30;
  return 18;
}

function priorityWeight(priority: ClinicalProductionTaskPriority) {
  if (priority === "critical") return 3;
  if (priority === "high") return 2;
  return 1;
}

function unique(values: string[]) {
  return Array.from(new Set(values));
}

function byPriority(task: ClinicalProductionReadinessTask) {
  const priorityRank = { critical: 0, high: 1, medium: 2 }[task.priority];
  const statusRank = {
    "blocked-before-approval": 0,
    "external-review-required": 1,
    "evidence-build-required": 2,
    "foundation-active": 3,
    "ready-for-owner-review": 4
  }[task.status];
  return priorityRank * 10 + statusRank;
}

export function getClinicalProductionReadinessSummary() {
  const approvals = getApprovalsReadinessSummary();
  const boundaryResolution = getBoundaryResolutionSummary();
  const capitalVitality = getCapitalVitalitySummary();
  const clientOnboarding = getClientOnboardingCommunicationsSummary();
  const clinicalAuthority = getClinicalAuthorityReadinessSummary();
  const companyAssessment = getCompanyAssessmentSummary();
  const continuousReview = getContinuousReviewAuditSummary();
  const enterpriseBusinessOps = getEnterpriseBusinessOpsSummary();
  const enterpriseScalability = getEnterpriseScalabilityOperationsSummary();
  const globalCertification = getGlobalCertificationReadinessSummary();
  const growthEngine = getGrowthEngineSummary();
  const healthRecords = getHealthRecordsSafetyExchangeSummary();
  const investorAudience = getInvestorAudienceReadinessSummary();
  const launchReadiness = getLaunchReadinessSummary();
  const operationalEfficiency = getOperationalEfficiencySummary();
  const platformPower = getPlatformPowerSummary();
  const productServicePortfolio = getProductServicePortfolioSummary();
  const publicMarket = getPublicMarketReadinessSummary();
  const releaseContinuity = getReleaseContinuitySummary();
  const serviceDelivery = getServiceDeliverySummary();
  const serviceReliability = getServiceReliabilitySummary();

  const tasks: ClinicalProductionReadinessTask[] = [
    {
      id: "cpr-001",
      category: "governance",
      task: "Approve intended use and clinical claim boundaries per product module.",
      priority: "critical",
      status: "external-review-required",
      productionComplete: false,
      owner: "Product, clinical governance, regulatory counsel, and Claim Guard",
      requiredFor: "Any patient-specific clinical recommendation, care workflow, triage, or regulated clinical claim.",
      completionCriteria: [
        "Module-by-module intended-use memo",
        "Approved public and buyer claim register",
        "Human-review and transparency language",
        "Regulated pathway decision for each clinical feature"
      ],
      currentEvidenceRoutes: [
        "/clinical-authority-readiness",
        "/clinical-care-activation",
        "/qa-claim-guard",
        approvals.route
      ],
      missingBeforeClinicalProduction: [
        "Qualified regulatory counsel review",
        "Named licensed clinical owner",
        "Approved intended-use register",
        "Customer-specific clinical sponsor approval"
      ],
      dependencies: ["FDA CDS/SaMD classification", "clinical safety case", "customer scope"],
      currentUseWhilePending:
        "Keep product language to synthetic workflow intelligence, no-PHI planning, and clinician-reviewed draft support.",
      retainedBoundary: "No diagnosis, treatment, triage, prescribing, patient outreach, or autonomous clinical decision authority."
    },
    {
      id: "cpr-002",
      category: "clinical-safety",
      task: "Stand up licensed clinical governance, safety case, hazard log, and escalation policy.",
      priority: "critical",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "Clinical governance, TrustOS, product, and customer clinical sponsor",
      requiredFor: "Live clinical workflows, patient-safety posture, and customer go-live review.",
      completionCriteria: [
        "Named licensed medical director or governance board",
        "Clinical safety case",
        "Hazard log and severity taxonomy",
        "Escalation, override, and shutdown policy",
        "Prospective pilot protocol and reviewer rubric"
      ],
      currentEvidenceRoutes: [
        "/clinical-authority-readiness",
        "/clinical-care-activation",
        "/trust-os",
        healthRecords.route
      ],
      missingBeforeClinicalProduction: [
        "Licensed governance appointment",
        "Customer care-setting scope",
        "Clinical safety signoff",
        "Post-launch safety monitoring cadence"
      ],
      dependencies: ["intended use", "human-review policy", "incident response"],
      currentUseWhilePending:
        "Use safety case templates and synthetic scenarios in demos to show discipline without affecting patients.",
      retainedBoundary: "No live care impact or patient instruction until clinical signoff and customer go-live approval."
    },
    {
      id: "cpr-003",
      category: "privacy-security",
      task: "Complete HIPAA risk analysis and administrative, physical, and technical safeguard map.",
      priority: "critical",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "Privacy, security, legal, and operations",
      requiredFor: "Any PHI/ePHI scope, BAA-backed operation, or healthcare vendor-risk approval.",
      completionCriteria: [
        "HIPAA risk analysis",
        "Safeguard matrix",
        "Access-control and audit-control evidence",
        "Encryption, backup, recovery, deletion, and breach workflows",
        "Workforce and vendor risk controls"
      ],
      currentEvidenceRoutes: [
        "/trust-center",
        "/trust-safety-operations",
        globalCertification.route,
        "/pilot-workspace/access"
      ],
      missingBeforeClinicalProduction: [
        "Qualified privacy/security review",
        "Documented risk treatment",
        "BAA/DPA templates",
        "Subprocessor and access-review register"
      ],
      dependencies: ["data classification", "incident response", "vendor risk"],
      currentUseWhilePending:
        "Sell no-PHI evidence rooms, security-readiness posture, and synthetic pilot reviews without claiming HIPAA compliance.",
      retainedBoundary: "No PHI or ePHI processing approval and no HIPAA certification claim."
    },
    {
      id: "cpr-004",
      category: "privacy-security",
      task: "Finalize BAA/DPA, non-PHI determination, data classification, retention, deletion, and legal-hold workflow.",
      priority: "critical",
      status: "external-review-required",
      productionComplete: false,
      owner: "Legal, privacy, security, customer compliance, and operations",
      requiredFor: "Customer data intake, PHI/ePHI, source records, signed artifacts, and enterprise contracting.",
      completionCriteria: [
        "BAA and DPA templates reviewed by counsel",
        "Non-PHI determination workflow",
        "Data classification matrix",
        "Retention, deletion, legal hold, and backup policy",
        "Customer-specific data-flow appendix"
      ],
      currentEvidenceRoutes: [
        approvals.route,
        "/pilot-workspace/access",
        boundaryResolution.route,
        publicMarket.route
      ],
      missingBeforeClinicalProduction: [
        "Counsel-approved templates",
        "Customer contract execution",
        "Data residency and cross-border review where applicable",
        "Signed customer data authority"
      ],
      dependencies: ["HIPAA risk analysis", "customer scope", "subprocessor register"],
      currentUseWhilePending:
        "Keep pilots synthetic, metadata-only, or buyer-provided non-PHI with written boundary language.",
      retainedBoundary: "No customer permission, data processing authority, or PHI processing authorization."
    },
    {
      id: "cpr-005",
      category: "privacy-security",
      task: "Complete security assurance path for SOC 2, HITRUST, ISO 27001, penetration-test, and procurement evidence.",
      priority: "critical",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "Security, compliance, procurement, and qualified assessors",
      requiredFor: "Enterprise vendor-risk acceptance and regulated healthcare procurement.",
      completionCriteria: [
        "Control inventory and owners",
        "Security policy set",
        "Independent assessment or certification plan",
        "Penetration-test and remediation evidence when requested",
        "Vendor-risk questionnaire library"
      ],
      currentEvidenceRoutes: [
        "/trust-safety-operations",
        globalCertification.route,
        serviceReliability.route,
        "/pilot-workspace/access"
      ],
      missingBeforeClinicalProduction: [
        "Independent assessor selection",
        "Evidence collection cadence",
        "Customer procurement acceptance",
        "Issued certification or explicit no-certification boundary"
      ],
      dependencies: ["identity access", "incident response", "backup/recovery", "vendor risk"],
      currentUseWhilePending:
        "Provide security-readiness packets and no-sensitive-artifact evidence links without certification claims.",
      retainedBoundary: "No SOC 2, HITRUST, ISO, penetration-test approval, or customer vendor-risk approval claim."
    },
    {
      id: "cpr-006",
      category: "privacy-security",
      task: "Enforce production identity, RBAC, SSO, AAL2, access review, least privilege, and credential lifecycle.",
      priority: "critical",
      status: "foundation-active",
      productionComplete: false,
      owner: "Security, tenant governance, platform, and customer IT",
      requiredFor: "Customer SSO, production tenant access, protected proof release, and PHI/ePHI workflows.",
      completionCriteria: [
        "Customer SSO acceptance",
        "Role and purpose-of-use matrix",
        "AAL2 operator policy",
        "Access review cadence",
        "Credential rotation, revocation, and emergency access policy"
      ],
      currentEvidenceRoutes: [
        "/pilot-workspace/access",
        releaseContinuity.route,
        "/qa-launch-kit",
        "/qa-buyer-proof-release"
      ],
      missingBeforeClinicalProduction: [
        "Customer IdP configuration",
        "Production role map",
        "Break-glass approval",
        "Attestation evidence and audit export"
      ],
      dependencies: ["customer contract", "tenant lifecycle", "audit logging"],
      currentUseWhilePending:
        "Use AAL2 protected synthetic workspaces and no-secret operator packets for demos and diligence.",
      retainedBoundary: "No customer SSO or production invitation authority until customer and security approval."
    },
    {
      id: "cpr-007",
      category: "operations",
      task: "Validate immutable audit logging, evidence retention, release decisions, reviewer signoffs, and access-log reconciliation.",
      priority: "critical",
      status: "foundation-active",
      productionComplete: false,
      owner: "TrustOS, release engineering, security, and customer operations",
      requiredFor: "Clinical accountability, buyer proof release, incident review, and enterprise auditability.",
      completionCriteria: [
        "Append-only audit policy",
        "Reviewer signoff workflow",
        "Release decision register",
        "Access-log reconciliation",
        "Evidence retention and export runbooks"
      ],
      currentEvidenceRoutes: [
        "/qa-buyer-proof-release",
        "/buyer-release-control-run",
        "/pilot-workspace/access",
        releaseContinuity.route
      ],
      missingBeforeClinicalProduction: [
        "Customer-specific audit export acceptance",
        "Legal hold policy",
        "Evidence integrity review",
        "Production incident linkage"
      ],
      dependencies: ["identity access", "customer SOW", "retention/deletion policy"],
      currentUseWhilePending:
        "Use buyer proof packets and protected demos to show audit discipline without live clinical action.",
      retainedBoundary: "Audit evidence does not authorize PHI, release, customer proof, or clinical production."
    },
    {
      id: "cpr-008",
      category: "interoperability",
      task: "Complete customer-specific FHIR, HL7 v2, C-CDA, DICOM, X12, payer, and EHR sandbox acceptance tests.",
      priority: "critical",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "Interoperability, health-record safety, security, and customer integration",
      requiredFor: "Any production health-record, payer, or EHR integration.",
      completionCriteria: [
        "Standards map and profile assumptions",
        "Synthetic and sandbox test fixtures",
        "CapabilityStatement/interface profile review",
        "ACK/NACK, reconciliation, provenance, and dead-letter controls",
        "Customer sandbox signoff"
      ],
      currentEvidenceRoutes: [
        healthRecords.route,
        healthRecords.extractRoute,
        "/interoperability",
        "/integrations/fixture-validation"
      ],
      missingBeforeClinicalProduction: [
        "Customer sandbox credentials",
        "Conformance run evidence",
        "Integration monitoring plan",
        "Customer platform approval"
      ],
      dependencies: ["BAA/DPA or non-PHI determination", "security review", "purpose-of-use"],
      currentUseWhilePending:
        "Sell no-PHI interoperability mapping, fixture validation, and sandbox-readiness assessments.",
      retainedBoundary: "No live connector, live record retrieval, payer submission, or EHR writeback authority."
    },
    {
      id: "cpr-009",
      category: "interoperability",
      task: "Approve EHR writeback, record mutation, payer submission, patient outreach, and production connector execution separately.",
      priority: "critical",
      status: "blocked-before-approval",
      productionComplete: false,
      owner: "Customer executive sponsor, clinical governance, interoperability, legal, privacy, and security",
      requiredFor: "Any patient-impacting external-system action.",
      completionCriteria: [
        "Explicit action-by-action customer approval",
        "Least-privilege token scope",
        "Human reviewer workflow",
        "Rollback and reconciliation plan",
        "Audit log and shutdown authority"
      ],
      currentEvidenceRoutes: [
        healthRecords.route,
        "/clinical-authority-readiness",
        "/pilot-workspace/access",
        boundaryResolution.route
      ],
      missingBeforeClinicalProduction: [
        "Signed customer production connector authority",
        "Clinical safety signoff",
        "Integration acceptance evidence",
        "Support escalation and rollback test"
      ],
      dependencies: ["sandbox acceptance", "clinical safety case", "go-live checklist"],
      currentUseWhilePending:
        "Demonstrate draft-only reviewer packets and no-write synthetic simulations.",
      retainedBoundary: "No writeback, mutation, outreach, payer submission, or production connector execution."
    },
    {
      id: "cpr-010",
      category: "regulatory",
      task: "Complete FDA CDS/SaMD classification, QMS escalation, and premarket pathway decision where required.",
      priority: "critical",
      status: "external-review-required",
      productionComplete: false,
      owner: "Regulatory counsel, product, clinical governance, AI platform, and quality",
      requiredFor: "Clinical AI functions that could be regulated as medical device software.",
      completionCriteria: [
        "CDS non-device criteria analysis",
        "SaMD risk classification memo",
        "FDA pathway decision",
        "QMS and design-control escalation plan",
        "Model-change and post-market monitoring policy"
      ],
      currentEvidenceRoutes: [
        globalCertification.route,
        "/clinical-authority-readiness",
        platformPower.route,
        "/evaluation"
      ],
      missingBeforeClinicalProduction: [
        "Qualified FDA digital-health counsel review",
        "Q-Submission or premarket plan if needed",
        "Clinical evidence plan",
        "Design-control and risk-management artifacts"
      ],
      dependencies: ["intended use", "clinical safety case", "AI validation"],
      currentUseWhilePending:
        "Position clinical AI as synthetic, planning, operational, or draft support with human review.",
      retainedBoundary: "No FDA-cleared, diagnostic, treatment, or autonomous clinical-device claim."
    },
    {
      id: "cpr-011",
      category: "regulatory",
      task: "Decide ONC health IT certification, information-blocking, USCDI, SMART/FHIR, and EHR marketplace claim scope.",
      priority: "high",
      status: "external-review-required",
      productionComplete: false,
      owner: "Interoperability, legal, health IT certification counsel, and platform partnerships",
      requiredFor: "Certified health IT claims, EHR marketplace positioning, and formal interoperability claims.",
      completionCriteria: [
        "Claim scope memo",
        "USCDI and FHIR API mapping",
        "SMART launch and authorization review",
        "Marketplace and partner approval path",
        "Blocked ONC/certified-health-IT language"
      ],
      currentEvidenceRoutes: [
        globalCertification.route,
        "/interoperability",
        healthRecords.route,
        "/integrations/fixture-validation"
      ],
      missingBeforeClinicalProduction: [
        "ONC/certification counsel review",
        "Marketplace partner requirements",
        "Certification-body or EHR partner evidence where required"
      ],
      dependencies: ["interoperability conformance", "customer connector approval"],
      currentUseWhilePending:
        "Describe standards-readiness and synthetic conformance without certified health IT claims.",
      retainedBoundary: "No ONC certification, EHR marketplace approval, or certified connector claim."
    },
    {
      id: "cpr-012",
      category: "ai-quality",
      task: "Complete AI model inventory, evaluation, red-team, bias, drift, hallucination, source-attribution, and monitoring controls.",
      priority: "critical",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "AI platform, TrustOS, QA, clinical governance, security, and product",
      requiredFor: "Any clinical, operational, payer, or documentation AI workflow with customer reliance.",
      completionCriteria: [
        "Model and tool inventory",
        "Evaluation datasets and acceptance thresholds",
        "Red-team and adversarial review",
        "Bias and drift monitoring",
        "Source attribution and hallucination controls",
        "Human override and incident learning"
      ],
      currentEvidenceRoutes: [
        platformPower.route,
        "/evaluation",
        "/trust-os",
        continuousReview.route
      ],
      missingBeforeClinicalProduction: [
        "Customer-specific eval acceptance",
        "Clinical reviewer rubric",
        "Model-change policy",
        "Live monitoring and rollback integration"
      ],
      dependencies: ["intended use", "data governance", "clinical safety case"],
      currentUseWhilePending:
        "Use AI evals, Trust Cards, and source-attributed synthetic demonstrations in buyer diligence.",
      retainedBoundary: "No live autonomous AI, production model-routing approval, or error-free accuracy guarantee."
    },
    {
      id: "cpr-013",
      category: "ai-quality",
      task: "Stand up AI management-system evidence for ISO/IEC 42001 alignment and EU high-risk AI readiness.",
      priority: "high",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "AI governance, legal, privacy, security, quality, and regional counsel",
      requiredFor: "Global AI assurance, EU high-risk AI planning, and enterprise buyer governance.",
      completionCriteria: [
        "AI policy and objectives",
        "Risk treatment register",
        "Technical documentation",
        "Data governance and logging plan",
        "Human oversight and post-market monitoring process"
      ],
      currentEvidenceRoutes: [
        globalCertification.route,
        continuousReview.route,
        platformPower.route,
        "/trust-os"
      ],
      missingBeforeClinicalProduction: [
        "Qualified EU AI Act review",
        "ISO 42001 certification decision",
        "Regional technical documentation pack",
        "Serious incident routing and reporting process"
      ],
      dependencies: ["AI inventory", "data governance", "clinical safety case"],
      currentUseWhilePending:
        "Use AI governance mapping as a high-value diligence offer without conformity or certification claims.",
      retainedBoundary: "No EU AI Act conformity, ISO 42001 certification, or high-risk AI approval claim."
    },
    {
      id: "cpr-014",
      category: "operations",
      task: "Prove 24/7 support, incident response, breach response, uptime monitoring, escalation, and shutdown authority.",
      priority: "critical",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "Service reliability, TrustOps, security, customer operations, and release steward",
      requiredFor: "Production customer support and clinical go-live.",
      completionCriteria: [
        "On-call schedule",
        "Incident and breach runbooks",
        "Severity and escalation matrix",
        "Status communication template",
        "Shutdown authority",
        "Tabletop exercise evidence"
      ],
      currentEvidenceRoutes: [
        serviceReliability.route,
        "/trust-safety-operations",
        continuousReview.route,
        launchReadiness.route
      ],
      missingBeforeClinicalProduction: [
        "Named on-call owners",
        "Customer escalation contacts",
        "Incident tabletop results",
        "Support-tier contract language"
      ],
      dependencies: ["security assurance", "customer SOW", "monitoring"],
      currentUseWhilePending:
        "Package incident-readiness and 24/7 review architecture as trust evidence for buyers and investors.",
      retainedBoundary: "No contractual SLA, managed SOC/MDR, production support guarantee, or clinical emergency response claim."
    },
    {
      id: "cpr-015",
      category: "operations",
      task: "Validate disaster recovery, backup, recovery time objectives, rollback, regional failover, and business continuity.",
      priority: "high",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "Platform, service reliability, security, customer operations, and finance",
      requiredFor: "Enterprise production resilience and procurement acceptance.",
      completionCriteria: [
        "Backup and restore test",
        "Recovery objectives",
        "Rollback procedure",
        "Regional failover review",
        "Business continuity plan",
        "Cost and capacity assumptions"
      ],
      currentEvidenceRoutes: [
        enterpriseScalability.route,
        serviceReliability.route,
        launchReadiness.route,
        releaseContinuity.route
      ],
      missingBeforeClinicalProduction: [
        "Production environment architecture",
        "Customer resilience requirement",
        "Restore test evidence",
        "Runbook acceptance"
      ],
      dependencies: ["tenant architecture", "monitoring", "contract scope"],
      currentUseWhilePending:
        "Use scale and reliability readiness as a structural differentiator in enterprise diligence.",
      retainedBoundary: "No uptime, failover, SLA, managed-service, or disaster-recovery guarantee."
    },
    {
      id: "cpr-016",
      category: "operations",
      task: "Formalize change management, release control, rollback, post-release review, and production access controls.",
      priority: "critical",
      status: "foundation-active",
      productionComplete: false,
      owner: "Release steward, platform, QA, TrustOS, and security",
      requiredFor: "Any production deployment, clinical feature promotion, or customer-specific proof release.",
      completionCriteria: [
        "Release checklist",
        "Change-risk classification",
        "QA and smoke evidence",
        "Approval signoff",
        "Rollback plan",
        "Post-release review"
      ],
      currentEvidenceRoutes: [
        releaseContinuity.route,
        "/qa-evidence",
        "/buyer-release-control-run",
        operationalEfficiency.route
      ],
      missingBeforeClinicalProduction: [
        "Production change calendar",
        "Customer release window process",
        "High-risk feature approval board",
        "Post-release clinical monitoring"
      ],
      dependencies: ["QA evidence", "clinical safety case", "incident response"],
      currentUseWhilePending:
        "Keep release discipline visible to investors and buyers through public smoke, briefs, and protected proof packets.",
      retainedBoundary: "No release approval, customer proof release, or clinical go-live without signed authority."
    },
    {
      id: "cpr-017",
      category: "commercial-legal",
      task: "Execute customer MSA/SOW/BAA/DPA, service boundaries, billing, insurance, liability, and revenue-recognition review.",
      priority: "critical",
      status: "external-review-required",
      productionComplete: false,
      owner: "Legal, finance, accounting, tax, insurance, revenue operations, and deal desk",
      requiredFor: "Paid clinical production, enterprise buyer commitments, and risk allocation.",
      completionCriteria: [
        "Executed contract stack",
        "Service boundary exhibit",
        "Insurance and liability review",
        "Billing and payment readiness",
        "Revenue-recognition and tax review",
        "Change-order and scope creep controls"
      ],
      currentEvidenceRoutes: [
        enterpriseBusinessOps.route,
        serviceDelivery.route,
        productServicePortfolio.route,
        capitalVitality.route
      ],
      missingBeforeClinicalProduction: [
        "Qualified counsel review",
        "Qualified accounting/tax review",
        "Insurance confirmation",
        "Customer contract execution"
      ],
      dependencies: ["offer scope", "data authority", "security review", "customer procurement"],
      currentUseWhilePending:
        "Sell scoped no-PHI paid pilots and readiness services through margin-safe work orders and deal-desk controls.",
      retainedBoundary: "No legal, accounting, tax, revenue, reimbursement, profit-margin, insurance, or contract authority."
    },
    {
      id: "cpr-018",
      category: "commercial-legal",
      task: "Complete reimbursement, coding, payer policy, prior-authorization, and claims-submission authority review.",
      priority: "high",
      status: "external-review-required",
      productionComplete: false,
      owner: "Revenue cycle, finance, legal, clinical governance, and customer operations",
      requiredFor: "Payer workflow execution, coverage determinations, coding, submissions, or reimbursement claims.",
      completionCriteria: [
        "CMS/payer policy review",
        "Coding and billing compliance review",
        "Human reviewer assignment",
        "No-guarantee reimbursement language",
        "Measurement methodology accepted by customer"
      ],
      currentEvidenceRoutes: [
        "/public-market-readiness",
        "/pilot-deal-room",
        healthRecords.route,
        enterpriseBusinessOps.route
      ],
      missingBeforeClinicalProduction: [
        "Customer revenue-cycle approval",
        "Payer-policy-specific review",
        "Compliance signoff",
        "Submission authority"
      ],
      dependencies: ["customer scope", "clinical authority", "data authority"],
      currentUseWhilePending:
        "Offer denial-risk, prior-authorization packet drafting, and revenue-leakage analysis as human-reviewed draft support.",
      retainedBoundary: "No reimbursement, coverage, coding, payer submission, or financial outcome guarantee."
    },
    {
      id: "cpr-019",
      category: "global",
      task: "Complete GDPR, EU AI Act, data residency, DPIA, transfer mechanism, and regional clinical/legal review before global production.",
      priority: "high",
      status: "external-review-required",
      productionComplete: false,
      owner: "Regional counsel, privacy, AI governance, security, and global partnerships",
      requiredFor: "EU or global clinical deployment, personal-data processing, and regional buyer claims.",
      completionCriteria: [
        "Controller/processor role map",
        "Lawful basis and DPIA review",
        "DPA/SCC transfer workflow",
        "EU AI Act high-risk triage",
        "Data residency and regional clinical review",
        "Local buyer language approval"
      ],
      currentEvidenceRoutes: [
        globalCertification.route,
        "/global-reach",
        "/deployment-profiles",
        investorAudience.route
      ],
      missingBeforeClinicalProduction: [
        "Region-specific legal review",
        "DPIA and transfer decisions",
        "Local clinical/procurement authority",
        "Conformity assessment path where applicable"
      ],
      dependencies: ["AI documentation", "privacy/data authority", "security assurance"],
      currentUseWhilePending:
        "Run global partner qualification, localization, and synthetic executive evaluations without personal data.",
      retainedBoundary: "No GDPR compliance assurance, EU AI Act conformity, regional approval, or global clinical-production claim."
    },
    {
      id: "cpr-020",
      category: "regulatory",
      task: "Decide ISO 13485/QMS, design controls, risk management, human factors, usability, and post-market surveillance scope.",
      priority: "high",
      status: "evidence-build-required",
      productionComplete: false,
      owner: "Quality, regulatory counsel, product, clinical governance, and design",
      requiredFor: "Deliberate medical-device/SaMD productization and clinical production claims.",
      completionCriteria: [
        "QMS applicability memo",
        "Design-control procedure",
        "Risk-management file",
        "Human factors and usability plan",
        "Post-market surveillance and complaint process"
      ],
      currentEvidenceRoutes: [
        globalCertification.route,
        "/clinical-authority-readiness",
        platformPower.route,
        continuousReview.route
      ],
      missingBeforeClinicalProduction: [
        "Quality owner assignment",
        "Regulatory counsel review",
        "Clinical evidence plan",
        "Post-market process and complaint handling"
      ],
      dependencies: ["FDA/SaMD classification", "clinical safety case", "AI validation"],
      currentUseWhilePending:
        "Frame QMS readiness as a future production path while selling synthetic validation and quality-readiness planning.",
      retainedBoundary: "No ISO 13485, medical-device QMS, or post-market surveillance approval claim."
    },
    {
      id: "cpr-021",
      category: "operations",
      task: "Complete customer production go-live checklist, SSO/RBAC acceptance, monitoring, rollback test, support handoff, and shutdown authority.",
      priority: "critical",
      status: "blocked-before-approval",
      productionComplete: false,
      owner: "Customer executive sponsor, SCRIMED release steward, security, clinical governance, support, and legal",
      requiredFor: "Any live customer clinical production tenant.",
      completionCriteria: [
        "Signed production readiness checklist",
        "Customer SSO and RBAC accepted",
        "Monitoring and incident contacts active",
        "Rollback and shutdown tested",
        "Post-launch review cadence approved"
      ],
      currentEvidenceRoutes: [
        launchReadiness.route,
        "/pilot-workspace/access",
        "/sales-operations",
        serviceDelivery.route
      ],
      missingBeforeClinicalProduction: [
        "Customer go-live approval",
        "Clinical/legal/security/privacy signoffs",
        "Support roster",
        "Production environment validation"
      ],
      dependencies: ["contract stack", "PHI/privacy authority", "connector approval", "support readiness"],
      currentUseWhilePending:
        "Use production-readiness packets inside sales operations to prepare without enabling production.",
      retainedBoundary: "No customer production go-live, automated invitation, SSO activation, or clinical workflow launch."
    },
    {
      id: "cpr-022",
      category: "governance",
      task: "Create board-level clinical production readiness review cadence with owner, due date, evidence aging, risk acceptance, and blocked-claim review.",
      priority: "high",
      status: "foundation-active",
      productionComplete: false,
      owner: "Executive Operating Council, TrustOS, legal, finance, clinical governance, and release steward",
      requiredFor: "Company-level accountability before regulated expansion.",
      completionCriteria: [
        "Standing review cadence",
        "Owner matrix",
        "Evidence aging report",
        "Risk acceptance record",
        "Blocked-claim review",
        "Investor and buyer language refresh"
      ],
      currentEvidenceRoutes: [
        companyAssessment.route,
        clinicalProductionReadinessRoute,
        continuousReview.route,
        publicMarket.route
      ],
      missingBeforeClinicalProduction: [
        "Board/advisor review schedule",
        "Risk acceptance template",
        "Evidence expiration policy",
        "Clinical production decision log"
      ],
      dependencies: ["task ledger", "external reviewer roster", "company assessment"],
      currentUseWhilePending:
        "Use the ledger as a strategic management asset in investor and enterprise buyer conversations.",
      retainedBoundary: "Board review does not create clinical, legal, financial, regulatory, or customer authority."
    }
  ];

  const currentCapabilityMotions: CurrentCapabilityMotion[] = [
    {
      name: "Synthetic executive operating assessment",
      status: "activate-now",
      audience: "Founders, health-system operators, faith-based clinics, investors, and transformation sponsors",
      strategicUse:
        "Lead with whole-company and buyer-operating clarity while retaining all clinical-production hard stops.",
      financialUse:
        "Package as a paid discovery, readiness, or board-prep engagement before regulated deployment.",
      structuralUse:
        "Routes every conversation through company score, task ledger, proof routes, and retained boundaries.",
      nextAction:
        "Bundle Company Assessment plus Clinical Production Readiness into the first executive packet.",
      proofRoutes: [companyAssessment.route, clinicalProductionReadinessRoute, productServicePortfolio.route],
      blockedClaims: ["clinical production ready", "certified", "PHI approved", "revenue guaranteed"]
    },
    {
      name: "No-PHI health-record and interoperability readiness package",
      status: "activate-now",
      audience: "Health-system integration teams, payers, clinics, and EHR reviewers",
      strategicUse:
        "Turn live-data blockers into standards maps, sandbox plans, source-attribution tests, and safety controls.",
      financialUse:
        "Sell scoped no-PHI interoperability assessment or sandbox-prep services.",
      structuralUse:
        "Creates customer-specific evidence before requesting credentials or live connector access.",
      nextAction:
        "Offer a no-PHI FHIR/HL7/C-CDA/DICOM/X12 mapping workshop with deliverable acceptance criteria.",
      proofRoutes: [healthRecords.route, "/interoperability", "/integrations/fixture-validation"],
      blockedClaims: ["live connector approved", "EHR writeback ready", "ONC certified", "payer submission approved"]
    },
    {
      name: "AI governance and TrustOS diligence review",
      status: "package-now",
      audience: "Compliance reviewers, AI governance committees, security teams, and investors",
      strategicUse:
        "Position SCRIMED as governance-first healthcare AI without claiming autonomous production authority.",
      financialUse:
        "Package AI inventory, model-route, eval, red-team, and claims-guard review as a service line.",
      structuralUse:
        "Connects platform power, TrustOS, continuous review, and future certification evidence.",
      nextAction:
        "Create a buyer-facing AI governance review packet with model, agent, eval, and retained-gate tables.",
      proofRoutes: [platformPower.route, "/trust-os", "/evaluation", continuousReview.route],
      blockedClaims: ["live autonomous AI", "error-free AI", "EU AI Act conformant", "ISO 42001 certified"]
    },
    {
      name: "Buyer diligence and proof-release workbench",
      status: "activate-now",
      audience: "Enterprise buyers, procurement, vendor-risk teams, and board reviewers",
      strategicUse:
        "Make proof sharing auditable, recipient-controlled, claim-guarded, and no-PHI by design.",
      financialUse:
        "Improves close confidence for paid pilots by giving buyers controlled evidence without over-disclosure.",
      structuralUse:
        "Forces AAL2, release decision, reviewer signoff, recipient control, and access-log reconciliation.",
      nextAction:
        "Use protected Buyer Proof Release as the default before any customer-specific evidence leaves SCRIMED.",
      proofRoutes: ["/qa-buyer-proof-release", "/buyer-release-control-run", "/pilot-workspace/access"],
      blockedClaims: ["customer permission", "public distribution approved", "PHI included", "security certified"]
    },
    {
      name: "Service delivery workbench for no-PHI paid pilots",
      status: "activate-now",
      audience: "Clinics, health systems, payers, operational teams, and enterprise sponsors",
      strategicUse:
        "Convert broad interest into scoped work orders with acceptance criteria and hard boundaries.",
      financialUse:
        "Protects gross margin through packaged scope, price floors, change control, and deliverable templates.",
      structuralUse:
        "Creates repeatable delivery lanes before clinical production dependencies are complete.",
      nextAction:
        "Route every paid pilot through Offerings, Service Delivery, Enterprise Business Ops, and Claim Guard.",
      proofRoutes: [productServicePortfolio.route, serviceDelivery.route, enterpriseBusinessOps.route],
      blockedClaims: ["SOW executed", "SLA guaranteed", "PHI authorized", "profit guaranteed"]
    },
    {
      name: "Investor and clinic readiness packets",
      status: "review-before-sale",
      audience: "Angel investors, private investors, strategic partners, faith-based clinics, and public-sector sponsors",
      strategicUse:
        "Turn the current platform into a credible story of traction, gates, evidence, and disciplined upside.",
      financialUse:
        "Supports fundraising and sponsorship conversations without securities, valuation, or revenue promises.",
      structuralUse:
        "Links audiences to the exact packet, proof route, blocked claims, and next action.",
      nextAction:
        "Use investor audience readiness and capital vitality before every capital, donor, or clinic packet.",
      proofRoutes: [investorAudience.route, capitalVitality.route, growthEngine.route, publicMarket.route],
      blockedClaims: ["securities offer", "investment advice", "valuation assurance", "revenue guarantee"]
    },
    {
      name: "Enterprise operations and margin lock",
      status: "activate-now",
      audience: "Enterprise buyers, board, finance, and delivery leadership",
      strategicUse:
        "Make Scrimed look and behave like a serious enterprise vendor before production authority exists.",
      financialUse:
        "Controls price floor, scope creep, billing readiness, revenue recognition triage, and tax review.",
      structuralUse:
        "Runs proposals through deal desk, qualified review, margin model, and blocked-claim checks.",
      nextAction:
        "Make Enterprise Business Ops mandatory before proposals, renewals, enterprise pilots, or investment packets.",
      proofRoutes: [enterpriseBusinessOps.route, serviceDelivery.route, capitalVitality.route],
      blockedClaims: ["audited financials", "tax advice", "profit margin guarantee", "contract authority"]
    },
    {
      name: "24/7 review and innovation operating loop",
      status: "package-now",
      audience: "Internal operators, investors, security reviewers, and innovation partners",
      strategicUse:
        "Shows that Scrimed improves accuracy, evidence freshness, claims control, security drift, and future research continuously.",
      financialUse:
        "Supports premium pilot pricing through governance, monitoring, and continuous-improvement evidence.",
      structuralUse:
        "Keeps internal research, quantum exploration, agent loops, incident learning, and release quality inside review gates.",
      nextAction:
        "Create named queue owners for accuracy sampling, evidence aging, claims drift, security drift, QA regression, and internal research.",
      proofRoutes: [continuousReview.route, "/qa-evidence", serviceReliability.route, operationalEfficiency.route],
      blockedClaims: ["managed SOC", "autonomous remediation", "public quantum claim", "certification"]
    },
    {
      name: "Launch-safe public product and demo motion",
      status: "activate-now",
      audience: "Prospects, demo attendees, pilots, advisors, and early investors",
      strategicUse:
        "Maximizes today's platform surface without crossing PHI, production, clinical, or certification boundaries.",
      financialUse:
        "Enables demos, paid discovery, pilot intake, and evidence-driven follow-up now.",
      structuralUse:
        "Keeps branded-domain smoke, navigation, onboarding, and launch hard stops explicit.",
      nextAction:
        "Use Launch Readiness, Onboarding, and Product Console before external campaigns or demos.",
      proofRoutes: [launchReadiness.route, clientOnboarding.route, "/product", "/demos"],
      blockedClaims: ["public launch approval", "clinical production ready", "customer result guaranteed", "live PHI"]
    },
    {
      name: "Global certification and approval roadmap service",
      status: "review-before-sale",
      audience: "Global partners, regional buyers, strategic investors, and health systems",
      strategicUse:
        "Turns global complexity into a visible roadmap rather than an unbounded promise.",
      financialUse:
        "Can be sold as readiness assessment, localization prep, and diligence package support.",
      structuralUse:
        "Coordinates region, privacy, AI, cyber, clinical, procurement, and data-residency gates.",
      nextAction:
        "Offer regional readiness packs only with qualified local-review disclaimers.",
      proofRoutes: [globalCertification.route, "/global-reach", "/deployment-profiles"],
      blockedClaims: ["global approval", "GDPR compliant", "EU AI Act conformant", "regional clinical authorization"]
    }
  ];

  const weightedTotal = tasks.reduce(
    (total, task) => total + statusWeight(task.status) * priorityWeight(task.priority),
    0
  );
  const maxTotal = tasks.reduce((total, task) => total + 100 * priorityWeight(task.priority), 0);
  const readinessScore = Math.round(weightedTotal / maxTotal * 100);
  const completeTaskCount = tasks.filter((task) => task.productionComplete).length;
  const incompleteTaskCount = tasks.length - completeTaskCount;
  const criticalOpenTaskCount = tasks.filter(
    (task) => task.priority === "critical" && !task.productionComplete
  ).length;
  const externalReviewTaskCount = tasks.filter(
    (task) => task.status === "external-review-required"
  ).length;
  const blockedTaskCount = tasks.filter((task) => task.status === "blocked-before-approval").length;
  const evidenceBuildTaskCount = tasks.filter(
    (task) => task.status === "evidence-build-required"
  ).length;
  const foundationActiveTaskCount = tasks.filter(
    (task) => task.status === "foundation-active"
  ).length;
  const nextTasks = [...tasks]
    .filter((task) => !task.productionComplete)
    .sort((a, b) => byPriority(a) - byPriority(b))
    .slice(0, 8);
  const evidenceRoutes = unique([
    clinicalProductionReadinessRoute,
    clinicalProductionReadinessApiRoute,
    clinicalProductionReadinessBriefRoute,
    ...tasks.flatMap((task) => task.currentEvidenceRoutes),
    ...currentCapabilityMotions.flatMap((motion) => motion.proofRoutes)
  ]);

  return {
    service: "scrimed-clinical-production-readiness",
    route: clinicalProductionReadinessRoute,
    apiRoute: clinicalProductionReadinessApiRoute,
    briefRoute: clinicalProductionReadinessBriefRoute,
    status: clinicalProductionReadinessStatus,
    briefStatus: clinicalProductionReadinessBriefStatus,
    updated: clinicalProductionReadinessUpdatedAt,
    boundary: clinicalProductionReadinessBoundary,
    trackingMode: "source-controlled-clinical-production-task-ledger",
    currentOperatingMode: "synthetic-no-phi-demo-pilot-diligence-and-readiness-services",
    clinicalProductionReady: false,
    readinessScore,
    taskCount: tasks.length,
    completeTaskCount,
    incompleteTaskCount,
    criticalOpenTaskCount,
    externalReviewTaskCount,
    blockedTaskCount,
    evidenceBuildTaskCount,
    foundationActiveTaskCount,
    sourceReferenceCount: clinicalProductionSourceReferences.length,
    gateCount: clinicalProductionGates.length,
    currentCapabilityMotionCount: currentCapabilityMotions.length,
    activateNowMotionCount: currentCapabilityMotions.filter(
      (motion) => motion.status === "activate-now"
    ).length,
    reviewBeforeSaleMotionCount: currentCapabilityMotions.filter(
      (motion) => motion.status === "review-before-sale"
    ).length,
    requiredTasks: tasks,
    nextTasks,
    currentCapabilityMotions,
    productionGates: clinicalProductionGates,
    sourceReferences: clinicalProductionSourceReferences,
    evidenceRoutes,
    sourceAlignment: {
      companyAssessmentScore: companyAssessment.overallScore,
      approvalTrackCount: approvals.trackCount,
      clinicalAuthorityDomainCount: clinicalAuthority.authorityDomainCount,
      globalCertificationTrackCount: globalCertification.trackCount,
      healthRecordCapabilityCount: healthRecords.capabilityCount,
      continuousReviewAgentCount: continuousReview.agentCount,
      serviceDeliveryOfferCount: serviceDelivery.deliveryOfferCount,
      enterpriseBusinessOpsRevenueCapabilityCount: enterpriseBusinessOps.revenueCapabilityCount,
      enterpriseScalabilityDomainCount: enterpriseScalability.domainCount,
      platformPowerPillarCount: platformPower.pillarCount,
      releaseContinuityGateCount: releaseContinuity.gateCount,
      serviceReliabilityControlCount: serviceReliability.controlCount,
      operationalEfficiencyOpenBottleneckCount: operationalEfficiency.openBottleneckCount,
      launchReadinessHighRiskCount: launchReadiness.highRiskCount,
      productServiceOfferCount: productServicePortfolio.offerCount,
      investorAudiencePacketCount: investorAudience.audiencePacketCount,
      growthEnginePlayCount: growthEngine.growthPlayCount,
      capitalVitalityFundingWorkstreamCount: capitalVitality.fundingWorkstreamCount,
      publicMarketMetricCount: publicMarket.metricCount,
      boundaryResolutionRecordCount: boundaryResolution.recordCount
    },
    authority: {
      dataBoundary: "synthetic-no-phi-and-metadata-only-until-approved",
      legalAuthority: "qualified-review-required",
      regulatoryAuthority: "external-review-required",
      phiAuthority: "not-authorized-production-phi",
      clinicalCareAuthority: "not-authorized-live-care",
      connectorAuthority: "not-production-connector-approved",
      customerPermission: "not-customer-permission",
      securityCertification: "not-security-certified",
      reimbursementAuthority: "no-reimbursement-guarantee",
      revenueAuthority: "not-revenue-guarantee",
      profitAuthority: "not-profit-margin-guarantee",
      investmentAdvice: "not-investment-advice",
      securitiesAuthority: "not-securities-offering-material",
      launchAuthority: "human-launch-review-required",
      aiAuthority: "no-live-autonomous-ai-authority"
    },
    nextCompanyMove:
      "Keep selling no-PHI demos, paid readiness services, synthetic pilots, diligence packets, and governance assessments now while the clinical-production task ledger remains incomplete and externally reviewed.",
    hardStops: [
      "No PHI/ePHI, source medical records, patient identifiers, production credentials, or live endpoints enter SCRIMED until BAA/DPA, privacy/security, customer, and release authority are complete.",
      "No live diagnosis, treatment, triage, prescribing, patient outreach, payer submission, EHR writeback, record mutation, or autonomous clinical action.",
      "No FDA, ONC, HIPAA, SOC 2, HITRUST, ISO, EU AI Act, GDPR, DTAC, MHRA, regional, or security certification claim without issued evidence and qualified review.",
      "No production customer go-live without signed contract stack, customer authority, clinical governance, privacy/security approval, support readiness, monitoring, rollback, and shutdown authority.",
      "No revenue, reimbursement, ROI, savings, uptime, attack-proof, error-free AI, public-market, valuation, investment, securities, profit-margin, or donor claim outside qualified review."
    ]
  };
}

export function buildClinicalProductionReadinessBrief() {
  const summary = getClinicalProductionReadinessSummary();

  return [
    "# SCRIMED Clinical Production Readiness Task Ledger",
    "",
    `Status: ${summary.status}`,
    `Clinical production ready: ${summary.clinicalProductionReady ? "yes" : "no"}`,
    `Readiness score: ${summary.readinessScore}`,
    `Required task count: ${summary.taskCount}`,
    `Incomplete task count: ${summary.incompleteTaskCount}`,
    `Critical open task count: ${summary.criticalOpenTaskCount}`,
    `External-review task count: ${summary.externalReviewTaskCount}`,
    `Blocked task count: ${summary.blockedTaskCount}`,
    `Current operating mode: ${summary.currentOperatingMode}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not legal advice, medical advice, regulatory approval, HIPAA compliance assurance, security certification, FDA clearance, ONC certification, EU AI Act conformity, GDPR compliance assurance, PHI authority, connector approval, customer permission, launch approval, reimbursement assurance, revenue guarantee, profit guarantee, securities material, investment advice, valuation assurance, or live clinical care authorization.",
    "",
    "## Required Clinical Production Tasks",
    ...summary.requiredTasks.map(
      (task) =>
        `- ${task.id} ${task.task} (${task.priority}, ${task.status}, complete: ${task.productionComplete ? "yes" : "no"}). Owner: ${task.owner}. Required for: ${task.requiredFor}. Missing: ${task.missingBeforeClinicalProduction.join("; ")}. Current use while pending: ${task.currentUseWhilePending}. Boundary: ${task.retainedBoundary}`
    ),
    "",
    "## Next Task Sequence",
    ...summary.nextTasks.map(
      (task) => `- ${task.id}: ${task.task} -> ${task.missingBeforeClinicalProduction[0]}`
    ),
    "",
    "## Current Capability Maximization",
    ...summary.currentCapabilityMotions.map(
      (motion) =>
        `- ${motion.name} (${motion.status}) for ${motion.audience}. Strategic: ${motion.strategicUse} Financial: ${motion.financialUse} Structural: ${motion.structuralUse} Next: ${motion.nextAction} Blocked claims: ${motion.blockedClaims.join(", ")}.`
    ),
    "",
    "## Production Gates",
    ...summary.productionGates.map(
      (gate) =>
        `- ${gate.gate}: owner ${gate.owner}; blocks ${gate.blocks.join(", ")}; completion signal ${gate.completionSignal}`
    ),
    "",
    "## Source References",
    ...summary.sourceReferences.map(
      (source) =>
        `- ${source.name} (${source.jurisdiction}, ${source.sourceType}): ${source.url}. Readiness use: ${source.readinessUse}`
    ),
    "",
    "## Hard Stops",
    ...summary.hardStops.map((hardStop) => `- ${hardStop}`),
    "",
    "## Next Company Move",
    summary.nextCompanyMove
  ].join("\n");
}
