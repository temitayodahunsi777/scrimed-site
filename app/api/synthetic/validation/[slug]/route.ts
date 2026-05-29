import { NextResponse } from "next/server";
import { getSyntheticValidationResultBySlug } from "../../../../lib/syntheticValidation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const result = getSyntheticValidationResultBySlug(slug);

  if (!result) {
    return NextResponse.json(
      { error: "synthetic_validation_not_found", slug },
      { status: 404 }
    );
  }

  return NextResponse.json({
    service: "scrimed-synthetic-validation-result",
    result
  });
}
