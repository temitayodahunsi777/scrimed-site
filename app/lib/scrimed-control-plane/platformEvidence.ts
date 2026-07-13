import { createAuditHash } from "../scrimed-work";

export type PlatformEvidenceProvider = "github" | "vercel" | "supabase" | "wix" | "figma";
export type PlatformEvidenceStatus = "verified" | "warning" | "blocked" | "unlinked" | "unavailable";
export type PlatformEvidenceSeverity = "low" | "moderate" | "high" | "critical";

export type CrossPlatformEvidenceRecord = {
  id: string;
  provider: PlatformEvidenceProvider;
  controlDomain: "source-control" | "deployment" | "data-plane" | "public-claims" | "design-governance";
  status: PlatformEvidenceStatus;
  severity: PlatformEvidenceSeverity;
  observedAt: string;
  expiresAt: string;
  evidenceClass: "connector-observed" | "live-endpoint-observed" | "local-repository-observed";
  sourceReference: string;
  summary: string;
  facts: string[];
  drift: string[];
  approvalImpact: string[];
  accountableOwner: string;
  nextAction: string;
  remediationStatus: "implemented-local" | "prepared-not-applied" | "external-action-required";
  remediationEvidence: string[];
  residualBlocker: string;
  secretsStored: false;
  rawProviderLogsStored: false;
  productionAuthorityGranted: false;
  externalMutationPerformed: boolean;
  auditHash: string;
};

export type CrossPlatformApprovalStep = {
  id: string;
  title: string;
  status: "ready-for-human-review" | "evidence-incomplete" | "externally-gated";
  accountableOwners: string[];
  completionEvidence: string[];
  blockedUntil: string[];
  unlocks: string[];
  automaticApprovalAllowed: false;
};

const observedAt = "2026-07-11T22:35:00-04:00";
const expiresAt = "2026-07-12T22:35:00-04:00";

function evidenceRecord(
  input: Omit<
    CrossPlatformEvidenceRecord,
    "auditHash" | "secretsStored" | "rawProviderLogsStored" | "productionAuthorityGranted"
  >
): CrossPlatformEvidenceRecord {
  return {
    ...input,
    secretsStored: false,
    rawProviderLogsStored: false,
    productionAuthorityGranted: false,
    auditHash: createAuditHash({
      id: input.id,
      provider: input.provider,
      status: input.status,
      observedAt: input.observedAt,
      drift: input.drift,
      nextAction: input.nextAction,
      externalMutationPerformed: input.externalMutationPerformed
    })
  };
}

