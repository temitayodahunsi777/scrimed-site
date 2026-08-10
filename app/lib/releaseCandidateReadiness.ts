import { getP32ReleaseGateCatalog, scrimedP32ReleaseGateVersion } from "./scrimedP32ReleaseGates";

export type ReleaseCandidateValidationStatus =
  | "pass"
  | "blocked-production-delta"
  | "operator-required";

export type ReleaseCandidateValidationEvidence = {
  command: string;
  status: ReleaseCandidateValidationStatus;
  scope: "local-source" | "local-artifact" | "local-rebuilt-app" | "production-target";
  evidence: string;
};

export type ReleaseCandidateControl = {
  control: string;
  status: "satisfied" | "operator-required" | "blocked";
  evidence: string;
  nextAction: string;
};

export type ReleaseCandidateReadinessSummary = {
  service: "scrimed-release-candidate-readiness";
  status: typeof releaseCandidateReadinessStatus;
  route: typeof releaseCandidateReadinessApiRoute;
  apiRoute: typeof releaseCandidateReadinessApiRoute;
  briefRoute: typeof releaseCandidateReadinessBriefRoute;
  candidateId: typeof releaseCandidateId;
  targetProductionUrl: typeof releaseCandidateProductionUrl;
  dataBoundary: "synthetic-and-metadata-only";
  commitAuthority: "not-committed-by-this-route";
  deploymentAuthority: "not-deployed-by-this-route";
  customerGoLiveAuthority: "not-authorized";
  localValidationStatus: "pass";
  evidenceFreshnessStatus: "recorded-evidence-revalidation-required";
  currentCandidateAttested: false;
  validationEvidenceBinding: "command-catalog-not-runtime-attestation";
  sourceProvenanceStatus: "blocked-uncommitted-working-tree";
  candidateManifestStatus: "required-before-source-review";
  candidateManifestCommand: "npm run release:candidate-manifest";
  candidateManifestStrictCommand: "npm run release:candidate-manifest:strict";
  candidateManifestPathDisclosure: false;
  candidateManifestReleaseAuthority: false;
  candidateValidationStatus: "automated-validation-command-available-human-review-required";
  candidateValidationCommand: "npm run release:candidate-validate";
  candidateValidationStrictCommand: "npm run release:candidate-validate:strict";
  candidateValidationAuthority: false;
  investorArtifactReviewStatus: "automated-review-command-available-human-release-review-required";
  investorArtifactReviewCommand: "npm run review:investor-deck";
  investorArtifactReviewStrictCommand: "npm run review:investor-deck:strict";
  investorArtifactFingerprintAuthority: false;
  externalArtifactDistributionAuthority: "not-authorized";
  p32ReleaseGates: {
    version: typeof scrimedP32ReleaseGateVersion;
    gateCount: number;
    automatedGateCount: number;
    externalGateCount: number;
    currentEvidenceEvaluation: "candidate-bound-cli-evidence-available";
    candidateEvidenceCommand: "npm run release:scrimed-p32-evidence:strict";
    allGateEvidenceCommand: "npm run release:scrimed-p32-evidence:all-gates";
    aggregateReleaseAuthorityGranted: false;
  };
  productionDeltaStatus: "deployment-required";
  releaseDecision: "blocked-until-clean-reviewed-immutable-revision";
  validationEvidence: ReleaseCandidateValidationEvidence[];
  releaseControls: ReleaseCandidateControl[];
  noGoBoundaries: string[];
  exactNextCommands: string[];
  boundary: typeof releaseCandidateReadinessBoundary;
  updated: typeof releaseCandidateReadinessUpdatedAt;
};

export const releaseCandidateReadinessStatus =
  "release-candidate-validation-passed-source-provenance-blocked";
export const releaseCandidateReadinessApiRoute = "/api/release-candidate-readiness";
export const releaseCandidateReadinessBriefRoute = "/api/release-candidate-readiness/brief";
export const releaseCandidateId = "scrimed-release-candidate-working-tree-uncommitted";
export const releaseCandidateProductionUrl = "https://app.scrimedsolutions.com";
export const releaseCandidateReadinessUpdatedAt = "2026-07-20T12:00:00.000-04:00";

export const releaseCandidateReadinessBoundary =
  "SCRIMED Release Candidate Readiness is a synthetic and metadata-only release control. It records local validation evidence, production delta evidence, retained NO-GO boundaries, and exact operator commands. It does not commit code, deploy to production, apply database migrations, authorize PHI processing, authorize clinical care, authorize payer submission, write to EHRs, approve connectors, certify compliance, or approve customer go-live.";

