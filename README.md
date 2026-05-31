# BPMN-AI

AI-powered BPMN visualization workspace for turning unstructured process input into BPMN 2.0 models, validating model quality, and enabling process intelligence for business and technical stakeholders.

## Version 1 Production Foundation

This repository now defines a production-foundation scope centered on:

- AI process intake (text/document-to-process extraction)
- BPMN 2.0 XML generation and browser rendering support
- Interactive BPMN canvas (layers, drilldown, overlays, swimlanes)
- BPMN structural + semantic validation indicators
- AI copilot for explanation, improvement suggestions, and alternate views
- Source-to-model traceability and ambiguity detection
- Documentation generation (SOP, controls, RACI, summary artifacts)
- Process library/versioning and role-based access support

## Core Modules

1. **AI Process Intake Studio**
   - natural language/document ingestion
   - process type detection
   - traceability links and confidence scoring
   - ambiguity detection before model finalization
2. **AI BPMN Model Generator**
   - BPMN 2.0 XML generation
   - BPMN primitive mapping and gateway logic extraction
   - auto-layout and sub-process generation
3. **Interactive BPMN Visualization Canvas**
   - multi-layer process views
   - semantic overlays
   - role-based swimlanes
   - BPMN health scoring
4. **AI Process Copilot**
   - process Q&A on nodes, gateways, lanes, controls, and risks
   - future-state recommendations
   - documentation and implementation artifact generation

## Reference Scenario

The reference process is the **Construction Measures CAPEX / NR OPEX lifecycle** (NR = Non-Recurring) with major phases:

1. Initiation
2. Governance and Budget Approval
3. Design, Tendering, and Award
4. Execution
5. Commissioning and Closeout

See `docs/construction-measures-process.bpmn` for a baseline BPMN model and `docs/process-canonical-schema.json` for the canonical process data structure.