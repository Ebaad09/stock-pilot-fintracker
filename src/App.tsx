/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle2, X } from 'lucide-react';
import { DashboardScreen } from './components/DashboardScreen';
import { FinanceScreen } from './components/FinanceScreen';
import { InventoryScreen } from './components/InventoryScreen';
import { OrdersScreen } from './components/OrdersScreen';
import { ReportScreen } from './components/ReportScreen';
import { SellScreen } from './components/SellScreen';
import { Sidebar } from './components/Sidebar';
import {
  stockPilotService,
  type ServiceResult,
  type StockPilotSnapshot,
} from './services/stockPilotService';
import { applyThemeTokens, type ThemeMode } from './theme/tokens';
import type { ScreenId, ToastMessage } from './types';

const THEME_STORAGE_KEY = 'stockpilot_theme_v1';

function getInitialTheme(): ThemeMode {
  try {
    const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
  } catch {
    // Fallback to default dark theme
  }
  return 'dark';
}

export default function App() {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);
  const [activeScreen, setActiveScreen] = useState<ScreenId>('dashboard');
  const [snapshot, setSnapshot] = useState<StockPilotSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  useEffect(() => {
    applyThemeTokens(theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // Ignore storage write restriction
    }
  }, [theme]);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ id: Date.now(), type, text });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 5000);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const loadWorkspace = useCallback(() => {
    setLoading(true);
    setLoadError(null);
    try {
      const data = stockPilotService.load();
      setSnapshot(data);
    } catch (err) {
      setLoadError(
        err instanceof Error
          ? err.message
          : 'Failed to load data from browser storage.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const refreshSnapshot = useCallback(() => {
    setSnapshot(stockPilotService.getSnapshot());
  }, []);

  const handleServiceResult = useCallback(
    <T,>(res: ServiceResult<T>): ServiceResult<T> => {
      refreshSnapshot();
      showToast(res.ok ? 'success' : 'error', res.message);
      return res;
    },
    [refreshSnapshot, showToast]
  );

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[var(--bg)] text-[var(--text)]">
      <Sidebar
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        canUndo={snapshot?.canUndo ?? false}
        undoCount={snapshot?.undoCount ?? 0}
        onUndo={() => handleServiceResult(stockPilotService.undoLastStockChange())}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        pendingOrdersCount={snapshot?.orders.length ?? 0}
      />

      <main className="flex-1 px-4 pt-6 pb-24 sm:px-6 md:p-8">
        <div className="mx-auto max-w-[1200px]">
          {loading ? (
            <div className="space-y-6" aria-label="Loading application">
              <div className="h-10 w-48 animate-pulse rounded-[10px] bg-[var(--surface)]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2, 3, 4, 5].map((idx) => (
                  <div
                    key={idx}
                    className="h-28 animate-pulse rounded-[16px] border border-[var(--border)] bg-[var(--surface)]"
                  />
                ))}
              </div>
              <div className="h-64 animate-pulse rounded-[16px] border border-[var(--border)] bg-[var(--surface)]" />
            </div>
          ) : loadError || !snapshot ? (
            <div className="rounded-[16px] border border-[var(--loss)]/40 bg-[var(--surface)] p-8 text-center shadow-[var(--shadow-card)]">
              <h1 className="text-lg font-semibold text-[var(--text)]">
                Unable to load StockPilot + FinTracker
              </h1>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {loadError ?? 'Browser storage is unavailable.'}
              </p>
              <button
                type="button"
                onClick={loadWorkspace}
                className="mt-4 min-h-[44px] rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)]"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              {activeScreen === 'dashboard' && (
                <DashboardScreen
                  report={snapshot.report}
                  orders={snapshot.orders}
                  transactions={snapshot.transactions}
                  onNavigate={setActiveScreen}
                />
              )}

              {activeScreen === 'inventory' && (
                <InventoryScreen
                  products={snapshot.products}
                  onAddProduct={(id, name, cost, sell, qty) =>
                    handleServiceResult(
                      stockPilotService.addProduct(id, name, cost, sell, qty)
                    )
                  }
                  onSearchById={(id) =>
                    handleServiceResult(stockPilotService.searchProductByID(id))
                  }
                  onSortByPrice={() =>
                    handleServiceResult(stockPilotService.sortProductsByPrice())
                  }
                />
              )}

              {activeScreen === 'sell' && (
                <SellScreen
                  products={snapshot.products}
                  onSellProduct={(id, qty) =>
                    handleServiceResult(stockPilotService.sellProduct(id, qty))
                  }
                  onNavigate={setActiveScreen}
                />
              )}

              {activeScreen === 'orders' && (
                <OrdersScreen
                  products={snapshot.products}
                  orders={snapshot.orders}
                  onAddOrder={(id, qty) =>
                    handleServiceResult(stockPilotService.addPendingOrder(id, qty))
                  }
                  onProcessNextOrder={() =>
                    handleServiceResult(stockPilotService.processNextOrder())
                  }
                  onNavigate={setActiveScreen}
                />
              )}

              {activeScreen === 'finance' && (
                <FinanceScreen
                  transactions={snapshot.transactions}
                  onAddExpense={(desc, amount) =>
                    handleServiceResult(stockPilotService.addExpense(desc, amount))
                  }
                  onSortByAmount={() =>
                    handleServiceResult(
                      stockPilotService.sortTransactionsByAmount()
                    )
                  }
                />
              )}

              {activeScreen === 'report' && (
                <ReportScreen
                  report={snapshot.report}
                  hasTransactions={snapshot.transactions.length > 0}
                  onNavigate={setActiveScreen}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Success / Failure Toast */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`fixed bottom-16 right-4 md:bottom-6 md:right-6 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-start justify-between gap-3 rounded-[16px] border px-4 py-3.5 shadow-[var(--shadow-card)] ${
            toast.type === 'success'
              ? 'border-[var(--profit)]/40 bg-[var(--elevated)] text-[var(--text)]'
              : 'border-[var(--loss)]/40 bg-[var(--elevated)] text-[var(--text)]'
          }`}
        >
          <div className="flex items-start gap-2.5 min-w-0">
            {toast.type === 'success' ? (
              <CheckCircle2
                className="mt-0.5 h-5 w-5 text-[var(--profit)] shrink-0"
                aria-hidden="true"
              />
            ) : (
              <AlertCircle
                className="mt-0.5 h-5 w-5 text-[var(--loss)] shrink-0"
                aria-hidden="true"
              />
            )}
            <div className="min-w-0">
              <p className="text-xs font-semibold">
                {toast.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p className="mt-0.5 text-xs text-[var(--muted)]">{toast.text}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setToast(null)}
            aria-label="Dismiss message"
            className="inline-flex min-h-[32px] min-w-[32px] items-center justify-center rounded-[8px] text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--text)] shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
