"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Bot, CheckCircle2, Clock, Database, LifeBuoy, MessageSquare, Play, RefreshCcw, ShieldCheck, UserRound, Workflow, Zap } from "lucide-react"

type TicketKey = "refund" | "billing" | "technical"
type AgentKey = "triage" | "billing" | "technical" | "retention"

const tickets = {
  refund: {
    label: "Refund Request",
    customer: "Maya Chen",
    message:
      "My subscription renewed yesterday, but I meant to cancel. I used the product only once this month. Can you refund me and cancel future billing?",
  },
  billing: {
    label: "Invoice Issue",
    customer: "Atlas Retail",
    message:
      "The invoice shows 35 seats, but our contract says 20 seats. We need an updated invoice today because finance closes the month tomorrow.",
  },
  technical: {
    label: "API Outage",
    customer: "Northwind Labs",
    message:
      "Our production integration is getting 500 errors from the API after the latest key rotation. We need help validating the key and checking incident status.",
  },
} satisfies Record<TicketKey, { label: string; customer: string; message: string }>

const agents: Record<AgentKey, { name: string; role: string; tools: string[] }> = {
  triage: { name: "Triage Agent", role: "Classifies intent and priority", tools: ["intent_classifier", "sla_lookup"] },
  billing: { name: "Billing Agent", role: "Handles invoices, plans, refunds", tools: ["stripe_lookup", "invoice_editor"] },
  technical: { name: "Technical Agent", role: "Investigates API and product issues", tools: ["status_page", "log_search"] },
  retention: { name: "Retention Agent", role: "Suggests save offers and next best actions", tools: ["coupon_engine", "crm_notes"] },
}

function routeTicket(message: string): AgentKey[] {
  const lower = message.toLowerCase()
  const route: AgentKey[] = ["triage"]
  if (lower.includes("invoice") || lower.includes("billing") || lower.includes("refund") || lower.includes("subscription")) route.push("billing")
  if (lower.includes("api") || lower.includes("500") || lower.includes("key") || lower.includes("outage")) route.push("technical")
  if (lower.includes("cancel") || lower.includes("refund")) route.push("retention")
  return route
}

function buildPlan(message: string, route: AgentKey[]) {
  const lower = message.toLowerCase()
  return [
    "Classify customer intent and SLA priority",
    route.includes("billing") ? "Query billing records and policy eligibility" : "Skip billing tools",
    route.includes("technical") ? "Check incident status and API logs" : "Skip technical diagnostics",
    lower.includes("cancel") ? "Prepare retention-safe cancellation response" : "Prepare resolution response",
    "Write auditable final answer with tool evidence",
  ]
}

