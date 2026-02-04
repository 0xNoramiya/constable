export const metadata = {
  title: 'The Constable — On-Chain Forensics',
  description: 'On-chain forensics and investigation toolkit for Solana blockchain',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
