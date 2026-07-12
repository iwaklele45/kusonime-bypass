# Kusonime Shortlink Bypass

Alat sederhana untuk bypass link download Kusonime ke link asli (Google Drive, Pixeldrain, Krakenfiles, dll).

## Fitur
- Auto-decode Base64 redirect (`/go/?url=`)
- Bypass `ouo.io` otomatis via request POST
- Bypass `shrink.pe` / `shrinkme.io` via browser headless Playwright
- Follow redirect shortlink umum (misal `tinyurl`)

## Instalasi

1. Clone / copy folder project
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install browser engine Playwright (untuk bypass `shrink.pe`):
   ```bash
   npx playwright install chromium
   ```

## Cara Penggunaan

Cukup jalankan script dengan argumen URL anime kusonime:
```bash
node index.js https://kusonime.com/tensura-s4-batch-sub-indo/
```
Jika tanpa argumen, default link adalah Tensura Season 4 Batch.