const validationEvidence: ReleaseCandidateValidationEvidence[] = [
  {
    command: "npm run release:candidate-manifest",
    status: "pass",
    scope: "local-source",
    evidence: "A deterministic secret-safe candidate digest, category inventory, risk class, and required-reviewer map can be generated without printing filenames, file contents, or raw diffs; rerun it after every candidate change and keep promotion blocked."
  },
  {
    command: "npm run release:candidate-validate:strict",
    status: "operator-required",
    scope: "local-source",
    evidence: "The bounded validator fingerprints the candidate before and after typecheck, lint, the nonsecret suite, build, generated integrity, and artifact QA; drift or any failed check blocks automated attestation while human review and immutable provenance remain required."
  },
  {
    command: "npm run release:scrimed-p32-evidence:strict",
    status: "operator-required",
    scope: "local-source",
    evidence: "The p.32 evidence runner binds the full source commit, source tree, investor artifact, validation evidence, automated checks, and integrity-checked supplemental decisions into one no-secret gate packet. Immutable provenance and external authority remain blocked until exact evidence exists."
  },
  {
    command: "npm run review:investor-deck:strict",
    status: "operator-required",
    scope: "local-artifact",
    evidence: "The automated deck reviewer binds the current PPTX to a SHA-256 fingerprint and checks structure, placeholders, claims, boundaries, and attribution; founder, counsel/claims, finance, provenance, and recipient-specific release review remain required."
  },
  {
    command: "npm run release:provenance:strict",
    status: "operator-required",
    scope: "local-source",
    evidence: "Quality gates pass, but the current broad working tree is not a clean immutable release revision and must not be promoted."
  },
  {
    command: "npm run typecheck",
    status: "pass",
    scope: "local-source",
    evidence: "Recorded validation completed; rerun TypeScript against the current candidate because this static route is not a runtime attestation."
  },
  {
    command: "npm run lint",
    status: "pass",
    scope: "local-source",
    evidence: "Recorded validation completed; rerun ESLint against the current candidate before review sign-off."
  },
  {
    command: "npm run test:nonsecret",
    status: "pass",
    scope: "local-source",
    evidence: "Recorded validation completed with AAL2 token values redacted and protected happy paths operator-gated; rerun it after candidate changes."
  },
  {
    command: "npm run build",
    status: "pass",
    scope: "local-rebuilt-app",
    evidence: "Recorded Next build completed through static generation; a fresh build is required for the current candidate and the local macOS SWC fallback warning must remain visible."
  },
  {
    command: "npm run smoke:scrimed-compute-fabric",
    status: "pass",
    scope: "local-source",
    evidence: "Compute Fabric contract passed with provider-neutral metadata-only routing and no live model calls."
  },
  {
    command: "npm run smoke:execution-attempt-durable-store",
    status: "pass",
    scope: "local-source",
    evidence: "Execution-attempt durable-store contract passed with Compute Fabric evidence binding and human-review gates."
  },
  {
    command: "npm run smoke:scrimed-compute-fabric:migration-preflight",
    status: "pass",
    scope: "local-source",
    evidence: "Compute Fabric durable-store migration preflight passed without applying migrations or touching Supabase."
  },
  {
    command: "SCRIMED_BASE_URL=http://127.0.0.1:3044 npm run smoke:public",
    status: "operator-required",
    scope: "local-rebuilt-app",
    evidence: "Run from an approved environment that permits a local TCP listener. Compiled build-artifact inspection does not replace the HTTP smoke."
  },
  {
    command: "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public",
    status: "blocked-production-delta",
    scope: "production-target",
    evidence:
      "The current local candidate is not promoted by this control. Production public smoke must be rerun only after a source-controlled deployment of the approved immutable revision."
  }
];

