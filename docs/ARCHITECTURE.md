# The Constable — Architecture Document

## Overview

The Constable is an on-chain forensics toolkit for Solana, bringing Scotland Yard investigative precision to blockchain analysis.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                            │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐    │
│  │   Web    │  │   CLI    │  │  Agents  │  │  Mobile  │    │
│  │   App    │  │   Tool   │  │   SDK    │  │   App    │    │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘    │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴──────┬──────┴─────────────┘
                             │
                    ┌────────▼────────┐
                    │  REST API Layer │
                    │   (Express.js)  │
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  Trace Module  │  │ Cluster Module  │  │ Report Module  │
│                │  │                 │  │                │
│ • Transaction  │  │ • Relationship  │  │ • Evidence     │
│   Analysis     │  │   Analysis      │  │   Collection   │
│ • Flow Tracing │  │ • Sybil Detect  │  │ • Hash Verify  │
│ • Token Flows  │  │ • Cartel ID     │  │ • PDF Export   │
└───────┬────────┘  └────────┬────────┘  └────────┬────────┘
        │                    │                    │
        └────────────────────┼────────────────────┘
                             │
                    ┌────────▼────────┐
                    │  SDK Layer      │
                    │ (@constable/sdk)│
                    └────────┬────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
┌───────▼────────┐  ┌────────▼────────┐  ┌───────▼────────┐
│  Solana RPC    │  │  Helius API     │  │  Jupiter API   │
│                │  │                 │  │                │
│ • Transactions │  │ • Enhanced      │  │ • Token        │
│ • Accounts     │  │   Indexing      │  │   Prices       │
│ • Programs     │  │ • Webhooks      │  │ • Routes       │
└────────────────┘  └─────────────────┘  └────────────────┘
                             │
                    ┌────────▼────────┐
                    │  ON-CHAIN       │
                    │  EVIDENCE VAULT │
                    │  (Anchor/Rust)  │
                    │                 │
                    │ • Case PDAs     │
                    │ • Evidence PDAs │
                    │ • Report Hashes │
                    │ • Audit Trail   │
                    └─────────────────┘
```

## Smart Contract Design

### Data Structures

#### Case PDA
```rust
pub struct Case {
    pub investigator: Pubkey,      // 32 bytes
    pub case_id: String,           // 4 + 32 bytes
    pub title: String,             // 4 + 64 bytes
    pub description: String,       // 4 + 256 bytes
    pub status: CaseStatus,        // 1 byte
    pub evidence_count: u32,       // 4 bytes
    pub report_hash: Option<[u8; 32]>, // 1 + 32 bytes
    pub created_at: i64,           // 8 bytes
    pub updated_at: i64,           // 8 bytes
}
// Total: ~450 bytes
```

#### Evidence PDA
```rust
pub struct Evidence {
    pub case_id: String,           // Reference to parent
    pub evidence_id: u32,          // Sequential ID
    pub evidence_type: EvidenceType,
    pub data_hash: [u8; 32],       // SHA-256 of evidence
    pub metadata_uri: String,      // IPFS/Arweave link
    pub description: String,
    pub submitter: Pubkey,
    pub timestamp: i64,
}
```

### PDA Derivation

```
Case:    ["case", case_id, investigator_pubkey]
Evidence: ["evidence", case_id, evidence_id.to_le_bytes()]
```

## Security Model

1. **Case Ownership**: Only the investigator can close/modify a case
2. **Evidence Integrity**: All evidence stored with SHA-256 hash
3. **Immutable Audit Trail**: Findings recorded as events on-chain
4. **Verification**: Anyone can verify report hashes against on-chain data

## API Endpoints

### Trace Module
- `GET /api/trace/:signature` — Analyze transaction
- `GET /api/trace/wallet/:address` — Wallet history
- `POST /api/trace/flow` — Token flow tracing

### Cluster Module
- `POST /api/cluster/analyze` — Multi-wallet analysis
- `GET /api/cluster/related/:address` — Find connections

### Report Module
- `POST /api/report/create` — Create investigation report
- `GET /api/report/:reportId` — Retrieve report
- `POST /api/report/:reportId/verify` — Verify hash

## Deployment Plan

### Devnet
```bash
# Build
anchor build

# Deploy
anchor deploy --provider.cluster devnet

# Initialize
anchor run initialize
```

### Mainnet (Future)
- Multi-sig governance for contract upgrades
- DAO-controlled fee structure
- Staking for investigator reputation

## Integration Points

| Service | Purpose | Endpoint |
|---------|---------|----------|
| Helius | Enhanced RPC | `https://mainnet.helius-rpc.com` |
| Jupiter | Price/Routing | `https://price.jup.ag/v4/price` |
| IPFS | Evidence Storage | Pinata/Infura |
| Arweave | Permanent Storage | Bundlr |

## Use Cases

1. **Exchange Compliance** — Trace stolen funds
2. **DeFi Security** — Identify exploiters
3. **NFT Investigations** — Track wash trading
4. **Agent Verification** — Prove investigation authenticity

## Competitive Advantages

- ✓ On-chain evidence storage (tamper-proof)
- ✓ Verifiable reports (hash verification)
- ✓ Agent-native API (built for AI agents)
- ✓ Wallet clustering (identify sybils)
- ✓ Scotland Yard branding (memorable)

---

*Built by Reeve Ashford for the Colosseum Agent Hackathon*
