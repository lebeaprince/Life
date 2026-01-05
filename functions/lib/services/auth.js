"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAuthApp = createAuthApp;
const express_1 = __importDefault(require("express"));
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const zod_1 = require("zod");
const firebase_1 = require("../lib/firebase");
const http_1 = require("../lib/http");
const BearerSchema = zod_1.z
    .string()
    .min(1)
    .transform((s) => s.trim())
    .refine((s) => s.toLowerCase().startsWith('bearer '), 'Expected Bearer token');
function createAuthApp() {
    const app = (0, express_1.default)();
    const base = '/api/auth';
    app.get(`${base}/health`, (_req, res) => (0, http_1.ok)(res, { ok: true, service: 'auth' }));
    app.get(`${base}/me`, async (req, res) => {
        const raw = req.header('authorization');
        if (!raw)
            return res.status(401).json({ error: 'Missing Authorization header' });
        const parsed = BearerSchema.safeParse(raw);
        if (!parsed.success)
            return (0, http_1.badRequest)(res, parsed.error.message);
        (0, firebase_1.getAdminApp)();
        const token = parsed.data.slice('bearer '.length);
        try {
            const decoded = await firebase_admin_1.default.auth().verifyIdToken(token);
            (0, http_1.ok)(res, { uid: decoded.uid, email: decoded.email ?? null });
        }
        catch {
            res.status(401).json({ error: 'Invalid token' });
        }
    });
    app.use(http_1.notFound);
    return app;
}
