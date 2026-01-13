import admin from 'firebase-admin';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

type SeedConfig = {
  projectId: string;
  isEmulator: boolean;
  rootUsername: string;
  rootEmail: string;
  rootPassword: string;
  forceRootPassword: boolean;
  allowProdSeed: boolean;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function retry<T>(
  fn: () => Promise<T>,
  opts: { timeoutMs: number; intervalMs: number; label: string }
): Promise<T> {
  const started = Date.now();
  let lastErr: unknown;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      return await fn();
    } catch (e) {
      lastErr = e;
      if (Date.now() - started > opts.timeoutMs) break;
      await sleep(opts.intervalMs);
    }
  }
  throw new Error(`Timed out waiting for ${opts.label}. Last error: ${String(lastErr)}`);
}

function readProjectIdFromFirebaserc(): string | null {
  try {
    // functions/ -> repo root
    const firebasercPath = path.resolve(__dirname, '../../../.firebaserc');
    const raw = fs.readFileSync(firebasercPath, 'utf8');
    const parsed = JSON.parse(raw) as any;
    const pid = parsed?.projects?.default;
    if (typeof pid === 'string' && pid.trim().length > 0 && pid !== 'YOUR_FIREBASE_PROJECT_ID') {
      return pid.trim();
    }
    return null;
  } catch {
    return null;
  }
}

function loadConfig(): SeedConfig {
  const projectId =
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    process.env.GCLOUD_PROJECT?.trim() ||
    readProjectIdFromFirebaserc() ||
    'demo-pos';

  const isEmulator =
    Boolean(process.env.FIRESTORE_EMULATOR_HOST) || Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST);

  const rootUsername = (process.env.ROOT_USERNAME ?? 'root').trim() || 'root';
  // Firebase Auth requires passwords to be at least 6 characters.
  // Keep the default dev password valid to avoid `FirebaseAuthError` during seeding.
  const rootPassword = process.env.ROOT_PASSWORD ?? 'root123';
  const rootEmail = (process.env.ROOT_EMAIL ?? `${rootUsername}@local.test`).trim();

  const forceRootPassword = (process.env.FORCE_ROOT_PASSWORD ?? '').toLowerCase() === 'true';
  const allowProdSeed = (process.env.ALLOW_PROD_SEED ?? '').toLowerCase() === 'true';

  if (typeof rootPassword !== 'string' || rootPassword.length < 6) {
    throw new Error(
      [
        'Invalid ROOT_PASSWORD: Firebase Auth requires a password of at least 6 characters.',
        'Set ROOT_PASSWORD to a 6+ character value (e.g. ROOT_PASSWORD=root123).'
      ].join(' ')
    );
  }

  return {
    projectId,
    isEmulator,
    rootUsername,
    rootEmail,
    rootPassword,
    forceRootPassword,
    allowProdSeed
  };
}

function ensureAdminApp(projectId: string) {
  // Seed script uses `admin.firestore()` / `admin.auth()` which target the *default*
  // app. Make sure the default app exists (avoid named-app init here).
  if (admin.apps.length > 0) return admin.app();
  return admin.initializeApp({ projectId });
}

function hashPassword(password: string, saltHex?: string) {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  return { saltHex: salt.toString('hex'), hashHex: hash.toString('hex') };
}

async function waitForEmulatorsIfNeeded(cfg: SeedConfig) {
  if (!cfg.isEmulator) return;

  // Firestore readiness
  await retry(
    async () => {
      await admin
        .firestore()
        .collection('_seed')
        .doc('health')
        .set({ ok: true, ts: new Date().toISOString() }, { merge: true });
    },
    { timeoutMs: 60_000, intervalMs: 1_000, label: 'Firestore emulator' }
  );

  // Auth readiness
  await retry(
    async () => {
      await admin.auth().listUsers(1);
    },
    { timeoutMs: 60_000, intervalMs: 1_000, label: 'Auth emulator' }
  );
}

async function upsertRootUser(cfg: SeedConfig) {
  if (!cfg.isEmulator && !cfg.allowProdSeed) {
    throw new Error(
      [
        'Refusing to create/update the default root user against a non-emulator Firebase project.',
        'Set ALLOW_PROD_SEED=true if you really want to do this.'
      ].join(' ')
    );
  }

  let user: admin.auth.UserRecord | null = null;
  try {
    user = await admin.auth().getUserByEmail(cfg.rootEmail);
  } catch (e: any) {
    if (e?.code !== 'auth/user-not-found') throw e;
  }

  if (!user) {
    user = await admin.auth().createUser({
      email: cfg.rootEmail,
      password: cfg.rootPassword,
      displayName: cfg.rootUsername,
      emailVerified: true
    });
    // eslint-disable-next-line no-console
    console.log(`Created Auth user: ${cfg.rootEmail} (uid=${user.uid})`);
  } else {
    const update: admin.auth.UpdateRequest = { displayName: cfg.rootUsername };
    if (cfg.forceRootPassword || cfg.isEmulator) update.password = cfg.rootPassword;
    user = await admin.auth().updateUser(user.uid, update);
    // eslint-disable-next-line no-console
    console.log(`Updated Auth user: ${cfg.rootEmail} (uid=${user.uid})`);
  }

  // "High level privileges" => custom claims (works for Firebase Auth based authorization)
  await admin.auth().setCustomUserClaims(user.uid, {
    role: 'root',
    isSuperuser: true,
    privileges: ['*']
  });

  // Also write a DB user profile record (useful for app-side auth/roles if needed)
  const db = admin.firestore();
  const { saltHex, hashHex } = hashPassword(cfg.rootPassword);
  await db
    .collection('users')
    .doc(user.uid)
    .set(
      {
        username: cfg.rootUsername,
        email: cfg.rootEmail,
        roles: ['root'],
        isSuperuser: true,
        password: {
          // NOTE: this is only for dev convenience; don't use this for real auth in production.
          algo: 'scrypt',
          saltHex,
          hashHex
        },
        updatedAt: new Date().toISOString(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      },
      { merge: true }
    );

  return user;
}

async function seedProducts() {
  const db = admin.firestore();
  const snap = await db.collection('products').limit(1).get();
  if (!snap.empty) return;

  const now = new Date().toISOString();
  await Promise.all([
    db.collection('products').doc('seed-coffee').set({
      name: 'Coffee',
      price: 3.5,
      currency: 'USD',
      createdAt: now
    }),
    db.collection('products').doc('seed-sandwich').set({
      name: 'Sandwich',
      price: 8.99,
      currency: 'USD',
      createdAt: now
    }),
    db.collection('products').doc('seed-room-night').set({
      name: 'Room Night',
      price: 129.0,
      currency: 'USD',
      createdAt: now
    })
  ]);
}

async function main() {
  const cfg = loadConfig();
  ensureAdminApp(cfg.projectId);

  if (cfg.isEmulator) {
    // eslint-disable-next-line no-console
    console.log('Seeding against emulators...');
  } else {
    // eslint-disable-next-line no-console
    console.log(`Seeding against project: ${cfg.projectId}`);
  }

  await waitForEmulatorsIfNeeded(cfg);
  const root = await upsertRootUser(cfg);
  await seedProducts();

  await admin
    .firestore()
    .collection('_seed')
    .doc('meta')
    .set(
      {
        seededAt: new Date().toISOString(),
        root: { uid: root.uid, email: cfg.rootEmail, username: cfg.rootUsername }
      },
      { merge: true }
    );

  // eslint-disable-next-line no-console
  console.log('Seed complete.');
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exitCode = 1;
});

