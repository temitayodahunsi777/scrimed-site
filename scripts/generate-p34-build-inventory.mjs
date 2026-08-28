#!/usr/bin/env node

import { access, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  p34GenerationInventoryPath,
  p34RouteInventoryPath,
  sha256
} from "./lib/p34-candidate-state.mjs";

const rawArgs = process.argv.slice(2);
const checkOnly = rawArgs.includes("--check");
const selfTest = rawArgs.includes("--self-test");
const allowedArgs = new Set(["--check", "--self-test"]);
const unknownArgs = rawArgs.filter((arg) => !allowedArgs.has(arg));
if (unknownArgs.length > 0) throw new Error(`Unsupported p.34 build-inventory option: ${unknownArgs.join(", ")}`);

function stripAnsi(value) {
  return value.replace(/\u001b\[[0-9;]*m/g, "");
}

export function parseGenerationWorkUnits(buildOutput) {
  const output = stripAnsi(buildOutput);
  const patterns = [
    /Generating static pages[^\n]*\((\d+)\/(\d+)\)/gi,
    /Generating static pages[^\n]*?(\d+)\s*\/\s*(\d+)/gi
  ];
  const matches = [];
  for (const pattern of patterns) {
    for (const match of output.matchAll(pattern)) {
      matches.push({ completed: Number(match[1]), total: Number(match[2]) });
    }
  }
  return matches
    .filter(({ completed, total }) => Number.isInteger(completed) && Number.isInteger(total) && total > 0 && completed >= 0 && completed <= total)
    .sort((left, right) => right.total - left.total || right.completed - left.completed)[0] ?? null;
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

export async function buildP34BuildInventories({ buildOutput = "" } = {}) {
  for (const path of [".next/app-path-routes-manifest.json", ".next/prerender-manifest.json", ".next/BUILD_ID"]) {
    if (!await exists(path)) throw new Error(`p.34 build inventory requires ${path}; run the production build first.`);
  }
  const appRoutes = await readJson(".next/app-path-routes-manifest.json");
  const prerender = await readJson(".next/prerender-manifest.json");
  const buildId = (await readFile(".next/BUILD_ID", "utf8")).trim();
  const routes = Object.entries(appRoutes)
    .map(([route, outputPath]) => ({ route, outputPath }))
    .sort((left, right) => left.route.localeCompare(right.route));
  const prerenderedRoutes = Object.keys(prerender.routes ?? {}).sort();
  const dynamicRoutes = Object.keys(prerender.dynamicRoutes ?? {}).sort();
  const routePayload = {
    schemaVersion: "scrimed-p34-route-inventory-v1",
    source: ".next/app-path-routes-manifest.json",
    builtRouteCount: routes.length,
    routes,
    manualExpectedCount: null,
    status: "GENERATED_FROM_NEXT_BUILD"
  };
  const generationWork = parseGenerationWorkUnits(buildOutput);
  const generationPayload = {
    schemaVersion: "scrimed-p34-generation-inventory-v1",
    source: ".next/prerender-manifest.json",
    prerenderedRouteCount: prerenderedRoutes.length,
    dynamicPrerenderRouteCount: dynamicRoutes.length,
    generationWorkUnits: generationWork?.total ?? null,
    generationWorkUnitsCompleted: generationWork?.completed ?? null,
    generationWorkUnitsSource: generationWork ? "next-build-output" : "NOT_CAPTURED_REBUILD_REQUIRED",
    prerenderedRoutes,
    dynamicRoutes,
    status: generationWork ? "GENERATED_FROM_NEXT_BUILD" : "PARTIAL_BUILD_EVIDENCE"
  };
  return {
    routeInventory: { ...routePayload, inventoryFingerprint: sha256(routePayload) },
    generationInventory: { ...generationPayload, inventoryFingerprint: sha256(generationPayload) },
    buildId
  };
}

export async function writeP34BuildInventories({ buildOutput = "", check = false } = {}) {
  const generated = await buildP34BuildInventories({ buildOutput });
  let result = generated;
  const outputs = [
    [p34RouteInventoryPath, `${JSON.stringify(generated.routeInventory, null, 2)}\n`],
    [p34GenerationInventoryPath, `${JSON.stringify(generated.generationInventory, null, 2)}\n`]
  ];
  if (check) {
    const currentRoute = await readJson(p34RouteInventoryPath);
    const currentGeneration = await readJson(p34GenerationInventoryPath);
    if (JSON.stringify(currentRoute) !== JSON.stringify(generated.routeInventory)) {
      throw new Error(`${p34RouteInventoryPath} is stale; run the p.34 inventory-enabled build.`);
    }
    if (
      currentGeneration.prerenderedRouteCount !== generated.generationInventory.prerenderedRouteCount
      || JSON.stringify(currentGeneration.prerenderedRoutes) !== JSON.stringify(generated.generationInventory.prerenderedRoutes)
      || !Number.isInteger(currentGeneration.generationWorkUnits)
      || currentGeneration.generationWorkUnits < currentGeneration.prerenderedRouteCount
      || currentGeneration.generationWorkUnitsCompleted !== currentGeneration.generationWorkUnits
      || currentGeneration.status !== "GENERATED_FROM_NEXT_BUILD"
    ) {
      throw new Error(`${p34GenerationInventoryPath} is stale or incomplete; run the p.34 inventory-enabled build.`);
    }
    const { inventoryFingerprint: routeFingerprint, ...routePayload } = currentRoute;
    const { inventoryFingerprint: generationFingerprint, ...generationPayload } = currentGeneration;
    if (routeFingerprint !== sha256(routePayload) || generationFingerprint !== sha256(generationPayload)) {
      throw new Error("p.34 build inventory fingerprint verification failed.");
    }
    result = { routeInventory: currentRoute, generationInventory: currentGeneration, buildId: generated.buildId };
  } else {
    for (const [path, content] of outputs) await writeFile(path, content, "utf8");
  }
  return result;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (selfTest) {
    const parsed = parseGenerationWorkUnits(
      "Generating static pages using 11 workers (0/462)\n" +
      "Generating static pages using 11 workers (230/462)\n" +
      "Generating static pages using 11 workers (462/462)"
    );
    if (parsed?.total !== 462 || parsed.completed !== 462) throw new Error("p.34 generation parser self-test failed.");
    console.log("pass p.34 build inventory parser self-test");
  } else {
    const generated = await writeP34BuildInventories({ check: checkOnly });
    console.log(`${checkOnly ? "pass" : "generated"} p.34 build inventory (${generated.routeInventory.builtRouteCount} built routes, ${generated.generationInventory.prerenderedRouteCount} prerendered routes, ${generated.generationInventory.generationWorkUnits ?? "uncaptured"} generation work units)`);
  }
}
