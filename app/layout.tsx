import "./globals.css";
import type { Metadata } from "next";
import { OperatingModeBanner } from "./components/OperatingModeBanner";
import { SiteFooter } from "./components/SiteFooter";
import { SiteNavigation } from "./components/SiteNavigation";
import { companyIdentity } from "./lib/companyIdentity";
import { assertSafeScrimedOperatingMode } from "./lib/operatingMode";

export const metadata: Metadata = {
  metadataBase: new URL(companyIdentity.applicationUrl),
  title: "SCRIMED | Governed Healthcare Intelligence",
  description:
    "SCRIMED is a pre-commercial healthcare intelligence platform developing trustworthy, interoperable, human-supervised workflows through no-PHI synthetic demonstrations.",
  applicationName: companyIdentity.productName,
  authors: [{ name: companyIdentity.displayName, url: companyIdentity.canonicalMarketingUrl }],
  creator: companyIdentity.displayName,
  publisher: companyIdentity.displayName,
  referrer: "strict-origin-when-cross-origin",
  robots: {
    index: true,
    follow: true
  },
  openGraph: {
    type: "website",
    siteName: companyIdentity.displayName,
    title: "SCRIMED | Governed Healthcare Intelligence",
    description:
      "Pre-commercial, Atlas-first healthcare intelligence with synthetic demonstrations, human review, and explicit clinical safety boundaries."
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  assertSafeScrimedOperatingMode();

  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <SiteNavigation />
        <OperatingModeBanner />
        <div id="main-content">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
