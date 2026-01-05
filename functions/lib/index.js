"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sales = exports.catalog = exports.auth = void 0;
const https_1 = require("firebase-functions/v2/https");
const options_1 = require("firebase-functions/v2/options");
const http_1 = require("./lib/http");
const auth_1 = require("./services/auth");
const catalog_1 = require("./services/catalog");
const sales_1 = require("./services/sales");
(0, options_1.setGlobalOptions)({
    region: 'us-central1'
});
function withCors(app) {
    return (req, res) => (0, http_1.corsMiddleware)(req, res, () => app(req, res));
}
exports.auth = (0, https_1.onRequest)(withCors((0, auth_1.createAuthApp)()));
exports.catalog = (0, https_1.onRequest)(withCors((0, catalog_1.createCatalogApp)()));
exports.sales = (0, https_1.onRequest)(withCors((0, sales_1.createSalesApp)()));
