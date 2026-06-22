#!/usr/bin/env node

import { decodeJwtPayload } from "./lib/sales-demo-session-qa-token-policy.mjs";

const bearerToken = process.env.SCRIMED_BEARER_TOKEN?.trim();
const workspaceSlug = process.env.SCRIMED_WORKSPACE_SLUG?.trim();
const requireQa = ["1", "true", "yes"].includes(
  (process.env.SCRIMED_REQUIRE_AUTHORITY_REFERENCE_QA ?? "").toLowerCase()
);
const maxTokenLifetimeSeconds = Number.parseInt(
  process.env.SCRIMED_AUTHORITY_QA_MAX_TOKEN_SECONDS ?? "3900",
  10
);
const minRemainingSeconds = Number.parseInt(
  process.env.SCRIMED_AUTHORITY_QA_MIN_REMAINING_SECONDS ?? "60",
  10
);

function fail(message) {
  throw new Error(`authority reference QA token preflight failed: ${message}`);
}

if (!bearerToken) {
  const message =
    "set SCRIMED_BEARER_TOKEN only for a deliberate short-lived AAL2 authority-reference QA run";

  if (requireQa) {
    fail(message);
  }

  console.log(`skip authority reference QA token preflight: ${message}.`);
  process.exit(0);
}

if (!workspaceSlug || !/^[a-z0-9][a-z0-9-]{3,127}$/i.test(workspaceSlug)) {
  fail("SCRIMED_WORKSPACE_SLUG must be an explicit protected workspace slug.");
}

const decoded = decodeJwtPayload(bearerToken);

if (decoded.error || !decoded.claims) {
  fail(decoded.error ?? "Bearer token could not be decoded.");
}

const claims = decoded.claims;
const exp = typeof claims.exp === "number" ? claims.exp : null;
const iat = typeof claims.iat === "number" ? claims.iat : null;
const nowSeconds = Math.floor(Date.now() / 1000);
const remainingSeconds = exp === null ? null : exp - nowSeconds;
const mintedLifetimeSeconds = exp !== null && iat !== null ? exp - iat : null;
const errors = [];
const warnings = [];

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
    `Bearer token expires too soon for authority QA (${remainingSeconds}s remaining, minimum ${minRemainingSeconds}s).`
  );
} else if (remainingSeconds !== null && remainingSeconds > maxTokenLifetimeSeconds) {
  errors.push(
    `Bearer token remaining lifetime is too long (${remainingSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
  );
}

if (iat === null) {
  errors.push("Bearer token must contain a numeric iat claim.");
} else if (mintedLifetimeSeconds !== null && mintedLifetimeSeconds > maxTokenLifetimeSeconds) {
  errors.push(
    `Bearer token minted lifetime is too long (${mintedLifetimeSeconds}s, maximum ${maxTokenLifetimeSeconds}s).`
  );
}

if (claims.role && claims.role !== "authenticated") {
  warnings.push(`Bearer token role is ${claims.role}; expected authenticated for tenant QA.`);
}

if (errors.length > 0) {
  fail(errors.join(" "));
}

for (const warning of warnings) {
  console.warn(`warn authority reference QA token preflight: ${warning}`);
}

console.log(
  [
    "pass authority reference QA token preflight:",
    `workspace=${workspaceSlug}`,
    `remaining=${remainingSeconds ?? "unknown"}s`,
    `minted_lifetime=${mintedLifetimeSeconds ?? "unknown"}s`,
    "signature=verified-by-protected-api"
  ].join(" ")
);
