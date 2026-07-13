import { NextResponse } from "next/server";
import { evaluateSyntheticHealthRecordExtractionRequest } from "../../../lib/healthRecordsSafetyExchange";

export const dynamic = "force-dynamic";

const boundaryHeaders = {
  "X-SCRIMED-Health-Records": "synthetic-extraction-evaluator",
  "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
  "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
  "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
  "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
  "X-SCRIMED-Record-Mutation": "not-authorized",
  "X-SCRIMED-Security-Certification": "not-security-certified"
};

export async function GET() {
  return NextResponse.json(
    {
      service: "scrimed-health-records-synthetic-extraction-evaluator",
      status: "ready",
      boundary:
        "POST syntheticOnly=true, a supported sourceFormat, and synthetic recordKinds only. Do not submit PHI, patient identifiers, payer member data, credentials, production URLs, or live clinical records.",
      acceptedFormats: [
        "fhir-bundle",
        "hl7-v2-message",
        "c-cda-document",
        "dicom-metadata",
        "x12-prior-auth",
        "csv-export",
        "unstructured-note"
      ],
      example: {
        syntheticOnly: true,
        sourceFormat: "fhir-bundle",
        declaredStandard: "FHIR R4 synthetic bundle",
        recordKinds: ["Patient placeholder", "Encounter", "Observation"],
        containsPhi: false,
        includesPatientIdentifiers: false,
        intendedUse: "Synthetic extraction planning",
        requestedAction: "extract synthetic reviewer packet"
      }
    },
    { headers: boundaryHeaders }
  );
}

export async function POST(request: Request) {
  const contentLength = Number(request.headers.get("content-length") ?? "0");

  if (contentLength > 12000) {
    return NextResponse.json(
      {
        error: {
          code: "payload-too-large",
          message: "Health-record extraction evaluation accepts small synthetic metadata payloads only."
        }
      },
      { status: 413, headers: boundaryHeaders }
    );
  }

  if (!request.headers.get("content-type")?.includes("application/json")) {
    return NextResponse.json(
      {
        error: {
          code: "unsupported-content-type",
          message: "Submit synthetic health-record extraction requests as application/json."
        }
      },
      { status: 415, headers: boundaryHeaders }
    );
  }

  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        error: {
          code: "invalid-json",
          message: "Request body must be valid JSON."
        }
      },
      { status: 400, headers: boundaryHeaders }
    );
  }

  const evaluation = evaluateSyntheticHealthRecordExtractionRequest(payload);

  return NextResponse.json(
    {
      service: "scrimed-health-records-synthetic-extraction-evaluator",
      ...evaluation,
      boundary:
        "Evaluation is no-storage, synthetic-only planning. It is not PHI processing, production connector approval, medical advice, clinical validation, payer submission, or record mutation authority."
    },
    { status: evaluation.accepted ? 202 : 400, headers: boundaryHeaders }
  );
}
