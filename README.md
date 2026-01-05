# SaaS POS (Angular + Firebase)

Cloud SaaS point-of-sale starter built for **Firebase deployment**:

- **Frontend**: Angular (TypeScript) → Firebase Hosting
- **Backend**: Node.js (TypeScript) “microservices” → Firebase Cloud Functions
- **Data**: Firestore (collections: `products`, `sales`)

## Repo layout

- `pos-web/`: Angular POS web app
- `functions/`: Firebase Functions (Node/TS) backend
- `firebase.json`: Hosting + Functions config (includes `/api/*` rewrites)

## Local development

### 1) Frontend

```bash
cd pos-web
npm install
npm start
```

Angular dev server runs locally. In production (Firebase Hosting), `/api/*` is proxied to Functions via rewrites in `firebase.json`.

### 2) Backend (Functions)

```bash
cd functions
npm install
npm run build
```

To run emulators (requires Firebase CLI):

```bash
npm i -g firebase-tools
firebase emulators:start
```

## Services (microservice-style)

Each service is its own Express app exported as an HTTPS function:

- **catalog**: `functions/src/services/catalog.ts`
  - `GET /api/catalog/products`
  - `POST /api/catalog/products`
  - `DELETE /api/catalog/products/:id`
- **sales**: `functions/src/services/sales.ts`
  - `POST /api/sales/checkout`
- **auth**: `functions/src/services/auth.ts`
  - `GET /api/auth/me` (expects `Authorization: Bearer <Firebase ID token>`)

## Firebase deploy

1) Create/select a Firebase project, then set your project id:

- Edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID`, or run:

```bash
firebase use --add
```

2) Deploy:

```bash
firebase deploy
```

`firebase.json` is configured to:

- Build **Functions** with `npm --prefix functions run build`
- Build **Angular** with `npm --prefix pos-web run build`
- Serve the Angular build from `pos-web/dist/pos-web`
- Rewrite `/api/auth/**`, `/api/catalog/**`, `/api/sales/**` to Functions

## Security note

`firestore.rules` is currently wide open for bootstrapping (`allow read, write: if true;`).
Lock this down before production (Firebase Auth + roles/claims).

