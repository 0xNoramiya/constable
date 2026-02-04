#!/usr/bin/env python3
"""
Constable - Recursive Token Tracker
Track where tokens go from a starting wallet
"""

import requests
import json
from typing import List, Dict, Optional, Set
from dataclasses import dataclass, asdict
from datetime import datetime

HELIUS_API_KEY = "YOUR_HELIUS_API_KEY_HERE"
HELIUS_RPC = f"https://mainnet.helius-rpc.com/?api-key={HELIUS_API_KEY}"


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
    depth: int  # How many hops from source


def fetch_token_accounts(wallet: str, token_mint: str) -> List[Dict]:
    """Get all token accounts for a wallet holding specific token."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTokenAccountsByOwner",
        "params": [
            wallet,
            {"mint": token_mint},
            {"encoding": "jsonParsed"}
        ]
    }
    
    try:
        response = requests.post(HELIUS_RPC, json=payload, timeout=30)
        data = response.json()
        return data.get("result", {}).get("value", [])
    except Exception as e:
        print(f"Error fetching token accounts: {e}")
        return []


def fetch_signatures(wallet: str, limit: int = 100, before: Optional[str] = None) -> List[Dict]:
    """Fetch transaction signatures for a wallet."""
    params = {"limit": limit}
    if before:
        params["before"] = before
        
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getSignaturesForAddress",
        "params": [wallet, params]
    }
    
    try:
        response = requests.post(HELIUS_RPC, json=payload, timeout=30)
        data = response.json()
        return data.get("result", [])
    except Exception as e:
        print(f"Error fetching signatures: {e}")
        return []


def fetch_transaction(signature: str) -> Optional[Dict]:
    """Fetch full transaction details."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getTransaction",
        "params": [
            signature,
            {
                "encoding": "jsonParsed",
                "maxSupportedTransactionVersion": 0,
                "commitment": "confirmed"
            }
        ]
    }
    
    try:
        response = requests.post(HELIUS_RPC, json=payload, timeout=30)
        data = response.json()
        return data.get("result")
    except Exception as e:
        print(f"Error fetching transaction: {e}")
        return None


def parse_token_transfers(tx: Dict, target_wallet: str, target_token: str) -> List[Dict]:
    """
    Parse token transfers from a transaction where target_wallet is the sender.
    Returns list of {to, amount, token, signature}.
    """
    transfers = []
    if not tx:
        return transfers
    
    meta = tx.get("meta", {})
    message = tx.get("transaction", {}).get("message", {})
    
    # Get pre and post token balances to find changes
    pre_balances = {b.get("accountIndex"): b for b in meta.get("preTokenBalances", [])}
    post_balances = {b.get("accountIndex"): b for b in meta.get("postTokenBalances", [])}
    
    # Map account indexes to addresses
    account_keys = message.get("accountKeys", [])
    
    # Find transfers where target_wallet is sender
    instructions = message.get("instructions", [])
    inner_instructions = meta.get("innerInstructions", [])
    
    all_instructions = list(instructions)
    for inner in inner_instructions:
        all_instructions.extend(inner.get("instructions", []))
    
    for ix in all_instructions:
        parsed = ix.get("parsed", {})
        if parsed.get("type") == "transferChecked":
            info = parsed.get("info", {})
            from_acc = info.get("authority")
            to_acc = info.get("destination")
            token_acc = info.get("mint")
            amount = info.get("tokenAmount", {}).get("uiAmount", 0)
            
            # Check if this is our target token and from our target wallet
            if token_acc == target_token:
                # Need to map account to wallet - this is simplified
                transfers.append({
                    "to": to_acc,
                    "amount": amount,
                    "token": token_acc,
                    "signature": tx.get("transaction", {}).get("signatures", [""])[0],
                    "timestamp": tx.get("blockTime", 0),
                    "slot": tx.get("slot", 0)
                })
    
    return transfers


