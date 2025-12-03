# US Markets & Macro Hub

A real-time RSS aggregator for US stock market news, individual stock updates, macro economic data, and Federal Reserve policy.

## Features

- **Real-time Aggregation**: Fetches news from Yahoo Finance, CNBC, MarketWatch, Investing.com, and official government sources (BEA, BLS, Fed).
- **Categorized Views**:
  - **Markets**: US Stock Market news (S&P 500, AAPL, etc.).
  - **Macro**: Economic data and policy updates.
- **Search & Filter**: Client-side search and filtering by category.
- **Responsive Design**: Mobile-first layout built with Tailwind CSS.
- **Performance**: Server-side fetching with ISR (Incremental Static Regeneration) for optimal performance and SEO.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **RSS Parsing**: `rss-parser`
- **Icons**: `lucide-react`
- **Date Formatting**: `date-fns`

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Installation

1. Clone the repository (if applicable) or navigate to the project directory.
2. Install dependencies:

```bash
npm install
```

### Local Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Deployment

This project is optimized for deployment on **Vercel**.

1. Push the code to a GitHub repository.
2. Import the project in Vercel.
3. The default settings (Next.js preset) will work automatically.
4. Deploy!

## Project Structure

- `src/app`: App Router pages and layouts.
- `src/components`: Reusable UI components.
- `src/lib`: Utility functions, types, and RSS configuration.

## License

MIT
