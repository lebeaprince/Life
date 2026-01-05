import express from 'express';
import { z } from 'zod';
import { getFirestore } from '../lib/firebase';
import { badRequest, notFound, ok } from '../lib/http';

const CreateProductSchema = z.object({
  name: z.string().min(1).max(120),
  price: z.number().finite().nonnegative(),
  currency: z.string().min(3).max(5).optional()
});

export function createCatalogApp() {
  const app = express();
  app.use(express.json());

  const base = '/api/catalog';

  app.get(`${base}/health`, (_req, res) => ok(res, { ok: true, service: 'catalog' }));

  app.get(`${base}/products`, async (_req, res) => {
    const db = getFirestore();
    const snap = await db.collection('products').orderBy('createdAt', 'desc').limit(200).get();
    const products = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        name: data.name,
        price: data.price,
        currency: data.currency ?? 'USD'
      };
    });
    ok(res, products);
  });

  app.post(`${base}/products`, async (req, res) => {
    const parsed = CreateProductSchema.safeParse(req.body);
    if (!parsed.success) return badRequest(res, parsed.error.message);

    const db = getFirestore();
    const doc = await db.collection('products').add({
      name: parsed.data.name,
      price: parsed.data.price,
      currency: parsed.data.currency ?? 'USD',
      createdAt: new Date().toISOString()
    });

    ok(res, { id: doc.id });
  });

  app.delete(`${base}/products/:id`, async (req, res) => {
    const id = req.params['id'];
    if (!id) return badRequest(res, 'Missing product id');

    const db = getFirestore();
    const ref = db.collection('products').doc(id);
    const exists = (await ref.get()).exists;
    if (!exists) return notFound(req, res);

    await ref.delete();
    ok(res, { ok: true });
  });

  app.use(notFound);
  return app;
}

