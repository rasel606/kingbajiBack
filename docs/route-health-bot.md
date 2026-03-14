# Route-Health Bot — Configuration & Usage

The **AI Monitor / Route-Health Bot** (`src/bot/issueMonitor.js`) periodically probes a configurable list of local API endpoints and logs the results. It was introduced as part of issue #22 to expose 404/500 errors at runtime without relying on production traffic.

---

## Quick start

The monitor starts automatically when the server boots (unless disabled).

```
npm start
# or
npm run start-dev
```

After startup you will see log lines like:

```
info: [RouteMonitor] Starting – checking 7 endpoints every 60000ms
info: [RouteMonitor] GET /health -> 200 (12ms)
warn: [RouteMonitor] GET /api/transactions/deposits/search?page=1&limit=10 -> 401 (8ms)
```

---

## Environment variables

| Variable | Default | Description |
|---|---|---|
| `BOT_ENABLED` | `true` | Set to `false` to disable the monitor completely |
| `BOT_INTERVAL_MS` | `60000` | Check interval in milliseconds |
| `PORT` | `3000` | Port the local server is listening on (used for internal probes) |

Example `.env`:
```
BOT_ENABLED=true
BOT_INTERVAL_MS=30000
PORT=5000
```

---

## Diagnostics endpoint

Retrieve the latest check results via a protected admin endpoint:

```
GET /api/admin/route-health
Authorization: Bearer <admin-jwt>
```

Example response:

```json
{
  "status": "OK",
  "checkedAt": "2026-03-14T18:00:00.000Z",
  "totalEndpoints": 7,
  "results": [
    {
      "method": "GET",
      "path": "/health",
      "status": 200,
      "latencyMs": 11,
      "snippet": "{\"status\":\"OK\",\"timestamp\":\"2026-03-14T18:00:00.000Z\"",
      "timestamp": "2026-03-14T18:00:00.000Z"
    },
    {
      "method": "GET",
      "path": "/api/transactions/deposits/search?page=1&limit=10",
      "status": 401,
      "latencyMs": 8,
      "snippet": "{\"status\":\"fail\",\"message\":\"You are not logged in",
      "timestamp": "2026-03-14T18:00:00.000Z"
    }
  ],
  "timestamp": "2026-03-14T18:00:01.234Z"
}
```

> **Note:** Status 401 on auth-protected routes is expected when the monitor probes without a token; it means the route exists and is working. Status 404 or 500 indicates a problem.

---

## Monitored endpoints (issue #22)

The default list covers the URLs that were returning 404/500 in production:

| Method | Path | Expected status |
|---|---|---|
| GET | `/health` | 200 |
| GET | `/api/admin/auth/main_admin` | 200 or 401 |
| GET | `/api/transactions/deposits/search` | 200 or 401 |
| GET | `/api/admin/get_admin_agent_user_withdraw__user_list` | 200 or 401 |
| GET | `/api/admin/get_admin_agent_user_withdraw_deposit_user_list` | 200 or 401 |
| GET | `/api/transactions/search_deposit_getways` | 200 or 401 |
| GET | `/api/admin/route-health` | 200 or 401 |

To add or change endpoints, edit the `MONITORED_ENDPOINTS` array in `src/bot/issueMonitor.js`.

---

## Route fixes applied (issue #22)

| Failing path | Fix |
|---|---|
| `GET /api/transactions/deposits/search` → 500 | Added `searchDeposits` / `searchWithdrawals` to `TransactionService`; fixed auth import in `transactionRoutes.js` |
| `GET /api/admin/get_admin_agent_user_withdraw__user_list` → 404 | Alias added in `mainAdminRoutes.js` mapping to `getAdminAgentUserWithdrawList` |
| `GET /api/admin/get_admin_agent_user_withdraw_deposit_user_list` → 404 | Alias added in `mainAdminRoutes.js` mapping to `getAdminAgentUserDepositList` |
| `GET /api/transactions/search_deposit_getways` → 404 | Route added to `transactionRoutes.js` using `AdminController.subAdminGetWayList` |

---

## Disabling in tests

The monitor automatically skips starting when `NODE_ENV=test`. You can also call `issueMonitor.stop()` in `afterAll` hooks if you need to clear resources.
