import type { Request, Response } from 'express';
import cors from 'cors';

export const corsMiddleware = cors({ origin: true });

export function ok(res: Response, body: unknown) {
  res.status(200).json(body);
}

export function badRequest(res: Response, message: string) {
  res.status(400).json({ error: message });
}

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

