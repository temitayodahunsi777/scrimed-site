import { NextResponse } from "next/server";
import { buildProductionArchitectureBrief } from "../../../lib/productionArchitecture";

export async function GET() {
  return new NextResponse(buildProductionArchitectureBrief(), {
    headers: {
      "Content-Disposition": "attachment; filename=\"scrimed-production-architecture-brief.md\"",
      "Content-Type": "text/markdown; charset=utf-8",
      "X-SCRIMED-Agent-Autonomy": "human-review-required-for-protected-actions",
      "X-SCRIMED-Clinical-Care-Authority": "not-authorized-live-care",
      "X-SCRIMED-Compliance-Certification": "not-certified-readiness-only",
      "X-SCRIMED-Connector-Authority": "not-production-connector-approved",
      "X-SCRIMED-Data-Boundary": "synthetic-and-metadata-only",
      "X-SCRIMED-Model-Routing-Authority": "not-production-phi-routing-approved",
      "X-SCRIMED-PHI-Authority": "not-authorized-production-phi",
      "X-SCRIMED-Record-Mutation": "not-authorized",
      "X-SCRIMED-Workflow-Execution": "deterministic-review-gated"
    }
  });
}
