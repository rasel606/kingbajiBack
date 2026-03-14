/**
 * src/bot/issueMonitor.js
 *
 * AI Monitor/Bot - periodically checks configured endpoints on the local server
 * and logs health status. Addresses issue #22 (route 404/500 diagnostics).
 *
 * Configuration via environment variables:
 *   BOT_ENABLED=false      - disable the monitor entirely (default: true)
 *   BOT_INTERVAL_MS=60000  - check interval in milliseconds (default: 60000)
 *   PORT=3000              - local server port to probe (default: 3000)
 */

'use strict';

const http = require('http');
const logger = require('../utils/logger');

const BOT_ENABLED = process.env.BOT_ENABLED !== 'false';
const INTERVAL_MS = parseInt(process.env.BOT_INTERVAL_MS || '60000', 10);
const LOCAL_PORT = parseInt(process.env.PORT || '3000', 10);

// Endpoints to monitor (relative paths on localhost)
const MONITORED_ENDPOINTS = [
  { method: 'GET', path: '/health' },
  { method: 'GET', path: '/api/admin/auth/main_admin' },
  { method: 'GET', path: '/api/transactions/deposits/search?page=1&limit=10' },
  { method: 'GET', path: '/api/admin/get_admin_agent_user_withdraw__user_list?page=1&limit=10' },
  { method: 'GET', path: '/api/admin/get_admin_agent_user_withdraw_deposit_user_list?page=1&limit=10' },
  { method: 'GET', path: '/api/transactions/search_deposit_getways?gateway_name=&payment_type=' },
  { method: 'GET', path: '/api/admin/route-health' },
];

/** Latest check results stored in memory */
let latestResults = [];

/**
 * Send a single HTTP request to the local server.
 * @param {string} method  HTTP method
 * @param {string} path    URL path (may include query string)
 * @returns {Promise<{status:number, latencyMs:number, snippet:string}>}
 */
function probeEndpoint(method, path) {
  return new Promise((resolve) => {
    const start = Date.now();
    const options = {
      hostname: '127.0.0.1',
      port: LOCAL_PORT,
      path,
      method,
      headers: { Accept: 'application/json' },
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        const latencyMs = Date.now() - start;
        const snippet = body.slice(0, 120).replace(/\s+/g, ' ');
        resolve({ status: res.statusCode, latencyMs, snippet });
      });
    });

    req.on('error', (err) => {
      resolve({ status: 0, latencyMs: Date.now() - start, snippet: err.message });
    });

    req.setTimeout(8000, () => {
      req.destroy();
      resolve({ status: 0, latencyMs: 8000, snippet: 'Request timed out' });
    });

    req.end();
  });
}

/**
 * Run one full health-check cycle across all monitored endpoints.
 */
async function runChecks() {
  const timestamp = new Date().toISOString();
  const results = [];

  for (const endpoint of MONITORED_ENDPOINTS) {
    const { method, path } = endpoint;
    try {
      const result = await probeEndpoint(method, path);
      const level = result.status >= 200 && result.status < 300 ? 'info' : 'warn';
      const entry = { method, path, ...result, timestamp };
      results.push(entry);
      logger[level](`[RouteMonitor] ${method} ${path} -> ${result.status} (${result.latencyMs}ms)`, {
        snippet: result.snippet,
      });
    } catch (err) {
      const entry = { method, path, status: 0, latencyMs: 0, snippet: err.message, timestamp };
      results.push(entry);
      logger.error(`[RouteMonitor] ${method} ${path} -> ERROR: ${err.message}`);
    }
  }

  latestResults = results;
  return results;
}

/** @returns {Array} The most recent set of check results */
function getLatestResults() {
  return latestResults;
}

let _timer = null;

/**
 * Start the periodic monitor.
 * Safe to call multiple times – will not start a second timer.
 */
function start() {
  if (!BOT_ENABLED) {
    logger.info('[RouteMonitor] Disabled via BOT_ENABLED=false');
    return;
  }
  if (_timer) return;

  logger.info(`[RouteMonitor] Starting – checking ${MONITORED_ENDPOINTS.length} endpoints every ${INTERVAL_MS}ms`);

  // Run immediately on start, then repeat
  runChecks().catch((err) => logger.error('[RouteMonitor] runChecks error:', err.message));

  _timer = setInterval(() => {
    runChecks().catch((err) => logger.error('[RouteMonitor] runChecks error:', err.message));
  }, INTERVAL_MS);

  // Avoid keeping the Node process alive just for the monitor
  if (_timer.unref) _timer.unref();
}

/** Stop the periodic monitor (useful in tests). */
function stop() {
  if (_timer) {
    clearInterval(_timer);
    _timer = null;
  }
}

module.exports = { start, stop, getLatestResults, runChecks };
