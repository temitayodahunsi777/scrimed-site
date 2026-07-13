export type VoiceSessionState =
  | "idle"
  | "listening"
  | "processing"
  | "speaking"
  | "interrupted"
  | "tool_wait"
  | "approval_wait"
  | "reconnecting"
  | "ended"
  | "failed";

export type VoiceSimulationInput = {
  transcript: string;
  language?: string;
  consentAcknowledged?: boolean;
};

export function simulateVoiceWorkflow(input: VoiceSimulationInput) {
  const emergencyLanguageDetected = /\b(chest pain|can't breathe|suicide|stroke|overdose|emergency)\b/i.test(input.transcript);
  const consentAcknowledged = input.consentAcknowledged === true;
  const states: VoiceSessionState[] = ["idle", "listening", "processing"];

  if (!consentAcknowledged) {
    states.push("approval_wait", "ended");
  } else if (emergencyLanguageDetected) {
    states.push("interrupted", "ended");
  } else {
    states.push("speaking", "ended");
  }

  return {
    service: "scrimed-work-voice-simulation",
    syntheticDemoMode: true,
    language: input.language ?? "en-US",
    states,
    consentAcknowledged,
    emergencyLanguageDetected,
    shortVerbalPreamble: "I can help prepare a reviewable workflow draft, but a human reviewer remains responsible.",
    concurrentListeningSpeakingSupported: false,
    rawAudioStored: false,
    transcriptionRetentionPolicy: "metadata-only-no-raw-audio-by-default",
    toolCallStatusAnnouncement: "Tool calls are simulated and approval-gated.",
    escalationMessage: emergencyLanguageDetected
      ? "This may be urgent. Stop autonomous processing and contact emergency services or a qualified clinician immediately."
      : null,
    retainedBoundary:
      "Voice workflow is simulation-only and does not diagnose, treat, prescribe, triage emergencies, outreach patients, or store raw audio."
  };
}
