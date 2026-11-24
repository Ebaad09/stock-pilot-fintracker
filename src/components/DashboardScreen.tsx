import {
  ArrowDownRight,
  ArrowUpRight,
  ClipboardList,
  Plus,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type {
  FinancialReportData,
  OrderData,
  TransactionData,
} from '../services/stockPilotService';
import type { ScreenId } from '../types';
import { formatPKR, formatSignedPKR } from '../utils/format';

interface DashboardScreenProps {
  report: FinancialReportData;
  orders: OrderData[];
  transactions: TransactionData[];
  onNavigate: (screen: ScreenId) => void;
}

export function DashboardScreen({
  report,
  orders,
  transactions,
  onNavigate,
}: DashboardScreenProps) {
  const recentTransactions = transactions.slice(0, 5);
  const isGrossLoss = report.grossProfit < 0;
  const isNetLoss = report.netProfit < 0;

  return (
    <div className="space-y-6">
      {/* Header + Quick Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Overview of StockPilot inventory activity and FinTracker accounts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('sell')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)] transition-opacity hover:opacity-90 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Sell product</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('finance')}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--elevated)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Add expense</span>
          </button>
        </div>
      </div>

      {/* Report Cards */}
      <section aria-label="Financial Report Summary" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-[var(--muted)]">Revenue</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)] tabular-nums">
            {formatPKR(report.revenue)}
          </p>
        </div>

        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-[var(--muted)]">Cost of goods</p>
          <p className="mt-2 text-2xl font-bold text-[var(--text)] tabular-nums">
            {formatPKR(report.costOfGoods)}
          </p>
        </div>

        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-[var(--muted)]">Expenses</p>
          <p className="mt-2 text-2xl font-bold text-[var(--warning)] tabular-nums">
            {formatPKR(report.expenses)}
          </p>
        </div>

        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-[var(--muted)]">Gross profit</p>
          <div className="mt-2 flex items-center gap-2">
            {isGrossLoss ? (
              <TrendingDown className="h-5 w-5 text-[var(--loss)] shrink-0" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-5 w-5 text-[var(--profit)] shrink-0" aria-hidden="true" />
            )}
            <p
              className={`text-2xl font-bold tabular-nums ${
                isGrossLoss ? 'text-[var(--loss)]' : 'text-[var(--profit)]'
              }`}
            >
              {formatSignedPKR(report.grossProfit)}
            </p>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {isGrossLoss ? 'Gross loss' : 'Gross profit'}
          </p>
        </div>

        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <p className="text-xs font-medium text-[var(--muted)]">Net profit</p>
          <div className="mt-2 flex items-center gap-2">
            {isNetLoss ? (
              <TrendingDown className="h-5 w-5 text-[var(--loss)] shrink-0" aria-hidden="true" />
            ) : (
              <TrendingUp className="h-5 w-5 text-[var(--profit)] shrink-0" aria-hidden="true" />
            )}
            <p
              className={`text-2xl font-bold tabular-nums ${
                isNetLoss ? 'text-[var(--loss)]' : 'text-[var(--profit)]'
              }`}
            >
              {formatSignedPKR(report.netProfit)}
            </p>
          </div>
          <p className="mt-1 text-xs text-[var(--muted)]">
            {isNetLoss ? 'Net loss (after expenses)' : 'Net profit (after expenses)'}
          </p>
        </div>

        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-[var(--muted)]">Pending orders</p>
            <p className="mt-2 text-2xl font-bold text-[var(--text)] tabular-nums">
              {orders.length}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('orders')}
            className="mt-3 inline-flex min-h-[44px] items-center gap-2 self-start text-xs font-medium text-[var(--primary-ink)] hover:underline whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <ClipboardList className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Open order queue</span>
          </button>
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-[var(--border)] px-6 py-4">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Recent transactions
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('finance')}
            className="min-h-[44px] px-2 text-xs font-medium text-[var(--primary-ink)] hover:underline whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            View all ({transactions.length})
          </button>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-[var(--muted)]">
              No transactions recorded yet. Record a sale or add an expense to get started.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('sell')}
                className="min-h-[44px] rounded-[10px] bg-[var(--primary)] px-4 py-2 text-xs font-medium text-[var(--primary-text)] hover:opacity-90"
              >
                Sell product
              </button>
              <button
                type="button"
                onClick={() => onNavigate('finance')}
                className="min-h-[44px] rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-4 py-2 text-xs font-medium text-[var(--text)] hover:border-[var(--primary)]"
              >
                Add expense
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {recentTransactions.map((tx, idx) => (
              <div
                key={`${tx.type}-${tx.productID}-${tx.description}-${idx}`}
                className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-[var(--elevated)]/60"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {tx.type === 'SALE' ? (
                    <ArrowDownRight className="h-4 w-4 text-[var(--profit)] shrink-0" aria-hidden="true" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-[var(--warning)] shrink-0" aria-hidden="true" />
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--text)]">
                      {tx.description}
                    </p>
                    <p className="text-xs text-[var(--muted)]">
                      {tx.type}
                      {tx.productID > 0 ? ` · ID #${tx.productID}` : ''}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-semibold tabular-nums shrink-0 ${
                    tx.type === 'SALE' ? 'text-[var(--profit)]' : 'text-[var(--loss)]'
                  }`}
                >
                  {tx.type === 'SALE' ? '+' : '−'}
                  {formatPKR(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
