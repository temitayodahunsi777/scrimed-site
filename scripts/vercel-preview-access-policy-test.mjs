#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  applyVercelPreviewAccessToEnvironment,
  bindVercelPreviewAccessCookie,
  obtainVercelPreviewAccessCookie,
  parseVercelPreviewAccessCookie,
  parseVercelPreviewShareUrl,
  resolveVercelPreviewAccess
} from "./lib/vercel-preview-access.mjs";

const origin = "https://scrimed-p34-preview.vercel.app";
const shareToken = "syntheticShareToken123456789";
const jwt = "synthetic.jwt.signature_123456789";
const shareUrl = `${origin}/?_vercel_share=${shareToken}`;

assert.equal(parseVercelPreviewShareUrl(shareUrl, origin), shareUrl);
assert.equal(parseVercelPreviewShareUrl(undefined, origin), null);
assert.throws(() => parseVercelPreviewShareUrl(`${shareUrl}&extra=true`, origin));
assert.throws(() => parseVercelPreviewShareUrl(shareUrl, "https://other-preview.vercel.app"));
assert.deepEqual(parseVercelPreviewAccessCookie(`_vercel_jwt=${jwt}`), {
  name: "_vercel_jwt",
  value: jwt,
  header: `_vercel_jwt=${jwt}`
});
assert.throws(() => parseVercelPreviewAccessCookie(`_vercel_jwt=${jwt}; Path=/`));
assert.throws(() => parseVercelPreviewAccessCookie("session=not-allowed"));
assert.deepEqual(bindVercelPreviewAccessCookie({
  cookie: `_vercel_jwt=${jwt}`,
  accessOrigin: origin,
  requestOrigin: origin
}), {
  name: "_vercel_jwt",
  value: jwt,
  header: `_vercel_jwt=${jwt}`,
  origin
});
assert.throws(() => bindVercelPreviewAccessCookie({
  cookie: `_vercel_jwt=${jwt}`,
  accessOrigin: undefined,
  requestOrigin: origin
}));
assert.throws(() => bindVercelPreviewAccessCookie({
  cookie: `_vercel_jwt=${jwt}`,
  accessOrigin: origin,
  requestOrigin: "https://attacker.example"
}));
assert.throws(() => bindVercelPreviewAccessCookie({
  cookie: `_vercel_jwt=${jwt}`,
  accessOrigin: origin,
  requestOrigin: "http://127.0.0.1:3044"
}));
assert.equal(bindVercelPreviewAccessCookie({
  cookie: undefined,
  accessOrigin: undefined,
  requestOrigin: "http://127.0.0.1:3044"
}), null);

const inheritedAccess = await resolveVercelPreviewAccess({
  inheritedCookie: `_vercel_jwt=${jwt}`,
  inheritedAccessOrigin: origin,
  expectedOrigin: origin
});
assert.deepEqual(inheritedAccess, {
  cookie: `_vercel_jwt=${jwt}`,
  origin,
  source: "inherited-bound-cookie"
});
await assert.rejects(resolveVercelPreviewAccess({
  inheritedCookie: `_vercel_jwt=${jwt}`,
  inheritedAccessOrigin: "https://other-preview.vercel.app",
  expectedOrigin: origin
}), /does not match/);
await assert.rejects(resolveVercelPreviewAccess({
  shareUrl,
  inheritedCookie: `_vercel_jwt=${jwt}`,
  inheritedAccessOrigin: origin,
  expectedOrigin: origin
}), /either a share URL or a bound inherited cookie/);
assert.deepEqual(applyVercelPreviewAccessToEnvironment({
  SCRIMED_PREVIEW_ACCESS_COOKIE: "stale-cookie",
  SCRIMED_PREVIEW_ACCESS_ORIGIN: "https://stale-preview.vercel.app",
  SCRIMED_VERCEL_SHARE_URL: "redacted-share-url",
  SAFE_MARKER: "preserved"
}, inheritedAccess), {
  SCRIMED_PREVIEW_ACCESS_COOKIE: `_vercel_jwt=${jwt}`,
  SCRIMED_PREVIEW_ACCESS_ORIGIN: origin,
  SAFE_MARKER: "preserved"
});
assert.deepEqual(applyVercelPreviewAccessToEnvironment({
  SCRIMED_PREVIEW_ACCESS_COOKIE: "stale-cookie",
  SCRIMED_PREVIEW_ACCESS_ORIGIN: "https://stale-preview.vercel.app",
  SCRIMED_VERCEL_SHARE_URL: "redacted-share-url",
  SAFE_MARKER: "preserved"
}, null), { SAFE_MARKER: "preserved" });

const cookie = await obtainVercelPreviewAccessCookie({
  shareUrl,
  expectedOrigin: origin,
  fetchImplementation: async (input, init) => {
    assert.equal(input, shareUrl);
    assert.equal(init.redirect, "manual");
    return new Response(null, {
      status: 307,
      headers: { "set-cookie": `_vercel_jwt=${jwt}; Secure; HttpOnly; SameSite=Lax` }
    });
  }
});
assert.equal(cookie, `_vercel_jwt=${jwt}`);

await assert.rejects(
  obtainVercelPreviewAccessCookie({
    shareUrl,
    expectedOrigin: origin,
    fetchImplementation: async () => new Response(null, { status: 307 })
  }),
  /did not issue an access cookie/
);

console.log("pass SCRIMED protected Vercel preview access policy");
