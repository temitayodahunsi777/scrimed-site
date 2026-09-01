# Verified Intelligence Yield Worksheet

Status: **INTERNAL / SYNTHETIC OR ESTIMATED UNTIL VERIFIED**

Use this worksheet only for a bounded, approved pilot scope. Select metrics before execution and
retain evidence references for every accepted output and cost input.

## Pilot Binding

| Field | Value |
| --- | --- |
| pilot ID |  |
| buyer alias |  |
| workflow |  |
| candidate fingerprint |  |
| scenario version |  |
| measurement window |  |
| evidence owner |  |
| approval state | `DRAFT` |

## Yield Inputs

| Measure | Value | Unit | Evidence class | Evidence reference | Owner |
| --- | ---: | --- | --- | --- | --- |
| accepted useful evidence-backed outputs |  | count | `SIMULATED` |  |  |
| model cost |  | USD | `ESTIMATED` |  |  |
| retry cost |  | USD | `ESTIMATED` |  |  |
| correction effort |  | minutes | `ESTIMATED` |  |  |
| correction effort cost basis |  | USD | `ESTIMATED` |  |  |
| reviewer burden |  | minutes | `ESTIMATED` |  |  |
| reviewer burden cost basis |  | USD | `ESTIMATED` |  |  |

Convert correction effort and reviewer burden to the documented cost basis before combining them
with monetary costs.

```text
VIY = accepted useful evidence-backed outputs
      / (model cost + retry cost + correction effort cost + reviewer burden cost)
```

| Result | Value | Unit | Evidence class |
| --- | ---: | --- | --- |
| Verified Intelligence Yield |  | accepted outputs per USD | `SIMULATED` |

Allowed evidence classes are `VERIFIED`, `ESTIMATED`, `SIMULATED`, and `UNAVAILABLE`. `VERIFIED`
requires reproducible source evidence and named review; synthetic execution alone is `SIMULATED`.
This worksheet does not authorize a customer outcome, savings guarantee, clinical claim, binding
quote, production deployment, or protected-pilot expansion.
