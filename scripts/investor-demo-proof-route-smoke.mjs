#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  boundedPublicFetch,
  normalizePublicSmokeBaseUrl,
  parsePublicSmokeMaxAttempts,
  parsePublicSmokeMaxResponseBytes,
  parsePublicSmokeTimeoutMs,
  readBoundedResponseText
} from "./lib/bounded-public-fetch.mjs";

const args = new Set(process.argv.slice(2));
const allowedArgs = new Set(["--json", "--self-test"]);
const unknownArgs = [...args].filter((arg) => !allowedArgs.has(arg));

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported investor demo proof-route option: ${unknownArgs.join(", ")}`);
}

const baseUrl = new URL(
  normalizePublicSmokeBaseUrl(
    process.env.SCRIMED_BASE_URL,
    "https://app.scrimedsolutions.com"
  )
);
const requestTimeoutMs = parsePublicSmokeTimeoutMs(
  process.env.SCRIMED_SMOKE_REQUEST_TIMEOUT_MS
);
const maxResponseBytes = parsePublicSmokeMaxResponseBytes(
  process.env.SCRIMED_SMOKE_MAX_RESPONSE_BYTES
);
const maxReadAttempts = parsePublicSmokeMaxAttempts(
  process.env.SCRIMED_SMOKE_MAX_ATTEMPTS
);

const proofRoutes = [
  {
    path: "/documentation-before-authorization",
    expectedContent: "Find documentation gaps before an authorization packet reaches payer review."
  },
  {
    path: "/demos/prior-authorization-support",
    expectedContent: "PayerIQ Documentation Readiness Demo"
  },
  {
    path: "/demos",
    expectedContent: "Watch no-PHI healthcare AI demos"
  },
  {
    path: "/atlas",
    expectedContent: "A continuously validated healthcare intelligence operating system."
  },
  {
    path: "/trust-os",
    expectedContent: "TrustOS governs every agent request"
  },
  {
    path: "/quality",
    expectedContent: "SCRIMED keeps execution moving"
  },
  {
    path: "/pilot-demo-commercial-readiness",
    expectedContent: "SCRIMED maps the right demo to the right pilot package."
  },
  {
    path: "/pilots",
    expectedContent: "Move from workflow pain to a decision-grade SCRIMED pilot."
  },
  {
    path: "/pricing",
    expectedContent: "Start with inspectable proof. Expand only when the value and governance case hold."
  }
];

const requiredSafetyHeaders = {
  "x-scrimed-clinical-care-authority": "not-authorized-live-care",
  "x-scrimed-phi-authority": "not-authorized-production-phi",
  "x-scrimed-production-connector-authority": "not-production-connector-approved"
};

const forbiddenClaims = [
  "customer deployment confirmed",
  "clinical validation complete",
  "payer submission enabled",
  "ehr writeback enabled",
  "phi processing approved",
  "guaranteed investment return"
];

function evaluateProofRoute({ route, status, finalUrl, headers, html }) {
  const failures = [];
  const normalizedHtml = html.toLowerCase();

  if (status !== 200) {
    failures.push(`expected HTTP 200 but received ${status}`);
  }

  if (new URL(finalUrl).origin !== baseUrl.origin) {
    failures.push(`redirected outside ${baseUrl.origin}`);
  }

  if (!normalizedHtml.includes(route.expectedContent.toLowerCase())) {
    failures.push(`missing expected content: ${route.expectedContent}`);
  }

  if (normalizedHtml.includes("__next_error__")) {
    failures.push("rendered a Next.js error marker");
  }

  for (const [header, expected] of Object.entries(requiredSafetyHeaders)) {
    const actual = headers.get(header);
    if (actual !== expected) {
      failures.push(`expected ${header}=${expected} but received ${actual ?? "missing"}`);
    }
  }

  for (const forbidden of forbiddenClaims) {
    if (normalizedHtml.includes(forbidden)) {
      failures.push(`contains prohibited claim: ${forbidden}`);
    }
  }

  return {
    path: route.path,
    status,
    passed: failures.length === 0,
    failures
  };
}

async function fetchProofRoute(route) {
  const url = new URL(route.path, baseUrl);

  try {
    const response = await boundedPublicFetch(
      url,
      {
        redirect: "follow",
        headers: { "user-agent": "SCRIMED-Investor-Demo-Proof-Route-Smoke/1.0" }
      },
      {
        timeoutMs: requestTimeoutMs,
        maxAttempts: maxReadAttempts
      }
    );
    const html = await readBoundedResponseText(response, maxResponseBytes, {
      timeoutMs: requestTimeoutMs
    });

    return evaluateProofRoute({
      route,
      status: response.status,
      finalUrl: response.url,
      headers: response.headers,
      html
    });
  } catch (error) {
    const responseTooLarge =
      error instanceof Error && error.message.includes("maximum");

    return {
      path: route.path,
      status: 0,
      passed: false,
      failures: [
        error instanceof Error && error.name === "TimeoutError"
          ? "request timed out"
          : responseTooLarge
            ? "response exceeded safe size limit"
            : "request unavailable"
      ]
    };
  }
}

function runSelfTest() {
  const route = proofRoutes[0];
  const safeHeaders = new Headers(requiredSafetyHeaders);
  const safe = evaluateProofRoute({
    route,
    status: 200,
    finalUrl: new URL(route.path, baseUrl).toString(),
    headers: safeHeaders,
    html: `<main>${route.expectedContent}</main>`
  });
  const unsafe = evaluateProofRoute({
    route,
    status: 200,
    finalUrl: "https://unexpected.example/redirect",
    headers: new Headers(),
    html: `<main>${route.expectedContent} Payer submission enabled.</main>`
  });

  assert.equal(safe.passed, true);
  assert.deepEqual(safe.failures, []);
  assert.equal(unsafe.passed, false);
  assert.ok(unsafe.failures.length >= 5);
  console.log("pass investor demo proof-route smoke policy self-test");
}

if (args.has("--self-test")) {
  runSelfTest();
  process.exit(0);
}

const results = [];
for (const route of proofRoutes) {
  results.push(await fetchProofRoute(route));
}

const report = {
  service: "scrimed-investor-demo-proof-route-smoke",
  targetOrigin: baseUrl.origin,
  checkedAt: new Date().toISOString(),
  routeCount: results.length,
  passedRouteCount: results.filter((result) => result.passed).length,
  allPass: results.every((result) => result.passed),
  results,
  rawPageStored: false,
  credentialsUsed: false,
  mutationPerformed: false,
  externalDistributionAuthorized: false,
  boundary:
    "This read-only smoke verifies public investor-demo proof routes and fail-closed headers. It does not authorize investment solicitation, artifact distribution, production deployment, PHI, clinical execution, payer submission, EHR writeback, or customer activation."
};

if (args.has("--json")) {
  console.log(JSON.stringify(report, null, 2));
} else {
  for (const result of results) {
    console.log(
      `${result.passed ? "pass" : "fail"} ${result.path}: ${result.status}${
        result.failures.length > 0 ? ` (${result.failures.join("; ")})` : ""
      }`
    );
  }
  console.log(
    `${report.allPass ? "pass" : "blocked"} investor demo proof routes: ${report.passedRouteCount}/${report.routeCount}`
  );
  console.log(report.boundary);
}

if (!report.allPass) {
  process.exitCode = 1;
}
