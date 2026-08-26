export type Product = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  schedule_category: 'NONE' | 'H' | 'H1';
  low_stock_threshold: number;
  created_at: string;
};

export type ProductBatch = {
  id: string;
  product_id: string;
  batch_no: string | null;
  manufacturer: string | null;
  hsn_code: string | null;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  mfg_date: string | null;
  expiry_date: string;
  arrived_at: string;
};

export type ProductWithBatches = Product & {
  batches: ProductBatch[];
  total_stock: number;
  earliest_expiry: string | null;
  active_selling_price: number;
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
  source: 'ONLINE' | 'OFFLINE';
  status: 'COMPLETED' | 'PENDING';
  subtotal: number;
  discount_type: 'PERCENT' | 'FIXED';
  discount_value: number;
  discount_amount: number;
  gst_percentage: number;
  gst_amount: number;
  delivery_fee: number;
  grand_total: number;
  cash_received: number;
  bill_date: string;
  created_at: string;
};

export type OrderItemRow = {
  id: string;
  order_id: string;
  product_id: string | null;
  batch_id: string | null;
  snapshot_name: string;
  snapshot_price: number;
  quantity: number;
};

export type OrderWithRelations = OrderRow & {
  customer_name: string;
  customer_phone: string;
  items: OrderItemRow[];
};

export type CartItem = {
  id: string;
  product_id: string | null;
  batch_id: string | null;
  name: string;
  desc: string;
  price: number;
  qty: number;
};
