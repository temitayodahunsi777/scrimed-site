"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useState } from "react";

type PasskeyRecord = {
  id: string;
  friendly_name?: string;
  created_at: string;
  last_used_at?: string;
};

type PanelStatus = "loading" | "ready" | "saving" | "error";

function formatDate(value?: string) {
  if (!value) {
    return "Not recorded";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function passkeyName(passkey: PasskeyRecord, index: number) {
  return passkey.friendly_name?.trim() || `Passkey ${index + 1}`;
}

export default function PasskeyManagementPanel({
  supabase,
  surface
}: {
  supabase: SupabaseClient;
  surface: string;
}) {
  const [status, setStatus] = useState<PanelStatus>("loading");
  const [message, setMessage] = useState("");
  const [passkeys, setPasskeys] = useState<PasskeyRecord[]>([]);
  const [draftNames, setDraftNames] = useState<Record<string, string>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState("");

  const passkeyCountLabel = useMemo(
    () => `${passkeys.length} enrolled ${passkeys.length === 1 ? "passkey" : "passkeys"}`,
    [passkeys.length]
  );

  const loadPasskeys = useCallback(async () => {
    setStatus("loading");
    setMessage("");

    const { data, error } = await supabase.auth.passkey.list();

    if (error) {
      setStatus("error");
      setMessage(error.message);
      return;
    }

    const nextPasskeys = (data ?? []) as PasskeyRecord[];
    setPasskeys(nextPasskeys);
    setDraftNames(
      Object.fromEntries(
        nextPasskeys.map((passkey, index) => [
          passkey.id,
          passkeyName(passkey, index)
        ])
      )
    );
    setPendingDeleteId("");
    setStatus("ready");
  }, [supabase]);

  useEffect(() => {
    let active = true;

    async function initializePasskeys() {
      const { data, error } = await supabase.auth.passkey.list();

      if (!active) {
        return;
      }

      if (error) {
        setStatus("error");
        setMessage(error.message);
        return;
      }

      const nextPasskeys = (data ?? []) as PasskeyRecord[];
      setPasskeys(nextPasskeys);
      setDraftNames(
        Object.fromEntries(
          nextPasskeys.map((passkey, index) => [
            passkey.id,
            passkeyName(passkey, index)
          ])
        )
      );
      setPendingDeleteId("");
      setStatus("ready");
    }

    void initializePasskeys();

    return () => {
      active = false;
    };
  }, [supabase]);

  async function registerPasskey() {
    setStatus("saving");
    setMessage("");

    const { data, error } = await supabase.auth.registerPasskey();

    if (error) {
      setStatus("ready");
      setMessage(error.message);
      return;
    }

    setMessage(
      `Passkey registered${data.friendly_name ? `: ${data.friendly_name}` : ""}. Future sign-in can use the passkey button.`
    );
    await loadPasskeys();
  }

  async function renamePasskey(passkey: PasskeyRecord) {
    const friendlyName = (draftNames[passkey.id] ?? "").trim().slice(0, 120);

    if (!friendlyName) {
      setMessage("Enter a passkey name before saving.");
      return;
    }

    setStatus("saving");
    setMessage("");

    const { error } = await supabase.auth.passkey.update({
      friendlyName,
      passkeyId: passkey.id
    });

    if (error) {
      setStatus("ready");
      setMessage(error.message);
      return;
    }

    setMessage("Passkey name updated.");
    await loadPasskeys();
  }

  async function revokePasskey(passkey: PasskeyRecord) {
    if (pendingDeleteId !== passkey.id) {
      setPendingDeleteId(passkey.id);
      setMessage(`Confirm revocation for ${passkey.friendly_name || "this passkey"}.`);
      return;
    }

    setStatus("saving");
    setMessage("");

    const { error } = await supabase.auth.passkey.delete({ passkeyId: passkey.id });

    if (error) {
      setStatus("ready");
      setMessage(error.message);
      return;
    }

    setMessage("Passkey revoked. Magic-link sign-in and any remaining enrolled passkeys stay available.");
    await loadPasskeys();
  }

  return (
    <section className="table-section" aria-label={`${surface} passkey management`}>
      <div className="section-heading">
        <p className="eyebrow">Passkey management</p>
        <h2>Manage phishing-resistant sign-in for {surface}.</h2>
        <p className="section-copy">
          {passkeyCountLabel}. Passkeys improve sign-in protection; tenant role checks, AAL2/TOTP mutation gates,
          RLS, audit logging, and human review remain enforced separately.
        </p>
        <div className="form-actions">
          <button
            className="primary-action"
            disabled={status === "saving"}
            onClick={registerPasskey}
            type="button"
          >
            {status === "saving" ? "Processing Passkey" : "Register Passkey"}
          </button>
          <button
            className="secondary-action"
            disabled={status === "loading" || status === "saving"}
            onClick={() => loadPasskeys()}
            type="button"
          >
            Refresh
          </button>
        </div>
        {message ? <div className="intake-alert">{message}</div> : null}
      </div>

      {passkeys.length > 0 ? (
        passkeys.map((passkey, index) => (
          <article className="module-row" key={passkey.id}>
            <div>
              <span>{passkey.last_used_at ? `Last used ${formatDate(passkey.last_used_at)}` : "Never used"}</span>
              <h2>{passkeyName(passkey, index)}</h2>
              <p>Created {formatDate(passkey.created_at)}</p>
            </div>
            <label className="form-field">
              <span>Friendly name</span>
              <input
                maxLength={120}
                onChange={(event) =>
                  setDraftNames((current) => ({
                    ...current,
                    [passkey.id]: event.target.value
                  }))
                }
                value={draftNames[passkey.id] ?? ""}
              />
            </label>
            <button
              className="secondary-action"
              disabled={status === "saving"}
              onClick={() => renamePasskey(passkey)}
              type="button"
            >
              Save Name
            </button>
            <button
              className="secondary-action"
              disabled={status === "saving"}
              onClick={() => revokePasskey(passkey)}
              type="button"
            >
              {pendingDeleteId === passkey.id ? "Confirm Revoke" : "Revoke"}
            </button>
          </article>
        ))
      ) : (
        <article className="module-row">
          <div>
            <span>{status === "loading" ? "loading" : "not enrolled"}</span>
            <h2>No passkeys are registered for this identity.</h2>
          </div>
          <p>Register a passkey after sign-in to reduce phishing risk while preserving existing governance gates.</p>
          <strong>Magic-link sign-in remains available for approved identities.</strong>
        </article>
      )}
    </section>
  );
}
