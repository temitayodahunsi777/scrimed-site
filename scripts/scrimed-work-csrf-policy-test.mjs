#!/usr/bin/env node

import assert from "node:assert/strict";

import {
  evaluateScrimedWorkWriteRequestProvenance,
  scrimedWorkCsrfPolicyVersion,
  scrimedWorkOperatorSmokeContext,
  scrimedWorkRequestContextHeader
} from "../app/lib/scrimed-work/csrfProtection.ts";

const targetUrl = "https://app.scrimedsolutions.com/api/scrimed-work/sessions";

function request(headers = {}, url = targetUrl) {
  return new Request(url, { headers, method: "POST" });
}

const sameOriginBrowser = evaluateScrimedWorkWriteRequestProvenance(
  request({
    origin: "https://app.scrimedsolutions.com",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  })
);
assert.equal(sameOriginBrowser.allowed, true);
assert.equal(sameOriginBrowser.provenance, "same-origin-browser");
assert.equal(sameOriginBrowser.policyVersion, scrimedWorkCsrfPolicyVersion);

const minimalSameOriginBrowser = evaluateScrimedWorkWriteRequestProvenance(
  request({ origin: "https://app.scrimedsolutions.com" })
);
assert.equal(minimalSameOriginBrowser.allowed, true);

const crossOrigin = evaluateScrimedWorkWriteRequestProvenance(
  request({
    origin: "https://attacker.example",
    [scrimedWorkRequestContextHeader]: scrimedWorkOperatorSmokeContext
  })
);
assert.equal(crossOrigin.allowed, false);
assert.equal(crossOrigin.reason, "cross-origin-browser-request");

const siblingOrigin = evaluateScrimedWorkWriteRequestProvenance(
  request({
    origin: "https://www.scrimedsolutions.com",
    "sec-fetch-site": "same-site"
  })
);
assert.equal(siblingOrigin.allowed, false);
assert.equal(siblingOrigin.reason, "cross-origin-browser-request");

for (const origin of ["null", "not-an-origin", "https://app.scrimedsolutions.com/path"]) {
  const result = evaluateScrimedWorkWriteRequestProvenance(request({ origin }));
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "invalid-origin-header");
}

const missingBrowserOrigin = evaluateScrimedWorkWriteRequestProvenance(
  request({
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin"
  })
);
assert.equal(missingBrowserOrigin.allowed, false);
assert.equal(missingBrowserOrigin.reason, "browser-origin-header-required");

for (const headers of [
  {
    origin: "https://app.scrimedsolutions.com",
    "sec-fetch-site": "cross-site"
  },
  {
    origin: "https://app.scrimedsolutions.com",
    "sec-fetch-mode": "navigate"
  },
  {
    origin: "https://app.scrimedsolutions.com",
    "sec-fetch-dest": "document"
  }
]) {
  const result = evaluateScrimedWorkWriteRequestProvenance(request(headers));
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "unsafe-browser-fetch-metadata");
}

const nonBrowserSmoke = evaluateScrimedWorkWriteRequestProvenance(
  request({ [scrimedWorkRequestContextHeader]: scrimedWorkOperatorSmokeContext })
);
assert.equal(nonBrowserSmoke.allowed, true);
assert.equal(nonBrowserSmoke.provenance, "non-browser-operator-smoke");

for (const headers of [
  {},
  { [scrimedWorkRequestContextHeader]: "browser" },
  { [scrimedWorkRequestContextHeader]: "operator-smoke-v2" }
]) {
  const result = evaluateScrimedWorkWriteRequestProvenance(request(headers));
  assert.equal(result.allowed, false);
  assert.equal(result.reason, "non-browser-request-context-required");
}

console.log(
  "pass SCRIMED Work CSRF policy (same-origin browser and explicit CLI allowed; cross-origin, malformed, navigational, and ambiguous requests denied)"
);
