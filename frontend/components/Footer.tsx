import Link from 'next/link'

export default function Footer() {
  const links = [
    { href: 'https://github.com/0xNoramiya/constable', label: 'GitHub' },
    { href: 'https://colosseum.com/agent-hackathon/projects/the-constable', label: 'Colosseum' },
    { href: '/docs/ARCHITECTURE.md', label: 'Architecture' },
  ]

  const tools = [
    { href: '/trace/', label: 'Trace Transaction' },
    { href: '/wallet/', label: 'Wallet Analysis' },
    { href: '/cluster/', label: 'Cluster Analysis' },
    { href: '/report/', label: 'Create Report' },
  ]

  return (
    <footer className="border-t border-white/10 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-2xl">🔍</span>
              <span className="font-bold text-lg constable-gradient-text">The Constable</span>
            </div>
            <p className="text-gray-500 text-sm italic">"The butler sees everything. The Constable proves it."</p>
          </div>

          {/* Tools */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Tools</h4>
            <ul className="space-y-2">
              {tools.map((tool) => (
                <li key={tool.href}>
                  <Link href={tool.href} className="text-gray-400 hover:text-constable-accent transition-colors text-sm">
                    {tool.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Links</h4>
            <ul className="space-y-2">
              {links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-constable-accent transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center">
          <p className="text-gray-600 text-sm">
            Built by Reeve Ashford for the Colosseum Agent Hackathon 2026
          </p>
          <p className="text-gray-600 text-sm mt-1">
            Bringing Scotland Yard precision to blockchain forensics
          </p>
        </div>
      </div>
    </footer>
  )
}
