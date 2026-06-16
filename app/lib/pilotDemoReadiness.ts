import type {
  PilotAuditEventRecord,
  PilotSessionRecord,
  PilotWorkspaceRecord
} from "./protectedPilotWorkspace";

export type PilotDemoReadinessState = "ready" | "review" | "blocked";

export type PilotDemoReadinessCheck = {
  id: string;
  label: string;
  owner: string;
  state: PilotDemoReadinessState;
  evidence: string;
  action: string;
  boundary: string;
};

export type PilotDemoReadinessRunbookStep = {
  step: string;
  owner: string;
  proof: string;
  state: PilotDemoReadinessState;
};

export type PilotDemoReadinessSummary = {
  state: PilotDemoReadinessState;
  score: number;
  passed: number;
  review: number;
  blocked: number;
  requiredActions: string[];
  lastEvidenceAt: string;
  checks: PilotDemoReadinessCheck[];
  runbook: PilotDemoReadinessRunbookStep[];
  buyerBrief: string[];
};

export type PilotDemoReadinessSnapshotRecord = {
  id: string;
  tenantId: string;
  workspaceId: string;
  readinessState: PilotDemoReadinessState;
  readinessScore: number;
  passedCount: number;
  reviewCount: number;
  blockedCount: number;
  requiredActions: string[];
  buyerBrief: string[];
  checkResults: PilotDemoReadinessCheck[];
  runbook: PilotDemoReadinessRunbookStep[];
  verification: TenantSessionVerificationReadiness;
  evidenceCounts: {
    sessions: number;
    auditEvents: number;
    requiredActions: number;
    checks: number;
  };
  snapshot: PilotDemoReadinessSummary;
  lastEvidenceAt: string | null;
  boundary: string;
  createdBy: string;
  createdAt: string;
};

export type TenantSessionVerificationReadiness = {
  status: "not-run" | "running" | "complete" | "error";
  total: number;
  passed: number;
  warnings: number;
  failed: number;
  updatedAt: string | null;
};

export const pilotDemoReadinessProofStackStatus =
  "protected-workspace-demo-readiness-command-center";
export const pilotDemoReadinessPacketProofStackStatus =
  "aal2-audited-demo-readiness-snapshot-packets";

const syntheticBoundary =
  "Synthetic-pilot evidence only; no PHI, live clinical execution, payer submission, autonomous diagnosis, patient outreach, legal advice, or compliance certification.";

function hasAuditEvent(events: PilotAuditEventRecord[], eventType: string) {
  return events.some((event) => event.eventType === eventType);
}

function latestTimestamp(timestamps: string[]) {
  const latest = timestamps
    .filter(Boolean)
    .map((timestamp) => new Date(timestamp).getTime())
    .filter(Number.isFinite)
    .sort((left, right) => right - left)[0];

  return latest ? new Date(latest).toISOString() : "No committed evidence yet";
}

function getRollupState(checks: PilotDemoReadinessCheck[]): PilotDemoReadinessState {
  if (checks.some((check) => check.state === "blocked")) return "blocked";
  if (checks.some((check) => check.state === "review")) return "review";
  return "ready";
}

