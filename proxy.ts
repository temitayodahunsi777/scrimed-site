import { NextRequest, NextResponse } from "next/server";

const scrubbedRequestHeaders = [
  "x-middleware-subrequest",
  "x-scrimed-debug-token",
  "x-debug-token",
  "x-token",
  "x-api-key",
  "x-forwarded-access-token",
  "x-supabase-auth-token"
];

export function proxy(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  let scrubbed = false;

  for (const header of scrubbedRequestHeaders) {
    if (requestHeaders.has(header)) {
      requestHeaders.delete(header);
      scrubbed = true;
    }
  }

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  response.headers.set("X-SCRIMED-Proxy-Guard", "active");
  response.headers.set("X-SCRIMED-Middleware-Bypass-Header", scrubbed ? "stripped" : "not-present");
  response.headers.set(
    "X-SCRIMED-Request-Sanitization",
    scrubbed ? "suspicious-forwarded-headers-removed" : "no-suspicious-forwarded-headers"
  );

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"]
};
