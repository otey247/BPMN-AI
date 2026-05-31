import type {
  Ambiguity,
  GeneratedProcess,
  IntegrationPoint,
  ProcessControl,
  ProcessGateway,
  ProcessNode,
  SimulationScenario,
  ValidationIssue,
} from './domain'

export const sampleConstructionDescription = `Construction measure requested by a demand owner. Validate the request, classify it as CAPEX or Non-Recurring OPEX, perform feasibility and economic viability review, submit qualifying projects to steering committee approval, release the project and allocate budget in ERP. Compile tender package, run technical, legal, compliance, procurement and commercial reviews in parallel, publish tender, receive bids, evaluate bids, negotiate terms, award and sign contract. During construction supervise work, manage change orders with technical necessity, cost impact and approval routing, verify milestones and invoices. At closeout perform technical acceptance, remediate defects, hand over to facility management, verify final invoice, capitalize asset and close the project ledger.`

const phases = [
  'Initiation',
  'Governance and Budget Approval',
  'Design, Tendering, and Award',
  'Execution',
  'Commissioning and Closeout',
]

const lanes = [
  'Business Unit / Demand Owner',
  'Facility Management',
  'Corporate Real Estate',
  'Engineering / Technical Experts',
  'Finance / Controlling',
  'Steering Committee / Board',
  'Legal / Compliance',
  'Procurement',
  'Vendor / Contractor',
  'ERP / Finance Systems',
]

const baseNodes: ProcessNode[] = [
  node('start', 'Construction Measure Requested', 'startEvent', 'Initiation', 'Business Unit / Demand Owner', 0, 'low'),
  node('submit-demand', 'Submit Demand Request', 'userTask', 'Initiation', 'Business Unit / Demand Owner', 3, 'medium'),
  node('validate-request', 'Validate Request Completeness', 'userTask', 'Initiation', 'Corporate Real Estate', 2, 'high'),
  node('classify-project', 'Classify as CAPEX or Non-Recurring OPEX', 'businessRuleTask', 'Initiation', 'Finance / Controlling', 1, 'high'),
  node('feasibility', 'Perform Preliminary Feasibility Check', 'userTask', 'Initiation', 'Engineering / Technical Experts', 10, 'medium'),
  node('economic-review', 'Perform Economic Viability Review', 'userTask', 'Governance and Budget Approval', 'Finance / Controlling', 7, 'high'),
  node('committee', 'Steering Committee Review', 'userTask', 'Governance and Budget Approval', 'Steering Committee / Board', 14, 'medium'),
  node('release-budget', 'Release Project and Allocate Budget in ERP', 'serviceTask', 'Governance and Budget Approval', 'ERP / Finance Systems', 2, 'high'),
  node('tender-package', 'Compile and Approve Tender Package', 'subProcess', 'Design, Tendering, and Award', 'Procurement', 20, 'high'),
  node('technical-review', 'Technical Review', 'userTask', 'Design, Tendering, and Award', 'Engineering / Technical Experts', 10, 'medium'),
  node('legal-review', 'Legal and Compliance Review', 'userTask', 'Design, Tendering, and Award', 'Legal / Compliance', 10, 'medium'),
  node('commercial-review', 'Procurement and Commercial Review', 'userTask', 'Design, Tendering, and Award', 'Procurement', 10, 'high'),
  node('bid-award', 'Receive Bids, Evaluate, Negotiate, Award Contract', 'subProcess', 'Design, Tendering, and Award', 'Procurement', 30, 'medium'),
  node('construction', 'Conduct Construction Supervision', 'subProcess', 'Execution', 'Engineering / Technical Experts', 90, 'medium'),
  node('change-order', 'Change Order Management', 'subProcess', 'Execution', 'Engineering / Technical Experts', 8, 'high'),
  node('invoice-review', 'Review Progress Invoice', 'userTask', 'Execution', 'Finance / Controlling', 4, 'high'),
  node('technical-acceptance', 'Perform Technical Acceptance', 'userTask', 'Commissioning and Closeout', 'Engineering / Technical Experts', 5, 'medium'),
  node('defect-remediation', 'Track Defect Remediation', 'subProcess', 'Commissioning and Closeout', 'Vendor / Contractor', 12, 'medium'),
  node('handover', 'Operational Handover to Facility Management', 'userTask', 'Commissioning and Closeout', 'Facility Management', 3, 'low'),
  node('final-closeout', 'Verify Final Invoice and Close Project Ledger', 'serviceTask', 'Commissioning and Closeout', 'ERP / Finance Systems', 5, 'high'),
  node('end', 'Construction Measure Closed', 'endEvent', 'Commissioning and Closeout', 'Corporate Real Estate', 0, 'low'),
]

