# Provider Settlement Callback Signing Guide

This document is for provider integration teams sending settlement callbacks to this backend.

## Endpoint

Use either of these equivalent routes:

- `POST /api/v1/provider/settlement-callback`
- `POST /api/provider/settlement-callback`

Example local URL:

- `http://localhost:5000/api/v1/provider/settlement-callback`

## Required headers

Send these on every request:

- `x-provider-timestamp`: Unix timestamp in **seconds**
- `x-provider-nonce`: unique random string per request
- `x-provider-signature`: lowercase hex HMAC-SHA256 signature
- `Content-Type: application/json`

## Signature algorithm

Server verifies this exact payload string:

$payload = `${timestamp}.${nonce}.${JSON.stringify(body)}`

Then computes:

$signature = `hex(HMAC_SHA256(secret, payload))`

Important:

- The signature must be generated from the **exact JSON string** you send in the HTTP body.
- If key order/spacing/body string differs, signature validation will fail.
- Timestamp skew and replay protection are enabled by server config.

## JSON body example

```json
{
  "ticketId": "provider-ticket-10001",
  "ref_no": "ref-10001",
  "status": "SETTLED",
  "payout": 11.5,
  "commission": 0.5,
  "p_win": 11,
  "settledAt": "2026-03-13T14:31:00.000Z"
}
```

`ticketId` (or `id`) and/or `ref_no` are used for lookup.

## Node.js example

```js
const crypto = require('crypto');
const axios = require('axios');

const url = 'http://localhost:5000/api/v1/provider/settlement-callback';
const secret = 'replace_with_long_random_secret';

const bodyObj = {
  ticketId: 'provider-ticket-10001',
  ref_no: 'ref-10001',
  status: 'SETTLED',
  payout: 11.5,
  commission: 0.5,
  p_win: 11,
  settledAt: '2026-03-13T14:31:00.000Z',
};

// IMPORTANT: use this exact body string for both signature and HTTP body
const body = JSON.stringify(bodyObj);
const timestamp = Math.floor(Date.now() / 1000).toString();
const nonce = crypto.randomBytes(16).toString('hex');

const payload = `${timestamp}.${nonce}.${body}`;
const signature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');

axios
  .post(url, body, {
    headers: {
      'Content-Type': 'application/json',
      'x-provider-timestamp': timestamp,
      'x-provider-nonce': nonce,
      'x-provider-signature': signature,
    },
    timeout: 20000,
  })
  .then((res) => {
    console.log('status:', res.status);
    console.log(res.data);
  })
  .catch((err) => {
    if (err.response) {
      console.error('status:', err.response.status);
      console.error(err.response.data);
    } else {
      console.error(err.message);
    }
  });
```

## PHP example

```php
<?php
$secret = 'replace_with_long_random_secret';
$url = 'http://localhost:5000/api/v1/provider/settlement-callback';

$bodyArray = [
  'ticketId' => 'provider-ticket-10001',
  'ref_no' => 'ref-10001',
  'status' => 'SETTLED',
  'payout' => 11.5,
  'commission' => 0.5,
  'p_win' => 11,
  'settledAt' => '2026-03-13T14:31:00.000Z',
];

// IMPORTANT: use this exact body string for both signature and HTTP body
$body = json_encode($bodyArray, JSON_UNESCAPED_SLASHES);
$timestamp = strval(time());
$nonce = bin2hex(random_bytes(16));

$payload = $timestamp . '.' . $nonce . '.' . $body;
$signature = hash_hmac('sha256', $payload, $secret);

$headers = [
  'Content-Type: application/json',
  'x-provider-timestamp: ' . $timestamp,
  'x-provider-nonce: ' . $nonce,
  'x-provider-signature: ' . $signature,
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $body);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$responseBody = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

echo "HTTP status: $status\n";
if ($error) {
  echo "cURL error: $error\n";
}
echo "Response: $responseBody\n";
```

## Optional curl flow (signature prepared externally)

You can generate `timestamp`, `nonce`, and `signature` using your own signer service and send with `curl`.

```bash
curl -X POST 'http://localhost:5000/api/v1/provider/settlement-callback' \
  -H 'Content-Type: application/json' \
  -H 'x-provider-timestamp: <UNIX_SECONDS>' \
  -H 'x-provider-nonce: <UNIQUE_NONCE>' \
  -H 'x-provider-signature: <HEX_HMAC_SHA256>' \
  --data-raw '{"ticketId":"provider-ticket-10001","ref_no":"ref-10001","status":"SETTLED","payout":11.5,"commission":0.5,"p_win":11,"settledAt":"2026-03-13T14:31:00.000Z"}'
```

## Expected responses (summary)

- `200`: processed successfully OR idempotent duplicate callback
- `202`: callback acknowledged but no matching bet record found yet
- `401`: missing/invalid auth headers or bad signature
- `409`: replay request detected

## Server env keys (for ops reference)

- `PROVIDER_SETTLEMENT_VERIFY_SIGNATURE=true`
- `PROVIDER_SETTLEMENT_SECRET=<shared_secret>`
- `PROVIDER_SETTLEMENT_MAX_SKEW_SECONDS=300`
- `PROVIDER_SETTLEMENT_NONCE_TTL_SECONDS=600`

Keep `PROVIDER_SETTLEMENT_SECRET` strong and private in all environments.
