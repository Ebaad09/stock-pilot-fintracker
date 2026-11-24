export interface ProductData {
  id: number;
  name: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
}

export type TransactionType = 'SALE' | 'EXPENSE';

export interface TransactionData {
  type: TransactionType;
  productID: number;
  description: string;
  amount: number;
}

export interface FinancialReportData {
  revenue: number;
  costOfGoods: number;
  expenses: number;
  grossProfit: number;
  netProfit: number;
}

export interface UndoRecordData {
  productID: number;
  oldQuantity: number;
}

export interface OrderData {
  productID: number;
  quantity: number;
}

export interface ServiceResult<T = undefined> {
  ok: boolean;
  message: string;
  data?: T;
}

const PRODUCTS_STORAGE_KEY = 'stockpilot_products_txt_v1';
const TRANSACTIONS_STORAGE_KEY = 'fintracker_transactions_txt_v1';

class ProductNode {
  id: number;
  name: string;
  costPrice: number;
  sellPrice: number;
  quantity: number;
  next: ProductNode | null;

  constructor(i: number, n: string, c: number, s: number, q: number) {
    this.id = i;
    this.name = n;
    this.costPrice = c;
    this.sellPrice = s;
    this.quantity = q;
    this.next = null;
  }

  toData(): ProductData {
    return {
      id: this.id,
      name: this.name,
      costPrice: this.costPrice,
      sellPrice: this.sellPrice,
      quantity: this.quantity,
    };
  }
}

class TreeNode {
  product: ProductNode;
  left: TreeNode | null;
  right: TreeNode | null;

  constructor(p: ProductNode) {
    this.product = p;
    this.left = null;
    this.right = null;
  }
}

export class StockPilot {
  private head: ProductNode | null;
  private root: TreeNode | null;

  constructor() {
    this.head = null;
    this.root = null;
  }

  private insertTree(node: TreeNode | null, p: ProductNode): TreeNode {
    if (node === null) {
      return new TreeNode(p);
    }
    if (p.id < node.product.id) {
      node.left = this.insertTree(node.left, p);
    } else if (p.id > node.product.id) {
      node.right = this.insertTree(node.right, p);
    }
    return node;
  }

  private searchTree(node: TreeNode | null, id: number): ProductNode | null {
    if (node === null) {
      return null;
    }
    if (id === node.product.id) {
      return node.product;
    }
    if (id < node.product.id) {
      return this.searchTree(node.left, id);
    }
    return this.searchTree(node.right, id);
  }

  findProduct(id: number): ProductNode | null {
    let curr = this.head;
    while (curr !== null) {
      if (curr.id === id) {
        return curr;
      }
      curr = curr.next;
    }
    return null;
  }

  addProduct(
    id: number,
    name: string,
    cost: number,
    sell: number,
    qty: number
  ): boolean {
    const cleanName = name.trim();
    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isFinite(cost) ||
      cost < 0 ||
      !Number.isFinite(sell) ||
      sell < 0 ||
      !Number.isInteger(qty) ||
      qty < 0 ||
      cleanName.length === 0 ||
      this.findProduct(id) !== null
    ) {
      return false;
    }

    const p = new ProductNode(id, cleanName, cost, sell, qty);
    p.next = this.head;
    this.head = p;
    this.root = this.insertTree(this.root, p);
    return true;
  }

  searchByID(id: number): ProductData | null {
    const found = this.searchTree(this.root, id);
    return found ? found.toData() : null;
  }

  displayProducts(): ProductData[] {
    const result: ProductData[] = [];
    let curr = this.head;
    while (curr !== null) {
      result.push(curr.toData());
      curr = curr.next;
    }
    return result;
  }

  sortByPrice(): void {
    if (this.head === null) {
      return;
    }

    for (let i: ProductNode | null = this.head; i !== null; i = i.next) {
      for (
        let j: ProductNode | null = this.head;
        j !== null && j.next !== null;
        j = j.next
      ) {
        if (j.sellPrice > j.next.sellPrice) {
          const tID = j.id;
          const tName = j.name;
          const tCost = j.costPrice;
          const tSell = j.sellPrice;
          const tQty = j.quantity;

          j.id = j.next.id;
          j.name = j.next.name;
          j.costPrice = j.next.costPrice;
          j.sellPrice = j.next.sellPrice;
          j.quantity = j.next.quantity;

          j.next.id = tID;
          j.next.name = tName;
          j.next.costPrice = tCost;
          j.next.sellPrice = tSell;
          j.next.quantity = tQty;
        }
      }
    }

    this.root = null;
    for (let curr: ProductNode | null = this.head; curr !== null; curr = curr.next) {
      this.root = this.insertTree(this.root, curr);
    }
  }

  saveProducts(): void {
    const lines: string[] = [];
    let curr = this.head;
    while (curr !== null) {
      lines.push(
        String(curr.id),
        curr.name,
        String(curr.costPrice),
        String(curr.sellPrice),
        String(curr.quantity)
      );
      curr = curr.next;
    }
    window.localStorage.setItem(PRODUCTS_STORAGE_KEY, lines.join('\n'));
  }

  loadProducts(): void {
    this.head = null;
    this.root = null;
    const raw = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const lines = raw.split(/\r?\n/);
    const parsed: ProductData[] = [];
    let idx = 0;
    while (idx + 4 < lines.length) {
      const id = Number.parseInt(lines[idx] ?? '', 10);
      const name = lines[idx + 1] ?? '';
      const cost = Number.parseFloat(lines[idx + 2] ?? '');
      const sell = Number.parseFloat(lines[idx + 3] ?? '');
      const qty = Number.parseInt(lines[idx + 4] ?? '', 10);
      idx += 5;

      if (
        Number.isInteger(id) &&
        Number.isFinite(cost) &&
        Number.isFinite(sell) &&
        Number.isInteger(qty)
      ) {
        parsed.push({ id, name, costPrice: cost, sellPrice: sell, quantity: qty });
      }
    }
    // Preserve saved head-to-tail order when rebuilding linked list via prepend
    for (let i = parsed.length - 1; i >= 0; i -= 1) {
      const p = parsed[i];
      this.addProduct(p.id, p.name, p.costPrice, p.sellPrice, p.quantity);
    }
  }
}