const gateways: ProcessGateway[] = [
  gateway('valid-request', 'Is Request Valid?', 'XOR', ['Valid request continues', 'Incomplete request returns to requestor'], 35),
  gateway('viable', 'Economically Viable?', 'XOR', ['Viable projects proceed', 'Non-viable projects loop to scope optimization or reject'], 72),
  gateway('committee-required', 'Requires Committee Approval?', 'XOR', ['Threshold exceeded routes to committee', 'Low-risk projects proceed to release'], 62),
  gateway('parallel-review', 'Concurrent Tender Reviews', 'AND', ['Technical review', 'Legal review', 'Commercial review'], 68),
  gateway('reviews-approved', 'All Reviews Approved?', 'XOR', ['Approved package publishes tender', 'Rejected package loops to revision'], 70),
  gateway('change-approved', 'Change Order Approved?', 'XOR', ['Approved change updates scope and budget', 'Rejected change is documented'], 82),
  gateway('defects', 'Defects Identified?', 'XOR', ['Defects open remediation loop', 'No defects proceed to handover'], 58),
]

const controls: ProcessControl[] = [
  control('classification', 'CAPEX / NR OPEX Classification', 'Determines funding and approval path', 'Finance / Controlling', 'Classification record', 'classify-project'),
  control('economic', 'Economic Viability Review', 'Confirms business justification', 'Finance / Controlling', 'ROI and lifecycle cost model', 'economic-review'),
  control('committee', 'Steering Committee Approval', 'Confirms strategic and budget approval', 'Steering Committee / Board', 'Approval minutes', 'committee'),
  control('tender', 'Tender Package Approval', 'Prevents incomplete procurement release', 'Engineering / Procurement', 'Approved tender package', 'tender-package'),
  control('legal', 'Legal Review', 'Reduces contract and compliance risk', 'Legal / Compliance', 'Review signoff', 'legal-review'),
  control('change', 'Change Order Approval', 'Controls cost overruns', 'Engineering / Finance', 'Approved change record', 'change-order'),
  control('invoice', 'Final Invoice Verification', 'Prevents overpayment', 'Finance / Controlling', 'Matched invoice record', 'final-closeout'),
  control('ledger', 'ERP Project Closure', 'Prevents further posting', 'Finance / Controlling', 'Closed project code', 'final-closeout'),
]

const integrations: IntegrationPoint[] = [
  integration('sap-budget', 'SAP / ERP', 'outbound', 'Budget allocation after project release', 'Project structure and budget', 'Queue retry and finance alert'),
  integration('sharepoint', 'SharePoint / OneDrive', 'bidirectional', 'Tender package compilation', 'Project dossier and review evidence', 'Version lock and reviewer notification'),
  integration('teams', 'Microsoft Teams', 'outbound', 'Committee packet ready', 'Approval agenda and minutes', 'Escalate to process owner'),
  integration('procurement', 'Coupa / Ariba', 'bidirectional', 'Tender publication and bid receipt', 'RFx, bids, award data', 'Manual procurement fallback'),
  integration('construction', 'Procore / Construction Management', 'inbound', 'Milestone and defect updates', 'Milestone, punch list, defect status', 'Sync reconciliation task'),
  integration('analytics', 'Power BI / Fabric', 'outbound', 'Process KPI refresh', 'Cycle time, bottleneck, risk metrics', 'Retain last successful data set'),
]

