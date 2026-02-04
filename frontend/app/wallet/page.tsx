import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import WalletForm from '@/components/WalletForm'

export const metadata = {
  title: 'Wallet Analysis — The Constable',
  description: 'Analyze Solana wallet transaction history and connections',
}

export default function WalletPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-400 text-3xl mb-6">
            👤
          </div>
          <h1 className="text-4xl font-bold mb-4 constable-gradient-text">Wallet Analysis</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Get comprehensive transaction history for any Solana wallet. 
            Analyze patterns, identify connections, and assess risk.
          </p>
        </div>

        <WalletForm />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">📊 Transaction History</h3>
            <p className="text-sm text-gray-400">View complete transaction history with timestamps and status.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">🔄 Counterparties</h3>
            <p className="text-sm text-gray-400">Identify frequent transaction partners and connected wallets.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">📈 Risk Score</h3>
            <p className="text-sm text-gray-400">Automated risk assessment based on transaction patterns.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
