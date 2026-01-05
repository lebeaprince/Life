"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCatalogApp = createCatalogApp;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const firebase_1 = require("../lib/firebase");
const http_1 = require("../lib/http");
const CreateProductSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(120),
    price: zod_1.z.number().finite().nonnegative(),
    currency: zod_1.z.string().min(3).max(5).optional()
});
function createCatalogApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const base = '/api/catalog';
    app.get(`${base}/health`, (_req, res) => (0, http_1.ok)(res, { ok: true, service: 'catalog' }));
    app.get(`${base}/products`, async (_req, res) => {
        const db = (0, firebase_1.getFirestore)();
        const snap = await db.collection('products').orderBy('createdAt', 'desc').limit(200).get();
        const products = snap.docs.map((d) => {
            const data = d.data();
            return {
                id: d.id,
                name: data.name,
                price: data.price,
                currency: data.currency ?? 'USD'
            };
        });
        (0, http_1.ok)(res, products);
    });
    app.post(`${base}/products`, async (req, res) => {
        const parsed = CreateProductSchema.safeParse(req.body);
        if (!parsed.success)
            return (0, http_1.badRequest)(res, parsed.error.message);
        const db = (0, firebase_1.getFirestore)();
        const doc = await db.collection('products').add({
            name: parsed.data.name,
            price: parsed.data.price,
            currency: parsed.data.currency ?? 'USD',
            createdAt: new Date().toISOString()
        });
        (0, http_1.ok)(res, { id: doc.id });
    });
    app.delete(`${base}/products/:id`, async (req, res) => {
        const id = req.params['id'];
        if (!id)
            return (0, http_1.badRequest)(res, 'Missing product id');
        const db = (0, firebase_1.getFirestore)();
        const ref = db.collection('products').doc(id);
        const exists = (await ref.get()).exists;
        if (!exists)
            return (0, http_1.notFound)(req, res);
        await ref.delete();
        (0, http_1.ok)(res, { ok: true });
    });
    app.use(http_1.notFound);
    return app;
}