class TransactionNode {
  type: TransactionType;
  productID: number;
  description: string;
  amount: number;
  next: TransactionNode | null;

  constructor(t: TransactionType, id: number, d: string, a: number) {
    this.type = t;
    this.productID = id;
    this.description = d;
    this.amount = a;
    this.next = null;
  }

  toData(): TransactionData {
    return {
      type: this.type,
      productID: this.productID,
      description: this.description,
      amount: this.amount,
    };
  }
}

export class FinTracker {
  private head: TransactionNode | null;
  revenue: number;
  expenses: number;
  costOfGoods: number;

  constructor() {
    this.head = null;
    this.revenue = 0;
    this.expenses = 0;
    this.costOfGoods = 0;
  }

  addTransaction(
    type: TransactionType,
    id: number,
    desc: string,
    amount: number
  ): void {
    const t = new TransactionNode(type, id, desc, amount);
    t.next = this.head;
    this.head = t;
  }

  recordSale(
    id: number,
    name: string,
    saleAmount: number,
    costAmount: number
  ): void {
    this.revenue += saleAmount;
    this.costOfGoods += costAmount;
    this.addTransaction('SALE', id, name, saleAmount);
  }

  addExpense(description: string, amount: number): void {
    this.expenses += amount;
    this.addTransaction('EXPENSE', 0, description, amount);
  }

  displayTransactions(): TransactionData[] {
    const list: TransactionData[] = [];
    for (let curr = this.head; curr !== null; curr = curr.next) {
      list.push(curr.toData());
    }
    return list;
  }

  sortTransactionsByAmount(): void {
    for (let i: TransactionNode | null = this.head; i !== null; i = i.next) {
      for (
        let j: TransactionNode | null = this.head;
        j !== null && j.next !== null;
        j = j.next
      ) {
        if (j.amount > j.next.amount) {
          const tType = j.type;
          const tID = j.productID;
          const tDesc = j.description;
          const tAmount = j.amount;

          j.type = j.next.type;
          j.productID = j.next.productID;
          j.description = j.next.description;
          j.amount = j.next.amount;

          j.next.type = tType;
          j.next.productID = tID;
          j.next.description = tDesc;
          j.next.amount = tAmount;
        }
      }
    }
  }

  report(): FinancialReportData {
    const grossProfit = this.revenue - this.costOfGoods;
    const netProfit = grossProfit - this.expenses;
    return {
      revenue: this.revenue,
      costOfGoods: this.costOfGoods,
      expenses: this.expenses,
      grossProfit,
      netProfit,
    };
  }

  saveTransactions(): void {
    const lines: string[] = [
      String(this.revenue),
      String(this.expenses),
      String(this.costOfGoods),
    ];
    for (let curr = this.head; curr !== null; curr = curr.next) {
      lines.push(
        curr.type,
        String(curr.productID),
        curr.description,
        String(curr.amount)
      );
    }
    window.localStorage.setItem(TRANSACTIONS_STORAGE_KEY, lines.join('\n'));
  }

