# Nimbus POS (Angular + Firebase)

Nimbus POS is a multi-tenant SaaS point of sale built with Angular 21 and Firebase.
It ships with authentication, tenant-aware data storage, and a modular UI for
catalog, inventory, checkout, and reporting workflows.

## Features

- Email and password authentication (Firebase Auth)
- Multi-tenant Firestore data model
- Inventory adjustments and order tracking
- POS cart and checkout flow
- Users and role management
- Firebase Hosting and Storage configuration

## Tech stack

- Angular 21 (standalone components)
- Firebase Auth, Firestore, Storage, Hosting
- RxJS for realtime streams

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a Firebase project at https://console.firebase.google.com.
3. Enable Email/Password authentication.
4. Create a Firestore database in production or test mode.
5. Add a Firebase web app and copy the config into:
   - `src/environments/environment.ts`
   - `src/environments/environment.prod.ts`
6. Update `.firebaserc` with your Firebase project ID.
7. Start the app:
   ```bash
   npm start
   ```

## Firebase deployment

1. Install the Firebase CLI if you do not have it:
   ```bash
   npm install -g firebase-tools
   ```
2. Log in and select your project:
   ```bash
   firebase login
   firebase use your-project-id
   ```
3. Build and deploy:
   ```bash
   npm run build
   firebase deploy
   ```

## Firestore data model

```
users/{uid}
tenants/{tenantId}
tenants/{tenantId}/products/{productId}
tenants/{tenantId}/orders/{orderId}
tenants/{tenantId}/inventoryAdjustments/{adjustmentId}
```

Each user document stores the active tenant and role list. Tenant subcollections
hold operational data for that workspace.

## Security rules

Rules live in:

- `firestore.rules`
- `storage.rules`

These rules enforce per-tenant access based on the user profile document. Review
and tighten them before production.