export function derivePilotDemoReadiness({
  workspace,
  sessions,
  auditEvents,
  verification
}: {
  workspace: PilotWorkspaceRecord;
  sessions: PilotSessionRecord[];
  auditEvents: PilotAuditEventRecord[];
  verification: TenantSessionVerificationReadiness | null;
}): PilotDemoReadinessSummary {
  const sessionCount = sessions.length;
  const auditEventCount = auditEvents.length;
  const hasSession = sessionCount > 0;
  const hasSessionCreationAudit = hasAuditEvent(auditEvents, "synthetic-session-created");
  const hasSessionProofPacket = hasAuditEvent(auditEvents, "proof-packet-downloaded");
  const hasEnterprisePacket = hasAuditEvent(auditEvents, "enterprise-proof-packet-downloaded");
  const hasVerificationRun = Boolean(verification?.status === "complete" || verification?.status === "error");
  const verificationFailed = (verification?.failed ?? 0) > 0 || verification?.status === "error";
  const verificationWarning = (verification?.warnings ?? 0) > 0;

  const checks: PilotDemoReadinessCheck[] = [
    {
      id: "access-assurance",
      label: "AAL2 Tenant Access",
      owner: "Tenant admin or pilot lead",
      state: "ready",
      evidence: "This command center renders only after protected tenant membership and fresh AAL2 assurance succeed.",
      action: "Keep passkey or magic-link plus authenticator assurance active before buyer calls.",
      boundary: syntheticBoundary
    },
    {
      id: "workspace-boundary",
      label: "Workspace Boundary",
      owner: "SCRIMED operator",
      state: workspace.status === "archived" ? "blocked" : "ready",
      evidence: `${workspace.name} is currently ${workspace.status}.`,
      action:
        workspace.status === "archived"
          ? "Select an active synthetic-pilot or assessment workspace before demo use."
          : "Open the call by stating the synthetic-only protected pilot boundary.",
      boundary: workspace.boundary
    },
    {
      id: "durable-session",
      label: "Durable Synthetic Session",
      owner: "Pilot lead",
      state: hasSession && hasSessionCreationAudit ? "ready" : hasSession ? "review" : "blocked",
      evidence: `${sessionCount} durable session${sessionCount === 1 ? "" : "s"} and ${hasSessionCreationAudit ? "a" : "no"} synthetic-session-created audit event.`,
      action: hasSession ? "Confirm the intended buyer demo scenario is the top retained session." : "Create a synthetic evaluation session before the buyer call.",
      boundary: syntheticBoundary
    },
    {
      id: "tenant-route-verification",
      label: "Tenant Route Verification",
      owner: "Demo operator",
      state: verificationFailed ? "blocked" : hasVerificationRun ? (verificationWarning ? "review" : "ready") : "review",
      evidence: hasVerificationRun
        ? `${verification?.passed ?? 0}/${verification?.total ?? 0} protected checks passed, ${verification?.warnings ?? 0} review warning${verification?.warnings === 1 ? "" : "s"}, ${verification?.failed ?? 0} failure${verification?.failed === 1 ? "" : "s"}.`
        : "Tenant-session verification has not been run in this browser session.",
      action: verificationFailed
        ? "Resolve failed protected routes before buyer demo use."
        : hasVerificationRun
          ? "Review any role-limited warnings and keep the latest verification timestamp in the demo notes."
          : "Run Tenant Verification from the protected workspace before the demo.",
      boundary: syntheticBoundary
    },
    {
      id: "session-proof-packet",
      label: "Session Proof Packet",
      owner: "Pilot lead",
      state: hasSessionProofPacket ? "ready" : hasSession ? "review" : "blocked",
      evidence: hasSessionProofPacket
        ? "A session proof-packet download audit event is committed."
        : "No session proof-packet download audit event is present yet.",
      action: hasSessionProofPacket
        ? "Use the packet as buyer diligence evidence only."
        : hasSession
          ? "Download an audited proof packet for the selected session if a buyer packet is needed."
          : "Create a synthetic session before proof-packet export.",
      boundary: syntheticBoundary
    },
    {
      id: "enterprise-proof-packet",
      label: "Enterprise Proof Packet",
      owner: "Tenant admin or pilot lead",
      state: hasEnterprisePacket ? "ready" : "review",
      evidence: hasEnterprisePacket
        ? "An enterprise proof-packet download audit event is committed."
        : "Aggregate enterprise proof-packet release has not been audited for the current evidence set.",
      action: hasEnterprisePacket
        ? "Attach the aggregate packet to buyer diligence notes when appropriate."
        : "Download the enterprise proof packet before a formal buyer diligence call.",
      boundary: syntheticBoundary
    },
    {
      id: "audit-trail",
      label: "Audit Trail Visibility",
      owner: "Trust operator",
      state: auditEventCount > 0 ? "ready" : "blocked",
      evidence: `${auditEventCount} append-only audit event${auditEventCount === 1 ? "" : "s"} visible in the workspace.`,
      action: auditEventCount > 0 ? "Use the audit trail as the source of demo proof." : "Create or export governed evidence so the audit trail is not empty.",
      boundary: syntheticBoundary
    }
  ];

  const passed = checks.filter((check) => check.state === "ready").length;
  const review = checks.filter((check) => check.state === "review").length;
  const blocked = checks.filter((check) => check.state === "blocked").length;
  const state = getRollupState(checks);
  const score = Math.round((passed / checks.length) * 100);
  const requiredActions = checks
    .filter((check) => check.state !== "ready")
    .map((check) => `${check.label}: ${check.action}`);
  const lastEvidenceAt = latestTimestamp([
    ...sessions.map((session) => session.createdAt),
    ...auditEvents.map((event) => event.createdAt),
    verification?.updatedAt ?? ""
  ]);

  const runbook: PilotDemoReadinessRunbookStep[] = [
    {
      step: "Open with boundary",
      owner: "Demo operator",
      proof: "State that the workspace is synthetic-only and review-gated before showing any product surface.",
      state: checks.find((check) => check.id === "workspace-boundary")?.state ?? "review"
    },
    {
      step: "Show retained evidence",
      owner: "Pilot lead",
      proof: "Use durable sessions, audit events, TrustOS, Agent Workspace, TrustOps, and proof packets as the demo spine.",
      state: hasSession && auditEventCount > 0 ? "ready" : "blocked"
    },
    {
      step: "Run route verification",
      owner: "Demo operator",
      proof: "Validate protected routes with the current browser session instead of exporting bearer tokens.",
      state: checks.find((check) => check.id === "tenant-route-verification")?.state ?? "review"
    },
    {
      step: "Close with next action",
      owner: "Commercial lead",
      proof: "Convert buyer interest into a scoped synthetic pilot, workflow assessment, or governance audit.",
      state: state === "blocked" ? "review" : "ready"
    }
  ];

  return {
    state,
    score,
    passed,
    review,
    blocked,
    requiredActions,
    lastEvidenceAt,
    checks,
    runbook,
    buyerBrief: [
      `${workspace.tenantName} workspace: ${workspace.name}`,
      `${sessionCount} durable synthetic session${sessionCount === 1 ? "" : "s"} retained`,
      `${auditEventCount} append-only audit event${auditEventCount === 1 ? "" : "s"} visible`,
      `Demo readiness: ${state} (${score}%)`,
      "Boundary: synthetic-only enterprise evaluation; no PHI or live clinical execution"
    ]
  };
}

