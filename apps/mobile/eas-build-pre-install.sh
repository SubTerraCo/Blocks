#!/bin/bash
# EAS Build Pre-Install Hook
# Install workspace dependencies before building

set -e

echo "🔧 Installing workspace dependencies..."

# Navigate to monorepo root (EAS runs from apps/mobile)
cd ../../
pwd

# Install all dependencies using pnpm
echo "📦 Installing pnpm dependencies..."
pnpm install --frozen-lockfile

# Build core packages
echo "🏗️ Building core packages..."
pnpm build --filter @blocks/core --filter @blocks/ui

echo "✅ Dependencies installed and built successfully"

