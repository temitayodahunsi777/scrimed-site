export const dynamic = "force-dynamic";

export async function GET() {
  return Response.json({
    status: "ok",
    system: "SCRIMED OS Hub",
    version: "1.7.3"
  });
}
