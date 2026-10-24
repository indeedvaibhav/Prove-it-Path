# Prove-It Path — Mastery-Driven SQL Learning

Prove-It Path is an evidence-first, mastery-driven SQL learning platform. Instead of assuming mastery from a single correct query, it pairs real SQLite execution against deterministic fixtures with confidence predictions, adaptive interventions, and AI-grounded explanations.

---

## Architecture Overview

```
Prove-it-Path/
├── client/                     # React 18 + Vite + TypeScript
│   ├── src/
│   │   ├── components/         # Workspace, Schema, Roadmap, Results, Common UI
│   │   ├── data/               # Tasks, curriculum goals, roadmap definitions
│   │   ├── lib/                # API client, diffUtils (row/column comparison), mock fallback
│   │   ├── pages/              # GoalSelectionPage, LearningWorkspacePage
│   │   └── types/contract.ts   # Shared TypeScript domain contracts
│   └── test/                   # Milestone verification test suites
├── server/                     # Node.js + Express + TypeScript
│   └── src/
│       ├── engine/             # sql.js WebAssembly engine & deterministic evaluator
│       ├── routes/             # /api/evaluate, /api/explain, /api/goal, /api/health
│       ├── services/           # AI adapters: Groq, Grok (xAI), Gemini, Template fallback
│       └── middleware/         # Zod schema validation & error handling
└── package.json                # Root convenience scripts for client and server
```

---

## Team Ownership Boundaries

| Area | Scope / Directories | Primary Owner |
|---|---|---|
| **Frontend UI & Styling** | `client/src/components/`, `client/src/pages/`, `client/src/styles/` | Frontend Developer |
| **SQL Engine & Backend** | `server/src/engine/`, `server/src/routes/`, `server/src/services/` | Backend Developer |
| **Shared Contracts** | `client/src/types/contract.ts` | Cross-Team Consensus |
| **Tasks & Curriculum** | `client/src/data/`, `server/src/engine/sql-engine.ts` | Cross-Team Consensus |

---

## Learning Engine & 5-State Machine

The platform implements an evidence-based five-state classification model:

| Prediction | SQL Result | State | User-Facing Label | Adaptive Behavior |
|---|---|---|---|---|
| `can_do` | Correct | `proven` | Showed it once | Topic marked `showed_once`. (Never falsely labelled "Mastered"). |
| `not_sure` | Correct | `hidden_strength` | Hidden strength | Topic marked `showed_once`. Boosts learner confidence. |
| `not_sure` | Mismatch | `honest_gap` | Honest gap | Surfaces contrast example & variant practice task. |
| `can_do` | Mismatch | `mirage` | Mirage | Inserts adaptive `${nodeId}-recheck` step after the node and increases remaining time. |
| Any | Syntax/Error | `slip` | Slip | Neutral syntax diagnosis. Never misclassified as a conceptual misconception. |

### SQL Execution Engine (`sql.js`)
- Runs in-memory WebAssembly SQLite isolated per task attempt.
- Re-seeds schema and fixture tables (`employees`, `departments`) on each run.
- **Read-Only Enforcement**: Automatically blocks multi-statements (`;`), DDL (`DROP`, `ALTER`, `CREATE`), and write queries (`INSERT`, `UPDATE`, `DELETE`, `TRUNCATE`).
- Strict row comparison distinguishing `NULL` from `""` and `0`, supporting multiset comparisons and order-sensitive queries (`orderMatters: true`).

---

## API Endpoints

### 1. `POST /api/evaluate`
Executes real SQL via WebAssembly against task fixtures and computes deterministic outcome state.
```json
// Request
{
  "taskId": "task-select-01",
  "sql": "SELECT name, department FROM employees;",
  "prediction": "can_do"
}

// Response
{
  "state": "proven",
  "correct": true,
  "actualColumns": ["name", "department"],
  "actualRows": [["Alice Chen", "Engineering"], ...],
  "expectedColumns": ["name", "department"],
  "expectedRows": [["Alice Chen", "Engineering"], ...],
  "diagnosis": "Query executed successfully and returned the exact expected results.",
  "nextAction": "Demonstrated with high confidence. Ready to proceed to next roadmap topic.",
  "roadmap": [...],
  "remainingMinutes": 38
}
```

### 2. `POST /api/explain`
Returns grounded explanations. When an AI API key is configured, uses live LLM inference; otherwise falls back to deterministic template guidance.
```json
// Request
{
  "taskId": "task-select-01",
  "sql": "SELECT * FROM employees;",
  "outcome": { ... }
}

// Response
{
  "text": "Your query returned all 5 columns instead of projecting name and department...",
  "source": "ai",          // or "template"
  "fallbackUsed": false    // true when using template
}
```

### 3. `POST /api/goal`
Initializes curriculum roadmap and current starter task.

### 4. `GET /api/health`
Health probe returning service status, active AI provider, and timestamp.

---

## AI Providers & Environment Configuration

The backend supports multiple fast inference providers with seamless fallbacks:
1. **Groq** (`GROQ_API_KEY`, `GROQ_MODEL=qwen/qwen3.8-27b` or `openai/gpt-oss-120b`)
2. **xAI Grok** (`GROK_API_KEY`, `GROK_MODEL=grok-2-latest`)
3. **Google Gemini** (`GEMINI_API_KEY`, `GEMINI_MODEL=gemini-2.0-flash`)
4. **Deterministic Template Fallback** (Active when no key is set or on rate limits/outages)

Create `server/.env`:
```env
# Groq Configuration (Recommended)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=qwen/qwen3.8-27b

# Server
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
```

> **Security Note**: Never commit `.env` or API keys. Secrets are stored strictly on the server.

---

## Getting Started

### Prerequisites
- Node.js >= 20
- npm >= 10

### Installation
```bash
# Clone the repository
git clone https://github.com/indeedvaibhav/Prove-it-Path.git
cd Prove-it-Path

# Install dependencies
cd client && npm install && cd ..
cd server && npm install && cd ..
```

### Development
```bash
# Start backend server (port 3001)
npm run dev:server

# Start frontend Vite server (port 5173)
npm run dev:client
```

### Running Tests
```bash
# Run all unit and integration tests across monorepo
npm run test:client   # Runs 16 client verification tests
npm run test:server   # Runs 43 server & SQL engine tests
```

---

## License
MIT
