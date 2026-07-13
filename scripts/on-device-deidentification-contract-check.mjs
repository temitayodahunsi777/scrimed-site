#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const requiredFiles = [
  "app/lib/onDeviceDeidentification.ts",
  "app/lib/scrimedBuildRoadmap.ts",
  "app/scrimed-build-roadmap/page.tsx",
  "docs/scrimed-build-roadmap.md",
  "package.json",
  "scripts/scrimed-nonsecret-test-suite.mjs"
];

async function load(path) {
  return [path, await readFile(path, "utf8")];
}

function requireIncludes(path, text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`${path} is missing required On-Device De-Identification text: ${expected}`);
  }
}

const files = Object.fromEntries(await Promise.all(requiredFiles.map(load)));
const source = files["app/lib/onDeviceDeidentification.ts"];
const roadmap = files["app/lib/scrimedBuildRoadmap.ts"];
const page = files["app/scrimed-build-roadmap/page.tsx"];
const docs = files["docs/scrimed-build-roadmap.md"];
const packageJson = files["package.json"];
const suite = files["scripts/scrimed-nonsecret-test-suite.mjs"];

for (const expected of [
  "OnDeviceDeidentificationDocumentType",
  "onDeviceDeidentificationBoundary",
  "browser, Mac, and iPhone-capable",
  "PDFs, scans, images, HL7 v2, CDA, FHIR, CSV, NDJSON, and chat logs",
  "rawPayloadStored: false",
  "externalInferenceAllowed: false",
  "humanVerificationRequired: true",
  "buildOnDeviceDeidentificationManifest",
  "getOnDeviceDeidentificationSummary",
  "document-families-covered",
  "browser-mac-iphone-targets-covered",
  "raw-payload-storage-blocked",
  "external-inference-blocked",
  "human-verification-required",
  "\"pdf\"",
  "\"scan\"",
  "\"image\"",
  "\"hl7_v2\"",
  "\"cda\"",
  "\"fhir\"",
  "\"csv\"",
  "\"ndjson\"",
  "\"chat_log\""
]) {
  requireIncludes("app/lib/onDeviceDeidentification.ts", source, expected);
}

for (const expected of [
  "getOnDeviceDeidentificationSummary",
  "onDeviceDeidentification",
  "On-Device De-Identification"
]) {
  requireIncludes("app/lib/scrimedBuildRoadmap.ts", roadmap, expected);
}

for (const expected of [
  "On-Device De-Identification",
  "summary.onDeviceDeidentification",
  "External inference allowed",
  "Raw payload stored",
  "Human verification required"
]) {
  requireIncludes("app/scrimed-build-roadmap/page.tsx", page, expected);
}

for (const expected of [
  "On-Device De-Identification",
  "app/lib/onDeviceDeidentification.ts",
  "PDFs",
  "HL7 v2",
  "NDJSON",
  "chat logs",
  "stores no raw payloads",
  "sends nothing to external inference",
  "does not certify de-identification"
]) {
  requireIncludes("docs/scrimed-build-roadmap.md", docs, expected);
}

requireIncludes(
  "package.json",
  packageJson,
  "\"smoke:on-device-deidentification\": \"node scripts/on-device-deidentification-contract-check.mjs\""
);

requireIncludes(
  "scripts/scrimed-nonsecret-test-suite.mjs",
  suite,
  "scripts/on-device-deidentification-contract-check.mjs"
);

console.log("pass On-Device De-Identification contract check");
