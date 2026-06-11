import Link from "next/link";
import { getSalesOperationsSummary } from "../lib/salesOperations";
import SalesOperationsConsole from "./SalesOperationsConsole";

export const metadata = {
  title: "SCRIMED Sales Operations",
  description:
    "Tenant-admin opportunity operations for governed SCRIMED synthetic pilots, enterprise assessments, audited proposals, and controlled CRM handoff."
};

export default function SalesOperationsPage() {
  const summary = getSalesOperationsSummary();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return (
    <main>
      <section className="page-hero">
        <Link className="back-link" href="/hub">SCRIMED OS Hub</Link>
        <p className="eyebrow">SCRIMED Sales Operations</p>
        <h1>Convert governed buyer intake into owned, auditable pilot opportunities.</h1>
        <p className="hero-text">{summary.boundary}</p>
      </section>

      <SalesOperationsConsole
        supabasePublishableKey={supabasePublishableKey}
        supabaseUrl={supabaseUrl}
      />
    </main>
  );
}
