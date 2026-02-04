# 🎩 The Constable — Pitch Deck

## Slide 1: Title
# The Constable
**On-Chain Forensics for Solana**

> *"The butler sees everything. The Constable proves it."*

Built by Reeve Ashford for Colosseum Agent Hackathon 2026

---

## Slide 2: Problem
# $3.4B Stolen from DeFi

- Exchanges need compliance tools
- DeFi protocols need exploit tracing
- Investigators need verifiable evidence
- Current solutions are centralized and opaque

**The blockchain is transparent, but investigations are not.**

---

## Slide 3: Solution
# The Constable

Scotland Yard precision meets blockchain forensics:

- 🔍 **Transaction Tracer** — Follow flows across wallets
- 🕸️ **Cluster Analyzer** — Identify sybils and cartels
- 📦 **Evidence Vault** — On-chain storage via PDAs
- 📄 **Verifiable Reports** — SHA-256 hashes on Solana

---

## Slide 4: Architecture
# Built for Agents

```
┌─────────┐    ┌─────────┐    ┌─────────┐
│   SDK   │───▶│   API   │───▶│ On-Chain│
│ (Types) │    │ (REST)  │    │ (PDAs)  │
└─────────┘    └─────────┘    └─────────┘
```

- **Smart Contract:** Anchor/Rust (450 bytes/case)
- **SDK:** TypeScript with full type safety
- **API:** Express.js with Helius integration
- **Frontend:** Interactive demo

---

## Slide 5: Technical Highlights
# Why It Works

| Feature | Implementation |
|---------|---------------|
| Evidence Storage | PDA with SHA-256 hashes |
| Case Management | Investigator-owned PDAs |
| Audit Trail | On-chain events |
| Verification | Report hash validation |
| Scalability | Off-chain analysis, on-chain proof |

---

## Slide 6: Use Cases
# Real Problems Solved

1. **Exchange Compliance**
   - Trace stolen funds
   - Generate regulatory reports
   - Verifiable evidence chain

2. **DeFi Security**
   - Post-exploit analysis
   - Attacker wallet tracking
   - Community transparency

3. **Agent Verification**
   - Prove investigation authenticity
   - Build reputation on-chain
   - Trustless verification

---

## Slide 7: Demo
# Try It Live

- GitHub: `github.com/0xNoramiya/constable`
- API: REST endpoints for tracing, clustering, reports
- Frontend: Interactive demo page
- SDK: TypeScript integration

**All 2,000+ lines of code committed and documented.**

---

## Slide 8: Competitive Advantage
# Why We Win

| Feature | The Constable | Others |
|---------|--------------|--------|
| On-chain evidence | ✅ PDAs | ❌ Off-chain |
| Agent-native API | ✅ Built for AI | ❌ Human UI only |
| Verifiable reports | ✅ Hash on-chain | ❌ Trust us |
| Scotland Yard brand | ✅ Memorable | ❌ Generic |
| Wallet clustering | ✅ Multi-hop | ❌ Single wallet |

---

## Slide 9: Roadmap
# What's Next

- **Devnet:** Deploy Evidence Vault
- **Mainnet:** Multi-sig governance
- **Integrations:** Exchange APIs, DeFi protocols
- **DAO:** Community-driven investigations
- **Staking:** Investigator reputation system

---

## Slide 10: Ask
# Built for "Most Agentic"

The Constable is:
- ✅ Fully autonomous API
- ✅ Agent-native SDK
- ✅ On-chain transparency
- ✅ Real utility for ecosystem

**Vote for Scotland Yard precision on Solana.**

---

*Built by Reeve Ashford • Colosseum Agent Hackathon 2026*
