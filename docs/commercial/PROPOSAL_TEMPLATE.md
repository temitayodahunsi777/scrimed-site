# SCRIMED Proposal Template

Status: **INTERNAL DRAFT / HUMAN COMMERCIAL APPROVAL REQUIRED**

## Proposal Control Record

| Field | Value |
| --- | --- |
| proposal ID |  |
| buyer alias |  |
| version |  |
| offer | `Workflow Intelligence Assessment` |
| scope fingerprint |  |
| pricing fingerprint |  |
| candidate fingerprint |  |
| created at |  |
| expires at |  |
| approval state | `DRAFT` |
| commercial approver |  |

A proposal becomes `STALE` when scope, price, candidate, terms, or expiry changes. A stale proposal
cannot be sent, accepted, or used as authority.

## Buyer Problem

Describe the workflow problem using approved business information only. Do not include PHI,
patient records, fabricated outcomes, customer names without permission, or unsupported claims.

## Proposed Scope

- current workflow and workflow graph;
- bottlenecks, handoffs, cycle-time burden, and rework;
- control and evidence gaps;
- automation candidates;
- bounded synthetic-pilot recommendation;
- executive readout.

Default controls:

```text
NO_PHI=true
NONPRODUCTION=true
clinicalExecution=false
payerSubmission=false
ehrWriteback=false
deviceWriteback=false
```

## Deliverables

| Deliverable | Acceptance criterion | Evidence owner |
| --- | --- | --- |
| workflow map |  |  |
| bottleneck and control-gap analysis |  |  |
| synthetic scenario set |  |  |
| evidence packet |  |  |
| executive readout |  |  |

## Success Criteria

Define workflow steps, cycle time, rework, review burden, correction burden, policy adherence,
evidence completeness, model cost, and cost per accepted output before execution. Results must be
labeled `VERIFIED`, `ESTIMATED`, `SIMULATED`, or `UNAVAILABLE`.

## Commercial Terms

Pricing is nonbinding until an authorized human approves the exact scope and pricing fingerprints.
Protected Enterprise Pilot and Enterprise Operating License remain `CUSTOM_SCOPE_REQUIRED`.
SCRIMED agents cannot quote binding terms, sign, accept terms, issue discounts, commit delivery
dates, promise production, or activate a customer.

## Assumptions, Exclusions, And Dependencies

- no live PHI or patient data;
- no production integration or system-of-record mutation;
- no clinical diagnosis, treatment, triage, payer decision, claim submission, or EHR/device writeback;
- buyer provides authorized non-sensitive workflow information;
- any protected pilot requires a separate approved agreement and all listed prerequisites.

## Approval

| Decision | Named approver | Timestamp | Conditions | Evidence reference |
| --- | --- | --- | --- | --- |
| `DRAFT` |  |  |  |  |

Only an authorized human may transition the proposal to an approved send state. Approval of a
proposal does not authorize merge, migration, deployment, PHI, clinical action, production,
protected-pilot activation, or customer go-live.
