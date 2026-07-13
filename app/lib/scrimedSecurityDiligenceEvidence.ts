import { generateScrimedAuditHash } from "./scrimedIntelligencePlatform";
import {
  scrimedSecurityAssuranceGates,
  scrimedSecurityAssuranceStatus
} from "./scrimedSecurityAssurancePipeline";
import {
  scrimedSecurityReleaseGates,
  scrimedSecurityReleaseLanes,
  scrimedSecurityReleaseReadinessStatus
} from "./scrimedSecurityReleaseReadiness";
import { scrimedSafetyPolicyVersion } from "./scrimedSafetyGovernance";

export type ScrimedSecurityEvidenceCategory =
  | "platform_controls"
  | "access_control"
  | "release_governance"
  | "incident_readiness"
  | "external_dependency"
  | "retained_boundary";

export type ScrimedSecurityEvidenceStatus =
  | "ready_to_share"
  | "manual_operator_required"
  | "external_evidence_required"
  | "blocked_until_approved";

export type ScrimedSecurityEvidenceArtifact = {
  id: string;
  title: string;
  category: ScrimedSecurityEvidenceCategory;
  owner: string;
  evidenceSource: string;
  status: ScrimedSecurityEvidenceStatus;
  releaseStage: string;
  buyerQuestionAnswered: string;
  redactionRule: string;
  retainedBoundary: string;
};

export type ScrimedSecurityEvidenceQuestion = {
  id: string;
  question: string;
  currentAnswer: string;
  evidenceArtifactIds: string[];
  remainingManualStep: string;
};

export type ScrimedSecurityQuestionnaireDomain =
  | "access_control"
  | "data_protection"
  | "application_security"
  | "incident_response"
  | "infrastructure"
  | "ai_governance"
  | "business_continuity"
  | "vendor_risk";

export type ScrimedSecurityQuestionnaireStatus =
  | "buyer_safe_answer_ready"
  | "requires_manual_review"
  | "requires_external_artifact"
  | "blocked_until_formal_approval";

export type ScrimedSecurityQuestionnaireResponse = {
  id: string;
  domain: ScrimedSecurityQuestionnaireDomain;
  question: string;
  buyerSafeAnswer: string;
  evidenceArtifactIds: string[];
  supportingRoutes: string[];
  answerStatus: ScrimedSecurityQuestionnaireStatus;
  cannotSay: string[];
  redactionBoundary: string;
  owner: string;
  externalEvidenceNeeded: string;
  humanReviewRequired: true;
  auditHash: string;
};

export type ScrimedSecurityDiligenceEvidenceScorecard = {
  readyToShareCount: number;
  manualOperatorRequiredCount: number;
  externalEvidenceRequiredCount: number;
  blockedUntilApprovedCount: number;
  questionnaireResponseCount: number;
  questionnaireReadyCount: number;
  questionnaireExternalEvidenceCount: number;
  buyerDiligenceShareReady: boolean;
  phiProductionShareReady: false;
  customerGoLiveShareReady: false;
  auditHash: string;
};

export const scrimedSecurityDiligenceEvidenceStatus =
  "scrimed-security-diligence-evidence-packet-active-no-phi";
export const scrimedSecurityDiligenceEvidenceBoundary =
  "SCRIMED Security Diligence Evidence Packet is a metadata-only buyer and investor review layer. It packages no-PHI security evidence, retained boundaries, manual operator actions, and external evidence requirements without exposing secrets, tokens, raw logs, PHI, production connector payloads, or customer go-live authority.";

const retainedBoundary =
  "No live PHI, no production credentials, no raw log exports, no raw connector payloads, no payer submission, no EHR writeback, no production connector approval, no security certification claim, and no customer go-live approval.";

