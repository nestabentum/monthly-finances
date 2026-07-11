import React, { useState, useEffect } from 'react';
import { Plus, Check, X, Euro } from 'lucide-react';
import type { CostItem, Frequency } from '../types';

interface CostFormProps {
  costs: CostItem[];
  onSubmit: (cost: Omit<CostItem, 'id'> & { id?: string }) => void;
  editingCost: CostItem | null;
  onCancelEdit: () => void;
}

export const CostForm: React.FC<CostFormProps> = ({ costs, onSubmit, editingCost, onCancelEdit }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<Frequency>('monthly');
  const [category, setCategory] = useState('');
  const [bankAccount, setBankAccount] = useState('');

  // Extract unique previously used categories and accounts for datalists
  const uniqueCategories = Array.from(new Set(costs.map((c) => c.category.trim()))).filter(Boolean).sort();
  const uniqueAccounts = Array.from(new Set(costs.map((c) => c.bankAccount.trim()))).filter(Boolean).sort();

  // Load editing cost when it changes
  useEffect(() => {
    if (editingCost) {
      setName(editingCost.name);
      setAmount(String(editingCost.amount));
      setFrequency(editingCost.frequency);
      setCategory(editingCost.category);
      setBankAccount(editingCost.bankAccount);
    } else {
      resetForm();
    }
  }, [editingCost]);

  const resetForm = () => {
    setName('');
    setAmount('');
    setFrequency('monthly');
    setCategory('');
    setBankAccount('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !amount || !category.trim() || !bankAccount.trim()) {
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return;
    }

    onSubmit({
      id: editingCost?.id,
      name: name.trim(),
      amount: numAmount,
      frequency,
      category: category.trim(),
      bankAccount: bankAccount.trim(),
    });

    resetForm();
    if (editingCost) {
      onCancelEdit();
    }
  };

  const handleCancel = () => {
    resetForm();
    onCancelEdit();
  };

  return (
    <div className="cost-form-container card-panel animate-slide-up">
      <h3 className="section-title">
        {editingCost ? 'Edit Recurring Cost' : 'Add New Recurring Cost'}
      </h3>
      
      <form onSubmit={handleSubmit} className="cost-form">
        <div className="form-grid">
          {/* Cost Name */}
          <div className="form-group col-span-2-desktop">
            <label htmlFor="cost-name">Cost Name</label>
            <input
              type="text"
              id="cost-name"
              placeholder="e.g. Netflix, Rent, Insurance"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="touch-target"
            />
          </div>

          {/* Amount */}
          <div className="form-group">
            <label htmlFor="cost-amount">Euro Amount</label>
            <div className="input-with-icon">
              <span className="input-icon"><Euro size={16} /></span>
              <input
                type="number"
                id="cost-amount"
                placeholder="0.00"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="touch-target"
              />
            </div>
          </div>

          {/* Frequency */}
          <div className="form-group">
            <label htmlFor="cost-frequency">Frequency</label>
            <select
              id="cost-frequency"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as Frequency)}
              required
              className="touch-target"
            >
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="half-yearly">Half-Yearly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="cost-category">Category</label>
            <input
              type="text"
              id="cost-category"
              list="categories-list"
              placeholder="Type or select category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="touch-target"
            />
            <datalist id="categories-list">
              {uniqueCategories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          {/* Bank Account */}
          <div className="form-group">
            <label htmlFor="cost-bank-account">Bank Account</label>
            <input
              type="text"
              id="cost-bank-account"
              list="accounts-list"
              placeholder="Type or select account"
              value={bankAccount}
              onChange={(e) => setBankAccount(e.target.value)}
              required
              className="touch-target"
            />
            <datalist id="accounts-list">
              {uniqueAccounts.map((acc) => (
                <option key={acc} value={acc} />
              ))}
            </datalist>
          </div>
        </div>

        {/* Buttons */}
        <div className="form-actions">
          {editingCost ? (
            <>
              <button type="submit" className="btn-primary touch-target">
                <Check size={18} />
                <span>Save Changes</span>
              </button>
              <button type="button" onClick={handleCancel} className="btn-secondary touch-target">
                <X size={18} />
                <span>Cancel</span>
              </button>
            </>
          ) : (
            <button type="submit" className="btn-primary touch-target">
              <Plus size={18} />
              <span>Add Cost</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
