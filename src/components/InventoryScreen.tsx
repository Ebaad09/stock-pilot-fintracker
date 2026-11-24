import { useState, type FormEvent } from 'react';
import { ArrowUpDown, Plus, Search, X } from 'lucide-react';
import type { ProductData, ServiceResult } from '../services/stockPilotService';
import { formatPKR } from '../utils/format';

interface InventoryScreenProps {
  products: ProductData[];
  onAddProduct: (
    id: number,
    name: string,
    costPrice: number,
    sellPrice: number,
    quantity: number
  ) => ServiceResult;
  onSearchById: (id: number) => ServiceResult<ProductData | null>;
  onSortByPrice: () => ServiceResult;
}

export function InventoryScreen({
  products,
  onAddProduct,
  onSearchById,
  onSortByPrice,
}: InventoryScreenProps) {
  const [searchId, setSearchId] = useState('');
  const [searchResult, setSearchResult] = useState<ProductData | null>(null);
  const [searchMessage, setSearchMessage] = useState<string | null>(null);
  const [sortedByPrice, setSortedByPrice] = useState(false);

  // Add product form state & inline validation
  const [idInput, setIdInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [costInput, setCostInput] = useState('');
  const [sellInput, setSellInput] = useState('');
  const [qtyInput, setQtyInput] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{
    id?: string;
    name?: string;
    cost?: string;
    sell?: string;
    qty?: string;
  }>({});

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    const parsed = Number.parseInt(searchId.trim(), 10);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setSearchResult(null);
      setSearchMessage('Enter a valid product ID greater than 0.');
      return;
    }
    const res = onSearchById(parsed);
    if (res.ok && res.data) {
      setSearchResult(res.data);
      setSearchMessage(null);
    } else {
      setSearchResult(null);
      setSearchMessage(res.message);
    }
  };

  const clearSearch = () => {
    setSearchId('');
    setSearchResult(null);
    setSearchMessage(null);
  };

  const handleSortToggle = () => {
    const res = onSortByPrice();
    if (res.ok) {
      setSortedByPrice(true);
    }
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errors: typeof fieldErrors = {};

    const id = Number.parseInt(idInput.trim(), 10);
    const name = nameInput.trim();
    const cost = Number.parseFloat(costInput);
    const sell = Number.parseFloat(sellInput);
    const qty = Number.parseInt(qtyInput.trim(), 10);

    if (!Number.isInteger(id) || id <= 0) {
      errors.id = 'ID must be an integer greater than 0.';
    } else if (products.some((p) => p.id === id)) {
      errors.id = `Product ID #${id} already exists.`;
    }

    if (!name) {
      errors.name = 'Product name is required.';
    }

    if (!Number.isFinite(cost) || cost < 0) {
      errors.cost = 'Cost price cannot be negative.';
    }

    if (!Number.isFinite(sell) || sell < 0) {
      errors.sell = 'Selling price cannot be negative.';
    }

    if (!Number.isInteger(qty) || qty < 0) {
      errors.qty = 'Quantity cannot be negative.';
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const res = onAddProduct(id, name, cost, sell, qty);
    if (res.ok) {
      setIdInput('');
      setNameInput('');
      setCostInput('');
      setSellInput('');
      setQtyInput('');
      setFieldErrors({});
      setSortedByPrice(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
          Inventory
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Manage products, search by ID, and sort catalog by selling price.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Left: Add Product Form */}
        <section className="lg:col-span-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Add product
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            ID must be positive and unique. Prices and quantity cannot be negative.
          </p>

          <form onSubmit={handleAddSubmit} noValidate className="mt-4 space-y-4">
            <div>
              <label htmlFor="inv-id" className="block text-xs font-medium text-[var(--text)]">
                Product ID
              </label>
              <input
                id="inv-id"
                type="number"
                min={1}
                value={idInput}
                onChange={(e) => setIdInput(e.target.value)}
                placeholder="e.g. 101"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] tabular-nums placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              />
              {fieldErrors.id && (
                <p className="mt-1 text-xs text-[var(--loss)]">{fieldErrors.id}</p>
              )}
            </div>

            <div>
              <label htmlFor="inv-name" className="block text-xs font-medium text-[var(--text)]">
                Name
              </label>
              <input
                id="inv-name"
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. Keyboard"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              />
              {fieldErrors.name && (
                <p className="mt-1 text-xs text-[var(--loss)]">{fieldErrors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="inv-cost" className="block text-xs font-medium text-[var(--text)]">
                  Cost price (PKR)
                </label>
                <input
                  id="inv-cost"
                  type="number"
                  min={0}
                  step="0.01"
                  value={costInput}
                  onChange={(e) => setCostInput(e.target.value)}
                  placeholder="2500"
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] tabular-nums placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                />
                {fieldErrors.cost && (
                  <p className="mt-1 text-xs text-[var(--loss)]">{fieldErrors.cost}</p>
                )}
              </div>

              <div>
                <label htmlFor="inv-sell" className="block text-xs font-medium text-[var(--text)]">
                  Selling price (PKR)
                </label>
                <input
                  id="inv-sell"
                  type="number"
                  min={0}
                  step="0.01"
                  value={sellInput}
                  onChange={(e) => setSellInput(e.target.value)}
                  placeholder="4000"
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] tabular-nums placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                />
                {fieldErrors.sell && (
                  <p className="mt-1 text-xs text-[var(--loss)]">{fieldErrors.sell}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="inv-qty" className="block text-xs font-medium text-[var(--text)]">
                Quantity
              </label>
              <input
                id="inv-qty"
                type="number"
                min={0}
                value={qtyInput}
                onChange={(e) => setQtyInput(e.target.value)}
                placeholder="10"
                className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] tabular-nums placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              />
              {fieldErrors.qty && (
                <p className="mt-1 text-xs text-[var(--loss)]">{fieldErrors.qty}</p>
              )}
            </div>

            <button
              type="submit"
              className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)] transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
            >
              <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Add product</span>
            </button>
          </form>
        </section>

        {/* Right: Search, Sort Toggle, and Product Table */}
        <section className="lg:col-span-8 space-y-4">
          <div className="flex flex-col gap-3 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between">
            <form onSubmit={handleSearch} className="flex flex-1 items-center gap-2">
              <div className="relative flex-1 max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" aria-hidden="true" />
                <input
                  type="number"
                  min={1}
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  placeholder="Search by ID..."
                  aria-label="Search product by ID"
                  className="min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] pl-9 pr-3 text-sm text-[var(--text)] tabular-nums placeholder:text-[var(--muted)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                />
              </div>
              <button
                type="submit"
                className="min-h-[44px] rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-4 text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                Search
              </button>
              {(searchResult || searchMessage) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  aria-label="Clear search"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] text-[var(--muted)] hover:text-[var(--text)]"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </form>

            <button
              type="button"
              onClick={handleSortToggle}
              aria-pressed={sortedByPrice}
              disabled={products.length < 2}
              className={`inline-flex min-h-[44px] items-center gap-2 rounded-[10px] border px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                sortedByPrice
                  ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)]'
                  : 'border-[var(--border)] bg-[var(--elevated)] text-[var(--text)] hover:border-[var(--primary)]'
              }`}
            >
              <ArrowUpDown className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Sort by price</span>
            </button>
          </div>

          {searchMessage && (
            <div className="rounded-[16px] border border-[var(--warning)]/40 bg-[var(--warning)]/10 px-4 py-3 text-sm text-[var(--text)]">
              {searchMessage}
            </div>
          )}

          {searchResult && (
            <div className="rounded-[16px] border border-[var(--accent)]/50 bg-[var(--surface)] p-4 shadow-[var(--shadow-card)]">
              <p className="text-xs font-medium text-[var(--accent)]">
                BST Search Match
              </p>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--text)]">
                    #{searchResult.id} · {searchResult.name}
                  </p>
                  <p className="text-xs text-[var(--muted)] tabular-nums">
                    Cost: {formatPKR(searchResult.costPrice)} · Selling: {formatPKR(searchResult.sellPrice)}
                  </p>
                </div>
                <span
                  className={`rounded-[8px] px-2.5 py-1 text-xs font-semibold tabular-nums ${
                    searchResult.quantity === 0
                      ? 'bg-[var(--loss)]/15 text-[var(--loss)]'
                      : 'bg-[var(--profit)]/15 text-[var(--profit)]'
                  }`}
                >
                  Qty: {searchResult.quantity}
                </span>
              </div>
            </div>
          )}

          <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] overflow-hidden">
            {products.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <p className="text-base font-semibold text-[var(--text)]">
                  No products available
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">
                  Use the Add product form to create your first inventory item.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)] bg-[var(--elevated)] text-xs font-semibold text-[var(--muted)]">
                      <th className="py-3.5 pl-6 pr-3 text-right">ID</th>
                      <th className="px-3 py-3.5">Name</th>
                      <th className="px-3 py-3.5 text-right">Cost price</th>
                      <th className="px-3 py-3.5 text-right">Selling price</th>
                      <th className="py-3.5 pl-3 pr-6 text-right">Quantity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] text-sm">
                    {products.map((p) => {
                      const isMatch = searchResult?.id === p.id;
                      const isZero = p.quantity === 0;
                      return (
                        <tr
                          key={p.id}
                          className={`transition-colors ${
                            isMatch
                              ? 'bg-[var(--accent-soft)]'
                              : 'hover:bg-[var(--elevated)]/60'
                          }`}
                        >
                          <td className="py-3.5 pl-6 pr-3 text-right font-medium text-[var(--muted)] tabular-nums">
                            {p.id}
                          </td>
                          <td className="px-3 py-3.5 font-medium text-[var(--text)]">
                            {p.name}
                          </td>
                          <td className="px-3 py-3.5 text-right text-[var(--muted)] tabular-nums">
                            {formatPKR(p.costPrice)}
                          </td>
                          <td className="px-3 py-3.5 text-right font-medium text-[var(--text)] tabular-nums">
                            {formatPKR(p.sellPrice)}
                          </td>
                          <td className="py-3.5 pl-3 pr-6 text-right">
                            <span
                              className={`inline-block rounded-[8px] px-2.5 py-1 text-xs font-semibold tabular-nums ${
                                isZero
                                  ? 'bg-[var(--loss)]/15 text-[var(--loss)]'
                                  : 'bg-[var(--profit)]/15 text-[var(--profit)]'
                              }`}
                            >
                              {isZero ? '0 (Out)' : p.quantity}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
