const vercelPreviewHostnamePattern = /^[A-Za-z0-9.-]+\.vercel\.app$/;
const vercelShareTokenPattern = /^[A-Za-z0-9_-]{16,256}$/;
const vercelJwtPattern = /^[A-Za-z0-9._~-]{16,8192}$/;

function requirePreviewOrigin(value) {
  const url = new URL(value);
  if (
    url.protocol !== "https:"
    || !vercelPreviewHostnamePattern.test(url.hostname)
    || url.username
    || url.password
    || url.pathname !== "/"
    || url.search
    || url.hash
  ) {
    throw new Error("Expected a bare HTTPS vercel.app preview origin.");
  }
  return url.origin;
}

export function parseVercelPreviewShareUrl(value, expectedOrigin) {
  if (!value) return null;
  const origin = requirePreviewOrigin(expectedOrigin);
  const url = new URL(value);
  const shareValues = url.searchParams.getAll("_vercel_share");
  if (
    url.protocol !== "https:"
    || url.origin !== origin
    || url.username
    || url.password
    || url.pathname !== "/"
    || url.hash
    || [...url.searchParams.keys()].some((key) => key !== "_vercel_share")
    || shareValues.length !== 1
    || !vercelShareTokenPattern.test(shareValues[0])
  ) {
    throw new Error("Vercel preview access must be a same-origin, single-use share URL.");
  }
  return url.href;
}

export function parseVercelPreviewAccessCookie(value) {
  if (!value) return null;
  if (/\r|\n|;/.test(value)) {
    throw new Error("Vercel preview access cookie is malformed.");
  }
  const separator = value.indexOf("=");
  const name = value.slice(0, separator);
  const cookieValue = value.slice(separator + 1);
  if (separator < 1 || name !== "_vercel_jwt" || !vercelJwtPattern.test(cookieValue)) {
    throw new Error("Vercel preview access cookie is malformed.");
  }
  return { name, value: cookieValue, header: `${name}=${cookieValue}` };
}

function extractVercelJwt(headers) {
  const values = typeof headers.getSetCookie === "function"
    ? headers.getSetCookie()
    : [headers.get("set-cookie")].filter(Boolean);
  const cookie = values
    .map((value) => value.split(";", 1)[0])
    .find((value) => value.startsWith("_vercel_jwt="));
  return parseVercelPreviewAccessCookie(cookie)?.header ?? null;
}

export async function obtainVercelPreviewAccessCookie({
  shareUrl,
  expectedOrigin,
  fetchImplementation = globalThis.fetch,
  timeoutMs = 20_000
}) {
  const parsedShareUrl = parseVercelPreviewShareUrl(shareUrl, expectedOrigin);
  if (!parsedShareUrl) return null;
  if (typeof fetchImplementation !== "function") {
    throw new Error("A fetch implementation is required for Vercel preview access.");
  }
  const response = await fetchImplementation(parsedShareUrl, {
    redirect: "manual",
    signal: AbortSignal.timeout(timeoutMs),
    headers: { Accept: "text/html" }
  });
  if (![200, 302, 303, 307, 308].includes(response.status)) {
    throw new Error(`Vercel preview share exchange returned ${response.status}.`);
  }
  const cookie = extractVercelJwt(response.headers);
  if (!cookie) {
    throw new Error("Vercel preview share exchange did not issue an access cookie.");
  }
  return cookie;
}