function markdownItems(items: string[]) {
  if (items.length === 0) {
    return "- None recorded.";
  }

  return items.map((item) => `- ${item}`).join("\n");
}

function checkLines(checks: PilotDemoReadinessCheck[]) {
  if (checks.length === 0) {
    return "- No readiness checks were captured.";
  }

  return checks
    .map(
      (check) =>
        `- ${check.label}: ${check.state}. Evidence: ${check.evidence} Action: ${check.action}`
    )
    .join("\n");
}

function runbookLines(runbook: PilotDemoReadinessRunbookStep[]) {
  if (runbook.length === 0) {
    return "- No runbook steps were captured.";
  }

  return runbook
    .map((step, index) => `${index + 1}. ${step.step} (${step.owner}, ${step.state}): ${step.proof}`)
    .join("\n");
}

function snapshotJson(snapshot: PilotDemoReadinessSnapshotRecord) {
  return `\`\`\`json\n${JSON.stringify(
    {
      id: snapshot.id,
      readinessState: snapshot.readinessState,
      readinessScore: snapshot.readinessScore,
      counts: snapshot.evidenceCounts,
      verification: snapshot.verification,
      createdAt: snapshot.createdAt,
      createdBy: snapshot.createdBy
    },
    null,
    2
  )}\n\`\`\``;
}

