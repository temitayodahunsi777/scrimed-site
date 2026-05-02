
from __future__ import annotations

from enum import Enum
from typing import Any, Dict, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone
import uuid

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
import uvicorn


# ================================
# SCRIMED OS HUB v1.7
# Unifies: Command Center + Guardian + Spec-to-Agent + ROI
# ================================

class SystemStatus(str, Enum):
    ONLINE = "online"
    DEGRADED = "degraded"
    REVIEW_REQUIRED = "review_required"


class HubEventType(str, Enum):
    DECISION = "decision"
    GUARDIAN = "guardian"
    SPEC = "spec"
    ROI = "roi"
    DEPLOYMENT = "deployment"


class HubEvent(BaseModel):
    event_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    event_type: HubEventType
    title: str
    summary: str
    risk_level: str = "low"
    financial_impact: float = 0
    requires_human_review: bool = False
    metadata: Dict[str, Any] = Field(default_factory=dict)
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class DeploymentReadiness(BaseModel):
    ready_for_demo: bool
    ready_for_pilot: bool
    blockers: List[str]
    next_actions: List[str]
    score: float


class ScrimedOSHub:
    """
    Central operating layer for SCRIMED demo + deployment.
    This hub combines decisioning, safety, workflow generation, and ROI visibility
    into one investor/client-facing command interface.
    """

    def __init__(self):
        self.events: List[HubEvent] = []
        self.seed_demo()

    def seed_demo(self):
        if self.events:
            return

        self.record(HubEvent(
            event_type=HubEventType.DECISION,
            title="High-risk patient detected",
            summary="Ontology decision engine flagged missed follow-up + elevated BP.",
            risk_level="high",
            requires_human_review=True,
            metadata={
                "patient": "Demo Patient A",
                "decision": "same_day_clinician_review",
                "confidence": 0.92,
            },
        ))

        self.record(HubEvent(
            event_type=HubEventType.GUARDIAN,
            title="Guardian blocked unsafe external write",
            summary="RCM agent attempted claim submission with PHI + prior-auth risk. Human approval required.",
            risk_level="critical",
            requires_human_review=True,
            metadata={
                "agent": "scrimed-rcm-agent",
                "action": "submit_claim",
                "control": "external_write_approval",
            },
        ))

        self.record(HubEvent(
            event_type=HubEventType.SPEC,
            title="Spec converted to agent workflow",
            summary="Hypertension monitoring workflow generated with intake, care, education, RCM, and Trust agents.",
            risk_level="medium",
            requires_human_review=False,
            metadata={
                "workflow": "Hypertension Risk + Follow-up Workflow",
                "agent_steps": 5,
            },
        ))

        self.record(HubEvent(
            event_type=HubEventType.ROI,
            title="Revenue protection identified",
            summary="Prior-auth and denial-risk workflow projected $4,200 in revenue protected.",
            risk_level="low",
            financial_impact=4200,
            requires_human_review=False,
            metadata={
                "workflow": "Prior Auth + Denial Risk Review",
                "minutes_saved": 37,
            },
        ))

    def record(self, event: HubEvent) -> HubEvent:
        self.events.append(event)
        return event

    def summary(self) -> Dict[str, Any]:
        total = len(self.events)
        review = sum(1 for e in self.events if e.requires_human_review)
        critical = sum(1 for e in self.events if e.risk_level == "critical")
        high = sum(1 for e in self.events if e.risk_level == "high")
        financial = sum(e.financial_impact for e in self.events)

        status = SystemStatus.ONLINE
        if critical:
            status = SystemStatus.REVIEW_REQUIRED
        elif review:
            status = SystemStatus.DEGRADED

        return {
            "status": status,
            "total_events": total,
            "human_reviews_required": review,
            "critical_events": critical,
            "high_risk_events": high,
            "financial_impact": financial,
            "modules": {
                "command_center": "active",
                "guardian_layer": "active",
                "spec_to_agent": "active",
                "roi_engine": "active",
                "ontology_decision_layer": "active",
            },
        }

    def readiness(self) -> DeploymentReadiness:
        blockers: List[str] = []
        next_actions: List[str] = []

        summary = self.summary()

        if summary["critical_events"] > 0:
            blockers.append("Critical Guardian events require human-review workflow before real deployment.")

        if summary["human_reviews_required"] > 0:
            next_actions.append("Configure approval queue for clinician/admin review.")

        next_actions.extend([
            "Connect persistent database instead of in-memory event store.",
            "Add authentication and role-based access control.",
            "Package 30-day clinic pilot: intake + risk + RCM + ROI.",
            "Prepare synthetic demo dataset for investor and clinic walkthroughs.",
        ])

        score = 0.72
        if not blockers:
            score += 0.12
        if summary["financial_impact"] > 0:
            score += 0.08

        return DeploymentReadiness(
            ready_for_demo=True,
            ready_for_pilot=len(blockers) == 0,
            blockers=blockers,
            next_actions=next_actions,
            score=round(min(score, 1.0), 2),
        )

    def recent(self, limit: int = 25) -> List[HubEvent]:
        return self.events[-limit:][::-1]


hub = ScrimedOSHub()

