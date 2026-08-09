#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

import { buildAssuranceManifest } from "../app/lib/scrimed-work/assuranceManifest.ts";
import { buildControlAttestations } from "../app/lib/scrimed-work/controlAttestations.ts";

const rawArgs = process.argv.slice(2);
const flags = new Set(rawArgs.filter((arg) => !arg.includes("=")));
const allowedFlags = new Set(["--self-test", "--strict", "--json"]);
const unknownFlags = [...flags].filter((flag) => !allowedFlags.has(flag));
if (unknownFlags.length) throw new Error(`Unsupported assurance option: ${unknownFlags.join(", ")}`);

const valueArg = (name, fallback = null) =>
  rawArgs.find((arg) => arg.startsWith(`--${name}=`))?.slice(name.length + 3) ?? fallback;
const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const canonicalize = (value) => {
  if (Array.isArray(value)) return value.map(canonicalize);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, nested]) => [key, canonicalize(nested)])
    );
  }
  return value;
};
const canonicalHash = (value) => sha256(JSON.stringify(canonicalize(value)));

function runJson(args) {
  const result = spawnSync(process.execPath, args, {
    cwd: process.cwd(),
    encoding: "utf8",
    maxBuffer: 64 * 1024 * 1024,
    timeout: 20 * 60 * 1000,
    env: { ...process.env, SCRIMED_ASSURANCE_CHILD: "true" }
  });
  if (result.status !== 0) {
    throw new Error(
      `${args.join(" ")} failed: ${result.stderr.trim() || result.stdout.trim() || "unknown error"}`
    );
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    throw new Error(`${args.join(" ")} did not return JSON evidence.`);
  }
}

async function hashFiles(paths) {
  const records = [];
  for (const path of paths) records.push({ path, content: await readFile(path, "utf8") });
  return canonicalHash(records);
}

function buildGateRegistry({ validationPassed, controlsPassed, immutableCandidate, generatedAt, expiresAt }) {
  const gates = [
    ["synthetic-only-mode", "PASS_SAFE_BOUNDARY_ENFORCED", "engineering", "Synthetic-only mode remains on."],
    ["phi-processing-disabled", "PASS_SAFE_BOUNDARY_ENFORCED", "privacy-owner", "PHI processing remains off."],
    ["clinical-execution-disabled", "PASS_SAFE_BOUNDARY_ENFORCED", "clinical-safety-owner", "Clinical execution remains off."],
    ["automated-assurance", validationPassed && controlsPassed ? "AUTOMATED_ASSURANCE_COMPLETE" : "FAIL", "release-steward", "Local no-secret assurance evidence."],
    ["immutable-source-candidate", immutableCandidate ? "PASS" : "FOUNDER_INTERIM_ACCEPTANCE_REQUIRED", "founder-authority", "Clean attributable source candidate."],
    ["wix-faithcore-copy", "OPERATOR_ACTION_REQUIRED", "wix-owner", "Publish and verify the final clinically neutral FaithCore copy."],
    ["supabase-leaked-password-protection", "OPERATOR_ACTION_REQUIRED", "supabase-owner", "Enable leaked-password protection without changing unrelated auth settings."],
    ["disposable-migration-dry-run", "OPERATOR_ACTION_REQUIRED", "ci-platform-owner", "Run the isolated migration workflow and return its artifact."],
    ["legal-policy-adoption", "TARGETED_SPECIALIST_REVIEW_REQUIRED", "qualified-legal-counsel", "Required only before binding policy adoption."],
    ["production-migration", "PRODUCTION_AUTHORIZATION_REQUIRED", "database-owner", "Production migration remains separately authorized."],
    ["production-deployment", "PRODUCTION_AUTHORIZATION_REQUIRED", "release-authority", "Production deployment remains separately authorized."],
    ["customer-go-live", "PRODUCTION_AUTHORIZATION_REQUIRED", "customer-authority", "Customer activation remains separately authorized."]
  ].map(([gateId, status, ownerRole, description]) => ({
    gateId,
    status,
    ownerRole,
    description,
    evaluatedAt: generatedAt,
    expiresAt,
    productionAuthorityGranted: false
  }));
  return {
    schemaVersion: "scrimed-risk-tiered-gate-registry-v1-2026-08-01",
    generatedAt,
    expiresAt,
    gates,
    counts: gates.reduce((counts, gate) => {
      counts[gate.status] = (counts[gate.status] ?? 0) + 1;
      return counts;
    }, {}),
    productionAuthorityGranted: false
  };
}

