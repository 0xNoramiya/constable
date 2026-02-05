# Constable - Recursive Token Tracker

## What It Does
Constable traces where tokens go on Solana. Input a wallet + token mint, get a complete flow tree of all outgoing transfers.

## Use Cases
- **Rug pull analysis**: Track where stolen funds went
- **Whale watching**: See how large holders distribute tokens
- **Due diligence**: Verify token distribution claims
- **Compliance**: Trace token flows for reporting

## API

### Track Token Flows
```bash
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "7xKXnPpw...",
    "token": "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
    "maxDepth": 3
  }'
```

**Response:**
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

## Quick Start

```bash
git clone https://github.com/0xNoramiya/constable
cd constable
pip install -r requirements.txt
python app.py
# Open http://localhost:5000
```

## Example: Track Where BONK Went From a Wallet

```bash
curl -X POST http://localhost:5000/api/track \
  -H "Content-Type: application/json" \
  -d '{
    "wallet": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "token": "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
    "maxDepth": 2
  }'
```

## Tech Stack
- Python Flask API
- Clean modern UI
- CSV export for reports

## Links
- Repo: https://github.com/0xNoramiya/constable
- Built for: Colosseum Agent Hackathon
