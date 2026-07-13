import { getDiligenceReleaseGateSummary } from "./diligenceReleaseGate";
import { getDiligencePacketManifestSummary } from "./diligencePacketManifest";
import { getDiligencePacketShareGuardSummary } from "./diligencePacketShareGuard";
import { getQaAal2SmokeReadinessPacket } from "./qaAal2RunEvidence";
import { getRecipientQualificationMatrixSummary } from "./recipientQualificationMatrix";
import { getReleaseAuthorizationChainSummary } from "./releaseAuthorizationChain";
import { getReleaseEvidenceFreshnessGuardSummary } from "./releaseEvidenceFreshnessGuard";
import { getReleaseEvidenceLedgerSummary } from "./releaseEvidenceLedger";
import { getReleaseEvidencePromotionSummary } from "./releaseEvidencePromotion";

export type ReleaseContinuityGateStatus =
  | "resolved"
  | "operator-required"
  | "blocked-by-design"
  | "external-review-required";

export type ReleaseContinuityGate = {
  key: string;
  name: string;
  status: ReleaseContinuityGateStatus;
  proof: string;
  bottleneck: string;
  workaround: string;
  owner: string;
  proofRoutes: string[];
};

export type ReleaseContinuityCheck = {
  name: string;
  status: "passed" | "requires-aal2-operator" | "external-review-required";
  evidence: string;
  nextAction: string;
};

export type ReleaseContinuityDeploymentChecklistItem = {
  id: string;
  label: string;
  status:
    | "passed"
    | "required-before-release"
    | "operator-required"
    | "aal2-smoke-readiness-preflight-ready-no-secret"
    | "blocked-until-human-aal2"
    | "external-review-required";
  command: string;
  route: string;
  evidence: string;
  humanReviewRequired: boolean;
  noSecretBoundary: string;
};

export const releaseContinuityProofStackStatus =
  "release-continuity-checkpointed-aal2-boundary";
export const releaseContinuityBriefProofStackStatus =
  "release-continuity-brief-operator-ready";
export const releaseContinuityUpdatedAt = "2026-06-23";

export const releaseContinuityBoundary =
  "SCRIMED Release Continuity ties live production, source-control checkpoints, no-secret smoke checks, and protected AAL2 operator gates into one operating view. It does not mint tokens, store secrets, bypass AAL2, approve buyer release, authorize PHI processing, certify security or compliance, grant legal approval, or authorize live clinical care.";

export const releaseContinuitySource = {
  productionDomain: "https://app.scrimedsolutions.com",
  baselineDeploymentId: "dpl_EjfSCM5YKpWhHKDAa6FGmNDPnJ7K",
  baselineCommit: "6219f3616e71d163edd047e4d55074cc5089e2b8",
  baselineShortCommit: "6219f36",
  baselineTag: "scrimed-code-pt2-approvals-readiness-20260623",
  runtimeCommit:
    process.env.VERCEL_GIT_COMMIT_SHA ?? "runtime-commit-unset-local-or-preview",
  runtimeBranch:
    process.env.VERCEL_GIT_COMMIT_REF ?? "runtime-branch-unset-local-or-preview",
  runtimeDeploymentUrl: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "runtime-deployment-url-unset-local-or-custom-domain"
};

