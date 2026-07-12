import { useState, useEffect, useRef } from 'react';
import { ThemeToggle } from './components/ThemeToggle';
import { DashboardSummary } from './components/DashboardSummary';
import { CostForm } from './components/CostForm';
import { CostTable } from './components/CostTable';
import { AnalyticsSection } from './components/AnalyticsSection';
import { CsvActions } from './components/CsvActions';
import { MinBalanceModal } from './components/MinBalanceModal';
import { NotificationToast } from './components/NotificationToast';
import type { CostItem, SortField, SortDirection } from './types';
import { calculateMonthlyAverage, advanceDueDates } from './utils/calculations';
import { CreditCard, Plus } from 'lucide-react';

function App() {
  // --- 1. Theme State Initialization ---
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }
    // Default to OS theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  // --- 2. Costs State Initialization ---
  const [costs, setCosts] = useState<CostItem[]>(() => {
    const savedCosts = localStorage.getItem('monthly_costs');
    if (savedCosts) {
      try {
        return JSON.parse(savedCosts);
      } catch (e) {
        console.error('Failed to parse saved costs, starting fresh.', e);
      }
    }
    return [];
  });

  const [editingCost, setEditingCost] = useState<CostItem | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isMinBalanceOpen, setIsMinBalanceOpen] = useState(false);

  // --- Toast notification state ---
  const [toastMessage, setToastMessage] = useState('');
  const [toastDetails, setToastDetails] = useState<string[]>([]);
  const [isToastVisible, setIsToastVisible] = useState(false);

  // --- Salary day setting (configurable, persisted) ---
  const [salaryDay, setSalaryDay] = useState<number>(() => {
    const saved = localStorage.getItem('salary_day');
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 31) return parsed;
    }
    return 24;
  });

  const handleSalaryDayChange = (day: number) => {
    const clamped = Math.max(1, Math.min(31, day));
    setSalaryDay(clamped);
    localStorage.setItem('salary_day', String(clamped));
  };

  // --- 3. Filter & Sort States ---
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [bankAccountFilter, setBankAccountFilter] = useState('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  // --- 4. Auto-advance due dates on initial load ---
  const hasAdvanced = useRef(false);
  useEffect(() => {
    if (hasAdvanced.current) return;
    hasAdvanced.current = true;

    const { updatedCosts, advancedNames } = advanceDueDates(costs);
    if (advancedNames.length > 0) {
      setCosts(updatedCosts);
      setToastMessage('Due dates auto-advanced for:');
      setToastDetails(advancedNames);
      setIsToastVisible(true);
    }
    // Only run once on mount — costs from initial useState
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- 5. Theme & Local Storage Synchronizations ---
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Listen for OS theme changes if user hasn't explicitly set one
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const userHasCustomTheme = localStorage.getItem('theme');
      if (!userHasCustomTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
  };

  // Sync costs to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('monthly_costs', JSON.stringify(costs));
  }, [costs]);

  // --- 6. Cost CRUD Handlers ---
  const handleAddOrUpdateCost = (costData: Omit<CostItem, 'id'> & { id?: string }) => {
    if (costData.id) {
      // Update
      setCosts((prev) =>
        prev.map((cost) => (cost.id === costData.id ? (costData as CostItem) : cost))
      );
      setEditingCost(null);
    } else {
      // Create
      const newCost: CostItem = {
        ...costData,
        id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2),
      };
      setCosts((prev) => [...prev, newCost]);
    }
    setIsFormOpen(false);
  };

  const handleDeleteCost = (id: string) => {
    if (confirm('Are you sure you want to delete this recurring cost?')) {
      setCosts((prev) => prev.filter((cost) => cost.id !== id));
      if (editingCost?.id === id) {
        setEditingCost(null);
        setIsFormOpen(false);
      }
    }
  };

  const handleEditCost = (cost: CostItem) => {
    setEditingCost(cost);
    setIsFormOpen(true);
  };

  const handleCancelEdit = () => {
    setEditingCost(null);
    setIsFormOpen(false);
  };

  const handleImportCsv = (items: Omit<CostItem, 'id'>[], mode: 'merge' | 'overwrite') => {
    const mappedItems: CostItem[] = items.map((item) => ({
      ...item,
      id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString() + Math.random().toString(36).substring(2),
    }));

    if (mode === 'overwrite') {
      setCosts(mappedItems);
    } else {
      setCosts((prev) => [...prev, ...mappedItems]);
    }
    // Cancel any active edits
    setEditingCost(null);
  };

  // --- 7. Sorting and Filtering logic ---
  const filteredCosts = costs.filter((cost) => {
    const matchesCategory = categoryFilter === 'all' || cost.category.trim() === categoryFilter;
    const matchesAccount = bankAccountFilter === 'all' || cost.bankAccount.trim() === bankAccountFilter;
    return matchesCategory && matchesAccount;
  });

  const sortedCosts = [...filteredCosts].sort((a, b) => {
    let valA: any;
    let valB: any;

    if (sortField === 'monthlyAverage') {
      valA = calculateMonthlyAverage(a.amount, a.frequency);
      valB = calculateMonthlyAverage(b.amount, b.frequency);
    } else {
      valA = a[sortField];
      valB = b[sortField];
    }

    if (typeof valA === 'string' && typeof valB === 'string') {
      return sortDirection === 'asc'
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    } else {
      return sortDirection === 'asc'
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    }
  });

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="app-layout">
      {/* Navigation Header */}
      <header className="app-header">
        <div className="header-brand">
          <CreditCard size={28} className="brand-icon" />
          <h1 className="brand-title">RecurrFin</h1>
        </div>
        <div className="header-actions">
          <CsvActions costs={costs} onImport={handleImportCsv} />
          <ThemeToggle theme={theme} toggleTheme={handleToggleTheme} />
        </div>
      </header>

      {/* Main Container */}
      <main className="app-main-content">
        {/* Top Summary Stats */}
        <DashboardSummary costs={costs} onShowMinBalance={() => setIsMinBalanceOpen(true)} />

        {/* Table Records (Second on the page) */}
        <CostTable
          costs={sortedCosts}
          allCosts={costs}
          categoryFilter={categoryFilter}
          bankAccountFilter={bankAccountFilter}
          sortField={sortField}
          sortDirection={sortDirection}
          onCategoryFilterChange={setCategoryFilter}
          onBankAccountFilterChange={setBankAccountFilter}
          onSort={handleSort}
          onEdit={handleEditCost}
          onDelete={handleDeleteCost}
        />

        {/* Analytics Graphs (Third on the page) */}
        <AnalyticsSection costs={costs} theme={theme} />

        {/* Glassmorphic Modal Form */}
        {isFormOpen && (
          <div className="modal-overlay" onClick={handleCancelEdit}>
            <div className="modal-content animate-zoom-in" onClick={(e) => e.stopPropagation()}>
              <CostForm
                costs={costs}
                onSubmit={handleAddOrUpdateCost}
                editingCost={editingCost}
                onCancelEdit={handleCancelEdit}
              />
            </div>
          </div>
        )}

        {/* Min Balance Modal */}
        <MinBalanceModal
          isOpen={isMinBalanceOpen}
          onClose={() => setIsMinBalanceOpen(false)}
          costs={costs}
          salaryDay={salaryDay}
          onSalaryDayChange={handleSalaryDayChange}
        />

        {/* Floating Action Button (FAB) */}
        <button
          className={`fab-button ${isFormOpen ? 'open' : ''}`}
          onClick={() => {
            if (isFormOpen) {
              handleCancelEdit();
            } else {
              setIsFormOpen(true);
            }
          }}
          aria-label={isFormOpen ? "Close form" : "Add cost"}
        >
          <Plus className="fab-icon" size={24} />
        </button>
      </main>

      {/* Notification Toast */}
      <NotificationToast
        message={toastMessage}
        details={toastDetails}
        isVisible={isToastVisible}
        onDismiss={() => setIsToastVisible(false)}
      />

      {/* Footer */}
      <footer className="app-footer">
        <p>&copy; {new Date().getFullYear()} RecurrFin &bull; Frontend-Only Expense Tracker</p>
      </footer>
    </div>
  );
}

export default App;
