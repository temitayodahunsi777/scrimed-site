import { NextResponse } from "next/server";
import {
  buildQaManualRunEvidencePacket,
  qaManualRunEvidenceContract,
  validateQaManualRunEvidenceInput
} from "../../../lib/qaEvidenceLedger";

export async function GET() {
  return NextResponse.json(qaManualRunEvidenceContract, {
    headers: {
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        service: "scrimed-qa-manual-run-evidence-packet",
        status: "invalid-json",
        errors: ["Body must be valid JSON."]
      },
      {
        status: 400,
        headers: {
          "X-SCRIMED-Data-Boundary": "synthetic-only"
        }
      }
    );
  }

  const validation = validateQaManualRunEvidenceInput(body);

  if (!validation.ok) {
    return NextResponse.json(
      {
        service: "scrimed-qa-manual-run-evidence-packet",
        status: "validation-failed",
        errors: validation.errors
      },
      {
        status: 400,
        headers: {
          "X-SCRIMED-Data-Boundary": "synthetic-only"
        }
      }
    );
  }

  return new NextResponse(buildQaManualRunEvidencePacket(validation.input), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-manual-sales-demo-session-qa-evidence-packet.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Data-Boundary": "synthetic-only"
    }
  });
}
