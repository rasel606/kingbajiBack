## Quick orientation for AI code agents

This file gives concise, actionable guidance for working in this Node.js/Express codebase (kingbajiBack).
Keep responses short and use precise edits that follow existing patterns.

### Big picture
- Node 18.x Express API. Main entry: `index.js` -> loads `app.js` which creates the express `server`.
- MongoDB via Mongoose (connect helper: `src/Config/db.js`).
- Redis client available at `src/redisClient.js` exported as `{ client, connectRedis }` (use `REDIS_URL`).
- Socket.IO is initialized in `src/socket/socketServer` and attached to the app (`app.set('io', io)`), available to routes via `req.app.get('io')` or `app.get('io')`.

### How the code is organized (practical examples)
- Routes live in `src/Router/*` (examples: `userRoutes`, `gameRoutes`, `transactionRoutes`). Add new routes there and register them in `app.js` under the appropriate base path.
- Controller files are under `src/Controllers/` and named like `UserController.js`, `BettingController.js`. Follow the same naming and export patterns.
- Middlewares are in `src/MiddleWare/` (e.g., `auth.js`, `cookieMiddleware.js`, `error.js`). Plug these into `app.js` using `app.use(...)`.
- Cron/background jobs live in `src/corn/` and use `node-cron`.

### Patterns and conventions to follow
- Use `connectDB()` from `src/Config/db.js` to initialize Mongo before starting server (see `index.js`).
- Use `{ client, connectRedis }` from `src/redisClient.js` to initialize Redis in boot sequence when needed.
- Use `logger` from `src/utils/logger` for logs (db and server files already use it). Prefer logger over console for important events.
- Socket events: import or access socket helpers from `src/socket/socketServer`. When sending socket messages from controllers use `const io = req.app.get('io')`.
- Route error handling: use the global error handler and the middleware pattern in `app.js`. New route handlers should call `next(err)` on errors.

### Run / debug / build
- Dev: `npm run start-dev` (nodemon). Production: `npm start` (node index.js).
- Node engine: `18.x` per `package.json`.

### Environment & safety notes
- Environment variables used: `PORT`, `NODE_ENV`, `REDIS_URL`, and others. Avoid committing secrets. The current `src/Config/db.js` contains a hard-coded Mongo connection string — treat it as sensitive if present and move to `.env`.
- Use `.env` and `process.env` for any new secrets. Search for `process.env` usage when adding config.

### Editing guidance (concrete examples)
- Add a new route: create `src/Router/myFeatureRoutes.js`, a `src/Controllers/MyFeatureController.js`, then register in `app.js` like `app.use('/api/my-feature', require('./src/Router/myFeatureRoutes'))`.
- Add a cron job: drop the job file into `src/corn/` and follow patterns in existing files (use `node-cron` and exported handler functions). Consider where the job runner is invoked on startup.
- Use existing response shapes and status codes used across controllers (JSON { message, ... } or { status, data }). Keep 50MB body limits in mind (app configured with `limit: '50mb'`).

### Integration points to be mindful of
- Socket server: `src/socket/socketServer` — changes here impact live-chat and real-time features.
- Redis usage: caching/session patterns use `src/redisClient.js`. Initializing twice will cause issues — centralize connect logic.
- Cron jobs and long-running processes: watch for heavy DB operations; prefer background processing and index usage.

### Helpful searches to run locally
- Search for `connectDB(` to find DB usage points.
- Search for `connectRedis` / `redis.createClient` for Redis init spots.
- Search `app.set('io'` and `req.app.get('io')` to find socket usages.

If anything here looks incomplete or you want more examples (e.g., a sample controller + route PR), tell me which area to expand and I will add a small example or tests.

---
Please review and tell me if you want more conventions (error response format, preferred unit-test framework, or CI script examples).
