import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function Home() {
  const tools = [
    {
      icon: '🔎',
      title: 'Trace Transaction',
      description: 'Analyze any Solana transaction by signature with detailed flow analysis.',
      href: '/trace/',
      color: 'from-blue-500 to-cyan-400',
    },
    {
      icon: '👤',
      title: 'Wallet Analysis',
      description: 'Get comprehensive transaction history and risk assessment for any wallet.',
      href: '/wallet/',
      color: 'from-purple-500 to-pink-400',
    },
    {
      icon: '🕸️',
      title: 'Cluster Analysis',
      description: 'Find relationships between wallets, detect sybil attacks and cartel behavior.',
      href: '/cluster/',
      color: 'from-green-500 to-emerald-400',
    },
    {
      icon: '📋',
      title: 'Create Report',
      description: 'Generate verifiable investigation reports with on-chain anchored hashes.',
      href: '/report/',
      color: 'from-orange-500 to-yellow-400',
    },
  ]

  const features = [
    {
      icon: '🔍',
      title: 'Transaction Tracer',
      description: 'Follow SOL and token flows across wallets with detailed analysis',
    },
    {
      icon: '🕸️',
      title: 'Cluster Analyzer',
      description: 'Identify connected wallets, sybil attacks, and cartel behavior',
    },
    {
      icon: '📦',
      title: 'Evidence Vault',
      description: 'Store investigation evidence on-chain using PDAs',
    },
    {
      icon: '📄',
      title: 'Verifiable Reports',
      description: 'Generate reports with SHA-256 hashes anchored on Solana',
    },
  ]

  return (
    <div className="min-h-screen">
      <Navbar />

      <main>
        {/* Hero Section */}
        <header className="text-center py-16 px-4 border-b border-white/10">
          <span className="constable-badge mb-6">Colosseum Agent Hackathon</span>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 constable-gradient-text">
            🔍 The Constable
          </h1>
          <p className="text-xl md:text-2xl text-gray-400 italic mb-4">
            "The butler sees everything. The Constable proves it."
          </p>
          <p className="text-gray-500">On-chain forensics and investigation toolkit for Solana</p>
        </header>

        {/* Tools Grid */}
        <section className="max-w-6xl mx-auto px-4 py-16">
          <h2 className="text-3xl font-bold text-center mb-4">Investigation Tools</h2>
          <p className="text-center text-gray-400 mb-12">Choose a forensic tool to begin your investigation</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
              <Link
                key={tool.href}
                href={tool.href}
                className="constable-card group"
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-r ${tool.color} text-2xl mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-xl font-semibold text-constable-accent mb-2">{tool.title}</h3>
                <p className="text-gray-400">{tool.description}</p>
                <div className="mt-4 flex items-center text-sm text-constable-accent group-hover:translate-x-2 transition-transform">
                  Open Tool →
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="max-w-6xl mx-auto px-4 py-16 border-t border-white/10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
