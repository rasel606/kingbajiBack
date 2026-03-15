const crypto = require('crypto');

const replayCache = new Map();

const toBool = (value, defaultValue = false) => {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].includes(String(value).trim().toLowerCase());
};

const safeEqualHex = (provided, expected) => {
  try {
    const a = Buffer.from(String(provided || ''), 'hex');
    const b = Buffer.from(String(expected || ''), 'hex');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch (error) {
    return false;
  }
};

const cleanupReplayCache = (nonceTtlMs) => {
  const now = Date.now();
  for (const [key, expiresAt] of replayCache.entries()) {
    if (expiresAt <= now) replayCache.delete(key);
  }

  // Hard safety cap to prevent unbounded growth under abuse
  if (replayCache.size > 50000) {
    const sorted = [...replayCache.entries()].sort((a, b) => a[1] - b[1]);
    const toDelete = Math.ceil(sorted.length * 0.3);
    for (let i = 0; i < toDelete; i += 1) replayCache.delete(sorted[i][0]);
  }
};

/**
 * Provider settlement request authentication.
 *
 * Required headers when verification enabled:
 *  - x-provider-timestamp: unix seconds
 *  - x-provider-nonce: unique random string per request
 *  - x-provider-signature: hex(HMAC_SHA256(secret, `${timestamp}.${nonce}.${JSON.stringify(body)}`))
 */
const verifyProviderSettlementSignature = (req, res, next) => {
  const verifyEnabled = toBool(process.env.PROVIDER_SETTLEMENT_VERIFY_SIGNATURE, true);
  if (!verifyEnabled) return next();

  const secret = process.env.PROVIDER_SETTLEMENT_SECRET;
  if (!secret) {
    return res.status(503).json({
      success: false,
      message: 'Provider settlement verification is enabled but secret is not configured',
    });
  }

  const timestampHeader = req.header('x-provider-timestamp');
  const nonce = req.header('x-provider-nonce');
  const signature = req.header('x-provider-signature');

  if (!timestampHeader || !nonce || !signature) {
    return res.status(401).json({
      success: false,
      message: 'Missing required auth headers: x-provider-timestamp, x-provider-nonce, x-provider-signature',
    });
  }

  const timestamp = Number(timestampHeader);
  if (!Number.isFinite(timestamp)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid x-provider-timestamp',
    });
  }

  const maxSkewSeconds = Number(process.env.PROVIDER_SETTLEMENT_MAX_SKEW_SECONDS || 300);
  const nowSeconds = Math.floor(Date.now() / 1000);
  if (Math.abs(nowSeconds - timestamp) > maxSkewSeconds) {
    return res.status(401).json({
      success: false,
      message: 'Expired or skewed provider timestamp',
    });
  }

  const nonceTtlSeconds = Number(process.env.PROVIDER_SETTLEMENT_NONCE_TTL_SECONDS || 600);
  const nonceTtlMs = Math.max(1, nonceTtlSeconds) * 1000;
  cleanupReplayCache(nonceTtlMs);

  const replayKey = `${timestamp}:${nonce}`;
  if (replayCache.has(replayKey)) {
    return res.status(409).json({
      success: false,
      message: 'Replay request detected',
    });
  }

  const payload = `${timestamp}.${nonce}.${JSON.stringify(req.body || {})}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (!safeEqualHex(signature, expectedSignature)) {
    return res.status(401).json({
      success: false,
      message: 'Invalid provider signature',
    });
  }

  replayCache.set(replayKey, Date.now() + nonceTtlMs);
  return next();
};

module.exports = {
  verifyProviderSettlementSignature,
};
