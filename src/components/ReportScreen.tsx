import { TrendingDown, TrendingUp } from 'lucide-react';
import type { FinancialReportData } from '../services/stockPilotService';
import type { ScreenId } from '../types';
import { formatPKR, formatSignedPKR } from '../utils/format';

interface ReportScreenProps {
  report: FinancialReportData;
  hasTransactions: boolean;
  onNavigate: (screen: ScreenId) => void;
}

export function ReportScreen({
  report,
  hasTransactions,
  onNavigate,
}: ReportScreenProps) {
  const maxVal = Math.max(
    report.revenue,
    report.costOfGoods,
    report.expenses,
    Math.abs(report.grossProfit),
    Math.abs(report.netProfit),
    1
  );

  const chartItems = [
    {
      label: 'Revenue',
      value: report.revenue,
      display: formatPKR(report.revenue),
      color: 'var(--primary)',
      note: 'Total sales',
    },
    {
      label: 'Cost of goods',
      value: report.costOfGoods,
      display: formatPKR(report.costOfGoods),
      color: 'var(--accent)',
      note: 'COGS',
    },
    {
      label: 'Other expenses',
      value: report.expenses,
      display: formatPKR(report.expenses),
      color: 'var(--warning)',
      note: 'Operating expenses',
    },
    {
      label: 'Gross profit',
      value: Math.abs(report.grossProfit),
      display: formatSignedPKR(report.grossProfit),
      color: report.grossProfit < 0 ? 'var(--loss)' : 'var(--profit)',
      note: report.grossProfit < 0 ? 'Loss' : 'Profit',
    },
    {
      label: 'Net profit',
      value: Math.abs(report.netProfit),
      display: formatSignedPKR(report.netProfit),
      color: report.netProfit < 0 ? 'var(--loss)' : 'var(--profit)',
      note: report.netProfit < 0 ? 'Net loss' : 'Net profit',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
          Financial report
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Full profit breakdown calculated from revenue, cost of goods, and expenses.
        </p>
      </div>

      {!hasTransactions ? (
        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-card)]">
          <p className="text-base font-semibold text-[var(--text)]">
            No financial activity yet
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Record a product sale or add an expense to generate your financial report.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('sell')}
              className="min-h-[44px] rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)]"
            >
              Sell product
            </button>
            <button
              type="button"
              onClick={() => onNavigate('finance')}
              className="min-h-[44px] rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-4 py-2 text-sm font-medium text-[var(--text)]"
            >
              Add expense
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Simple Visual Breakdown Chart */}
          <section className="lg:col-span-7 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold text-[var(--text)]">
              Profit breakdown chart
            </h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Proportional comparison across revenue, costs, and profit (PKR)
            </p>

            <div className="mt-6 space-y-5">
              {chartItems.map((item) => {
                const widthPct = Math.max(
                  item.value > 0 ? 3 : 0,
                  Math.round((item.value / maxVal) * 100)
                );
                return (
                  <div key={item.label}>
                    <div className="flex items-baseline justify-between gap-4 text-sm">
                      <span className="font-medium text-[var(--text)]">
                        {item.label}{' '}
                        <span className="text-xs font-normal text-[var(--muted)]">
                          ({item.note})
                        </span>
                      </span>
                      <span className="font-semibold tabular-nums text-[var(--text)]">
                        {item.display}
                      </span>
                    </div>
                    <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-[var(--elevated)]">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Exact Report Ledger Numbers */}
          <section className="lg:col-span-5 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
            <h2 className="text-base font-semibold text-[var(--text)]">
              Statement figures
            </h2>

            <dl className="mt-5 divide-y divide-[var(--border)] text-sm">
              <div className="flex items-center justify-between py-3">
                <dt className="text-[var(--muted)]">Revenue</dt>
                <dd className="font-semibold text-[var(--text)] tabular-nums">
                  {formatPKR(report.revenue)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-[var(--muted)]">Cost of goods</dt>
                <dd className="font-semibold text-[var(--text)] tabular-nums">
                  {formatPKR(report.costOfGoods)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="text-[var(--muted)]">Other expenses</dt>
                <dd className="font-semibold text-[var(--warning)] tabular-nums">
                  {formatPKR(report.expenses)}
                </dd>
              </div>
              <div className="flex items-center justify-between py-3">
                <dt className="font-medium text-[var(--text)]">Gross profit</dt>
                <dd
                  className={`inline-flex items-center gap-1.5 font-bold tabular-nums ${
                    report.grossProfit < 0
                      ? 'text-[var(--loss)]'
                      : 'text-[var(--profit)]'
                  }`}
                >
                  {report.grossProfit < 0 ? (
                    <TrendingDown className="h-4 w-4 shrink-0" aria-hidden="true" />
                  ) : (
                    <TrendingUp className="h-4 w-4 shrink-0" aria-hidden="true" />
                  )}
                  <span>{formatSignedPKR(report.grossProfit)}</span>
                </dd>
              </div>
              <div className="flex items-center justify-between pt-4">
                <dt className="text-base font-semibold text-[var(--text)]">Net profit</dt>
                <dd
                  className={`inline-flex items-center gap-1.5 text-lg font-bold tabular-nums ${
                    report.netProfit < 0
                      ? 'text-[var(--loss)]'
                      : 'text-[var(--profit)]'
                  }`}
                >
                  {report.netProfit < 0 ? (
                    <TrendingDown className="h-5 w-5 shrink-0" aria-hidden="true" />
                  ) : (
                    <TrendingUp className="h-5 w-5 shrink-0" aria-hidden="true" />
                  )}
                  <span>{formatSignedPKR(report.netProfit)}</span>
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </div>
  );
}
