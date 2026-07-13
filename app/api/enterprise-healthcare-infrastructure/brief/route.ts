import { NextResponse } from "next/server";
import {
  buildEnterpriseHealthcareInfrastructureBrief,
  enterpriseHealthcareInfrastructureBriefRoute,
  enterpriseHealthcareInfrastructureStatus
} from "../../../lib/enterpriseHealthcareInfrastructure";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: enterpriseHealthcareInfrastructureBriefRoute,
    requestedAction:
      "enterprise healthcare infrastructure brief synthetic no-phi metadata-only FHIR HL7 DICOM PACS RIS HIS X12 VPN firewall database integration engine buyer diligence internal testing",
    inputText:
      "synthetic no-phi metadata-only enterprise healthcare infrastructure brief interoperability imaging security compute buyer diligence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "Content-Disposition": 'inline; filename="enterprise-healthcare-infrastructure.md"',
    "Content-Type": "text/markdown; charset=utf-8",
    "X-SCRIMED-Enterprise-Infrastructure": enterpriseHealthcareInfrastructureStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-infrastructure-metadata-only",
    "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
    "X-SCRIMED-Imaging-Authority": "not-final-imaging-interpretation",
    "X-SCRIMED-Conformance": "synthetic-evidence-live-blocked",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "enterprise-healthcare-infrastructure-brief-blocked",
          message: "SCRIMED Enterprise Healthcare Infrastructure brief is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return new NextResponse(buildEnterpriseHealthcareInfrastructureBrief(), { headers });
}
