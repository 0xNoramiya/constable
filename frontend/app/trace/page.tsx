import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import TraceForm from '@/components/TraceForm'

export const metadata = {
  title: 'Trace Transaction — The Constable',
  description: 'Analyze Solana transactions with detailed flow tracing',
}

export default function TracePage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-cyan-400 text-3xl mb-6">
            🔎
          </div>
          <h1 className="text-4xl font-bold mb-4 constable-gradient-text">Trace Transaction</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Analyze any Solana transaction by signature. Follow SOL and token flows 
            across wallets with detailed account and instruction breakdowns.
          </p>
        </div>

        <TraceForm />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">📊 Account Analysis</h3>
            <p className="text-sm text-gray-400">View all accounts involved, their roles (signer, writable), and balance changes.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">🔄 Instruction Flow</h3>
            <p className="text-sm text-gray-400">Step-by-step breakdown of program instructions and their effects.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">💰 Value Tracking</h3>
            <p className="text-sm text-gray-400">Track SOL and SPL token movements with USD value estimates.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
