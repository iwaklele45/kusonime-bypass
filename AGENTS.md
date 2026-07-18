# OpenCode Agent Instructions

## Commands
- Install deps: `npm install`
- Setup browser fallback: `npx playwright install chromium`
- Run scraper: `node index.js [URL]` (uses default batch URL if empty)
- Test single link: `node test-single.js [URL]`

## Architecture & Conventions
- **Modules**: CommonJS (`require`/`module.exports`).
- **Language**: Console logs and documentation are in Indonesian.
- **Flow**: `index.js` (Scrape) -> `src/bypass.js` (Dispatch loop, max 5 depths) -> `src/providers/*.js` (Extract).

## Quirks & Rules
- **Fast-path first**: Prefer `axios` + `cheerio` static extraction. Playwright is strictly a fallback.
- **shrink.pe / tpi.li**: Target URL is in DOM `input[name="token"]`. Extract via `aHR0cH` (base64 for `http`) substring.
- **Cloudflare**: `axios` 403 means Turnstile active. No heavy solvers unless explicitly requested.
