# SWARM — Backend API Contract
> Hand this to your backend teammate. Frontend is wired and mocked. Just implement these endpoints.

## Base URL
`http://localhost:8000`  
Frontend proxies `/api/*` → backend via Vite config.

---

## Endpoints

### GET `/api/stats`
**Returns dashboard overview numbers.**
```json
{
  "participants": 2847,
  "emails_sent": 1203,
  "conflicts_resolved": 7,
  "posts_queued": 14
}
```

---

### GET `/api/agents/status`
**Returns all agent current states.**
```json
{
  "agents": [
    {
      "id": "content",
      "name": "Content Strategist Agent",
      "status": "running",       // running | complete | resolving | idle | error
      "progress": 82,            // 0–100
      "color": "#c8ff00",
      "icon": "✦",
      "task": "Generating post series for TechSummit 2026"
    }
  ]
}
```

---

### GET `/api/activity`
**Returns live activity feed items.**
```json
{
  "feed": [
    {
      "id": 1,
      "time": "now",             // "now" | "2m" | "5m" etc
      "agent": "scheduler",
      "color": "#3cffd0",
      "text": "Scheduler recalculated — Hall B clash resolved"
    }
  ]
}
```

---

### GET `/api/events`
```json
{ "events": [{ "id": "1", "name": "TechSummit 2026", "date": "2026-04-15", "participants": 2847, "status": "active" }] }
```

### POST `/api/events`
Body: `{ "name": "string", "date": "YYYY-MM-DD", "description": "string" }`  
Returns: `{ "event": { ...same shape + id + status: "planning", participants: 0 } }`

---

### POST `/api/agents/content/generate`
**Content Agent — generate promotional posts.**
Body:
```json
{ "brief": "string", "event_name": "string", "audience": "string" }
```
Returns:
```json
{
  "posts": [
    { "id": 1, "platform": "Twitter/X", "content": "...", "best_time": "7:30 PM", "engagement_score": 94 }
  ],
  "copy": "Summary of what was generated"
}
```

---

### POST `/api/agents/email/send`
**Email Agent — personalize & dispatch emails.**
Body:
```json
{ "event_id": "string", "template": "string with {{name}} etc", "csv_data": [ {"name":"...","email":"...","track":"...","seat":"..."} ] }
```
Returns: `{ "sent": 342, "failed": 3 }`

---

### POST `/api/agents/schedule/build`
**Scheduler Agent — build master timeline.**
Body:
```json
{ "event_id": "string", "constraints": "string", "sessions": "string" }
```
Returns:
```json
{
  "schedule": [
    { "id": 1, "title": "Opening Keynote", "speaker": "Dr. Arjun Mehta", "room": "Main Hall", "start": "09:00", "end": "10:00", "track": "Keynote", "conflict": false }
  ]
}
```

---

### POST `/api/agents/schedule/resolve`
**Scheduler Agent — handle new mid-event constraint.**
Body: `{ "event_id": "string", "new_constraint": "string" }`  
Returns:
```json
{
  "schedule": [ /* updated schedule, conflict: false on all resolved */ ],
  "changes": ["Hall B slot moved from 10:15 to 11:45", "Participants notified via Email Agent"]
}
```

---

## CORS
Enable CORS for `http://localhost:5173` on all routes.

## To switch from mock to live
In `src/services/api.js`, change line 1:
```js
const USE_MOCK = false  // ← flip this
```