  loadTransactions(): void {
    this.head = null;
    this.revenue = 0;
    this.expenses = 0;
    this.costOfGoods = 0;

    const raw = window.localStorage.getItem(TRANSACTIONS_STORAGE_KEY);
    if (!raw) {
      return;
    }
    const lines = raw.split(/\r?\n/);
    if (lines.length < 3) {
      return;
    }

    this.revenue = Number.parseFloat(lines[0] ?? '0') || 0;
    this.expenses = Number.parseFloat(lines[1] ?? '0') || 0;
    this.costOfGoods = Number.parseFloat(lines[2] ?? '0') || 0;

    const parsed: TransactionData[] = [];
    let idx = 3;
    while (idx + 3 < lines.length) {
      const rawType = lines[idx]?.trim();
      const type: TransactionType = rawType === 'EXPENSE' ? 'EXPENSE' : 'SALE';
      const id = Number.parseInt(lines[idx + 1] ?? '0', 10);
      const desc = lines[idx + 2] ?? '';
      const amount = Number.parseFloat(lines[idx + 3] ?? '0');
      idx += 4;

      if (Number.isFinite(id) && Number.isFinite(amount)) {
        parsed.push({ type, productID: id, description: desc, amount });
      }
    }

    for (let i = parsed.length - 1; i >= 0; i -= 1) {
      const tx = parsed[i];
      this.addTransaction(tx.type, tx.productID, tx.description, tx.amount);
    }
  }
}

class UndoRecordNode {
  productID: number;
  oldQuantity: number;
  next: UndoRecordNode | null;

  constructor(id: number, qty: number) {
    this.productID = id;
    this.oldQuantity = qty;
    this.next = null;
  }
}

export class UndoStack {
  private top: UndoRecordNode | null;

  constructor() {
    this.top = null;
  }

  push(id: number, oldQty: number): void {
    const record = new UndoRecordNode(id, oldQty);
    record.next = this.top;
    this.top = record;
  }

  pop(): UndoRecordData | null {
    if (this.top === null) {
      return null;
    }
    const tmp = this.top;
    this.top = tmp.next;
    return { productID: tmp.productID, oldQuantity: tmp.oldQuantity };
  }

  isEmpty(): boolean {
    return this.top === null;
  }

  toArray(): UndoRecordData[] {
    const items: UndoRecordData[] = [];
    let curr = this.top;
    while (curr !== null) {
      items.push({ productID: curr.productID, oldQuantity: curr.oldQuantity });
      curr = curr.next;
    }
    return items;
  }
}

class OrderNode {
  productID: number;
  quantity: number;
  next: OrderNode | null;

  constructor(id: number, qty: number) {
    this.productID = id;
    this.quantity = qty;
    this.next = null;
  }
}

export class OrderQueue {
  private front: OrderNode | null;
  private rear: OrderNode | null;

  constructor() {
    this.front = null;
    this.rear = null;
  }

  enqueue(id: number, qty: number): void {
    const order = new OrderNode(id, qty);
    if (this.rear === null) {
      this.front = order;
      this.rear = order;
    } else {
      this.rear.next = order;
      this.rear = order;
    }
  }

  dequeue(): OrderData | null {
    if (this.front === null) {
      return null;
    }
    const tmp = this.front;
    this.front = tmp.next;
    if (this.front === null) {
      this.rear = null;
    }
    return { productID: tmp.productID, quantity: tmp.quantity };
  }

  toArray(): OrderData[] {
    const items: OrderData[] = [];
    let curr = this.front;
    while (curr !== null) {
      items.push({ productID: curr.productID, quantity: curr.quantity });
      curr = curr.next;
    }
    return items;
  }
}

export interface StockPilotSnapshot {
  products: ProductData[];
  transactions: TransactionData[];
  report: FinancialReportData;
  orders: OrderData[];
  undoCount: number;
  canUndo: boolean;
}

export class StockPilotFinTrackerService {
  private stock: StockPilot;
  private finance: FinTracker;
  private undo: UndoStack;
  private orders: OrderQueue;

  constructor() {
    this.stock = new StockPilot();
    this.finance = new FinTracker();
    this.undo = new UndoStack();
    this.orders = new OrderQueue();
  }

  load(): StockPilotSnapshot {
    this.stock.loadProducts();
    this.finance.loadTransactions();
    return this.getSnapshot();
  }

  getSnapshot(): StockPilotSnapshot {
    return {
      products: this.stock.displayProducts(),
      transactions: this.finance.displayTransactions(),
      report: this.finance.report(),
      orders: this.orders.toArray(),
      undoCount: this.undo.toArray().length,
      canUndo: !this.undo.isEmpty(),
    };
  }

