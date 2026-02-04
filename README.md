# 🔍 The Constable

> *"The butler sees everything. The Constable proves it."*

On-chain forensics and investigation toolkit for Solana. Bringing Scotland Yard precision to blockchain forensics.

## Overview

The Constable is an AI-powered forensic investigation system for Solana. It traces suspicious transactions, analyzes wallet clusters, and generates verifiable investigation reports — all anchored on-chain for transparency and trust.

## Features

- 🔍 **Transaction Tracer** — Follow SOL/token flows across wallets
- 🕸️ **Cluster Analyzer** — Identify connected wallets (sybils, cartels)
- 📦 **Evidence Vault** — On-chain storage of investigation findings via PDAs
- 📄 **Report Generator** — Verifiable reports with on-chain hashes
- 🚨 **Threat Feed** — Real-time suspicious activity alerts

## Architecture

```
├── anchor/           # Solana programs (Rust/Anchor)
│   └── evidence_vault/  # PDA-based evidence storage
├── api/              # REST API (TypeScript)
│   ├── trace/        # Transaction tracing
│   ├── cluster/      # Wallet clustering
│   └── report/       # Investigation reports
├── sdk/              # TypeScript client SDK
└── docs/             # Documentation
```

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
anchor test

# Start API server
npm run dev
```

## Solana Integration

- **PDAs** for evidence storage and case management
- **Helius** for enhanced RPC indexing
- **Jupiter** for token flow analysis
- **Memo program** for immutable audit trails

## License

MIT
