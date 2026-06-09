import { NextResponse } from "next/server";
import { getInteroperabilityConformanceEvaluationBySlug } from "../../../../lib/interoperabilityConformanceEvaluations";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const evaluation = getInteroperabilityConformanceEvaluationBySlug(slug);

  if (!evaluation) {
    return NextResponse.json(
      { error: "interoperability_conformance_evaluation_not_found", slug },
      { status: 404 }
    );
  }

  return NextResponse.json({
    service: "scrimed-interoperability-conformance-evaluation",
    evaluation
  });
}
