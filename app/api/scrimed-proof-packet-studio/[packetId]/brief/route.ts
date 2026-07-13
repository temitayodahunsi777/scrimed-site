import { NextResponse } from "next/server";
import {
  buildScrimedProofPacketMarkdown,
  getScrimedProofPacketManifest,
  scrimedProofPacketBriefRouteFor,
  scrimedProofPacketStudioStatus
} from "../../../../lib/scrimedProofPacketStudio";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

type ScrimedProofPacketBriefContext = {
  params: Promise<{
    packetId: string;
  }>;
};

function safeMarkdownFilename(packetId: string) {
  return `${packetId.replace(/[^a-z0-9-]/gi, "-").toLowerCase()}.md`;
}

export async function GET(_request: Request, context: ScrimedProofPacketBriefContext) {
  const { packetId } = await context.params;
  const route = scrimedProofPacketBriefRouteFor(packetId);
  const safety = evaluateScrimedSafetyGate({
    route,
    requestedAction:
      "scrimed proof packet studio markdown export synthetic metadata investor buyer demo pilot partner operator proof packet internal testing",
    inputText:
      "synthetic no-phi metadata-only proof packet markdown export investor buyer demo pilot partner operator route evidence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Proof-Packet-Studio": scrimedProofPacketStudioStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
    "X-SCRIMED-Packet-Human-Review": "required-before-external-sharing",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-proof-packet-brief-blocked",
          message: "SCRIMED Proof Packet Studio markdown export is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  const packet = getScrimedProofPacketManifest(packetId);
  const markdown = buildScrimedProofPacketMarkdown(packetId);

  if (!packet || !markdown) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-proof-packet-not-found",
          message: "Requested SCRIMED proof packet does not exist."
        },
        packetId
      },
      { status: 404, headers }
    );
  }

  return new NextResponse(markdown, {
    headers: {
      ...headers,
      "Content-Disposition": `attachment; filename="${safeMarkdownFilename(packet.id)}"`,
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
