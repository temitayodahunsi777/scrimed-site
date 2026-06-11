import type { PilotIntakeHandoffPayload } from "./pilotIntake";

export type PilotIntakePersistenceResult = {
  configured: boolean;
  retained: boolean;
  detail: string;
};

function getPilotIntakeStoreConfiguration() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    publishableKey:
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
      "",
    persistenceToken: process.env.SCRIMED_PILOT_INTAKE_PERSISTENCE_TOKEN ?? ""
  };
}

export function isPilotIntakeStoreConfigured() {
  const configuration = getPilotIntakeStoreConfiguration();
  return Boolean(configuration.url && configuration.publishableKey && configuration.persistenceToken);
}

export async function persistPilotIntake(
  payload: PilotIntakeHandoffPayload
): Promise<PilotIntakePersistenceResult> {
  const configuration = getPilotIntakeStoreConfiguration();

  if (!configuration.url || !configuration.publishableKey || !configuration.persistenceToken) {
    return {
      configured: false,
      retained: false,
      detail: "Durable pilot intake storage is not configured."
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `${configuration.url}/rest/v1/rpc/record_pilot_intake_submission`,
      {
        method: "POST",
        headers: {
          apikey: configuration.publishableKey,
          "Content-Type": "application/json",
          "x-scrimed-intake-token": configuration.persistenceToken
        },
        body: JSON.stringify({ p_payload: payload }),
        cache: "no-store",
        signal: controller.signal
      }
    );

    if (!response.ok) {
      return {
        configured: true,
        retained: false,
        detail: `Durable pilot intake storage returned ${response.status}.`
      };
    }

    const submissionId: unknown = await response.json();

    return {
      configured: true,
      retained: typeof submissionId === "string",
      detail:
        typeof submissionId === "string"
          ? "Validated no-PHI intake was retained in the private enterprise intake ledger."
          : "Durable pilot intake storage returned an unexpected response."
    };
  } catch {
    return {
      configured: true,
      retained: false,
      detail: "Durable pilot intake storage did not accept the request within the persistence timeout."
    };
  } finally {
    clearTimeout(timeout);
  }
}
