export type OperationsStatus = "ready" | "blocked" | "manual-action" | "planned";
export type OperationsArea = "publishing" | "deployment" | "domain" | "sales" | "quality" | "security";

export type OperationsBlocker = {
  id: string;
  area: OperationsArea;
  status: OperationsStatus;
  blocker: string;
  impact: string;
  currentEvidence: string;
  owner: string;
  resolutionPath: string[];
  fallback: string;
};

export type BuyerRouteChecklist = {
  step: string;
  source: string;
  destination: string;
  requiredAction: string;
  verification: string;
};

export type SmoothOpsPrinciple = {
  principle: string;
  operatingRule: string;
};

export const operationsBoundary =
  "SCRIMED operational readiness tracks deployment, sales, domain, and quality blockers for the synthetic pilot and enterprise evaluation product. It does not authorize live clinical execution.";

export const operationsBlockers: OperationsBlocker[] = [
  {
    id: "github-auth",
    area: "publishing",
    status: "blocked",
    blocker: "Local GitHub HTTPS push cannot read credentials.",
    impact:
      "Local commits for AgentOS, Atlas, Evaluation, Pricing, and Operations Readiness are ready but not visible on GitHub or Vercel until pushed.",
    currentEvidence:
      "`git push origin main` fails with: could not read Username for 'https://github.com'. Vercel production still points at GitHub commit 0a0977b.",
    owner: "Founder or repository administrator",
    resolutionPath: [
      "Install and authenticate GitHub CLI with `gh auth login`, or configure a GitHub personal access token in the macOS keychain.",
      "Run `git push origin main` from the `scrimed-site` repository.",
      "Confirm Vercel creates a production deployment from the pushed `main` branch."
    ],
    fallback:
      "Use the connected GitHub app for a connector-backed branch or squash commit only after accepting the local/remote history reconciliation plan."
  },
  {
    id: "package-manager",
    area: "quality",
    status: "blocked",
    blocker: "Local npm, pnpm, yarn, corepack, and tsc are unavailable in the current Codex PATH.",
    impact:
      "Local typecheck/build commands cannot run from this session, so Vercel remains the build source of truth.",
    currentEvidence: "`npm run typecheck` and `npm run build` fail with command not found.",
    owner: "Engineering",
    resolutionPath: [
      "Install Node.js with npm available in the shell PATH, or enable corepack.",
      "Run `npm install` from a controlled environment.",
      "Run `npm run typecheck` and `npm run build` before production promotion."
    ],
    fallback:
      "Continue using `git diff --check`, typed App Router patterns, and Vercel remote builds as the managed quality path."
  },
  {
    id: "vercel-cli",
    area: "deployment",
    status: "manual-action",
    blocker: "Direct Vercel deploy from local workspace is unavailable without Vercel CLI or pushed Git integration.",
    impact:
      "Vercel cannot deploy the latest local commits until GitHub push works or Vercel CLI is installed/authenticated.",
    currentEvidence: "Connected Vercel deploy helper returns CLI instructions; local `vercel` command is unavailable.",
    owner: "Engineering or Vercel project administrator",
    resolutionPath: [
      "Prefer GitHub push to trigger Vercel Git integration.",
      "Alternatively install Vercel CLI, link the project, and deploy from the repository root.",
      "Confirm latest production deployment contains `/pricing`, `/evaluation`, `/agents`, and `/api/commercial/pricing`."
    ],
    fallback:
      "Keep current production deployment live while local commits remain queued."
  },
  {
    id: "app-subdomain",
    area: "domain",
    status: "manual-action",
    blocker: "`app.scrimedsolutions.com` is recommended but not yet verified as connected to the Vercel app.",
    impact:
      "Buyers can use Vercel deployment URLs, but the ideal branded product URL is not yet active.",
    currentEvidence:
      "Vercel project domains currently list `scrimed-site.vercel.app`, `scrimed-site-temitayo-dahunsis-projects.vercel.app`, and the `main` branch alias; `app.scrimedsolutions.com` is not present.",
    owner: "Domain/DNS administrator",
    resolutionPath: [
      "Add `app.scrimedsolutions.com` to the Vercel `scrimed-site` project domains.",
      "Create the required DNS CNAME record in the domain provider or Wix DNS manager.",
      "Wait for Vercel domain verification and SSL provisioning."
    ],
    fallback:
      "Use the current Vercel deployment URL for internal review until branded DNS is ready."
  },
  {
    id: "wix-cta-routing",
    area: "sales",
    status: "manual-action",
    blocker: "Wix CTAs need to be wired to SCRIMED product routes.",
    impact:
      "Buyers may see the official website but not reach the product console, pricing, evaluation workspace, or pilot intake.",
    currentEvidence: "Product route strategy is defined in `/pricing` and `app/lib/commercialStrategy.ts`.",
    owner: "Website administrator",
    resolutionPath: [
      "Add Wix buttons for View Product Console, Review Pricing, Run Evaluation, and Request Pilot.",
      "Point buttons to `https://app.scrimedsolutions.com/product`, `/pricing`, `/evaluation`, and `/pilot` after DNS is live.",
      "Temporarily point buttons to the current Vercel deployment URL if DNS is not ready."
    ],
    fallback:
      "Share direct Vercel links manually during buyer conversations."
  },
  {
    id: "deployment-protection",
    area: "security",
    status: "planned",
    blocker: "Public vs protected route policy needs an explicit decision before broad buyer access.",
    impact:
      "If deployment protection is on, buyers may hit Vercel authentication. If off, public preview routes need careful no-PHI boundaries.",
    currentEvidence: "Earlier protected Vercel URLs required connector-authenticated checks.",
    owner: "Security and product",
    resolutionPath: [
      "Keep public preview routes no-PHI and synthetic-only.",
      "Decide which routes are public: `/`, `/product`, `/pricing`, `/evaluation`, `/pilot`, `/trust`.",
      "Keep future tenant dashboards protected behind auth."
    ],
    fallback:
      "Use Vercel share links or authenticated demos for early enterprise review."
  }
];