app = FastAPI(title="SCRIMED OS Hub", version="1.7.0")


@app.get("/api/health")
def health():
    return {
        "status": "online",
        "service": "SCRIMED OS Hub",
        "version": "1.7.0",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


@app.post("/api/hub/event")
def record_event(event: HubEvent):
    return hub.record(event).model_dump()


@app.get("/api/hub/summary")
def summary():
    return hub.summary()


@app.get("/api/hub/readiness")
def readiness():
    return hub.readiness().model_dump()


@app.get("/api/hub/recent")
def recent():
    return {"events": [e.model_dump() for e in hub.recent()]}


@app.get("/", response_class=HTMLResponse)
def ui():
    return """
<!DOCTYPE html>
<html>
<head>
  <title>SCRIMED OS Hub</title>
  <style>
    body { margin:0; font-family:Inter, Arial, sans-serif; background:#070b14; color:#f8fafc; }
    header { padding:24px 32px; background:#020617; border-bottom:1px solid #1e293b; display:flex; justify-content:space-between; align-items:center; }
    .logo { font-size:26px; font-weight:900; letter-spacing:.4px; }
    .sub { color:#94a3b8; margin-top:4px; }
    .status { color:#22c55e; font-weight:900; }
    .grid { display:grid; grid-template-columns:repeat(4, 1fr); gap:18px; padding:22px; }
    .card { background:#0f172a; border:1px solid #1e293b; border-radius:18px; padding:20px; box-shadow:0 18px 50px rgba(0,0,0,.35); }
    .wide { grid-column:span 4; }
    .half { grid-column:span 2; }
    .label { color:#94a3b8; font-size:12px; text-transform:uppercase; }
    .value { margin-top:8px; font-size:30px; font-weight:900; }
    .green { color:#4ade80; } .blue { color:#60a5fa; } .orange { color:#fbbf24; } .red { color:#fb7185; }
    pre { white-space:pre-wrap; background:#020617; border:1px solid #334155; border-radius:14px; padding:14px; max-height:520px; overflow:auto; }
    button { background:#2563eb; color:white; border:0; padding:12px 16px; border-radius:12px; font-weight:800; cursor:pointer; margin-right:8px; }
    .module { background:#020617; border:1px solid #334155; padding:12px; border-radius:14px; margin:10px 0; display:flex; justify-content:space-between; }
    .pill { border-radius:999px; padding:4px 10px; font-size:12px; font-weight:900; background:#052e16; color:#4ade80; }
  </style>
</head>
<body>
  <header>
    <div>
      <div class="logo">SCRIMED OS Hub</div>
      <div class="sub">Unified command layer for healthcare decisions, safety, workflows, ROI, and deployment readiness</div>
    </div>
    <div class="status">● OPERATIONAL</div>
  </header>

  <div class="grid">
    <div class="card">
      <div class="label">System Status</div>
      <div class="value green" id="systemStatus">—</div>
    </div>
    <div class="card">
      <div class="label">Events</div>
      <div class="value blue" id="events">—</div>
    </div>
    <div class="card">
      <div class="label">Reviews Required</div>
      <div class="value orange" id="reviews">—</div>
    </div>
    <div class="card">
      <div class="label">Financial Impact</div>
      <div class="value green" id="impact">—</div>
    </div>

    <div class="card half">
      <h2>Active SCRIMED Modules</h2>
      <div id="modules"></div>
      <button onclick="loadHub()">Refresh Hub</button>
    </div>

    <div class="card half">
      <h2>Deployment Readiness</h2>
      <div class="label">Readiness Score</div>
      <div class="value blue" id="score">—</div>
      <pre id="readiness">Loading...</pre>
    </div>

    <div class="card wide">
      <h2>Recent Operating Events</h2>
      <pre id="recent">Loading...</pre>
    </div>
  </div>

<script>
async function loadHub() {
  const summaryRes = await fetch('/api/hub/summary');
  const summary = await summaryRes.json();

  document.getElementById('systemStatus').textContent = summary.status.toUpperCase();
  document.getElementById('events').textContent = summary.total_events;
  document.getElementById('reviews').textContent = summary.human_reviews_required;
  document.getElementById('impact').textContent = '$' + summary.financial_impact.toLocaleString();

  const modules = document.getElementById('modules');
  modules.innerHTML = '';
  Object.entries(summary.modules).forEach(([name, status]) => {
    const div = document.createElement('div');
    div.className = 'module';
    div.innerHTML = `<span>${name.replaceAll('_', ' ')}</span><span class="pill">${status}</span>`;
    modules.appendChild(div);
  });

  const readyRes = await fetch('/api/hub/readiness');
  const ready = await readyRes.json();
  document.getElementById('score').textContent = ready.score;
  document.getElementById('readiness').textContent = JSON.stringify(ready, null, 2);

  const recentRes = await fetch('/api/hub/recent');
  const recent = await recentRes.json();
  document.getElementById('recent').textContent = JSON.stringify(recent, null, 2);
}

loadHub();
</script>
</body>
</html>
    """


if __name__ == "__main__":
    uvicorn.run("scrimed_os_hub:app", host="127.0.0.1", port=8017, reload=True)
