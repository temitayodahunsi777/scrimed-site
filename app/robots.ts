import type { MetadataRoute } from "next";
import { applicationUrl } from "./lib/companyIdentity";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/pilot-workspace/", "/sales-command-center/"]
    },
    sitemap: applicationUrl("/sitemap.xml"),
    host: applicationUrl("/")
  };
}
