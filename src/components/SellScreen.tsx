import { useState, type FormEvent } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { ProductData, ServiceResult } from '../services/stockPilotService';
import type { ScreenId } from '../types';
import { formatPKR } from '../utils/format';

interface SellScreenProps {
  products: ProductData[];
  onSellProduct: (
    productID: number,
    quantity: number
  ) => ServiceResult<{ saleAmount: number }>;
  onNavigate: (screen: ScreenId) => void;
}

export function SellScreen({
  products,
  onSellProduct,
  onNavigate,
}: SellScreenProps) {
  const [selectedId, setSelectedId] = useState<string>(
    products[0] ? String(products[0].id) : ''
  );
  const [quantityInput, setQuantityInput] = useState('1');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const effectiveId =
    selectedId && products.some((p) => String(p.id) === selectedId)
      ? selectedId
      : products[0]
        ? String(products[0].id)
        : '';

  const selectedProduct =
    products.find((p) => String(p.id) === effectiveId) ?? null;

  const parsedQty = Number.parseInt(quantityInput, 10);
  const validQty = Number.isInteger(parsedQty) && parsedQty > 0 ? parsedQty : 0;
  const totalSale = selectedProduct ? selectedProduct.sellPrice * validQty : 0;
  const totalCost = selectedProduct ? selectedProduct.costPrice * validQty : 0;

  const insufficientStock =
    selectedProduct !== null &&
    (selectedProduct.quantity === 0 || validQty > selectedProduct.quantity);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedProduct) {
      setErrorMessage('Product not found.');
      return;
    }
    if (!Number.isInteger(parsedQty) || parsedQty <= 0) {
      setErrorMessage('Enter a valid quantity greater than 0.');
      return;
    }
    if (selectedProduct.quantity < parsedQty) {
      setErrorMessage(
        `Insufficient stock. Only ${selectedProduct.quantity} unit(s) available for ${selectedProduct.name}.`
      );
      return;
    }

    const res = onSellProduct(selectedProduct.id, parsedQty);
    if (res.ok) {
      setQuantityInput('1');
      setErrorMessage(null);
    } else {
      setErrorMessage(res.message);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text)]">
          Sell product
        </h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Deduct stock, update revenue and cost of goods, and record a SALE transaction.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="rounded-[16px] border border-[var(--border)] bg-[var(--surface)] px-6 py-16 text-center shadow-[var(--shadow-card)]">
          <p className="text-base font-semibold text-[var(--text)]">
            No products available to sell
          </p>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Add products in Inventory before recording a sale.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('inventory')}
            className="mt-4 min-h-[44px] rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)] hover:opacity-90"
          >
            Go to Inventory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          <section className="lg:col-span-7 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)]">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="sell-product" className="block text-xs font-medium text-[var(--text)]">
                  Select product
                </label>
                <select
                  id="sell-product"
                  value={effectiveId}
                  onChange={(e) => {
                    setSelectedId(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      #{p.id} · {p.name} ({p.quantity} in stock · {formatPKR(p.sellPrice)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sell-qty" className="block text-xs font-medium text-[var(--text)]">
                  Quantity
                </label>
                <input
                  id="sell-qty"
                  type="number"
                  min={1}
                  value={quantityInput}
                  onChange={(e) => {
                    setQuantityInput(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="mt-1 min-h-[44px] w-full rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 py-2 text-sm text-[var(--text)] tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
                />
              </div>

              {(errorMessage || insufficientStock) && (
                <div
                  role="alert"
                  className="rounded-[10px] border border-[var(--loss)]/40 bg-[var(--loss)]/10 px-4 py-3 text-sm text-[var(--loss)]"
                >
                  {errorMessage ??
                    `Not enough stock. Available: ${selectedProduct?.quantity ?? 0}.`}
                </div>
              )}

              <button
                type="submit"
                disabled={!selectedProduct || insufficientStock || validQty <= 0}
                className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-[10px] bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--primary-text)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
              >
                <ShoppingCart className="h-4 w-4 shrink-0" aria-hidden="true" />
                <span>Confirm sale</span>
              </button>
            </form>
          </section>

          <section className="lg:col-span-5 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-card)] space-y-4">
            <h2 className="text-base font-semibold text-[var(--text)]">
              Sale preview
            </h2>

            {selectedProduct && (
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Product</span>
                  <span className="font-medium text-[var(--text)]">
                    #{selectedProduct.id} · {selectedProduct.name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Available stock</span>
                  <span
                    className={`font-semibold tabular-nums ${
                      selectedProduct.quantity === 0
                        ? 'text-[var(--loss)]'
                        : 'text-[var(--profit)]'
                    }`}
                  >
                    {selectedProduct.quantity}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--muted)]">Unit selling price</span>
                  <span className="tabular-nums text-[var(--text)]">
                    {formatPKR(selectedProduct.sellPrice)}
                  </span>
                </div>

                <div className="border-t border-[var(--border)] pt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-[var(--text)]">Total (Revenue)</span>
                    <span className="text-lg font-bold text-[var(--profit)] tabular-nums">
                      +{formatPKR(totalSale)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--muted)]">Cost of goods</span>
                    <span className="font-medium text-[var(--text)] tabular-nums">
                      {formatPKR(totalCost)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
