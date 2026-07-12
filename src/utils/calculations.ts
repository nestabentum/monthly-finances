import type { CostItem, Frequency } from '../types';

export function calculateMonthlyAverage(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case 'monthly':
      return amount;
    case 'quarterly':
      return amount / 3;
    case 'half-yearly':
      return amount / 6;
    case 'yearly':
      return amount / 12;
    default:
      return 0;
  }
}

export function getOverallTotalMonthly(costs: CostItem[]): number {
  return costs.reduce((sum, cost) => {
    return sum + calculateMonthlyAverage(cost.amount, cost.frequency);
  }, 0);
}

export function getMonthlyByAccount(costs: CostItem[]): Record<string, number> {
  const totals: Record<string, number> = {};
  costs.forEach((cost) => {
    const account = cost.bankAccount.trim() || 'Unknown Account';
    const monthlyAverage = calculateMonthlyAverage(cost.amount, cost.frequency);
    totals[account] = (totals[account] || 0) + monthlyAverage;
  });
  return totals;
}

export function getMonthlyByCategory(costs: CostItem[]): Record<string, number> {
  const totals: Record<string, number> = {};
  costs.forEach((cost) => {
    const category = cost.category.trim() || 'Uncategorized';
    const monthlyAverage = calculateMonthlyAverage(cost.amount, cost.frequency);
    totals[category] = (totals[category] || 0) + monthlyAverage;
  });
  return totals;
}

/** Returns the number of months in a frequency interval. */
function frequencyToMonths(frequency: Frequency): number {
  switch (frequency) {
    case 'monthly': return 1;
    case 'quarterly': return 3;
    case 'half-yearly': return 6;
    case 'yearly': return 12;
    default: return 1;
  }
}

/**
 * Adds N months to a date, clamping the day to the last day of the target month.
 * E.g., Jan 31 + 1 month = Feb 28 (or 29 in leap year).
 */
function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  const originalDay = date.getDate();
  result.setMonth(result.getMonth() + months);
  // If the day overflowed (e.g., 31 → next month's 3rd), clamp to last day
  if (result.getDate() !== originalDay) {
    result.setDate(0); // Sets to last day of previous month
  }
  return result;
}

/**
 * Counts how many times the given salaryDay of a month has occurred
 * strictly after `from` and on or before `to`.
 * Clamps salaryDay to the last day of each month (e.g., 31 → 28 for Feb).
 */
function countSalaryDaysSince(from: Date, to: Date, salaryDay: number): number {
  let count = 0;
  let year = from.getFullYear();
  let month = from.getMonth();

  while (true) {
    // Clamp salary day to last day of month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const clampedDay = Math.min(salaryDay, daysInMonth);
    const target = new Date(year, month, clampedDay);
    target.setHours(0, 0, 0, 0);

    // Only count if strictly after `from` and on or before `to`
    if (target > from && target <= to) {
      count++;
    }

    // If this target is already past `to`, no point continuing
    if (target > to) break;

    // Move to next month
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }

  return count;
}

/**
 * Auto-advances due dates for costs where the next due date has passed.
 * Returns { updatedCosts, advancedNames } where advancedNames lists
 * the names of costs that were advanced.
 */
export function advanceDueDates(
  costs: CostItem[]
): { updatedCosts: CostItem[]; advancedNames: string[] } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const advancedNames: string[] = [];

  const updatedCosts = costs.map((cost) => {
    if (!cost.lastDueDate) return cost;

    let lastDue = new Date(cost.lastDueDate);
    lastDue.setHours(0, 0, 0, 0);
    const interval = frequencyToMonths(cost.frequency);
    let advanced = false;

    // Keep advancing while the next due date is in the past or today
    while (true) {
      const nextDue = addMonths(lastDue, interval);
      if (nextDue <= today) {
        lastDue = nextDue;
        advanced = true;
      } else {
        break;
      }
    }

    if (advanced) {
      advancedNames.push(cost.name);
      return {
        ...cost,
        lastDueDate: lastDue.toISOString().split('T')[0],
      };
    }
    return cost;
  });

  return { updatedCosts, advancedNames };
}

/**
 * Calculates the minimum required balance per bank account.
 * For each cost with a lastDueDate, counts how many salary days (configurable)
 * have passed since the last due date, then multiplies by the monthly average.
 * Sums per bank account.
 */
export function getMinimumBalanceByAccount(
  costs: CostItem[],
  salaryDay: number = 24
): Record<string, number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const balances: Record<string, number> = {};

  costs.forEach((cost) => {
    if (!cost.lastDueDate) return;

    const lastDue = new Date(cost.lastDueDate);
    lastDue.setHours(0, 0, 0, 0);
    const paychecksPassed = countSalaryDaysSince(lastDue, today, salaryDay);
    const monthlyAvg = calculateMonthlyAverage(cost.amount, cost.frequency);
    const accrued = paychecksPassed * monthlyAvg;

    const account = cost.bankAccount.trim() || 'Unknown Account';
    balances[account] = (balances[account] || 0) + accrued;
  });

  return balances;
}


