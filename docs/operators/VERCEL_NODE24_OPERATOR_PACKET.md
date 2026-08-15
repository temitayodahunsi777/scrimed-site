# Vercel Node 24 Operator Packet

## Primary Project

- Project: `scrimed-site`
- Project ID: `prj_94JBnKm2BsZ7qHtEDbUvWmiDWLjn`
- Team ID: `team_cldXjnApj7aQgNlTTUAzxavw`
- Current connected setting: Node.js `24.x` (verified through the connected Vercel project read on 2026-08-14)
- Required setting: Node.js `24.x`
- Repository override: `package.json` declares `engines.node = 24.x`
- Dashboard path: Project Settings -> Build and Deployment -> Node.js Version

## Completed Controlled Action

1. The Vercel project owner changed only the Node.js Version field from `22.x` to `24.x`.
2. Connected readback confirmed project `scrimed-site` reports `nodeVersion: 24.x`.
3. The setting change did not create a deployment; the latest deployment remains the pre-candidate preview.
4. No domains, environment variables, build commands, Git integration, access controls, or production aliases were changed by this action.

## Remaining Controlled Action

1. Obtain an exact-SHA authorization for an isolated preview of the current candidate.
2. Create the preview without production promotion, alias changes, migrations, or protected-data processing.
3. Verify `/api/build-info` reports `runtime=nodejs`, `nodeMajor=24`, the expected SHA, and a release fingerprint.
4. Verify `/api/readiness` is HTTP 200 in safe synthetic mode and all consequential authority fields remain false.

## Rollback

If the preview fails, restore the project setting to `22.x`, retain the failed deployment and logs as evidence, and use the prior p.33 commit. Never promote the failed preview.

## Current State

Repository and Vercel project runtime settings are reconciled at Node.js `24.x`. Preview deployment remains separately authorization-gated, and production promotion remains prohibited.
