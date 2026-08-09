# Wix Remote Verification Runbook

Run from a network-enabled operator environment after publication or as the candidate freshness
check:

```bash
npm run test:wix-production-verifier
npm run verify:wix-production -- --json > wix-publication-verification.json
```

The command delegates to the existing hardened Wix policy verifier. It accepts only the governed
canonical domain, follows bounded redirects, limits response bytes/concurrency, checks direct
live evidence freshness, and does not submit forms or mutate Wix.

Success requires all governed routes, metadata, JSON-LD, canonical redirects, crawler files,
retired store routes, noindexed booking system routes, Atlas-first language, FaithCore
separation, synthetic/no-PHI disclosures, and prohibited-claim scans to pass. Record command,
exit code, timestamp, public IP/runner identity, output digest, and screenshots. Do not store
credentials or Wix private identifiers.
