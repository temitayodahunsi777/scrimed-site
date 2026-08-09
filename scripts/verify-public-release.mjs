#!/usr/bin/env node

import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";
import {
  blockedClaimRules,
  evaluatePublicClaimsIntegrity
} from "./lib/public-claims-policy.mjs";

const args = new Set(process.argv.slice(2));
const requireBuild = args.has("--require-build");
const unknownArgs = [...args].filter((arg) => arg !== "--require-build");

if (unknownArgs.length > 0) {
  throw new Error(`Unsupported public release verification option: ${unknownArgs.join(", ")}`);
}

const sourcePaths = [
  "app/page.tsx",
  "app/layout.tsx",
  "app/faithcore/page.tsx",
  "app/validation-evidence/page.tsx",
  "app/legal/page.tsx",
  "app/legal/[slug]/page.tsx",
  "app/lib/companyIdentity.ts",
  "app/lib/faithCorePolicy.ts",
  "app/lib/legalPolicies.ts",
  "app/lib/operatingMode.ts",
  "app/components/SiteFooter.tsx",
  "app/pilot/PilotIntakeForm.tsx",
  "app/api/pilot/intake/route.ts",
  "app/api/operating-mode/route.ts",
  "app/api/public-release-status/route.ts",
  "app/sitemap.ts",
  "app/robots.ts"
];
const expectedBuiltRoutes = [
  "/page",
  "/faithcore/page",
  "/validation-evidence/page",
  "/legal/page",
  "/legal/[slug]/page",
  "/api/operating-mode/route",
  "/api/public-release-status/route",
  "/api/validation-evidence/route",
  "/sitemap.xml/route",
  "/robots.txt/route"
];
const canonicalApplicationOrigin = "https://app.scrimedsolutions.com";
const renderedBuildContracts = [
  {
    path: ".next/server/app/index.html",
    canonical: canonicalApplicationOrigin,
    title: "SCRIMED | Governed Healthcare Intelligence",
    requiredText: ["Atlas-first healthcare intelligence", "Building with clinicians, health systems, and innovators."]
  },
  {
    path: ".next/server/app/faithcore.html",
    canonical: `${canonicalApplicationOrigin}/faithcore`,
    title: "FaithCore by SCRIMED | Optional Faith-Aligned Care Experience",
    requiredText: [
      "FaithCore — Optional Faith-Aligned Experience",
      "does not influence diagnosis, treatment, clinical recommendations, eligibility, prioritization, risk scoring, or access to care",
      "FaithCore is not a medical service and does not modify clinical logic or healthcare decisions",
      "Explore Optional FaithCore Experience"
    ]
  },
  {
    path: ".next/server/app/validation-evidence.html",
    canonical: `${canonicalApplicationOrigin}/validation-evidence`,
    title: "Validation and Evidence | SCRIMED",
    requiredText: ["Evidence pending formal validation", "Current product status"]
  },
  {
    path: ".next/server/app/legal.html",
    canonical: `${canonicalApplicationOrigin}/legal`,
    title: "Legal and Policy Center | SCRIMED",
    requiredText: ["Interim policy draft", "Do not submit protected health information"]
  }
];
const crawlerBuildContracts = [
  {
    path: ".next/server/app/robots.txt.body",
    requiredText: [
      `Host: ${canonicalApplicationOrigin}/`,
      `Sitemap: ${canonicalApplicationOrigin}/sitemap.xml`,
      "Disallow: /api/"
    ]
  },
  {
    path: ".next/server/app/sitemap.xml.body",
    requiredText: [
      `<loc>${canonicalApplicationOrigin}/</loc>`,
      `<loc>${canonicalApplicationOrigin}/faithcore</loc>`,
      `<loc>${canonicalApplicationOrigin}/validation-evidence</loc>`,
      `<loc>${canonicalApplicationOrigin}/legal</loc>`
    ]
  }
];
const requiredText = [
  "Atlas-first healthcare intelligence",
  "Building with clinicians, health systems, and innovators.",
  "Do not submit protected health information",
  "Synthetic demonstration environment",
  "no live clinical execution",
  "require human review",
  "Interim policy draft",
  "FaithCore is not a medical service and does not modify clinical logic or healthcare decisions",
  "faithAffectsClinicalLogic: false",
  "liveClinicalExecution: false",
  "medicalDeviceConnections: false",
  "publishedStreetAddress: null"
];
const failures = [];

for (const pathname of sourcePaths) {
  if (!existsSync(pathname)) failures.push(`missing-source:${pathname}`);
}

const files = Object.fromEntries(
  await Promise.all(
    sourcePaths
      .filter((pathname) => existsSync(pathname))
      .map(async (pathname) => [pathname, await readFile(pathname, "utf8")])
  )
);
const publicSource = Object.values(files).join("\n");

for (const text of requiredText) {
  if (!publicSource.toLowerCase().includes(text.toLowerCase())) {
    failures.push(`missing-required-copy:${text}`);
  }
}

