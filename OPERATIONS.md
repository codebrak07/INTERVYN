# INTERVYN — Operations & Observability Guide

## Architecture Map

```
┌─────────────────────────────────────┐
│           FRONTEND                  │
│   Vercel · get-intervyn.vercel.app  │
│   React 19 + Vite                   │
│   Static SPA + /api proxy rewrites  │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│            BACKEND                  │
│   Render · Express Node.js          │
│   /api/ai/*   → Groq AI Gateway    │
│   /api/code/* → Isolated VM Engine  │
│   /api/health → Liveness Probe      │
│   /api/ready  → Readiness Probe     │
└──────────────┬──────────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│           AI PROVIDER               │
│   Groq Cloud API                    │
│   llama-3.3-70b-versatile           │
└─────────────────────────────────────┘
```

---

## Health Endpoints

### `GET /api/health` — Liveness
Lightweight liveness probe. Returns:
```json
{
  "status": "ok",
  "service": "intervyn-api",
  "environment": "production",
  "timestamp": "2026-08-09T18:00:00.000Z"
}
```

### `GET /api/ready` — Readiness
Confirms backend subsystems are available:
```json
{
  "status": "ready",
  "groqProvider": "available",
  "codeExecutionEngine": "available",
  "rateLimiter": "best-effort-instance-local"
}
```

**Neither endpoint exposes secrets, API keys, candidate data, or internal configuration.**

---

## Structured Operational Logging

