import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

export const p34Predecessor = Object.freeze({
  pullRequestNumber: 39,
  branch: "agent/scrimed-p34-gap-closure",
  commitSha: "45be650f48e422b05160821681ff40bb9f1229c9",
  status: "PREDECESSOR"
});

export const p34RuntimeEvidencePath = "artifacts/release/p34-current-candidate.json";
export const p34ExactCandidateManifestPath = "artifacts/release/p34-exact-candidate-manifest.json";
export const p34RouteInventoryPath = "artifacts/build/route-inventory.json";
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
  if (path.startsWith("docs/")) return "DOCUMENTATION";
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
  if (path.endsWith(".tsx") || path.endsWith(".css")) return "UI";
  if (path.startsWith("app/lib/") || path.startsWith("app/api/")) return "CORE_RUNTIME";
  if (
    path === "package.json"
    || path === "package-lock.json"
    || path === ".gitignore"
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
      status: "ACTIVE_HEALTHY_OBSERVED_2026_08_28",
      leakedPasswordProtection: "OPERATOR_ACTION_REQUIRED"
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

export function hashFileIfPresent(path) {
  try {
    return sha256(readFileSync(path));
  } catch {
    return null;
  }
}
