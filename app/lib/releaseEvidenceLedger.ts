import { getQaAal2SmokeReadinessPacket } from "./qaAal2RunEvidence";
import {
  computeFabricMigrationPreflightApiRoute,
  computeFabricMigrationPreflightStatus
} from "./computeFabricMigrationPreflight";

export type ReleaseEvidenceLedgerEntryStatus =
  | "passed-no-secret"
  | "ready-no-secret"
  | "aal2-smoke-readiness-preflight-ready-no-secret"
  | "operator-required"
  | "blocked-until-human-aal2"
  | "external-review-required";

export type ReleaseEvidenceLedgerEntry = {
  id: string;
  label: string;
  command: string;
  status: ReleaseEvidenceLedgerEntryStatus;
  evidenceType:
    | "static-check"
    | "contract-smoke"
    | "public-smoke"
    | "aal2-preflight"
    | "strict-protected-smoke"
    | "external-review";
  sourceSurface: string;
  artifactRoute: string;
  evidenceHash: string;
  safeFor: string[];
  blockedClaims: string[];
  humanReviewRequired: boolean;
  noSecretBoundary: string;
  replayInstruction: string;
  nextAction: string;
};

export type ReleaseEvidenceLedgerSummary = {
  service: "scrimed-release-evidence-ledger";
  status: typeof releaseEvidenceLedgerStatus;
  route: typeof releaseEvidenceLedgerRoute;
  apiRoute: typeof releaseEvidenceLedgerApiRoute;
  briefRoute: typeof releaseEvidenceLedgerBriefRoute;
  generatedAt: "static-no-secret-release-evidence";
  noPhiConfirmed: true;
  tokenMaterialCaptured: false;
  productionApproval: false;
  clinicalCareAuthority: "not-authorized-live-care";
  phiAuthority: "not-authorized-production-phi";
  releaseAuthority: "not-release-approval";
  entryCount: number;
  passedNoSecretCount: number;
  operatorRequiredCount: number;
  externalReviewRequiredCount: number;
  entries: ReleaseEvidenceLedgerEntry[];
  blockedClaims: string[];
  releaseUseRules: string[];
  boundary: typeof releaseEvidenceLedgerBoundary;
};

export const releaseEvidenceLedgerStatus =
  "release-evidence-ledger-active-no-secret";
export const releaseEvidenceLedgerRoute =
  "/release-continuity#release-evidence-ledger";
export const releaseEvidenceLedgerApiRoute =
  "/api/release-continuity/evidence-ledger";
export const releaseEvidenceLedgerBriefRoute =
  "/api/release-continuity/evidence-ledger/brief";

export const releaseEvidenceLedgerBoundary =
  "SCRIMED Release Evidence Ledger records no-secret build, smoke, readiness, and protected-operator evidence metadata only. It does not store PHI, patient identifiers, bearer tokens, Supabase secrets, service-role keys, raw logs, production connector payloads, customer data, certification proof, release approval, or live clinical authority.";

const blockedClaims = [
  "PHI processing authorized",
  "live clinical care authorized",
  "production connector approved",
  "security or compliance certified",
  "buyer proof release approved",
  "strict AAL2 protected writes proven without human operator",
  "customer go-live approved"
];

const releaseUseRules = [
  "Use ledger entries as no-secret diligence metadata only.",
  "Attach command, status, route, and evidence hash without raw logs or credentials.",
  "Treat operator-required entries as blockers until a fresh authorized human AAL2 run retains safe evidence.",
  "Route all PHI, clinical, security, legal, regulatory, reimbursement, and buyer-release claims to qualified review.",
  "Never paste bearer tokens, JWTs, Supabase keys, service-role credentials, patient data, or customer data into the ledger."
];

function stableSerialize(value: unknown): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableSerialize(item)).join(",")}]`;
  }

  return `{${Object.entries(value as Record<string, unknown>)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableSerialize(item)}`)
    .join(",")}}`;
}

