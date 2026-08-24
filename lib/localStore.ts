// Simple localStorage-backed store to replace Supabase.
// All data lives in the browser under a single key.

export type Product = {
  id: string;
  name: string;
  description: string | null;
  default_price: number;
  category: string;
  expiry_date: string | null;
  stock_quantity: number;
  low_stock_threshold: number;
  batch_no: string | null;
  manufacturer: string | null;
  hsn_code: string | null;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

export type OrderRow = {
  id: string;
  customer_id: string;
  source: "ONLINE" | "OFFLINE";
  status: "COMPLETED" | "PENDING";
  subtotal: number;
  discount_type: "PERCENT" | "FIXED";
  discount_value: number;
  discount_amount: number;
  delivery_fee: number;
  grand_total: number;
  cash_received: number;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  snapshot_name: string;
  snapshot_price: number;
  quantity: number;
};

export type OrderWithRelations = OrderRow & {
  customers: { name: string; phone: string } | null;
  order_items: OrderItemRow[];
};

type StoreShape = {
  products: Product[];
  customers: Customer[];
  orders: OrderRow[];
  order_items: OrderItemRow[];
};

const STORAGE_KEY = "vinayaka_medicals_store_v1";

const emptyStore = (): StoreShape => ({
  products: [],
  customers: [],
  orders: [],
  order_items: [],
});

const uid = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

const readStore = (): StoreShape => {
  if (typeof window === "undefined") return emptyStore();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Partial<StoreShape>;
    return {
      products: parsed.products || [],
      customers: parsed.customers || [],
      orders: parsed.orders || [],
      order_items: parsed.order_items || [],
    };
  } catch (err) {
    console.warn("Local store read failed:", err);
    return emptyStore();
  }
};

const writeStore = (store: StoreShape): void => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn("Local store write failed:", err);
  }
};

export const localStore = {
  // Products
  listProducts(): Product[] {
    return readStore().products;
  },

  addProduct(input: Omit<Product, "id">): Product {
    const store = readStore();
    const record: Product = { id: uid(), ...input };
    store.products.push(record);
    writeStore(store);
    return record;
  },

  updateProduct(id: string, patch: Partial<Product>): Product | null {
    const store = readStore();
    const idx = store.products.findIndex((p) => p.id === id);
    if (idx < 0) return null;
    store.products[idx] = { ...store.products[idx], ...patch, id };
    writeStore(store);
    return store.products[idx];
  },

  deleteProduct(id: string): void {
    const store = readStore();
    store.products = store.products.filter((p) => p.id !== id);
    writeStore(store);
  },

  // Customers
  upsertCustomerByPhone(name: string, phone: string): Customer {
    const store = readStore();
    const existing = store.customers.find((c) => c.phone === phone);
    if (existing) {
      existing.name = name;
      writeStore(store);
      return existing;
    }
    const record: Customer = {
      id: uid(),
      name,
      phone,
      created_at: new Date().toISOString(),
    };
    store.customers.push(record);
    writeStore(store);
    return record;
  },

  // Orders
  listOrdersWithRelations(): OrderWithRelations[] {
    const store = readStore();
    return store.orders
      .map((o) => {
        const customer = store.customers.find((c) => c.id === o.customer_id);
        const items = store.order_items.filter((i) => i.order_id === o.id);
        return {
          ...o,
          customers: customer
            ? { name: customer.name, phone: customer.phone }
            : null,
          order_items: items,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
  },

  getOrderWithRelations(id: string): OrderWithRelations | null {
    const store = readStore();
    const order = store.orders.find((o) => o.id === id);
    if (!order) return null;
    const customer = store.customers.find((c) => c.id === order.customer_id);
    const items = store.order_items.filter((i) => i.order_id === id);
    return {
      ...order,
      customers: customer
        ? { name: customer.name, phone: customer.phone }
        : null,
      order_items: items,
    };
  },

  orderIdExists(id: string): boolean {
    return readStore().orders.some((o) => o.id === id);
  },

  addOrder(order: OrderRow, items: Omit<OrderItemRow, "id">[]): OrderRow {
    const store = readStore();
    store.orders.push(order);
    for (const item of items) {
      store.order_items.push({ id: uid(), ...item });
    }
    writeStore(store);
    return order;
  },

  deleteOrder(id: string): void {
    const store = readStore();
    store.orders = store.orders.filter((o) => o.id !== id);
    store.order_items = store.order_items.filter((i) => i.order_id !== id);
    writeStore(store);
  },

  // Utility for stock deduction on sale (optional, called when an order is added)
  decrementStock(items: { snapshot_name: string; quantity: number }[]): void {
    const store = readStore();
    for (const it of items) {
      const p = store.products.find((prod) => prod.name === it.snapshot_name);
      if (p && typeof p.stock_quantity === "number") {
        p.stock_quantity = Math.max(0, p.stock_quantity - it.quantity);
      }
    }
    writeStore(store);
  },
};
