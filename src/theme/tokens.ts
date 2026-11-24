export type ThemeMode = 'dark' | 'light';

export interface ColorPaletteTokens {
  background: string;
  surface: string;
  elevated: string;
  border: string;
  primary: string;
  primaryText: string;
  primaryInk: string;
  accent: string;
  accentText: string;
  accentSoft: string;
  profit: string;
  loss: string;
  warning: string;
  text: string;
  muted: string;
}

export const tokens = {
  colors: {
    dark: {
      background: '#141710',
      surface: '#1C2016',
      elevated: '#262B1E',
      border: '#39402E',
      primary: '#E6DFCC',
      primaryText: '#141710',
      primaryInk: '#DED6C1',
      accent: '#98A96A',
      accentText: '#141710',
      accentSoft: 'rgba(152, 169, 106, 0.16)',
      profit: '#22C55E',
      loss: '#EF4444',
      warning: '#F59E0B',
      text: '#F2EFE6',
      muted: '#A9AD9C',
    } satisfies ColorPaletteTokens,
    light: {
      background: '#F4F1E8',
      surface: '#FCFBF7',
      elevated: '#EAE5D8',
      border: '#D3CCB9',
      primary: '#556436',
      primaryText: '#FAF8F2',
      primaryInk: '#49572D',
      accent: '#63733F',
      accentText: '#FAF8F2',
      accentSoft: 'rgba(85, 100, 54, 0.12)',
      profit: '#15803D',
      loss: '#DC2626',
      warning: '#B45309',
      text: '#1E2217',
      muted: '#595F4E',
    } satisfies ColorPaletteTokens,
  },
  fonts: {
    sans: "'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    tabularNums: 'tabular-nums',
  },
  spacing: {
    gridUnit: '8px',
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '40px',
    touchTarget: '44px',
  },
  radii: {
    control: '10px',
    card: '16px',
    badge: '8px',
  },
  shadows: {
    dark: '0 4px 18px rgba(0, 0, 0, 0.34)',
    light: '0 4px 16px rgba(30, 34, 23, 0.07)',
  },
} as const;

export function applyThemeTokens(mode: ThemeMode): void {
  const palette = tokens.colors[mode];
  const root = document.documentElement;

  if (mode === 'dark') {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  root.style.setProperty('--bg', palette.background);
  root.style.setProperty('--surface', palette.surface);
  root.style.setProperty('--elevated', palette.elevated);
  root.style.setProperty('--border', palette.border);
  root.style.setProperty('--primary', palette.primary);
  root.style.setProperty('--primary-text', palette.primaryText);
  root.style.setProperty('--primary-ink', palette.primaryInk);
  root.style.setProperty('--accent', palette.accent);
  root.style.setProperty('--accent-text', palette.accentText);
  root.style.setProperty('--accent-soft', palette.accentSoft);
  root.style.setProperty('--profit', palette.profit);
  root.style.setProperty('--loss', palette.loss);
  root.style.setProperty('--warning', palette.warning);
  root.style.setProperty('--text', palette.text);
  root.style.setProperty('--muted', palette.muted);
  root.style.setProperty('--shadow-card', tokens.shadows[mode]);
  root.style.setProperty('--radius-card', tokens.radii.card);
  root.style.setProperty('--radius-control', tokens.radii.control);
  root.style.setProperty('--font-sans', tokens.fonts.sans);
}
