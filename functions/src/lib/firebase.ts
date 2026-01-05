import admin from 'firebase-admin';

let initialized = false;

export function getAdminApp() {
  if (!initialized) {
    admin.initializeApp();
    initialized = true;
  }
  return admin.app();
}

export function getFirestore() {
  getAdminApp();
  return admin.firestore();
}

