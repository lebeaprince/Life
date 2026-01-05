"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdminApp = getAdminApp;
exports.getFirestore = getFirestore;
const firebase_admin_1 = __importDefault(require("firebase-admin"));
let initialized = false;
function getAdminApp() {
    if (!initialized) {
        firebase_admin_1.default.initializeApp();
        initialized = true;
    }
    return firebase_admin_1.default.app();
}
function getFirestore() {
    getAdminApp();
    return firebase_admin_1.default.firestore();
}
