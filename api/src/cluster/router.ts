import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';

const router = Router();
const connection = new Connection(
  process.env.SOLANA_RPC || 'https://api.devnet.solana.com'
);

/**
 * POST /api/cluster/analyze
 * Analyze a cluster of wallets for relationships
 */
router.post('/analyze', async (req, res) => {
  try {
    const { addresses, maxDepth = 2 } = req.body;

    if (!Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({ error: 'Addresses array required' });
    }

    // Validate addresses
    const pubkeys: PublicKey[] = [];
    for (const addr of addresses) {
      try {
        pubkeys.push(new PublicKey(addr));
      } catch {
        return res.status(400).json({ error: `Invalid address: ${addr}` });
      }
    }

    // Analyze each wallet
    const analysis = await Promise.all(
      pubkeys.map(async (pubkey) => {
        const signatures = await connection.getSignaturesForAddress(pubkey, {
          limit: 100
        });

        // Get unique counterparties
        const counterparties = new Set<string>();
        
        for (const sig of signatures.slice(0, 20)) {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0
          });
          if (tx) {
            tx.transaction.message.accountKeys.forEach((key) => {
              if (!key.equals(pubkey)) {
                counterparties.add(key.toString());
              }
            });
          }
        }

        return {
          address: pubkey.toString(),
          transactionCount: signatures.length,
          recentCounterparties: Array.from(counterparties).slice(0, 10)
        };
      })
    );

    // Find intersections (wallets that interact with multiple targets)
    const intersections = findIntersections(analysis);

    res.json({
      inputAddresses: addresses,
      maxDepth,
      analysis,
      intersections,
      clusterScore: calculateClusterScore(analysis, intersections)
    });
  } catch (error) {
    console.error('Cluster analysis error:', error);
    res.status(500).json({ error: 'Failed to analyze cluster' });
  }
});

/**
 * GET /api/cluster/related/:address
 * Find wallets related to a given address
 */
router.get('/related/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { minInteractions = 5 } = req.query;

    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);
    } catch {
      return res.status(400).json({ error: 'Invalid address' });
    }

    // Get recent transactions
    const signatures = await connection.getSignaturesForAddress(pubkey, {
      limit: 200
    });

    // Count interactions per counterparty
    const interactions = new Map<string, number>();
    
    for (const sig of signatures) {
      const tx = await connection.getTransaction(sig.signature, {
        maxSupportedTransactionVersion: 0
      });
      if (tx) {
        tx.transaction.message.accountKeys.forEach((key) => {
          const keyStr = key.toString();
          if (keyStr !== address) {
            interactions.set(keyStr, (interactions.get(keyStr) || 0) + 1);
          }
        });
      }
    }

    // Filter by minimum interactions
    const related = Array.from(interactions.entries())
      .filter(([, count]) => count >= parseInt(minInteractions as string))
      .sort((a, b) => b[1] - a[1])
      .map(([addr, count]) => ({ address: addr, interactions: count }));

    res.json({
      address,
      totalTransactions: signatures.length,
      relatedWallets: related
    });
  } catch (error) {
    console.error('Related wallets error:', error);
    res.status(500).json({ error: 'Failed to find related wallets' });
  }
});

// Helper functions
function findIntersections(
  analysis: Array<{ address: string; recentCounterparties: string[] }>
): Array<{ address: string; connectsTo: string[] }> {
  const allAddresses = new Set(analysis.map(a => a.address));
  const intersections: Array<{ address: string; connectsTo: string[] }> = [];

  // For each address, find which target addresses it connects to
  const addressToTargets = new Map<string, string[]>();
  
  for (const addr of allAddresses) {
    const targets: string[] = [];
    for (const item of analysis) {
      if (item.address !== addr && item.recentCounterparties.includes(addr)) {
        targets.push(item.address);
      }
    }
    if (targets.length > 1) {
      intersections.push({ address: addr, connectsTo: targets });
    }
  }

  return intersections;
}

function calculateClusterScore(
  analysis: Array<{ recentCounterparties: string[] }>,
  intersections: Array<{ connectsTo: string[] }>
): number {
  // Simple scoring: more intersections = higher cluster likelihood
  const intersectionScore = intersections.length * 10;
  const overlapScore = analysis.reduce((sum, a) => {
    const overlaps = a.recentCounterparties.filter((addr) =>
      analysis.some((other) => other.address === addr)
    ).length;
    return sum + overlaps;
  }, 0);
  
  return Math.min(100, intersectionScore + overlapScore * 2);
}

export { router as clusterRouter };
