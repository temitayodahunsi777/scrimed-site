#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const requiredFiles = [
  "config/wix-publication-policy.json",
  "scripts/lib/wix-publication-policy.mjs",
  "scripts/wix-publication-verification.mjs",
  "docs/WIX_OPERATOR_EXECUTION_PACKET.md",
  "docs/WIX_PUBLICATION_VERIFICATION_REPORT.md"
];

for (const pathname of requiredFiles) {
  if (!existsSync(pathname)) throw new Error(`Missing Wix publication verification artifact: ${pathname}`);
}

function requireText(pathname, values) {
  const content = readFileSync(pathname, "utf8");
  for (const value of values) {
    if (!content.includes(value)) {
      throw new Error(`${pathname} missing Wix publication verification contract: ${value}`);
    }
  }
}

requireText("config/wix-publication-policy.json", [
  "https://www.scrimedsolutions.com",
  "/vitals-monitoring",
  "/faithcore",
  "/partner-with-scrimed",
  "/service-page/ai-vitals-monitoring",
  "/service-page/faithcore-integration",
  "/service-page/voice-intake-assistants",
  "faithSpecificRoutes",
  "faithFirstEnterpriseMarkers",
  "forbiddenJsonLdTypes",
  "retiredStoreRoutes",
  "booking-services-sitemap.xml",
  "blog-posts-sitemap.xml",
  "blog-categories-sitemap.xml",
  "noIndexBookingSystemRoutes"
]);
requireText("scripts/lib/wix-publication-policy.mjs", [
  "verifyWixPublicationEvidence",
  "inspectWixPublicationPage",
  "forbidden-jsonld-type",
  "missing-home-disclosures",
  "booking-route-indexable",
  "crawler-forbidden-marker",
  "crawler-external-location",
  "uncollected-sitemap",
  "unscanned-indexed-route",
  "duplicate-page-evidence",
  "unexpected-page-evidence"
]);
requireText("scripts/wix-publication-verification.mjs", [
  "SCRIMED_WIX_PUBLICATION_EVIDENCE_PATH",
  "collectLiveEvidence",
  "disallowed-url",
  "redirect-downgrade",
  "readBoundedResponseBody",
  "evidence-path-outside-root",
  "evidence-symlink-not-allowed",
  "readBoundedEvidenceFile",
  "--self-test",
  "--strict",
  "rawContentStored"
]);
requireText("package.json", [
  "\"contract:wix-publication-verification\"",
  "\"test:wix-publication-verification\"",
  "\"smoke:wix-publication-verification\""
]);
requireText("scripts/scrimed-nonsecret-test-suite.mjs", [
  "wix-publication-verification-contract-check.mjs",
  "wix-publication-verification.mjs"
]);

const behavioralVerification = spawnSync(
  process.execPath,
  ["scripts/wix-publication-verification.mjs", "--self-test"],
  {
    env: {
      HOME: process.env.HOME ?? "",
      PATH: process.env.PATH ?? "",
      TMPDIR: process.env.TMPDIR ?? "/tmp"
    },
    encoding: "utf8",
    shell: false
  }
);
const behavioralOutput =
  `${behavioralVerification.stdout ?? ""}${behavioralVerification.stderr ?? ""}`;
if (
  behavioralVerification.status !== 0 ||
  !behavioralOutput.includes("Wix publication verification self-test")
) {
  throw new Error(`Wix behavioral verification failed: ${behavioralOutput.trim()}`);
}

console.log(
  `pass SCRIMED Wix publication verification contract check (${requiredFiles.length} artifacts verified)`
);
