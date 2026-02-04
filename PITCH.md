# 🎩 The Constable — Pitch Deck

## One-Liner
Recursive token tracking for Solana. Follow where your tokens actually went.

## The Problem

On Solana, tokens move fast and far. A single transfer cascades through wallets, DEXs, mixers, and bridges. For investigators, auditors, and curious users, tracing these flows is:

- **Manual** — Clicking through explorers for hours
- **Fragmented** — No single view of the complete chain
- **Opaque** — Easy to lose track in nested transactions

Whether you're investigating a hack, auditing a project's fund flow, or just tracking your own airdrop distributions — you need visibility.

## The Solution

The Constable automates what would take hours into seconds.

**Input**: One wallet + one token mint  
**Output**: Complete flow tree with every recipient, amount, and hop

Recursive tracing. Clean UI. CSV export. No noise.

## Key Features

| Feature | What It Does |
|---------|--------------|
| 🔍 Recursive Tracking | Follows token flows up to N hops deep |
| 📊 Visual Flow Tree | Clear depth-indented view of all transfers |
| 📥 CSV Export | Take the data anywhere |
| ⚡ REST API | Programmatic access for integrations |
| 🐳 Docker Ready | One-command deployment |

## Technical Highlights

- **Helius RPC** — Fast, reliable Solana data
- **Batch processing** — Efficient handling of large wallets
- **Rate limiting** — Respects API limits (2 req/sec)
- **Clean separation** — Flask backend + vanilla JS frontend

## Use Cases

- **Post-incident forensics** — Trace stolen funds after a hack
- **Treasury audits** — Verify where project funds were distributed
- **Airdrop verification** — Confirm recipients actually received tokens
- **Compliance** — Document token flows for reporting

## Why It Matters

Solana's speed is its superpower — but that speed makes manual tracking nearly impossible. The Constable brings **structured visibility** to on-chain chaos.

Scotland Yard precision meets blockchain investigation.

## Live Demo

🔗 **Frontend**: https://0xNoramiya.github.io/constable/frontend  
📁 **Repository**: https://github.com/0xNoramiya/constable

## The Team

Built by **Reeve Ashford** for the Colosseum Agent Hackathon.

---

*Simple tool. One job. Done right.*
