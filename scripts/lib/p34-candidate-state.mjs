import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { normalizeVercelPreviewOrigin } from "./vercel-preview-access.mjs";

export const p34Predecessor = Object.freeze({
  pullRequestNumber: 39,
  branch: "agent/scrimed-p34-gap-closure",
  commitSha: "45be650f48e422b05160821681ff40bb9f1229c9",
  status: "PREDECESSOR"
});

export const p34MainReviewBase = Object.freeze({
  branch: "main",
  commitSha: "fd2a4d09174726e5ba685673fe1f0df25f2ad308",
  role: "PR_39_REVIEW_BASE"
});

export const p34CanonicalReleaseManifestPath = "artifacts/release/scrimed-p34-release-manifest.json";
// Compatibility exports intentionally resolve to the one canonical release manifest.
export const p34RuntimeEvidencePath = p34CanonicalReleaseManifestPath;
export const p34ExactCandidateManifestPath = p34CanonicalReleaseManifestPath;
export const p34RouteInventoryPath = "artifacts/build/routes.json";
export const p34GenerationInventoryPath = "artifacts/build/render-inventory.json";
export const p34LegacyRouteInventoryPath = "artifacts/p34/P34_ROUTE_INVENTORY.json";
export const p34LegacyGenerationInventoryPath = "artifacts/p34/P34_GENERATION_INVENTORY.json";

export function canonicalize(value) {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value)
      .sort(([left], [right]) => left.localeCompare(right))
      .map(([key, entry]) => [key, canonicalize(entry)]));
  }
  return value;
}

export function sha256(value) {
  const input = Buffer.isBuffer(value)
    ? value
    : Buffer.from(typeof value === "string" ? value : JSON.stringify(canonicalize(value)));
  return createHash("sha256").update(input).digest("hex");
}

export function requireP34ExactPreviewBinding(targetUrl, preview) {
  const normalizedTarget = normalizeVercelPreviewOrigin(targetUrl);
  if (!preview || typeof preview !== "object" || Array.isArray(preview)) {
    throw new Error("Exact preview verification requires a populated manifest preview binding.");
  }
  const manifestOrigin = normalizeVercelPreviewOrigin(preview.url);
  if (manifestOrigin !== normalizedTarget) {
    throw new Error("Exact preview verification target does not match the manifest preview URL.");
  }
  if (!/^dpl_[A-Za-z0-9]{12,80}$/.test(preview.deploymentId ?? "")) {
    throw new Error("Exact preview verification requires a valid manifest deployment ID.");
  }
  if (preview.productionAliasAttached !== false) {
    throw new Error("Exact preview verification requires an explicit nonproduction alias posture.");
  }
  return { targetUrl: normalizedTarget, deploymentId: preview.deploymentId };
}

export function requireP34RuntimeDeploymentBinding(buildInfo, previewBinding) {
  if (!buildInfo || typeof buildInfo !== "object" || Array.isArray(buildInfo)) {
    throw new Error("Exact preview verification requires runtime deployment metadata.");
  }
  if (buildInfo.deploymentIdentityBound !== true) {
    throw new Error("Runtime deployment identity is not bound.");
  }
  if (buildInfo.deploymentId !== previewBinding.deploymentId) {
    throw new Error("Runtime deployment ID does not match the manifest preview deployment ID.");
  }
  const runtimeOrigin = normalizeVercelPreviewOrigin(buildInfo.deploymentUrl);
  if (runtimeOrigin !== previewBinding.targetUrl) {
    throw new Error("Runtime deployment URL does not match the manifest preview URL.");
  }
  return { deploymentId: buildInfo.deploymentId, deploymentUrl: runtimeOrigin };
}

export function evaluateP34CertificationCompletion({ checks, expectedCheckCount, initialState, finalState }) {
  const sourceStable = initialState.sourceFingerprint === finalState.sourceFingerprint;
  const cleanCandidate = initialState.dirty === false
    && initialState.dirtyEntryCount === 0
    && finalState.dirty === false
    && finalState.dirtyEntryCount === 0;
  const passed = checks.length === expectedCheckCount
    && checks.every((check) => check.passed)
    && sourceStable
    && cleanCandidate;
  return { passed, sourceStable, cleanCandidate };
}