export const crossPlatformEvidenceSnapshot: CrossPlatformEvidenceRecord[] = [
  evidenceRecord({
    id: "github-release-provenance",
    provider: "github",
    controlDomain: "source-control",
    status: "blocked",
    severity: "critical",
    observedAt,
    expiresAt,
    evidenceClass: "connector-observed",
    sourceReference: "GitHub repository metadata and local git status",
    summary: "The public main branch is behind the current local SCRIMED build, and the working tree contains a large unreviewed change set.",
    facts: [
      "Repository visibility is public.",
      "The latest observed main commit is Add commercial growth engine lane.",
      "No pull-request-triggered workflow runs were returned for the latest observed commit.",
      "The local working tree contains modified and untracked product, API, documentation, migration, and CI files."
    ],
    drift: [
      "The active product implementation is not represented by a reviewable commit or pull request.",
      "Release evidence cannot be bound to one immutable source revision."
    ],
    approvalImpact: ["source-controlled release approval", "buyer diligence evidence", "change-management evidence", "rollback provenance"],
    accountableOwner: "Engineering release steward",
    nextAction: "Partition the related working-tree changes, run the complete quality gate, and prepare one reviewable release candidate without committing unrelated state.",
    remediationStatus: "implemented-local",
    remediationEvidence: ["scripts/release-provenance-preflight.mjs", ".github/workflows/ci.yml", "docs/release-provenance.md"],
    residualBlocker: "The current broad working tree still requires human review and an intentional clean commit.",
    externalMutationPerformed: false
  }),
  evidenceRecord({
    id: "vercel-deployment-provenance",
    provider: "vercel",
    controlDomain: "deployment",
    status: "blocked",
    severity: "critical",
    observedAt,
    expiresAt,
    evidenceClass: "connector-observed",
    sourceReference: "Vercel project, deployment, build, and runtime-error metadata",
    summary: "The latest production deployment is READY, but its metadata identifies a dirty source tree and the current control-plane endpoint is not present on the custom domain.",
    facts: [
      "Latest observed production deployment state is READY.",
      "No grouped runtime errors were observed in the selected seven-day window.",
      "The latest build error filter returned no build failure.",
      "The deployment metadata reports gitDirty=1.",
      "The live custom domain returns 404 for /api/scrimed-control-plane/approvals."
    ],
    drift: [
      "A READY deployment does not prove that the current local platform is deployed.",
      "Dirty-build provenance weakens reproducibility and rollback confidence.",
      "The production domain and current repository capability surface are out of sync."
    ],
    approvalImpact: ["production promotion approval", "release attestation", "rollback evidence", "customer-facing capability claims"],
    accountableOwner: "Platform release steward",
    nextAction: "Block further promotion until a clean immutable revision passes CI, deploys through the approved pipeline, and the intended live route set passes public smoke.",
    remediationStatus: "implemented-local",
    remediationEvidence: ["SCRIMED_RELEASE_PROVENANCE_ENFORCED", "SCRIMED_APPROVED_RELEASE_SHA", "npm run release:provenance:strict"],
    residualBlocker: "Vercel production environment values and a source-controlled approved SHA require release-steward action.",
    externalMutationPerformed: false
  }),
  evidenceRecord({
    id: "supabase-data-plane-drift",
    provider: "supabase",
    controlDomain: "data-plane",
    status: "blocked",
    severity: "critical",
    observedAt,
    expiresAt,
    evidenceClass: "connector-observed",
    sourceReference: "Supabase project health, migration history, and advisor metadata",
    summary: "The protected-pilot project is healthy, but local durable-store and evidence-binding migrations are not present in the observed remote migration history.",
    facts: [
      "Project status is ACTIVE_HEALTHY in a US region.",
      "Observed remote migrations stop at the stored-vector lookup migration.",
      "Local execution-attempt compute-fabric evidence binding and SCRIMED Work durable-store migrations remain unapplied.",
      "Security advisors report the vector extension in the public schema and leaked-password protection disabled.",
      "Performance advisors report two stored-vector foreign keys without covering indexes."
    ],
    drift: [
      "Protected SCRIMED Work durability is not available in the observed data plane.",
      "Strict authenticated AAL2 durable-store evidence cannot pass until an approved nonproduction migration path exists.",
      "Security and query-performance findings require owner decisions before protected-pilot expansion."
    ],
    approvalImpact: ["no-PHI protected-pilot release", "AAL2 durability evidence", "security review", "database change approval"],
    accountableOwner: "Data platform and security owners",
    nextAction: "Create or authorize a nonproduction branch, apply pending migrations there, resolve advisor findings through reviewed migrations or documented risk acceptance, and run strict AAL2 smoke.",
    remediationStatus: "prepared-not-applied",
    remediationEvidence: ["supabase/migrations/20260711224500_stored_vector_advisor_index_hardening.sql", "docs/supabase-advisor-remediation.md"],
    residualBlocker: "Nonproduction migration authority, Pro-plan leaked-password protection, extension dependency review, and strict AAL2 evidence remain external.",
    externalMutationPerformed: false
  }),
  evidenceRecord({
    id: "wix-public-claims-integrity",
    provider: "wix",
    controlDomain: "public-claims",
    status: "blocked",
    severity: "critical",
    observedAt,
    expiresAt,
    evidenceClass: "live-endpoint-observed",
    sourceReference: "Published SCRIMED Solutions marketing-site content",
    summary: "The published marketing site contains a named client testimonial for which the repository approval graph has no authorization evidence.",
    facts: [
      "The Wix site is published on a custom domain.",
      "The public page includes a Hear from Our Clients section and a named testimonial.",
      "The Wix CMS collection inventory contains no testimonial collection; the affected section is static Wix Editor content.",
      "The Voice Intake Assistant form was disabled through a narrow Wix Forms API update after it was found accepting healthcare service details without a no-PHI warning.",
      "Two general contact forms remain enabled with unrestricted free-text fields and no schema-level no-PHI disclosure.",
      "The Wix dashboard identifies the current site configuration as not HIPAA compliant.",
      "SCRIMED governance blocks customer testimonials and logos without recipient-specific authorization evidence."
    ],
    drift: [
      "Public marketing content exceeds the evidence currently represented in the buyer-proof approval path.",
      "Remaining Wix forms, chat, bookings, and other collection paths must not solicit PHI under the current configuration.",
      "Unverified customer language can undermine investor and buyer trust."
    ],
    approvalImpact: ["marketing claims approval", "buyer-specific proof release", "legal review", "investor diligence"],
    accountableOwner: "Founder, legal reviewer, and marketing owner",
    nextAction: "Remove the named testimonial, label every Wix collection path no-PHI, and replace social proof with evidence-based platform proof until signed customer authorization and claim substantiation exist.",
    remediationStatus: "external-action-required",
    remediationEvidence: [
      "scripts/public-claims-integrity-smoke.mjs",
      "docs/public-claims-integrity.md",
      "Voice Intake Assistant form disabled and verified at revision 2",
      "Proof Before Promises replacement copy"
    ],
    residualBlocker: "Static Wix Editor content and both remaining free-text contact forms must be corrected, previewed, reviewed, and published by the authorized site owner; a blind whole-site publish is prohibited.",
    externalMutationPerformed: true
  }),
  evidenceRecord({
    id: "figma-design-governance",
    provider: "figma",
    controlDomain: "design-governance",
    status: "warning",
    severity: "moderate",
    observedAt,
    expiresAt,
    evidenceClass: "connector-observed",
    sourceReference: "Figma authenticated-account metadata",
    summary: "A Figma account is connected with a view seat, but no canonical SCRIMED design file is linked to this release evidence snapshot.",
    facts: [
      "The connected Figma account is authenticated.",
      "The observed team seat is view-only.",
      "No design-file key or component-library evidence was provided for reconciliation."
    ],
    drift: ["Visual changes cannot yet be traced to a canonical design artifact or approved component library."],
    approvalImpact: ["design review", "accessibility review", "brand consistency", "investor-demo polish"],
    accountableOwner: "Product design owner",
    nextAction: "Name one canonical design file, grant the appropriate design ownership, and bind page-level visual acceptance evidence to release review.",
    remediationStatus: "implemented-local",
    remediationEvidence: ["docs/scrimed-design-source-of-truth.md", "app/globals.css"],
    residualBlocker: "An editable Figma owner and canonical file remain unlinked.",
    externalMutationPerformed: false
  })
];

