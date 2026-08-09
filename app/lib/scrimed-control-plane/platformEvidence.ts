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

const observedAt = "2026-08-09T01:24:44Z";
const expiresAt = "2026-08-10T01:24:44Z";

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
    summary: "Main remains behind the consolidated local candidate; PRs 22 and 23 are open drafts whose heads are already ancestors of the current branch, while the current branch still has no dedicated review PR.",
    facts: [
      "Repository visibility is public.",
      "Observed main is 5e77beea57f458883f7544421b2014fd4e28ac67.",
      "PR 22 remains open and draft at 450d9022356f1f19e3c1b1855f3a55f8634302bb.",
      "PR 23 remains open and draft at 37d749c103ca1588be62740148b3dd294a35f7d2.",
      "Both PR heads are ancestors of local candidate base 9d2cfceef81b0b13010ef28b55c040d459bc625a.",
      "The current branch contains additional committed work plus attributable uncommitted changes and has no current review PR."
    ],
    drift: [
      "Reviewing or merging both predecessor PRs independently would duplicate an already consolidated history.",
      "The current candidate and its final validation evidence are not yet bound to one clean, named-reviewer PR."
    ],
    approvalImpact: ["source-controlled release approval", "buyer diligence evidence", "change-management evidence", "rollback provenance"],
    accountableOwner: "Engineering release steward",
    nextAction: "Validate the consolidated branch, create one attributable immutable candidate, supersede PRs 22 and 23 with a single exact-candidate review path, and obtain named review before merge or deployment.",
    remediationStatus: "implemented-local",
    remediationEvidence: ["scripts/release-provenance-preflight.mjs", ".github/workflows/ci.yml", "docs/release-provenance.md"],
    residualBlocker: "Final source mutations, clean candidate provenance, a current pull request, and named review remain incomplete.",
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
    summary: "Production is READY at main commit 5e77beea, while ready previews exist for predecessor PRs 22 and 23; the consolidated local candidate is newer and has not been deployed.",
    facts: [
      "Observed production deployment dpl_96zHRNo6ebg6FUQahU91GtkfjEeW is READY.",
      "Production metadata identifies main commit 5e77beea57f458883f7544421b2014fd4e28ac67.",
      "Ready preview deployment dpl_GahSSeJrYPdYxrVvhJnQxS4NKDMg is bound to PR 22.",
      "Ready preview deployment dpl_6Fd9FqeHqK5CeWUfetgKS1D2ZgPL is bound to PR 23.",
      "No deployment observed in this snapshot is bound to local candidate base 9d2cfceef81b0b13010ef28b55c040d459bc625a or the current worktree."
    ],
    drift: [
      "A READY predecessor preview does not validate the consolidated candidate.",
      "Production and local capability surfaces remain intentionally out of sync until review and deployment authorization."
    ],
    approvalImpact: ["production promotion approval", "release attestation", "rollback evidence", "customer-facing capability claims"],
    accountableOwner: "Platform release steward",
    nextAction: "After named source review, create one isolated exact-candidate preview, run protected and public smoke, then request a separate production deployment authorization.",
    remediationStatus: "implemented-local",
    remediationEvidence: ["SCRIMED_RELEASE_PROVENANCE_ENFORCED", "SCRIMED_APPROVED_RELEASE_SHA", "npm run release:provenance:strict"],
    residualBlocker: "The consolidated candidate lacks a current preview, named review, approved SHA, and deployment authorization.",
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
    status: "blocked",
    severity: "critical",
    observedAt,
    expiresAt,
    evidenceClass: "local-repository-observed",
    sourceReference: "Latest repository-held direct-live Wix report plus current strict-verifier network availability check",
    summary: "Homepage, Vitals, commerce cleanup, and testimonial controls were previously verified, but the latest retained direct-live report records 16 FaithCore publication mismatches; the current sandbox could not refresh live pages.",
    facts: [
      "The Wix site is published on a custom domain.",
      "The latest retained direct-live report passed homepage, Vitals, About, Partner, Demo, legal, canonical, JSON-LD, testimonial, address, telephone, commerce, sitemap, and robots checks.",
      "That report recorded 16 FaithCore metadata and visible-copy mismatches across the FaithCore page, service page, and related post.",
      "The clinically neutral FaithCore replacement exists as a saved draft and was not published in the retained report.",
      "The current strict verification attempt failed closed because this execution sandbox could not reach any configured Wix page; it did not produce fresh publication evidence."
    ],
    drift: [
      "FaithCore publication does not match the approved optional, clinically neutral source copy in the latest retained live evidence.",
      "Fresh desktop and 390px mobile verification is unavailable until owner publication and a network-capable check occur."
    ],
    approvalImpact: ["marketing claims approval", "buyer-specific proof release", "legal review", "investor diligence"],
    accountableOwner: "Founder, legal reviewer, and marketing owner",
    nextAction: "Have the Wix owner publish only the reviewed FaithCore changes, then rerun strict direct-live claims and 390px mobile verification before closing the public-claims gate.",
    remediationStatus: "external-action-required",
    remediationEvidence: [
      "scripts/public-claims-integrity-smoke.mjs",
      "docs/public-claims-integrity.md",
      "docs/WIX_PUBLICATION_VERIFICATION_REPORT.md",
      "docs/operators/WIX_FAITHCORE_FINAL_ACTION.md",
      "config/wix-publication-policy.json"
    ],
    residualBlocker: "Founder-authorized FaithCore publication and fresh direct-live/mobile verification remain required.",
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
    status: "externally-gated",
    accountableOwners: ["Founder/CEO", "Legal reviewer", "Marketing owner"],
    completionEvidence: ["approved FaithCore draft published", "strict direct-live claims check", "390px mobile verification", "dated owner review"],
    blockedUntil: ["FaithCore metadata and visible copy match the optional clinically neutral policy"],
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
    nextBestMove: "Finish the exact-candidate source review path, publish and verify the approved FaithCore draft, then close Supabase Auth and disposable-migration evidence before requesting an isolated preview.",
    auditHash: createAuditHash({
      records: records.map((record) => record.auditHash),
      approvalPath: crossPlatformApprovalPath.map((step) => step.id)
    })
  };
}