const releaseControls: ReleaseCandidateControl[] = [
  {
    control: "candidate change manifest",
    status: "operator-required",
    evidence: "The local tool fingerprints the complete tracked and untracked delta, separates source from non-source deliverables, classifies blast radius, and never prints candidate paths or content.",
    nextAction: "Run the candidate manifest, route each risk category to named reviewers, and keep investor or other non-source deliverables in the artifact release lane."
  },
  {
    control: "candidate-bound automated validation",
    status: "operator-required",
    evidence: "One bounded runner binds approved nonsecret command outcomes to unchanged candidate, source, artifact, and validation-evidence fingerprints without retaining command output or raw diffs.",
    nextAction: "Run strict candidate validation after all intended edits, then record its four fingerprints in the controlled source-and-artifact review packet."
  },
  {
    control: "candidate-bound gate reconciliation",
    status: "operator-required",
    evidence: "The p.32 gate runner rejects mismatched, expired, malformed, duplicate, or tampered technical and approval evidence and reports unresolved gates by release phase.",
    nextAction: "Run strict p.32 evidence after candidate validation. Use the all-gates command as a deliberate fail-closed audit until immutable provenance and every qualified external decision are current."
  },
  {
    control: "investor artifact automated QA",
    status: "operator-required",
    evidence: "The strict local reviewer fingerprints the deck and fails closed on missing structure, placeholders, unsupported claims, missing boundaries, or missing first-party attribution without printing slide text or artifact paths.",
    nextAction: "Run strict deck review, record the exact fingerprint externally, and obtain founder, counsel/claims, and finance decisions against that same artifact before any recipient-specific release."
  },
  {
    control: "source provenance",
    status: "blocked",
    evidence: "The workspace contains a broad SCRIMED build batch that is not bound to one clean immutable revision.",
    nextAction: "Partition and review the diff, commit only intended release files, and require strict provenance before Vercel promotion."
  },
  {
    control: "production delta closure",
    status: "operator-required",
    evidence: "This static readiness route does not attest a current local HTTP smoke or production deployment. Both must be run against the reviewed candidate in their approved environments.",
    nextAction: "Deploy the validated release candidate, then rerun production public smoke."
  },
  {
    control: "protected AAL2 durable-store happy path",
    status: "operator-required",
    evidence: "Nonsecret tests preserve fail-closed behavior; authenticated happy paths still require a short-lived AAL2 bearer token.",
    nextAction: "Run the token helper and strict authenticated smoke only from an authorized tenant-admin, pilot-lead, or reviewer session."
  },
  {
    control: "Compute Fabric migration apply",
    status: "blocked",
    evidence: "Migration preflight is ready, but this route does not connect to Supabase or apply migrations.",
    nextAction: "Apply migration only through the approved database change process after AAL2 and rollback review."
  },
  {
    control: "NO-GO boundary retention",
    status: "satisfied",
    evidence: "Release candidate keeps live PHI, clinical care, payer submission, EHR writeback, certification, and customer go-live blocked.",
    nextAction: "Keep these boundaries in all release notes, demos, investor materials, and operator handoffs."
  }
];

const noGoBoundaries = [
  "no live PHI",
  "no autonomous diagnosis, treatment, prescribing, or final imaging interpretation",
  "no patient outreach",
  "no payer submission or claim submission",
  "no EHR writeback or production connector approval",
  "no production database migration apply from public routes",
  "no HIPAA, SOC, FDA, security certification, clinical validation, or customer go-live claim",
  "no raw credentials, bearer tokens, Supabase service keys, or connector payloads in logs, tests, docs, or UI"
];

const exactNextCommands = [
  "git status --short",
  "git diff --check",
  "npm run release:candidate-manifest",
  "npm run release:candidate-validate:strict",
  "npm run review:investor-deck:strict",
  "npm run release:scrimed-p32-evidence:strict",
  "npm run release:scrimed-p32-evidence:all-gates",
  "npm run typecheck",
  "npm run lint",
  "npm run test:nonsecret",
  "npm run build",
  "SCRIMED_BASE_URL=http://127.0.0.1:3044 npm run smoke:public",
  "npm run release:candidate-manifest:strict",
  "npm run release:provenance:strict"
];

