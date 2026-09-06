#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { readFile } from "node:fs/promises";

const require = createRequire(import.meta.url);
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const expected = {
  version: "1.12.2",
  resolved: "https://registry.npmjs.org/unrs-resolver/-/unrs-resolver-1.12.2.tgz",
  integrity: "sha512-dmlRxBJJayXjqTwC+JtF1HhJmgf3ftQ3YejFcZrf4+KKtJv0qDsK1pjqaaVjG7wJ5NJ6UVP1OqRMQ71Z4C3rxQ=="
};
const metadata = lock.packages?.["node_modules/unrs-resolver"];
assert.ok(metadata, "unrs-resolver must exist in the exact lockfile.");
assert.equal(metadata.version, expected.version);
assert.equal(metadata.resolved, expected.resolved);
assert.equal(metadata.integrity, expected.integrity);
assert.equal(metadata.dev, true, "unrs-resolver must remain development-only.");
assert.equal(metadata.hasInstallScript, true, "Review assumptions changed: expected a declared install script.");

const parent = lock.packages?.["node_modules/eslint-config-next/node_modules/eslint-import-resolver-typescript"];
assert.ok(parent?.dependencies?.["unrs-resolver"], "Expected reviewed transitive dependency path.");

const targetByPlatform = {
  "linux:x64": "@unrs/resolver-binding-linux-x64-gnu",
  "linux:arm64": "@unrs/resolver-binding-linux-arm64-gnu",
  "darwin:x64": "@unrs/resolver-binding-darwin-x64",
  "darwin:arm64": "@unrs/resolver-binding-darwin-arm64",
  "win32:x64": "@unrs/resolver-binding-win32-x64-msvc",
  "win32:arm64": "@unrs/resolver-binding-win32-arm64-msvc"
};
const binding = targetByPlatform[`${process.platform}:${process.arch}`];
assert.ok(binding, `No reviewed native-binding mapping for ${process.platform}:${process.arch}.`);
const bindingMetadata = lock.packages?.[`node_modules/${binding}`];
assert.equal(bindingMetadata?.version, expected.version, `${binding} must be pinned to ${expected.version}.`);
assert.ok(bindingMetadata?.integrity, `${binding} must have lockfile integrity.`);

const bindingEntry = require.resolve(binding);
assert.ok(bindingEntry, "The pinned platform binding must be installed without lifecycle scripts.");
const resolver = require("unrs-resolver");
assert.ok(resolver && Object.keys(resolver).length > 0, "unrs-resolver must load its pinned native binding.");

console.log(`pass lifecycle-script-free unrs-resolver proof (${binding}, ${bindingEntry})`);
