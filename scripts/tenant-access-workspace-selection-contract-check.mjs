#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const [accessSurface, administrationPanel, styles] = await Promise.all([
  readFile("app/pilot-workspace/ProtectedPilotAccess.tsx", "utf8"),
  readFile("app/pilot-workspace/TenantAccessAdministrationPanel.tsx", "utf8"),
  readFile("app/globals.css", "utf8")
]);

function requireIncludes(label, source, expected) {
  const missing = expected.filter((value) => !source.includes(value));

  if (missing.length > 0) {
    throw new Error(`${label} missing required selection safeguard: ${missing.join(", ")}`);
  }
}

requireIncludes("protected pilot workspace", accessSurface, [
  "selectedWorkspaceSlugRef",
  "workspace.slug === selectedWorkspaceSlugRef.current",
  'event === "TOKEN_REFRESHED"',
  "aria-pressed={selectedWorkspace?.id === workspace.id}",
  'role="status" aria-live="polite"',
  "Active workspace",
  "tenant-access-${selectedWorkspace.id}"
]);

requireIncludes("tenant access administration", administrationPanel, [
  "const created = await commitAction(",
  "if (!created)",
  "return false",
  "return true",
  "Active workspace:",
  "Metadata only. Exclude sensitive or clinical details."
]);

if (administrationPanel.includes('placeholder="Metadata only. No PHI or clinical details."')) {
  throw new Error("tenant access administration exposes a placeholder that its governance filter rejects");
}

requireIncludes("workspace selection styles", styles, [
  ".workspace-selector-active",
  ".workspace-active-notice",
  "box-shadow: inset 4px 0 0 var(--green)"
]);

console.log("pass tenant access workspace selection contract");
