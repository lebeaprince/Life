import { Timestamp } from 'firebase/firestore';

export type UserRole = 'owner' | 'manager' | 'cashier';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  tenantId: string;
  roles: UserRole[];
  createdAt: Timestamp | null;
}

export interface Tenant {
  id: string;
  name: string;
  plan: 'starter' | 'growth' | 'enterprise';
  ownerUid: string;
  createdAt: Timestamp | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  taxRate: number;
  active: boolean;
  createdAt: Timestamp | null;
  updatedAt?: Timestamp | null;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  taxRate: number;
  quantity: number;
}

export interface Order {
  id: string;
  createdAt: Timestamp | null;
  createdBy: string;
  status: 'paid' | 'void' | 'open';
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  createdAt: Timestamp | null;
  createdBy: string;
}