export const scrimedSecurityEvidenceArtifacts: ScrimedSecurityEvidenceArtifact[] = [
  {
    id: "browser-proxy-hardening-packet",
    title: "Browser and proxy hardening packet",
    category: "platform_controls",
    owner: "Platform security",
    evidenceSource: "next.config.js, proxy.ts, npm run smoke:scrimed-cyber-defense",
    status: "ready_to_share",
    releaseStage: "buyer_diligence_ready",
    buyerQuestionAnswered: "How does SCRIMED reduce public-route browser and middleware-bypass risk?",
    redactionRule: "Share header names, contract status, and control rationale only; do not share raw request logs.",
    retainedBoundary
  },
  {
    id: "no-secret-regression-packet",
    title: "No-secret regression packet",
    category: "platform_controls",
    owner: "Platform security",
    evidenceSource: "npm run security:assurance, npm run test:nonsecret",
    status: "ready_to_share",
    releaseStage: "buyer_diligence_ready",
    buyerQuestionAnswered: "How does SCRIMED prevent credentials, tokens, or unsafe claims from entering review artifacts?",
    redactionRule: "Share command names, pass/fail status, and fingerprints only; never share full bearer tokens or keys.",
    retainedBoundary
  },
  {
    id: "protected-route-fail-closed-packet",
    title: "Protected route fail-closed packet",
    category: "access_control",
    owner: "Platform reliability + security",
    evidenceSource: "npm run smoke:public, scripts/aal2-token-policy-selftest.mjs",
    status: "ready_to_share",
    releaseStage: "buyer_diligence_ready",
    buyerQuestionAnswered: "Do protected buyer, operator, evidence, and AAL2 routes fail closed without authorized context?",
    redactionRule: "Share status codes and route categories only; do not share tenant records, tokens, or request payloads.",
    retainedBoundary
  },
  {
    id: "aal2-operator-validation-packet",
    title: "AAL2 operator validation packet",
    category: "access_control",
    owner: "Authorized tenant admin, pilot lead, or reviewer",
    evidenceSource: "npm run smoke:aal2:token, npm run smoke:aal2:durable-store:strict",
    status: "manual_operator_required",
    releaseStage: "protected_no_phi_pilot_ready",
    buyerQuestionAnswered: "Can an authorized short-lived AAL2 session perform protected no-PHI evidence writes?",
    redactionRule: "Share token fingerprint and command result only; never share the token, session JSON, or local .env.local.",
    retainedBoundary
  },
  {
    id: "release-readiness-ladder-packet",
    title: "Release readiness ladder packet",
    category: "release_governance",
    owner: "Release steward",
    evidenceSource: "app/lib/scrimedSecurityReleaseReadiness.ts, /scrimed-cyber-defense",
    status: "ready_to_share",
    releaseStage: "buyer_diligence_ready",
    buyerQuestionAnswered: "What is SCRIMED allowed to show today, and what remains blocked before PHI or customer activation?",
    redactionRule: "Share release stages, retained boundaries, and required evidence; do not imply expanded authority.",
    retainedBoundary
  },
  {
    id: "incident-tabletop-packet",
    title: "Incident tabletop packet",
    category: "incident_readiness",
    owner: "Security lead + privacy lead + clinical governance",
    evidenceSource: "incident response runbook, tabletop notes, SIEM/log-drain proof",
    status: "external_evidence_required",
    releaseStage: "phi_preproduction_blocked",
    buyerQuestionAnswered: "Has SCRIMED rehearsed incident handling for token leakage, PHI exposure risk, and protected-route abuse?",
    redactionRule: "Share tabletop summary and role matrix only after redaction; do not share raw incident logs.",
    retainedBoundary
  },
  {
    id: "waf-siem-sbom-review-packet",
    title: "WAF, SIEM, SBOM, and external review packet",
    category: "external_dependency",
    owner: "Security lead + qualified external reviewers",
    evidenceSource: "WAF policy, bot controls, redacted SIEM proof, SBOM artifact, external review letter",
    status: "external_evidence_required",
    releaseStage: "phi_preproduction_blocked",
    buyerQuestionAnswered: "Which deployment-specific security controls must exist before regulated or PHI-bearing review?",
    redactionRule: "Share external attestation metadata and redacted summaries only; do not share sensitive infrastructure details.",
    retainedBoundary
  },
  {
    id: "baa-privacy-retention-packet",
    title: "BAA, privacy, retention, and customer approval packet",
    category: "retained_boundary",
    owner: "Legal + privacy + customer security",
    evidenceSource: "BAA/customer agreement, privacy risk assessment, retention policy, customer-specific threat model",
    status: "blocked_until_approved",
    releaseStage: "live_phi_production_blocked",
    buyerQuestionAnswered: "What evidence is required before live PHI, production connectors, or customer activation can be considered?",
    redactionRule: "Share existence and approval status only through authorized legal/security review channels.",
    retainedBoundary
  }
];