All backend requests emit structured JSON logs to stdout (captured by Render's log drain).

### Request Lifecycle
Every request is tagged with a unique `requestId` and logs:
```json
{
  "requestId": "req_1723222800000_a1b2",
  "method": "POST",
  "route": "/api/code/submit",
  "status": 200,
  "durationMs": 142,
  "event": "REQUEST_COMPLETED"
}
```

### Operational Event Categories

| Event | Description |
|---|---|
| `REQUEST_COMPLETED` | Successful request |
| `REQUEST_FAILED` | Request returned 4xx/5xx |
| `CODE_EXECUTION_STARTED` | Code submission received |
| `CODE_EXECUTION_COMPLETE` | All tests executed, metrics logged |
| `CODE_EXECUTION_FAILED` | Unrecoverable execution error |
| `CODE_EXECUTION_TIMEOUT` | Individual test case timed out (1s limit) |
| `SOURCE_LIMIT_EXCEEDED` | Code size > 50KB |
| `OUTPUT_LIMIT_EXCEEDED` | Test output > 10KB, truncated |
| `GROQ_REQUEST_STARTED` | AI request initiated |
| `GROQ_REQUEST_SUCCESS` | AI response received |
| `GROQ_RESPONSE_FAILED` | AI returned error or empty |
| `GROQ_AUTH_FAILED` | 401 from Groq (bad key) |
| `GROQ_RATE_LIMITED` | 429 from Groq |
| `RESUME_ANALYSIS_STARTED` | Resume parse initiated |
| `RESUME_ANALYSIS_COMPLETED` | Resume parsed successfully |
| `RESUME_ANALYSIS_FAILED` | Resume parse failed |
| `ROLE_MATCH_ANALYZED` | Role match completed |
| `INTERVIEW_SESSION_INITIATED` | Blueprint generation (session start) |
| `BLUEPRINT_GENERATED` | Interview blueprint created |
| `QUESTIONS_GENERATED` | Interview questions generated |
| `ANSWER_EVALUATED` | Voice/MCQ answer evaluated |
| `FINAL_REPORT_STARTED` | Final report generation initiated |
| `INTERVIEW_COMPLETED` | Final report generated, session complete |
| `FINAL_REPORT_FAILED` | Final report generation failed |

### Safe Metadata in Logs
Logged: `operationType`, `durationMs`, `status`, `isCustomKey` (boolean), `problemId`, test counts, `roleTitle`, question type, error message text.

### Never Logged
- Resume text / candidate content
- Voice transcripts
- Submitted source code
- API keys (`GROQ_API_KEY`, custom keys)
- Authorization headers
- Hidden test inputs / expected outputs
- AI prompts or response bodies

---

## Where to Inspect Operations

### Render (Backend)
| What | Where |
|---|---|
| Runtime logs | Render Dashboard → Service → Logs |
| Deploy history | Render Dashboard → Service → Events |
| Build failures | Render Dashboard → Service → Events (filter: Deploy) |
| Service restarts | Render Dashboard → Service → Events |
| Environment variables | Render Dashboard → Service → Environment |
| Resource usage (CPU/RAM) | Render Dashboard → Service → Metrics |
| Request logs | Render Logs (structured JSON via stdout) |

### Vercel (Frontend)
| What | Where |
|---|---|
| Deployment status | Vercel Dashboard → Project → Deployments |
| Build logs | Vercel Dashboard → Deployment → Build Logs |
| Runtime errors | Vercel Dashboard → Project → Logs (Functions) |
| Domain/DNS | Vercel Dashboard → Project → Settings → Domains |
| Environment variables | Vercel Dashboard → Project → Settings → Environment Variables |

### Groq (AI Provider)
| What | Where |
|---|---|
| API usage / rate limits | Groq Console → Usage |
| API key management | Groq Console → API Keys |
| Model availability | Groq Status Page |

---

## Rate Limiting

### Current Configuration
- **Per-minute request limit**: 100 requests/minute per IP (in-memory)
- **Daily session limit**: 3 free server-managed-key sessions/day per IP
- **Custom Groq API key**: Bypasses the daily session limit entirely

### Current Enforcement
**Best-effort per-instance** using Node.js in-memory Maps on the Render process.

### Known Limitation
If Render horizontally scales or restarts the service, in-memory counters reset. Each instance maintains its own independent counter. This means:
- A process restart resets all rate limit state
- Multiple instances (if auto-scaled) each have separate counters

### FUTURE: Shared Global Quota Architecture
For production-grade global enforcement:
- Redis or Upstash KV for shared counter state
- Key: `rate:${ip}:${dateKey}`
- TTL: 24 hours
- Atomic increment with `INCR` + `EXPIRE`

**This is intentionally not implemented now.** The current best-effort model is sufficient for V1.

---

## Privacy Contract

### Ephemeral Data (Never Persisted)
- Candidate resume text
- Voice transcripts
- Submitted source code
- Custom Groq API keys
- Session answers and evaluations

### Operational Data (Safe to Log)
- Request IDs, routes, HTTP status codes
- Latency (durationMs)
- Test pass/fail counts (not content)
- Operation types (e.g., "evaluate_answer")
- Error categories (not error bodies containing PII)
- Boolean: `isCustomKey` (true/false, never the key)

---

## Security Posture

| Check | Status |
|---|---|
| Secrets from env vars only | ✅ `process.env.GROQ_API_KEY` |
| Custom keys never logged | ✅ Filtered in `logOperationalEvent` |
| Auth headers never logged | ✅ Only operational metadata logged |
| CORS enabled | ✅ `cors()` middleware active |
| Rate limiting active | ✅ Per-minute + daily session limiter |
| Health endpoint exposes no secrets | ✅ Only status/service/env/timestamp |
| Hidden tests server-side only | ✅ Stripped before client response |
| Source code not logged | ✅ Sanitized key list in logger |
| Resume content not logged | ✅ Only `textLength` logged |
| Transcripts not logged | ✅ Not captured in any log path |
| Security headers | ✅ `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Cache-Control` |

---

## Evidence Architecture (Unchanged)

```
AssessmentEvidence (Single Source of Truth)
├── execution    → Code Execution Engine (tests, runtime, status)
├── observation   → IntegrityMonitor + Session (events, duration, counts)
└── interpretation → Groq AI (scores, summary, recommendation)
```

Both `AssessmentReportView` and `PdfExportService` consume the same `AssessmentEvidence` object.
`validateAssessmentEvidence()` blocks PDF export if contradictions exist.

This architecture is **unchanged** by the observability hardening.