export const releaseContinuityGates: ReleaseContinuityGate[] = [
  {
    key: "source-control-drift",
    name: "Source-control drift",
    status: "resolved",
    proof:
      "The approvals readiness and buyer release-control release was committed, tagged, pushed, and verified against origin/main.",
    bottleneck:
      "Production-only changes can become hard to audit if Vercel history moves ahead of GitHub.",
    workaround:
      "Keep every production release checkpointed by commit, tag, production smoke, and briefed release boundary.",
    owner: "Founder + Release Steward",
    proofRoutes: ["/product", "/api/product/console", "/api/release-continuity"]
  },
  {
    key: "public-production-smoke",
    name: "Public production smoke",
    status: "resolved",
    proof:
      "Public smoke validates the custom domain, HTML routes, JSON APIs, Markdown briefs, fail-closed protected routes, and approval boundaries.",
    bottleneck:
      "Public readiness can look healthy while protected writes still require explicit AAL2 proof.",
    workaround:
      "Pair public smoke with protected fail-closed checks and a separate AAL2 operator run when a fresh session exists.",
    owner: "Release Steward",
    proofRoutes: ["/api/release-continuity", "/api/product/console", "/qa-evidence"]
  },
  {
    key: "protected-aal2-happy-path",
    name: "Protected AAL2 happy path",
    status: "operator-required",
    proof:
      "TrustOps, Agent Workspace, and Buyer Release Control fail closed without a tenant-admin or pilot-lead AAL2 session.",
    bottleneck:
      "A terminal cannot safely create or retain a fresh human AAL2 bearer token without crossing the no-secret boundary.",
    workaround:
      "Use the protected browser workspace for no-secret verification, or run the CLI smoke only with a fresh external AAL2 token and dispose of it immediately after the run.",
    owner: "Approved tenant-admin or pilot-lead operator",
    proofRoutes: [
      "/pilot-workspace/access",
      "/buyer-release-control-run",
      "/api/pilot-workspaces/{workspaceSlug}/buyer-release-control-run"
    ]
  },
  {
    key: "aal2-smoke-readiness-packet",
    name: "AAL2 smoke readiness packet",
    status: "operator-required",
    proof:
      "The no-secret AAL2 smoke readiness packet is exposed for release review while strict protected writes remain human-token and feature-flag gated.",
    bottleneck:
      "A release checklist can prove readiness surfaces exist, but it cannot prove authenticated protected writes without a fresh human AAL2 session.",
    workaround:
      "Inspect /api/qa-evidence/aal2-smoke-readiness, run npm run smoke:aal2:readiness, then use a short-lived authorized AAL2 token only for deliberate strict smoke.",
    owner: "Release Steward + Approved AAL2 Operator",
    proofRoutes: [
      "/qa-aal2-run-evidence",
      "/api/qa-evidence/aal2-smoke-readiness",
      "/api/qa-evidence/aal2-smoke-readiness/brief"
    ]
  },
  {
    key: "secret-handling",
    name: "Secret handling",
    status: "blocked-by-design",
    proof:
      "Release scripts skip authenticated mutations unless a deliberate short-lived token is supplied outside the product and outside source control.",
    bottleneck:
      "Automating protected happy-path evidence with stored long-lived tokens would weaken the trust boundary.",
    workaround:
      "Prefer browser AAL2 operator panels; when CLI evidence is necessary, use explicit environment variables for one run and never write token values to docs, chat, CI logs, or code.",
    owner: "Security + Operator",
    proofRoutes: ["/qa-run-control", "/qa-launch-kit", "/qa-human-run-packet"]
  },
  {
    key: "regulated-approval-claims",
    name: "Regulated approval claims",
    status: "external-review-required",
    proof:
      "Approvals Readiness and Boundary Resolution keep legal, HIPAA, SOC 2, HITRUST, FDA, ONC, reimbursement, and public customer-permission claims externally gated.",
    bottleneck:
      "SCRIMED can prepare approval evidence, but it cannot self-certify or self-authorize regulated claims.",
    workaround:
      "Route public copy through Claim Guard, keep intended use narrow, retain external approval references, and require qualified reviewer sign-off before any claim expansion.",
    owner: "Founder + Legal/Security/Regulatory reviewers",
    proofRoutes: ["/approvals-readiness", "/boundary-resolution", "/qa-claim-guard"]
  }
];

export const releaseContinuityChecks: ReleaseContinuityCheck[] = [
  {
    name: "npm audit",
    status: "passed",
    evidence: "0 vulnerabilities at moderate threshold.",
    nextAction: "Repeat before each production release."
  },
  {
    name: "Generated integrity",
    status: "passed",
    evidence: "Generated workspace integrity check passed.",
    nextAction: "Keep generated cache cleanup in the build lifecycle."
  },
  {
    name: "TypeScript and ESLint",
    status: "passed",
    evidence: "TypeScript noEmit and ESLint completed cleanly.",
    nextAction: "Keep static checks required before deploy."
  },
  {
    name: "Production public smoke",
    status: "passed",
    evidence: "Custom-domain public smoke passed across release, approval, QA, and fail-closed protected surfaces.",
    nextAction: "Run after each deploy and tag."
  },
  {
    name: "Protected happy path",
    status: "requires-aal2-operator",
    evidence: "Fail-closed checks pass; authenticated mutation proof requires fresh human AAL2.",
    nextAction: "Use browser protected workspace or one-time short-lived AAL2 token run."
  },
  {
    name: "AAL2 smoke readiness preflight",
    status: "requires-aal2-operator",
    evidence:
      "No-secret readiness packet is present; strict durable-store and stored-vector smoke still require a fresh authorized human AAL2 token and target runtime enablement.",
    nextAction:
      "Run npm run smoke:aal2:readiness before any strict protected smoke and retain only no-secret evidence."
  },
  {
    name: "External certifications and approvals",
    status: "external-review-required",
    evidence: "Approval tracks are organized but not certified or cleared.",
    nextAction: "Move through qualified legal, security, regulatory, buyer, and certification-body review."
  }
];