export const crossPlatformApprovalPath: CrossPlatformApprovalStep[] = [
  {
    id: "public-claims-integrity-review",
    title: "Public Claims Integrity Review",
    status: "ready-for-human-review",
    accountableOwners: ["Founder/CEO", "Legal reviewer", "Marketing owner"],
    completionEvidence: ["testimonial removed or signed authorization attached", "public copy review", "dated approval record"],
    blockedUntil: ["named customer and outcome claims are substantiated"],
    unlocks: ["truthful public narrative", "investor diligence confidence", "buyer-safe marketing"],
    automaticApprovalAllowed: false
  },
  {
    id: "source-controlled-release-review",
    title: "Source-Controlled Release Review",
    status: "evidence-incomplete",
    accountableOwners: ["Engineering release steward", "Security reviewer"],
    completionEvidence: ["immutable revision", "required CI checks", "clean build provenance", "rollback candidate"],
    blockedUntil: ["related changes are reviewable", "quality gates bind to the release revision"],
    unlocks: ["reproducible deployment", "release attestation", "credible technical diligence"],
    automaticApprovalAllowed: false
  },
  {
    id: "nonproduction-data-plane-review",
    title: "Nonproduction Data-Plane Review",
    status: "externally-gated",
    accountableOwners: ["Data platform owner", "Security owner", "Pilot lead"],
    completionEvidence: ["approved nonproduction target", "migration report", "advisor disposition", "strict AAL2 smoke", "rollback evidence"],
    blockedUntil: ["Supabase nonproduction authority is granted", "fresh authorized AAL2 session exists"],
    unlocks: ["no-PHI durable protected pilot", "execution evidence binding", "canary eligibility"],
    automaticApprovalAllowed: false
  },
  {
    id: "intended-use-governance-review",
    title: "Intended Use Governance Review",
    status: "ready-for-human-review",
    accountableOwners: ["Founder/CEO", "Qualified healthcare counsel", "Clinical governance lead"],
    completionEvidence: ["signed intended-use memo", "claims matrix", "clinical boundary approval", "dated review record"],
    blockedUntil: ["named human reviewers approve the bounded scope"],
    unlocks: ["consistent product claims", "module classification work", "safer buyer diligence"],
    automaticApprovalAllowed: false
  }
];

