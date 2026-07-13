import { NextResponse } from "next/server";
import {
  getScrimedSecurityDiligenceEvidenceSummary,
  scrimedSecurityDiligenceEvidenceStatus
} from "../../../lib/scrimedSecurityDiligenceEvidence";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: "/api/scrimed-cyber-defense/evidence-packet",
    requestedAction:
      "scrimed cyber defense security diligence evidence packet synthetic no-phi metadata buyer investor review audit preparation",
    inputText:
      "metadata-only evidence packet no raw logs no bearer tokens no secrets no PHI no customer records no connector payloads",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Security-Evidence-Packet": scrimedSecurityDiligenceEvidenceStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-security-evidence-metadata-only",
    "X-SCRIMED-Share-Rule": "redacted-metadata-only",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "scrimed-security-evidence-packet-blocked",
          message: "SCRIMED Security Diligence Evidence Packet is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getScrimedSecurityDiligenceEvidenceSummary(), { headers });
}