export const buyerRouteChecklist: BuyerRouteChecklist[] = [
  {
    step: "1. Website discovery",
    source: "https://www.scrimedsolutions.com",
    destination: "https://app.scrimedsolutions.com/product",
    requiredAction: "Add a primary Wix CTA labeled View Product Console.",
    verification: "CTA opens Product Console without requiring buyer-owned Vercel access."
  },
  {
    step: "2. Commercial review",
    source: "https://www.scrimedsolutions.com",
    destination: "https://app.scrimedsolutions.com/pricing",
    requiredAction: "Add a Wix CTA labeled Review Pricing or Enterprise Pricing.",
    verification: "Pricing page shows public preview, assessment, synthetic pilot, protected pilot, enterprise license, and strategic partnership tiers."
  },
  {
    step: "3. Product proof",
    source: "https://app.scrimedsolutions.com/product",
    destination: "https://app.scrimedsolutions.com/evaluation",
    requiredAction: "Route qualified buyers into the AgentOS Evaluation Workspace.",
    verification: "Synthetic evaluation generates task plan, Trust Card, audit preview, and observability packet."
  },
  {
    step: "4. Sales conversion",
    source: "https://app.scrimedsolutions.com/evaluation",
    destination: "https://app.scrimedsolutions.com/pilot",
    requiredAction: "Route buyers from evaluation to pilot intake.",
    verification: "Pilot intake rejects PHI and produces a CRM-ready handoff packet."
  }
];

export const smoothOpsPrinciples: SmoothOpsPrinciple[] = [
  {
    principle: "No silent blockers",
    operatingRule: "Every blocked tool, auth issue, deployment gap, and manual action must appear in readiness output with owner and fallback."
  },
  {
    principle: "No unbounded healthcare claims",
    operatingRule: "Every buyer-facing route must preserve synthetic/evaluation boundaries until approved production controls exist."
  },
  {
    principle: "No orphan surfaces",
    operatingRule: "Every new page needs a route, API where useful, Hub entry, Product Console linkage, and documentation entry."
  },
  {
    principle: "No buyer confusion",
    operatingRule: "Wix is the official marketing site; Vercel is the product app; buyers do not need Vercel accounts."
  },
  {
    principle: "No production promotion by vibes",
    operatingRule: "Promotion requires build verification, deployment verification, route smoke tests, auth/DNS checks, and documented rollback path."
  }
];

export function getCompanyOperationsSummary() {
  const blocked = operationsBlockers.filter((item) => item.status === "blocked").length;
  const manualAction = operationsBlockers.filter((item) => item.status === "manual-action").length;
  const ready = operationsBlockers.filter((item) => item.status === "ready").length;

  return {
    service: "scrimed-company-operations",
    route: "/operations",
    apiRoute: "/api/operations/readiness",
    status: blocked === 0 ? "operational-readiness-clear" : "blocked-actions-visible",
    boundary: operationsBoundary,
    blocked,
    manualAction,
    ready,
    total: operationsBlockers.length,
    operationsBlockers,
    buyerRouteChecklist,
    smoothOpsPrinciples,
    updated: "2026-06-02"
  };
}
