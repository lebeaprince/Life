import express from 'express';
import admin from 'firebase-admin';
import { z } from 'zod';
import { getAdminApp } from '../lib/firebase';
import { badRequest, notFound, ok } from '../lib/http';

const BearerSchema = z
  .string()
  .min(1)
  .transform((s) => s.trim())
  .refine((s) => s.toLowerCase().startsWith('bearer '), 'Expected Bearer token');

export function createAuthApp() {
  const app = express();

  const base = '/api/auth';

  app.get(`${base}/health`, (_req, res) => ok(res, { ok: true, service: 'auth' }));

  app.get(`${base}/me`, async (req, res) => {
    const raw = req.header('authorization');
    if (!raw) return res.status(401).json({ error: 'Missing Authorization header' });

    const parsed = BearerSchema.safeParse(raw);
    if (!parsed.success) return badRequest(res, parsed.error.message);

    getAdminApp();
    const token = parsed.data.slice('bearer '.length);
    try {
      const decoded = await admin.auth().verifyIdToken(token);
      ok(res, { uid: decoded.uid, email: decoded.email ?? null });
    } catch {
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  app.use(notFound);
  return app;
}