function buildReleaseDeploymentChecklist(): ReleaseContinuityDeploymentChecklistItem[] {
  const aal2SmokeReadiness = getQaAal2SmokeReadinessPacket();

  return [
    {
      id: "generated-integrity-static-checks",
      label: "Generated integrity, typecheck, lint, and build",
      status: "required-before-release",
      command: "npm run test:nonsecret && npm run typecheck && npm run lint && npm run build",
      route: "/api/release-continuity",
      evidence:
        "Local static and contract checks must pass before any production deploy or buyer diligence expansion.",
      humanReviewRequired: false,
      noSecretBoundary:
        "Static checks must run without PHI, credentials, bearer tokens, service-role keys, or production connector payloads."
    },
    {
      id: "public-production-smoke",
      label: "Public production smoke",
      status: "required-before-release",
      command: "npm run smoke:public",
      route: "/api/release-continuity",
      evidence:
        "Public smoke verifies the deployed domain, public APIs, brief routes, safety headers, and fail-closed protected route posture.",
      humanReviewRequired: false,
      noSecretBoundary:
        "Public smoke must never require or emit bearer tokens, Supabase service-role keys, PHI, or customer data."
    },
    {
      id: "aal2-smoke-readiness-preflight",
      label: "AAL2 smoke readiness preflight",
      status: aal2SmokeReadiness.status,
      command: "npm run smoke:aal2:readiness",
      route: aal2SmokeReadiness.routes.api,
      evidence:
        "No-secret readiness packet confirms operator gates, strict-smoke commands, and fail-closed modes while keeping strict attempt ready false until human AAL2 is present.",
      humanReviewRequired: true,
      noSecretBoundary: aal2SmokeReadiness.boundary
    },
    {
      id: "strict-aal2-durable-store-smoke",
      label: "Strict AAL2 durable-store smoke",
      status: "blocked-until-human-aal2",
      command: "npm run smoke:aal2:durable-store:strict",
      route: "/api/workflows/execution-attempts/durable-store",
      evidence:
        "Authenticated record, replay, and review-disposition proof requires an authorized tenant-admin, pilot-lead, or reviewer session plus protected writes enabled on the target.",
      humanReviewRequired: true,
      noSecretBoundary:
        "Strict durable-store smoke must use only short-lived local token material and retain no PHI, credentials, or token values."
    },
    {
      id: "strict-stored-vector-rpc-smoke",
      label: "Strict stored-vector RPC smoke",
      status: "blocked-until-human-aal2",
      command: "npm run smoke:scrimed-stored-vector-rpc:strict",
      route: aal2SmokeReadiness.routes.storedVectorRpcSmoke,
      evidence:
        "Stored-vector lookup proof remains protected by the same AAL2 and tenant-role boundary as durable-store strict smoke.",
      humanReviewRequired: true,
      noSecretBoundary:
        "Stored-vector smoke must not expose raw embeddings, token values, PHI, or production patient matching."
    }
  ];
}

