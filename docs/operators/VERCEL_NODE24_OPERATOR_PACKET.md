# Vercel Node 24 Operator Packet

## Primary Project

- Project: `scrimed-site`
- Project ID: `prj_94JBnKm2BsZ7qHtEDbUvWmiDWLjn`
- Team ID: `team_cldXjnApj7aQgNlTTUAzxavw`
- Current connected setting: Node.js `22.x`
- Required setting: Node.js `24.x`
- Repository override: `package.json` declares `engines.node = 24.x`
- Dashboard path: Project Settings -> Build and Deployment -> Node.js Version

## Controlled Action

1. Confirm the reviewed branch and exact candidate SHA.
2. Confirm `package.json`, `.nvmrc`, `.node-version`, CI, and Node 24 certification agree.
3. Change only the Node.js Version field from `22.x` to `24.x`.
4. Do not change domains, environment variables, build commands, Git integration, access, or production aliases.
5. Save the setting. A setting change is not deployment authorization.
6. Create only an isolated preview after an exact-SHA preview authorization exists.
7. Verify `/api/build-info` reports `runtime=nodejs`, `nodeMajor=24`, the expected SHA, and a release fingerprint.
8. Verify `/api/readiness` is HTTP 200 in safe synthetic mode and all consequential authority fields remain false.

## Rollback

If the preview fails, restore the project setting to `22.x`, retain the failed deployment and logs as evidence, and use the prior p.33 commit. Never promote the failed preview.

## Current State

Repository override is implemented. Connected read access cannot mutate the project setting, so dashboard reconciliation remains a Vercel project-owner action unless an authenticated non-deploy API command is separately available and approved.
