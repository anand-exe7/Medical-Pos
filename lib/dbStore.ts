import { sql } from './db';
import {
  Product,
  ProductBatch,
  ProductWithBatches,
  Customer,
  OrderRow,
  OrderItemRow,
  OrderWithRelations,
  CartItem,
} from './types';

// Utility to generate a unique ID
const uid = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const dbStore = {
  // PRODUCTS
  async listProducts(): Promise<Product[]> {
    const rows = await sql`SELECT * FROM products ORDER BY name ASC`;
    return rows as Product[];
  },

  async getProductWithBatches(id: string): Promise<ProductWithBatches | null> {
    const products = await sql`SELECT * FROM products WHERE id = ${id}`;
    if (products.length === 0) return null;

    const batches = await sql`
      SELECT * FROM product_batches 
      WHERE product_id = ${id} 
      ORDER BY arrived_at ASC
    `;

    const product = products[0] as Product;
    const batchList = batches as ProductBatch[];

    let total_stock = 0;
    let earliest_expiry: string | null = null;
    let active_selling_price = 0;
    let foundActiveBatch = false;

    for (const batch of batchList) {
      total_stock += batch.stock_quantity;
      if (batch.stock_quantity > 0) {
        if (!foundActiveBatch) {
          active_selling_price = Number(batch.selling_price);
          foundActiveBatch = true;
        }
        if (!earliest_expiry || new Date(batch.expiry_date) < new Date(earliest_expiry)) {
          earliest_expiry = batch.expiry_date;
        }
      }
    }

    return {
      ...product,
      batches: batchList,
      total_stock,
      earliest_expiry,
      active_selling_price,
    };
  },

  async listProductsWithBatches(): Promise<ProductWithBatches[]> {
    const products = await sql`SELECT * FROM products ORDER BY name ASC`;
    const allBatches = await sql`SELECT * FROM product_batches ORDER BY arrived_at ASC`;

    return products.map((p: any) => {
      const batches = allBatches.filter((b: any) => b.product_id === p.id) as ProductBatch[];
      let total_stock = 0;
      let earliest_expiry: string | null = null;
      let active_selling_price = 0;
      let foundActiveBatch = false;

      for (const batch of batches) {
        total_stock += batch.stock_quantity;
        if (batch.stock_quantity > 0) {
          if (!foundActiveBatch) {
            active_selling_price = Number(batch.selling_price);
            foundActiveBatch = true;
          }
          if (!earliest_expiry || new Date(batch.expiry_date) < new Date(earliest_expiry)) {
            earliest_expiry = batch.expiry_date;
          }
        }
      }

      return {
        ...(p as Product),
        batches,
        total_stock,
        earliest_expiry,
        active_selling_price,
      };
    });
  },

  async addProduct(input: { name: string; description: string | null; category: string; low_stock_threshold: number }): Promise<Product> {
    const id = uid();
    const rows = await sql`
      INSERT INTO products (id, name, description, category, low_stock_threshold)
      VALUES (${id}, ${input.name}, ${input.description}, ${input.category}, ${input.low_stock_threshold})
      RETURNING *
    `;
    return rows[0] as Product;
  },

  async updateProduct(id: string, patch: Partial<Product>): Promise<Product | null> {
    if (Object.keys(patch).length === 0) return this.getProductWithBatches(id);
    
    // We update fields individually since dynamic SET with Neon SQL template tag is tricky
    if (patch.name !== undefined) await sql`UPDATE products SET name = ${patch.name} WHERE id = ${id}`;
    if (patch.description !== undefined) await sql`UPDATE products SET description = ${patch.description} WHERE id = ${id}`;
    if (patch.category !== undefined) await sql`UPDATE products SET category = ${patch.category} WHERE id = ${id}`;
    if (patch.low_stock_threshold !== undefined) await sql`UPDATE products SET low_stock_threshold = ${patch.low_stock_threshold} WHERE id = ${id}`;

    const rows = await sql`SELECT * FROM products WHERE id = ${id}`;
    return rows.length > 0 ? (rows[0] as Product) : null;
  },

  async deleteProduct(id: string): Promise<void> {
    await sql`DELETE FROM products WHERE id = ${id}`;
  },

  // BATCHES
  async addBatch(input: {
    product_id: string;
    batch_no: string | null;
    manufacturer: string | null;
    hsn_code: string | null;
    cost_price: number;
    selling_price: number;
    stock_quantity: number;
    expiry_date: string;
  }): Promise<ProductBatch> {
    const id = uid();
    const rows = await sql`
      INSERT INTO product_batches (
        id, product_id, batch_no, manufacturer, hsn_code, cost_price, selling_price, stock_quantity, expiry_date
      ) VALUES (
        ${id}, ${input.product_id}, ${input.batch_no}, ${input.manufacturer}, ${input.hsn_code},
        ${input.cost_price}, ${input.selling_price}, ${input.stock_quantity}, ${input.expiry_date}
      )
      RETURNING *
    `;
    return rows[0] as ProductBatch;
  },

  async deleteBatch(id: string): Promise<void> {
    await sql`DELETE FROM product_batches WHERE id = ${id}`;
  },

  // CUSTOMERS
  async upsertCustomer(name: string, phone: string): Promise<Customer> {
    const id = uid();
    const rows = await sql`
      INSERT INTO customers (id, name, phone)
      VALUES (${id}, ${name}, ${phone})
      ON CONFLICT (phone) DO UPDATE SET name = EXCLUDED.name
      RETURNING *
    `;
    return rows[0] as Customer;
  },

  // ORDERS
  async orderIdExists(id: string): Promise<boolean> {
    const rows = await sql`SELECT 1 FROM orders WHERE id = ${id} LIMIT 1`;
    return rows.length > 0;
  },

  async listOrdersWithRelations(): Promise<OrderWithRelations[]> {
    const orders = await sql`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      ORDER BY o.created_at DESC
    `;
    
    if (orders.length === 0) return [];
    
    const orderIds = orders.map((o: any) => o.id);
    const items = await sql`
      SELECT * FROM order_items 
      WHERE order_id = ANY(${orderIds})
    `;

    return orders.map((o: any) => ({
      ...o,
      items: items.filter((i: any) => i.order_id === o.id) as OrderItemRow[],
    })) as OrderWithRelations[];
  },

  async getOrderWithRelations(id: string): Promise<OrderWithRelations | null> {
    const orders = await sql`
      SELECT o.*, c.name as customer_name, c.phone as customer_phone
      FROM orders o
      JOIN customers c ON c.id = o.customer_id
      WHERE o.id = ${id}
    `;
    if (orders.length === 0) return null;

    const items = await sql`SELECT * FROM order_items WHERE order_id = ${id}`;

    return {
      ...(orders[0] as any),
      items: items as OrderItemRow[],
    } as OrderWithRelations;
  },

  async deleteOrder(id: string): Promise<void> {
    await sql`DELETE FROM orders WHERE id = ${id}`;
  },

  // FIFO DEDUCTION & ORDER SUBMISSION
  async submitOrder(payload: {
    orderId: string;
    customerName: string;
    customerPhone: string;
    source: 'ONLINE' | 'OFFLINE';
    billDate: string;
    items: CartItem[];
    discountType: 'PERCENT' | 'FIXED';
    discountValue: number;
    discountAmount: number;
    gstPercentage: number;
    gstAmount: number;
    deliveryFee: number;
    grandTotal: number;
    cashReceived: number;
  }): Promise<{ orderId: string }> {
    // Neon HTTP doesn't natively support full interactive transactions in the simple API, 
    // but we can execute them sequentially or use multiple statements.
    // For simplicity, we'll do sequential awaits which is fine for this scale, 
    // or batch them if possible. Let's do sequential for clarity.

    // 1. Upsert Customer
    const customer = await this.upsertCustomer(payload.customerName, payload.customerPhone);

    // 2. FIFO Stock Deduction and split items
    const finalOrderItems: Omit<OrderItemRow, 'id'>[] = [];

    for (const item of payload.items) {
      if (!item.product_id) {
        // Custom item
        finalOrderItems.push({
          order_id: payload.orderId,
          product_id: null,
          batch_id: null,
          snapshot_name: item.name,
          snapshot_price: item.price,
          quantity: item.qty,
        });
        continue;
      }

      // Fetch batches in FIFO order
      const batches = await sql`
        SELECT * FROM product_batches
        WHERE product_id = ${item.product_id} AND stock_quantity > 0
        ORDER BY arrived_at ASC
      `;

      let remaining = item.qty;

      for (const batch of batches) {
        if (remaining <= 0) break;

        const available = batch.stock_quantity;
        const take = Math.min(remaining, available);

        // Deduct from DB
        await sql`
          UPDATE product_batches 
          SET stock_quantity = stock_quantity - ${take}
          WHERE id = ${batch.id}
        `;

        finalOrderItems.push({
          order_id: payload.orderId,
          product_id: item.product_id,
          batch_id: batch.id,
          snapshot_name: item.name, // Keep the original name from cart
          snapshot_price: Number(batch.selling_price), // Price from the specific batch consumed
          quantity: take,
        });

        remaining -= take;
      }

      // If we ran out of stock but still have remaining qty, just add it with the fallback price
      if (remaining > 0) {
        finalOrderItems.push({
          order_id: payload.orderId,
          product_id: item.product_id,
          batch_id: null,
          snapshot_name: item.name,
          snapshot_price: item.price,
          quantity: remaining,
        });
      }
    }

    // 3. Insert Order
    await sql`
      INSERT INTO orders (
        id, customer_id, source, status, subtotal, discount_type, discount_value, 
        discount_amount, gst_percentage, gst_amount, delivery_fee, grand_total, 
        cash_received, bill_date, created_at
      ) VALUES (
        ${payload.orderId}, ${customer.id}, ${payload.source}, 'COMPLETED', 
        ${payload.grandTotal + payload.discountAmount - payload.gstAmount - payload.deliveryFee}, 
        ${payload.discountType}, ${payload.discountValue}, ${payload.discountAmount}, 
        ${payload.gstPercentage}, ${payload.gstAmount}, ${payload.deliveryFee}, 
        ${payload.grandTotal}, ${payload.cashReceived}, ${payload.billDate}, now()
      )
    `;

    // 4. Insert Order Items
    for (const oi of finalOrderItems) {
      await sql`
        INSERT INTO order_items (
          id, order_id, product_id, batch_id, snapshot_name, snapshot_price, quantity
        ) VALUES (
          ${uid()}, ${oi.order_id}, ${oi.product_id}, ${oi.batch_id}, 
          ${oi.snapshot_name}, ${oi.snapshot_price}, ${oi.quantity}
        )
      `;
    }

    return { orderId: payload.orderId };
  }
};
