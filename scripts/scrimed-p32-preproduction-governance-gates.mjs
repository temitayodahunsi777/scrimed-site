#!/usr/bin/env node

import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

import {
  createP32TechnicalGateEvidence,
  evaluateP32TechnicalGates,
  scrimedP32AutomatedTechnicalGateIds
} from "../app/lib/scrimed-work/p32TechnicalGates.ts";

const args = new Set(process.argv.slice(2));
const profileArg = [...args].find((arg) => arg.startsWith("--profile="));
const evidenceArg = [...args].find((arg) => arg.startsWith("--evidence="));
const profile = profileArg?.split("=")[1] ?? "development";
const selfTest = args.has("--self-test");
const strict = args.has("--strict");
const jsonOnly = args.has("--json");

if (profile !== "development" && profile !== "production-release") {
  console.error("error profile must be development or production-release");
  process.exit(2);
}

const sha256 = (value) => createHash("sha256").update(value).digest("hex");
const evaluatedAt = selfTest
  ? "2026-08-01T12:15:00.000Z"
  : new Date().toISOString();
const candidateFingerprint = selfTest
  ? sha256("scrimed-p32-preproduction-governance-self-test-candidate")
  : process.env.SCRIMED_P32_CANDIDATE_FINGERPRINT;
const sourceFingerprint = selfTest
  ? sha256("scrimed-p32-preproduction-governance-self-test-source")
  : process.env.SCRIMED_P32_SOURCE_FINGERPRINT;

if (
  !candidateFingerprint ||
  !sourceFingerprint ||
  !/^[0-9a-f]{64}$/i.test(candidateFingerprint) ||
  !/^[0-9a-f]{64}$/i.test(sourceFingerprint)
) {
  console.error(
    "error set SCRIMED_P32_CANDIDATE_FINGERPRINT and SCRIMED_P32_SOURCE_FINGERPRINT to exact SHA-256 values"
  );
  process.exit(2);
}

let evidence = [];
if (selfTest) {
  evidence = scrimedP32AutomatedTechnicalGateIds.map((gateId, index) =>
    createP32TechnicalGateEvidence({
      evidenceId: `self-test-${index}`,
      gateId,
      status: "passed",
      candidateFingerprint,
      sourceFingerprint,
      evidencePointer: `synthetic-self-test:${gateId}`,
      evaluatorIdentityHash: sha256(`self-test-evaluator-${index}`),
      evaluatorRole: "local-deterministic-self-test",
      checkedAt: evaluatedAt,
      expiresAt: "2026-08-02T12:15:00.000Z"
    })
  );
} else if (evidenceArg) {
  const evidencePath = evidenceArg.slice("--evidence=".length);
  const parsed = JSON.parse(await readFile(evidencePath, "utf8"));
  if (!Array.isArray(parsed)) {
    console.error("error evidence file must contain a JSON array");
    process.exit(2);
  }
  evidence = parsed;
}

const report = evaluateP32TechnicalGates({
  profile,
  candidateFingerprint,
  sourceFingerprint,
  evaluatedAt,
  evidence,
  safetyPosture: {
    syntheticOnly: process.env.SCRIMED_SYNTHETIC_ONLY !== "false",
    deidentifiedFixturesOnly:
      process.env.SCRIMED_DEIDENTIFIED_FIXTURES_ONLY !== "false",
    readOnly: process.env.SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED !== "true",
    liveProviderCallsEnabled:
      process.env.SCRIMED_EXTERNAL_PROVIDER_CALLS_ENABLED === "true",
    productionMutationsEnabled:
      process.env.SCRIMED_CONSEQUENTIAL_ACTIONS_ENABLED === "true"
  }
});

if (jsonOnly) {
  console.log(JSON.stringify(report, null, 2));
} else {
  console.log(
    `${report.profile}: PASS=${report.counts.PASS} FAIL=${report.counts.FAIL} BLOCKED=${report.counts.BLOCKED} BLOCKED_EXTERNAL=${report.counts.BLOCKED_EXTERNAL} PENDING_HUMAN=${report.counts.PENDING_HUMAN}`
  );
  console.log(
    `development_safe_mode=${report.developmentSafeModeAllowed} production_release=${report.productionReleaseAllowed}`
  );
  console.log(`candidate=${report.candidateFingerprint}`);
  console.log(`source=${report.sourceFingerprint}`);
  console.log(`report=${report.reportHash}`);
  for (const result of report.results.filter((result) => result.status !== "PASS")) {
    console.log(
      `${result.status} ${result.gateId}: ${result.reasonCode}; owner=${result.ownerRole}; workaround=${result.developmentWorkaround ?? "none"}`
    );
  }
}

if (selfTest && (!report.developmentSafeModeAllowed || report.productionReleaseAllowed)) {
  console.error("error fail-closed gate self-test did not preserve the expected boundary");
  process.exit(1);
}

if (
  strict &&
  ((profile === "development" && !report.developmentSafeModeAllowed) ||
    (profile === "production-release" && !report.productionReleaseAllowed))
) {
  process.exit(1);
}
