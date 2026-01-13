## Database connection + local seeding

This repo uses **Firebase (Firestore)** as its database, accessed from the backend in `functions/` via `firebase-admin`.

### Local development (recommended): connect to emulators

- **Prereqs**: Node 22+, `npm`, and the Firebase CLI (`firebase --version`).
- **Set your project id**: edit `.firebaserc` and replace `YOUR_FIREBASE_PROJECT_ID` (any string works for emulators).

Install dependencies:

```bash
npm --prefix functions install
npm --prefix pos-web install
```

Start emulators + auto-seed on startup (creates the default `root/root123` user):

```bash
bash scripts/start-local.sh
```

What this does:
- Starts **Auth + Firestore + Functions** emulators (ports are defined in `firebase.json`)
- Runs `functions/src/scripts/seed.ts` (via `npm --prefix functions run seed`)
- Creates a privileged default user:
  - **username**: `root`
  - **password**: `root123`
  - **email (Firebase Auth)**: `root@local.test`

If you also want the **Hosting** emulator (so `/api/*` requests are rewritten exactly like production), build the web app and start with:

```bash
npm --prefix pos-web run build
START_HOSTING=true bash scripts/start-local.sh
```

You can override defaults:

```bash
ROOT_USERNAME=root ROOT_PASSWORD=root123 ROOT_EMAIL=root@local.test bash scripts/start-local.sh
```

### Connecting to a real Firebase project (non-emulator)

By default the seed script **refuses** to create the `root` user against a non-emulator project to avoid accidental production changes.

If you intentionally want to seed a real project, you must:

```bash
export FIREBASE_PROJECT_ID="your-real-project-id"
export ALLOW_PROD_SEED=true
cd functions && npm run seed
```

To run locally against a real project, you’ll also need valid Google credentials for `firebase-admin` (for example by using Application Default Credentials or setting `GOOGLE_APPLICATION_CREDENTIALS` to a service account JSON).

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