def get_wallet_from_token_account(token_account: str) -> Optional[str]:
    """Get owner wallet from token account address."""
    payload = {
        "jsonrpc": "2.0",
        "id": 1,
        "method": "getAccountInfo",
        "params": [token_account, {"encoding": "jsonParsed"}]
    }
    
    try:
        response = requests.post(HELIUS_RPC, json=payload, timeout=30)
        data = response.json()
        account = data.get("result", {}).get("value", {})
        parsed = account.get("data", {}).get("parsed", {}).get("info", {})
        return parsed.get("owner")
    except:
        return None


def get_token_metadata(token_mint: str) -> Dict:
    """Get token symbol and name."""
    try:
        # Try to get from Helius token metadata
        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "getAsset",
            "params": {"id": token_mint}
        }
        response = requests.post(HELIUS_RPC, json=payload, timeout=30)
        data = response.json()
        result = data.get("result", {})
        return {
            "symbol": result.get("token_info", {}).get("symbol", "UNKNOWN"),
            "name": result.get("token_info", {}).get("name", "Unknown Token"),
            "decimals": result.get("token_info", {}).get("decimals", 9)
        }
    except:
        return {"symbol": "UNKNOWN", "name": "Unknown Token", "decimals": 9}


def track_token_recursive(
    start_wallet: str,
    token_mint: str,
    max_depth: int = 3,
    max_tx_per_level: int = 50,
    visited_wallets: Optional[Set[str]] = None,
    current_depth: int = 0
) -> List[TokenFlow]:
    """
    Recursively track where tokens flow from a starting wallet.
    
    Args:
        start_wallet: Starting wallet address
        token_mint: Token mint to track
        max_depth: How many hops to follow (default 3)
        max_tx_per_level: Max transactions to check per wallet
        visited_wallets: Set of already visited wallets (for recursion)
        current_depth: Current recursion depth
    
    Returns:
        List of TokenFlow representing the complete flow tree
    """
    if visited_wallets is None:
        visited_wallets = set()
    
    start_wallet = start_wallet.strip()
    token_mint = token_mint.strip()
    
    # Prevent cycles
    if start_wallet in visited_wallets:
        return []
    
    visited_wallets.add(start_wallet)
    
    # Stop if max depth reached
    if current_depth >= max_depth:
        return []
    
    flows = []
    
    # Get token metadata on first call
    token_info = get_token_metadata(token_mint)
    token_symbol = token_info.get("symbol", "UNKNOWN")
    
    print(f"{'  ' * current_depth}🔍 Depth {current_depth}: Checking {start_wallet[:20]}...")
    
    # Fetch recent transactions for this wallet
    signatures = fetch_signatures(start_wallet, max_tx_per_level)
    
    for sig_info in signatures:
        sig = sig_info.get("signature")
        if not sig:
            continue
        
        # Fetch transaction details
        tx = fetch_transaction(sig)
        if not tx:
            continue
        
        # Parse token transfers from this wallet
        # Look for token balance changes in postTokenBalances
        meta = tx.get("meta", {})
        pre_balances = meta.get("preTokenBalances", [])
        post_balances = meta.get("postTokenBalances", [])
        
        # Find our token in the balances
        account_keys = tx.get("transaction", {}).get("message", {}).get("accountKeys", [])
        
        # Build balance change map
        for pre in pre_balances:
            if pre.get("mint") != token_mint:
                continue
            
            account_idx = pre.get("accountIndex")
            if account_idx >= len(account_keys):
                continue
                
            account = account_keys[account_idx].get("pubkey")
            
            # Find matching post balance
            pre_amount = float(pre.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
            post_amount = 0
            
            for post in post_balances:
                if post.get("accountIndex") == account_idx and post.get("mint") == token_mint:
                    post_amount = float(post.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
                    break
            
            # If balance decreased, tokens were sent
            if post_amount < pre_amount and pre_amount > 0:
                amount_sent = pre_amount - post_amount
                
                # Find where they went - look for accounts that gained balance
                for post in post_balances:
                    if post.get("mint") != token_mint:
                        continue
                    
                    post_idx = post.get("accountIndex")
                    if post_idx >= len(account_keys):
                        continue
                    
                    post_account = account_keys[post_idx].get("pubkey")
                    post_amt = float(post.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
                    
                    # Check if this account gained balance
                    pre_amt = 0
                    for p in pre_balances:
                        if p.get("accountIndex") == post_idx and p.get("mint") == token_mint:
                            pre_amt = float(p.get("uiTokenAmount", {}).get("uiAmount", 0) or 0)
                            break
                    
                    if post_amt > pre_amt:
                        # This account received tokens - get owner wallet
                        to_wallet = get_wallet_from_token_account(post_account)
                        if to_wallet and to_wallet != start_wallet:
                            # Create flow record
                            flow = TokenFlow(
                                from_wallet=start_wallet,
                                to_wallet=to_wallet,
                                amount=amount_sent,
                                token_mint=token_mint,
                                token_symbol=token_symbol,
                                signature=sig,
                                timestamp=tx.get("blockTime", 0),
                                slot=tx.get("slot", 0),
                                depth=current_depth
                            )
                            flows.append(flow)
                            
                            print(f"{'  ' * current_depth}  ↳ {amount_sent:.4f} {token_symbol} → {to_wallet[:20]}...")
                            
                            # Recursively track from recipient
                            sub_flows = track_token_recursive(
                                to_wallet,
                                token_mint,
                                max_depth,
                                max_tx_per_level,
                                visited_wallets,
                                current_depth + 1
                            )
                            flows.extend(sub_flows)
    
    return flows


def export_to_csv(flows: List[TokenFlow], filename: str = "token_flows.csv"):
    """Export flows to CSV."""
    import csv
    
    if not flows:
        print("No flows to export")
        return
    
    with open(filename, 'w', newline='') as f:
        writer = csv.DictWriter(f, fieldnames=[
            'depth', 'from_wallet', 'to_wallet', 'amount', 
            'token_symbol', 'token_mint', 'signature', 
            'timestamp', 'datetime', 'slot'
        ])
        writer.writeheader()
        
        for flow in flows:
            row = asdict(flow)
            row['datetime'] = datetime.fromtimestamp(flow.timestamp).isoformat()
            writer.writerow(row)
    
    print(f"✅ Exported {len(flows)} flows to {filename}")


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
    data = request.json
    wallet = data.get('wallet', '').strip()
    token = data.get('token', '').strip()
    max_depth = min(data.get('maxDepth', 3), 5)  # Cap at 5 for safety
    
    if not wallet or not token:
        return jsonify({"error": "Wallet and token mint required"}), 400
    
    try:
        print(f"🎯 Starting trace: {wallet} → {token}")
        flows = track_token_recursive(wallet, token, max_depth=max_depth)
        summary = summarize_flows(flows)
        
        return jsonify({
            "flows": [asdict(f) for f in flows],
            "summary": summary,
            "start_wallet": wallet,
            "token_mint": token
        })
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    import sys
    
    if len(sys.argv) >= 3:
        # CLI mode
        wallet = sys.argv[1]
        token = sys.argv[2]
        depth = int(sys.argv[3]) if len(sys.argv) > 3 else 3
        
        print(f"🎩 Constable - Recursive Token Tracker")
        print(f"=" * 50)
        
        flows = track_token_recursive(wallet, token, max_depth=depth)
        summary = summarize_flows(flows)
        
        print(f"\n📊 Summary:")
        print(f"   Total flows: {summary['total_flows']}")
        print(f"   Wallets touched: {summary['unique_wallets']}")
        print(f"   Total {summary['token_symbol']}: {summary['total_amount']:.4f}")
        print(f"   Max depth reached: {summary['max_depth']}")
        
        if flows:
            export_to_csv(flows)
    else:
        # Server mode
        print("🎩 Constable API starting on http://localhost:5000")
        app.run(host='0.0.0.0', port=5000, debug=True)