export const scrimedSecurityEvidenceQuestions: ScrimedSecurityEvidenceQuestion[] = [
  {
    id: "current-security-posture",
    question: "What can SCRIMED safely demonstrate today?",
    currentAnswer:
      "SCRIMED can demonstrate synthetic/no-PHI cyber controls, browser and proxy hardening, no-secret checks, protected route fail-closed behavior, and buyer diligence evidence boundaries.",
    evidenceArtifactIds: [
      "browser-proxy-hardening-packet",
      "no-secret-regression-packet",
      "protected-route-fail-closed-packet",
      "release-readiness-ladder-packet"
    ],
    remainingManualStep: "Keep evidence packet redacted and metadata-only for all public or buyer-facing review."
  },
  {
    id: "protected-pilot-gap",
    question: "What blocks protected no-PHI pilot expansion?",
    currentAnswer:
      "The protected no-PHI lane needs an authorized short-lived AAL2 operator happy-path run and reviewer-role verification before broader protected evidence workflows are treated as ready.",
    evidenceArtifactIds: ["aal2-operator-validation-packet"],
    remainingManualStep: "Run strict AAL2 durable-store smoke with a valid tenant-admin, pilot-lead, or reviewer session."
  },
  {
    id: "phi-production-gap",
    question: "What blocks PHI preproduction or live production?",
    currentAnswer:
      "PHI-bearing or regulated production use remains blocked until external WAF/bot controls, SIEM/log drains, SBOM/dependency evidence, external security review, legal/privacy artifacts, and customer-specific approvals exist.",
    evidenceArtifactIds: ["incident-tabletop-packet", "waf-siem-sbom-review-packet", "baa-privacy-retention-packet"],
    remainingManualStep: "Collect deployment-specific external evidence and route it through legal, privacy, security, and clinical governance."
  }
];

