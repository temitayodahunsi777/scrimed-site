#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { writeP34BuildInventories } from "./generate-p34-build-inventory.mjs";

const rawArgs = process.argv.slice(2);
const updateBaseline = rawArgs.includes("--update-baseline");
const unknownArgs = rawArgs.filter((arg) => arg !== "--update-baseline");
if (unknownArgs.length > 0) {
  throw new Error(`Unsupported p.34 inventory build option: ${unknownArgs.join(", ")}`);
}

const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build", "--webpack"], {
  encoding: "utf8",
  shell: false,
  maxBuffer: 64 * 1024 * 1024,
  env: process.env
});

if (result.stdout) process.stdout.write(result.stdout);
if (result.stderr) process.stderr.write(result.stderr);
if (result.error) throw result.error;
if (result.status !== 0) process.exit(result.status ?? 1);

await writeP34BuildInventories({
  buildOutput: `${result.stdout ?? ""}\n${result.stderr ?? ""}`,
  check: !updateBaseline,
  update: updateBaseline
});
console.log(updateBaseline
  ? "updated the committed p.34 route/render baseline from an intentional production build"
  : "pass Next.js build against the committed p.34 route/render baseline");
