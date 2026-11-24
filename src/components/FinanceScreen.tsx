import { useState, type FormEvent } from 'react';
import { ArrowUpDown, Plus } from 'lucide-react';
import type { ServiceResult, TransactionData } from '../services/stockPilotService';
import { formatPKR } from '../utils/format';

interface FinanceScreenProps {
  transactions: TransactionData[];
  onAddExpense: (description: string, amount: number) => ServiceResult;
  onSortByAmount: () => ServiceResult;
}

export function FinanceScreen({
  transactions,
  onAddExpense,
  onSortByAmount,
}: FinanceScreenProps) {
  const [description, setDescription] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const handleAddExpense = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanDesc = description.trim();
    const amount = Number.parseFloat(amountInput);

    if (!cleanDesc) {
      setFormError('Expense description is required.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setFormError('Amount must be positive.');
      return;
    }

    const res = onAddExpense(cleanDesc, amount);
    if (res.ok) {
      setDescription('');
      setAmountInput('');
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Finance
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Record expenses and inspect all SALE and EXPENSE transactions.
          </p>
        </div>

        <button
          type="button"
          onClick={onSortByAmount}
          disabled={transactions.length < 2}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <ArrowUpDown className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Sort by amount</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Add Expense Form */}
        <section className="lg:col-span-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Add expense
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Creates an EXPENSE transaction with a positive PKR amount.
          </p>

          <form onSubmit={handleAddExpense} noValidate className="mt-4 space-y-4">
            <div>
              <label htmlFor="fin-desc" className="block text-xs font-medium text-[var(--text)]">
                Description
              </label>
              <input
                id="fin-desc"
                type="text"
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  setFormError(null);
                }}
                placeholder="e.g. Rent"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="fin-amount" className="block text-xs font-medium text-[var(--text)]">
                Amount (PKR)
              </label>
              <input
                id="fin-amount"
                type="number"
                min={0.01}
                step="0.01"
                value={amountInput}
                onChange={(e) => {
                  setAmountInput(e.target.value);
                  setFormError(null);
                }}
                placeholder="15000"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] tabular-nums placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              />
            </div>

            {formError && (
              <p className="text-xs text-[var(--loss)]">{formError}</p>
            )}

            <button
              type="submit"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Add expense</span>
            </button>
          </form>
        </section>

        {/* Transactions List */}
        <section className="lg:col-span-8 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] overflow-hidden">
          {transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-semibold text-[var(--text)]">
                No transactions yet
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Record a sale or add an expense to view your financial ledger.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--elevated)] text-xs font-semibold text-[var(--muted)]">
                    <th className="py-3.5 pl-6 pr-3">Type</th>
                    <th className="px-3 py-3.5">Description</th>
                    <th className="py-3.5 pl-3 pr-6 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)] text-sm">
                  {transactions.map((tx, idx) => {
                    const isSale = tx.type === 'SALE';
                    return (
                      <tr
                        key={`${tx.type}-${tx.productID}-${idx}`}
                        className="hover:bg-[var(--elevated)]/60"
                      >
                        <td className="py-3.5 pl-6 pr-3">
                          <span
                            className={`inline-block rounded-[8px] px-2.5 py-1 text-xs font-semibold ${
                              isSale
                                ? 'bg-[var(--profit)]/15 text-[var(--profit)]'
                                : 'bg-[var(--warning)]/15 text-[var(--warning)]'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-3 py-3.5 font-medium text-[var(--text)]">
                          {tx.description}
                        </td>
                        <td
                          className={`py-3.5 pl-3 pr-6 text-right font-semibold tabular-nums ${
                            isSale ? 'text-[var(--profit)]' : 'text-[var(--loss)]'
                          }`}
                        >
                          {isSale ? '+' : '−'}
                          {formatPKR(tx.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
