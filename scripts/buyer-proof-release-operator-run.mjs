#!/usr/bin/env node

import { decodeJwtPayload } from "./lib/sales-demo-session-qa-token-policy.mjs";

const baseUrl = (process.env.SCRIMED_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const workspaceSlug = (process.env.SCRIMED_WORKSPACE_SLUG ?? "atlas-synthetic-evaluation").trim();
const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim();
const requireOperatorRun = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_BUYER_PROOF_OPERATOR_RUN ?? "").toLowerCase()
);
const maxTokenLifetimeSeconds = positiveInteger(
  process.env.SCRIMED_BUYER_PROOF_MAX_TOKEN_SECONDS,
  3900
);
const minRemainingSeconds = positiveInteger(
  process.env.SCRIMED_BUYER_PROOF_MIN_REMAINING_SECONDS,
  60
);

const verifierPath = `/api/pilot-workspaces/${workspaceSlug}/buyer-release-control-run`;
const timelinePath = `${verifierPath}/timeline`;
const packetPath = `${verifierPath}/packet`;

function endpoint(path) {
  return `${baseUrl}${path}`;
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(typeof value === "string" ? value.trim() : "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

async function readResponse(response) {
  const text = await response.text();

  try {
    return { json: JSON.parse(text), text };
  } catch {
    return { json: null, text };
  }
}

async function request(path, init = {}) {
  const response = await fetch(endpoint(path), init);
  const body = await readResponse(response);

  return { response, body };
}

function requireStatus(label, actual, expected) {
  const expectedValues = Array.isArray(expected) ? expected : [expected];

  if (!expectedValues.includes(actual)) {
    throw new Error(`${label} expected ${expectedValues.join(" or ")} but received ${actual}.`);
  }
}

function requireHeader(label, response, header, expected) {
  const actual = response.headers.get(header);

  if (actual !== expected) {
    throw new Error(`${label} expected ${header} ${expected} but received ${actual}.`);
  }
}

function requireProtectedBoundary(label, response) {
  requireHeader(label, response, "x-scrimed-data-boundary", "synthetic-only");
  requireHeader(label, response, "x-scrimed-release-authority", "not-release-approval");
  requireHeader(label, response, "x-scrimed-clinical-care-authority", "not-authorized-live-care");
  requireHeader(label, response, "x-scrimed-phi-authority", "not-authorized-production-phi");
  requireHeader(label, response, "x-scrimed-security-certification", "not-security-certified");
}

function requireJson(label, body) {
  if (!body.json) {
    throw new Error(`${label} expected JSON response.`);
  }

  return body.json;
}

function numberClaim(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function analyzeBearerToken(token) {
  const errors = [];
  const warnings = [];
  const decoded = decodeJwtPayload(token);

  if (decoded.error || !decoded.claims) {
    return {
      ok: false,
      errors: [decoded.error ?? "Bearer token could not be decoded."],
      warnings,
      remainingSeconds: null,
      tokenLifetimeSeconds: null
    };
  }

  const claims = decoded.claims;
  const exp = numberClaim(claims.exp);
  const iat = numberClaim(claims.iat);
  const nowSeconds = Math.floor(Date.now() / 1000);
  const remainingSeconds = exp === null ? null : exp - nowSeconds;
  const tokenLifetimeSeconds = exp !== null && iat !== null ? exp - iat : null;

  if (claims.aal !== "aal2") {
    errors.push("Bearer token must contain aal=aal2.");
  }

  if (typeof claims.session_id !== "string" || claims.session_id.length === 0) {
    errors.push("Bearer token must contain a non-empty session_id claim.");
  }

  if (typeof claims.sub !== "string" || claims.sub.length === 0) {
    warnings.push("Bearer token is missing a sub claim; protected API verification remains the source of truth.");
  }

  if (exp === null) {
    errors.push("Bearer token must contain a numeric exp claim.");
  } else if (remainingSeconds !== null && remainingSeconds <= 0) {
    errors.push("Bearer token is expired.");
  } else if (remainingSeconds !== null && remainingSeconds < minRemainingSeconds) {
    errors.push(
      `Bearer token expires too soon for buyer proof operator run (${remainingSeconds}s remaining, minimum ${minRemainingSeconds}s).`
    );
  } else if (remainingSeconds !== null && remainingSeconds > maxTokenLifetimeSeconds) {
    errors.push(
      `Bearer token remaining lifetime is too long (${remainingSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
    );
  }

  if (iat === null) {
    errors.push("Bearer token must contain a numeric iat claim.");
  } else if (tokenLifetimeSeconds !== null && tokenLifetimeSeconds > maxTokenLifetimeSeconds) {
    errors.push(
      `Bearer token minted lifetime is too long (${tokenLifetimeSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
    );
  }

  if (claims.role && claims.role !== "authenticated") {
    warnings.push(`Bearer token role is ${claims.role}; expected authenticated for protected buyer proof run.`);
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    remainingSeconds,
    tokenLifetimeSeconds
  };
}

function requireTimeline(label, body) {
  const json = requireJson(label, body);

  if (json.service !== "scrimed-protected-buyer-release-readiness-timeline") {
    throw new Error(`${label} expected service scrimed-protected-buyer-release-readiness-timeline.`);
  }

  if (json.status !== "aal2-protected-buyer-release-readiness-timeline-ready") {
    throw new Error(`${label} returned unexpected timeline status ${json.status}.`);
  }

  const timeline = json.timeline;

  if (!timeline || typeof timeline !== "object") {
    throw new Error(`${label} did not return a timeline object.`);
  }

  if (
    timeline.proofStackStatus !==
    "aal2-protected-buyer-release-readiness-timeline-no-release-approval"
  ) {
    throw new Error(`${label} returned an unexpected proof-stack status.`);
  }

  if (timeline.verifierRunCapture !== "browser-session-ephemeral-read") {
    throw new Error(`${label} must keep verifier reads marked as ephemeral browser-session reads.`);
  }

  if (
    typeof timeline.durableRunWorkaround !== "string" ||
    !timeline.durableRunWorkaround.includes("audited release-control chain packet")
  ) {
    throw new Error(`${label} did not expose the durable chain-packet workaround.`);
  }

  if (!Array.isArray(timeline.events)) {
    throw new Error(`${label} did not return timeline events.`);
  }

  const verifierRead = timeline.events.find((event) => event.id === "current-verifier-read");

  if (!verifierRead || verifierRead.auditEventId !== null) {
    throw new Error(`${label} must show the verifier read as non-durable and unaudited.`);
  }

  return timeline;
}

function chainPacketEvent(timeline) {
  return timeline.events.find((event) => event.id === "protected-chain-packet") ?? null;
}

function packetAuditEventId(text) {
  return text.match(
    /Packet audit event:\s*([0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})/i
  )?.[1] ?? null;
}

for (const [label, path] of [
  ["unauthenticated buyer release verifier", verifierPath],
  ["unauthenticated buyer release timeline", timelinePath],
  ["unauthenticated buyer release packet", packetPath]
]) {
  const unauthenticated = await request(path);
  requireStatus(label, unauthenticated.response.status, [401, 403, 503]);
  requireProtectedBoundary(label, unauthenticated.response);
  console.log(
    `pass ${label} fail-closed check: ${unauthenticated.response.status} ${unauthenticated.response.statusText}`
  );
}

if (!bearerToken) {
  const message =
    "set SCRIMED_BEARER_TOKEN to a fresh short-lived tenant-admin or pilot-lead AAL2 bearer token";

  if (requireOperatorRun) {
    throw new Error(`buyer proof operator run required but no bearer token was provided; ${message}.`);
  }

  console.log(`skip authenticated buyer proof operator run: ${message}.`);
  process.exit(0);
}

if (!/^[a-z0-9][a-z0-9-]{3,127}$/i.test(workspaceSlug)) {
  throw new Error("SCRIMED_WORKSPACE_SLUG must be an explicit protected workspace slug.");
}

const tokenPolicy = analyzeBearerToken(bearerToken);

if (!tokenPolicy.ok) {
  throw new Error(`buyer proof operator token preflight failed: ${tokenPolicy.errors.join(" ")}`);
}

for (const warning of tokenPolicy.warnings) {
  console.warn(`warn buyer proof operator token preflight: ${warning}`);
}

console.log(
  [
    "pass buyer proof operator token preflight:",
    `workspace=${workspaceSlug}`,
    `remaining=${tokenPolicy.remainingSeconds ?? "unknown"}s`,
    `minted_lifetime=${tokenPolicy.tokenLifetimeSeconds ?? "unknown"}s`,
    "signature=verified-by-protected-api"
  ].join(" ")
);

const authHeaders = {
  Authorization: `Bearer ${bearerToken}`
};

const verifierResult = await request(verifierPath, { headers: authHeaders });
requireStatus("authenticated buyer release verifier", verifierResult.response.status, 200);
requireProtectedBoundary("authenticated buyer release verifier", verifierResult.response);

const verifierJson = requireJson("authenticated buyer release verifier", verifierResult.body);

if (verifierJson.service !== "scrimed-protected-buyer-release-control-run") {
  throw new Error("authenticated buyer release verifier returned an unexpected service.");
}

if (
  verifierJson.run?.proofStackStatus !==
  "aal2-protected-buyer-release-control-chain-verifier-no-release-approval"
) {
  throw new Error("authenticated buyer release verifier returned an unexpected proof-stack status.");
}

if (
  verifierJson.run?.packetProofStackStatus !==
  "aal2-audited-buyer-release-control-chain-packet-no-release-approval"
) {
  throw new Error("authenticated buyer release verifier returned an unexpected packet proof-stack status.");
}

console.log(
  [
    "pass authenticated buyer release verifier:",
    `chain_state=${verifierJson.run.chainState}`,
    `ready=${verifierJson.run.readyGateCount}/${verifierJson.run.gateCount}`,
    `review=${verifierJson.run.reviewGateCount}`,
    `blocked=${verifierJson.run.blockedGateCount}`,
    `share_state=${verifierJson.run.shareState}`
  ].join(" ")
);

const preTimelineResult = await request(timelinePath, { headers: authHeaders });
requireStatus("authenticated buyer release timeline before packet", preTimelineResult.response.status, 200);
requireProtectedBoundary("authenticated buyer release timeline before packet", preTimelineResult.response);
requireHeader(
  "authenticated buyer release timeline before packet",
  preTimelineResult.response,
  "x-scrimed-timeline-authority",
  "metadata-only-no-approval"
);
const preTimeline = requireTimeline("authenticated buyer release timeline before packet", preTimelineResult.body);
const preChainPacket = chainPacketEvent(preTimeline);

console.log(
  [
    "pass authenticated buyer release timeline before packet:",
    `durable_audit_events=${preTimeline.durableAuditEventCount}`,
    `durable_packet_audits=${preTimeline.durablePacketAuditCount}`,
    `chain_packet_audit=${preChainPacket?.auditEventId ?? "not-visible"}`
  ].join(" ")
);

const packetResult = await request(packetPath, { headers: authHeaders });
requireStatus("authenticated buyer release chain packet", packetResult.response.status, 200);
requireProtectedBoundary("authenticated buyer release chain packet", packetResult.response);
requireHeader(
  "authenticated buyer release chain packet",
  packetResult.response,
  "x-scrimed-buyer-release-control-packet-audited",
  "true"
);

const packetContentType = packetResult.response.headers.get("content-type") ?? "";

if (!packetContentType.includes("text/markdown")) {
  throw new Error(`authenticated buyer release chain packet expected markdown but received ${packetContentType}.`);
}

if (!packetResult.body.text.includes("# SCRIMED Protected Buyer Release Control Chain Packet")) {
  throw new Error("authenticated buyer release chain packet missing packet heading.");
}

if (!packetResult.body.text.includes("## Hard Stop")) {
  throw new Error("authenticated buyer release chain packet missing hard stop boundary.");
}

const auditedPacketEventId = packetAuditEventId(packetResult.body.text);

if (!auditedPacketEventId) {
  throw new Error("authenticated buyer release chain packet did not expose the packet audit event ID.");
}

console.log(`pass authenticated buyer release chain packet audit: ${auditedPacketEventId}`);

const postTimelineResult = await request(timelinePath, { headers: authHeaders });
requireStatus("authenticated buyer release timeline after packet", postTimelineResult.response.status, 200);
requireProtectedBoundary("authenticated buyer release timeline after packet", postTimelineResult.response);
requireHeader(
  "authenticated buyer release timeline after packet",
  postTimelineResult.response,
  "x-scrimed-timeline-authority",
  "metadata-only-no-approval"
);
const postTimeline = requireTimeline("authenticated buyer release timeline after packet", postTimelineResult.body);
const postChainPacket = chainPacketEvent(postTimeline);

if (!postChainPacket || postChainPacket.auditEventId !== auditedPacketEventId) {
  throw new Error(
    "authenticated buyer release timeline did not reflect the newly audited release-control chain packet."
  );
}

if (postTimeline.durablePacketAuditCount < preTimeline.durablePacketAuditCount) {
  throw new Error("authenticated buyer release timeline durable packet audit count moved backward.");
}

console.log(
  [
    "pass authenticated buyer release timeline after packet:",
    `durable_audit_events=${postTimeline.durableAuditEventCount}`,
    `durable_packet_audits=${postTimeline.durablePacketAuditCount}`,
    `chain_packet_audit=${postChainPacket.auditEventId}`
  ].join(" ")
);

console.log("safe evidence workflowKind=buyer-proof-release-operator-run");
console.log(`safe evidence workspaceSlug=${workspaceSlug}`);
console.log(`safe evidence verifierChainState=${verifierJson.run.chainState}`);
console.log(`safe evidence releaseDecision=${verifierJson.run.releaseDecision}`);
console.log(`safe evidence shareState=${verifierJson.run.shareState}`);
console.log(`safe evidence packetAuditEventId=${auditedPacketEventId}`);
console.log("safe boundary no_phi=true no_live_clinical_care=true no_release_approval=true");
console.log(
  "operator action required: dispose of the short-lived SCRIMED_BEARER_TOKEN outside the application after this run."
);
console.log("SCRIMED Buyer Proof Release Operator Run completed.");
