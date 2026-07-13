import "./globals.css";
import { SiteFooter } from "./components/SiteFooter";
import { SiteNavigation } from "./components/SiteNavigation";

export const metadata = {
  title: "SCRIMED | Governed Healthcare AI Pilots",
  description:
    "SCRIMED helps healthcare leaders buy governed AI workflow assessments, no-PHI demos, synthetic pilots, protected enterprise pilots, and investor-ready proof."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>
        <SiteNavigation />
        <div id="main-content">
          {children}
        </div>
        <SiteFooter />
      </body>
    </html>
  );
}
