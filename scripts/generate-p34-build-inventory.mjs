#!/usr/bin/env node

import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import {
  p34LegacyGenerationInventoryPath,
  p34LegacyRouteInventoryPath,
  p34GenerationInventoryPath,
  p34RouteInventoryPath,
  sha256
} from "./lib/p34-candidate-state.mjs";

const rawArgs = process.argv.slice(2);
const checkOnly = rawArgs.includes("--check");
const selfTest = rawArgs.includes("--self-test");
const updateBaseline = rawArgs.includes("--update-baseline");
const bootstrapFromLegacy = rawArgs.includes("--bootstrap-from-legacy");
const allowedArgs = new Set(["--check", "--self-test", "--update-baseline", "--bootstrap-from-legacy"]);
const unknownArgs = rawArgs.filter((arg) => !allowedArgs.has(arg));
if (unknownArgs.length > 0) throw new Error(`Unsupported p.34 build-inventory option: ${unknownArgs.join(", ")}`);
if ([checkOnly, selfTest, updateBaseline, bootstrapFromLegacy].filter(Boolean).length > 1) {
  throw new Error("Choose exactly one p.34 build-inventory operation.");
}

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

function verifyInventoryFingerprint(inventory, label) {
  const { inventoryFingerprint, ...payload } = inventory;
  if (inventoryFingerprint !== sha256(payload)) {
    throw new Error(`${label} fingerprint verification failed.`);
  }
}

export function assertP34BuildInventoryBaseline(generated, routeBaseline, renderBaseline) {
  verifyInventoryFingerprint(routeBaseline, "p.34 route baseline");
  verifyInventoryFingerprint(renderBaseline, "p.34 render baseline");
  const failures = [];
  if (
    routeBaseline.schemaVersion !== generated.routeInventory.schemaVersion
    || routeBaseline.builtRouteCount !== generated.routeInventory.builtRouteCount
    || JSON.stringify(routeBaseline.routes) !== JSON.stringify(generated.routeInventory.routes)
  ) failures.push("ROUTE_BASELINE_DRIFT");
  if (
    renderBaseline.schemaVersion !== generated.generationInventory.schemaVersion
    || renderBaseline.prerenderedRouteCount !== generated.generationInventory.prerenderedRouteCount
    || renderBaseline.dynamicPrerenderRouteCount !== generated.generationInventory.dynamicPrerenderRouteCount
    || JSON.stringify(renderBaseline.prerenderedRoutes) !== JSON.stringify(generated.generationInventory.prerenderedRoutes)
    || JSON.stringify(renderBaseline.dynamicRoutes) !== JSON.stringify(generated.generationInventory.dynamicRoutes)
  ) failures.push("RENDER_BASELINE_DRIFT");
  if (
    !Number.isInteger(renderBaseline.generationWorkUnits)
    || renderBaseline.generationWorkUnits < renderBaseline.prerenderedRouteCount
    || renderBaseline.generationWorkUnitsCompleted !== renderBaseline.generationWorkUnits
    || renderBaseline.status !== "GENERATED_FROM_NEXT_BUILD"
  ) failures.push("GENERATION_BASELINE_INCOMPLETE");
  if (
    generated.generationInventory.generationWorkUnits !== null
    && (
      generated.generationInventory.generationWorkUnits !== renderBaseline.generationWorkUnits
      || generated.generationInventory.generationWorkUnitsCompleted !== renderBaseline.generationWorkUnitsCompleted
    )
  ) failures.push("GENERATION_WORK_UNIT_DRIFT");
  if (failures.length > 0) {
    throw new Error(
      `p.34 build differs from the independent committed baseline: ${failures.join(", ")}. ` +
      "Review the route delta, then run the explicit baseline-update command only for an intentional change."
    );
  }
  return { routeInventory: routeBaseline, generationInventory: renderBaseline, buildId: generated.buildId };
}