export function buildPilotDemoReadinessPacket({
  generatedAt,
  auditEventId,
  actorUserId,
  appBaseUrl,
  workspace,
  snapshot,
  recentAuditEvents
}: {
  generatedAt: string;
  auditEventId: string;
  actorUserId: string;
  appBaseUrl: string;
  workspace: PilotWorkspaceRecord;
  snapshot: PilotDemoReadinessSnapshotRecord;
  recentAuditEvents: PilotAuditEventRecord[];
}) {
  const accessRoute = `${appBaseUrl.replace(/\/$/, "")}/pilot-workspace/access`;
  const latestAuditLines =
    recentAuditEvents.length === 0
      ? "- No recent audit events were visible to this tenant session."
      : recentAuditEvents
          .slice(0, 20)
          .map(
            (event) =>
              `- ${event.createdAt}: ${event.eventType} by ${event.actorUserId}; session ${event.sessionId ?? "workspace-level"}`
          )
          .join("\n");

  return `# SCRIMED Demo Readiness Packet

## Packet Control
- Generated: ${generatedAt}
- Snapshot ID: ${snapshot.id}
- Snapshot created: ${snapshot.createdAt}
- Snapshot created by: ${snapshot.createdBy}
- Packet audit event ID: ${auditEventId}
- Packet generated by: ${actorUserId}
- Product route: ${accessRoute}
- Data boundary: synthetic-only, metadata-only, tenant-scoped

## Tenant Workspace
- Tenant: ${workspace.tenantName}
- Workspace: ${workspace.name}
- Workspace slug: ${workspace.slug}
- Workspace status: ${workspace.status}
- Workspace created: ${workspace.createdAt}

## Demo Readiness Decision
- State: ${snapshot.readinessState}
- Score: ${snapshot.readinessScore}%
- Passed checks: ${snapshot.passedCount}
- Review checks: ${snapshot.reviewCount}
- Blocked checks: ${snapshot.blockedCount}
- Last evidence: ${snapshot.lastEvidenceAt ?? "No committed evidence timestamp"}

## Evidence Counts
- Durable synthetic sessions: ${snapshot.evidenceCounts.sessions}
- Append-only audit events: ${snapshot.evidenceCounts.auditEvents}
- Readiness checks captured: ${snapshot.evidenceCounts.checks}
- Required actions: ${snapshot.evidenceCounts.requiredActions}

## Buyer Brief
${markdownItems(snapshot.buyerBrief)}

## Required Actions
${markdownItems(snapshot.requiredActions)}

## Readiness Checks
${checkLines(snapshot.checkResults)}

## Buyer Demo Runbook
${runbookLines(snapshot.runbook)}

## Tenant-Session Verification
- Status: ${snapshot.verification.status}
- Passed: ${snapshot.verification.passed}/${snapshot.verification.total}
- Warnings: ${snapshot.verification.warnings}
- Failed: ${snapshot.verification.failed}
- Updated: ${snapshot.verification.updatedAt ?? "not recorded"}

## Recent Append-Only Audit Events
${latestAuditLines}

## Snapshot Metadata
${snapshotJson(snapshot)}

## Legal, Privacy, Security, And Safety Boundary
- This packet documents governed synthetic pilot readiness evidence only.
- It is not medical advice, clinical decision support authorization, diagnosis, treatment guidance, patient instruction, payer submission, reimbursement guarantee, legal advice, regulatory advice, or security certification.
- It is not evidence of HIPAA compliance, SOC 2 certification, FDA clearance, payer approval, reimbursement eligibility, production readiness, or managed 24/7 monitoring coverage.
- SCRIMED does not accept PHI, live patient records, payer credentials, production EHR credentials, imaging files, device streams, or secrets in this protected synthetic pilot workspace.
- Live clinical, payer, imaging, device, EHR, or patient-facing use requires signed customer authorization, BAA/DPA path where applicable, privacy review, security review, clinical governance, legal review, retention policy, incident response, and deployment approval.
- Human review remains required before any buyer-facing interpretation is treated as operational evidence.

## Snapshot Boundary
${snapshot.boundary}

## Workspace Boundary
${workspace.boundary}
`;
}
