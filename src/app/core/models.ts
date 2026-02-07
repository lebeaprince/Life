export type ApiTimestamp = string | null;

export type UserRole = 'owner' | 'manager' | 'cashier';

export type PaymentType = 'cash' | 'voucher' | 'speedpoint';

export interface PaymentOption {
  value: PaymentType;
  label: string;
  description: string;
}

export const PAYMENT_OPTIONS: PaymentOption[] = [
  {
    value: 'cash',
    label: 'Cash',
    description: 'Notes and coins collected at the counter.'
  },
  {
    value: 'voucher',
    label: 'Voucher',
    description: 'Gift vouchers and store credit.'
  },
  {
    value: 'speedpoint',
    label: 'Speedpoint',
    description: 'Debit cards and Apple Pay.'
  }
];

export const PAYMENT_TYPE_LABELS: Record<PaymentType, string> = {
  cash: 'Cash',
  voucher: 'Voucher',
  speedpoint: 'Speedpoint'
};

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  tenantId: string;
  roles: UserRole[];
  createdAt: ApiTimestamp;
}

export interface Tenant {
  id: string;
  name: string;
  plan: 'starter' | 'growth' | 'enterprise';
  ownerUid: string;
  createdAt: ApiTimestamp;
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
  createdAt: ApiTimestamp;
  updatedAt?: ApiTimestamp;
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
  createdAt: ApiTimestamp;
  createdBy: string;
  status: 'paid' | 'void' | 'open' | 'ready';
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  paymentType?: PaymentType;
  notification?: OrderNotification | null;
}

export interface OrderNotification {
  customerName: string;
  phoneMasked: string;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  delta: number;
  reason: string;
  createdAt: ApiTimestamp;
  createdBy: string;
}
