#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  boundedPublicFetch,
  defaultPublicSmokeMaxAttempts,
  defaultPublicSmokeMaxResponseBytes,
  defaultPublicSmokeTimeoutMs,
  normalizePublicSmokeBaseUrl,
  parsePublicSmokeMaxAttempts,
  parsePublicSmokeMaxResponseBytes,
  parsePublicSmokeTimeoutMs,
  readBoundedResponseText
} from "./lib/bounded-public-fetch.mjs";

assert.equal(
  normalizePublicSmokeBaseUrl("https://app.scrimedsolutions.com/"),
  "https://app.scrimedsolutions.com"
);
assert.equal(
  normalizePublicSmokeBaseUrl("http://127.0.0.1:3044"),
  "http://127.0.0.1:3044"
);

for (const unsafeUrl of [
  "ftp://app.scrimedsolutions.com",
  "https://user:password@app.scrimedsolutions.com",
  "https://app.scrimedsolutions.com/private",
  "https://app.scrimedsolutions.com?token=unsafe",
  "https://app.scrimedsolutions.com#fragment"
]) {
  assert.throws(() => normalizePublicSmokeBaseUrl(unsafeUrl));
}

assert.equal(parsePublicSmokeTimeoutMs(), defaultPublicSmokeTimeoutMs);
assert.equal(parsePublicSmokeTimeoutMs("45000"), 45_000);
assert.throws(() => parsePublicSmokeTimeoutMs("999"));
assert.throws(() => parsePublicSmokeTimeoutMs("120001"));
assert.throws(() => parsePublicSmokeTimeoutMs("not-a-number"));

assert.equal(
  parsePublicSmokeMaxResponseBytes(),
  defaultPublicSmokeMaxResponseBytes
);
assert.equal(parsePublicSmokeMaxResponseBytes("4096"), 4_096);
assert.throws(() => parsePublicSmokeMaxResponseBytes("1023"));
assert.throws(() => parsePublicSmokeMaxResponseBytes("20000001"));

assert.equal(parsePublicSmokeMaxAttempts(), defaultPublicSmokeMaxAttempts);
assert.equal(parsePublicSmokeMaxAttempts("3"), 3);
assert.throws(() => parsePublicSmokeMaxAttempts("0"));
assert.throws(() => parsePublicSmokeMaxAttempts("4"));

let receivedSignal;
const successfulResponse = await boundedPublicFetch(
  "https://app.scrimedsolutions.com",
  {},
  {
    timeoutMs: 50,
    fetchImplementation: async (_input, init) => {
      receivedSignal = init.signal;
      return new Response("safe", { status: 200 });
    }
  }
);
assert.equal(successfulResponse.status, 200);
assert.equal(receivedSignal.aborted, false);

let retryAttempts = 0;
const retriedResponse = await boundedPublicFetch(
  "https://app.scrimedsolutions.com",
  {},
  {
    maxAttempts: 2,
    retryDelayMs: 0,
    fetchImplementation: async () => {
      retryAttempts += 1;
      if (retryAttempts === 1) {
        throw new TypeError("synthetic network interruption");
      }
      return new Response("recovered", { status: 200 });
    }
  }
);
assert.equal(retriedResponse.status, 200);
assert.equal(retryAttempts, 2);

let exhaustedAttempts = 0;
await assert.rejects(
  boundedPublicFetch(
    "https://app.scrimedsolutions.com",
    {},
    {
      maxAttempts: 2,
      retryDelayMs: 0,
      fetchImplementation: async () => {
        exhaustedAttempts += 1;
        throw new TypeError("synthetic persistent interruption");
      }
    }
  ),
  /synthetic persistent interruption/
);
assert.equal(exhaustedAttempts, 2);

await assert.rejects(
  boundedPublicFetch(
    "https://app.scrimedsolutions.com/api/check",
    { method: "POST" },
    { maxAttempts: 2 }
  ),
  /mutation requests must remain single-attempt/
);

await assert.rejects(
  boundedPublicFetch(
    "https://app.scrimedsolutions.com",
    {},
    {
      timeoutMs: 5,
      fetchImplementation: (_input, init) =>
        new Promise((_resolve, reject) => {
          init.signal.addEventListener("abort", () => {
            reject(new DOMException("aborted", "AbortError"));
          });
        })
    }
  ),
  (error) => error instanceof Error && error.name === "TimeoutError"
);

await assert.rejects(
  boundedPublicFetch("https://app.scrimedsolutions.com", {
    signal: new AbortController().signal
  }),
  /must not override the bounded request signal/
);

assert.equal(
  await readBoundedResponseText(new Response("bounded response"), 64),
  "bounded response"
);
await assert.rejects(
  readBoundedResponseText(
    new Response("small", { headers: { "content-length": "128" } }),
    64
  ),
  /declared 128 bytes/
);
await assert.rejects(
  readBoundedResponseText(new Response("response exceeds limit"), 8),
  /contained more than 8 bytes/
);

const stalledStream = new ReadableStream({
  start() {}
});
await assert.rejects(
  readBoundedResponseText(new Response(stalledStream), 64, { timeoutMs: 5 }),
  (error) => error instanceof Error && error.name === "TimeoutError"
);

console.log("pass bounded public fetch policy test");