  // Menu 1: Add product
  addProduct(
    id: number,
    name: string,
    costPrice: number,
    sellPrice: number,
    quantity: number
  ): ServiceResult {
    const ok = this.stock.addProduct(id, name, costPrice, sellPrice, quantity);
    if (!ok) {
      return {
        ok: false,
        message: 'Invalid details or ID already exists.',
      };
    }
    this.stock.saveProducts();
    return {
      ok: true,
      message: `Product #${id} (${name.trim()}) added.`,
    };
  }

  // Menu 3: Search product by ID (BST)
  searchProductByID(id: number): ServiceResult<ProductData | null> {
    if (!Number.isInteger(id) || id <= 0) {
      return {
        ok: false,
        message: 'Please enter a positive product ID.',
        data: null,
      };
    }
    const found = this.stock.searchByID(id);
    if (!found) {
      return {
        ok: false,
        message: `Product #${id} not found.`,
        data: null,
      };
    }
    return {
      ok: true,
      message: `Found: ${found.name}, Qty: ${found.quantity}, Selling price: PKR ${found.sellPrice.toLocaleString('en-PK')}`,
      data: found,
    };
  }

  // Menu 4: Sort products by selling price
  sortProductsByPrice(): ServiceResult {
    this.stock.sortByPrice();
    this.stock.saveProducts();
    return {
      ok: true,
      message: 'Products sorted by selling price (low to high).',
    };
  }

  // Menu 5: Sell product
  sellProduct(id: number, qty: number): ServiceResult<{ saleAmount: number }> {
    const p = this.stock.findProduct(id);
    if (p === null || !Number.isInteger(qty) || qty <= 0 || p.quantity < qty) {
      return {
        ok: false,
        message: 'Product not found or insufficient stock.',
      };
    }

    this.undo.push(id, p.quantity);
    p.quantity -= qty;

    const saleAmount = p.sellPrice * qty;
    const costAmount = p.costPrice * qty;
    this.finance.recordSale(id, p.name, saleAmount, costAmount);

    this.stock.saveProducts();
    this.finance.saveTransactions();

    return {
      ok: true,
      message: `Sale recorded. Revenue: PKR ${saleAmount.toLocaleString('en-PK')}`,
      data: { saleAmount },
    };
  }

  // Menu 6: Add other expense
  addExpense(description: string, amount: number): ServiceResult {
    const cleanDesc = description.trim();
    if (!cleanDesc || !Number.isFinite(amount) || amount <= 0) {
      return {
        ok: false,
        message: 'Amount must be positive.',
      };
    }
    this.finance.addExpense(cleanDesc, amount);
    this.finance.saveTransactions();
    return {
      ok: true,
      message: `Expense recorded: PKR ${amount.toLocaleString('en-PK')}`,
    };
  }

  // Menu 8: Sort transactions by amount
  sortTransactionsByAmount(): ServiceResult {
    this.finance.sortTransactionsByAmount();
    this.finance.saveTransactions();
    return {
      ok: true,
      message: 'Transactions sorted by amount (low to high).',
    };
  }

  // Menu 10: Undo last stock change
  undoLastStockChange(): ServiceResult {
    const popped = this.undo.pop();
    if (popped === null) {
      return {
        ok: false,
        message: 'Nothing to undo.',
      };
    }
    const p = this.stock.findProduct(popped.productID);
    if (p !== null) {
      p.quantity = popped.oldQuantity;
      this.stock.saveProducts();
      return {
        ok: true,
        message: `Stock quantity restored for ${p.name} (#${p.id}) to ${popped.oldQuantity}.`,
      };
    }
    return {
      ok: false,
      message: 'Product not found.',
    };
  }

  // Menu 11: Add pending order
  addPendingOrder(id: number, qty: number): ServiceResult {
    if (
      !Number.isInteger(id) ||
      id <= 0 ||
      !Number.isInteger(qty) ||
      qty <= 0 ||
      this.stock.findProduct(id) === null
    ) {
      return {
        ok: false,
        message: 'Invalid product ID or quantity.',
      };
    }
    this.orders.enqueue(id, qty);
    return {
      ok: true,
      message: 'Order added to queue.',
    };
  }

  // Menu 12: Process next order
  processNextOrder(): ServiceResult {
    const next = this.orders.dequeue();
    if (next === null) {
      return {
        ok: false,
        message: 'No pending orders.',
      };
    }
    const p = this.stock.findProduct(next.productID);
    if (p !== null && p.quantity >= next.quantity) {
      this.undo.push(next.productID, p.quantity);
      p.quantity -= next.quantity;
      this.stock.saveProducts();
      return {
        ok: true,
        message: `Order processed for ${p.name}. Remaining stock: ${p.quantity}`,
      };
    }
    return {
      ok: false,
      message: 'Order cannot be fulfilled; insufficient stock.',
    };
  }
}

export const stockPilotService = new StockPilotFinTrackerService();
