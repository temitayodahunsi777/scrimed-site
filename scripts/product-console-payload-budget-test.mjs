#!/usr/bin/env node

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

import { getProductConsoleApiSummary } from "../app/lib/productConsole.ts";

const performance = JSON.parse(await readFile("config/performance-budgets.json", "utf8"));
const budgetBytes = performance?.budgets?.productConsoleApiBytes;
assert.equal(Number.isInteger(budgetBytes) && budgetBytes > 0, true, "Product Console API byte budget must be a positive integer.");

const summary = getProductConsoleApiSummary();
const serialized = JSON.stringify(summary);
const payloadBytes = Buffer.byteLength(serialized);
assert.ok(payloadBytes <= budgetBytes, `Product Console API payload ${payloadBytes} exceeds ${budgetBytes} byte budget.`);
assert.equal(summary.payloadProfile, "compact-api-v2");
assert.equal(Array.isArray(summary.priorityGates), true);
assert.equal(summary.priorityGates.length, 10);
assert.deepEqual(
  summary.priorityGates.map((gate) => gate.label),
  [
    "Candidate",
    "Review",
    "Preview",
    "Security",
    "AAL2",
    "Supabase",
    "Migrations",
    "Synthetic Pilot Readiness",
    "Protected Pilot Readiness",
    "Production Authority"
  ]
);
assert.equal(summary.priorityGates.find((gate) => gate.id === "production")?.state, "PRODUCTION_AUTHORIZATION_REQUIRED");
assert.equal(summary.priorityGates.find((gate) => gate.id === "protected-pilot")?.state, "PROTECTED_PILOT_AUTHORIZATION_REQUIRED");

console.log(`pass Product Console compact payload ${payloadBytes}/${budgetBytes} bytes with 10 priority gates`);