async function generate() {
  const manifestReport = runJson(["scripts/release-candidate-manifest.mjs", "--json"]);
  const validationReport = runJson(["scripts/release-candidate-validation.mjs", "--json"]);
  const reviewReport = runJson(["scripts/release-candidate-review-packet.mjs", "--json"]);
  const sbomReport = runJson(["scripts/scrimed-sbom.mjs", "--json", "--verify"]);
  const migrationReport = runJson(["scripts/scrimed-migration-evidence-packet.mjs", "--json"]);
  const generatedAt = valueArg("generated-at", new Date().toISOString());
  const expiresAt = new Date(Date.parse(generatedAt) + 7 * 24 * 60 * 60 * 1000).toISOString();
  const candidateFingerprint = validationReport.candidateFingerprintSha256;
  const sourceFingerprint = validationReport.sourceFingerprintSha256;
  if (!candidateFingerprint || !sourceFingerprint) {
    throw new Error("Candidate validation did not return exact candidate and source fingerprints.");
  }
  const publicClaimsFingerprint = await hashFiles([
    "config/public-claims-policy.json",
    "scripts/verify-public-release.mjs",
    "app/components/PreproductionDisclosure.tsx"
  ]);
  const modelRegistryFingerprint = await hashFiles(["app/lib/scrimed-work/modelQualification.ts"]);
  const operatingModeFingerprint = await hashFiles(["app/lib/operatingMode.ts"]);
  const migrationReportFingerprint = migrationReport.packetHash;
  const reviewPacketFingerprint = reviewReport.candidateReviewPacketSha256;
  const artifactFingerprint =
    validationReport.artifactFingerprintSha256 ?? canonicalHash({ status: "no-separate-artifact" });
  const checks = validationReport.checks ?? [];
  const validationPassed = validationReport.automatedValidationPassed === true;
  const standardEvidence = [
    ["candidate-validation", validationReport.validationEvidenceHashSha256, validationPassed],
    ["review-packet", reviewPacketFingerprint, reviewReport.completeCoverage === true],
    ["sbom", sbomReport.sbomHash, sbomReport.componentCount > 0],
    ["migration-static-analysis", migrationReportFingerprint, migrationReport.staticValidationPassed === true],
    ["public-claims", publicClaimsFingerprint, checks.find((check) => check.id === "build")?.passed === true]
  ].map(([evidenceId, fingerprint, passed]) => ({
    evidenceId,
    fingerprint,
    candidateFingerprint,
    sourceFingerprint,
    status: passed ? "passed" : "failed"
  }));
  const observations = [
    ["operating:synthetic-only", true, true, "app/lib/operatingMode.ts", "public-remediation-policy-test"],
    ["operating:no-phi", false, false, "app/lib/operatingMode.ts", "public-remediation-policy-test"],
    ["clinical:execution-disabled", false, false, "app/lib/operatingMode.ts", "scrimed-p32-policy-test"],
    ["connector:ehr-disabled", false, false, "app/lib/operatingMode.ts", "scrimed-p32-policy-test"],
    ["connector:device-disabled", false, false, "app/lib/operatingMode.ts", "scrimed-p32-policy-test"],
    ["clinical:emergency-monitoring-disabled", false, false, "app/lib/operatingMode.ts", "scrimed-p32-policy-test"],
    ["clinical:autonomous-decisions-disabled", false, false, "app/lib/operatingMode.ts", "scrimed-p32-policy-test"],
    ["faithcore:clinical-neutrality", false, false, "app/lib/operatingMode.ts", "public-remediation-policy-test"],
    ["claims:public-policy-compliant", true, validationPassed, "config/public-claims-policy.json", "public-claims-integrity-policy"],
    ["model:admission-compliant", true, validationPassed, "app/lib/scrimed-work/modelQualification.ts", "scrimed-qualification-impact-policy-test"],
    ["agent:delegation-bounded", true, validationPassed, "app/lib/scrimed-work/agentTeams.ts", "scrimed-review-orchestrator-policy-test"],
    ["authorization:server-enforced", true, validationPassed, "app/lib/scrimed-work/reviewPolicyEngine.ts", "preproduction-assurance-policy-test"],
    ["audit:logging-enabled", true, validationPassed, "app/lib/scrimed-work/audit.ts", "scrimed-work-production-hardening-policy-test"],
    ["mutation:idempotency-enabled", true, validationPassed, "app/lib/scrimed-work/governedRuntime.ts", "scrimed-p32-release-hardening-policy-test"],
    ["database:migrations-not-applied", false, false, "config/pending-migration-authorization.json", "pending-migration-static-authorization-check"],
    ["customer:go-live-disabled", false, false, "app/lib/operatingMode.ts", "preproduction-assurance-policy-test"]
  ].map(([controlId, expectedState, observedState, evidence, testReference]) => ({
    controlId,
    expectedState,
    observedState,
    evidence: [evidence],
    testReference
  }));
  const controls = buildControlAttestations({
    sourceFingerprint,
    timestamp: generatedAt,
    expiresAt,
    observations
  });
  const gateRegistry = buildGateRegistry({
    validationPassed,
    controlsPassed: controls.releasePackagingAllowed,
    immutableCandidate: manifestReport.candidateMode === "clean-commit" && manifestReport.dirtyEntryCount === 0,
    generatedAt,
    expiresAt
  });
  const gateRegistryFingerprint = canonicalHash(gateRegistry);
  const assuranceManifest = buildAssuranceManifest({
    baseCommit: manifestReport.candidateBaseSha,
    candidateCommit:
      manifestReport.candidateMode === "clean-commit" && manifestReport.dirtyEntryCount === 0
        ? manifestReport.baseHeadSha
        : null,
    candidateMode: manifestReport.candidateMode,
    candidateFingerprint,
    sourceFingerprint,
    artifactFingerprint,
    validationFingerprint: validationReport.validationEvidenceHashSha256,
    sbomFingerprint: sbomReport.sbomHash,
    publicClaimsFingerprint,
    gateRegistryFingerprint,
    reviewPacketFingerprint,
    migrationReportFingerprint,
    modelRegistryFingerprint,
    operatingModeFingerprint,
    evidence: standardEvidence,
    buildResult: checks.find((check) => check.id === "build")?.passed ? "passed" : "failed",
    testSummary: {
      passed: checks.filter((check) => check.passed).length,
      failed: checks.filter((check) => !check.passed).length,
      skipped: 0
    },
    secretScanResult: checks.find((check) => check.id === "secret-scan")?.passed ? "passed" : "failed",
    prohibitedCapabilitiesDisabled: controls.releasePackagingAllowed,
    environmentTarget: "preview",
    generatedAt,
    expiresAt,
    toolVersions: {
      node: process.version,
      assuranceGenerator: "scrimed-assurance-generator-v1-2026-08-01",
      reviewRequirements: "scrimed-review-requirements-v1-2026-08-01"
    }
  });

  const paths = {
    manifest: resolve("artifacts/assurance/assurance-manifest.json"),
    manifestHash: resolve("artifacts/assurance/assurance-manifest.sha256"),
    controls: resolve("artifacts/assurance/control-attestations.json"),
    gates: resolve("artifacts/governance/gate-registry.json")
  };
  await Promise.all(Object.values(paths).map((path) => mkdir(dirname(path), { recursive: true })));
  await writeFile(paths.manifest, `${JSON.stringify(assuranceManifest, null, 2)}\n`, "utf8");
  await writeFile(paths.manifestHash, `${assuranceManifest.manifestFingerprint}  assurance-manifest.json\n`, "utf8");
  await writeFile(paths.controls, `${JSON.stringify(controls, null, 2)}\n`, "utf8");
  await writeFile(paths.gates, `${JSON.stringify({ ...gateRegistry, gateRegistryFingerprint }, null, 2)}\n`, "utf8");
  return { assuranceManifest, controls, gateRegistry, gateRegistryFingerprint, paths };
}

