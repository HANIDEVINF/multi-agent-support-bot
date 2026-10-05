"use client"

import { useMemo, useState } from "react"
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Code2,
  Database,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
  Terminal,
  Workflow,
  Zap,
} from "lucide-react"

type TicketKey = "refund" | "billing" | "technical" | "security"
type AgentKey = "triage" | "billing" | "technical" | "retention"

const presetTickets: Record<TicketKey, { label: string; customer: string; tier: string; message: string }> = {
  refund: {
    label: "Annual Renewal & Cancellation",
    customer: "Maya Chen · FinOps Lead",
    tier: "Pro Plan",
    message:
      "My annual subscription ($1,440) renewed yesterday, but I meant to cancel before the cycle reset. I only logged in once this month. Can you refund the charge and downgrade our workspace?",
  },
  billing: {
    label: "Seat Count Invoice Discrepancy",
    customer: "Atlas Retail Group",
    tier: "Enterprise SLA",
    message:
      "Invoice INV-9042 bills us for 35 seats, but our signed master contract caps seats at 20. We need a corrected credit memo today because our finance team closes the monthly ledger tomorrow.",
  },
  technical: {
    label: "Production API 500 Spike",
    customer: "Northwind AI Labs",
    tier: "Enterprise SLA",
    message:
      "Our production webhook integration is throwing HTTP 500 errors after rotating our API secret key 20 minutes ago. Please check incident status, inspect trace logs, and verify key propagation.",
  },
  security: {
    label: "SOC2 Audit & SSO Lockout",
    customer: "MedCore Diagnostics",
    tier: "HIPAA Enterprise",
    message:
      "Our SAML SSO certificate rotation locked out 18 clinicians and we also need an updated invoice breakdown before our urgent production audit today.",
  },
}

const agents: Record<AgentKey, { name: string; role: string; color: string; tools: string[] }> = {
  triage: {
    name: "Triage & SLA Router",
    role: "Classifies intent, urgency & tenant SLA tier",
    color: "text-purple-300",
    tools: ["classify_intent()", "lookup_tenant_sla()"],
  },
  billing: {
    name: "Billing & Ledger Specialist",
    role: "Queries Stripe invoices, seat contracts & refund rules",
    color: "text-fuchsia-300",
    tools: ["stripe_invoice_query()", "policy_eligibility_check()"],
  },
  technical: {
    name: "SRE & Diagnostics Agent",
    role: "Correlates API gateway 5xx logs, SSO certs & edge propagation",
    color: "text-indigo-300",
    tools: ["datadog_trace_query()", "verify_key_propagation()"],
  },
  retention: {
    name: "Account Retention Strategist",
    role: "Synthesizes save offers, credit memos & downgrade paths",
    color: "text-emerald-300",
    tools: ["generate_save_offer()", "crm_audit_commit()"],
  },
}

function routeTicket(message: string): AgentKey[] {
  const lower = message.toLowerCase()
  const route: AgentKey[] = ["triage"]
  if (/(invoice|billing|refund|subscription|seat|charge|credit|\$)/.test(lower)) route.push("billing")
  if (/(api|500|key|outage|webhook|error|sso|saml|lockout|certificate|production)/.test(lower)) route.push("technical")
  if (/(cancel|refund|downgrade|churn)/.test(lower)) route.push("retention")
  if (route.length === 1) route.push("technical")
  return route
}

