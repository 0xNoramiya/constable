import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ReportForm from '@/components/ReportForm'

export const metadata = {
  title: 'Create Report — The Constable',
  description: 'Generate verifiable investigation reports',
}

export default function ReportPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-orange-500 to-yellow-400 text-3xl mb-6">
            📋
          </div>
          <h1 className="text-4xl font-bold mb-4 constable-gradient-text">Create Report</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Generate verifiable investigation reports with SHA-256 hashes 
            anchored on-chain for transparency and trust.
          </p>
        </div>

        <ReportForm />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">🔐 SHA-256 Hashing</h3>
            <p className="text-sm text-gray-400">Reports are cryptographically hashed for tamper-proof verification.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">⛓️ On-Chain Anchoring</h3>
            <p className="text-sm text-gray-400">Report hashes stored on Solana for immutable audit trails.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">✅ Public Verification</h3>
            <p className="text-sm text-gray-400">Anyone can verify report integrity against on-chain records.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
