// ═══════════════════════════════════════════════════════════════
// PAYROLL RULES — Per Diem Rates & Overtime Calculations
// ═══════════════════════════════════════════════════════════════
// Change rates here. All downstream calculations use these values.
// ═══════════════════════════════════════════════════════════════

// ─── Per Diem Rates (by location) ────────────────────────────
const PER_DIEM_RATES = {
  TX:  {
    meals:   69.00,
    lodging: 0,        // local – no lodging
    label:   'Texas (Local)',
  },
  TX_TRAVEL: {
    meals:   69.00,
    lodging: 166.00,
    label:   'Texas (Travel/Out-of-town)',
  },
  ABQ: {
    meals:   74.00,
    lodging: 158.00,
    label:   'Albuquerque, NM',
  },
  DEFAULT: {
    meals:   59.00,
    lodging: 107.00,
    label:   'Standard GSA Rate',
  },
};

// ─── Overtime Thresholds ─────────────────────────────────────
const OVERTIME_RULES = {
  dailyRegularMax:    8,    // hours before daily OT kicks in
  dailyOvertimeMax:   12,   // hours before daily double-time
  weeklyRegularMax:   40,   // hours before weekly OT kicks in
  overtimeMultiplier: 1.5,
  doubleTimeMultiplier: 2.0,
};

// ─── Calculate Per Diem ──────────────────────────────────────
function calculatePerDiem(locationCode) {
  const rate = PER_DIEM_RATES[locationCode] || PER_DIEM_RATES.DEFAULT;
  return {
    amount: rate.meals + rate.lodging,
    meals:  rate.meals,
    lodging: rate.lodging,
    label:  rate.label,
  };
}

// ─── Calculate Daily Hours Breakdown ─────────────────────────
function calculateDailyHours(totalHours) {
  const { dailyRegularMax, dailyOvertimeMax } = OVERTIME_RULES;

  if (totalHours <= 0) {
    return { regular: 0, overtime: 0, doubleTime: 0 };
  }

  const regular   = Math.min(totalHours, dailyRegularMax);
  const overtime   = Math.min(Math.max(totalHours - dailyRegularMax, 0), dailyOvertimeMax - dailyRegularMax);
  const doubleTime = Math.max(totalHours - dailyOvertimeMax, 0);

  return {
    regular:    Math.round(regular * 100) / 100,
    overtime:   Math.round(overtime * 100) / 100,
    doubleTime: Math.round(doubleTime * 100) / 100,
  };
}

// ─── Calculate Weekly Overtime Adjustment ────────────────────
// After daily splits, any regular hours beyond 40/wk become OT.
function adjustWeeklyOvertime(dailyBreakdowns) {
  const { weeklyRegularMax } = OVERTIME_RULES;
  let weeklyRegularAccum = 0;

  return dailyBreakdowns.map((day) => {
    const adjusted = { ...day };

    if (weeklyRegularAccum + day.regular > weeklyRegularMax) {
      const excess = (weeklyRegularAccum + day.regular) - weeklyRegularMax;
      adjusted.regular  = day.regular - excess;
      adjusted.overtime = day.overtime + excess;
    }
    weeklyRegularAccum += day.regular;

    return adjusted;
  });
}

// ─── Calculate Pay for a Single Entry ────────────────────────
function calculateEntryPay(hourlyRate, hours, locationCode) {
  const { overtimeMultiplier, doubleTimeMultiplier } = OVERTIME_RULES;
  const perDiem = locationCode ? calculatePerDiem(locationCode) : { amount: 0 };

  return {
    regularPay:    Math.round(hours.regular * hourlyRate * 100) / 100,
    overtimePay:   Math.round(hours.overtime * hourlyRate * overtimeMultiplier * 100) / 100,
    doubleTimePay: Math.round(hours.doubleTime * hourlyRate * doubleTimeMultiplier * 100) / 100,
    perDiem:       perDiem.amount,
    totalPay:      Math.round((
      hours.regular * hourlyRate +
      hours.overtime * hourlyRate * overtimeMultiplier +
      hours.doubleTime * hourlyRate * doubleTimeMultiplier +
      perDiem.amount
    ) * 100) / 100,
  };
}

module.exports = {
  PER_DIEM_RATES,
  OVERTIME_RULES,
  calculatePerDiem,
  calculateDailyHours,
  adjustWeeklyOvertime,
  calculateEntryPay,
};
