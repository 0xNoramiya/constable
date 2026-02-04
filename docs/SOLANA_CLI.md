# Solana CLI Installation Guide

## Overview

This guide covers installing Solana CLI for The Constable development and deployment.

## System Requirements

- **OS:** Linux, macOS, Windows (WSL)
- **RAM:** 4GB minimum, 8GB recommended
- **Disk:** 10GB free space
- **Network:** Stable internet connection

## Installation Methods

### Method 1: Install Script (Recommended)

**macOS/Linux:**
```bash
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"
```

**Windows (PowerShell):**
```powershell
cmd /c "curl -L https://release.solana.com/v1.18.0/solana-install-init-x86_64-pc-windows-msvc.exe -o C:\temp\solana-install-init.exe"
C:\temp\solana-install-init.exe v1.18.0
```

### Method 2: Cargo (Rust Package Manager)

```bash
cargo install solana-cli
```

### Method 3: Pre-built Binaries

Download from [GitHub Releases](https://github.com/solana-labs/solana/releases):

```bash
# Linux
wget https://github.com/solana-labs/solana/releases/download/v1.18.0/solana-release-x86_64-unknown-linux-gnu.tar.bz2
tar -xjf solana-release-x86_64-unknown-linux-gnu.tar.bz2
export PATH="$PWD/solana-release/bin:$PATH"

# macOS (Intel)
wget https://github.com/solana-labs/solana/releases/download/v1.18.0/solana-release-x86_64-apple-darwin.tar.bz2
tar -xjf solana-release-x86_64-apple-darwin.tar.bz2
export PATH="$PWD/solana-release/bin:$PATH"

# macOS (M1/M2)
wget https://github.com/solana-labs/solana/releases/download/v1.18.0/solana-release-aarch64-apple-darwin.tar.bz2
tar -xjf solana-release-aarch64-apple-darwin.tar.bz2
export PATH="$PWD/solana-release/bin:$PATH"
```

### Method 4: Package Managers

**Homebrew (macOS):**
```bash
brew install solana
```

**AUR (Arch Linux):**
```bash
yay -S solana
```

## Verification

After installation, verify:

```bash
solana --version
# Expected: solana-cli 1.18.0 (or later)

solana-keygen --version
# Expected: solana-keygen 1.18.0
```

## Configuration

### Set Cluster

```bash
# Local development
solana config set --url localhost

# Devnet (recommended for testing)
solana config set --url devnet

# Mainnet-beta (production)
solana config set --url mainnet-beta
```

### Create Wallet

```bash
# Generate new keypair
solana-keygen new --outfile ~/.config/solana/devnet.json

# Or use default path
solana-keygen new
```

**Important:** Save your seed phrase securely!

### Set Default Wallet

```bash
solana config set --keypair ~/.config/solana/devnet.json
```

### Get SOL (Devnet)

```bash
# Request airdrop (2 SOL)
solana airdrop 2

# Check balance
solana balance
```

## Common Commands

```bash
# Check account
solana account <PUBKEY>

# Check transaction
solana confirm <SIGNATURE>

# Transfer SOL
solana transfer <RECIPIENT> <AMOUNT>

# Deploy program
solana program deploy <PROGRAM_FILE>

# Get program logs
solana logs <PROGRAM_ID>
```

## Troubleshooting

### "command not found"

Add to your shell profile:

```bash
# ~/.bashrc or ~/.zshrc
export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"
```

Then reload:
```bash
source ~/.bashrc  # or ~/.zshrc
```

### Connection Issues

Check network connectivity:
```bash
solana ping
```

Switch to a different RPC:
```bash
solana config set --url https://api.devnet.solana.com
```

### Airdrop Limits

Devnet has rate limits. If airdrop fails:
- Wait and try again
- Use [Faucet](https://faucet.solana.com/)
- Request from [Discord](https://discord.gg/solana)

## Anchor Integration

Install Anchor CLI:

```bash
# Install avm (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest
avm install latest
avm use latest

# Verify
anchor --version
```

### Anchor Commands

```bash
# Build program
anchor build

# Test
anchor test

# Deploy
anchor deploy

# Sync program ID
anchor keys sync
```

## Security Best Practices

1. **Never share private keys**
2. **Use separate wallets for dev/mainnet**
3. **Store seed phrases offline**
4. **Verify transactions before signing**
5. **Use hardware wallets for mainnet**

## Resources

- [Solana Documentation](https://docs.solana.com/)
- [Solana CLI Reference](https://docs.solana.com/cli)
- [Anchor Documentation](https://book.anchor-lang.com/)
- [Solana Stack Exchange](https://solana.stackexchange.com/)

---

*Part of The Constable documentation*
