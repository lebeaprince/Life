import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2/options';
import { corsMiddleware } from './lib/http';
import { createAuthApp } from './services/auth';
import { createCatalogApp } from './services/catalog';
import { createSalesApp } from './services/sales';

setGlobalOptions({
  region: 'us-central1'
});

function withCors(app: import('express').Express) {
  return (req: any, res: any) => corsMiddleware(req, res, () => app(req, res));
}

export const auth = onRequest(withCors(createAuthApp()));
export const catalog = onRequest(withCors(createCatalogApp()));
export const sales = onRequest(withCors(createSalesApp()));