export function getReleaseContinuitySummary() {
  const aal2SmokeReadiness = getQaAal2SmokeReadinessPacket();
  const deploymentReleaseChecklist = buildReleaseDeploymentChecklist();
  const releaseEvidenceLedger = getReleaseEvidenceLedgerSummary();
  const releaseEvidencePromotion = getReleaseEvidencePromotionSummary();
  const releaseEvidenceFreshnessGuard = getReleaseEvidenceFreshnessGuardSummary();
  const diligenceReleaseGate = getDiligenceReleaseGateSummary();
  const diligencePacketManifest = getDiligencePacketManifestSummary();
  const diligencePacketShareGuard = getDiligencePacketShareGuardSummary();
  const recipientQualificationMatrix = getRecipientQualificationMatrixSummary();
  const releaseAuthorizationChain = getReleaseAuthorizationChainSummary();
  const resolvedGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "resolved"
  ).length;
  const operatorRequiredGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "operator-required"
  ).length;
  const blockedByDesignGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "blocked-by-design"
  ).length;
  const externalReviewGateCount = releaseContinuityGates.filter(
    (gate) => gate.status === "external-review-required"
  ).length;
  const passedCheckCount = releaseContinuityChecks.filter(
    (check) => check.status === "passed"
  ).length;

  return {
    service: "scrimed-release-continuity",
    route: "/release-continuity",
    apiRoute: "/api/release-continuity",
    briefRoute: "/api/release-continuity/brief",
    status: releaseContinuityProofStackStatus,
    briefStatus: releaseContinuityBriefProofStackStatus,
    authorizationStatus: "public-release-evidence-only-protected-aal2-required",
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    releaseAuthority: "not-release-approval",
    securityCertification: "not-security-certified",
    approvalAuthority: "external-review-required",
    tokenHandling: "no-token-values-exposed-or-retained",
    boundary: releaseContinuityBoundary,
    source: releaseContinuitySource,
    gateCount: releaseContinuityGates.length,
    resolvedGateCount,
    operatorRequiredGateCount,
    blockedByDesignGateCount,
    externalReviewGateCount,
    checkCount: releaseContinuityChecks.length,
    passedCheckCount,
    gates: releaseContinuityGates,
    checks: releaseContinuityChecks,
    aal2SmokeReadiness: {
      status: aal2SmokeReadiness.status,
      apiRoute: aal2SmokeReadiness.routes.api,
      briefRoute: aal2SmokeReadiness.routes.brief,
      strictAttemptReady: aal2SmokeReadiness.strictAttemptReady,
      protectedHumanRunRequired: aal2SmokeReadiness.protectedHumanRunRequired,
      operatorTokenRequired: aal2SmokeReadiness.operatorTokenRequired,
      gateCount: aal2SmokeReadiness.gates.length,
      commandCount: aal2SmokeReadiness.commands.length
    },
    deploymentReleaseChecklist,
    releaseEvidenceLedger: {
      status: releaseEvidenceLedger.status,
      route: releaseEvidenceLedger.route,
      apiRoute: releaseEvidenceLedger.apiRoute,
      briefRoute: releaseEvidenceLedger.briefRoute,
      entryCount: releaseEvidenceLedger.entryCount,
      passedNoSecretCount: releaseEvidenceLedger.passedNoSecretCount,
      operatorRequiredCount: releaseEvidenceLedger.operatorRequiredCount,
      externalReviewRequiredCount:
        releaseEvidenceLedger.externalReviewRequiredCount,
      tokenMaterialCaptured: releaseEvidenceLedger.tokenMaterialCaptured,
      productionApproval: releaseEvidenceLedger.productionApproval,
      boundary: releaseEvidenceLedger.boundary
    },
    releaseEvidencePromotion: {
      status: releaseEvidencePromotion.status,
      route: releaseEvidencePromotion.route,
      apiRoute: releaseEvidencePromotion.apiRoute,
      briefRoute: releaseEvidencePromotion.briefRoute,
      queueCount: releaseEvidencePromotion.queueCount,
      shareableNoSecretCount: releaseEvidencePromotion.shareableNoSecretCount,
      operatorProofRequiredCount:
        releaseEvidencePromotion.operatorProofRequiredCount,
      externalReviewRequiredCount:
        releaseEvidencePromotion.externalReviewRequiredCount,
      tokenMaterialCaptured: releaseEvidencePromotion.tokenMaterialCaptured,
      productionApproval: releaseEvidencePromotion.productionApproval,
      buyerDistributionAuthority:
        releaseEvidencePromotion.buyerDistributionAuthority,
      externalDistributionAuthority:
        releaseEvidencePromotion.externalDistributionAuthority,
      publicClaimAuthority: releaseEvidencePromotion.publicClaimAuthority,
      boundary: releaseEvidencePromotion.boundary
    },
    releaseEvidenceFreshnessGuard: {
      status: releaseEvidenceFreshnessGuard.status,
      route: releaseEvidenceFreshnessGuard.route,
      apiRoute: releaseEvidenceFreshnessGuard.apiRoute,
      briefRoute: releaseEvidenceFreshnessGuard.briefRoute,
      freshnessHash: releaseEvidenceFreshnessGuard.freshnessHash,
      freshnessAuthority: releaseEvidenceFreshnessGuard.freshnessAuthority,
      publicDistributionAuthority:
        releaseEvidenceFreshnessGuard.publicDistributionAuthority,
      customerSpecificAuthority:
        releaseEvidenceFreshnessGuard.customerSpecificAuthority,
      cardCount: releaseEvidenceFreshnessGuard.cardCount,
      internalFreshCount: releaseEvidenceFreshnessGuard.internalFreshCount,
      refreshRequiredCount: releaseEvidenceFreshnessGuard.refreshRequiredCount,
      humanAal2RefreshCount:
        releaseEvidenceFreshnessGuard.humanAal2RefreshCount,
      qualifiedReviewRefreshCount:
        releaseEvidenceFreshnessGuard.qualifiedReviewRefreshCount,
      tokenMaterialCaptured:
        releaseEvidenceFreshnessGuard.tokenMaterialCaptured,
      productionApproval: releaseEvidenceFreshnessGuard.productionApproval,
      clinicalCareAuthority: releaseEvidenceFreshnessGuard.clinicalCareAuthority,
      phiAuthority: releaseEvidenceFreshnessGuard.phiAuthority,
      securityCertification: releaseEvidenceFreshnessGuard.securityCertification,
      boundary: releaseEvidenceFreshnessGuard.boundary
    },
    diligenceReleaseGate: {
      status: diligenceReleaseGate.status,
      route: diligenceReleaseGate.route,
      apiRoute: diligenceReleaseGate.apiRoute,
      briefRoute: diligenceReleaseGate.briefRoute,
      buyerDiligenceGate: diligenceReleaseGate.buyerDiligenceGate,
      protectedAal2Gate: diligenceReleaseGate.protectedAal2Gate,
      publicDistributionGate: diligenceReleaseGate.publicDistributionGate,
      productionReleaseGate: diligenceReleaseGate.productionReleaseGate,
      clinicalProductionGate: diligenceReleaseGate.clinicalProductionGate,
      gateCount: diligenceReleaseGate.gateCount,
      goCount: diligenceReleaseGate.goCount,
      reviewRequiredCount: diligenceReleaseGate.reviewRequiredCount,
      noGoCount: diligenceReleaseGate.noGoCount,
      tokenMaterialCaptured: diligenceReleaseGate.tokenMaterialCaptured,
      productionApproval: diligenceReleaseGate.productionApproval,
      boundary: diligenceReleaseGate.boundary
    },
    diligencePacketManifest: {
      status: diligencePacketManifest.status,
      route: diligencePacketManifest.route,
      apiRoute: diligencePacketManifest.apiRoute,
      briefRoute: diligencePacketManifest.briefRoute,
      manifestHash: diligencePacketManifest.manifestHash,
      packetUseAuthority: diligencePacketManifest.packetUseAuthority,
      publicDistributionAuthority:
        diligencePacketManifest.publicDistributionAuthority,
      clinicalCareAuthority: diligencePacketManifest.clinicalCareAuthority,
      phiAuthority: diligencePacketManifest.phiAuthority,
      securityCertification: diligencePacketManifest.securityCertification,
      itemCount: diligencePacketManifest.itemCount,
      includeNoSecretCount: diligencePacketManifest.includeNoSecretCount,
      summaryOnlyCount: diligencePacketManifest.summaryOnlyCount,
      withholdUntilHumanAal2Count:
        diligencePacketManifest.withholdUntilHumanAal2Count,
      withholdUntilQualifiedReviewCount:
        diligencePacketManifest.withholdUntilQualifiedReviewCount,
      noGoCount: diligencePacketManifest.noGoCount,
      tokenMaterialCaptured: diligencePacketManifest.tokenMaterialCaptured,
      productionApproval: diligencePacketManifest.productionApproval,
      boundary: diligencePacketManifest.boundary
    },
    diligencePacketShareGuard: {
      status: diligencePacketShareGuard.status,
      route: diligencePacketShareGuard.route,
      apiRoute: diligencePacketShareGuard.apiRoute,
      briefRoute: diligencePacketShareGuard.briefRoute,
      guardHash: diligencePacketShareGuard.guardHash,
      externalShareAuthority: diligencePacketShareGuard.externalShareAuthority,
      recipientAuthorizationAuthority:
        diligencePacketShareGuard.recipientAuthorizationAuthority,
      publicDistributionAuthority:
        diligencePacketShareGuard.publicDistributionAuthority,
      customerSpecificAuthority:
        diligencePacketShareGuard.customerSpecificAuthority,
      clinicalCareAuthority: diligencePacketShareGuard.clinicalCareAuthority,
      phiAuthority: diligencePacketShareGuard.phiAuthority,
      securityCertification: diligencePacketShareGuard.securityCertification,
      cardCount: diligencePacketShareGuard.cardCount,
      noGoCount: diligencePacketShareGuard.noGoCount,
      reviewRequiredCount: diligencePacketShareGuard.reviewRequiredCount,
      internalAllowCount: diligencePacketShareGuard.internalAllowCount,
      tokenMaterialCaptured: diligencePacketShareGuard.tokenMaterialCaptured,
      productionApproval: diligencePacketShareGuard.productionApproval,
      boundary: diligencePacketShareGuard.boundary
    },
    recipientQualificationMatrix: {
      status: recipientQualificationMatrix.status,
      route: recipientQualificationMatrix.route,
      apiRoute: recipientQualificationMatrix.apiRoute,
      briefRoute: recipientQualificationMatrix.briefRoute,
      qualificationHash: recipientQualificationMatrix.qualificationHash,
      externalShareAuthority:
        recipientQualificationMatrix.externalShareAuthority,
      publicDistributionAuthority:
        recipientQualificationMatrix.publicDistributionAuthority,
      recipientIdentifierStorage:
        recipientQualificationMatrix.recipientIdentifierStorage,
      customerSpecificAuthority:
        recipientQualificationMatrix.customerSpecificAuthority,
      clinicalCareAuthority: recipientQualificationMatrix.clinicalCareAuthority,
      phiAuthority: recipientQualificationMatrix.phiAuthority,
      securityCertification: recipientQualificationMatrix.securityCertification,
      recipientClassCount: recipientQualificationMatrix.recipientClassCount,
      qualifiedReviewRequiredCount:
        recipientQualificationMatrix.qualifiedReviewRequiredCount,
      blockedRecipientCount: recipientQualificationMatrix.blockedRecipientCount,
      revocationRequiredCount:
        recipientQualificationMatrix.revocationRequiredCount,
      tokenMaterialCaptured: recipientQualificationMatrix.tokenMaterialCaptured,
      productionApproval: recipientQualificationMatrix.productionApproval,
      boundary: recipientQualificationMatrix.boundary
    },
    releaseAuthorizationChain: {
      status: releaseAuthorizationChain.status,
      route: releaseAuthorizationChain.route,
      apiRoute: releaseAuthorizationChain.apiRoute,
      briefRoute: releaseAuthorizationChain.briefRoute,
      authorizationHash: releaseAuthorizationChain.authorizationHash,
      safeUseLabel: releaseAuthorizationChain.safeUseLabel,
      chainDecision: releaseAuthorizationChain.chainDecision,
      weakestLink: releaseAuthorizationChain.weakestLink,
      buyerDiligenceMetadataLane:
        releaseAuthorizationChain.buyerDiligenceMetadataLane,
      protectedProofLane: releaseAuthorizationChain.protectedProofLane,
      publicDistributionAuthority:
        releaseAuthorizationChain.publicDistributionAuthority,
      customerSpecificAuthority:
        releaseAuthorizationChain.customerSpecificAuthority,
      releaseAuthority: releaseAuthorizationChain.releaseAuthority,
      clinicalCareAuthority: releaseAuthorizationChain.clinicalCareAuthority,
      phiAuthority: releaseAuthorizationChain.phiAuthority,
      securityCertification: releaseAuthorizationChain.securityCertification,
      controlCount: releaseAuthorizationChain.controlCount,
      passedNoSecretCount: releaseAuthorizationChain.passedNoSecretCount,
      humanReviewRequiredCount:
        releaseAuthorizationChain.humanReviewRequiredCount,
      operatorRequiredCount: releaseAuthorizationChain.operatorRequiredCount,
      externalReviewRequiredCount:
        releaseAuthorizationChain.externalReviewRequiredCount,
      blockedByDesignCount: releaseAuthorizationChain.blockedByDesignCount,
      tokenMaterialCaptured: releaseAuthorizationChain.tokenMaterialCaptured,
      productionApproval: releaseAuthorizationChain.productionApproval,
      boundary: releaseAuthorizationChain.boundary
    },
    nextOperatorActions: [
      "Use /release-continuity before and after each production deployment.",
      "Run /api/release-continuity/authorization-chain before any external packet reference so the weakest-link decision is visible across evidence, freshness, manifest, recipient, share, and AAL2 controls.",
      "Assemble buyer and investor packets from /api/release-continuity/diligence-packet-manifest so every included artifact carries allowed fields, withheld material, and reviewer ownership.",
      "Run /api/release-continuity/recipient-qualification-matrix before external packet references so recipient class, expiry, revocation, and no-identifier storage rules are explicit.",
      "Apply /api/release-continuity/diligence-packet-share-guard before any packet is referenced outside SCRIMED so recipient class, human review, public distribution, and customer-specific authority stay explicit.",
      "Run /api/release-continuity/evidence-freshness-guard before external packet reuse so stale, protected AAL2, and qualified-review evidence is refreshed or withheld.",
      "Attach no-secret release evidence ledger entries to every buyer-facing release review.",
      "Promote only metadata-safe ledger entries through the Release Evidence Promotion Queue before buyer distribution.",
      "Use the Diligence Release Gate to label no-secret buyer-diligence GO items separately from strict AAL2, public-distribution, production, and clinical NO-GO items.",
      "Run public production smoke on the custom domain after every deploy.",
      "Inspect /api/qa-evidence/aal2-smoke-readiness before strict protected smoke.",
      "Use /pilot-workspace/access for browser-session AAL2 protected verification when possible.",
      "Use SCRIMED_BEARER_TOKEN only for a deliberate one-time CLI smoke, then dispose of it outside the product.",
      "Keep approval, PHI, clinical, certification, and buyer-release claims gated until qualified external evidence exists."
    ],
    updated: releaseContinuityUpdatedAt
  };
}

