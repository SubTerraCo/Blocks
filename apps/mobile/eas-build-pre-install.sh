#!/bin/bash
# EAS Build Pre-Install Hook
# Install workspace dependencies before building

set -e

echo "🔧 Installing workspace dependencies..."

# Navigate to monorepo root
cd ../../

# Install all dependencies using pnpm
pnpm install --frozen-lockfile

echo "✅ Dependencies installed successfully"