const rawSecurityQuestionnaireResponses: Array<Omit<ScrimedSecurityQuestionnaireResponse, "auditHash">> = [
  {
    id: "questionnaire-access-control-rbac-aal2",
    domain: "access_control",
    question: "Describe SCRIMED access control, privileged access, and protected workflow safeguards.",
    buyerSafeAnswer:
      "SCRIMED separates public metadata surfaces from protected AAL2 workflows. Protected no-PHI evidence writes require authorized operator context, role checks, and fail-closed route behavior; public diligence surfaces expose metadata only.",
    evidenceArtifactIds: ["protected-route-fail-closed-packet", "aal2-operator-validation-packet"],
    supportingRoutes: ["/qa-aal2-run-evidence", "/api/scrimed-cyber-defense/evidence-packet"],
    answerStatus: "requires_manual_review",
    cannotSay: [
      "Do not claim customer SSO acceptance before customer identity-provider review.",
      "Do not share bearer tokens, session JSON, tenant records, or local .env.local values.",
      "Do not imply production PHI authority from no-PHI AAL2 smoke evidence."
    ],
    redactionBoundary: "Share status codes, route classes, role labels, and token fingerprints only.",
    owner: "Security lead + tenant administrator",
    externalEvidenceNeeded: "Customer SSO/RBAC evidence, access-review cadence, and emergency-access procedure.",
    humanReviewRequired: true
  },
  {
    id: "questionnaire-data-protection-no-phi",
    domain: "data_protection",
    question: "How does SCRIMED protect sensitive data during current demos and diligence?",
    buyerSafeAnswer:
      "Current SCRIMED diligence paths are synthetic/no-PHI and metadata-only. They avoid raw connector payload logging, production credentials, customer records, raw logs, and clinical authority claims while mapping the evidence required before PHI-bearing work.",
    evidenceArtifactIds: ["release-readiness-ladder-packet", "baa-privacy-retention-packet"],
    supportingRoutes: ["/scrimed-cyber-defense", "/approvals-readiness", "/global-certification-readiness"],
    answerStatus: "buyer_safe_answer_ready",
    cannotSay: [
      "Do not claim live PHI processing authority.",
      "Do not claim BAA/DPA execution unless a specific agreement exists outside this packet.",
      "Do not paste or store customer data in this public evidence packet."
    ],
    redactionBoundary: "Share boundary language, evidence classes, owners, and approval gaps only.",
    owner: "Privacy lead + legal owner",
    externalEvidenceNeeded: "BAA/DPA path, privacy risk assessment, retention policy, and customer-specific data-flow approval.",
    humanReviewRequired: true
  },
  {
    id: "questionnaire-application-security-headers-proxy",
    domain: "application_security",
    question: "What application security controls are visible in the current SCRIMED app?",
    buyerSafeAnswer:
      "SCRIMED exposes browser hardening headers, proxy request-header sanitization, forbidden-claim checks, generated-integrity checks, and no-secret regression gates as reviewable metadata controls.",
    evidenceArtifactIds: ["browser-proxy-hardening-packet", "no-secret-regression-packet"],
    supportingRoutes: ["/api/scrimed-cyber-defense", "next.config.js", "proxy.ts"],
    answerStatus: "buyer_safe_answer_ready",
    cannotSay: [
      "Do not represent header hardening as independent penetration-test completion.",
      "Do not share raw request logs or infrastructure-sensitive details.",
      "Do not imply WAF or bot-management configuration unless deployment evidence exists."
    ],
    redactionBoundary: "Share control names, contract checks, and no-authority headers; keep raw traffic details outside the packet.",
    owner: "Platform security",
    externalEvidenceNeeded: "WAF policy, bot-management rule summary, CSP report workflow, and external application security review.",
    humanReviewRequired: true
  },
  {
    id: "questionnaire-incident-response-tabletop",
    domain: "incident_response",
    question: "How would SCRIMED respond to credential leakage, protected route abuse, or PHI exposure risk?",
    buyerSafeAnswer:
      "SCRIMED defines incident lanes for token leakage, protected-route abuse, PHI exposure risk, and public-route abuse. Each lane names a trigger, owner, first response, evidence route, and retained boundary.",
    evidenceArtifactIds: ["incident-tabletop-packet"],
    supportingRoutes: ["/scrimed-cyber-defense", "docs/scrimed-cyber-defense.md"],
    answerStatus: "requires_external_artifact",
    cannotSay: [
      "Do not claim completed tabletop exercise until external notes exist.",
      "Do not share raw incident logs.",
      "Do not promise incident outcomes or breach immunity."
    ],
    redactionBoundary: "Share role matrix, triggers, and redacted tabletop summaries only.",
    owner: "Security lead + privacy lead",
    externalEvidenceNeeded: "Tabletop notes, escalation roster, SIEM/log-drain proof, and customer notification template.",
    humanReviewRequired: true
  },
  {
    id: "questionnaire-infrastructure-waf-siem-sbom",
    domain: "infrastructure",
    question: "Which infrastructure controls are required before regulated deployment?",
    buyerSafeAnswer:
      "SCRIMED identifies WAF/bot controls, SIEM/log drains, SBOM generation, dependency scanning, external security review, deployment threat modeling, and backup/rollback evidence as required before PHI-bearing or customer production authority.",
    evidenceArtifactIds: ["waf-siem-sbom-review-packet"],
    supportingRoutes: ["/release-continuity", "/production-architecture", "/scrimed-cyber-defense"],
    answerStatus: "requires_external_artifact",
    cannotSay: [
      "Do not claim deployment-specific WAF/SIEM/SBOM completion from code metadata alone.",
      "Do not expose infrastructure topology, credentials, IP addresses, or vulnerability details.",
      "Do not equate internal readiness with customer security acceptance."
    ],
    redactionBoundary: "Share evidence checklist and redacted control summaries only.",
    owner: "Infrastructure owner + security lead",
    externalEvidenceNeeded: "Deployment WAF policy, log-drain proof, SBOM artifact, vulnerability scan summary, and rollback evidence.",
    humanReviewRequired: true
  },
  {
    id: "questionnaire-ai-governance-human-review",
    domain: "ai_governance",
    question: "How does SCRIMED govern AI outputs and prevent autonomous clinical authority?",
    buyerSafeAnswer:
      "SCRIMED frames AI outputs as governed decision support, synthetic evaluation, workflow preparation, or metadata review. High-risk clinical, payer, EHR, outreach, prescribing, diagnosis, treatment, and final imaging actions remain blocked or require human review.",
    evidenceArtifactIds: ["release-readiness-ladder-packet"],
    supportingRoutes: ["/scrimed-intelligence-safety-stack", "/scrimed-agent-governance", "/clinical-authority-readiness"],
    answerStatus: "buyer_safe_answer_ready",
    cannotSay: [
      "Do not claim independent diagnostic, treatment, prescribing, payer-submission, patient-outreach, EHR-writeback, or final imaging authority.",
      "Do not claim clinical validation or regulatory clearance from synthetic evaluation.",
      "Do not remove human-review language from buyer-facing answers."
    ],
    redactionBoundary: "Share safety boundaries, governance gates, audit metadata, and review requirements.",
    owner: "Clinical governance + AI safety owner",
    externalEvidenceNeeded: "Clinical validation plan, external clinical governance approval, intended-use review, and customer workflow signoff.",
    humanReviewRequired: true
  },
  {
    id: "questionnaire-business-continuity-recovery",
    domain: "business_continuity",
    question: "What is SCRIMED's current resilience, rollback, and continuity posture?",
    buyerSafeAnswer:
      "SCRIMED maintains release-continuity metadata, rollback planning surfaces, generated-integrity checks, and workspace hygiene checks. Regulated continuity claims still require deployment-specific backup, restore, monitoring, and disaster-recovery evidence.",
    evidenceArtifactIds: ["release-readiness-ladder-packet"],
    supportingRoutes: ["/release-continuity", "/service-reliability", "/production-architecture"],
    answerStatus: "requires_external_artifact",
    cannotSay: [
      "Do not claim disaster-recovery completion without tested restore evidence.",
      "Do not claim uptime commitments without signed service terms.",
      "Do not imply production customer go-live authority."
    ],
    redactionBoundary: "Share release lanes, rollback checklists, and recovery evidence requirements only.",
    owner: "Platform reliability + release steward",
    externalEvidenceNeeded: "Backup/restore test, monitoring dashboards, incident SLA policy, and customer-approved continuity plan.",
    humanReviewRequired: true
  },
  {
    id: "questionnaire-vendor-risk-connectors",
    domain: "vendor_risk",
    question: "What evidence is required before SCRIMED integrates with EHR, payer, imaging, or device systems?",
    buyerSafeAnswer:
      "SCRIMED keeps production connector approval blocked until customer-specific threat models, least-privilege scopes, rollback plans, legal/privacy review, vendor security review, and formal customer authorization exist.",
    evidenceArtifactIds: ["baa-privacy-retention-packet", "waf-siem-sbom-review-packet"],
    supportingRoutes: ["/boundary-release-approvals", "/approvals-readiness", "/health-records"],
    answerStatus: "blocked_until_formal_approval",
    cannotSay: [
      "Do not claim production connector approval.",
      "Do not claim EHR writeback, payer submission, or device integration authority.",
      "Do not share connector credentials, endpoints, raw payloads, or customer topology."
    ],
    redactionBoundary: "Share connector readiness stages, blocked actions, and external evidence requirements only.",
    owner: "Integration owner + customer security",
    externalEvidenceNeeded: "Connector threat model, scope map, sandbox evidence, credential-management procedure, rollback drill, and customer signoff.",
    humanReviewRequired: true
  }
];

