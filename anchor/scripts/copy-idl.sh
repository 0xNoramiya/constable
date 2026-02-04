#!/bin/bash
# copy-idl.sh
# Copies the generated IDL and types from Anchor build to the SDK
# Run this after `anchor build`

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ANCHOR_DIR="$SCRIPT_DIR/.."
SDK_DIR="$ANCHOR_DIR/../sdk"

# Source and destination paths
IDL_SOURCE="$ANCHOR_DIR/target/idl/evidence_vault.json"
TYPES_SOURCE="$ANCHOR_DIR/target/types/evidence_vault.ts"
IDL_DEST="$SDK_DIR/src/idl"

echo "========================================="
echo "Copying IDL to SDK"
echo "========================================="

# Check if anchor build has been run
if [ ! -f "$IDL_SOURCE" ]; then
    echo "❌ Error: IDL file not found at $IDL_SOURCE"
    echo ""
    echo "Please run 'anchor build' first to generate the IDL."
    exit 1
fi

# Create destination directory if it doesn't exist
mkdir -p "$IDL_DEST"

# Copy IDL JSON
echo "📄 Copying IDL JSON..."
cp "$IDL_SOURCE" "$IDL_DEST/evidence_vault.json"
echo "   ✓ Copied to $IDL_DEST/evidence_vault.json"

# Copy TypeScript types if they exist
if [ -f "$TYPES_SOURCE" ]; then
    echo "📘 Copying TypeScript types..."
    cp "$TYPES_SOURCE" "$IDL_DEST/evidence_vault.ts"
    echo "   ✓ Copied to $IDL_DEST/evidence_vault.ts"
else
    echo "⚠️  Warning: TypeScript types not found. Run 'anchor build' to generate them."
fi

echo ""
echo "========================================="
echo "✅ IDL copied successfully!"
echo "========================================="
echo ""
echo "IDL Location: $IDL_DEST/evidence_vault.json"
echo ""
echo "You can now import the IDL in your SDK:"
echo "  import EvidenceVaultIDL from './idl/evidence_vault.json';"
