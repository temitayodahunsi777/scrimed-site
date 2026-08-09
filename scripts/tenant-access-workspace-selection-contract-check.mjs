#!/usr/bin/env node

import { readFile } from "node:fs/promises";

const [
  accessSurface,
  administrationPanel,
  tenantAccessRoute,
  trustSafetyRoute,
  trustSafetyIncidentRoute,
  trustSafetyReviewPacketRoute,
  protectedStoreError,
  verificationPanel,
  styles
] = await Promise.all([
  readFile("app/pilot-workspace/ProtectedPilotAccess.tsx", "utf8"),
  readFile("app/pilot-workspace/TenantAccessAdministrationPanel.tsx", "utf8"),
  readFile("app/api/pilot-workspaces/[workspaceSlug]/tenant-access/route.ts", "utf8"),
  readFile("app/api/pilot-workspaces/[workspaceSlug]/trust-safety-incidents/route.ts", "utf8"),
  readFile("app/api/pilot-workspaces/[workspaceSlug]/trust-safety-incidents/[incidentId]/route.ts", "utf8"),
  readFile("app/api/pilot-workspaces/[workspaceSlug]/trust-safety-incidents/[incidentId]/review-packet/route.ts", "utf8"),
  readFile("app/lib/protectedPilotStoreError.ts", "utf8"),
  readFile("app/pilot-workspace/PilotWorkspaceVerificationPanel.tsx", "utf8"),
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
  "tenant-access-${selectedWorkspace.id}",
  "AAL2 required",
  "No protected workspace is visible.",
  "sign out, sign in again, and verify the authenticator"
]);

if (accessSurface.includes("No approved tenant workspace membership is assigned to this identity.")) {
  throw new Error("protected pilot workspace conflates expired governance assurance with missing membership");
}

requireIncludes("tenant access administration", administrationPanel, [
  "const created = await commitAction(",
  "if (!created)",
  "return false",
  "return true",
  "Active workspace:",
  "workspaceTargetConfirmed",
  "confirmedWorkspaceSlug: workspace.slug",
  "I confirm this invitation targets the active workspace shown above.",
  "Metadata only. Exclude sensitive or clinical details."
]);

requireIncludes("tenant access API", tenantAccessRoute, [
  'stringValue(body, "confirmedWorkspaceSlug", 160)',
  "confirmedWorkspaceSlug !== workspaceSlug",
  'code: "workspace-confirmation-required"',
  "Confirm the active workspace before creating a governed invitation record."
]);

requireIncludes("protected store AAL2 classification", protectedStoreError, [
  'code: "governance-aal2-session-required"',
  'status: 403',
  'reauthenticationRequired: true',
  "Sign out, sign in again, verify the enrolled authenticator, and retry."
]);

requireIncludes("tenant access AAL2 response", tenantAccessRoute, [
  "classifyProtectedPilotStoreFailure",
  "reauthenticationRequired: failure.reauthenticationRequired",
  "status: failure.status"
]);

requireIncludes("TrustOps AAL2 response", trustSafetyRoute, [
  "classifyProtectedPilotStoreFailure",
  "reauthenticationRequired: failure.reauthenticationRequired",
  "status: failure.status"
]);

for (const [label, source] of [
  ["TrustOps incident detail AAL2 response", trustSafetyIncidentRoute],
  ["TrustOps review packet AAL2 response", trustSafetyReviewPacketRoute]
]) {
  requireIncludes(label, source, [
    "classifyProtectedPilotStoreFailure",
    "status: failure.status",
    "code: failure.code"
  ]);
}

requireIncludes("tenant verification AAL2 handling", verificationPanel, [
  'error.code === "governance-aal2-session-required"',
  "Verification stopped at the fresh AAL2 gate.",
  "Sign out, sign in again, verify the enrolled authenticator, and rerun verification."
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