export default function Home() {
  const [ticketKey, setTicketKey] = useState<TicketKey>("refund")
  const [memoryEnabled, setMemoryEnabled] = useState(true)
  const [runId, setRunId] = useState(12)
  const [activeStep, setActiveStep] = useState(4)
  const ticket = tickets[ticketKey]
  const route = useMemo(() => routeTicket(ticket.message), [ticket.message, runId])
  const plan = useMemo(() => buildPlan(ticket.message, route), [ticket.message, route])
  const confidence = Math.min(98, 72 + route.length * 7 + (memoryEnabled ? 4 : 0))
  const priority = ticket.message.toLowerCase().includes("production") || ticket.message.toLowerCase().includes("today") ? "High" : "Normal"

  function runAgents() {
    setActiveStep(0)
    const timer = window.setInterval(() => {
      setActiveStep((step) => {
        if (step >= plan.length - 1) {
          window.clearInterval(timer)
          setRunId((value) => value + 1)
          return step
        }
        return step + 1
      })
    }, 280)
  }

  return (
    <main className="min-h-screen bg-[#080d14] text-slate-50">
      <section className="mx-auto grid min-h-screen max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[380px_1fr]">
        <aside className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-300 text-slate-950">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black">ResolveAI</h1>
              <p className="text-sm text-slate-400">Multi-agent support automation</p>
            </div>
          </div>

          <div className="space-y-2">
            {(Object.keys(tickets) as TicketKey[]).map((key) => (
              <button
                key={key}
                onClick={() => setTicketKey(key)}
                className={`w-full rounded-md border p-3 text-left transition ${
                  ticketKey === key ? "border-emerald-300 bg-emerald-300/10" : "border-white/10 bg-slate-950"
                }`}
              >
                <span className="block font-bold">{tickets[key].label}</span>
                <span className="text-sm text-slate-400">{tickets[key].customer}</span>
              </button>
            ))}
          </div>

          <div className="mt-5 rounded-md border border-white/10 bg-slate-950 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
              <MessageSquare className="h-4 w-4" />
              Incoming ticket
            </div>
            <p className="text-sm leading-6 text-slate-200">{ticket.message}</p>
          </div>

          <button
            onClick={runAgents}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-md bg-emerald-300 px-4 py-3 font-black text-slate-950"
          >
            <Play className="h-4 w-4" />
            Run Agent Swarm
          </button>
        </aside>

        <section className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            {[
              ["Priority", priority],
              ["Agents", String(route.length)],
              ["Confidence", `${confidence}%`],
              ["Run", `#${runId}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                <div className="text-sm text-slate-400">{label}</div>
                <div className="mt-2 text-2xl font-black text-emerald-200">{value}</div>
              </div>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Workflow className="h-5 w-5 text-cyan-300" />
                <h2 className="text-xl font-bold">Agent Routing Plan</h2>
              </div>
              <div className="space-y-3">
                {plan.map((step, index) => (
                  <div key={step} className={`rounded-md border p-4 ${index <= activeStep ? "border-emerald-300/30 bg-emerald-300/10" : "border-white/10 bg-slate-950"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold">{index + 1}. {step}</span>
                      {index <= activeStep ? <CheckCircle2 className="h-4 w-4 text-emerald-300" /> : <Clock className="h-4 w-4 text-slate-500" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
                <div className="mb-4 flex items-center gap-2">
                  <LifeBuoy className="h-5 w-5 text-emerald-300" />
                  <h2 className="text-xl font-bold">Specialists</h2>
                </div>
                <div className="space-y-3">
                  {route.map((key) => (
                    <div key={key} className="rounded-md bg-slate-950 p-4">
                      <div className="font-bold">{agents[key].name}</div>
                      <div className="text-sm text-slate-400">{agents[key].role}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {agents[key].tools.map((tool) => (
                          <span key={tool} className="rounded-full bg-cyan-300/10 px-2 py-1 text-xs text-cyan-100">{tool}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-white/10 bg-[#f5f2ea] p-5 text-slate-950">
                <div className="mb-3 flex items-center gap-2 font-black">
                  <Database className="h-5 w-5" />
                  Memory
                </div>
                <p className="text-sm leading-6 text-slate-700">
                  Customer history, previous refunds, SLA tier, and product usage are attached when memory is enabled.
                </p>
                <button
                  onClick={() => setMemoryEnabled((value) => !value)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-bold text-white"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Memory {memoryEnabled ? "On" : "Off"}
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-300" />
                <h2 className="text-xl font-bold">Generated Response</h2>
              </div>
              <p className="leading-8 text-slate-200">
                Hi {ticket.customer}, I checked the relevant account context and routed this to the right specialist agents.
                We can resolve the request with policy-safe next steps, documented tool evidence, and a clear escalation path if needed.
              </p>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
              <div className="mb-4 flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-cyan-300" />
                <h2 className="text-xl font-bold">Audit & Safety</h2>
              </div>
              <div className="space-y-3 text-sm">
                {[
                  ["PII masking", "Enabled"],
                  ["Human escalation", priority === "High" ? "Required" : "Optional"],
                  ["Policy risk", route.includes("billing") ? "Refund promise guarded" : "Low"],
                  ["Tool failures", "Retry with backoff"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between rounded-md bg-slate-950 p-3">
                    <span className="text-slate-400">{label}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              {priority === "High" && (
                <div className="mt-4 flex items-center gap-2 rounded-md border border-amber-300/30 bg-amber-300/10 p-3 text-sm text-amber-100">
                  <AlertTriangle className="h-4 w-4" />
                  Escalate to senior support after agent draft.
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  )
}
