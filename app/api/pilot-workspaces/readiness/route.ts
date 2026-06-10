import { NextResponse } from "next/server";
import { verifyProtectedPilotStore } from "../../../lib/protectedPilotStore";
import { getProtectedPilotWorkspaceSummary } from "../../../lib/protectedPilotWorkspace";
import { verifyDistributedRateLimitProvider } from "../../../lib/requestRateLimit";

export const dynamic = "force-dynamic";

export async function GET() {
  const summary = getProtectedPilotWorkspaceSummary();
  const [protectedStore, distributedRateLimit] = await Promise.all([
    verifyProtectedPilotStore(),
    verifyDistributedRateLimitProvider()
  ]);

  return NextResponse.json({
    ...summary,
    status:
      protectedStore.verified && distributedRateLimit.verified
        ? "protected-pilot-infrastructure-verified"
        : summary.status,
    verification: {
      protectedStore,
      distributedRateLimit,
      productionActivationVerified: protectedStore.verified && distributedRateLimit.verified
    }
  });
}
