import { NextResponse } from "next/server";

const events = [
  {
    id: "scrimed-main-cleanup",
    type: "repository",
    summary: "Closed stale PRs and established PR #10 as the deployment baseline.",
    date: "2026-05-28"
  },
  {
    id: "scrimed-homepage-platform-surface",
    type: "product",
    summary: "Converted the root page into a platform-oriented SCRIMED homepage.",
    date: "2026-05-28"
  },
  {
    id: "scrimed-trust-status-routes",
    type: "operations",
    summary: "Added status, readiness, and event endpoints for deployment visibility.",
    date: "2026-05-28"
  }
];

export async function GET() {
  return NextResponse.json({
    service: "scrimed-site",
    events,
    count: events.length
  });
}
