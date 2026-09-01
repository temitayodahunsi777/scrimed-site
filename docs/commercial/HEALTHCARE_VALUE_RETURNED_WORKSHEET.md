# Healthcare Value Returned Worksheet

Status: **INTERNAL / NO CUSTOMER OR CLINICAL CLAIM AUTHORITY**

## Measurement Binding

| Field | Value |
| --- | --- |
| pilot ID |  |
| buyer alias |  |
| workflow |  |
| baseline period |  |
| comparison period |  |
| candidate fingerprint |  |
| evidence owner |  |
| review owner |  |

## Value Measures

| Measure | Baseline | Observed | Delta | Unit | Classification | Evidence reference |
| --- | ---: | ---: | ---: | --- | --- | --- |
| time returned |  |  |  | minutes | `UNAVAILABLE` |  |
| workflow steps removed |  |  |  | count | `UNAVAILABLE` |  |
| rework avoided |  |  |  | events | `UNAVAILABLE` |  |
| estimated cost avoided |  |  |  | USD | `UNAVAILABLE` |  |
| evidence completeness improvement |  |  |  | percentage points | `UNAVAILABLE` |  |
| reviewer burden |  |  |  | minutes | `UNAVAILABLE` |  |
| corrections required |  |  |  | count | `UNAVAILABLE` |  |

Use exactly one classification for each result:

- `VERIFIED`: supported by reproducible evidence and named review.
- `ESTIMATED`: calculated from documented assumptions.
- `SIMULATED`: produced by synthetic or test execution.
- `UNAVAILABLE`: evidence is absent or insufficient.

## Assumptions And Limitations

| Assumption or limitation | Evidence or rationale | Sensitivity | Owner |
| --- | --- | --- | --- |
|  |  |  |  |

Do not aggregate mixed classifications into a verified customer claim. Association is not
causality. This worksheet cannot authorize pricing, a savings guarantee, reimbursement, clinical
outcomes, protected-pilot expansion, production use, or external publication.
