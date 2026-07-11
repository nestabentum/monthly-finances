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
