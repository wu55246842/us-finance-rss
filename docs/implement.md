# AiAgents MVP Implementation Guide

## Overview
This document outlines the implementation of the **AiAgents** MVP using Next.js. The goal is to replicate the multi-agent analysis architecture of the original framework, utilizing **Pollinations API** for LLM capabilities and **Yahoo Finance** for market data.

## 1. Architecture

The system consists of three main layers:
1.  **Data Layer**: Fetches real-time financial data (Prices, News, Financials).
2.  **Agent Layer**: A team of LLM agents acting as analysts.
3.  **UI Layer**: A modern, responsive dashboard to interact with the agents and view reports.

### Agent Workflow
1.  **Input**: User provides a stock ticker (e.g., AAPL).
2.  **Data Collection**: System fetches:
    *   Technical Data (Price history, Indicators).
    *   Fundamental Data (Balance sheet, Earnings).
    *   News Data (Recent headlines).
3.  **Analysis (Parallel)**:
    *   **Technical Analyst Agent**: Reviews price action and indicators.
    *   **Fundamental Analyst Agent**: Reviews financial health.
    *   **Sentiment Analyst Agent**: Reviews news and market mood.
4.  **Synthesis (Sequential)**:
    *   **Researcher/Debate Agent**: Reviews all 3 analyst reports, identifies conflicts (e.g., "Good financials but bad technicals"), and synthesizes a conclusion.
5.  **Output**: A final "Investment Report" displayed to the user.

## 2. Implementation Steps

### Step 1: Data Access (`src/lib/api/yahoo.ts`)
Ensure the existing Yahoo Finance wrapper exposes:
-   `getChart(ticker)`: For technical analysis.
-   `getQuoteSummary(ticker)`: For fundamental analysis.
-   `getNews(ticker)`: For sentiment analysis.

### Step 2: Agent Core (`src/lib/agents/`)
-   **`core.ts`**: Handles calls to Pollinations API (`https://gen.pollinations.ai/`).
-   **`prompts.ts`**: Contains the system instructions for each persona.

**Example Prompt Structure:**
> "You are a Technical Analyst. Analyze the following price data and technical indicators... Output your analysis in Markdown."

### Step 3: Server Actions (`src/lib/actions/trading-agents.ts`)
Create a server action `runAnalysis(ticker)` that:
1.  Fetches data.
2.  Calls the Analyst Agents in parallel (Promise.all).
3.  Feeds results to the Researcher Agent.
4.  Returns the structured results to the client.

### Step 4: UI Development (`src/app/agents/`)
-   **Page Layout**: A clean input area + a grid of "Agent Cards".
-   **Agent Cards**: Show the "status" (Thinking... / Done) and the output.
-   **Styling**: Use a dark, financial-terminal inspired theme (Glassmorphism, vibrant accents).

## 3. Pollinations API Integration
We will use the simple GET/POST endpoints or OpenAI-compatible format if supported.
Reference: `docs/POLLINATIONS_API.md`

## 4. MVP Scope Limits
-   **No Real Trading**: The system only outputs advice/reports.
-   **Data Latency**: Yahoo Finance data may be delayed.
-   **Rate Limits**: We must handle potential API timeouts gracefully.
