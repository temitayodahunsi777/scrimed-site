export const defaultPublicSmokeTimeoutMs = 20_000;
export const defaultPublicSmokeMaxResponseBytes = 5_000_000;
export const defaultPublicSmokeMaxAttempts = 2;

function parseBoundedInteger(value, {
  fallback,
  label,
  minimum,
  maximum
}) {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} through ${maximum}.`);
  }

  return parsed;
}

export function normalizePublicSmokeBaseUrl(value, fallback) {
  const candidate = String(value ?? fallback ?? "").trim();
  let url;

  try {
    url = new URL(candidate);
  } catch {
    throw new Error("SCRIMED public smoke base URL must be a valid absolute URL.");
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new Error("SCRIMED public smoke base URL must use HTTP or HTTPS.");
  }

  if (url.username || url.password) {
    throw new Error("SCRIMED public smoke base URL must not contain credentials.");
  }

  if ((url.pathname && url.pathname !== "/") || url.search || url.hash) {
    throw new Error("SCRIMED public smoke base URL must be an origin without a path, query, or fragment.");
  }

  return url.origin;
}

export function parsePublicSmokeTimeoutMs(value) {
  return parseBoundedInteger(value, {
    fallback: defaultPublicSmokeTimeoutMs,
    label: "SCRIMED_SMOKE_REQUEST_TIMEOUT_MS",
    minimum: 1_000,
    maximum: 120_000
  });
}

export function parsePublicSmokeMaxResponseBytes(value) {
  return parseBoundedInteger(value, {
    fallback: defaultPublicSmokeMaxResponseBytes,
    label: "SCRIMED_SMOKE_MAX_RESPONSE_BYTES",
    minimum: 1_024,
    maximum: 20_000_000
  });
}

export function parsePublicSmokeMaxAttempts(value) {
  return parseBoundedInteger(value, {
    fallback: defaultPublicSmokeMaxAttempts,
    label: "SCRIMED_SMOKE_MAX_ATTEMPTS",
    minimum: 1,
    maximum: 3
  });
}

function isRetryableStatus(status) {
  return [408, 425, 429, 500, 502, 503, 504].includes(status);
}

function waitForRetry(delayMs) {
  return new Promise((resolve) => setTimeout(resolve, delayMs));
}

export async function boundedPublicFetch(
  input,
  init = {},
  {
    timeoutMs = defaultPublicSmokeTimeoutMs,
    fetchImplementation = globalThis.fetch,
    maxAttempts = 1,
    retryDelayMs = 150
  } = {}
) {
  if (typeof fetchImplementation !== "function") {
    throw new Error("A fetch implementation is required for public smoke requests.");
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Public smoke request timeout must be a positive integer.");
  }

  if (!Number.isInteger(maxAttempts) || maxAttempts < 1 || maxAttempts > 3) {
    throw new Error("Public smoke request attempts must be an integer from 1 through 3.");
  }

  if (!Number.isInteger(retryDelayMs) || retryDelayMs < 0 || retryDelayMs > 5_000) {
    throw new Error("Public smoke retry delay must be an integer from 0 through 5000.");
  }

  if (init.signal) {
    throw new Error("Public smoke callers must not override the bounded request signal.");
  }

  const method = String(init.method ?? "GET").toUpperCase();
  if (maxAttempts > 1 && method !== "GET" && method !== "HEAD") {
    throw new Error("Public smoke mutation requests must remain single-attempt.");
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetchImplementation(input, {
        ...init,
        signal: controller.signal
      });

      if (attempt < maxAttempts && isRetryableStatus(response.status)) {
        await response.body?.cancel().catch(() => undefined);
        await waitForRetry(retryDelayMs);
        continue;
      }

      return response;
    } catch (error) {
      const finalError = controller.signal.aborted
        ? Object.assign(
            new Error(`Public smoke request timed out after ${timeoutMs}ms.`),
            { name: "TimeoutError", cause: error }
          )
        : error;

      if (attempt === maxAttempts) {
        throw finalError;
      }

      await waitForRetry(retryDelayMs);
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new Error("Public smoke request exhausted its bounded retry budget.");
}

export async function readBoundedResponseText(
  response,
  maxBytes = defaultPublicSmokeMaxResponseBytes,
  { timeoutMs = defaultPublicSmokeTimeoutMs } = {}
) {
  if (!Number.isInteger(maxBytes) || maxBytes <= 0) {
    throw new Error("Public smoke response limit must be a positive integer.");
  }

  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Public smoke response timeout must be a positive integer.");
  }

  const declaredLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(declaredLength) && declaredLength > maxBytes) {
    throw new Error(
      `Public smoke response declared ${declaredLength} bytes; maximum is ${maxBytes}.`
    );
  }

  if (!response.body) {
    return "";
  }

  const reader = response.body.getReader();
  const chunks = [];
  let actualLength = 0;
  const deadline = Date.now() + timeoutMs;

  try {
    while (true) {
      const remainingMs = deadline - Date.now();
      if (remainingMs <= 0) {
        const timeoutError = new Error(
          `Public smoke response timed out after ${timeoutMs}ms.`
        );
        timeoutError.name = "TimeoutError";
        throw timeoutError;
      }

      let timeout;
      const chunk = await Promise.race([
        reader.read(),
        new Promise((_, reject) => {
          timeout = setTimeout(() => {
            const timeoutError = new Error(
              `Public smoke response timed out after ${timeoutMs}ms.`
            );
            timeoutError.name = "TimeoutError";
            reject(timeoutError);
          }, remainingMs);
        })
      ]).finally(() => clearTimeout(timeout));

      if (chunk.done) {
        break;
      }

      actualLength += chunk.value.byteLength;
      if (actualLength > maxBytes) {
        throw new Error(
          `Public smoke response contained more than ${maxBytes} bytes.`
        );
      }

      chunks.push(chunk.value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }

  const body = new Uint8Array(actualLength);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return new TextDecoder().decode(body);
}
