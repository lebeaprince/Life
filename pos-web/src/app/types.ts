export type Product = {
  id: string;
  name: string;
  price: number;
  currency?: string;
};

export type CartItem = {
  productId: string;
  name: string;
  unitPrice: number;
  qty: number;
};

export type CheckoutRequest = {
  items: CartItem[];
};

export type CheckoutResponse = {
  receiptId: string;
  subtotal: number;
  currency: string;
  createdAt: string;
};

export type Material = {
  id: string;
  name: string;
  price: number;
  currency?: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  total: number;
  customerNumber: string;
  currency?: string;
};