function git(args, { encoding = "utf8" } = {}) {
  const result = spawnSync("git", args, {
    encoding,
    shell: false,
    maxBuffer: 64 * 1024 * 1024
  });
  if (result.status !== 0) return null;
  return result.stdout;
}

function gitText(args) {
  const output = git(args);
  return typeof output === "string" ? output.trim() : null;
}

function gitSha(ref) {
  const value = gitText(["rev-parse", "--verify", ref]);
  return /^[0-9a-f]{40}$/i.test(value ?? "") ? value.toLowerCase() : null;
}

function nullList(value) {
  return typeof value === "string" ? value.split("\0").filter(Boolean) : [];
}

export function classifyP34Path(path) {
  const lower = path.toLowerCase();
  if (!path || path.startsWith("/") || path.includes("../") || path.includes("\0")) return "UNEXPECTED";
  if (path.startsWith("artifacts/")) return "GENERATED_EVIDENCE";
  if (path.startsWith("docs/") || path === "README.md" || path === "CONTRIBUTING.md" || path === "SECURITY.md") return "DOCUMENTATION";
  if (path.startsWith("tests/") || path.startsWith("test/")) return "TEST";
  if (path.startsWith(".github/workflows/")) return "TEST";
  if (path.startsWith("supabase/")) return "SUPABASE";
  if (lower.includes("aal2")) return path.startsWith("scripts/") ? "AAL2" : "SECURITY";
  if (lower.includes("vercel") || lower.includes("previewacceptance") || lower.includes("verify-preview")) return "VERCEL";
  if (lower.includes("security") || lower.includes("secret") || lower.includes("egress")) return "SECURITY";
  if (path.startsWith("scripts/") || path.startsWith("test/")) return "TEST";
  if (lower.includes("pilot") && (path.startsWith("app/") || path.startsWith("config/"))) return "PILOT";
  if (lower.includes("commercial") || lower.includes("economics") || lower.includes("proposal")) return "COMMERCIAL";
  if (path.startsWith("app/lib/scrimed-p34/") || lower.includes("governance")) return "GOVERNANCE";
  if (path.endsWith(".tsx") || path.endsWith(".css") || path === "app/icon.svg") return "UI";
  if (path.startsWith("app/lib/") || path.startsWith("app/api/")) return "CORE_RUNTIME";
  if (
    path === "package.json"
    || path === "package-lock.json"
    || path === ".gitignore"
    || path === ".env.example"
    || path === ".node-version"
    || path === ".nvmrc"
    || path === "next.config.js"
    || path.startsWith("config/")
    || path === "vercel.json"
  ) return "CONFIGURATION";
  return "UNEXPECTED";
}

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"));
  } catch {
    return null;
  }
}

function hashUntracked(paths) {
  const hash = createHash("sha256");
  for (const path of [...paths].sort()) {
    hash.update(`${Buffer.byteLength(path)}:${path}`);
    try {
      const content = readFileSync(path);
      hash.update(`${content.byteLength}:`);
      hash.update(content);
    } catch {
      hash.update("UNREADABLE");
    }
  }
  return hash.digest("hex");
}

function safeEnvironmentValue(value, pattern) {
  const normalized = value?.trim() ?? "";
  return pattern.test(normalized) ? normalized : null;
}

