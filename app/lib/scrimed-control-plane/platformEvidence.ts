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

const observedAt = "2026-08-09T05:04:46Z";
const expiresAt = "2026-08-10T05:04:46Z";

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
    summary: "The consolidated candidate has one dedicated review path in PR 25; automated checks are attached to that path, while independent named engineering and security approval remains outstanding.",
    facts: [
      "Repository visibility is public.",
      "Observed main is 5e77beea57f458883f7544421b2014fd4e28ac67.",
      "PR 25 is the consolidated candidate review path for branch agent/scrimed-p32-consolidated-candidate.",
      "Predecessor PRs 22 and 23 are superseded by the consolidated path and must not be merged independently.",
      "Dependency review, dependency security, migration dry-run, CodeQL, core CI, and synthetic preview validation are required on the exact final head.",
      "No distinct human APPROVED review is recorded in the retained observation."
    ],
    drift: [
      "Reviewing or merging both predecessor PRs independently would duplicate consolidated history.",
      "Automated checks cannot substitute for named independent engineering and security review."
    ],
    approvalImpact: ["source-controlled release approval", "buyer diligence evidence", "change-management evidence", "rollback provenance"],
    accountableOwner: "Engineering release steward",
    nextAction: "Bind the final strict evidence to PR 25 and obtain named independent engineering and security approval on its exact head before merge or deployment.",
    remediationStatus: "implemented-local",
    remediationEvidence: ["scripts/release-provenance-preflight.mjs", ".github/workflows/ci.yml", "docs/release-provenance.md"],
    residualBlocker: "Named independent engineering and security approval remains external and incomplete.",
    externalMutationPerformed: true
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
    summary: "Production remains intentionally unchanged while the consolidated PR uses an isolated preview pipeline; the exact final head must complete preview build and desktop/mobile synthetic validation before deployment review.",
    facts: [
      "Observed production deployment dpl_96zHRNo6ebg6FUQahU91GtkfjEeW is READY.",
      "Production metadata identifies main commit 5e77beea57f458883f7544421b2014fd4e28ac67.",
      "PR 25 triggers the repository's Synthetic Preview Validation workflow and an isolated Vercel preview.",
      "The preview is not a production deployment and grants no production authority.",
      "Preview evidence must be tied to the exact final PR head; predecessor previews cannot satisfy that gate."
    ],
    drift: [
      "A preview for an earlier branch head does not validate a later source mutation.",
      "Production and candidate capability surfaces remain intentionally out of sync until review and deployment authorization."
    ],
    approvalImpact: ["production promotion approval", "release attestation", "rollback evidence", "customer-facing capability claims"],
    accountableOwner: "Platform release steward",
    nextAction: "Require the exact final PR head to reach READY and pass desktop, 390px, protected, and public preview checks; request production authorization only after named review.",
    remediationStatus: "implemented-local",
    remediationEvidence: ["SCRIMED_RELEASE_PROVENANCE_ENFORCED", "SCRIMED_APPROVED_RELEASE_SHA", "npm run release:provenance:strict"],
    residualBlocker: "Exact-final-head preview completion, named review, approved SHA, and deployment authorization remain incomplete.",
    externalMutationPerformed: true
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
    summary: "The protected-pilot project is healthy and durable SCRIMED Work migrations are present; three newer p.32 migrations remain local-only and leaked-password protection remains disabled.",
    facts: [
      "Project scrimed-protected-pilot is ACTIVE_HEALTHY in us-east-1 on Postgres 17.6.1.",
      "Observed remote migrations include compute-fabric evidence binding, SCRIMED Work durability, review queues, approval binding, and completion evidence.",
      "Remote migration history stops at scrimed_work_completion_evidence.",
      "Clinical assurance, p.32 evidence attestation issuance, and p.32 candidate review migrations remain unapplied.",
      "Security Advisor reports one warning: leaked-password protection is disabled.",
      "Performance Advisor reports informational unused indexes; no index was removed without representative workload evidence."
    ],
    drift: [
      "Three newer governance migrations require an authorized disposable dry-run and separate application decision.",
      "Leaked-password protection requires an Auth administrator action that the connected toolset cannot narrowly perform.",
      "Fresh exact-candidate AAL2 evidence remains required before protected-pilot expansion."
    ],
    approvalImpact: ["no-PHI protected-pilot release", "AAL2 durability evidence", "security review", "database change approval"],
    accountableOwner: "Data platform and security owners",
    nextAction: "Enable leaked-password protection through the scoped dashboard control, authorize a disposable dry-run for the three pending migrations, and rerun exact-candidate AAL2 and advisor checks.",
    remediationStatus: "prepared-not-applied",
    remediationEvidence: ["docs/MIGRATION_DRY_RUN_REPORT.md", "config/pending-migration-authorization.json", "docs/operators/SUPABASE_LEAKED_PASSWORD_PROTECTION.md"],
    residualBlocker: "Auth-owner setting change, disposable migration authority, migration execution evidence, and fresh AAL2 validation remain external.",
    externalMutationPerformed: false
  }),
  evidenceRecord({
    id: "wix-public-claims-integrity",
    provider: "wix",
    controlDomain: "public-claims",
    status: "verified",
    severity: "low",
    observedAt,
    expiresAt,
    evidenceClass: "live-endpoint-observed",
    sourceReference: "2026-08-09 policy-v4 direct-origin audit and published FaithCore browser observation",
    summary: "The configured Wix public-claims surface passes policy v4, including Atlas-first metadata, synthetic Vitals boundaries, optional clinically neutral FaithCore copy, conservative schema, and retired-commerce controls.",
    facts: [
      "The Wix site is published on a custom domain.",
      "The direct-origin audit covered 17 pages, two retired routes, two noindexed Booking routes, three redirects, and six crawler files with zero claim failures.",
      "The published FaithCore page contains the approved opt-in copy, clinical-neutrality statement, supporting boundary, CTA, and safe metadata.",
      "The published FaithCore JSON-LD is a conservative Organization object without address, telephone, Review, or AggregateRating.",
      "A later strict attempt from a network-restricted shell observed zero pages and failed closed; that environmental result does not supersede the direct-origin evidence."
    ],
    drift: [
      "A true mobile-device visual check remains pending because desktop-user-agent resizing does not exercise Wix's separate mobile variant.",
      "Search-engine snapshots may lag the live origin and must not supersede direct evidence."
    ],
    approvalImpact: ["marketing claims approval", "buyer-specific proof release", "legal review", "investor diligence"],
    accountableOwner: "Founder, legal reviewer, and marketing owner",
    nextAction: "Preserve the policy-v4 evidence and capture a true mobile-device presentation check without changing the verified public claims.",
    remediationStatus: "implemented-local",
    remediationEvidence: [
      "scripts/public-claims-integrity-smoke.mjs",
      "docs/public-claims-integrity.md",
      "docs/WIX_PUBLICATION_VERIFICATION_REPORT.md",
      "docs/operators/WIX_FAITHCORE_FINAL_ACTION.md",
      "config/wix-publication-policy.json"
    ],
    residualBlocker: "True mobile-device visual evidence remains an owner presentation action; no public-claims failure is open.",
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
    evidenceClass: "local-repository-observed",
    sourceReference: "Latest repository-held Figma governance snapshot",
    summary: "No canonical editable SCRIMED design source is bound to this release evidence snapshot.",
    facts: [
      "The prior connected-account snapshot reported a view-only seat.",
      "No design-file key or component-library fingerprint is bound to the current candidate.",
      "No fresh Figma connector observation was performed in this evidence refresh."
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
    completionEvidence: ["policy-v4 direct-live claims check", "published FaithCore browser observation", "true mobile-device presentation check", "dated owner review"],
    blockedUntil: ["named owner records the current presentation review"],
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
      fullyResolvedProviderCount: records.filter((record) => record.status === "verified").length
    },
    approvalPath: crossPlatformApprovalPath,
    immediateCorrection: {
      id: "publish-and-verify-faithcore-neutrality",
      reason: "Optional FaithCore positioning must remain clinically neutral and consistent across visible copy and metadata.",
      safeReplacement: {
        eyebrow: "Optional By Design",
        heading: "FaithCore supports faith-aligned engagement without changing clinical logic.",
        body: "FaithCore is user-selected and separate from diagnosis, treatment, eligibility, prioritization, risk scoring, medical recommendations, and access to care.",
        primaryAction: "Review FaithCore",
        secondaryAction: "Review SCRIMED Atlas",
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
    nextBestMove: "Finish the exact-candidate source review path and independent review, then close Supabase Auth and disposable-migration evidence before any production authorization request.",
    auditHash: createAuditHash({
      records: records.map((record) => record.auditHash),
      approvalPath: crossPlatformApprovalPath.map((step) => step.id)
    })
  };
}
