
export async function GET() {
  return Response.json({
    events: ["system_initialized", "vercel_deployed"]
  });
}