export default function Home() {
  const [ticketKey, setTicketKey] = useState<TicketKey>("refund")
  const [customMessage, setCustomMessage] = useState(presetTickets.refund.message)
  const [customerName, setCustomerName] = useState(presetTickets.refund.customer)
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [runId, setRunId] = useState(418)
  const [activeStep, setActiveStep] = useState(4)
  const [isRunning, setIsRunning] = useState(false)

  const route = useMemo(() => routeTicket(customMessage), [customMessage, runId])

  const priority = useMemo(() => {
    const lower = customMessage.toLowerCase()
    if (/(production|500|lockout|urgent|today|hipaa)/.test(lower)) return "P1 · Critical SLA"
    if (/(invoice|refund|tomorrow)/.test(lower)) return "P2 · High Priority"
    return "P3 · Standard"
  }, [customMessage])

  const confidence = Math.min(99, 76 + route.length * 6 + (memoryEnabled ? 4 : 0))

  const executionSteps = useMemo(() => {
    const steps = [
      {
        agent: "triage" as AgentKey,
        title: "Intent Classification & SLA Binding",
        payload: JSON.stringify(
          {
            tool: "classify_intent",
            priority,
            routed_agents: route,
            memory_context: memoryEnabled ? "loaded_90d_history" : "stateless",
          },
          null,
          2
        ),
      },
    ]

    if (route.includes("billing")) {
      steps.push({
        agent: "billing" as AgentKey,
        title: "Stripe Ledger & Contract Policy Verification",
        payload: JSON.stringify(
          {
            tool: "stripe_invoice_query",
            contract_cap_verified: true,
            refund_window_status: "ELIGIBLE_WITH_APPROVAL",
            dunning_lock: false,
          },
          null,
          2
        ),
      })
    }

    if (route.includes("technical")) {
      steps.push({
        agent: "technical" as AgentKey,
        title: "Gateway Telemetry & Edge Key/Cert Diagnostics",
        payload: JSON.stringify(
          {
            tool: "datadog_trace_query",
            service: "edge-auth-gateway",
            anomaly: "stale_worker_key_cache_detected",
            mitigation: "purged_edge_cache_in_14_regions",
          },
          null,
          2
        ),
      })
    }

    if (route.includes("retention")) {
      steps.push({
        agent: "retention" as AgentKey,
        title: "Retention Offer & Prorated Resolution Synthesis",
        payload: JSON.stringify(
          {
            tool: "generate_save_offer",
            options: ["full_prorated_refund", "pause_billing_90d_with_25pct_credit"],
            audit_logged: true,
          },
          null,
          2
        ),
      })
    }

    steps.push({
      agent: route[route.length - 1],
      title: "Final Grounded Response & Audit Trail Commit",
      payload: JSON.stringify(
        {
          tool: "crm_audit_commit",
          run_id: `run_${runId}`,
          hallucination_check: "PASSED",
          sla_target_met: true,
        },
        null,
        2
      ),
    })

    return steps
  }, [route, priority, memoryEnabled, runId])

  const synthesizedResponse = useMemo(() => {
    const parts: string[] = []
    parts.push(`Hi ${customerName.split("·")[0].trim()},`)
    if (route.includes("technical")) {
      parts.push(
        "Our SRE Diagnostics Agent inspected your gateway telemetry and identified stale edge worker key/certificate cache entries following your recent rotation. We have purged the edge cache across all regions and verified HTTP 200 health."
      )
    }
    if (route.includes("billing")) {
      parts.push(
        "Our Billing Specialist verified your ledger and contract terms. We have prepared the prorated credit/refund adjustment in Stripe and queued the updated PDF invoice for immediate finance sign-off."
      )
    }
    if (route.includes("retention")) {
      parts.push(
        "In addition to processing your requested billing adjustment, we can also switch your workspace to a paused or flexible monthly tier so you never get caught by an unexpected annual renewal."
      )
    }
    parts.push("All tool traces have been attached to ticket audit #" + runId + ".")
    return parts.join(" ")
  }, [customerName, route, runId])

  function runAgents() {
    setIsRunning(true)
    setActiveStep(0)
    const timer = window.setInterval(() => {
      setActiveStep((step) => {
        if (step >= executionSteps.length - 1) {
          window.clearInterval(timer)
          setIsRunning(false)
          setRunId((v) => v + 1)
          return step
        }
        return step + 1
      })
    }, 320)
  }

  return (
    <main className="min-h-screen bg-[#07050d] text-slate-100">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(168,85,247,0.14),transparent_38%),radial-gradient(circle_at_85%_80%,rgba(236,72,153,0.1),transparent_42%)]" />

      <header className="relative border-b border-purple-500/20 bg-[#0b0716]/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-500/40 bg-gradient-to-br from-purple-600/30 to-fuchsia-600/20 text-purple-300">
              <Workflow className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-black tracking-tight text-white">ResolveAI Multi-Agent Orchestrator</span>
                <span className="rounded-full border border-purple-500/30 bg-purple-950/60 px-2.5 py-0.5 font-mono text-[11px] font-semibold text-purple-300">
                  ReAct Swarm + JSON Tool Contracts
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Dynamic Intent Routing Across Triage, Billing, SRE Diagnostics & Retention Agents
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs">
            <button
              onClick={() => setMemoryEnabled((v) => !v)}
              className={`rounded-xl border px-3 py-1.5 font-semibold transition ${
                memoryEnabled
                  ? "border-purple-400/50 bg-purple-950/50 text-purple-200"
                  : "border-white/10 bg-[#080511] text-slate-400"
              }`}
            >
              Episodic CRM Memory: {memoryEnabled ? "ENABLED" : "OFF"}
            </button>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-6 px-6 py-8 lg:grid-cols-[400px_1fr]">
        {/* Left Ticket Controls */}
        <aside className="space-y-5">
          <div className="rounded-2xl border border-purple-500/25 bg-[#0e091d]/90 p-5">
            <div className="mb-3 text-xs font-mono uppercase tracking-wider text-purple-300">
              Preset Support Scenarios
            </div>
            <div className="space-y-2">
              {(Object.keys(presetTickets) as TicketKey[]).map((key) => (
                <button
                  key={key}
                  onClick={() => {
                    setTicketKey(key)
                    setCustomMessage(presetTickets[key].message)
                    setCustomerName(presetTickets[key].customer)
                  }}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    ticketKey === key && customMessage === presetTickets[key].message
                      ? "border-purple-400 bg-purple-950/50"
                      : "border-purple-500/15 bg-[#080511] hover:border-purple-500/35"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{presetTickets[key].label}</span>
                    <span className="rounded bg-purple-950/80 px-2 py-0.5 font-mono text-[10px] text-purple-300">
                      {presetTickets[key].tier}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">{presetTickets[key].customer}</div>
                </button>
              ))}
            </div>

            {/* Live Editable Ticket Input */}
            <div className="mt-4">
              <div className="mb-1.5 flex items-center justify-between text-xs font-mono text-purple-300">
                <span>LIVE TICKET PAYLOAD (EDITABLE)</span>
                <span className="text-[10px] text-slate-400">Dynamic DAG Router</span>
              </div>
              <textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="h-32 w-full resize-none rounded-xl border border-purple-500/25 bg-[#07050d] p-3 font-mono text-xs leading-relaxed text-slate-100 outline-none focus:border-purple-400"
                placeholder="Type any custom customer issue (mention billing, refund, 500 API error, SSO, cancel...) to dynamically re-route the agent swarm..."
              />
            </div>

            <button
              onClick={runAgents}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-purple-500/25 transition hover:from-purple-600 hover:to-fuchsia-600"
            >
              <Play className="h-4 w-4" />
              {isRunning ? "Executing Multi-Agent DAG..." : "Dispatch Multi-Agent Swarm"}
            </button>
          </div>

          {/* Active Swarm Roster */}
          <div className="rounded-2xl border border-purple-500/20 bg-[#0e091d]/90 p-5">
            <div className="mb-3 text-xs font-mono uppercase tracking-wider text-purple-300">
              Swarm Topology ({route.length} / 4 Activated)
            </div>
            <div className="space-y-2.5">
              {(Object.keys(agents) as AgentKey[]).map((key) => {
                const active = route.includes(key)
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-3 transition ${
                      active
                        ? "border-purple-500/40 bg-purple-950/30"
                        : "border-white/5 bg-[#080511]/60 opacity-45"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${agents[key].color}`}>{agents[key].name}</span>
                      <span className="font-mono text-[10px] uppercase text-slate-400">
                        {active ? "ROUTED" : "BYPASSED"}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400">{agents[key].role}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {agents[key].tools.map((t) => (
                        <span
                          key={t}
                          className="rounded bg-[#07050d] px-2 py-0.5 font-mono text-[10px] text-purple-200"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </aside>

        {/* Right Execution Trace */}
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["SLA Triage Priority", priority],
              ["Active Agents", `${route.length} Specialists`],
              ["Grounding Confidence", `${confidence}%`],
              ["Audit Trace ID", `#run_${runId}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-purple-500/20 bg-[#0e091d]/90 p-4">
                <div className="text-xs font-mono uppercase tracking-wider text-slate-400">{label}</div>
                <div className="mt-2 text-xl font-black text-white">{value}</div>
              </div>
            ))}
          </div>

          {/* Step-by-Step ReAct Tool Execution Trace */}
          <div className="rounded-2xl border border-purple-500/25 bg-[#0e091d]/95 p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-purple-400" />
                <h2 className="text-lg font-bold text-white">ReAct Tool-Call Execution Trace</h2>
              </div>
              <span className="font-mono text-xs text-purple-300">
                {activeStep + 1} / {executionSteps.length} nodes completed
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {executionSteps.map((step, index) => {
                const done = index <= activeStep
                return (
                  <div
                    key={step.title}
                    className={`rounded-xl border p-4 transition ${
                      done
                        ? "border-purple-500/35 bg-[#080511]"
                        : "border-white/10 bg-[#080511]/40 opacity-50"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-purple-300">
                        Step 0{index + 1} · {agents[step.agent].name}
                      </span>
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-slate-500" />
                      )}
                    </div>
                    <div className="mb-2 text-sm font-bold text-white">{step.title}</div>
                    <pre className="overflow-x-auto rounded-lg border border-purple-500/15 bg-[#050309] p-3 font-mono text-[11px] leading-relaxed text-purple-200">
                      {step.payload}
                    </pre>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Synthesized Grounded Response */}
          <div className="rounded-2xl border border-purple-500/25 bg-[#0e091d]/95 p-6">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Synthesized Customer Resolution (Zero-Hallucination Gate)</h2>
              </div>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-0.5 font-mono text-xs font-bold text-emerald-300">
                Verified by Tool Outputs
              </span>
            </div>

            <div className="rounded-xl border border-purple-500/15 bg-[#080511] p-5 text-sm leading-relaxed text-slate-200">
              {synthesizedResponse}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
