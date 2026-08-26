"use server";

import { dbStore } from "@/lib/dbStore";
import { Product, ProductBatch, ProductWithBatches, OrderWithRelations, CartItem } from "@/lib/types";

// Helper to serialize Date objects from Postgres to strings
function serialize<T>(data: T): T {
  if (data === null || data === undefined) return data;
  return JSON.parse(JSON.stringify(data));
}

export async function verifyPasscode(enteredPasscode: string): Promise<{ success: boolean; role?: 'staff' | 'admin' }> {
  const adminPasscode = process.env.ADMIN_PASSCODE || "sulficker11";
  const staffPasscode = process.env.STAFF_PASSCODE || process.env.NEXT_PUBLIC_STAFF_PASSCODE || "staff123";

  const normalizedEntered = enteredPasscode.replace(/\s/g, "");
  
  if (normalizedEntered === adminPasscode) {
    return { success: true, role: 'admin' };
  }
  if (normalizedEntered === staffPasscode) {
    return { success: true, role: 'staff' };
  }

  return { success: false };
}

// Products
export async function fetchProducts(): Promise<ProductWithBatches[]> {
  return serialize(await dbStore.listProductsWithBatches());
}

export async function createProduct(data: { name: string; description: string | null; category: string; schedule_category: 'NONE' | 'H' | 'H1'; low_stock_threshold: number }): Promise<Product> {
  return serialize(await dbStore.addProduct(data));
}

export async function editProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  return serialize(await dbStore.updateProduct(id, data));
}

export async function removeProduct(id: string): Promise<void> {
  return await dbStore.deleteProduct(id);
}

// Batches
export async function createBatch(productId: string, data: Omit<ProductBatch, 'id' | 'product_id' | 'arrived_at'>): Promise<ProductBatch> {
  return serialize(await dbStore.addBatch({
    product_id: productId,
    ...data,
  }));
}

export async function editBatch(id: string, data: Partial<ProductBatch>): Promise<ProductBatch | null> {
  return serialize(await dbStore.updateBatch(id, data));
}

export async function removeBatch(id: string): Promise<void> {
  return await dbStore.deleteBatch(id);
}

// Orders
export async function fetchOrders(): Promise<OrderWithRelations[]> {
  return serialize(await dbStore.listOrdersWithRelations());
}

export async function fetchOrderById(id: string): Promise<OrderWithRelations | null> {
  return serialize(await dbStore.getOrderWithRelations(id));
}

export async function orderIdExists(id: string): Promise<boolean> {
  return await dbStore.orderIdExists(id);
}

export async function submitOrder(payload: {
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
  return await dbStore.submitOrder(payload);
}

export async function removeOrder(id: string): Promise<void> {
  return await dbStore.deleteOrder(id);
}
