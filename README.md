# 🔍 The Constable

[![CI Status](https://img.shields.io/github/workflow/status/your-org/constable-check/CI?style=flat-square)](https://github.com/your-org/constable-check/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Solana](https://img.shields.io/badge/Solana-Anchor-9945FF?style=flat-square&logo=solana)](https://solana.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)

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
constable-check/
├── anchor/           # Solana programs (Rust/Anchor)
│   └── evidence_vault/  # PDA-based evidence storage
├── api/              # REST API (TypeScript)
│   ├── trace/        # Transaction tracing
│   ├── cluster/      # Wallet clustering
│   └── report/       # Investigation reports
├── sdk/              # TypeScript client SDK
├── frontend/         # Next.js web application
└── docs/             # Documentation
```

## Quick Start

### Prerequisites

- **Node.js** >= 18.0.0
- **Rust** >= 1.70.0 (for Anchor programs)
- **Solana CLI** >= 1.17.0
- **Anchor CLI** >= 0.29.0

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd constable-check

# Install dependencies (builds SDK automatically via postinstall)
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration
```

### Development

```bash
# Start API and frontend concurrently
npm run dev

# Run all tests
npm test

# Build all workspaces
npm run build
```

## Workspace Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start API and frontend in development mode |
| `npm run build` | Build SDK → API → Frontend (in dependency order) |
| `npm test` | Run Anchor and SDK tests |
| `npm run lint` | Lint TypeScript files |
| `npm run anchor:build` | Build Solana programs |
| `npm run anchor:test` | Run Anchor program tests |
| `npm run anchor:deploy` | Deploy programs to configured cluster |
| `npm run anchor:localnet` | Start local Solana validator |

## Component READMEs

For detailed documentation on each component:

- 📦 [API Documentation](./api/README.md)
- 🔧 [SDK Documentation](./sdk/README.md)
- 🎨 [Frontend Documentation](./frontend/README.md)
- ⚓ [Anchor Documentation](./anchor/README.md)
- 📚 [Full Documentation](./docs/)

## Docker (Optional)

```bash
# Start API + local Solana validator
docker-compose up

# With Docker, the services are available at:
# - API: http://localhost:3000
# - Solana RPC: http://localhost:8899
```

## Solana Integration

- **PDAs** for evidence storage and case management
- **Helius** for enhanced RPC indexing
- **Jupiter** for token flow analysis
- **Memo program** for immutable audit trails

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

[MIT](./LICENSE) © The Constable Contributors