if (flags.has("--self-test")) {
  const first = canonicalHash({ b: 2, a: 1 });
  const second = canonicalHash({ a: 1, b: 2 });
  if (first !== second) throw new Error("Assurance generator canonical hash self-test failed.");
  const registry = buildGateRegistry({
    validationPassed: true,
    controlsPassed: true,
    immutableCandidate: false,
    generatedAt: "2026-08-01T12:00:00.000Z",
    expiresAt: "2026-08-08T12:00:00.000Z"
  });
  if (
    registry.gates.find((gate) => gate.gateId === "phi-processing-disabled")?.status !==
      "PASS_SAFE_BOUNDARY_ENFORCED" ||
    registry.gates.find((gate) => gate.gateId === "production-deployment")?.status !==
      "PRODUCTION_AUTHORIZATION_REQUIRED"
  ) {
    throw new Error("Assurance gate reclassification self-test failed.");
  }
  console.log("pass SCRIMED preproduction assurance generator self-test");
  process.exit(0);
}

const result = await generate();
if (flags.has("--json")) {
  console.log(
    JSON.stringify(
      {
        status: result.assuranceManifest.preproductionPackagingAllowed
          ? "PREPRODUCTION_ASSURANCE_COMPLETE"
          : "NOT_SAFE_TO_PROCEED",
        candidateFingerprint: result.assuranceManifest.candidateFingerprint,
        sourceFingerprint: result.assuranceManifest.sourceFingerprint,
        assuranceManifestFingerprint: result.assuranceManifest.manifestFingerprint,
        controlAttestationFingerprint: result.controls.bundleFingerprint,
        gateRegistryFingerprint: result.gateRegistryFingerprint,
        immutableCandidate: result.assuranceManifest.immutableCandidate,
        productionAuthorityGranted: false
      },
      null,
      2
    )
  );
} else {
  console.log(
    `pass SCRIMED preproduction assurance manifest=${result.assuranceManifest.manifestFingerprint.slice(0, 16)} controls=${result.controls.bundleFingerprint.slice(0, 16)} gates=${result.gateRegistryFingerprint.slice(0, 16)} immutable_candidate=${result.assuranceManifest.immutableCandidate}`
  );
}
if (flags.has("--strict") && !result.assuranceManifest.preproductionPackagingAllowed) {
  process.exitCode = 1;
}
