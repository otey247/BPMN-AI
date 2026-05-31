export type NodeType =
  | 'startEvent'
  | 'endEvent'
  | 'userTask'
  | 'serviceTask'
  | 'businessRuleTask'
  | 'subProcess'
  | 'exclusiveGateway'
  | 'parallelGateway'

export type AutomationPotential = 'low' | 'medium' | 'high'

export interface ProcessNode {
  id: string
  name: string
  type: NodeType
  phase: string
  lane: string
  description: string
  systems: string[]
  controls: string[]
  risks: string[]
  automationPotential: AutomationPotential
  sourceReference: string
  durationDays: number
}

export interface ProcessGateway {
  id: string
  name: string
  type: 'XOR' | 'AND'
  decisionLogic: string
  conditions: string[]
  riskScore: number
}

export interface ProcessControl {
  id: string
  name: string
  purpose: string
  owner: string
  evidence: string
  relatedNode: string
}

export interface IntegrationPoint {
  id: string
  system: string
  direction: 'inbound' | 'outbound' | 'bidirectional'
  trigger: string
  dataObject: string
  failureHandling: string
}

export interface Ambiguity {
  id: string
  question: string
  severity: 'low' | 'medium' | 'high'
  relatedPhase: string
}

export interface ValidationIssue {
  id: string
  severity: 'info' | 'warning' | 'error'
  title: string
  recommendation: string
}

export interface SimulationScenario {
  name: string
  cycleTimeDays: number
  riskScore: number
  automationLift: number
  notes: string[]
}

export interface GeneratedProcess {
  id: string
  name: string
  type: string
  summary: string
  phases: string[]
  lanes: string[]
  nodes: ProcessNode[]
  gateways: ProcessGateway[]
  controls: ProcessControl[]
  integrations: IntegrationPoint[]
  ambiguities: Ambiguity[]
  bpmnXml: string
}