export const scrimedSecurityQuestionnaireResponses: ScrimedSecurityQuestionnaireResponse[] =
  rawSecurityQuestionnaireResponses.map((response) => ({
    ...response,
    auditHash: generateScrimedAuditHash({
      status: scrimedSecurityDiligenceEvidenceStatus,
      safetyPolicyVersion: scrimedSafetyPolicyVersion,
      response: {
        id: response.id,
        domain: response.domain,
        answerStatus: response.answerStatus,
        evidenceArtifactIds: response.evidenceArtifactIds,
        humanReviewRequired: response.humanReviewRequired
      }
    })
  }));

export function getScrimedSecurityDiligenceEvidenceScorecard(): ScrimedSecurityDiligenceEvidenceScorecard {
  const readyToShareCount = scrimedSecurityEvidenceArtifacts.filter((artifact) => artifact.status === "ready_to_share").length;
  const manualOperatorRequiredCount = scrimedSecurityEvidenceArtifacts.filter(
    (artifact) => artifact.status === "manual_operator_required"
  ).length;
  const externalEvidenceRequiredCount = scrimedSecurityEvidenceArtifacts.filter(
    (artifact) => artifact.status === "external_evidence_required"
  ).length;
  const blockedUntilApprovedCount = scrimedSecurityEvidenceArtifacts.filter(
    (artifact) => artifact.status === "blocked_until_approved"
  ).length;
  const questionnaireReadyCount = scrimedSecurityQuestionnaireResponses.filter(
    (response) => response.answerStatus === "buyer_safe_answer_ready"
  ).length;
  const questionnaireExternalEvidenceCount = scrimedSecurityQuestionnaireResponses.filter((response) =>
    ["requires_external_artifact", "blocked_until_formal_approval"].includes(response.answerStatus)
  ).length;

  return {
    readyToShareCount,
    manualOperatorRequiredCount,
    externalEvidenceRequiredCount,
    blockedUntilApprovedCount,
    questionnaireResponseCount: scrimedSecurityQuestionnaireResponses.length,
    questionnaireReadyCount,
    questionnaireExternalEvidenceCount,
    buyerDiligenceShareReady: true,
    phiProductionShareReady: false,
    customerGoLiveShareReady: false,
    auditHash: generateScrimedAuditHash({
      status: scrimedSecurityDiligenceEvidenceStatus,
      safetyPolicyVersion: scrimedSafetyPolicyVersion,
      artifacts: scrimedSecurityEvidenceArtifacts.map((artifact) => [artifact.id, artifact.status, artifact.releaseStage]),
      questionnaireResponses: scrimedSecurityQuestionnaireResponses.map((response) => [
        response.id,
        response.domain,
        response.answerStatus,
        response.auditHash
      ]),
      assurance: [scrimedSecurityAssuranceStatus, scrimedSecurityAssuranceGates.map((gate) => [gate.id, gate.status])],
      releaseReadiness: [
        scrimedSecurityReleaseReadinessStatus,
        scrimedSecurityReleaseGates.map((gate) => [gate.id, gate.currentStatus]),
        scrimedSecurityReleaseLanes.map((lane) => [lane.stage, lane.decision])
      ]
    })
  };
}

