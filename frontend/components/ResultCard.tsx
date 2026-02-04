'use client'

interface ResultCardProps {
  data: Record<string, unknown>
  title?: string
}

export default function ResultCard({ data, title = 'Results' }: ResultCardProps) {
  const formatValue = (value: unknown): string => {
    if (value === null) return 'null'
    if (value === undefined) return 'undefined'
    if (typeof value === 'string') return value
    if (typeof value === 'number') return value.toString()
    if (typeof value === 'boolean') return value.toString()
    if (value instanceof Date) return value.toISOString()
    if (Array.isArray(value)) {
      return value.map(v => formatValue(v)).join(', ')
    }
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2)
    }
    return String(value)
  }

  const isHash = (key: string, value: unknown): boolean => {
    return (
      typeof value === 'string' &&
      (key.includes('hash') || key.includes('signature') || key.includes('pda') || key.includes('address')) &&
      value.length > 20
    )
  }

  const truncate = (str: string, len: number): string => {
    if (str.length <= len) return str
    return str.slice(0, len / 2) + '...' + str.slice(-len / 2)
  }

  return (
    <div className="constable-card border-l-4 border-l-constable-accent">
      <h3 className="text-lg font-semibold text-constable-accent mb-4 flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        {title}
      </h3>

      <div className="bg-constable-input rounded-lg p-4 overflow-x-auto">
        <pre className="font-mono text-sm">
          <code>
            {Object.entries(data).map(([key, value]) => (
              <div key={key} className="mb-2">
                <span className="text-constable-accent">{key}</span>
                <span className="text-gray-500">: </span>
                <span className={
                  typeof value === 'string' 
                    ? 'text-green-400' 
                    : typeof value === 'number' 
                      ? 'text-blue-400' 
                      : typeof value === 'boolean'
                        ? 'text-purple-400'
                        : 'text-gray-300'
                }>
                  {isHash(key, value) 
                    ? truncate(value as string, 30)
                    : typeof value === 'object' 
                      ? JSON.stringify(value, null, 2)
                      : String(value)
                  }
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {Object.keys(data).length} fields
        </span>
        <button
          onClick={() => {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))
          }}
          className="text-xs text-constable-accent hover:text-constable-accent-light transition-colors flex items-center"
        >
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy JSON
        </button>
      </div>
    </div>
  )
}