export function inspectP34CandidateState(env = process.env) {
  const head = gitSha("HEAD");
  const tree = gitSha("HEAD^{tree}");
  const branch = gitText(["branch", "--show-current"]);
  const base = gitSha(`${env.SCRIMED_P34_BASE_REF?.trim() || p34Predecessor.commitSha}^{commit}`);
  if (!head || !tree || !branch || !base) throw new Error("p.34 candidate state requires a valid Git branch, HEAD, tree, and predecessor base.");
  const commitTimestamp = gitText(["show", "-s", "--format=%cI", head]);
  const ancestry = git(["merge-base", "--is-ancestor", base, head]);
  if (ancestry === null) throw new Error("p.34 predecessor must be an ancestor of the current candidate.");

  const trackedPaths = nullList(git(["diff", "--name-only", "-z", base, "--"]));
  const untrackedPaths = nullList(git(["ls-files", "--others", "--exclude-standard", "-z"]));
  const changedPaths = [...new Set([...trackedPaths, ...untrackedPaths])]
    .filter((path) => !path.startsWith("artifacts/release/"))
    .sort();
  const integrationEntries = changedPaths.map((path) => ({
    path,
    classification: classifyP34Path(path),
    status: "CURRENT"
  }));
  const unexpected = integrationEntries.filter((entry) => entry.classification === "UNEXPECTED");
  const trackedDiff = git(["diff", "--binary", "--no-ext-diff", base, "--"], { encoding: null });
  if (!Buffer.isBuffer(trackedDiff)) throw new Error("Unable to fingerprint p.34 tracked source delta.");
  const sourceFingerprint = sha256({
    schemaVersion: "scrimed-p34-source-fingerprint-v1",
    base,
    trackedDiffSha256: sha256(trackedDiff),
    untrackedContentSha256: hashUntracked(untrackedPaths.filter((path) => !path.startsWith("artifacts/release/"))),
    paths: changedPaths
  });
  const candidateFingerprint = sha256({
    schemaVersion: "scrimed-p34-follow-on-candidate-v2",
    base,
    commit: head,
    commitTimestamp: commitTimestamp && Number.isFinite(Date.parse(commitTimestamp))
      ? new Date(commitTimestamp).toISOString()
      : null,
    tree,
    sourceFingerprint,
    integrationEntries
  });
  const statusLines = (gitText(["status", "--porcelain=v1", "--untracked-files=all"]) ?? "")
    .split(/\r?\n/)
    .filter(Boolean);
  const upstream = gitText(["rev-parse", "--abbrev-ref", "--symbolic-full-name", "@{upstream}"]);
  const packageJson = readJson("package.json");
  const routeInventory = readJson(p34RouteInventoryPath);
  const generationInventory = readJson(p34GenerationInventoryPath);
  const currentPrNumber = Number.parseInt(env.SCRIMED_P34_PR_NUMBER ?? "", 10);
  const currentPr = Number.isInteger(currentPrNumber) && currentPrNumber > 0
    ? {
        number: currentPrNumber,
        url: safeEnvironmentValue(env.SCRIMED_P34_PR_URL, /^https:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+\/pull\/\d+$/),
        state: "OPEN_REVIEW_REQUIRED"
      }
    : null;
  const previewUrl = safeEnvironmentValue(env.SCRIMED_P34_PREVIEW_URL, /^https:\/\/[A-Za-z0-9.-]+\.vercel\.app$/);
  const previewDeploymentId = safeEnvironmentValue(env.SCRIMED_P34_PREVIEW_DEPLOYMENT_ID, /^dpl_[A-Za-z0-9]{12,80}$/);

  return {
    schemaVersion: "scrimed-p34-current-candidate-state-v1",
    repository: "temitayodahunsi777/scrimed-site",
    branch,
    commit: head,
    commitTimestamp: commitTimestamp && Number.isFinite(Date.parse(commitTimestamp))
      ? new Date(commitTimestamp).toISOString()
      : null,
    tree,
    base,
    upstream: upstream || null,
    dirty: statusLines.length > 0,
    dirtyEntryCount: statusLines.length,
    changedFileCount: integrationEntries.length,
    sourceFingerprint,
    candidateFingerprint,
    sourceTreeHash: statusLines.length === 0 ? tree : sourceFingerprint,
    integrationEntries,
    classificationCounts: Object.fromEntries(
      [...new Set(integrationEntries.map((entry) => entry.classification))]
        .sort()
        .map((classification) => [classification, integrationEntries.filter((entry) => entry.classification === classification).length])
    ),
    unexplainedFileCount: unexpected.length,
    predecessor: p34Predecessor,
    currentPr,
    preview: previewUrl && previewDeploymentId
      ? { deploymentId: previewDeploymentId, url: previewUrl, status: "EXACT_PREVIEW_REQUIRES_VERIFICATION", productionAliasAttached: false }
      : null,
    runtime: {
      node: process.versions.node,
      nodeMajor: Number.parseInt(process.versions.node.split(".", 1)[0] ?? "", 10),
      packageManager: "npm",
      packageManagerEvidence: "package-lock.json",
      next: packageJson?.dependencies?.next ?? null
    },
    routeInventory,
    generationInventory,
    supabase: {
      projectRef: "yxacqdfeyojrjghpwike",
      projectName: "scrimed-protected-pilot",
      status: "ACTIVE_HEALTHY_OBSERVED_2026_08_31",
      authenticationMode: "PASSWORDLESS_OTP_MAGIC_LINK",
      passwordlessProtectedAccess: "COMPENSATING_CONTROL_ACTIVE",
      leakedPasswordProtection: "DEFERRED_PLATFORM_CONTROL",
      passwordAuthSemanticStatus: "DEFERRED_HARDENING_FOR_PASSWORD_AUTH",
      passwordBasedProtectedAuthWithoutVerifiedControl: "DENY",
      productionAuthorityGranted: false
    },
    migrations: {
      productionApplicationAuthorized: false,
      remoteLatestObserved: "20260717002347",
      pending: [
        "20260718153148_clinical_assurance_control_plane.sql",
        "20260721173000_p32_evidence_attestation_issuances.sql",
        "20260722120000_p32_candidate_review_control_plane.sql"
      ]
    },
    aal2: { status: "OPERATOR_ACTION_REQUIRED", exactCandidateEvidencePresent: false },
    review: { status: "NOT_REQUESTED", humanApprovalPresent: false },
    authority: {
      syntheticNoPhiPreview: true,
      protectedPilot: false,
      merge: false,
      production: false,
      migration: false,
      phi: false,
      clinicalExecution: false,
      payerSubmission: false,
      ehrWriteback: false,
      deviceWriteback: false,
      customerActivation: false,
      externalDistribution: false
    }
  };
}

