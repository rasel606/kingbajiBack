# Promo Engine Phase-1 (VIP 8% Unlimited + Free Spins)

## Included in this phase

- Reusable promo campaign schema (`PromoCampaign`)
- Promo claim ledger schema (`PromoClaim`)
- Promo rule engine (VIP-level bonus + free spin tiers)
- Deposit flow integration with existing advanced deposit API
- Worker for scheduled free-spin credit
- Webhook notifier (optional)
- Admin/User promo APIs

## Business Rules implemented (Phase-1)

### 8% Unlimited Deposit Bonus

- Promo code: `VIP8_UNLIMITED`
- VIP rate mapping:
  - Copper/Bronze: `4%`
  - Silver/Gold: `6%`
  - Ruby and above: `8%`
- Existing project VIP mapping:
  - `Bronze -> 4%`
  - `Silver, Gold -> 6%`
  - `Diamond, Elite -> 8%`
- Wagering: `1x` (stored in claim metadata)
- Unlimited claims: enabled by campaign config

### JILI Free Spins tier

- ৳500 - ৳1,000 => 5 spins
- ৳1,001 - ৳5,000 => 10 spins
- ৳5,001 - ৳10,000 => 50 spins
- ৳10,001 - ৳20,000 => 100 spins
- ৳20,001 - ৳35,000 => 200 spins
- ৳35,001+ => 350 spins

## APIs

### User/public

- `GET /api/promo-engine/campaigns/active`
- `POST /api/promo-engine/evaluate`

### Admin

- `POST /api/promo-engine/admin/seed-vip8`
- `GET /api/promo-engine/admin/claims`
- `POST /api/promo-engine/admin/run-free-spin-credit`

## Deposit API Integration

`POST /api/advanced/deposit-bonus/create`

New optional field:

- `promoCode` (example: `VIP8_UNLIMITED`)

If promo code is passed:

1. Promo is evaluated against user VIP level.
2. Deposit bonus override is applied.
3. Promo claim is recorded.
4. Free spins are scheduled for credit at configured BST hour.

If promo code is missing:

- Existing legacy/default bonus logic runs unchanged.

## Worker

- File: `src/corn/promoFreeSpinWorker.js`
- Schedule: every 10 minutes
- Action: credits due free-spin claims (`pending -> credited`)

## Optional webhook

Set in `.env`:

- `PROMO_WEBHOOK_URL=https://your-webhook-endpoint`

Events sent:

- `promo.claim.created`
- `promo.claim.finalized`
- `promo.freeSpins.credited`
