# Live Mobile Verification Runbook

`scripts/verify-live-mobile.mjs` uses a mobile user agent, 390x844 viewport, device scale factor 3,
touch/mobile browser context, DOM width checks, offending-selector capture, and screenshots.

Run in the approved browser CI image with Playwright installed:

```bash
npm run verify:live-mobile
```

When Playwright is installed but its managed browser is unavailable, use an already approved
local Chrome or Chromium binary without downloading another browser:

```bash
SCRIMED_PLAYWRIGHT_EXECUTABLE_PATH="/absolute/path/to/Google Chrome" \
  npm run verify:live-mobile
```

The path must be absolute and its executable name must identify Chrome or Chromium. The override
changes only the browser executable; canonical-origin, mobile-profile, and safety checks remain
unchanged. A host that prevents browser launch returns `BLOCKED_ENVIRONMENT` with reason
`browser-launch-failed`; this is not passing mobile evidence and must be rerun in the approved CI
browser image.

It checks Home, Vitals, FaithCore, About, Partner, Demo, and interim legal pages on the governed
Wix origin only. Output is written to `artifacts/live-mobile/` and contains no form submissions,
credentials, or private data. A document/body width over 391px, missing mobile UA, or non-200
page fails strict mode. Correct the reported selectors in Wix, republish, and rerun. The prior
viewport-only 980px observation remains unresolved until this true-mobile run returns evidence.
