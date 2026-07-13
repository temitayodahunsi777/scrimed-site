import { NextResponse } from "next/server";
import {
  enterpriseHealthcareInfrastructureApiRoute,
  enterpriseHealthcareInfrastructureStatus,
  getEnterpriseHealthcareInfrastructureSummary
} from "../../lib/enterpriseHealthcareInfrastructure";
import { evaluateScrimedSafetyGate, scrimedSafetyHeaders } from "../../lib/scrimedSafetyGovernance";

export const dynamic = "force-dynamic";

export function GET() {
  const safety = evaluateScrimedSafetyGate({
    route: enterpriseHealthcareInfrastructureApiRoute,
    requestedAction:
      "enterprise healthcare infrastructure synthetic no-phi metadata-only hospital IT readiness FHIR HL7 ADT DICOM PACS RIS HIS X12 VPN Virtual Machines databases firewalls integration engines buyer diligence internal testing",
    inputText:
      "synthetic no-phi metadata-only hospital IT readiness interoperability DICOM PACS RIS HIS HL7 ADT FHIR X12 VPN VM database firewall integration engines buyer diligence internal testing",
    allowMetadataOnly: true
  });
  const headers = {
    "Cache-Control": "private, no-store",
    "X-SCRIMED-Enterprise-Infrastructure": enterpriseHealthcareInfrastructureStatus,
    "X-SCRIMED-Data-Boundary": "synthetic-infrastructure-metadata-only",
    "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
    "X-SCRIMED-Imaging-Authority": "not-final-imaging-interpretation",
    "X-SCRIMED-Payer-Authority": "not-payer-submission-authorized",
    "X-SCRIMED-Conformance": "synthetic-evidence-live-blocked",
    "X-SCRIMED-Human-Review": "required-for-live-systems-clinical-payer-security-or-production-actions",
    ...scrimedSafetyHeaders(safety)
  };

  if (!safety.allowed) {
    return NextResponse.json(
      {
        error: {
          code: "enterprise-healthcare-infrastructure-blocked",
          message: "SCRIMED Enterprise Healthcare Infrastructure Readiness is blocked by safety governance."
        },
        safety
      },
      { status: safety.statusCode, headers }
    );
  }

  return NextResponse.json(getEnterpriseHealthcareInfrastructureSummary(), { headers });
}
