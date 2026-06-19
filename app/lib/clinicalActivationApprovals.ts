import type {
  ClinicalActivationDossier,
  ClinicalActivationSignOffStatus
} from "./clinicalActivationDossier";
import type { PilotWorkspaceRecord } from "./protectedPilotWorkspace";

export type ClinicalActivationApprovalStatus =
  | "readiness-attested-no-phi"
  | "external-review-required-acknowledged"
  | "customer-specific-required-acknowledged"
  | "blocked-before-go-live-acknowledged";

export type ClinicalActivationApprovalScope = "no-phi-readiness-review-only";

export type ClinicalActivationApprovalRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  domainId: string;
  domainLabel: string;
  approvalStatus: ClinicalActivationApprovalStatus;
  approvalScope: ClinicalActivationApprovalScope;
  reviewerRole: string;
  attestation: "aal2-readiness-attestation-no-phi";
  evidenceSnapshot: Record<string, unknown>;
  retainedBlockers: string[];
  noPhiAttestation: true;
  clinicalGoLiveAuthority: "not-authorized-live-care";
  signedBy: string;
  signedAt: string;
  createdAt: string;
  boundary: string;
};

export type ClinicalActivationApprovalDomain = {
  domainId: string;
  domainLabel: string;
  requiredSignatures: string[];
  dossierStatus: ClinicalActivationSignOffStatus;
  approvalStatus: ClinicalActivationApprovalStatus;
  latestApproval: ClinicalActivationApprovalRecord | null;
  approvalCount: number;
  canRecordAttestation: boolean;
  retainedBlockers: string[];
  evidenceReferences: string[];
  nextAction: string;
  legalClinicalFinancialBrandValue: string;
};

export type ClinicalActivationApprovalWorkflow = {
  service: "scrimed-clinical-activation-approval-workflow";
  proofStackStatus: typeof clinicalActivationApprovalWorkflowProofStackStatus;
  workspaceSlug: string;
  workspaceName: string;
  tenantName: string;
  status: "go-live-blocked-approval-evidence-open" | "approval-history-unavailable";
  persistenceStatus:
    | "durable-approval-ledger-active"
    | "durable-approval-ledger-unavailable-workaround-active";
  boundary: string;
  approvalScope: ClinicalActivationApprovalScope;
  clinicalGoLiveAuthority: "not-authorized-live-care";
  summary: {
    domainCount: number;
    attestedDomainCount: number;
    missingDomainCount: number;
    blockedGateCount: number;
    retainedBlockerCount: number;
    latestApprovalAt: string | null;
  };
  domains: ClinicalActivationApprovalDomain[];
  approvals: ClinicalActivationApprovalRecord[];
  safeWorkarounds: string[];
  unavailableSections: string[];
  updated: string;
};

export const clinicalActivationApprovalWorkflowProofStackStatus =
  "aal2-clinical-activation-approval-workflow-no-phi";

export const clinicalActivationApprovalWorkflowBoundary =
  "Clinical Activation Approval Workflow v1 captures AAL2 no-PHI readiness attestations for regulated deployment planning only. It does not create legal advice, clinical approval, FDA clearance, HIPAA compliance certification, reimbursement determination, PHI authorization, patient outreach permission, production connector authorization, diagnosis, treatment, record mutation, payer submission, or live clinical execution authority.";

export const clinicalActivationApprovalAttestation =
  "aal2-readiness-attestation-no-phi";

export const clinicalActivationApprovalScope: ClinicalActivationApprovalScope =
  "no-phi-readiness-review-only";

const domainIdsByLabel: Record<string, string> = {
  "Regulatory classification": "regulatory-classification",
  "Clinical governance and safety": "clinical-governance-safety",
  "Privacy, security, and PHI readiness": "privacy-security-phi-readiness",
  "Interoperability and connector validation": "interoperability-connector-validation",
  "Legal, commercial, and reimbursement boundary": "legal-commercial-reimbursement-boundary",
  "Go-live, rollback, and operations": "go-live-rollback-operations"
};

