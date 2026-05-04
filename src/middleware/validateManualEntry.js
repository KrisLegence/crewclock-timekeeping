// ═══════════════════════════════════════════════════════════════
// MANUAL ENTRY VALIDATION MIDDLEWARE
// ═══════════════════════════════════════════════════════════════
// If the source is 'manual', the request MUST include a
// reason_code explaining why the entry was created/modified
// outside the normal clock-in flow.
// ═══════════════════════════════════════════════════════════════

const VALID_REASON_CODES = [
  'forgot_to_punch',
  'wrong_cost_code',
  'equipment_failure',
  'supervisor_override',
  'schedule_change',
  'other',
];

function validateManualEntry() {
  return (req, res, next) => {
    const { source, reason_code, reason_note } = req.body;

    if (source === 'manual' || req.method === 'PUT' || req.method === 'PATCH') {
      if (!reason_code) {
        return res.status(400).json({
          error: 'reason_code is required for manual entries and edits',
          valid_codes: VALID_REASON_CODES,
        });
      }

      if (!VALID_REASON_CODES.includes(reason_code)) {
        return res.status(400).json({
          error: `Invalid reason_code. Must be one of: ${VALID_REASON_CODES.join(', ')}`,
        });
      }

      if (reason_code === 'other' && (!reason_note || reason_note.trim().length < 5)) {
        return res.status(400).json({
          error: 'reason_note is required (min 5 chars) when reason_code is "other"',
        });
      }
    }

    next();
  };
}

module.exports = validateManualEntry;
