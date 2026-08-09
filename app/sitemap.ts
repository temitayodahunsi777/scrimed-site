import type { MetadataRoute } from "next";
import { applicationUrl } from "./lib/companyIdentity";

const publicRoutes = [
  "/",
  "/atlas",
  "/faithcore",
  "/demos",
  "/pilot",
  "/pilots",
  "/trust-center",
  "/validation-evidence",
  "/legal",
  "/legal/privacy",
  "/legal/terms",
  "/legal/cookies",
  "/legal/accessibility",
  "/legal/refunds",
  "/legal/healthcare-ai-disclaimer"
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.map((route) => ({
    url: applicationUrl(route),
    lastModified: new Date("2026-07-23T00:00:00.000Z"),
    changeFrequency: route === "/" ? "weekly" : "monthly",
    priority: route === "/" ? 1 : 0.7
  }));
}
