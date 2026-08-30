#!/usr/bin/env node

import assert from "node:assert/strict";
import {
  obtainVercelPreviewAccessCookie,
  parseVercelPreviewAccessCookie,
  parseVercelPreviewShareUrl
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

console.log("pass SCRIMED protected Vercel preview access policy (10/10)");
