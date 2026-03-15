const BettingHistory = require('../models/BettingHistory');

const parseNumber = (value) => {
  if (value === null || value === undefined || value === '') return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const normalizeStatus = (status) => {
  if (status === null || status === undefined || status === '') return undefined;
  if (typeof status === 'number') return status;

  const normalized = String(status).trim().toUpperCase();
  const map = {
    PENDING: 0,
    OPEN: 0,
    SETTLED: 1,
    WON: 1,
    LOSE: 2,
    LOST: 2,
    CANCELLED: 3,
    CANCELED: 3,
    VOID: 3,
    REFUND: 3,
    REFUNDED: 3,
  };

  if (Object.prototype.hasOwnProperty.call(map, normalized)) {
    return map[normalized];
  }

  const numeric = Number(status);
  return Number.isFinite(numeric) ? numeric : undefined;
};

/**
 * Provider settlement callback handler
 * Idempotent update by provider ticket id (`id`) or reference (`ref_no`)
 */
exports.handleSettlementCallback = async (req, res) => {
  try {
    const {
      ticketId,
      id,
      ref_no,
      status,
      payout,
      commission,
      p_win,
      end_time,
      settledAt,
    } = req.body || {};

    const effectiveTicketId = ticketId || id;

    if (!effectiveTicketId && !ref_no) {
      return res.status(400).json({
        success: false,
        message: 'ticketId/id or ref_no is required',
      });
    }

    const query = effectiveTicketId
      ? { $or: [{ id: String(effectiveTicketId) }, ...(ref_no ? [{ ref_no: String(ref_no) }] : [])] }
      : { ref_no: String(ref_no) };

    const existing = await BettingHistory.findOne(query);

    if (!existing) {
      return res.status(202).json({
        success: true,
        acknowledged: true,
        updated: false,
        message: 'Settlement callback received, no matching betting record found yet',
        lookup: {
          id: effectiveTicketId ? String(effectiveTicketId) : undefined,
          ref_no: ref_no ? String(ref_no) : undefined,
        },
      });
    }

    const normalizedStatus = normalizeStatus(status);
    const normalizedPayout = parseNumber(payout);
    const normalizedCommission = parseNumber(commission);
    const normalizedPWin = parseNumber(p_win);
    const normalizedEndTime = end_time || settledAt;

    const changes = {};

    if (effectiveTicketId && existing.id !== String(effectiveTicketId)) changes.id = String(effectiveTicketId);
    if (ref_no && existing.ref_no !== String(ref_no)) changes.ref_no = String(ref_no);
    if (normalizedStatus !== undefined && existing.status !== normalizedStatus) changes.status = normalizedStatus;
    if (normalizedPayout !== undefined && existing.payout !== normalizedPayout) changes.payout = normalizedPayout;
    if (normalizedCommission !== undefined && existing.commission !== normalizedCommission) changes.commission = normalizedCommission;
    if (normalizedPWin !== undefined && existing.p_win !== normalizedPWin) changes.p_win = normalizedPWin;

    if (normalizedEndTime) {
      const parsed = new Date(normalizedEndTime);
      if (!Number.isNaN(parsed.getTime())) {
        const current = existing.end_time ? new Date(existing.end_time).getTime() : null;
        if (current !== parsed.getTime()) {
          changes.end_time = parsed;
        }
      }
    }

    if (!Object.keys(changes).length) {
      return res.status(200).json({
        success: true,
        acknowledged: true,
        updated: false,
        message: 'Duplicate settlement callback ignored (idempotent)',
        data: {
          id: existing.id,
          ref_no: existing.ref_no,
          status: existing.status,
        },
      });
    }

    changes.updatetimestamp = new Date();

    const updated = await BettingHistory.findByIdAndUpdate(
      existing._id,
      { $set: changes },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      acknowledged: true,
      updated: true,
      message: 'Settlement applied successfully',
      data: {
        id: updated.id,
        ref_no: updated.ref_no,
        status: updated.status,
        payout: updated.payout,
        commission: updated.commission,
        p_win: updated.p_win,
        end_time: updated.end_time,
      },
    });
  } catch (error) {
    console.error('❌ Settlement callback processing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process settlement callback',
      error: error.message,
    });
  }
};
