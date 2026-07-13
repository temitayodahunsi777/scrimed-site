from pathlib import Path


ROOT = Path(__file__).resolve().parents[2]
STACK = ROOT / "app" / "lib" / "scrimedIntelligenceSafetyStack.ts"


def test_sentinel_deny_by_default_contract():
    text = STACK.read_text()
    assert "denyByDefault: true" in text
    assert "human_approval_required" in text
    assert "kill_switch_triggered" in text
    assert "privilege_escalation_attempt" in text


def test_clinical_correctness_contract():
    text = STACK.read_text()
    assert "correctnessNotGuaranteed: true" in text
    assert "clinicianInLoopRequired: true" in text
    assert "unsupported recommendation" in text
    assert "Capability demonstrations are not correctness guarantees." in text


def test_no_phi_data_adapter_contract():
    text = STACK.read_text()
    assert "rawPayloadLogging: \"blocked\"" in text
    assert "coordinate_level_redaction_required" in text
    assert "DocLang-style" in text
    assert "metadata_only_no_secret_no_phi" in text
