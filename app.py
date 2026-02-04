#!/usr/bin/env python3
"""
Constable - Recursive Token Tracker
Track where tokens go from a starting wallet
"""

import os
import sys
import requests
import json
import time
from typing import List, Dict, Optional, Set
from dataclasses import dataclass, asdict
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def log(msg: str):
    """Log to stderr (doesn't interfere with HTTP responses)"""
    print(msg, file=sys.stderr, flush=True)

HELIUS_API_KEY = os.getenv("HELIUS_API_KEY")
if not HELIUS_API_KEY:
    raise ValueError("HELIUS_API_KEY environment variable is required")

HELIUS_RPC = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}"

# Rate limiting: track last request time
_last_request_time = 0
MIN_REQUEST_INTERVAL = 0.5  # 500ms between requests (2 req/sec)

def rate_limited_post(url, **kwargs):
    """Make a rate-limited POST request."""
    global _last_request_time
    elapsed = time.time() - _last_request_time
    if elapsed < MIN_REQUEST_INTERVAL:
        time.sleep(MIN_REQUEST_INTERVAL - elapsed)
    _last_request_time = time.time()
    return requests.post(url, **kwargs)


@dataclass
class TokenFlow:
    """Single hop in the token flow chain"""
    from_wallet: str
    to_wallet: str
    amount: float
    token_mint: str
    token_symbol: str
    signature: str
    timestamp: int
    slot: int
    depth: int


def get_token_metadata(token_mint: str) -> Dict:
    """Get token symbol and name."""
    try:
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getAsset",
            "params": {"id": token_mint}
        }
        response = rate_limited_post(HELIUS_RPC, json=payload, timeout=10)
        data = response.json()
        result = data.get("result", {})
        return {
            "symbol": result.get("token_info", {}).get("symbol", "UNKNOWN"),
            "name": result.get("token_info", {}).get("name", "Unknown Token"),
            "decimals": result.get("token_info", {}).get("decimals", 9)
        }
    except:
        return {"symbol": "UNKNOWN", "name": "Unknown Token", "decimals": 9}


def get_token_accounts(wallet: str, token_mint: str) -> List[Dict]:
    """Get token accounts for a wallet."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByOwner",
        "params": [wallet, {"mint": token_mint}, {"encoding": "jsonParsed"}]
    }
    try:
        response = rate_limited_post(HELIUS_RPC, json=payload, timeout=10)
        return response.json().get("result", {}).get("value", [])
    except:
        return []


def fetch_signatures(wallet: str, limit: int = 20) -> List[Dict]:
    """Fetch transaction signatures for a wallet."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [wallet, {"limit": limit}]
    }
    try:
        response = rate_limited_post(HELIUS_RPC, json=payload, timeout=15)
        return response.json().get("result", [])
    except:
        return []


def fetch_transactions_batch(signatures: List[str]) -> List[Optional[Dict]]:
    """Fetch multiple transactions in a batch request."""
    if not signatures:
        return []
    
    # Build batch request
    batch = []
    for i, sig in enumerate(signatures[:10]):  # Limit to 10 per batch
        batch.append({
            "jsonrpc": "2.0",
            "id": i,
            "method": "getTransaction",
            "params": [sig, {"encoding": "jsonParsed", "maxSupportedTransactionVersion": 0}]
        })
    
    try:
        response = rate_limited_post(HELIUS_RPC, json=batch, timeout=30)
        results = response.json()
        # Handle both list (batch response) and dict (error response)
        if isinstance(results, dict):
            if results.get("error"):
                log(f"RPC error: {results['error']}")
                return []
            return [results.get("result")]
        return [r.get("result") for r in results if r.get("result")]
    except Exception as e:
        log(f"Batch fetch error: {e}")
        return []


