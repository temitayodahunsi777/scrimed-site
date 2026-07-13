# SCRIMED Hybrid Retrieval Engine

SCRIMED Hybrid Retrieval combines keyword/BM25 scoring, vector similarity scoring, ontology boost, knowledge graph boost, citation requirements, and source trust tiers.

## Retrieval Contract

- Keyword/BM25 placeholder scoring
- Vector similarity placeholder scoring
- Ontology boost placeholder
- Knowledge graph boost placeholder
- Unified ranking function
- Citation-required flag
- Source trust tier
- Clinical setting: do not answer without evidence

## Safety Boundary

Clinical settings require evidence, citations, uncertainty, and human review. This engine does not authorize diagnosis, treatment, prescribing, EHR writeback, payer submission, or answer generation without evidence.

## Routes

- `/scrimed-hybrid-retrieval`
- `/api/scrimed-hybrid-retrieval`
- `/api/scrimed-hybrid-retrieval/brief`
