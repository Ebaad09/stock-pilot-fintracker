export type ScreenId =
  | 'dashboard'
  | 'inventory'
  | 'sell'
  | 'orders'
  | 'finance'
  | 'report';

export interface ToastMessage {
  id: number;
  type: 'success' | 'error';
  text: string;
}
