const vercelPreviewHostnamePattern = /^(?:[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?\.)+vercel\.app$/;
const vercelShareTokenPattern = /^[A-Za-z0-9_-]{16,256}$/;
const vercelJwtPattern = /^[A-Za-z0-9._~-]{16,8192}$/;

export function normalizeVercelPreviewOrigin(value) {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error("Expected a bare HTTPS vercel.app preview origin.");
  }
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
  const origin = normalizeVercelPreviewOrigin(expectedOrigin);
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

export function bindVercelPreviewAccessCookie({ cookie, accessOrigin, requestOrigin }) {
  const parsed = parseVercelPreviewAccessCookie(cookie);
  if (!parsed) return null;
  const boundOrigin = normalizeVercelPreviewOrigin(accessOrigin);
  const normalizedRequestOrigin = normalizeVercelPreviewOrigin(requestOrigin);
  if (normalizedRequestOrigin !== boundOrigin) {
    throw new Error("Vercel preview access cookie origin does not match the request origin.");
  }
  return { ...parsed, origin: boundOrigin };
}

export async function resolveVercelPreviewAccess({
  shareUrl,
  inheritedCookie,
  inheritedAccessOrigin,
  expectedOrigin,
  fetchImplementation = globalThis.fetch,
  timeoutMs = 20_000
}) {
  const hasShareUrl = typeof shareUrl === "string" && shareUrl.length > 0;
  const hasInheritedCookie = typeof inheritedCookie === "string" && inheritedCookie.length > 0;
  if (hasShareUrl && hasInheritedCookie) {
    throw new Error("Vercel preview access must use either a share URL or a bound inherited cookie, not both.");
  }
  if (hasShareUrl) {
    const origin = normalizeVercelPreviewOrigin(expectedOrigin);
    const cookie = await obtainVercelPreviewAccessCookie({
      shareUrl,
      expectedOrigin: origin,
      fetchImplementation,
      timeoutMs
    });
    return cookie ? { cookie, origin, source: "share-exchange" } : null;
  }
  if (hasInheritedCookie) {
    const bound = bindVercelPreviewAccessCookie({
      cookie: inheritedCookie,
      accessOrigin: inheritedAccessOrigin,
      requestOrigin: expectedOrigin
    });
    return bound ? { cookie: bound.header, origin: bound.origin, source: "inherited-bound-cookie" } : null;
  }
  return null;
}

export function applyVercelPreviewAccessToEnvironment(environment, access) {
  const next = { ...environment };
  delete next.SCRIMED_PREVIEW_ACCESS_COOKIE;
  delete next.SCRIMED_PREVIEW_ACCESS_ORIGIN;
  delete next.SCRIMED_VERCEL_SHARE_URL;
  if (access) {
    next.SCRIMED_PREVIEW_ACCESS_COOKIE = access.cookie;
    next.SCRIMED_PREVIEW_ACCESS_ORIGIN = access.origin;
  }
  return next;
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
