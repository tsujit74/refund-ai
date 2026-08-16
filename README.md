Absolutely. Below is a **single complete `README.md` file** you can copy-paste directly into your GitHub repository.

````markdown
# 🤖 RefundAI — AI Customer Support Agent

An AI-powered customer support agent built with **Next.js, TypeScript, MongoDB, and LLM tool calling**.

RefundAI simulates an e-commerce customer support system where an AI agent can understand refund requests, inspect customer/order information, validate refund eligibility against business rules, and approve or deny refunds.

The project was built as a **vertical slice assignment for a Next.js Developer role**, focusing on agent orchestration, tool calling, business-rule validation, observability, and a clean user interface.


---

# 🔗 Links

### GitHub

`https://github.com/tsujit74/refund-ai`

### Live Demo

`https://refund-ai-psi.vercel.app/`

### Demo Video

`https://www.loom.com/share/995d43ed237c40efa3265a80cf3db420`

---

---

## 🚀 Features

### 👤 Customer Support Chat

- Select a customer from mock CRM data
- Start a support conversation
- Ask natural-language refund questions
- AI processes the request using an agent loop
- Assistant returns the final refund decision
- Loading and error states
- Responsive modern UI

### 🧠 AI Agent

The application uses an LLM-powered agent with function/tool calling.

The agent can dynamically use tools such as:

- `getCustomerProfile`
- `getOrderDetails`
- `getRefundPolicy`
- `validateRefundEligibility`
- `processRefund`

The agent continues through multiple iterations until it has enough information to provide a final response.

### 💰 Refund Validation

The agent checks refund requests against the configured refund policy.

It can handle:

- Valid refund requests
- Expired refund requests
- Invalid/non-existent orders
- Policy violations
- Refund approval
- Refund denial

### 📊 Admin Dashboard

The admin dashboard provides visibility into agent activity.

It includes:

- Total customers
- Total orders
- Refund requests
- Approved refunds
- Denied refunds
- Agent execution timeline
- Tool calls
- Tool results
- Validation results
- Refund decisions
- Errors and failed executions
- Session IDs
- Execution timestamps

This makes it possible to understand what the agent did during a request instead of treating the LLM as a black box.

### 📝 Agent Reasoning / Execution Logs

The application records important agent events including:

```text
REQUEST_RECEIVED
INTENT_IDENTIFIED
TOOL_CALL
TOOL_RESULT
VALIDATION_RESULT
REFUND_APPROVED
REFUND_DENIED
PROCESS_REFUND
AGENT_RESPONSE
ERROR
````

These logs can be viewed from the admin dashboard.

---

# 🏗️ Architecture

```text
┌──────────────────────────────┐
│          Frontend            │
│                              │
│  Customer Selector           │
│  Chat Interface              │
│  Chat Messages               │
│  Admin Dashboard             │
└──────────────┬───────────────┘
               │
               │ HTTP
               ▼
┌──────────────────────────────┐
│        Next.js API           │
│                              │
│       /api/agent             │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│         Agent Loop           │
│                              │
│  System Prompt               │
│  LLM                         │
│  Tool Calling                │
│  Iteration Control           │
└──────────────┬───────────────┘
               │
        ┌──────┴─────────┐
        ▼                ▼
┌──────────────┐  ┌─────────────────┐
│ Tool Registry│  │    MongoDB      │
│              │  │                 │
│ Customer     │  │ Customers       │
│ Orders       │  │ Orders          │
│ Policy       │  │ Agent Logs      │
│ Validation   │  │ Refund Data     │
│ Refund       │  │                 │
└──────────────┘  └─────────────────┘
```

---

# 🛠️ Tech Stack

## Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

## Backend

* Next.js API Routes
* TypeScript
* MongoDB
* Mongoose

## AI

* LLM API
* Function / Tool Calling
* Agent Loop

The current implementation uses:

```text
Groq
└── Llama 3.3 70B Versatile
```

The agent architecture is provider-independent enough to allow another OpenAI-compatible LLM provider to be used.

## Development Tools

* Git
* GitHub
* npm
* TypeScript
* ESLint

---

# 📁 Project Structure

```text
refund-ai/
│
├── app/
│   ├── api/
│   │   ├── agent/
│   │   │   └── route.ts
│   │   ├── customers/
│   │   ├── logs/
│   │   └── ...
│   │
│   ├── admin/
│   │   └── page.tsx
│   │
│   └── page.tsx
│
├── src/
│   ├── agent/
│   │   ├── agent.ts
│   │   ├── prompts.ts
│   │   └── toolRegistry.ts
│   │
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatInput.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── CustomerSelector.tsx
│   │   ├── LogTimeline.tsx
│   │   └── Stats.tsx
│   │
│   ├── lib/
│   │   ├── db.ts
│   │   ├── llm.ts
│   │   └── utils.ts
│   │
│   ├── models/
│   │   ├── Customer.ts
│   │   ├── Order.ts
│   │   ├── AgentLog.ts
│   │   └── ...
│   │
│   └── scripts/
│       └── test-agent.ts
│
├── public/
│
├── .env.local
├── package.json
├── tsconfig.json
└── README.md
```

---

# 🧠 Agent Workflow

When a customer asks for a refund, the request follows this flow:

```text
Customer
   │
   ▼
