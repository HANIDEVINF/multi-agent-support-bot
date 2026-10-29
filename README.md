# ResolveAI — Support Workflow UI Prototype

ResolveAI is an interactive frontend concept for exploring support-ticket triage and specialist workflow routing.

> **Simulation notice:** ticket data, customer profiles, route decisions, tool calls, memory context, confidence labels and audit IDs are local illustrative data. Routing is keyword-based. The app does not call an LLM, Stripe, Datadog, a CRM, or a production database; it does not issue refunds, change subscriptions, inspect telemetry, or persist audit records.

## Run locally

~~~bash
npm ci
npm run dev
~~~

Open http://localhost:3000.

## What is implemented

- Four seeded support scenarios with editable ticket text.
- A deterministic keyword-routing demonstration.
- A UI showing hypothetical specialist steps and JSON-shaped tool payloads.
- A simulated response and run ID for exploring the interaction design.

## What is not implemented

- LLM-based planning or agent-to-agent coordination.
- Real tool execution, APIs, CRM memory, or durable audit logging.
- Authentication, tenant isolation, policy enforcement or authorization.
- Reliable confidence estimation or a measured quality benchmark.

To develop this into a real agent application, add a server-side model call with schema-validated tool requests, mockable integration adapters, authorization for each tool, retries/timeouts, durable observability, and evaluation tests. Keep simulated outputs clearly separated from actual tool results.
