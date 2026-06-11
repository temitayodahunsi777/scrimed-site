import { NextResponse } from "next/server";
import { buildDemoBrief, getProductDemoBySlug } from "../../../../lib/demoPilotPrograms";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const demo = getProductDemoBySlug(slug);

  if (!demo) {
    return NextResponse.json({ error: "product_demo_not_found", slug }, { status: 404 });
  }

  return new NextResponse(buildDemoBrief(demo), {
    headers: {
      "Content-Disposition": `attachment; filename="scrimed-${demo.slug}-demo-brief.md"`,
      "Content-Type": "text/markdown; charset=utf-8"
    }
  });
}
