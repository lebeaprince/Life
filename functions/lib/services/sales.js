"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSalesApp = createSalesApp;
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const firebase_1 = require("../lib/firebase");
const http_1 = require("../lib/http");
const CartItemSchema = zod_1.z.object({
    productId: zod_1.z.string().min(1),
    name: zod_1.z.string().min(1),
    unitPrice: zod_1.z.number().finite().nonnegative(),
    qty: zod_1.z.number().int().positive()
});
const CheckoutSchema = zod_1.z.object({
    items: zod_1.z.array(CartItemSchema).min(1)
});
function createSalesApp() {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    const base = '/api/sales';
    app.get(`${base}/health`, (_req, res) => (0, http_1.ok)(res, { ok: true, service: 'sales' }));
    app.post(`${base}/checkout`, async (req, res) => {
        const parsed = CheckoutSchema.safeParse(req.body);
        if (!parsed.success)
            return (0, http_1.badRequest)(res, parsed.error.message);
        const items = parsed.data.items;
        const currency = 'USD';
        const subtotal = items.reduce((sum, x) => sum + x.qty * x.unitPrice, 0);
        const db = (0, firebase_1.getFirestore)();
        const saleRef = await db.collection('sales').add({
            items,
            subtotal,
            currency,
            createdAt: new Date().toISOString()
        });
        (0, http_1.ok)(res, { receiptId: saleRef.id, subtotal, currency, createdAt: new Date().toISOString() });
    });
    app.use(http_1.notFound);
    return app;
}
