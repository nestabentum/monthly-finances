import React from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Edit2, Trash2, Filter } from 'lucide-react';
import type { CostItem, SortField, SortDirection } from '../types';
import { calculateMonthlyAverage } from '../utils/calculations';

interface CostTableProps {
  costs: CostItem[];
  allCosts: CostItem[]; // Used to populate filter options regardless of active filters
  categoryFilter: string;
  bankAccountFilter: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onCategoryFilterChange: (val: string) => void;
  onBankAccountFilterChange: (val: string) => void;
  onSort: (field: SortField) => void;
  onEdit: (cost: CostItem) => void;
  onDelete: (id: string) => void;
}

export const CostTable: React.FC<CostTableProps> = ({
  costs,
  allCosts,
  categoryFilter,
  bankAccountFilter,
  sortField,
  sortDirection,
  onCategoryFilterChange,
  onBankAccountFilterChange,
  onSort,
  onEdit,
  onDelete,
}) => {
  // Dynamically extract unique categories and accounts for filter dropdowns
  const uniqueCategories = Array.from(new Set(allCosts.map((c) => c.category.trim()))).filter(Boolean).sort();
  const uniqueAccounts = Array.from(new Set(allCosts.map((c) => c.bankAccount.trim()))).filter(Boolean).sort();

  const formatEuro = (amount: number) => {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(amount);
  };

  const capitalize = (str: string) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown size={14} className="sort-icon inactive" />;
    }
    return sortDirection === 'asc' ? (
      <ArrowUp size={14} className="sort-icon active" />
    ) : (
      <ArrowDown size={14} className="sort-icon active" />
    );
  };

  return (
    <div className="cost-table-section card-panel animate-slide-up">
      {/* Header / Filter Toolbar */}
      <div className="table-toolbar">
        <h3 className="section-title">Cost Records</h3>
        
        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="filter-select touch-target"
              aria-label="Filter by category"
            >
              <option value="all">All Categories</option>
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <select
              value={bankAccountFilter}
              onChange={(e) => onBankAccountFilterChange(e.target.value)}
              className="filter-select touch-target"
              aria-label="Filter by bank account"
            >
              <option value="all">All Accounts</option>
              {uniqueAccounts.map((acc) => (
                <option key={acc} value={acc}>
                  {acc}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {costs.length === 0 ? (
        <div className="empty-table-state">
          <p>No cost items match the selected filters or list is empty.</p>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (visible on mobile only) */}
          <div className="mobile-cost-list">
            {costs.map((cost) => {
              const monthlyAvg = calculateMonthlyAverage(cost.amount, cost.frequency);
              return (
                <div key={cost.id} className="cost-card-item animate-fade-in">
                  <div className="cost-card-header">
                    <h4 className="cost-card-name">{cost.name}</h4>
                    <span className="cost-card-badge">{cost.category}</span>
                  </div>
                  
                  <div className="cost-card-details">
                    <div className="detail-row">
                      <span className="detail-label">Bank Account:</span>
                      <span className="detail-value">{cost.bankAccount}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Original Cost:</span>
                      <span className="detail-value">
                        {formatEuro(cost.amount)} <span className="frequency-sub">({capitalize(cost.frequency)})</span>
                      </span>
                    </div>
                    <div className="detail-row highlight">
                      <span className="detail-label">Monthly Average:</span>
                      <span className="detail-value monthly-avg-val">{formatEuro(monthlyAvg)}</span>
                    </div>
                  </div>
                  
                  <div className="cost-card-actions">
                    <button 
                      onClick={() => onEdit(cost)} 
                      className="btn-action edit touch-target"
                      title="Edit Cost"
                    >
                      <Edit2 size={16} />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => onDelete(cost.id)} 
                      className="btn-action delete touch-target"
                      title="Delete Cost"
                    >
                      <Trash2 size={16} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (visible on screens >= 768px) */}
          <div className="desktop-table-wrapper">
            <table className="desktop-table">
              <thead>
                <tr>
                  <th onClick={() => onSort('name')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>Name</span>
                      {renderSortIcon('name')}
                    </div>
                  </th>
                  <th onClick={() => onSort('category')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>Category</span>
                      {renderSortIcon('category')}
                    </div>
                  </th>
                  <th onClick={() => onSort('bankAccount')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>Bank Account</span>
                      {renderSortIcon('bankAccount')}
                    </div>
                  </th>
                  <th onClick={() => onSort('frequency')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>Frequency</span>
                      {renderSortIcon('frequency')}
                    </div>
                  </th>
                  <th onClick={() => onSort('amount')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>Amount</span>
                      {renderSortIcon('amount')}
                    </div>
                  </th>
                  <th onClick={() => onSort('monthlyAverage')} className="sortable-header">
                    <div className="header-cell-content">
                      <span>Monthly Avg</span>
                      {renderSortIcon('monthlyAverage')}
                    </div>
                  </th>
                  <th className="actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {costs.map((cost) => {
                  const monthlyAvg = calculateMonthlyAverage(cost.amount, cost.frequency);
                  return (
                    <tr key={cost.id} className="table-row-hover">
                      <td className="bold-text">{cost.name}</td>
                      <td>
                        <span className="table-category-badge">{cost.category}</span>
                      </td>
                      <td>{cost.bankAccount}</td>
                      <td>{capitalize(cost.frequency)}</td>
                      <td>{formatEuro(cost.amount)}</td>
                      <td className="bold-text color-primary">{formatEuro(monthlyAvg)}</td>
                      <td>
                        <div className="table-actions">
                          <button 
                            onClick={() => onEdit(cost)} 
                            className="btn-action edit touch-target"
                            title="Edit"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            onClick={() => onDelete(cost.id)} 
                            className="btn-action delete touch-target"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};