for (const rule of blockedClaimRules.filter((candidate) => !candidate.allowNegated)) {
  for (const marker of rule.markers) {
    const markerLower = marker.toLowerCase();
    const permittedPolicySources = ["app/lib/legalPolicies.ts"];
    const offendingFiles = Object.entries(files)
      .filter(([pathname]) => !permittedPolicySources.includes(pathname))
      .filter(([, content]) => content.toLowerCase().includes(markerLower))
      .map(([pathname]) => pathname);

    if (offendingFiles.length > 0) {
      failures.push(`${rule.id}:${marker}:${offendingFiles.join(",")}`);
    }
  }
}

for (const forbiddenMetadata of ["AggregateRating", "\"@type\": \"Review\"", "reviewRating"]) {
  if (publicSource.includes(forbiddenMetadata)) {
    failures.push(`unverified-review-metadata:${forbiddenMetadata}`);
  }
}

const combinedClaims = evaluatePublicClaimsIntegrity(publicSource);
if (combinedClaims.missingDisclosures.length > 0) {
  failures.push(`missing-disclosures:${combinedClaims.missingDisclosures.join(",")}`);
}

const appPathsManifest = ".next/server/app-paths-manifest.json";
let builtRouteCount = 0;
let renderedArtifactCount = 0;

if (existsSync(appPathsManifest)) {
  const manifest = JSON.parse(await readFile(appPathsManifest, "utf8"));
  const routes = Object.keys(manifest);
  builtRouteCount = routes.length;

  if (requireBuild) {
    for (const route of expectedBuiltRoutes) {
      if (!routes.includes(route)) failures.push(`missing-built-route:${route}`);
    }

    const renderedPublicPages = [];
    for (const contract of renderedBuildContracts) {
      if (!existsSync(contract.path)) {
        failures.push(`missing-rendered-artifact:${contract.path}`);
        continue;
      }

      const content = await readFile(contract.path, "utf8");
      const canonicalMarker = `<link rel="canonical" href="${contract.canonical}"`;
      const canonicalOccurrences = content.split(canonicalMarker).length - 1;
      if (canonicalOccurrences !== 1) {
        failures.push(
          `rendered-canonical:${contract.path}:expected-one:${contract.canonical}:received-${canonicalOccurrences}`
        );
      }
      if (!content.includes(`<title>${contract.title}</title>`)) {
        failures.push(`rendered-title:${contract.path}:${contract.title}`);
      }
      if (!content.includes(`<meta property="og:url" content="${contract.canonical}"`)) {
        failures.push(`rendered-open-graph-url:${contract.path}:${contract.canonical}`);
      }
      for (const marker of contract.requiredText) {
        if (!content.toLowerCase().includes(marker.toLowerCase())) {
          failures.push(`rendered-required-copy:${contract.path}:${marker}`);
        }
      }

      renderedPublicPages.push(content);
      renderedArtifactCount += 1;
    }

    for (const contract of crawlerBuildContracts) {
      if (!existsSync(contract.path)) {
        failures.push(`missing-rendered-artifact:${contract.path}`);
        continue;
      }

      const content = await readFile(contract.path, "utf8");
      for (const marker of contract.requiredText) {
        if (!content.includes(marker)) {
          failures.push(`rendered-crawler-contract:${contract.path}:${marker}`);
        }
      }
      renderedArtifactCount += 1;
    }

    const renderedClaims = evaluatePublicClaimsIntegrity(renderedPublicPages.join("\n"));
    if (!renderedClaims.publicClaimsReleaseAllowed) {
      failures.push(
        `rendered-build-public-claims:${renderedClaims.blockedClaims.map((claim) => claim.id).join(",") || renderedClaims.missingDisclosures.join(",")}`
      );
    }
  }
} else if (requireBuild) {
  failures.push(`missing-build-manifest:${appPathsManifest}`);
}

const baseUrl = process.env.SCRIMED_PUBLIC_RELEASE_BASE_URL?.replace(/\/$/, "");
let fetchedRouteCount = 0;

if (baseUrl) {
  const routes = ["/", "/validation-evidence", "/legal", "/faithcore", "/api/operating-mode", "/api/public-release-status"];
  const rendered = [];

  for (const route of routes) {
    const response = await fetch(`${baseUrl}${route}`, {
      redirect: "follow",
      headers: { "user-agent": "SCRIMED-Public-Release-Verification/1.0" }
    });
    if (!response.ok) failures.push(`route-status:${route}:${response.status}`);
    rendered.push(await response.text());
    fetchedRouteCount += 1;
  }

  const renderedClaims = evaluatePublicClaimsIntegrity(rendered.join("\n"));
  if (!renderedClaims.publicClaimsReleaseAllowed) {
    failures.push(
      `rendered-public-claims:${renderedClaims.blockedClaims.map((claim) => claim.id).join(",") || "missing-disclosures"}`
    );
  }
}

if (failures.length > 0) {
  throw new Error(`SCRIMED public release verification failed:\n${failures.join("\n")}`);
}

console.log(
  `pass SCRIMED public release verification (${sourcePaths.length} source contracts, ${builtRouteCount || "no-build"} built routes, ${renderedArtifactCount} rendered artifacts, ${fetchedRouteCount} fetched routes)`
);
console.log("boundary=pre-commercial synthetic-only no-PHI human-supervised no-live-clinical-execution");
