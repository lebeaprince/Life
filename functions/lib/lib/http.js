"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.corsMiddleware = void 0;
exports.ok = ok;
exports.badRequest = badRequest;
exports.notFound = notFound;
const cors_1 = __importDefault(require("cors"));
exports.corsMiddleware = (0, cors_1.default)({ origin: true });
function ok(res, body) {
    res.status(200).json(body);
}
function badRequest(res, message) {
    res.status(400).json({ error: message });
}
function notFound(_req, res) {
    res.status(404).json({ error: 'Not Found' });
}
