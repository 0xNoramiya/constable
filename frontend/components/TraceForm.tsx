'use client'

import { useState } from 'react'
import { useApi } from '@/hooks/useApi'
import ResultCard from './ResultCard'

export default function TraceForm() {
  const [signature, setSignature] = useState('')
  const { data, loading, error, fetchData } = useApi()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!signature.trim()) return

    await fetchData('/api/trace', {
      method: 'POST',
      body: JSON.stringify({ signature: signature.trim() }),
    })
  }

  // Mock data for demo when API is not available
  const mockData = {
    signature: signature || '5xK...example',
    status: 'success',
    slot: 234567890,
    timestamp: '2024-01-15T10:30:00Z',
    fee: 5000,
    feeInSol: 0.000005,
    accounts: [
      { address: '7xKXtg2CWkTmTqcqLXM5VfG7M4uS5z8KN6n9oP2QRstU', signer: true, writable: true, balanceChange: -1.5 },
      { address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA', signer: false, writable: false, program: true },
      { address: '11111111111111111111111111111111', signer: false, writable: false, program: true },
    ],
    instructions: [
      { program: 'system', type: 'transfer', accounts: 2, data: '2KbG4...' },
      { program: 'token', type: 'transferChecked', accounts: 4, data: '8mN3x...' },
    ],
    tokenChanges: [
      { mint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', symbol: 'USDC', change: -100 },
    ],
  }

  const displayData = data || (signature && !loading ? mockData : null)

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="constable-card">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Transaction Signature
        </label>
        <input
          type="text"
          value={signature}
          onChange={(e) => setSignature(e.target.value)}
          placeholder="Enter transaction signature (e.g., 5xK...)"
          className="constable-input mb-4"
        />
        <button
          type="submit"
          disabled={loading || !signature.trim()}
          className="constable-button w-full sm:w-auto"
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Tracing...
            </span>
          ) : (
            '🔎 Trace Transaction'
          )}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400">
          Error: {error}
        </div>
      )}

      {displayData && <ResultCard data={displayData} title="Transaction Trace Results" />}
    </div>
  )
}