export function buildReleaseContinuityBrief() {
  const summary = getReleaseContinuitySummary();

  return [
    "# SCRIMED Release Continuity Brief",
    "",
    `Status: ${summary.status}`,
    `Authorization status: ${summary.authorizationStatus}`,
    `Clinical care authority: ${summary.clinicalCareAuthority}`,
    `PHI authority: ${summary.phiAuthority}`,
    `Release authority: ${summary.releaseAuthority}`,
    `Security certification: ${summary.securityCertification}`,
    `Approval authority: ${summary.approvalAuthority}`,
    `Token handling: ${summary.tokenHandling}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "This brief is not release approval, legal approval, security certification, HIPAA certification, FDA clearance, ONC certification, PHI processing approval, token authorization, or live clinical authorization.",
    "",
    "## Source Checkpoint",
    `- Production domain: ${summary.source.productionDomain}`,
    `- Baseline deployment: ${summary.source.baselineDeploymentId}`,
    `- Baseline commit: ${summary.source.baselineCommit}`,
    `- Baseline tag: ${summary.source.baselineTag}`,
    `- Runtime commit: ${summary.source.runtimeCommit}`,
    `- Runtime branch: ${summary.source.runtimeBranch}`,
    `- Runtime deployment URL: ${summary.source.runtimeDeploymentUrl}`,
    "",
    "## Gates",
    ...summary.gates.map(
      (gate) =>
        `- ${gate.name} (${gate.status}): ${gate.proof} Bottleneck: ${gate.bottleneck} Workaround: ${gate.workaround} Owner: ${gate.owner}`
    ),
    "",
    "## Checks",
    ...summary.checks.map(
      (check) =>
        `- ${check.name} (${check.status}): ${check.evidence} Next: ${check.nextAction}`
    ),
    "",
    "## AAL2 Smoke Readiness",
    `- Status: ${summary.aal2SmokeReadiness.status}`,
    `- Strict attempt ready: ${summary.aal2SmokeReadiness.strictAttemptReady}`,
    `- Human run required: ${summary.aal2SmokeReadiness.protectedHumanRunRequired}`,
    `- API: ${summary.aal2SmokeReadiness.apiRoute}`,
    "",
    "## Deployment Release Checklist",
    ...summary.deploymentReleaseChecklist.map(
      (item) =>
        `- ${item.label} (${item.status}): ${item.command} via ${item.route}. Human review required: ${item.humanReviewRequired}`
    ),
    "",
    "## Release Evidence Ledger",
    `- Status: ${summary.releaseEvidenceLedger.status}`,
    `- Entries: ${summary.releaseEvidenceLedger.entryCount}`,
    `- Passed no-secret: ${summary.releaseEvidenceLedger.passedNoSecretCount}`,
    `- Operator required: ${summary.releaseEvidenceLedger.operatorRequiredCount}`,
    `- API: ${summary.releaseEvidenceLedger.apiRoute}`,
    "",
    "## Release Evidence Promotion Queue",
    `- Status: ${summary.releaseEvidencePromotion.status}`,
    `- Queue entries: ${summary.releaseEvidencePromotion.queueCount}`,
    `- Shareable no-secret: ${summary.releaseEvidencePromotion.shareableNoSecretCount}`,
    `- Operator proof required: ${summary.releaseEvidencePromotion.operatorProofRequiredCount}`,
    `- External review required: ${summary.releaseEvidencePromotion.externalReviewRequiredCount}`,
    `- API: ${summary.releaseEvidencePromotion.apiRoute}`,
    "",
    "## Release Evidence Freshness Guard",
    `- Status: ${summary.releaseEvidenceFreshnessGuard.status}`,
    `- Freshness hash: ${summary.releaseEvidenceFreshnessGuard.freshnessHash}`,
    `- Freshness authority: ${summary.releaseEvidenceFreshnessGuard.freshnessAuthority}`,
    `- Cards: ${summary.releaseEvidenceFreshnessGuard.cardCount}`,
    `- Internal fresh: ${summary.releaseEvidenceFreshnessGuard.internalFreshCount}`,
    `- Refresh required: ${summary.releaseEvidenceFreshnessGuard.refreshRequiredCount}`,
    `- Human AAL2 refresh: ${summary.releaseEvidenceFreshnessGuard.humanAal2RefreshCount}`,
    `- Qualified review refresh: ${summary.releaseEvidenceFreshnessGuard.qualifiedReviewRefreshCount}`,
    `- API: ${summary.releaseEvidenceFreshnessGuard.apiRoute}`,
    "",
    "## Diligence Release Gate",
    `- Status: ${summary.diligenceReleaseGate.status}`,
    `- Buyer diligence: ${summary.diligenceReleaseGate.buyerDiligenceGate}`,
    `- Protected AAL2: ${summary.diligenceReleaseGate.protectedAal2Gate}`,
    `- Public distribution: ${summary.diligenceReleaseGate.publicDistributionGate}`,
    `- Production release: ${summary.diligenceReleaseGate.productionReleaseGate}`,
    `- Clinical production: ${summary.diligenceReleaseGate.clinicalProductionGate}`,
    `- API: ${summary.diligenceReleaseGate.apiRoute}`,
    "",
    "## Diligence Packet Manifest",
    `- Status: ${summary.diligencePacketManifest.status}`,
    `- Manifest hash: ${summary.diligencePacketManifest.manifestHash}`,
    `- Items: ${summary.diligencePacketManifest.itemCount}`,
    `- Include no-secret: ${summary.diligencePacketManifest.includeNoSecretCount}`,
    `- Withhold human AAL2: ${summary.diligencePacketManifest.withholdUntilHumanAal2Count}`,
    `- Withhold qualified review: ${summary.diligencePacketManifest.withholdUntilQualifiedReviewCount}`,
    `- API: ${summary.diligencePacketManifest.apiRoute}`,
    "",
    "## Diligence Packet Share Guard",
    `- Status: ${summary.diligencePacketShareGuard.status}`,
    `- Guard hash: ${summary.diligencePacketShareGuard.guardHash}`,
    `- External share: ${summary.diligencePacketShareGuard.externalShareAuthority}`,
    `- Recipient authorization: ${summary.diligencePacketShareGuard.recipientAuthorizationAuthority}`,
    `- Public distribution: ${summary.diligencePacketShareGuard.publicDistributionAuthority}`,
    `- Cards: ${summary.diligencePacketShareGuard.cardCount}`,
    `- Review required: ${summary.diligencePacketShareGuard.reviewRequiredCount}`,
    `- API: ${summary.diligencePacketShareGuard.apiRoute}`,
    "",
    "## Recipient Qualification Matrix",
    `- Status: ${summary.recipientQualificationMatrix.status}`,
    `- Qualification hash: ${summary.recipientQualificationMatrix.qualificationHash}`,
    `- External share: ${summary.recipientQualificationMatrix.externalShareAuthority}`,
    `- Recipient identifier storage: ${summary.recipientQualificationMatrix.recipientIdentifierStorage}`,
    `- Recipient classes: ${summary.recipientQualificationMatrix.recipientClassCount}`,
    `- Blocked recipients: ${summary.recipientQualificationMatrix.blockedRecipientCount}`,
    `- Revocation policies: ${summary.recipientQualificationMatrix.revocationRequiredCount}`,
    `- API: ${summary.recipientQualificationMatrix.apiRoute}`,
    "",
    "## Release Authorization Chain",
    `- Status: ${summary.releaseAuthorizationChain.status}`,
    `- Chain decision: ${summary.releaseAuthorizationChain.chainDecision}`,
    `- Weakest link: ${summary.releaseAuthorizationChain.weakestLink}`,
    `- Authorization hash: ${summary.releaseAuthorizationChain.authorizationHash}`,
    `- Safe use: ${summary.releaseAuthorizationChain.safeUseLabel}`,
    `- Controls: ${summary.releaseAuthorizationChain.controlCount}`,
    `- Passed no-secret: ${summary.releaseAuthorizationChain.passedNoSecretCount}`,
    `- Human review required: ${summary.releaseAuthorizationChain.humanReviewRequiredCount}`,
    `- Operator required: ${summary.releaseAuthorizationChain.operatorRequiredCount}`,
    `- External review required: ${summary.releaseAuthorizationChain.externalReviewRequiredCount}`,
    `- Blocked by design: ${summary.releaseAuthorizationChain.blockedByDesignCount}`,
    `- API: ${summary.releaseAuthorizationChain.apiRoute}`,
    "",
    "## Next Operator Actions",
    ...summary.nextOperatorActions.map((action) => `- ${action}`)
  ].join("\n");
}
