import { describe, expect, it } from 'vitest'
import {
  answerCopilotQuestion,
  generateDocumentation,
  generateProcess,
  sampleConstructionDescription,
  simulateProcess,
  validateProcess,
} from './processIntelligence'

describe('process intelligence engine', () => {
  it('generates a construction BPMN process with controls, integrations, and BPMN XML', () => {
    const process = generateProcess(sampleConstructionDescription)

    expect(process.type).toContain('CAPEX')
    expect(process.nodes.length).toBeGreaterThan(15)
    expect(process.controls.map((item) => item.name)).toContain('Change Order Approval')
    expect(process.integrations.map((item) => item.system)).toContain('SAP / ERP')
    expect(process.bpmnXml).toContain('<bpmn:process')
  })

  it('flags ambiguities and validation issues for underspecified inputs', () => {
    const process = generateProcess('Construction request with approval and tendering.')
    const issues = validateProcess(process)

    expect(process.ambiguities.length).toBeGreaterThan(0)
    expect(issues.some((item) => item.title.includes('threshold'))).toBe(true)
  })

  it('simulates optimized scenarios with lower cycle time than current state', () => {
    const process = generateProcess(sampleConstructionDescription)
    const scenarios = simulateProcess(process)

    expect(scenarios[0].name).toBe('Current state')
    expect(Math.min(...scenarios.slice(1).map((item) => item.cycleTimeDays))).toBeLessThan(scenarios[0].cycleTimeDays)
  })

  it('answers copilot questions and generates documentation artifacts', () => {
    const process = generateProcess(sampleConstructionDescription)
    const docs = generateDocumentation(process)

    expect(answerCopilotQuestion(process, 'Which steps should integrate with SAP?')).toContain('ERP touchpoints')
    expect(docs['Executive Summary']).toContain('Key controls')
    expect(docs.RACI).toContain('Finance / Controlling')
  })
})
