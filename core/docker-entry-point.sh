#!/bin/bash

set -e # Exit on any error

cd /app

if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  pnpm install --force --no-frozen-lockfile
fi

if ! pnpm list typescript > /dev/null 2>&1 || ! pnpm list ts-node > /dev/null 2>&1; then
    echo "Installing TypeScript and ts-node"
    pnpm add -D typescript ts-node
fi

echo "Running make build_all"
pnpm build:base

cd agent
pnpm start