Chat Interface
   │
   ▼
/api/agent
   │
   ▼
Agent Loop
   │
   ▼
LLM understands request
   │
   ▼
Select required tools
   │
   ├── Get customer profile
   │
   ├── Get order details
   │
   ├── Get refund policy
   │
   └── Validate refund eligibility
   │
   ▼
Policy Decision
   │
   ├── Eligible
   │      │
   │      ▼
   │   Process Refund
   │
   └── Not Eligible
          │
          ▼
       Deny Refund
   │
   ▼
Final AI Response
   │
   ▼
Execution Logs
```

---

# 🔧 Available Agent Tools

## `getCustomerProfile`

Retrieves customer information from the CRM database.

Example information:

```text
Customer ID
Name
Email
Account information
```

---

## `getOrderDetails`

Retrieves order information using the order ID.

Example:

```text
Order ID
Customer
Order date
Order status
Amount
Product
```

---

## `getRefundPolicy`

Provides the refund policy rules to the agent.

The agent uses these rules instead of making arbitrary refund decisions.

---

## `validateRefundEligibility`

Checks whether a particular order satisfies the refund policy.

The tool returns information such as:

```json
{
  "eligible": true,
  "reason": "Order is within the allowed refund period"
}
```

or:

```json
{
  "eligible": false,
  "reason": "Refund period has expired"
}
```

---

## `processRefund`

Processes a refund when the request has passed the required validation.

This tool represents the refund-processing step in the demo environment.

---

# 🧪 Test Scenarios

The project includes agent-loop tests covering multiple scenarios.

## Test 1 — Valid Refund

Example:

```text
I want a refund for order ORD-1001
```

Expected behavior:

```text
Customer request
       ↓
Order lookup
       ↓
Refund policy lookup
       ↓
Eligibility validation
       ↓
Refund approved
       ↓
Refund processed
```

---

## Test 2 — Expired Refund

Example:

```text
I want a refund for order ORD-1002
```

Expected behavior:

```text
Customer request
       ↓
Order lookup
       ↓
Refund policy validation
       ↓
Refund period expired
       ↓
Refund denied
```

The agent should clearly explain why the refund cannot be processed.

---

## Test 3 — Invalid Order

Example:

```text
I want a refund for order ORD-9999
```

Expected behavior:

```text
Customer request
       ↓
Order lookup
       ↓
Order not found
       ↓
Refund cannot be processed
```

---

# 📊 Admin Dashboard

The admin dashboard is designed for observability rather than customer interaction.

It allows an administrator/reviewer to see:

### Overview

```text
Customers
Orders
Refund Requests
Approved Refunds
Denied Refunds
```

### Execution Timeline

Example:

```text
Request received
       ↓
Intent identified
       ↓
getOrderDetails
       ↓
getRefundPolicy
       ↓
validateRefundEligibility
       ↓
Refund approved
       ↓
processRefund
       ↓
Agent response
```

If an error occurs, it is also recorded:

```text
ERROR
FAILED
```

This helps demonstrate how the agent handles failures and tool execution.

---

# 🔐 Environment Variables

Create a `.env.local` file:

```env
MONGODB_URI=your_mongodb_connection_string

GROQ_API_KEY=your_groq_api_key
```

Do not commit `.env.local` to GitHub.

Make sure it is included in `.gitignore`.

---

# ▶️ Running Locally

## 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

## 2. Enter the project

```bash
cd refund-ai
```

## 3. Install dependencies

```bash
npm install
```

## 4. Configure environment variables

Create:

```text
.env.local
```

and add:

```env
MONGODB_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

## 5. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Running Agent Tests

Run:

```bash
npx tsx src/scripts/test-agent.ts
```

The test script executes the configured refund scenarios and displays agent execution information in the terminal.

Example:

```text
# 🤖 AGENT LOOP TESTS

## [TEST 1] Valid refund request

## [TEST 2] Denied refund request

## [TEST 3] Invalid order
```

---

# 🔍 Observability

One of the main goals of this project is making the agent's execution observable.

Instead of only returning:

```text
Refund approved
```

the application records the execution path:

