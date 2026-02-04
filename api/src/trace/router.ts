import { Router } from 'express';
import { Connection, PublicKey } from '@solana/web3.js';

const router = Router();
const connection = new Connection(
  process.env.SOLANA_RPC || 'https://api.devnet.solana.com'
);

/**
 * GET /api/trace/:signature
 * Trace a specific transaction
 */
router.get('/:signature', async (req, res) => {
  try {
    const { signature } = req.params;
    
    const tx = await connection.getTransaction(signature, {
      maxSupportedTransactionVersion: 0
    });

    if (!tx) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Analyze transaction
    const analysis = {
      signature,
      slot: tx.slot,
      blockTime: tx.blockTime ? new Date(tx.blockTime * 1000).toISOString() : null,
      fee: tx.meta?.fee,
      status: tx.meta?.err ? 'failed' : 'success',
      accounts: tx.transaction.message.accountKeys.map((key, i) => ({
        address: key.toString(),
        signer: tx.transaction.message.isAccountSigner(i),
        writable: tx.transaction.message.isAccountWritable(i)
      })),
      // Token transfers (simplified - would need full parsing)
      tokenTransfers: [],
      solTransfers: [],
      programInstructions: []
    };

    res.json(analysis);
  } catch (error) {
    console.error('Trace error:', error);
    res.status(500).json({ error: 'Failed to trace transaction' });
  }
});

/**
 * GET /api/trace/wallet/:address
 * Get transaction history for a wallet
 */
router.get('/wallet/:address', async (req, res) => {
  try {
    const { address } = req.params;
    const { limit = '50', before } = req.query;

    let pubkey: PublicKey;
    try {
      pubkey = new PublicKey(address);
    } catch {
      return res.status(400).json({ error: 'Invalid address' });
    }

    const signatures = await connection.getSignaturesForAddress(
      pubkey,
      {
        limit: parseInt(limit as string),
        before: before as string | undefined
      }
    );

    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        const tx = await connection.getTransaction(sig.signature, {
          maxSupportedTransactionVersion: 0
        });
        return {
          signature: sig.signature,
          slot: sig.slot,
          blockTime: sig.blockTime,
          status: sig.err ? 'failed' : 'success',
          fee: tx?.meta?.fee,
          // Summary of changes
          preBalance: tx?.meta?.preBalances[0],
          postBalance: tx?.meta?.postBalances[0]
        };
      })
    );

    res.json({
      address,
      count: transactions.length,
      transactions
    });
  } catch (error) {
    console.error('Wallet trace error:', error);
    res.status(500).json({ error: 'Failed to trace wallet' });
  }
});

/**
 * POST /api/trace/flow
 * Trace token flow between addresses
 */
router.post('/flow', async (req, res) => {
  try {
    const { source, destination, tokenMint, maxDepth = 3 } = req.body;

    // This would implement a recursive token flow tracer
    // For now, return a placeholder
    res.json({
      source,
      destination,
      tokenMint,
      maxDepth,
      paths: [],
      note: 'Token flow tracing - implementation in progress'
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to trace flow' });
  }
});

export { router as traceRouter };
