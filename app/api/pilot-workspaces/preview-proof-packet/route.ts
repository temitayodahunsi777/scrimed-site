import { NextResponse } from "next/server";
import { runAgentEvaluation } from "../../../lib/agentEvaluationWorkspace";
import {
  buildEnterpriseProofPacket,
  previewPilotWorkspace,
  protectedPilotBoundary,
  type PilotSessionRecord
} from "../../../lib/protectedPilotWorkspace";

export const dynamic = "force-dynamic";

export async function GET() {
  const evaluation = runAgentEvaluation({
    scenarioSlug: "enterprise-workflow-assessment",
    organizationId: "synthetic-enterprise-preview",
    requestedByRole: "enterprise-pilot-lead",
    mode: "synthetic-pilot",
    dataBoundaryAcknowledged: true
  });

  if (!evaluation.valid) {
    return NextResponse.json(
      {
        error: "preview-proof-packet-unavailable",
        message: "The deterministic synthetic preview could not be generated."
      },
      { status: 500 }
    );
  }

  const session: PilotSessionRecord = {
    id: "preview-session-enterprise-workflow-assessment",
    workspaceId: previewPilotWorkspace.id,
    scenarioSlug: evaluation.record.scenario.slug,
    status: evaluation.record.status,
    boundary: protectedPilotBoundary,
    evaluation: evaluation.record,
    createdAt: evaluation.record.createdAt,
    createdBy: "SCRIMED synthetic preview"
  };
  const packet = buildEnterpriseProofPacket(previewPilotWorkspace, session);

  return new NextResponse(packet, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": 'attachment; filename="scrimed-synthetic-pilot-proof-packet.md"',
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