export function getScrimedSecurityDiligenceEvidenceSummary() {
  return {
    service: "scrimed-security-diligence-evidence-packet",
    status: scrimedSecurityDiligenceEvidenceStatus,
    boundary: scrimedSecurityDiligenceEvidenceBoundary,
    safetyPolicyVersion: scrimedSafetyPolicyVersion,
    scorecard: getScrimedSecurityDiligenceEvidenceScorecard(),
    artifacts: scrimedSecurityEvidenceArtifacts,
    buyerQuestions: scrimedSecurityEvidenceQuestions,
    questionnaireResponses: scrimedSecurityQuestionnaireResponses,
    shareRules: [
      "Share metadata, command names, pass/fail status, audit hashes, and retained boundaries only.",
      "Do not share raw logs, bearer tokens, session JSON, production credentials, connector payloads, customer records, or PHI.",
      "Label buyer-facing evidence as synthetic/no-PHI diligence evidence unless external approvals expand authority.",
      "Use questionnaire responses as governed answer starters, not as confidential questionnaire storage or final legal/security acceptance.",
      "Treat PHI production, customer go-live, EHR writeback, payer submission, and production connector approval as blocked until formal external evidence exists."
    ],
    nextManualActions: [
      "Run authorized strict AAL2 no-PHI smoke and attach redacted token fingerprint evidence.",
      "Attach WAF, bot-management, SIEM/log-drain, SBOM, dependency scan, and external security review artifacts.",
      "Complete privacy risk assessment, retention policy, incident tabletop, and customer-specific threat model before PHI preproduction.",
      "Route buyer-specific security questionnaire answers through legal, privacy, security, and release-steward review before external submission.",
      "Keep the evidence packet redacted and metadata-only for investor or buyer sharing."
    ]
  };
}
