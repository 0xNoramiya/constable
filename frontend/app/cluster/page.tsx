import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ClusterForm from '@/components/ClusterForm'

export const metadata = {
  title: 'Cluster Analysis — The Constable',
  description: 'Find relationships between Solana wallets',
}

export default function ClusterPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-green-500 to-emerald-400 text-3xl mb-6">
            🕸️
          </div>
          <h1 className="text-4xl font-bold mb-4 constable-gradient-text">Cluster Analysis</h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Analyze relationships between multiple wallets. Detect sybil attacks, 
            identify cartels, and map connected entities.
          </p>
        </div>

        <ClusterForm />

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">🔗 Intersection Detection</h3>
            <p className="text-sm text-gray-400">Find common addresses interacting with multiple target wallets.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">🎯 Sybil Detection</h3>
            <p className="text-sm text-gray-400">Identify potential sybil accounts and coordinated behavior.</p>
          </div>
          <div className="constable-card">
            <h3 className="text-constable-accent font-semibold mb-2">📊 Cluster Score</h3>
            <p className="text-sm text-gray-400">Quantified similarity score indicating coordination likelihood.</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
