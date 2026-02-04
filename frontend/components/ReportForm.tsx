'use client'

import { useState } from 'react'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

interface Finding {
  type: 'suspicious' | 'confirmed' | 'info'
  description: string
  addresses: string[]
  transactions: string[]
}

export default function ReportForm() {
  const [caseId, setCaseId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [findings, setFindings] = useState<Finding[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const addFinding = () => {
    setFindings([...findings, { type: 'info', description: '', addresses: [], transactions: [] }])
  }

  const updateFinding = (index: number, field: keyof Finding, value: any) => {
    const updated = [...findings]
    updated[index] = { ...updated[index], [field]: value }
    setFindings(updated)
  }

  const removeFinding = (index: number) => {
    setFindings(findings.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!caseId.trim() || !title.trim() || !description.trim()) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch(`${API_BASE}/api/report/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: caseId.trim(),
          title: title.trim(),
          description: description.trim(),
          findings: findings.filter(f => f.description.trim()),
          evidenceHashes: [],
        }),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="caseId" className="block text-sm font-medium text-gray-400 mb-2">
              Case ID *
            </label>
            <input
              type="text"
              id="caseId"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
              placeholder="e.g., CASE-001"
              className="constable-input"
              required
            />
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-2">
              Report Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Exchange Hack Investigation"
              className="constable-input"
              required
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-400 mb-2">
            Description *
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detailed description of the investigation..."
            rows={4}
            className="constable-input"
            required
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="text-sm font-medium text-gray-400">Findings</label>
            <button
              type="button"
              onClick={addFinding}
              className="text-sm text-constable-accent hover:text-white"
            >
              + Add Finding
            </button>
          </div>
          
          {findings.map((finding, index) => (
            <div key={index} className="constable-card mb-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Type</label>
                  <select
                    value={finding.type}
                    onChange={(e) => updateFinding(index, 'type', e.target.value)}
                    className="constable-input text-sm"
                  >
                    <option value="info">ℹ️ Info</option>
                    <option value="suspicious">⚠️ Suspicious</option>
                    <option value="confirmed">✅ Confirmed</option>
                  </select>
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeFinding(index)}
                    className="text-red-400 hover:text-red-300 text-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
              <textarea
                value={finding.description}
                onChange={(e) => updateFinding(index, 'description', e.target.value)}
                placeholder="Finding description..."
                rows={2}
                className="constable-input text-sm mb-2"
              />
            </div>
          ))}
        </div>
        
        <button
          type="submit"
          disabled={loading || !caseId.trim() || !title.trim() || !description.trim()}
          className="constable-button w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Report'}
        </button>
      </form>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {result && (
        <div className="constable-card border-green-500/30">
          <h3 className="text-lg font-semibold text-green-400 mb-4">✅ Report Created</h3>
          <div className="space-y-2 text-sm">
            <p><span className="text-gray-400">Report ID:</span> {result.reportId}</p>
            <p><span className="text-gray-400">Case ID:</span> {result.caseId}</p>
            <p><span className="text-gray-400">Report Hash:</span> <span className="font-mono text-xs">{result.reportHash}</span></p>
            <p><span className="text-gray-400">Created At:</span> {new Date(result.createdAt).toLocaleString()}</p>
          </div>        </div>
      )}
    </div>
  )
}
