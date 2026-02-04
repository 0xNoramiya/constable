# 🎩 The Constable

> On-chain forensics and investigation toolkit for Solana. Scotland Yard precision meets blockchain investigation.

Recursive token tracking that follows your tokens through every hop — from wallet to wallet, across DEXs, through mixers. Complete visibility for investigators, auditors, and the curious.

## What It Does

Enter a wallet + token mint → Constable traces all outgoing transfers recursively, showing you exactly where the tokens ended up.

**One function.** Clean UI. CSV export.

## Quick Start

```bash
pip install -r requirements.txt
python app.py
```

Open http://localhost:5000

## How It Works

1. **Input**: Starting wallet + token mint
2. **Trace**: Finds all outgoing token transfers
3. **Recurse**: Follows each recipient wallet
4. **Display**: Shows complete flow tree with depth indicators

## API

```bash
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{"wallet": "7xKX...", "token": "EPjF...", "maxDepth": 3}'
```

Response:
```json
{
  "flows": [
    {
      "from_wallet": "7xKX...",
      "to_wallet": "8zRZ...",
      "amount": 1000.50,
      "token_symbol": "USDC",
      "signature": "...",
      "depth": 0
    }
  ],
  "summary": {
    "total_flows": 15,
    "unique_wallets": 8,
    "total_amount": 5000.00
  }
}
```

## Structure

```
constable/
├── app.py           # Core tracker + Flask API
├── frontend/
│   └── index.html   # Clean modern UI
├── requirements.txt
└── README.md
```

## Colosseum Hackathon

Built for the Colosseum Agent Hackathon — $100k prize pool.

**Focus**: Simple, focused tool that does one thing well.
