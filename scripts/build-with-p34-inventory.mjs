#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { writeP34BuildInventories } from "./generate-p34-build-inventory.mjs";

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

await writeP34BuildInventories({ buildOutput: `${result.stdout ?? ""}\n${result.stderr ?? ""}` });
console.log("pass Next.js build and p.34 route/generation inventory capture");
