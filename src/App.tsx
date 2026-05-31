import { useMemo, useState } from 'react'
import './App.css'
import {
  answerCopilotQuestion,
  generateDocumentation,
  generateProcess,
  sampleConstructionDescription,
  simulateProcess,
  validateProcess,
} from './processIntelligence'
import type { GeneratedProcess, ProcessNode } from './domain'

type ViewMode = 'standard' | 'executive' | 'risk' | 'systems' | 'roles' | 'financial' | 'exceptions' | 'automation'

const viewModes: ViewMode[] = ['standard', 'executive', 'risk', 'systems', 'roles', 'financial', 'exceptions', 'automation']

function App() {
  const [input, setInput] = useState(sampleConstructionDescription)
  const [question, setQuestion] = useState('Show me every financial control in this process.')
  const [selectedNodeId, setSelectedNodeId] = useState('economic-review')
  const [viewMode, setViewMode] = useState<ViewMode>('standard')
  const [library, setLibrary] = useState<string[]>(['Construction Measures Process Lifecycle v1'])

  const process = useMemo(() => generateProcess(input), [input])
  const validationIssues = useMemo(() => validateProcess(process), [process])
  const simulations = useMemo(() => simulateProcess(process), [process])
  const docs = useMemo(() => generateDocumentation(process), [process])
  const selectedNode = process.nodes.find((item) => item.id === selectedNodeId) ?? process.nodes[0]
  const copilotAnswer = answerCopilotQuestion(process, question)
  const healthScore = Math.max(0, 100 - validationIssues.filter((item) => item.severity !== 'info').length * 8)

  function importBpmn(file: File | undefined) {
    if (!file) return
    file.text().then((xml) => {
      const taskNames = Array.from(xml.matchAll(/name="([^"]+)"/g)).map((match) => match[1])
      setInput(`${input}\n\nImported BPMN elements: ${taskNames.slice(0, 20).join(', ')}`)
    })
  }

  function exportText(filename: string, content: string, type = 'text/plain') {
    const blob = new Blob([content], { type })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    anchor.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="app-shell">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">AI process intelligence workspace</p>
          <h1>BPMN-AI</h1>
          <p>{process.summary}</p>
        </div>
        <div className="hero-actions">
          <button onClick={() => exportText('construction-measures.bpmn', process.bpmnXml, 'application/xml')}>Export BPMN XML</button>
          <button onClick={() => exportText('process-documentation.md', toMarkdown(docs))}>Export Markdown</button>
          <button onClick={() => exportText('process-data.json', JSON.stringify(process, null, 2), 'application/json')}>Export JSON</button>
        </div>
      </header>

      <section className="metric-grid" aria-label="Process metrics">
        <Metric label="Health score" value={`${healthScore}%`} detail={`${validationIssues.length} validation findings`} />
        <Metric label="BPMN nodes" value={process.nodes.length.toString()} detail={`${process.gateways.length} gateways`} />
        <Metric label="Controls" value={process.controls.length.toString()} detail="audit evidence mapped" />
        <Metric label="Cycle time" value={`${simulations[0].cycleTimeDays}d`} detail="baseline simulation" />
      </section>

      <section className="workspace-grid">
        <aside className="panel left-panel">
          <h2>AI Intake Studio</h2>
          <label htmlFor="intake">Paste messy process notes, SOP text, transcript, or imported BPMN summary</label>
          <textarea id="intake" value={input} onChange={(event) => setInput(event.target.value)} />
          <div className="button-row">
            <label className="file-button">
              Import BPMN XML
              <input type="file" accept=".bpmn,.xml" onChange={(event) => importBpmn(event.target.files?.[0])} />
            </label>
            <button onClick={() => setInput(sampleConstructionDescription)}>Reset sample</button>
          </div>
          <InfoBlock title="Detected process type" value={process.type} />
          <h3>Ambiguity detection</h3>
          <ul className="compact-list">
            {process.ambiguities.map((item) => (
              <li key={item.id}><strong>{item.severity}</strong> · {item.question}</li>
            ))}
          </ul>
        </aside>

        <section className="panel canvas-panel">
          <div className="panel-heading">
            <div>
              <h2>Interactive BPMN Visualization Canvas</h2>
              <p>{viewModeLabel(viewMode)}</p>
            </div>
            <select value={viewMode} onChange={(event) => setViewMode(event.target.value as ViewMode)} aria-label="View mode">
              {viewModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
            </select>
          </div>
          <ProcessCanvas process={process} viewMode={viewMode} selectedNodeId={selectedNode.id} onSelect={setSelectedNodeId} />
          <div className="phase-strip">
            {process.phases.map((phase) => <span key={phase}>{phase}</span>)}
          </div>
        </section>

        <aside className="panel right-panel">
          <h2>Selected Node</h2>
          <h3>{selectedNode.name}</h3>
          <p>{selectedNode.description}</p>
          <dl className="node-details">
            <dt>Lane</dt><dd>{selectedNode.lane}</dd>
            <dt>Phase</dt><dd>{selectedNode.phase}</dd>
            <dt>Systems</dt><dd>{selectedNode.systems.join(', ') || 'None detected'}</dd>
            <dt>Controls</dt><dd>{selectedNode.controls.join(', ') || 'None detected'}</dd>
            <dt>Risks</dt><dd>{selectedNode.risks.join(', ') || 'No explicit risk detected'}</dd>
            <dt>Traceability</dt><dd>{selectedNode.sourceReference}</dd>
          </dl>
          <h3>BPMN Health Indicators</h3>
          <ul className="compact-list issue-list">
            {validationIssues.map((item) => (
              <li key={item.id} className={item.severity}><strong>{item.severity}</strong> · {item.title}<br /><span>{item.recommendation}</span></li>
            ))}
          </ul>
        </aside>
      </section>

      <section className="feature-grid">
        <Panel title="AI Process Copilot">
          <input value={question} onChange={(event) => setQuestion(event.target.value)} aria-label="Copilot question" />
          <div className="answer-box">{copilotAnswer}</div>
          <div className="chip-row">
            {['Where can this process loop backward?', 'Which tasks are owned by Procurement?', 'Which steps should integrate with SAP?', 'What are automation opportunities?'].map((prompt) => (
              <button key={prompt} onClick={() => setQuestion(prompt)}>{prompt}</button>
            ))}
          </div>
        </Panel>

        <Panel title="Controls and Risk Radar">
          <table>
            <thead><tr><th>Control</th><th>Owner</th><th>Evidence</th></tr></thead>
            <tbody>
              {process.controls.map((item) => <tr key={item.id}><td>{item.name}</td><td>{item.owner}</td><td>{item.evidence}</td></tr>)}
            </tbody>
          </table>
        </Panel>

        <Panel title="Simulation and What-if Analysis">
          <div className="scenario-grid">
            {simulations.map((item) => (
              <article key={item.name} className="scenario-card">
                <h3>{item.name}</h3>
                <p><strong>{item.cycleTimeDays} days</strong> · risk {item.riskScore}/100 · automation lift {item.automationLift}%</p>
                <small>{item.notes.join(' ')}</small>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Documentation Generator">
          <div className="doc-tabs">
            {Object.entries(docs).map(([title, content]) => (
              <details key={title} open={title === 'Executive Summary'}>
                <summary>{title}</summary>
                <pre>{content}</pre>
              </details>
            ))}
          </div>
        </Panel>

        <Panel title="Integration Mapper">
          <div className="integration-list">
            {process.integrations.map((item) => (
              <article key={item.id}>
                <strong>{item.system}</strong>
                <span>{item.direction} · {item.trigger}</span>
                <small>{item.failureHandling}</small>
              </article>
            ))}
          </div>
        </Panel>

        <Panel title="Process Library and Versioning">
          <div className="button-row">
            <button onClick={() => setLibrary([...library, `${process.name} v${library.length + 1}`])}>Save version</button>
            <button onClick={() => setLibrary(['Future-state AI-assisted construction lifecycle', ...library])}>Generate future state</button>
          </div>
          <ol className="compact-list">
            {library.map((item) => <li key={item}>{item}</li>)}
          </ol>
        </Panel>
      </section>
    </main>
  )
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <article className="metric"><span>{label}</span><strong>{value}</strong><small>{detail}</small></article>
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="panel"><h2>{title}</h2>{children}</section>
}

function InfoBlock({ title, value }: { title: string; value: string }) {
  return <div className="info-block"><strong>{title}</strong><span>{value}</span></div>
}

function ProcessCanvas({ process, viewMode, selectedNodeId, onSelect }: { process: GeneratedProcess; viewMode: ViewMode; selectedNodeId: string; onSelect: (id: string) => void }) {
  const executiveNodes = process.nodes.filter((item) => item.type === 'startEvent' || item.type === 'endEvent' || process.phases.includes(item.phase) && ['submit-demand', 'economic-review', 'tender-package', 'construction', 'final-closeout'].includes(item.id))
  const visibleNodes = viewMode === 'executive' ? executiveNodes : process.nodes
  return (
    <div className="canvas-scroll" role="application" aria-label="BPMN process canvas">
      <svg width={Math.max(900, visibleNodes.length * 150)} height="460" viewBox={`0 0 ${Math.max(900, visibleNodes.length * 150)} 460`}>
        {visibleNodes.map((item, index) => {
          const x = 70 + index * 145
          const y = 165 + (index % 2) * 80
          const next = visibleNodes[index + 1]
          return (
            <g key={item.id}>
              {next && <line x1={x + 100} y1={y + 32} x2={x + 145} y2={165 + ((index + 1) % 2) * 80 + 32} className="flow-line" markerEnd="url(#arrow)" />}
              <NodeShape node={item} x={x} y={y} selected={selectedNodeId === item.id} viewMode={viewMode} onSelect={onSelect} />
            </g>
          )
        })}
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L0,6 L9,3 z" fill="#64748b" /></marker>
        </defs>
      </svg>
    </div>
  )
}

function NodeShape({ node, x, y, selected, viewMode, onSelect }: { node: ProcessNode; x: number; y: number; selected: boolean; viewMode: ViewMode; onSelect: (id: string) => void }) {
  const fill = nodeFill(node, viewMode)
  const label = node.name.length > 28 ? `${node.name.slice(0, 26)}…` : node.name
  if (node.type === 'startEvent' || node.type === 'endEvent') {
    return <g className="node" onClick={() => onSelect(node.id)}><circle cx={x + 48} cy={y + 32} r="30" className={selected ? 'selected-shape' : ''} fill={fill} /><text x={x + 48} y={y + 78}>{label}</text></g>
  }
  if (node.type.includes('Gateway')) {
    return <g className="node" onClick={() => onSelect(node.id)}><polygon points={`${x + 48},${y} ${x + 96},${y + 32} ${x + 48},${y + 64} ${x},${y + 32}`} className={selected ? 'selected-shape' : ''} fill={fill} /><text x={x + 48} y={y + 84}>{label}</text></g>
  }
  return <g className="node" onClick={() => onSelect(node.id)}><rect x={x} y={y} width="105" height="64" rx="14" className={selected ? 'selected-shape' : ''} fill={fill} /><text x={x + 52} y={y + 34}>{label}</text></g>
}

function nodeFill(node: ProcessNode, viewMode: ViewMode): string {
  if (viewMode === 'risk' && node.risks.length > 0) return '#fecaca'
  if (viewMode === 'systems' && node.systems.length > 0) return '#bfdbfe'
  if (viewMode === 'financial' && /finance|erp|invoice|budget|capex/i.test(`${node.name} ${node.lane}`)) return '#bbf7d0'
  if (viewMode === 'automation' && node.automationPotential === 'high') return '#ddd6fe'
  if (viewMode === 'roles') return '#fde68a'
  if (viewMode === 'exceptions' && /reject|defect|change|valid/i.test(node.name)) return '#fed7aa'
  return '#e2e8f0'
}

function viewModeLabel(viewMode: ViewMode): string {
  const labels: Record<ViewMode, string> = {
    standard: 'Full lifecycle BPMN-style process map with all major tasks.',
    executive: 'Simplified phase-level view for steering committee and leadership audiences.',
    risk: 'Highlights risk-bearing handoffs, approvals, defects, and financial exposure.',
    systems: 'Highlights ERP, procurement, document, analytics, and construction platform touchpoints.',
    roles: 'Emphasizes swimlane ownership and stakeholder accountability.',
    financial: 'Highlights budget, CAPEX/NR OPEX, invoice, and closeout controls.',
    exceptions: 'Highlights rejection, loop-back, change order, and defect remediation paths.',
    automation: 'Highlights high-value AI and workflow automation candidates.',
  }
  return labels[viewMode]
}

function toMarkdown(docs: Record<string, string>): string {
  return Object.entries(docs).map(([title, content]) => `## ${title}\n\n${content}`).join('\n\n')
}

export default App
