export type Frequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export interface CostItem {
  id: string;
  name: string;
  amount: number; // in Euros
  frequency: Frequency;
  category: string;
  bankAccount: string;
  lastDueDate?: string; // ISO date string, e.g. "2026-04-15"
}

export type SortField = 'name' | 'amount' | 'frequency' | 'category' | 'bankAccount' | 'monthlyAverage';
export type SortDirection = 'asc' | 'desc';
