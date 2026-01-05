import express from 'express';
import { z } from 'zod';
import { getFirestore } from '../lib/firebase';
import { badRequest, notFound, ok } from '../lib/http';

const CartItemSchema = z.object({
  productId: z.string().min(1),
  name: z.string().min(1),
  unitPrice: z.number().finite().nonnegative(),
  qty: z.number().int().positive()
});

const CheckoutSchema = z.object({
  items: z.array(CartItemSchema).min(1)
});

export function createSalesApp() {
  const app = express();
  app.use(express.json());

  const base = '/api/sales';

  app.get(`${base}/health`, (_req, res) => ok(res, { ok: true, service: 'sales' }));

  app.post(`${base}/checkout`, async (req, res) => {
    const parsed = CheckoutSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error.message);

    const items = parsed.data.items;
    const currency = 'USD';
    const subtotal = items.reduce((sum, x) => sum + x.qty * x.unitPrice, 0);

    const db = getFirestore();
    const saleRef = await db.collection('sales').add({
      items,
      subtotal,
      currency,
      createdAt: new Date().toISOString()
    });

    ok(res, { receiptId: saleRef.id, subtotal, currency, createdAt: new Date().toISOString() });
  });

  app.use(notFound);
  return app;
}

