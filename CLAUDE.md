# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Install dependencies:** `npm install`
- **Install Playwright browsers:** `npx playwright install chromium`
- **Run bypass program:** `node index.js [URL]` (defaults to Tensura S4 Batch)
- **Run single URL test:** `node test-single.js [URL]`

## Architecture & Structure

A Node.js tool to scrape and bypass shortlinks (primarily `s.id`, `justpaste.it`, and `tpi.li` / `shrink.pe`) from Kusonime to print final direct download links.

- `index.js`: Scrapes the Kusonime page, deduplicates Kusonime redirect URLs, extracts list links from intermediate pages like `justpaste.it`, and prints the final URLs.
- `src/scraper.js`: Scrapes Kusonime's batch download table rows.
- `src/bypass.js`: The central bypass dispatcher that resolves URLs sequentially.
- `src/providers/`:
  - `kusonime.js`: Decodes Base64 params.
  - `ouo.js`: Bypasses `ouo.io` using HTTP POST with form tokens.
  - `shrinkpe.js`: Bypasses JavaScript-heavy shortlinks like `shrink.pe`/`tpi.li` using Playwright headless.
  - `justpaste.js`: Scrapes `justpaste.it` paste text and decodes wrapped links.
- `src/util.js`: Shortlink provider detection and target URL verification.