export async function writeP34BuildInventories({
  buildOutput = "",
  check = false,
  update = false,
  bootstrap = false
} = {}) {
  if (bootstrap) {
    const legacyRoute = await readJson(p34LegacyRouteInventoryPath);
    const legacyRender = await readJson(p34LegacyGenerationInventoryPath);
    verifyInventoryFingerprint(legacyRoute, "legacy p.34 route baseline");
    verifyInventoryFingerprint(legacyRender, "legacy p.34 render baseline");
    await mkdir("artifacts/build", { recursive: true });
    await writeFile(p34RouteInventoryPath, `${JSON.stringify(legacyRoute, null, 2)}\n`, "utf8");
    await writeFile(p34GenerationInventoryPath, `${JSON.stringify(legacyRender, null, 2)}\n`, "utf8");
    return { routeInventory: legacyRoute, generationInventory: legacyRender, buildId: null };
  }
  const generated = await buildP34BuildInventories({ buildOutput });
  const outputs = [
    [p34RouteInventoryPath, `${JSON.stringify(generated.routeInventory, null, 2)}\n`],
    [p34GenerationInventoryPath, `${JSON.stringify(generated.generationInventory, null, 2)}\n`]
  ];
  if (update) {
    if (
      generated.generationInventory.status !== "GENERATED_FROM_NEXT_BUILD"
      || !Number.isInteger(generated.generationInventory.generationWorkUnits)
      || generated.generationInventory.generationWorkUnitsCompleted !== generated.generationInventory.generationWorkUnits
    ) {
      throw new Error(
        "An intentional p.34 baseline update requires complete generation output from the inventory-enabled production build."
      );
    }
    await mkdir("artifacts/build", { recursive: true });
    for (const [path, content] of outputs) await writeFile(path, content, "utf8");
    return generated;
  }
  if (!check) throw new Error("Build inventory is read-only by default; use --check or the explicit baseline-update command.");
  const currentRoute = await readJson(p34RouteInventoryPath);
  const currentRender = await readJson(p34GenerationInventoryPath);
  return assertP34BuildInventoryBaseline(generated, currentRoute, currentRender);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
  if (selfTest) {
    const parsed = parseGenerationWorkUnits(
      "Generating static pages using 3 workers (0/37)\n" +
      "Generating static pages using 3 workers (19/37)\n" +
      "Generating static pages using 3 workers (37/37)"
    );
    if (parsed?.total !== 37 || parsed.completed !== 37) throw new Error("p.34 generation parser self-test failed.");
    const routePayload = {
      schemaVersion: "scrimed-p34-route-inventory-v1",
      source: "synthetic",
      builtRouteCount: 2,
      routes: [{ route: "/a/page", outputPath: "/a" }, { route: "/b/page", outputPath: "/b" }],
      manualExpectedCount: null,
      status: "GENERATED_FROM_NEXT_BUILD"
    };
    const renderPayload = {
      schemaVersion: "scrimed-p34-generation-inventory-v1",
      source: "synthetic",
      prerenderedRouteCount: 1,
      dynamicPrerenderRouteCount: 0,
      generationWorkUnits: 3,
      generationWorkUnitsCompleted: 3,
      generationWorkUnitsSource: "next-build-output",
      prerenderedRoutes: ["/a"],
      dynamicRoutes: [],
      status: "GENERATED_FROM_NEXT_BUILD"
    };
    const synthetic = {
      routeInventory: { ...routePayload, inventoryFingerprint: sha256(routePayload) },
      generationInventory: { ...renderPayload, inventoryFingerprint: sha256(renderPayload) },
      buildId: "synthetic"
    };
    assertP34BuildInventoryBaseline(synthetic, synthetic.routeInventory, synthetic.generationInventory);
    let driftRejected = false;
    try {
      assertP34BuildInventoryBaseline(
        { ...synthetic, routeInventory: { ...synthetic.routeInventory, routes: synthetic.routeInventory.routes.slice(0, 1), builtRouteCount: 1 } },
        synthetic.routeInventory,
        synthetic.generationInventory
      );
    } catch {
      driftRejected = true;
    }
    if (!driftRejected) throw new Error("p.34 independent route baseline failed to reject drift.");
    console.log("pass p.34 build inventory parser and independent-baseline self-test");
  } else {
    const generated = await writeP34BuildInventories({
      check: checkOnly || (!updateBaseline && !bootstrapFromLegacy),
      update: updateBaseline,
      bootstrap: bootstrapFromLegacy
    });
    const verb = updateBaseline ? "updated" : bootstrapFromLegacy ? "bootstrapped" : "verified";
    console.log(`${verb} p.34 build inventory baseline (${generated.routeInventory.builtRouteCount} built routes, ${generated.generationInventory.prerenderedRouteCount} prerendered routes, ${generated.generationInventory.generationWorkUnits ?? "baseline-preserved"} generation work units)`);
  }
}
