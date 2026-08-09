# OpenCode Agent Instructions

## Commands
- Install deps: `npm install`
- Setup browser fallback: `npx playwright install chromium`
- Run runner script: `./kusonime.cmd [URL]` (Linux/macOS) atau `kusonime.cmd [URL]` (Windows)
- Run interactive mode: `node index.js` atau `./kusonime.cmd`
- Run target page (all resolutions): `node index.js [URL]`
- Run target page (filtered resolution): `node index.js --720 --1080 [URL]`
- Test single link bypass: `node test-single.js [URL]`

## Architecture & Flow
- **Modules**: CommonJS (`require`/`module.exports`).
- **Language**: Terminal logs in Indonesian.
- **Pipeline**: `index.js` (CLI/Scrape) -> `src/bypass.js` (Dispatch loop, max 5 depths) -> `src/providers/*.js` (Extract).
- **Special handling**: `justpaste.it` URLs extracted by `index.js` via `src/providers/justpaste.js`, then re-dispatched to `bypass()`.

## Quirks & Rules
- **Resolution Filtering**: Pass resolution flags `--360`, `--480`, `--720`, `--1080` to CLI or prompt; default shows all resolutions.
- **Fast-path first**: `axios` + `cheerio` static extraction first. Playwright strictly headless fallback in `src/providers/shrinkpe.js`.
- **shrink.pe / tpi.li**: Extract target URL from `input[name="token"]` via `aHR0cH` (base64 for `http`) substring.
- **Cloudflare**: HTTP 403 on `axios` means Turnstile active.
- **Verification**: No test framework installed. Test via `node test-single.js [URL]`.
