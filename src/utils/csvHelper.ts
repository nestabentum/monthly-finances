import type { CostItem, Frequency } from '../types';

/**
 * Escapes a cell value for CSV formatting.
 * Wrap in quotes if it contains a comma, quote, or newline. Double quotes are escaped with another double quote.
 */
function escapeCsvValue(val: string | number): string {
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Parses a single CSV line, handling quotes and escaped quotes.
 */
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip the second quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

/**
 * Exports CostItems to a CSV string.
 */
export function exportToCsv(costs: CostItem[]): string {
  const headers = ['Name', 'Amount', 'Frequency', 'Category', 'BankAccount'];
  const rows = costs.map((cost) => [
    escapeCsvValue(cost.name),
    escapeCsvValue(cost.amount),
    escapeCsvValue(cost.frequency),
    escapeCsvValue(cost.category),
    escapeCsvValue(cost.bankAccount),
  ]);
  
  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

/**
 * Parses a CSV string and returns validated partial CostItems.
 * Throws an error with descriptive messages if validation fails.
 */
export function parseCsv(csvContent: string): Omit<CostItem, 'id'>[] {
  const lines = csvContent.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  if (lines.length < 2) {
    throw new Error('CSV must contain at least a header row and one data row.');
  }

  const headerRow = parseCsvLine(lines[0]);
  
  // Find column indices by header name (case-insensitive)
  const nameIndex = headerRow.findIndex(h => /name/i.test(h));
  const amountIndex = headerRow.findIndex(h => /amount|euro/i.test(h));
  const frequencyIndex = headerRow.findIndex(h => /freq/i.test(h));
  const categoryIndex = headerRow.findIndex(h => /cat/i.test(h));
  const bankAccountIndex = headerRow.findIndex(h => /bank|acc/i.test(h));

  // Validation of headers
  if (nameIndex === -1 || amountIndex === -1 || frequencyIndex === -1 || categoryIndex === -1 || bankAccountIndex === -1) {
    throw new Error('Invalid CSV format. Must contain headers matching Name, Amount, Frequency, Category, and BankAccount.');
  }

  const validFrequencies: Set<Frequency> = new Set(['monthly', 'quarterly', 'half-yearly', 'yearly']);
  const items: Omit<CostItem, 'id'>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    
    // Skip completely empty lines
    if (values.length === 1 && values[0] === '') continue;

    // Retrieve values based on headers
    const name = values[nameIndex]?.trim();
    const amountStr = values[amountIndex]?.trim();
    const freqStr = values[frequencyIndex]?.trim().toLowerCase();
    const category = values[categoryIndex]?.trim();
    const bankAccount = values[bankAccountIndex]?.trim();

    const rowNum = i + 1;

    if (!name) {
      throw new Error(`Row ${rowNum}: Name is required.`);
    }
    
    if (!amountStr || isNaN(Number(amountStr))) {
      throw new Error(`Row ${rowNum}: Amount must be a valid number.`);
    }
    const amount = Number(amountStr);
    if (amount <= 0) {
      throw new Error(`Row ${rowNum}: Amount must be greater than 0.`);
    }

    if (!freqStr || !validFrequencies.has(freqStr as Frequency)) {
      throw new Error(`Row ${rowNum}: Frequency must be one of: 'monthly', 'quarterly', 'half-yearly', 'yearly'. Received "${freqStr}".`);
    }

    if (!category) {
      throw new Error(`Row ${rowNum}: Category is required.`);
    }

    if (!bankAccount) {
      throw new Error(`Row ${rowNum}: Bank Account is required.`);
    }

    items.push({
      name,
      amount,
      frequency: freqStr as Frequency,
      category,
      bankAccount
    });
  }

  return items;
}