function node(id: string, name: string, type: ProcessNode['type'], phase: string, lane: string, durationDays: number, automationPotential: ProcessNode['automationPotential']): ProcessNode {
  return {
    id,
    name,
    type,
    phase,
    lane,
    description: `${name} in the ${phase} phase, owned by ${lane}.`,
    systems: inferSystems(name),
    controls: controlsForName(name),
    risks: risksForName(name),
    automationPotential,
    sourceReference: `Detected from reference scenario phrase: ${name}`,
    durationDays,
  }
}

function gateway(id: string, name: string, type: ProcessGateway['type'], conditions: string[], riskScore: number): ProcessGateway {
  return { id, name, type, conditions, riskScore, decisionLogic: conditions.join('; ') }
}

function control(id: string, name: string, purpose: string, owner: string, evidence: string, relatedNode: string): ProcessControl {
  return { id, name, purpose, owner, evidence, relatedNode }
}

function integration(id: string, system: string, direction: IntegrationPoint['direction'], trigger: string, dataObject: string, failureHandling: string): IntegrationPoint {
  return { id, system, direction, trigger, dataObject, failureHandling }
}

function inferSystems(text: string): string[] {
  const lower = text.toLowerCase()
  if (lower.includes('erp') || lower.includes('budget') || lower.includes('invoice') || lower.includes('ledger')) return ['SAP / ERP']
  if (lower.includes('tender') || lower.includes('bid') || lower.includes('award')) return ['Procurement Platform', 'SharePoint']
  if (lower.includes('construction') || lower.includes('defect')) return ['Construction Management Platform']
  return []
}

function controlsForName(text: string): string[] {
  const lower = text.toLowerCase()
  const matched: string[] = []
  if (lower.includes('classify') || lower.includes('capex')) matched.push('CAPEX / NR OPEX Classification')
  if (lower.includes('economic')) matched.push('Economic Viability Review')
  if (lower.includes('committee')) matched.push('Steering Committee Approval')
  if (lower.includes('tender')) matched.push('Tender Package Approval')
  if (lower.includes('legal')) matched.push('Legal Review')
  if (lower.includes('change')) matched.push('Change Order Approval')
  if (lower.includes('invoice')) matched.push('Final Invoice Verification')
  if (lower.includes('ledger') || lower.includes('erp')) matched.push('ERP Project Closure')
  return matched
}

function risksForName(text: string): string[] {
  const lower = text.toLowerCase()
  const risks: string[] = []
  if (lower.includes('approval') || lower.includes('committee')) risks.push('approval latency')
  if (lower.includes('change')) risks.push('cost overrun')
  if (lower.includes('legal')) risks.push('contract compliance delay')
  if (lower.includes('invoice') || lower.includes('budget')) risks.push('financial leakage')
  if (lower.includes('defect')) risks.push('handover delay')
  return risks
}

export function generateProcess(input: string): GeneratedProcess {
  const lower = input.toLowerCase()
  const detectedType = lower.includes('capex') || lower.includes('tender')
    ? 'Governance-heavy CAPEX / Non-Recurring OPEX lifecycle with procurement, technical review, execution, and financial closeout'
    : 'Human-in-the-loop governance workflow'

  const nodes = baseNodes.map((item) => ({
    ...item,
    sourceReference: input.toLowerCase().includes(item.name.toLowerCase().split(' ')[0])
      ? `Detected from user text near “${item.name.split(' ').slice(0, 3).join(' ')}”`
      : item.sourceReference,
  }))

  return {
    id: 'construction-measures-v1',
    name: 'Construction Measures Process Lifecycle',
    type: detectedType,
    summary: 'Controls construction investments from demand intake through governance approval, tendering, execution, acceptance, and financial closeout.',
    phases,
    lanes,
    nodes,
    gateways,
    controls,
    integrations,
    ambiguities: detectAmbiguities(input),
    bpmnXml: generateBpmnXml(nodes),
  }
}

