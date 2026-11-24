import {
  BarChart3,
  ClipboardList,
  LayoutDashboard,
  Moon,
  Package,
  RotateCcw,
  ShoppingCart,
  Sun,
  Wallet,
} from 'lucide-react';
import type { ThemeMode } from '../theme/tokens';
import type { ScreenId } from '../types';

interface NavigationProps {
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  canUndo: boolean;
  undoCount: number;
  onUndo: () => void;
  theme: ThemeMode;
  onToggleTheme: () => void;
  pendingOrdersCount: number;
}

const NAV_ITEMS: Array<{
  id: ScreenId;
  label: string;
  shortLabel: string;
  icon: typeof LayoutDashboard;
}> = [
  { id: 'dashboard', label: 'Dashboard', shortLabel: 'Home', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', shortLabel: 'Stock', icon: Package },
  { id: 'sell', label: 'Sell', shortLabel: 'Sell', icon: ShoppingCart },
  { id: 'orders', label: 'Orders', shortLabel: 'Orders', icon: ClipboardList },
  { id: 'finance', label: 'Finance', shortLabel: 'Finance', icon: Wallet },
  { id: 'report', label: 'Report', shortLabel: 'Report', icon: BarChart3 },
];

export function Sidebar({
  activeScreen,
  onSelectScreen,
  canUndo,
  undoCount,
  onUndo,
  theme,
  onToggleTheme,
  pendingOrdersCount,
}: NavigationProps) {
  return (
    <>
      {/* Desktop Left Sidebar */}
      <aside
        aria-label="Primary Navigation"
        className="hidden md:flex md:w-64 md:shrink-0 md:flex-col border-r border-[var(--border)] bg-[var(--surface)]"
      >
        <div className="flex h-16 items-center justify-between border-b border-[var(--border)] px-6">
          <span className="text-base font-bold tracking-tight text-[var(--text)] whitespace-nowrap shrink-0">
            StockPilot + FinTracker
          </span>
        </div>

        <nav className="flex-1 space-y-2 p-4" aria-label="Screens">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectScreen(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[44px] w-full items-center justify-between rounded-[10px] px-4 py-2 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)] ${
                  isActive
                    ? 'bg-[var(--primary)] text-[var(--primary-text)]'
                    : 'text-[var(--muted)] hover:bg-[var(--elevated)] hover:text-[var(--text)]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </span>
                {item.id === 'orders' && pendingOrdersCount > 0 && (
                  <span
                    className={`tabular-nums text-xs font-semibold ${
                      isActive ? 'text-[var(--primary-text)]/80' : 'text-[var(--accent)]'
                    }`}
                  >
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="space-y-2 border-t border-[var(--border)] p-4">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex min-h-[44px] w-full items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-4 py-2 text-xs font-medium text-[var(--text)] transition-colors hover:border-[var(--primary)] disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <span className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Undo last stock change</span>
            </span>
            <span className="tabular-nums text-[var(--muted)]">{undoCount}</span>
          </button>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="flex min-h-[44px] w-full items-center justify-between rounded-[10px] border border-[var(--border)] bg-[var(--surface)] px-4 py-2 text-xs font-medium text-[var(--muted)] transition-colors hover:bg-[var(--elevated)] hover:text-[var(--text)] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 shrink-0" aria-hidden="true" />
              ) : (
                <Moon className="h-4 w-4 shrink-0" aria-hidden="true" />
              )}
              <span>{theme === 'dark' ? 'Light theme' : 'Dark theme'}</span>
            </span>
          </button>
        </div>
      </aside>

      {/* Mobile Compact Header */}
      <header className="md:hidden sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--surface)] px-4">
        <span className="text-sm font-bold tracking-tight text-[var(--text)] truncate">
          StockPilot + FinTracker
        </span>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Undo last stock change"
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] px-3 text-xs font-medium text-[var(--text)] disabled:cursor-not-allowed disabled:opacity-45 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            <RotateCcw className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>Undo</span>
          </button>
          <button
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-[10px] border border-[var(--border)] bg-[var(--elevated)] text-[var(--text)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Moon className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tabs */}
      <nav
        aria-label="Mobile Screen Tabs"
        className="md:hidden fixed inset-x-0 bottom-0 z-40 grid grid-cols-6 border-t border-[var(--border)] bg-[var(--surface)]"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectScreen(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex min-h-[52px] flex-col items-center justify-center gap-1 px-1 py-1.5 text-[11px] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--primary)] ${
                isActive
                  ? 'text-[var(--primary-ink)]'
                  : 'text-[var(--muted)] hover:text-[var(--text)]'
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate max-w-full">{item.shortLabel}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}
