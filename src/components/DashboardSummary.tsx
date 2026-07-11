import React from 'react';
import { CreditCard, Wallet, PiggyBank } from 'lucide-react';
import type { CostItem } from '../types';
import { getOverallTotalMonthly, getMonthlyByAccount } from '../utils/calculations';

interface DashboardSummaryProps {
  costs: CostItem[];
  onShowMinBalance: () => void;
}

export const DashboardSummary: React.FC<DashboardSummaryProps> = ({ costs, onShowMinBalance }) => {
  const overallTotal = getOverallTotalMonthly(costs);
  const accountTotals = getMonthlyByAccount(costs);
  const accounts = Object.keys(accountTotals).sort();

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="dashboard-summary-container">
      {/* Overall Total Card */}
      <div className="summary-card hero-card animate-slide-up">
        <div className="card-header">
          <div className="icon-wrapper primary">
            <Wallet size={24} />
          </div>
          <span className="card-label">Total Monthly Expenses</span>
        </div>
        <div className="card-value large-value">
          {formatEuro(overallTotal)}
        </div>
        <div className="hero-card-footer">
          <p className="card-footer-text">
            Calculated average across {costs.length} recurring {costs.length === 1 ? 'cost' : 'costs'}.
          </p>
          <button
            onClick={onShowMinBalance}
            className="btn-min-balance touch-target"
            title="Show minimum required bank balances"
          >
            <PiggyBank size={16} />
            <span>Min. Balance</span>
          </button>
        </div>
      </div>

      {/* Account Breakdown Section */}
      <div className="account-breakdown-section animate-slide-up">
        <h3 className="section-title">Breakdown per Bank Account</h3>
        {accounts.length === 0 ? (
          <div className="empty-account-state">
            <p>No bank accounts registered. Add a cost below to see breakdowns.</p>
          </div>
        ) : (
          <div className="accounts-grid">
            {accounts.map((account) => (
              <div key={account} className="summary-card account-card">
                <div className="card-header">
                  <div className="icon-wrapper secondary">
                    <CreditCard size={18} />
                  </div>
                  <span className="card-label account-name" title={account}>
                    {account}
                  </span>
                </div>
                <div className="card-value medium-value">
                  {formatEuro(accountTotals[account])}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
