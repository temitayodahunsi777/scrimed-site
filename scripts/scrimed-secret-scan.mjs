#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";

const args = new Set(process.argv.slice(2));
const allowed = new Set(["--self-test"]);
const unknown = [...args].filter((arg) => !allowed.has(arg));
if (unknown.length) throw new Error(`Unsupported secret-scan option: ${unknown.join(", ")}`);

function fingerprint(value) {
  return createHash("sha256").update(value).digest("hex").slice(0, 16);
}

function scanSecretLikeMaterial(content) {
  const patterns = [
    ["jwt", /\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g],
    ["private-key", /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g],
    ["api-key", /\b(?:sk-|sbp_)[A-Za-z0-9_-]{20,}\b/g],
    ["generic-assignment", /\b(?:password|secret|access_token|refresh_token|service_role_key)\s*[:=]\s*["'][A-Za-z0-9+/_=-]{20,}["']/gi]
  ];
  return patterns.flatMap(([detector, pattern]) => [...content.matchAll(pattern)]
    .filter((match) => !/(?:synthetic|example|redacted|placeholder|fake)/i.test(match[0]))
    .map((match) => ({
      detector,
      line: content.slice(0, match.index ?? 0).split("\n").length,
      fingerprint: fingerprint(`${detector}:${match[0]}`)
    })));
}

if (args.has("--self-test")) {
  const realLike = `access_token="${"A".repeat(32)}"`;
  const fake = `access_token="synthetic-${"A".repeat(24)}"`;
  if (scanSecretLikeMaterial(realLike).length !== 1 || scanSecretLikeMaterial(fake).length !== 0) {
    throw new Error("SCRIMED secret scanner self-test failed");
  }
  console.log("pass SCRIMED secret scanner self-test");
  process.exit(0);
}

const listed = spawnSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z"], {
  encoding: "buffer",
  shell: false,
  maxBuffer: 16 * 1024 * 1024
});
if (listed.status !== 0 || listed.error) throw new Error("SCRIMED secret scan could not enumerate candidate files");
const paths = listed.stdout.toString("utf8").split("\0").filter(Boolean).sort();
const findings = [];
let scanned = 0;
for (const path of paths) {
  const fileStat = await stat(path).catch(() => null);
  if (!fileStat?.isFile() || fileStat.size > 2 * 1024 * 1024) continue;
  const buffer = await readFile(path);
  if (buffer.includes(0)) continue;
  const content = buffer.toString("utf8");
  const fileFindings = scanSecretLikeMaterial(content);
  scanned += 1;
  for (const finding of fileFindings) findings.push({ path, ...finding });
}
if (findings.length) {
  const summary = findings.slice(0, 20).map((finding) => `${finding.path}:${finding.line}:${finding.detector}:${finding.fingerprint}`);
  throw new Error(`SCRIMED secret scan found ${findings.length} candidate finding(s):\n${summary.join("\n")}`);
}
console.log(`pass SCRIMED no-secret candidate scan files=${scanned} findings=0`);
