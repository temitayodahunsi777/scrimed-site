#!/usr/bin/env node

import { spawnSync } from "node:child_process";

import { wixPublicationPolicy } from "./lib/wix-publication-policy.mjs";

const args = process.argv.slice(2);
const supportedFlags = new Set(["--json", "--strict", "--self-test"]);
const suppliedCanonical = args.find((arg) => arg.startsWith("--canonical="));
const unknown = args.filter(
  (arg) => !supportedFlags.has(arg) && !arg.startsWith("--canonical=")
);

if (unknown.length > 0) {
  throw new Error(`Unsupported Wix production verification option: ${unknown.join(", ")}`);
}

const canonical = suppliedCanonical?.slice("--canonical=".length)
  ?? wixPublicationPolicy.baseUrl;

function normalizeCanonical(value) {
  const parsed = new URL(value);
  if (
    parsed.protocol !== "https:" ||
    parsed.username ||
    parsed.password ||
    parsed.port ||
    parsed.pathname !== "/" ||
    parsed.search ||
    parsed.hash
  ) {
    throw new Error("The canonical Wix domain must be a bare HTTPS origin.");
  }
  return parsed.origin;
}

if (normalizeCanonical(canonical) !== normalizeCanonical(wixPublicationPolicy.baseUrl)) {
  throw new Error(
    `Canonical domain must match the governed Wix policy: ${wixPublicationPolicy.baseUrl}`
  );
}

const delegatedArgs = ["scripts/wix-publication-verification.mjs"];
if (args.includes("--self-test")) delegatedArgs.push("--self-test");
else {
  delegatedArgs.push("--strict");
  if (args.includes("--json")) delegatedArgs.push("--json");
}

const result = spawnSync(process.execPath, delegatedArgs, {
  cwd: process.cwd(),
  env: {
    ...process.env,
    SCRIMED_WIX_CANONICAL_DOMAIN: normalizeCanonical(canonical)
  },
  encoding: "utf8",
  shell: false
});

process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");

if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

if (args.includes("--self-test")) {
  console.log("pass SCRIMED portable Wix production verifier delegation");
}
