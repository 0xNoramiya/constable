# The Constable Frontend

A Next.js 14 frontend for The Constable - a Solana blockchain forensics toolkit.

## Features

- **Transaction Tracer** - Analyze Solana transactions with detailed flow analysis
- **Wallet Analysis** - Get comprehensive transaction history and risk assessment
- **Cluster Analysis** - Detect sybil attacks and coordinated wallet behavior
- **Report Generator** - Create verifiable investigation reports with on-chain hashes

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with dark theme

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Build for Production

```bash
npm run build
```

This generates a static export in the `dist/` folder suitable for GitHub Pages.

## Project Structure

```
app/
├── page.tsx           # Landing page
├── layout.tsx         # Root layout
├── globals.css        # Global styles
├── trace/page.tsx     # Transaction tracer
├── wallet/page.tsx    # Wallet analysis
├── cluster/page.tsx   # Cluster analysis
└── report/page.tsx    # Report creation

components/
├── Navbar.tsx         # Navigation component
├── Footer.tsx         # Footer component
├── TraceForm.tsx      # Transaction trace form
├── WalletForm.tsx     # Wallet analysis form
├── ClusterForm.tsx    # Cluster analysis form
├── ReportForm.tsx     # Report creation form
└── ResultCard.tsx     # JSON result display

hooks/
└── useApi.ts          # API communication hook
```

## Design System

- **Primary Background**: `#1a1a2e` to `#16213e` gradient
- **Accent Color**: `#e94560` (coral red)
- **Card Style**: Glass-morphism with hover effects
- **Typography**: System fonts with monospace for code

## API Integration

The frontend communicates with the backend API using the `useApi` hook. API base URL is configurable via `NEXT_PUBLIC_API_URL` environment variable.

## License

MIT - Built for the Colosseum Agent Hackathon 2026
# Deployed: 2026-02-04 15:37:47 UTC