export function getCrossPlatformEvidenceSummary(now: Date = new Date()) {
  const records = crossPlatformEvidenceSnapshot.map((record) => ({
    ...record,
    freshness: now.getTime() <= new Date(record.expiresAt).getTime()
      ? "current-snapshot" as const
      : "refresh-required" as const
  }));
  const blockers = records.filter((record) => record.status === "blocked");
  const stale = records.filter((record) => record.freshness === "refresh-required");

  return {
    service: "scrimed-cross-platform-evidence-reconciler",
    status: blockers.length > 0 ? "release-evidence-drift-blocks-promotion" : "human-release-review-required",
    observedAt,
    snapshotExpiresAt: expiresAt,
    records,
    blockers: blockers.map((record) => ({ id: record.id, provider: record.provider, nextAction: record.nextAction })),
    summary: {
      providerCount: records.length,
      blockedProviderCount: blockers.length,
      warningProviderCount: records.filter((record) => record.status === "warning").length,
      staleEvidenceCount: stale.length,
      credentialMaterialStored: false,
      rawProviderLogsStored: false,
      externalMutationsExecuted: records.some((record) => record.externalMutationPerformed),
      productionPromotionAllowed: false,
      customerGoLiveAllowed: false,
      preparedRemediationCount: records.filter((record) => record.remediationStatus !== "external-action-required").length,
      fullyResolvedProviderCount: 0
    },
    approvalPath: crossPlatformApprovalPath,
    immediateCorrection: {
      id: "remove-unverified-testimonial",
      reason: "Public trust and legal defensibility outrank promotional social proof that lacks authorization evidence.",
      safeReplacement: {
        eyebrow: "Proof Before Promises",
        heading: "Inspect the evidence behind SCRIMED.",
        body: "Review no-PHI demonstrations, governance controls, interoperability evidence, and clearly bounded pilot-readiness artifacts before making a buying decision.",
        primaryAction: "Review the Trust Center",
        secondaryAction: "Request a Governed Demo",
        disclosure: "Synthetic demonstration and decision-support scope only. Do not submit patient information through this website."
      },
      humanApprovalRequiredForNewCustomerClaim: true
    },
    safeCurrentScope: [
      "local and CI validation",
      "synthetic/no-PHI demonstrations",
      "governance and interoperability readiness assessments",
      "draft-only buyer and investor diligence materials",
      "nonproduction migration planning"
    ],
    boundary: "This snapshot reconciles no-secret operational metadata only. It grants no deployment, PHI, clinical, payer, EHR, customer, testimonial, regulatory, certification, or go-live authority.",
    nextBestMove: "Correct the public testimonial, then bind this working-tree build to a clean reviewed revision before any deployment promotion.",
    auditHash: createAuditHash({
      records: records.map((record) => record.auditHash),
      approvalPath: crossPlatformApprovalPath.map((step) => step.id)
    })
  };
}