export function clinicalActivationDomainId(domainLabel: string) {
  return domainIdsByLabel[domainLabel] ?? domainLabel.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function approvalStatusForSignOffStatus(
  status: ClinicalActivationSignOffStatus
): ClinicalActivationApprovalStatus {
  if (status === "unsigned-required") return "readiness-attested-no-phi";
  if (status === "external-review-required") return "external-review-required-acknowledged";
  if (status === "customer-specific-required") return "customer-specific-required-acknowledged";
  return "blocked-before-go-live-acknowledged";
}

function valueLineForDomain(domainId: string) {
  if (domainId === "regulatory-classification") {
    return "Legal and brand protection: prevents unsupported medical-device, clinical, or clearance claims before counsel review.";
  }

  if (domainId === "clinical-governance-safety") {
    return "Clinical protection: preserves licensed human authority, safety-case review, escalation paths, and patient-safety boundaries.";
  }

  if (domainId === "privacy-security-phi-readiness") {
    return "Privacy and security protection: keeps PHI/ePHI blocked until BAA/DPA, safeguard mapping, retention, and residency controls are approved.";
  }

  if (domainId === "interoperability-connector-validation") {
    return "Operational and financial protection: prevents unsafe EHR, payer, claims, imaging, or device side effects before sandbox validation and partner sign-off.";
  }

  if (domainId === "legal-commercial-reimbursement-boundary") {
    return "Financial and sales protection: separates paid synthetic pilot setup from live healthcare authorization, reimbursement guarantees, and unsupported ROI claims.";
  }

  return "Brand and operator protection: requires go-live ownership, rollback, monitoring, and support controls before production execution.";
}

function latestTimestamp(values: string[]) {
  const latest = values
    .map((value) => new Date(value).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => right - left)[0];

  return latest ? new Date(latest).toISOString() : null;
}

export function deriveClinicalActivationApprovalWorkflow({
  approvals,
  dossier,
  unavailableSections
}: {
  approvals: ClinicalActivationApprovalRecord[];
  dossier: ClinicalActivationDossier;
  unavailableSections: string[];
}): ClinicalActivationApprovalWorkflow {
  const approvalsByDomain = new Map<string, ClinicalActivationApprovalRecord[]>();

  for (const approval of approvals) {
    const current = approvalsByDomain.get(approval.domainId) ?? [];
    current.push(approval);
    approvalsByDomain.set(approval.domainId, current);
  }

  const domains = dossier.signedApprovalMetadata.map((metadata) => {
    const domainId = clinicalActivationDomainId(metadata.domain);
    const domainApprovals = (approvalsByDomain.get(domainId) ?? []).sort(
      (left, right) => new Date(right.signedAt).getTime() - new Date(left.signedAt).getTime()
    );
    const latestApproval = domainApprovals[0] ?? null;
    const approvalStatus = latestApproval?.approvalStatus ?? approvalStatusForSignOffStatus(metadata.status);
    const retainedBlockers = Array.from(
      new Set([...(metadata.blockedUntilSigned ?? []), ...(latestApproval?.retainedBlockers ?? [])])
    );

    return {
      domainId,
      domainLabel: metadata.domain,
      requiredSignatures: metadata.requiredSignatures,
      dossierStatus: metadata.status,
      approvalStatus,
      latestApproval,
      approvalCount: domainApprovals.length,
      canRecordAttestation: true,
      retainedBlockers,
      evidenceReferences: metadata.evidenceReferences,
      nextAction: latestApproval
        ? "Retain this AAL2 no-PHI attestation, then collect external or customer-specific signed evidence where the gate still requires it."
        : "Record an AAL2 no-PHI readiness attestation or keep this domain blocked until the accountable reviewer signs outside SCRIMED.",
      legalClinicalFinancialBrandValue: valueLineForDomain(domainId)
    } satisfies ClinicalActivationApprovalDomain;
  });

  const latestApprovalAt = latestTimestamp(approvals.map((approval) => approval.signedAt));
  const attestedDomainCount = domains.filter((domain) => domain.latestApproval).length;
  const retainedBlockerCount = domains.reduce(
    (total, domain) => total + domain.retainedBlockers.length,
    0
  );

  return {
    service: "scrimed-clinical-activation-approval-workflow",
    proofStackStatus: clinicalActivationApprovalWorkflowProofStackStatus,
    workspaceSlug: dossier.workspaceSlug,
    workspaceName: dossier.workspaceName,
    tenantName: dossier.tenantName,
    status: unavailableSections.some((section) => section.includes("approval history"))
      ? "approval-history-unavailable"
      : "go-live-blocked-approval-evidence-open",
    persistenceStatus: unavailableSections.some((section) => section.includes("approval history"))
      ? "durable-approval-ledger-unavailable-workaround-active"
      : "durable-approval-ledger-active",
    boundary: clinicalActivationApprovalWorkflowBoundary,
    approvalScope: clinicalActivationApprovalScope,
    clinicalGoLiveAuthority: "not-authorized-live-care",
    summary: {
      domainCount: domains.length,
      attestedDomainCount,
      missingDomainCount: domains.length - attestedDomainCount,
      blockedGateCount: dossier.readiness.blockedGateCount,
      retainedBlockerCount,
      latestApprovalAt
    },
    domains,
    approvals,
    safeWorkarounds: [
      "Use the Clinical Activation Dossier packet as the evidence bundle while external legal, clinical, privacy, security, reimbursement, and customer approvals are collected.",
      "Keep all pilot work synthetic, no-PHI, and human-reviewed until the durable approval ledger, BAA/DPA path, clinical governance, connector validation, and customer go-live approval are complete.",
      "Use signed documents in the buyer's approved legal system of record when an approval has contractual or regulatory significance; SCRIMED stores only no-PHI readiness attestations at this stage."
    ],
    unavailableSections,
    updated: latestApprovalAt ?? dossier.updated
  };
}

export function buildClinicalActivationApprovalEvidenceSnapshot({
  domain,
  dossier
}: {
  domain: ClinicalActivationApprovalDomain;
  dossier: ClinicalActivationDossier;
}) {
  return {
    service: "scrimed-clinical-activation-approval-evidence-snapshot",
    domainId: domain.domainId,
    domainLabel: domain.domainLabel,
    dossierStatus: domain.dossierStatus,
    readinessScore: dossier.readiness.score,
    hardGateCount: dossier.readiness.hardGateCount,
    blockedGateCount: dossier.readiness.blockedGateCount,
    protectedEvidenceCount: dossier.readiness.protectedEvidenceCount,
    evidenceReferences: domain.evidenceReferences,
    requiredSignatures: domain.requiredSignatures,
    retainedBlockers: domain.retainedBlockers,
    approvalScope: clinicalActivationApprovalScope,
    noPhiOnly: true,
    clinicalGoLiveAuthority: "not-authorized-live-care",
    boundary: clinicalActivationApprovalWorkflowBoundary,
    capturedAt: new Date().toISOString()
  };
}

export function buildClinicalActivationApprovalPacket({
  actorUserId,
  auditEventId,
  generatedAt,
  workflow,
  workspace
}: {
  actorUserId: string;
  auditEventId: string;
  generatedAt: string;
  workflow: ClinicalActivationApprovalWorkflow;
  workspace: PilotWorkspaceRecord;
}) {
  return [
    "# SCRIMED Clinical Activation Approval Workflow",
    "",
    `Generated: ${generatedAt}`,
    `Audit event: ${auditEventId}`,
    `Actor: ${actorUserId}`,
    `Tenant: ${workspace.tenantName}`,
    `Workspace: ${workspace.name} (${workspace.slug})`,
    `Status: ${workflow.status}`,
    `Persistence: ${workflow.persistenceStatus}`,
    `Approval scope: ${workflow.approvalScope}`,
    `Clinical go-live authority: ${workflow.clinicalGoLiveAuthority}`,
    "",
    "## Boundary",
    workflow.boundary,
    "",
    "## Summary",
    `- Domains: ${workflow.summary.domainCount}`,
    `- Attested domains: ${workflow.summary.attestedDomainCount}`,
    `- Missing domains: ${workflow.summary.missingDomainCount}`,
    `- Blocked gates retained: ${workflow.summary.blockedGateCount}`,
    `- Retained blockers: ${workflow.summary.retainedBlockerCount}`,
    `- Latest approval at: ${workflow.summary.latestApprovalAt ?? "not recorded"}`,
    "",
    "## Domain Attestations",
    ...workflow.domains.map((domain) =>
      [
        `- ${domain.domainLabel} (${domain.domainId})`,
        `  - Status: ${domain.approvalStatus}`,
        `  - Required signatures: ${domain.requiredSignatures.join(", ")}`,
        `  - Latest signed by: ${domain.latestApproval?.signedBy ?? "not recorded"}`,
        `  - Latest signed at: ${domain.latestApproval?.signedAt ?? "not recorded"}`,
        `  - Retained blockers: ${domain.retainedBlockers.join("; ") || "none recorded"}`
      ].join("\n")
    ),
    "",
    "## Safe Workarounds",
    ...workflow.safeWorkarounds.map((workaround) => `- ${workaround}`),
    "",
    "## Unavailable Sections",
    ...(workflow.unavailableSections.length
      ? workflow.unavailableSections.map((section) => `- ${section}`)
      : ["- None reported during approval workflow generation."])
  ].join("\n");
}
