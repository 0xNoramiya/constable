'use client'

import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export default function WalletForm() {
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE}/api/trace/wallet/${encodeURIComponent(address.trim())}?limit=50`)
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze wallet')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-400 mb-2">
            Wallet Address
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Enter Solana wallet address..."
            className="constable-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !address.trim()}
          className="constable-button w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze Wallet'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <ResultCard title="Wallet Analysis" data={result} />
      )}
    </div>
  )
}

function ResultCard({ title, data }: { title: string; data: any }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="constable-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-constable-accent">{title}</h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-sm text-gray-400 hover:text-white"
        >
          {expanded ? 'Collapse' : 'Expand'}
        </button>
      </div>
      <pre className={`constable-code ${expanded ? '' : 'max-h-96 overflow-hidden'}`}>
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  )
}
