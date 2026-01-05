#!/usr/bin/env bash
set -euo pipefail

# Starts Firebase emulators and seeds the DB on startup.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

PROJECT_ID="${FIREBASE_PROJECT_ID:-}"
if [[ -z "${PROJECT_ID}" && -f "${ROOT_DIR}/.firebaserc" ]]; then
  PROJECT_ID="$(node -e "const fs=require('fs');const j=JSON.parse(fs.readFileSync('${ROOT_DIR}/.firebaserc','utf8'));process.stdout.write((j.projects&&j.projects.default)||'');" 2>/dev/null || true)"
fi
PROJECT_ID="${PROJECT_ID:-demo-pos}"

export FIREBASE_PROJECT_ID="${PROJECT_ID}"
export GCLOUD_PROJECT="${PROJECT_ID}"

# These env vars make Admin SDK talk to emulators from the seed script.
export FIRESTORE_EMULATOR_HOST="${FIRESTORE_EMULATOR_HOST:-127.0.0.1:8080}"
export FIREBASE_AUTH_EMULATOR_HOST="${FIREBASE_AUTH_EMULATOR_HOST:-127.0.0.1:9099}"

# Default root credentials (override if you want)
export ROOT_USERNAME="${ROOT_USERNAME:-root}"
export ROOT_PASSWORD="${ROOT_PASSWORD:-root}"
export ROOT_EMAIL="${ROOT_EMAIL:-${ROOT_USERNAME}@local.test}"

cleanup() {
  if [[ -n "${EMU_PID:-}" ]]; then
    kill "${EMU_PID}" >/dev/null 2>&1 || true
  fi
}
trap cleanup EXIT

echo "Starting Firebase emulators for project: ${PROJECT_ID}"
ONLY="auth,firestore,functions"
if [[ "${START_HOSTING:-}" == "true" ]]; then
  ONLY="auth,firestore,functions,hosting"
fi

firebase emulators:start --project "${PROJECT_ID}" --only "${ONLY}" &
EMU_PID="$!"

echo "Seeding database (creates ${ROOT_USERNAME}/${ROOT_PASSWORD})..."
(cd "${ROOT_DIR}/functions" && npm run seed)

echo "Emulators running (PID=${EMU_PID}). Press Ctrl+C to stop."
wait "${EMU_PID}"

