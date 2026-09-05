# OpenCode Agent Instructions

## Commands
- Install dependencies with `npm install`. Chromium is only needed for the shortlink fallback: `npx playwright install chromium`.
- Run interactively with `node index.js` or `./kusonime.cmd`; run one page with `node index.js [URL]`.
- Filter a page with any combination of `--360`, `--480`, `--720`, `--1080`, and `--3840`; no flags means all resolutions.
- Verify one bypass chain with `node test-single.js [URL]`. There are no test, lint, or typecheck scripts.

## Architecture
- This is CommonJS. The flow is `index.js` -> `src/scraper.js` -> `src/bypass.js` -> `src/providers/*.js`; bypass chains stop after five dispatches.
- `justpaste.it` is intentionally handled in `index.js`: extract its links with `src/providers/justpaste.js`, then send each extracted URL back through `bypass()`.
- Kusonime pages use both legacy `.smokeddl/.smokettl/.smokeurl` classes and newer `*rh` variants; `src/scraper.js` must support both.
- `src/providers/shrinkpe.js` must try Axios/Cheerio first, decoding the Base64 URL in `input[name="token"]` from its `aHR0cH` prefix, before headless Playwright.

## Verification Notes
- Checks hit live external sites and can change or fail due to redirects and anti-bot measures. Use a real Kusonime page for scraper changes and `test-single.js` for provider changes.
- Keep user-facing terminal output in Indonesian.
