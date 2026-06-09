import { NextResponse } from "next/server";
import { getProductDemoBySlug } from "../../../lib/demoPilotPrograms";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const demo = getProductDemoBySlug(slug);

  if (!demo) {
    return NextResponse.json({ error: "product_demo_not_found", slug }, { status: 404 });
  }

  return NextResponse.json({
    service: "scrimed-product-demo",
    demo
  });
}