export function detectAmbiguities(input: string): Ambiguity[] {
  const checks: Array<[string, string, string]> = [
    ['threshold', 'What threshold determines steering committee routing?', 'Governance and Budget Approval'],
    ['reject', 'Does rejection terminate the process or loop back to scope optimization?', 'Governance and Budget Approval'],
    ['change order', 'Are change orders approved by Finance, Procurement, Engineering, or all three?', 'Execution'],
    ['handover', 'Does final accounting happen before or after operational handover?', 'Commissioning and Closeout'],
    ['sla', 'What SLA applies to committee, legal, and procurement review queues?', 'Design, Tendering, and Award'],
  ]
  return checks
    .filter(([keyword]) => !input.toLowerCase().includes(keyword))
    .map(([, question, relatedPhase], index) => ({ id: `ambiguity-${index + 1}`, question, relatedPhase, severity: index < 2 ? 'high' : 'medium' }))
}

export function validateProcess(process: GeneratedProcess): ValidationIssue[] {
  const issues: ValidationIssue[] = []
  if (!process.nodes.some((item) => item.type === 'startEvent')) issues.push(issue('missing-start', 'error', 'Missing start event', 'Add a clear BPMN start event.'))
  if (!process.nodes.some((item) => item.type === 'endEvent')) issues.push(issue('missing-end', 'error', 'Missing end event', 'Add at least one BPMN end event.'))
  if (process.gateways.some((item) => item.type === 'AND') && !process.gateways.some((item) => item.name.toLowerCase().includes('concurrent'))) {
    issues.push(issue('parallel-join', 'warning', 'Parallel split without clear join', 'Add matching join gateway for concurrent paths.'))
  }
  process.gateways.filter((item) => item.conditions.length === 0).forEach((item) => issues.push(issue(`${item.id}-condition`, 'warning', `${item.name} lacks conditions`, 'Document explicit gateway conditions.')))
  process.nodes.filter((item) => item.lane.trim() === '').forEach((item) => issues.push(issue(`${item.id}-owner`, 'warning', `${item.name} lacks owner`, 'Assign a role or swimlane owner.')))
  process.ambiguities.forEach((item) => issues.push(issue(item.id, item.severity === 'high' ? 'warning' : 'info', item.question, `Resolve ambiguity in ${item.relatedPhase}.`)))
  return issues
}

function issue(id: string, severity: ValidationIssue['severity'], title: string, recommendation: string): ValidationIssue {
  return { id, severity, title, recommendation }
}

export function simulateProcess(process: GeneratedProcess): SimulationScenario[] {
  const current = process.nodes.reduce((total, item) => total + item.durationDays, 0)
  const averageRisk = Math.round(process.gateways.reduce((total, item) => total + item.riskScore, 0) / process.gateways.length)
  return [
    { name: 'Current state', cycleTimeDays: current, riskScore: averageRisk, automationLift: 0, notes: ['Baseline governance-heavy lifecycle with manual handoffs.'] },
    { name: 'Parallelized governance review', cycleTimeDays: current - 18, riskScore: averageRisk - 6, automationLift: 12, notes: ['Committee packet and review preparation run concurrently.'] },
    { name: 'AI-assisted tender and change order review', cycleTimeDays: current - 31, riskScore: averageRisk - 12, automationLift: 24, notes: ['Completeness checks, routing, and cost impact summaries are automated.'] },
    { name: 'ERP-integrated closeout', cycleTimeDays: current - 39, riskScore: averageRisk - 16, automationLift: 31, notes: ['Invoice verification and ledger closure are system-enforced.'] },
  ]
}

