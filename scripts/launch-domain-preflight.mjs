#!/usr/bin/env node

import dns from "node:dns/promises";

const primaryBaseUrl = (process.env.SCRIMED_PRIMARY_BASE_URL ?? "https://app.scrimedsolutions.com").replace(/\/$/, "");
const fallbackBaseUrl = (process.env.SCRIMED_FALLBACK_BASE_URL ?? "https://scrimed-site.vercel.app").replace(/\/$/, "");
const allowFallback = process.env.SCRIMED_ALLOW_DNS_FALLBACK === "1";

function hostFromUrl(url) {
  return new URL(url).hostname;
}

async function resolveHost(label, url) {
  const host = hostFromUrl(url);

  try {
    const addresses = await dns.lookup(host, { all: true });
    return {
      label,
      host,
      ok: true,
      addresses: addresses.map((address) => address.address)
    };
  } catch (error) {
    return {
      label,
      host,
      ok: false,
      code: error?.code ?? "UNKNOWN",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

async function requestHealth(label, baseUrl) {
  try {
    const [healthResponse, readinessResponse, launchResponse] = await Promise.all([
      fetch(`${baseUrl}/api/health`),
      fetch(`${baseUrl}/api/readiness`),
      fetch(`${baseUrl}/api/launch-readiness`)
    ]);
    const [healthText, readinessText, launchText] = await Promise.all([
      healthResponse.text(),
      readinessResponse.text(),
      launchResponse.text()
    ]);

    return {
      label,
      baseUrl,
      ok:
        healthResponse.ok &&
        readinessResponse.ok &&
        launchResponse.ok &&
        healthText.includes("scrimed") &&
        readinessText.includes("ready") &&
        launchText.includes("scrimed-launch-readiness"),
      statuses: {
        health: healthResponse.status,
        readiness: readinessResponse.status,
        launchReadiness: launchResponse.status
      },
      headers: {
        launchReadiness: launchResponse.headers.get("x-scrimed-launch-readiness"),
        fallbackAuthority: launchResponse.headers.get("x-scrimed-fallback-authority"),
        sandboxBypassAuthority: launchResponse.headers.get("x-scrimed-sandbox-bypass-authority")
      }
    };
  } catch (error) {
    return {
      label,
      baseUrl,
      ok: false,
      code: error?.cause?.code ?? error?.code ?? "REQUEST_FAILED",
      message: error instanceof Error ? error.message : String(error)
    };
  }
}

const primaryDns = await resolveHost("primary", primaryBaseUrl);
const primaryHealth = primaryDns.ok
  ? await requestHealth("primary", primaryBaseUrl)
  : {
      label: "primary",
      baseUrl: primaryBaseUrl,
      ok: false,
      skipped: true,
      reason: "dns-resolution-failed"
    };
const fallbackDns = primaryHealth.ok ? null : await resolveHost("fallback", fallbackBaseUrl);
const fallbackHealth = fallbackDns?.ok ? await requestHealth("fallback", fallbackBaseUrl) : null;
const classification = primaryHealth.ok
  ? "primary-domain-ready"
  : primaryDns.code === "ENOTFOUND" && fallbackHealth?.ok
    ? "sandbox-dns-failure-fallback-reachable"
    : fallbackHealth?.ok
      ? "primary-unavailable-fallback-reachable"
      : "launch-domain-preflight-failed";
const pass = primaryHealth.ok || (allowFallback && classification === "sandbox-dns-failure-fallback-reachable");

const report = {
  service: "scrimed-launch-domain-preflight",
  classification,
  pass,
  primary: {
    baseUrl: primaryBaseUrl,
    dns: primaryDns,
    health: primaryHealth
  },
  fallback: fallbackDns
    ? {
        baseUrl: fallbackBaseUrl,
        dns: fallbackDns,
        health: fallbackHealth
      }
    : null,
  boundary:
    "Fallback success is continuity evidence only. Launch approval still requires branded-domain smoke from an unrestricted or approved network.",
  allowFallback
};

console.log(JSON.stringify(report, null, 2));

if (!pass) {
  process.exitCode = 1;
}
