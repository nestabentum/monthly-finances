import React, { useRef, useState } from 'react';
import { Upload, Download, AlertCircle, RefreshCw, Plus } from 'lucide-react';
import type { CostItem } from '../types';
import { exportToCsv, parseCsv } from '../utils/csvHelper';

interface CsvActionsProps {
  costs: CostItem[];
  onImport: (items: Omit<CostItem, 'id'>[], mode: 'merge' | 'overwrite') => void;
}

export const CsvActions: React.FC<CsvActionsProps> = ({ costs, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingItems, setPendingItems] = useState<Omit<CostItem, 'id'>[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleExport = () => {
    try {
      const csvStr = exportToCsv(costs);
      const blob = new Blob([csvStr], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `recurring_costs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      setErrorMessage(`Export failed: ${err.message || err}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = parseCsv(text);
        setPendingItems(parsed);
        setErrorMessage(null);
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to parse CSV file.');
        setPendingItems(null);
      } finally {
        // Reset file input value so same file can be imported again
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the file.');
      setPendingItems(null);
    };
    reader.readAsText(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleConfirmImport = (mode: 'merge' | 'overwrite') => {
    if (pendingItems) {
      onImport(pendingItems, mode);
      setPendingItems(null);
    }
  };

  return (
    <div className="csv-actions-container">
      <div className="csv-buttons">
        <button onClick={triggerFileInput} className="btn-secondary touch-target">
          <Upload size={18} />
          <span>Import CSV</span>
        </button>
        <button 
          onClick={handleExport} 
          className="btn-secondary touch-target"
          disabled={costs.length === 0}
        >
          <Download size={18} />
          <span>Export CSV</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv"
          style={{ display: 'none' }}
        />
      </div>

      {errorMessage && (
        <div className="csv-error-alert animate-fade-in">
          <AlertCircle size={18} />
          <p className="error-text">{errorMessage}</p>
          <button className="close-alert-btn" onClick={() => setErrorMessage(null)}>×</button>
        </div>
      )}

      {pendingItems && (
        <div className="import-modal-overlay">
          <div className="import-modal-card animate-zoom-in">
            <h3 className="modal-title">Confirm CSV Import</h3>
            <p className="modal-description">
              We found <strong>{pendingItems.length}</strong> cost items in your CSV file. How would you like to proceed?
            </p>
            
            <div className="modal-actions">
              <button 
                onClick={() => handleConfirmImport('merge')} 
                className="btn-primary touch-target"
              >
                <Plus size={18} />
                <span>Merge with Existing</span>
              </button>
              <button 
                onClick={() => handleConfirmImport('overwrite')} 
                className="btn-danger touch-target"
              >
                <RefreshCw size={18} />
                <span>Overwrite Everything</span>
              </button>
              <button 
                onClick={() => setPendingItems(null)} 
                className="btn-flat touch-target"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
