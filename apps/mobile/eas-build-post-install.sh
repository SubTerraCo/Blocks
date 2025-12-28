#!/bin/bash
# EAS Build Post-Install Hook
# Ensure workspace dependencies are available after EAS installs dependencies

set -e

echo "🔧 Ensuring workspace dependencies are available..."

# Navigate to monorepo root
cd ../../
pwd

# Check if pnpm is available
if ! command -v pnpm &> /dev/null; then
    echo "⚠️ pnpm not found, installing..."
    npm install -g pnpm
fi

# Install workspace dependencies
echo "📦 Installing workspace dependencies with pnpm..."
pnpm install --frozen-lockfile

# Build core packages
echo "🏗️ Building core packages..."
pnpm build --filter @blocks/core --filter @blocks/ui

# Ensure React Native is available in mobile app's node_modules
echo "🔗 Ensuring React Native is available..."
cd apps/mobile

# Create symlink or copy if needed (pnpm should handle this, but just in case)
if [ ! -d "node_modules/react-native" ]; then
    echo "⚠️ React Native not found in node_modules, checking parent..."
    if [ -d "../../node_modules/react-native" ]; then
        echo "📦 React Native found in root, creating symlink..."
        mkdir -p node_modules
        ln -sf ../../node_modules/react-native node_modules/react-native || true
    fi
fi

echo "✅ Dependencies ready"