```text
REQUEST_RECEIVED
        ↓
INTENT_IDENTIFIED
        ↓
TOOL_CALL
        ↓
TOOL_RESULT
        ↓
VALIDATION_RESULT
        ↓
REFUND_APPROVED
        ↓
PROCESS_REFUND
        ↓
AGENT_RESPONSE
```

This makes it easier to debug incorrect tool calls, policy decisions, and runtime failures.

---

# ⚠️ Error Handling

The agent includes error handling around:

* LLM requests
* Tool execution
* Invalid tool arguments
* Database operations
* Missing LLM responses
* Maximum agent iterations
* API failures

The agent is configured with a maximum iteration limit to prevent an infinite tool-calling loop.

```text
MAX_ITERATIONS = 10
```

---

# 🎯 Assignment Alignment

The implementation maps directly to the assignment requirements.

| Assignment Requirement    | Implementation                  |
| ------------------------- | ------------------------------- |
| Mock CRM database         | MongoDB customer/order data     |
| Customer profiles         | Customer collection             |
| Refund policy             | Refund policy used by agent     |
| Agent backend             | Custom agent loop               |
| LLM                       | LLM with function/tool calling  |
| Dynamic tools             | Tool registry                   |
| Refund validation         | `validateRefundEligibility`     |
| Refund processing         | `processRefund`                 |
| Customer chat             | Next.js chat interface          |
| Customer selection        | CRM customer selector           |
| Admin dashboard           | Admin dashboard                 |
| Real-time/observable logs | Agent execution logs            |
| Failure handling          | Error and failed execution logs |
| Standard refund demo      | ORD-1001 scenario               |
| Policy violation demo     | ORD-1002 scenario               |
| Invalid order demo        | ORD-9999 scenario               |

---

# 🎙️ Voice Integration

Voice interaction is considered an optional bonus for this assignment.

The core application does **not depend on voice functionality**.

The primary workflow is:

```text
Customer → Chat → AI Agent → Tools → Refund Decision
```

A voice pipeline can be added independently using technologies such as:

* OpenAI Realtime API
* ElevenLabs
* LiveKit

The current implementation prioritizes the required refund-agent workflow, tool orchestration, and observability.

---

# 💡 Design Decisions

## Why an Agent Loop?

Instead of hard-coding a sequence such as:

```text
getOrder()
→ getPolicy()
→ validate()
→ refund()
```

the LLM can determine which tools are required based on the user's request.

This demonstrates the core concept of an AI support agent using function calling.

---

## Why Tool-Based Validation?

Refund decisions should not rely solely on the LLM.

The LLM is responsible for understanding the customer's request and selecting tools.

Business rules are handled by application tools.

```text
LLM
 │
 │ decides which tool is needed
 ▼
Application Tool
 │
 │ performs deterministic operation
 ▼
Tool Result
 │
 ▼
LLM
```

This provides better control over business-critical decisions.

---

# 🛡️ Security Considerations

* API keys are stored in environment variables.
* `.env.local` is not committed.
* Refund processing is represented using mock/demo data.
* The project does not use real payment processing.
* Database operations are performed through application-level tools.

---

# 📈 Possible Future Improvements

The following features could be added in a production system:

* Authentication and authorization
* Persistent conversation history
* Human escalation
* Refund audit trail
* Role-based admin access
* Rate limiting
* Streaming agent responses
* Production payment/refund integration
* Voice support
* Advanced analytics
* Automated evaluation of agent decisions
* Better retry and timeout handling
* Background job processing

---

# 🎥 Demo

The demo walkthrough covers:

1. Customer selection
2. Standard refund request
3. Agent tool execution
4. Refund approval
5. Policy violation / expired refund
6. Refund denial
7. Invalid order handling
8. Admin execution logs
9. Failure/error handling
10. Project architecture

### Demo Video

**Loom / Google Drive:**
`https://www.loom.com/share/995d43ed237c40efa3265a80cf3db420`

---

# 🔗 Links

### GitHub

`https://github.com/tsujit74/refund-ai`

### Live Demo

`https://refund-ai-psi.vercel.app/`

### Demo Video

`https://www.loom.com/share/995d43ed237c40efa3265a80cf3db420`

---

# 👨‍💻 Author

**Sujit Thakur**

B.Tech — Computer Science & Engineering

### Portfolio

[https://sujit-porttfolio.vercel.app/](https://sujit-porttfolio.vercel.app/)

### GitHub

[https://github.com/tsujit74/](https://github.com/tsujit74/)

---

## 📌 Summary

RefundAI demonstrates a complete AI customer-support vertical slice where an LLM understands customer refund requests, dynamically invokes application tools, validates business rules, processes or denies refunds, and exposes the complete execution flow through an admin dashboard.

The focus of the project is **reliable agent orchestration, deterministic business-rule validation, tool calling, error handling, and observability** rather than simply generating an AI response.

```
```