def parse_flows_from_transactions(
    transactions: List[Dict],
    source_wallet: str,
    token_mint: str,
    token_symbol: str
) -> List[Dict]:
    """Extract token flows from transactions where source_wallet is sender."""
    flows = []
    
    for tx in transactions:
        if not tx:
            continue
            
        meta = tx.get("meta", {})
        pre_balances = meta.get("preTokenBalances", [])
        post_balances = meta.get("postTokenBalances", [])
        account_keys = tx.get("transaction", {}).get("message", {}).get("accountKeys", [])
        sig = tx.get("transaction", {}).get("signatures", [""])[0]
        block_time = tx.get("blockTime", 0)
        slot = tx.get("slot", 0)
        
        # Find source wallet's token account
        source_accounts = []
        for pre in pre_balances:
            if pre.get("mint") != token_mint:
                continue
            account_idx = pre.get("accountIndex")
            if account_idx < len(account_keys):
                source_accounts.append({
                    "idx": account_idx,
                    "pre": float(pre.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
                })
        
        # Check each source account for outgoing transfers
        for src in source_accounts:
            post_amt = 0
            for post in post_balances:
                if post.get("accountIndex") == src["idx"] and post.get("mint") == token_mint:
                    post_amt = float(post.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
                    break
            
            if post_amt < src["pre"] and src["pre"] > 0:
                amount_sent = src["pre"] - post_amt
                
                # Find recipients
                for post in post_balances:
                    if post.get("mint") != token_mint:
                        continue
                    
                    post_idx = post.get("accountIndex")
                    if post_idx >= len(account_keys) or post_idx == src["idx"]:
                        continue
                    
                    post_amt_new = float(post.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
                    
                    # Check if balance increased
                    pre_amt_old = 0
                    for p in pre_balances:
                        if p.get("accountIndex") == post_idx and p.get("mint") == token_mint:
                            pre_amt_old = float(p.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
                            break
                    
                    if post_amt_new > pre_amt_old:
                        to_wallet = account_keys[post_idx]
                        if isinstance(to_wallet, dict):
                            to_wallet = to_wallet.get("pubkey", "")
                        if to_wallet and to_wallet != source_wallet:
                            flows.append({
                                "from": source_wallet,
                                "to": to_wallet,
                                "amount": amount_sent,
                                "signature": sig,
                                "timestamp": block_time,
                                "slot": slot
                            })
    
    return flows


def track_token_recursive(
    start_wallet: str,
    token_mint: str,
    max_depth: int = 3,
    visited_wallets: Optional[Set[str]] = None,
    current_depth: int = 0
) -> List[TokenFlow]:
    """Recursively track where tokens flow from a starting wallet."""
    if visited_wallets is None:
        visited_wallets = set()
    
    start_wallet = start_wallet.strip()
    token_mint = token_mint.strip()
    
    if start_wallet in visited_wallets or current_depth >= max_depth:
        return []
    
    visited_wallets.add(start_wallet)
    flows = []
    
    token_info = get_token_metadata(token_mint)
    token_symbol = token_info.get("symbol", "UNKNOWN")
    
    log(f"{'  ' * current_depth}🔍 Depth {current_depth}: {start_wallet[:20]}...")
    
    # Fetch signatures
    signatures_data = fetch_signatures(start_wallet, limit=15)
    signatures = [s.get("signature") for s in signatures_data if s.get("signature")]
    
    if not signatures:
        return []
    
    # Small delay
    time.sleep(0.05)
    
    # Batch fetch transactions
    transactions = fetch_transactions_batch(signatures)
    
    # Parse flows
    raw_flows = parse_flows_from_transactions(transactions, start_wallet, token_mint, token_symbol)
    
    # Create flow objects and collect unique recipients
    recipients = {}
    for f in raw_flows:
        flow = TokenFlow(
            from_wallet=f["from"],
            to_wallet=f["to"],
            amount=f["amount"],
            token_mint=token_mint,
            token_symbol=token_symbol,
            signature=f["signature"],
            timestamp=f["timestamp"],
            slot=f["slot"],
            depth=current_depth
        )
        flows.append(flow)
        recipients[f["to"]] = recipients.get(f["to"], 0) + f["amount"]
        log(f"{'  ' * current_depth}  ↳ {f['amount']:.4f} {token_symbol} → {f['to'][:20]}...")
    
    # Sort recipients by amount and limit
    sorted_recipients = sorted(recipients.items(), key=lambda x: x[1], reverse=True)[:3]
    
    # Recurse on top recipients
    for recipient, amount in sorted_recipients:
        time.sleep(0.1)
        sub_flows = track_token_recursive(
            recipient, token_mint, max_depth, visited_wallets, current_depth + 1
        )
        flows.extend(sub_flows)
    
    return flows


def summarize_flows(flows: List[TokenFlow]) -> Dict:
    """Create summary statistics."""
    if not flows:
        return {"total_flows": 0, "unique_wallets": 0, "total_amount": 0}
    
    wallets = set()
    for f in flows:
        wallets.add(f.from_wallet)
        wallets.add(f.to_wallet)
    
    return {
        "total_flows": len(flows),
        "unique_wallets": len(wallets),
        "total_amount": sum(f.amount for f in flows),
        "max_depth": max(f.depth for f in flows),
        "token_symbol": flows[0].token_symbol if flows else "UNKNOWN"
    }


# Flask API
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os

app = Flask(__name__)
CORS(app)

FRONTEND_DIR = os.path.join(os.path.dirname(__file__), 'frontend')

@app.route('/')
def serve_index():
    return send_from_directory(FRONTEND_DIR, 'index.html')

@app.route('/api/track', methods=['POST'])
def api_track():
    """API endpoint for recursive token tracking."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON body"}), 400
        
    wallet = data.get('wallet', '').strip()
    token = data.get('token', '').strip()
    max_depth = min(data.get('maxDepth', 2), 4)
    
    if not wallet or not token:
        return jsonify({"error": "Wallet and token mint required"}), 400
    
    try:
        log(f"🎯 Starting trace: {wallet[:20]}... → {token[:20]}...")
        flows = track_token_recursive(wallet, token, max_depth=max_depth)
        summary = summarize_flows(flows)
        
        return jsonify({
            "flows": [asdict(f) for f in flows],
            "summary": summary,
            "start_wallet": wallet,
            "token_mint": token
        })
        
    except requests.exceptions.Timeout:
        return jsonify({"error": "Request timed out. Try reducing depth or try again later."}), 504
    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"API request failed: {str(e)}"}), 502
    except Exception as e:
        import traceback
        log(f"Error: {traceback.format_exc()}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) >= 3:
        wallet = sys.argv[1]
        token = sys.argv[2]
        depth = int(sys.argv[3]) if len(sys.argv) > 3 else 2
        
        print(f"🎩 Constable - Recursive Token Tracker")
        print(f"=" * 50)
        
        flows = track_token_recursive(wallet, token, max_depth=depth)
        summary = summarize_flows(flows)
        
        print(f"\n📊 Summary:")
        print(f"   Total flows: {summary['total_flows']}")
        print(f"   Wallets touched: {summary['unique_wallets']}")
        print(f"   Total {summary['token_symbol']}: {summary['total_amount']:.4f}")
        print(f"   Max depth reached: {summary['max_depth']}")
    else:
        print("🎩 Constable API starting on http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=True)
