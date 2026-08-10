import { NextResponse } from "next/server";
import {
  guardedCreateArtifact,
  scrimedWorkHeaders,
  wrapWorkData
} from "../../../lib/scrimed-work";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const durable = await guardedCreateArtifact(request);

  if (!durable.allowed) {
    return NextResponse.json(durable.error, {
      status: durable.status,
      headers: scrimedWorkHeaders({ "X-SCRIMED-Write-Authority": "fail-closed" }, request)
    });
  }

  return NextResponse.json(wrapWorkData(durable.data, durable.data.artifact.artifactId), {
    status: durable.status,
    headers: scrimedWorkHeaders({ "X-SCRIMED-Artifact-Authority": "draft-human-review-required-aal2-durable-write" }, request)
  });
}
