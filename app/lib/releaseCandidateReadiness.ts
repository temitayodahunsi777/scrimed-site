export type ReleaseCandidateValidationStatus =
  | "pass"
  | "blocked-production-delta"
  | "operator-required";

export type ReleaseCandidateValidationEvidence = {
  command: string;
  status: ReleaseCandidateValidationStatus;
  scope: "local-source" | "local-rebuilt-app" | "production-target";
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
  sourceProvenanceStatus: "blocked-uncommitted-working-tree";
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
export const releaseCandidateId = "scrimed-release-candidate-2026-07-11-validation-passed-uncommitted";
export const releaseCandidateProductionUrl = "https://app.scrimedsolutions.com";
export const releaseCandidateReadinessUpdatedAt = "2026-07-11T22:30:00.000-04:00";

export const releaseCandidateReadinessBoundary =
  "SCRIMED Release Candidate Readiness is a synthetic and metadata-only release control. It records local validation evidence, production delta evidence, retained NO-GO boundaries, and exact operator commands. It does not commit code, deploy to production, apply database migrations, authorize PHI processing, authorize clinical care, authorize payer submission, write to EHRs, approve connectors, certify compliance, or approve customer go-live.";

const validationEvidence: ReleaseCandidateValidationEvidence[] = [
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
    evidence: "Generated integrity and TypeScript completed after corrupted .next cache cleanup."
  },
  {
    command: "npm run lint",
    status: "pass",
    scope: "local-source",
    evidence: "ESLint completed across the current workspace."
  },
  {
    command: "npm run test:nonsecret",
    status: "pass",
    scope: "local-source",
    evidence: "Nonsecret suite passed with AAL2 token values redacted and protected happy paths operator-gated."
  },
  {
    command: "npm run build",
    status: "pass",
    scope: "local-rebuilt-app",
    evidence: "Next production build completed through static generation; local macOS SWC fallback warning remained non-blocking."
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
    status: "pass",
    scope: "local-rebuilt-app",
    evidence: "Local rebuilt public smoke passed, including protected routes failing closed when unauthenticated."
  },
  {
    command: "SCRIMED_BASE_URL=https://app.scrimedsolutions.com npm run smoke:public",
    status: "blocked-production-delta",
    scope: "production-target",
    evidence:
      "Production target is reachable but does not yet include the local /scrimed-intelligence-platform route, so deployment is required before production public smoke can pass."
  }
];

const releaseControls: ReleaseCandidateControl[] = [
  {
    control: "source provenance",
    status: "blocked",
    evidence: "The workspace contains a broad SCRIMED build batch that is not bound to one clean immutable revision.",
    nextAction: "Partition and review the diff, commit only intended release files, and require strict provenance before Vercel promotion."
  },
  {
    control: "production delta closure",
    status: "operator-required",
    evidence: "Local public smoke passes but production public smoke is blocked by missing local routes on the live target.",
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
  "npm run typecheck",
  "npm run lint",
  "npm run test:nonsecret",
  "npm run build",
  "SCRIMED_BASE_URL=http://127.0.0.1:3044 npm run smoke:public",
  "npm run release:provenance:strict"
];

export function getReleaseCandidateReadinessSummary(): ReleaseCandidateReadinessSummary {
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
    sourceProvenanceStatus: "blocked-uncommitted-working-tree",
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
    `Source provenance: ${summary.sourceProvenanceStatus}`,
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
