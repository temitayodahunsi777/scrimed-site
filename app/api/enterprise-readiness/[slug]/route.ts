import { NextResponse } from "next/server";
import { getReadinessDomainBySlug } from "../../../lib/enterpriseReadiness";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const domain = getReadinessDomainBySlug(slug);

  if (!domain) {
    return NextResponse.json({ error: "readiness_domain_not_found", slug }, { status: 404 });
  }

  return NextResponse.json({
    service: "scrimed-enterprise-readiness-domain",
    domain
  });
}