export function generateDocumentation(process: GeneratedProcess): Record<string, string> {
  return {
    'Executive Summary': `${process.summary} Key controls include ${process.controls.map((item) => item.name).join(', ')}.`,
    SOP: process.phases.map((phase) => `${phase}: ${process.nodes.filter((nodeItem) => nodeItem.phase === phase).map((nodeItem) => nodeItem.name).join(' → ')}`).join('\n'),
    RACI: process.lanes.map((lane) => `${lane}: Responsible for ${process.nodes.filter((nodeItem) => nodeItem.lane === lane).map((nodeItem) => nodeItem.name).join(', ') || 'review/support activities'}.`).join('\n'),
    'Risk Register': process.nodes.flatMap((item) => item.risks.map((risk) => `${risk}: ${item.name} (${item.lane})`)).join('\n') || 'No risks detected.',
    'Integration Requirements': process.integrations.map((item) => `${item.system}: ${item.direction} ${item.dataObject} on ${item.trigger}; failure handling: ${item.failureHandling}.`).join('\n'),
  }
}

export function answerCopilotQuestion(process: GeneratedProcess, question: string): string {
  const lower = question.toLowerCase()
  if (lower.includes('financial') || lower.includes('control')) return `Financial controls: ${process.controls.filter((item) => /finance|invoice|erp|capex|economic/i.test(`${item.name} ${item.owner}`)).map((item) => item.name).join(', ')}.`
  if (lower.includes('procurement')) return `Procurement owns: ${process.nodes.filter((item) => item.lane.includes('Procurement')).map((item) => item.name).join(', ')}.`
  if (lower.includes('loop') || lower.includes('back')) return 'Loop-backs occur at invalid request return, failed economic viability, rejected tender reviews, change order rejection, and defect remediation.'
  if (lower.includes('sap') || lower.includes('erp')) return `ERP touchpoints: ${process.integrations.filter((item) => /sap|erp/i.test(item.system)).map((item) => item.trigger).join(', ')}.`
  if (lower.includes('automation')) return `High automation candidates: ${process.nodes.filter((item) => item.automationPotential === 'high').map((item) => item.name).join(', ')}.`
  if (lower.includes('executive')) return process.summary
  return `I found ${process.nodes.length} BPMN nodes, ${process.gateways.length} gateways, ${process.controls.length} controls, and ${process.integrations.length} integration points. Ask about controls, procurement, loops, SAP/ERP, automation, or executive summary.`
}

export function generateBpmnXml(nodes: ProcessNode[]): string {
  const taskXml = nodes.map((item, index) => {
    const tag = item.type === 'startEvent' || item.type === 'endEvent' ? item.type : item.type === 'parallelGateway' || item.type === 'exclusiveGateway' ? item.type : item.type
    const incoming = index > 0 ? `\n      <bpmn:incoming>Flow_${index}</bpmn:incoming>` : ''
    const outgoing = index < nodes.length - 1 ? `\n      <bpmn:outgoing>Flow_${index + 1}</bpmn:outgoing>` : ''
    return `    <bpmn:${tag} id="${xmlId(item.id)}" name="${escapeXml(item.name)}">${incoming}${outgoing}\n    </bpmn:${tag}>`
  }).join('\n')
  const flows = nodes.slice(0, -1).map((item, index) => `    <bpmn:sequenceFlow id="Flow_${index + 1}" sourceRef="${xmlId(item.id)}" targetRef="${xmlId(nodes[index + 1].id)}" />`).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_BpmnAi" targetNamespace="https://bpmn-ai.local/generated">\n  <bpmn:process id="Process_ConstructionMeasures" name="Construction Measures Process Lifecycle" isExecutable="false">\n${taskXml}\n${flows}\n  </bpmn:process>\n</bpmn:definitions>`
}

function xmlId(id: string): string {
  return `Element_${id.replace(/[^a-zA-Z0-9]/g, '_')}`
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;')
}
