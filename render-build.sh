#!/usr/bin/env bash
# exit on error
set -o errexit

npm install
npm run build
npm install --include=dev
npx prisma generate
npx prisma migrate deploy