function syntheticEvidenceHash(payload: unknown) {
  const serialized = stableSerialize(payload);
  let hash = 0x811c9dc5;

  for (let index = 0; index < serialized.length; index += 1) {
    hash ^= serialized.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return `release-evidence-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

function ledgerEntry(input: Omit<ReleaseEvidenceLedgerEntry, "evidenceHash">): ReleaseEvidenceLedgerEntry {
  return {
    ...input,
    evidenceHash: syntheticEvidenceHash({
      id: input.id,
      command: input.command,
      status: input.status,
      evidenceType: input.evidenceType,
      sourceSurface: input.sourceSurface,
      artifactRoute: input.artifactRoute,
      humanReviewRequired: input.humanReviewRequired,
      noSecretBoundary: input.noSecretBoundary
    })
  };
}

function releaseEvidenceLedgerEntries(): ReleaseEvidenceLedgerEntry[] {
  const aal2SmokeReadiness = getQaAal2SmokeReadinessPacket();

  return [
    ledgerEntry({
      id: "generated-integrity",
      label: "Generated workspace integrity",
      command: "npm run integrity",
      status: "passed-no-secret",
      evidenceType: "static-check",
      sourceSurface: "Generated Integrity",
      artifactRoute: "/api/release-continuity",
      safeFor: ["engineering readiness", "buyer diligence", "investor diligence"],
      blockedClaims,
      humanReviewRequired: false,
      noSecretBoundary:
        "Integrity evidence contains source-shape metadata only and must not include secrets, PHI, raw logs, or customer data.",
      replayInstruction: "Run npm run integrity before build or release packaging.",
      nextAction: "Keep generated cache cleanup in prebuild and pretypecheck."
    }),
    ledgerEntry({
      id: "nonsecret-regression-suite",
      label: "Nonsecret regression suite",
      command: "npm run test:nonsecret",
      status: "passed-no-secret",
      evidenceType: "contract-smoke",
      sourceSurface: "SCRIMED Nonsecret Test Suite",
      artifactRoute: "/api/investor-readiness/status",
      safeFor: ["engineering readiness", "platform audit readiness", "investor diligence"],
      blockedClaims,
      humanReviewRequired: false,
      noSecretBoundary:
        "Nonsecret regression evidence must run with bearer-token, sales QA token, and Supabase session environment cleared.",
      replayInstruction: "Run npm run test:nonsecret before release and after modifying safety, AAL2, release, or investor surfaces.",
      nextAction: "Promote failures to release blockers until the source contract is restored."
    }),
    ledgerEntry({
      id: "typecheck-lint-build",
      label: "Typecheck, lint, and production build",
      command: "npm run typecheck && npm run lint && npm run build",
      status: "passed-no-secret",
      evidenceType: "static-check",
      sourceSurface: "Next.js Build Pipeline",
      artifactRoute: "/api/release-continuity",
      safeFor: ["engineering readiness", "deployment readiness", "buyer diligence"],
      blockedClaims,
      humanReviewRequired: false,
      noSecretBoundary:
        "Build evidence can mention known local SWC fallback warnings, but must not include secrets, tokens, PHI, or customer payloads.",
      replayInstruction: "Run static checks and build with the bundled Node path before deploy.",
      nextAction: "Keep nonzero build, typecheck, or lint results as hard release blockers."
    }),
    ledgerEntry({
      id: "clinical-robustness-lab-contract",
      label: "Clinical Robustness Lab contract",
      command: "npm run smoke:clinical-robustness-lab",
      status: "passed-no-secret",
      evidenceType: "contract-smoke",
      sourceSurface: "Clinical Robustness Lab",
      artifactRoute: "/api/clinical-robustness-lab",
      safeFor: ["synthetic clinical readiness", "platform audit readiness", "investor diligence"],
      blockedClaims,
      humanReviewRequired: false,
      noSecretBoundary:
        "Clinical robustness evidence is synthetic/demo use only and is not clinical validation, diagnosis, treatment, prescribing, or live patient-care authority.",
      replayInstruction: "Run npm run smoke:clinical-robustness-lab after modifying clinical robustness scenarios, notices, or scoring.",
      nextAction: "Escalate clinical score changes to human review before external claims expand."
    }),
    ledgerEntry({
      id: "execution-attempt-durable-store-contract",
      label: "Execution Attempt Durable Store contract",
      command: "npm run smoke:execution-attempt-durable-store",
      status: "passed-no-secret",
      evidenceType: "contract-smoke",
      sourceSurface: "Execution Attempt Durable Store",
      artifactRoute: "/api/workflows/execution-attempts/durable-store",
      safeFor: ["audit readiness", "execution evidence binding", "buyer diligence"],
      blockedClaims,
      humanReviewRequired: false,
      noSecretBoundary:
        "Durable-store contract evidence proves source controls and fail-closed posture only; protected writes still require AAL2 and target enablement.",
      replayInstruction: "Run npm run smoke:execution-attempt-durable-store after touching durable-store APIs, migrations, token policy, or AAL2 readiness.",
      nextAction: "Run strict AAL2 smoke only with a fresh authorized human token."
    }),
    ledgerEntry({
      id: "compute-fabric-migration-preflight",
      label: "Compute Fabric durable-store migration preflight",
      command: "npm run smoke:scrimed-compute-fabric:migration-preflight",
      status: "passed-no-secret",
      evidenceType: "contract-smoke",
      sourceSurface: "SCRIMED Compute Fabric Migration Preflight",
      artifactRoute: computeFabricMigrationPreflightApiRoute,
      safeFor: ["database migration readiness", "audit readiness", "buyer diligence"],
      blockedClaims,
      humanReviewRequired: false,
      noSecretBoundary:
        "Compute Fabric migration preflight evidence proves source controls, trigger guards, projection fields, rollback plan, and no-live-model-call posture only; it does not apply migrations or prove live Supabase state.",
      replayInstruction:
        "Run npm run smoke:scrimed-compute-fabric:migration-preflight after changing Compute Fabric migrations, durable-store projection fields, or migration docs.",
      nextAction: `Keep status ${computeFabricMigrationPreflightStatus} until target migration history and strict AAL2 smoke are verified.`
    }),
    ledgerEntry({
      id: "aal2-smoke-readiness-preflight",
      label: "AAL2 smoke readiness preflight",
      command: "npm run smoke:aal2:readiness",
      status: aal2SmokeReadiness.status,
      evidenceType: "aal2-preflight",
      sourceSurface: "AAL2 Smoke Readiness",
      artifactRoute: aal2SmokeReadiness.routes.api,
      safeFor: ["operator readiness", "release checklist", "investor diligence"],
      blockedClaims,
      humanReviewRequired: true,
      noSecretBoundary: aal2SmokeReadiness.boundary,
      replayInstruction: "Run npm run smoke:aal2:readiness before strict protected smoke.",
      nextAction: "Supply a fresh authorized tenant-admin, pilot-lead, or reviewer AAL2 token only for strict smoke."
    }),
    ledgerEntry({
      id: "strict-aal2-durable-store-smoke",
      label: "Strict AAL2 durable-store smoke",
      command: "npm run smoke:aal2:durable-store:strict",
      status: "blocked-until-human-aal2",
      evidenceType: "strict-protected-smoke",
      sourceSurface: "Protected Durable Store",
      artifactRoute: "/api/workflows/execution-attempts/durable-store",
      safeFor: ["operator readiness only until retained strict proof exists"],
      blockedClaims,
      humanReviewRequired: true,
      noSecretBoundary:
        "Strict durable-store evidence may retain only no-secret status, command name, workspace slug, role class, audit metadata, and packet hashes after a human AAL2 run.",
      replayInstruction: "Run only after a fresh AAL2 operator token is available and protected writes are enabled on the target.",
      nextAction: "Retain no-secret outcome metadata and immediately rotate or clear temporary token material."
    }),
    ledgerEntry({
      id: "strict-stored-vector-rpc-smoke",
      label: "Strict stored-vector RPC smoke",
      command: "npm run smoke:scrimed-stored-vector-rpc:strict",
      status: "blocked-until-human-aal2",
      evidenceType: "strict-protected-smoke",
      sourceSurface: "Stored Vector RPC",
      artifactRoute: aal2SmokeReadiness.routes.storedVectorRpcSmoke,
      safeFor: ["operator readiness only until retained strict proof exists"],
      blockedClaims,
      humanReviewRequired: true,
      noSecretBoundary:
        "Stored-vector strict evidence must not expose raw embeddings, token material, PHI, production patient matching, or customer data.",
      replayInstruction: "Run only under the same authorized short-lived human AAL2 boundary as strict durable-store smoke.",
      nextAction: "Retain only no-secret success/failure metadata and protected route references."
    }),
    ledgerEntry({
      id: "qualified-external-approval-review",
      label: "Qualified external approval review",
      command: "external qualified review",
      status: "external-review-required",
      evidenceType: "external-review",
      sourceSurface: "Approvals Readiness",
      artifactRoute: "/approvals-readiness",
      safeFor: ["planning", "readiness tracking"],
      blockedClaims,
      humanReviewRequired: true,
      noSecretBoundary:
        "External approval evidence must be retained outside public source until qualified legal, privacy, security, clinical, buyer, or certification-body review authorizes use.",
      replayInstruction: "Route expanded claims through Approvals Readiness, Claim Guard, and qualified reviewer signoff.",
      nextAction: "Do not promote PHI, live-care, certification, connector, or customer go-live claims from this ledger."
    })
  ];
}

export function getReleaseEvidenceLedgerSummary(): ReleaseEvidenceLedgerSummary {
  const entries = releaseEvidenceLedgerEntries();

  return {
    service: "scrimed-release-evidence-ledger",
    status: releaseEvidenceLedgerStatus,
    route: releaseEvidenceLedgerRoute,
    apiRoute: releaseEvidenceLedgerApiRoute,
    briefRoute: releaseEvidenceLedgerBriefRoute,
    generatedAt: "static-no-secret-release-evidence",
    noPhiConfirmed: true,
    tokenMaterialCaptured: false,
    productionApproval: false,
    clinicalCareAuthority: "not-authorized-live-care",
    phiAuthority: "not-authorized-production-phi",
    releaseAuthority: "not-release-approval",
    entryCount: entries.length,
    passedNoSecretCount: entries.filter((entry) => entry.status === "passed-no-secret").length,
    operatorRequiredCount: entries.filter(
      (entry) => entry.status === "operator-required" || entry.status === "blocked-until-human-aal2"
    ).length,
    externalReviewRequiredCount: entries.filter((entry) => entry.status === "external-review-required").length,
    entries,
    blockedClaims,
    releaseUseRules,
    boundary: releaseEvidenceLedgerBoundary
  };
}

export function buildReleaseEvidenceLedgerBrief() {
  const summary = getReleaseEvidenceLedgerSummary();

  return [
    "# SCRIMED Release Evidence Ledger",
    "",
    `Status: ${summary.status}`,
    `Generated: ${summary.generatedAt}`,
    `No PHI confirmed: ${summary.noPhiConfirmed}`,
    `Token material captured: ${summary.tokenMaterialCaptured}`,
    `Production approval: ${summary.productionApproval}`,
    "",
    "## Boundary",
    summary.boundary,
    "",
    "## Entries",
    ...summary.entries.map(
      (entry) =>
        `- ${entry.label} (${entry.status}): ${entry.command}; hash ${entry.evidenceHash}; route ${entry.artifactRoute}; next ${entry.nextAction}`
    ),
    "",
    "## Release Use Rules",
    ...summary.releaseUseRules.map((rule) => `- ${rule}`),
    "",
    "## Blocked Claims",
    ...summary.blockedClaims.map((claim) => `- ${claim}`)
  ].join("\n");
}
