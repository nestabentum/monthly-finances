import React from 'react';
import { X, PiggyBank, CreditCard, Info, Calendar } from 'lucide-react';
import type { CostItem } from '../types';
import { getMinimumBalanceByAccount } from '../utils/calculations';

interface MinBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  costs: CostItem[];
  salaryDay: number;
  onSalaryDayChange: (day: number) => void;
}

export const MinBalanceModal: React.FC<MinBalanceModalProps> = ({
  isOpen,
  onClose,
  costs,
  salaryDay,
  onSalaryDayChange,
}) => {
  if (!isOpen) return null;

  const balances = getMinimumBalanceByAccount(costs, salaryDay);
  const accounts = Object.keys(balances).sort();
  const totalMinBalance = Object.values(balances).reduce((sum, val) => sum + val, 0);
  const costsWithDates = costs.filter((c) => c.lastDueDate).length;
  const costsWithoutDates = costs.length - costsWithDates;

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const ordinalSuffix = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content min-balance-modal animate-zoom-in" onClick={(e) => e.stopPropagation()}>
        <div className="min-balance-header">
          <div className="min-balance-title-row">
            <PiggyBank size={24} className="min-balance-icon" />
            <h3 className="modal-title">Minimum Account Balances</h3>
          </div>
          <button className="close-modal-btn touch-target" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {/* Salary Day Setting */}
        <div className="salary-day-setting">
          <Calendar size={16} className="salary-day-icon" />
          <label htmlFor="salary-day-input" className="salary-day-label">Salary day:</label>
          <input
            type="number"
            id="salary-day-input"
            min={1}
            max={31}
            value={salaryDay}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val)) onSalaryDayChange(val);
            }}
            className="salary-day-input touch-target"
          />
          <span className="salary-day-suffix">of each month</span>
        </div>

        <p className="min-balance-description">
          Counts how many times the {ordinalSuffix(salaryDay)} has passed since each cost's last due date
          to determine the minimum amount to reserve per account.
        </p>

        {accounts.length === 0 ? (
          <div className="min-balance-empty">
            <Info size={20} />
            <p>No costs have a "Last Due Date" set. Edit your costs and add due dates to see balance recommendations.</p>
          </div>
        ) : (
          <>
            {/* Overall Total */}
            <div className="min-balance-total-card">
              <span className="min-balance-total-label">Total Across All Accounts</span>
              <span className="min-balance-total-value">{formatEuro(totalMinBalance)}</span>
            </div>

            {/* Per-Account Breakdown */}
            <div className="min-balance-accounts-list">
              {accounts.map((account) => (
                <div key={account} className="min-balance-account-row">
                  <div className="min-balance-account-info">
                    <CreditCard size={16} className="min-balance-account-icon" />
                    <span className="min-balance-account-name">{account}</span>
                  </div>
                  <span className="min-balance-account-value">{formatEuro(balances[account])}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {costsWithoutDates > 0 && (
          <div className="min-balance-info-note">
            <Info size={14} />
            <span>{costsWithoutDates} cost{costsWithoutDates > 1 ? 's' : ''} without a due date {costsWithoutDates > 1 ? 'are' : 'is'} excluded from this calculation.</span>
          </div>
        )}

        <div className="min-balance-footer">
          <button onClick={onClose} className="btn-primary touch-target min-balance-close-btn">
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
