import { useState, type FormEvent } from 'react';
import { Play, Plus } from 'lucide-react';
import type { OrderData, ProductData, ServiceResult } from '../services/stockPilotService';
import type { ScreenId } from '../types';

interface OrdersScreenProps {
  products: ProductData[];
  orders: OrderData[];
  onAddOrder: (productID: number, quantity: number) => ServiceResult;
  onProcessNextOrder: () => ServiceResult;
  onNavigate: (screen: ScreenId) => void;
}

export function OrdersScreen({
  products,
  orders,
  onAddOrder,
  onProcessNextOrder,
  onNavigate,
}: OrdersScreenProps) {
  const [selectedId, setSelectedId] = useState<string>(
    products[0] ? String(products[0].id) : ''
  );
  const [qtyInput, setQtyInput] = useState('1');
  const [formError, setFormError] = useState<string | null>(null);

  const effectiveId =
    selectedId && products.some((p) => String(p.id) === selectedId)
      ? selectedId
      : products[0]
        ? String(products[0].id)
        : '';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const id = Number.parseInt(effectiveId, 10);
    const qty = Number.parseInt(qtyInput, 10);

    if (!Number.isInteger(id) || id <= 0) {
      setFormError('Select a valid product.');
      return;
    }
    if (!Number.isInteger(qty) || qty <= 0) {
      setFormError('Quantity requested must be greater than 0.');
      return;
    }

    const res = onAddOrder(id, qty);
    if (res.ok) {
      setQtyInput('1');
    } else {
      setFormError(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
            Orders
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Pending order queue processed first in, first out (FIFO).
          </p>
        </div>

        <button
          type="button"
          onClick={onProcessNextOrder}
          disabled={orders.length === 0}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
        >
          <Play className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Process next order</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
        {/* Add Order Form */}
        <section className="lg:col-span-5 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
          <h2 className="text-base font-semibold text-[var(--text)]">
            Add order
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Queue a product ID and requested quantity for fulfillment.
          </p>

          {products.length === 0 ? (
            <div className="mt-4 rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] p-4 text-center">
              <p className="text-xs text-[var(--muted)]">
                Add products in Inventory before queuing orders.
              </p>
              <button
                type="button"
                onClick={() => onNavigate('inventory')}
                className="mt-3 min-h-[44px] rounded-[10px] bg-[var(--primary)] px-4 text-xs font-medium text-[var(--primary-text)]"
              >
                Go to Inventory
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="ord-product" className="block text-xs font-medium text-[var(--text)]">
                  Product
                </label>
                <select
                  id="ord-product"
                  value={effectiveId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setFormError(null);
                  }}
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} · {p.name} ({p.quantity} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="ord-qty" className="block text-xs font-medium text-[var(--text)]">
                  Quantity requested
                </label>
                <input
                  id="ord-qty"
                  type="number"
                  min={1}
                  value={qtyInput}
                  onChange={(e) => {
                    setQtyInput(e.target.value);
                    setFormError(null);
                  }}
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                />
              </div>

              {formError && (
                <p className="text-xs text-[var(--loss)]">{formError}</p>
              )}

              <button
                type="submit"
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-4 py-2 text-sm font-medium text-[var(--text)] hover:border-[var(--primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <Plus className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Add order</span>
              </button>
            </form>
          )}
        </section>

        {/* FIFO Queue List */}
        <section className="lg:col-span-7 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-card)] overflow-hidden">
          <div className="border-b border-[var(--border)] px-6 py-4">
            <h2 className="text-base font-semibold text-[var(--text)]">
              Order queue ({orders.length})
            </h2>
          </div>

          {orders.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <p className="text-base font-semibold text-[var(--text)]">
                No pending orders
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">
                Orders added to the queue will appear here in FIFO order.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {orders.map((order, idx) => {
                const product = products.find((p) => p.id === order.productID);
                const isNext = idx === 0;
                const enoughStock = product ? product.quantity >= order.quantity : false;

                return (
                  <div
                    key={`${order.productID}-${idx}`}
                    className={`flex items-center justify-between gap-4 px-6 py-4 ${
                      isNext ? 'bg-[var(--accent-soft)]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-[8px] px-2 py-0.5 text-xs font-semibold tabular-nums ${
                            isNext
                              ? 'bg-[var(--accent)] text-[var(--accent-text)]'
                              : 'bg-[var(--elevated)] text-[var(--muted)]'
                          }`}
                        >
                          {isNext ? 'Next order' : `#${idx + 1}`}
                        </span>
                        <span className="text-xs text-[var(--muted)] tabular-nums">
                          Product ID {order.productID}
                        </span>
                      </div>
                      <p className="mt-1.5 truncate text-sm font-semibold text-[var(--text)]">
                        {product ? product.name : `Product #${order.productID}`}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-[var(--text)] tabular-nums">
                        Qty: {order.quantity}
                      </p>
                      <p
                        className={`text-xs font-medium tabular-nums ${
                          enoughStock ? 'text-[var(--profit)]' : 'text-[var(--loss)]'
                        }`}
                      >
                        {enoughStock
                          ? `Ready (${product?.quantity ?? 0} in stock)`
                          : `Insufficient (${product?.quantity ?? 0} in stock)`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