export function getReleaseCandidateReadinessSummary(): ReleaseCandidateReadinessSummary {
  const p32GateCatalog = getP32ReleaseGateCatalog();
  return {
    service: "scrimed-release-candidate-readiness",
    status: releaseCandidateReadinessStatus,
    route: releaseCandidateReadinessApiRoute,
    apiRoute: releaseCandidateReadinessApiRoute,
    briefRoute: releaseCandidateReadinessBriefRoute,
    candidateId: releaseCandidateId,
    targetProductionUrl: releaseCandidateProductionUrl,
    dataBoundary: "synthetic-and-metadata-only",
    commitAuthority: "not-committed-by-this-route",
    deploymentAuthority: "not-deployed-by-this-route",
    customerGoLiveAuthority: "not-authorized",
    localValidationStatus: "pass",
    evidenceFreshnessStatus: "recorded-evidence-revalidation-required",
    currentCandidateAttested: false,
    validationEvidenceBinding: "command-catalog-not-runtime-attestation",
    sourceProvenanceStatus: "blocked-uncommitted-working-tree",
    candidateManifestStatus: "required-before-source-review",
    candidateManifestCommand: "npm run release:candidate-manifest",
    candidateManifestStrictCommand: "npm run release:candidate-manifest:strict",
    candidateManifestPathDisclosure: false,
    candidateManifestReleaseAuthority: false,
    candidateValidationStatus: "automated-validation-command-available-human-review-required",
    candidateValidationCommand: "npm run release:candidate-validate",
    candidateValidationStrictCommand: "npm run release:candidate-validate:strict",
    candidateValidationAuthority: false,
    investorArtifactReviewStatus: "automated-review-command-available-human-release-review-required",
    investorArtifactReviewCommand: "npm run review:investor-deck",
    investorArtifactReviewStrictCommand: "npm run review:investor-deck:strict",
    investorArtifactFingerprintAuthority: false,
    externalArtifactDistributionAuthority: "not-authorized",
    p32ReleaseGates: {
      version: scrimedP32ReleaseGateVersion,
      gateCount: p32GateCatalog.length,
      automatedGateCount: p32GateCatalog.filter((gate) => gate.classification === "AUTOMATED").length,
      externalGateCount: p32GateCatalog.filter((gate) => gate.classification === "EXTERNAL").length,
      currentEvidenceEvaluation: "candidate-bound-cli-evidence-available",
      candidateEvidenceCommand: "npm run release:scrimed-p32-evidence:strict",
      allGateEvidenceCommand: "npm run release:scrimed-p32-evidence:all-gates",
      aggregateReleaseAuthorityGranted: false
    },
    productionDeltaStatus: "deployment-required",
    releaseDecision: "blocked-until-clean-reviewed-immutable-revision",
    validationEvidence,
    releaseControls,
    noGoBoundaries,
    exactNextCommands,
    boundary: releaseCandidateReadinessBoundary,
    updated: releaseCandidateReadinessUpdatedAt
  };
}

export function buildReleaseCandidateReadinessBrief() {
  const summary = getReleaseCandidateReadinessSummary();

  return [
    "# SCRIMED Release Candidate Readiness Brief",
    "",
    `Status: ${summary.status}`,
    `Candidate: ${summary.candidateId}`,
    `Local validation: ${summary.localValidationStatus}`,
    `Evidence freshness: ${summary.evidenceFreshnessStatus}`,
    `Current candidate attested: ${summary.currentCandidateAttested}`,
    `Validation evidence binding: ${summary.validationEvidenceBinding}`,
    `Source provenance: ${summary.sourceProvenanceStatus}`,
    `Candidate manifest: ${summary.candidateManifestStatus}`,
    `Candidate manifest path disclosure: ${summary.candidateManifestPathDisclosure}`,
    `Candidate manifest release authority: ${summary.candidateManifestReleaseAuthority}`,
    `Candidate validation: ${summary.candidateValidationStatus}`,
    `Candidate validation authority: ${summary.candidateValidationAuthority}`,
    `Investor artifact review: ${summary.investorArtifactReviewStatus}`,
    `Investor artifact fingerprint authority: ${summary.investorArtifactFingerprintAuthority}`,
    `External artifact distribution authority: ${summary.externalArtifactDistributionAuthority}`,
    `P32 release gates: ${summary.p32ReleaseGates.gateCount} (${summary.p32ReleaseGates.automatedGateCount} automated, ${summary.p32ReleaseGates.externalGateCount} external)`,
    `P32 candidate evidence command: ${summary.p32ReleaseGates.candidateEvidenceCommand}`,
    `P32 all-gate audit command: ${summary.p32ReleaseGates.allGateEvidenceCommand}`,
    `P32 aggregate release authority: ${summary.p32ReleaseGates.aggregateReleaseAuthorityGranted}`,
    `Production delta: ${summary.productionDeltaStatus}`,
    `Release decision: ${summary.releaseDecision}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Validation Evidence",
    ...summary.validationEvidence.map(
      (item) => `- ${item.command}: ${item.status} (${item.scope}) - ${item.evidence}`
    ),
    "",
    "## Release Controls",
    ...summary.releaseControls.map(
      (control) =>
        `- ${control.control}: ${control.status}. Evidence: ${control.evidence} Next: ${control.nextAction}`
    ),
    "",
    "## NO-GO Boundaries",
    ...summary.noGoBoundaries.map((boundary) => `- ${boundary}`),
    "",
    "## Exact Next Commands",
    ...summary.exactNextCommands.map((command) => `- ${command}`)
  ].join("\n");
}
