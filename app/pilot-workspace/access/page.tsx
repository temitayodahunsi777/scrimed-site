import Link from "next/link";
import ProtectedPilotAccess from "../ProtectedPilotAccess";
import { protectedPilotBoundary } from "../../lib/protectedPilotWorkspace";

export const metadata = {
  title: "SCRIMED Protected Pilot Access",
  description:
    "Authenticate into a tenant-isolated SCRIMED protected pilot workspace with durable synthetic evidence and audited proof packets."
};

export default function ProtectedPilotAccessPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/pilot-workspace">Protected Pilot Workspace</Link>
        <p className="eyebrow">Protected Pilot Access</p>
        <h1>Authenticated tenant access to governed synthetic pilot evidence.</h1>
        <p className="hero-text">{protectedPilotBoundary}</p>
      </section>

      <ProtectedPilotAccess
        supabasePublishableKey={supabasePublishableKey}
        supabaseUrl={supabaseUrl}
      />
    </main>
  );
}
