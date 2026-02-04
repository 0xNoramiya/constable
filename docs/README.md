# The Constable — Developer Documentation

## Table of Contents

1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Smart Contract](#smart-contract)
4. [SDK Usage](#sdk-usage)
5. [API Reference](#api-reference)
6. [Deployment](#deployment)
7. [Testing](#testing)
8. [Architecture](#architecture)

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/0xNoramiya/constable.git
cd constable

# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Installation

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | ≥18.0 | API and SDK runtime |
| Rust | ≥1.70 | Smart contract compilation |
| Solana CLI | ≥1.17 | Deployment and testing |
| Anchor | ≥0.29 | Solana framework |

### Install Solana CLI

```bash
# macOS/Linux
sh -c "$(curl -sSfL https://release.solana.com/v1.18.0/install)"

# Or via cargo
cargo install solana-cli

# Verify
solana --version
```

### Install Anchor

```bash
# Install avm (Anchor Version Manager)
cargo install --git https://github.com/coral-xyz/anchor avm --locked --force

# Install latest anchor
avm install latest
avm use latest

# Verify
anchor --version
```

### Project Setup

```bash
# Install Node dependencies
cd api && npm install
cd ../sdk && npm install

# Build SDK
cd sdk && npm run build

# Link SDK to API
cd ../api && npm link ../sdk
```

---

## Smart Contract

### Program ID

**Devnet:** `Fg6tVimZ4BRL1P8dWNFxDGWKdfnw3hH7VzMBz5v4RZJx`

### Build

```bash
cd anchor
anchor build
```

### Test

```bash
cd anchor
anchor test
```

### Deploy

```bash
cd anchor

# Set cluster
solana config set --url devnet

# Request airdrop
solana airdrop 2

# Deploy
anchor deploy

# Update program ID in lib.rs and Anchor.toml
# Then redeploy
```

---

## SDK Usage

### Installation

```bash
npm install @constable/sdk
```

### Basic Usage

```typescript
import { ConstableSDK } from '@constable/sdk';
import { Connection, Keypair } from '@solana/web3.js';

// Initialize
const connection = new Connection('https://api.devnet.solana.com');
const wallet = new Keypair(); // Your wallet

const constable = new ConstableSDK(connection, wallet);

// Create a case
const tx = await constable.createCase(
  'case-001',
  'Exchange Hack Investigation',
  'Investigating unauthorized withdrawals from hot wallet'
);
console.log('Case created:', tx);

// Get case PDA
const casePda = constable.getCasePda('case-001', wallet.publicKey);
console.log('Case PDA:', casePda.toString());

// Fetch case details
const caseDetails = await constable.getCase(casePda);
console.log('Case:', caseDetails);

// Add evidence
const evidenceTx = await constable.addEvidence(
  'case-001',
  wallet.publicKey,
  'TransactionTrace',
  new Uint8Array(32).fill(1), // SHA-256 hash
  'https://ipfs.io/ipfs/Qm...',
  'First trace of attacker wallet'
);
console.log('Evidence added:', evidenceTx);

// Close case
const reportHash = new Uint8Array(32).fill(2); // SHA-256 of report
const closeTx = await constable.closeCase('case-001', reportHash);
console.log('Case closed:', closeTx);
```

### Advanced Usage

```typescript
// Get all cases for investigator
const cases = await constable.getCasesByInvestigator(wallet.publicKey);
console.log('Total cases:', cases.length);

// Fetch all evidence for a case
const evidencePromises = [];
for (let i = 0; i < caseDetails.evidenceCount; i++) {
  const [evidencePda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('evidence'),
      Buffer.from('case-001'),
      Buffer.from(new Uint32Array([i]).buffer)
    ],
    programId
  );
  evidencePromises.push(constable.getEvidence(evidencePda));
}
const evidence = await Promise.all(evidencePromises);
```

---

## API Reference

### Base URL

```
https://api.constable.dev
```

### Authentication

API is currently open. Future versions will use API keys.

### Endpoints

#### Trace Module

**GET /api/trace/:signature**

Analyze a specific transaction.

**Parameters:**
- `signature` (string, required): Transaction signature

**Response:**
```json
{
  "signature": "5xK...",
  "slot": 234567890,
  "blockTime": "2024-01-15T10:30:00Z",
  "fee": 5000,
  "status": "success",
  "accounts": [
    {
      "address": "7xKXtg...",
      "signer": true,
      "writable": true
    }
  ]
}
```

**GET /api/trace/wallet/:address**

Get transaction history for a wallet.

**Parameters:**
- `address` (string, required): Wallet address
- `limit` (number, optional): Max transactions (default: 50)
- `before` (string, optional): Pagination cursor

**Response:**
```json
{
  "address": "7xKXtg...",
  "count": 50,
  "transactions": [
    {
      "signature": "5xK...",
      "slot": 234567890,
      "blockTime": 1705312200,
      "status": "success",
      "fee": 5000
    }
  ]
}
```

**POST /api/trace/flow**

Trace token flow between addresses.

**Request Body:**
```json
{
  "source": "7xKXtg...",
  "destination": "9yMYuh...",
  "tokenMint": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  "maxDepth": 3
}
```

#### Cluster Module

**POST /api/cluster/analyze**

Analyze relationships between multiple wallets.

**Request Body:**
```json
{
  "addresses": [
    "7xKXtg...",
    "9yMYuh...",
    "3zPQwr..."
  ],
  "maxDepth": 2
}
```

**Response:**
```json
{
  "inputAddresses": ["7xKXtg...", "9yMYuh...", "3zPQwr..."],
  "clusterScore": 75,
  "intersections": [
    {
      "address": "Common...",
      "connectsTo": ["7xKXtg...", "9yMYuh..."]
    }
  ],
  "riskLevel": "medium"
}
```

**GET /api/cluster/related/:address**

Find wallets related to a given address.

**Parameters:**
- `address` (string, required): Wallet address
- `minInteractions` (number, optional): Minimum interactions (default: 5)

#### Report Module

**POST /api/report/create**

Create an investigation report.

**Request Body:**
```json
{
  "caseId": "case-001",
  "title": "Exchange Hack Report",
  "description": "Full investigation of unauthorized withdrawals",
  "findings": [
    {
      "type": "confirmed",
      "description": "Attacker identified",
      "addresses": ["7xKXtg..."],
      "transactions": ["5xK..."]
    }
  ],
  "evidenceHashes": ["abc123..."]
}
```

**Response:**
```json
{
  "reportId": "rpt_a1b2c3...",
  "caseId": "case-001",
  "reportHash": "0x1234...",
  "createdAt": "2024-01-15T10:30:00Z",
  "url": "/api/report/rpt_a1b2c3..."
}
```

**GET /api/report/:reportId**

Retrieve a report by ID.

**POST /api/report/:reportId/verify**

Verify a report's hash.

**Request Body:**
```json
{
  "reportHash": "0x1234..."
}
```

---

## Deployment

### Deploy API

```bash
cd api

# Build
npm run build

# Start production server
npm start
```

### Environment Variables

Create `.env` file:

```env
# Solana
SOLANA_RPC=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=base58_encoded_key

# Helius (optional, for enhanced indexing)
HELIUS_API_KEY=your_key_here

# Server
PORT=3000
NODE_ENV=production
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t constable-api .
docker run -p 3000:3000 --env-file .env constable-api
```

---

## Testing

### Smart Contract Tests

```bash
cd anchor

# Run all tests
anchor test

# Run specific test
anchor test --grep "create_case"
```

### SDK Tests

```bash
cd sdk
npm test
```

### API Tests

```bash
cd api
npm test
```

### Integration Tests

```bash
# Start local validator
solana-test-validator

# Deploy program
anchor deploy

# Run integration tests
npm run test:integration
```

---

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed system design.

---

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

---

## License

MIT © 2026 The Constable