export function inspectP34CumulativeIntegrationState(env = process.env) {
  const head = gitSha("HEAD");
  const base = gitSha(`${env.SCRIMED_P34_MAIN_BASE_REF?.trim() || p34MainReviewBase.commitSha}^{commit}`);
  if (!head || !base) throw new Error("p.34 cumulative integration state requires valid base and head commits.");
  const mergeBase = gitSha(gitText(["merge-base", base, head]) ?? "");
  if (!mergeBase) throw new Error("p.34 cumulative integration state requires a common merge base.");

  const committedPaths = nullList(git(["diff", "--name-only", "-z", `${base}...${head}`, "--"]));
  const worktreeTrackedPaths = nullList(git(["diff", "--name-only", "-z", "HEAD", "--"]));
  const untrackedPaths = nullList(git(["ls-files", "--others", "--exclude-standard", "-z"]));
  const paths = [...new Set([...committedPaths, ...worktreeTrackedPaths, ...untrackedPaths])]
    .filter((path) => !path.startsWith("artifacts/release/"))
    .sort();
  const files = paths.map((path) => ({
    path,
    classification: classifyP34Path(path),
    status: "CUMULATIVE_MAIN_TO_CURRENT"
  }));
  const classificationCounts = Object.fromEntries(
    [...new Set(files.map((entry) => entry.classification))]
      .sort()
      .map((classification) => [classification, files.filter((entry) => entry.classification === classification).length])
  );

  return {
    schemaVersion: "scrimed-p34-cumulative-integration-state-v1",
    base,
    mergeBase,
    head,
    fileCount: files.length,
    classificationCounts,
    unexplainedFileCount: files.filter((entry) => entry.classification === "UNEXPECTED").length,
    files
  };
}

export function hashFileIfPresent(path) {
  try {
    return sha256(readFileSync(path));
  } catch {
    return null;
  }
}
