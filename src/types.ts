export type Frequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export interface CostItem {
  id: string;
  name: string;
  amount: number; // in Euros
  frequency: Frequency;
  category: string;
  bankAccount: string;
}

export type SortField = 'name' | 'amount' | 'frequency' | 'category' | 'bankAccount' | 'monthlyAverage';
export type SortDirection = 'asc' | 'desc';
